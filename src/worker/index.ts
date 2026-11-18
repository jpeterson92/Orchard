import { type Context, Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { z } from "zod";

// Static assets (including prerendered pages) are served by Cloudflare before this runs;
// only /api/* reaches the Worker first (wrangler.jsonc run_worker_first).
//
// Privacy (engineering plan §7): nothing here logs, and nothing stores an IP, a time of day or a location. The rate
// limiter is keyed by a hash of the IP, held only in Cloudflare's short-lived counters.

/** The parts of D1 and the rate limiter this Worker uses (structural, so tests can stand in for both). */
export interface Bindings {
  DB: {
    prepare(sql: string): { bind(...values: unknown[]): { run(): Promise<unknown> } };
  };
  /** One budget for every post: feedback and taste answers together. */
  FEEDBACK_LIMIT: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

const id = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(64);

/** What the item page showed: the build, item, window and verdict, and the label pick when there was one. */
const shown = {
  appVersion: z.string().min(1).max(40),
  item: id,
  window: z.int().min(0).max(23),
  verdict: z.enum(["peak", "good", "skip", "limited"]),
  labelOrigin: id.optional(),
  labelVariety: id.optional(),
};

/** One tap of "At your store today:" on an item page (product spec §5 "Item page"). */
export const feedbackSchema = z.strictObject({
  ...shown,
  outcome: z.enum(["looked-good", "looked-poor", "not-in-stock", "too-pricey"]),
});

/** The next-visit answer to "How was it?" for an item marked "Bought it", with what the page showed when bought. */
export const tasteSchema = z.strictObject({
  ...shown,
  taste: z.enum(["great", "ok", "disappointing"]),
});

async function limiterKey(ip: string | undefined): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip ?? "unknown"));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const app = new Hono<{ Bindings: Bindings }>();

// Hono's default handler logs the error; ours answers without logging anything.
app.onError((_, c) => c.json({ error: "server" }, 500));

app.get("/api/health", (c) => c.json({ ok: true }));

/** A posted answer: size-limited, rate limited, validated, then stored as one row with the server date first. */
function answer<S extends z.ZodType>(schema: S, insert: string, values: (row: z.infer<S>) => unknown[]) {
  return [
    bodyLimit({ maxSize: 2048, onError: (c) => c.json({ error: "too-large" }, 413) }),
    async (c: Context<{ Bindings: Bindings }>) => {
      const { success } = await c.env.FEEDBACK_LIMIT.limit({
        key: await limiterKey(c.req.header("cf-connecting-ip")),
      });
      if (!success) return c.json({ error: "rate-limited" }, 429);

      const parsed = schema.safeParse(await c.req.json().catch(() => null));
      if (!parsed.success) return c.json({ error: "invalid" }, 400);

      await c.env.DB.prepare(insert)
        .bind(new Date().toISOString().slice(0, 10), ...values(parsed.data))
        .run();
      return c.body(null, 204);
    },
  ] as const;
}

app.post(
  "/api/feedback",
  ...answer(
    feedbackSchema,
    `INSERT INTO feedback (received_on, app_version, item, half_month, verdict, outcome, label_origin, label_variety)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    (f) => [
      f.appVersion,
      f.item,
      f.window,
      f.verdict,
      f.outcome,
      f.labelOrigin ?? null,
      f.labelVariety ?? null,
    ],
  ),
);

app.post(
  "/api/taste",
  ...answer(
    tasteSchema,
    `INSERT INTO taste (received_on, app_version, item, half_month, verdict, taste, label_origin, label_variety)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    (t) => [
      t.appVersion,
      t.item,
      t.window,
      t.verdict,
      t.taste,
      t.labelOrigin ?? null,
      t.labelVariety ?? null,
    ],
  ),
);

export default app;

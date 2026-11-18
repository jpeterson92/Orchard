import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { beaconSchema, bucketOf } from "../shared/measure";

// Static assets (including prerendered pages) are served by Cloudflare before this runs;
// only /api/* reaches the Worker first (wrangler.jsonc run_worker_first).
//
// Privacy (engineering plan §7): nothing here logs, and nothing stored holds an IP, a time of day, a page or a location.

/** The parts of D1 this Worker uses (structural, so tests can stand in for it). */
export interface Bindings {
  DB: {
    prepare(sql: string): { bind(...values: unknown[]): unknown };
    batch(statements: unknown[]): Promise<unknown>;
  };
}

const COUNT = `INSERT INTO measure (day, metric, bucket, n) VALUES (?, ?, ?, 1)
  ON CONFLICT (day, metric, bucket) DO UPDATE SET n = n + 1`;

export const app = new Hono<{ Bindings: Bindings }>();

// Hono's default handler logs the error; ours answers without logging anything.
app.onError((_, c) => c.json({ error: "server" }, 500));

app.get("/api/health", (c) => c.json({ ok: true }));

/** A page load's measurements (src/app/measure.ts): each adds one to today's count for its metric and bucket. */
app.post(
  "/api/measure",
  bodyLimit({ maxSize: 1024, onError: (c) => c.json({ error: "too-large" }, 413) }),
  async (c) => {
    // sendBeacon posts a string as text/plain, so the body is parsed whatever its content type.
    let body: unknown = null;
    try {
      body = JSON.parse(await c.req.text());
    } catch {
      // Falls through to the schema, which rejects it.
    }
    const parsed = beaconSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid" }, 400);

    const day = new Date().toISOString().slice(0, 10);
    const count = c.env.DB.prepare(COUNT);
    await c.env.DB.batch(parsed.data.m.map((e) => count.bind(day, e.metric, bucketOf(e.metric, e.value))));
    return c.body(null, 204);
  },
);

export default app;

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
const ADD = `INSERT INTO events (day, event, n) VALUES (?, ?, ?)
  ON CONFLICT (day, event) DO UPDATE SET n = n + excluded.n`;

export const app = new Hono<{ Bindings: Bindings }>();

// The API only answers with JSON or nothing, so its CSP allows nothing. Static responses get theirs from
// public/_headers.
export const API_HEADERS = {
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=31536000",
  "Cache-Control": "no-store",
} as const;

app.use(async (c, next) => {
  await next();
  for (const [name, value] of Object.entries(API_HEADERS)) c.res.headers.set(name, value);
});

// Hono's default handler logs the error; ours answers without logging anything.
app.onError((_, c) => c.json({ error: "server" }, 500));

app.get("/api/health", (c) => c.json({ ok: true }));

/**
 * A page load's measurements and events (src/app/measure.ts): each metric adds one to today's count for its metric
 * and bucket; each event adds its count to today's total for that event.
 */
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
    const { m = [], e = [] } = parsed.data;
    const count = c.env.DB.prepare(COUNT);
    const add = c.env.DB.prepare(ADD);
    await c.env.DB.batch([
      ...m.map((x) => count.bind(day, x.metric, bucketOf(x.metric, x.value))),
      ...e.map((x) => add.bind(day, x.event, x.n)),
    ]);
    return c.body(null, 204);
  },
);

export default app;

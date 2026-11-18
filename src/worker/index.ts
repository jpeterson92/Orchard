import { Hono } from "hono";

// Static assets (including prerendered pages) are served by Cloudflare before this runs;
// only /api/* reaches the Worker first (wrangler.jsonc run_worker_first).
const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", (c) => c.json({ ok: true }));

export default app;

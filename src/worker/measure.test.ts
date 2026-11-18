// The measurement endpoint against the real migrations, run in Node's built-in SQLite (the same engine D1 uses).
// Proves the M8 privacy rule: no IP reaches storage or the logs, and nothing stored holds a time of day
// (engineering plan §5, §7).
import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_HEADERS, app, type Bindings } from "./index";

const IP = "203.0.113.77";
const IPV6 = "2001:db8::7";

function bindings() {
  const sqlite = new DatabaseSync(":memory:");
  for (const f of readdirSync("migrations").sort()) sqlite.exec(readFileSync(`migrations/${f}`, "utf8"));
  type Bound = { sql: string; values: unknown[] };
  const env: Bindings = {
    DB: {
      prepare: (sql) => ({ bind: (...values) => ({ sql, values }) }),
      batch: async (statements) => {
        sqlite.exec("BEGIN");
        for (const s of statements as Bound[]) sqlite.prepare(s.sql).run(...(s.values as SQLInputValue[]));
        sqlite.exec("COMMIT");
      },
    },
  };
  const rows = () => sqlite.prepare("SELECT * FROM measure ORDER BY metric, bucket").all();
  const events = () => sqlite.prepare("SELECT * FROM events ORDER BY event").all();
  return { env, rows, events };
}

const post = (env: Bindings, body: unknown, headers: Record<string, string> = {}) =>
  app.request(
    "/api/measure",
    {
      method: "POST",
      headers: {
        // What sendBeacon sends for a string body.
        "content-type": "text/plain;charset=UTF-8",
        "cf-connecting-ip": IP,
        "x-forwarded-for": `${IP}, ${IPV6}`,
        "x-real-ip": IP,
        "user-agent": "Mozilla/5.0 (Linux; Android 14; Pixel 7)",
        ...headers,
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    },
    env,
  );

const load = {
  m: [
    { metric: "lcp", value: 1834.2 },
    { metric: "inp", value: 48 },
    { metric: "cls", value: 0.031 },
    { metric: "verdict", value: 1210.7 },
  ],
};

let logged: unknown[][];
beforeEach(() => {
  logged = [];
  for (const level of ["log", "info", "warn", "error", "debug"] as const) {
    vi.spyOn(console, level).mockImplementation((...args) => {
      logged.push(args);
    });
  }
});
afterEach(() => vi.restoreAllMocks());

describe("POST /api/measure", () => {
  it("counts each metric in its bucket under the UTC date, and stores no IP, time or visit detail", async () => {
    const { env, rows } = bindings();
    const res = await post(env, load);
    expect(res.status).toBe(204);
    const day = new Date().toISOString().slice(0, 10);
    expect(rows()).toEqual([
      { day, metric: "cls", bucket: 4, n: 1 },
      { day, metric: "inp", bucket: 100, n: 1 },
      { day, metric: "lcp", bucket: 1900, n: 1 },
      { day, metric: "verdict", bucket: 1300, n: 1 },
    ]);
    const everything = JSON.stringify({ stored: rows(), logged });
    for (const secret of [IP, IPV6, "Pixel 7", "1834.2", "1210.7"]) expect(everything).not.toContain(secret);
    expect(logged).toEqual([]);
  });

  it("adds to the existing count for the same day, metric and bucket", async () => {
    const { env, rows } = bindings();
    await post(env, { m: [{ metric: "lcp", value: 2401 }] });
    await post(env, { m: [{ metric: "lcp", value: 2500 }] });
    await post(env, { m: [{ metric: "lcp", value: 2501 }] });
    expect(rows().map((r) => [r.bucket, r.n])).toEqual([
      [2500, 2],
      [2600, 1],
    ]);
  });

  it("adds each event's count to the day's total, and stores no IP, item or search text", async () => {
    const { env, rows, events } = bindings();
    const day = new Date().toISOString().slice(0, 10);
    const res = await post(env, {
      ...load,
      e: [
        { event: "visit", n: 1 },
        { event: "item", n: 3 },
      ],
    });
    expect(res.status).toBe(204);
    await post(env, {
      e: [
        { event: "item", n: 2 },
        { event: "nomatch", n: 1 },
      ],
    });
    expect(rows()).toHaveLength(4);
    expect(events()).toEqual([
      { day, event: "item", n: 5 },
      { day, event: "nomatch", n: 1 },
      { day, event: "visit", n: 1 },
    ]);
    const everything = JSON.stringify({ stored: events(), logged });
    for (const secret of [IP, IPV6, "Pixel 7"]) expect(everything).not.toContain(secret);
    expect(logged).toEqual([]);
  });

  it("accepts a JSON content type as well as sendBeacon's text/plain", async () => {
    const { env, rows } = bindings();
    const res = await post(
      env,
      { m: [{ metric: "inp", value: 120 }] },
      { "content-type": "application/json" },
    );
    expect(res.status).toBe(204);
    expect(rows()).toHaveLength(1);
  });

  it.each([
    ["not JSON", "lcp=1800"],
    ["no measurements", { m: [] }],
    ["an unknown metric", { m: [{ metric: "fcp", value: 900 }] }],
    ["a negative value", { m: [{ metric: "lcp", value: -1 }] }],
    ["a value past a day", { m: [{ metric: "lcp", value: 24 * 3600 * 1000 + 1 }] }],
    ["a non-number value", { m: [{ metric: "lcp", value: "1800" }] }],
    [
      "a metric twice",
      {
        m: [
          { metric: "lcp", value: 1800 },
          { metric: "lcp", value: 1900 },
        ],
      },
    ],
    ["an extra field on a measurement", { m: [{ metric: "lcp", value: 1800, page: "/items/apples" }] }],
    ["an extra top-level field", { m: [{ metric: "lcp", value: 1800 }], visitor: "abc" }],
    ["an event with its item", { e: [{ event: "item", n: 1, item: "apples" }] }],
    ["good metrics with a bad event", { m: [{ metric: "lcp", value: 1800 }], e: [{ event: "item", n: -1 }] }],
  ])("rejects %s and stores nothing", async (_, body) => {
    const { env, rows, events } = bindings();
    const res = await post(env, body);
    expect(res.status).toBe(400);
    expect(rows()).toEqual([]);
    expect(events()).toEqual([]);
    expect(logged).toEqual([]);
  });

  it("refuses a body over 1 KB", async () => {
    const { env, rows } = bindings();
    const res = await post(env, `{"m":[{"metric":"lcp","value":1800}],"pad":"${"x".repeat(1100)}"}`);
    expect(res.status).toBe(413);
    expect(rows()).toEqual([]);
  });

  it("answers a storage failure without logging", async () => {
    const env: Bindings = {
      DB: {
        prepare: () => ({ bind: () => ({}) }),
        batch: async () => {
          throw new Error(`D1 down for ${IP}`);
        },
      },
    };
    const res = await post(env, load);
    expect(res.status).toBe(500);
    expect(logged).toEqual([]);
  });
});

describe("API security headers", () => {
  const fails: Bindings = {
    DB: {
      prepare: () => ({ bind: () => ({}) }),
      batch: async () => {
        throw new Error("D1 down");
      },
    },
  };
  it.each([
    ["a success", () => app.request("/api/health")],
    ["an accepted beacon", () => post(bindings().env, load)],
    ["a refused beacon", () => post(bindings().env, "not json")],
    ["an oversized beacon", () => post(bindings().env, "x".repeat(1100))],
    ["a storage failure", () => post(fails, load)],
    ["an unknown route", () => app.request("/api/nope")],
  ])("are on %s", async (_, send) => {
    const res = await send();
    for (const [name, value] of Object.entries(API_HEADERS)) expect(res.headers.get(name)).toBe(value);
  });
});

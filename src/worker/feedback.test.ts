// The feedback endpoint against the real migrations, run in Node's built-in SQLite (the same engine D1 uses).
// Proves the M8 privacy rule: no IP reaches D1 or the logs (engineering plan §5, §7).
import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { app, type Bindings } from "./index";

const IP = "203.0.113.77";
const IPV6 = "2001:db8::7";

function bindings(allow = true) {
  const sqlite = new DatabaseSync(":memory:");
  for (const f of readdirSync("migrations").sort()) sqlite.exec(readFileSync(`migrations/${f}`, "utf8"));
  const keys: string[] = [];
  const env: Bindings = {
    DB: {
      prepare: (sql) => ({
        bind: (...values) => ({
          run: async () => sqlite.prepare(sql).run(...(values as SQLInputValue[])),
        }),
      }),
    },
    FEEDBACK_LIMIT: {
      limit: async ({ key }) => {
        keys.push(key);
        return { success: allow };
      },
    },
  };
  const rows = () => sqlite.prepare("SELECT * FROM feedback").all();
  return { env, rows, keys };
}

const valid = {
  appVersion: "2026-11-18.abc1234",
  item: "apples",
  window: 21,
  verdict: "peak",
  outcome: "looked-good",
  labelVariety: "honeycrisp",
};

const post = (env: Bindings, body: unknown, headers: Record<string, string> = {}) =>
  app.request(
    "/api/feedback",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "cf-connecting-ip": IP,
        "x-forwarded-for": `${IP}, ${IPV6}`,
        "x-real-ip": IP,
        ...headers,
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    },
    env,
  );

describe("POST /api/feedback", () => {
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

  it("stores one row with the date only, and no IP anywhere", async () => {
    const { env, rows, keys } = bindings();
    const res = await post(env, valid);
    expect(res.status).toBe(204);
    const stored = rows();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      app_version: valid.appVersion,
      item: "apples",
      half_month: 21,
      verdict: "peak",
      outcome: "looked-good",
      label_origin: null,
      label_variety: "honeycrisp",
    });
    expect(stored[0]?.received_on).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const everything = JSON.stringify({ stored, logged, keys });
    expect(everything).not.toContain(IP);
    expect(everything).not.toContain(IPV6);
    // The limiter sees a hash of the IP, never the IP.
    expect(keys[0]).toMatch(/^[0-9a-f]{64}$/);
    expect(logged).toEqual([]);
  });

  it.each([
    ["an unknown outcome", { ...valid, outcome: "tasted-great" }],
    ["a window past 23", { ...valid, window: 24 }],
    ["an extra field", { ...valid, zip: "94110" }],
    ["coordinates", { ...valid, lat: 37.7, lon: -122.4 }],
    ["a malformed item id", { ...valid, item: "Apples!" }],
    ["no outcome", { ...valid, outcome: undefined }],
    ["text that isn't JSON", "outcome=looked-good"],
  ])("refuses %s and stores nothing", async (_, body) => {
    const { env, rows } = bindings();
    const res = await post(env, body);
    expect(res.status).toBe(400);
    expect(rows()).toEqual([]);
    expect(logged).toEqual([]);
  });

  it("refuses a body over 2 KB", async () => {
    const { env, rows } = bindings();
    const res = await post(env, { ...valid, appVersion: "x".repeat(3000) });
    expect(res.status).toBe(413);
    expect(rows()).toEqual([]);
  });

  it("answers 429 and stores nothing when the limiter says no", async () => {
    const { env, rows } = bindings(false);
    const res = await post(env, valid);
    expect(res.status).toBe(429);
    expect(rows()).toEqual([]);
  });

  it("answers 500 without logging when the database fails", async () => {
    const { env } = bindings();
    env.DB = {
      prepare: () => ({
        bind: () => ({
          run: async () => {
            throw new Error(`write failed for ${IP}`);
          },
        }),
      }),
    };
    const res = await post(env, valid);
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain(IP);
    expect(logged).toEqual([]);
  });
});

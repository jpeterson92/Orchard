import { describe, expect, it } from "vitest";
import {
  type Deps,
  type FeedbackTap,
  flushFeedback,
  givenToday,
  labelFields,
  sendFeedback,
} from "./feedback";

const tap = (outcome: FeedbackTap["outcome"], item = "apples"): FeedbackTap => ({
  appVersion: "2026-11-18.abc1234",
  item,
  window: 21,
  verdict: "peak",
  outcome,
});

/** An in-memory phone: storage plus a network that answers with `status` (a number), or fails (null). */
function phone(answer: () => number | null) {
  const store = new Map<string, string>();
  const sent: FeedbackTap[] = [];
  const deps: Deps = {
    storage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => void store.set(k, v) },
    fetch: async (_, init) => {
      const status = answer();
      if (status === null) throw new TypeError("Failed to fetch");
      sent.push(JSON.parse(String(init?.body)) as FeedbackTap);
      return new Response(null, { status });
    },
  };
  const queued = () => JSON.parse(store.get("orchard.feedback.queue") ?? "[]") as FeedbackTap[];
  return { deps, sent, queued };
}

describe("feedback", () => {
  it("sends a tap and remembers today's answer", async () => {
    const p = phone(() => 204);
    await sendFeedback(tap("looked-good"), "2026-11-18", p.deps);
    expect(p.sent).toEqual([tap("looked-good")]);
    expect(p.queued()).toEqual([]);
    expect(givenToday("apples", "2026-11-18", p.deps)).toBe("looked-good");
    expect(givenToday("apples", "2026-11-19", p.deps)).toBeNull();
    expect(givenToday("pears", "2026-11-18", p.deps)).toBeNull();
  });

  it("keeps taps made offline and sends them in order once the connection returns", async () => {
    let online = false;
    const p = phone(() => (online ? 204 : null));
    await sendFeedback(tap("looked-poor"), "2026-11-18", p.deps);
    await sendFeedback(tap("too-pricey", "pears"), "2026-11-18", p.deps);
    expect(p.sent).toEqual([]);
    expect(p.queued().map((t) => t.outcome)).toEqual(["looked-poor", "too-pricey"]);
    online = true;
    await flushFeedback(p.deps);
    expect(p.sent.map((t) => t.outcome)).toEqual(["looked-poor", "too-pricey"]);
    expect(p.queued()).toEqual([]);
  });

  it("keeps a tap for later when the server fails, and drops one it refuses", async () => {
    const statuses = [503, 400];
    const p = phone(() => statuses.shift() ?? 204);
    await sendFeedback(tap("looked-good"), "2026-11-18", p.deps);
    expect(p.queued()).toHaveLength(1);
    await flushFeedback(p.deps); // 400: refused for good
    expect(p.queued()).toEqual([]);
  });

  it("sends a tap made while an earlier one is still on its way", async () => {
    let release: () => void = () => {};
    const p = phone(() => 204);
    const slowFetch = p.deps.fetch;
    p.deps.fetch = async (...args) => {
      await new Promise<void>((r) => {
        release = r;
      });
      p.deps.fetch = slowFetch;
      return slowFetch(...args);
    };
    const first = sendFeedback(tap("looked-good"), "2026-11-18", p.deps);
    const second = sendFeedback(tap("not-in-stock", "pears"), "2026-11-18", p.deps);
    release();
    await Promise.all([first, second]);
    expect(p.sent.map((t) => t.item)).toEqual(["apples", "pears"]);
    expect(p.queued()).toEqual([]);
  });

  it("sends a tap after a flush that found nothing to send (the launch flush)", async () => {
    const p = phone(() => 204);
    await flushFeedback(p.deps);
    await sendFeedback(tap("looked-good"), "2026-11-18", p.deps);
    expect(p.sent).toHaveLength(1);
  });

  it("forgets earlier days' answers as new ones are written", async () => {
    const p = phone(() => 204);
    await sendFeedback(tap("looked-good"), "2026-11-17", p.deps);
    await sendFeedback(tap("looked-poor", "pears"), "2026-11-18", p.deps);
    expect(givenToday("apples", "2026-11-17", p.deps)).toBeNull();
    expect(givenToday("pears", "2026-11-18", p.deps)).toBe("looked-poor");
  });

  it.each([
    ["o:mx", { labelOrigin: "mx" }],
    ["v:honeycrisp", { labelVariety: "honeycrisp" }],
    ["", {}],
  ])("sends the label pick %j", (choice, fields) => {
    expect(labelFields(choice)).toEqual(fields);
  });
});

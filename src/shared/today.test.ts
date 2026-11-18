import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { BEST_NOW_MAX, groupToday, type TodayEntry } from "./today";

const entry = (id: string, over: Partial<TodayEntry> = {}): TodayEntry => ({
  id,
  purchaseRank: 10,
  alwaysGood: false,
  verdict: "peak",
  confidence: "high",
  peakWindows: 6,
  ...over,
});

describe("groupToday", () => {
  it("Best right now takes up to 6 Peak items by confidence, then purchase rank", () => {
    const entries = [
      entry("a", { confidence: "medium", purchaseRank: 1 }),
      entry("b", { purchaseRank: 5 }),
      entry("c", { purchaseRank: 2 }),
      entry("d", { confidence: "low", purchaseRank: 1 }),
      entry("e", { purchaseRank: 9 }),
      entry("f", { purchaseRank: 3 }),
      entry("g", { purchaseRank: 4 }),
      entry("h", { verdict: "good", purchaseRank: 1 }),
    ];
    const g = groupToday(entries);
    expect(g.best).toEqual(["c", "f", "g", "b", "e", "a"]);
    expect(g.good).toEqual(["d", "h"]);
  });

  it("puts the shortest Peak first, then confidence", () => {
    const g = groupToday([
      entry("long", { peakWindows: 16, purchaseRank: 1 }),
      entry("short", { peakWindows: 3, confidence: "medium", purchaseRank: 9 }),
      entry("mid", { peakWindows: 6 }),
      entry("good", { verdict: "good", peakWindows: 1 }),
    ]);
    expect(g.best).toEqual(["short", "mid", "long"]);
    expect(g.good).toEqual(["good"]);
  });

  it("is never padded with Good items", () => {
    const g = groupToday([entry("a"), entry("b", { verdict: "good" })]);
    expect(g).toEqual({ best: ["a"], good: ["b"], skip: [], limited: [] });
  });

  it("Skip and Limited evidence are ordered by purchase rank", () => {
    const g = groupToday([
      entry("s2", { verdict: "skip", purchaseRank: 2, confidence: "low" }),
      entry("s1", { verdict: "skip", purchaseRank: 1 }),
      entry("l1", { verdict: "limited", purchaseRank: 3 }),
    ]);
    expect([g.skip, g.limited]).toEqual([["s1", "s2"], ["l1"]]);
  });

  it("leaves always-good items out", () => {
    const g = groupToday([
      entry("steady", { alwaysGood: true, verdict: "good" }),
      entry("seasonal", { verdict: "good" }),
    ]);
    expect(g).toEqual({ best: [], good: ["seasonal"], skip: [], limited: [] });
  });
});

const verdict = fc.constantFrom("peak" as const, "good" as const, "skip" as const, "limited" as const);
const entries = fc.uniqueArray(
  fc.record({
    id: fc.string({ minLength: 1, maxLength: 4 }),
    purchaseRank: fc.integer({ min: 1, max: 100 }),
    alwaysGood: fc.boolean(),
    verdict,
    confidence: fc.constantFrom("high" as const, "medium" as const, "low" as const),
    peakWindows: fc.integer({ min: 0, max: 24 }),
  }),
  { selector: (e) => e.id, maxLength: 30 },
);

describe("groupToday invariants", () => {
  it("each shown item appears exactly once, in the section its verdict names", () =>
    fc.assert(
      fc.property(entries, (list) => {
        const g = groupToday(list);
        const placed = [...g.best, ...g.good, ...g.skip, ...g.limited];
        const shown = list.filter((e) => !e.alwaysGood);
        expect([...placed].sort()).toEqual(shown.map((e) => e.id).sort());
        const byId = new Map(list.map((e) => [e.id, e]));
        for (const id of g.best) expect(byId.get(id)?.verdict).toBe("peak");
        for (const id of g.good) expect(["peak", "good"]).toContain(byId.get(id)?.verdict);
        for (const id of g.skip) expect(byId.get(id)?.verdict).toBe("skip");
        for (const id of g.limited) expect(byId.get(id)?.verdict).toBe("limited");
      }),
    ));

  it("Best right now holds min(6, Peak count) items, and Good buys holds Peak only once Best is full", () =>
    fc.assert(
      fc.property(entries, (list) => {
        const g = groupToday(list);
        const peaks = list.filter((e) => e.verdict === "peak" && !e.alwaysGood);
        expect(g.best.length).toBe(Math.min(BEST_NOW_MAX, peaks.length));
        const byId = new Map(list.map((e) => [e.id, e]));
        if (g.best.length < BEST_NOW_MAX) for (const id of g.good) expect(byId.get(id)?.verdict).toBe("good");
      }),
    ));
});

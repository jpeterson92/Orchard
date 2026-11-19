import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { groupToday, onToday, type TodayEntry } from "./today";

const entry = (id: string, over: Partial<TodayEntry> = {}): TodayEntry => ({
  id,
  purchaseRank: 10,
  alwaysGood: false,
  reliableYearRound: false,
  verdict: "peak",
  confidence: "high",
  peakWindows: 6,
  peakLeft: 2,
  ...over,
});

describe("groupToday", () => {
  it("Best right now holds every Peak item, by confidence then purchase rank when they end together", () => {
    const entries = [
      entry("a", { confidence: "medium", purchaseRank: 1 }),
      entry("b", { purchaseRank: 5 }),
      entry("c", { purchaseRank: 2 }),
      entry("d", { confidence: "low", purchaseRank: 1 }),
      entry("e", { purchaseRank: 9 }),
      entry("f", { purchaseRank: 3 }),
      entry("g", { purchaseRank: 4 }),
      entry("h", { verdict: "good", purchaseRank: 1 }),
      entry("i", { verdict: "good", purchaseRank: 2, confidence: "medium" }),
    ];
    const g = groupToday(entries);
    expect(g.best).toEqual(["c", "f", "g", "b", "e", "a", "d"]);
    expect(g.good).toEqual(["h", "i"]);
  });

  it("puts the Peak ending soonest first, then the shortest Peak season, then confidence", () => {
    const g = groupToday([
      entry("long-ending", { peakWindows: 16, peakLeft: 1, purchaseRank: 9 }),
      entry("short", { peakWindows: 3, peakLeft: 3, confidence: "medium" }),
      entry("long", { peakWindows: 16, peakLeft: 3, purchaseRank: 1 }),
      entry("mid", { peakWindows: 6, peakLeft: 2 }),
      entry("good", { verdict: "good", peakWindows: 1, peakLeft: 0 }),
    ]);
    expect(g.best).toEqual(["long-ending", "mid", "short", "long"]);
    expect(g.good).toEqual(["good"]);
  });

  it("is never padded with Good items", () => {
    const g = groupToday([entry("a"), entry("b", { verdict: "good" })]);
    expect(g).toEqual({ best: ["a"], good: ["b"] });
  });

  it("leaves out Skip and Limited evidence", () => {
    const g = groupToday([entry("s", { verdict: "skip" }), entry("l", { verdict: "limited" }), entry("p")]);
    expect(g).toEqual({ best: ["p"], good: [] });
  });

  it("leaves out reliable year-round items while they're Good, and keeps them when Peak", () => {
    const g = groupToday([
      entry("steady-good", { verdict: "good", reliableYearRound: true }),
      entry("steady-peak", { reliableYearRound: true }),
      entry("seasonal", { verdict: "good" }),
    ]);
    expect(g).toEqual({ best: ["steady-peak"], good: ["seasonal"] });
  });

  it("leaves always-good items out", () => {
    const g = groupToday([
      entry("steady", { alwaysGood: true, verdict: "good" }),
      entry("seasonal", { verdict: "good" }),
    ]);
    expect(g).toEqual({ best: [], good: ["seasonal"] });
  });
});

const verdict = fc.constantFrom("peak" as const, "good" as const, "skip" as const, "limited" as const);
const entries = fc.uniqueArray(
  fc.record({
    id: fc.string({ minLength: 1, maxLength: 4 }),
    purchaseRank: fc.integer({ min: 1, max: 100 }),
    alwaysGood: fc.boolean(),
    reliableYearRound: fc.boolean(),
    verdict,
    confidence: fc.constantFrom("high" as const, "medium" as const, "low" as const),
    peakWindows: fc.integer({ min: 0, max: 24 }),
    peakLeft: fc.integer({ min: 0, max: 24 }),
  }),
  { selector: (e) => e.id, maxLength: 30 },
);

describe("groupToday invariants", () => {
  it("each shown item appears exactly once, in the section its verdict names", () =>
    fc.assert(
      fc.property(entries, (list) => {
        const g = groupToday(list);
        const placed = [...g.best, ...g.good];
        const shown = list.filter(onToday);
        expect([...placed].sort()).toEqual(shown.map((e) => e.id).sort());
        const byId = new Map(list.map((e) => [e.id, e]));
        for (const id of g.best) expect(byId.get(id)?.verdict).toBe("peak");
        for (const id of g.good) expect(byId.get(id)?.verdict).toBe("good");
      }),
    ));

  it("shows every Peak item that isn't always good, and no item a shopper shouldn't consider", () =>
    fc.assert(
      fc.property(entries, (list) => {
        const g = groupToday(list);
        const placed = new Set([...g.best, ...g.good]);
        for (const e of list) {
          if (e.verdict === "peak" && !e.alwaysGood) expect(placed.has(e.id)).toBe(true);
          if (e.verdict === "skip" || e.verdict === "limited" || e.alwaysGood)
            expect(placed.has(e.id)).toBe(false);
          if (e.verdict === "good" && e.reliableYearRound) expect(placed.has(e.id)).toBe(false);
        }
      }),
    ));

  it("Best right now runs from the Peak ending soonest", () =>
    fc.assert(
      fc.property(entries, (list) => {
        const byId = new Map(list.map((e) => [e.id, e]));
        const left = groupToday(list).best.map((id) => byId.get(id)?.peakLeft ?? 0);
        expect(left).toEqual([...left].sort((a, b) => a - b));
      }),
    ));
});

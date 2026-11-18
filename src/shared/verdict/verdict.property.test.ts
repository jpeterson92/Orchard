import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { WINDOW_COUNT, windowIndex } from "../time";
import {
  type CoreResult,
  type EngineAdvisory,
  type EvalContext,
  evaluate,
  type ItemInputs,
  type Rating,
  verdictRank,
} from "./index";
import { ENV } from "./test-helpers";

const ORIGINS = ["us-ca", "us-wa", "mx", "cl"] as const;
const rating = fc.constantFrom<Rating | null>("prime", "fair", "poor", null);
const confidence = fc.constantFrom("high" as const, "medium" as const, "low" as const, null);
const series = fc.record(
  {
    windows: fc.array(rating, { minLength: WINDOW_COUNT, maxLength: WINDOW_COUNT }),
    evidence: fc.array(confidence, { minLength: WINDOW_COUNT, maxLength: WINDOW_COUNT }),
  },
  { requiredKeys: ["windows"] },
);
const months = <T>(a: fc.Arbitrary<T>) => fc.array(a, { minLength: 12, maxLength: 12 });
const supplyValue = fc.constantFrom(null, 0.5, 0.79, 0.8, 1, 1.19, 1.2, 1.6);
const day = fc.record({ month: fc.integer({ min: 1, max: 12 }), day: fc.integer({ min: 1, max: 28 }) });
const iso = (m: number, d: number) => `2026-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const advisoryArb = fc
  .record({
    id: fc.constantFrom("a1", "a2", "a3"),
    origins: fc.option(fc.subarray([...ORIGINS], { minLength: 1 }), { nil: undefined }),
    from: day,
    length: fc.integer({ min: 0, max: 60 }),
    effect: fc.constantFrom("skip" as const, "cap-good" as const),
    reviewed: fc.option(day, { nil: undefined }),
  })
  .map(({ id, origins, from, length, effect, reviewed }): EngineAdvisory => {
    const start = new Date(Date.UTC(2026, from.month - 1, from.day));
    const end = new Date(start.getTime() + length * 86_400_000);
    return {
      id,
      ...(origins ? { origins } : {}),
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
      effect,
      ...(reviewed ? { reviewedOn: iso(reviewed.month, reviewed.day) } : {}),
    };
  });

const itemArb: fc.Arbitrary<ItemInputs> = fc
  .record({
    rated: fc.subarray([...ORIGINS], { minLength: 1 }),
    seriesList: fc.array(series, { minLength: 4, maxLength: 4 }),
    typical: months(fc.shuffledSubarray([...ORIGINS], { maxLength: 3 })),
    minorMask: months(fc.array(fc.boolean(), { minLength: 3, maxLength: 3 })),
    // Each typical origin's share of the month's volume, in percent; editorial typical origins have none.
    shares: months(fc.array(fc.integer({ min: 1, max: 33 }), { minLength: 3, maxLength: 3 })),
    editorialOrigins: fc.boolean(),
    supply: fc.tuple(...ORIGINS.map(() => months(supplyValue))),
    advisories: fc.uniqueArray(advisoryArb, { selector: (a) => a.id, maxLength: 3 }),
    varieties: fc.array(fc.record({ s: series, inStore: months(fc.boolean()) }), { maxLength: 3 }),
    evidenceBasis: fc.constantFrom("supply+assessment" as const, "assessment-only" as const),
    alwaysGood: fc.boolean(),
    peakWorthSeeking: fc.boolean(),
  })
  .map((r) => ({
    id: "prop-item",
    evidenceBasis: r.evidenceBasis,
    alwaysGood: r.alwaysGood,
    peakWorthSeeking: r.peakWorthSeeking,
    origins: Object.fromEntries(r.rated.map((o, i) => [o, r.seriesList[i] ?? { windows: [] }])),
    varieties: r.varieties.map((v, i) => ({ id: `v${i}`, ...v.s, inStore: v.inStore })),
    typicalOrigins: r.typical,
    typicalShares: r.typical.map((os, m) =>
      [...(r.shares[m] ?? [])]
        .sort((a, b) => b - a)
        .slice(0, os.length)
        .map((p) => (r.editorialOrigins ? null : p / 100)),
    ),
    minorOrigins: r.typical.map((os, m) => os.filter((_, i) => r.minorMask[m]?.[i])),
    supply: Object.fromEntries(ORIGINS.map((o, i) => [o, r.supply[i] ?? []])),
    advisories: r.advisories,
  }));

const ctxArb: fc.Arbitrary<EvalContext> = fc.record({
  date: day.map((d) => ({ year: 2026, ...d })),
  mode: fc.constantFrom("today" as const, "typical" as const),
});

const core = (r: CoreResult): CoreResult => ({
  verdict: r.verdict,
  ruleFired: r.ruleFired,
  reasons: r.reasons,
  confidence: r.confidence,
  weakProperties: r.weakProperties,
  advisory: r.advisory,
});

const RUNS = { numRuns: 500 };

describe("verdict engine invariants", () => {
  it("Limited evidence exactly when rule 1 fires", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        const r = evaluate(item, ctx, ENV);
        expect(r.verdict === "limited").toBe(r.ruleFired === 1);
      }),
      RUNS,
    ));

  it("an applied advisory decides unless rule 1 fired", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        const r = evaluate(item, ctx, ENV);
        if (r.advisory === null) return;
        expect(r.ruleFired).not.toBe(1);
        const effect = item.advisories.find((a) => a.id === r.advisory)?.effect;
        if (effect === "skip") expect(r.verdict).toBe("skip");
        else expect(r.verdict).not.toBe("peak");
      }),
      RUNS,
    ));

  it("a skip advisory on every origin makes every non-Limited verdict Skip", () =>
    fc.assert(
      fc.property(itemArb, day, (item, d) => {
        const date = { year: 2026, ...d };
        const all: EngineAdvisory = {
          id: "all",
          from: iso(d.month, d.day),
          to: iso(d.month, d.day),
          effect: "skip",
        };
        const r = evaluate({ ...item, advisories: [all] }, { date, mode: "today" }, ENV);
        expect(["skip", "limited"]).toContain(r.verdict);
      }),
      RUNS,
    ));

  it("no Peak on the deciding origin's thin supply", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        const r = evaluate(item, ctx, ENV);
        const month = ctx.date.month - 1;
        const decider = ctx.labelOrigin ?? item.typicalOrigins[month]?.[0];
        const supply = (decider === undefined ? null : item.supply[decider]?.[month]) ?? null;
        if (supply !== null && supply < ENV.rules.supplyIndex.thin) expect(r.verdict).not.toBe("peak");
      }),
      RUNS,
    ));

  it("no Peak unless the item's Peak is worth seeking", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        const r = evaluate({ ...item, peakWorthSeeking: false }, ctx, ENV);
        expect(r.verdict).not.toBe("peak");
        for (const v of Object.values(r.byOrigin)) expect(v.verdict).not.toBe("peak");
        for (const v of Object.values(r.byVariety)) expect(v.verdict).not.toBe("peak");
      }),
      RUNS,
    ));

  it("an item whose Peak isn't worth seeking differs only by Peak becoming Good", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        const seek = evaluate({ ...item, peakWorthSeeking: true }, ctx, ENV);
        const not = evaluate({ ...item, peakWorthSeeking: false }, ctx, ENV);
        expect(not.verdict).toBe(seek.verdict === "peak" ? "good" : seek.verdict);
      }),
      RUNS,
    ));

  it("no default Peak while any typical origin is rated poor", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        if (item.varieties.length > 0) return;
        const r = evaluate(item, { date: ctx.date, mode: ctx.mode }, ENV);
        const w = windowIndex(ctx.date.month, ctx.date.day);
        const typical = item.typicalOrigins[ctx.date.month - 1] ?? [];
        if (typical.some((o) => item.origins[o]?.windows[w] === "poor")) expect(r.verdict).not.toBe("peak");
      }),
      RUNS,
    ));

  it("P9: the label note shows exactly when typical origins mix poor with better, and never on label advice", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        if (item.varieties.length > 0) return;
        const r = evaluate(item, { date: ctx.date, mode: ctx.mode }, ENV);
        if (r.verdict === "limited") return;
        const w = windowIndex(ctx.date.month, ctx.date.day);
        const ratings = (item.typicalOrigins[ctx.date.month - 1] ?? []).map(
          (o) => item.origins[o]?.windows[w],
        );
        expect(r.labelNote).toBe(ratings.includes("poor") && ratings.some((x) => x !== "poor"));
        for (const o of Object.keys(item.origins))
          expect(evaluate(item, { date: ctx.date, mode: ctx.mode, labelOrigin: o }, ENV).labelNote).toBe(
            false,
          );
      }),
      RUNS,
    ));

  it("P9: rated Skip (rule 3) only when the second typical origin can't be relied on above poor or is minor", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        if (item.varieties.length > 0) return;
        const r = evaluate(item, { date: ctx.date, mode: ctx.mode }, ENV);
        if (r.ruleFired !== 3) return;
        const w = windowIndex(ctx.date.month, ctx.date.day);
        const [top, second] = item.typicalOrigins[ctx.date.month - 1] ?? [];
        expect(item.origins[top as string]?.windows[w]).toBe("poor");
        const minor = item.minorOrigins[ctx.date.month - 1]?.includes(second as string);
        if (second !== undefined && !minor && item.origins[second]?.windows[w] !== "poor")
          expect(item.origins[second]?.evidence?.[w]).toBe("low");
      }),
      RUNS,
    ));

  it("typical mode ignores advisories", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        const typical = { ...ctx, mode: "typical" as const };
        expect(evaluate(item, typical, ENV)).toEqual(evaluate({ ...item, advisories: [] }, typical, ENV));
      }),
      RUNS,
    ));

  it("byOrigin equals re-running the rules for each label origin", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        const r = evaluate(item, ctx, ENV);
        for (const [origin, result] of Object.entries(r.byOrigin))
          expect(result).toEqual(core(evaluate(item, { ...ctx, labelOrigin: origin }, ENV)));
      }),
      RUNS,
    ));

  it("byVariety equals re-running the rules for each label variety", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        const r = evaluate(item, ctx, ENV);
        for (const [id, { inStore, ...result }] of Object.entries(r.byVariety))
          expect(result).toEqual(core(evaluate(item, { ...ctx, labelVariety: id }, ENV)));
      }),
      RUNS,
    ));

  it("a variety-rated item takes the best in-store variety verdict, and its line holds that verdict", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        if (item.varieties.length === 0) return;
        const r = evaluate(item, ctx, ENV);
        const inStore = Object.values(r.byVariety).filter((v) => v.inStore);
        const best = Math.max(-1, ...inStore.map((v) => verdictRank(v.verdict)));
        if (inStore.length === 0) expect(r.verdict).toBe("limited");
        else expect(verdictRank(r.verdict)).toBe(best);
        for (const id of r.varietyLine ?? []) expect(r.byVariety[id]?.verdict).toBe(r.verdict);
      }),
      RUNS,
    ));

  it("confidence follows the number of weak properties", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        const r = evaluate(item, ctx, ENV);
        const n = r.weakProperties.length;
        expect(r.confidence).toBe(n === 0 ? "high" : n === 1 ? "medium" : "low");
      }),
      RUNS,
    ));

  it("Last call and Usually improves point at a later window", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        const r = evaluate(item, ctx, ENV);
        const now = windowIndex(ctx.date.month, ctx.date.day);
        for (const m of r.markers) {
          if (m.kind === "last-call") {
            expect(["peak", "good"]).toContain(r.verdict);
            expect([1, 2]).toContain((m.fadesBy - now + WINDOW_COUNT) % WINDOW_COUNT);
          }
          if (m.kind === "improves") {
            expect(r.verdict).toBe("skip");
            expect(m.window).not.toBe(now);
          }
          if (m.kind === "reliable-year-round") expect(item.alwaysGood).toBe(false);
        }
      }),
      RUNS,
    ));

  it("rating one more typical origin never brings back Limited evidence (P1)", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, fc.constantFrom(...ORIGINS), (item, ctx, origin) => {
        const w = windowIndex(ctx.date.month, ctx.date.day);
        const series = item.origins[origin];
        if (series === undefined || series.windows[w] !== null) return;
        const windows = series.windows.map((r, i) => (i === w ? ("fair" as const) : r));
        const more = { ...item, origins: { ...item.origins, [origin]: { ...series, windows } } };
        if (evaluate(item, ctx, ENV).verdict !== "limited")
          expect(evaluate(more, ctx, ENV).verdict).not.toBe("limited");
      }),
      RUNS,
    ));
});

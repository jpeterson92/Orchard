import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { WINDOW_COUNT, windowIndex } from "../time";
import {
  type CoreResult,
  type EvalContext,
  evaluate,
  type ItemInputs,
  type Rating,
  verdictRank,
} from "./index";
import { ENV } from "./test-helpers";

/** P16: grown in a country that can make the item verdict Peak. */
const near = (o: string | undefined) => o === undefined || ENV.rules.peakCountries.includes(o.slice(0, 2));
/** The same rules with every country able to make Peak: no distance cap. */
const OPEN = { ...ENV, rules: { ...ENV.rules, peakCountries: ["us", "mx", "ca", "cl"] } };
const noSelections = (item: ItemInputs): ItemInputs => ({ ...item, selections: [] });

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
    varieties: fc.array(fc.record({ s: series, inStore: months(fc.boolean()) }), { maxLength: 3 }),
    evidenceBasis: fc.constantFrom("supply+assessment" as const, "assessment-only" as const),
    alwaysGood: fc.boolean(),
    peakWorthSeeking: fc.boolean(),
    // P16: groups of the near origins, for items not rated by variety.
    selections: fc.array(
      fc.record({
        origins: fc.subarray(["us-ca", "us-wa", "mx"], { minLength: 1 }),
        inStore: months(fc.boolean()),
      }),
      { maxLength: 2 },
    ),
  })
  .map((r) => ({
    id: "prop-item",
    evidenceBasis: r.evidenceBasis,
    alwaysGood: r.alwaysGood,
    peakWorthSeeking: r.peakWorthSeeking,
    origins: Object.fromEntries(r.rated.map((o, i) => [o, r.seriesList[i] ?? { windows: [] }])),
    varieties: r.varieties.map((v, i) => ({ id: `v${i}`, ...v.s, inStore: v.inStore })),
    selections: r.varieties.length > 0 ? [] : r.selections.map((s, i) => ({ id: `s${i}`, ...s })),
    typicalOrigins: r.typical,
    typicalShares: r.typical.map((os, m) =>
      [...(r.shares[m] ?? [])]
        .sort((a, b) => b - a)
        .slice(0, os.length)
        .map((p) => (r.editorialOrigins ? null : p / 100)),
    ),
    minorOrigins: r.typical.map((os, m) => os.filter((_, i) => r.minorMask[m]?.[i])),
    supply: Object.fromEntries(ORIGINS.map((o, i) => [o, r.supply[i] ?? []])),
  }));

const ctxArb: fc.Arbitrary<EvalContext> = fc.record({ date: day.map((d) => ({ year: 2026, ...d })) });

const core = (r: CoreResult): CoreResult => ({
  verdict: r.verdict,
  ruleFired: r.ruleFired,
  reasons: r.reasons,
  confidence: r.confidence,
  weakProperties: r.weakProperties,
});

const RUNS = { numRuns: 500 };

/** Typical origins rated for the window: unrated ones are passed over (P1) and the rated ones decide (P9). */
const ratedTypical = (item: ItemInputs, month: number, window: number): string[] =>
  (item.typicalOrigins[month] ?? []).filter((o) => (item.origins[o]?.windows[window] ?? null) !== null);

describe("verdict engine invariants", () => {
  it("Limited evidence exactly when rule 1 fires", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        const r = evaluate(item, ctx, ENV);
        expect(r.verdict === "limited").toBe(r.ruleFired === 1);
      }),
      RUNS,
    ));

  it("no Peak on the deciding origin's thin supply", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        const r = evaluate(item, ctx, ENV);
        if (r.selection !== null) return; // the selection's origin decides (P16; table-tested)
        const month = ctx.date.month - 1;
        const w = windowIndex(ctx.date.month, ctx.date.day);
        // An item rated by variety takes its supply from the top typical origin, rated or not.
        const decider =
          ctx.labelOrigin ??
          (item.varieties.length > 0 ? item.typicalOrigins[month]?.[0] : ratedTypical(item, month, w)[0]);
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
        const plain = noSelections(item);
        const seek = evaluate({ ...plain, peakWorthSeeking: true }, ctx, ENV);
        const not = evaluate({ ...plain, peakWorthSeeking: false }, ctx, ENV);
        expect(not.verdict).toBe(seek.verdict === "peak" ? "good" : seek.verdict);
      }),
      RUNS,
    ));

  it("no default Peak while any typical origin is rated poor", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        if (item.varieties.length > 0) return;
        const r = evaluate(item, { date: ctx.date }, ENV);
        const w = windowIndex(ctx.date.month, ctx.date.day);
        const typical = item.typicalOrigins[ctx.date.month - 1] ?? [];
        // A selection the shopper can pick out may still make it Peak (P16), with Check the label.
        if (typical.some((o) => item.origins[o]?.windows[w] === "poor") && r.selection === null)
          expect(r.verdict).not.toBe("peak");
      }),
      RUNS,
    ));

  it("P9: the label note shows exactly when typical origins mix poor with better, and never on label advice", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        if (item.varieties.length > 0) return;
        const r = evaluate(item, { date: ctx.date }, ENV);
        if (r.verdict === "limited") return;
        const w = windowIndex(ctx.date.month, ctx.date.day);
        const ratings = ratedTypical(item, ctx.date.month - 1, w).map((o) => item.origins[o]?.windows[w]);
        const mixed = ratings.includes("poor") && ratings.some((x) => x !== "poor");
        expect(r.labelNote).toBe(r.selection !== null || mixed);
        for (const o of Object.keys(item.origins))
          expect(evaluate(item, { date: ctx.date, labelOrigin: o }, ENV).labelNote).toBe(false);
      }),
      RUNS,
    ));

  it("P9: rated Skip (rule 2) only when the second typical origin can't be relied on above poor or is minor", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        if (item.varieties.length > 0) return;
        const r = evaluate(item, { date: ctx.date }, ENV);
        if (r.ruleFired !== 2) return;
        const w = windowIndex(ctx.date.month, ctx.date.day);
        const [top, second] = ratedTypical(item, ctx.date.month - 1, w);
        expect(item.origins[top as string]?.windows[w]).toBe("poor");
        const minor = item.minorOrigins[ctx.date.month - 1]?.includes(second as string);
        if (second !== undefined && !minor && item.origins[second]?.windows[w] !== "poor")
          expect(item.origins[second]?.evidence?.[w]).toBe("low");
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
        // byVariety is label advice, so a far top origin caps only the item verdict (P16).
        const capped = !near(item.typicalOrigins[ctx.date.month - 1]?.[0]);
        const asItem = (v: CoreResult["verdict"]) => (capped && v === "peak" ? "good" : v);
        const inStore = Object.values(r.byVariety).filter((v) => v.inStore);
        const best = Math.max(-1, ...inStore.map((v) => verdictRank(asItem(v.verdict))));
        if (inStore.length === 0) expect(r.verdict).toBe("limited");
        else expect(verdictRank(r.verdict)).toBe(best);
        for (const id of r.varietyLine ?? [])
          expect(asItem(r.byVariety[id]?.verdict ?? "limited")).toBe(r.verdict);
      }),
      RUNS,
    ));

  it("P16: the distance cap only turns item Peak into Good, and never touches label advice", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        const plain = noSelections(item);
        const capped = evaluate(plain, ctx, ENV);
        const open = evaluate(plain, ctx, OPEN);
        expect(capped.verdict).toBe(
          open.verdict === "peak" && capped.verdict !== "peak" ? "good" : open.verdict,
        );
        expect(capped.byOrigin).toEqual(open.byOrigin);
        expect(capped.byVariety).toEqual(open.byVariety);
      }),
      RUNS,
    ));

  it("P16: an item verdict of Peak comes from an origin in a Peak country", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        const r = evaluate(item, { date: ctx.date }, ENV);
        if (r.verdict !== "peak") return;
        if (item.varieties.length > 0) expect(near(item.typicalOrigins[ctx.date.month - 1]?.[0])).toBe(true);
        else {
          const deciding = r.selection
            ? Object.entries(r.byOrigin).find(([o, x]) => x.verdict === "peak" && near(o))?.[0]
            : r.reasons.find((x) => x.code === "rated")?.origin;
          expect(near(deciding)).toBe(true);
        }
      }),
      RUNS,
    ));

  it("P16: a selection only lifts the item to Peak, with Check the label, from a prime in-store origin", () =>
    fc.assert(
      fc.property(itemArb, ctxArb, (item, ctx) => {
        if (item.varieties.length > 0) return;
        const r = evaluate(item, { date: ctx.date }, ENV);
        const without = evaluate(noSelections(item), { date: ctx.date }, ENV);
        if (r.selection === null) {
          expect(r.verdict).toBe(without.verdict);
          return;
        }
        expect(without.verdict).not.toBe("peak");
        expect(r.verdict).toBe("peak");
        expect(r.markers.some((m) => m.kind === "check-label")).toBe(true);
        expect(r.weakProperties).toContain("agreement");
        const w = windowIndex(ctx.date.month, ctx.date.day);
        const s = item.selections.find((x) => x.id === r.selection);
        expect(s?.inStore[ctx.date.month - 1]).toBe(true);
        expect(s?.origins.some((o) => item.origins[o]?.windows[w] === "prime")).toBe(true);
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

// The verdict engine (product spec §7, engineering plan §4.2–4.3). Pure: no I/O, no clock.
// Rules 1–4 run in order and the first match wins; markers, label advice and variety results re-run them.
import type { Rules } from "../data/schema";
import { WINDOW_COUNT, windowIndex } from "../time";

export type Rating = "prime" | "fair" | "poor";
export type Verdict = "peak" | "good" | "skip" | "limited";
export type Confidence = "high" | "medium" | "low";
export type WeakProperty = "coverage" | "relevance" | "freshness" | "agreement";
export type OriginId = string;
export type VarietyId = string;

export interface PlainDate {
  year: number;
  month: number;
  day: number;
}

/** One origin's or variety's ratings, indexed by window 0–23. */
export interface RatedSeries {
  windows: readonly (Rating | null)[];
  /** P12 combined confidence per window, once seasonal evidence exists. Absent: not Low. */
  evidence?: readonly (Confidence | null)[];
}

export interface RatedVariety extends RatedSeries {
  id: VarietyId;
  /** Indexed by month 0–11: the variety is typically in stores (P13). */
  inStore: readonly boolean[];
}

export interface ItemInputs {
  id: string;
  evidenceBasis: "supply+assessment" | "assessment-only";
  alwaysGood: boolean;
  /** Editorial: buying in its best season makes a difference a shopper can taste. Only then can it be Peak. */
  peakWorthSeeking: boolean;
  origins: Readonly<Record<OriginId, RatedSeries>>;
  /** Rated varieties in file order; empty unless the item is rated by variety. */
  varieties: readonly RatedVariety[];
  /** Indexed by month 0–11: typical origins, top-ranked first. */
  typicalOrigins: readonly (readonly OriginId[])[];
  /** Indexed by month 0–11, in typicalOrigins' order: each one's share of the month's volume (P1). Null for
   * editorial typical origins, which carry no volume. */
  typicalShares: readonly (readonly (number | null)[])[];
  /** Indexed by month 0–11: typical origins under rules.decidingOriginShare of the month's volume, which never take
   * over from the top origin (P9). */
  minorOrigins: readonly (readonly OriginId[])[];
  /** Per origin, indexed by month 0–11: that origin's typical supply index against its own season (P11). A
   * missing origin or month has none. */
  supply: Readonly<Record<OriginId, readonly (number | null)[]>>;
}

export interface EvalContext {
  date: PlainDate;
  labelOrigin?: OriginId;
  labelVariety?: VarietyId;
}

export interface Env {
  rules: Rules;
  /** Last month of the yearly supply snapshot ("YYYY-MM"), or null with no snapshot. */
  snapshotTo: string | null;
}

export type Reason =
  | { code: "no-typical-origins" }
  | { code: "origin-unrated"; origin: OriginId }
  | { code: "no-variety-in-stores" }
  | { code: "variety-unrated"; variety: VarietyId }
  | { code: "rated"; rating: Rating; origin?: OriginId; variety?: VarietyId }
  | { code: "supply-thin" }
  /** Rated prime, but the item tastes much the same in and out of its best season: Good, not Peak. */
  | { code: "peak-not-worth-seeking" }
  /** Another typical origin this window is poor: never Peak, and the label note names it (P9). */
  | { code: "typical-origin-poor"; origin: OriginId };

export interface CoreResult {
  verdict: Verdict;
  ruleFired: 1 | 2 | 3 | 4;
  reasons: Reason[];
  confidence: Confidence;
  weakProperties: WeakProperty[];
}

export type Marker =
  | { kind: "last-call"; fadesBy: number }
  | { kind: "reliable-year-round" }
  /** The label note applies: typical origins mix poor with better, so the shopper should check the label (P9). */
  | { kind: "check-label" }
  | { kind: "improves"; window: number };

export interface VerdictResult extends CoreResult {
  markers: Marker[];
  /** "Depends on the label": the typical origins this window include a poor one and a better one (P9). */
  labelNote: boolean;
  byOrigin: Record<OriginId, CoreResult>;
  byVariety: Record<VarietyId, CoreResult & { inStore: boolean }>;
  /** Items rated by variety: the in-store varieties holding the item verdict, in card order (P13). */
  varietyLine: VarietyId[] | null;
}

type Basis =
  | { kind: "typical" }
  | { kind: "origin"; origin: OriginId }
  | { kind: "variety"; variety: VarietyId };

/** Best first: Peak, Good, Skip, then Limited evidence (an unknown never outranks a call). */
const VERDICT_RANK: Record<Verdict, number> = { peak: 3, good: 2, skip: 1, limited: 0 };
const CONFIDENCE_RANK: Record<Confidence, number> = { high: 2, medium: 1, low: 0 };

export const verdictRank = (v: Verdict): number => VERDICT_RANK[v];
export const confidenceRank = (c: Confidence): number => CONFIDENCE_RANK[c];

const monthOf = (window: number): number => Math.floor(window / 2);

function evaluateCore(
  item: ItemInputs,
  basis: Basis,
  window: number,
  ctx: EvalContext,
  env: Env,
): CoreResult & { labelNote?: boolean } {
  if (basis.kind === "typical" && item.varieties.length > 0) return bestVariety(item, window, ctx, env).core;

  const month = monthOf(window);
  const typical = item.typicalOrigins[month] ?? [];
  const missing: Reason[] = [];
  let rating: Rating | null = null;
  let decider: RatedSeries | undefined;
  let supplyOrigin: OriginId | undefined;
  let labelNote = false;
  let poorOrigin: OriginId | undefined;

  if (basis.kind === "typical") {
    const ratingOf = (o: OriginId) => item.origins[o]?.windows[window] ?? null;
    const shares = item.typicalShares[month] ?? [];
    const ratedTypical = typical.filter((o) => ratingOf(o) !== null);
    // P1: the rated typical origins must hold enough of the typical volume; with any share unknown
    // (editorial typical origins), every typical origin must be rated.
    const known = shares.length === typical.length && shares.every((s) => s !== null);
    const shareOf = (os: readonly OriginId[]) =>
      os.reduce((sum, o) => sum + ((shares[typical.indexOf(o)] as number | null) ?? 0), 0);
    const covered = known
      ? shareOf(ratedTypical) >= env.rules.ratedTypicalShare * shareOf(typical) - 1e-9
      : ratedTypical.length === typical.length;
    if (typical.length === 0) missing.push({ code: "no-typical-origins" });
    else if (!covered)
      for (const origin of typical)
        if (ratingOf(origin) === null) missing.push({ code: "origin-unrated", origin });
    if (missing.length === 0) {
      // Unrated typical origins below the P1 share are passed over: the rated ones decide.
      const [top, second] = ratedTypical as [OriginId, ...OriginId[]];
      // P9: the verdict follows the top origin, unless it's poor and the second origin, a major one, is rated
      // better on evidence that isn't Low, so one weak call or a small origin never lifts a Skip.
      const lead =
        ratingOf(top) === "poor" &&
        second !== undefined &&
        !item.minorOrigins[month]?.includes(second) &&
        ratingOf(second) !== "poor" &&
        item.origins[second]?.evidence?.[window] !== "low"
          ? second
          : top;
      decider = item.origins[lead];
      rating = ratingOf(lead);
      supplyOrigin = lead;
      const ratings = ratedTypical.map(ratingOf);
      labelNote = ratings.includes("poor") && ratings.some((r) => r !== "poor");
      poorOrigin = ratedTypical.find((o) => o !== lead && ratingOf(o) === "poor");
    }
  } else if (basis.kind === "origin") {
    decider = item.origins[basis.origin];
    rating = decider?.windows[window] ?? null;
    supplyOrigin = basis.origin;
    if (rating === null) missing.push({ code: "origin-unrated", origin: basis.origin });
  } else {
    decider = item.varieties.find((v) => v.id === basis.variety);
    rating = decider?.windows[window] ?? null;
    supplyOrigin = typical[0];
    if (rating === null) missing.push({ code: "variety-unrated", variety: basis.variety });
  }

  return decide(
    item,
    { rating, decider, missing, labelNote, poorOrigin, supplyOrigin, basis, window },
    ctx,
    env,
  );
}

interface Decision {
  rating: Rating | null;
  decider: RatedSeries | undefined;
  missing: Reason[];
  labelNote: boolean;
  /** Typical basis only: a typical origin other than the deciding one rated poor this window. */
  poorOrigin?: OriginId | undefined;
  /** The deciding origin, for its supply index (the top typical one for a variety). */
  supplyOrigin: OriginId | undefined;
  basis: Basis;
  window: number;
}

function decide(
  item: ItemInputs,
  d: Decision,
  ctx: EvalContext,
  env: Env,
): CoreResult & { labelNote: boolean } {
  const supply =
    (d.supplyOrigin === undefined ? null : item.supply[d.supplyOrigin]?.[monthOf(d.window)]) ?? null;
  const thin = supply !== null && supply < env.rules.supplyIndex.thin;
  const strong = supply !== null && supply >= env.rules.supplyIndex.strong;
  const reasons: Reason[] = [];
  let verdict: Verdict;
  let ruleFired: CoreResult["ruleFired"];

  if (d.rating === null) {
    verdict = "limited";
    ruleFired = 1;
    reasons.push(...d.missing);
  } else {
    const by =
      d.basis.kind === "variety"
        ? { variety: d.basis.variety }
        : {
            origin: d.basis.kind === "origin" ? d.basis.origin : (d.supplyOrigin ?? ""),
          };
    reasons.push({ code: "rated", rating: d.rating, ...by });
    if (d.rating === "prime" && thin) reasons.push({ code: "supply-thin" });
    if (d.rating === "prime" && !item.peakWorthSeeking) reasons.push({ code: "peak-not-worth-seeking" });
    if (d.rating !== "poor" && d.poorOrigin)
      reasons.push({ code: "typical-origin-poor", origin: d.poorOrigin });

    if (d.rating === "poor") [verdict, ruleFired] = ["skip", 2];
    else if (d.rating === "prime" && !thin && item.peakWorthSeeking && !d.poorOrigin)
      [verdict, ruleFired] = ["peak", 3];
    else [verdict, ruleFired] = ["good", 4];
  }

  const weak: WeakProperty[] = [];
  if (verdict === "limited" || d.decider?.evidence?.[d.window] === "low") weak.push("coverage");
  if (item.evidenceBasis === "assessment-only") weak.push("relevance");
  if (staleSnapshot(item, ctx.date, env)) weak.push("freshness");
  if ((d.rating === "prime" && thin) || (d.rating === "poor" && strong) || d.labelNote)
    weak.push("agreement");

  return {
    verdict,
    ruleFired,
    reasons,
    confidence: weak.length === 0 ? "high" : weak.length === 1 ? "medium" : "low",
    weakProperties: weak,
    labelNote: d.labelNote,
  };
}

function staleSnapshot(item: ItemInputs, date: PlainDate, env: Env): boolean {
  if (item.evidenceBasis === "assessment-only") return false;
  if (env.snapshotTo === null) return true;
  const [y, m] = env.snapshotTo.split("-").map(Number) as [number, number];
  return date.year * 12 + date.month - (y * 12 + m) > env.rules.snapshotMaxAgeMonths;
}

/** P13: the item result is the best among in-store rated varieties, ties by confidence, then file order. */
function bestVariety(item: ItemInputs, window: number, ctx: EvalContext, env: Env) {
  const month = monthOf(window);
  const ranked = item.varieties
    .filter((v) => v.inStore[month] === true)
    .map((v, order) => ({
      id: v.id,
      order,
      core: stripNote(evaluateCore(item, { kind: "variety", variety: v.id }, window, ctx, env)),
    }))
    .sort(
      (a, b) =>
        VERDICT_RANK[b.core.verdict] - VERDICT_RANK[a.core.verdict] ||
        CONFIDENCE_RANK[b.core.confidence] - CONFIDENCE_RANK[a.core.confidence] ||
        a.order - b.order,
    );
  const best = ranked[0];
  if (best === undefined) {
    const none: Decision = {
      rating: null,
      decider: undefined,
      missing: [{ code: "no-variety-in-stores" }],
      labelNote: false,
      supplyOrigin: undefined,
      basis: { kind: "typical" },
      window,
    };
    return { core: stripNote(decide(item, none, ctx, env)), line: null };
  }
  const line =
    best.core.verdict === "limited"
      ? null
      : ranked.filter((r) => r.core.verdict === best.core.verdict).map((r) => r.id);
  return { core: best.core, line };
}

function stripNote(r: CoreResult & { labelNote?: boolean }): CoreResult {
  const { labelNote: _, ...core } = r;
  return core;
}

export function evaluate(item: ItemInputs, ctx: EvalContext, env: Env): VerdictResult {
  const window = windowIndex(ctx.date.month, ctx.date.day);
  const basis: Basis =
    ctx.labelVariety !== undefined
      ? { kind: "variety", variety: ctx.labelVariety }
      : ctx.labelOrigin !== undefined
        ? { kind: "origin", origin: ctx.labelOrigin }
        : { kind: "typical" };

  const head = evaluateCore(item, basis, window, ctx, env);
  const labelNote = head.labelNote === true;
  const core = stripNote(head);

  const outlook = (w: number) => evaluateCore(item, basis, w % WINDOW_COUNT, ctx, env).verdict;
  const markers: Marker[] = [];

  if (core.verdict === "peak" || core.verdict === "good") {
    for (let k = 1; k <= env.rules.lastCallWindows; k++) {
      const next = outlook(window + k);
      if (next !== "limited" && VERDICT_RANK[next] < VERDICT_RANK[core.verdict]) {
        markers.push({ kind: "last-call", fadesBy: (window + k) % WINDOW_COUNT });
        break;
      }
    }
  }
  if (!item.alwaysGood) {
    let goodOrBetter = 0;
    for (let w = 0; w < WINDOW_COUNT; w++) if (VERDICT_RANK[outlook(w)] >= VERDICT_RANK.good) goodOrBetter++;
    if (goodOrBetter >= env.rules.reliableYearRoundWindows) markers.push({ kind: "reliable-year-round" });
  }
  if (labelNote) markers.push({ kind: "check-label" });
  if (core.verdict === "skip") {
    for (let k = 1; k < WINDOW_COUNT; k++) {
      if (VERDICT_RANK[outlook(window + k)] >= VERDICT_RANK.good) {
        markers.push({ kind: "improves", window: (window + k) % WINDOW_COUNT });
        break;
      }
    }
  }

  const byOrigin: Record<OriginId, CoreResult> = {};
  for (const origin of Object.keys(item.origins))
    byOrigin[origin] = stripNote(evaluateCore(item, { kind: "origin", origin }, window, ctx, env));

  const byVariety: Record<VarietyId, CoreResult & { inStore: boolean }> = {};
  for (const v of item.varieties)
    byVariety[v.id] = {
      ...stripNote(evaluateCore(item, { kind: "variety", variety: v.id }, window, ctx, env)),
      inStore: v.inStore[monthOf(window)] === true,
    };

  const varietyLine =
    basis.kind === "typical" && item.varieties.length > 0 ? bestVariety(item, window, ctx, env).line : null;

  return { ...core, markers, labelNote, byOrigin, byVariety, varietyLine };
}

/** The typical-outlook verdict in each of the 24 windows: the item's, or one rated
 * variety's as if the label named it (the item page's variety strips). */
export function typicalOutlook(item: ItemInputs, env: Env, year: number, variety?: VarietyId): Verdict[] {
  const basis: Basis = variety === undefined ? { kind: "typical" } : { kind: "variety", variety };
  return Array.from({ length: WINDOW_COUNT }, (_, w) => {
    const date = { year, month: monthOf(w) + 1, day: w % 2 === 0 ? 1 : 16 };
    const ctx: EvalContext = { date, ...(variety === undefined ? {} : { labelVariety: variety }) };
    return evaluateCore(item, basis, w, ctx, env).verdict;
  });
}

/** The usual evidence for the editorial "Always good" class: Good in all 24 windows. */
export const looksAlwaysGood = (outlook: readonly Verdict[]): boolean => outlook.every((v) => v === "good");

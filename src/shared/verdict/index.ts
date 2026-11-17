// The verdict engine (product spec §7, engineering plan §4.2–4.3). Pure: no I/O, no clock.
// Rules 1–5 run in order and the first match wins; markers, label advice and variety results re-run them.
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

export interface EngineAdvisory {
  id: string;
  /** Absent: every origin of the item. */
  origins?: readonly OriginId[];
  from: string;
  to: string;
  effect: "skip" | "cap-good";
  reviewedOn?: string;
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
  /** Per origin, indexed by month 0–11: that origin's typical supply index against its own season (P11). A
   * missing origin or month has none. */
  supply: Readonly<Record<OriginId, readonly (number | null)[]>>;
  /** This item's advisories. */
  advisories: readonly EngineAdvisory[];
}

export interface EvalContext {
  date: PlainDate;
  mode: "today" | "typical";
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
  | { code: "advisory"; advisory: string; effect: EngineAdvisory["effect"] }
  | { code: "rated"; rating: Rating; origin?: OriginId; variety?: VarietyId }
  | { code: "supply-thin" }
  /** Rated prime, but the item tastes much the same in and out of its best season: Good, not Peak. */
  | { code: "peak-not-worth-seeking" }
  /** Rated prime, but another typical origin this window is poor: Good, since what you buy may disappoint. */
  | { code: "typical-origin-poor"; origin: OriginId };

export interface CoreResult {
  verdict: Verdict;
  ruleFired: 1 | 2 | 3 | 4 | 5;
  reasons: Reason[];
  confidence: Confidence;
  weakProperties: WeakProperty[];
  /** The advisory that applied, if any. */
  advisory: string | null;
}

export type Marker =
  | { kind: "last-call"; fadesBy: number }
  | { kind: "reliable-year-round" }
  | { kind: "advisory"; advisory: string }
  | { kind: "improves"; window: number };

export interface VerdictResult extends CoreResult {
  markers: Marker[];
  /** "Depends on the label": the top two typical origins differ by more than `labelNoteLevelGap`. */
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

const LEVEL: Record<Rating, number> = { poor: 0, fair: 1, prime: 2 };
/** Best first: Peak, Good, Skip, then Limited evidence (an unknown never outranks a call). */
const VERDICT_RANK: Record<Verdict, number> = { peak: 3, good: 2, skip: 1, limited: 0 };
const CONFIDENCE_RANK: Record<Confidence, number> = { high: 2, medium: 1, low: 0 };

export const verdictRank = (v: Verdict): number => VERDICT_RANK[v];
export const confidenceRank = (c: Confidence): number => CONFIDENCE_RANK[c];

const monthOf = (window: number): number => Math.floor(window / 2);
const isoDate = (d: PlainDate): string =>
  `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;

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
  let advisoryOrigin: OriginId | undefined;
  let labelNote = false;
  let poorOrigin: OriginId | undefined;

  if (basis.kind === "typical") {
    if (typical.length === 0) missing.push({ code: "no-typical-origins" });
    for (const origin of typical)
      if ((item.origins[origin]?.windows[window] ?? null) === null)
        missing.push({ code: "origin-unrated", origin });
    if (missing.length === 0) {
      const [top, second] = typical as [OriginId, ...OriginId[]];
      decider = item.origins[top];
      rating = decider?.windows[window] ?? null;
      advisoryOrigin = top;
      const next = second === undefined ? null : (item.origins[second]?.windows[window] ?? null);
      labelNote =
        rating !== null &&
        next !== null &&
        Math.abs(LEVEL[rating] - LEVEL[next]) > env.rules.labelNoteLevelGap;
      poorOrigin = typical.slice(1).find((o) => item.origins[o]?.windows[window] === "poor");
    }
  } else if (basis.kind === "origin") {
    decider = item.origins[basis.origin];
    rating = decider?.windows[window] ?? null;
    advisoryOrigin = basis.origin;
    if (rating === null) missing.push({ code: "origin-unrated", origin: basis.origin });
  } else {
    decider = item.varieties.find((v) => v.id === basis.variety);
    rating = decider?.windows[window] ?? null;
    advisoryOrigin = typical[0];
    if (rating === null) missing.push({ code: "variety-unrated", variety: basis.variety });
  }

  const advisory = rating === null ? undefined : activeAdvisory(item, advisoryOrigin, ctx);
  return decide(
    item,
    {
      rating,
      decider,
      missing,
      advisory,
      labelNote,
      poorOrigin,
      supplyOrigin: advisoryOrigin,
      basis,
      window,
    },
    ctx,
    env,
  );
}

function activeAdvisory(item: ItemInputs, origin: OriginId | undefined, ctx: EvalContext) {
  if (ctx.mode !== "today") return undefined;
  const today = isoDate(ctx.date);
  const applies = item.advisories.filter(
    (a) =>
      a.from <= today &&
      today <= a.to &&
      (a.origins === undefined || (origin !== undefined && a.origins.includes(origin))),
  );
  return applies.find((a) => a.effect === "skip") ?? applies[0];
}

interface Decision {
  rating: Rating | null;
  decider: RatedSeries | undefined;
  missing: Reason[];
  advisory: EngineAdvisory | undefined;
  labelNote: boolean;
  /** Typical basis only: a typical origin other than the top one rated poor this window. */
  poorOrigin?: OriginId | undefined;
  /** Whose supply index applies: the deciding origin (the top typical one for a variety). */
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
            origin:
              d.basis.kind === "origin"
                ? d.basis.origin
                : (item.typicalOrigins[monthOf(d.window)]?.[0] ?? ""),
          };
    reasons.push({ code: "rated", rating: d.rating, ...by });
    if (d.advisory) reasons.push({ code: "advisory", advisory: d.advisory.id, effect: d.advisory.effect });
    if (d.rating === "prime" && thin) reasons.push({ code: "supply-thin" });
    if (d.rating === "prime" && !item.peakWorthSeeking) reasons.push({ code: "peak-not-worth-seeking" });
    if (d.rating === "prime" && d.poorOrigin)
      reasons.push({ code: "typical-origin-poor", origin: d.poorOrigin });

    if (d.advisory?.effect === "skip") [verdict, ruleFired] = ["skip", 2];
    else if (d.rating === "poor") [verdict, ruleFired] = ["skip", 3];
    else if (d.rating === "prime" && !thin && d.advisory?.effect === "cap-good")
      [verdict, ruleFired] = ["good", 2];
    else if (d.rating === "prime" && !thin && item.peakWorthSeeking && !d.poorOrigin)
      [verdict, ruleFired] = ["peak", 4];
    else [verdict, ruleFired] = ["good", 5];
  }

  const weak: WeakProperty[] = [];
  if (verdict === "limited" || d.decider?.evidence?.[d.window] === "low") weak.push("coverage");
  if (item.evidenceBasis === "assessment-only") weak.push("relevance");
  if (
    staleSnapshot(item, ctx.date, env) ||
    (d.advisory !== undefined && !reviewedThisWindow(d.advisory, ctx.date))
  )
    weak.push("freshness");
  if ((d.rating === "prime" && thin) || (d.rating === "poor" && strong) || d.labelNote)
    weak.push("agreement");

  return {
    verdict,
    ruleFired,
    reasons,
    confidence: weak.length === 0 ? "high" : weak.length === 1 ? "medium" : "low",
    weakProperties: weak,
    advisory: d.advisory?.id ?? null,
    labelNote: d.labelNote,
  };
}

function staleSnapshot(item: ItemInputs, date: PlainDate, env: Env): boolean {
  if (item.evidenceBasis === "assessment-only") return false;
  if (env.snapshotTo === null) return true;
  const [y, m] = env.snapshotTo.split("-").map(Number) as [number, number];
  return date.year * 12 + date.month - (y * 12 + m) > env.rules.snapshotMaxAgeMonths;
}

function reviewedThisWindow(a: EngineAdvisory, date: PlainDate): boolean {
  if (a.reviewedOn === undefined) return false;
  const [y, m, d] = a.reviewedOn.split("-").map(Number) as [number, number, number];
  return y === date.year && windowIndex(m, d) === windowIndex(date.month, date.day);
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
      advisory: undefined,
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

  const typicalCtx: EvalContext = { ...ctx, mode: "typical" };
  const outlook = (w: number) => evaluateCore(item, basis, w % WINDOW_COUNT, typicalCtx, env).verdict;
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
  if (core.advisory !== null) markers.push({ kind: "advisory", advisory: core.advisory });
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

/** The typical-outlook verdict in each of the 24 windows (advisories ignored). */
export function typicalOutlook(item: ItemInputs, env: Env, year: number): Verdict[] {
  return Array.from({ length: WINDOW_COUNT }, (_, w) => {
    const date = { year, month: monthOf(w) + 1, day: w % 2 === 0 ? 1 : 16 };
    return evaluateCore(item, { kind: "typical" }, w, { date, mode: "typical" }, env).verdict;
  });
}

/** The usual evidence for the editorial "Always good" class: Good in all 24 windows. */
export const looksAlwaysGood = (outlook: readonly Verdict[]): boolean => outlook.every((v) => v === "good");

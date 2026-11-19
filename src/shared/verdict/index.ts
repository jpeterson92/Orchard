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

/** P16: what a shopper can pick out by the sign or label (local field tomatoes), grouping rated origins. */
export interface Selection {
  id: string;
  /** Rated origins of the item; the selection's rating in a window is the best of theirs. */
  origins: readonly OriginId[];
  /** Indexed by month 0–11: common enough in mainstream supermarkets (cited, or USDA volume). */
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
  /** P16, in file order; empty on items rated by variety. */
  selections: readonly Selection[];
  /** Indexed by month 0–11: typical origins, top-ranked first. */
  typicalOrigins: readonly (readonly OriginId[])[];
  /** Indexed by month 0–11, in typicalOrigins' order: each one's share of the month's volume (P1). Null for
   * editorial typical origins, which carry no volume. */
  typicalShares: readonly (readonly (number | null)[])[];
  /** Indexed by month 0–11: typical origins not marked major. Where shares are unknown they weigh nothing (P20). */
  minorOrigins: readonly (readonly OriginId[])[];
  /** P20, per origin, indexed by month 0–11: cited as commonly on supermarket shelves, whatever its share. */
  originInStores: Readonly<Record<OriginId, readonly boolean[]>>;
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
  /** Another typical origin this window is poor; the item page names it. */
  | { code: "typical-origin-poor"; origin: OriginId }
  /** P16: rated prime, but shipped from outside rules.peakCountries, so the item verdict is Good at most. */
  | { code: "far-origin"; origin: OriginId }
  /** P16: Peak because a selection the shopper can pick out is prime and common enough; typical supply is worse. */
  | { code: "selection"; selection: string }
  /** P20: at most rules.lookForShare of the typical supply is at the verdict's level: the origins that are (top
   * first, at most 3), so the shopper picks by the label. */
  | { code: "look-for"; origins: OriginId[] }
  /** P18: no origin typically supplies it this month. */
  | { code: "out-of-season" }
  /** P19: rated Peak here, but Peak is kept for the item's main season, windows `from` to `to`. */
  | { code: "main-peak"; from: number; to: number };

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
  /** The label note applies: the shopper picks by the label (P20, P16). */
  | { kind: "check-label" }
  | { kind: "improves"; window: number };

export interface VerdictResult extends CoreResult {
  markers: Marker[];
  /** "Depends on the label": the verdict holds only for origins the shopper picks by the label (P20), or a
   * selection makes it Peak (P16). */
  labelNote: boolean;
  byOrigin: Record<OriginId, CoreResult>;
  byVariety: Record<VarietyId, CoreResult & { inStore: boolean }>;
  /** Items rated by variety: the in-store varieties holding the item verdict, in card order (P13). */
  varietyLine: VarietyId[] | null;
  /** P16: the selection that makes the item Peak, when typical supply alone doesn't. */
  selection: string | null;
}

type Basis =
  | { kind: "typical" }
  | { kind: "origin"; origin: OriginId }
  /** `item`: evaluated for the item verdict (P13), so the distance cap applies (P16). */
  | { kind: "variety"; variety: VarietyId; item?: true };

/** Best first: Peak, Good, Skip, then Limited evidence (an unknown never outranks a call). */
const VERDICT_RANK: Record<Verdict, number> = { peak: 3, good: 2, skip: 1, limited: 0 };
const CONFIDENCE_RANK: Record<Confidence, number> = { high: 2, medium: 1, low: 0 };

export const verdictRank = (v: Verdict): number => VERDICT_RANK[v];
export const confidenceRank = (c: Confidence): number => CONFIDENCE_RANK[c];

const monthOf = (window: number): number => Math.floor(window / 2);

/** P16: grown in a country that can make the item verdict Peak. */
const near = (origin: OriginId, env: Env): boolean => env.rules.peakCountries.includes(origin.slice(0, 2));

/** P20 trace, typical basis on items rated by origin: one origin in a level's set. */
export interface LevelOrigin {
  origin: OriginId;
  rating: Rating;
  /** Its weight in the typical supply: the volume share, or 1 per major editorial origin (0 for minor). */
  weight: number;
  /** False: a low-confidence rating that isn't the top origin, so it doesn't make the level available. */
  counts: boolean;
  /** Cited as commonly in stores this month. */
  inStores: boolean;
}

/** P20 trace: the rated typical origins at a level (Peak: prime, near and not thin; Good: fair or better). */
export interface LevelSet {
  origins: LevelOrigin[];
  /** All its origins' weight over the typical total (the look-for test against rules.lookForShare). */
  share: number;
  /** Its counting origins' weight over the typical total (the availability test against rules.availableShare). */
  countedShare: number;
  /** How it is reasonably likely on the shelf, or null when it isn't. */
  available: "share" | "in-stores" | null;
}

/** P20 trace for one window: how the item verdict's levels were weighed. */
export interface Levels {
  /** Volume shares from USDA, or equal weights for editorial typical origins. */
  weights: "volume" | "editorial";
  /** The typical origins' total weight this month. */
  total: number;
  /** Every typical origin, top-ranked first, with its rating (null: unrated) and supply index (P11). */
  typical: { origin: OriginId; rating: Rating | null; weight: number; supply: number | null }[];
  peak: LevelSet;
  good: LevelSet;
}

/** `notPeak`: what a Peak window reads if P19 takes its Peak away (the Good call, or the typical result under a
 * selection's Peak). */
type Core = CoreResult & { labelNote?: boolean; selection?: string; notPeak?: Core; levels?: Levels };

function evaluateCore(item: ItemInputs, basis: Basis, window: number, ctx: EvalContext, env: Env): Core {
  const month = monthOf(window);
  const typical = item.typicalOrigins[month] ?? [];
  // P18: no origin typically supplies it this month, though some do in others: out of season, so Skip.
  if (basis.kind === "typical" && typical.length === 0 && item.typicalOrigins.some((os) => os.length > 0))
    return decide(
      item,
      {
        rating: null,
        decider: undefined,
        missing: [],
        labelNote: false,
        supplyOrigin: undefined,
        basis,
        window,
        capped: true,
        outOfSeason: true,
      },
      ctx,
      env,
    );
  if (basis.kind === "typical" && item.varieties.length > 0) return bestVariety(item, window, ctx, env).core;

  const missing: Reason[] = [];
  let rating: Rating | null = null;
  let decider: RatedSeries | undefined;
  let supplyOrigin: OriginId | undefined;
  const labelNote = false;
  let poorOrigin: OriginId | undefined;
  let peakAllowed = true;
  let lookFor: readonly OriginId[] = [];
  let good: Partial<Decision> | undefined;
  let levels: Levels | undefined;

  if (basis.kind === "typical") {
    const ratingOf = (o: OriginId) => item.origins[o]?.windows[window] ?? null;
    const shares = item.typicalShares[month] ?? [];
    const ratedTypical = typical.filter((o) => ratingOf(o) !== null);
    // P1: the rated typical origins must hold enough of the typical volume; with any share unknown
    // (editorial typical origins), every typical origin must be rated.
    const known = shares.length === typical.length && shares.every((s) => s !== null);
    const volume = (os: readonly OriginId[]) =>
      os.reduce((sum, o) => sum + ((shares[typical.indexOf(o)] as number | null) ?? 0), 0);
    const covered = known
      ? volume(ratedTypical) >= env.rules.ratedTypicalShare * volume(typical) - 1e-9
      : ratedTypical.length === typical.length;
    if (typical.length === 0) missing.push({ code: "no-typical-origins" });
    else if (!covered)
      for (const origin of typical)
        if (ratingOf(origin) === null) missing.push({ code: "origin-unrated", origin });
    if (missing.length === 0) {
      // Unrated typical origins below the P1 share are passed over: the rated ones decide.
      const top = ratedTypical[0] as OriginId;
      // P20: a level counts when origins rated at it or better are reasonably likely on the shelf: they hold
      // rules.availableShare of the typical supply (editorial origins: an equal share per major origin), or one
      // is cited as commonly in stores this month. Low-confidence ratings count only for the top origin. Peak
      // also needs each origin near (P16) and its supply not thin.
      const weight = (o: OriginId) =>
        known
          ? ((shares[typical.indexOf(o)] as number | null) ?? 0)
          : item.minorOrigins[month]?.includes(o)
            ? 0
            : 1;
      const total = typical.reduce((sum, o) => sum + weight(o), 0);
      const shareOf = (os: readonly OriginId[]) =>
        total > 0 ? os.reduce((sum, o) => sum + weight(o), 0) / total : 0;
      const counts = (o: OriginId) => o === top || item.origins[o]?.evidence?.[window] !== "low";
      const available = (os: readonly OriginId[]) => {
        const sure = os.filter(counts);
        return (
          sure.length > 0 &&
          (shareOf(sure) >= env.rules.availableShare - 1e-9 ||
            sure.some((o) => item.originInStores[o]?.[month] === true))
        );
      };
      const thinAt = (o: OriginId) => {
        const s = item.supply[o]?.[month];
        return s != null && s < env.rules.supplyIndex.thin;
      };
      const peakSet = ratedTypical.filter((o) => ratingOf(o) === "prime" && near(o, env) && !thinAt(o));
      const goodSet = ratedTypical.filter((o) => ratingOf(o) !== "poor");
      // The level's top-ranked origin that counts decides. The shopper picks by the label unless more than
      // rules.lookForShare of the typical supply is at the level.
      const at = (os: readonly OriginId[], peak: boolean): Partial<Decision> => {
        const lead = os.find(counts) as OriginId;
        return {
          rating: ratingOf(lead),
          decider: item.origins[lead],
          supplyOrigin: lead,
          peakAllowed: peak,
          lookFor: shareOf(os) > env.rules.lookForShare + 1e-9 ? [] : os.slice(0, 3),
          poorOrigin: ratedTypical.find((o) => o !== lead && ratingOf(o) === "poor"),
        };
      };
      const trace = (os: readonly OriginId[]): LevelSet => {
        const sure = os.filter(counts);
        return {
          origins: os.map((o) => ({
            origin: o,
            rating: ratingOf(o) as Rating,
            weight: weight(o),
            counts: counts(o),
            inStores: item.originInStores[o]?.[month] === true,
          })),
          share: shareOf(os),
          countedShare: shareOf(sure),
          available: !available(os)
            ? null
            : sure.length > 0 && shareOf(sure) >= env.rules.availableShare - 1e-9
              ? "share"
              : "in-stores",
        };
      };
      levels = {
        weights: known ? "volume" : "editorial",
        total,
        typical: typical.map((o) => ({
          origin: o,
          rating: ratingOf(o),
          weight: weight(o),
          supply: item.supply[o]?.[month] ?? null,
        })),
        peak: trace(peakSet),
        good: trace(goodSet),
      };
      good = available(goodSet) ? at(goodSet, false) : undefined;
      // Skip: the top poor origin decides (with none, the top origin).
      const skipLead = ratedTypical.find((o) => ratingOf(o) === "poor") ?? top;
      const chosen = (item.peakWorthSeeking && available(peakSet) ? at(peakSet, true) : undefined) ??
        good ?? {
          rating: ratingOf(skipLead),
          decider: item.origins[skipLead],
          supplyOrigin: skipLead,
          peakAllowed: false,
        };
      rating = chosen.rating ?? null;
      decider = chosen.decider;
      supplyOrigin = chosen.supplyOrigin;
      peakAllowed = chosen.peakAllowed ?? false;
      lookFor = chosen.lookFor ?? [];
      poorOrigin = chosen.poorOrigin;
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

  // P16: the distance cap applies to the item verdict, never to label advice.
  const capped = basis.kind === "typical" || (basis.kind === "variety" && basis.item === true);
  const base = { missing, labelNote, basis, window, capped };
  const result: Core = decide(
    item,
    { ...base, rating, decider, poorOrigin, supplyOrigin, peakAllowed, lookFor },
    ctx,
    env,
  );
  if (levels) result.levels = levels;
  // P19: a typical Peak taken away reads as the Good level, with that level's origins to look for.
  if (basis.kind === "typical" && result.verdict === "peak" && good) {
    const { notPeak: _, ...asGood } = decide(
      item,
      { ...base, rating: null, decider: undefined, supplyOrigin: undefined, ...good },
      ctx,
      env,
    );
    result.notPeak = asGood;
  }
  if (basis.kind === "typical" && result.verdict !== "peak") {
    const lifted = selectionPeak(item, window, result, ctx, env);
    if (lifted) return lifted;
  }
  return result;
}

/** P16: the first selection (file order) in stores this month whose best origin, rated prime, runs rules 2–4 to
 * Peak. Typical supply is worse, so the label note applies. */
function selectionPeak(
  item: ItemInputs,
  window: number,
  typical: Core,
  ctx: EvalContext,
  env: Env,
): Core | null {
  const rank: Record<Rating, number> = { prime: 2, fair: 1, poor: 0 };
  for (const s of item.selections) {
    if (s.inStore[monthOf(window)] !== true) continue;
    let best: OriginId | undefined;
    for (const o of s.origins) {
      const r = item.origins[o]?.windows[window];
      if (!near(o, env) || r == null) continue;
      const b = best === undefined ? null : item.origins[best]?.windows[window];
      if (b == null || rank[r] > rank[b]) best = o;
    }
    if (best === undefined || item.origins[best]?.windows[window] !== "prime") continue;
    const r = decide(
      item,
      {
        rating: "prime",
        decider: item.origins[best],
        missing: [],
        labelNote: true,
        supplyOrigin: best,
        basis: { kind: "origin", origin: best },
        window,
        capped: true,
      },
      ctx,
      env,
    );
    if (r.verdict === "peak")
      return {
        ...r,
        reasons: [{ code: "selection", selection: s.id }, ...typical.reasons],
        selection: s.id,
        notPeak: typical,
        ...(typical.levels ? { levels: typical.levels } : {}),
      };
  }
  return null;
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
  /** P16: Peak needs the deciding origin in rules.peakCountries. */
  capped: boolean;
  /** P18: no origin typically supplies the item this month. */
  outOfSeason?: boolean;
  /** Typical basis, P20: the Peak level is reasonably likely on the shelf. */
  peakAllowed?: boolean;
  /** Typical basis, P20: the level's origins to look for by the label, when the shopper must pick. */
  lookFor?: readonly OriginId[];
}

function decide(
  item: ItemInputs,
  d: Decision,
  ctx: EvalContext,
  env: Env,
): CoreResult & { labelNote: boolean; notPeak?: Core } {
  const supply =
    (d.supplyOrigin === undefined ? null : item.supply[d.supplyOrigin]?.[monthOf(d.window)]) ?? null;
  const thin = supply !== null && supply < env.rules.supplyIndex.thin;
  const strong = supply !== null && supply >= env.rules.supplyIndex.strong;
  const far = d.capped && d.supplyOrigin !== undefined && !near(d.supplyOrigin, env);
  const reasons: Reason[] = [];
  let verdict: Verdict;
  let ruleFired: CoreResult["ruleFired"];
  let labelNote = d.labelNote;

  if (d.outOfSeason) {
    verdict = "skip";
    ruleFired = 2;
    reasons.push({ code: "out-of-season" });
  } else if (d.rating === null) {
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
    if (d.rating === "prime" && far && d.supplyOrigin !== undefined)
      reasons.push({ code: "far-origin", origin: d.supplyOrigin });
    if (d.rating !== "poor" && d.poorOrigin)
      reasons.push({ code: "typical-origin-poor", origin: d.poorOrigin });

    if (d.rating === "poor") [verdict, ruleFired] = ["skip", 2];
    else if (d.rating === "prime" && !thin && item.peakWorthSeeking && !far && d.peakAllowed !== false)
      [verdict, ruleFired] = ["peak", 3];
    else [verdict, ruleFired] = ["good", 4];
    // P20: the verdict holds for only part of the supply, so the shopper picks by the label.
    if (verdict !== "skip" && d.lookFor && d.lookFor.length > 0) {
      labelNote = true;
      reasons.push({ code: "look-for", origins: [...d.lookFor] });
    }
  }

  const finish = (
    verdict: Verdict,
    ruleFired: CoreResult["ruleFired"],
    reasons: Reason[],
    labelNote: boolean,
  ) => {
    const weak: WeakProperty[] = [];
    if (verdict === "limited" || d.decider?.evidence?.[d.window] === "low") weak.push("coverage");
    if (item.evidenceBasis === "assessment-only") weak.push("relevance");
    if (staleSnapshot(item, ctx.date, env)) weak.push("freshness");
    if ((d.rating === "prime" && thin) || (d.rating === "poor" && strong) || labelNote)
      weak.push("agreement");
    return {
      verdict,
      ruleFired,
      reasons,
      confidence:
        weak.length === 0 ? ("high" as const) : weak.length === 1 ? ("medium" as const) : ("low" as const),
      weakProperties: weak,
      labelNote,
    };
  };
  const result = finish(verdict, ruleFired, reasons, labelNote);
  if (verdict !== "peak") return result;
  const good = finish(
    "good",
    4,
    reasons.filter((r) => r.code !== "look-for"),
    d.labelNote,
  );
  return { ...result, notPeak: good };
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
      core: stripNote(evaluateCore(item, { kind: "variety", variety: v.id, item: true }, window, ctx, env)),
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
      capped: true,
    };
    return { core: stripNote(decide(item, none, ctx, env)), line: null };
  }
  const line =
    best.core.verdict === "limited"
      ? null
      : ranked.filter((r) => r.core.verdict === best.core.verdict).map((r) => r.id);
  return { core: best.core, line };
}

function stripNote(r: Core): CoreResult {
  const { labelNote: _, selection: __, notPeak: ___, levels: ____, ...core } = r;
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

  const raw = Array.from({ length: WINDOW_COUNT }, (_, w) => evaluateCore(item, basis, w, ctx, env));
  const year = basis.kind === "typical" ? mainPeakOnly(raw) : raw;
  const head = year[window] as Core;
  const labelNote = head.labelNote === true;
  const selection = head.selection ?? null;
  const core = stripNote(head);

  const outlook = (w: number) => (year[w % WINDOW_COUNT] as Core).verdict;
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

  return { ...core, markers, labelNote, byOrigin, byVariety, varietyLine, selection };
}

/** The typical-outlook verdict in each of the 24 windows: the item's, or one rated
 * variety's as if the label named it (the item page's variety strips). */
export function typicalOutlook(item: ItemInputs, env: Env, year: number, variety?: VarietyId): Verdict[] {
  const basis: Basis = variety === undefined ? { kind: "typical" } : { kind: "variety", variety };
  const cores = Array.from({ length: WINDOW_COUNT }, (_, w) => {
    const date = { year, month: monthOf(w) + 1, day: w % 2 === 0 ? 1 : 16 };
    const ctx: EvalContext = { date, ...(variety === undefined ? {} : { labelVariety: variety }) };
    return evaluateCore(item, basis, w, ctx, env);
  });
  return (variety === undefined ? mainPeakOnly(cores) : cores).map((c) => c.verdict);
}

/** P19: an item is Peak at most once a year. With several Peak runs in its year (read around the year end),
 * only the longest stays Peak, the earliest-starting on a tie. The others read as they would without Peak (Good,
 * or the typical result under a selection's Peak) with a `main-peak` reason. Label advice and variety strips keep
 * every Peak. */
function mainPeakOnly<C extends Core>(year: readonly C[]): C[] {
  const n = year.length;
  const peak = year.map((c) => c.verdict === "peak");
  const runs: { from: number; length: number }[] = [];
  for (let w = 0; w < n; w++) {
    if (!peak[w] || peak[(w + n - 1) % n]) continue;
    let length = 0;
    while (length < n && peak[(w + length) % n]) length++;
    runs.push({ from: w, length });
  }
  const main = runs.reduce<(typeof runs)[number] | undefined>(
    (best, r) => (best === undefined || r.length > best.length ? r : best),
    undefined,
  );
  if (main === undefined || runs.length < 2) return [...year];
  const to = (main.from + main.length - 1) % n;
  return year.map((c, w) => {
    if (c.verdict !== "peak" || (w - main.from + n) % n < main.length) return c;
    // Variety-rated cores carry no `notPeak`: their Good call changes nothing else.
    const {
      selection: _,
      notPeak: __,
      ...rest
    } = c.notPeak ?? {
      ...c,
      verdict: "good" as const,
      ruleFired: 4 as const,
    };
    return { ...rest, reasons: [...rest.reasons, { code: "main-peak", from: main.from, to }] } as C;
  });
}

/** P20 trace for one window's item verdict: the Peak and Good sets as the engine weighed them. Null where they
 * weren't weighed: rated by variety, out of season, or too little of the typical supply rated (P1). */
export function typicalLevels(item: ItemInputs, ctx: EvalContext, env: Env): Levels | null {
  const window = windowIndex(ctx.date.month, ctx.date.day);
  return evaluateCore(item, { kind: "typical" }, window, ctx, env).levels ?? null;
}

/** The usual evidence for the editorial "Always good" class: Good in all 24 windows. */
export const looksAlwaysGood = (outlook: readonly Verdict[]): boolean => outlook.every((v) => v === "good");

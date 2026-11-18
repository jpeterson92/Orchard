// Seasonal evidence combined as quality curves (engineering plan §4.3, P12). Pure: no I/O.
// Each claim becomes a curve over the 24 half-month windows; the curves covering a window combine into a
// proposed rating with a confidence. The editorial windows in item files are the call; this is the evidence.
import type { EvidenceClaim, PanelCurve, Source } from "./data/schema";
import { WINDOW_COUNT, windowRange } from "./time";
import type { Confidence, Rating } from "./verdict";

/** The P12 constants, in one place so changing the methodology is cheap. */
export const P12 = {
  value: { prime: 1, fair: 0.5, poor: 0 },
  tier: { authoritative: 2, mainstream: 1 },
  directness: { "eating-quality": 1, availability: 0.6, secondhand: 0.3 },
  /** A single source's confidence label from its weight. */
  sourceConfidence: { high: 1.5, medium: 0.6 },
  /** Combined value cut-offs: prime at or above, poor at or below, fair between. */
  rating: { prime: 0.75, poor: 0.25 },
  combined: { minSources: 2, highWeight: 3, highSpread: 0.2, lowSpread: 0.35 },
  /** P14: windows either side of an availability claim's listed range that read fair. */
  availabilityShoulder: 1,
} as const;

/**
 * P15: the model panel. All counted runs share one root, so it is one source of weight 1 however many models
 * answer. It abstains where runs differ by more than one level (prime against poor).
 */
export const P15 = { weight: 1, maxGap: 0.5 } as const;
/** The panel's name among a window's independent sources. */
export const PANEL = "panel";

/** Weights are sums of products like 0.6 × 2; compare with a little tolerance. */
const EPS = 1e-9;

export type EvidenceSource = Pick<Source, "id" | "tier" | "basedOn">;
export type Claim = Pick<
  EvidenceClaim,
  "source" | "origin" | "variety" | "windows" | "specificity" | "directness"
>;

/** What the combiner needs to know about the item (or the variety) itself (P14). */
export interface ItemTraits {
  /** Arrives from abroad eating well, without being picked underripe to survive the trip. */
  shipsWell: boolean;
  /** Eats well for months out of commercial storage, so months away from harvest read Good, never Peak. */
  storesWell: boolean;
}

type Trait = { value: boolean };

/** A target's traits from the item file: a variety's own `storesWell` overrides its item's. */
export function traitsFor(
  item: {
    shipsWell: Trait;
    storesWell: Trait;
    varieties: readonly { id: string; storesWell?: Trait | undefined }[];
  },
  target: Target,
): ItemTraits {
  const variety = "variety" in target ? item.varieties.find((v) => v.id === target.variety) : undefined;
  return { shipsWell: item.shipsWell.value, storesWell: (variety?.storesWell ?? item.storesWell).value };
}

/** A claim about a country other than the US. */
export const isImport = (origin: string): boolean => origin !== "us" && !origin.startsWith("us-");

/** Whose curve: one origin of the item (`us-wa`, `mx`), or one variety. */
export type Target = { origin: string } | { variety: string };

export interface ClaimCurve {
  source: string;
  weight: number;
  /** Indexed by window 0–23; null where the claim says nothing (never 0). */
  values: (number | null)[];
}

export interface WindowProposal {
  value: number;
  rating: Rating;
  confidence: Confidence;
  /** Total weight of the counted curves. */
  weight: number;
  /** Weighted standard deviation of the counted values. */
  spread: number;
  /** Independent sources counted, each named by the source the others restate. */
  sources: string[];
}

export interface Proposal {
  /** Indexed by window 0–23; null where no curve covers the window. */
  windows: (WindowProposal | null)[];
  /** The curves that apply to the target, for the content report. */
  curves: ClaimCurve[];
}

export const claimWeight = (tier: Source["tier"], directness: Claim["directness"]): number =>
  P12.tier[tier] * P12.directness[directness];

export function sourceConfidence(weight: number): Confidence {
  if (weight >= P12.sourceConfidence.high - EPS) return "high";
  if (weight >= P12.sourceConfidence.medium - EPS) return "medium";
  return "low";
}

export function ratingForValue(value: number): Rating {
  if (value >= P12.rating.prime - EPS) return "prime";
  if (value <= P12.rating.poor + EPS) return "poor";
  return "fair";
}

/**
 * A claim's values by window.
 *
 * An `availability` claim (a harvest chart, an in-season list) speaks for the whole year (P14): the windows it
 * lists keep their rating, the window either side of each listed range reads fair (never above the edge it
 * touches, never over a listed window), and every other window reads poor, or fair for an item that stores
 * well. A US-grown claim naming no state keeps only its listed windows and shoulders: it can't say when each
 * state is out of season. An import's availability curve sits one level lower, so its own season reads fair; for an item that
 * doesn't ship well every window reads poor. Eating-quality claims, imports included, are read as written.
 * With `offSeason` false, an availability claim keeps only its own season: listed windows and shoulders.
 *
 * Otherwise windows the claim doesn't rate have no value. A `season` claim gets a soft shoulder one window
 * beyond each end of each rated range, at half the edge value; shoulders never override a window the claim
 * rates, and where two meet the higher one stands. `half-month` and `month` claims keep sharp edges.
 */
export function claimValues(
  claim: Pick<Claim, "windows" | "specificity" | "directness" | "origin">,
  item: ItemTraits,
  offSeason = true,
): (number | null)[] {
  const values: (number | null)[] = Array(WINDOW_COUNT).fill(null);
  const ranges = claim.windows.map((w) => ({ range: windowRange(w.from, w.to), value: P12.value[w.rating] }));
  for (const { range, value } of ranges) for (const i of range) values[i] = value;
  if (claim.directness === "availability")
    return availabilityValues(values, ranges, claim.origin, item, offSeason);
  if (claim.specificity !== "season") return values;
  const shoulders: (number | null)[] = Array(WINDOW_COUNT).fill(null);
  for (const { range, value } of ranges) {
    if (range.length >= WINDOW_COUNT) continue;
    const first = range[0] as number;
    const last = range[range.length - 1] as number;
    for (const i of [(first + WINDOW_COUNT - 1) % WINDOW_COUNT, (last + 1) % WINDOW_COUNT]) {
      if (values[i] === null) shoulders[i] = Math.max(shoulders[i] ?? 0, value / 2);
    }
  }
  return values.map((v, i) => v ?? shoulders[i] ?? null);
}

function availabilityValues(
  listed: (number | null)[],
  ranges: { range: number[]; value: number }[],
  origin: string,
  item: ItemTraits,
  readOffSeason: boolean,
): (number | null)[] {
  const imported = isImport(origin);
  // A claim naming no state can't say when every state's season is: it keeps only its listed season.
  const national = origin === "us";
  const offSeason = national || !readOffSeason ? null : item.storesWell ? P12.value.fair : P12.value.poor;
  const shoulders: (number | null)[] = Array(WINDOW_COUNT).fill(null);
  for (const { range, value } of ranges) {
    if (range.length >= WINDOW_COUNT) continue;
    const first = range[0] as number;
    const last = range[range.length - 1] as number;
    for (let k = 1; k <= P12.availabilityShoulder; k++) {
      for (const i of [(first - k + WINDOW_COUNT) % WINDOW_COUNT, (last + k) % WINDOW_COUNT]) {
        if (listed[i] === null) shoulders[i] = Math.max(shoulders[i] ?? 0, Math.min(P12.value.fair, value));
      }
    }
  }
  const step = P12.value.prime - P12.value.fair;
  // Stored domestic fruit is on sale outside an import's season, so a stores-well import speaks only for its listing.
  if (imported && item.shipsWell && item.storesWell)
    return listed.map((v) => (v === null ? null : Math.max(P12.value.poor, v - step)));
  return listed.map((v, i) => {
    if (v === null && shoulders[i] === null && offSeason === null) return null;
    if (imported && !item.shipsWell) return P12.value.poor;
    const value = v ?? Math.max(offSeason ?? P12.value.poor, shoulders[i] ?? P12.value.poor);
    return imported ? Math.max(P12.value.poor, value - step) : value;
  });
}

/** The source a restatement traces back to; sources sharing a root count once. */
function rootOf(id: string, sources: ReadonlyMap<string, EvidenceSource>): string {
  const seen = new Set<string>();
  let at = id;
  for (;;) {
    const next = sources.get(at)?.basedOn;
    if (next === undefined || seen.has(next)) return at;
    seen.add(at);
    at = next;
  }
}

/**
 * Which claims speak for a target. An origin takes its own claims without a variety, plus, for a US state,
 * US-grown (`us`) claims from sources that make no claim for that state (a restatement counts as the source it
 * restates, via `root`). A variety takes every claim naming it.
 */
export function claimsFor<C extends Claim>(
  claims: readonly C[],
  target: Target,
  root: (source: string) => string = (s) => s,
): C[] {
  if ("variety" in target) return claims.filter((c) => c.variety === target.variety);
  const plain = claims.filter((c) => c.variety === undefined);
  const own = plain.filter((c) => c.origin === target.origin);
  if (!target.origin.startsWith("us-")) return own;
  const specific = new Set(own.map((c) => root(c.source)));
  return [...own, ...plain.filter((c) => c.origin === "us" && !specific.has(root(c.source)))];
}

/**
 * Each claim's values for a target. A variety's claims span origins, so one origin's chart doesn't speak for
 * another's season (P14): an availability claim's off-season reading is dropped in any window that a claim for
 * the variety from another origin covers with its own season (listed windows and shoulders). A US claim naming no
 * state (`us`) is no other origin than any state's.
 */
export const otherOrigin = (a: string, b: string): boolean =>
  a !== b && !(a === "us" && b.startsWith("us-")) && !(b === "us" && a.startsWith("us-"));

function targetValues(claims: readonly Claim[], target: Target, item: ItemTraits): (number | null)[][] {
  const values = claims.map((c) => claimValues(c, item));
  if (!("variety" in target)) return values;
  const seasons = claims.map((c) => claimValues(c, item, false));
  return values.map((v, j) =>
    v.map((x, i) =>
      x !== null &&
      seasons[j]?.[i] === null &&
      claims.some((o, k) => otherOrigin(o.origin, claims[j]?.origin ?? "") && seasons[k]?.[i] !== null)
        ? null
        : x,
    ),
  );
}

/** One run's range for a target: from, to, rating and the run's confidence in it. */
export type PanelRange = readonly [string, string, Rating, Confidence];

/**
 * The panel's curve for one target (P15): per window, the mean of the counted runs that rate it, leaving out
 * low-confidence ranges. Null where no run rates the window, or where runs differ by more than one level.
 */
export function panelValues(runs: readonly (readonly PanelRange[])[]): (number | null)[] {
  const byWindow: number[][] = Array.from({ length: WINDOW_COUNT }, () => []);
  for (const ranges of runs)
    for (const [from, to, rating, confidence] of ranges)
      if (confidence !== "low") for (const i of windowRange(from, to)) byWindow[i]?.push(P12.value[rating]);
  return byWindow.map((vs) =>
    vs.length === 0 || Math.max(...vs) - Math.min(...vs) > P15.maxGap + EPS
      ? null
      : vs.reduce((a, b) => a + b, 0) / vs.length,
  );
}

export function panelFor(
  curves: readonly PanelCurve[],
  item: string,
  target: Target,
): (number | null)[] | null {
  const found = curves.find(
    (c) =>
      c.item === item && ("variety" in target ? c.variety === target.variety : c.origin === target.origin),
  );
  return found?.values ?? null;
}

/**
 * Proposes a rating and confidence per window from the target's claims and, where given, the model panel's
 * curve (P15). The panel never rates a window alone: with no cited curve there is no proposal. Its value always
 * joins the weighted mean, but it counts toward the independent sources only where its rating matches a cited
 * source's there, a window resting on it and one cited source is Medium at most, and it never supplies the
 * authoritative or eating-quality conditions for High.
 */
export function propose(
  claims: readonly Claim[],
  sources: ReadonlyMap<string, EvidenceSource>,
  target: Target,
  item: ItemTraits,
  panel: readonly (number | null)[] | null = null,
): Proposal {
  const own = claimsFor(claims, target, (s) => rootOf(s, sources));
  const values = targetValues(own, target, item);
  const curves: (ClaimCurve & { root: string; authoritative: boolean; taste: boolean })[] = own.map(
    (c, j) => {
      const source = sources.get(c.source);
      if (source === undefined) throw new Error(`unknown source ${c.source}`);
      return {
        source: c.source,
        weight: claimWeight(source.tier, c.directness),
        values: values[j] as (number | null)[],
        root: rootOf(c.source, sources),
        authoritative: source.tier === "authoritative",
        taste: c.directness === "eating-quality",
      };
    },
  );

  const windows = Array.from({ length: WINDOW_COUNT }, (_, i): WindowProposal | null => {
    // Per independent source, keep its highest-weight curve here; equal-weight curves average.
    const kept = new Map<
      string,
      { weight: number; values: number[]; authoritative: boolean; taste: boolean }
    >();
    for (const c of curves) {
      const v = c.values[i];
      if (v === null || v === undefined) continue;
      const k = kept.get(c.root);
      if (k === undefined || c.weight > k.weight + EPS) {
        kept.set(c.root, { weight: c.weight, values: [v], authoritative: c.authoritative, taste: c.taste });
      } else if (Math.abs(c.weight - k.weight) <= EPS) {
        k.values.push(v);
        k.authoritative ||= c.authoritative;
        k.taste ||= c.taste;
      }
    }
    if (kept.size === 0) return null;
    const cited = [...kept.values()].map((k) => ({
      weight: k.weight,
      value: k.values.reduce((a, b) => a + b, 0) / k.values.length,
    }));
    const p = panel?.[i] ?? null;
    const counted = p === null ? cited : [...cited, { weight: P15.weight, value: p }];
    const agrees = p !== null && cited.some((c) => ratingForValue(c.value) === ratingForValue(p));
    const weight = counted.reduce((a, c) => a + c.weight, 0);
    const value = counted.reduce((a, c) => a + c.weight * c.value, 0) / weight;
    const spread = Math.sqrt(counted.reduce((a, c) => a + c.weight * (c.value - value) ** 2, 0) / weight);
    const authoritative = [...kept.values()].some((k) => k.authoritative);
    const taste = [...kept.values()].some((k) => k.taste);
    const confidence = combinedConfidence(kept.size + (agrees ? 1 : 0), weight, spread, authoritative, taste);
    return {
      value,
      rating: ratingForValue(value),
      confidence: kept.size < P12.combined.minSources && confidence === "high" ? "medium" : confidence,
      weight,
      spread,
      sources: [...[...kept.keys()].sort(), ...(agrees ? [PANEL] : [])],
    };
  });

  return { windows, curves: curves.map(({ source, weight, values }) => ({ source, weight, values })) };
}

export function combinedConfidence(
  independent: number,
  weight: number,
  spread: number,
  authoritative: boolean,
  /** An eating-quality claim is among the counted curves: availability alone never reaches High. */
  taste: boolean,
): Confidence {
  const c = P12.combined;
  if (independent < c.minSources || spread > c.lowSpread + EPS) return "low";
  if (weight >= c.highWeight - EPS && spread <= c.highSpread + EPS && authoritative && taste) return "high";
  return "medium";
}

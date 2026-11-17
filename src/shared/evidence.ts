// Seasonal evidence combined as quality curves (engineering plan §4.3, P12). Pure: no I/O.
// Each claim becomes a curve over the 24 half-month windows; the curves covering a window combine into a
// proposed rating with a confidence. The editorial windows in item files are the call; this is the evidence.
import type { EvidenceClaim, Source } from "./data/schema";
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
} as const;

/** Weights are sums of products like 0.6 × 2; compare with a little tolerance. */
const EPS = 1e-9;

export type EvidenceSource = Pick<Source, "id" | "tier" | "basedOn">;
export type Claim = Pick<
  EvidenceClaim,
  "source" | "origin" | "variety" | "windows" | "specificity" | "directness"
>;

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
 * A claim's values by window. A `season` claim gets a soft shoulder one window beyond each end of each rated
 * range, at half the edge value; shoulders never override a window the claim rates, and where two meet the
 * higher one stands. `half-month` and `month` claims keep sharp edges.
 */
export function claimValues(claim: Pick<Claim, "windows" | "specificity">): (number | null)[] {
  const values: (number | null)[] = Array(WINDOW_COUNT).fill(null);
  const ranges = claim.windows.map((w) => ({ range: windowRange(w.from, w.to), value: P12.value[w.rating] }));
  for (const { range, value } of ranges) for (const i of range) values[i] = value;
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

export function propose(
  claims: readonly Claim[],
  sources: ReadonlyMap<string, EvidenceSource>,
  target: Target,
): Proposal {
  const curves: (ClaimCurve & { root: string; authoritative: boolean })[] = claimsFor(claims, target, (s) =>
    rootOf(s, sources),
  ).map((c) => {
    const source = sources.get(c.source);
    if (source === undefined) throw new Error(`unknown source ${c.source}`);
    return {
      source: c.source,
      weight: claimWeight(source.tier, c.directness),
      values: claimValues(c),
      root: rootOf(c.source, sources),
      authoritative: source.tier === "authoritative",
    };
  });

  const windows = Array.from({ length: WINDOW_COUNT }, (_, i): WindowProposal | null => {
    // Per independent source, keep its highest-weight curve here; equal-weight curves average.
    const kept = new Map<string, { weight: number; values: number[]; authoritative: boolean }>();
    for (const c of curves) {
      const v = c.values[i];
      if (v === null || v === undefined) continue;
      const k = kept.get(c.root);
      if (k === undefined || c.weight > k.weight + EPS) {
        kept.set(c.root, { weight: c.weight, values: [v], authoritative: c.authoritative });
      } else if (Math.abs(c.weight - k.weight) <= EPS) {
        k.values.push(v);
        k.authoritative ||= c.authoritative;
      }
    }
    if (kept.size === 0) return null;
    const counted = [...kept.values()].map((k) => ({
      weight: k.weight,
      value: k.values.reduce((a, b) => a + b, 0) / k.values.length,
    }));
    const weight = counted.reduce((a, c) => a + c.weight, 0);
    const value = counted.reduce((a, c) => a + c.weight * c.value, 0) / weight;
    const spread = Math.sqrt(counted.reduce((a, c) => a + c.weight * (c.value - value) ** 2, 0) / weight);
    const authoritative = [...kept.values()].some((k) => k.authoritative);
    return {
      value,
      rating: ratingForValue(value),
      confidence: combinedConfidence(kept.size, weight, spread, authoritative),
      weight,
      spread,
      sources: [...kept.keys()].sort(),
    };
  });

  return { windows, curves: curves.map(({ source, weight, values }) => ({ source, weight, values })) };
}

export function combinedConfidence(
  independent: number,
  weight: number,
  spread: number,
  authoritative: boolean,
): Confidence {
  const c = P12.combined;
  if (independent < c.minSources || spread > c.lowSpread + EPS) return "low";
  if (weight >= c.highWeight - EPS && spread <= c.highSpread + EPS && authoritative) return "high";
  return "medium";
}

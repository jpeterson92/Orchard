// Pure helpers for `npm run content:report`: the per-item verdict strip and the surprises an editor should look
// at before trusting a batch (engineering plan §4.1, editorial review).
import type { QualityWindow } from "../src/shared/data/schema";
import { ratingForValue, type WindowProposal } from "../src/shared/evidence";
import { WINDOW_COUNT, windowLabel, windowRange } from "../src/shared/time";
import type { Confidence, Rating, Verdict } from "../src/shared/verdict";

const MARK: Record<Verdict, string> = { peak: "P", good: "G", skip: "S", limited: "·" };

export const STRIP_HEADER = "Ja Fe Mr Ap My Jn Jl Au Se Oc No De";

const RATING_MARK: Record<Rating, string> = { prime: "+", fair: "~", poor: "-" };
const CONFIDENCE_MARK: Record<Confidence, string> = { high: "H", medium: "M", low: "L" };
const NONE = ".";

export const SERIES_LEGEND = "+ prime, ~ fair, - poor, . none; confidence H/M/L";

/** 24 marks grouped by month: "PP PG GG …". */
const strip = (marks: readonly string[]): string =>
  Array.from({ length: 12 }, (_, m) => `${marks[m * 2]}${marks[m * 2 + 1]}`).join(" ");

/** 24 windows as "PP PG GG …": one mark per half-month, a space between months. */
export function verdictStrip(outlook: readonly Verdict[]): string {
  return strip(outlook.map((v) => MARK[v]));
}

/** An editorial rating, a proposal's rating or a curve's value per window, as "++ ~~ -- ..". */
export function ratingStrip(windows: readonly (Rating | number | null)[]): string {
  return strip(
    windows.map((w) => (w === null ? NONE : RATING_MARK[typeof w === "number" ? ratingForValue(w) : w])),
  );
}

export function confidenceStrip(windows: readonly (Pick<WindowProposal, "confidence"> | null)[]): string {
  return strip(windows.map((w) => (w === null ? NONE : CONFIDENCE_MARK[w.confidence])));
}

/** An origin's or variety's editorial windows, spread over the 24 windows. */
export function editorialSeries(windows: readonly QualityWindow[]): {
  ratings: (Rating | null)[];
  reasons: (string | null)[];
} {
  const ratings: (Rating | null)[] = Array(WINDOW_COUNT).fill(null);
  const reasons: (string | null)[] = Array(WINDOW_COUNT).fill(null);
  for (const w of windows)
    for (const i of windowRange(w.from, w.to)) {
      ratings[i] = w.rating;
      reasons[i] = w.reason ?? null;
    }
  return { ratings, reasons };
}

/**
 * The rated windows an editor checks first: where the rating departs from the evidence proposal, or the proposal
 * is Low confidence. Consecutive windows with the same finding share one line.
 */
export function reviewFirst(
  editorial: ReturnType<typeof editorialSeries>,
  proposal: readonly (Pick<WindowProposal, "rating" | "confidence"> | null)[],
): string[] {
  const finding = (i: number): string | null => {
    const rating = editorial.ratings[i];
    if (rating === null || rating === undefined) return null;
    const p = proposal[i] ?? null;
    const departs = p === null || p.rating !== rating;
    if (!departs && p.confidence !== "low") return null;
    const evidence = p === null ? "no evidence" : `evidence ${p.rating}, ${p.confidence} confidence`;
    const reason = editorial.reasons[i];
    return `${departs ? "departs" : "low"}: rated ${rating}, ${evidence}; ${reason === null ? "no reason given" : `reason: ${reason}`}`;
  };
  const out: string[] = [];
  let start = 0;
  for (let i = 1; i <= WINDOW_COUNT; i++) {
    const f = finding(start);
    if (i < WINDOW_COUNT && finding(i) === f) continue;
    if (f !== null) {
      const span = i - 1 === start ? windowLabel(start) : `${windowLabel(start)}..${windowLabel(i - 1)}`;
      out.push(`${span} ${f}`);
    }
    start = i;
  }
  return out;
}

/** Windows where some typical origin has no rating, which makes the item Limited evidence there (P1). */
export function unratedTypical(
  typicalOrigins: readonly (readonly string[])[],
  origins: Readonly<Record<string, { windows: readonly (Rating | null)[] }>>,
): number {
  let n = 0;
  for (let i = 0; i < WINDOW_COUNT; i++)
    if ((typicalOrigins[Math.floor(i / 2)] ?? []).some((o) => (origins[o]?.windows[i] ?? null) === null)) n++;
  return n;
}

/** Windows a rated variety is in stores (P13) without a rating, which make it Limited evidence there. */
export function unratedInStore(windows: readonly (Rating | null)[], inStore: readonly boolean[]): number {
  return windows.filter((w, i) => w === null && inStore[Math.floor(i / 2)]).length;
}

/** A Peak lasting more than this many windows reads as a steady item, not a reason to buy now. */
export const LONG_PEAK_WINDOWS = 16;

export interface SurpriseInputs {
  outlook: readonly Verdict[];
  /** Per window: the evidence proposal for the origin deciding that window, or null with none (or no decider). */
  deciderProposal: readonly (Pick<WindowProposal, "rating"> | null)[];
  peakWorthSeeking: boolean;
}

/** Verdicts that disagree with their own evidence, or traits that disagree with the outlook. */
export function surprises(s: SurpriseInputs): string[] {
  const out: string[] = [];
  const runs = (pick: (i: number) => boolean) => {
    const hit: string[] = [];
    for (let i = 0; i < WINDOW_COUNT; i++) if (pick(i)) hit.push(windowLabel(i));
    return hit;
  };
  const peakOffEvidence = runs((i) => s.outlook[i] === "peak" && s.deciderProposal[i]?.rating !== "prime");
  if (peakOffEvidence.length > 0)
    out.push(`Peak where the deciding origin's evidence isn't prime: ${peakOffEvidence.join(", ")}`);
  const skipOnPrime = runs((i) => s.outlook[i] === "skip" && s.deciderProposal[i]?.rating === "prime");
  if (skipOnPrime.length > 0)
    out.push(`Skip where the deciding origin's evidence is prime: ${skipOnPrime.join(", ")}`);
  const peaks = s.outlook.filter((v) => v === "peak").length;
  if (peaks > LONG_PEAK_WINDOWS)
    out.push(`Peak in ${peaks} of 24 windows: is the Peak worth seeking, or is it a steady Good?`);
  if (s.peakWorthSeeking && peaks === 0) out.push("Peak worth seeking, but never Peak in the typical year");
  return out;
}

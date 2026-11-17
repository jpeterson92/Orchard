// Pure helpers for `npm run content:report`: the per-item verdict strip and the surprises an editor should look
// at before trusting a batch (engineering plan §4.1, editorial review).
import type { WindowProposal } from "../src/shared/evidence";
import { WINDOW_COUNT, windowLabel } from "../src/shared/time";
import type { Verdict } from "../src/shared/verdict";

const MARK: Record<Verdict, string> = { peak: "P", good: "G", skip: "S", limited: "·" };

export const STRIP_HEADER = "Ja Fe Mr Ap My Jn Jl Au Se Oc No De";

/** 24 windows as "PP PG GG …": one mark per half-month, a space between months. */
export function verdictStrip(outlook: readonly Verdict[]): string {
  const marks = outlook.map((v) => MARK[v]);
  return Array.from({ length: 12 }, (_, m) => `${marks[m * 2]}${marks[m * 2 + 1]}`).join(" ");
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

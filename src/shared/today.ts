// Today grouping (product spec §5 "Today", engineering plan §4.2). One pure function.
import { type Confidence, confidenceRank, type Verdict, verdictRank } from "./verdict";

export const BEST_NOW_MAX = 6;

export interface TodayEntry {
  id: string;
  purchaseRank: number;
  alwaysGood: boolean;
  /** The Reliable year-round marker: Good or better most of the year, so Good now is no news. */
  reliableYearRound: boolean;
  verdict: Verdict;
  confidence: Confidence;
  /** Peak windows in the item's typical outlook over the year: a shorter Peak is more worth buying now. */
  peakWindows: number;
}

export interface TodayGroups {
  best: string[];
  good: string[];
}

/** Today lists only what a shopper should consider buying: Peak items, and Good items that are seasonal (neither
 * Always good nor Reliable year-round). Skip and Limited evidence stay off it. */
export const onToday = (e: TodayEntry): boolean =>
  !e.alwaysGood && (e.verdict === "peak" || (e.verdict === "good" && !e.reliableYearRound));

/**
 * Best right now: up to 6 Peak items, the shortest Peak in the year first, then by confidence and purchase rank;
 * never padded. Good buys: every other Peak item in that order, then Good items by confidence and purchase rank.
 */
export function groupToday(entries: readonly TodayEntry[]): TodayGroups {
  const shown = entries
    .filter(onToday)
    .sort(
      (a, b) =>
        verdictRank(b.verdict) - verdictRank(a.verdict) ||
        (a.verdict === "peak" ? a.peakWindows - b.peakWindows : 0) ||
        confidenceRank(b.confidence) - confidenceRank(a.confidence) ||
        a.purchaseRank - b.purchaseRank ||
        a.id.localeCompare(b.id),
    );
  const peak = shown.filter((e) => e.verdict === "peak");
  return {
    best: peak.slice(0, BEST_NOW_MAX).map((e) => e.id),
    good: [...peak.slice(BEST_NOW_MAX), ...shown.filter((e) => e.verdict === "good")].map((e) => e.id),
  };
}

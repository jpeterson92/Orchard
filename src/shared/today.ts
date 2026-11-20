// Today grouping (product spec §5 "Today", engineering plan §4.2). One pure function.
import { type Confidence, confidenceRank, type Verdict } from "./verdict";

export interface TodayEntry {
  id: string;
  purchaseRank: number;
  alwaysGood: boolean;
  /** The Reliable year-round marker: Good or better most of the year, so Good now is no news. */
  reliableYearRound: boolean;
  verdict: Verdict;
  confidence: Confidence;
  /** Peak windows in the item's typical outlook over the year. */
  peakWindows: number;
  /** Peak windows left in the current Peak run, this one included (0 when not Peak): it won't last. */
  peakLeft: number;
}

export interface TodayGroups {
  best: string[];
  good: string[];
}

/** The seasonal lists take Peak items and Good items whose recommendation is seasonal. */
export const onToday = (e: TodayEntry): boolean =>
  !e.alwaysGood && (e.verdict === "peak" || (e.verdict === "good" && !e.reliableYearRound));

const byConfidenceThenRank = (a: TodayEntry, b: TodayEntry) =>
  confidenceRank(b.confidence) - confidenceRank(a.confidence) ||
  a.purchaseRank - b.purchaseRank ||
  a.id.localeCompare(b.id);

/**
 * Best right now: every Peak item, the one ending soonest first (fewest Peak windows left, then the shortest Peak
 * season), then by confidence and purchase rank. Good buys: the Good items by confidence and purchase rank.
 */
export function groupToday(entries: readonly TodayEntry[]): TodayGroups {
  const shown = entries.filter(onToday);
  const best = shown
    .filter((e) => e.verdict === "peak")
    .sort((a, b) => a.peakLeft - b.peakLeft || a.peakWindows - b.peakWindows || byConfidenceThenRank(a, b));
  const good = shown.filter((e) => e.verdict === "good").sort(byConfidenceThenRank);
  return { best: best.map((e) => e.id), good: good.map((e) => e.id) };
}

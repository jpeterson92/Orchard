// Today grouping (product spec §5 "Today", engineering plan §4.2). One pure function.
import { type Confidence, confidenceRank, type Verdict, verdictRank } from "./verdict";

export const BEST_NOW_MAX = 6;

export interface TodayEntry {
  id: string;
  purchaseRank: number;
  alwaysGood: boolean;
  verdict: Verdict;
  confidence: Confidence;
  /** The typical-outlook verdict for the same date: an always-good item joins Today only when they differ. */
  typicalVerdict: Verdict;
}

export interface TodayGroups {
  best: string[];
  good: string[];
  skip: string[];
  limited: string[];
}

/**
 * Best right now: up to 6 Peak items by confidence, then purchase rank, never padded.
 * Good buys: every other Peak and Good item, Peak first. Skip and Limited evidence by purchase rank.
 */
export function groupToday(entries: readonly TodayEntry[]): TodayGroups {
  const shown = entries
    .filter((e) => !e.alwaysGood || e.verdict !== e.typicalVerdict)
    .sort(
      (a, b) =>
        verdictRank(b.verdict) - verdictRank(a.verdict) ||
        confidenceRank(b.confidence) - confidenceRank(a.confidence) ||
        a.purchaseRank - b.purchaseRank ||
        a.id.localeCompare(b.id),
    );
  const peak = shown.filter((e) => e.verdict === "peak");
  const best = peak.slice(0, BEST_NOW_MAX);
  const byRank = (list: TodayEntry[]) =>
    [...list].sort((a, b) => a.purchaseRank - b.purchaseRank || a.id.localeCompare(b.id)).map((e) => e.id);
  return {
    best: best.map((e) => e.id),
    good: [...peak.slice(BEST_NOW_MAX), ...shown.filter((e) => e.verdict === "good")].map((e) => e.id),
    skip: byRank(shown.filter((e) => e.verdict === "skip")),
    limited: byRank(shown.filter((e) => e.verdict === "limited")),
  };
}

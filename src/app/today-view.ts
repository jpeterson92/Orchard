// Today's cards for a date: runs the engine over the bundled items and groups them (product spec §5 "Today").
import type { AppData, AppItem, FilterGroup } from "../shared/app-data";
import { windowIndex, windowLabel } from "../shared/time";
import { groupToday, type TodayEntry } from "../shared/today";
import {
  evaluate,
  type Marker,
  type PlainDate,
  type Reason,
  typicalOutlook,
  type Verdict,
  type VerdictResult,
} from "../shared/verdict";
import { type AlwaysGoodRow, alwaysGoodRow } from "./always-good";

export const VERDICT_WORD: Record<Verdict, string> = {
  peak: "Peak",
  good: "Good",
  skip: "Skip for now",
  limited: "Not rated",
};

export interface Card {
  id: string;
  name: string;
  /** Thumbnail asset id, or null for the placeholder. */
  art: string | null;
  /** What to pick, when the verdict holds for only part of the bin: the varieties ("Honeycrisp and Gala"), the
   * origins ("Look for ones from California") or the selection ("Look for local field-grown"). */
  varietyLine: string | null;
  verdict: Verdict;
  /** One short factual reason, or null when it would only repeat the section ("At its best this time of year"). */
  reason: string | null;
  tags: string[];
  group: FilterGroup;
  /** Expanded card: what to avoid when the shopper picks by the label ("Brussels sprouts from Mexico often
   * disappoint now."), the pick cue and the typical storage range (product spec §5 "Card behavior"). */
  avoid: string | null;
  pick: string;
  storage: string;
}

export interface TodayView {
  /** The window's one-line summary (product spec §5), or null where none is written. */
  summary: string | null;
  /** The half-month the summary is for: "late November". */
  period: string;
  best: Card[];
  good: Card[];
  alwaysGood: AlwaysGoodRow[];
}

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "early December" or "late December" for a half-month window. */
export function windowPhrase(window: number): string {
  const [, half] = windowLabel(window).split("-");
  return `${half === "1" ? "early" : "late"} ${MONTHS[Math.floor(window / 2)]}`;
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export function originName(origin: string, data: AppData): string {
  return data.stateNames[origin] ?? regionNames.of(origin.toUpperCase()) ?? origin;
}

const PLACE: Record<AppItem["store"]["temperature"], string> = {
  cold: "in the fridge",
  cool: "somewhere cool",
  room: "at room temperature",
};

/** "Typically keeps 2–3 days in the fridge." A range, never a guarantee (product spec §8). */
export function storageLine(store: AppItem["store"]): string {
  const { min, max, unit } = store.life;
  const span = min === max ? `${min}` : `${min}–${max}`;
  const u = max === 1 ? unit.slice(0, -1) : unit;
  return `Typically keeps ${span} ${u} ${PLACE[store.temperature]}.`;
}

const LIMITED_REASONS: Partial<Record<Reason["code"], string>> = {
  "no-typical-origins": "Rarely in stores now.",
  "origin-unrated": "Supply now is mostly from origins we haven't assessed.",
  "no-variety-in-stores": "None of its rated varieties is usually in stores now.",
  "variety-unrated": "The varieties in stores now aren't rated yet.",
};

/** The reasons that say no more than the verdict itself. */
export const GENERIC_REASON = {
  peak: "At its best this time of year.",
  good: "Eating well this time of year.",
};
const isGeneric = (text: string) => text === GENERIC_REASON.peak || text === GENERIC_REASON.good;

/** Copy is written for today; for a planning date "now" becomes "then", so it never reads as a current assessment. */
export const atDate = (text: string, mode: "today" | "typical"): string =>
  mode === "typical" ? text.replace(/\bnow\b/g, "then") : text;

export function reasonText(verdict: Verdict, reasons: readonly Reason[], markers: readonly Marker[]): string {
  const lastCall = markers.find((m) => m.kind === "last-call");
  if (lastCall && (verdict === "peak" || verdict === "good"))
    return `Fades by ${windowPhrase(lastCall.fadesBy)}.`;
  if (verdict === "peak") return GENERIC_REASON.peak;
  if (verdict === "good") return GENERIC_REASON.good;
  if (verdict === "skip") {
    const improves = markers.find((m) => m.kind === "improves");
    if (reasons.some((r) => r.code === "out-of-season"))
      return improves ? `Usually back in ${windowPhrase(improves.window)}.` : "Out of season now.";
    return improves ? `Usually improves in ${windowPhrase(improves.window)}.` : "Not at its best now.";
  }
  for (const r of reasons) {
    const text = LIMITED_REASONS[r.code];
    if (text) return text;
  }
  return "No rating for this time of year.";
}

/** "California", "California and Mexico", "California, Georgia and Mexico". */
export function listNames(names: readonly string[]): string {
  return names.length < 2 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/** The most varieties a card names; more read "Honeycrisp, Gala, Fuji and 2 more". */
const MAX_NAMED = 4;

/** The card's second line: what to pick. The selection (P16), the origins to look for by the label (P20), or the
 * varieties holding the verdict (P13). */
export function varietyLine(
  item: AppItem,
  { varietyLine: ids, reasons, selection }: Pick<VerdictResult, "varietyLine" | "reasons" | "selection">,
  data: AppData,
  { rankByOverall = false } = {},
): string | null {
  const s = item.selections.find((x) => x.id === selection);
  if (s) return `Look for ${s.label}`;
  const look = reasons.find((r) => r.code === "look-for");
  if (look?.code === "look-for")
    return `Look for ones from ${listNames(look.origins.map((o) => originName(o, data)))}`;
  if (!ids || ids.length === 0) return null;
  const varieties = ids.map((id) => {
    const variety = item.varieties.find((v) => v.id === id);
    return { name: variety?.name ?? id, score: variety?.overall?.score ?? -1 };
  });
  if (rankByOverall) varieties.sort((a, b) => b.score - a.score);
  const names = varieties.map((v) => v.name);
  if (names.length <= MAX_NAMED) return listNames(names);
  return `${names.slice(0, MAX_NAMED - 1).join(", ")} and ${names.length - MAX_NAMED + 1} more`;
}

/** The expanded card's warning, when the shopper picks by the label and a typical origin often disappoints now. */
export function avoidLine(
  item: AppItem,
  { reasons, labelNote }: Pick<VerdictResult, "reasons" | "labelNote">,
  data: AppData,
): string | null {
  const poor = reasons.find((r) => r.code === "typical-origin-poor");
  if (!labelNote || poor?.code !== "typical-origin-poor") return null;
  return `${item.name} from ${originName(poor.origin, data)} often disappoint now.`;
}

/** `today`: Today's cards leave out Reliable year-round, since only such an item's Peak reaches Today. Check the
 * label is never a tag: the second line says what to look for. */
export function tags(
  item: AppItem,
  markers: readonly Marker[],
  { today = false, alwaysGood = item.inputs.alwaysGood } = {},
): string[] {
  const out: string[] = [];
  if (alwaysGood) out.push("Always good");
  for (const m of markers) {
    if (m.kind === "last-call") out.push("Last call");
    else if (m.kind === "reliable-year-round" && !alwaysGood && !today) out.push("Reliable year-round");
  }
  return out;
}

/** `mode: "typical"` for a planning date: the wording says "then" where it would say "now". */
export function todayView(data: AppData, date: PlainDate, mode: "today" | "typical" = "today"): TodayView {
  const window = windowIndex(date.month, date.day);
  const cards = new Map<string, Card>();
  const staples: AlwaysGoodRow[] = [];
  const entries: TodayEntry[] = data.items.map((item) => {
    const result = evaluate(item.inputs, { date }, data.env);
    const outlook = typicalOutlook(item.inputs, data.env, date.year);
    const staple = alwaysGoodRow(item, data.env, date.year, outlook);
    if (staple) staples.push(staple);
    let peakLeft = 0;
    while (peakLeft < outlook.length && outlook[(window + peakLeft) % outlook.length] === "peak") peakLeft++;
    const reason = reasonText(result.verdict, result.reasons, result.markers);
    cards.set(item.inputs.id, {
      id: item.inputs.id,
      name: item.name,
      art: item.art,
      varietyLine: varietyLine(item, result, data, { rankByOverall: true }),
      verdict: result.verdict,
      reason: isGeneric(reason) ? null : atDate(reason, mode),
      tags: tags(item, result.markers, { today: true, alwaysGood: false }),
      group: item.group,
      avoid: (() => {
        const a = avoidLine(item, result, data);
        return a === null ? null : atDate(a, mode);
      })(),
      pick: item.cardLine,
      storage: storageLine(item.store),
    });
    return {
      id: item.inputs.id,
      purchaseRank: item.purchaseRank,
      alwaysGood: staple?.listing === "whole" && result.verdict === "good",
      reliableYearRound: result.markers.some((m) => m.kind === "reliable-year-round"),
      verdict: result.verdict,
      confidence: result.confidence,
      peakWindows: outlook.filter((v) => v === "peak").length,
      peakLeft,
    };
  });
  const groups = groupToday(entries);
  const pick = (ids: string[]) => ids.flatMap((id) => cards.get(id) ?? []);
  return {
    summary: data.summaries[window] || null,
    period: windowPhrase(window),
    best: pick(groups.best),
    good: pick(groups.good),
    alwaysGood: staples.sort((a, b) => a.name.localeCompare(b.name, "en")),
  };
}

/** A YYYY-MM-DD string as a plain date. */
export function plainDate(iso: string): PlainDate {
  const [year, month, day] = iso.split("-").map(Number);
  return { year: year ?? 1970, month: month ?? 1, day: day ?? 1 };
}

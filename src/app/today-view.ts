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
} from "../shared/verdict";

export const VERDICT_WORD: Record<Verdict, string> = {
  peak: "Peak",
  good: "Good",
  skip: "Skip for now",
  limited: "Limited evidence",
};

export interface Card {
  id: string;
  name: string;
  /** Items rated by variety: which variety the verdict means ("Honeycrisp", "6 varieties at their best"). */
  varietyLine: string | null;
  verdict: Verdict;
  /** One short factual reason, or null when it would only repeat the section ("At its best this time of year"). */
  reason: string | null;
  /** The month's top typical origin, named. */
  origin: string | null;
  tags: string[];
  group: FilterGroup;
  /** Expanded card: the pick cue and the typical storage range (product spec §5 "Card behavior"). */
  pick: string;
  storage: string;
  draft: boolean;
  synthetic: boolean;
}

export interface TodayView {
  best: Card[];
  good: Card[];
  skip: Card[];
  limited: Card[];
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
  "no-typical-origins": "Not enough supply data to call it now.",
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

export function reasonText(verdict: Verdict, reasons: readonly Reason[], markers: readonly Marker[]): string {
  const lastCall = markers.find((m) => m.kind === "last-call");
  if (lastCall && (verdict === "peak" || verdict === "good"))
    return `Fades by ${windowPhrase(lastCall.fadesBy)}.`;
  if (verdict === "peak") return GENERIC_REASON.peak;
  if (verdict === "good") return GENERIC_REASON.good;
  if (verdict === "skip") {
    const improves = markers.find((m) => m.kind === "improves");
    return improves ? `Usually improves in ${windowPhrase(improves.window)}.` : "Not at its best now.";
  }
  for (const r of reasons) {
    const text = LIMITED_REASONS[r.code];
    if (text) return text;
  }
  return "Not enough evidence to call it now.";
}

export function varietyLine(item: AppItem, ids: readonly string[] | null, verdict: Verdict): string | null {
  if (!ids || ids.length === 0) return null;
  const names = ids.map((id) => item.varieties.find((v) => v.id === id)?.name ?? id);
  if (names.length === 1) return names[0] ?? null;
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return verdict === "peak" ? `${names.length} varieties at their best` : `${names.length} varieties`;
}

export function tags(item: AppItem, markers: readonly Marker[]): string[] {
  const out: string[] = [];
  if (item.inputs.alwaysGood) out.push("Always good");
  for (const m of markers) {
    if (m.kind === "last-call") out.push("Last call");
    else if (m.kind === "reliable-year-round" && !item.inputs.alwaysGood) out.push("Reliable year-round");
    else if (m.kind === "advisory") out.push("Advisory");
    else if (m.kind === "check-label") out.push("Check the label");
  }
  return out;
}

export function todayView(data: AppData, date: PlainDate): TodayView {
  const window = windowIndex(date.month, date.day);
  const cards = new Map<string, Card>();
  const entries: TodayEntry[] = data.items.map((item) => {
    const result = evaluate(item.inputs, { date, mode: "today" }, data.env);
    const typical = evaluate(item.inputs, { date, mode: "typical" }, data.env);
    const top = item.inputs.typicalOrigins[Math.floor(window / 2)]?.[0];
    const reason = reasonText(result.verdict, result.reasons, result.markers);
    cards.set(item.inputs.id, {
      id: item.inputs.id,
      name: item.name,
      varietyLine: varietyLine(item, result.varietyLine, result.verdict),
      verdict: result.verdict,
      reason: isGeneric(reason) ? null : reason,
      origin: top === undefined ? null : originName(top, data),
      tags: tags(item, result.markers),
      group: item.group,
      pick: item.cardLine,
      storage: storageLine(item.store),
      draft: item.status === "draft",
      synthetic: item.synthetic,
    });
    return {
      id: item.inputs.id,
      purchaseRank: item.purchaseRank,
      alwaysGood: item.inputs.alwaysGood,
      verdict: result.verdict,
      confidence: result.confidence,
      typicalVerdict: typical.verdict,
      peakWindows: typicalOutlook(item.inputs, data.env, date.year).filter((v) => v === "peak").length,
    };
  });
  const groups = groupToday(entries);
  const pick = (ids: string[]) => ids.flatMap((id) => cards.get(id) ?? []);
  return {
    best: pick(groups.best),
    good: pick(groups.good),
    skip: pick(groups.skip),
    limited: pick(groups.limited),
  };
}

/** A YYYY-MM-DD string as a plain date. */
export function plainDate(iso: string): PlainDate {
  const [year, month, day] = iso.split("-").map(Number);
  return { year: year ?? 1970, month: month ?? 1, day: day ?? 1 };
}

// Calendar, "Typical seasonal outlook" (product spec §5 "Calendar"): what is normally favorable at each time of year,
// never a forecast. Every item's 24-window typical outlook, shown a month at a time on phone and as a heatmap wider.
import type { AppData } from "../shared/app-data";
import { typicalOutlook, type Verdict } from "../shared/verdict";

export interface CalendarRow {
  id: string;
  name: string;
  category: string;
  alwaysGood: boolean;
  outlook: Verdict[];
  draft: boolean;
  synthetic: boolean;
}

/** Items in Browse order: by category, then A to Z. */
export function calendarRows(data: AppData, year: number): CalendarRow[] {
  const order = new Map(data.categories.map((c, i) => [c.id, i]));
  return data.items
    .map((item) => ({
      id: item.inputs.id,
      name: item.name,
      category: item.category,
      alwaysGood: item.inputs.alwaysGood,
      outlook: typicalOutlook(item.inputs, data.env, year),
      draft: item.status === "draft",
      synthetic: item.synthetic,
    }))
    .sort(
      (a, b) =>
        (order.get(a.category) ?? 0) - (order.get(b.category) ?? 0) || a.name.localeCompare(b.name, "en"),
    );
}

const RANK: Record<Verdict, number> = { peak: 0, good: 1, skip: 2, limited: 3 };
export const SECTION_ORDER: Verdict[] = ["peak", "good", "skip", "limited"];

export interface MonthSection {
  verdict: Verdict;
  rows: CalendarRow[];
}

/**
 * One month (0–11) on phone: each item once, under the better of its two half-month verdicts, A to Z, so an item
 * that turns Peak in late June shows under Peak; its row's two cells tell early from late.
 */
export function monthSections(rows: readonly CalendarRow[], month: number): MonthSection[] {
  const best = (r: CalendarRow): Verdict => {
    const early = r.outlook[month * 2] ?? "limited";
    const late = r.outlook[month * 2 + 1] ?? "limited";
    return RANK[early] <= RANK[late] ? early : late;
  };
  return SECTION_ORDER.map((verdict) => ({
    verdict,
    rows: rows.filter((r) => best(r) === verdict).sort((a, b) => a.name.localeCompare(b.name, "en")),
  })).filter((s) => s.rows.length > 0);
}

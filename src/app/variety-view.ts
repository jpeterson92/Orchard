// A variety page for a date (product spec §5 "Variety guide" → "Variety page"): one variety of a guide's items, its
// traits and best uses, its quality across the year where it is rated, what the label says, and close alternatives.
// Varieties outside a guide have no page; their item page covers them.
import type { AppData, AppGuide, AppItem, AppVariety } from "../shared/app-data";
import { windowIndex } from "../shared/time";
import { type Confidence, evaluate, type PlainDate, typicalOutlook, type Verdict } from "../shared/verdict";

export interface Alternative {
  id: string;
  name: string;
  /** Today's verdict where it is rated and in stores; null otherwise. */
  verdict: Verdict | null;
  /** Mean trait gap from the page's variety on the scales both are placed on. */
  gap: number;
}

export interface VarietyView {
  item: { id: string; name: string };
  guide: AppGuide;
  variety: AppVariety;
  /** Rated varieties only (P13): today's verdict, its confidence, and the 24-window outlook. */
  rating: { verdict: Verdict; confidence: Confidence; inStore: boolean; outlook: Verdict[] } | null;
  window: number;
  /** "Can't find it? Try…": the closest varieties by traits, up to `MAX_ALTERNATIVES`. */
  alternatives: Alternative[];
  draft: boolean;
  synthetic: boolean;
}

export const MAX_ALTERNATIVES = 2;
/** An alternative must share this many scales with the variety (or all of them, if it has fewer)… */
const MIN_SHARED = 3;
/** …and sit within this mean gap on them, so "try" means close, not merely the least different. */
const MAX_GAP = 1;

/** The page's address: below its item, as Browse goes Category → Item → Variety (product spec §4). */
export const varietyPath = (item: string, variety: string) => `/items/${item}/${variety}`;

/** Whether a variety has its own page: it belongs to an item with a guide. */
export const hasVarietyPage = (item: Pick<AppItem, "guide">) => item.guide !== null;

export function varietyView(
  data: AppData,
  itemId: string,
  varietyId: string,
  date: PlainDate,
): VarietyView | null {
  const item = data.items.find((i) => i.inputs.id === itemId);
  const variety = item?.varieties.find((v) => v.id === varietyId);
  const guide = data.guides.find((g) => g.id === item?.guide);
  if (!item || !variety || !guide) return null;
  const rated = new Set(item.inputs.varieties.map((v) => v.id));
  const result = rated.size > 0 ? evaluate(item.inputs, { date }, data.env) : null;
  const today = (id: string) => (rated.has(id) ? result?.byVariety[id] : undefined);
  const own = today(variety.id);
  return {
    item: { id: item.inputs.id, name: item.name },
    guide,
    variety,
    rating: own
      ? {
          verdict: own.verdict,
          confidence: own.confidence,
          inStore: own.inStore,
          outlook: typicalOutlook(item.inputs, data.env, date.year, variety.id),
        }
      : null,
    window: windowIndex(date.month, date.day),
    alternatives: alternatives(item, variety, (id) => {
      const r = today(id);
      return r === undefined ? "unrated" : r.inStore ? r.verdict : "out";
    }),
    draft: item.status === "draft",
    synthetic: item.synthetic,
  };
}

/**
 * The varieties of the same item closest to `variety` by traits: placed on enough of the same scales, within the
 * gap limit, and sharing a use with it where it has one. A rated variety not usually in stores now, or Skip today, is
 * no help and is left out; an unrated one may be. Closest first; then the better verdict today, then A to Z.
 */
export function alternatives(
  item: Pick<AppItem, "varieties">,
  variety: AppVariety,
  status: (id: string) => Verdict | "unrated" | "out",
): Alternative[] {
  const own = Object.keys(variety.traits);
  const need = Math.min(MIN_SHARED, own.length);
  if (need === 0) return [];
  const rank = (s: ReturnType<typeof status>) => (s === "peak" ? 3 : s === "good" ? 2 : 1);
  return item.varieties
    .flatMap((v): (Alternative & { rank: number })[] => {
      if (v.id === variety.id) return [];
      const s = status(v.id);
      if (s === "out" || s === "skip") return [];
      if (variety.uses.length > 0 && !v.uses.some((u) => variety.uses.includes(u))) return [];
      const shared = own.filter((t) => v.traits[t] !== undefined);
      if (shared.length < need) return [];
      const gap =
        shared.reduce((sum, t) => sum + Math.abs((v.traits[t] ?? 0) - (variety.traits[t] ?? 0)), 0) /
        shared.length;
      if (gap > MAX_GAP) return [];
      const verdict = s === "unrated" ? null : s;
      return [{ id: v.id, name: v.name, verdict, gap, rank: rank(s) }];
    })
    .sort((a, b) => a.gap - b.gap || b.rank - a.rank || a.name.localeCompare(b.name, "en"))
    .slice(0, MAX_ALTERNATIVES)
    .map(({ rank: _, ...a }) => a);
}

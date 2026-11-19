// A variety guide for a date (product spec §5 "Variety guide"): every variety of its items with its traits, uses and,
// where it is rated, today's verdict. Unrated varieties live here rather than on the item page.
import type { AppData, AppGuide, AppVariety } from "../shared/app-data";
import { evaluate, type PlainDate, type Verdict, verdictRank } from "../shared/verdict";

export interface GuideRow {
  /** `item/variety`: unique across a guide's items. */
  key: string;
  item: string;
  itemName: string;
  name: string;
  art: string | null;
  /** Null for a variety without variety-specific evidence: never ranked. */
  verdict: Verdict | null;
  inStore: boolean;
  bestUses: string[];
  /** The guide's use chips its best uses fall under. */
  uses: string[];
  traits: Record<string, number>;
  ripeCue: string | null;
  overall: AppVariety["overall"];
}

export interface GuideView {
  guide: AppGuide;
  /** Variety names by id, for the anchors' reference varieties. */
  names: Record<string, string>;
  /** Shown when the guide covers more than one item (mandarins & oranges). */
  multiItem: boolean;
  /** The default order: overall rating where the guide has one, else best right now. */
  defaultSort: SortKey;
  rows: GuideRow[];
}

/** What a column sorts by: today's verdict, the overall rating, the name, or a trait id. */
export type SortKey = "now" | "overall" | "name" | (string & {});

export function guideView(data: AppData, id: string, date: PlainDate): GuideView | null {
  const guide = data.guides.find((g) => g.id === id);
  if (!guide) return null;
  const names: Record<string, string> = {};
  const rows: GuideRow[] = [];
  for (const itemId of guide.items) {
    const item = data.items.find((i) => i.inputs.id === itemId);
    if (!item) continue;
    const rated = new Set(item.inputs.varieties.map((v) => v.id));
    const result = rated.size > 0 ? evaluate(item.inputs, { date }, data.env) : null;
    for (const v of item.varieties) {
      names[v.id] = v.name;
      const r = rated.has(v.id) ? result?.byVariety[v.id] : undefined;
      rows.push({
        key: `${itemId}/${v.id}`,
        item: itemId,
        itemName: item.name,
        name: v.name,
        art: v.art,
        verdict: r?.verdict ?? null,
        inStore: r?.inStore ?? false,
        bestUses: v.bestUses,
        uses: v.uses,
        traits: v.traits,
        ripeCue: v.ripeCue,
        overall: v.overall,
      });
    }
  }
  const defaultSort = guide.overall ? "overall" : "now";
  return { guide, names, multiItem: guide.items.length > 1, defaultSort, rows: sortRows(rows, defaultSort) };
}

/** Rank for "now": rated and in stores by verdict, then rated but out of stores; unrated has none. */
function nowRank(r: GuideRow): number | undefined {
  if (r.verdict === null) return undefined;
  return r.inStore ? verdictRank(r.verdict) : -1;
}

/** Rows sorted by a column. "now" and traits default to best or most first; a variety with no value (unrated, or no
 * source for the score or trait) always sorts last. Ties keep A to Z. */
export function sortRows(rows: readonly GuideRow[], key: SortKey, descending = key !== "name"): GuideRow[] {
  const byName = [...rows].sort((a, b) => a.name.localeCompare(b.name, "en"));
  if (key === "name") return descending ? byName.reverse() : byName;
  const value = (r: GuideRow) =>
    key === "now" ? nowRank(r) : key === "overall" ? r.overall?.score : r.traits[key];
  return byName.sort((a, b) => {
    const x = value(a);
    const y = value(b);
    if (x === undefined || y === undefined) return x === undefined ? (y === undefined ? 0 : 1) : -1;
    return descending ? y - x : x - y;
  });
}

/** A finder chip for one end of a trait's scale: `low` finds scores 1–2, `high` 4–5. */
export interface TraitChip {
  /** `trait-low` or `trait-high`: unique within a guide, and how the address names it. */
  key: string;
  trait: string;
  pole: "low" | "high";
  label: string;
}

/** What the finder has picked: one use (or any), and trait chips that must all hold. */
export interface Finder {
  use: string | null;
  traits: string[];
}

export const NO_FILTER: Finder = { use: null, traits: [] };

/** The guide's trait chips, in scale order, low end first. */
export function traitChips(guide: AppGuide): TraitChip[] {
  return guide.traits.flatMap((t) =>
    (["low", "high"] as const).flatMap((pole) => {
      const label = t.filters[pole];
      return label === null ? [] : [{ key: `${t.id}-${pole}`, trait: t.id, pole, label }];
    }),
  );
}

/** The rows the finder keeps, in their order. A variety no source places on a picked trait's scale doesn't match. */
export function filterRows(
  rows: readonly GuideRow[],
  finder: Finder,
  chips: readonly TraitChip[],
): GuideRow[] {
  const picked = chips.filter((c) => finder.traits.includes(c.key));
  return rows.filter((r) => {
    if (finder.use !== null && !r.uses.includes(finder.use)) return false;
    return picked.every((c) => {
      const v = r.traits[c.trait];
      return v !== undefined && (c.pole === "low" ? v <= 2 : v >= 4);
    });
  });
}

/** Tapping a trait chip: on picks it and drops the other end of the same scale; off unpicks it. */
export function toggleTrait(finder: Finder, chip: TraitChip): Finder {
  if (finder.traits.includes(chip.key))
    return { ...finder, traits: finder.traits.filter((k) => k !== chip.key) };
  const sameScale = [`${chip.trait}-low`, `${chip.trait}-high`];
  return { ...finder, traits: [...finder.traits.filter((k) => !sameScale.includes(k)), chip.key] };
}

/** The finder kept in the address (`?use=baking&want=tartness-high`), so Back returns to it. Unknown values drop. */
export function parseFinder(params: URLSearchParams, guide: AppGuide, chips: readonly TraitChip[]): Finder {
  const use = params.get("use");
  const want = (params.get("want") ?? "").split(",");
  return {
    use: guide.uses.some((u) => u.id === use) ? use : null,
    traits: chips.filter((c) => want.includes(c.key)).map((c) => c.key),
  };
}

export function finderParams(params: URLSearchParams, finder: Finder): URLSearchParams {
  const next = new URLSearchParams(params);
  if (finder.use === null) next.delete("use");
  else next.set("use", finder.use);
  if (finder.traits.length === 0) next.delete("want");
  else next.set("want", finder.traits.join(","));
  return next;
}

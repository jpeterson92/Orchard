// Browse (product spec §4): categories grouped as Fruit, Vegetables and Other, then each category's items as rows
// that open the item page. Rows still carry the verdict, so the answer often shows without a tap.
import type { AppCategory, AppData, FilterGroup } from "../shared/app-data";
import { evaluate, type PlainDate, type Verdict } from "../shared/verdict";
import { tags, varietyLine } from "./today-view";

export const BROWSE_GROUPS: { id: FilterGroup; label: string }[] = [
  { id: "fruit", label: "Fruit" },
  { id: "vegetables", label: "Vegetables" },
  { id: "herbs-mushrooms", label: "Other" },
];

export interface BrowseGroup {
  label: string;
  categories: (AppCategory & { count: number })[];
}

/** Only categories that hold an item, and only groups that hold a category. */
export function browseGroups(data: AppData): BrowseGroup[] {
  return BROWSE_GROUPS.map((g) => ({
    label: g.label,
    categories: data.categories
      .filter((c) => c.group === g.id)
      .map((c) => ({ ...c, count: data.items.filter((i) => i.category === c.id).length })),
  })).filter((g) => g.categories.length > 0);
}

export interface BrowseRow {
  id: string;
  name: string;
  art: string | null;
  varietyLine: string | null;
  verdict: Verdict;
  tags: string[];
  draft: boolean;
  synthetic: boolean;
}

/** A category's items, A to Z: a lookup list, so names are easy to find. Null for an unknown category. */
export function categoryRows(data: AppData, categoryId: string, date: PlainDate): BrowseRow[] | null {
  if (!data.categories.some((c) => c.id === categoryId)) return null;
  return data.items
    .filter((i) => i.category === categoryId)
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .map((item) => {
      const result = evaluate(item.inputs, { date }, data.env);
      return {
        id: item.inputs.id,
        name: item.name,
        art: item.art,
        varietyLine: varietyLine(item, result, data),
        verdict: result.verdict,
        tags: tags(item, result.markers),
        draft: item.status === "draft",
        synthetic: item.synthetic,
      };
    });
}

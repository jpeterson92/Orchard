import type { AppData, AppItem, AppVariety, FilterGroup } from "../shared/app-data";
import { looksAlwaysGood, typicalOutlook, type Verdict } from "../shared/verdict";

export interface AlwaysGoodRow {
  id: string;
  name: string;
  group: FilterGroup;
  varieties: AppVariety[];
  listing: "whole" | "include" | "except";
  hasGuide: boolean;
}

function itemAlwaysGood(item: AppItem, outlook: readonly Verdict[]): boolean {
  return item.inputs.alwaysGood && item.varieties.length === 0 && looksAlwaysGood(outlook);
}

export function varietyAlwaysGood(item: AppItem, variety: AppVariety, outlook: readonly Verdict[]): boolean {
  const rated = item.inputs.varieties.find((v) => v.id === variety.id);
  return (
    variety.alwaysGood === true &&
    variety.recommended &&
    rated?.inStore.every(Boolean) === true &&
    looksAlwaysGood(outlook)
  );
}

export function alwaysGoodRow(
  item: AppItem,
  env: AppData["env"],
  year: number,
  itemOutlook: readonly Verdict[],
): AlwaysGoodRow | null {
  const row = { id: item.inputs.id, name: item.name, group: item.group, hasGuide: item.guide !== null };
  if (itemAlwaysGood(item, itemOutlook)) return { ...row, varieties: [], listing: "whole" };
  if (!item.varieties.some((v) => v.alwaysGood)) return null;

  const qualifying: AppVariety[] = [];
  const seasonal: AppVariety[] = [];
  for (const variety of item.varieties) {
    const outlook = typicalOutlook(item.inputs, env, year, variety.id);
    if (varietyAlwaysGood(item, variety, outlook)) qualifying.push(variety);
    else if (!outlook.includes("limited") && outlook.some((v) => v === "peak" || v === "skip"))
      seasonal.push(variety);
  }
  if (qualifying.length === 0) return null;

  const complete =
    item.varietiesCoverItem &&
    qualifying.length + seasonal.length === item.varieties.length &&
    item.types.every((type) => item.varieties.some((variety) => variety.id === type.id));
  if (complete && seasonal.length === 0) return { ...row, varieties: [], listing: "whole" };
  const except = complete && seasonal.length <= 2 && seasonal.length < qualifying.length;
  return {
    ...row,
    varieties: (except ? seasonal : qualifying).sort((a, b) => a.name.localeCompare(b.name, "en")),
    listing: except ? "except" : "include",
  };
}

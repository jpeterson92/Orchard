import { describe, expect, it } from "vitest";
import json from "../generated/app.json";
import type { AppData, AppItem, AppVariety } from "../shared/app-data";
import type { Rating } from "../shared/verdict";
import { search, searchIndex } from "./search-view";
import { todayView } from "./today-view";

const bundled = json as unknown as AppData;
const base = bundled.items.find((item) => item.inputs.id === "asparagus") as AppItem;
const summer = { year: 2026, month: 7, day: 1 };
const winter = { year: 2026, month: 1, day: 1 };

const variety = (id: string, name: string, alwaysGood = true): AppVariety => ({
  id,
  name,
  label: name,
  alwaysGood,
  art: null,
  cue: null,
  plu: [],
  bestUses: [],
  uses: [],
  traits: {},
  ripeCue: null,
  overall: null,
  recommended: true,
});

const romaine = variety("romaine", "Romaine");
const iceberg = variety("iceberg", "Iceberg");
const redLeaf = variety("red-leaf", "Red leaf", false);
const butter = variety("butter", "Butter");
const unknown = variety("spring-mix", "Spring mix", false);
const rated = (v: AppVariety, rating: Rating = "fair") => ({
  id: v.id,
  inStore: Array<boolean>(12).fill(true),
  windows: Array<Rating>(24).fill(rating),
});
const leaf = rated(redLeaf, "poor");
leaf.windows.fill("prime", 12, 16);
const allYear = { windows: Array<Rating>(24).fill("fair") };
const staple = (id: string, name: string): AppItem => ({
  ...base,
  inputs: {
    ...base.inputs,
    id,
    alwaysGood: true,
    origins: { us: allYear },
    varieties: [],
    selections: [],
    supply: {},
    typicalOrigins: Array.from({ length: 12 }, () => ["us"]),
    typicalShares: Array.from({ length: 12 }, () => [null]),
    minorOrigins: [],
  },
  name,
  synonyms: [],
  misspellings: [],
  types: [],
  varieties: [],
});
const lettuce: AppItem = {
  ...staple("lettuce", "Lettuce"),
  synonyms: ["red leaf lettuce", "romaine lettuce"],
  inputs: {
    ...staple("lettuce", "Lettuce").inputs,
    peakWorthSeeking: true,
    varieties: [rated(romaine), rated(iceberg), leaf, rated(butter)],
  },
  varietiesCoverItem: true,
  varieties: [romaine, iceberg, redLeaf, butter],
};

const data = (...items: AppItem[]): AppData => ({ ...bundled, items });
const lookup = (catalog: AppData, query: string, date = winter) => {
  const result = search(searchIndex(catalog), catalog, query, date);
  expect(result.kind).toBe("results");
  return result.kind === "results" ? result.results[0] : undefined;
};

describe("Always good on Today and in search", () => {
  it("sorts year-round rows by name and shows a fully covered family once", () => {
    const whole = { ...lettuce, varieties: [romaine, iceberg] };
    whole.inputs = { ...whole.inputs, varieties: [rated(romaine), rated(iceberg)] };
    const catalog = data(staple("zucchini", "Zucchini"), whole, staple("carrots", "Carrots"));
    for (const date of [summer, winter]) {
      const view = todayView(catalog, date);
      expect(view.alwaysGood.map(({ name, listing }) => [name, listing])).toEqual([
        ["Carrots", "whole"],
        ["Lettuce", "whole"],
        ["Zucchini", "whole"],
      ]);
      expect(view.best.concat(view.good)).toEqual([]);
      expect(lookup(catalog, "lettuce", date)?.tags).toContain("Always good");
    }
  });

  it("names a confirmed seasonal exception and shows it at Peak without endorsing it year-round", () => {
    const catalog = data(lettuce);
    expect(todayView(catalog, winter).alwaysGood[0]).toMatchObject({
      listing: "except",
      varieties: [redLeaf],
    });
    expect(todayView(catalog, summer).best[0]).toMatchObject({ id: "lettuce", varietyLine: "Red leaf" });
    expect(lookup(catalog, "red leaf lettuce")).toMatchObject({
      key: "lettuce/red-leaf",
      to: "/items/lettuce#label",
      label: "v:red-leaf",
      verdict: "skip",
      tags: [],
    });
    expect(lookup(catalog, "red leaf lettuce", summer)).toMatchObject({ verdict: "peak", tags: [] });
    expect(lookup(catalog, "romaine lettuce")).toMatchObject({
      key: "lettuce/romaine",
      verdict: "good",
      tags: ["Always good"],
    });
  });

  it("names only qualifying types when some coverage is missing and distinguishes Not rated from no match", () => {
    const catalog = data({ ...lettuce, varieties: [...lettuce.varieties, unknown] });
    expect(todayView(catalog, winter).alwaysGood[0]).toMatchObject({
      listing: "include",
      varieties: [butter, iceberg, romaine],
    });
    expect(lookup(catalog, "spring mix lettuce")).toMatchObject({ verdict: "limited", tags: [] });
    expect(search(searchIndex(catalog), catalog, "unknown vegetable", winter).kind).toBe("none");
  });

  it("uses the positive list when an editorial coverage claim or year-round availability is missing", () => {
    const seasonalSupply = { ...rated(iceberg), inStore: Array<boolean>(12).fill(false) };
    const catalog = data({
      ...lettuce,
      varietiesCoverItem: false,
      inputs: { ...lettuce.inputs, varieties: [rated(romaine), seasonalSupply, leaf, rated(butter)] },
    });
    expect(todayView(catalog, winter).alwaysGood[0]).toMatchObject({
      listing: "include",
      varieties: [butter, romaine],
    });
    expect(lookup(catalog, "iceberg lettuce")?.tags).not.toContain("Always good");
  });
});

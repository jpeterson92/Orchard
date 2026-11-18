import { describe, expect, it } from "vitest";
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import { browseGroups, categoryRows } from "./browse-view";

const data = appJson as unknown as AppData;
const date = { year: 2026, month: 11, day: 18 };

describe("Browse", () => {
  it("lists every bundled item in exactly one category, so each is reachable", () => {
    const ids = browseGroups(data).flatMap((g) =>
      g.categories.flatMap((c) => (categoryRows(data, c.id, date) ?? []).map((r) => r.id)),
    );
    expect(ids.sort()).toEqual(data.items.map((i) => i.inputs.id).sort());
  });

  it("shows only categories and groups that hold an item, with matching counts", () => {
    for (const g of browseGroups(data)) {
      expect(g.categories.length).toBeGreaterThan(0);
      for (const c of g.categories) {
        expect(c.count).toBeGreaterThan(0);
        expect(categoryRows(data, c.id, date)).toHaveLength(c.count);
      }
    }
  });

  it("orders a category's rows A to Z and returns null for an unknown category", () => {
    for (const c of data.categories) {
      const names = (categoryRows(data, c.id, date) ?? []).map((r) => r.name);
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en")));
    }
    expect(categoryRows(data, "no-such-category", date)).toBeNull();
  });
});

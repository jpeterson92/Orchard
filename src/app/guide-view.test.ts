import { describe, expect, it } from "vitest";
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import { guideView, sortRows } from "./guide-view";
import { itemView } from "./item-view";

const data = appJson as unknown as AppData;
const date = { year: 2026, month: 11, day: 18 };

describe("Variety guide", () => {
  it("lists every variety of the guide's items, and the item page lists only the rated ones", () => {
    for (const g of data.guides) {
      const view = guideView(data, g.id, date);
      const all = g.items.flatMap((id) => data.items.find((i) => i.inputs.id === id)?.varieties ?? []);
      expect(view?.rows).toHaveLength(all.length);
      for (const id of g.items) {
        const item = itemView(data, id, date);
        const rated = data.items.find((i) => i.inputs.id === id)?.inputs.varieties.map((v) => v.id) ?? [];
        expect(item?.varieties.map((v) => v.id).sort()).toEqual([...rated].sort());
        expect(item?.guide).toBe(g.id);
      }
    }
  });

  it("puts unrated varieties after rated ones by default, and never gives them a verdict", () => {
    const rows = guideView(data, "apples", date)?.rows ?? [];
    const firstUnrated = rows.findIndex((r) => r.verdict === null);
    expect(firstUnrated).toBeGreaterThan(0);
    expect(rows.slice(firstUnrated).every((r) => r.verdict === null)).toBe(true);
    expect(rows.find((r) => r.name === "Red Delicious")?.verdict ?? null).toBeNull();
  });

  it("sorts by a trait, most first or least first, with unscored varieties last either way", () => {
    const rows = guideView(data, "apples", date)?.rows ?? [];
    for (const descending of [true, false]) {
      const sorted = sortRows(rows, "tartness", descending);
      const scored = sorted.filter((r) => r.traits.tartness !== undefined);
      const values = scored.map((r) => r.traits.tartness ?? 0);
      expect(values).toEqual([...values].sort((a, b) => (descending ? b - a : a - b)));
      expect(sorted.slice(0, scored.length)).toEqual(scored);
    }
    const names = sortRows(rows, "name").map((r) => r.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en")));
  });

  it("returns null for an unknown guide", () => {
    expect(guideView(data, "no-such-guide", date)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import appJson from "../generated/app.json";
import { type AppData, overallTier } from "../shared/app-data";
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

  it("sorts apples by overall rating for eating raw by default, best first, in tiers by score", () => {
    const view = guideView(data, "apples", date);
    expect(view?.defaultSort).toBe("overall");
    const scores = (view?.rows ?? []).map((r) => r.overall?.score ?? -1);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    const tier = (name: string) => view?.rows.find((r) => r.name === name)?.overall?.tier;
    expect([tier("SweeTango"), tier("Envy"), tier("Gala"), tier("Red Delicious")]).toEqual([
      "amazing",
      "great",
      "fine",
      "bad",
    ]);
  });

  it("gives an overall rating only where the guide has one, and keeps best right now first there", () => {
    const view = guideView(data, "pears", date);
    expect(view?.guide.overall).toBeNull();
    expect(view?.defaultSort).toBe("now");
    expect(view?.rows.every((r) => r.overall === null)).toBe(true);
  });

  it("puts unrated varieties after rated ones when sorted by now, and never gives them a verdict", () => {
    const rows = sortRows(guideView(data, "apples", date)?.rows ?? [], "now");
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

  it.each([
    [100, "amazing"],
    [90, "amazing"],
    [89, "great"],
    [75, "great"],
    [74, "fine"],
    [65, "fine"],
    [64, "bad"],
    [0, "bad"],
  ] as const)("puts a score of %i in the %s tier, each floor inclusive", (score, tier) => {
    expect(overallTier(score, { amazing: 90, great: 75, fine: 65 })).toBe(tier);
  });

  it("returns null for an unknown guide", () => {
    expect(guideView(data, "no-such-guide", date)).toBeNull();
  });
});

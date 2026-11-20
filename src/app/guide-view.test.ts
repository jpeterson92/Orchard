import { describe, expect, it } from "vitest";
import appJson from "../generated/app.json";
import { type AppData, overallTier } from "../shared/app-data";
import {
  filterRows,
  finderParams,
  type GuideRow,
  guideView,
  NO_FILTER,
  parseFinder,
  sortRows,
  toggleTrait,
  traitChips,
} from "./guide-view";
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

  it("sorts all pears by Orchard's raw-eating score, including varieties without a seasonal verdict", () => {
    const view = guideView(data, "pears", date);
    expect(view?.guide.overall).toEqual({ basis: "Eating raw", source: null });
    expect(view?.defaultSort).toBe("overall");
    expect(view?.rows.map((r) => r.overall?.score)).toEqual([90, 90, 88, 85, 84, 82, 81, 81, 78, 72]);
    expect(view?.rows.find((r) => r.variety === "red-bartlett")).toMatchObject({
      overall: { score: 90, tier: "amazing" },
      verdict: null,
    });
  });

  it("defaults to best right now for guides without an overall rating", () => {
    const view = guideView(data, "citrus", date);
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

describe("Variety guide finder", () => {
  const view = guideView(data, "apples", date);
  if (!view) throw new Error("no apples guide");
  const chips = traitChips(view.guide);
  const chip = (key: string) => {
    const c = chips.find((x) => x.key === key);
    if (!c) throw new Error(key);
    return c;
  };
  const names = (rows: GuideRow[]) => rows.map((r) => r.name).sort();

  it("puts every variety of every guide under at least one use chip", () => {
    for (const g of data.guides)
      for (const r of guideView(data, g.id, date)?.rows ?? [])
        expect(r.uses.length, r.key).toBeGreaterThan(0);
  });

  it("keeps every row, in order, with nothing picked", () => {
    expect(filterRows(view.rows, NO_FILTER, chips)).toEqual(view.rows);
  });

  it("keeps a variety for a use only when one of its best uses falls under it", () => {
    const baking = filterRows(view.rows, { use: "baking", traits: [] }, chips);
    expect(names(baking)).toContain("Granny Smith");
    expect(names(baking)).not.toContain("Gala");
    expect(baking.every((r) => r.bestUses.some((u) => /bak|pie/i.test(u)))).toBe(true);
  });

  it.each([
    ["tartness-high", (v: number) => v >= 4],
    ["crispness-low", (v: number) => v <= 2],
    ["crispness-high", (v: number) => v >= 4],
  ])("keeps only varieties scored at that end of the scale for %s", (key, holds) => {
    const c = chip(key);
    const kept = filterRows(view.rows, { use: null, traits: [key] }, chips);
    const expected = view.rows.filter(
      (r) => r.traits[c.trait] !== undefined && holds(r.traits[c.trait] ?? 0),
    );
    expect(kept).toEqual(expected);
    expect(kept.length).toBeGreaterThan(0);
  });

  it("drops a variety no source places on a picked scale", () => {
    const kept = filterRows(view.rows, { use: null, traits: ["holds-shape-high"] }, chips);
    expect(kept.every((r) => r.traits["holds-shape"] !== undefined)).toBe(true);
    expect(names(kept)).not.toContain("Envy");
  });

  it("needs every picked trait and the use at once, so more picks never add rows", () => {
    const one = filterRows(view.rows, { use: null, traits: ["sweetness-high"] }, chips);
    const two = filterRows(view.rows, { use: null, traits: ["sweetness-high", "crispness-high"] }, chips);
    const three = filterRows(
      view.rows,
      { use: "salads", traits: ["sweetness-high", "crispness-high"] },
      chips,
    );
    expect(two.every((r) => one.includes(r))).toBe(true);
    expect(three.every((r) => two.includes(r))).toBe(true);
    expect(names(three)).toEqual(["Ambrosia", "Envy", "Fuji", "Honeycrisp", "SweeTango"]);
  });

  it("picks one end of a scale at a time, and unpicks on a second tap", () => {
    let f = toggleTrait(NO_FILTER, chip("crispness-low"));
    f = toggleTrait(f, chip("sweetness-high"));
    f = toggleTrait(f, chip("crispness-high"));
    expect(f.traits).toEqual(["sweetness-high", "crispness-high"]);
    expect(toggleTrait(f, chip("sweetness-high")).traits).toEqual(["crispness-high"]);
  });

  it("round-trips through the address and drops what the guide doesn't have", () => {
    const f = { use: "sauce", traits: ["tartness-high", "crispness-low"] };
    const params = finderParams(new URLSearchParams("date=2026-12-20"), f);
    expect(params.get("date")).toBe("2026-12-20");
    expect(parseFinder(params, view.guide, chips)).toEqual({
      use: "sauce",
      traits: ["tartness-high", "crispness-low"],
    });
    const junk = new URLSearchParams("use=juice&want=seeds-low,tartness-high,nonsense");
    expect(parseFinder(junk, view.guide, chips)).toEqual({ use: null, traits: ["tartness-high"] });
    expect(finderParams(params, NO_FILTER).toString()).toBe("date=2026-12-20");
  });
});

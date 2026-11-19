// itemInputs: the dataset → engine bridge. Synthetic data only.
import { describe, expect, it } from "vitest";
import type { Dataset, EvidenceClaim, Item } from "../data/schema";
import { windowFromLabel } from "../time";
import { evaluate } from "./index";
import { itemInputs } from "./inputs";
import { RULES } from "./test-helpers";

const SUMMER = [{ from: "may-1" as const, to: "jun-2" as const, rating: "prime" as const }];
const claim = (source: string, extra: Partial<EvidenceClaim> = {}): EvidenceClaim => ({
  source,
  origin: "us",
  windows: SUMMER,
  specificity: "month",
  directness: "eating-quality",
  paraphrase: "Best in May and June.",
  ...extra,
});

const item = {
  id: "test-fruit",
  evidenceBasis: "supply+assessment",
  alwaysGood: false,
  shipsWell: { value: true, sources: ["a"] },
  peakWorthSeeking: { value: true, sources: ["a"] },
  storesWell: { value: false, sources: ["a"] },
  origins: [{ origin: "us-ca", windows: SUMMER, inStores: [] }],
  varieties: [
    { id: "rated", windows: SUMMER, quotedAs: ["rated-usda", "rated-alt"], inStores: [] },
    { id: "unrated", windows: undefined, inStores: [] },
  ],
  selections: [],
  typicalOrigins: [],
} as unknown as Item;

const source = (id: string) => ({ id, tier: "authoritative" as const });
const data = {
  rules: RULES,
  sources: [source("a"), source("b")],
  items: [item],
  evidence: [
    {
      item: "test-fruit",
      claims: [claim("a"), claim("b"), claim("a", { variety: "rated" })],
      status: "draft",
    },
  ],
  snapshot: null,
  typicalOrigins: [
    { item: "test-fruit", month: 6, rank: 2, origin: "mx", major: false, share: 0.15 },
    { item: "test-fruit", month: 6, rank: 1, origin: "us-ca", major: true, share: 0.6 },
    { item: "test-fruit", month: 5, rank: 1, origin: "us-ca", major: true, share: 0.8 },
  ],
  supplyIndex: [],
  panel: [],
  // In May the two names reach 0.1 only together; in June one alone; never in July; capped where they overlap.
  varietyCalendar: [
    { item: "test-fruit", variety: "rated-usda", month: 5, share: 0.06, origins: [] },
    { item: "test-fruit", variety: "rated-alt", month: 5, share: 0.04, origins: [] },
    { item: "test-fruit", variety: "rated-usda", month: 6, share: 0.1, origins: [] },
    { item: "test-fruit", variety: "rated-usda", month: 7, share: 0.09, origins: [] },
    { item: "test-fruit", variety: "rated-usda", month: 8, share: 0.8, origins: [] },
    { item: "test-fruit", variety: "rated-alt", month: 8, share: 0.7, origins: [] },
    { item: "other-fruit", variety: "rated-usda", month: 9, share: 0.5, origins: [] },
  ],
} as unknown as Dataset;

describe("itemInputs", () => {
  const inputs = itemInputs(item, data);
  const at = (xs: readonly unknown[] | undefined, label: string) => xs?.[windowFromLabel(label)];

  it("fills each origin's P12 confidence per window, null where no claim covers it", () => {
    const ca = inputs.origins["us-ca"];
    expect(at(ca?.windows, "may-1")).toBe("prime");
    expect(at(ca?.evidence, "may-1")).toBe("high");
    expect(at(ca?.evidence, "jul-1")).toBeNull();
  });

  it("ranks typical origins per month and marks the minor ones", () => {
    expect(inputs.typicalOrigins[5]).toEqual(["us-ca", "mx"]);
    expect(inputs.minorOrigins[5]).toEqual(["mx"]);
    expect(inputs.typicalShares[5]).toEqual([0.6, 0.15]);
    expect([inputs.typicalOrigins[6], inputs.minorOrigins[6]]).toEqual([[], []]);
  });
  it("takes an item's editorial typical origins in place of USDA's, wrapping past December", () => {
    const editorial = {
      ...item,
      typicalOrigins: [
        {
          from: "nov",
          to: "feb",
          origins: [
            { origin: "us-ca", major: true },
            { origin: "mx", major: false },
          ],
          sources: ["a"],
        },
        { from: "jun", to: "jun", origins: [{ origin: "cl", major: true }], sources: ["a"] },
      ],
    } as Item;
    const own = itemInputs(editorial, data);
    for (const m of [10, 11, 0, 1]) {
      expect(own.typicalOrigins[m]).toEqual(["us-ca", "mx"]);
      expect(own.minorOrigins[m]).toEqual(["mx"]);
      expect(own.typicalShares[m]).toEqual([null, null]);
    }
    expect(own.typicalOrigins[5]).toEqual(["cl"]);
    expect([own.typicalOrigins[2], own.typicalOrigins[4]]).toEqual([[], []]);
  });

  it("builds rated varieties only, each with its own evidence", () => {
    expect(inputs.varieties.map((v) => v.id)).toEqual(["rated"]);
    expect(at(inputs.varieties[0]?.evidence, "may-1")).toBe("low");
  });

  it("counts a variety in stores where its calendar names together reach the P13 share", () => {
    const expected = [false, false, false, false, true, true, false, true, false, false, false, false];
    expect(inputs.varieties[0]?.inStore).toEqual(expected);
  });

  it("also counts a variety in stores in its cited months, with or without calendar names", () => {
    const cited = [{ from: "nov", to: "jan", sources: ["a"] }];
    const months = (inStore: readonly boolean[] | undefined) =>
      inStore?.map((x, m) => (x ? m + 1 : 0)).filter(Boolean);
    const joined = itemInputs(
      { ...item, varieties: [{ ...item.varieties[0], inStores: cited }] } as Item,
      data,
    );
    expect(months(joined.varieties[0]?.inStore)).toEqual([1, 5, 6, 8, 11, 12]);
    const citedOnly = itemInputs(
      { ...item, varieties: [{ id: "cited", windows: SUMMER, inStores: cited }] } as unknown as Item,
      data,
    );
    expect(months(citedOnly.varieties[0]?.inStore)).toEqual([1, 11, 12]);
  });

  it("an item rated by variety is Limited evidence when no rated variety is in stores", () => {
    const may = { date: { year: 2026, month: 5, day: 10 } } as const;
    const env = { rules: RULES, snapshotTo: null };
    expect(evaluate(inputs, may, env).verdict).not.toBe("limited");
    const noCalendar = itemInputs(item, { ...data, varietyCalendar: [] });
    expect(noCalendar.varieties[0]?.inStore.some(Boolean)).toBe(false);
    expect(evaluate(noCalendar, may, env).verdict).toBe("limited");
  });

  it("P16: a selection is in stores in cited months, or where its origins hold the variety share of volume", () => {
    const withSel = {
      ...item,
      origins: [...item.origins, { origin: "mx", windows: SUMMER, inStores: [] }],
      varieties: [],
      selections: [
        { id: "cited", origins: ["us-ca"], inStores: [{ from: "nov", to: "jan", sources: ["a"] }] },
        { id: "volume", origins: ["mx"], inStores: [] },
      ],
    } as unknown as Item;
    const [cited, volume] = itemInputs(withSel, data).selections;
    // us-ca is typical in May (0.8) and June (0.6); mx holds 0.15 in June only.
    expect(cited?.inStore.map((x, m) => (x ? m + 1 : 0)).filter(Boolean)).toEqual([1, 5, 6, 11, 12]);
    expect(volume?.inStore.map((x, m) => (x ? m + 1 : 0)).filter(Boolean)).toEqual([6]);
  });

  it("P20: an origin is cited in stores in its cited months only, wrapping past December", () => {
    const cited = {
      ...item,
      origins: [
        { origin: "us-ca", windows: SUMMER, inStores: [{ from: "nov", to: "jan", sources: ["a"] }] },
        { origin: "mx", windows: SUMMER, inStores: [] },
      ],
    } as unknown as Item;
    const inputs = itemInputs(cited, data);
    expect(inputs.originInStores["us-ca"]?.map((x, m) => (x ? m + 1 : 0)).filter(Boolean)).toEqual([
      1, 11, 12,
    ]);
    expect(inputs.originInStores.mx).toBeUndefined();
  });

  it("gives an item without an evidence file no confidence anywhere", () => {
    const bare = itemInputs(item, { ...data, evidence: [] });
    expect(bare.origins["us-ca"]?.evidence?.every((c) => c === null)).toBe(true);
  });
});

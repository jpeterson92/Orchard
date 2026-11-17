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
  origins: [{ origin: "us-ca", windows: SUMMER }],
  varieties: [
    { id: "rated", windows: SUMMER },
    { id: "unrated", windows: undefined },
  ],
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
  advisories: [],
  snapshot: null,
  typicalOrigins: [
    { item: "test-fruit", month: 6, rank: 2, origin: "mx", major: false },
    { item: "test-fruit", month: 6, rank: 1, origin: "us-ca", major: true },
    { item: "test-fruit", month: 5, rank: 1, origin: "us-ca", major: true },
  ],
  supplyIndex: [],
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
    expect([inputs.typicalOrigins[6], inputs.minorOrigins[6]]).toEqual([[], []]);
  });
  it("builds rated varieties only, each with its own evidence", () => {
    expect(inputs.varieties.map((v) => v.id)).toEqual(["rated"]);
    expect(at(inputs.varieties[0]?.evidence, "may-1")).toBe("low");
  });

  it("counts no variety as in stores until the variety calendar exists, so the item is Limited evidence", () => {
    expect(inputs.varieties[0]?.inStore.every((x) => !x)).toBe(true);
    const r = evaluate(
      inputs,
      { date: { year: 2026, month: 5, day: 10 }, mode: "typical" },
      {
        rules: RULES,
        snapshotTo: null,
      },
    );
    expect(r.verdict).toBe("limited");
    const byOrigin = evaluate(
      { ...inputs, varieties: [] },
      { date: { year: 2026, month: 5, day: 10 }, mode: "typical" },
      { rules: RULES, snapshotTo: null },
    );
    expect(byOrigin.verdict).not.toBe("limited");
  });

  it("gives an item without an evidence file no confidence anywhere", () => {
    const bare = itemInputs(item, { ...data, evidence: [] });
    expect(bare.origins["us-ca"]?.evidence?.every((c) => c === null)).toBe(true);
  });
});

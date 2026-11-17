// P12 evidence combiner: a table-driven case per rule, then property tests for the invariants.
// Every claim and source here is synthetic test data.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  type Claim,
  claimsFor,
  claimValues,
  claimWeight,
  combinedConfidence,
  type EvidenceSource,
  type Proposal,
  propose,
  ratingForValue,
  sourceConfidence,
  type Target,
  traitsFor,
} from "./evidence";
import { WINDOW_COUNT, windowFromLabel, windowLabel } from "./time";
import type { Rating } from "./verdict";

const label = windowLabel;
const at = (p: Proposal, l: string) => p.windows[windowFromLabel(l)];

const SOURCES: EvidenceSource[] = [
  { id: "a", tier: "authoritative" },
  { id: "b", tier: "authoritative" },
  { id: "m", tier: "mainstream" },
  { id: "n", tier: "mainstream" },
  { id: "o", tier: "mainstream" },
  { id: "ra", tier: "mainstream", basedOn: "a" },
  { id: "rm", tier: "authoritative", basedOn: "m" },
  { id: "rra", tier: "mainstream", basedOn: "ra" },
];
const sources = new Map(SOURCES.map((s) => [s.id, s]));

/** `claim("a", "may-1..jun-2 prime, jul-1 fair")`: one source claim, eating-quality, month-level, US-grown. */
function claim(source: string, windows: string, opts: Partial<Claim> = {}): Claim {
  return {
    source,
    origin: "us",
    specificity: "month",
    directness: "eating-quality",
    windows: windows.split(",").map((part) => {
      const [range, rating] = part.trim().split(" ") as [string, Rating];
      const [from, to = from] = range.split("..") as [string, string?];
      return { from, to, rating };
    }),
    ...opts,
  };
}
const US_WA: Target = { origin: "us-wa" };
const SHIPS = { shipsWell: true, storesWell: false };
const valuesAt = (values: (number | null)[], labels: string[]) =>
  labels.map((l) => values[windowFromLabel(l)]);

describe("claim curves", () => {
  it("map prime, fair and poor to 1, 0.5 and 0, and leave unrated windows empty", () => {
    const v = claimValues(claim("a", "may-1 prime, may-2 fair, jun-1 poor"), SHIPS);
    expect(valuesAt(v, ["apr-2", "may-1", "may-2", "jun-1", "jun-2"])).toEqual([null, 1, 0.5, 0, null]);
    expect(v.filter((x) => x !== null)).toHaveLength(3);
  });

  it.each([["half-month" as const], ["month" as const]])("keep sharp edges for a %s claim", (specificity) => {
    const v = claimValues(claim("a", "may-1..jun-2 prime", { specificity }), SHIPS);
    expect(valuesAt(v, ["apr-2", "may-1", "jun-2", "jul-1"])).toEqual([null, 1, 1, null]);
  });

  // [case, windows, expected values by label]
  const shoulders: [string, string, Record<string, number | null>][] = [
    [
      "a soft shoulder at half the edge value",
      "may-1..jun-2 prime",
      { "apr-1": null, "apr-2": 0.5, "may-1": 1, "jun-2": 1, "jul-1": 0.5, "jul-2": null },
    ],
    ["a fair edge gives a 0.25 shoulder", "may-1..jun-2 fair", { "apr-2": 0.25, "jul-1": 0.25 }],
    ["a poor edge gives a 0 shoulder", "may-1..jun-2 poor", { "apr-2": 0, "jul-1": 0 }],
    [
      "a shoulder never overrides a rated window",
      "may-1..jun-2 prime, jul-1..jul-2 poor",
      { "jul-1": 0, "aug-1": 0, "apr-2": 0.5 },
    ],
    ["shoulders wrap past December", "nov-1..dec-2 prime", { "oct-2": 0.5, "jan-1": 0.5, "jan-2": null }],
    ["the higher of two meeting shoulders stands", "jan-1..jan-2 prime, feb-2..mar-1 fair", { "feb-1": 0.5 }],
    ["a 23-window range has one shoulder window", "jan-1..dec-1 prime", { "dec-2": 0.5 }],
    ["a full year has no shoulder", "jan-1..dec-2 fair", { "jan-1": 0.5, "dec-2": 0.5 }],
  ];
  it.each(shoulders)("season claim: %s", (_name, windows, expected) => {
    const v = claimValues(claim("a", windows, { specificity: "season" }), SHIPS);
    expect(Object.fromEntries(Object.keys(expected).map((l) => [l, v[windowFromLabel(l)]]))).toEqual(
      expected,
    );
  });
});

describe("weights and labels", () => {
  it.each([
    ["authoritative", "eating-quality", 2, "high"],
    ["authoritative", "availability", 1.2, "medium"],
    ["authoritative", "secondhand", 0.6, "medium"],
    ["mainstream", "eating-quality", 1, "medium"],
    ["mainstream", "availability", 0.6, "medium"],
    ["mainstream", "secondhand", 0.3, "low"],
  ] as const)("%s × %s weighs %d (%s)", (tier, directness, weight, expected) => {
    expect(claimWeight(tier, directness)).toBeCloseTo(weight, 12);
    expect(sourceConfidence(claimWeight(tier, directness))).toBe(expected);
  });

  it.each([
    [1.5, "high"],
    [1.49, "medium"],
    [0.6, "medium"],
    [0.59, "low"],
  ] as const)("a source weighing %d is %s confidence", (weight, expected) => {
    expect(sourceConfidence(weight)).toBe(expected);
  });

  it.each([
    [1, "prime"],
    [0.75, "prime"],
    [0.74, "fair"],
    [0.5, "fair"],
    [0.26, "fair"],
    [0.25, "poor"],
    [0, "poor"],
  ] as const)("a combined value of %d proposes %s", (value, rating) => {
    expect(ratingForValue(value)).toBe(rating);
  });

  // [independent sources, total weight, spread, an authoritative source, a taste source, confidence]
  it.each([
    [2, 3, 0.2, true, true, "high"],
    [2, 3, 0.2, false, true, "medium"],
    [2, 3, 0.2, true, false, "medium"],
    [2, 2.9, 0, true, true, "medium"],
    [2, 3, 0.21, true, true, "medium"],
    [3, 5, 0.35, true, true, "medium"],
    [3, 5, 0.36, true, true, "low"],
    [1, 4, 0, true, true, "low"],
  ] as const)(
    "%d sources, weight %d, spread %d, authoritative %s, taste %s: %s",
    (n, w, s, auth, taste, expected) => {
      expect(combinedConfidence(n, w, s, auth, taste)).toBe(expected);
    },
  );

  it("availability charts alone never reach High, however many agree", () => {
    const avail = { directness: "availability" as const, origin: "us-wa" };
    const claims = ["a", "b", "rm"].map((s) => claim(s, "jun-1..aug-2 prime", avail));
    const p = propose(claims, sources, US_WA, SHIPS);
    expect(at(p, "jul-1")?.weight).toBeCloseTo(3.6);
    expect(at(p, "jul-1")?.confidence).toBe("medium");
    const withTaste = propose([...claims, claim("n", "jul-1 prime")], sources, US_WA, SHIPS);
    expect(at(withTaste, "jul-1")?.confidence).toBe("high");
  });
});

describe("which claims speak for a target", () => {
  const claims = [
    claim("a", "jun-1 prime"),
    claim("b", "jun-1 prime", { origin: "us-wa" }),
    claim("b", "jun-1 fair"),
    claim("m", "jun-1 prime", { origin: "mx" }),
    claim("n", "jun-1 prime", { origin: "us-wa", variety: "v1" }),
    claim("o", "jun-1 prime", { origin: "mx", variety: "v1" }),
  ];
  const ids = (t: Target) => claimsFor(claims, t).map((c) => `${c.source}:${c.origin}`);

  it("a US state takes its own claims and US-grown claims", () => {
    expect(ids({ origin: "us-ca" })).toEqual(["a:us", "b:us"]);
  });
  it("a source's state claim replaces its US-grown claim for that state only", () => {
    expect(ids(US_WA)).toEqual(["b:us-wa", "a:us"]);
  });
  it("a restatement of a source with a state claim drops its US-grown claim there too", () => {
    const echo = [claim("a", "jun-1 prime", { origin: "us-wa" }), claim("ra", "jun-1 poor")];
    const root = (s: string) => (s === "ra" ? "a" : s);
    expect(claimsFor(echo, US_WA, root).map((c) => c.source)).toEqual(["a"]);
    expect(claimsFor(echo, { origin: "us-ca" }, root).map((c) => c.source)).toEqual(["ra"]);
  });
  it("a country takes only its own claims", () => {
    expect(ids({ origin: "mx" })).toEqual(["m:mx"]);
  });
  it("a variety takes every claim naming it, whatever the origin; origins ignore variety claims", () => {
    expect(ids({ variety: "v1" })).toEqual(["n:us-wa", "o:mx"]);
    expect(ids({ variety: "v2" })).toEqual([]);
  });
});

describe("combining curves", () => {
  it("proposes nothing where no curve covers a window", () => {
    const p = propose([claim("a", "jun-1 prime"), claim("b", "jun-1 prime")], sources, US_WA, SHIPS);
    expect(p.windows.filter((w) => w !== null)).toHaveLength(1);
    expect(propose([], sources, US_WA, SHIPS).windows.every((w) => w === null)).toBe(true);
  });

  it("two agreeing authoritative sources: prime, high confidence", () => {
    expect(
      at(propose([claim("a", "jun-1 prime"), claim("b", "jun-1 prime")], sources, US_WA, SHIPS), "jun-1"),
    ).toEqual({ value: 1, rating: "prime", confidence: "high", weight: 4, spread: 0, sources: ["a", "b"] });
  });

  it("takes the weighted mean, and spread lowers confidence", () => {
    const w = at(
      propose([claim("a", "jun-1 prime"), claim("m", "jun-1 fair")], sources, US_WA, SHIPS),
      "jun-1",
    );
    expect(w?.value).toBeCloseTo(2.5 / 3, 12);
    expect(w?.spread).toBeCloseTo(Math.sqrt(1 / 18), 12);
    expect(w).toMatchObject({ rating: "prime", confidence: "medium", weight: 3 });
  });

  it("strong disagreement is fair at low confidence", () => {
    expect(
      at(propose([claim("a", "jun-1 prime"), claim("b", "jun-1 poor")], sources, US_WA, SHIPS), "jun-1"),
    ).toMatchObject({ value: 0.5, rating: "fair", spread: 0.5, confidence: "low" });
  });

  it("one source alone is low confidence", () => {
    expect(at(propose([claim("a", "jun-1 prime")], sources, US_WA, SHIPS), "jun-1")?.confidence).toBe("low");
  });

  it("too little weight stays medium", () => {
    const avail = { directness: "availability" as const };
    const claims = [claim("a", "jun-1 prime", avail), claim("b", "jun-1 prime", avail)];
    expect(at(propose(claims, sources, US_WA, SHIPS), "jun-1")).toMatchObject({
      weight: 2.4,
      confidence: "medium",
    });
  });

  it("no authoritative source stays medium", () => {
    const claims = ["m", "n", "o"].map((s) => claim(s, "jun-1 prime"));
    expect(at(propose(claims, sources, US_WA, SHIPS), "jun-1")).toMatchObject({
      weight: 3,
      confidence: "medium",
    });
  });

  it("a restating source counts once, keeping the higher weight", () => {
    const w = at(
      propose([claim("a", "jun-1 prime"), claim("ra", "jun-1 poor")], sources, US_WA, SHIPS),
      "jun-1",
    );
    expect(w).toMatchObject({ value: 1, weight: 2, sources: ["a"], confidence: "low" });
  });

  it("the restatement wins when it weighs more, named by its root", () => {
    const w = at(
      propose([claim("m", "jun-1 fair"), claim("rm", "jun-1 prime")], sources, US_WA, SHIPS),
      "jun-1",
    );
    expect(w).toMatchObject({ value: 1, weight: 2, sources: ["m"] });
  });

  it("restatement chains trace back to the first source", () => {
    const claims = [claim("a", "jun-1 prime"), claim("rra", "jun-1 prime"), claim("b", "jun-1 prime")];
    expect(at(propose(claims, sources, US_WA, SHIPS), "jun-1")?.sources).toEqual(["a", "b"]);
  });

  it("a source's equal-weight claims average; a heavier one replaces a lighter one", () => {
    const tied = propose([claim("a", "jun-1 prime"), claim("a", "jun-1 fair")], sources, US_WA, SHIPS);
    expect(at(tied, "jun-1")).toMatchObject({ value: 0.75, weight: 2, sources: ["a"] });
    const heavier = propose(
      [claim("a", "jun-1 poor", { directness: "availability" }), claim("a", "jun-1 prime")],
      sources,
      US_WA,
      SHIPS,
    );
    expect(at(heavier, "jun-1")).toMatchObject({ value: 1, weight: 2 });
  });

  it("season shoulders combine like any other value", () => {
    const claims = [claim("a", "may-1..jun-2 prime", { specificity: "season" }), claim("b", "jul-1 prime")];
    expect(at(propose(claims, sources, US_WA, SHIPS), "jul-1")).toMatchObject({
      value: 0.75,
      rating: "prime",
    });
  });

  it("lists the applicable curves with their weights", () => {
    const p = propose(
      [claim("a", "jun-1 prime"), claim("m", "jun-1 fair", { origin: "mx" })],
      sources,
      US_WA,
      SHIPS,
    );
    expect(p.curves.map(({ source, weight }) => ({ source, weight }))).toEqual([{ source: "a", weight: 2 }]);
  });

  it("refuses an unknown source", () => {
    expect(() => propose([claim("zz", "jun-1 prime")], sources, US_WA, SHIPS)).toThrow("unknown source zz");
  });
});

// Properties over random claims.
const ratingArb = fc.constantFrom<Rating>("prime", "fair", "poor");
const windowArb = fc
  .record({
    from: fc.nat(WINDOW_COUNT - 1),
    length: fc.integer({ min: 1, max: WINDOW_COUNT }),
    rating: ratingArb,
  })
  .map(({ from, length, rating }) => ({
    from: label(from),
    to: label((from + length - 1) % WINDOW_COUNT),
    rating,
  }));
const claimArb: fc.Arbitrary<Claim> = fc.record(
  {
    source: fc.constantFrom(...SOURCES.map((s) => s.id)),
    origin: fc.constantFrom("us", "us-wa", "mx"),
    variety: fc.constantFrom("v1", "v2"),
    windows: fc.array(windowArb, { minLength: 1, maxLength: 3 }),
    specificity: fc.constantFrom("half-month" as const, "month" as const, "season" as const),
    directness: fc.constantFrom("eating-quality" as const, "availability" as const, "secondhand" as const),
  },
  { requiredKeys: ["source", "origin", "windows", "specificity", "directness"] },
);
const claimsArb = fc.array(claimArb, { maxLength: 8 });
const targetArb = fc.constantFrom<Target>(
  { origin: "us-wa" },
  { origin: "us-ca" },
  { origin: "mx" },
  { variety: "v1" },
);

const same = (a: Proposal, b: Proposal) =>
  a.windows.every((w, i) => {
    const v = b.windows[i] ?? null;
    if (w === null || v === null) return w === v;
    return (
      Math.abs(w.value - v.value) < 1e-9 &&
      Math.abs(w.weight - v.weight) < 1e-9 &&
      w.rating === v.rating &&
      w.confidence === v.confidence &&
      w.sources.join() === v.sources.join()
    );
  });

describe("combining curves: properties", () => {
  it("values, ratings and confidence stay consistent", () => {
    fc.assert(
      fc.property(claimsArb, targetArb, (claims, target) => {
        const p = propose(claims, sources, target, SHIPS);
        for (const [i, w] of p.windows.entries()) {
          const covered = p.curves.some((c) => c.values[i] !== null);
          expect(w !== null).toBe(covered);
          if (w === null) continue;
          expect(w.value).toBeGreaterThanOrEqual(0);
          expect(w.value).toBeLessThanOrEqual(1);
          expect(w.spread).toBeGreaterThanOrEqual(0);
          expect(w.spread).toBeLessThanOrEqual(0.5 + 1e-9);
          expect(w.rating).toBe(ratingForValue(w.value));
          expect(w.sources.length).toBeGreaterThan(0);
          if (w.sources.length < 2) expect(w.confidence).toBe("low");
          if (w.confidence === "high") expect(w.weight).toBeGreaterThanOrEqual(3 - 1e-9);
        }
      }),
    );
  });

  it("claim order doesn't matter", () => {
    fc.assert(
      fc.property(claimsArb, targetArb, fc.nat(), (claims, target, seed) => {
        const shuffled = [...claims].sort(
          (x, y) => ((claims.indexOf(x) * 7919 + seed) % 97) - ((claims.indexOf(y) * 7919 + seed) % 97),
        );
        expect(same(propose(claims, sources, target, SHIPS), propose(shuffled, sources, target, SHIPS))).toBe(
          true,
        );
      }),
    );
  });

  it("a light restatement of any claim changes nothing", () => {
    fc.assert(
      fc.property(claimsArb, targetArb, fc.nat(), (claims, target, pick) => {
        fc.pre(claims.length > 0);
        const original = claims[pick % claims.length] as Claim;
        // Only a strictly lighter restatement is ignored; an equal-weight one would join the average.
        const tier = (sources.get(original.source) as EvidenceSource).tier;
        fc.pre(claimWeight(tier, original.directness) > claimWeight("mainstream", "secondhand"));
        const restater: EvidenceSource = { id: "echo", tier: "mainstream", basedOn: original.source };
        const withEcho = new Map([...sources, ["echo", restater]]);
        const echo = { ...original, source: "echo", directness: "secondhand" as const };
        expect(
          same(propose(claims, sources, target, SHIPS), propose([...claims, echo], withEcho, target, SHIPS)),
        ).toBe(true);
      }),
    );
  });

  it("raising one claim to prime never lowers a window's value", () => {
    fc.assert(
      fc.property(claimsArb, targetArb, fc.nat(), (claims, target, pick) => {
        fc.pre(claims.length > 0);
        const k = pick % claims.length;
        const raised = claims.map((c, i) =>
          i === k ? { ...c, windows: c.windows.map((w) => ({ ...w, rating: "prime" as const })) } : c,
        );
        const before = propose(claims, sources, target, SHIPS).windows;
        const after = propose(raised, sources, target, SHIPS).windows;
        for (const [i, w] of before.entries()) {
          if (w === null) continue;
          expect(after[i]?.value).toBeGreaterThanOrEqual(w.value - 1e-9);
        }
      }),
    );
  });
});

describe("availability curves (P14)", () => {
  const avail = (windows: string, opts: Partial<Claim> = {}) =>
    claim("a", windows, { directness: "availability", origin: "us-wa", ...opts });
  const NOT_SHIPPING = { shipsWell: false, storesWell: false };
  const STORES = { shipsWell: true, storesWell: true };

  it.each([
    // In season prime, the half-month either side fair, the rest of the year poor.
    [
      "jun-1..aug-2 prime",
      ["may-1", "may-2", "jun-1", "aug-2", "sep-1", "sep-2", "jan-1"],
      [0, 0.5, 1, 1, 0.5, 0, 0],
    ],
    // Wraps past December.
    ["dec-1..feb-2 prime", ["nov-1", "nov-2", "dec-1", "feb-2", "mar-1", "mar-2"], [0, 0.5, 1, 1, 0.5, 0]],
    // Shoulders meeting in a one-window gap read fair.
    ["apr-1..may-2 prime, jun-2..jul-2 prime", ["may-2", "jun-1", "jun-2", "aug-1"], [1, 0.5, 1, 0.5]],
    // A shoulder never reads above the edge it touches.
    ["jun-1 fair", ["may-2", "jun-1", "jun-2", "jul-1"], [0.5, 0.5, 0.5, 0]],
    ["jun-1 poor", ["may-2", "jun-1", "jun-2"], [0, 0, 0]],
    // A shoulder never overrides a listed window.
    ["jun-1 prime, jun-2 poor", ["may-2", "jun-1", "jun-2", "jul-1"], [0.5, 1, 0, 0]],
  ])("a domestic chart listing %s", (windows, labels, values) => {
    const v = claimValues(avail(windows), SHIPS);
    expect(valuesAt(v, labels)).toEqual(values);
    expect(v.every((x) => x !== null)).toBe(true);
  });

  it("a US-grown claim naming no state keeps only its season and shoulders", () => {
    const v = claimValues(avail("apr-1..jun-2 prime", { origin: "us" }), STORES);
    expect(valuesAt(v, ["feb-1", "mar-2", "apr-1", "jun-2", "jul-1", "dec-1"])).toEqual([
      null,
      0.5,
      1,
      1,
      0.5,
      null,
    ]);
    // So a national chart can't make Florida's winter season poor.
    const p = propose([avail("apr-1..jun-2 prime", { origin: "us" })], sources, { origin: "us-fl" }, SHIPS);
    expect(at(p, "jan-1")).toBeNull();
  });

  it("a year-round listing has no shoulders", () => {
    expect(new Set(claimValues(avail("jan-1..dec-2 prime"), SHIPS))).toEqual(new Set([1]));
  });

  it("an import that ships well sits one level lower: its own season reads fair", () => {
    const v = claimValues(avail("dec-1..mar-2 prime", { origin: "mx" }), SHIPS);
    expect(valuesAt(v, ["nov-2", "dec-1", "mar-2", "apr-1", "jul-1"])).toEqual([0, 0.5, 0.5, 0, 0]);
  });

  it("an import that doesn't ship well reads poor all year, even in its own season", () => {
    const c = avail("dec-1..mar-2 prime", { origin: "mx" });
    expect(new Set(claimValues(c, NOT_SHIPPING))).toEqual(new Set([0]));
    expect(new Set(claimValues(c, { ...NOT_SHIPPING, storesWell: true }))).toEqual(new Set([0]));
    expect(at(propose([c], sources, { origin: "mx" }, NOT_SHIPPING), "jan-1")?.rating).toBe("poor");
  });

  it("an item that stores well reads fair away from harvest, never prime", () => {
    const v = claimValues(avail("aug-1..oct-2 prime"), STORES);
    expect(valuesAt(v, ["jul-1", "jul-2", "aug-1", "oct-2", "nov-1", "mar-1"])).toEqual([
      0.5, 0.5, 1, 1, 0.5, 0.5,
    ]);
    // An import that ships and stores well reads poor away from its own season, fair in it.
    const mx = claimValues(avail("mar-1..may-2 prime", { origin: "nz" }), STORES);
    expect(valuesAt(mx, ["feb-2", "mar-1", "may-2", "jun-1", "sep-1"])).toEqual([0, 0.5, 0.5, 0, 0]);
  });

  it("an import that tastes very good can still read prime from eating-quality evidence", () => {
    const claims = [
      claim("a", "dec-1..mar-2 prime", { origin: "cl" }),
      claim("b", "dec-1..mar-2 prime", { origin: "cl" }),
      claim("m", "dec-1..mar-2 prime", { origin: "cl", directness: "availability" }),
    ];
    expect(at(propose(claims, sources, { origin: "cl" }, SHIPS), "jan-1")?.rating).toBe("prime");
  });

  it("a variety's storesWell overrides its item's", () => {
    const item = {
      shipsWell: { value: true },
      storesWell: { value: false },
      varieties: [{ id: "v1", storesWell: { value: true } }, { id: "v2" }],
    };
    expect(traitsFor(item, { variety: "v1" }).storesWell).toBe(true);
    expect(traitsFor(item, { variety: "v2" }).storesWell).toBe(false);
    expect(traitsFor(item, US_WA).storesWell).toBe(false);
  });

  it("a domestic chart doesn't depend on shipping", () => {
    expect(claimValues(avail("jun-1..aug-2 prime"), NOT_SHIPPING)).toEqual(
      claimValues(avail("jun-1..aug-2 prime"), SHIPS),
    );
  });

  it("eating-quality and secondhand claims ignore P14, imports included", () => {
    for (const directness of ["eating-quality", "secondhand"] as const) {
      const v = claimValues(claim("a", "dec-1 prime", { origin: "mx", directness }), NOT_SHIPPING);
      expect(valuesAt(v, ["nov-2", "dec-1", "dec-2"])).toEqual([null, 1, null]);
    }
  });

  it("two agreeing charts propose poor off season, from 2 sources", () => {
    const claims = [
      avail("jun-1..aug-2 prime"),
      claim("b", "jun-1..aug-2 prime", { directness: "availability", origin: "us-wa" }),
    ];
    const p = propose(claims, sources, US_WA, SHIPS);
    expect(at(p, "jan-1")).toMatchObject({ rating: "poor", sources: ["a", "b"] });
    expect(at(p, "sep-1")).toMatchObject({ rating: "fair" });
    expect(at(p, "jul-1")).toMatchObject({ rating: "prime" });
  });

  const availArb = claimArb.map((c) => ({ ...c, directness: "availability" as const }));

  it("a domestic availability curve covers every window, keeps listed windows, and reads fair or poor elsewhere (fair throughout when it stores well) (property)", () => {
    fc.assert(
      fc.property(availArb, fc.boolean(), fc.boolean(), (c, shipsWell, storesWell) => {
        const domestic = { ...c, origin: "us-wa" };
        const v = claimValues(domestic, { shipsWell, storesWell });
        expect(v.every((x) => x !== null)).toBe(true);
        const listed = claimValues(
          { ...domestic, directness: "eating-quality", specificity: "month" },
          { shipsWell, storesWell },
        );
        v.forEach((x, i) => {
          const l = listed[i];
          if (l !== null && l !== undefined) expect(x).toBe(l);
          else expect(x).toBe(storesWell ? 0.5 : (x as number) > 0 ? 0.5 : 0);
        });
      }),
    );
  });

  it("an import's curve is the domestic curve one level lower, or poor throughout when the item doesn't ship well (property)", () => {
    fc.assert(
      fc.property(availArb, fc.boolean(), (c, storesWell) => {
        const traits = { shipsWell: true, storesWell };
        const domestic = claimValues({ ...c, origin: "us-wa" }, traits);
        const imported = claimValues({ ...c, origin: "mx" }, traits);
        expect(imported).toEqual(domestic.map((x) => Math.max(0, (x as number) - 0.5)));
        const notShipping = claimValues({ ...c, origin: "mx" }, { shipsWell: false, storesWell });
        expect(notShipping.every((x) => x === 0)).toBe(true);
      }),
    );
  });
});

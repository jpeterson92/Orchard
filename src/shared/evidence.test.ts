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
} from "./evidence";
import { WINDOW_COUNT, windowFromLabel } from "./time";
import type { Rating } from "./verdict";

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const label = (i: number) => `${MONTHS[Math.floor(i / 2)]}-${(i % 2) + 1}`;
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
const valuesAt = (values: (number | null)[], labels: string[]) =>
  labels.map((l) => values[windowFromLabel(l)]);

describe("claim curves", () => {
  it("map prime, fair and poor to 1, 0.5 and 0, and leave unrated windows empty", () => {
    const v = claimValues(claim("a", "may-1 prime, may-2 fair, jun-1 poor"));
    expect(valuesAt(v, ["apr-2", "may-1", "may-2", "jun-1", "jun-2"])).toEqual([null, 1, 0.5, 0, null]);
    expect(v.filter((x) => x !== null)).toHaveLength(3);
  });

  it.each([["half-month" as const], ["month" as const]])("keep sharp edges for a %s claim", (specificity) => {
    const v = claimValues(claim("a", "may-1..jun-2 prime", { specificity }));
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
    const v = claimValues(claim("a", windows, { specificity: "season" }));
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

  // [independent sources, total weight, spread, an authoritative source, confidence]
  it.each([
    [2, 3, 0.2, true, "high"],
    [2, 3, 0.2, false, "medium"],
    [2, 2.9, 0, true, "medium"],
    [2, 3, 0.21, true, "medium"],
    [3, 5, 0.35, true, "medium"],
    [3, 5, 0.36, true, "low"],
    [1, 4, 0, true, "low"],
  ] as const)("%d sources, weight %d, spread %d, authoritative %s: %s", (n, w, s, auth, expected) => {
    expect(combinedConfidence(n, w, s, auth)).toBe(expected);
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
    const p = propose([claim("a", "jun-1 prime"), claim("b", "jun-1 prime")], sources, US_WA);
    expect(p.windows.filter((w) => w !== null)).toHaveLength(1);
    expect(propose([], sources, US_WA).windows.every((w) => w === null)).toBe(true);
  });

  it("two agreeing authoritative sources: prime, high confidence", () => {
    expect(
      at(propose([claim("a", "jun-1 prime"), claim("b", "jun-1 prime")], sources, US_WA), "jun-1"),
    ).toEqual({ value: 1, rating: "prime", confidence: "high", weight: 4, spread: 0, sources: ["a", "b"] });
  });

  it("takes the weighted mean, and spread lowers confidence", () => {
    const w = at(propose([claim("a", "jun-1 prime"), claim("m", "jun-1 fair")], sources, US_WA), "jun-1");
    expect(w?.value).toBeCloseTo(2.5 / 3, 12);
    expect(w?.spread).toBeCloseTo(Math.sqrt(1 / 18), 12);
    expect(w).toMatchObject({ rating: "prime", confidence: "medium", weight: 3 });
  });

  it("strong disagreement is fair at low confidence", () => {
    expect(
      at(propose([claim("a", "jun-1 prime"), claim("b", "jun-1 poor")], sources, US_WA), "jun-1"),
    ).toMatchObject({ value: 0.5, rating: "fair", spread: 0.5, confidence: "low" });
  });

  it("one source alone is low confidence", () => {
    expect(at(propose([claim("a", "jun-1 prime")], sources, US_WA), "jun-1")?.confidence).toBe("low");
  });

  it("too little weight stays medium", () => {
    const avail = { directness: "availability" as const };
    const claims = [claim("a", "jun-1 prime", avail), claim("b", "jun-1 prime", avail)];
    expect(at(propose(claims, sources, US_WA), "jun-1")).toMatchObject({ weight: 2.4, confidence: "medium" });
  });

  it("no authoritative source stays medium", () => {
    const claims = ["m", "n", "o"].map((s) => claim(s, "jun-1 prime"));
    expect(at(propose(claims, sources, US_WA), "jun-1")).toMatchObject({ weight: 3, confidence: "medium" });
  });

  it("a restating source counts once, keeping the higher weight", () => {
    const w = at(propose([claim("a", "jun-1 prime"), claim("ra", "jun-1 poor")], sources, US_WA), "jun-1");
    expect(w).toMatchObject({ value: 1, weight: 2, sources: ["a"], confidence: "low" });
  });

  it("the restatement wins when it weighs more, named by its root", () => {
    const w = at(propose([claim("m", "jun-1 fair"), claim("rm", "jun-1 prime")], sources, US_WA), "jun-1");
    expect(w).toMatchObject({ value: 1, weight: 2, sources: ["m"] });
  });

  it("restatement chains trace back to the first source", () => {
    const claims = [claim("a", "jun-1 prime"), claim("rra", "jun-1 prime"), claim("b", "jun-1 prime")];
    expect(at(propose(claims, sources, US_WA), "jun-1")?.sources).toEqual(["a", "b"]);
  });

  it("a source's equal-weight claims average; a heavier one replaces a lighter one", () => {
    const tied = propose([claim("a", "jun-1 prime"), claim("a", "jun-1 fair")], sources, US_WA);
    expect(at(tied, "jun-1")).toMatchObject({ value: 0.75, weight: 2, sources: ["a"] });
    const heavier = propose(
      [claim("a", "jun-1 poor", { directness: "availability" }), claim("a", "jun-1 prime")],
      sources,
      US_WA,
    );
    expect(at(heavier, "jun-1")).toMatchObject({ value: 1, weight: 2 });
  });

  it("season shoulders combine like any other value", () => {
    const claims = [claim("a", "may-1..jun-2 prime", { specificity: "season" }), claim("b", "jul-1 prime")];
    expect(at(propose(claims, sources, US_WA), "jul-1")).toMatchObject({ value: 0.75, rating: "prime" });
  });

  it("lists the applicable curves with their weights", () => {
    const p = propose(
      [claim("a", "jun-1 prime"), claim("m", "jun-1 fair", { origin: "mx" })],
      sources,
      US_WA,
    );
    expect(p.curves.map(({ source, weight }) => ({ source, weight }))).toEqual([{ source: "a", weight: 2 }]);
  });

  it("refuses an unknown source", () => {
    expect(() => propose([claim("zz", "jun-1 prime")], sources, US_WA)).toThrow("unknown source zz");
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
        const p = propose(claims, sources, target);
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
        expect(same(propose(claims, sources, target), propose(shuffled, sources, target))).toBe(true);
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
        expect(same(propose(claims, sources, target), propose([...claims, echo], withEcho, target))).toBe(
          true,
        );
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
        const before = propose(claims, sources, target).windows;
        const after = propose(raised, sources, target).windows;
        for (const [i, w] of before.entries()) {
          if (w === null) continue;
          expect(after[i]?.value).toBeGreaterThanOrEqual(w.value - 1e-9);
        }
      }),
    );
  });
});

import { describe, expect, it } from "vitest";
import { windowFromLabel } from "../time";
import {
  type Confidence,
  type CoreResult,
  type Env,
  type EvalContext,
  evaluate,
  type ItemInputs,
  looksAlwaysGood,
  typicalLevels,
  typicalOutlook,
  type VerdictResult,
} from "./index";
import { allMonths, ENV, item, NOV_17, rated, variety } from "./test-helpers";

const today: EvalContext = { date: NOV_17 };
const NOV = 10; // month index of NOV_17

/** Typical origins and supply that differ in November only. */
const inNov = <T>(rest: T, nov: T): T[] => allMonths(rest).map((v, m) => (m === NOV ? nov : v));

interface Case {
  name: string;
  item: ItemInputs;
  ctx?: Partial<EvalContext>;
  env?: Env;
  verdict: CoreResult["verdict"];
  rule: CoreResult["ruleFired"];
  weak?: CoreResult["weakProperties"];
}

const two = { "us-ca": rated("prime"), mx: rated("prime") };

const cases: Case[] = [
  // Rule 1: Limited evidence
  {
    name: "1: no typical origins in any month",
    item: item({ typicalOrigins: allMonths([]) }),
    verdict: "limited",
    rule: 1,
    weak: ["coverage"],
  },
  {
    name: "1: one of two typical origins unrated (P1)",
    item: item({
      origins: { "us-ca": rated("prime"), mx: rated(null) },
      typicalOrigins: allMonths(["us-ca", "mx"]),
    }),
    verdict: "limited",
    rule: 1,
  },
  {
    name: "1: rated origins hold 75% of the typical volume, so an unrated small one is passed over (P1)",
    item: item({
      origins: { "us-ca": rated("prime"), mx: rated(null) },
      typicalOrigins: allMonths(["us-ca", "mx"]),
      typicalShares: allMonths([0.6, 0.2]),
    }),
    verdict: "peak",
    rule: 3,
  },
  {
    name: "1: rated origins hold under 75% of the typical volume (P1)",
    item: item({
      origins: { "us-ca": rated("prime"), mx: rated(null) },
      typicalOrigins: allMonths(["us-ca", "mx"]),
      typicalShares: allMonths([0.59, 0.21]),
    }),
    verdict: "limited",
    rule: 1,
  },
  {
    name: "1: an unrated top origin under 25% of typical volume leaves the next rated one deciding (P1)",
    item: item({
      origins: { mx: rated(null), "us-ca": rated("poor"), cl: rated("fair"), pe: rated("fair") },
      typicalOrigins: allMonths(["mx", "us-ca", "cl", "pe"]),
      typicalShares: allMonths([0.2, 0.2, 0.2, 0.2]),
    }),
    verdict: "good",
    rule: 4,
  },
  {
    name: "1: editorial typical origins carry no share, so every one must be rated (P1)",
    item: item({
      origins: { "us-ca": rated("prime"), mx: rated(null) },
      typicalOrigins: allMonths(["us-ca", "mx"]),
      typicalShares: allMonths([null, null]),
    }),
    verdict: "limited",
    rule: 1,
  },
  {
    name: "1: top origin unrated in this window only",
    item: item({ origins: { "us-ca": rated("prime", { "nov-2": null }) } }),
    verdict: "limited",
    rule: 1,
  },
  {
    name: "1: typical origin missing from the item's rated origins",
    item: item({ typicalOrigins: allMonths(["cl"]) }),
    verdict: "limited",
    rule: 1,
  },
  // Rule 2: Skip
  {
    name: "2: no typical origins this month, though some in others: out of season (P18)",
    item: item({ typicalOrigins: inNov(["us-ca"], []) }),
    verdict: "skip",
    rule: 2,
    weak: [],
  },
  {
    name: "2: out of season even when Peak isn't worth seeking (P18)",
    item: item({ peakWorthSeeking: false, typicalOrigins: inNov(["us-ca"], []) }),
    verdict: "skip",
    rule: 2,
  },
  {
    name: "2: top origin poor",
    item: item({ origins: { "us-ca": rated("poor") } }),
    verdict: "skip",
    rule: 2,
  },
  {
    name: "2: poor with strong supply weakens agreement",
    item: item({ origins: { "us-ca": rated("poor") }, supply: { "us-ca": allMonths(1.2) } }),
    verdict: "skip",
    rule: 2,
    weak: ["agreement"],
  },
  // Rule 3: Peak
  { name: "3: prime, normal supply", item: item(), verdict: "peak", rule: 3, weak: [] },
  {
    name: "3: prime, supply exactly at the thin line",
    item: item({ supply: { "us-ca": allMonths(0.8) } }),
    verdict: "peak",
    rule: 3,
  },
  {
    name: "3: prime, no supply index",
    item: item({ supply: { "us-ca": allMonths(null) } }),
    verdict: "peak",
    rule: 3,
  },
  // Rule 4: Good
  {
    name: "4: prime but thin supply",
    item: item({ supply: { "us-ca": allMonths(0.79) } }),
    verdict: "good",
    rule: 4,
    weak: ["agreement"],
  },
  {
    name: "4: fair",
    item: item({ origins: { "us-ca": rated("fair") } }),
    verdict: "good",
    rule: 4,
    weak: [],
  },
  // Precedence pairs
  {
    name: "1 over 2: an unrated second origin beats a poor top origin",
    item: item({
      origins: { "us-ca": rated("poor"), mx: rated(null) },
      typicalOrigins: allMonths(["us-ca", "mx"]),
    }),
    verdict: "limited",
    rule: 1,
  },
  {
    name: "1 over 3: an unrated second origin beats a prime top origin",
    item: item({
      origins: { "us-ca": rated("prime"), mx: rated(null) },
      typicalOrigins: allMonths(["us-ca", "mx"]),
    }),
    verdict: "limited",
    rule: 1,
  },
  {
    name: "P20: poor top origin, prime second holding half: Peak by the label",
    item: item({
      origins: { "us-ca": rated("poor"), mx: rated("prime") },
      typicalOrigins: allMonths(["us-ca", "mx"]),
      supply: { "us-ca": allMonths(1), mx: allMonths(1) },
    }),
    verdict: "peak",
    rule: 3,
  },
  {
    name: "2 over 4: poor top origin, prime second on Low evidence",
    item: item({
      origins: { "us-ca": rated("poor"), mx: rated("prime", {}, { "nov-2": "low" }) },
      typicalOrigins: allMonths(["us-ca", "mx"]),
    }),
    verdict: "skip",
    rule: 2,
  },
  {
    name: "3 over 4: prime top origin, fair second",
    item: item({
      origins: { "us-ca": rated("prime"), mx: rated("fair") },
      typicalOrigins: allMonths(["us-ca", "mx"]),
    }),
    verdict: "peak",
    rule: 3,
  },
  // Rule 3 needs a Peak worth seeking
  {
    name: "3: prime, normal supply, Peak not worth seeking: rule 4 Good",
    item: item({ peakWorthSeeking: false }),
    verdict: "good",
    rule: 4,
  },
  {
    name: "2: poor stays Skip when Peak isn't worth seeking",
    item: item({ peakWorthSeeking: false, origins: { "us-ca": rated("poor") } }),
    verdict: "skip",
    rule: 2,
  },
  {
    name: "1: Limited evidence stays when Peak isn't worth seeking",
    item: item({ peakWorthSeeking: false, typicalOrigins: allMonths(["cl"]) }),
    verdict: "limited",
    rule: 1,
  },
  {
    name: "4: thin supply and Peak not worth seeking",
    item: item({ peakWorthSeeking: false, supply: { "us-ca": allMonths(0.5) } }),
    verdict: "good",
    rule: 4,
  },
  // P9: the top-ranked origin decides
  {
    name: "P20: fair top origin, prime second holding half",
    item: item({
      origins: { "us-ca": rated("fair"), mx: rated("prime") },
      typicalOrigins: allMonths(["us-ca", "mx"]),
    }),
    verdict: "peak",
    rule: 3,
  },
  {
    name: "P20: November's ranking applies in November (prime top, poor second: Peak by the label)",
    item: item({
      origins: { "us-ca": rated("poor"), mx: rated("prime") },
      typicalOrigins: inNov(["us-ca", "mx"], ["mx", "us-ca"]),
    }),
    verdict: "peak",
    rule: 3,
    weak: ["agreement"],
  },
  // The deciding origin's own supply (P11)
  {
    name: "3: thin supply at another origin doesn't hold the top origin's Peak",
    item: item({
      origins: two,
      typicalOrigins: allMonths(["us-ca", "mx"]),
      supply: { "us-ca": allMonths(1), mx: allMonths(0.5) },
    }),
    verdict: "peak",
    rule: 3,
  },
  {
    name: "3: thin supply at the origin that tops November leaves the other prime origin, holding half",
    item: item({
      origins: two,
      typicalOrigins: inNov(["us-ca", "mx"], ["mx", "us-ca"]),
      supply: { "us-ca": allMonths(1), mx: allMonths(0.5) },
    }),
    verdict: "peak",
    rule: 3,
  },
  {
    name: "4: thin supply at both prime origins",
    item: item({
      origins: two,
      typicalOrigins: allMonths(["us-ca", "mx"]),
      supply: { "us-ca": allMonths(0.5), mx: allMonths(0.5) },
    }),
    verdict: "good",
    rule: 4,
  },
  {
    name: "3: an import in a normal month of its own season, with no US supply that month",
    item: item({
      origins: { mx: rated("prime") },
      typicalOrigins: allMonths(["mx"]),
      supply: { mx: allMonths(1.1) },
    }),
    verdict: "peak",
    rule: 3,
  },
  {
    name: "4: a label origin uses its own thin supply",
    item: item({
      origins: two,
      typicalOrigins: allMonths(["us-ca", "mx"]),
      supply: { "us-ca": allMonths(1), mx: allMonths(0.5) },
    }),
    ctx: { labelOrigin: "mx" },
    verdict: "good",
    rule: 4,
  },
  // P17: a poor typical origin doesn't hold the top origin's Peak; the shopper picks by the label
  {
    name: "3: prime top origin, poor third",
    item: item({
      origins: { "us-ca": rated("prime"), mx: rated("fair"), cl: rated("poor") },
      typicalOrigins: allMonths(["us-ca", "mx", "cl"]),
    }),
    verdict: "peak",
    rule: 3,
    weak: ["agreement"],
  },
  {
    name: "3: prime top origin, fair others",
    item: item({
      origins: { "us-ca": rated("prime"), mx: rated("fair"), cl: rated("fair") },
      typicalOrigins: allMonths(["us-ca", "mx", "cl"]),
    }),
    verdict: "peak",
    rule: 3,
  },
  {
    name: "4 for a label origin: the shopper's origin alone decides",
    item: item({
      origins: { "us-ca": rated("prime"), mx: rated("poor") },
      typicalOrigins: allMonths(["us-ca", "mx"]),
    }),
    ctx: { labelOrigin: "us-ca" },
    verdict: "peak",
    rule: 3,
  },
  {
    name: "2 over the poor-origin hold: poor top origin is Skip",
    item: item({
      origins: { "us-ca": rated("poor"), mx: rated("poor") },
      typicalOrigins: allMonths(["us-ca", "mx"]),
    }),
    verdict: "skip",
    rule: 2,
  },
];

describe("rules 1–4", () => {
  it.each(cases)("$name", (c) => {
    const r = evaluate(c.item, { ...today, ...c.ctx }, c.env ?? ENV);
    expect([r.verdict, r.ruleFired]).toEqual([c.verdict, c.rule]);
    if (c.weak) expect(r.weakProperties).toEqual(c.weak);
  });
});

describe("which origins decide (P20)", () => {
  type R = "prime" | "fair" | "poor";
  // Up to three typical origins splitting the volume evenly, so each holds at least a third of the typical supply.
  const run = (ratings: R[], ctx: Partial<EvalContext> = {}, secondEvidence?: Confidence) => {
    const ids = ["us-ca", "mx", "us-ga"].slice(0, ratings.length);
    const origins = Object.fromEntries(
      ids.map((o, i) => [
        o,
        rated(ratings[i] as R, {}, i === 1 && secondEvidence ? { "nov-2": secondEvidence } : undefined),
      ]),
    );
    return evaluate(
      item({
        origins,
        typicalOrigins: allMonths(ids),
        supply: Object.fromEntries(ids.map((o) => [o, allMonths(1)])),
      }),
      { ...today, ...ctx },
      ENV,
    );
  };
  const rated_ = (r: VerdictResult) => r.reasons.find((x) => x.code === "rated");
  const poor_ = (r: VerdictResult) =>
    r.reasons.find(
      (x): x is Extract<typeof x, { code: "typical-origin-poor" }> => x.code === "typical-origin-poor",
    );
  const lookFor = (r: VerdictResult) =>
    r.reasons.find((x): x is Extract<typeof x, { code: "look-for" }> => x.code === "look-for")?.origins;

  it.each([
    // [ratings by rank, verdict, origins to look for, deciding origin, poor origin named]
    [["prime", "prime"], "peak", undefined, "us-ca", undefined],
    [["prime", "fair"], "peak", ["us-ca"], "us-ca", undefined],
    [["prime", "poor"], "peak", ["us-ca"], "us-ca", "mx"],
    [["fair", "prime"], "peak", ["mx"], "mx", undefined],
    [["fair", "fair"], "good", undefined, "us-ca", undefined],
    [["fair", "poor"], "good", ["us-ca"], "us-ca", "mx"],
    [["poor", "prime"], "peak", ["mx"], "mx", "us-ca"],
    [["poor", "fair"], "good", ["mx"], "mx", "us-ca"],
    [["poor", "poor"], "skip", undefined, "us-ca", undefined],
    [["poor"], "skip", undefined, "us-ca", undefined],
    [["prime", "fair", "poor"], "peak", ["us-ca"], "us-ca", "us-ga"],
    [["prime", "fair", "fair"], "peak", ["us-ca"], "us-ca", undefined],
    [["poor", "poor", "fair"], "good", ["us-ga"], "us-ga", "us-ca"],
    [["poor", "fair", "poor"], "good", ["mx"], "mx", "us-ca"],
    [["fair", "prime", "prime"], "peak", ["mx", "us-ga"], "mx", undefined],
  ] as const)("%j → %s, look for %j, decided by %s", (ratings, verdict, look, decider, poor) => {
    const r = run([...ratings]);
    expect(r.verdict).toBe(verdict);
    expect(lookFor(r)).toEqual(look);
    expect(r.labelNote).toBe(look !== undefined);
    expect(r.markers.some((m) => m.kind === "check-label")).toBe(look !== undefined);
    expect(rated_(r)).toMatchObject({ origin: decider });
    expect(poor_(r)?.origin).toBe(poor);
    if (look) expect(r.weakProperties).toContain("agreement");
  });

  it("a second origin on Low evidence never lifts a poor top origin", () => {
    const r = run(["poor", "fair"], {}, "low");
    expect([r.verdict, r.ruleFired, r.labelNote]).toEqual(["skip", 2, false]);
  });
  it("Low evidence on the second origin still counts as at its level when the top origin is", () => {
    const r = run(["prime", "prime"], {}, "low");
    expect([r.verdict, r.labelNote]).toEqual(["peak", false]);
  });
  it("Medium evidence on the second origin is enough", () =>
    expect(run(["poor", "fair"], {}, "medium").verdict).toBe("good"));
  it("label advice for the poor origin is Skip, with no note", () => {
    const r = run(["fair", "poor"], { labelOrigin: "mx" });
    expect([r.verdict, r.labelNote]).toEqual(["skip", false]);
  });
  it("supply comes from the deciding origin", () => {
    const r = evaluate(
      item({
        origins: { "us-ca": rated("poor"), mx: rated("fair") },
        typicalOrigins: allMonths(["us-ca", "mx"]),
        supply: { "us-ca": allMonths(2), mx: allMonths(1) },
      }),
      today,
      ENV,
    );
    expect(r.weakProperties).toEqual(["agreement"]);
  });
});

describe("a level reasonably likely on the shelf (P20)", () => {
  // Typical origins with explicit shares of the month's volume, supply normal everywhere.
  const shares = (
    ratings: Record<string, "prime" | "fair" | "poor">,
    volume: (number | null)[],
    overrides: Partial<ItemInputs> = {},
  ) => {
    const ids = Object.keys(ratings);
    return item({
      origins: Object.fromEntries(ids.map((o) => [o, rated(ratings[o] ?? null)])),
      typicalOrigins: allMonths(ids),
      typicalShares: allMonths(volume),
      supply: Object.fromEntries(ids.map((o) => [o, allMonths(1)])),
      ...overrides,
    });
  };
  const at = (i: ItemInputs) => evaluate(i, today, ENV);
  const decidedBy = (r: VerdictResult) => r.reasons.find((x) => x.code === "rated");
  const lookFor = (r: VerdictResult) =>
    r.reasons.find((x): x is Extract<typeof x, { code: "look-for" }> => x.code === "look-for")?.origins;

  it("a third of the typical supply is enough, measured against the typical origins, not the month", () => {
    // Arizona holds 0.32 of the month but 45% of the typical supply.
    const r = at(shares({ gt: "poor", "us-az": "prime" }, [0.39, 0.32]));
    expect([r.verdict, decidedBy(r)?.origin, lookFor(r)]).toEqual(["peak", "us-az", ["us-az"]]);
  });
  it("just under a third doesn't count", () => {
    const r = at(shares({ "us-ca": "poor", mx: "prime" }, [0.68, 0.32]));
    expect([r.verdict, r.labelNote]).toEqual(["skip", false]);
    expect(r.reasons).not.toContainEqual(expect.objectContaining({ code: "look-for" }));
  });
  it("exactly a third counts", () =>
    expect(at(shares({ "us-ca": "poor", mx: "fair", "us-ga": "poor" }, [0.3, 0.3, 0.3])).verdict).toBe(
      "good",
    ));
  it("origins at the level add up", () => {
    const r = at(shares({ "us-ca": "poor", "us-ga": "prime", mx: "prime" }, [0.6, 0.2, 0.2]));
    expect([r.verdict, lookFor(r)]).toEqual(["peak", ["us-ga", "mx"]]);
  });
  it("Good counts prime origins too: a minor prime origin under fair supply is Good with nothing to pick", () => {
    const r = at(shares({ "us-ca": "fair", mx: "prime" }, [0.7, 0.2]));
    expect([r.verdict, r.labelNote, decidedBy(r)?.origin]).toEqual(["good", false, "us-ca"]);
  });
  it("a cited in-store month counts an origin as available whatever its share", () => {
    const base = shares({ "us-ca": "fair", mx: "prime" }, [0.7, 0.1]);
    expect(at(base).verdict).toBe("good");
    const cited = at({ ...base, originInStores: { mx: inNov(false, true) } });
    expect([cited.verdict, lookFor(cited)]).toEqual(["peak", ["mx"]]);
    expect(at({ ...base, originInStores: { mx: inNov(true, false) } }).verdict).toBe("good");
  });
  it("no label note above three quarters at the level, and one at three quarters", () => {
    expect(at(shares({ "us-ca": "prime", mx: "poor" }, [0.76, 0.24])).labelNote).toBe(false);
    expect(at(shares({ "us-ca": "prime", mx: "poor" }, [0.6, 0.2])).labelNote).toBe(true);
  });
  it("the item page still names a poor origin below a quarter", () => {
    const r = at(shares({ "us-ca": "prime", mx: "poor" }, [0.7, 0.17]));
    expect([r.verdict, r.labelNote]).toEqual(["peak", false]);
    expect(r.reasons).toContainEqual({ code: "typical-origin-poor", origin: "mx" });
  });
  it("names every origin to look for, top first", () =>
    expect(
      lookFor(
        at(
          shares(
            { "us-ca": "poor", mx: "prime", "us-ga": "prime", "us-fl": "prime", "us-tx": "prime" },
            [0.3, 0.1, 0.1, 0.1, 0.1],
          ),
        ),
      ),
    ).toEqual(["mx", "us-ga", "us-fl", "us-tx"]));
  it("far and thin prime origins don't count toward Peak, but count toward Good", () => {
    const far = at(shares({ "us-ca": "poor", pe: "prime" }, [0.5, 0.4]));
    expect([far.verdict, decidedBy(far)?.origin]).toEqual(["good", "pe"]);
    const thin = shares({ "us-ca": "poor", mx: "prime" }, [0.5, 0.4]);
    expect(at({ ...thin, supply: { ...thin.supply, mx: allMonths(0.5) } }).verdict).toBe("good");
  });
  it("Low evidence counts for the top origin but not for others", () => {
    const low = (o: string) =>
      shares({ "us-ca": "prime", mx: "poor" }, [0.4, 0.4], {
        origins: {
          "us-ca": rated("prime", {}, o === "us-ca" ? { "nov-2": "low" } : undefined),
          mx: rated("poor"),
        },
      });
    expect(at(low("us-ca")).verdict).toBe("peak");
    const second = shares({ "us-ca": "poor", mx: "prime" }, [0.4, 0.4], {
      origins: { "us-ca": rated("poor"), mx: rated("prime", {}, { "nov-2": "low" }) },
    });
    expect(at(second).verdict).toBe("skip");
  });
  it("never Peak when Peak isn't worth seeking; the Good level then decides", () => {
    const r = at(shares({ "us-ca": "fair", mx: "prime" }, [0.4, 0.4], { peakWorthSeeking: false }));
    expect([r.verdict, lookFor(r)]).toEqual(["good", undefined]);
  });
  it("all origins prime: Peak with no label note and no origin list", () => {
    const r = at(shares({ "us-ca": "prime", "us-ga": "prime" }, [0.5, 0.3]));
    expect([r.verdict, r.labelNote, lookFor(r)]).toEqual(["peak", false, undefined]);
  });
  it("editorial origins count each major origin equally, and minor ones not at all", () => {
    const editorial = (minor: string[]) =>
      shares({ "us-ca": "poor", "us-ga": "prime", mx: "poor", "us-fl": "poor" }, [null, null, null, null], {
        minorOrigins: allMonths(minor),
      });
    expect(at(editorial([])).verdict).toBe("skip"); // 1 of 4 major
    expect(at(editorial(["mx"])).verdict).toBe("peak"); // 1 of 3 major
    expect(at(editorial(["us-ga", "mx"])).verdict).toBe("skip"); // a minor prime origin weighs nothing
  });
});

describe("the P20 trace (typicalLevels)", () => {
  const shares = (ratings: Record<string, "prime" | "fair" | "poor">, volume: number[]) => {
    const ids = Object.keys(ratings);
    return item({
      origins: Object.fromEntries(ids.map((o) => [o, rated(ratings[o] ?? null)])),
      typicalOrigins: allMonths(ids),
      typicalShares: allMonths(volume),
      supply: Object.fromEntries(ids.map((o) => [o, allMonths(1)])),
    });
  };
  it("weighs each level's share and says how it is available", () => {
    const l = typicalLevels(
      shares({ "us-ca": "poor", mx: "prime", "us-ga": "fair" }, [0.25, 0.5, 0.25]),
      today,
      ENV,
    );
    expect(l?.weights).toBe("volume");
    expect(l?.typical.map((o) => [o.origin, o.rating])).toEqual([
      ["us-ca", "poor"],
      ["mx", "prime"],
      ["us-ga", "fair"],
    ]);
    expect([l?.peak.origins.map((o) => o.origin), l?.peak.share, l?.peak.available]).toEqual([
      ["mx"],
      0.5,
      "share",
    ]);
    expect([l?.good.origins.map((o) => o.origin), l?.good.share, l?.good.available]).toEqual([
      ["mx", "us-ga"],
      0.75,
      "share",
    ]);
  });
  it("matches the verdict: an unavailable Peak set gives Good, a cited in-store month makes it available", () => {
    const base = shares({ "us-ca": "fair", mx: "prime" }, [0.7, 0.1]);
    expect([typicalLevels(base, today, ENV)?.peak.available, evaluate(base, today, ENV).verdict]).toEqual([
      null,
      "good",
    ]);
    const cited = { ...base, originInStores: { mx: allMonths(true) } };
    expect([typicalLevels(cited, today, ENV)?.peak.available, evaluate(cited, today, ENV).verdict]).toEqual([
      "in-stores",
      "peak",
    ]);
  });
  it("marks a low-confidence origin below the top as not counted", () => {
    const low = item({
      origins: { "us-ca": rated("poor"), mx: rated("prime", {}, { "nov-2": "low" }) },
      typicalOrigins: allMonths(["us-ca", "mx"]),
      typicalShares: allMonths([0.4, 0.4]),
      supply: { "us-ca": allMonths(1), mx: allMonths(1) },
    });
    const l = typicalLevels(low, today, ENV);
    expect([l?.peak.origins[0]?.counts, l?.peak.share, l?.peak.countedShare, l?.peak.available]).toEqual([
      false,
      0.5,
      0,
      null,
    ]);
  });
  it("is null where no levels are weighed: rated by variety, out of season, or too little rated (P1)", () => {
    expect(typicalLevels(item({ varieties: [variety("a", rated("prime"))] }), today, ENV)).toBeNull();
    expect(typicalLevels(item({ typicalOrigins: inNov(["us-ca"], []) }), today, ENV)).toBeNull();
    expect(typicalLevels(item({ typicalOrigins: allMonths(["us-ca", "mx", "pe"]) }), today, ENV)).toBeNull();
  });
  it("leaves VerdictResult unchanged: no trace on the result", () =>
    expect(Object.keys(evaluate(item(), today, ENV))).not.toContain("levels"));
});

describe("confidence (P10)", () => {
  const conf = (i: ItemInputs, env: Env = ENV) => {
    const r = evaluate(i, today, env);
    return [r.confidence, r.weakProperties];
  };
  it("High with no weak property", () => expect(conf(item())).toEqual(["high", []]));
  it("coverage: Low combined evidence for the deciding origin", () =>
    expect(conf(item({ origins: { "us-ca": rated("prime", {}, { "nov-2": "low" }) } }))).toEqual([
      "medium",
      ["coverage"],
    ]));
  it("coverage: Medium evidence is not weak", () =>
    expect(conf(item({ origins: { "us-ca": rated("prime", {}, { "nov-2": "medium" }) } }))).toEqual([
      "high",
      [],
    ]));
  it("coverage: Low evidence on a lower-ranked origin is not weak", () =>
    expect(
      conf(
        item({
          origins: { "us-ca": rated("prime"), mx: rated("prime", {}, { "nov-2": "low" }) },
          typicalOrigins: allMonths(["us-ca", "mx"]),
        }),
      ),
    ).toEqual(["high", []]));
  it("relevance: assessment-only item", () =>
    expect(conf(item({ evidenceBasis: "assessment-only" }))).toEqual(["medium", ["relevance"]]));
  it("freshness: snapshot 16 months old", () =>
    expect(conf(item(), { ...ENV, snapshotTo: "2025-07" })).toEqual(["medium", ["freshness"]]));
  it("freshness: snapshot exactly 15 months old is fresh", () =>
    expect(conf(item(), { ...ENV, snapshotTo: "2025-08" })).toEqual(["high", []]));
  it("freshness: no snapshot", () =>
    expect(conf(item(), { ...ENV, snapshotTo: null })).toEqual(["medium", ["freshness"]]));
  it("freshness: assessment-only items don't depend on the snapshot", () =>
    expect(conf(item({ evidenceBasis: "assessment-only" }), { ...ENV, snapshotTo: null })).toEqual([
      "medium",
      ["relevance"],
    ]));
  it("Low with two weak properties", () =>
    expect(conf(item({ evidenceBasis: "assessment-only", supply: { "us-ca": allMonths(0.5) } }))).toEqual([
      "low",
      ["relevance", "agreement"],
    ]));
  it("Limited evidence is always weak on coverage", () =>
    expect(conf(item({ origins: { "us-ca": rated(null) } }))).toEqual(["medium", ["coverage"]]));
});

describe("markers", () => {
  const kinds = (i: ItemInputs, ctx: Partial<EvalContext> = {}) =>
    evaluate(i, { ...today, ...ctx }, ENV).markers;

  it("Last call when the outlook drops within 2 windows", () =>
    expect(kinds(item({ origins: { "us-ca": rated("prime", { "dec-2": "fair" }) } }))).toContainEqual({
      kind: "last-call",
      fadesBy: windowFromLabel("dec-2"),
    }));
  it("Last call names the first drop", () =>
    expect(
      kinds(item({ origins: { "us-ca": rated("prime", { "dec-1": "fair", "dec-2": "poor" }) } })),
    ).toContainEqual({
      kind: "last-call",
      fadesBy: windowFromLabel("dec-1"),
    }));
  it("no Last call when the drop is 3 windows away", () =>
    expect(
      kinds(item({ origins: { "us-ca": rated("prime", { "jan-1": "fair" }) } })).map((m) => m.kind),
    ).not.toContain("last-call"));
  it("no Last call when the outlook turns to Limited evidence", () =>
    expect(
      kinds(item({ origins: { "us-ca": rated("prime", { "dec-1": null }) } })).map((m) => m.kind),
    ).not.toContain("last-call"));
  it("Last call on Good dropping to Skip, wrapping into January", () =>
    expect(
      evaluate(
        item({ origins: { "us-ca": rated("fair", { "jan-1": "poor" }) } }),
        { date: { year: 2026, month: 12, day: 20 } },
        ENV,
      ).markers,
    ).toContainEqual({ kind: "last-call", fadesBy: 0 }));
  it("no Last call on Skip", () =>
    expect(kinds(item({ origins: { "us-ca": rated("poor") } })).map((m) => m.kind)).not.toContain(
      "last-call",
    ));

  it("Reliable year-round at 20 of 24 windows Good or better", () => {
    const four = { "jan-1": "poor", "feb-1": "poor", "mar-1": "poor", "apr-1": "poor" } as const;
    expect(kinds(item({ origins: { "us-ca": rated("fair", four) } }))).toContainEqual({
      kind: "reliable-year-round",
    });
  });
  it("not Reliable year-round at 19 of 24", () => {
    const five = {
      "jan-1": "poor",
      "feb-1": "poor",
      "mar-1": "poor",
      "apr-1": "poor",
      "may-1": "poor",
    } as const;
    expect(kinds(item({ origins: { "us-ca": rated("fair", five) } })).map((m) => m.kind)).not.toContain(
      "reliable-year-round",
    );
  });
  it("Always good items show no Reliable year-round marker", () =>
    expect(kinds(item({ alwaysGood: true, origins: { "us-ca": rated("fair") } }))).toEqual([]));

  it("Usually improves names the next Good-or-better window", () =>
    expect(kinds(item({ origins: { "us-ca": rated("poor", { "jan-2": "fair" }) } }))).toContainEqual({
      kind: "improves",
      window: windowFromLabel("jan-2"),
    }));
  it("no Usually improves when it never improves", () =>
    expect(kinds(item({ origins: { "us-ca": rated("poor") } }))).toEqual([]));
});

describe("label advice and byOrigin", () => {
  const i = item({
    origins: { "us-ca": rated("prime"), mx: rated("poor"), cl: rated(null) },
    typicalOrigins: allMonths(["us-ca"]),
  });
  it("labelOrigin uses that origin's own windows", () => {
    expect(evaluate(i, { ...today, labelOrigin: "mx" }, ENV).verdict).toBe("skip");
    expect(evaluate(i, { ...today, labelOrigin: "cl" }, ENV).verdict).toBe("limited");
    expect(evaluate(i, { ...today, labelOrigin: "jp" }, ENV).verdict).toBe("limited");
  });
  it("byOrigin covers every rated origin", () => {
    const r = evaluate(i, today, ENV);
    expect(Object.fromEntries(Object.entries(r.byOrigin).map(([o, c]) => [o, c.verdict]))).toEqual({
      "us-ca": "peak",
      mx: "skip",
      cl: "limited",
    });
  });
});

describe("items rated by variety (P13)", () => {
  const base = { origins: {}, typicalOrigins: allMonths(["us-wa"]) };
  const line = (i: ItemInputs) => {
    const r = evaluate(i, today, ENV);
    return [r.verdict, r.varietyLine];
  };

  it("takes the best verdict among in-store varieties", () =>
    expect(
      line(item({ ...base, varieties: [variety("a", rated("fair")), variety("b", rated("prime"))] })),
    ).toEqual(["peak", ["b"]]));
  it("ignores varieties not in stores this month", () =>
    expect(
      line(
        item({
          ...base,
          varieties: [variety("a", rated("fair")), variety("b", rated("prime"), inNov(true, false))],
        }),
      ),
    ).toEqual(["good", ["a"]]));
  it("Limited evidence with no rated variety in stores", () => {
    const r = evaluate(
      item({ ...base, varieties: [variety("a", rated("prime"), allMonths(false))] }),
      today,
      ENV,
    );
    expect([r.verdict, r.ruleFired, r.varietyLine, r.reasons]).toEqual([
      "limited",
      1,
      null,
      [{ code: "no-variety-in-stores" }],
    ]);
  });
  it("Skip outranks Limited evidence", () =>
    expect(
      line(item({ ...base, varieties: [variety("a", rated(null)), variety("b", rated("poor"))] })),
    ).toEqual(["skip", ["b"]]));
  it("no variety line when every in-store variety is Limited evidence", () =>
    expect(line(item({ ...base, varieties: [variety("a", rated(null))] }))).toEqual(["limited", null]));
  it("orders ties by confidence, then file order", () =>
    expect(
      line(
        item({
          ...base,
          varieties: [
            variety("low", rated("prime", {}, { "nov-2": "low" })),
            variety("x", rated("prime")),
            variety("y", rated("prime")),
            variety("z", rated("fair")),
          ],
        }),
      ),
    ).toEqual(["peak", ["x", "y", "low"]]));
  it("the item's confidence is the first named variety's", () => {
    const r = evaluate(
      item({
        ...base,
        varieties: [variety("low", rated("prime", {}, { "nov-2": "low" })), variety("x", rated("prime"))],
      }),
      today,
      ENV,
    );
    expect(r.confidence).toBe("high");
  });
  it("a variety not recommended never holds the item verdict or line, but keeps its own rating", () => {
    const i = item({
      ...base,
      varieties: [variety("a", rated("fair")), { ...variety("b", rated("prime")), recommended: false }],
    });
    expect(line(i)).toEqual(["good", ["a"]]);
    expect(evaluate(i, today, ENV).byVariety.b).toMatchObject({ verdict: "peak", inStore: true });
    expect(evaluate(i, { ...today, labelVariety: "b" }, ENV).verdict).toBe("peak");
  });
  it("Limited evidence when the only in-store variety is not recommended", () => {
    const r = evaluate(
      item({ ...base, varieties: [{ ...variety("a", rated("prime")), recommended: false }] }),
      today,
      ENV,
    );
    expect([r.verdict, r.varietyLine, r.reasons]).toEqual([
      "limited",
      null,
      [{ code: "no-variety-in-stores" }],
    ]);
  });
  it("labelVariety rates that variety even out of stores", () => {
    const i = item({
      ...base,
      varieties: [variety("a", rated("fair")), variety("b", rated("prime"), allMonths(false))],
    });
    const r = evaluate(i, { ...today, labelVariety: "b" }, ENV);
    expect([r.verdict, r.varietyLine]).toEqual(["peak", null]);
    expect(evaluate(i, today, ENV).byVariety.b).toMatchObject({ verdict: "peak", inStore: false });
  });
});

describe("typical outlook and the Always good evidence", () => {
  it("Good in all 24 windows looks always good", () =>
    expect(looksAlwaysGood(typicalOutlook(item({ origins: { "us-ca": rated("fair") } }), ENV, 2026))).toBe(
      true,
    ));
  it("one Peak window does not", () =>
    expect(
      looksAlwaysGood(
        typicalOutlook(item({ origins: { "us-ca": rated("fair", { "jul-1": "prime" }) } }), ENV, 2026),
      ),
    ).toBe(false));
  it("one Limited evidence window does not", () =>
    expect(
      looksAlwaysGood(
        typicalOutlook(item({ origins: { "us-ca": rated("fair", { "jul-1": null }) } }), ENV, 2026),
      ),
    ).toBe(false));

  it("rates one variety as if the label named it, whatever the best variety is", () => {
    const i = item({
      origins: {},
      varieties: [
        variety("early", rated("prime", { "jan-1": "poor", "jan-2": null })),
        variety("late", rated("fair"), inNov(false, true)),
      ],
    });
    const early = typicalOutlook(i, ENV, 2026, "early");
    expect(early.slice(0, 3)).toEqual(["skip", "limited", "peak"]);
    expect(typicalOutlook(i, ENV, 2026, "late")[windowFromLabel("nov-2")]).toBe("good");
    expect(typicalOutlook(i, ENV, 2026)[windowFromLabel("nov-2")]).toBe("peak");
  });
});

describe("Peak worth seeking", () => {
  it("explains a prime window held at Good", () => {
    const r = evaluate(item({ peakWorthSeeking: false }), today, ENV);
    expect(r.reasons).toContainEqual({ code: "peak-not-worth-seeking" });
    expect(evaluate(item(), today, ENV).reasons).not.toContainEqual({ code: "peak-not-worth-seeking" });
  });

  it("a variety-rated item whose Peak isn't worth seeking is Good at best", () => {
    const r = evaluate(
      item({ peakWorthSeeking: false, origins: {}, varieties: [variety("v1", rated("prime"))] }),
      today,
      ENV,
    );
    expect(r.verdict).toBe("good");
  });
});

describe("distance cap (P16)", () => {
  const far = item({
    origins: { cl: rated("prime") },
    typicalOrigins: allMonths(["cl"]),
    supply: { cl: allMonths(1) },
  });
  it("a prime origin from outside the Peak countries holds the item at Good", () => {
    const r = evaluate(far, today, ENV);
    expect([r.verdict, r.ruleFired]).toEqual(["good", 4]);
    expect(r.reasons).toContainEqual({ code: "far-origin", origin: "cl" });
  });
  it("label advice keeps that origin's own Peak", () => {
    expect(evaluate(far, { ...today, labelOrigin: "cl" }, ENV).verdict).toBe("peak");
    expect(evaluate(far, today, ENV).byOrigin.cl?.verdict).toBe("peak");
  });
  it.each([
    ["us-ca", "peak"],
    ["us", "peak"],
    ["mx", "peak"],
    ["ca", "peak"],
    ["pe", "good"],
    ["nz", "good"],
  ] as const)("deciding origin %s → %s", (o, verdict) =>
    expect(
      evaluate(
        item({ origins: { [o]: rated("prime") }, typicalOrigins: allMonths([o]), supply: {} }),
        today,
        ENV,
      ).verdict,
    ).toBe(verdict),
  );
  it("a fair far origin is Good with no far-origin reason", () =>
    expect(
      evaluate(item({ origins: { cl: rated("fair") }, typicalOrigins: allMonths(["cl"]) }), today, ENV)
        .reasons,
    ).not.toContainEqual({ code: "far-origin", origin: "cl" }));
  it("a far prime top origin never counts toward Peak; a near prime second holding half makes it Peak", () => {
    const r = (second: "prime" | "poor") =>
      evaluate(
        item({ origins: { cl: rated("prime"), mx: rated(second) }, typicalOrigins: allMonths(["cl", "mx"]) }),
        today,
        ENV,
      );
    expect([r("prime").verdict, r("prime").labelNote]).toEqual(["peak", true]);
    expect(r("poor").verdict).toBe("good");
  });

  const byVariety = item({
    origins: {},
    varieties: [variety("v1", rated("prime"))],
    typicalOrigins: allMonths(["pe"]),
    supply: {},
  });
  it("an item rated by variety caps at Good when its top typical origin is far", () => {
    const r = evaluate(byVariety, today, ENV);
    expect([r.verdict, r.varietyLine]).toEqual(["good", ["v1"]]);
    expect(r.reasons).toContainEqual({ code: "far-origin", origin: "pe" });
  });
  it("its varieties keep their own Peak as label advice", () => {
    expect(evaluate(byVariety, { ...today, labelVariety: "v1" }, ENV).verdict).toBe("peak");
    expect(evaluate(byVariety, today, ENV).byVariety.v1?.verdict).toBe("peak");
    expect(typicalOutlook(byVariety, ENV, 2026, "v1")[windowFromLabel("nov-2")]).toBe("peak");
    expect(typicalOutlook(byVariety, ENV, 2026)[windowFromLabel("nov-2")]).toBe("good");
  });
});

describe("selections (P16)", () => {
  // Typical supply is Mexico, rated fair; a local selection groups two US states.
  const local = (overrides: Partial<Parameters<typeof item>[0]> = {}, inStore = allMonths(true)) =>
    item({
      origins: { mx: rated("fair"), "us-nj": rated("prime"), "us-tn": rated("fair") },
      typicalOrigins: allMonths(["mx"]),
      supply: { mx: allMonths(1) },
      selections: [{ id: "local", origins: ["us-nj", "us-tn"], inStore }],
      ...overrides,
    });
  it("lifts a Good item to Peak, naming the selection, with the label note", () => {
    const r = evaluate(local(), today, ENV);
    expect([r.verdict, r.ruleFired, r.selection, r.labelNote]).toEqual(["peak", 3, "local", true]);
    expect(r.reasons[0]).toEqual({ code: "selection", selection: "local", level: "peak" });
    expect(r.reasons).toContainEqual({ code: "rated", rating: "fair", origin: "mx" });
    expect(r.markers).toContainEqual({ kind: "check-label" });
    expect([r.confidence, r.weakProperties]).toEqual(["medium", ["agreement"]]);
  });
  it("lifts Skip", () =>
    expect(
      evaluate(local({ origins: { mx: rated("poor"), "us-nj": rated("prime") } }), today, ENV).verdict,
    ).toBe("peak"));
  it("lifts Limited evidence where typical supply is unrated", () =>
    expect(
      evaluate(local({ origins: { mx: rated(null), "us-nj": rated("prime") } }), today, ENV).verdict,
    ).toBe("peak"));
  it("never applies when typical supply is already Peak", () => {
    const r = evaluate(local({ origins: { mx: rated("prime"), "us-nj": rated("prime") } }), today, ENV);
    expect([r.verdict, r.selection, r.labelNote]).toEqual(["peak", null, false]);
  });
  it("needs the selection in stores this month", () => {
    const r = evaluate(local({}, inNov(true, false)), today, ENV);
    expect([r.verdict, r.selection]).toEqual(["good", null]);
  });
  it("lifts Skip to Good from an origin rated fair, naming the selection, with the label note", () => {
    const r = evaluate(local({ origins: { mx: rated("poor"), "us-nj": rated("fair") } }), today, ENV);
    expect([r.verdict, r.ruleFired, r.selection, r.labelNote]).toEqual(["good", 4, "local", true]);
    expect(r.reasons[0]).toEqual({ code: "selection", selection: "local", level: "good" });
    expect(r.reasons).toContainEqual({ code: "rated", rating: "poor", origin: "mx" });
  });
  it("lifts Limited evidence to Good", () =>
    expect(
      evaluate(local({ origins: { mx: rated(null), "us-nj": rated("fair") } }), today, ENV).verdict,
    ).toBe("good"));
  it("never applies when it reads no better than typical supply", () => {
    const r = evaluate(local({ origins: { mx: rated("fair"), "us-nj": rated("fair") } }), today, ENV);
    expect([r.verdict, r.selection, r.labelNote]).toEqual(["good", null, false]);
  });
  it("never lifts from an origin rated poor", () => {
    const r = evaluate(local({ origins: { mx: rated(null), "us-nj": rated("poor") } }), today, ENV);
    expect([r.verdict, r.selection]).toEqual(["limited", null]);
  });
  it("takes the best level among the selections in stores", () =>
    expect(
      evaluate(
        local({
          origins: { mx: rated("poor"), "us-nj": rated("prime"), "us-tn": rated("fair") },
          selections: [
            { id: "good", origins: ["us-tn"], inStore: allMonths(true) },
            { id: "peak", origins: ["us-nj"], inStore: allMonths(true) },
          ],
        }),
        today,
        ENV,
      ).selection,
    ).toBe("peak"));
  it("its Good level lifts where its prime origin can't be Peak (Peak not worth seeking)", () => {
    const r = evaluate(
      local({ origins: { mx: rated("poor"), "us-nj": rated("prime") }, peakWorthSeeking: false }),
      today,
      ENV,
    );
    expect([r.verdict, r.selection]).toEqual(["good", "local"]);
  });
  it("needs the item's Peak worth seeking", () =>
    expect(evaluate(local({ peakWorthSeeking: false }), today, ENV).verdict).toBe("good"));
  it("never on its origin's thin supply", () =>
    expect(
      evaluate(local({ supply: { mx: allMonths(1), "us-nj": allMonths(0.5) } }), today, ENV).verdict,
    ).toBe("good"));
  it("ignores an origin outside the Peak countries", () =>
    expect(
      evaluate(
        local({
          origins: { mx: rated("fair"), cl: rated("prime") },
          selections: [{ id: "far", origins: ["cl"], inStore: allMonths(true) }],
        }),
        today,
        ENV,
      ).verdict,
    ).toBe("good"));
  it("takes the first selection in file order on a tie", () =>
    expect(
      evaluate(
        local({
          selections: [
            { id: "off", origins: ["us-nj"], inStore: allMonths(false) },
            { id: "a", origins: ["us-nj"], inStore: allMonths(true) },
            { id: "b", origins: ["us-nj"], inStore: allMonths(true) },
          ],
        }),
        today,
        ENV,
      ).selection,
    ).toBe("a"));
  it("carries Low evidence on its best origin into coverage", () =>
    expect(
      evaluate(
        local({ origins: { mx: rated("fair"), "us-nj": rated("prime", {}, { "nov-2": "low" }) } }),
        today,
        ENV,
      ).confidence,
    ).toBe("low"));
  it("feeds the outlook, so Peak from a selection shows in the typical outlook", () =>
    expect(typicalOutlook(local({}, inNov(false, true)), ENV, 2026).filter((v) => v === "peak")).toHaveLength(
      2,
    ));
  it("label advice is never lifted", () =>
    expect(evaluate(local(), { ...today, labelOrigin: "mx" }, ENV).verdict).toBe("good"));
});

describe("one Peak season a year (P19)", () => {
  const w = windowFromLabel;
  // Prime in two runs, fair otherwise.
  const twoRuns = (main: Record<string, "prime">, other: Record<string, "prime">) =>
    item({ origins: { "us-ca": rated("fair", { ...main, ...other }) } });
  const spring = { "mar-1": "prime", "mar-2": "prime", "apr-1": "prime", "apr-2": "prime" } as const;
  const fall = { "oct-1": "prime", "oct-2": "prime" } as const;
  const runsOf = (outlook: string[]) =>
    outlook.filter((v, i) => v === "peak" && outlook[(i + outlook.length - 1) % outlook.length] !== "peak")
      .length;

  it("keeps only the longest Peak run; the other reads Good with the main season named", () => {
    const i = twoRuns(spring, fall);
    const outlook = typicalOutlook(i, ENV, 2026);
    expect(outlook[w("apr-1")]).toBe("peak");
    expect(outlook[w("oct-1")]).toBe("good");
    expect(runsOf(outlook)).toBe(1);
    const r = evaluate(i, { date: { year: 2026, month: 10, day: 5 } }, ENV);
    expect([r.verdict, r.ruleFired]).toEqual(["good", 4]);
    expect(r.reasons).toContainEqual({ code: "main-peak", from: w("mar-1"), to: w("apr-2") });
  });
  it("on a tie keeps the earlier run", () => {
    const outlook = typicalOutlook(twoRuns({ "mar-1": "prime", "mar-2": "prime" }, fall), ENV, 2026);
    expect([outlook[w("mar-1")], outlook[w("oct-1")]]).toEqual(["peak", "good"]);
  });
  it("reads a run across the year end as one", () => {
    const summer = { "jun-1": "prime", "jun-2": "prime" } as const;
    const winter = {
      "nov-1": "prime",
      "nov-2": "prime",
      "dec-1": "prime",
      "dec-2": "prime",
      "jan-1": "prime",
    };
    const outlook = typicalOutlook(twoRuns(winter as Record<string, "prime">, summer), ENV, 2026);
    expect([outlook[w("jan-1")], outlook[w("nov-1")], outlook[w("jun-1")]]).toEqual(["peak", "peak", "good"]);
    const r = evaluate(
      twoRuns(winter as Record<string, "prime">, summer),
      { date: { year: 2026, month: 6, day: 5 } },
      ENV,
    );
    expect(r.reasons).toContainEqual({ code: "main-peak", from: w("nov-1"), to: w("jan-1") });
  });
  it("feeds the markers: the main run's last window is Last call", () => {
    const r = evaluate(twoRuns(spring, fall), { date: { year: 2026, month: 4, day: 20 } }, ENV);
    expect(r.markers).toContainEqual({ kind: "last-call", fadesBy: w("may-1") });
  });
  it("label advice keeps every Peak", () =>
    expect(
      evaluate(twoRuns(spring, fall), { date: { year: 2026, month: 10, day: 5 }, labelOrigin: "us-ca" }, ENV)
        .verdict,
    ).toBe("peak"));
  it("a selection's Peak outside the main season reads Good and drops the selection", () => {
    const i = item({
      origins: { mx: rated("fair", spring), "us-nj": rated("fair", fall) },
      typicalOrigins: allMonths(["mx"]),
      supply: { mx: allMonths(1), "us-nj": allMonths(1) },
      selections: [{ id: "local", origins: ["us-nj"], inStore: allMonths(true) }],
    });
    const r = evaluate(i, { date: { year: 2026, month: 10, day: 5 } }, ENV);
    expect([r.verdict, r.selection]).toEqual(["good", null]);
    expect(r.reasons.some((x) => x.code === "selection")).toBe(false);
  });
  it("a selection's Peak outside the main season reads as the selection at Good where typical supply is worse", () => {
    const i = item({
      origins: { mx: rated("poor", spring), "us-nj": rated("fair", fall) },
      typicalOrigins: allMonths(["mx"]),
      supply: { mx: allMonths(1), "us-nj": allMonths(1) },
      selections: [{ id: "local", origins: ["us-nj"], inStore: allMonths(true) }],
    });
    const r = evaluate(i, { date: { year: 2026, month: 10, day: 5 } }, ENV);
    expect([r.verdict, r.ruleFired, r.selection, r.labelNote]).toEqual(["good", 4, "local", true]);
    expect(r.reasons[0]).toEqual({ code: "selection", selection: "local", level: "good" });
    expect(r.reasons).toContainEqual({ code: "main-peak", from: w("mar-1"), to: w("apr-2") });
  });
  it("a mixed-supply Peak outside the main season reads as its Good level, here with nothing to pick", () => {
    // Fall: prime California at 60% beside fair Mexico, a P20 Peak by the label; spring is longer.
    const i = item({
      origins: { "us-ca": rated("fair", { ...spring, ...fall }), mx: rated("fair") },
      typicalOrigins: allMonths(["us-ca", "mx"]),
      typicalShares: allMonths([0.6, 0.4]),
      supply: { "us-ca": allMonths(1), mx: allMonths(1) },
    });
    const peak = evaluate(i, { date: { year: 2026, month: 3, day: 5 } }, ENV);
    expect([peak.verdict, peak.labelNote]).toEqual(["peak", true]);
    const r = evaluate(i, { date: { year: 2026, month: 10, day: 5 } }, ENV);
    expect([r.verdict, r.labelNote]).toEqual(["good", false]);
    expect(r.reasons.some((x) => x.code === "look-for")).toBe(false);
  });
});

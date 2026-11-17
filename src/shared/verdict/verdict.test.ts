import { describe, expect, it } from "vitest";
import { windowFromLabel } from "../time";
import {
  type CoreResult,
  type Env,
  type EvalContext,
  evaluate,
  type ItemInputs,
  looksAlwaysGood,
  typicalOutlook,
} from "./index";
import { advisory, allMonths, ENV, item, NOV_17, rated, variety } from "./test-helpers";

const today: EvalContext = { date: NOV_17, mode: "today" };
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
    name: "1: no typical origins this month",
    item: item({ typicalOrigins: inNov(["us-ca"], []) }),
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
  // Rule 2: Advisory
  { name: "2: skip advisory on prime", item: item({ advisories: [advisory()] }), verdict: "skip", rule: 2 },
  {
    name: "2: cap-good lowers Peak to Good",
    item: item({ advisories: [advisory({ effect: "cap-good" })] }),
    verdict: "good",
    rule: 2,
  },
  {
    name: "2: cap-good lets rule 3 run",
    item: item({ origins: { "us-ca": rated("poor") }, advisories: [advisory({ effect: "cap-good" })] }),
    verdict: "skip",
    rule: 3,
  },
  {
    name: "2: cap-good on fair leaves rule 5",
    item: item({ origins: { "us-ca": rated("fair") }, advisories: [advisory({ effect: "cap-good" })] }),
    verdict: "good",
    rule: 5,
  },
  {
    name: "2: advisory naming the top origin applies",
    item: item({
      origins: two,
      typicalOrigins: allMonths(["us-ca", "mx"]),
      advisories: [advisory({ origins: ["us-ca"] })],
    }),
    verdict: "skip",
    rule: 2,
  },
  {
    name: "2: advisory naming only a lower-ranked origin does not apply",
    item: item({
      origins: two,
      typicalOrigins: allMonths(["us-ca", "mx"]),
      advisories: [advisory({ origins: ["mx"] })],
    }),
    verdict: "peak",
    rule: 4,
  },
  {
    name: "2: skip beats cap-good when both are active",
    item: item({ advisories: [advisory({ id: "cap", effect: "cap-good" }), advisory({ id: "skip" })] }),
    verdict: "skip",
    rule: 2,
  },
  {
    name: "2: expired advisory does not apply",
    item: item({ advisories: [advisory({ from: "2026-10-01", to: "2026-11-16" })] }),
    verdict: "peak",
    rule: 4,
  },
  {
    name: "2: advisory starting tomorrow does not apply",
    item: item({ advisories: [advisory({ from: "2026-11-18", to: "2026-11-30" })] }),
    verdict: "peak",
    rule: 4,
  },
  {
    name: "2: advisory active on its last day",
    item: item({ advisories: [advisory({ from: "2026-11-01", to: "2026-11-17" })] }),
    verdict: "skip",
    rule: 2,
  },
  {
    name: "2: typical mode ignores advisories",
    item: item({ advisories: [advisory()] }),
    ctx: { mode: "typical" },
    verdict: "peak",
    rule: 4,
  },
  // Rule 3: Skip
  {
    name: "3: top origin poor",
    item: item({ origins: { "us-ca": rated("poor") } }),
    verdict: "skip",
    rule: 3,
  },
  {
    name: "3: poor with strong supply weakens agreement",
    item: item({ origins: { "us-ca": rated("poor") }, supply: allMonths(1.2) }),
    verdict: "skip",
    rule: 3,
    weak: ["agreement"],
  },
  // Rule 4: Peak
  { name: "4: prime, normal supply", item: item(), verdict: "peak", rule: 4, weak: [] },
  {
    name: "4: prime, supply exactly at the thin line",
    item: item({ supply: allMonths(0.8) }),
    verdict: "peak",
    rule: 4,
  },
  { name: "4: prime, no supply index", item: item({ supply: allMonths(null) }), verdict: "peak", rule: 4 },
  // Rule 5: Good
  {
    name: "5: prime but thin supply",
    item: item({ supply: allMonths(0.79) }),
    verdict: "good",
    rule: 5,
    weak: ["agreement"],
  },
  {
    name: "5: fair",
    item: item({ origins: { "us-ca": rated("fair") } }),
    verdict: "good",
    rule: 5,
    weak: [],
  },
  // Precedence pairs
  {
    name: "1 over 2: unrated origin beats a skip advisory",
    item: item({ origins: { "us-ca": rated(null) }, advisories: [advisory()] }),
    verdict: "limited",
    rule: 1,
  },
  {
    name: "1 over 3: an unrated second origin beats a poor top origin",
    item: item({
      origins: { "us-ca": rated("poor"), mx: rated(null) },
      typicalOrigins: allMonths(["us-ca", "mx"]),
    }),
    verdict: "limited",
    rule: 1,
  },
  {
    name: "1 over 4: an unrated second origin beats a prime top origin",
    item: item({
      origins: { "us-ca": rated("prime"), mx: rated(null) },
      typicalOrigins: allMonths(["us-ca", "mx"]),
    }),
    verdict: "limited",
    rule: 1,
  },
  {
    name: "2 over 3: skip advisory on a poor origin",
    item: item({ origins: { "us-ca": rated("poor") }, advisories: [advisory()] }),
    verdict: "skip",
    rule: 2,
  },
  {
    name: "2 over 5: skip advisory on a fair origin",
    item: item({ origins: { "us-ca": rated("fair") }, advisories: [advisory()] }),
    verdict: "skip",
    rule: 2,
  },
  {
    name: "2 cap over 4, with thin supply: rule 5 still decides",
    item: item({ supply: allMonths(0.5), advisories: [advisory({ effect: "cap-good" })] }),
    verdict: "good",
    rule: 5,
  },
  {
    name: "3 over 4/5: poor top origin, prime second",
    item: item({
      origins: { "us-ca": rated("poor"), mx: rated("prime") },
      typicalOrigins: allMonths(["us-ca", "mx"]),
    }),
    verdict: "skip",
    rule: 3,
  },
  {
    name: "4 over 5: prime top origin, fair second",
    item: item({
      origins: { "us-ca": rated("prime"), mx: rated("fair") },
      typicalOrigins: allMonths(["us-ca", "mx"]),
    }),
    verdict: "peak",
    rule: 4,
  },
  // Rule 4 needs a Peak worth seeking
  {
    name: "4: prime, normal supply, Peak not worth seeking: rule 5 Good",
    item: item({ peakWorthSeeking: false }),
    verdict: "good",
    rule: 5,
  },
  {
    name: "2 over 4: cap-good on an item whose Peak isn't worth seeking",
    item: item({ peakWorthSeeking: false, advisories: [advisory({ effect: "cap-good" })] }),
    verdict: "good",
    rule: 2,
  },
  {
    name: "2 skip on an item whose Peak isn't worth seeking",
    item: item({ peakWorthSeeking: false, advisories: [advisory()] }),
    verdict: "skip",
    rule: 2,
  },
  {
    name: "3: poor stays Skip when Peak isn't worth seeking",
    item: item({ peakWorthSeeking: false, origins: { "us-ca": rated("poor") } }),
    verdict: "skip",
    rule: 3,
  },
  {
    name: "1: Limited evidence stays when Peak isn't worth seeking",
    item: item({ peakWorthSeeking: false, typicalOrigins: inNov(["us-ca"], []) }),
    verdict: "limited",
    rule: 1,
  },
  {
    name: "5: thin supply and Peak not worth seeking",
    item: item({ peakWorthSeeking: false, supply: allMonths(0.5) }),
    verdict: "good",
    rule: 5,
  },
  // P9: the top-ranked origin decides
  {
    name: "P9: fair top origin, prime second",
    item: item({
      origins: { "us-ca": rated("fair"), mx: rated("prime") },
      typicalOrigins: allMonths(["us-ca", "mx"]),
    }),
    verdict: "good",
    rule: 5,
  },
  {
    name: "P9: November's ranking applies in November",
    item: item({
      origins: { "us-ca": rated("poor"), mx: rated("prime") },
      typicalOrigins: inNov(["us-ca", "mx"], ["mx", "us-ca"]),
    }),
    verdict: "peak",
    rule: 4,
    weak: ["agreement"],
  },
];

describe("rules 1–5", () => {
  it.each(cases)("$name", (c) => {
    const r = evaluate(c.item, { ...today, ...c.ctx }, c.env ?? ENV);
    expect([r.verdict, r.ruleFired]).toEqual([c.verdict, c.rule]);
    if (c.weak) expect(r.weakProperties).toEqual(c.weak);
  });
});

describe("label note (P9)", () => {
  const withSecond = (second: "prime" | "fair" | "poor") =>
    evaluate(
      item({
        origins: { "us-ca": rated("prime"), mx: rated(second) },
        typicalOrigins: allMonths(["us-ca", "mx"]),
      }),
      today,
      ENV,
    );
  it("appears when the top two differ by two levels, and weakens agreement", () => {
    const r = withSecond("poor");
    expect(r.labelNote).toBe(true);
    expect(r.weakProperties).toContain("agreement");
  });
  it("is absent for a one-level difference", () => expect(withSecond("fair").labelNote).toBe(false));
  it("is absent for a single typical origin", () =>
    expect(evaluate(item(), today, ENV).labelNote).toBe(false));
  it("is absent for label advice", () => {
    const r = evaluate(
      item({
        origins: { "us-ca": rated("prime"), mx: rated("poor") },
        typicalOrigins: allMonths(["us-ca", "mx"]),
      }),
      { ...today, labelOrigin: "us-ca" },
      ENV,
    );
    expect(r.labelNote).toBe(false);
  });
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
  it("freshness: advisory not reviewed this window", () =>
    expect(conf(item({ advisories: [advisory({ reviewedOn: "2026-11-15" })] }))).toEqual([
      "medium",
      ["freshness"],
    ]));
  it("freshness: advisory never reviewed", () =>
    expect(conf(item({ advisories: [advisory({ reviewedOn: undefined })] }))).toEqual([
      "medium",
      ["freshness"],
    ]));
  it("freshness: same window a year earlier is not this window", () =>
    expect(conf(item({ advisories: [advisory({ reviewedOn: "2025-11-20" })] }))).toEqual([
      "medium",
      ["freshness"],
    ]));
  it("Low with two weak properties", () =>
    expect(conf(item({ evidenceBasis: "assessment-only", supply: allMonths(0.5) }))).toEqual([
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
        { date: { year: 2026, month: 12, day: 20 }, mode: "today" },
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

  it("Advisory marker when an advisory applies", () =>
    expect(kinds(item({ advisories: [advisory()] }))).toContainEqual({ kind: "advisory", advisory: "adv" }));

  it("Usually improves names the next Good-or-better window", () =>
    expect(kinds(item({ origins: { "us-ca": rated("poor", { "jan-2": "fair" }) } }))).toContainEqual({
      kind: "improves",
      window: windowFromLabel("jan-2"),
    }));
  it("Usually improves on an advisory Skip uses the typical outlook", () =>
    expect(kinds(item({ advisories: [advisory()] }))).toContainEqual({
      kind: "improves",
      window: windowFromLabel("dec-1"),
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
  it("an advisory applies to a label origin it names", () => {
    const r = evaluate(item({ origins: two, advisories: [advisory({ origins: ["mx"] })] }), today, ENV);
    expect([r.byOrigin["us-ca"]?.verdict, r.byOrigin.mx?.verdict]).toEqual(["peak", "skip"]);
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
  it("an advisory on the top typical origin applies to every variety", () => {
    const r = evaluate(
      item({
        ...base,
        varieties: [variety("a", rated("prime")), variety("b", rated("prime"))],
        advisories: [advisory({ origins: ["us-wa"] })],
      }),
      today,
      ENV,
    );
    expect([r.verdict, r.byVariety.a?.verdict, r.byVariety.b?.verdict]).toEqual(["skip", "skip", "skip"]);
  });
  it("a national advisory applies even with no typical origins", () => {
    const r = evaluate(
      item({
        ...base,
        typicalOrigins: allMonths([]),
        varieties: [variety("a", rated("prime"))],
        advisories: [advisory()],
      }),
      today,
      ENV,
    );
    expect(r.verdict).toBe("skip");
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
  it("ignores advisories", () =>
    expect(
      typicalOutlook(item({ advisories: [advisory({ from: "2026-01-01", to: "2026-03-31" })] }), ENV, 2026),
    ).toEqual(Array(24).fill("peak")));
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

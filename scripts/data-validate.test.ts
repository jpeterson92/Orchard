import { describe, expect, it } from "vitest";
import { type Csv, parseCsv, type RawInputs, validate } from "./data-validate";

// A minimal valid dataset. Everything here is invented test data (synthetic: true).
const source = (id: string) => ({
  id,
  title: `Test source ${id}`,
  publisher: "Test publisher",
  url: `https://example.com/${id}`,
  accessed: "2026-11-01",
  tier: "authoritative",
});

const SUMMER = [
  { from: "apr-1", to: "jun-2", rating: "prime" },
  { from: "jul-1", to: "aug-2", rating: "fair" },
];
const WINTER = [{ from: "dec-1", to: "mar-2", rating: "fair" }];
const claim = (source: string, windows: object[], extra: object = {}) => ({
  source,
  windows: structuredClone(windows),
  specificity: "month",
  directness: "eating-quality",
  paraphrase: "Best from April through June, fair through August.",
  ...extra,
});

// Two independent sources agree with every rated window of the item below.
const evidence = (itemId: string) => ({
  item: itemId,
  claims: [
    claim("s1", SUMMER),
    claim("s2", SUMMER),
    claim("s1", WINTER, { origin: "mx" }),
    claim("s2", WINTER, { origin: "mx", specificity: "season", directness: "availability" }),
  ],
  status: "draft",
  synthetic: true,
});

const item = (id: string, rank: number) => ({
  id,
  name: "Test fruit",
  category: "berries",
  purchaseRank: rank,
  alwaysGood: false,
  shipsWell: true,
  storesWell: false,
  evidenceBasis: "supply+assessment",
  cardLine: "Deep color, firm and dry.",
  pick: ["Deep, even color", "Firm, plump fruit", "Dry, not leaking"],
  avoid: ["Mold or juice in the box"],
  store: {
    temperature: "cold",
    ethylene: "neither",
    life: { min: 2, max: 3, unit: "days" },
    text: "Refrigerate unwashed; typically keeps 2–3 days.",
    sources: ["s1"],
  },
  prep: "Rinse just before eating.",
  origins: [
    { origin: "us-ca", windows: structuredClone(SUMMER) },
    { origin: "mx", windows: structuredClone(WINTER) },
  ],
  status: "draft",
  synthetic: true,
});

const csv = (file: string, rows: Record<string, string>[]): Csv => ({
  file,
  meta: { source: "Synthetic", from: "2023-11", to: "2026-10", derived: "2026-11-17" },
  rows,
});

function base(): RawInputs {
  return {
    rules: {
      version: 1,
      typicalOriginShare: 0.7,
      supplyIndex: { thin: 0.8, strong: 1.2 },
      reliableYearRoundWindows: 20,
      snapshotMaxAgeMonths: 15,
      lastCallWindows: 2,
      labelNoteLevelGap: 1,
    },
    sources: [source("s1"), source("s2")],
    categories: [{ id: "berries", name: "Berries" }],
    states: csv("data/us-states.csv", [
      { state: "CA", name: "California" },
      { state: "WA", name: "Washington" },
    ]),
    items: [{ file: "content/items/test-fruit.yaml", data: item("test-fruit", 1) }],
    evidence: [{ file: "content/evidence/test-fruit.yaml", data: evidence("test-fruit") }],
    advisories: [
      {
        id: "test-advisory",
        items: ["test-fruit"],
        origins: ["mx"],
        from: "2026-11-01",
        to: "2026-12-15",
        effect: "skip",
        note: "Test advisory note.",
        status: "draft",
        synthetic: true,
      },
    ],
    typicalOrigins: csv("data/usda/typical-origins.csv", [
      { item: "test-fruit", month: "5", rank: "1", origin: "us-ca" },
      { item: "test-fruit", month: "5", rank: "2", origin: "mx" },
    ]),
    supplyIndex: csv("data/usda/supply-index.csv", [
      { item: "test-fruit", month: "5", value: "1.31", reason: "" },
      { item: "test-fruit", month: "6", value: "", reason: "not_reported" },
    ]),
  };
}

// biome-ignore lint/suspicious/noExplicitAny: fixtures poke into untyped raw input on purpose
type Any = any;
const firstItem = (r: RawInputs): Any => (r.items[0] as { data: Any }).data;
const firstAdvisory = (r: RawInputs): Any => (r.advisories as Any[])[0];
const claims = (r: RawInputs): Any[] => (r.evidence[0] as { data: Any }).data.claims;
const firstClaim = (r: RawInputs): Any => claims(r)[0];
const gala = (windows?: object[]) => ({
  id: "gala",
  name: "Gala",
  traits: {},
  bestUses: ["Eating"],
  label: "Gala",
  ...(windows ? { windows: structuredClone(windows) } : {}),
});
/** Rates the variety gala over SUMMER, backed by both sources. */
const rateByVariety = (r: RawInputs) => {
  firstItem(r).varieties = [gala(SUMMER)];
  claims(r).push(claim("s1", SUMMER, { variety: "gala" }), claim("s2", SUMMER, { variety: "gala" }));
};

describe("validate: a valid dataset", () => {
  it("passes and normalizes defaults", () => {
    const { errors, warnings, dataset } = validate(base(), { production: false });
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect(dataset?.items[0]?.synonyms).toEqual([]);
    expect(dataset?.supplyIndex[1]).toEqual({
      item: "test-fruit",
      month: 6,
      value: null,
      reason: "not_reported",
    });
    expect(dataset?.typicalOrigins[0]?.month).toBe(5);
    expect(dataset?.evidence[0]?.claims.map((c) => c.origin)).toEqual(["us", "us", "mx", "mx"]);
  });

  it("accepts a restating source and claims naming an unrated variety", () => {
    const raw = structuredClone(base());
    (raw.sources as Any[]).push({ ...source("s3"), tier: "mainstream", basedOn: "s1" });
    firstItem(raw).varieties = [gala()];
    claims(raw).push(claim("s3", SUMMER, { variety: "gala" }));
    expect(validate(raw, { production: false }).errors).toEqual([]);
  });

  it("accepts an item rated only by variety", () => {
    const raw = structuredClone(base());
    rateByVariety(raw);
    firstItem(raw).origins = [];
    const { errors, dataset } = validate(raw, { production: false });
    expect(errors).toEqual([]);
    expect(dataset?.items[0]?.varieties[0]?.windows).toHaveLength(2);
  });

  it("accepts a rating that departs from the evidence when it gives a reason", () => {
    const raw = structuredClone(base());
    Object.assign(firstItem(raw).origins[0].windows[1], {
      rating: "poor",
      reason: "Late-summer fruit in test stores is usually soft.",
    });
    expect(validate(raw, { production: false }).errors).toEqual([]);
  });

  it("accepts Low-confidence evidence when the rating gives a reason", () => {
    const raw = structuredClone(base());
    claims(raw)[0].windows[1].rating = "prime";
    claims(raw)[1].windows[1].rating = "poor";
    firstItem(raw).origins[0].windows[1].reason = "Sources split; fair is the cautious call.";
    expect(validate(raw, { production: false }).errors).toEqual([]);
  });

  it("works without any USDA snapshot", () => {
    const raw = { ...base(), typicalOrigins: null, supplyIndex: null };
    expect(validate(raw, { production: false }).dataset?.snapshot).toBeNull();
  });
});

// One broken input per check: [description, mutation, expected error fragment].
const broken: [string, (r: RawInputs) => void, string][] = [
  // Schema errors
  ["missing required field", (r) => delete firstItem(r).cardLine, "cardLine"],
  ["misspelled field", (r) => (firstItem(r).cardline = "x"), 'Unrecognized key: "cardline"'],
  ["non-kebab id", (r) => (firstItem(r).id = "Test_Fruit"), "lowercase-kebab"],
  [
    "card line over 12 words",
    (r) =>
      (firstItem(r).cardLine = "one two three four five six seven eight nine ten eleven twelve thirteen"),
    "at most 12 words",
  ],
  [
    "section over 60 words",
    (r) => (firstItem(r).prep = Array(61).fill("word").join(" ")),
    "at most 60 words",
  ],
  [
    "pick and avoid over 60 words",
    (r) => (firstItem(r).pick = [1, 2, 3].map(() => Array(20).fill("w").join(" "))),
    "pick and avoid cues together",
  ],
  ["too few pick cues", (r) => (firstItem(r).pick = ["a", "b"]), "pick"],
  ["bad window label", (r) => (firstItem(r).origins[0].windows[0].from = "april-1"), "half-month label"],
  [
    "window still citing its own sources",
    (r) => (firstItem(r).origins[0].windows[0].sources = ["s1", "s2"]),
    'Unrecognized key: "sources"',
  ],
  [
    "reason over 60 words",
    (r) => (firstItem(r).origins[0].windows[0].reason = Array(61).fill("w").join(" ")),
    "at most 60 words",
  ],
  ["no rated origin or variety", (r) => (firstItem(r).origins = []), "rate at least one origin or variety"],
  ["bad rating value", (r) => (firstItem(r).origins[0].windows[0].rating = "great"), "rating"],
  [
    "inverted storage range",
    (r) => (firstItem(r).store.life = { min: 5, max: 2, unit: "days" }),
    "min must not exceed max",
  ],
  ["reviewed without reviewer", (r) => (firstItem(r).status = "reviewed"), "needs reviewedOn and reviewer"],
  ["variety with empty windows", (r) => (firstItem(r).varieties = [gala([])]), "varieties.0.windows"],
  [
    "bad rules threshold",
    (r) => ((r.rules as Any).supplyIndex = { thin: 1.3, strong: 1.2 }),
    "thin must be below strong",
  ],
  ["bad source url", (r) => ((r.sources as Any[])[0].url = "not a url"), "url"],
  ["sources not a list", (r) => (r.sources = { id: "s1" }), "expected a list"],
  ["bad advisory effect", (r) => (firstAdvisory(r).effect = "peak"), "effect"],
  ["bad snapshot header", (r) => ((r.typicalOrigins as Csv).meta.to = "2026-13"), "YYYY-MM"],
  [
    "snapshot runs backwards",
    (r) => ((r.typicalOrigins as Csv).meta.from = "2027-01"),
    "from must not be after to",
  ],
  ["NaN supply index", (r) => (((r.supplyIndex as Csv).rows[0] as Any).value = "NaN"), "line 2"],
  ["non-numeric supply index", (r) => (((r.supplyIndex as Csv).rows[0] as Any).value = "high"), "line 2"],
  [
    "supply value and reason together",
    (r) => (((r.supplyIndex as Csv).rows[0] as Any).reason = "no_data"),
    "either a value or a null reason",
  ],
  [
    "null supply without reason",
    (r) => (((r.supplyIndex as Csv).rows[1] as Any).reason = ""),
    "either a value or a null reason",
  ],
  ["month out of range", (r) => (((r.typicalOrigins as Csv).rows[0] as Any).month = "13"), "line 2"],
  // Unknown IDs
  [
    "unknown variety source",
    (r) => (firstItem(r).varieties = [{ ...gala(), sources: ["s9"] }]),
    "variety gala: unknown source s9",
  ],
  ["unknown store source", (r) => (firstItem(r).store.sources = ["s9"]), "store: unknown source s9"],
  ["unknown category", (r) => (firstItem(r).category = "nuts"), "unknown category nuts"],
  [
    "unknown US state origin",
    (r) => (firstItem(r).origins[0].origin = "us-zz"),
    "unknown US state in origin us-zz",
  ],
  ["unknown country origin", (r) => (firstItem(r).origins[1].origin = "qq"), "unknown origin qq"],
  ["plain us origin", (r) => (firstItem(r).origins[1].origin = "us"), "unknown origin us"],
  ["advisory for unknown item", (r) => (firstAdvisory(r).items = ["kumquats"]), "unknown item kumquats"],
  [
    "advisory with unknown origin",
    (r) => (firstAdvisory(r).origins = ["us-xx"]),
    "unknown US state in origin us-xx",
  ],
  [
    "typical origin unknown",
    (r) => (((r.typicalOrigins as Csv).rows[1] as Any).origin = "qq"),
    "unknown origin qq",
  ],
  // Duplicate keys
  [
    "duplicate item id",
    (r) => r.items.push({ file: "content/items/test-fruit.yml", data: item("test-fruit", 2) }),
    "duplicate item test-fruit",
  ],
  [
    "duplicate purchaseRank",
    (r) => r.items.push({ file: "content/items/other.yaml", data: item("other", 1) }),
    "duplicate purchaseRank 1",
  ],
  [
    "file name differs from id",
    (r) => ((r.items[0] as Any).file = "content/items/strawberries.yaml"),
    "file name must match",
  ],
  ["duplicate source", (r) => (r.sources as Any[]).push(source("s1")), "duplicate source s1"],
  [
    "duplicate category",
    (r) => (r.categories as Any[]).push({ id: "berries", name: "More berries" }),
    "duplicate category berries",
  ],
  ["duplicate state", (r) => r.states.rows.push({ state: "CA", name: "Cali" }), "duplicate state CA"],
  [
    "duplicate origin in item",
    (r) => firstItem(r).origins.push(firstItem(r).origins[1]),
    "duplicate origin test-fruit/mx",
  ],
  [
    "duplicate type",
    (r) =>
      (firstItem(r).types = [
        { id: "a", name: "A" },
        { id: "a", name: "B" },
      ]),
    "duplicate type test-fruit/a",
  ],
  ["overlapping windows", (r) => (firstItem(r).origins[0].windows[1].from = "jun-2"), "windows overlap"],
  [
    "overlap across the year end",
    (r) =>
      firstItem(r).origins[1].windows.push({
        from: "mar-2",
        to: "apr-1",
        rating: "poor",
      }),
    "windows overlap",
  ],
  [
    "overlapping variety windows",
    (r) => {
      rateByVariety(r);
      firstItem(r).varieties[0].windows[1].from = "jun-2";
    },
    "variety gala: windows overlap",
  ],
  // Every rated window rests on the evidence
  [
    "an item without an evidence file",
    (r) => (r.evidence = []),
    "item test-fruit us-ca apr-1..jun-2: needs claims from 2 independent sources, has 0 at apr-1",
  ],
  [
    "a rated window no claim covers",
    (r) => firstItem(r).origins[0].windows.push({ from: "sep-1", to: "sep-2", rating: "poor" }),
    "us-ca sep-1..sep-2: needs claims from 2 independent sources, has 0 at sep-1",
  ],
  [
    "claims from one source only",
    (r) => (claims(r)[1].source = "s1"),
    "us-ca apr-1..jun-2: needs claims from 2 independent sources, has 1",
  ],
  [
    "a restatement isn't independent",
    (r) => ((r.sources as Any[])[1].basedOn = "s1"),
    "needs claims from 2 independent sources, has 1",
  ],
  [
    "partial coverage names the first thin window",
    (r) => (claims(r)[1].windows[1].to = "aug-1"),
    "us-ca jul-1..aug-2: needs claims from 2 independent sources, has 1 at aug-2",
  ],
  [
    "a state's claims don't cover another country",
    (r) => (claims(r)[3].origin = "us-ca"),
    "mx dec-1..mar-2: needs claims from 2 independent sources, has 1",
  ],
  [
    "a rating that departs without a reason",
    (r) => (firstItem(r).origins[0].windows[1].rating = "poor"),
    "us-ca jul-1..aug-2: rated poor, but the evidence proposes fair at jul-1; add a reason",
  ],
  [
    "Low-confidence evidence without a reason",
    (r) => {
      claims(r)[0].windows[1].rating = "prime";
      claims(r)[1].windows[1].rating = "poor";
    },
    "us-ca jul-1..aug-2: the evidence is Low confidence at jul-1; add a reason",
  ],
  [
    "a rated variety without enough evidence",
    (r) => {
      rateByVariety(r);
      claims(r).pop();
    },
    "variety gala apr-1..jun-2: needs claims from 2 independent sources, has 1",
  ],
  [
    "a variety rating that departs without a reason",
    (r) => {
      rateByVariety(r);
      firstItem(r).varieties[0].windows[0].rating = "fair";
    },
    "variety gala apr-1..jun-2: rated fair, but the evidence proposes prime",
  ],
  [
    "duplicate advisory",
    (r) => (r.advisories as Any[]).push({ ...firstAdvisory(r) }),
    "duplicate advisory test-advisory",
  ],
  [
    "duplicate typical rank",
    (r) => (((r.typicalOrigins as Csv).rows[1] as Any).rank = "1"),
    "duplicate typical origin test-fruit/5/rank 1",
  ],
  [
    "duplicate typical origin",
    (r) => (((r.typicalOrigins as Csv).rows[1] as Any).origin = "us-ca"),
    "duplicate typical origin test-fruit/5/us-ca",
  ],
  [
    "gap in typical ranks",
    (r) => (((r.typicalOrigins as Csv).rows[1] as Any).rank = "3"),
    "ranks must run 1..n",
  ],
  [
    "duplicate supply month",
    (r) => (((r.supplyIndex as Csv).rows[1] as Any).month = "5"),
    "duplicate supply index test-fruit/5",
  ],
  [
    "mismatched snapshot headers",
    (r) => ((r.supplyIndex as Csv).meta.derived = "2026-11-18"),
    "different snapshots",
  ],
  // Sources and seasonal evidence
  ["missing source tier", (r) => delete (r.sources as Any[])[0].tier, "tier"],
  ["bad source tier", (r) => ((r.sources as Any[])[0].tier = "blog"), "tier"],
  ["basedOn unknown source", (r) => ((r.sources as Any[])[1].basedOn = "s9"), "basedOn unknown source s9"],
  [
    "basedOn loop",
    (r) => {
      (r.sources as Any[])[0].basedOn = "s2";
      (r.sources as Any[])[1].basedOn = "s1";
    },
    "basedOn loops back",
  ],
  ["basedOn itself", (r) => ((r.sources as Any[])[0].basedOn = "s1"), "source s1: basedOn loops back to s1"],
  ["claim without paraphrase", (r) => delete firstClaim(r).paraphrase, "paraphrase"],
  ["multi-line paraphrase", (r) => (firstClaim(r).paraphrase = "Best in\nApril."), "one line"],
  ["bad directness", (r) => (firstClaim(r).directness = "vibes"), "directness"],
  ["bad specificity", (r) => (firstClaim(r).specificity = "week"), "specificity"],
  ["claim window label", (r) => (firstClaim(r).windows[0].to = "june-2"), "half-month label"],
  ["claim without windows", (r) => (firstClaim(r).windows = []), "windows"],
  ["claim unknown source", (r) => (firstClaim(r).source = "s9"), "claim 1: unknown source s9"],
  [
    "claim unknown origin",
    (r) => (firstClaim(r).origin = "us-zz"),
    "claim 1: unknown US state in origin us-zz",
  ],
  ["claim unknown variety", (r) => (firstClaim(r).variety = "gala"), "claim 1: unknown variety gala"],
  [
    "claim windows overlap",
    (r) => firstClaim(r).windows.push({ from: "jun-2", to: "jul-1", rating: "fair" }),
    "claim 1: windows overlap",
  ],
  [
    "evidence for unknown item",
    (r) => r.evidence.push({ file: "content/evidence/kumquats.yaml", data: evidence("kumquats") }),
    "evidence kumquats: unknown item kumquats",
  ],
  [
    "evidence file name differs",
    (r) => ((r.evidence[0] as Any).file = "content/evidence/pears.yaml"),
    'file name must match item "test-fruit"',
  ],
  [
    "two evidence files for one item",
    (r) => r.evidence.push({ file: "content/evidence/test-fruit.yml", data: evidence("test-fruit") }),
    "duplicate evidence file for test-fruit",
  ],
  // Advisory dates
  ["inverted advisory", (r) => (firstAdvisory(r).to = "2026-10-01"), "ends (2026-10-01) before it starts"],
  ["over-long advisory", (r) => (firstAdvisory(r).to = "2027-02-01"), "over 90"],
];

describe("validate: each broken input fails with a clear error", () => {
  it.each(broken)("%s", (_name, mutate, fragment) => {
    const raw = structuredClone(base());
    mutate(raw);
    const { errors, dataset } = validate(raw, { production: false });
    expect(dataset).toBeNull();
    expect(errors.join("\n")).toContain(fragment);
  });
});

describe("validate: edge cases that are allowed", () => {
  it("an advisory of exactly 90 days", () => {
    const raw = structuredClone(base());
    firstAdvisory(raw).to = "2027-01-30";
    expect(validate(raw, { production: false }).errors).toEqual([]);
  });

  it("windows that wrap past December without overlapping", () => {
    const raw = structuredClone(base());
    const year = [
      { from: "nov-2", to: "jan-2", rating: "prime" },
      { from: "feb-1", to: "nov-1", rating: "fair" },
    ];
    firstItem(raw).origins[1].windows = structuredClone(year);
    claims(raw)[2].windows = structuredClone(year);
    claims(raw)[3].windows = structuredClone(year);
    expect(validate(raw, { production: false }).errors).toEqual([]);
  });

  it("USDA rows for items without a content file only warn", () => {
    const raw = structuredClone(base());
    (raw.supplyIndex as Csv).rows.push({ item: "kumquats", month: "1", value: "0.9", reason: "" });
    const { errors, warnings } = validate(raw, { production: false });
    expect(errors).toEqual([]);
    expect(warnings).toEqual(["data/usda/supply-index.csv: no item file yet for kumquats"]);
  });
});

describe("validate: production builds", () => {
  it("refuse draft and synthetic records", () => {
    const { errors, dataset } = validate(base(), { production: true });
    expect(dataset).toBeNull();
    expect(errors).toContain("test-fruit: draft records can't ship (production build)");
    expect(errors).toContain("test-fruit: synthetic records can't ship (production build)");
    expect(errors).toContain("test-advisory: draft records can't ship (production build)");
    expect(errors).toContain("evidence test-fruit: draft records can't ship (production build)");
    expect(errors).toContain("evidence test-fruit: synthetic records can't ship (production build)");
  });

  it("accept reviewed real records", () => {
    const raw = structuredClone(base());
    for (const r of [firstItem(raw), firstAdvisory(raw), (raw.evidence[0] as { data: Any }).data]) {
      Object.assign(r, { status: "reviewed", reviewer: "Jared", reviewedOn: "2026-11-17" });
      delete r.synthetic;
    }
    expect(validate(raw, { production: true }).errors).toEqual([]);
  });
});

describe("parseCsv", () => {
  it("reads header comments, the header row and cells", () => {
    const text = "# source: USDA\n# from: 2023-11\nitem,month\napples,1\r\npears,2\n\n";
    expect(parseCsv("t.csv", text, ["item", "month"])).toEqual({
      file: "t.csv",
      meta: { source: "USDA", from: "2023-11" },
      rows: [
        { item: "apples", month: "1" },
        { item: "pears", month: "2" },
      ],
    });
  });

  it("rejects a wrong header or a ragged row", () => {
    expect(() => parseCsv("t.csv", "item,rank\n", ["item", "month"])).toThrow(/header must be/);
    expect(() => parseCsv("t.csv", "item,month\napples\n", ["item", "month"])).toThrow(/line 2 has 1 cells/);
  });
});

import { describe, expect, it } from "vitest";
import { type Csv, parseCsv, type RawInputs, validate } from "./data-validate";

// A minimal valid dataset. Everything here is invented test data (synthetic: true).
const source = (id: string) => ({
  id,
  title: `Test source ${id}`,
  publisher: "Test publisher",
  url: `https://example.com/${id}`,
  accessed: "2026-11-01",
});

const item = (id: string, rank: number) => ({
  id,
  name: "Test fruit",
  category: "berries",
  purchaseRank: rank,
  alwaysGood: false,
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
    {
      origin: "us-ca",
      windows: [
        { from: "apr-1", to: "jun-2", rating: "prime", sources: ["s1", "s2"] },
        { from: "jul-1", to: "aug-2", rating: "fair", sources: ["s1", "s2"] },
      ],
    },
    { origin: "mx", windows: [{ from: "dec-1", to: "mar-2", rating: "fair", sources: ["s1", "s2"] }] },
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
    advisories: [
      {
        id: "test-advisory",
        items: ["test-fruit"],
        origins: ["mx"],
        from: "2026-11-01",
        to: "2026-12-15",
        verdict: "skip",
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
    "rating with one source",
    (r) => (firstItem(r).origins[0].windows[0].sources = ["s1"]),
    "at least 2 sources",
  ],
  ["bad rating value", (r) => (firstItem(r).origins[0].windows[0].rating = "great"), "rating"],
  [
    "inverted storage range",
    (r) => (firstItem(r).store.life = { min: 5, max: 2, unit: "days" }),
    "min must not exceed max",
  ],
  ["reviewed without reviewer", (r) => (firstItem(r).status = "reviewed"), "needs reviewedOn and reviewer"],
  [
    "variety freshest months without 2 sources",
    (r) =>
      (firstItem(r).varieties = [
        {
          id: "v",
          name: "V",
          traits: {},
          bestUses: ["Eating"],
          label: "V",
          freshestMonths: [9],
          sources: ["s1"],
        },
      ]),
    "freshestMonths needs",
  ],
  [
    "bad rules threshold",
    (r) => ((r.rules as Any).supplyIndex = { thin: 1.3, strong: 1.2 }),
    "thin must be below strong",
  ],
  ["bad source url", (r) => ((r.sources as Any[])[0].url = "not a url"), "url"],
  ["sources not a list", (r) => (r.sources = { id: "s1" }), "expected a list"],
  ["bad advisory verdict", (r) => (firstAdvisory(r).verdict = "limited"), "verdict"],
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
  ["unknown source", (r) => (firstItem(r).origins[0].windows[0].sources = ["s1", "s9"]), "unknown source s9"],
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
        sources: ["s1", "s2"],
      }),
    "windows overlap",
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
    firstItem(raw).origins[1].windows = [
      { from: "nov-2", to: "jan-2", rating: "prime", sources: ["s1", "s2"] },
      { from: "feb-1", to: "nov-1", rating: "fair", sources: ["s1", "s2"] },
    ];
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
  });

  it("accept reviewed real records", () => {
    const raw = structuredClone(base());
    for (const r of [firstItem(raw), firstAdvisory(raw)]) {
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

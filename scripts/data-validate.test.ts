import { describe, expect, it } from "vitest";
import { WINDOW_COUNT, windowRange } from "../src/shared/time";
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
  shipsWell: { value: true, sources: ["s1"] },
  peakWorthSeeking: { value: true, sources: ["s1"] },
  storesWell: { value: false, sources: ["s1"] },
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

// Synthetic: a reviewed summary line for each of the 24 windows.
const LABELS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].flatMap(
  (m) => [`${m}-1`, `${m}-2`],
);
const summaries = () => ({
  status: "reviewed",
  reviewer: "Jared",
  reviewedOn: "2026-11-17",
  windows: Object.fromEntries(LABELS.map((l) => [l, `Test summary for ${l}.`])),
});

function base(): RawInputs {
  return {
    rules: {
      version: 1,
      typicalOriginShare: 0.7,
      majorOriginShare: 0.25,
      availableShare: 0.33,
      lookForShare: 0.75,
      ratedTypicalShare: 0.75,
      supplyIndex: { thin: 0.8, strong: 1.2 },
      varietyInStoreShare: 0.1,
      peakCountries: ["us", "mx", "ca"],
      reliableYearRoundWindows: 20,
      snapshotMaxAgeMonths: 15,
      lastCallWindows: 2,
    },
    sources: [source("s1"), source("s2")],
    categories: [{ id: "berries", name: "Berries", group: "fruit" }],
    states: csv("data/us-states.csv", [
      { state: "CA", name: "California" },
      { state: "WA", name: "Washington" },
    ]),
    items: [{ file: "content/items/test-fruit.yaml", data: item("test-fruit", 1) }],
    guides: [],
    summaries: summaries(),
    evidence: [{ file: "content/evidence/test-fruit.yaml", data: evidence("test-fruit") }],
    typicalOrigins: csv("data/usda/typical-origins.csv", [
      { item: "test-fruit", month: "5", rank: "1", origin: "us-ca", major: "true", share: "0.6" },
      { item: "test-fruit", month: "5", rank: "2", origin: "mx", major: "false", share: "0.2" },
    ]),
    supplyIndex: csv("data/usda/supply-index.csv", [
      { item: "test-fruit", month: "5", origin: "us-ca", value: "1.31", reason: "" },
      { item: "test-fruit", month: "6", origin: "us-ca", value: "", reason: "not_reported" },
    ]),
    panel: [],
    varietyCalendar: {
      ...csv("data/usda/variety-calendar.csv", [
        { item: "test-fruit", variety: "gala", month: "5", share: "0.42", origins: "us-ca mx" },
        { item: "test-fruit", variety: "gala", month: "6", share: "0", origins: "" },
      ]),
      // Another report family from the same derive run: same period and date, its own source.
      meta: { source: "Synthetic terminal markets", from: "2023-11", to: "2026-10", derived: "2026-11-17" },
    },
  };
}

// biome-ignore lint/suspicious/noExplicitAny: fixtures poke into untyped raw input on purpose
type Any = any;
const firstItem = (r: RawInputs): Any => (r.items[0] as { data: Any }).data;
const claims = (r: RawInputs): Any[] => (r.evidence[0] as { data: Any }).data.claims;
const firstClaim = (r: RawInputs): Any => claims(r)[0];
const gala = (windows?: object[]) => ({
  id: "gala",
  name: "Gala",
  traits: {},
  bestUses: ["Eating"],
  label: "Gala",
  ...(windows ? { windows: structuredClone(windows), quotedAs: ["gala"] } : {}),
});
/** Makes the item assessment-only with editorial typical origins, and drops its USDA rows. */
const editorialOrigins = (r: RawInputs) => {
  Object.assign(firstItem(r), {
    evidenceBasis: "assessment-only",
    typicalOrigins: [
      {
        from: "apr",
        to: "aug",
        origins: [{ origin: "us-ca", major: true }],
        sources: ["s1"],
      },
      {
        from: "dec",
        to: "mar",
        origins: [
          { origin: "mx", major: true },
          { origin: "us-ca", major: false },
        ],
        sources: ["s1", "s2"],
      },
    ],
  });
  (r.typicalOrigins as Csv).rows = [];
};
/** Rates the variety gala over SUMMER, backed by both sources. */
const rateByVariety = (r: RawInputs) => {
  firstItem(r).varieties = [gala(SUMMER)];
  claims(r).push(claim("s1", SUMMER, { variety: "gala" }), claim("s2", SUMMER, { variety: "gala" }));
};

/** A guide for test-fruit with one scale; gala and fuji are its reference varieties at 5 and 1. */
const anchor = (varieties: string[]) => ({ text: "An anchor", varieties });
const withGuide = (r: RawInputs) => {
  firstItem(r).varieties = [
    { ...gala(), traits: { sweetness: 5 }, sources: ["s1"] },
    { ...gala(), id: "fuji", name: "Fuji", label: "Fuji", traits: { sweetness: 1 }, sources: ["s2"] },
    { ...gala(), id: "envy", name: "Envy", label: "Envy", traits: { sweetness: 3 }, sources: ["s2"] },
  ];
  r.guides = [
    {
      id: "test-guide",
      name: "Test fruit",
      items: ["test-fruit"],
      lead: { text: "Sweetness is what differs.", status: "draft" },
      uses: [{ id: "eating", name: "Eating", match: ["eat"] }],
      traits: [
        {
          id: "sweetness",
          name: "Sweetness",
          anchors: { 1: anchor(["fuji"]), 3: anchor(["envy"]), 5: anchor(["gala"]) },
          filters: { high: "Sweet" },
        },
      ],
      status: "draft",
      synthetic: true,
    },
  ];
};
const guide = (r: RawInputs): Any => (r.guides as Any[])[0];
const withOverall = (r: RawInputs, tiers = { amazing: 90, great: 75, fine: 65 }, source = "s1") => {
  withGuide(r);
  guide(r).overall = { basis: "Eating raw", source, tiers };
};

describe("validate: a valid dataset", () => {
  it("accepts a variety guide whose varieties sit on its scales", () => {
    const raw = structuredClone(base());
    withGuide(raw);
    const { errors, dataset } = validate(raw, { production: false });
    expect(errors).toEqual([]);
    expect(dataset?.guides[0]?.traits[0]?.anchors[5].varieties).toEqual(["gala"]);
  });

  it("warns about a guide trait a variety doesn't rate yet, and allows an anchor with no reference", () => {
    const raw = structuredClone(base());
    withGuide(raw);
    firstItem(raw).varieties[2].traits = {};
    guide(raw).traits[0].anchors[3].varieties = [];
    const { errors, warnings } = validate(raw, { production: false });
    expect(errors).toEqual([]);
    expect(warnings).toEqual(["item test-fruit variety envy: no sweetness rating yet"]);
  });

  it("asks for a ripe cue on every variety of a guide with ripeCues", () => {
    const raw = structuredClone(base());
    withGuide(raw);
    guide(raw).ripeCues = true;
    firstItem(raw).varieties[0].ripeCue = "Turns yellow when ripe";
    firstItem(raw).varieties[1].ripeCue = "Gives at the neck";
    const { errors, warnings } = validate(raw, { production: false });
    expect(errors).toEqual([]);
    expect(warnings).toEqual(["item test-fruit variety envy: no ripe cue yet"]);
  });

  it("asks for an overall score on every variety of a guide with an overall rating", () => {
    const raw = structuredClone(base());
    withGuide(raw);
    guide(raw).overall = {
      basis: "Eating raw",
      source: "s1",
      tiers: { amazing: 90, great: 75, fine: 65 },
    };
    firstItem(raw).varieties[0].overallScore = { source: 95, editorial: 90 };
    firstItem(raw).varieties[1].overallScore = { source: 0, editorial: 0 };
    const { errors, warnings } = validate(raw, { production: false });
    expect(errors).toEqual([]);
    expect(warnings).toEqual(["item test-fruit variety envy: no overall score yet"]);
  });

  it("passes and normalizes defaults", () => {
    const { errors, warnings, dataset } = validate(base(), { production: false });
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect(dataset?.items[0]?.synonyms).toEqual([]);
    expect(dataset?.supplyIndex[1]).toEqual({
      item: "test-fruit",
      month: 6,
      origin: "us-ca",
      value: null,
      reason: "not_reported",
    });
    expect(dataset?.typicalOrigins[0]?.month).toBe(5);
    expect(dataset?.typicalOrigins.map((r) => r.major)).toEqual([true, false]);
    expect(dataset?.varietyCalendar.map((r) => [r.share, r.origins])).toEqual([
      [0.42, ["us-ca", "mx"]],
      [0, []],
    ]);
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

  it("accepts a rated variety with cited in-store months in place of quotedAs (P13)", () => {
    const raw = structuredClone(base());
    rateByVariety(raw);
    const v = firstItem(raw).varieties[0];
    delete v.quotedAs;
    v.inStores = [{ from: "jan", to: "dec", sources: ["s1"] }];
    const { errors, dataset } = validate(raw, { production: false });
    expect(errors).toEqual([]);
    expect(dataset?.items[0]?.varieties[0]?.inStores[0]?.to).toBe("dec");
  });

  it("accepts a rating that departs from the evidence when it gives a reason", () => {
    const raw = structuredClone(base());
    Object.assign(firstItem(raw).origins[0].windows[1], {
      rating: "poor",
      reason: "Late-summer fruit in test stores is usually soft.",
    });
    expect(validate(raw, { production: false }).errors).toEqual([]);
  });

  it("accepts a window the model panel rates (P15); eating-quality claims outweighing it overrule it at Low", () => {
    const raw = structuredClone(base());
    claims(raw)[1].source = "s1";
    const values = Array(WINDOW_COUNT).fill(null);
    for (const i of windowRange("apr-1", "jun-2")) values[i] = 1;
    for (const i of windowRange("jul-1", "aug-2")) values[i] = 0.5;
    raw.panel = [{ item: "test-fruit", origin: "us-ca", values }];
    expect(validate(raw, { production: false }).errors).toEqual([]);
    for (const i of windowRange("jul-1", "aug-2")) values[i] = 0;
    expect(validate(raw, { production: false }).errors.join("\n")).toContain(
      "us-ca jul-1..aug-2: the evidence is Low confidence at jul-1; add a reason",
    );
  });

  it("accepts a window the model panel rates with no cited source (P15)", () => {
    const raw = structuredClone(base());
    raw.evidence = [];
    const values = Array(WINDOW_COUNT).fill(null);
    for (const i of windowRange("apr-1", "jun-2")) values[i] = 1;
    for (const i of windowRange("jul-1", "aug-2")) values[i] = 0.5;
    raw.panel = [{ item: "test-fruit", origin: "us-ca", values }];
    const usCa = () => validate(raw, { production: false }).errors.filter((e) => e.includes(" us-ca "));
    expect(usCa()).toEqual([]);
    raw.panel = [];
    expect(validate(raw, { production: false }).errors.join(String.fromCharCode(10))).toContain(
      "needs claims from 2 independent sources, has 0 at apr-1",
    );
  });

  it("accepts Low-confidence evidence when the rating gives a reason", () => {
    const raw = structuredClone(base());
    claims(raw)[0].windows[1].rating = "prime";
    claims(raw)[1].windows[1].rating = "poor";
    firstItem(raw).origins[0].windows[1].reason = "Sources split; fair is the cautious call.";
    expect(validate(raw, { production: false }).errors).toEqual([]);
  });

  it("accepts editorial typical origins on an assessment-only item", () => {
    const raw = structuredClone(base());
    editorialOrigins(raw);
    const { errors, dataset } = validate(raw, { production: false });
    expect(errors).toEqual([]);
    expect(dataset?.items[0]?.typicalOrigins[1]?.origins.map((o) => o.origin)).toEqual(["mx", "us-ca"]);
  });

  it("accepts the US as a whole (us) as a rated and typical origin", () => {
    const raw = structuredClone(base());
    editorialOrigins(raw);
    const it0 = firstItem(raw);
    it0.origins[0].origin = "us";
    for (const run of it0.typicalOrigins)
      for (const o of run.origins) if (o.origin === "us-ca") o.origin = "us";
    for (const c of claims(raw)) if (c.origin === "us-ca") c.origin = "us";
    const { errors, dataset } = validate(raw, { production: false });
    expect(errors).toEqual([]);
    expect(dataset?.items[0]?.typicalOrigins[0]?.origins.map((o) => o.origin)).toEqual(["us"]);
  });

  it("accepts a selection of rated near origins with cited in-store months (P16)", () => {
    const raw = base();
    firstItem(raw).selections = [
      {
        ...{ id: "local", label: "local field-grown", cue: "Look for a local sign.", origins: ["us-ca"] },
        inStores: [{ from: "jul", to: "sep", sources: ["s1"] }],
      },
    ];
    const { errors, dataset } = validate(raw, { production: false });
    expect(errors).toEqual([]);
    expect(dataset?.items[0]?.selections[0]?.inStores[0]?.to).toBe("sep");
  });

  it("works without any USDA snapshot", () => {
    const raw = { ...base(), typicalOrigins: null, supplyIndex: null, varietyCalendar: null };
    expect(validate(raw, { production: false }).dataset?.snapshot).toBeNull();
  });
});

// One broken input per check: [description, mutation, expected error fragment].
const broken: [string, (r: RawInputs) => void, string][] = [
  // Variety guides
  [
    "guide for an unknown item",
    (r) => {
      withGuide(r);
      guide(r).items.push("kiwi");
    },
    "guide test-guide: unknown item kiwi",
  ],
  [
    "item in two guides",
    (r) => {
      withGuide(r);
      (r.guides as Any[]).push({ ...structuredClone(guide(r)), id: "other" });
    },
    "guide other: item test-fruit is already in guide test-guide",
  ],
  [
    "guide lead over the word limit",
    (r) => {
      withGuide(r);
      guide(r).lead.text = Array(61).fill("word").join(" ");
    },
    "lead.text: at most 60 words",
  ],
  [
    "guide lead reviewed without a reviewer",
    (r) => {
      withGuide(r);
      guide(r).lead.status = "reviewed";
    },
    "a reviewed record needs reviewedOn and reviewer",
  ],
  [
    "unknown reference variety",
    (r) => {
      withGuide(r);
      guide(r).traits[0].anchors[3].varieties = ["kiku"];
    },
    "guide test-guide sweetness 3: unknown reference variety kiku",
  ],
  [
    "reference variety off its anchor",
    (r) => {
      withGuide(r);
      firstItem(r).varieties[1].traits.sweetness = 2;
    },
    "guide test-guide sweetness 1: reference variety fuji is rated 2",
  ],
  [
    "variety trait not on the guide",
    (r) => {
      withGuide(r);
      firstItem(r).varieties[2].traits.crunch = 4;
    },
    "item test-fruit variety envy: trait crunch isn't on guide test-guide",
  ],
  [
    "traits without a citation",
    (r) => {
      withGuide(r);
      firstItem(r).varieties[2].sources = [];
    },
    "item test-fruit variety envy: cite a source for its traits and uses",
  ],
  [
    "best use under none of the guide's uses",
    (r) => {
      withGuide(r);
      firstItem(r).varieties[2].bestUses = ["Eating", "Juicing"];
    },
    `guide test-guide: variety envy's use "Juicing" matches none of the guide's uses`,
  ],
  [
    "use chip that finds no variety",
    (r) => {
      withGuide(r);
      guide(r).uses.push({ id: "baking", name: "Baking", match: ["bak"] });
    },
    "guide test-guide: use baking matches no variety",
  ],
  [
    "duplicate use chip",
    (r) => {
      withGuide(r);
      guide(r).uses.push({ id: "eating", name: "Eating again", match: ["eat"] });
    },
    "duplicate use test-guide/eating",
  ],
  [
    "trait chip label too long",
    (r) => {
      withGuide(r);
      guide(r).traits[0].filters = { high: "Very very sweet indeed" };
    },
    "at most 3 words",
  ],
  [
    "guide without use chips",
    (r) => {
      withGuide(r);
      guide(r).uses = [];
    },
    "content/guides.yaml",
  ],
  [
    "ripe cue on a guide without ripeCues",
    (r) => {
      withGuide(r);
      firstItem(r).varieties[0].ripeCue = "Turns yellow when ripe";
    },
    "item test-fruit variety gala: a ripe cue needs a guide with ripeCues",
  ],
  [
    "overall score without an overall rating",
    (r) => {
      withGuide(r);
      firstItem(r).varieties[0].overallScore = { source: 80, editorial: 80 };
    },
    "item test-fruit variety gala: an overall score needs a guide with an overall rating",
  ],
  [
    "overall score above 100",
    (r) => {
      withOverall(r);
      firstItem(r).varieties[0].overallScore = { source: 80, editorial: 101 };
    },
    "content/items/test-fruit.yaml: varieties.0.overallScore.editorial",
  ],
  [
    "overall rating from an unknown source",
    (r) => withOverall(r, undefined, "nobody"),
    "guide test-guide overall: unknown source nobody",
  ],
  [
    "overall tiers out of order",
    (r) => withOverall(r, { amazing: 75, great: 90, fine: 65 }),
    "tier floors must fall",
  ],
  [
    "overall tier floor at 0",
    (r) => withOverall(r, { amazing: 90, great: 75, fine: 0 }),
    "tier floors must fall",
  ],
  [
    "ripe cue over 12 words",
    (r) => {
      withGuide(r);
      guide(r).ripeCues = true;
      firstItem(r).varieties[0].ripeCue = Array(13).fill("w").join(" ");
    },
    "varieties.0.ripeCue: at most 12 words",
  ],
  [
    "traits on an item with no guide",
    (r) => (firstItem(r).varieties = [{ ...gala(), traits: { sweetness: 3 } }]),
    "item test-fruit variety gala: traits need a guide for test-fruit",
  ],
  [
    "trait value off the 1–5 scale",
    (r) => {
      withGuide(r);
      firstItem(r).varieties[2].traits.sweetness = 6;
    },
    "varieties.2.traits.sweetness",
  ],
  [
    "anchor missing its middle level",
    (r) => {
      withGuide(r);
      delete guide(r).traits[0].anchors[3];
    },
    "content/guides.yaml[0]: traits.0.anchors.3",
  ],
  [
    "anchor text over 12 words",
    (r) => {
      withGuide(r);
      guide(r).traits[0].anchors[5].text = Array(13).fill("w").join(" ");
    },
    "at most 12 words",
  ],
  // Schema errors
  ["missing required field", (r) => delete firstItem(r).cardLine, "cardLine"],
  ["misspelled field", (r) => (firstItem(r).cardline = "x"), 'Unrecognized key: "cardline"'],
  ["non-kebab id", (r) => (firstItem(r).id = "Test_Fruit"), "lowercase-kebab"],
  [
    "card line over 12 words",
    (r) =>
      (firstItem(r).cardLine =
        "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen"),
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
  ["major not a boolean", (r) => (((r.typicalOrigins as Csv).rows[0] as Any).major = "yes"), "line 2"],
  ["month out of range", (r) => (((r.typicalOrigins as Csv).rows[0] as Any).month = "13"), "line 2"],
  // Unknown IDs
  [
    "unknown variety source",
    (r) => (firstItem(r).varieties = [{ ...gala(), sources: ["s9"] }]),
    "variety gala: unknown source s9",
  ],
  [
    "PLU codes citing an unknown source",
    (r) => (firstItem(r).varieties = [{ ...gala(), plu: { codes: [4133], sources: ["s9"] } }]),
    "variety gala plu: unknown source s9",
  ],
  [
    "a PLU code on two varieties",
    (r) =>
      (firstItem(r).varieties = [
        { ...gala(), plu: { codes: [4133, 4135], sources: ["s1"] } },
        { ...gala(), id: "fuji", plu: { codes: [4131, 4135], sources: ["s1"] } },
      ]),
    "duplicate PLU code 4135",
  ],
  [
    "a PLU code outside 3000–4999",
    (r) => (firstItem(r).varieties = [{ ...gala(), plu: { codes: [94133], sources: ["s1"] } }]),
    "plu",
  ],
  [
    "PLU with no codes",
    (r) => (firstItem(r).varieties = [{ ...gala(), plu: { codes: [], sources: ["s1"] } }]),
    "plu",
  ],
  ["unknown store source", (r) => (firstItem(r).store.sources = ["s9"]), "store: unknown source s9"],
  ["unknown trait source", (r) => (firstItem(r).shipsWell.sources = ["s9"]), "shipsWell: unknown source s9"],
  [
    "variety in-store months citing an unknown source",
    (r) =>
      (firstItem(r).varieties = [{ ...gala(), inStores: [{ from: "jul", to: "sep", sources: ["s9"] }] }]),
    "variety gala inStores: unknown source s9",
  ],
  [
    "unknown variety storesWell source",
    (r) => (firstItem(r).varieties = [{ ...gala(), storesWell: { value: true, sources: ["s9"] } }]),
    "variety gala storesWell: unknown source s9",
  ],
  ["trait without a citation", (r) => (firstItem(r).peakWorthSeeking.sources = []), "cite at least 1 source"],
  ["trait as a bare yes/no", (r) => (firstItem(r).storesWell = true), "storesWell"],
  ["unknown category", (r) => (firstItem(r).category = "nuts"), "unknown category nuts"],
  [
    "unknown US state origin",
    (r) => (firstItem(r).origins[0].origin = "us-zz"),
    "unknown US state in origin us-zz",
  ],
  ["unknown country origin", (r) => (firstItem(r).origins[1].origin = "qq"), "unknown origin qq"],
  [
    "a Today summary missing",
    (r) => delete (r.summaries as Any).windows["dec-2"],
    "needs a summary for each of the 24 windows",
  ],
  [
    "a Today summary over 18 words",
    (r) =>
      ((r.summaries as Any).windows["jan-1"] =
        "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen"),
    "content/summaries.yaml: windows.jan-1: at most 18 words",
  ],
  [
    "a Today summary under an unknown window",
    (r) => ((r.summaries as Any).windows["jan-3"] = "Extra."),
    "windows.jan-3: Invalid key in record",
  ],
  [
    "reviewed summaries without a reviewer",
    (r) => delete (r.summaries as Any).reviewer,
    "a reviewed record needs reviewedOn and reviewer",
  ],
  [
    "both us and a US state rated",
    (r) => (firstItem(r).origins[1].origin = "us"),
    "rates both us and US states",
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
    (r) => (r.categories as Any[]).push({ id: "berries", name: "More berries", group: "fruit" }),
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
    "typical share rising with rank",
    (r) => (((r.typicalOrigins as Csv).rows[1] as Any).share = "0.7"),
    "shares must not rise with rank",
  ],
  [
    "typical shares over 1",
    (r) => (((r.typicalOrigins as Csv).rows[0] as Any).share = "0.9"),
    "shares sum over 1",
  ],
  ["typical share missing", (r) => (((r.typicalOrigins as Csv).rows[0] as Any).share = ""), "line 2"],
  [
    "gap in typical ranks",
    (r) => (((r.typicalOrigins as Csv).rows[1] as Any).rank = "3"),
    "ranks must run 1..n",
  ],
  [
    "duplicate supply month",
    (r) => (((r.supplyIndex as Csv).rows[1] as Any).month = "5"),
    "duplicate supply index test-fruit/us-ca/5",
  ],
  [
    "variety share over 1",
    (r) => (((r.varietyCalendar as Csv).rows[0] as Any).share = "1.2"),
    "variety-calendar.csv line 2",
  ],
  [
    "unknown variety calendar origin",
    (r) => (((r.varietyCalendar as Csv).rows[0] as Any).origins = "us-ca qq"),
    "variety calendar test-fruit/gala/5",
  ],
  [
    "duplicate variety calendar month",
    (r) => (((r.varietyCalendar as Csv).rows[1] as Any).month = "5"),
    "duplicate variety calendar test-fruit/gala/5",
  ],
  [
    "rated variety without quotedAs",
    (r) => {
      rateByVariety(r);
      delete firstItem(r).varieties[0].quotedAs;
    },
    "variety gala: a rated variety needs quotedAs or inStores",
  ],
  [
    "quotedAs not in the calendar",
    (r) => {
      rateByVariety(r);
      firstItem(r).varieties[0].quotedAs = ["sour-one"];
    },
    "variety gala: quotedAs sour-one isn't in the variety calendar",
  ],
  [
    "calendar from another derive run",
    (r) => ((r.varietyCalendar as Csv).meta.derived = "2026-11-18"),
    "different snapshots",
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
  // Editorial typical origins
  [
    "editorial typical origins on a supply+assessment item",
    (r) => {
      editorialOrigins(r);
      firstItem(r).evidenceBasis = "supply+assessment";
    },
    "editorial typical origins are for assessment-only items",
  ],
  [
    "editorial typical origins beside USDA rows",
    (r) => {
      const usda = structuredClone((r.typicalOrigins as Csv).rows);
      editorialOrigins(r);
      (r.typicalOrigins as Csv).rows = usda;
    },
    "item test-fruit: editorial typical origins and USDA ones (typical-origins.csv); keep one",
  ],
  [
    "editorial typical origins overlapping across the year end",
    (r) => {
      editorialOrigins(r);
      firstItem(r).typicalOrigins[0].from = "mar";
    },
    "item test-fruit typical origins dec..mar: months overlap",
  ],
  [
    "bad editorial month label",
    (r) => {
      editorialOrigins(r);
      firstItem(r).typicalOrigins[0].to = "august";
    },
    "month label",
  ],
  [
    "editorial typical origins without a citation",
    (r) => {
      editorialOrigins(r);
      firstItem(r).typicalOrigins[0].sources = [];
    },
    "cite at least 1 source",
  ],
  [
    "editorial typical origins with no origin",
    (r) => {
      editorialOrigins(r);
      firstItem(r).typicalOrigins[0].origins = [];
    },
    "typicalOrigins.0.origins",
  ],
  [
    "editorial typical origin unknown",
    (r) => {
      editorialOrigins(r);
      firstItem(r).typicalOrigins[1].origins[1].origin = "qq";
    },
    "typical origins dec..mar: unknown origin qq",
  ],
  [
    "editorial typical origins unknown source",
    (r) => {
      editorialOrigins(r);
      firstItem(r).typicalOrigins[1].sources = ["s9"];
    },
    "typical origins dec..mar: unknown source s9",
  ],
  [
    "duplicate editorial typical origin",
    (r) => {
      editorialOrigins(r);
      firstItem(r).typicalOrigins[1].origins[1].origin = "mx";
    },
    "duplicate typical origin test-fruit/dec..mar/mx",
  ],
  [
    "editorial typical origin without major",
    (r) => {
      editorialOrigins(r);
      delete firstItem(r).typicalOrigins[0].origins[0].major;
    },
    "major",
  ],
  // Selections (P16)
  [
    "selection origin the item doesn't rate",
    (r) =>
      (firstItem(r).selections = [
        {
          ...{ id: "local", label: "local field-grown", cue: "Look for a local sign.", origins: ["us-ca"] },
          origins: ["us-nj"],
        },
      ]),
    "selection local: us-nj is not a rated origin of the item",
  ],
  [
    "selection origin outside the Peak countries",
    (r) => {
      firstItem(r).origins.push({ origin: "cl", windows: structuredClone(WINTER) });
      firstItem(r).selections = [
        {
          ...{ id: "local", label: "local field-grown", cue: "Look for a local sign.", origins: ["us-ca"] },
          origins: ["cl"],
        },
      ];
    },
    "cl is outside rules.peakCountries",
  ],
  [
    "selection in-store months citing an unknown source",
    (r) =>
      (firstItem(r).selections = [
        {
          ...{ id: "local", label: "local field-grown", cue: "Look for a local sign.", origins: ["us-ca"] },
          inStores: [{ from: "jul", to: "sep", sources: ["nope"] }],
        },
      ]),
    "selection local: unknown source nope",
  ],
  [
    "duplicate selection",
    (r) =>
      (firstItem(r).selections = [
        { id: "local", label: "local field-grown", cue: "Look for a local sign.", origins: ["us-ca"] },
        { id: "local", label: "local field-grown", cue: "Look for a local sign.", origins: ["us-ca"] },
      ]),
    "duplicate selection",
  ],
  [
    "selection label over 6 words",
    (r) =>
      (firstItem(r).selections = [
        {
          ...{ id: "local", label: "local field-grown", cue: "Look for a local sign.", origins: ["us-ca"] },
          label: "a b c d e f g",
        },
      ]),
    "at most 6 words",
  ],
  [
    "selection on an item rated by variety",
    (r) => {
      firstItem(r).varieties = [
        {
          id: "v",
          name: "V",
          traits: {},
          bestUses: ["Eating"],
          label: "V",
          windows: structuredClone(SUMMER),
          quotedAs: ["v"],
        },
      ];
      firstItem(r).selections = [
        { id: "local", label: "local field-grown", cue: "Look for a local sign.", origins: ["us-ca"] },
      ];
    },
    "selections are for items not rated by variety",
  ],
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

  it("an unrated variety quoted under a calendar name", () => {
    const raw = structuredClone(base());
    firstItem(raw).varieties = [{ ...gala(), quotedAs: ["gala"] }];
    expect(validate(raw, { production: false }).errors).toEqual([]);
  });

  it("USDA rows for items without a content file only warn", () => {
    const raw = structuredClone(base());
    (raw.supplyIndex as Csv).rows.push({
      item: "kumquats",
      month: "1",
      origin: "us-ca",
      value: "0.9",
      reason: "",
    });
    const { errors, warnings } = validate(raw, { production: false });
    expect(errors).toEqual([]);
    expect(warnings).toEqual(["data/usda/supply-index.csv: no item file yet for kumquats"]);
  });
});

describe("validate: production builds", () => {
  it("refuse synthetic records", () => {
    const { errors, dataset } = validate(base(), { production: true });
    expect(dataset).toBeNull();
    expect(errors).toContain("test-fruit: synthetic records can't ship (production build)");
    expect(errors).toContain("evidence test-fruit: synthetic records can't ship (production build)");
  });

  it("ship draft items, evidence, guides and summaries", () => {
    const raw = structuredClone(base());
    withGuide(raw);
    (raw.summaries as Any).status = "draft";
    for (const r of [...(raw.items as Any[]), ...(raw.evidence as Any[])]) delete r.data.synthetic;
    for (const s of raw.sources as Any[]) delete s.synthetic;
    delete guide(raw).synthetic;
    const { errors, dataset } = validate(raw, { production: true });
    expect(errors).toEqual([]);
    expect(dataset).not.toBeNull();
  });

  it("refuse synthetic sources", () => {
    const raw = structuredClone(base());
    (raw.sources as Any[])[0].synthetic = true;
    expect(validate(raw, { production: true }).errors).toContain(
      "source s1: synthetic records can't ship (production build)",
    );
    expect(validate(raw, { production: false }).errors).toEqual([]);
  });

  it("accept reviewed real records", () => {
    const raw = structuredClone(base());
    for (const r of [firstItem(raw), (raw.evidence[0] as { data: Any }).data]) {
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

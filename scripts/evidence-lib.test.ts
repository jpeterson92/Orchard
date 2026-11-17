import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { WINDOW_COUNT, windowRange } from "../src/shared/time";
import {
  checkRegistry,
  claimProblems,
  decodeEntities,
  describeWindows,
  excerpts,
  htmlToLines,
  monthsNamed,
  parseItemMonths,
  parseMonthRanges,
  parseRobots,
  type RegistryPage,
  registrySchema,
  robotsAllows,
  rowClaim,
  runs,
} from "./evidence-lib";

describe("htmlToLines", () => {
  it("drops scripts, styles and the head, and keeps one line per block", () => {
    const html = `<html><head><title>T</title><style>p{}</style></head><body><script>var x=1</script>
      <h1>Crops &amp; seasons</h1><p>Strawberry: December&nbsp;through April</p><ul><li>Broccoli: Jan&#8211;Mar</li></ul></body></html>`;
    expect(htmlToLines(html)).toEqual([
      "Crops & seasons",
      "Strawberry: December through April",
      "Broccoli: Jan–Mar",
    ]);
  });

  it("joins a table row's cells, flattening blocks inside a cell", () => {
    const html = `<table><tr><th><p>Fruit</p></th><th><p>Months</p></th></tr>
      <tr><td><p>Apples*</p></td><td><p>June–October</p></td></tr></table>`;
    expect(htmlToLines(html)).toEqual(["Fruit | Months", "Apples* | June–October"]);
  });

  it("decodes named, decimal and hex entities and leaves unknown ones", () => {
    expect(decodeEntities("a&ndash;b &#x2019; &#160; &bogus;")).toBe("a–b ’   &bogus;");
  });
});

describe("robots.txt", () => {
  const txt = `
User-agent: *
Disallow: /private/
Allow: /private/open
Disallow: /*.pdf$

User-agent: OrchardEvidence
Disallow: /no-bots/
`;

  it("uses the group naming this agent over *", () => {
    const rules = parseRobots(txt);
    expect(robotsAllows(rules, "/no-bots/page")).toBe(false);
    expect(robotsAllows(rules, "/private/page")).toBe(true);
  });

  it.each([
    ["/private/page", false],
    ["/private/open/x", true],
    ["/guide.pdf", false],
    ["/guide.pdf?x=1", true],
    ["/harvest-calendar", true],
  ])("in the * group, %s is allowed: %s", (path, allowed) => {
    const rules = parseRobots(txt.replace(/User-agent: OrchardEvidence[\s\S]*/, ""));
    expect(robotsAllows(rules, path)).toBe(allowed);
  });

  it("allows everything when the file has no rules for us, and an empty Disallow blocks nothing", () => {
    expect(robotsAllows(parseRobots(""), "/a")).toBe(true);
    expect(robotsAllows(parseRobots("User-agent: *\nDisallow:\n"), "/a")).toBe(true);
    expect(robotsAllows(parseRobots("User-agent: *\nDisallow: /\n"), "/a")).toBe(false);
  });

  it("groups consecutive User-agent lines", () => {
    const rules = parseRobots("User-agent: googlebot\nUser-agent: *\nDisallow: /x\n");
    expect(robotsAllows(rules, "/x")).toBe(false);
  });
});

describe("monthsNamed", () => {
  it.each([
    ["June–October", [6, 10]],
    ["Jan. through Sept", [1, 9]],
    ["mayonnaise in March", [3]],
    ["no months here, only Marching bands", []],
  ])("%s", (text, months) => {
    expect([...monthsNamed(text)].sort((a, b) => a - b)).toEqual(months);
  });
});

describe("parseMonthRanges", () => {
  it.each([
    // Mississippi State: whole months.
    ["June–October", [{ from: "jun-1", to: "oct-2" }], false],
    [
      "April–May and October–November",
      [
        { from: "apr-1", to: "may-2" },
        { from: "oct-1", to: "nov-2" },
      ],
      false,
    ],
    ["June", [{ from: "jun-1", to: "jun-2" }], false],
    // Penn State: parts of months.
    ["End of July through end of October", [{ from: "jul-2", to: "oct-2" }], true],
    ["May through beginning of June", [{ from: "may-1", to: "jun-1" }], true],
    ["Mid-July through Mid-October", [{ from: "jul-2", to: "oct-1" }], true],
    ["2nd week in August through 3rd week in October", [{ from: "aug-1", to: "oct-2" }], true],
    ["June through 1st week in July", [{ from: "jun-1", to: "jul-1" }], true],
    [
      "July and August, October and November",
      [
        { from: "jul-1", to: "aug-2" },
        { from: "oct-1", to: "nov-2" },
      ],
      false,
    ],
    [
      "July and September through 3rd week in October",
      [
        { from: "jul-1", to: "jul-2" },
        { from: "sep-1", to: "oct-2" },
      ],
      true,
    ],
    ["September and October", [{ from: "sep-1", to: "oct-2" }], false],
    // Florida: wraps past December.
    ["December through April", [{ from: "dec-1", to: "apr-2" }], false],
    ["Jan - Mar", [{ from: "jan-1", to: "mar-2" }], false],
    ["late June", [{ from: "jun-2", to: "jun-2" }], true],
    ["mid-June", [{ from: "jun-1", to: "jun-2" }], true],
    ["January–December", [{ from: "jan-1", to: "dec-2" }], false],
  ])("%s", (text, windows, halfMonth) => {
    expect(parseMonthRanges(text)).toEqual({ windows, halfMonth });
  });

  it.each(["", "year-round", "Spring and fall", "June–July–August", "Various", "June 5"])(
    "%s is not a month range",
    (text) => {
      expect(parseMonthRanges(text)).toBeNull();
    },
  );
});

describe("runs", () => {
  it("joins a run across December and covers the full year as one window", () => {
    expect(runs(new Set([22, 23, 0, 1, 5]))).toEqual([
      { from: "mar-2", to: "mar-2" },
      { from: "dec-1", to: "jan-2" },
    ]);
    expect(runs(new Set(Array.from({ length: WINDOW_COUNT }, (_, i) => i)))).toEqual([
      { from: "jan-1", to: "dec-2" },
    ]);
  });

  it("covers exactly the given windows (property)", () => {
    fc.assert(
      fc.property(fc.uniqueArray(fc.integer({ min: 0, max: WINDOW_COUNT - 1 })), (indexes) => {
        const set = new Set(indexes);
        const back = new Set(runs(set).flatMap((w) => windowRange(w.from, w.to)));
        expect([...back].sort((a, b) => a - b)).toEqual([...set].sort((a, b) => a - b));
      }),
    );
  });
});

describe("excerpts", () => {
  it("keeps lines naming the item with a month or a season", () => {
    const lines = [
      "Apples | June–October |",
      "Apple pie recipes",
      "Enjoy crisp apples all autumn",
      "Pears | August–November |",
      "Pineapples arrive in May",
    ];
    expect(excerpts(lines, ["apple", "apples"])).toEqual([
      "Apples | June–October |",
      "Enjoy crisp apples all autumn",
    ]);
  });

  it("cuts long lines", () => {
    const [line] = excerpts([`Apples in June ${"x".repeat(500)}`], ["apples"]);
    expect(line?.length).toBe(400);
  });
});

const ITEMS = {
  apples: ["apple", "apples"],
  mandarins: ["mandarin", "tangerine", "clementine"],
  broccoli: ["broccoli"],
};

describe("parseItemMonths", () => {
  it("reads table rows and colon lines, matching whole labels only", () => {
    const rows = parseItemMonths(
      [
        "Fruit or Vegetable | Months in Season |",
        "Apples* | June–October |",
        "Tangerine: September through May",
        "Broccoli | End of June through end of November |",
        "Apple butter | October |",
        "Broccoli raab: March",
      ],
      ITEMS,
    );
    expect(rows.map((r) => [r.item, r.label, r.ranges?.windows])).toEqual([
      ["apples", "Apples*", [{ from: "jun-1", to: "oct-2" }]],
      ["mandarins", "Tangerine", [{ from: "sep-1", to: "may-2" }]],
      ["broccoli", "Broccoli", [{ from: "jun-2", to: "nov-2" }]],
    ]);
  });

  it("keeps a row whose months don't parse, with null ranges", () => {
    const [row] = parseItemMonths(["Apples: year-round"], ITEMS);
    expect(row?.ranges).toBeNull();
  });
});

describe("rowClaim", () => {
  const page: RegistryPage = {
    source: "test-chart",
    url: "https://example.com/chart",
    kind: "chart",
    origin: "us-pa",
    parser: "item-months",
  };

  it("rates listed windows prime as an availability claim", () => {
    const [row] = parseItemMonths(["Broccoli | End of June through end of November |"], ITEMS);
    expect(row && rowClaim(row, page, "Pennsylvania")).toEqual({
      source: "test-chart",
      origin: "us-pa",
      windows: [{ from: "jun-2", to: "nov-2", rating: "prime" }],
      specificity: "half-month",
      directness: "availability",
      paraphrase: "Pennsylvania harvest chart lists broccoli in season late Jun to Nov.",
    });
  });

  it("gives no claim for an unparsed row", () => {
    const [row] = parseItemMonths(["Apples: year-round"], ITEMS);
    expect(row && rowClaim(row, page, "Pennsylvania")).toBeNull();
  });
});

describe("describeWindows", () => {
  it.each([
    [[{ from: "apr-1", to: "may-2" }], "Apr to May"],
    [[{ from: "jul-2", to: "oct-1" }], "late Jul to mid-Oct"],
    [[{ from: "jun-1", to: "jun-2" }], "Jun"],
    [[{ from: "jun-2", to: "jun-2" }], "late Jun to Jun"],
    [
      [
        { from: "dec-1", to: "apr-2" },
        { from: "jul-1", to: "jul-2" },
      ],
      "Dec to Apr, Jul",
    ],
  ])("%j", (windows, text) => {
    expect(describeWindows(windows)).toBe(text);
  });
});

describe("claimProblems", () => {
  const claim = (from: string, to: string, specificity: "half-month" | "month" | "season" = "month") => ({
    windows: [{ from, to, rating: "prime" as const }],
    specificity,
  });

  it.each([
    [claim("jun-1", "oct-2"), "Apples | June–October |", []],
    [claim("jun-2", "nov-2", "half-month"), "Broccoli | End of June through end of November |", []],
    [claim("dec-1", "apr-2"), "Strawberry: December through April", []],
    [claim("jun-1", "sep-2"), "Apples | June–October |", ["jun-1–sep-2: the excerpt doesn't name september"]],
    [claim("dec-1", "feb-2", "season"), "Sweet all winter long", []],
    [claim("sep-1", "nov-2", "season"), "Best in autumn", []],
    [
      claim("sep-1", "nov-2", "month"),
      "Best in autumn",
      ["sep-1–nov-2: the excerpt doesn't name september", "sep-1–nov-2: the excerpt doesn't name november"],
    ],
    [
      claim("mar-1", "may-2", "season"),
      "Best in summer",
      [
        "mar-1–may-2: the excerpt doesn't name march or its season",
        "mar-1–may-2: the excerpt doesn't name may or its season",
      ],
    ],
  ])("%j against %s", (c, excerpt, problems) => {
    expect(claimProblems(c, excerpt)).toEqual(problems);
  });

  it("accepts every claim the item-months parser makes from the same line (property)", () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const qualifiers = ["", "early ", "mid-", "late ", "end of ", "2nd week in "];
    const point = fc
      .tuple(fc.constantFrom(...qualifiers), fc.constantFrom(...months))
      .map(([q, m]) => `${q}${m}`);
    fc.assert(
      fc.property(point, point, (a, b) => {
        const line = `Broccoli | ${a} through ${b} |`;
        const [row] = parseItemMonths([line], ITEMS);
        const made =
          row && rowClaim(row, { source: "s", url: "https://e.com", kind: "chart", origin: "us" }, "US");
        expect(made).toBeTruthy();
        if (made) expect(claimProblems(made, line)).toEqual([]);
      }),
    );
  });
});

describe("registrySchema", () => {
  it("defaults a page's origin to us and rejects an unknown parser", () => {
    const base = {
      items: { apples: ["apples"] },
      pages: [{ source: "a", url: "https://e.com", kind: "chart" }],
    };
    expect(registrySchema.parse(base).pages[0]?.origin).toBe("us");
    const bad = { ...base, pages: [{ ...base.pages[0], parser: "pdf-grid" }] };
    expect(registrySchema.safeParse(bad).success).toBe(false);
  });
});

describe("checkRegistry", () => {
  const ok = {
    items: { apples: ["apples"], pears: ["pears"] },
    pages: [
      { source: "chart", url: "https://e.com/c", kind: "chart", parser: "item-months" },
      { source: "page", url: "https://e.com/p", kind: "item-page", items: ["pears"] },
    ],
  };

  it("accepts a consistent registry", () => {
    expect(checkRegistry(ok, new Set(["chart", "page"])).errors).toEqual([]);
  });

  it.each([
    ["an unknown source", new Set(["chart"]), ok, "no source page"],
    [
      "a chart with items",
      new Set(["chart", "page"]),
      { ...ok, pages: [{ ...ok.pages[0], items: ["apples"] }] },
      "drop items",
    ],
    [
      "an item page without items",
      new Set(["page"]),
      { ...ok, pages: [{ ...ok.pages[1], items: undefined }] },
      "lists its items",
    ],
    [
      "an item page with a parser",
      new Set(["page"]),
      { ...ok, pages: [{ ...ok.pages[1], parser: "item-months" }] },
      "only charts",
    ],
    [
      "an unknown item",
      new Set(["page"]),
      { ...ok, pages: [{ ...ok.pages[1], items: ["kiwis"] }] },
      "item kiwis",
    ],
  ])("rejects %s", (_, ids, raw, message) => {
    const { registry, errors } = checkRegistry(raw, ids);
    expect(registry).toBeNull();
    expect(errors.join("\n")).toContain(message);
  });
});

import { describe, expect, it } from "vitest";
import { windowFromLabel } from "../src/shared/time";
import { checkRun, type LoadedRun, overlaps, panelCurves, promptVersion, type Scope } from "./panel-lib";

const scope: Scope = [
  { item: "peaches", name: "Peaches", category: "stone-fruit" },
  { item: "plums", name: "Plums", category: "stone-fruit" },
  { item: "apples", name: "Apples", category: "apples-pears", ratedBy: "variety" },
];
const states = new Set(["CA", "WA"]);
const no = [false, "high"];
const traits = { shipsWell: no, storesWell: no, peakWorthSeeking: [true, "high"], alwaysGood: no };
const peaches = {
  item: "peaches",
  traits,
  origins: [{ origin: "us-ca", windows: [["jun-1", "aug-2", "prime", "high"]] }],
  note: "Summer fruit.",
};
const file = (items: unknown[], name = "stone-fruit.yaml", category = "stone-fruit") => ({
  name,
  data: { category, items },
});
const errorsOf = (items: unknown[], f = file(items)) => checkRun([f], scope, states).errors;

describe("overlaps", () => {
  it.each([
    [
      [
        ["jan-1", "mar-2"],
        ["apr-1", "dec-2"],
      ],
      null,
    ],
    [
      [
        ["nov-1", "feb-2"],
        ["mar-1", "oct-2"],
      ],
      null,
    ],
    [
      [
        ["jan-1", "mar-2"],
        ["mar-2", "may-1"],
      ],
      "mar-2–may-1",
    ],
    [
      [
        ["nov-1", "feb-2"],
        ["jan-1", "jan-2"],
      ],
      "jan-1–jan-2",
    ],
  ] as const)("%j → %s", (windows, expected) => {
    expect(overlaps(windows)).toBe(expected);
  });
});

describe("checkRun", () => {
  it("accepts a valid item and warns about the rest of the scope", () => {
    const r = checkRun([file([peaches])], scope, states);
    expect(r.errors).toEqual([]);
    expect(r.covered).toBe(1);
    expect(r.warnings).toEqual(["missing: plums", "missing: apples"]);
  });

  it.each([
    ["an item outside the scope", [{ ...peaches, item: "quince" }], "not in the scope"],
    ["an item twice", [peaches, peaches], "appears more than once"],
    [
      "overlapping windows",
      [
        {
          ...peaches,
          origins: [
            {
              origin: "us-ca",
              windows: [
                ["jun-1", "aug-2", "prime", "high"],
                ["aug-2", "sep-1", "fair", "low"],
              ],
            },
          ],
        },
      ],
      "overlap",
    ],
    [
      "an unknown state",
      [{ ...peaches, origins: [{ origin: "us-zz", windows: [["jun-1", "aug-2", "prime", "high"]] }] }],
      "unknown state",
    ],
    ["an origin twice", [{ ...peaches, origins: [...peaches.origins, ...peaches.origins] }], "listed twice"],
    [
      "varieties on an item rated by origin",
      [{ ...peaches, varieties: peaches.origins.map((o) => ({ variety: "elberta", windows: o.windows })) }],
      "not rated by variety",
    ],
    [
      "a bad window label",
      [{ ...peaches, origins: [{ origin: "us-ca", windows: [["june", "aug-2", "prime", "high"]] }] }],
      "half-month label",
    ],
    [
      "a bad rating",
      [{ ...peaches, origins: [{ origin: "us-ca", windows: [["jun-1", "aug-2", "great", "high"]] }] }],
      "origins.0.windows.0.2",
    ],
    ["a long note", [{ ...peaches, note: "word ".repeat(26) }], "at most 25 words"],
    ["an unknown field", [{ ...peaches, verdict: "peak" }], "verdict"],
  ])("rejects %s", (_, items, message) => {
    expect(errorsOf(items).join("\n")).toContain(message);
  });

  it("rejects an item filed under another category, and a file named for another", () => {
    const r = checkRun([file([peaches], "apples-pears.yaml")], scope, states);
    expect(r.errors.join("\n")).toContain("doesn't match the file name");
    expect(
      errorsOf([{ ...peaches }], file([peaches], "apples-pears.yaml", "apples-pears")).join("\n"),
    ).toContain("belongs in stone-fruit");
  });

  it("requires varieties for an item rated by variety", () => {
    const apples = {
      ...peaches,
      item: "apples",
      origins: [{ origin: "us-wa", windows: [["sep-1", "dec-2", "prime", "high"]] }],
    };
    const f = file([apples], "apples-pears.yaml", "apples-pears");
    expect(checkRun([f], scope, states).errors.join("\n")).toContain("no varieties");
    const withVariety = {
      ...apples,
      varieties: [{ variety: "gala", windows: [["aug-2", "nov-2", "prime", "high"]] }],
    };
    expect(
      checkRun([file([withVariety], "apples-pears.yaml", "apples-pears")], scope, states).errors,
    ).toEqual([]);
  });

  it("accepts us and country origins", () => {
    const item = {
      ...peaches,
      origins: [
        { origin: "us", windows: [["jun-1", "aug-2", "prime", "high"]] },
        { origin: "cl", windows: [["dec-1", "mar-2", "poor", "high"]] },
      ],
    };
    expect(errorsOf([item])).toEqual([]);
  });

  it.each([
    [
      "a long prime stretch",
      { ...peaches, origins: [{ origin: "us-ca", windows: [["apr-1", "aug-2", "prime", "high"]] }] },
      "us-ca is prime in 10 windows",
    ],
    [
      "peakWorthSeeking with no prime",
      { ...peaches, origins: [{ origin: "us-ca", windows: [["jun-1", "aug-2", "fair", "high"]] }] },
      "peakWorthSeeking, but no window is prime",
    ],
    [
      "all fair without alwaysGood",
      {
        ...peaches,
        traits: { ...traits, peakWorthSeeking: no },
        origins: [{ origin: "us-ca", windows: [["jun-1", "aug-2", "fair", "high"]] }],
      },
      "every window fair, but not alwaysGood",
    ],
  ])("warns about %s", (_, item, message) => {
    const r = checkRun([file([item])], scope, states);
    expect(r.errors).toEqual([]);
    expect(r.warnings.join("\n")).toContain(message);
  });

  it("warns about nothing for an 8-window prime stretch", () => {
    const item = {
      ...peaches,
      origins: [{ origin: "us-ca", windows: [["may-1", "aug-2", "prime", "high"]] }],
    };
    expect(checkRun([file([item])], scope, states).warnings.filter((w) => !w.startsWith("missing"))).toEqual(
      [],
    );
  });

  it("warns when alwaysGood disagrees with the windows or with peakWorthSeeking", () => {
    const item = { ...peaches, traits: { ...traits, alwaysGood: [true, "medium"] } };
    const w = checkRun([file([item])], scope, states).warnings;
    expect(w).toContain("stone-fruit.yaml: peaches: alwaysGood, but some window isn't fair");
    expect(w).toContain("stone-fruit.yaml: peaches: alwaysGood and peakWorthSeeking both true");
  });
});

describe("promptVersion", () => {
  it("reads the version line", () => {
    expect(promptVersion("# Prompt\n\nPrompt version: 3\n\nText")).toBe(3);
    expect(promptVersion("# Prompt\n")).toBeNull();
  });
});

describe("panelCurves (P15)", () => {
  const run = (dir: string, provider: string, date: string, rating: string, version = 2): LoadedRun => ({
    dir,
    meta: { run: dir, model: dir, provider, date, promptVersion: version, webAccess: false },
    files: [
      file([{ ...peaches, origins: [{ origin: "us-ca", windows: [["jun-1", "jun-1", rating, "high"]] }] }]),
    ],
  });
  const jun = (r: ReturnType<typeof panelCurves>) => r.curves[0]?.values[windowFromLabel("jun-1")];

  it("counts each provider's latest run on the current prompt version, and combines providers", () => {
    const r = panelCurves(
      [
        run("a-old", "A", "2026-01-01", "poor"),
        run("a-new", "A", "2026-06-01", "prime"),
        run("a-v3", "A", "2026-09-01", "poor", 3),
        run("b", "B", "2026-02-01", "fair"),
      ],
      2,
      scope,
      states,
    );
    expect(r.errors).toEqual([]);
    expect(r.counted).toEqual(["a-new", "b"]);
    expect(r.curves.map((c) => [c.item, c.origin])).toEqual([["peaches", "us-ca"]]);
    expect(jun(r)).toBe(0.5); // prime against fair splits evenly: fair
  });
  it("refuses a run that fails its checks or names the wrong folder", () => {
    const bad = { ...run("x", "A", "2026-01-01", "prime"), meta: { run: "y" } };
    const wrong = { ...run("z", "B", "2026-01-01", "prime"), dir: "w" };
    const r = panelCurves([bad, wrong], 2, scope, states);
    expect(r.errors.some((e) => e.startsWith("panel x/run.yaml"))).toBe(true);
    expect(r.errors.some((e) => e.includes("doesn't match the folder"))).toBe(true);
  });
  it("checks only runs on the current prompt version against the scope", () => {
    const stale = {
      ...run("old", "A", "2026-01-01", "prime", 1),
      files: [file([{ ...peaches, item: "kumquats" }])],
    };
    const r = panelCurves([stale, run("new", "A", "2026-02-01", "fair")], 2, scope, states);
    expect(r.errors).toEqual([]);
    expect(r.counted).toEqual(["new"]);
  });
  it("keeps origins and varieties as separate targets", () => {
    const apples = {
      item: "apples",
      traits,
      origins: [{ origin: "us-wa", windows: [["jan-1", "dec-2", "fair", "high"]] }],
      varieties: [{ variety: "gala", windows: [["sep-1", "oct-2", "prime", "high"]] }],
      note: "Apples.",
    };
    const r = panelCurves(
      [
        {
          dir: "a",
          meta: {
            run: "a",
            model: "m",
            provider: "A",
            date: "2026-01-01",
            promptVersion: 2,
            webAccess: false,
          },
          files: [file([apples], "apples-pears.yaml", "apples-pears")],
        },
      ],
      2,
      scope,
      states,
    );
    expect(r.curves.map((c) => [c.origin ?? null, c.variety ?? null])).toEqual([
      [null, "gala"],
      ["us-wa", null],
    ]);
  });
});

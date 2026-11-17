import { describe, expect, it } from "vitest";
import { checkRun, overlaps, type Scope } from "./panel-lib";

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

  it("warns when alwaysGood disagrees with the windows or with peakWorthSeeking", () => {
    const item = { ...peaches, traits: { ...traits, alwaysGood: [true, "medium"] } };
    const w = checkRun([file([item])], scope, states).warnings;
    expect(w).toContain("stone-fruit.yaml: peaches: alwaysGood, but some window isn't fair");
    expect(w).toContain("stone-fruit.yaml: peaches: alwaysGood and peakWorthSeeking both true");
  });
});

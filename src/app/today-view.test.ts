import { describe, expect, it } from "vitest";
import type { AppData, AppItem } from "../shared/app-data";
import type { Reason } from "../shared/verdict";
import { avoidLine, cardOrigin, listNames, reasonText, varietyLine } from "./today-view";

// Synthetic: just enough of an item and the app data for the card lines.
const data = { stateNames: { "us-ca": "California", "us-ga": "Georgia" } } as unknown as AppData;
const fruit = {
  name: "Apples",
  varieties: ["Honeycrisp", "Gala", "Fuji", "Pink Lady", "Granny Smith"].map((name) => ({
    id: name.toLowerCase().replace(" ", "-"),
    name,
  })),
  selections: [{ id: "local", label: "local field-grown", cue: "" }],
} as unknown as AppItem;

describe("varietyLine", () => {
  const none = { varietyLine: null, reasons: [], selection: null };
  it("names a selection to look for (P16)", () =>
    expect(varietyLine(fruit, { ...none, selection: "local" }, data)).toBe("Look for local field-grown"));
  it("names the origins to look for (P20)", () =>
    expect(
      varietyLine(fruit, { ...none, reasons: [{ code: "look-for", origins: ["us-ca", "mx"] }] }, data),
    ).toBe("Look for ones from California and Mexico"));
  it("names up to four varieties, and counts the rest", () => {
    expect(varietyLine(fruit, { ...none, varietyLine: ["honeycrisp"] }, data)).toBe("Honeycrisp");
    expect(
      varietyLine(fruit, { ...none, varietyLine: ["honeycrisp", "gala", "fuji", "pink-lady"] }, data),
    ).toBe("Honeycrisp, Gala, Fuji and Pink Lady");
    expect(
      varietyLine(
        fruit,
        { ...none, varietyLine: ["honeycrisp", "gala", "fuji", "pink-lady", "granny-smith"] },
        data,
      ),
    ).toBe("Honeycrisp, Gala, Fuji and 2 more");
  });
  it("says nothing when the whole bin qualifies", () => expect(varietyLine(fruit, none, data)).toBeNull());
});

describe("avoidLine", () => {
  const poor = [{ code: "typical-origin-poor", origin: "mx" }] as const;
  it("names the poor origin when the shopper picks by the label", () =>
    expect(avoidLine(fruit, { reasons: [...poor], labelNote: true }, data)).toBe(
      "Apples from Mexico often disappoint now.",
    ));
  it("says nothing when the card doesn't ask the shopper to pick", () =>
    expect(avoidLine(fruit, { reasons: [...poor], labelNote: false }, data)).toBeNull());
});

describe("cardOrigin", () => {
  it("names the deciding origin, not the month's top origin, when a lower-ranked origin decides (P20)", () => {
    const reasons = [
      { code: "rated", rating: "fair", origin: "us-az" },
      { code: "typical-origin-poor", origin: "gt" },
    ] as const;
    expect(cardOrigin({ reasons: [...reasons], selection: null }, "gt")).toBe("us-az");
  });

  it("names no origin when the second line says which origins to look for (P20)", () => {
    const reasons: Reason[] = [
      { code: "rated", rating: "prime", origin: "us-ca" },
      { code: "look-for", origins: ["us-ca"] },
    ];
    expect(cardOrigin({ reasons, selection: null }, "us-ca")).toBeNull();
  });

  it("names no origin when a selection makes the item Peak (P16)", () => {
    const reasons = [
      { code: "selection", selection: "local-field" },
      { code: "rated", rating: "fair", origin: "mx" },
    ] as const;
    expect(cardOrigin({ reasons: [...reasons], selection: "local-field" }, "mx")).toBeNull();
  });

  it("falls back to the top typical origin for variety ratings and Limited evidence", () => {
    expect(
      cardOrigin({ reasons: [{ code: "rated", rating: "prime", variety: "kent" }], selection: null }, "mx"),
    ).toBe("mx");
    expect(cardOrigin({ reasons: [{ code: "origin-unrated", origin: "cl" }], selection: null }, "cl")).toBe(
      "cl",
    );
    expect(cardOrigin({ reasons: [{ code: "no-typical-origins" }], selection: null }, undefined)).toBeNull();
  });
});

describe("reasonText", () => {
  it("says when an out-of-season item is usually back (P18)", () => {
    const out = [{ code: "out-of-season" }] as const;
    expect(reasonText("skip", [...out], [{ kind: "improves", window: 8 }])).toBe(
      "Usually back in early May.",
    );
    expect(reasonText("skip", [...out], [])).toBe("Out of season now.");
    expect(
      reasonText(
        "skip",
        [{ code: "rated", rating: "poor", origin: "mx" }],
        [{ kind: "improves", window: 8 }],
      ),
    ).toBe("Usually improves in early May.");
  });
});

describe("listNames", () => {
  it("joins one, two or more names", () => {
    expect([listNames(["A"]), listNames(["A", "B"]), listNames(["A", "B", "C"])]).toEqual([
      "A",
      "A and B",
      "A, B and C",
    ]);
  });
});

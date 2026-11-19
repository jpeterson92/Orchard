import { describe, expect, it } from "vitest";
import { cardOrigin, listNames, reasonText } from "./today-view";

describe("cardOrigin", () => {
  it("names the deciding origin, not the month's top origin, when a second origin decides (P9)", () => {
    const reasons = [
      { code: "rated", rating: "fair", origin: "us-az" },
      { code: "typical-origin-poor", origin: "gt" },
    ] as const;
    expect(cardOrigin({ reasons: [...reasons], selection: null }, "gt")).toBe("us-az");
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

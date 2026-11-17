import { describe, expect, it } from "vitest";
import type { Verdict } from "../src/shared/verdict";
import {
  confidenceStrip,
  editorialSeries,
  ratingStrip,
  reviewFirst,
  surprises,
  unratedInStore,
  unratedTypical,
  verdictStrip,
} from "./review";

const year = (fill: Verdict, over: Record<number, Verdict> = {}): Verdict[] =>
  Array.from({ length: 24 }, (_, i) => over[i] ?? fill);
const proposals = (
  rating: "prime" | "fair" | "poor" | null,
  over: Record<number, "prime" | "fair" | "poor"> = {},
) =>
  Array.from({ length: 24 }, (_, i) => {
    const r = over[i] ?? rating;
    return r === null ? null : { rating: r };
  });

describe("verdictStrip", () => {
  it("marks each half-month, grouped by month", () => {
    expect(verdictStrip(year("good", { 0: "peak", 3: "skip", 23: "limited" }))).toBe(
      "PG GS GG GG GG GG GG GG GG GG GG G·",
    );
  });
});

describe("surprises", () => {
  it("finds nothing when verdicts follow the evidence", () => {
    expect(
      surprises({
        outlook: year("good", { 10: "peak", 11: "peak" }),
        deciderProposal: proposals("fair", { 10: "prime", 11: "prime" }),
        peakWorthSeeking: true,
      }),
    ).toEqual([]);
  });

  it.each([
    [
      "Peak without prime evidence",
      {
        outlook: year("good", { 10: "peak", 11: "peak" }),
        deciderProposal: proposals("fair", { 10: "prime" }),
        peakWorthSeeking: true,
      },
      "Peak where the deciding origin's evidence isn't prime: jun-2",
    ],
    [
      "Peak with no evidence at all",
      { outlook: year("good", { 0: "peak" }), deciderProposal: proposals(null), peakWorthSeeking: true },
      "Peak where the deciding origin's evidence isn't prime: jan-1",
    ],
    [
      "Skip on prime evidence",
      {
        outlook: year("good", { 5: "skip" }),
        deciderProposal: proposals("fair", { 5: "prime" }),
        peakWorthSeeking: false,
      },
      "Skip where the deciding origin's evidence is prime: mar-2",
    ],
    [
      "a Peak lasting most of the year",
      {
        outlook: year("peak", {
          0: "good",
          1: "good",
          2: "good",
          3: "good",
          4: "good",
          5: "good",
          6: "good",
        }),
        deciderProposal: proposals("prime"),
        peakWorthSeeking: true,
      },
      "Peak in 17 of 24 windows: is the Peak worth seeking, or is it a steady Good?",
    ],
    [
      "a Peak worth seeking that never comes",
      { outlook: year("good"), deciderProposal: proposals("fair"), peakWorthSeeking: true },
      "Peak worth seeking, but never Peak in the typical year",
    ],
  ])("flags %s", (_, inputs, message) => {
    expect(surprises(inputs)).toContain(message);
  });

  it("a 16-window Peak isn't flagged as long", () => {
    const outlook = year("peak", {
      0: "good",
      1: "good",
      2: "good",
      3: "good",
      4: "good",
      5: "good",
      6: "good",
      7: "good",
    });
    expect(surprises({ outlook, deciderProposal: proposals("prime"), peakWorthSeeking: true })).toEqual([]);
  });
});

describe("series strips", () => {
  it("marks ratings, curve values and gaps", () => {
    const w: (number | null)[] = Array(24).fill(null);
    w[0] = 1;
    w[1] = 0.5;
    w[2] = 0.2;
    w[3] = 0.8;
    expect(ratingStrip(w)).toBe("+~ -+ .. .. .. .. .. .. .. .. .. ..");
  });

  it("marks confidence", () => {
    const p = Array.from({ length: 24 }, (_, i) =>
      i === 0 ? { confidence: "high" as const } : i === 1 ? { confidence: "low" as const } : null,
    );
    expect(confidenceStrip(p)).toBe("HL .. .. .. .. .. .. .. .. .. .. ..");
  });
});

describe("editorialSeries", () => {
  it("spreads windows, wrapping past December, with their reasons", () => {
    const e = editorialSeries([
      { from: "dec-2", to: "jan-1", rating: "prime", reason: "Growers agree" },
      { from: "jan-2", to: "jan-2", rating: "fair" },
    ]);
    expect(e.ratings[23]).toBe("prime");
    expect(e.ratings[0]).toBe("prime");
    expect(e.ratings[1]).toBe("fair");
    expect(e.ratings[2]).toBeNull();
    expect(e.reasons[0]).toBe("Growers agree");
    expect(e.reasons[1]).toBeNull();
  });
});

describe("reviewFirst", () => {
  const proposal = (rating: "prime" | "fair" | "poor", confidence: "high" | "medium" | "low") => ({
    rating,
    confidence,
  });

  it("lists departing and Low-confidence windows, joining runs", () => {
    const editorial = editorialSeries([
      { from: "jan-1", to: "feb-1", rating: "prime" },
      { from: "jun-1", to: "jun-1", rating: "fair", reason: "Late frost" },
    ]);
    const p = Array.from({ length: 24 }, (_, i) =>
      i < 2 ? proposal("prime", "high") : i === 2 ? proposal("fair", "medium") : proposal("fair", "low"),
    );
    expect(reviewFirst(editorial, p)).toEqual([
      "feb-1 departs: rated prime, evidence fair, medium confidence; no reason given",
      "jun-1 low: rated fair, evidence fair, low confidence; reason: Late frost",
    ]);
  });

  it("flags a rated window without evidence, and ignores unrated ones", () => {
    const editorial = editorialSeries([{ from: "dec-1", to: "dec-2", rating: "poor" }]);
    expect(reviewFirst(editorial, Array(24).fill(null))).toEqual([
      "dec-1..dec-2 departs: rated poor, no evidence; no reason given",
    ]);
  });

  it("finds nothing when ratings follow confident evidence", () => {
    const editorial = editorialSeries([{ from: "jan-1", to: "dec-2", rating: "fair" }]);
    expect(reviewFirst(editorial, Array(24).fill(proposal("fair", "medium")))).toEqual([]);
  });
});

describe("unratedInStore", () => {
  it("counts only in-store windows without a rating", () => {
    const windows = Array.from({ length: 24 }, (_, i) => (i < 4 ? ("prime" as const) : null));
    const inStore = Array.from({ length: 12 }, (_, m) => m < 3);
    expect(unratedInStore(windows, inStore)).toBe(2);
  });
});

describe("unratedTypical", () => {
  it("counts windows where any typical origin lacks a rating", () => {
    const ca = Array.from({ length: 24 }, (_, i) => (i >= 6 && i < 18 ? ("prime" as const) : null));
    const mx = Array.from({ length: 24 }, () => "fair" as const);
    const typical = Array.from({ length: 12 }, (_, m) => (m < 6 ? ["mx", "us-ca"] : ["us-ca"]));
    // Jan–Mar: us-ca unrated (6); Apr–Sep rated; Oct–Dec: us-ca unrated (6).
    expect(unratedTypical(typical, { "us-ca": { windows: ca }, mx: { windows: mx } })).toBe(12);
  });
});

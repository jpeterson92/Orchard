import { describe, expect, it } from "vitest";
import type { Verdict } from "../src/shared/verdict";
import { surprises, verdictStrip } from "./review";

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

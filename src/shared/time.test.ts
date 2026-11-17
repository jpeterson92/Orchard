import { describe, expect, it } from "vitest";
import { windowIndex } from "./time";

describe("windowIndex", () => {
  it.each([
    [1, 1, 0],
    [1, 15, 0],
    [1, 16, 1],
    [11, 16, 21], // product spec: Nov 16 is "late November"
    [12, 15, 22],
    [12, 31, 23],
  ])("month %i day %i -> window %i", (month, day, expected) => {
    expect(windowIndex(month, day)).toBe(expected);
  });

  it("rejects impossible inputs instead of guessing", () => {
    expect(() => windowIndex(13, 1)).toThrow(RangeError);
    expect(() => windowIndex(1, 0)).toThrow(RangeError);
  });
});

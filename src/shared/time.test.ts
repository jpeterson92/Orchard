import { describe, expect, it } from "vitest";
import { windowFromLabel, windowIndex, windowLabel, windowRange } from "./time";

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

describe("windowFromLabel and windowRange", () => {
  it.each([
    ["jan-1", 0],
    ["jan-2", 1],
    ["nov-2", 21],
    ["dec-2", 23],
  ])("%s -> window %i", (label, expected) => {
    expect(windowFromLabel(label)).toBe(expected);
  });

  it("rejects malformed labels", () => {
    for (const bad of ["jan-3", "Jan-1", "january-1", "jan1", ""]) {
      expect(() => windowFromLabel(bad)).toThrow(RangeError);
    }
  });

  it("covers a range inclusively and wraps past December", () => {
    expect(windowRange("jun-1", "jul-2")).toEqual([10, 11, 12, 13]);
    expect(windowRange("nov-2", "jan-2")).toEqual([21, 22, 23, 0, 1]);
    expect(windowRange("mar-1", "mar-1")).toEqual([4]);
    expect(windowRange("jan-1", "dec-2")).toHaveLength(24);
  });

  it("every label round-trips to a distinct window", () => {
    const labels = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ].flatMap((m) => [`${m}-1`, `${m}-2`]);
    expect(labels.map(windowFromLabel)).toEqual(Array.from({ length: 24 }, (_, i) => i));
    expect(labels.map((_, i) => windowLabel(i))).toEqual(labels);
  });

  it("windowLabel rejects an index outside 0–23", () => {
    for (const bad of [-1, 24, 1.5]) expect(() => windowLabel(bad)).toThrow(RangeError);
  });
});

describe("windowRange invariants, exhaustively over all 576 label pairs", () => {
  const labels = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].flatMap(
    (m) => [`${m}-1`, `${m}-2`],
  );
  it("starts at from, ends at to, steps by one window, never repeats", () => {
    for (const from of labels) {
      for (const to of labels) {
        const r = windowRange(from, to);
        expect(r[0]).toBe(windowFromLabel(from));
        expect(r.at(-1)).toBe(windowFromLabel(to));
        expect(new Set(r).size).toBe(r.length);
        expect(r.length).toBeGreaterThanOrEqual(1);
        expect(r.length).toBeLessThanOrEqual(24);
        r.slice(1).forEach((w, i) => {
          expect(w).toBe(((r[i] as number) + 1) % 24);
        });
      }
    }
  });
});

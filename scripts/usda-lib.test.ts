import { describe, expect, test } from "vitest";
import {
  dedupe,
  isoDate,
  monthRange,
  originsCovering,
  parseRow,
  splitAcrossMonths,
  supplyIndex,
} from "./usda-lib";

const raw = (over: Record<string, unknown> = {}) => ({
  report_begin_date: "11/13/2026",
  report_end_date: "11/15/2026",
  commodity: "Apples",
  district: "WASHINGTON",
  origin: "Washington",
  trans_Mode: "Truck",
  "import/Export": "D (domestic)",
  "1 lb units": 300,
  ...over,
});

describe("parseRow", () => {
  test("labels domestic origins with US and keeps import countries", () => {
    expect(parseRow(raw())?.origin).toBe("US: Washington");
    expect(parseRow(raw({ "import/Export": "I (import)", origin: "Canada" }))?.origin).toBe("Canada");
  });
  test("rejects rows without a volume or with an unknown flow", () => {
    expect(parseRow(raw({ "1 lb units": null }))).toBeNull();
    expect(parseRow(raw({ "import/Export": "?" }))).toBeNull();
  });
  test("converts dates", () => {
    expect(isoDate("01/03/1998")).toBe("1998-01-03");
    expect(() => isoDate("2026-01-01")).toThrow(RangeError);
  });
  test("weekly totals cover the 7 days ending on asw_date", () => {
    const r = parseRow(
      raw({ asw_Flag: "Week Ending", asw_date: "11/15/2026", report_begin_date: "11/15/2026" }),
    );
    expect([r?.begin, r?.end]).toEqual(["2026-11-09", "2026-11-15"]);
  });
  test("late corrections land on their shipment date, subtractions stay negative", () => {
    const add = parseRow(raw({ asw_Flag: "Add", asw_date: "11/02/2026" }));
    expect([add?.begin, add?.end]).toEqual(["2026-11-02", "2026-11-02"]);
    expect(parseRow(raw({ asw_Flag: "Subtract", asw_date: "11/02/2026", "1 lb units": -50 }))?.lb).toBe(-50);
  });
});

test("dedupe drops only rows identical apart from publication fields", () => {
  const a = parseRow(raw({ slug_id: 1, published_date: "x" }));
  const again = parseRow(raw({ slug_id: 2, published_date: "y" }));
  const late = parseRow(raw({ asw_Flag: "Add", asw_date: "11/02/2026" }));
  if (!a || !again || !late) throw new Error("fixture");
  const out = dedupe([a, again, late]);
  expect(out.rows).toEqual([a, late]);
  expect(out.duplicates).toBe(1);
});

test("splitAcrossMonths divides by day count across a month boundary", () => {
  const m = splitAcrossMonths("2026-10-30", "2026-11-01", 300);
  expect(m.get("2026-10")).toBeCloseTo(200);
  expect(m.get("2026-11")).toBeCloseTo(100);
  expect(() => splitAcrossMonths("2026-11-02", "2026-11-01", 1)).toThrow(RangeError);
});

test("originsCovering returns the smallest ranked prefix reaching the threshold", () => {
  const v = new Map([
    ["Mexico", 50],
    ["US: California", 30],
    ["Peru", 20],
  ]);
  expect(originsCovering(v)).toEqual(["Mexico", "US: California"]);
  expect(originsCovering(v, 0.5)).toEqual(["Mexico"]);
  expect(originsCovering(new Map())).toEqual([]);
});

describe("supplyIndex", () => {
  const months = monthRange("2024-01", "2025-12");
  test("is each calendar month's average over the whole-period monthly average", () => {
    const monthly = new Map(months.map((m) => [m, m.endsWith("-01") ? 230 : 0]));
    const idx = supplyIndex(monthly, months);
    expect(idx[0]).toBeCloseTo(12);
    expect(idx[1]).toBe(0);
  });
  test("a missing month makes the index null, never 0", () => {
    const monthly = new Map(months.slice(1).map((m) => [m, 10]));
    expect(supplyIndex(monthly, months).every((v) => v === null)).toBe(true);
  });
});

test("monthRange spans years inclusively", () => {
  expect(monthRange("2023-11", "2024-02")).toEqual(["2023-11", "2023-12", "2024-01", "2024-02"]);
});

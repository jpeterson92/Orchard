import { describe, expect, test } from "vitest";
import {
  calendarMeans,
  dedupe,
  isoDate,
  lumpSums,
  type MovementRow,
  monthRange,
  originCode,
  originsCovering,
  ownSeasonIndex,
  parseRow,
  splitAcrossMonths,
  supplyIndex,
  typicalOrigins,
  varietyPresence,
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

test("varietyPresence counts each variety once per market-day and shares it by month", () => {
  const q = (market: string, date: string, variety: string, origin = "Washington") => ({
    market,
    date,
    variety,
    origin,
  });
  const p = varietyPresence([
    q("NY", "2025-01-02", "Fuji"),
    q("NY", "2025-01-02", "Fuji", "New York"), // second origin, same market-day
    q("NY", "2025-01-02", "Gala"),
    q("BOS", "2025-01-02", "Gala"),
    q("NY", "2025-02-03", "Fuji"),
  ]);
  expect(p.get("Fuji")?.months[0]).toBeCloseTo(0.5); // 1 of 2 January market-days
  expect(p.get("Gala")?.months[0]).toBe(1);
  expect(p.get("Fuji")?.months[1]).toBe(1);
  expect(p.get("Fuji")?.marketDays).toBe(2);
  expect(p.get("Fuji")?.origins.get("New York")).toBe(1);
});

describe("calendarMeans", () => {
  test("averages each calendar month over the years, absent months counting as 0", () => {
    const months = monthRange("2024-01", "2025-12");
    const m = calendarMeans(
      new Map([
        ["2024-03", 10],
        ["2025-03", 30],
        ["2024-07", 8],
      ]),
      months,
    );
    expect([m[2], m[6], m[0]]).toEqual([20, 4, 0]);
  });
});

describe("ownSeasonIndex (P11)", () => {
  test("divides by the mean of the months the origin ships, leaving the rest null", () => {
    const means = [0, 0, 10, 30, 20, 0, 0, 0, 0, 0, 0, 0];
    expect(ownSeasonIndex(means)).toEqual([
      null,
      null,
      0.5,
      1.5,
      1,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
  });
  test("an origin that never ships has no index", () =>
    expect(ownSeasonIndex(Array(12).fill(0)).every((v) => v === null)).toBe(true));
});

describe("typicalOrigins", () => {
  const vol = new Map([
    ["A", 50],
    ["B", 30],
    ["C", 15],
    ["D", 5],
  ]);
  test("ranks to the threshold and marks origins at the major share", () =>
    expect(typicalOrigins(vol, 0.7, 0.25)).toEqual([
      { origin: "A", major: true },
      { origin: "B", major: true },
    ]));
  test("a minor origin can be typical", () =>
    expect(typicalOrigins(vol, 0.9, 0.25).at(-1)).toEqual({ origin: "C", major: false }));
  test("unnameable regions count toward the total but are passed over", () => {
    const withRegion = new Map([
      ["R", 60],
      ["A", 30],
      ["B", 10],
    ]);
    expect(typicalOrigins(withRegion, 0.7, 0.25, (o) => o !== "R")).toEqual([
      { origin: "A", major: true },
      { origin: "B", major: false },
    ]);
  });
  test("no volume, no origins", () => expect(typicalOrigins(new Map([["A", 0]]), 0.7, 0.25)).toEqual([]));
});

describe("originCode", () => {
  const states = new Map([
    ["Washington", "WA"],
    ["California", "CA"],
  ]);
  test("folds sub-state regions into their state and maps countries", () => {
    expect(originCode("US: Washington", states, {})).toBe("us-wa");
    expect(originCode("US: California-Imperial Val", states, {})).toBe("us-ca");
    expect(originCode("Mexico", states, { Mexico: "mx" })).toBe("mx");
  });
  test("multi-state regions have no code; unknown names throw", () => {
    expect(originCode("US: New England", states, {})).toBeNull();
    expect(() => originCode("US: Atlantis", states, {})).toThrow(RangeError);
    expect(() => originCode("Japan", states, {})).toThrow(RangeError);
  });
});

describe("lumpSums", () => {
  const row = (origin: string, lb: number, i: number): MovementRow => ({
    commodity: "Test",
    origin,
    flow: "domestic",
    begin: "2026-01-01",
    end: "2026-01-07",
    lb,
    key: `${origin}${i}`,
  });
  test("flags a row over half an average month that dwarfs its origin's other rows", () => {
    const rows = [row("A", 100, 1), ...Array.from({ length: 30 }, (_, i) => row("A", 10, i + 2))];
    expect([...lumpSums(rows, 12)].map((r) => r.lb)).toEqual([100]);
  });
  test("keeps a short season's big but similar peak weeks", () => {
    const rows = [row("A", 40, 1), row("A", 30, 2), row("A", 25, 3), row("B", 1, 4)];
    expect(lumpSums(rows, 12).size).toBe(0);
  });
});

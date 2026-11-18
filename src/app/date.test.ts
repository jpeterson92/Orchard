import { describe, expect, it } from "vitest";
import { appDate, parseIsoDate, sharedLink } from "./date";
import { atDate } from "./today-view";

describe("appDate", () => {
  it.each([
    [null, { iso: "2026-11-17", planning: false, mode: "today" }],
    ["2026-12-20", { iso: "2026-12-20", planning: true, mode: "typical" }],
    ["2026-11-17", { iso: "2026-11-17", planning: false, mode: "today" }], // the plan's day has come
    ["2026-11-10", { iso: "2026-11-17", planning: false, mode: "today" }], // past: back on today
  ])("plan %s", (plan, want) =>
    expect(appDate("2026-11-17", plan)).toEqual({ ...want, today: "2026-11-17", pinned: false }),
  );

  it.each([
    ["2026-12-20", "2026-12-20", true], // opened from a link shared for Dec 20
    ["2026-12-20", null, false], // chosen on the chip
    ["2026-12-21", "2026-12-20", false], // the date was changed after opening the link
    ["2026-11-10", "2026-11-10", false], // a shared date that has passed: today, unpinned
  ])("plan %s, link %s: pinned %s", (plan, link, pinned) =>
    expect(appDate("2026-11-17", plan, link).pinned).toBe(pinned),
  );
});

describe("parseIsoDate", () => {
  it.each([
    ["2026-12-20", "2026-12-20"],
    ["2028-02-29", "2028-02-29"],
    ["2027-02-29", null],
    ["2026-13-01", null],
    ["2026-12-2", null],
    ["Dec 20", null],
    ["", null],
    [null, null],
  ])("%s", (value, want) => expect(parseIsoDate(value)).toBe(want));
});

describe("sharedLink", () => {
  it("pins the date on the same page", () =>
    expect(sharedLink("https://orchard.example", "/items/apples", "2026-12-20")).toBe(
      "https://orchard.example/items/apples?date=2026-12-20",
    ));
});

describe("atDate", () => {
  it("says then for a planning date, only as a whole word", () => {
    expect(atDate("Not at its best now.", "typical")).toBe("Not at its best then.");
    expect(atDate("Not at its best now.", "today")).toBe("Not at its best now.");
    expect(atDate("Known for snow.", "typical")).toBe("Known for snow.");
  });
});

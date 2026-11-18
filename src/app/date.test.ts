import { describe, expect, it } from "vitest";
import { appDate } from "./date";
import { atDate } from "./today-view";

describe("appDate", () => {
  it.each([
    [null, { iso: "2026-11-17", planning: false, mode: "today" }],
    ["2026-12-20", { iso: "2026-12-20", planning: true, mode: "typical" }],
    ["2026-11-17", { iso: "2026-11-17", planning: false, mode: "today" }], // the plan's day has come
    ["2026-11-10", { iso: "2026-11-17", planning: false, mode: "today" }], // past: back on today
  ])("plan %s", (plan, want) =>
    expect(appDate("2026-11-17", plan)).toEqual({ ...want, today: "2026-11-17" }),
  );
});

describe("atDate", () => {
  it("says then for a planning date, only as a whole word", () => {
    expect(atDate("Not at its best now.", "typical")).toBe("Not at its best then.");
    expect(atDate("Not at its best now.", "today")).toBe("Not at its best now.");
    expect(atDate("Known for snow.", "typical")).toBe("Known for snow.");
  });
});

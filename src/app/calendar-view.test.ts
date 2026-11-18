import { describe, expect, it } from "vitest";
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import type { Verdict } from "../shared/verdict";
import { type CalendarRow, calendarRows, monthSections } from "./calendar-view";

const data = appJson as unknown as AppData;

const row = (name: string, early: Verdict, late: Verdict): CalendarRow => ({
  id: name.toLowerCase(),
  name,
  category: "c",
  alwaysGood: false,
  // Month 5 (June) is windows 10 and 11; every other window is Limited evidence.
  outlook: Array.from({ length: 24 }, (_, w) => (w === 10 ? early : w === 11 ? late : "limited")),
  draft: false,
  synthetic: false,
});

describe("monthSections", () => {
  it.each<[Verdict, Verdict, Verdict]>([
    ["peak", "peak", "peak"],
    ["good", "peak", "peak"],
    ["peak", "skip", "peak"],
    ["skip", "good", "good"],
    ["limited", "good", "good"],
    ["skip", "limited", "skip"],
    ["limited", "skip", "skip"],
    ["limited", "limited", "limited"],
  ])("early %s, late %s: listed under %s", (early, late, section) => {
    const [only] = monthSections([row("A", early, late)], 5);
    expect(only?.verdict).toBe(section);
  });

  it("orders sections Peak, Good, Skip, Limited evidence, leaves out empty ones, and sorts names A to Z", () => {
    const sections = monthSections(
      [row("Zucchini", "limited", "limited"), row("Pears", "good", "good"), row("Apples", "good", "skip")],
      5,
    );
    expect(sections.map((s) => [s.verdict, s.rows.map((r) => r.name)])).toEqual([
      ["good", ["Apples", "Pears"]],
      ["limited", ["Zucchini"]],
    ]);
  });

  it("lists every bundled item exactly once in every month", () => {
    const rows = calendarRows(data, 2026);
    for (let m = 0; m < 12; m++) {
      const ids = monthSections(rows, m).flatMap((s) => s.rows.map((r) => r.id));
      expect(ids.sort()).toEqual(rows.map((r) => r.id).sort());
    }
  });
});

describe("calendarRows", () => {
  it("gives every item 24 windows, in category order then A to Z", () => {
    const rows = calendarRows(data, 2026);
    const order = data.categories.map((c) => c.id);
    expect(rows.every((r) => r.outlook.length === 24)).toBe(true);
    for (let i = 1; i < rows.length; i++) {
      const [a, b] = [rows[i - 1], rows[i]];
      if (!a || !b) continue;
      const d = order.indexOf(a.category) - order.indexOf(b.category);
      expect(d < 0 || (d === 0 && a.name.localeCompare(b.name, "en") <= 0)).toBe(true);
    }
  });
});

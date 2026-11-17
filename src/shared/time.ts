// Half-month windows (product spec §7 "Time"): 1st–15th and 16th–end of each month.
// Window 0 = early January … window 23 = late December. The only implementation in the repo.

export const WINDOW_COUNT = 24;

/** Window index 0–23 for a calendar date given as year-month-day parts (month 1–12). */
export function windowIndex(month: number, day: number): number {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError(`month ${month}`);
  if (!Number.isInteger(day) || day < 1 || day > 31) throw new RangeError(`day ${day}`);
  return (month - 1) * 2 + (day > 15 ? 1 : 0);
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const;

/** Editorial window labels: "jan-1" is Jan 1–15, "jan-2" is Jan 16–end. */
export const WINDOW_LABEL = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)-(1|2)$/;

export function windowFromLabel(label: string): number {
  const m = WINDOW_LABEL.exec(label);
  if (m === null) throw new RangeError(`window label ${label}`);
  return MONTHS.indexOf(m[1] as (typeof MONTHS)[number]) * 2 + (m[2] === "2" ? 1 : 0);
}

/** Window indexes from `from` to `to` inclusive; wraps past December (e.g. nov-2 to feb-1). */
export function windowRange(from: string, to: string): number[] {
  const start = windowFromLabel(from);
  const length = ((windowFromLabel(to) - start + WINDOW_COUNT) % WINDOW_COUNT) + 1;
  return Array.from({ length }, (_, i) => (start + i) % WINDOW_COUNT);
}

// Half-month windows (product spec §7 "Time"): 1st–15th and 16th–end of each month.
// Window 0 = early January … window 23 = late December. The only implementation in the repo.

export const WINDOW_COUNT = 24;

/** Window index 0–23 for a calendar date given as year-month-day parts (month 1–12). */
export function windowIndex(month: number, day: number): number {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError(`month ${month}`);
  if (!Number.isInteger(day) || day < 1 || day > 31) throw new RangeError(`day ${day}`);
  return (month - 1) * 2 + (day > 15 ? 1 : 0);
}

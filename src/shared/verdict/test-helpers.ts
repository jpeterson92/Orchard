// Synthetic engine inputs for tests. Nothing here is real produce data.
import type { Rules } from "../data/schema";
import { WINDOW_COUNT, windowFromLabel } from "../time";
import type { Confidence, Env, ItemInputs, PlainDate, RatedSeries, RatedVariety, Rating } from "./index";

export const RULES: Rules = {
  version: 1,
  typicalOriginShare: 0.7,
  decidingOriginShare: 0.25,
  peakShare: 0.5,
  ratedTypicalShare: 0.75,
  supplyIndex: { thin: 0.8, strong: 1.2 },
  varietyInStoreShare: 0.1,
  peakCountries: ["us", "mx", "ca"],
  reliableYearRoundWindows: 20,
  snapshotMaxAgeMonths: 15,
  lastCallWindows: 2,
};
export const ENV: Env = { rules: RULES, snapshotTo: "2026-06" };

/** A rating in every window, overridden by label: `rated("fair", { "nov-2": "prime" })`. */
export function rated(
  base: Rating | null,
  overrides: Record<string, Rating | null> = {},
  evidence?: Record<string, Confidence>,
): RatedSeries {
  const windows: (Rating | null)[] = Array(WINDOW_COUNT).fill(base);
  for (const [label, r] of Object.entries(overrides)) windows[windowFromLabel(label)] = r;
  if (evidence === undefined) return { windows };
  const conf: (Confidence | null)[] = Array(WINDOW_COUNT).fill(null);
  for (const [label, c] of Object.entries(evidence)) conf[windowFromLabel(label)] = c;
  return { windows, evidence: conf };
}

export const allMonths = <T>(v: T): T[] => Array(12).fill(v);

export function variety(id: string, series: RatedSeries, inStore: boolean[] = allMonths(true)): RatedVariety {
  return { id, ...series, inStore };
}

/** One US origin rated prime all year, normal supply. */
export function item(overrides: Partial<ItemInputs> = {}): ItemInputs {
  const typicalOrigins = overrides.typicalOrigins ?? allMonths(["us-ca"]);
  return {
    id: "test-item",
    evidenceBasis: "supply+assessment",
    alwaysGood: false,
    peakWorthSeeking: true,
    origins: { "us-ca": rated("prime") },
    varieties: [],
    selections: [],
    typicalOrigins,
    // Unless a test sets them: the typical origins split 80% of the month's volume evenly.
    typicalShares: typicalOrigins.map((os) => os.map(() => 0.8 / os.length)),
    minorOrigins: allMonths([]),
    supply: { "us-ca": allMonths(1) },
    ...overrides,
  };
}

/** Late November 2026 (window 21). */
export const NOV_17: PlainDate = { year: 2026, month: 11, day: 17 };

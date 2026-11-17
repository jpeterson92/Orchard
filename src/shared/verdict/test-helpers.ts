// Synthetic engine inputs for tests. Nothing here is real produce data.
import type { Rules } from "../data/schema";
import { WINDOW_COUNT, windowFromLabel } from "../time";
import type {
  Confidence,
  EngineAdvisory,
  Env,
  ItemInputs,
  PlainDate,
  RatedSeries,
  RatedVariety,
  Rating,
} from "./index";

export const RULES: Rules = {
  version: 1,
  typicalOriginShare: 0.7,
  supplyIndex: { thin: 0.8, strong: 1.2 },
  reliableYearRoundWindows: 20,
  snapshotMaxAgeMonths: 15,
  lastCallWindows: 2,
  labelNoteLevelGap: 1,
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

/** One US origin rated prime all year, normal supply, no advisories. */
export function item(overrides: Partial<ItemInputs> = {}): ItemInputs {
  return {
    id: "test-item",
    evidenceBasis: "supply+assessment",
    alwaysGood: false,
    peakWorthSeeking: true,
    origins: { "us-ca": rated("prime") },
    varieties: [],
    typicalOrigins: allMonths(["us-ca"]),
    supply: allMonths(1),
    advisories: [],
    ...overrides,
  };
}

export function advisory(overrides: Partial<EngineAdvisory> = {}): EngineAdvisory {
  return {
    id: "adv",
    from: "2026-11-10",
    to: "2026-11-30",
    effect: "skip",
    reviewedOn: "2026-11-16",
    ...overrides,
  };
}

/** Late November 2026 (window 21). */
export const NOV_17: PlainDate = { year: 2026, month: 11, day: 17 };

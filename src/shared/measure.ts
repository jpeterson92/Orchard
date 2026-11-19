// Real-user measurement (product spec §2 "Time to first verdict", §10 "Speed"). The Worker keeps only daily counts per
// metric and value bucket, so the 75th percentile is computable while nothing stored describes a single visit.
import { z } from "zod";

/** Largest content paint, response to input, layout shift, and time to the first verdict on screen. */
export const METRICS = ["lcp", "inp", "cls", "verdict"] as const;
export type Metric = (typeof METRICS)[number];

/** The "good" line for each metric at the 75th percentile, in the units `bucketOf` stores (ms; CLS in hundredths). */
export const TARGETS: Record<Metric, number> = { lcp: 2500, inp: 200, cls: 10, verdict: 2500 };

/** Times past this are clamped into the last bucket; CLS past 1.00 likewise. */
const MS_CAP = 60_000;
const CLS_CAP = 100;

/**
 * The bucket a value counts in, named by its upper edge: milliseconds in 100 ms steps to 10 s, then 1 s steps to 60 s;
 * CLS in steps of 0.01 (stored as hundredths) to 1.00. Every target is an edge, so "p75 ≤ target" reads exactly.
 */
export function bucketOf(metric: Metric, value: number): number {
  if (metric === "cls") return Math.min(CLS_CAP, Math.ceil(Math.round(value * 1e6) / 1e4));
  const ms = Math.ceil(value);
  if (ms <= 10_000) return Math.ceil(ms / 100) * 100;
  return Math.min(MS_CAP, Math.ceil(ms / 1000) * 1000);
}

/**
 * Diagnostic events (product spec §2), counted per UTC day with nothing else attached: an item page opened, a variety
 * page opened, a Today card expanded, a search closed with no match, the phone's first visit of its local day, and that visit coming 1 to
 * 14 days after the previous one (the phone keeps only its last visit date and never sends it).
 */
export const EVENTS = ["item", "variety", "expand", "nomatch", "visit", "return14"] as const;
export type Event = (typeof EVENTS)[number];

/** Most of one event a single beacon may carry; the phone sends at most this many and drops the rest. */
export const EVENT_CAP = 1000;

/**
 * One beacon: a page load's final value for each metric it measured, each at most once, and the events since the
 * last beacon, each at most once with its count. Either list may be left out, not both.
 */
export const beaconSchema = z
  .strictObject({
    m: z
      .array(
        z.strictObject({
          metric: z.enum(METRICS),
          // A page stays open for hours at most; CLS is a unitless score that rarely passes 1.
          value: z
            .number()
            .min(0)
            .max(24 * 3600 * 1000),
        }),
      )
      .min(1)
      .max(METRICS.length)
      .optional(),
    e: z
      .array(z.strictObject({ event: z.enum(EVENTS), n: z.int().min(1).max(EVENT_CAP) }))
      .min(1)
      .max(EVENTS.length)
      .optional(),
  })
  .refine((b) => b.m !== undefined || b.e !== undefined, "metrics or events")
  .refine((b) => new Set(b.m?.map((e) => e.metric)).size === (b.m?.length ?? 0), "each metric at most once")
  .refine((b) => new Set(b.e?.map((e) => e.event)).size === (b.e?.length ?? 0), "each event at most once");
export type Beacon = z.infer<typeof beaconSchema>;

/**
 * The nearest-rank percentile of counted buckets: the upper edge of the bucket holding the ⌈p·n⌉-th smallest value,
 * or null with no counts. Equals `bucketOf` of the raw values' own nearest-rank percentile.
 */
export function percentile(rows: readonly { bucket: number; n: number }[], p: number): number | null {
  const total = rows.reduce((sum, r) => sum + r.n, 0);
  if (total === 0) return null;
  const rank = Math.max(1, Math.ceil(p * total));
  let seen = 0;
  for (const r of [...rows].sort((a, b) => a.bucket - b.bucket)) {
    seen += r.n;
    if (seen >= rank) return r.bucket;
  }
  return null;
}

/** Whole days from one ISO date to a later one; null when either isn't a date. */
function daysBetween(from: string, to: string): number | null {
  const at = (iso: string) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? Date.parse(`${iso}T00:00:00Z`) : Number.NaN);
  const days = (at(to) - at(from)) / 86_400_000;
  return Number.isNaN(days) ? null : days;
}

/**
 * The events a page load counts for the visit itself, from the phone's last visit date (null on a first visit) and
 * today's local date: nothing on a later load the same day; otherwise a visit, and a 14-day return when the last
 * visit was 1 to 14 days earlier. A last date in the future (the clock moved back) or unreadable counts a visit only.
 */
export function visitEvents(last: string | null, today: string): Event[] {
  if (last === today) return [];
  const days = last === null ? null : daysBetween(last, today);
  return days !== null && days >= 1 && days <= 14 ? ["visit", "return14"] : ["visit"];
}

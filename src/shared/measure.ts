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

/** One beacon: a page load's final value for each metric it measured, each at most once. */
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
      .max(METRICS.length),
  })
  .refine((b) => new Set(b.m.map((e) => e.metric)).size === b.m.length, "each metric at most once");
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

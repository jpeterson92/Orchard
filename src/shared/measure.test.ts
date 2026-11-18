import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { beaconSchema, bucketOf, METRICS, type Metric, percentile, TARGETS } from "./measure";

describe("bucketOf", () => {
  it.each<[Metric, number, number]>([
    ["lcp", 0, 0],
    ["lcp", 0.4, 100],
    ["lcp", 100, 100],
    ["lcp", 100.01, 200],
    ["lcp", 2500, 2500],
    ["lcp", 2500.5, 2600],
    ["lcp", 10_000, 10_000],
    ["lcp", 10_001, 11_000],
    ["lcp", 59_999, 60_000],
    ["lcp", 60_000, 60_000],
    ["lcp", 3_600_000, 60_000],
    ["inp", 200, 200],
    ["inp", 201, 300],
    ["verdict", 1210.7, 1300],
    ["cls", 0, 0],
    ["cls", 0.001, 1],
    ["cls", 0.1, 10],
    // Float noise from summed shifts stays in its bucket.
    ["cls", 0.1 + 0.2, 30],
    ["cls", 0.100002, 11],
    ["cls", 1, 100],
    ["cls", 4.2, 100],
  ])("%s %d counts in bucket %d", (metric, value, bucket) => {
    expect(bucketOf(metric, value)).toBe(bucket);
  });

  it("puts every target on a bucket edge", () => {
    for (const m of METRICS)
      expect(bucketOf(m, m === "cls" ? TARGETS[m] / 100 : TARGETS[m])).toBe(TARGETS[m]);
  });

  const metric = fc.constantFrom(...METRICS);
  const value = (m: Metric) =>
    m === "cls" ? fc.double({ min: 0, max: 1, noNaN: true }) : fc.integer({ min: 0, max: 60_000 });

  it("names a bucket by its upper edge, within one step of the value", () => {
    fc.assert(
      fc.property(
        metric.chain((m) => fc.tuple(fc.constant(m), value(m))),
        ([m, v]) => {
          const b = bucketOf(m, v);
          const units = m === "cls" ? v * 100 : v;
          const step = m === "cls" ? 1 : v <= 10_000 ? 100 : 1000;
          expect(b).toBeGreaterThanOrEqual(units - 1e-4);
          expect(b - units).toBeLessThan(step);
        },
      ),
    );
  });

  it("never lowers a bucket for a larger value", () => {
    fc.assert(
      fc.property(
        metric,
        fc.double({ min: 0, max: 1e7, noNaN: true }),
        fc.double({ min: 0, max: 1e7, noNaN: true }),
        (m, a, b) => {
          const [lo, hi] = a <= b ? [a, b] : [b, a];
          expect(bucketOf(m, lo)).toBeLessThanOrEqual(bucketOf(m, hi));
        },
      ),
    );
  });
});

describe("percentile", () => {
  it("is null with nothing counted", () => {
    expect(percentile([], 0.75)).toBeNull();
    expect(percentile([{ bucket: 100, n: 0 }], 0.75)).toBeNull();
  });

  it.each([
    // 4 loads: the 3rd smallest is the 75th percentile.
    [
      [
        { bucket: 1000, n: 1 },
        { bucket: 2000, n: 2 },
        { bucket: 3000, n: 1 },
      ],
      2000,
    ],
    // 5 loads: ⌈3.75⌉ = 4th smallest.
    [
      [
        { bucket: 1000, n: 3 },
        { bucket: 3000, n: 2 },
      ],
      3000,
    ],
    // Order of rows doesn't matter.
    [
      [
        { bucket: 3000, n: 1 },
        { bucket: 1000, n: 3 },
      ],
      1000,
    ],
    [[{ bucket: 2500, n: 1 }], 2500],
  ])("reads the nearest-rank 75th percentile from %j", (rows, p75) => {
    expect(percentile(rows, 0.75)).toBe(p75);
  });

  it("equals the bucket of the raw values' own nearest-rank percentile", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 60_000 }), { minLength: 1, maxLength: 200 }),
        fc.double({ min: 0.01, max: 1, noNaN: true }),
        (values, p) => {
          const counts = new Map<number, number>();
          for (const v of values) counts.set(bucketOf("lcp", v), (counts.get(bucketOf("lcp", v)) ?? 0) + 1);
          const rows = [...counts].map(([bucket, n]) => ({ bucket, n }));
          const sorted = [...values].sort((a, b) => a - b);
          const raw = sorted[Math.max(1, Math.ceil(p * values.length)) - 1] as number;
          expect(percentile(rows, p)).toBe(bucketOf("lcp", raw));
        },
      ),
    );
  });
});

describe("beaconSchema", () => {
  it("takes one page load's metrics, each once", () => {
    expect(
      beaconSchema.safeParse({
        m: METRICS.map((metric) => ({ metric, value: 1 })),
      }).success,
    ).toBe(true);
    expect(beaconSchema.safeParse({ m: [{ metric: "cls", value: 0 }] }).success).toBe(true);
  });

  it.each([
    ["nothing", {}],
    ["an empty list", { m: [] }],
    [
      "a repeated metric",
      {
        m: [
          { metric: "inp", value: 1 },
          { metric: "inp", value: 2 },
        ],
      },
    ],
    ["infinity", { m: [{ metric: "lcp", value: Number.POSITIVE_INFINITY }] }],
    ["NaN", { m: [{ metric: "lcp", value: Number.NaN }] }],
    ["a page", { m: [{ metric: "lcp", value: 1 }], page: "/" }],
  ])("refuses %s", (_, body) => {
    expect(beaconSchema.safeParse(body).success).toBe(false);
  });
});

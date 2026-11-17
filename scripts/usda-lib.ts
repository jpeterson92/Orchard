// Pure helpers for USDA Market News movement data. Used by the M1 probe and, later, usda-derive.

export type Flow = "domestic" | "import" | "export";

export interface MovementRow {
  commodity: string;
  /** "US: <State>" for domestic shipments, otherwise the country of origin. */
  origin: string;
  flow: Flow;
  /** ISO dates (YYYY-MM-DD), inclusive. */
  begin: string;
  end: string;
  lb: number;
  /** Identity of the observation, used to drop rows repeated across reports. */
  key: string;
}

const FLOWS: Record<string, Flow> = {
  "D (domestic)": "domestic",
  "I (import)": "import",
  "Exp (export)": "export",
};

/** "11/13/2026" → "2026-11-13". */
export function isoDate(usda: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(usda);
  if (!m) throw new RangeError(`Unexpected USDA date: ${usda}`);
  return `${m[3]}-${m[1]}-${m[2]}`;
}

/** Fields that describe the publication rather than the shipment; a row repeated in two publications is one shipment. */
const PUBLICATION_FIELDS = new Set([
  "slug_id",
  "slug_name",
  "report_title",
  "published_date",
  "report_date",
  "market_type",
]);

function addDays(iso: string, days: number): string {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Returns null for rows without a volume or with an unknown flow; the caller counts them.
 * Shipment dates follow the `asw_Flag` column:
 * - "Week Ending" variants are weekly totals (the only form some districts report): the 7 days ending on `asw_date`.
 * - "Add" / "Subtract" are late corrections (negative volume for subtract) for the single day `asw_date`.
 * - Otherwise the report's own begin..end range.
 */
export function parseRow(raw: Record<string, unknown>): MovementRow | null {
  const flow = FLOWS[String(raw["import/Export"])];
  const lb = raw["1 lb units"];
  if (!flow || typeof lb !== "number" || !Number.isFinite(lb)) return null;
  const origin = flow === "import" ? String(raw.origin) : `US: ${String(raw.origin)}`;
  const flag = typeof raw.asw_Flag === "string" ? raw.asw_Flag : "";
  const aswDate = typeof raw.asw_date === "string" ? isoDate(raw.asw_date) : null;
  let begin = isoDate(String(raw.report_begin_date));
  let end = isoDate(String(raw.report_end_date));
  if (flag.includes("Week Ending")) {
    end = aswDate ?? end;
    begin = addDays(end, -6);
  } else if (aswDate && (flag === "Add" || flag === "Subtract")) {
    begin = aswDate;
    end = aswDate;
  }
  const key = JSON.stringify(Object.entries(raw).filter(([k]) => !PUBLICATION_FIELDS.has(k)));
  return { commodity: String(raw.commodity), origin, flow, begin, end, lb, key };
}

/** Drops rows identical apart from publication fields (the same shipment published twice). */
export function dedupe(rows: MovementRow[]): { rows: MovementRow[]; duplicates: number } {
  const seen = new Set<string>();
  const kept = rows.filter((r) => !seen.has(r.key) && seen.add(r.key));
  return { rows: kept, duplicates: rows.length - kept.length };
}

/** Splits a volume reported for begin..end (inclusive) across calendar months by day count. Keys are "YYYY-MM". */
export function splitAcrossMonths(begin: string, end: string, lb: number): Map<string, number> {
  const start = Date.parse(`${begin}T00:00:00Z`);
  const stop = Date.parse(`${end}T00:00:00Z`);
  if (!(stop >= start)) throw new RangeError(`Inverted range ${begin}..${end}`);
  const days = (stop - start) / 86_400_000 + 1;
  const out = new Map<string, number>();
  for (let t = start; t <= stop; t += 86_400_000) {
    const month = new Date(t).toISOString().slice(0, 7);
    out.set(month, (out.get(month) ?? 0) + lb / days);
  }
  return out;
}

/** The smallest ranked prefix of origins whose combined volume reaches `threshold` of the total. */
export function originsCovering(volumes: Map<string, number>, threshold = 0.7): string[] {
  const total = [...volumes.values()].reduce((a, b) => a + b, 0);
  if (total <= 0) return [];
  const ranked = [...volumes].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const out: string[] = [];
  let sum = 0;
  for (const [origin, lb] of ranked) {
    out.push(origin);
    sum += lb;
    if (sum >= threshold * total) break;
  }
  return out;
}

/**
 * P11: the typical supply index for a calendar month is that month's average over the period ÷ the average
 * month over the whole period. `monthly` maps "YYYY-MM" to volume; `months` lists every month in the period.
 * A month absent from `monthly` is missing data and makes its calendar month null, never 0.
 */
export function supplyIndex(monthly: Map<string, number>, months: string[]): (number | null)[] {
  // The baseline needs every month in the period; one gap makes the whole index null.
  const all = months.map((m) => monthly.get(m));
  const present = all.filter((v): v is number => v !== undefined);
  const baseline =
    present.length === months.length ? present.reduce((a, b) => a + b, 0) / months.length : null;
  const out: (number | null)[] = [];
  for (let cal = 1; cal <= 12; cal++) {
    const vals = months.filter((m) => Number(m.slice(5)) === cal).map((m) => monthly.get(m));
    if (baseline === null || baseline === 0 || vals.length === 0 || vals.some((v) => v === undefined)) {
      out.push(null);
    } else {
      out.push((vals as number[]).reduce((a, b) => a + b, 0) / vals.length / baseline);
    }
  }
  return out;
}

/** Every "YYYY-MM" from `first` to `last`, inclusive. */
export function monthRange(first: string, last: string): string[] {
  const out: string[] = [];
  let [y, m] = first.split("-").map(Number) as [number, number];
  const [ly, lm] = last.split("-").map(Number) as [number, number];
  while (y < ly || (y === ly && m <= lm)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

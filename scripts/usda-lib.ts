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

export interface Quote {
  market: string;
  /** ISO date of the price report. */
  date: string;
  variety: string;
  origin: string;
}

export interface VarietyPresence {
  /** Per calendar month (index 0 = Jan): share of market-days quoting the item that quote this variety. */
  months: number[];
  /** Market-days on which the variety was quoted, by origin. */
  origins: Map<string, number>;
  marketDays: number;
}

/**
 * Terminal-market evidence of when a variety is on offer. A market-day is one city's report on one date; each
 * variety counts at most once per market-day, however many sizes, grades or origins were quoted.
 */
export function varietyPresence(quotes: Quote[]): Map<string, VarietyPresence> {
  const dayKey = (q: Quote) => `${q.market}|${q.date}`;
  const itemDays: number[] = new Array(12).fill(0);
  const seenDay = new Set<string>();
  const seenVariety = new Set<string>();
  const seenOrigin = new Set<string>();
  const out = new Map<string, VarietyPresence>();
  for (const q of quotes) {
    const month = Number(q.date.slice(5, 7)) - 1;
    if (!seenDay.has(dayKey(q))) {
      seenDay.add(dayKey(q));
      itemDays[month] = (itemDays[month] ?? 0) + 1;
    }
    const v = out.get(q.variety) ?? { months: new Array(12).fill(0), origins: new Map(), marketDays: 0 };
    out.set(q.variety, v);
    const vk = `${dayKey(q)}|${q.variety}`;
    if (!seenVariety.has(vk)) {
      seenVariety.add(vk);
      v.months[month] = (v.months[month] ?? 0) + 1;
      v.marketDays++;
    }
    const ok = `${vk}|${q.origin}`;
    if (!seenOrigin.has(ok)) {
      seenOrigin.add(ok);
      v.origins.set(q.origin, (v.origins.get(q.origin) ?? 0) + 1);
    }
  }
  for (const v of out.values()) v.months = v.months.map((n, i) => (itemDays[i] ? n / (itemDays[i] ?? 1) : 0));
  return out;
}

/** Per calendar month (index 0 = Jan): the mean of that month's volume over the period's years. */
export function calendarMeans(monthly: ReadonlyMap<string, number>, months: readonly string[]): number[] {
  return Array.from({ length: 12 }, (_, i) => {
    const ms = months.filter((m) => Number(m.slice(5)) === i + 1);
    return ms.length === 0 ? 0 : ms.reduce((a, m) => a + (monthly.get(m) ?? 0), 0) / ms.length;
  });
}

/**
 * P11, per origin against its own season: each calendar month's mean volume ÷ the origin's mean over the calendar
 * months in which it ships. A month without volume has no index (null), never 0.
 */
export function ownSeasonIndex(means: readonly number[]): (number | null)[] {
  const shipping = means.filter((v) => v > 0);
  if (shipping.length === 0) return means.map(() => null);
  const baseline = shipping.reduce((a, b) => a + b, 0) / shipping.length;
  return means.map((v) => (v > 0 ? v / baseline : null));
}

export interface TypicalOrigin {
  origin: string;
  /** Has at least `majorShare` of the month's volume (P9: only such an origin can take over from the top one). */
  major: boolean;
  /** Its share of the month's reported volume, unnameable regions included (P1). */
  share: number;
}

/**
 * Typical origins of one pooled month: the ranked prefix reaching `threshold` of the volume. Origins that `nameable`
 * rejects (multi-state regions) still count toward the total but are never named, so they're passed over.
 */
export function typicalOrigins(
  volumes: ReadonlyMap<string, number>,
  threshold: number,
  majorShare: number,
  nameable: (origin: string) => boolean = () => true,
): TypicalOrigin[] {
  const total = [...volumes.values()].reduce((a, b) => a + b, 0);
  if (total <= 0) return [];
  const ranked = [...volumes]
    .filter(([o]) => nameable(o))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const out: TypicalOrigin[] = [];
  let sum = 0;
  for (const [origin, lb] of ranked) {
    if (sum >= threshold * total || lb <= 0) break;
    out.push({ origin, major: lb >= majorShare * total, share: lb / total });
    sum += lb;
  }
  return out;
}

/** Domestic multi-state regions in movement reports, which name no single state. */
export const US_REGIONS = new Set(["Appalachia", "N Carolina-S Carolina", "New England", "United States"]);

/**
 * "US: Washington" → "us-wa"; "US: California-Central" → "us-ca" (sub-state regions fold into their state);
 * an import country → its ISO code. Null for a multi-state region. Throws on a name it can't map.
 */
export function originCode(
  origin: string,
  states: ReadonlyMap<string, string>,
  countries: Readonly<Record<string, string>>,
): string | null {
  if (origin.startsWith("US: ")) {
    const name = origin.slice(4);
    if (US_REGIONS.has(name)) return null;
    const state = states.get(name) ?? states.get(name.replace(/-.*$/, ""));
    if (!state) throw new RangeError(`Unknown US origin: ${origin}`);
    return `us-${state.toLowerCase()}`;
  }
  const code = countries[origin];
  if (!code) throw new RangeError(`No country code for ${origin}`);
  return code;
}

/**
 * Lump-sum entries: rows bigger than half the item's average month that also dwarf (over 2×) every other row from
 * the same origin. A short, intensely seasonal crop's real peak weeks are big too, but close to each other.
 */
export function lumpSums(rows: readonly MovementRow[], monthCount: number): Set<MovementRow> {
  const avgMonth = rows.reduce((a, r) => a + r.lb, 0) / monthCount;
  const byOrigin = new Map<string, number[]>();
  for (const r of rows) byOrigin.set(r.origin, [...(byOrigin.get(r.origin) ?? []), r.lb]);
  const lumps = new Set<MovementRow>();
  for (const r of rows) {
    if (!(r.lb > avgMonth / 2)) continue;
    const others = [...(byOrigin.get(r.origin) ?? [])].sort((a, b) => b - a);
    others.splice(others.indexOf(r.lb), 1);
    if (r.lb > 2 * (others[0] ?? 0)) lumps.add(r);
  }
  return lumps;
}

/** A terminal-market variety as a CSV-safe id: "PINK LADY/CRIPPS PINK" → "pink-lady-cripps-pink". */
export const varietySlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Terminal-market origins that name no single state or country. */
export const UNNAMED_QUOTE_ORIGINS = new Set([
  "",
  "N/A",
  "None",
  "United States",
  "N Carolina-S Carolina",
  "Arizona-California",
]);

/**
 * A terminal-market origin ("Washington", "Chile") as an origin id: a state name first ("California-South" folds
 * into California), then a country. Null for an origin naming no single place; throws on a name it can't map.
 */
export function quoteOriginCode(
  origin: string,
  states: ReadonlyMap<string, string>,
  countries: Readonly<Record<string, string>>,
): string | null {
  if (UNNAMED_QUOTE_ORIGINS.has(origin)) return null;
  const state = states.get(origin) ?? states.get(origin.replace(/-(North|Central|South)$/, ""));
  if (state) return `us-${state.toLowerCase()}`;
  const code = countries[origin];
  if (!code) throw new RangeError(`No origin code for ${origin}`);
  return code;
}

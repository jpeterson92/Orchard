// M1 USDA probe: can typical origins (≥ 70%) and a supply index be computed from Market News movement data?
// Usage: npm run usda:probe   (needs USDA_MARS_API_KEY in .env.pipeline; raw responses cached in .cache/usda/)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import {
  dedupe,
  type MovementRow,
  monthRange,
  originsCovering,
  parseRow,
  splitAcrossMonths,
  supplyIndex,
} from "./usda-lib";

const FIRST = "2023-11";
const LAST = "2026-10"; // 36 full months
const MONTHS = monthRange(FIRST, LAST);

// Every truck/air/boat movement report plus national rail, including offices discontinued in Dec 2024
// (their history falls inside the 36 months). WA_FV170 (3283) carries all imports; office reports carry
// domestic shipments and exports.
const REPORTS = [
  2717, 2718, 2762, 2768, 2774, 2780, 2793, 2799, 2899, 2925, 3031, 3105, 3114, 3119, 3123, 3125, 3127, 3165,
  3170, 3181, 3282, 3283, 3332, 3520,
];

const ITEMS: Record<string, string[]> = {
  apples: ["Apples"],
  pears: ["Pears"],
  mandarins: ["Tangerines", "Clementines", "Royal Mandarin", "Mandarins", "Satsumas"],
  strawberries: ["Strawberries"],
  broccoli: ["Broccoli"],
};

const CACHE = ".cache/usda";
const API = "https://marsapi.ams.usda.gov/services/v1.2/reports";

process.loadEnvFile(".env.pipeline");
const key = process.env.USDA_MARS_API_KEY;
if (!key) throw new Error("USDA_MARS_API_KEY missing from .env.pipeline");
const auth = `Basic ${Buffer.from(`${key}:`).toString("base64")}`;

const usdaDate = (iso: string) => `${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso.slice(0, 4)}`;

async function fetchRows(report: number, commodity: string): Promise<Record<string, unknown>[]> {
  const file = `${CACHE}/${report}-${commodity.replace(/\W+/g, "_")}-${FIRST}-${LAST}.json`;
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
  const range = `${usdaDate(`${FIRST}-01`)}:${usdaDate(`${LAST}-31`)}`;
  const url = `${API}/${report}/Report%20Details?q=commodity=${encodeURIComponent(commodity)};report_begin_date=${range}`;
  const res = await fetch(url, { headers: { Authorization: auth }, signal: AbortSignal.timeout(120_000) });
  if (!res.ok) throw new Error(`${report} ${commodity}: HTTP ${res.status}`);
  const body = (await res.json()) as {
    results?: Record<string, unknown>[];
    stats?: { totalRows: number; returnedRows: number };
  };
  if (body.stats && body.stats.returnedRows < body.stats.totalRows)
    throw new Error(`${report} ${commodity}: truncated`);
  const rows = body.results ?? [];
  writeFileSync(file, JSON.stringify(rows));
  return rows;
}

async function pool<T, R>(items: T[], size: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i] as T);
      }
    }),
  );
  return out;
}

const fmt = (lb: number) => (lb >= 1e6 ? `${(lb / 1e6).toFixed(1)}M` : `${Math.round(lb / 1e3)}k`);
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

mkdirSync(CACHE, { recursive: true });
const lines: string[] = [`Period ${FIRST} to ${LAST} (${MONTHS.length} months). Exports excluded.`, ""];

for (const [item, names] of Object.entries(ITEMS)) {
  const jobs = names.flatMap((c) => REPORTS.map((r) => ({ r, c })));
  const raw = (await pool(jobs, 6, ({ r, c }) => fetchRows(r, c))).flat();
  const parsed = raw.map(parseRow);
  const skipped = parsed.filter((p) => p === null).length;
  const { rows, duplicates } = dedupe(parsed.filter((p): p is MovementRow => p !== null));
  const supply = rows.filter((r) => r.flow !== "export");

  // volume by "YYYY-MM" → origin
  const byMonth = new Map<string, Map<string, number>>();
  for (const r of supply) {
    for (const [m, lb] of splitAcrossMonths(r.begin, r.end, r.lb)) {
      if (!MONTHS.includes(m)) continue;
      const o = byMonth.get(m) ?? new Map<string, number>();
      o.set(r.origin, (o.get(r.origin) ?? 0) + lb);
      byMonth.set(m, o);
    }
  }
  // The national imports report publishes every business day, so a month with no rows is a real zero.
  const monthly = new Map(
    MONTHS.map((m) => [m, [...(byMonth.get(m)?.values() ?? [])].reduce((a, b) => a + b, 0)]),
  );
  const index = supplyIndex(monthly, MONTHS);
  const total = [...monthly.values()].reduce((a, b) => a + b, 0);
  const domestic = supply.filter((r) => r.flow === "domestic").reduce((a, r) => a + r.lb, 0);
  const found = [...new Set(supply.map((r) => r.commodity))].join(", ");

  lines.push(`### ${item}`, "");
  lines.push(
    `Commodities found: ${found || "none"}. Rows: ${rows.length} (skipped without volume: ${skipped}; exact repeats dropped: ${duplicates}). Supply over 3 years: ${fmt(total)} lb, ${Math.round((100 * domestic) / (total || 1))}% domestic.`,
    "",
  );
  // Season years (Nov–Oct) by flow, to expose reporting gaps such as the Dec 2024 office closures.
  const seasons = new Map<string, Record<string, number>>();
  for (const r of supply) {
    const y = Number(r.begin.slice(0, 4)) + (Number(r.begin.slice(5, 7)) >= 11 ? 1 : 0);
    const s = seasons.get(`${y - 1}–${String(y).slice(2)}`) ?? {};
    s[r.flow] = (s[r.flow] ?? 0) + r.lb;
    seasons.set(`${y - 1}–${String(y).slice(2)}`, s);
  }
  lines.push(
    `By season (Nov–Oct): ${[...seasons]
      .sort()
      .map(([y, s]) => `${y} domestic ${fmt(s.domestic ?? 0)}, imports ${fmt(s.import ?? 0)}`)
      .join("; ")}.`,
    "",
  );
  lines.push(
    "| Month | Avg lb/month | Supply index | Origins to 70% | Top origins (share) | Top origin each year |",
  );
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (let cal = 1; cal <= 12; cal++) {
    const ms = MONTHS.filter((m) => Number(m.slice(5)) === cal);
    const pooled = new Map<string, number>();
    for (const m of ms) for (const [o, lb] of byMonth.get(m) ?? []) pooled.set(o, (pooled.get(o) ?? 0) + lb);
    const sum = [...pooled.values()].reduce((a, b) => a + b, 0);
    const cover = originsCovering(pooled);
    const tops = cover.map((o) => `${o} ${Math.round((100 * (pooled.get(o) ?? 0)) / sum)}%`).join(", ");
    const perYear = ms.map((m) => originsCovering(byMonth.get(m) ?? new Map(), 0)[0] ?? "–").join(" / ");
    const idx = index[cal - 1];
    lines.push(
      `| ${MONTH_NAMES[cal - 1]} | ${fmt(sum / ms.length)} | ${idx === null || idx === undefined ? "null" : idx.toFixed(2)} | ${cover.length} | ${tops} | ${perYear} |`,
    );
  }
  lines.push("");
  console.error(`${item}: ${rows.length} rows`);
}

writeFileSync(`${CACHE}/probe-tables.md`, lines.join("\n"));
console.log(lines.join("\n"));

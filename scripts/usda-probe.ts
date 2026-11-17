// USDA movement probe: for each launch candidate, can typical origins (≥ 70%) and the P11 supply index be
// computed, and is domestic supply reported throughout the period?
// Usage: npm run usda:probe [-- item ...]
// Writes .cache/usda/coverage.md (one row per item) and .cache/usda/probe-tables.md (month tables).
import { writeFileSync } from "node:fs";
import { CACHE, fetchDetails, pool } from "./usda-client";
import { CANDIDATES, FROM, REPORTS, TO } from "./usda-commodities";
import {
  dedupe,
  type MovementRow,
  monthRange,
  originsCovering,
  parseRow,
  splitAcrossMonths,
  supplyIndex,
} from "./usda-lib";

const MONTHS = monthRange(FROM.slice(0, 7), TO.slice(0, 7));

const fmt = (lb: number) => (lb >= 1e6 ? `${(lb / 1e6).toFixed(1)}M` : `${Math.round(lb / 1e3)}k`);
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const seasonOf = (isoDate: string) => {
  const y = Number(isoDate.slice(0, 4)) + (Number(isoDate.slice(5, 7)) >= 11 ? 1 : 0);
  return `${y - 1}–${String(y).slice(2)}`;
};
const SEASONS = [...new Set(MONTHS.map((m) => seasonOf(`${m}-01`)))];

const only = process.argv.slice(2);
const items = Object.entries(CANDIDATES).filter(([id]) => only.length === 0 || only.includes(id));
const detail: string[] = [`Period ${FROM} to ${TO}. Exports excluded.`, ""];
const coverage: string[] = [
  `Period ${FROM} to ${TO} (${MONTHS.length} months). Exports excluded. Seasons run Nov–Oct.`,
  "",
  "| Item | Supply/season | Domestic | Domestic by season | Origins to 70% | Top origin same all 3 years | Thin months (index < 0.8) | Lump rows | Flags |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
];

for (const [item, names] of items) {
  const jobs = names.flatMap((c) => REPORTS.map((r) => ({ r, c })));
  const raw = (await pool(jobs, 6, ({ r, c }) => fetchDetails(r, c, FROM, TO))).flat();
  const parsed = raw.map(parseRow).filter((p): p is MovementRow => p !== null);
  const { rows } = dedupe(parsed);
  const supply = rows.filter((r) => r.flow !== "export");

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
  const avgMonth = total / MONTHS.length;
  const inRange = supply.filter((r) => r.begin >= FROM && r.end <= TO);
  const domestic = inRange.filter((r) => r.flow === "domestic").reduce((a, r) => a + r.lb, 0);
  const domBySeason = SEASONS.map((s) =>
    inRange.filter((r) => r.flow === "domestic" && seasonOf(r.begin) === s).reduce((a, r) => a + r.lb, 0),
  );
  // A single row bigger than half an average month is a lump-sum entry, not a day's shipments.
  const lumps = supply.filter((r) => avgMonth > 0 && r.lb > avgMonth / 2).length;

  const perCal = MONTH_NAMES.map((_, i) => {
    const ms = MONTHS.filter((m) => Number(m.slice(5)) === i + 1);
    const pooled = new Map<string, number>();
    for (const m of ms) for (const [o, lb] of byMonth.get(m) ?? []) pooled.set(o, (pooled.get(o) ?? 0) + lb);
    const sum = [...pooled.values()].reduce((a, b) => a + b, 0);
    const tops = ms.map((m) => originsCovering(byMonth.get(m) ?? new Map(), 0)[0]);
    return {
      ms,
      pooled,
      sum,
      cover: originsCovering(pooled),
      stable: tops[0] !== undefined && tops.every((t) => t === tops[0]),
    };
  });
  const active = perCal.filter((c) => c.sum > 0);
  const counts = active.map((c) => c.cover.length);
  const thin = MONTH_NAMES.filter((_, i) => (index[i] ?? 1) < 0.8);

  const flags: string[] = [];
  if (total === 0) flags.push("no data");
  const maxDom = Math.max(...domBySeason);
  if (maxDom > 0.05 * (total / SEASONS.length) && domBySeason.some((d) => d < 0.25 * maxDom))
    flags.push("domestic reporting gap");
  if (total > 0 && domestic === 0) flags.push("no domestic reported");
  if (lumps > 0) flags.push("lump-sum rows");

  coverage.push(
    `| ${item} | ${fmt(total / SEASONS.length)} | ${total ? Math.round((100 * domestic) / total) : 0}% | ${domBySeason.map(fmt).join(" / ")} | ${counts.length ? `${Math.min(...counts)}–${Math.max(...counts)}` : "–"} | ${active.filter((c) => c.stable).length}/${active.length} | ${thin.join(" ") || "none"} | ${lumps} | ${flags.join("; ")} |`,
  );

  detail.push(
    `### ${item}`,
    "",
    `Commodities found: ${[...new Set(supply.map((r) => r.commodity))].join(", ") || "none"}.`,
    "",
  );
  detail.push(
    "| Month | Avg lb/month | Supply index | Top origins to 70% (share) |",
    "| --- | --- | --- | --- |",
  );
  perCal.forEach((c, i) => {
    const tops = c.cover.map((o) => `${o} ${Math.round((100 * (c.pooled.get(o) ?? 0)) / c.sum)}%`).join(", ");
    const idx = index[i];
    detail.push(
      `| ${MONTH_NAMES[i]} | ${fmt(c.sum / c.ms.length)} | ${idx == null ? "null" : idx.toFixed(2)} | ${tops} |`,
    );
  });
  detail.push("");
  console.error(`${item}: ${rows.length} rows`);
}

writeFileSync(`${CACHE}/coverage.md`, coverage.join("\n"));
writeFileSync(`${CACHE}/probe-tables.md`, detail.join("\n"));
console.log(coverage.join("\n"));

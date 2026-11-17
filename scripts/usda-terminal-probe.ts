// A variety calendar from USDA terminal market price reports. For each variety, the share of
// city market-days quoting the item that quoted that variety, by month, over 3 years; plus its main origins.
// Usage: npm run usda:terminal-probe [-- item ...]   Writes .cache/usda/variety-calendar.md.
import { writeFileSync } from "node:fs";
import { CACHE, fetchDetails, pool } from "./usda-client";
import { FROM, MARKETS, TO } from "./usda-commodities";
import { isoDate, type Quote, varietyPresence } from "./usda-lib";

// The three M7 variety guides.
const ITEMS: Record<string, string[]> = {
  apples: ["Apples"],
  pears: ["Pears"],
  "mandarins-oranges": ["Tangerines", "Clementines", "Mandarins", "Satsumas", "Oranges"],
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const only = process.argv.slice(2);
const out: string[] = [
  `Period ${FROM} to ${TO}. ${Object.keys(MARKETS).length} city terminal markets. Cell = % of market-days quoting the item that quoted the variety. Presence, not volume.`,
  "",
];

for (const [item, names] of Object.entries(ITEMS).filter(([id]) => only.length === 0 || only.includes(id))) {
  const jobs = names.flatMap((c) => Object.keys(MARKETS).map((m) => ({ m: Number(m), c })));
  const results = await pool(jobs, 6, async ({ m, c }) => ({
    m,
    c,
    rows: await fetchDetails(m, c, FROM, TO),
  }));
  const quotes: Quote[] = [];
  for (const { m, c, rows } of results) {
    for (const r of rows) {
      const variety = typeof r.variety === "string" && r.variety !== "N/A" ? r.variety : "(unspecified)";
      quotes.push({
        market: MARKETS[m] ?? String(m),
        date: isoDate(String(r.report_begin_date)),
        // Within a combined item, keep the commodity so "Oranges / NAVEL" and "Tangerines / ..." stay apart.
        variety: names.length > 1 ? `${c} / ${variety}` : variety,
        origin: String(r.origin ?? "?"),
      });
    }
  }
  const presence = [...varietyPresence(quotes)].sort((a, b) => b[1].marketDays - a[1].marketDays);
  const markets = new Set(quotes.map((q) => q.market));
  out.push(`### ${item}`, "", `${quotes.length} quotes from ${markets.size} markets.`, "");
  out.push(`| Variety | Market-days | ${MONTHS.join(" | ")} | Main origins |`);
  out.push(`| --- | --- | ${MONTHS.map(() => "---").join(" | ")} | --- |`);
  for (const [variety, p] of presence.slice(0, 20)) {
    const origins = [...p.origins]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([o]) => o)
      .join(", ");
    out.push(
      `| ${variety} | ${p.marketDays} | ${p.months.map((s) => Math.round(100 * s)).join(" | ")} | ${origins} |`,
    );
  }
  out.push("");
  console.error(`${item}: ${quotes.length} quotes`);
}

writeFileSync(`${CACHE}/variety-calendar.md`, out.join("\n"));
console.log(out.join("\n"));

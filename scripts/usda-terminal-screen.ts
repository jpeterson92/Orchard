// Launch-scope screen (D10): which produce commodities do US city terminal markets quote, in how many cities and
// seasons? One sample week per season from each city's fruit, vegetable, and onion-and-potato price reports.
// Usage: npm run usda:terminal-screen   Writes .cache/usda/terminal-screen.md.
import { writeFileSync } from "node:fs";
import { CACHE, fetchDetails, pool } from "./usda-client";

// City → [fruit, vegetables, onions and potatoes] report IDs (the 11 current US terminal markets).
const CITIES: Record<string, number[]> = {
  Atlanta: [2277, 2278, 2279],
  Baltimore: [2281, 2282, 2283],
  Boston: [2285, 2286, 2287],
  Chicago: [2290, 2291, 2292],
  Columbia: [2294, 2295, 2296],
  Detroit: [2302, 2303, 2304],
  "Los Angeles": [2306, 2307, 2308],
  Miami: [2310, 2311, 2312],
  "New York": [2314, 2315, 2316],
  Philadelphia: [2318, 2319, 2320],
  Asheville: [3913, 3914, 3915],
};

// One business week per season.
const WEEKS: [string, string, string][] = [
  ["Jan", "2026-01-12", "2026-01-16"],
  ["Apr", "2026-04-13", "2026-04-17"],
  ["Jul", "2026-07-13", "2026-07-17"],
  ["Oct", "2025-10-13", "2025-10-17"],
];

const jobs = Object.entries(CITIES).flatMap(([city, reports]) =>
  reports.flatMap((r) => WEEKS.map(([season, from, to]) => ({ city, r, season, from, to }))),
);
const results = await pool(jobs, 6, async (j) => ({
  ...j,
  rows: await fetchDetails(j.r, null, j.from, j.to),
}));

const seen = new Map<
  string,
  { cities: Set<string>; seasons: Set<string>; quotes: number; category: string }
>();
for (const { city, season, rows } of results) {
  for (const row of rows) {
    const name = String(row.commodity);
    const s = seen.get(name) ?? {
      cities: new Set(),
      seasons: new Set(),
      quotes: 0,
      category: String(row.category ?? ""),
    };
    s.cities.add(city);
    s.seasons.add(season);
    s.quotes++;
    seen.set(name, s);
  }
}

const cityCount = Object.keys(CITIES).length;
const lines = [
  `Sample weeks: ${WEEKS.map(([s, f]) => `${s} (${f})`).join(", ")}. ${cityCount} cities.`,
  "",
  "| Commodity | Category | Cities | Seasons | Quotes |",
  "| --- | --- | --- | --- | --- |",
];
for (const [name, s] of [...seen].sort(
  (a, b) => b[1].cities.size - a[1].cities.size || b[1].quotes - a[1].quotes,
)) {
  lines.push(`| ${name} | ${s.category} | ${s.cities.size} | ${[...s.seasons].join(" ")} | ${s.quotes} |`);
}
writeFileSync(`${CACHE}/terminal-screen.md`, lines.join("\n"));
console.log(lines.join("\n"));

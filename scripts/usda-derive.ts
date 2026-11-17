// usda:derive: writes data/usda/typical-origins.csv and data/usda/supply-index.csv for the launch items whose supply
// USDA movement reports cover (docs/data/usda.md, Coverage by item). Reads the cached responses in .cache/usda/
// (fetching any that are missing) and writes a review report to .cache/usda/derive-report.md.
// Run on demand only; Jared reviews the diff. It never edits content/.
// Usage: npm run usda:derive
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { rulesSchema } from "../src/shared/data/schema";
import { CACHE, fetchDetails, pool } from "./usda-client";
import { CANDIDATES, FROM, REPORTS, TO } from "./usda-commodities";
import {
  calendarMeans,
  dedupe,
  lumpSums,
  type MovementRow,
  monthRange,
  originCode,
  ownSeasonIndex,
  parseRow,
  splitAcrossMonths,
  typicalOrigins,
} from "./usda-lib";

// Launch item → probe candidates. Only items whose US and import supply USDA reports throughout the period; the
// rest (citrus, unreported US crops, herbs and items whose basis is set when drafted) use editorial origins.
const ITEMS: Record<string, string[]> = {
  apples: ["apples"],
  pears: ["pears"],
  peaches: ["peaches"],
  nectarines: ["nectarines"],
  plums: ["plums"],
  cherries: ["cherries"],
  strawberries: ["strawberries"],
  blueberries: ["blueberries"],
  raspberries: ["raspberries"],
  blackberries: ["blackberries"],
  grapes: ["grapes"],
  watermelon: ["watermelon"],
  cantaloupe: ["cantaloupe"],
  honeydew: ["honeydew"],
  bananas: ["bananas"],
  plantains: ["plantains"],
  avocados: ["avocados"],
  mangoes: ["mangoes"],
  pineapples: ["pineapples"],
  papaya: ["papaya"],
  coconuts: ["coconuts"],
  limes: ["limes"],
  romaine: ["romaine-lettuce"],
  iceberg: ["iceberg-lettuce"],
  spinach: ["spinach"],
  kale: ["kale"],
  broccoli: ["broccoli"],
  cauliflower: ["cauliflower"],
  cabbage: ["cabbage"],
  "brussels-sprouts": ["brussels-sprouts"],
  potatoes: ["potatoes"],
  "sweet-potatoes": ["sweet-potatoes"],
  ginger: ["ginger"],
  jicama: ["jicama"],
  yuca: ["yuca"],
  onions: ["onions"],
  "green-onions": ["green-onions"],
  "summer-squash": ["zucchini", "yellow-squash"],
  tomatoes: ["tomatoes"],
  "bell-peppers": ["bell-peppers"],
  "hot-peppers": ["hot-peppers"],
  cucumbers: ["cucumbers"],
  eggplant: ["eggplant"],
  tomatillos: ["tomatillos"],
  "sweet-corn": ["sweet-corn"],
  "green-beans": ["green-beans"],
  "snap-snow-peas": ["snap-peas"],
  asparagus: ["asparagus"],
  celery: ["celery"],
};

// Import origins → ISO 3166-1 alpha-2, for the countries that become a typical origin.
const COUNTRIES: Record<string, string> = {
  Argentina: "ar",
  Australia: "au",
  Belgium: "be",
  Brazil: "br",
  Canada: "ca",
  Chile: "cl",
  China: "cn",
  Colombia: "co",
  "Costa Rica": "cr",
  "Dominican Republic": "do",
  Ecuador: "ec",
  Guatemala: "gt",
  Honduras: "hn",
  India: "in",
  Italy: "it",
  Jamaica: "jm",
  Mexico: "mx",
  Netherlands: "nl",
  "New Zealand": "nz",
  Nicaragua: "ni",
  Panama: "pa",
  Peru: "pe",
  Philippines: "ph",
  "South Africa": "za",
  Spain: "es",
  Thailand: "th",
  Vietnam: "vn",
};

const MONTHS = monthRange(FROM.slice(0, 7), TO.slice(0, 7));
const rules = rulesSchema.parse(parseYaml(readFileSync("data/rules.yaml", "utf8")));
const states = new Map(
  readFileSync("data/us-states.csv", "utf8")
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((l) => l.split(",").reverse() as [string, string]),
);
// Domestic rows fold into their state's code; imports keep the country name until they're named (see `idOf`).
const key = (origin: string) => (origin.startsWith("US: ") ? originCode(origin, states, {}) : origin);
const idOf = (o: string) => (o.startsWith("us-") ? o : originCode(o, states, COUNTRIES));
const fmt = (lb: number) => (lb >= 1e6 ? `${(lb / 1e6).toFixed(1)}M` : `${Math.round(lb / 1e3)}k`);
const pct = (x: number) => `${Math.round(100 * x)}%`;

const typicalCsv: string[] = [];
const supplyCsv: string[] = [];
const report: string[] = [
  `# usda:derive report`,
  "",
  `Period ${FROM} to ${TO}. Typical origins reach ${pct(rules.typicalOriginShare)} of volume; major at ${pct(rules.decidingOriginShare)}. Exports excluded. Lump sums (a row over half the item's average month and over twice its origin's next-largest row) are dropped.`,
  "",
  "| Item | Lump rows dropped | Unnamed regions | Months by origin count |",
  "| --- | --- | --- | --- |",
];
const detail: string[] = [];

for (const [item, candidates] of Object.entries(ITEMS)) {
  const names = candidates.flatMap((c) => {
    const n = CANDIDATES[c];
    if (!n) throw new Error(`${item}: unknown probe candidate ${c}`);
    return n;
  });
  const jobs = names.flatMap((c) => REPORTS.map((r) => ({ r, c })));
  const raw = (await pool(jobs, 6, ({ r, c }) => fetchDetails(r, c, FROM, TO))).flat();
  const all = dedupe(raw.map(parseRow).filter((p): p is MovementRow => p !== null)).rows.filter(
    (r) => r.flow !== "export",
  );

  const lumpSet = lumpSums(all, MONTHS.length);
  const lumps = [...lumpSet];
  const rows = all.filter((r) => !lumpSet.has(r));
  const lumpLines = lumps.map((r) => `${r.origin} ${r.begin}..${r.end} ${fmt(r.lb)}`);

  // Volume per origin code (sub-state regions folded into their state) per "YYYY-MM"; regions under REGION.
  const REGION = "(multi-state region)";
  const byOrigin = new Map<string, Map<string, number>>();
  for (const r of rows) {
    const o = key(r.origin) ?? REGION;
    const m = byOrigin.get(o) ?? new Map<string, number>();
    byOrigin.set(o, m);
    for (const [month, lb] of splitAcrossMonths(r.begin, r.end, r.lb)) {
      if (MONTHS.includes(month)) m.set(month, (m.get(month) ?? 0) + lb);
    }
  }
  const means = new Map([...byOrigin].map(([o, m]) => [o, calendarMeans(m, MONTHS)]));

  const named = new Set<string>();
  const counts: number[] = [];
  const lines: string[] = [];
  for (let month = 1; month <= 12; month++) {
    const pooled = new Map([...means].map(([o, v]) => [o, v[month - 1] ?? 0]));
    const total = [...pooled.values()].reduce((a, b) => a + b, 0);
    const typical = typicalOrigins(
      pooled,
      rules.typicalOriginShare,
      rules.decidingOriginShare,
      (o) => o !== REGION,
    );
    counts.push(typical.length);
    typical.forEach((t, i) => {
      named.add(t.origin);
      typicalCsv.push(`${item},${month},${i + 1},${idOf(t.origin)},${t.major}`);
    });
    const shares = typical.map(
      (t) => `${idOf(t.origin)} ${pct((pooled.get(t.origin) ?? 0) / total)}${t.major ? "" : " (minor)"}`,
    );
    lines.push(`| ${month} | ${fmt(total)} | ${shares.join(", ")} |`);
  }
  for (const origin of [...named].sort()) {
    ownSeasonIndex(means.get(origin) ?? []).forEach((v, i) => {
      supplyCsv.push(
        `${item},${i + 1},${idOf(origin)},${v === null ? "" : Number(v.toPrecision(2))},${v === null ? "no_data" : ""}`,
      );
    });
  }

  const regionLb = [...(byOrigin.get(REGION)?.values() ?? [])].reduce((a, b) => a + b, 0);
  const totalLb = [...byOrigin.values()].flatMap((m) => [...m.values()]).reduce((a, b) => a + b, 0);
  report.push(
    `| ${item} | ${lumps.length ? `${lumps.length} (${fmt(lumps.reduce((a, r) => a + r.lb, 0))})` : "0"} | ${regionLb > 0 ? pct(regionLb / totalLb) : "–"} | ${[
      1, 2, 3, 4, 5,
    ]
      .map((n) => counts.filter((c) => (n === 5 ? c >= 5 : c === n)).length)
      .map((c, i) => `${i === 4 ? "5+" : i + 1}: ${c}`)
      .join(", ")} |`,
  );
  detail.push(
    `### ${item}`,
    "",
    ...(lumpLines.length ? [`Dropped: ${lumpLines.join("; ")}.`, ""] : []),
    "| Month | Avg lb | Typical origins (share) |",
    "| --- | --- | --- |",
    ...lines,
    "",
  );
  console.error(`${item}: ${rows.length} rows, ${lumps.length} lumps dropped`);
}

const header = [
  "# source: USDA AMS Market News movement reports (usda:derive)",
  `# from: ${FROM.slice(0, 7)}`,
  `# to: ${TO.slice(0, 7)}`,
  `# derived: ${new Date().toISOString().slice(0, 10)}`,
];
mkdirSync("data/usda", { recursive: true });
writeFileSync(
  "data/usda/typical-origins.csv",
  [...header, "item,month,rank,origin,major", ...typicalCsv, ""].join("\n"),
);
writeFileSync(
  "data/usda/supply-index.csv",
  [...header, "item,month,origin,value,reason", ...supplyCsv, ""].join("\n"),
);
writeFileSync(`${CACHE}/derive-report.md`, [...report, "", ...detail].join("\n"));
console.log(report.join("\n"));

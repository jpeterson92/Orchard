// The 75th percentile of each real-user metric and the diagnostic event totals over the last 28 days, from the
// Worker's daily counts (M8).
// `npm run measure:report` reads the deployed database; `-- --local` reads the local one `npm run preview` uses.
import { spawnSync } from "node:child_process";
import { type Event, METRICS, type Metric, percentile, TARGETS } from "../src/shared/measure";

const local = process.argv.includes("--local");
const since = new Date(Date.now() - 28 * 86_400_000).toISOString().slice(0, 10);

/** One query against the D1 database, through Wrangler's own entry point run by this Node: no shell, so the query
 * needs no quoting on any platform. */
function query<Row>(sql: string): Row[] {
  const run = spawnSync(
    process.execPath,
    [
      "node_modules/wrangler/bin/wrangler.js",
      "d1",
      "execute",
      "orchard",
      local ? "--local" : "--remote",
      "--json",
      "--command",
      sql,
    ],
    { encoding: "utf8" },
  );
  if (run.status !== 0) {
    console.error(run.stderr || run.stdout);
    process.exit(1);
  }
  return (JSON.parse(run.stdout) as { results: Row[] }[])[0]?.results ?? [];
}

const rows = query<{ metric: Metric; bucket: number; n: number }>(
  `SELECT metric, bucket, SUM(n) AS n FROM measure WHERE day >= '${since}' GROUP BY metric, bucket`,
);
const totals = new Map(
  query<{ event: Event; n: number }>(
    `SELECT event, SUM(n) AS n FROM events WHERE day >= '${since}' GROUP BY event`,
  ).map((r) => [r.event, r.n]),
);

const show = (m: Metric, v: number) => (m === "cls" ? (v / 100).toFixed(2) : `${(v / 1000).toFixed(1)} s`);
const NAMES: Record<Metric, string> = {
  verdict: "Time to first verdict",
  lcp: "Largest content painted",
  inp: "Response to input",
  cls: "Layout shift",
};

console.log(`Real-user p75 since ${since} (${local ? "local" : "deployed"} database)\n`);
for (const m of ["verdict", ...METRICS.filter((x) => x !== "verdict")] as Metric[]) {
  const mine = rows.filter((r) => r.metric === m);
  const loads = mine.reduce((sum, r) => sum + r.n, 0);
  const p75 = percentile(mine, 0.75);
  const verdict =
    p75 === null
      ? "no data"
      : `${show(m, p75)}  ${p75 <= TARGETS[m] ? "good" : "over"} (target ≤ ${show(m, TARGETS[m])})`;
  console.log(`${NAMES[m].padEnd(24)} ${verdict.padEnd(40)} ${loads} page loads`);
}

const total = (e: Event) => totals.get(e) ?? 0;
const visits = total("visit");
const share = visits === 0 ? "" : ` (${Math.round((100 * total("return14")) / visits)}% of visit days)`;
console.log("\nDiagnostic events (no targets)\n");
for (const [label, value] of [
  ["Item page opens", `${total("item")}`],
  ["Today card expansions", `${total("expand")}`],
  ["Searches with no match", `${total("nomatch")}`],
  ["Visit days", `${visits}`],
  ["14-day return visits", `${total("return14")}${share}`],
] as const)
  console.log(`${label.padEnd(24)} ${value}`);

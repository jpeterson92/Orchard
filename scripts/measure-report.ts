// The 75th percentile of each real-user metric over the last 28 days, from the Worker's daily counts (M8).
// `npm run measure:report` reads the deployed database; `-- --local` reads the local one `npm run preview` uses.
import { spawnSync } from "node:child_process";
import { METRICS, type Metric, percentile, TARGETS } from "../src/shared/measure";

const local = process.argv.includes("--local");
const since = new Date(Date.now() - 28 * 86_400_000).toISOString().slice(0, 10);
const sql = `SELECT metric, bucket, SUM(n) AS n FROM measure WHERE day >= '${since}' GROUP BY metric, bucket`;

// Wrangler's own entry point, run by this Node: no shell, so the query needs no quoting on any platform.
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
const rows =
  (JSON.parse(run.stdout) as { results: { metric: Metric; bucket: number; n: number }[] }[])[0]?.results ??
  [];

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

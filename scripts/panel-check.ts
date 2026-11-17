// `npm run panel:check [-- <run-id>]`: validate model panel runs in content/panel/ (all runs, or one).
// Prints errors and warnings per run; exits 1 on any error. Never changes content.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { checkRun, panelRunSchema, scopeSchema } from "./panel-lib";

const ROOT = "content/panel";
const scope = scopeSchema.parse(parseYaml(readFileSync(join(ROOT, "scope.yaml"), "utf8")));
const states = new Set(
  readFileSync("data/us-states.csv", "utf8")
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(",")[0] ?? "")
    .filter(Boolean),
);

const wanted = process.argv[2];
const runs = readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && (wanted === undefined || d.name === wanted))
  .map((d) => d.name);
if (runs.length === 0) {
  console.error(wanted ? `No run ${wanted} in ${ROOT}` : `No runs in ${ROOT}`);
  process.exit(1);
}

let failed = false;
for (const run of runs) {
  const dir = join(ROOT, run);
  const errors: string[] = [];
  const meta = existsSync(join(dir, "run.yaml"))
    ? panelRunSchema.safeParse(parseYaml(readFileSync(join(dir, "run.yaml"), "utf8")))
    : null;
  if (meta === null) errors.push("run.yaml: missing");
  else if (!meta.success)
    for (const i of meta.error.issues) errors.push(`run.yaml: ${i.path.join(".")}: ${i.message}`);
  else if (meta.data.run !== run) errors.push(`run.yaml: run ${meta.data.run} doesn't match the folder name`);
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".yaml") && f !== "run.yaml")
    .map((name) => ({ name, data: parseYaml(readFileSync(join(dir, name), "utf8")) }));
  const report = checkRun(files, scope, states);
  errors.push(...report.errors);
  console.log(
    `${run}: ${report.covered}/${scope.length} items, ${errors.length} errors, ${report.warnings.length} warnings`,
  );
  for (const e of errors) console.log(`  error   ${e}`);
  for (const w of report.warnings) console.log(`  warning ${w}`);
  if (errors.length > 0) failed = true;
}
process.exit(failed ? 1 : 0);

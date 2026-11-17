// npm run data:build [-- --production]
// Validates content/ and data/ (engineering plan §4.1), writes src/generated/data.json, prints counts.
// Editorial review listings live in `npm run content:report`, run only when reviewing content.
// Reads committed files only: it never fetches from the network and never edits content.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { type Csv, parseCsv, type RawInputs, validate } from "./data-validate";

const production = process.argv.includes("--production");
const read = (file: string) => readFileSync(file, "utf8");
const yaml = (file: string): unknown => parseYaml(read(file));
const csv = (file: string, columns: readonly string[]): Csv | null =>
  existsSync(file) ? parseCsv(file, read(file), columns) : null;

const yamlFiles = (dir: string) =>
  readdirSync(dir)
    .filter((f) => /\.ya?ml$/.test(f))
    .sort()
    .map((f) => ({ file: `${dir}/${f}`, data: yaml(join(dir, f)) }));

const raw: RawInputs = {
  rules: yaml("data/rules.yaml"),
  sources: yaml("data/sources.yaml") ?? [],
  categories: yaml("data/categories.yaml"),
  states: parseCsv("data/us-states.csv", read("data/us-states.csv"), ["state", "name"]),
  advisories: yaml("data/advisories.yaml") ?? [],
  items: yamlFiles("content/items"),
  evidence: yamlFiles("content/evidence"),
  typicalOrigins: csv("data/usda/typical-origins.csv", ["item", "month", "rank", "origin"]),
  supplyIndex: csv("data/usda/supply-index.csv", ["item", "month", "value", "reason"]),
};

const { errors, warnings, dataset } = validate(raw, { production });
for (const w of warnings) console.warn(`warning: ${w}`);
if (dataset === null) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`data:build failed with ${errors.length} error${errors.length === 1 ? "" : "s"}`);
  process.exit(1);
}

mkdirSync("src/generated", { recursive: true });
writeFileSync("src/generated/data.json", JSON.stringify(dataset));

const reviewed = dataset.items.filter((i) => i.status === "reviewed").length;
console.log(
  `Items: ${dataset.items.length} (${reviewed} reviewed, ${dataset.items.length - reviewed} draft)`,
);
const claims = dataset.evidence.reduce((n, e) => n + e.claims.length, 0);
console.log(`Evidence files: ${dataset.evidence.length} (${claims} claims)`);
console.log(`Origins rated: ${dataset.items.reduce((n, i) => n + i.origins.length, 0)}`);
const snap = dataset.snapshot;
console.log(
  snap
    ? `Supply snapshot: ${snap.from} to ${snap.to} (derived ${snap.derived})`
    : "Supply snapshot: none yet",
);
console.log(`Advisories: ${dataset.advisories.length}${production ? " · production build" : ""}`);

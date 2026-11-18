// npm run data:build [-- --production]
// Validates content/ and data/ (engineering plan §4.1), writes src/generated/data.json and the bundled
// src/generated/app.json, prints counts.
// Editorial review listings live in `npm run content:report`, run only when reviewing content.
// Reads committed files only: it never fetches from the network and never edits content.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { appData } from "../src/shared/app-data";
import { ART_WIDTHS, artFile, resolveArt } from "../src/shared/art";
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

// Synthetic fixtures (content/fixtures/: items, evidence and sources, all `synthetic: true`) show every Today
// section in dev and preview builds; production builds leave them out.
const fixtures = production ? null : "content/fixtures";
const list = (file: string): unknown[] => (yaml(file) as unknown[] | null) ?? [];

const raw: RawInputs = {
  rules: yaml("data/rules.yaml"),
  sources: [...list("data/sources.yaml"), ...(fixtures ? list(`${fixtures}/sources.yaml`) : [])],
  categories: yaml("data/categories.yaml"),
  states: parseCsv("data/us-states.csv", read("data/us-states.csv"), ["state", "name"]),
  advisories: yaml("data/advisories.yaml") ?? [],
  items: [...yamlFiles("content/items"), ...(fixtures ? yamlFiles(`${fixtures}/items`) : [])],
  evidence: [...yamlFiles("content/evidence"), ...(fixtures ? yamlFiles(`${fixtures}/evidence`) : [])],
  typicalOrigins: csv("data/usda/typical-origins.csv", ["item", "month", "rank", "origin", "major", "share"]),
  supplyIndex: csv("data/usda/supply-index.csv", ["item", "month", "origin", "value", "reason"]),
  varietyCalendar: csv("data/usda/variety-calendar.csv", ["item", "variety", "month", "share", "origins"]),
};

const { errors, warnings, dataset } = validate(raw, { production });
for (const w of warnings) console.warn(`warning: ${w}`);
if (dataset === null) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`data:build failed with ${errors.length} error${errors.length === 1 ? "" : "s"}`);
  process.exit(1);
}

// Painted art (engineering plan §5, art track): which processed asset each item and variety shows.
const artFiles = new Set(existsSync("public/art") ? readdirSync("public/art") : []);
const processed = new Set(
  [...artFiles]
    .map((f) => /^(.+)-\d+\.webp$/.exec(f)?.[1])
    .filter((id): id is string => id !== undefined && ART_WIDTHS.every((w) => artFiles.has(artFile(id, w)))),
);
const art = resolveArt(JSON.parse(read("art/manifest.json")), dataset.items, { production, processed });
if (art.errors.length > 0) {
  for (const e of art.errors) console.error(`error: ${e}`);
  console.error(`data:build failed with ${art.errors.length} art error${art.errors.length === 1 ? "" : "s"}`);
  process.exit(1);
}

mkdirSync("src/generated", { recursive: true });
writeFileSync("src/generated/data.json", JSON.stringify(dataset));
const app = appData(dataset, new Date().toISOString().slice(0, 10), art.art);
writeFileSync("src/generated/app.json", JSON.stringify(app));

const reviewed = dataset.items.filter((i) => i.status === "reviewed").length;
const synthetic = dataset.items.filter((i) => i.synthetic).length;
console.log(
  `Items: ${dataset.items.length} (${reviewed} reviewed, ${dataset.items.length - reviewed} draft, ${synthetic} synthetic)`,
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
console.log(
  `Art: ${Object.keys(art.art.items).length} of ${dataset.items.length} items, ${Object.keys(art.art.varieties).length} varieties`,
);
console.log(`Advisories: ${dataset.advisories.length}${production ? " · production build" : ""}`);
console.log(`App data: ${Math.round(JSON.stringify(app).length / 1024)} KB`);

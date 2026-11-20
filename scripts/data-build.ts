// npm run data:build [-- --production] [-- --check]
// Validates content/ and data/ (engineering plan §4.1), writes src/generated/data.json and the bundled
// src/generated/app.json, writes the committed assessments in generated/assessments/ (with --check it writes none
// and fails when they differ from a fresh build), prints counts.
// Editorial review listings live in `npm run content:report`, run only when reviewing content.
// Reads committed files only: it never fetches from the network and never edits content.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { appData } from "../src/shared/app-data";
import { ART_WIDTHS, artFile, resolveArt } from "../src/shared/art";
import { ASSESSMENTS_DIR, drift, renderAssessments } from "./assessments-lib";
import { type Csv, parseCsv, type RawInputs, validate } from "./data-validate";
import { citedSourceIds, renderPage, ruleValues } from "./pages-lib";
import { type LoadedRun, panelCurves, promptVersion, scopeSchema } from "./panel-lib";

const production = process.argv.includes("--production");
const checkOnly = process.argv.includes("--check");
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

// The model panel (P15): each provider's latest run on the current prompt version, as one curve per target.
const PANEL = "content/panel";
const panelRuns: LoadedRun[] = readdirSync(PANEL, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => ({
    dir: d.name,
    meta: existsSync(`${PANEL}/${d.name}/run.yaml`) ? yaml(`${PANEL}/${d.name}/run.yaml`) : null,
    files: readdirSync(`${PANEL}/${d.name}`)
      .filter((f) => f.endsWith(".yaml") && f !== "run.yaml")
      .sort()
      .map((name) => ({ name, data: yaml(`${PANEL}/${d.name}/${name}`) })),
  }));
const version = promptVersion(read(`${PANEL}/PROMPT.md`));
const states = parseCsv("data/us-states.csv", read("data/us-states.csv"), ["state", "name"]);
const panel = panelCurves(
  panelRuns,
  version ?? 0,
  scopeSchema.parse(yaml(`${PANEL}/scope.yaml`)),
  new Set(states.rows.map((r) => r.state ?? "")),
);
if (version === null) panel.errors.push(`${PANEL}/PROMPT.md: no "Prompt version: N" line`);
if (panel.errors.length > 0) {
  for (const e of panel.errors) console.error(`error: ${e}`);
  console.error(
    `data:build failed with ${panel.errors.length} panel error${panel.errors.length === 1 ? "" : "s"}`,
  );
  process.exit(1);
}

const raw: RawInputs = {
  rules: yaml("data/rules.yaml"),
  sources: [...list("data/sources.yaml"), ...(fixtures ? list(`${fixtures}/sources.yaml`) : [])],
  categories: yaml("data/categories.yaml"),
  states,
  items: [...yamlFiles("content/items"), ...(fixtures ? yamlFiles(`${fixtures}/items`) : [])],
  guides: yaml("content/guides.yaml"),
  summaries: yaml("content/summaries.yaml"),
  evidence: [...yamlFiles("content/evidence"), ...(fixtures ? yamlFiles(`${fixtures}/evidence`) : [])],
  typicalOrigins: csv("data/usda/typical-origins.csv", ["item", "month", "rank", "origin", "major", "share"]),
  supplyIndex: csv("data/usda/supply-index.csv", ["item", "month", "origin", "value", "reason"]),
  varietyCalendar: csv("data/usda/variety-calendar.csv", ["item", "variety", "month", "share", "origins"]),
  panel: panel.curves,
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

// The Methods and Privacy pages: their text, the sources the bundled items cite, and the model panel's runs.
const pageErrors: string[] = [];
const page = (file: string) => {
  const { page: rendered, errors } = renderPage(file, read(file), ruleValues(dataset.rules));
  pageErrors.push(...errors);
  if (rendered?.draft && production)
    pageErrors.push(`${file} is a draft; production builds need it reviewed`);
  return rendered ?? { html: "", draft: true };
};
const methods = page("content/methods.md");
const privacy = page("content/privacy.md");
if (pageErrors.length > 0) {
  for (const e of pageErrors) console.error(`error: ${e}`);
  console.error(
    `data:build failed with ${pageErrors.length} page error${pageErrors.length === 1 ? "" : "s"}`,
  );
  process.exit(1);
}
const cited = citedSourceIds(dataset);
const tierOrder = { authoritative: 0, mainstream: 1 };
const sources = dataset.sources
  .filter((s) => cited.has(s.id) && !s.synthetic)
  .sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier] || a.publisher.localeCompare(b.publisher))
  .map(({ id, title, publisher, url, accessed, tier }) => ({ id, title, publisher, url, accessed, tier }));
const panelModels = panelRuns
  .filter((r) => panel.counted.includes(r.dir))
  .map((r) => r.meta as { model: string; provider: string; date: string })
  .map(({ model, provider, date }) => ({ model, provider, date: String(date) }));
const about = { methods, privacy, sources, panel: panelModels, snapshot: dataset.snapshot };

mkdirSync("src/generated", { recursive: true });
writeFileSync("src/generated/data.json", JSON.stringify(dataset));
const app = appData(dataset, new Date().toISOString().slice(0, 10), art.art, about);
writeFileSync("src/generated/app.json", JSON.stringify(app));

// Precalculated assessments, committed so verdict changes are reviewable as diffs. Production builds leave them
// alone: they drop the synthetic fixtures but must refuse drafts, so they never rebuild the committed set.
if (!production) {
  const files = renderAssessments(app);
  const stale = drift(ASSESSMENTS_DIR, files);
  if (checkOnly && stale.length > 0) {
    for (const s of stale) console.error(`error: ${ASSESSMENTS_DIR}/${s}`);
    console.error(
      `${ASSESSMENTS_DIR} is out of date with content/, data/ or the engine: run \`npm run data:build\` and commit it`,
    );
    process.exit(1);
  }
  if (!checkOnly && stale.length > 0) {
    mkdirSync(ASSESSMENTS_DIR, { recursive: true });
    for (const name of readdirSync(ASSESSMENTS_DIR))
      if (!files.has(name)) rmSync(join(ASSESSMENTS_DIR, name));
    for (const [name, content] of files) writeFileSync(join(ASSESSMENTS_DIR, name), content);
  }
  const updated = !checkOnly && stale.length > 0 ? ` (${stale.length} files updated)` : "";
  console.log(`Assessments: ${files.size - 1} items${updated}`);
}

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
if (production) console.log("Production build");
console.log(`App data: ${Math.round(JSON.stringify(app).length / 1024)} KB`);

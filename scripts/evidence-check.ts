// npm run evidence:check [-- <dir>]
// Checks evidence files (content/evidence/ by default; pass .cache/evidence/parsed to check parser drafts):
// each claim's source is a registered page whose excerpt for the item (from evidence:fetch) names the claim's
// months or season, and each cited source's URL still resolves. Records today's date as `accessed` in
// data/sources.yaml for every URL that resolved. Exits 1 on any rejected claim or dead URL.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { parseDocument, parse as parseYaml } from "yaml";
import { evidenceFileSchema } from "../src/shared/data/schema";
import { checkRegistry, claimProblems, get, robotsAllow } from "./evidence-lib";

const CACHE = ".cache/evidence";
const dir = process.argv[2] ?? "content/evidence";
const sourcesDoc = parseDocument(readFileSync("data/sources.yaml", "utf8"));
const sources = (sourcesDoc.toJS() ?? []) as { id: string; url: string }[];
const { registry, errors } = checkRegistry(
  parseYaml(readFileSync("data/source-registry.yaml", "utf8")),
  new Set(sources.map((s) => s.id)),
);
if (registry === null) {
  for (const e of errors) console.error(`error: ${e}`);
  process.exit(1);
}
const registered = new Set(registry.pages.map((p) => p.source));

const excerptText = (item: string, source: string): string | null => {
  const file = `${CACHE}/excerpts/${item}.json`;
  if (!existsSync(file)) return null;
  const list = JSON.parse(readFileSync(file, "utf8")) as { source: string; passages: string[] }[];
  const found = list.filter((e) => e.source === source).flatMap((e) => e.passages);
  return found.length > 0 ? found.join("\n") : null;
};

const rejected: string[] = [];
const cited = new Set<string>();
let checked = 0;
const files = existsSync(dir) ? readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)) : [];
for (const f of files.sort()) {
  const parsed = evidenceFileSchema.safeParse(parseYaml(readFileSync(`${dir}/${f}`, "utf8")));
  if (!parsed.success) {
    rejected.push(`${dir}/${f}: not an evidence file (${parsed.error.issues[0]?.message}); run data:build`);
    continue;
  }
  for (const [n, claim] of parsed.data.claims.entries()) {
    checked++;
    const at = `${dir}/${f} claims.${n} (${claim.source})`;
    cited.add(claim.source);
    if (!registered.has(claim.source)) {
      rejected.push(`${at}: ${claim.source} isn't a page in data/source-registry.yaml`);
      continue;
    }
    const excerpt = excerptText(parsed.data.item, claim.source);
    if (excerpt === null) {
      rejected.push(`${at}: no excerpt for ${parsed.data.item}; run evidence:fetch`);
      continue;
    }
    for (const p of claimProblems(claim, excerpt)) rejected.push(`${at}: ${p}`);
  }
}

// Each cited source's URL, fetched fresh (robots.txt respected).
const today = new Date().toLocaleDateString("en-CA");
const dead: string[] = [];
for (const id of [...cited].sort()) {
  const source = sources.find((s) => s.id === id);
  if (!source) {
    dead.push(`${id}: not in data/sources.yaml`);
    continue;
  }
  const url = new URL(source.url);
  if (!(await robotsAllow(url, `${CACHE}/robots`))) {
    dead.push(`${id}: robots.txt disallows ${source.url}`);
    continue;
  }
  const res = await get(source.url).catch((err) => ({ status: 0, body: String(err) }));
  if (res.status === 0 || res.status >= 400) {
    dead.push(`${id}: ${source.url} ${res.status === 0 ? res.body : `HTTP ${res.status}`}`);
    continue;
  }
  const index = sources.findIndex((s) => s.id === id);
  sourcesDoc.setIn([index, "accessed"], today);
}
if (cited.size > dead.length) writeFileSync("data/sources.yaml", sourcesDoc.toString({ lineWidth: 0 }));

for (const r of rejected) console.error(`rejected ${r}`);
for (const d of dead) console.error(`dead ${d}`);
console.log(
  `Checked ${checked} claim${checked === 1 ? "" : "s"} in ${files.length} file${files.length === 1 ? "" : "s"} under ${dir}: ` +
    `${rejected.length} rejected; ${cited.size - dead.length} of ${cited.size} cited URLs resolved (accessed ${today})`,
);
if (rejected.length > 0 || dead.length > 0) process.exit(1);

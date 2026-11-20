// npm run evidence:check [-- <dir>] [--urls]
// Checks evidence files (content/evidence/ by default; pass .cache/evidence/parsed to check parser drafts):
// each claim's source is a registered page whose excerpt for the item (from evidence:fetch) names the claim's
// months or season. Local files only, so it takes a second.
// --urls also checks that each cited source's URL still resolves (about 265 requests, 8 at a time) and records
// today's date as `accessed` in data/sources.yaml for every URL that resolved. Run it when refreshing sources.
// Exits 1 on any rejected claim or dead URL.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { parseDocument, parse as parseYaml } from "yaml";
import { evidenceFileSchema } from "../src/shared/data/schema";
import { checkRegistry, claimProblems, robotsAllow, USER_AGENT } from "./evidence-lib";

const CACHE = ".cache/evidence";
const args = process.argv.slice(2);
const checkUrls = args.includes("--urls");
const dir = args.find((a) => !a.startsWith("--")) ?? "content/evidence";
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

// Each cited source's URL, fetched fresh (robots.txt respected), only with --urls.
const today = new Date().toLocaleDateString("en-CA");
const dead: string[] = [];
const resolved: string[] = [];
const status = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15_000),
    });
    await res.body?.cancel();
    return res.status >= 400 ? `HTTP ${res.status}` : null;
  } catch (err) {
    return String(err);
  }
};
const checkSource = async (id: string): Promise<void> => {
  const source = sources.find((s) => s.id === id);
  if (!source) {
    dead.push(`${id}: not in data/sources.yaml`);
    return;
  }
  if (!(await robotsAllow(new URL(source.url), `${CACHE}/robots`))) {
    dead.push(`${id}: robots.txt disallows ${source.url}`);
    return;
  }
  const problem = await status(source.url);
  if (problem === null) resolved.push(id);
  else dead.push(`${id}: ${source.url} ${problem}`);
};
if (checkUrls) {
  const queue = [...cited].sort();
  const worker = async (): Promise<void> => {
    for (let id = queue.shift(); id !== undefined; id = queue.shift()) await checkSource(id);
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  dead.sort();
  for (const id of resolved) {
    sourcesDoc.setIn([sources.findIndex((s) => s.id === id), "accessed"], today);
  }
  if (resolved.length > 0) writeFileSync("data/sources.yaml", sourcesDoc.toString({ lineWidth: 0 }));
}

for (const r of rejected) console.error(`rejected ${r}`);
for (const d of dead) console.error(`dead ${d}`);
console.log(
  `Checked ${checked} claim${checked === 1 ? "" : "s"} in ${files.length} file${files.length === 1 ? "" : "s"} under ${dir}: ` +
    `${rejected.length} rejected; ` +
    (checkUrls
      ? `${resolved.length} of ${cited.size} cited URLs resolved (accessed ${today})`
      : "URLs not checked (add --urls)"),
);
if (rejected.length > 0 || dead.length > 0) process.exit(1);

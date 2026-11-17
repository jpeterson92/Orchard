// npm run evidence:fetch
// Downloads each page in data/source-registry.yaml once (robots.txt respected, cached in .cache/evidence/pages/),
// and writes, per item, the excerpts naming it with a month or season and the draft claims the chart parsers make:
//   .cache/evidence/excerpts/<item>.json   [{ source, url, passages }]  (what evidence:check reads)
//   .cache/evidence/worklist.md            prose excerpts for drafting claims
//   .cache/evidence/parsed/<item>.yaml     draft claims from charts, in the evidence-file format
// Delete a cached page to fetch it again. Never writes to content/.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { parse as parseYaml, stringify } from "yaml";
import type { EvidenceClaim } from "../src/shared/data/schema";
import {
  checkRegistry,
  excerpts,
  get,
  hash,
  htmlToLines,
  pageItems,
  parseItemMonths,
  type RegistryPage,
  robotsAllow,
  rowClaim,
} from "./evidence-lib";

const CACHE = ".cache/evidence";
for (const dir of ["pages", "robots", "excerpts", "parsed"])
  mkdirSync(`${CACHE}/${dir}`, { recursive: true });

const sources = parseYaml(readFileSync("data/sources.yaml", "utf8")) as { id: string }[] | null;
const { registry, errors } = checkRegistry(
  parseYaml(readFileSync("data/source-registry.yaml", "utf8")),
  new Set((sources ?? []).map((s) => s.id)),
);
if (registry === null) {
  for (const e of errors) console.error(`error: ${e}`);
  process.exit(1);
}
const stateNames = new Map(
  readFileSync("data/us-states.csv", "utf8")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((l) => l.split(",") as [string, string])
    .map(([code, name]) => [`us-${code.toLowerCase()}`, name]),
);
const placeName = (origin: string) =>
  origin === "us" ? "US" : (stateNames.get(origin) ?? origin.toUpperCase());

/** The page's HTML, from the cache or fetched once. Null (with a reason) when it can't be read. */
async function page(p: RegistryPage): Promise<{ html: string } | { skipped: string }> {
  const file = `${CACHE}/pages/${hash(p.url)}.html`;
  if (existsSync(file)) return { html: readFileSync(file, "utf8") };
  const url = new URL(p.url);
  if (!(await robotsAllow(url, `${CACHE}/robots`))) return { skipped: "robots.txt disallows it" };
  try {
    const res = await get(p.url);
    if (res.status >= 400) return { skipped: `HTTP ${res.status}` };
    writeFileSync(file, res.body);
    return { html: res.body };
  } catch (err) {
    return { skipped: String(err) };
  }
}

interface Excerpt {
  source: string;
  url: string;
  passages: string[];
}
const byItem = new Map<string, Excerpt[]>(Object.keys(registry.items).map((i) => [i, []]));
const parsed = new Map<string, EvidenceClaim[]>(Object.keys(registry.items).map((i) => [i, []]));
const unparsed: string[] = [];

for (const p of registry.pages) {
  const result = await page(p);
  if ("skipped" in result) {
    console.warn(`skipped ${p.source}: ${result.skipped}`);
    continue;
  }
  const lines = htmlToLines(result.html);
  const items = pageItems(p, registry);
  const found: string[] = [];
  for (const item of items) {
    const passages = excerpts(lines, registry.items[item] ?? []);
    if (passages.length > 0) {
      byItem.get(item)?.push({ source: p.source, url: p.url, passages });
      found.push(`${item} ${passages.length}`);
    }
  }
  if (p.parser === "item-months") {
    const subset = Object.fromEntries(items.map((i) => [i, registry.items[i] ?? []]));
    for (const row of parseItemMonths(lines, subset)) {
      const claim = rowClaim(row, p, placeName(p.origin));
      if (claim) parsed.get(row.item)?.push(claim);
      else unparsed.push(`${p.source} ${row.item}: "${row.label}: ${row.months}"`);
    }
  }
  console.log(`${p.source}: ${found.length > 0 ? found.join(", ") : "no passages"}`);
}

const worklist: string[] = [
  "# Evidence worklist",
  "",
  "Prose excerpts per item and source, for drafting claims. Chart rows are already claims in parsed/.",
  "",
];
for (const [item, list] of byItem) {
  writeFileSync(`${CACHE}/excerpts/${item}.json`, `${JSON.stringify(list, null, 2)}\n`);
  const claims = parsed.get(item) ?? [];
  const parsedFile = `${CACHE}/parsed/${item}.yaml`;
  if (claims.length > 0)
    writeFileSync(parsedFile, stringify({ item, status: "draft", claims }, { lineWidth: 0 }));
  else rmSync(parsedFile, { force: true });
  const prose = list.filter((e) => registry.pages.find((p) => p.source === e.source)?.parser === undefined);
  worklist.push(`## ${item}`, "");
  if (prose.length === 0) worklist.push("(no prose excerpts)", "");
  for (const e of prose) {
    const p = registry.pages.find((x) => x.source === e.source);
    worklist.push(
      `### ${e.source} (origin ${p?.origin ?? "us"})`,
      "",
      ...e.passages.map((s) => `- ${s}`),
      "",
    );
  }
  console.log(`${item}: ${list.length} sources with excerpts, ${claims.length} parsed claims`);
}
writeFileSync(`${CACHE}/worklist.md`, worklist.join("\n"));
for (const u of unparsed) console.warn(`unparsed row ${u}`);
console.log(`Wrote ${CACHE}/excerpts/, ${CACHE}/parsed/ and ${CACHE}/worklist.md`);

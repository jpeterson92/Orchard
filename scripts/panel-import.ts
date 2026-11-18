// `npm run panel:import -- <pasted.txt> [run-id]`: turn a chat model's pasted replies into a model panel run.
// The paste holds run.yaml and category files as yaml code blocks (or bare YAML), in any number of replies.
// Each document starting with `run:` becomes content/panel/<run>/run.yaml; each starting with `category:`
// becomes <category>.yaml in that folder, replacing an earlier import of the same category. Pass run-id to add
// categories to an existing run when the paste has no run.yaml. Writes only that run's folder.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

const [pasted, runArg] = process.argv.slice(2);
if (pasted === undefined) {
  console.error("Usage: npm run panel:import -- <pasted.txt> [run-id]");
  process.exit(1);
}
const text = readFileSync(pasted, "utf8").replace(/\r\n/g, "\n");
const fenced = [...text.matchAll(/```[a-z]*\n([\s\S]*?)```/g)].map((m) => m[1] ?? "");
const blocks = fenced.length > 0 ? fenced : [text];
// A document starts at a top-level `run:` or `category:` line; `---` separators are dropped.
const docs = blocks.flatMap((b) =>
  b
    .split(/^(?=(?:run|category):)/m)
    .map((d) => d.replace(/^---\s*$/gm, "").trim())
    .filter((d) => /^(run|category):/.test(d)),
);

let run = runArg;
const files = new Map<string, string>();
const errors: string[] = [];
for (const doc of docs) {
  let data: unknown;
  try {
    data = parseYaml(doc);
  } catch (e) {
    errors.push(
      `can't parse the document starting "${doc.split("\n")[0]}": ${(e as Error).message.split("\n")[0]}`,
    );
    continue;
  }
  const d = data as { run?: unknown; category?: unknown };
  if (typeof d.run === "string") {
    if (runArg !== undefined && d.run !== runArg) errors.push(`run.yaml names ${d.run}, not ${runArg}`);
    run = d.run;
    files.set("run.yaml", doc);
  } else if (typeof d.category === "string") {
    if (files.has(`${d.category}.yaml`)) console.log(`  ${d.category}: appears twice; the later one is kept`);
    files.set(`${d.category}.yaml`, doc);
  }
}
if (run === undefined) errors.push("no run.yaml in the paste; pass the run id to add to an existing run");
else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(run)) errors.push(`run id ${run} isn't lowercase-kebab`);
else if (!files.has("run.yaml") && !existsSync(join("content/panel", run, "run.yaml")))
  errors.push(`content/panel/${run} has no run.yaml yet; include it in the paste`);
if (errors.length > 0) {
  for (const e of errors) console.error(`error ${e}`);
  process.exit(1);
}

const dir = join("content/panel", run as string);
mkdirSync(dir, { recursive: true });
for (const [name, doc] of files) {
  const replaced = existsSync(join(dir, name));
  writeFileSync(join(dir, name), `${doc}\n`);
  console.log(`  ${replaced ? "replaced" : "wrote   "} ${join(dir, name)}`);
}
console.log(`${files.size} files in ${dir}. Next: npm run panel:check -- ${run}`);

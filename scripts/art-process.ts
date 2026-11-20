// npm run art:process
// Takes in Jared's approved paintings from the illustrator's staging folders (art/staging/<folder>/handoff.json
// lists them; the PNG beside it is the master), copies each to art/masters/ and records it in art/manifest.json
// as approved. Then checks each master (checkMaster), writes its WebP derivatives to public/art/, removes
// derivatives no manifest entry uses, and writes a contact sheet of every processed asset over ivory and warm
// charcoal (.cache/art/contact-sheet.html).
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, relative } from "node:path";
import sharp from "sharp";
import { z } from "zod";
import { ART_WIDTHS, type ArtAsset, artAssetSchema, artFile, artManifestSchema } from "../src/shared/art";
import { checkMaster } from "./art-lib";

const MANIFEST = "art/manifest.json";
const MASTERS = "art/masters";
const STAGING = "art/staging";
const OUT = "public/art";
const SHEET = ".cache/art/contact-sheet.html";

const handoffSchema = z.strictObject({ assets: z.array(artAssetSchema.omit({ status: true })) });

const manifest = artManifestSchema.parse(JSON.parse(readFileSync(MANIFEST, "utf8")));
const byId = new Map(manifest.assets.map((a) => [a.id, a]));
mkdirSync(OUT, { recursive: true });
let changed = false;
let handedOff = 0;
const handoffProblems: string[] = [];
const handoffs: (Omit<ArtAsset, "status"> & { src: string })[] = [];

for (const dir of existsSync(STAGING) ? readdirSync(STAGING).sort() : []) {
  const file = `${STAGING}/${dir}/handoff.json`;
  if (!existsSync(file)) continue;
  const parsed = handoffSchema.safeParse(JSON.parse(readFileSync(file, "utf8")));
  if (!parsed.success) {
    handoffProblems.push(
      `${file}: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`,
    );
    continue;
  }
  for (const a of parsed.data.assets) {
    const src = `${STAGING}/${dir}/${a.id}.png`;
    if (existsSync(src)) handoffs.push({ ...a, src });
    else handoffProblems.push(`${file}: ${a.id}.png is missing`);
  }
}

// Only each subject's newest approved revision is kept: an earlier one leaves the manifest and art/masters
// (git history keeps it), and its derivatives are removed below.
const subject = (a: Pick<ArtAsset, "item" | "variety" | "role">) => `${a.item}/${a.variety ?? ""}/${a.role}`;
const newest = new Map<string, number>();
for (const a of [...byId.values(), ...handoffs])
  newest.set(subject(a), Math.max(newest.get(subject(a)) ?? 0, a.revision));
const superseded = [...byId.values()].filter((a) => a.revision < (newest.get(subject(a)) ?? 0));
for (const a of superseded) {
  byId.delete(a.id);
  if (existsSync(`${MASTERS}/${a.id}.png`)) unlinkSync(`${MASTERS}/${a.id}.png`);
  changed = true;
}

for (const { src, ...a } of handoffs) {
  if (a.revision < (newest.get(subject(a)) ?? 0)) continue;
  const dest = `${MASTERS}/${a.id}.png`;
  if (!existsSync(dest) || statSync(src).mtimeMs > statSync(dest).mtimeMs) {
    // Lossless recompression: the generator's PNGs shrink by about 13% on average.
    await sharp(src).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(dest);
    handedOff++;
  }
  const entry: ArtAsset = { ...a, status: "approved" };
  if (JSON.stringify(byId.get(a.id)) !== JSON.stringify(entry)) {
    byId.set(a.id, entry);
    changed = true;
  }
}
manifest.assets = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));

const masters = existsSync(MASTERS) ? readdirSync(MASTERS).filter((f) => f.endsWith(".png")) : [];
const failed: { id: string; file: string; problems: string[] }[] = [];
let written = 0;

for (const f of masters.sort()) {
  const id = basename(f, ".png");
  const file = `${MASTERS}/${f}`;
  const asset = byId.get(id);
  if (asset === undefined) {
    failed.push({ id, file, problems: ["not in art/manifest.json: check the file name"] });
    continue;
  }
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const problems = checkMaster({ width: info.width, height: info.height, channels: info.channels, data });
  if (problems.length > 0) {
    failed.push({ id, file, problems });
    continue;
  }
  const mtime = statSync(file).mtimeMs;
  for (const w of ART_WIDTHS) {
    const out = `${OUT}/${artFile(id, w)}`;
    if (existsSync(out) && statSync(out).mtimeMs >= mtime) continue;
    await sharp(file).resize(w, w).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(out);
    written++;
  }
  if (asset.status === "requested") {
    asset.status = "review";
    changed = true;
  }
}

if (changed) writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

let removed = 0;
for (const f of readdirSync(OUT)) {
  const id = f.match(/^(.*)-\d+\.webp$/)?.[1];
  if (id !== undefined && byId.has(id)) continue;
  unlinkSync(`${OUT}/${f}`);
  removed++;
}

const processed = manifest.assets.filter((a) => existsSync(`${OUT}/${artFile(a.id, ART_WIDTHS[0])}`));
const waiting = manifest.assets.filter((a) => a.status === "requested" && !masters.includes(`${a.id}.png`));
writeContactSheet(processed, failed);

console.log(`Handed off from art/staging: ${handedOff} new or updated masters`);
for (const a of superseded) console.log(`  superseded and removed: ${a.id}`);
for (const p of handoffProblems) console.log(`  ${p}`);
console.log(
  `Masters: ${masters.length} · derivatives written: ${written}, removed: ${removed} · failed: ${failed.length}`,
);
for (const f of failed) console.log(`  ${f.id}: ${f.problems.join("; ")}`);
const count = (s: ArtAsset["status"]) => manifest.assets.filter((a) => a.status === s).length;
console.log(
  `Manifest: ${count("requested")} requested (${waiting.length} without a master), ${count("review")} awaiting review, ${count("approved")} approved, ${count("rejected")} rejected`,
);
console.log(`Contact sheet: ${SHEET}`);
if (failed.length > 0 || handoffProblems.length > 0) process.exitCode = 1;

function writeContactSheet(assets: ArtAsset[], failures: typeof failed) {
  mkdirSync(".cache/art", { recursive: true });
  const src = (path: string) => relative(".cache/art", path).replaceAll("\\", "/");
  const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
  const tile = (a: ArtAsset, bg: "ivory" | "charcoal") => `
    <div class="tile ${bg}">
      <img src="${src(`${OUT}/${artFile(a.id, 160)}`)}" width="72" height="72" alt="">
      <img src="${src(`${OUT}/${artFile(a.id, 640)}`)}" width="320" height="320" alt="">
    </div>`;
  const rows = assets
    .map(
      (a) => `
  <section>
    <h2>${esc(a.id)} <span class="status ${a.status}">${a.status}</span></h2>
    <p>${esc(a.alt)}</p>
    <div class="tiles">${tile(a, "ivory")}${tile(a, "charcoal")}</div>
  </section>`,
    )
    .join("");
  const fails = failures
    .map(
      (f) => `
  <section>
    <h2>${esc(f.id)} <span class="status rejected">failed checks</span></h2>
    <ul>${f.problems.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
    <div class="tiles"><div class="tile ivory"><img src="${src(f.file)}" width="320" height="320" alt=""></div></div>
  </section>`,
    )
    .join("");
  writeFileSync(
    SHEET,
    `<!doctype html>
<meta charset="utf-8">
<title>Orchard art contact sheet</title>
<style>
  body { font: 15px/1.4 system-ui, sans-serif; margin: 24px; background: #fff; color: #222; }
  h1 { font-family: Georgia, serif; }
  h2 { font-size: 16px; margin: 0; }
  section { border-top: 1px solid #ccc; padding: 16px 0; }
  .tiles { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }
  .tile { display: flex; align-items: center; gap: 16px; padding: 16px; }
  .ivory { background: #fbf6ea; }
  .charcoal { background: #25211f; }
  .status { font-weight: 400; font-size: 13px; padding: 1px 6px; border: 1px solid #999; border-radius: 4px; }
  .rejected { border-color: #b94c1d; color: #b94c1d; }
  .approved { border-color: #3b6c47; color: #3b6c47; }
</style>
<h1>Orchard art contact sheet</h1>
<p>Each asset at card size (72 px) and pane size (320 px), over ivory and warm charcoal. Look for white halos,
hard rectangular edges, clipped leaves and pale haze; check the botanical traits in the request.</p>
${fails}${rows || "<p>No processed assets yet.</p>"}
`,
  );
}

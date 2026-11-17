// npm run content:report — the editorial review, run only when reviewing or updating content (never in app work).
// Reads the dataset `npm run data:build` wrote and lists what an editor should settle: per item, the typical
// year's verdict strip and its surprises, unrated windows and Always good disagreements. It changes nothing.
import { readFileSync } from "node:fs";
import type { Dataset } from "../src/shared/data/schema";
import { propose, type Target, traitsFor } from "../src/shared/evidence";
import { WINDOW_COUNT, windowRange } from "../src/shared/time";
import { evaluate, looksAlwaysGood, typicalOutlook } from "../src/shared/verdict";
import { engineEnv, itemInputs } from "../src/shared/verdict/inputs";
import { STRIP_HEADER, surprises, verdictStrip } from "./review";

const data = JSON.parse(readFileSync("src/generated/data.json", "utf8")) as Dataset;
const env = engineEnv(data);
const year = new Date().getFullYear();
const sources = new Map(data.sources.map((s) => [s.id, s]));
let findings = 0;
const note = (line: string) => {
  findings++;
  console.log(`    ${line}`);
};

console.log(`Content report: ${data.items.length} items`);
console.log(`  ${"".padEnd(20)} ${STRIP_HEADER}   (P Peak, G Good, S Skip, · Limited evidence)`);
for (const item of data.items) {
  const inputs = itemInputs(item, data);
  const outlook = typicalOutlook(inputs, env, year);
  console.log(`  ${item.id.padEnd(20)} ${verdictStrip(outlook)}`);

  const rated = new Set(item.origins.flatMap((o) => o.windows.flatMap((w) => windowRange(w.from, w.to))));
  const ratedByVariety = item.varieties.some((v) => v.windows);
  if (!ratedByVariety && rated.size < WINDOW_COUNT)
    note(`${WINDOW_COUNT - rated.size} windows without a rating`);

  // Always good is editorial; its usual evidence is a typical outlook of Good in all 24 windows (plan §4.2).
  if (item.alwaysGood !== looksAlwaysGood(outlook))
    note(`alwaysGood is ${item.alwaysGood}, but the typical outlook is ${[...new Set(outlook)].join("/")}`);

  // The evidence for whoever decides each window: the variety the card names, else the top typical origin.
  const claims = data.evidence.find((e) => e.item === item.id)?.claims ?? [];
  const cache = new Map<string, ReturnType<typeof propose>["windows"]>();
  const deciderProposal = Array.from({ length: WINDOW_COUNT }, (_, w) => {
    const date = { year, month: Math.floor(w / 2) + 1, day: w % 2 === 0 ? 1 : 16 };
    const r = evaluate(inputs, { date, mode: "typical" }, env);
    const variety = r.varietyLine?.[0];
    const origin = inputs.typicalOrigins[Math.floor(w / 2)]?.[0];
    const target: Target | null = variety ? { variety } : origin ? { origin } : null;
    if (target === null) return null;
    const key = JSON.stringify(target);
    if (!cache.has(key)) cache.set(key, propose(claims, sources, target, traitsFor(item, target)).windows);
    return cache.get(key)?.[w] ?? null;
  });
  for (const s of surprises({ outlook, deciderProposal, peakWorthSeeking: item.peakWorthSeeking.value }))
    note(s);
}
console.log(findings === 0 ? "Nothing to review." : `${findings} to review.`);

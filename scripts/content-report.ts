// npm run content:report — the editorial review, run only when reviewing or updating content (never in app work).
// Reads the dataset `npm run data:build` wrote and lists what an editor should settle: first every departing or
// Low-confidence rated window; then per item the typical year's verdict strip and its surprises, unrated windows,
// Always good disagreements, and per origin or variety the editorial rating, the evidence proposal with its
// confidence and each source's curve. It changes nothing.
import { readFileSync } from "node:fs";
import type { Dataset } from "../src/shared/data/schema";
import { P15, panelFor, propose, ratingForValue, type Target, traitsFor } from "../src/shared/evidence";
import { WINDOW_COUNT, windowLabel } from "../src/shared/time";
import { evaluate, looksAlwaysGood, typicalOutlook } from "../src/shared/verdict";
import { engineEnv, itemInputs } from "../src/shared/verdict/inputs";
import { ASSESSMENT_YEAR } from "./assessments-lib";
import {
  confidenceStrip,
  editorialSeries,
  ratingStrip,
  reviewFirst,
  SERIES_LEGEND,
  STRIP_HEADER,
  surprises,
  unratedInStore,
  unratedTypical,
  verdictStrip,
} from "./review";

const data = JSON.parse(readFileSync("src/generated/data.json", "utf8")) as Dataset;
data.items = data.items.filter((i) => !i.synthetic); // fixtures aren't content to review
const env = engineEnv(data);
const year = ASSESSMENT_YEAR; // the same dates as generated/assessments/, which holds the full per-window detail
const sources = new Map(data.sources.map((s) => [s.id, s]));
const LABEL = 34;
const column = (label: string) =>
  label.length > LABEL ? `${label.slice(0, LABEL - 1)}…` : label.padEnd(LABEL);
const row = (label: string, strip: string) => `    ${column(label)} ${strip}`;

const first: string[] = [];
const detail: string[] = [];
let findings = 0;
const note = (line: string) => {
  findings++;
  detail.push(`    ${line}`);
};

for (const item of data.items) {
  const inputs = itemInputs(item, data);
  const outlook = typicalOutlook(inputs, env, year);
  const claims = data.evidence.find((e) => e.item === item.id)?.claims ?? [];
  const cache = new Map<string, ReturnType<typeof propose>>();
  const proposalFor = (target: Target) => {
    const key = JSON.stringify(target);
    let p = cache.get(key);
    if (p === undefined) {
      p = propose(claims, sources, target, traitsFor(item, target), panelFor(data.panel, item.id, target));
      cache.set(key, p);
    }
    return p;
  };
  detail.push(`  ${item.id.padEnd(LABEL + 2)} ${verdictStrip(outlook)}`);

  const ratedByVariety = item.varieties.some((v) => v.windows);
  if (ratedByVariety) {
    for (const v of inputs.varieties) {
      const n = unratedInStore(v.windows, v.inStore);
      if (n > 0) note(`variety ${v.id}: ${n} windows in stores without a rating`);
    }
  } else {
    const n = unratedTypical(inputs.typicalOrigins, inputs.origins);
    if (n > 0) note(`${n} windows where a typical origin has no rating`);
  }

  // Always good is editorial; its usual evidence is a typical outlook of Good in all 24 windows (plan §4.2).
  if (item.alwaysGood !== looksAlwaysGood(outlook))
    note(`alwaysGood is ${item.alwaysGood}, but the typical outlook is ${[...new Set(outlook)].join("/")}`);

  // The evidence for whoever decides each window: the variety the card names, else the top typical origin.
  const deciderProposal = Array.from({ length: WINDOW_COUNT }, (_, w) => {
    const date = { year, month: Math.floor(w / 2) + 1, day: w % 2 === 0 ? 1 : 16 };
    const r = evaluate(inputs, { date }, env);
    const variety = r.varietyLine?.[0];
    const origin = inputs.typicalOrigins[Math.floor(w / 2)]?.[0];
    const target: Target | null = variety ? { variety } : origin ? { origin } : null;
    return target === null ? null : (proposalFor(target).windows[w] ?? null);
  });
  for (const s of surprises({ outlook, deciderProposal, peakWorthSeeking: item.peakWorthSeeking.value }))
    note(s);

  // Per rated origin and variety, then any unrated typical origin: the editorial call beside its evidence.
  const series: [string, Target, Parameters<typeof editorialSeries>[0]][] = [
    ...item.origins.map((o): [string, Target, typeof o.windows] => [
      o.origin,
      { origin: o.origin },
      o.windows,
    ]),
    ...item.varieties.flatMap((v): [string, Target, NonNullable<typeof v.windows>][] =>
      v.windows ? [[`variety ${v.id}`, { variety: v.id }, v.windows]] : [],
    ),
  ];
  if (!ratedByVariety) {
    const rated = new Set(item.origins.map((o) => o.origin));
    for (const o of new Set(inputs.typicalOrigins.flat()))
      if (!rated.has(o)) series.push([`${o} (unrated)`, { origin: o }, []]);
  }
  for (const [name, target, windows] of series) {
    const editorial = editorialSeries(windows);
    const proposal = proposalFor(target);
    if (windows.length === 0 && proposal.curves.length === 0) {
      detail.push(row(name, "no evidence"));
      continue;
    }
    for (const line of reviewFirst(editorial, proposal.windows)) {
      findings++;
      first.push(`  ${item.id} ${name} ${line}`);
    }
    detail.push(row(`${name}: editorial`, ratingStrip(editorial.ratings)));
    detail.push(row("  proposal", ratingStrip(proposal.windows.map((w) => w?.rating ?? null))));
    detail.push(row("  confidence", confidenceStrip(proposal.windows)));
    for (const c of proposal.curves)
      detail.push(row(`    ×${c.weight.toFixed(1)} ${c.source}`, ratingStrip(c.values)));
    // P15: the panel beside the cited evidence; where it disagrees, research goes there first.
    const panel = panelFor(data.panel, item.id, target);
    if (panel !== null) {
      detail.push(row(`    ×${P15.weight.toFixed(1)} model panel`, ratingStrip(panel)));
      const cited = propose(claims, sources, target, traitsFor(item, target)).windows;
      const differs = panel.flatMap((v, i) => {
        const c = cited[i];
        return v !== null && c != null && ratingForValue(v) !== c.rating ? [windowLabel(i)] : [];
      });
      if (differs.length > 0)
        note(`${name}: the model panel disagrees with the cited evidence at ${differs.join(", ")}`);
    }
  }
}

console.log(`Content report: ${data.items.length} items`);
console.log(`Review first: departing or Low-confidence rated windows (${first.length})`);
for (const line of first) console.log(line);
console.log("");
console.log(`  ${"".padEnd(LABEL + 2)} ${STRIP_HEADER}`);
console.log(`  (verdicts: P Peak, G Good, S Skip, · Limited evidence; series: ${SERIES_LEGEND})`);
for (const line of detail) console.log(line);
console.log(findings === 0 ? "Nothing to review." : `${findings} to review.`);

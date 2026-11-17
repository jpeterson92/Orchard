// npm run content:report — the editorial review, run only when reviewing or updating content (never in app work).
// Reads the dataset `npm run data:build` wrote and lists what an editor should settle. It changes nothing.
import { readFileSync } from "node:fs";
import type { Dataset } from "../src/shared/data/schema";
import { WINDOW_COUNT, windowRange } from "../src/shared/time";
import { looksAlwaysGood, typicalOutlook } from "../src/shared/verdict";
import { engineEnv, itemInputs } from "../src/shared/verdict/inputs";

const data = JSON.parse(readFileSync("src/generated/data.json", "utf8")) as Dataset;
const env = engineEnv(data);
const year = new Date().getFullYear();
let findings = 0;
const note = (line: string) => {
  findings++;
  console.log(`  ${line}`);
};

console.log(`Content report: ${data.items.length} items`);
for (const item of data.items) {
  const rated = new Set(item.origins.flatMap((o) => o.windows.flatMap((w) => windowRange(w.from, w.to))));
  if (rated.size < WINDOW_COUNT) note(`${item.id}: ${WINDOW_COUNT - rated.size} windows without a rating`);

  // Always good is editorial; its usual evidence is a typical outlook of Good in all 24 windows (plan §4.2).
  const outlook = typicalOutlook(itemInputs(item, data), env, year);
  if (item.alwaysGood !== looksAlwaysGood(outlook))
    note(
      `${item.id}: alwaysGood is ${item.alwaysGood}, but the typical outlook is ${[...new Set(outlook)].join("/")}`,
    );
}
console.log(findings === 0 ? "Nothing to review." : `${findings} to review.`);

# PROGRESS

Updated: 2026-11-20 · Phase: build · Live: https://orchard.jpeterson92.workers.dev (deployed 2026-11-20; the origin-wording changes, the new wordmark and the P14 and P15 re-rating aren't deployed yet) · 10 commits unsynced

## Milestones

- **Done:** M0 scaffold and deploy · M1 USDA probe · M2 schemas, verdict engine (P1, P10–P20), evidence pipeline, `usda:derive`, `content:report`, precalculated assessments in `generated/assessments/` (CI fails on drift) · model panel run `claude-opus-5-5-2026-11-19` (prompt v3) · M4 offline · M5 planning date and shared dates · M6 navigation, Browse, Calendar, search, Methods and Privacy · M8 measurement (web vitals and daily event counts in D1).
- **M3:** built; closes with Jared's phone review on the live URL.
- **M7 variety guides:** built (finder, variety pages, PLU numbers, apple overall rating, "What matters" leads); closes with Jared's review of the three leads.
- **M9:** slices 1–2 done (security headers, axe in light and dark, WebKit e2e, page titles). The rest waits on devices, the domain and the independent reviewer. Security headers checked on the live URL.
- **Content:** all 30 first-release items drafted, and the 24 Today summaries reviewed.
- **Art:** all 30 items and 43 varieties have approved art in the app (73 paintings), including the nine round-1 repaints (folder 21).
- **Brand:** the leaf-topped O wordmark in Lora Bold, Lora as the editorial serif, and favicon, home-screen icons and web app manifest from the same shapes (`npm run brand:icons`).

## Task list

Claude, in order:

1. **Jared's 2026-11-20 decisions, remaining** (okra, P14 and P15 are done):
   - Item page: drop the "Not rated: …" line from the variety summary in the verdict block.
   - `purchaseRank`: one pass over all items from USDA ERS per-capita availability.
   - "Can't find it? Try…" stays automatic. South African plums stay poor.
2. **Fill the new Not rated windows** (Content below), largest supply first: each needs the panel or 2 cited sources for the origin left unrated. Then `npx tsx .cache/apply-proposals.ts all --drop-thin` re-derives windows (it writes the low-confidence-panel reason).
3. **Per-item content follow-ups, apples first** (Content below). First run `node .cache/panel-missing.mjs`: it lists panel-rated origins an item file lacks. Fix the 26 `evidence:check` rejections only when working on that item; links are rechecked only at the yearly refresh (`evidence:check -- --urls`).
4. **Draft the remaining items on the 89-item list** (engineering plan §5 order: by `purchaseRank`, always-good items last). Each new item record brings in its approved painting: rename `provisional-<item>-thumbnail-vN.png` in its staging folder to the catalog ID, add it to that folder's `handoff.json`, and run `npm run art:process`. Approved paintings are waiting for 53 of these items (staging folders 11–20); kiwifruit, papaya and iceberg use their v2 repaints in folder 21.
5. **When folder 22's paintings are approved:** the blossom sprig as the About and not-found header accent, and a link-preview image (painted leaf on the Lora wordmark plus the blossom).

Jared:

- **Art:** folder 19 has first passes still to paint (mini sweet and hot peppers, eggplant and others). Folder 22 (brand): the painted wordmark leaf and the apple blossom sprig, prompts in its README.
- Guide leads (`content/guides.yaml`, `draft`, atop each guide): approve or rewrite.
- Methods and Privacy drafts (`content/methods.md`, `content/privacy.md`): approve or edit.
- M3 phone review: try the live URL in a store (add it to the home screen; it works offline).
- Recruit the independent reviewer Gate 1 needs (product spec §12).
- Review the drafts in `content:report` (`npm run content:report > .cache/content-report.txt`) and the variety traits.
- Optional: model panel runs from other providers (`content/panel/README.md`).

## Open questions (Jared)

1. P1 at 75%: revisit as more items are drafted.
2. Say if any finder chip name in `content/guides.yaml` should read differently.
3. Home screen: should Orchard open full screen like an app (no Safari bar, so only the app's own navigation) or as a Safari bookmark, as it does now?

## Content

- **Not rated windows** (66 of 720; the app shows "Not rated", confidence is never shown). P14 now reads a harvest chart as its own season only, so 59 off-season and shoulder windows that a single chart had made poor lost their second source: asparagus Mexico September to December, sweet corn and plums California October to November, grapefruit California fall, peaches California April and October to November, blueberries Peru February to March and August, Chile's persimmons June to July, and others. Full list with before and after verdict strips: `.cache/p14-p15-review.txt`. Mexican watermelon in summer and Florida okra in midwinter no longer read Skip: Mexico's summer windows are unrated (little volume), and Florida's winter rests on the panel's low-confidence ranges (fair). Georgia's fall okra is unchanged. The 32 windows resting on low-confidence panel ranges are in `content:report`'s review-first list. Earlier gaps, no source found good enough to rate: apricots January (Chile; one trade report puts main volume just after Christmas, no month named), plums December (Mexico holds a third of USDA volume; no source names Mexican plum months or varieties; try USDA FAS's Mexico deciduous fruit annual), okra early June (after Honduras leaves June, California and Georgia still need June ratings; California okra in June is small-farm only, and no source gives Georgia's start).
- **Per-item follow-ups:** SweeTango and Satsuma first: the panel rates them but USDA never quotes them, so each needs cited `inStores` months, as Cara Cara now has (`node .cache/panel-missing-varieties.mjs` lists panel variety windows an item lacks; Red and Golden Delicious, Tommy Atkins, Haden, round and Roma stay unrated by rule); apples (Cosmic Crisp January to early June and late September to October, Chile and New Zealand imports beyond Honeycrisp; Ambrosia rests on two consumer guides and is unrated June to early September, McIntosh May to August (it is `recommended: false`, so Today never names it); six eating-quality claims are one writer); pears (Bartlett late November to December, Bosc January to March and May to early September; Red Anjou, Red Bartlett, Packham, Forelle and Concorde claims in `content/evidence-drafts/`); mandarins (summer imports need a second source per variety, clementines February to May unrated, Gold Nugget only in May; Royal, satsuma, Sumo and Pixie claims in drafts); oranges (Cara Cara rated, in stores December to April per NC State Extension and Produce Market Guide; Chile navels have no claim; summer blood oranges rest on Sunkist alone); mangoes (no variety-named eating-quality claim, so variety windows are Medium at best; Tommy Atkins and Haden never rated, so late October reads Skip; traits wait for tropical anchors).
- **PLU gaps:** IFPS has no code of its own for Gold Nugget or Pixie, so their pages show none; W. Murcott shows only Tango's 3556.
- **Tools:** `.cache/runs.ts <item>`, `.cache/curves.ts <item> <variety> <window>`, `.cache/proposals.ts <item>`, `.cache/eval-why.ts [items]`, `.cache/eval-dips.ts`, and for re-rating `.cache/panel-rerate.mjs`, `.cache/apply-proposals.ts all`, `.cache/verdict-diff.mjs`. They hard-code the main checkout's root. In parallel sessions write `origin: us` explicitly on claims and run `npx biome format --write` on edited YAML.
- **Blocked to the fetcher:** calstrawberry.com and Blue Book (robots.txt); UC Davis fact sheets, The Packer, Produce Market Guide, Serious Eats, WSU, Arizona Extension, Good Fruit Grower, The Produce News, cosmiccrisp.com, AndNowUKnow (403); bestapples.com. Jared's Chrome may be used to read them.

## Art workflow

Each illustrator chat works in its own `art/staging/<NN>-<topic>/` folder (`art/PROMPT.md`) and lists Jared's approvals in its `handoff.json`. `npm run art:process` copies them into `art/masters/` and the manifest, keeping only each subject's newest approved revision. Candidate PNGs are gitignored; briefs are committed.

## Environment notes

- D1 database `orchard` exists with migrations 0001–0002 applied. `npm run db:migrate` prompts; from Claude's shell set `CI=true` first. GitHub remote is `jpeterson92/Orchard`.
- Node 26.13 LTS (Scoop). Wrangler is signed in (OAuth) to Jared's account; the GitHub CLI as jpeterson92.
- `npm run dev` has exited on start with a miniflare ECONNRESET. `npm run build` plus the `orchard-preview` launch config works; restart the preview server after each rebuild. A returning tab keeps the previous build's offline copy until its next launch.

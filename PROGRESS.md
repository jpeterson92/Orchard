# PROGRESS

Updated: 2026-11-19 · Phase: build · Live: https://orchard.jpeterson92.workers.dev (M0 placeholder) · 64 commits unsynced

## Milestones

- **Done:** M0 scaffold and deploy · M1 USDA probe · M2 schemas, verdict engine (P1, P10–P20), evidence pipeline, `usda:derive`, `content:report` · precalculated assessments in `generated/assessments/` (committed; `npm run check` and CI fail on drift) · model panel run `claude-opus-5-5-2026-11-17` (89 items, prompt v2; P15 panel-first) · M4 offline · M5 planning date and shared dates · M6 navigation, Browse, Calendar, search, Methods and Privacy pages · M8 measurement (web vitals and daily event counts in D1; shopper feedback removed by Jared).
- **M3:** built; closes with Jared's phone review, which needs a preview deploy.
- **M9:** slices 1–2 done (security headers, axe in light and dark, WebKit e2e, page titles). The rest waits on content, art, devices, the domain and the independent reviewer; check the security headers on the live URL (`curl -I`) after the next deploy.
- **M7 (variety guides): not started; after the re-rating.** Scales for apples, pears and citrus are approved; traits for 33 varieties are drafted. Fold unrated varieties (Red Delicious, Golden Delicious and the rest) out of the item page's "Varieties now" list into the guide, where they belong; today they make nine "Not rated" rows on the apples page.

## Next concrete action

Re-rate on the higher bar for Good (Jared, 2026-11-19): *fair* now means "you'll be happy with it", and merely fine half-months drop to *poor*. Update `content/panel/PROMPT.md` to the new definitions, re-run the panel for the 28 items, rebuild proposals, recheck the windows with reasons, and restate the evidence-reading defaults (harvest-chart edges, stored produce, imports in their own season read fair) on the new bar. Where round tomatoes fall to Skip in winter, a cherry-and-grape selection lifting to Good may be needed. Then M7. Review the re-rating through the diff of `generated/assessments/` (per-item YAML and `index.csv`).

## Content

- **28 of 30 first-release items drafted** (all `draft`). Left: collard greens and winter squash (Jared starts them from the desktop app; winter squash needs cited US fall origins), then the 24 Today summaries. Artichokes and collard greens came after `usda:derive`, so they use editorial origins; a rerun would make them USDA-backed.
- **Gaps needing sources** (Limited evidence today): sweet corn December to March (Mexico unrated), okra most of the year (Florida unrated; Honduras only November to May), grapes in May (Chile and Mexico), cherries February to March and late August to September, honeydew in May (Guatemala), nectarines in April (Chile), blackberries in late June and August (Mexico), pomegranates January to August (Israel has one source), persimmons March to August.
- **Per-item follow-ups:** apples (Cosmic Crisp January to early June and late September to October, Gala late July to early August, Chile and New Zealand imports beyond Honeycrisp, Ambrosia and McIntosh unrated; five eating-quality pages are one writer); pears (Bartlett May to July and late November to December, Bosc January to March and May to early September; Red Anjou, Red Bartlett, Packham, Forelle and Concorde claims in `content/evidence-drafts/`); mandarins (summer imports need a second source per variety, clementines February to May unrated, Gold Nugget only in May; Royal, satsuma, Sumo and Pixie claims in drafts); oranges (Chile navels have no claim; summer blood oranges rest on Sunkist alone; Cara Cara in drafts); mangoes (no variety-named eating-quality claim, so variety windows are Medium at best; Tommy Atkins and Haden never rated, so late October reads Skip; traits wait for tropical anchors).
- **Tools:** `.cache/runs.ts <item>`, `.cache/curves.ts <item> <variety> <window>`, `.cache/proposals.ts <item>`, `.cache/eval-why.ts [items]` (verdict, reasons and typical origins per window) and `.cache/eval-dips.ts` (Peak windows blocked by a poor origin). They hard-code the main checkout's root. In parallel sessions write `origin: us` explicitly on claims and run `npx biome format --write` on edited YAML.
- **Blocked to the fetcher:** calstrawberry.com and Blue Book (robots.txt); UC Davis fact sheets, The Packer, Produce Market Guide, Serious Eats, WSU, Arizona Extension, Good Fruit Grower, The Produce News, cosmiccrisp.com, AndNowUKnow (403); bestapples.com. Jared's Chrome may be used to read them.

## Art

When Jared's batch 1 masters land in `art/masters/`, run `npm run art:process`, show Jared the contact sheet, and record approvals in `art/manifest.json` (rejects get a §2 F revision prompt in batch 2).

## Blocking (needs Jared)

None.

## For Jared (non-blocking)

Applied 2026-11-19 (Jared's decisions): a level counts when origins at it are reasonably likely on the shelf, about a third of typical supply or cited as commonly in stores (P20, replacing P9 and P17); the card names what to look for only when at most three quarters qualifies (the Check the label tag is gone); Best right now lists every Peak item, soonest-ending first, and Good buys only Good items. Earlier: out of season reads Skip (P18), one Peak season a year (P19), Today shows only Peak and seasonal Good items.

- Worth a glance: late-November Today holds 8 Peak and 4 Good items. Apples and pears name their varieties; Brussels sprouts drop the caveat (Mexico 17%); cantaloupe reads Good with "Look for ones from Arizona"; sweet corn "Look for ones from Florida and Georgia". Early July lists 16 Peak items. Raspberries gain June Peak and cantaloupe May Good under the one-third rule.
- Earlier questions still open: (1) P14 reads one shipper's or state's chart as the whole origin's, so its other months read poor where other sources say supply continues (Mexican watermelon, Honduran okra, Georgia's fall okra); (2) the panel's low-confidence ranges are dropped, which leaves Mexico (sweet corn, okra) and Florida (okra) unrated; (3) `purchaseRank`: one pass over all 30 from one source would settle it, say which source; (4) P1 at 75%: revisit as more items are drafted.

To do when convenient:

- Approve or edit the Methods and Privacy drafts (`content/methods.md`, `content/privacy.md`); production deploys refuse drafts.
- Art batch 1: paste the 13 prompts in `art/requests/batch-1.md` into one ChatGPT conversation (square, transparent background) and save each as `art/masters/<asset id>.png`.
- Preview deploy for the M3 phone review, when you want it. It also creates a free D1 database `orchard` for the speed counts (then `npm run db:migrate`).
- Recruit the independent reviewer Gate 1 needs (a person; product spec §12).
- Model panel runs from other providers: follow `content/panel/README.md`, then ask Claude to review the run.
- Review the 28 drafts in `content:report` (`npm run content:report > .cache/content-report.txt`) and the variety traits.

## Environment notes

- Node 26.13 LTS (Scoop). Wrangler is signed in (OAuth) to Jared's account; the GitHub CLI as jpeterson92.
- 2026-11-19: `npm run dev` exited twice on start with a miniflare ECONNRESET. `npm run build` plus the `orchard-preview` launch config works; restart the preview server after each rebuild, or new asset hashes 404.

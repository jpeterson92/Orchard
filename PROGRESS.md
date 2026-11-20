# PROGRESS

Updated: 2026-11-20 · Phase: build · Live: https://orchard.jpeterson92.workers.dev (M0 placeholder) · 13 commits unsynced

## Milestones

- **Done:** M0 scaffold and deploy · M1 USDA probe · M2 schemas, verdict engine (P1, P10–P20), evidence pipeline, `usda:derive`, `content:report`, precalculated assessments in `generated/assessments/` (CI fails on drift) · model panel run `claude-opus-5-5-2026-11-19` (prompt v3) · M4 offline · M5 planning date and shared dates · M6 navigation, Browse, Calendar, search, Methods and Privacy · M8 measurement (web vitals and daily event counts in D1).
- **M3:** built; closes with Jared's phone review, which needs a preview deploy.
- **M7 variety guides:** built (finder, variety pages, PLU numbers, apple overall rating, "What matters" leads); closes with Jared's review of the three leads.
- **M9:** slices 1–2 done (security headers, axe in light and dark, WebKit e2e, page titles). The rest waits on devices, the domain and the independent reviewer; check the security headers on the live URL (`curl -I`) after the next deploy.
- **Content:** all 30 first-release items drafted, and the 24 Today summaries reviewed.
- **Art:** all 30 items and 43 varieties have approved art in the app (73 paintings).

## Task list

Claude, in order:

1. **Per-item content follow-ups, apples first** (Content below). First run `node .cache/panel-missing.mjs`: it lists panel-rated origins an item file lacks. Fix the 27 `evidence:check` rejections only when working on that item; links are rechecked only at the yearly refresh (`evidence:check -- --urls`).
2. **Draft the remaining items on the 89-item list** (engineering plan §5 order: by `purchaseRank`, always-good items last). Each new item record brings in its approved painting: rename `provisional-<item>-thumbnail-vN.png` in its staging folder to the catalog ID, add it to that folder's `handoff.json`, and run `npm run art:process`. Approved paintings are waiting for 50 of these items (staging folders 11–18 and 20).
3. **Take in repaints as Jared approves them:** `npm run art:process`, a phone-width look, and a commit.

Jared:

- **Art review:** approve or reject bell peppers, cucumbers and summer squash (`art/staging/19-squash-fruiting-vegetables/step-1-review.png`, or in the illustrator chat). The illustrator's handoff for them waits on their item records.
- **Repaints:** start the illustrator on `art/staging/21-repaints/README.md`: 12 repaints in four batches of three (blackberries, Keitt mango, Red Bartlett; Clementine, Satsuma, Pixie; Gala, nectarine, grapefruit; kiwifruit, papaya, iceberg). The current versions stay in the app until each repaint is approved. Folder 19 also has first passes still to paint (mini sweet and hot peppers, eggplant and others).
- Guide leads (`content/guides.yaml`, `draft`, atop each guide): approve or rewrite.
- Methods and Privacy drafts (`content/methods.md`, `content/privacy.md`): approve or edit.
- Preview deploy for the M3 phone review, when you want it (it also creates the free D1 database `orchard`; then `npm run db:migrate`).
- Recruit the independent reviewer Gate 1 needs (product spec §12).
- Review the drafts in `content:report` (`npm run content:report > .cache/content-report.txt`) and the variety traits.
- Optional: model panel runs from other providers (`content/panel/README.md`).

## Open questions (Jared)

1. P14 reads one shipper's or state's chart as the whole origin's, so its other months read poor where other sources say supply continues (Mexican watermelon, Honduran okra, Georgia's fall okra, Chile's persimmons in June and July).
2. The panel's low-confidence ranges are dropped, which leaves some origins unrated (Florida okra in midwinter).
3. `purchaseRank`: one pass over all items from one source would settle it (collard greens 55 and winter squash 33 are placeholders); say which source.
4. P1 at 75%: revisit as more items are drafted.
5. Pomegranates: most US-bound Argentine fruit in the sources is aril or processing grade, with one importer selling it whole. Drop Argentina from June, so late June reads Skip?
6. "Can't find it? Try…" picks up to two same-item varieties by trait distance (Honeycrisp → SweeTango, Jazz). Keep it automatic, or curate by hand? Also say if any finder chip name in `content/guides.yaml` should read differently.

## Content

- **Gaps needing sources** (Limited evidence today): pomegranates late June (Argentina).
- **Per-item follow-ups:** apples (Cosmic Crisp January to early June and late September to October, Gala late July to early August, Chile and New Zealand imports beyond Honeycrisp, Ambrosia and McIntosh unrated; five eating-quality pages are one writer); pears (Bartlett May to July and late November to December, Bosc January to March and May to early September; Red Anjou, Red Bartlett, Packham, Forelle and Concorde claims in `content/evidence-drafts/`); mandarins (summer imports need a second source per variety, clementines February to May unrated, Gold Nugget only in May; Royal, satsuma, Sumo and Pixie claims in drafts); oranges (Chile navels have no claim; summer blood oranges rest on Sunkist alone); mangoes (no variety-named eating-quality claim, so variety windows are Medium at best; Tommy Atkins and Haden never rated, so late October reads Skip; traits wait for tropical anchors).
- **PLU gaps:** IFPS has no code of its own for Gold Nugget or Pixie, so their pages show none; W. Murcott shows only Tango's 3556.
- **Tools:** `.cache/runs.ts <item>`, `.cache/curves.ts <item> <variety> <window>`, `.cache/proposals.ts <item>`, `.cache/eval-why.ts [items]`, `.cache/eval-dips.ts`, and for re-rating `.cache/panel-rerate.mjs`, `.cache/apply-proposals.ts all`, `.cache/verdict-diff.mjs`. They hard-code the main checkout's root. In parallel sessions write `origin: us` explicitly on claims and run `npx biome format --write` on edited YAML.
- **Blocked to the fetcher:** calstrawberry.com and Blue Book (robots.txt); UC Davis fact sheets, The Packer, Produce Market Guide, Serious Eats, WSU, Arizona Extension, Good Fruit Grower, The Produce News, cosmiccrisp.com, AndNowUKnow (403); bestapples.com. Jared's Chrome may be used to read them.

## Art workflow

Each illustrator chat works in its own `art/staging/<NN>-<topic>/` folder (`art/PROMPT.md`) and lists Jared's approvals in its `handoff.json`. `npm run art:process` copies them into `art/masters/` and the manifest, keeping only each subject's newest approved revision. Candidate PNGs are gitignored; briefs are committed. Gala, Clementine, Satsuma, Pixie, nectarine and grapefruit masters are rescaled stopgaps until their repaints land.

## Environment notes

- Node 26.13 LTS (Scoop). Wrangler is signed in (OAuth) to Jared's account; the GitHub CLI as jpeterson92.
- `npm run dev` has exited on start with a miniflare ECONNRESET. `npm run build` plus the `orchard-preview` launch config works; restart the preview server after each rebuild. A returning tab keeps the previous build's offline copy until its next launch.

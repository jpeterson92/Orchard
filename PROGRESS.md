# PROGRESS

Updated: 2026-11-17 · Phase: build · Live: https://orchard.jpeterson92.workers.dev (M0 placeholder)

## Milestones

M0 scaffold and deploy: done · M1 USDA probe: done · M2 schemas and engine: slices 1 (reference-data coverage), 2 (schemas and `data:build`), 3 (verdict engine and Today grouping) 4 (evidence schema, source tiers, the P12 combiner, `data:build` evidence checks, evidence confidence and rated varieties in the engine inputs) 5 (evidence pipeline: `data/source-registry.yaml`, `evidence:fetch` with excerpts, the `item-months` chart parser and a prose worklist, `evidence:check`) done, plus the methodology review: P14 availability reading, cited traits (`shipsWell`, `storesWell`, `peakWorthSeeking`), Peak needing no poor typical origin, High confidence needing a taste source, a per-origin supply index, shortest-Peak-first on Today, and the verdict strip and surprises in `content:report`, and P9's deciding origin with the Check the label marker; slice 6a (`usda:derive`: typical origins with `major` and the per-origin supply index for 49 USDA-backed items, and the P9 minor-origin check), 6b (variety calendar for the 6 items rated by variety; rated varieties read in-store months through `quotedAs`, P13), 6c (editorial `typicalOrigins` in item files: schema, `data:build` checks, and the engine reads them in place of USDA's), 7 (`content:report` review-first list of departing and Low-confidence windows, and per origin or variety strips of the editorial rating, proposal, confidence and each source's curve) done · model panel: prompt, `panel:check` and the first run (`claude-opus-5-5-2026-11-17`, all 89 items, prompt v2) done; P15 confirmed, not built · M3–M9: not started

## Next concrete action

Content batch 1 (apples, pears, strawberries, broccoli, mandarins; apples, pears and mandarins rated by variety; mangoes, avocados and oranges follow in batch 2), researched through the evidence pipeline; each item gets cited `shipsWell`, `storesWell` and `peakWorthSeeking` (varieties may override `storesWell`, e.g. Cosmic Crisp), and Jared checks each item in `content:report`. Batch 1 evidence is drafted in `content/evidence-drafts/` (30 claims, all passing `evidence:check`): Washington apple varieties (harvest months), Bosc and Starkrimson pears, California and Florida strawberries, and California mandarin varieties (Sunkist months, plus one guide's taste notes on satsuma, Sumo, Gold Nugget and Pixie). Next: write the item files one or two per run (strawberries and mandarins first), moving each item's evidence into `content/evidence/` with it; then `content:report` for Jared. Gaps that will show as Limited evidence or Low confidence: no claims yet for Mexican strawberries, any broccoli origin beyond Mississippi and Pennsylvania charts, Anjou or Bartlett pears, Argentine pears, Tango or Clementine taste; each apple variety rests on one grower's harvest month. Blocked to the fetcher: calstrawberry.com and Blue Book (robots.txt), The Packer, Produce Market Guide, Serious Eats and WSU (403); Jared's Chrome may be used to read them.

## Blocking (needs Jared)

- **IFPS PLU list reuse** (blocks PLU codes only, needed by M5): ask IFPS (ifpsglobal.com) whether Orchard may bundle the exported PLU list in a free app. Their site has a liability disclaimer but no license.

## Open questions for Jared (non-blocking)

- **Review the first `usda:derive` output** (`data/usda/*.csv`; readable month tables in `.cache/usda/derive-report.md`): which 49 items are USDA-backed, the 4 dropped lump sums, and the variety calendar (`data/usda/variety-calendar.csv`).
- **Build P15** (engineering plan §4.3) into `evidence.ts`, `data:build` and `content:report`, then ask Jared to collect runs from other providers' models with `content/panel/PROMPT.md`.
- **Avocados rated by variety?** The panel finds Hass steady most of the year and never clearly at a peak, so rating by variety may add little. Decide when avocados are drafted (batch 2).
- Confirm or adjust the provisional methodology defaults P1, P9, P10, P11, P12 (quality curves: weights, rating cut-offs and confidence cut-offs), P13 (which varieties count as in stores, and how the card names them) and the Last call trigger (engineering plan §4.3). The 15-month freshness limit is confirmed.
- Engine tie-break (proposed): for items rated by variety, Skip outranks Limited evidence when picking the best variety, and an outlook turning to Limited evidence doesn't trigger Last call. Say if either should differ.
- M8 feedback flags: what share of "Disappointing" or "Looked poor" answers, over how many responses, should flag a window for review? Needed by M8.
- Illustrations at launch: must all 89 items and ~30 rated varieties have art, or may some launch with the transparent placeholder used in development? Needed by M9.
- Launch gates: needed by M9.
- In-app brand name: Orchard, or something else? Needed by M9.

## Environment notes

- Node 26.13 LTS (Scoop). Wrangler is signed in (OAuth) to Jared's account. The GitHub CLI is signed in as jpeterson92.

# PROGRESS

Updated: 2026-11-17 · Phase: build · Live: https://orchard.jpeterson92.workers.dev (M0 placeholder)

## Milestones

M0 scaffold and deploy: done · M1 USDA probe: done · M2 schemas and engine: slices 1 (reference-data coverage), 2 (schemas and `data:build`), 3 (verdict engine and Today grouping) 4 (evidence schema, source tiers, the P12 combiner, `data:build` evidence checks, evidence confidence and rated varieties in the engine inputs) and 5 (evidence pipeline: `data/source-registry.yaml`, `evidence:fetch` with excerpts, the `item-months` chart parser and a prose worklist, `evidence:check`) done · M3–M9: not started

## Next concrete action

M2 slice 6, `usda-derive` writes `data/usda/typical-origins.csv` and `supply-index.csv` (per origin, against its own season: P11) for the 89 items (reusing `scripts/usda-lib.ts`; run on demand, Jared reviews the diff), plus `variety-calendar.csv`, which fills rated varieties' `inStore` months (until then `verdict/inputs.ts` counts no variety as in stores, so items rated by variety read Limited evidence), plus the item files' editorial `typicalOrigins` in the schema and `verdict/inputs.ts`. Slice 7, `content:report` shows per item and origin or variety each source's curve, the proposal with its confidence strip and the editorial rating, Low-confidence and departing windows first (unrated-window counts should include rated varieties). Then content batch 1 (apples, pears, strawberries, broccoli, mandarins; apples, pears and mandarins rated by variety; mangoes, avocados and oranges follow in batch 2), researched through the evidence pipeline; each item gets editorial `shipsWell`, `storesWell` and `peakWorthSeeking` (varieties may override `storesWell`, e.g. Cosmic Crisp). Batch 1 first extends the registry (Jared's Chrome may be used to read pages; robots.txt still governs `evidence:fetch`): today it has 2 state harvest charts (Mississippi, Pennsylvania) and 3 prose pages, none yet for the main supermarket origins (Washington apples and pears, California strawberries, broccoli and mandarins, Mexico) or a mainstream food guide. SNAP-Ed's seasonal guide no longer resolves, and Florida's Crops in Season page disallows bots in robots.txt.

## Blocking (needs Jared)

- **IFPS PLU list reuse** (blocks PLU codes only, needed by M5): ask IFPS (ifpsglobal.com) whether Orchard may bundle the exported PLU list in a free app. Their site has a liability disclaimer but no license.

## Open questions for Jared (non-blocking)

- Confirm or adjust the provisional methodology defaults P1, P9, P10, P11, P12 (quality curves: weights, rating cut-offs and confidence cut-offs), P13 (which varieties count as in stores, and how the card names them) and the Last call trigger (engineering plan §4.3). The 15-month freshness limit is confirmed.
- Engine tie-break (proposed): for items rated by variety, Skip outranks Limited evidence when picking the best variety, and an outlook turning to Limited evidence doesn't trigger Last call. Say if either should differ.
- Illustrations at launch: must all 89 items and ~30 rated varieties have art, or may some launch with the transparent placeholder used in development? Needed by M9.
- Launch gates: needed by M9.
- In-app brand name: Orchard, or something else? Needed by M9.

## Environment notes

- Node 26.13 LTS (Scoop). Wrangler is signed in (OAuth) to Jared's account. The GitHub CLI is signed in as jpeterson92.

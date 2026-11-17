# PROGRESS

Updated: 2026-11-17 · Phase: build · Live: https://orchard.jpeterson92.workers.dev (M0 placeholder)

## Milestones

M0 scaffold and deploy: done · M1 USDA probe: done · M2 schemas and engine: slices 1 (reference-data coverage), 2 (schemas and `data:build`) and 3 (verdict engine and Today grouping) done · M3–M9: not started

## Next concrete action

M2 slice 4: seasonal evidence (source `tier` and `basedOn`, `content/evidence/` schema, the P12 quality-curve combiner in `src/shared/evidence.ts` with table-driven and property tests, and `data:build` checks: 2 independent sources per rated window, a `reason` on departing or Low-confidence windows; item windows drop their own `sources`; varieties gain quality windows and claims may name a variety; `verdict/inputs.ts` then fills each series's P12 `evidence` confidence and builds rated varieties, which it leaves empty today). Slice 5, the evidence pipeline (engineering plan content track): `data/source-registry.yaml` for the batch 1 items, `evidence:fetch` with excerpts and one structured parser, `evidence:check`. Slice 6, `usda-derive` writes `data/usda/typical-origins.csv` and `supply-index.csv` for the 89 items (reusing `scripts/usda-lib.ts`; run on demand, Jared reviews the diff), plus the item files' editorial `typicalOrigins` in the schema and `verdict/inputs.ts`. Then content batch 1 (apples, pears, strawberries, broccoli, mandarins; apples, pears and mandarins rated by variety; mangoes, avocados and oranges follow in batch 2), researched through the evidence pipeline.

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

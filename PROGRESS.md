# PROGRESS

Updated: 2026-11-17 · Phase: build · Live: https://orchard.jpeterson92.workers.dev (M0 placeholder)

## Milestones

M0 scaffold and deploy: done · M1 USDA probe: done · M2 schemas and engine: slices 1 (reference-data coverage) and 2 (schemas and `data:build`) done · M3–M9: not started

## Next concrete action

M2 slice 3: the verdict engine in `src/shared/verdict/` (rules 1–5, markers, P10 confidence, `byOrigin`, `byVariety` with the P13 Varies by variety rule, Today grouping in `src/shared/today.ts`), with a table-driven case per rule and precedence pair plus property tests. Then `data:build` lists items whose `alwaysGood` field disagrees with the typical outlook.

After that: slice 4, seasonal evidence (source `tier` and `basedOn`, `content/evidence/` schema, the P12 quality-curve combiner in `src/shared/evidence.ts` with table-driven and property tests, and `data:build` checks: 2 independent sources per rated window, a `reason` on departing or Low-confidence windows; item windows drop their own `sources`; varieties gain quality windows and claims may name a variety). Slice 5, the evidence pipeline (engineering plan content track): `data/source-registry.yaml` for the batch 1 items, `evidence:fetch` with excerpts and one structured parser, `evidence:check`. Slice 6, `usda-derive` writes `data/usda/typical-origins.csv` and `supply-index.csv` for the 89 items (reusing `scripts/usda-lib.ts`; run on demand, Jared reviews the diff). Then content batch 1 (apples, pears, strawberries, broccoli, mandarins; apples, pears and mandarins rated by variety), researched through the evidence pipeline.

## Blocking (needs Jared)

- **IFPS PLU list reuse** (blocks PLU codes only, needed by M5): ask IFPS (ifpsglobal.com) whether Orchard may bundle the exported PLU list in a free app. Their site has a liability disclaimer but no license.

## Open questions for Jared (non-blocking)

- Confirm or adjust the provisional methodology defaults P1, P9, P10, P11, P12 (quality curves: weights, rating cut-offs and confidence cut-offs), P13 (which varieties count as in stores, and when an item shows Varies by variety) and the Last call trigger (engineering plan §4.3). The 15-month freshness limit is confirmed.
- Launch gates: needed by M9.
- In-app brand name: Orchard, or something else? Needed by M9.

## Environment notes

- Node 26.13 LTS (Scoop). Wrangler is signed in (OAuth) to Jared's account. The GitHub CLI is signed in as jpeterson92.
- Python 3.12 and uv 0.13 are available (optional notebooks only).

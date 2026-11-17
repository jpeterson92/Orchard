# PROGRESS

Updated: 2026-11-17 · Phase: build · Live: https://orchard.jpeterson92.workers.dev (M0 placeholder)

## Milestones

M0 scaffold and deploy: done · M1 USDA probe: done · M2 schemas and engine: slice 1 (reference-data coverage, `docs/data/usda.md`) done · M3–M9: not started

## Next concrete action

M2 slice 2: zod schemas and `data:build` for items, sources, rules, advisories, typical origins and the supply index, with one broken-input fixture per check. Schemas carry item categories and types for the 89 launch items; always good is derived, not stored. Then the engine with its tests, then content batch 1 (apples, pears, strawberries, broccoli, mandarins).

## Blocking (needs Jared)

- **IFPS PLU list reuse** (blocks PLU codes only, needed by M5): ask IFPS (ifpsglobal.com) whether Orchard may bundle the exported PLU list in a free app. Their site has a liability disclaimer but no license.

## Open questions for Jared (non-blocking)

- Confirm or adjust the provisional methodology defaults P1, P9, P10, P11 and the Last call trigger (engineering plan §4.3), including P10's freshness limit of 15 months for the yearly supply snapshot.
- Launch gates: needed by M9.
- In-app brand name: Orchard, or something else? Needed by M9.

## Environment notes

- Node 26.13 LTS (Scoop). Wrangler is signed in (OAuth) to Jared's account. The GitHub CLI is signed in as jpeterson92.
- Python 3.12 and uv 0.13 are available (optional notebooks only).

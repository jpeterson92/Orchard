# PROGRESS

Updated: 2026-11-16 · Phase: build · Current milestone: M0 (scaffold and deploy)

## Next concrete action

M0 (engineering plan §5): scaffold the Vite + React + TypeScript app and Worker with the Cloudflare Vite plugin, and add Tailwind, Biome, Vitest, Playwright and the CI workflow. Deploy a placeholder page once Cloudflare is available. M1 (USDA probe) is unblocked: the key is in `.env` (gitignored) and returned the report list (1,051 reports) on 2026-11-16.

## Blocking (needs Jared)

- **`wrangler login` on this machine** (OAuth; not the global API key). Blocks the M0 deploy step only.

## Decisions

- 2026-11-16 · D1 · Efficient shipping: one TypeScript codebase on mature tools, data bundled with the app, one Worker plus D1 · fastest reliable path for AI implementation (review §1.4–1.5)
- 2026-11-16 · D2 · National verdicts; the state adds regional advisories and context; local harvest, harvest zones and precise location deferred · the rules make verdicts national anyway (review §1.1)
- 2026-11-16 · D3 · Claude drafts editorial data with checked citations; Jared approves; production refuses drafts · content is the critical path (review §1.2)

## Open questions for Jared (non-blocking)

- Confirm or adjust the provisional methodology defaults P1, P9, P10, P11 and the Last call trigger (engineering plan §4.3).
- D4, launch gates: needed by M9.
- In-app brand name: Orchard, or something else? Needed by M9.

## Done

- 2026-11-16 Pre-build review; repository and docs reorganized; design system split (v1.3 adds Skip and Limited evidence tokens); lean engineering plan written; old engineering spec and implementation guide archived; D2 and D3 applied to the product spec.

## Environment notes

- Node 26.13 LTS is installed via Scoop, but an old Node 20 in `C:/Program Files/nodejs` shadows it on PATH until Jared uninstalls it. Wrangler needs Node ≥ 22.12 and comes in as a dev dependency.
- Python 3.12 and uv 0.13 are available (optional notebooks only). The GitHub CLI is signed in as jpeterson92.

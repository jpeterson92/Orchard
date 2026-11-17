# PROGRESS

Updated: 2026-11-16 · Phase: build · Current milestone: M0 (scaffold and deploy)

## Next concrete action

M0 is done except the first deploy, which waits on Jared registering a workers.dev subdomain (below). Then run `npm run deploy` and open the URL on a phone. Next: M1 (USDA probe; key in `.env.pipeline`) and M2 (content schemas and verdict engine).

## Blocking (needs Jared)

- **workers.dev subdomain.** `orchard` is taken. Register one in the Cloudflare dashboard (Workers & Pages, then the onboarding prompt). The app URL becomes `orchard.<subdomain>.workers.dev`.

## Decisions

- 2026-11-16 · D1 · Efficient shipping: one TypeScript codebase on mature tools, data bundled with the app, one Worker plus D1 · fastest reliable path for AI implementation (review §1.4–1.5)
- 2026-11-16 · D2 · National verdicts; the state adds regional advisories and context; local harvest, harvest zones and precise location deferred · the rules make verdicts national anyway (review §1.1)
- 2026-11-16 · D3 · Claude drafts editorial data with checked citations; Jared approves; production refuses drafts · content is the critical path (review §1.2)
- 2026-11-16 · D5 · Base UI is the component library, installed at the first control that needs it (filter chips or accordion in M3 at the earliest) · headless, accessible, works with Tailwind tokens; avoids a mid-milestone library comparison
- 2026-11-16 · D6 · Prerender with React Router library mode plus `scripts/prerender.ts` (renderToString per route, about 40 lines), not framework mode · proven end to end in M0; framework mode with the Cloudflare plugin would have been an unverified combination

## Open questions for Jared (non-blocking)

- Confirm or adjust the provisional methodology defaults P1, P9, P10, P11 and the Last call trigger (engineering plan §4.3).
- D4, launch gates: needed by M9.
- In-app brand name: Orchard, or something else? Needed by M9.

## Done

- 2026-11-16 M0 scaffold: Vite 8, React 19.3 with React Compiler, React Router 8, Tailwind 4.3 tokens, Hono Worker, Biome, Vitest 4, Playwright with axe, CI on GitHub Actions. Checks: typecheck, lint, 7 unit tests and 3 e2e smoke tests passing (prerendered HTML, hydration with no errors or axe violations, `/api/health`). Initial JS is 99 KB gzip (budget 120 KB).
- 2026-11-16 Pre-build review; repository and docs reorganized; design system split (v1.3 adds Skip and Limited evidence tokens); lean engineering plan written; old engineering spec and implementation guide archived; D2 and D3 applied to the product spec.

## Environment notes

- Node 26.13 LTS (Scoop) is active; the old Node 20 was removed. Wrangler is signed in (OAuth) to Jared's account.
- Python 3.12 and uv 0.13 are available (optional notebooks only). The GitHub CLI is signed in as jpeterson92.

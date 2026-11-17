# PROGRESS

Updated: 2026-11-17 · Phase: build · Current milestone: M2 (content schemas and verdict engine)

## Next concrete action

M2 slice 1 is done: USDA coverage for 57 launch candidates and a terminal-market variety calendar (`docs/data/usda-probe.md`). Next: M2 slice 2, the zod schemas and `data:build` (item, sources, rules, advisories, typical origins, supply index), with one broken-input fixture per check. Then the engine with its tests, then content batch 1 (apples, pears, strawberries, broccoli, mandarins). The schemas must carry the always-good class (derived) and item categories for ~100 items.

## Blocking (needs Jared)

- **IFPS PLU list reuse** (blocks PLU codes only, needed by M5): ask IFPS (ifpsglobal.com) whether Orchard may bundle the exported PLU list in a free app. Their site has a liability disclaimer but no license.

## Decisions

- 2026-11-16 · D1 · Efficient shipping: one TypeScript codebase on mature tools, data bundled with the app, one Worker plus D1 · fastest reliable path for AI implementation (review §1.4–1.5)
- 2026-11-16 · D2 · National verdicts; the state adds regional advisories and context; local harvest, harvest zones and precise location deferred · the rules make verdicts national anyway (review §1.1)
- 2026-11-16 · D3 · Claude drafts editorial data with checked citations; Jared approves; production refuses drafts · content is the critical path (review §1.2)
- 2026-11-16 · D5 · Base UI is the component library, installed at the first control that needs it (filter chips or accordion in M3 at the earliest) · headless, accessible, works with Tailwind tokens; avoids a mid-milestone library comparison
- 2026-11-16 · D6 · Prerender with React Router library mode plus `scripts/prerender.ts` (renderToString per route, about 40 lines), not framework mode · proven end to end in M0; framework mode with the Cloudflare plugin would have been an unverified combination
- 2026-11-16 · D7 · Jared generates all artwork in ChatGPT from prompts Claude writes; Claude processes and checks the files, and Jared approves them (engineering plan §5, art track; workflow built in M3) · ChatGPT made the design language and the mockups, and Jared already has the subscription
- 2026-11-17 · D8 · USDA movement data is reference data: typical origins and the supply index come from a 3-year snapshot rebuilt once a year and reviewed with the content. No monthly refresh; Today uses the typical index, and advisories cover unusual seasons. Items without usable USDA data (domestic citrus) get cited editorial origins and a null index · the probe showed the data is stable year to year, and a live feed risks silent verdict changes when USDA reporting changes
$1- 2026-11-17 · D10 · Launch scope is all common supermarket produce: 89 items (list in `docs/data/usda-probe.md`). Summer and winter squash are one item each with types; herbs are one always-good item with the common herbs as types; broccoli rabe and rhubarb added. Always good = typical outlook Good in all 24 windows, never Peak or Skip (computed for now; editorial override possible after release); such items stay off Today unless an advisory applies. Illustrations go seasonal items first, then always-good, each by `purchaseRank` · Jared's call; always-good items need lighter content

## Open questions for Jared (non-blocking)

- Confirm or adjust the provisional methodology defaults P1, P9, P10, P11 and the Last call trigger (engineering plan §4.3).
- D4, launch gates: needed by M9.
- In-app brand name: Orchard, or something else? Needed by M9.

## Done

- 2026-11-17 M2 slice 1, reference-data coverage: 57 candidates probed. 44 are USDA-backed (domestic plus imports, or imports that dominate); 11 need editorial origins (California and Florida tree crops stopped reporting in 2025; carrots, garlic, mushrooms and butternut were never reported); apricots and basil have too little data. The API needs quoted names when they contain a comma. Terminal-market variety calendar gives clear seasons for pears and citrus and still shows California citrus origins; apples are on offer all year (cold storage), so apple "freshest months" need citations. Checks: 12 unit tests in `usda-lib.test.ts`.
- 2026-11-17 M1 USDA probe: Market News movement data (national imports report plus 16 office reports for domestic shipments) gives typical origins and the P11 supply index for apples, pears, strawberries and broccoli over 36 months. Mandarins fail on domestic data. No regional arrival volumes exist. `scripts/usda-lib.ts` is reusable for M2 (11 unit tests). Live site at https://orchard.jpeterson92.workers.dev.
- 2026-11-16 M0 scaffold: Vite 8, React 19.3 with React Compiler, React Router 8, Tailwind 4.3 tokens, Hono Worker, Biome, Vitest 4, Playwright with axe, CI on GitHub Actions. Checks: typecheck, lint, 7 unit tests and 3 e2e smoke tests passing (prerendered HTML, hydration with no errors or axe violations, `/api/health`). Initial JS is 99 KB gzip (budget 120 KB).
- 2026-11-16 Pre-build review; repository and docs reorganized; design system split (v1.3 adds Skip and Limited evidence tokens); lean engineering plan written; old engineering spec and implementation guide archived; D2 and D3 applied to the product spec.

## Environment notes

- Node 26.13 LTS (Scoop) is active; the old Node 20 was removed. Wrangler is signed in (OAuth) to Jared's account.
- Python 3.12 and uv 0.13 are available (optional notebooks only). The GitHub CLI is signed in as jpeterson92.

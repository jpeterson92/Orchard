# Orchard — Engineering Plan

Nov 16, 2026 · Replaces the engineering spec and implementation guide (now in `docs/archive/`), per decisions D1–D3.

The product spec says *what* to build and the design system says *how it looks*. This plan covers how it's built, in what order, and how much verification each part gets. Where it is silent, pick the conventional option, note it in one line in `PROGRESS.md`, and move on.

## 1. Shape of the system

Orchard is a static, offline-capable web app plus one small Cloudflare Worker. **The data ships inside the app build**, so a deploy *is* a data release. Code and data can never disagree, the service worker's precache is the offline copy, and Cloudflare switches versions atomically.

```
content/ + data/  ──(npm run data:build: validate, derive)──>  src/generated/*.json
                                                                     │ bundled
browser ── first visit ──> Worker: serves static assets; injects approximate state into index.html
        <── service worker precaches app + all data ──  every covered item works offline
        ── /api/* (later): feedback, requests, events ──> Worker (Hono) ──> D1
```

- **The verdict engine runs on the phone.** It is a pure TypeScript module fed by the bundled inputs: quality windows, typical origins, supply index, advisories and rules. The inputs are tiny (about 2,400 ratings), so this costs microseconds. Running it on the phone gives exact-date advisories, the shopper's state, label-based advice and planning dates for free, and the same code runs in tests and scripts. One implementation, used everywhere.
- **Verdicts are national (D2).** The state adds regional advisories, the "Locally checked" label, the Alaska and Hawaii banner, and later the price region for value markers.
- **No server render.** First-visit location comes from the Worker writing `request.cf` state into `index.html` before it reaches the browser, so the first frame already knows the place, with no flash of the wrong verdict. Returning visits use the place saved on the phone. Today and every item page are **prerendered at build time** (verdicts are national, so one static page per route works), then hydrate; if the phone's window or an advisory for its state differs from the baked-in verdicts, the verdict region renders client-side before first paint. Rebuild at each half-month boundary: a scheduled GitHub Action once deploys run in CI; until then, the pre-paint check covers a stale build.

## 2. Stack

Mature, widely used tools only (D1). At scaffold time, take the newest release whose major version has been out for at least 3 months and is supported by the plugins listed here. Pin exact versions (`save-exact`).

| Concern | Choice | Notes |
| --- | --- | --- |
| Runtime | Node 26 LTS (installed via Scoop), npm | One package, no workspace. Scripts run with `tsx` |
| Language | TypeScript 5.x (`tsc --noEmit`) | Not the TS 7 native compiler until the ecosystem catches up |
| App | React 19, Vite, React Router | SPA with build-time prerendering (M3): React Router framework mode with `ssr: false` and `prerender` if it works with the Cloudflare Vite plugin (checked in M0); otherwise library mode plus a small post-build `react-dom/server` script. React Compiler on from M0. Search is an overlay, not a route |
| Styling | Tailwind CSS 4 | Design-system tokens as CSS variables in `@theme`; native `<dialog>` and hand-written disclosure buttons for simple cases. Adopt Base UI (headless and accessible; also the archived spec's choice) at the first complex control (popover, select, tabs, sortable table); never hand-build those |
| Offline | `vite-plugin-pwa` (Workbox) | Precache everything; activate updates on next launch |
| Worker | `@cloudflare/vite-plugin`, Wrangler, Hono (for `/api` routes) | Static assets with SPA fallback |
| Write store | D1, plain SQL migrations through Wrangler | Introduced in M8. No ORM unless queries grow |
| Validation and types | zod | One schema per content and data file; types come from `z.infer`. No code generation |
| Search | MiniSearch | Prefix and fuzzy matching over names, synonyms and misspellings |
| Lint and format | Biome | One tool, one config |
| Tests | Vitest, fast-check (property tests), Testing Library, Playwright + `@axe-core/playwright` | See §6 |
| CI | GitHub Actions on `ubuntu-latest` | Typecheck, lint, test, data build, app build |
| Hosting | Cloudflare Workers (static assets) on `workers.dev` until launch | Production domain added at M9 |

Python stays out of production. If Jared wants exploratory USDA notebooks, they live in `notebooks/` with their own uv environment, and nothing imports them.

## 3. Repository layout

```
CLAUDE.md  PROGRESS.md  README.md
package.json  tsconfig.json  vite.config.ts  wrangler.jsonc  biome.json  playwright.config.ts
content/
  items/<item-id>.yaml       one file per item: editorial copy, origins + quality windows, varieties, type notes
  summaries.yaml             24 national half-month Today summaries
  methods.md                 Methods page text
data/
  sources.yaml               every citation: id, title, publisher, url, accessed date
  rules.yaml                 rules version + thresholds (0.70, 0.8, 1.2, 20/24, 45 days)
  advisories.yaml            scoped, expiring exceptions
  usda/typical-origins.csv   derived from USDA (committed, with source + date header)
  usda/supply-index.csv      derived from USDA (committed)
  usda/variety-calendar.csv  derived from USDA terminal market reports (committed)
  plu.csv                    IFPS PLU codes → item and variety (only once IFPS confirms reuse)
  geo/states.csv             state, name, price region, locally checked
  geo/zip3-state.csv         ZIP prefix → state (used on the phone; no API call)
scripts/                     data-build.ts, usda-fetch.ts, usda-derive.ts, content-report.ts
src/
  shared/                    zod schemas, verdict engine, window math, place lookup. Imports nothing from app/ or worker/
  app/                       React app: routes, components, styles, service worker registration
  worker/                    Cloudflare Worker: HTML location injection, /api/*
  generated/                 data-build output (gitignored)
tests/e2e/                   Playwright smoke tests
docs/                        specs, design, decisions, reviews, archive
```

**One file per item** is deliberately also the unit of editorial review. `.cache/` holds raw USDA responses and is gitignored; derived CSVs are committed so builds never need the network.

## 4. Data and the verdict engine

### 4.1 Inputs (validated by `npm run data:build`)

- **Item** (`content/items/*.yaml`): id, names, synonyms, misspellings, category, `purchaseRank`, evidence basis (`supply+assessment` or `assessment-only`), card line, pick cues (3–5), avoid cues (1–2), store and ripen ranges with ripeness assumptions (storage temperature band, ethylene producer or sensitive, and storage life, cited to the UC Davis Postharvest Center fact sheets where they cover the item), prep, type notes. Also its origins, each with quality windows: half-month ranges rated `prime`, `fair` or `poor`, with at least 2 source IDs per range. Plus `status` (`draft` or `reviewed`), `reviewedOn` and `reviewer`. Word limits come from product spec §8.
- **Variety** (inside its item file, for the 3 guides): traits on the group's anchored 1–5 scales, best uses, label/PLU text, freshest months only where evidence exists.
- **Advisory:** items, optional origins, scope (states or price regions), `from` ≤ `to` ≤ `from` + 90 days, imposed verdict, note, `reviewedOn`, `status`.
- **Typical origins:** item × month → ranked origins covering at least 70% of reported volume (ranks only; never shown as shares). Where USDA doesn't report domestic supply (citrus), the item file lists cited editorial origins instead (D8).
- **Supply index:** item × month → value, or `null` with a reason (`no_data`, `no_baseline`, `not_reported`). Missing never becomes 0.
- **Variety calendar** (D9): item × variety × month → the share of USDA terminal market price quotes (11 cities, 3 years) naming that variety, and the origins quoted. Evidence of presence, not volume. It backs a variety's "freshest months" and cross-checks typical origins.
- **PLU codes** (D9, only once IFPS confirms reuse): PLU → item, variety, size, organic. Label-based advice accepts a sticker code as well as an origin.

`data:build` fails on any schema error, unknown ID, duplicate key, a range with fewer than 2 sources, an inverted or over-long advisory, or a NaN. With `--production` it also fails on any `draft` record. It writes compact JSON to `src/generated/` and prints a coverage report: items, origins rated, and windows without a rating.

### 4.2 Engine (`src/shared/verdict/`)

```ts
evaluate(item: ItemInputs, ctx: { date: PlainDate; state: StateId | null; mode: "today" | "typical"; labelOrigin?: OriginId }, rules: Rules): VerdictResult
// VerdictResult: verdict, ruleFired, reasons[], confidence, weakProperties[], markers[], labelNote, byOrigin
```

- **Rules 1–5 in product order, first match wins:** Limited evidence → Advisory → Skip → Peak (supply not thin) → Good.
- `mode: "typical"` (Calendar and planning dates) ignores advisories and uses the typical supply index for that month. `mode: "today"` uses the same typical supply index plus the advisories active on `date` for `state`. Under D8 supply data is a yearly snapshot, so the two modes differ only by advisories.
- **Markers:** Last call, Reliable year-round (Good or better in at least 20 of 24 windows), Advisory, and "Usually improves in…" (the next window rated Good or better).
- `byOrigin` re-runs the rules once per rated origin, for "What does the label say?"
- `windowIndex(date) = (month − 1) × 2 + (day > 15 ? 1 : 0)` lives in `src/shared/time.ts`, and nowhere else.
- **Always good** (D10) is derived, not written: an item whose typical outlook is Good in all 24 windows, with no Peak and no Skip.
- **Today grouping** (up to 6 Peak, sorted by confidence then `purchaseRank`, never padded; each seasonal item exactly once; always-good items left out unless an advisory changes their verdict today) is one pure function in `src/shared/today.ts`.

### 4.3 Provisional methodology (awaiting Jared's confirmation; never blocking)

Each lives in `rules.yaml` or a single function, so changing it is cheap.

- **P1 (rule 1):** Limited evidence unless *every* typical origin has a rating for the window.
- **P9:** when typical origins' ratings differ, the verdict follows the top-ranked origin. The "Depends on the label" note appears only when the top two differ by more than one level.
- **P10 (confidence):**
  - *coverage* is weak when rule 1 fired;
  - *relevance* is weak for assessment-only items;
  - *freshness* is weak when supply data is more than 45 days old, or an active advisory wasn't reviewed this window;
  - *agreement* is weak when the top origin is prime but supply is thin, or poor but supply is strong, or when the label note applies.
  - High = no weak property, Medium = one, Low = two or more.
- **P11:** the typical supply index for a month is that month's 3-year average ÷ the 36-month average.
- **Last call:** the verdict is Peak or Good and the typical outlook drops to a lower verdict within the next 2 windows.

## 5. Milestones

Each milestone takes 1–3 sessions and ends with something Jared can review. The content track runs alongside from M2 on.

| # | Milestone | Done when | Needs |
| --- | --- | --- | --- |
| M0 | **Scaffold and deploy.** Vite + React + TS app and Worker via the Cloudflare Vite plugin; Tailwind, React Compiler, Biome, Vitest, Playwright; CI; a placeholder page deployed; settle the prerender mechanism (§2) | The `workers.dev` URL opens on Jared's phone; CI is green | Cloudflare account; Jared runs `wrangler login` once |
| M1 | **USDA probe** (runs alongside M0–M3). Fetch movement data for 5 candidate items; write a one-page `docs/data/usda-probe.md` | Clear answers: which reports and fields, units, history depth, and whether typical origins (≥ 70%) and a supply index are computable. Also whether regional arrival data exists (for regional verdicts in v1.1). **If not computable, Jared decides the evidence fallback** | USDA API key |
| M2 | **Content schemas and the verdict engine.** Reference-data coverage across the launch candidates (which items USDA reports, typical origins, variety calendar from terminal markets); zod schemas, `data:build`, `rules.yaml`, `sources.yaml`, engine, Today grouping. 5 draft items (content batch 1) | Engine tests pass (§6). Jared reviews batch 1 through `npm run content:report`, a readable table of verdicts per window with citations | — |
| M3 | **Today and item page, styled.** Tokens from the design system, verdict marks, cards that expand in place, item page in product order, location and date chip (display), draft badge in previews; build-time prerendering of Today and item pages; the art workflow (art track below) with the first batch of thumbnails | **Jared's first real review on his phone** | — |
| M4 | **Offline and in-store mode.** Precache, readiness line, updates that activate on the next launch, in-store toggle (wake lock, 18 px type, high contrast, no motion, `persist()`) | E2E: after one visit, go offline and open an item never visited | — |
| M5 | **Place, date and advisories.** Worker HTML injection; ZIP entry → state on the phone; saved place; advisories by state and region; Alaska and Hawaii banner; "Locally checked"; planning date with the typical-outlook banner; "Share for this date"; label-based advice (origin, plus PLU code if licensed); recompute at midnight and on `visibilitychange` | Unit tests for place and window math; e2e for a pinned date and a changed ZIP | — |
| M6 | **Browse, search, Calendar, Methods.** Categories; MiniSearch with synonyms and misspellings; no-match flow; Calendar as a month list on phone and a heatmap with a table equivalent on wider screens; Methods and privacy pages; headless component library adopted here or in M5, whichever first needs a complex control | Every item reachable in ≤ 3 taps or one search; "scallion" and "corriander" find the right items | — |
| M7 | **Variety guides:** apples, mandarins & oranges, pears. Freshest months from the variety calendar plus citations; traits, finder, cards on phone, a sortable table on wider screens, variety pages | Jared reviews the 3 guides | Variety content |
| M8 | **Feedback and measurement.** D1 tables; feedback, taste, request and event endpoints; rate limiting; `web-vitals` + `verdict-visible` beacon; privacy-safe logging | A test proves no ZIP or IP reaches logs or D1; a feedback row records app version, date, state, item and origin | — |
| M9 | **Launch readiness.** All launch content reviewed, illustrations, Turnstile, CSP and security headers, axe plus a quick VoiceOver/TalkBack pass, a performance check on a mid-range Android, offline check on a real iPhone, production domain | Jared decides launch, using the D4 gates | Domain, devices, D4 |

**Content track.** Claude drafts in batches of about 10 items (5 in M2), each rating with at least 2 real, checked citations, all marked `draft`. Jared reviews in the preview app or the content report, and approves or edits. Approval means Claude sets `status: reviewed`, `reviewer`, and `reviewedOn`. Order: the 5 M2 items → the rest of the 89 launch items (D10), seasonal items first, always-good items last → variety guides → the 24 summaries → Methods text.

**Art track (D7).** Jared generates all painted artwork with his ChatGPT subscription, the same tool that made the design language and the mockups in `docs/design/references/`. Claude never generates images. The workflow is built in M3, when the first item art is needed, and then runs in batches alongside the content track:

Batches follow `purchaseRank` within two tiers: seasonal items first, then always-good items. So the most commonly bought seasonal produce is illustrated first.

1. **Request.** Claude writes a batch file `art/requests/batch-N.md`. It holds one block per asset: the asset ID (`persimmon-fuyu-thumbnail-v1`, per the illustration guide), its class and display size, a ready-to-paste prompt assembled from illustration guide §8, the botanical checks, and the export settings (transparent background, size).
2. **Generate.** Jared pastes each prompt into ChatGPT, keeping one conversation per batch so the style stays consistent. He saves each result as `art/masters/<asset-id>.png`.
3. **Process.** `npm run art:process` checks each master: real alpha channel, dimensions, and no white-rectangle background. It writes optimized derivatives to `public/art/` and a contact sheet of every asset over ivory and warm charcoal.
4. **Review.** Jared approves or rejects each asset from the contact sheet. Approvals are recorded in `art/manifest.json` (asset ID, item, role, alt-text context, revision, status). A rejected asset gets a targeted revision prompt (§8 F) in the next batch.
5. Production builds refuse unapproved art, as they refuse draft content.

**After v1 (v1.1+):** value markers; regional verdicts if M1 finds regional data; local-harvest context with harvest zones; precise location; named-chain notes; Spanish.

## 6. Verification

| Area | What runs | Depth |
| --- | --- | --- |
| Verdict engine, Today grouping, window math | Vitest: a table-driven case per rule and per precedence pair; fast-check invariants (advisory decides unless rule 1 fired; no Peak on thin supply; typical mode ignores advisories; `byOrigin` equals re-running the rules; value inputs never change a verdict, once they exist) | **Thorough.** This is where correctness lives |
| Content and data | `data:build` validation, plus one broken-input fixture per check | Thorough |
| UI components | Typecheck, plus a test only where a component carries a product rule | Light |
| End to end | Playwright smoke in Chromium: Today renders, open an item, offline after the first visit, axe finds no violations. WebKit added at M9 | A handful of tests |
| Visual | Screenshots at 375 px and one wide width, shown to Jared | No baseline suites |

Run the tests for what you touched while working. Run the full suite before pushing. CI runs everything on each push.

## 7. Operations

- **Deploy:** `npm run deploy` (build, then `wrangler deploy`) from a machine signed in with `wrangler login`. Move deploys into CI when it becomes convenient, using a scoped API token in a GitHub secret.
- **Data refresh (D8):** once a year, with the yearly content review. `npm run usda:refresh` rebuilds typical origins and the supply index from the last 3 years; Jared reviews the diff; then commit and deploy. Items without usable USDA data use cited editorial origins and a `null` supply index.
- **Stale data:** each build records its supply-data date. When it is more than 45 days old, freshness lowers confidence and the item page says so; the app never pretends to be current.
- **Privacy:** no accounts or cookies. The place lives in `localStorage` on the phone. The Worker never logs URLs, query strings, bodies, IPs or ZIPs; automatic invocation logs are turned off at M8. D1 stores state and date, never finer.
- **Rollback:** redeploy the previous Worker version (`wrangler rollback`). Data rolls back with it.

## 8. Deliberately not built

These were in the archived specs. Don't add them without a new decision from Jared:

- separate data releases, R2 buckets, manifests, a publisher Worker, IndexedDB release slots;
- TypeSpec and generated contracts, a Python pipeline, Dagster, Cloudflare Workflows and Containers;
- a mixed-version test matrix, gradual deployments, a full boot guard (the small pre-paint check in §1 is the only one), nonce-based CSP for server rendering;
- 53 harvest zones, harvest calendars, the location grid, the California/Florida split, 96 region-month summaries;
- Windows CI runners, cross-OS byte-for-byte builds, screenshot baselines, Lighthouse CI, Trusted Types, Renovate.

The archived documents remain useful for detail: failure states and readiness copy, CSP directives, D1 table fields, and event names. Read the relevant section when a milestone needs it. They are not instructions.

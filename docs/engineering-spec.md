# Seasonal Produce Guide — Engineering Specification

Nov 16, 2026 · @Jared Peterson

## 1. Summary

The system is two independently deployed halves joined by one versioned contract. A **batch data backend** computes every verdict ahead of time and publishes immutable, versioned releases. An **edge frontend** serves the shopper from those releases and keeps a complete copy on the phone. No database is queried to show a verdict.

**The backend** centers on one plain Python command, `pipeline build`, which turns a versioned input snapshot into a validated release directory. Dagster and a scheduled Cloudflare Workflow wrap that command; they don't replace it. A separate publisher makes a release live with one conditional write of the manifest, so concurrent or retried runs can never overwrite newer data. A small TypeScript API (Hono on Workers) handles location, feedback, item requests and anonymous events.

**The frontend** is a TanStack Start app (React 19.3, React Compiler, Vite 8) on Workers. First visits are rendered at the edge for the inferred location. Returning visits render immediately from the release saved on the phone, so a shopper never sees two different sets of verdicts while the app starts. Any covered item opens offline, including ones the shopper has never visited.

**The contract** is written once in TypeSpec and emitted as JSON Schema. Python serializes through generated models; the browser validates with precompiled JSON Schema validators. A full round trip through real serialized JSON is proven before anything else is built.

**What a verdict means** follows the product spec: expected eating quality (Peak, Good, Skip or Limited evidence). It is computed from reviewed quality windows per origin, the typical supply origins, and scoped advisories. Value is a separate marker and never an input to the verdict.

**First milestone:** a deployed walking skeleton of the whole flow (section 17), before the rest of the stack is built out.

Every choice is a stable release as of November 2026. Several are only weeks past their stable release, which is deliberate for a learning project; section 16 lists each one's fallback.

## 2. Engineering principles and constraints

Eight principles decide every trade-off below. When two conflict, the earlier one wins.

1. **Two systems, one contract.** The backend publishes; the frontend consumes. They share no code and no database. The only shared thing is the versioned contract (section 10), and either side can be rewritten without touching the other.
2. **Releases, not files.** Every published dataset is an immutable, versioned release. Nothing becomes authoritative until it is complete and validated: on the server, through manifest promotion (section 8), and on the phone, through the active-dataset switch (section 6).
3. **Static-first reads.** At launch that is \~44,500 verdict cells (35 items × 53 zones × 24 windows), plus the current assessment and label-based variants. All of it is computed ahead of time, so the read path is CDN → file → browser.
4. **Edge only for the truly dynamic.** Location, feedback, item requests and anonymous events run as edge functions. Nothing else does.
5. **Local first on the phone.** The phone keeps a complete working release and shows it immediately. The network improves it in the background and is never on the path to showing a verdict.
6. **Deterministic, reproducible data.** The same input snapshot and code always produce byte-identical output. Every release records exactly which inputs and code produced it.
7. **Plain core, wrapped orchestration.** Business logic lives in plain functions behind one command-line tool. Dagster, Workflows and Containers wrap that command and can each be removed without rewriting logic.
8. **Stable, but new, and introduced one at a time.** Every runtime dependency has a stable release (1.0+, or explicitly production-designated). Pre-1.0 tools are allowed only in dev tooling, behind a named fallback. Release candidates (Drizzle 1.0, TanStack DB 1.0) wait. New infrastructure is added only after the layer beneath it works, because each brings its own lifecycle and failure modes.

**Hard constraints**

- Behaviour and scope come from the product spec: verdict states, markers, confidence, \~35 launch items, 3 variety guides, 3 locally checked metros.
- US users only; English first, with text structured for Spanish later.
- Field performance targets from the product spec: first usable verdict and LCP ≤ 2.5 s at the 75th percentile on mobile; WCAG 2.2 AA; 44 px tap targets.
- No accounts, no cookies, and no precise location stored on any server.
- **Mixed versions always coexist.** Gradual deploys, Service Bindings and cached clients mean every change must work with the previous version of everything it talks to.
- The whole toolchain runs natively on Windows, macOS and Linux, with no mandatory dev container.
- Running cost under \~$25/month at launch traffic (an assumed budget; adjust).

## 3. System architecture

The system has three planes that run on different clocks. The data plane runs weekly, the serving plane runs per request, and the client plane runs on the shopper's phone.

&#91;embedded content: system architecture · 3 planes, releases promoted by one publisher\]

The pipeline writes immutable releases, but only the publisher can make one live, by conditionally rewriting the manifest. The web Worker and the phone read releases directly. Only location, feedback, requests and events reach the API Worker.

**First visit (no release saved on the phone)**

1. The browser requests `/`. The web Worker reads the request's approximate location from Cloudflare (`request.cf`).
2. Over a Service Binding, the web Worker asks the API Worker to turn that location into a harvest zone, price region and "locally checked" flag.
3. The web Worker reads the live release's bundle for that zone, which is edge-cached JSON (section 11).
4. It server-renders Today with the verdicts inline and the release ID in the bootstrap data.
5. The page hydrates, the service worker installs, and the complete release downloads in the background (section 6).

**Returning visit**

1. The service worker answers the navigation with the cached app shell; there is no server render.
2. The app reads the active release and saved place from IndexedDB and renders verdicts with no network at all.
3. In the background it checks the manifest. A newer release is downloaded, validated, and only then switched in (section 6).

**Weekly data run**

1. A Cron Trigger starts a Cloudflare Workflow on Saturday at 14:00 UTC, after USDA's Friday report.
2. The Workflow runs the pipeline container: `pipeline ingest`, then `pipeline build` and `pipeline verify` against a frozen input snapshot.
3. The container uploads content-addressed objects and `releases/{release_id}/index.json`, writing a `_COMPLETE` marker last.
4. The publisher re-verifies every object and promotes the release with a conditional manifest write (section 8). Any failure leaves the live release untouched.

## 4. Technology stack

All versions were checked against release notes on Nov 16, 2026. Pin exact versions at project start; this table records the release lines to target. Section 17 tests the riskiest choices before the rest is built.

### Frontend

| Layer | Choice | Stable since | Why it fits | Runner-up |
| --- | --- | --- | --- | --- |
| App framework | TanStack Start 1.x | [Oct 13, 2026](https://tanstack.com/blog/tanstack-start-1-0) | Typed routes and search params (place and date in the URL are typed end to end); per-route choice of server or client rendering; a first-party path to Cloudflare Workers | Next.js 16.x (heavier, tied to Server Components); Astro 6 (best for content, weaker for app-like screens) |
| UI runtime | React 19.3 + React Compiler 1.0 | [19.3: Sep 9, 2026](https://react.dev/blog/2026/09/09/react-19-3) | `<ViewTransition>` is now stable, for card → item page transitions; the compiler removes hand-written memoization | Preact; Solid |
| Build | Vite 8 (Rolldown bundler) | [Mar 12, 2026](https://vite.dev/blog/announcing-vite8) | One Rust bundler for dev and production builds | — |
| Styling | Tailwind CSS 4.3 | [May 2026](https://releases.sh/tailwind-css/tailwind-css.md) | Design tokens defined in CSS (`@theme`), OKLCH color, container queries | CSS Modules + custom properties |
| Components | Base UI 1.x (headless) | [Dec 11, 2025](https://base-ui.com/react/overview/releases/v1-0-0.md) | Accessible behavior with no imposed styling; works with Tailwind | React Aria Components |
| URL and form validation | Zod 4.6 | [Sep 2026](https://tech-insider.org/zod-vs-valibot-vs-arktype-2026/) | Standard Schema support; typed search params. Not used for contract data (see below) | Valibot 1.5 |
| Client search | Orama 3.1 | [3.1.18](https://depscope.dev/pkg/npm/@orama/orama) | Typo-tolerant ranked search (BM25) in the browser. The index is built on the phone from published search documents (section 10) | FlexSearch; MiniSearch |
| Offline | Serwist 9.5 + `@serwist/vite` for app code; IndexedDB (via the `idb` wrapper) for releases | [9.5.x](https://openapps.pro/packages/serwist) | Maintained successor to Workbox for code caching; IndexedDB gives transactional release switching (section 6) | Hand-written service worker |
| Browser APIs | Screen Wake Lock, Storage API (`persist()`), View Transitions, Temporal (polyfilled where missing) | [Wake Lock in all engines since May 2024](https://web.dev/blog/screen-wake-lock-supported-in-all-browsers) | In-store mode, durable offline storage, smooth navigation, correct local dates | — |

### Backend services (edge API)

| Layer | Choice | Stable since | Why it fits | Runner-up |
| --- | --- | --- | --- | --- |
| Runtime | Cloudflare Workers | GA | Request geolocation including postal code ([docs](https://developers.cloudflare.com/workers/examples/geolocation-hello-world/)); same platform as the frontend | Vercel Functions; Deno Deploy |
| API framework | Hono 4.13 | [4.13.x](https://socket.dev/npm/package/hono/overview/4.13.13) | Web-standard and runtime-portable; tiny | Elysia (Bun) |
| Write store | Cloudflare D1 (SQLite) | GA | Feedback, taste answers, item requests and daily event counts; SQLite stays portable | Neon Postgres |
| Query layer | Drizzle ORM 0.45 | [0.45 stable; 1.0 still RC](https://www.issoh.co.jp/md/tech/7939) | Typed SQL with near-zero runtime; move to 1.0 once it ships | Kysely |
| Abuse control | Turnstile (on feedback, taste and requests only) + the Workers Rate Limiting binding | GA | Protects anonymous writes without accounts; events stay light | — |

### Data pipeline

| Layer | Choice | Stable since | Why it fits | Runner-up |
| --- | --- | --- | --- | --- |
| Language | Python 3.15 | [Oct 9, 2026](https://docs.python.org/3.15/whatsnew/3.15.html) | Best data ecosystem; also your active learning language | Python 3.14 (fallback if wheels lag) |
| Core interface | One CLI (`pipeline ingest \| build \| verify \| upload`) | — | Plain, testable entry point that every orchestrator wraps | — |
| DataFrames | Polars 2.0, for **all** production transforms | [Oct 6, 2026](https://pbxscience.com/?p=24757) | Streaming engine by default, stricter types | pandas |
| SQL engine | DuckDB 1.5, for exploration and ad hoc SQL only | 1.5.x stable (2.0 in alpha) | SQL over the same Parquet files; never a second implementation of a production transform | — |
| Orchestration | Dagster 1.13, added after the CLI works | [1.13.x](https://releases.sh/dagster/dagster.md) | Asset lineage, partitions and checks around the CLI's steps | Prefect 3; plain scripts |
| Frame validation | dataframely 2.0 | [2.0.0](https://socket.dev/pypi/package/dataframely/overview/2.0.0) | Polars-native schemas, including rules across related tables | Pandera (still 0.x) |
| Type checking | Pyrefly 1.x | [1.0 on May 12, 2026](https://pyrefly.org/blog/v1.0/) | Stable, fast, Rust-based | ty (still 0.0.x beta) |
| Project and lint | uv; Ruff | Production-standard (0.x versioning) | Fast, lockfile-based environments; one linter and formatter | pip-tools; Black + Flake8 |

### Contract, platform and tooling

| Layer | Choice | Stable since | Why it fits | Runner-up |
| --- | --- | --- | --- | --- |
| Contract language | TypeSpec 1.x → JSON Schema 2020-12 + OpenAPI 3 | [1.0 GA](https://typespec.io/blog/typespec-1-0-GA-release/) | One source for both languages | Hand-written JSON Schema |
| Contract codegen | Python: `datamodel-code-generator` (Pydantic v2). TypeScript: `json-schema-to-typescript` for types, plus Ajv standalone validators compiled at build time | Mature, widely used (pin and verify at build-out) | Standard tools with no custom code generator; precompiled validators need no `eval`, so they fit a strict CSP | Zod via a custom generator (rejected: too much to maintain) |
| Batch compute | Cloudflare Containers + Workflows, wrapping the CLI | [GA Apr 13, 2026](https://developers.cloudflare.com/changelog/post/2026-04-13-containers-sandbox-ga/) | Runs the Python image on a schedule, with durable step retries | The same image on a GitHub Actions schedule |
| Object storage and CDN | Cloudflare R2 + Cache Rules; separate buckets for releases and the manifest | GA | Immutable, content-addressed releases; conditional writes for the manifest ([R2 docs](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)); no egress fees | S3 + CloudFront |
| JS runtime | Node.js 26 LTS | [Active LTS Oct 28, 2026; EOL Apr 2029](https://fireup.pro/news/nodejs-26-lts-whats-new-upgrade) | Longest support window; Temporal on by default | Node 24 LTS |
| JS toolchain | Vite+ 1.0 (`vp`) | [Oct 2026](https://infoq.com/news/2026/10/cloudflare-viteplus-stable) | One command for dev, test, lint, format, build and task caching | Separate Vite + Vitest + Oxlint + Biome |
| Type checker (TS) | TypeScript 7.0 (native Go compiler) | [Jul 8, 2026](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) | Full builds 8–12× faster | TypeScript 6 via the `tsc6` alias |
| Tests | Vitest 4 (browser mode) + Playwright + Lighthouse user flows | [Vitest 4.0](https://voidzero.dev/posts/announcing-vitest-4) | Component tests in real browsers; scripted journeys for lab performance | Jest + Testing Library |

## 5. Frontend application

The frontend is a single TanStack Start app deployed as one Worker. The server renders only first visits; returning visits render on the phone from the saved release. HTML is never edge-cached. Only shared data is.

### Rendering by route

| Route | First visit (no saved release) | Returning visit | Edge cache |
| --- | --- | --- | --- |
| `/` Today | Server-rendered at the edge for the inferred place, verdicts inline | Rendered on the phone from the active release; the service worker serves the app shell | HTML: none. Zone bundle JSON: yes |
| `/item/$slug` | Server-rendered at the edge, verdict inline. The verdict is the page's most important content, so it never waits for client code | Rendered on the phone | HTML: none |
| `/item/$slug/$variety` | Server-rendered at the edge | Rendered on the phone | HTML: none |
| `/browse/$category`, `/methods` | Pre-rendered (place-independent) | From the precache | Immutable per deploy |
| `/calendar` | Rendered on the client from the release's typical outlook | Rendered on the phone | — |

Search is a global overlay, not a route. **HTML isn't cached because it varies** by city, exact date, planning state and in-store mode, and a zone-and-window key can't capture all of that. The edge caches the shared data (zone and editorial bundles), and rendering from it is cheap.

### Place: one answer at startup

The shopper must never see one set of verdicts and then a different one while the app starts.

| Situation | Who renders | Place used |
| --- | --- | --- |
| URL carries `?zip=` | Server or phone | The URL's place, so both always agree |
| First visit, nothing saved | Server | Inferred from the request |
| Returning visit, service worker active | Phone only (cached shell, no server render) | The saved place |
| Returning visit, service worker missing (cleared or updating) | Server, then phone | **Boot guard:** a tiny nonce'd inline script in `<head>` compares the saved place (mirrored to `localStorage`) with the server's place embedded in the HTML. If they differ, it hides the verdict region behind a neutral skeleton before first paint, and the phone renders the saved place |

- Choosing a place saves it to IndexedDB and `localStorage`, and replaces the URL's search params. Shared links carry the place only when explicitly shared.
- **Changing place keeps the page, filters and scroll position.** Place is a search param, so a change is a same-route navigation with scroll reset turned off. Only verdict data changes.

### Date and time

- `?date=` present means a pinned planning date, rendered as the typical outlook. Absent means "today" in the user's time zone. The edge uses the request's time zone; the client recomputes at hydration.
- Window index = (month − 1) × 2 + (day > 15 ? 1 : 0), computed with `Temporal.PlainDate` (polyfilled where missing).
- **Day rollover:** the client re-evaluates at local midnight and on `visibilitychange`, so a shopper at 11:58 pm doesn't keep yesterday's window.
- Search params are validated by a Zod schema in the router's `validateSearch`, so components receive typed, already-checked values.

### Product behavior mapping

- **Today:** "Best right now" holds up to 6 Peak items, sorted by confidence and then by the editorial purchase-frequency rank. It is never padded. Each item appears once, with markers as tags; Skip and Limited evidence are collapsed sections.
- **Cards** expand in place, with a **Details →** button. List rows (search, Browse) navigate.
- **"What does the label say?"** reads the precomputed per-origin verdicts (`byOrigin`) from the zone bundle, so it needs no network.
- **Dates on the item page:** "Supply data through…" comes from the release's source observation period; "Guidance reviewed…" comes from the editorial record (section 7).
- **Value marker (v1.1)** comes from the region value bundle and is rendered separately from the verdict.

### Styling and components

- **Tokens:** Tailwind 4 `@theme` holds OKLCH tokens: the verdict palette (including a neutral Limited evidence tone), per-item accent hues, the type scale and spacing. Dark mode follows `prefers-color-scheme`; in-store mode forces a high-contrast light theme.
- **Layout:** container queries rather than viewport breakpoints, with one information hierarchy on every device (product spec section 6). Type sizes are fluid, using `clamp()`.
- **Modern CSS:** `:has()`, `@starting-style` for expand and collapse, `content-visibility: auto` for long lists. Animation is off under `prefers-reduced-motion`.
- **Primitives:** Base UI Accordion, Dialog/Drawer, Tabs, Toggle, Popover and Select, wrapped once in `packages/ui`.
- **Charts:** the typical-outlook strip and calendar heatmap are custom SVG with accessible table fallbacks.

### Search

- The release includes language-neutral search documents (section 10). A Web Worker builds the Orama index on the phone the first time search gets focus, and caches the serialized index locally, keyed by release ID and Orama version.
- Results are joined with the active release's verdicts, so every row shows its badge.

### Performance (field targets vs CI gates)

| Kind | Measure | Budget |
| --- | --- | --- |
| Field target (real users, 75th percentile, mobile) | First usable verdict displayed (custom mark) | ≤ 2.5 s |
| Field target | LCP / INP / CLS | ≤ 2.5 s / ≤ 200 ms / ≤ 0.1 ([web.dev](https://web.dev/articles/vitals)) |
| CI gate | Initial JS on Today (gzip) | ≤ 120 KB |
| CI gate | CSS (gzip) | ≤ 20 KB |
| CI gate | Zone bundle / editorial bundle / search documents (gzip) | ≤ 25 KB / ≤ 60 KB / ≤ 15 KB (estimates; confirm with real data) |
| CI gate | Lighthouse navigation + scripted user flows (mobile profile) | No regressions against `main` |

CI gates catch regressions; they don't prove field performance. In particular, a plain Lighthouse page-load run can't measure INP, because it never interacts with the page ([source](https://searchenginejournal.com/why-google-lighthouse-doesnt-include-inp-a-core-web-vital/528734)).

### Accessibility and text

- Semantic landmarks, focus moved to the page heading on route change, and one accessible name per card, markers included.
- All user-facing strings live in a message catalog from day one, keyed and English-only. The i18n library is chosen when Spanish is scheduled (v2).

## 6. Offline dataset

The phone keeps one complete, validated release as its active dataset. Updates download into a separate slot and become active only after validation, so an interrupted update always leaves the previous release usable.

### What the phone stores

| Part | Store | Budget (gzip, estimate) | Comes from |
| --- | --- | --- | --- |
| App shell and every route's code chunks | Cache Storage (Serwist precache) | Section 5 JS budget | The deploy |
| Manifest: release ID, part hashes, contract version, minimum client version | IndexedDB | < 5 KB | The release |
| Editorial bundle: every covered item, variety, type note and methods text | IndexedDB | ≤ 60 KB | The release |
| Zone bundle for the saved place: typical outlook, current assessment, advisories, per-origin verdicts | IndexedDB | ≤ 25 KB | The release |
| Search documents | IndexedDB | ≤ 15 KB | The release |
| Illustration sprite | Cache Storage | ≤ 80 KB | The deploy (optional; first dropped under storage pressure) |
| Saved place, pending taste prompts, settings | IndexedDB, with place mirrored to `localStorage` | Tiny | The device |

**No HTML pages are prefetched.** Every item and variety URL is rendered on the phone from the editorial and zone bundles. When offline, the service worker answers any navigation with the cached app shell. So once a release is active, **an item the shopper has never opened works offline**, which goes beyond the product spec's "viewed pages" promise.

### Update protocol

1. **Show first.** On launch, render from the active release immediately. The network is never on the path to showing a verdict, and there is no manifest timeout on that path.
2. **Check in the background.** Fetch the manifest. If its release ID matches the active one, stop.
3. **Download into a pending slot.** Fetch each part the manifest lists for this place, check each against its SHA-256 hash (Web Crypto), and validate it with the contract's validators.
4. **Switch in one transaction.** When every part is present and valid, a single IndexedDB transaction points `active` at the new release. The previous release is kept until the next successful launch, then deleted.
5. **Apply at a calm moment.** The new data takes effect on the next navigation, never while the shopper is reading a screen. In in-store mode it waits until the mode is off or the app is reopened.
6. **Interrupted? Nothing changes.** A partial pending slot is resumed or discarded on the next check; `active` is never touched.

### Readiness and failure handling

| Situation | Behavior | Readiness status shown |
| --- | --- | --- |
| First download in progress | Download in the background; the server-rendered page stays usable | "Preparing for offline… 40%" |
| Release active | — | "Ready offline · 35 items · supply data through Nov 13" |
| Active release is past its assessment dates | Show the typical outlook, labeled, until an update arrives | "Offline copy is from Nov 13; reconnect to refresh" |
| Download interrupted after a new manifest | Previous release stays active | Unchanged |
| A part fails its hash or validation | Discard the pending slot; retry with backoff; report an error event | Unchanged |
| `QuotaExceededError` | Keep the active release; drop optional assets (illustrations) first | "Couldn't save the new offline copy" |
| Storage evicted or cleared | Online: fetch and render, then rebuild the release. Offline: the shell (if it survived) explains there is no offline copy yet | "Not ready offline" |
| Place changed | Download the new zone bundle into the pending slot; switch place only once it validates | "Preparing {city}…" |
| Place changed while offline, zone not saved | Keep the previous place | "{city} needs a connection" |
| New service worker available | Install, then wait; activate on the next launch, never mid-session | — |
| App too old for the newest release's contract | Keep using the newest compatible release; update the app when online (section 8) | "Update available" |

**Durable storage.** Browser storage is "best-effort" by default and can be evicted under storage pressure ([MDN](https://developer.mozilla.org/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)). Turning on in-store mode calls `navigator.storage.persist()`. WebKit decides such requests by heuristics, for example whether the site is opened as a Home Screen web app ([WebKit](https://webkit.org/?p=14403)). Recovery from eviction is designed in either way.

**Time without a network.** The release carries all 24 windows of the typical outlook plus a current assessment with explicit `validFrom` and `validTo` dates. Crossing midnight or a half-month boundary never needs the network.

## 7. Backend: data pipeline

The core is one plain command: `pipeline build --snapshot <id> --out <dir>`. It reads one frozen input snapshot and writes one release directory, with no network and no clock. Everything else wraps it.

&#91;embedded content: pipeline · CLI stages from frozen inputs to a verified release\]

Ingestion freezes inputs into a snapshot, the build is pure, and verification runs before anything is uploaded. Dagster and Workflows only call these commands.

### Commands

| Command | Does | Side effects |
| --- | --- | --- |
| `pipeline ingest` | Fetches USDA reports; stores each raw response exactly as received (gzip JSON) plus normalized Parquet | Writes to `pg-inputs` |
| `pipeline snapshot` | Freezes inputs: USDA object keys + hashes, plus the content/reference package for a git commit. Writes a content-addressed snapshot manifest; its hash is the snapshot ID | Writes to `pg-inputs` |
| `pipeline build` | Pure: snapshot → release directory (bundles, search documents, provenance) | Local disk only |
| `pipeline verify` | Schema checks, semantic checks, and a determinism self-check on a release directory | None |
| `pipeline upload` | Uploads the release objects under immutable keys and writes `_COMPLETE` last; then asks the publisher to promote (section 8) | Writes to `pg-releases` only |

**Introduced in order:** the CLI first (run by hand and in CI), then Dagster around it for lineage and the local UI, then Workflows + Containers for the schedule. Each layer is added only once the one beneath it works.

**Polars vs DuckDB:** every production transform is written in Polars, once. DuckDB is for exploration notebooks and ad hoc SQL over the same Parquet. No transform is implemented in both.

### Where inputs come from

- **Content and reference files come from git, not from the container image.** On every merge, CI packages `content/` and `data/reference/` as `inputs/content/{git_sha}.tar.zst`. The weekly run uses the package for `main`'s latest commit, so new calendars or advisories are never missed by a stale image.
- **USDA data:** `inputs/usda/{report}/{published_date}/{sha256}.json.gz` holds the raw response. The normalized Parquet sits beside it, so parsing bugs can be fixed and re-run without depending on USDA keeping the old response.
- **The image holds code and generated contract models only.** It is rebuilt when `services/pipeline` or `packages/contract` changes, and its digest is recorded in every release.

### Assets

| Asset | Layer | Source or logic |
| --- | --- | --- |
| `usda_movement_raw` | Raw | USDA shipments and imports by commodity and origin |
| `usda_retail_raw` | Raw (v1.1) | USDA weekly retail ads, used only for value markers |
| `commodity_map` | Reference | USDA names → our item and variety IDs |
| `quality_windows` | Reference | Item × origin × window: prime / fair / poor, each row with ≥ 2 citations |
| `harvest_calendars` | Reference | Zone × item × window: off / early / peak / late |
| `advisories` | Reference | Items, origins, regions, `effective_from`, `effective_to`, imposed verdict, note |
| `zip_zone_map`, `zones_meta` | Reference | ZIP → zone; zone → price region; "locally checked" flag |
| `content_items` | Reference | Editorial: items, varieties, type notes, evidence records, review dates |
| `supply_profile` | Computed | Typical origins (ranked, ≥ 70% of reported volume) and the supply index per item × month |
| `typical_outlook` | Computed | Item × zone × window baseline, with no year |
| `current_assessment` | Computed | Item × zone for the dated windows in the release's validity range, with advisories applied |
| `markers`, `confidence` | Computed | Last call, reliable year-round; High / Medium / Low |
| `by_origin` | Computed | Rules re-run per origin for items marked "depends on the label" |
| `value_signal` | Computed (v1.1) | Promotion index and price ratio per item × region × week |
| `search_documents` | Computed | Names, synonyms, variety names and category for client search |
| `feedback_summary` | Computed (monthly) | D1 export by outcome; audit input only |

### Verdict engine

- Implements the product spec's rules 1–5 in order, first match wins: Limited evidence → advisory → Skip → Peak → Good.
- Thresholds live in `rules/v1.yaml`: origin dominance 70%; supply index thin < 0.8, strong ≥ 1.2; reliable year-round ≥ 20 of 24 windows. The rules version is stamped into every release.
- **A pure module:** frames in, frames out. **Value code can't be imported by the verdict engine;** an import-boundary lint enforces that.
- Confidence comes from four properties (coverage, relevance, freshness, agreement) exactly as the product spec defines them.

### Temporal model

Three kinds of claim are stored as three separate structures, and every time-related field has one meaning.

| Structure or field | Meaning |
| --- | --- |
| `typicalOutlook[0..23]` | The annual baseline per half-month window, with no year attached |
| `currentAssessment {validFrom, validTo, …}` | Verdicts for specific dates in a specific year |
| `advisories[] {effectiveFrom, effectiveTo, …}` | Dated, scoped exceptions |
| `release.publishedAt` | When the release was produced (manifest only; excluded from hashed payloads) |
| `source.observationPeriod` | Which conditions a source describes (e.g. USDA week Nov 7–13) |
| `source.publishedAt`, `source.ingestedAt` | When USDA published it and when we fetched it, which exposes reporting or ingestion delay |
| `editorial.reviewedOn` | When written guidance was last checked |

**Provenance by reference:** each bundle carries a small provenance table (`p1`, `p2`, …). Verdict cells reference those IDs instead of repeating details.

### Data-quality checks

| Check | Rule (initial; tune on real data) | On failure |
| --- | --- | --- |
| Schema | Every output validates against the contract's JSON Schema | Block |
| Unique keys | (item, zone, window) and (item, origin, window) are unique | Block |
| References | Every item, variety, origin and zone ID referenced exists | Block |
| Units | USDA volumes normalized to pounds; a mixed-unit series fails | Block |
| Origin shares | Each share in \[0, 1\]; per item-month sum ≤ 1 (tolerance 1e-6) | Block |
| Missing values | Explicit `null`, never NaN or Infinity. A zero historical average makes the supply index `null` with a "no baseline" reason, never infinite | Block |
| Date ranges | `effectiveFrom` ≤ `effectiveTo`; advisories expire within 90 days | Block |
| Coverage | Every launch item × zone × window has a verdict (Limited evidence counts) | Block |
| Mapping | 0 unmapped names among the top 200 USDA commodities | Block |
| Freshness | Movement data ≤ 45 days old | Lower confidence; publish |
| Stability | Week-over-week verdict changes ≤ 10% of cells, unless inputs or rules changed | Block; alert |
| Plausibility | 3–30 Peak items per zone-window | Warn |

### Reproducibility

- **Canonical JSON** (RFC 8785 JSON Canonicalization Scheme: sorted keys, fixed number formatting, UTF-8).
- Numbers are rounded to 3 decimal places before serialization, and every output has an explicit sort key.
- No execution timestamps in hashed payloads; `publishedAt` lives only in the manifest.
- Provenance records the snapshot ID, image digest, lockfile hash, rules version and contract version.
- **Test:** building the same snapshot twice must produce identical hashes.

### Scheduling

- **Weekly full run:** Saturday 14:00 UTC (6 am PST, 7 am PDT), after USDA's Friday report.
- **Daily:** a freshness check on the latest USDA data.
- **On merge to `main`:** a content release, either copy-only or a full build (section 8).
- **Backfill:** a one-time run over 3 years of USDA history to build the supply baselines.

## 8. Publication protocol

Publishing is a transaction. A release becomes live only when every object it references exists and validates, and then only through one conditional write of the manifest. Retries, overlapping runs and stale runs can never make the live data worse.

### Identities

| ID | Form | Purpose |
| --- | --- | --- |
| `snapshot_id` | SHA-256 of the snapshot manifest | Names the exact inputs |
| `run_key` | SHA-256 of (snapshot\_id, image digest, rules version, contract version) | **Idempotency:** the same key always means the same output |
| `release_id` | ULID minted when a build starts | Names a release's objects; sorts by time |
| `sequence` | Integer in the manifest, +1 per promotion | Orders live releases; clients reject a lower sequence |

### Stores and permissions

Permissions are enforced by storage separation, not convention.

| Bucket | Holds | Who can write |
| --- | --- | --- |
| `pg-inputs` | Raw USDA responses, normalized Parquet, content packages, snapshot manifests | Pipeline container; CI (content packages only) |
| `pg-releases` | `objects/{sha256}`; `releases/{release_id}/index.json` + `_COMPLETE` | Pipeline container (create-only; never overwrites) |
| `pg-manifest` | `manifest.json`, `history/{sequence}.json` | **Publisher Worker only** (an R2 binding; no API token can write it) |
| `pg-preview` | Preview releases and manifests | Preview pipeline runs only |

The web and API Workers have read-only bindings, and previews get no binding to `pg-manifest` at all.

### Promotion steps

The publisher is a small Worker with one entry point, `promote(release_id)`, called by the Workflow or by CI.

1. **Already live?** If the live manifest already has this `run_key`, return success (an idempotent retry).
2. **Complete?** Check `_COMPLETE`, then HEAD every object listed in the release index and compare sizes and hashes. Any miss: abort, with the live manifest untouched.
3. **Newer than live?** Reject if the candidate's input snapshot is older than the live one (by USDA observation period, then content commit time). This stops a delayed old run from replacing a newer release.
4. **Compatible?** The candidate's contract major must be in the supported window (see Retention), and `minClientVersion` must be set.
5. **Swap.** Write `manifest.json` with `onlyIf: { etagMatches: <etag read in step 1> }`. R2 supports conditional `put` in the Workers API ([docs](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)).
6. **On a conflict, re-read and re-check.** Another publish won the race: go back to step 1 against the new manifest. If the candidate is still newer, retry; otherwise stop as superseded.
7. **Record.** Write `history/{sequence}.json`, then purge the manifest's CDN URL.

### Overlapping runs

| Case | Handling |
| --- | --- |
| Two weekly runs at once | The Workflow uses the week as its instance ID, so a second start is a no-op |
| Content release during a weekly run | Both build; whichever promotes second sees a conflict, then re-checks. A weekly run whose snapshot lacks the latest content commit is rebuilt on top of it, never promoted over it |
| Retry after a crash | The same `run_key` finds the finished release (step 1) or its `_COMPLETE` objects, and skips the rebuild |

### Workflow steps are idempotent

Cloudflare Workflows may retry a step, so each step must be safe to run more than once ([rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)). Here every write is keyed:

- `ingest` writes objects keyed by content hash.
- `build` writes content-addressed objects (rewriting one is harmless) and `releases/{release_id}/`, using the release ID persisted by the earlier mint-IDs step.
- `promote` is the conditional write above.

No step appends, increments a counter, or sends a notification without a dedupe key.

### Content changes

| Change | Example | Path |
| --- | --- | --- |
| Copy-only | Wording, a tip, a variety description, a typo | **Fast path:** rebuild the editorial bundle and search documents against the live release's data; a new release reuses every zone bundle object by hash |
| Structural | New item or variety, an ID change, a calendar, quality window, advisory, or rule threshold | **Full build** from a new snapshot |

CI classifies the change by diffing the parsed content (not the text) against the live release. Anything it can't classify is treated as structural.

### Retention and recovery

- **Kept while any supported client could need it:** every release referenced by the last 8 weeks of manifests, plus the newest release of each contract major still in the support window (≥ 180 days after its successor ships). Nothing else is deleted until it is 30 days past both.
- **Rollback** is promotion of an earlier release with a new, higher `sequence`. Clients therefore accept it, and the history log shows it.
- **Recovering a phone on an incompatible release:** the manifest lists a fallback release per supported contract major. A phone on an old app uses the newest release it can read and shows "Update available".

## 9. Backend: services and API

Three Workers, each deployed on its own:

- **API Worker (Hono):** handles the few dynamic requests.
- **Publisher Worker:** internal only, and the only writer of the manifest (section 8).
- **Web Worker:** the frontend (section 5).

None of them is on the path to displaying a verdict for a returning visitor.

### Endpoints

| Endpoint | Purpose | Protection | Stores |
| --- | --- | --- | --- |
| `GET /v1/locate` (Service Binding from the web Worker) | Request location → zone, price region, locally checked flag, city label | Internal only | Nothing |
| `POST /v1/zip` (ZIP in the body) | ZIP → the same fields, for place changes | Rate limit | Nothing |
| `POST /v1/feedback` | In-store report | Turnstile + rate limit | `feedback` row |
| `POST /v1/feedback/{token}/taste` | Taste answer for an earlier "Bought it" | Turnstile + rate limit | Updates that row |
| `POST /v1/requests` | "Request this item" | Turnstile + rate limit | `item_requests` row |
| `POST /v1/events` | Anonymous usage and performance events, batched | Rate limit only (no Turnstile, so the beacon stays light) | Daily counters |

The manifest and release files are not API endpoints. They are served from R2 through the CDN (section 12). `/v1/zip` reads the live release's compact ZIP table from R2, cached in Worker memory per release ID.

### Write contracts

All request bodies are defined in the contract (section 10) and validated before anything is written. Unknown fields are ignored.

| Record | Fields | Notes |
| --- | --- | --- |
| `feedback` | id (ULID), item\_id, variety\_id?, origin\_label?, zone\_id, outcome (`looked_good` \| `looked_poor` \| `not_in_stock` \| `too_pricey`), bought (bool), taste? (`great` \| `ok` \| `disappointing`), release\_id, rules\_version, target\_date, client\_version, created\_on (date only) | Lets the audit compare a report with the exact verdict the shopper saw |
| `item_requests` | id, query\_normalized, zone\_id, created\_on | Feeds the monthly request ranking |
| `event_daily` | day, event, dims\_key, count. Upserted as `count = count + n` | **No raw event rows.** Events are aggregated as they arrive |

**Events** form a closed list in the contract. It covers screen views, the search with no result, a card expanded, a label origin chosen, in-store mode turned on, offline readiness reached, update applied, plus performance events (first usable verdict, LCP, INP, CLS, in buckets).

- Dimensions are restricted to zone, device class, app version and a bucketed value.
- Events never carry a ZIP, query text or an identifier.
- Clients batch events and send them with `navigator.sendBeacon`.

**Taste link without an account.** `POST /v1/feedback` returns a random 128-bit token. The phone stores it with the pending taste prompt, and only that token can attach a taste answer, within 14 days.

### Abuse controls

- **Turnstile** guards the three human-written endpoints. The token is verified server-side before the write.
- **Rate Limiting binding**, keyed on route + client IP, gives generous limits:
  - Feedback, taste and requests: 30 per minute.
  - ZIP lookup: 120 per minute.
  - Events: 60 batches per minute.
- The binding counts approximately and per Cloudflare location ([docs](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)). These limits are therefore brakes against abuse, not quotas. The IP is used only as a key and is never stored.
- Request bodies are capped at 4 KB (events 16 KB). Text fields are length-limited and stripped of markup.

### Versioning and mixed versions

- Paths are versioned (`/v1`). Within a major version, changes are additive only: new optional fields, new endpoints, new enum values (which clients must tolerate, section 10).
- During a gradual deployment, old and new versions of the web and API Workers serve traffic at the same time ([docs](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/)). Each Worker must therefore work against both the current and the previous version of the other.
- The web Worker passes a version key so one visitor's requests stay on one version during a rollout.
- Errors use RFC 9457 problem details, with a stable `type` URI per error.

## 10. The contract

The contract is the only thing the two halves share. It is written once in TypeSpec (`packages/contract`) and emitted as JSON Schema 2020-12 for data files and OpenAPI 3.1 for the API. Every other artifact is generated from those, using standard tools.

### Generation chain

| Step | Tool | Output | Used by |
| --- | --- | --- | --- |
| 1 | TypeSpec compiler | JSON Schema 2020-12 + OpenAPI 3.1 | Everything below |
| 2 | `datamodel-code-generator` | Pydantic v2 models | Pipeline: serializes every output through them |
| 3 | `json-schema-to-typescript` | TypeScript types | Web and API |
| 4 | Ajv, standalone mode | Precompiled validator functions (plain JS, no `eval`) | Phone (release validation), API (request bodies) |
| 5 | Small build script | `normalize` functions for open enums | Phone and web Worker |

Generated files are committed, and CI fails if regenerating changes them. A contract change is therefore visible in review, and contributors don't need the generators just to build. **Zod is used only for URL search params and forms**, which are local to the frontend and not part of the contract.

### Round trip, proven first

Code generation is easy to get mostly right. The risk is the seams: Python serialization, JSON Schema dialect support, optional versus `null`, date formats, number precision. So the walking skeleton (section 17) proves the whole chain on real files before any feature work:

1. Python builds a fixture release through the generated Pydantic models and writes canonical JSON.
2. The same files are validated by the JSON Schema in Python and by the Ajv validators in Node and a browser.
3. The web app renders them in Vitest browser mode, and the test asserts the visible verdicts.

The golden fixtures include edge cases: missing optional fields, explicit `null`s, an unknown enum value, an empty advisory list, and a zero-baseline supply index. This test runs on every change to the contract, pipeline serialization or rendering code.

### Open enums

Old phones will meet new data, so enum values added later must not break them.

- Enums that may grow (verdict, marker, confidence, outcome, event name) are TypeSpec open unions, for example `union Verdict { "peak", "good", "skip", "limited", string }`. The emitted schema accepts any string, so an old validator never rejects a new value.
- On the producer side, `pipeline verify` enforces the **known** values for the contract version it targets.
- On the consumer side, the generated `normalize` maps any unlisted value to `"unknown"` before rendering. Components then switch over a closed type, and the compiler checks every case.
- **Rendering unknowns:** an unknown verdict shows a neutral "Update to see this rating" state, never a guess. Unknown markers are hidden. An unknown confidence is omitted.

### Documents

| Document | Key contents |
| --- | --- |
| `Manifest` | sequence, releaseId, contractVersion, minClientVersion, publishedAt, observationPeriod, part URLs + SHA-256, fallback release per supported contract major |
| `ZoneBundle` | zoneId, locallyChecked, provenance table; `typicalOutlook` per item (24 windows: verdict, confidence, markers, label note, provenance IDs); `currentAssessment` {validFrom, validTo, per item: verdict, confidence, markers, supply band, typical origins, dependsOnLabel, `byOrigin` verdicts, advisory IDs}; advisories |
| `EditorialBundle` | Items, varieties, type notes, origins, evidence summaries, methods text, `reviewedOn` per record |
| `SearchDocuments` | id, kind (item/variety/type), name, synonyms, category, popularity rank |
| `RegionValueBundle` (v1.1) | Value marker per item × price region × week, separate from verdicts |
| API bodies | Feedback, taste, request, event batch, ZIP result, problem details |

**Search has one owner.** The pipeline publishes language-neutral search documents; the phone builds the Orama index (section 5). An Orama upgrade therefore never touches the pipeline or the contract.

### Versioning rules

- Contract versions use semver, and every document carries `contractVersion`.
- **Minor (additive):** new optional fields, new open-union values, new documents. Old clients ignore what they don't know.
- **Major (breaking):** removing or renaming a field, changing a type or meaning, or making a field required. A major is shipped by dual publishing: the pipeline emits both majors for the support window (≥ 180 days), and the manifest points each one at its own release (section 8).
- `minClientVersion` forces an app update only as a last resort, when an old client would display something wrong rather than merely incomplete.

## 11. Storage and formats

### Object layout

Release data is content-addressed: an object's key is its hash. A release is an index that points at objects, so releases that share data share objects. That is what makes copy-only content releases cheap (section 8).

```
pg-inputs/
  usda/{report}/{published_date}/{sha256}.json.gz   raw response, as received
  usda/{report}/{published_date}/{sha256}.parquet   normalized (zstd)
  content/{git_sha}.tar.zst                         content + reference package from CI
  snapshots/{snapshot_id}.json                      frozen input list + hashes

pg-releases/
  objects/{sha256}.json                             zone, editorial, search, provenance
  objects/{sha256}.bin                              compact ZIP → zone table
  releases/{release_id}/index.json                  parts, hashes, run_key, snapshot_id, image digest
  releases/{release_id}/_COMPLETE                   written last

pg-manifest/
  manifest.json                                     live pointer (publisher only)
  history/{sequence}.json                           every promotion and rollback
```

### Formats

- **Published data:** canonical JSON (section 7), served with Brotli or gzip compression by the CDN. Each part has its SHA-256 hash in the manifest, and the phone verifies the hash before use.
- **Inputs:** raw responses are kept byte-for-byte (gzip). Normalized data is Parquet (zstd) with dataframely-validated schemas.
- **ZIP table:** a sorted binary table of ZIP → zone index, \~41,000 rows (an estimate of a few hundred KB). Read by the API, never shipped to phones.

### HTTP caching

| Object | Cache-Control | Why |
| --- | --- | --- |
| `objects/*`, `releases/*/index.json` | `public, max-age=31536000, immutable` | Content-addressed, so it never changes |
| `manifest.json` | `public, max-age=60, stale-while-revalidate=300` | Small and changes weekly; the publisher purges it on promotion |
| HTML | `private, no-store` at the edge | Varies per visitor (section 5) |
| App code | Hashed filenames, immutable | Precached by the service worker |

Cloudflare doesn't cache JSON by default, because its default list of cacheable file extensions excludes `.json` ([docs](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)). The data hostnames therefore get an explicit Cache Rule that makes them eligible for cache and respects the origin's headers. A post-deploy smoke test checks for `cf-cache-status: HIT` on a second request (section 12).

### D1 (write store)

- Three tables: `feedback`, `item_requests`, `event_daily` (section 9). No table holds an IP, a ZIP, free text from search, or a timestamp finer than a day.
- **Migrations are expand, then contract.**
  1. **Expand:** add nullable columns or new tables, and deploy code that can read both shapes.
  2. **Contract:** drop old columns only after no Worker version that uses them remains deployed (gradual rollout finished, plus one more deploy).
- Drizzle Kit generates the SQL. `wrangler d1 migrations apply` runs before the code that needs it is deployed.
- **Recovery:** D1 Time Travel restores the database to any point in the last 30 days.

### On the phone (IndexedDB)

| Store | Key | Holds |
| --- | --- | --- |
| `meta` | name | `active` and `pending` release IDs, saved place, settings |
| `releases` | release\_id | Manifest copy, download status per part |
| `parts` | \[release\_id, part\] | Validated part data |
| `prompts` | token | Pending taste prompts (expire after 14 days) |
| `searchIndex` | \[release\_id, oramaVersion\] | Serialized Orama index (a rebuildable cache) |

IndexedDB schema upgrades run in the `upgradeneeded` handler and are written to be forward-only. A new service worker must be able to open a database created by the previous version.

## 12. Infrastructure and deployment

### Hostnames

| Host | Serves | Backed by |
| --- | --- | --- |
| `app.` | Pages, app code; `/api/*` is routed to the API Worker (same origin, no CORS) | Web Worker, API Worker |
| `data.` | Release objects and indexes | `pg-releases` custom domain + Cache Rule |
| `live.` | `manifest.json` | `pg-manifest` custom domain + Cache Rule |

### Environments and isolation

| Environment | Web / API | D1 | R2 | Turnstile | Can publish? |
| --- | --- | --- | --- | --- | --- |
| Local | `vp dev` + `wrangler dev` (local bindings) | Local SQLite | Local emulation + fixture releases | Test keys | No |
| Preview (per PR) | Worker preview URLs | `pg-preview` database | Read: live releases. Write: `pg-preview` only | Test keys | **No:** no manifest binding, no production secrets |
| Staging | Separate Workers | Staging database | Own buckets, including its own manifest | Real keys (staging site) | Its own manifest only |
| Production | Gradual deployments | Production database | `pg-*` | Real keys | Publisher Worker only |

Each environment has its own bindings and secrets in `wrangler.jsonc` environments. Credentials are scoped as follows:

- The CI deploy token can deploy Workers and upload content packages, but cannot write release or manifest buckets.
- The pipeline container gets an R2 token scoped to `pg-inputs` and `pg-releases` only.
- Nothing outside the publisher Worker's binding can write `pg-manifest`.

### Pipeline runtime

- The image (Python 3.15, uv-locked) is built in CI when `services/pipeline` or `packages/contract` changes, then pushed to Cloudflare's container registry. Its digest is recorded in every release.
- **Content and reference data are not baked in.** The Workflow passes the snapshot ID, and the container fetches that snapshot's content package from `pg-inputs` (section 7).
- Once Dagster is introduced, it runs **in-process inside the container** (`dagster asset materialize`). There is no hosted Dagster service, its UI is a local tool, and run records are exported to `pg-inputs/runs/`.
- **Workflow steps:** mint IDs → ingest → snapshot → build + verify → upload → promote → notify. Workflows persist each completed step's result, so the release ID minted in the first step is reused by every retry.
- **Fallback:** the same image runs on a GitHub Actions schedule with the same CLI and publisher call.

### Deploying changes safely

- **Order for a change that spans components:**
  1. D1 migration (expand).
  2. Contract minor.
  3. API Worker.
  4. Web Worker.
  5. Pipeline image.
  6. D1 cleanup: drop old columns (the contract step in section 11), at least one deploy later.
- **Gradual rollout** for the web and API Workers: 10% → 50% → 100%. It advances only if the error rate and the first-usable-verdict beacon stay within 10% of the previous version. Rollback is one command.
- **Service worker updates** never apply mid-session (section 6). Old precached app code may therefore run for days, which is why the mixed-version tests in section 13 include old app code against new data and the new API.

### Post-deploy smoke test

1. `GET app./` returns verdicts for a fixed test location.
2. Two requests for a release object, where the second returns `cf-cache-status: HIT`.
3. `GET live./manifest.json`, which must be at most 60 s stale.
4. `POST /api/v1/zip` with ZIP 94123.
5. A Turnstile-protected POST using the test key, in staging.
6. CSP report-only endpoint: no new violations.

### CI (GitHub Actions)

`vp check` (types, lint, format) → contract drift check → unit and browser tests → pipeline tests + determinism check → build → Lighthouse user flows → preview deploy. On merge, CI also:

- uploads the content package;
- classifies the content change (section 8);
- triggers a content release or a full build.

### Running cost (launch estimate)

- The Workers Paid plan ($5/month) covers Workers, Containers, Workflows and the rate limiter.
- A weekly container run of \~15 minutes, a few GB of R2 and a small D1 database should stay within included allowances at launch traffic.
- Confirm against the first two bills; the budget ceiling is $25/month.

## 13. Quality and testing

The riskiest behavior lives in transitions: between releases, versions, places, dates, and online and offline. So most of this section tests what happens when things go wrong, not only the happy path.

### Test layers

| Layer | Tools | Covers |
| --- | --- | --- |
| Unit | pytest; Vitest | Window math, rules thresholds, normalizers, reducers |
| Property | Hypothesis | Verdict-engine invariants (below) |
| Contract | Golden fixtures through the full chain (section 10) | Python → JSON → Ajv → rendered verdicts |
| Pipeline | pytest on fixture snapshots | Semantic checks, determinism (build twice, compare hashes), missing data |
| Publisher | Vitest + Miniflare (local R2) | Promotion races, retries, stale snapshots |
| Component | Vitest 4 browser mode + axe | Cards, badges, accordions, accessibility |
| End to end | Playwright (Chromium, WebKit, Firefox; mobile profiles), with clock and network control | Journeys and the failure scenarios below |
| Lab performance | Lighthouse navigation + timespan user flows | Regressions against `main` |
| Field performance | First-party beacon (section 14) | The real targets in section 5 |
| Real devices | Manual checklist per release gate | What emulators can't show |

### Verdict-engine invariants

Hypothesis generates random inputs and asserts that:

- If assessed origins cover less than 70% of typical volume, the verdict is Limited evidence.
- An active advisory always decides the verdict.
- Peak never appears when supply is thin.
- "Depends on the label" appears only when the top two origins differ by more than one rating level, and `byOrigin` agrees with re-running the rules per origin.
- Reliable year-round matches its count of Good-or-better windows.
- Value inputs can change only the value marker, never a verdict.

### Failure scenarios (automated)

| # | Scenario | Pass condition |
| --- | --- | --- |
| 1 | Download interrupted after a new manifest arrives | Previous release stays active; same verdicts; retried next launch |
| 2 | Offline, open an item never visited | Item page renders from the active release |
| 3 | Saved ZIP differs from the inferred location, service worker missing | The other place's verdicts never paint (checked on the first frame); the saved place renders |
| 4 | Local midnight, the 15th → 16th, Dec 31 → Jan 1 (window 23 → 0), DST change | Correct window after each; no reload needed |
| 5 | Two promotions race; a retry repeats a promotion; an older snapshot tries to promote | Exactly one wins; the retry is a no-op; the older one is rejected |
| 6 | Old app code reads a new release with an unknown enum value and new fields | Neutral "update" state, no crash, everything else renders |
| 7 | Missing USDA week; zero historical baseline | Confidence drops; supply index `null` with a reason; no NaN anywhere |
| 8 | Quota exceeded during an update | Active release intact; illustrations dropped first; status shown |
| 9 | Storage cleared mid-session | Online: rebuilds. Offline: clear "not ready" message |
| 10 | New service worker arrives during in-store mode | Not activated until the mode is off or the app reopens |
| 11 | Place changed offline to an unsaved zone | Previous place kept; message shown |
| 12 | Content-only release while a weekly run is in flight | Both changes end up live; nothing is lost |

### Mixed-version matrix

Each release gate, and any deploy that touches the contract, runs the key journeys against these combinations:

| Web / app code | API | Data release |
| --- | --- | --- |
| Currently deployed | New | Current |
| New | Currently deployed | Current |
| Precached N−1 and N−2 app code | New | New |
| New | New | Previous (rollback) |
| New | New | Previous contract major (dual publish) |

### Real-device checklist

- **iPhone, Safari tab and Home Screen web app:** offline after a day away, whether storage survives, and the `persist()` result.
- **Android Chrome, browser and installed:** the same checks.
- **Wake lock denied or released** (low-power modes, backgrounding): in-store mode still works and shows that the screen may sleep.
- **Background for hours, then reopen in the store:** the right date window, no blank screen, an update applied only at a calm moment.
- **Airplane mode inside a store,** on a mid-tier Android phone, checking the performance budget.
- **VoiceOver and TalkBack** through Today, an item page and feedback.

### Performance: lab vs field

- **Lab (CI):** Lighthouse navigation runs measure load. Scripted **timespan user flows** (expand a card, open search, change place) cover interaction responsiveness ([Lighthouse user flows](https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md)). These gate regressions only.
- **Field (real users):** the `web-vitals` library reports LCP, INP and CLS. The app adds a custom mark, `performance.mark('verdict-visible')`, set when the first verdict badge is painted (after the commit, on the next animation frame). Both go through the event beacon in bucketed form, and the p75 per device class is reviewed weekly against the targets.

## 14. Observability, security and privacy

### Logging without personal data

- **Automatic invocation logs are off** for the web and API Workers; they record full URLs, and URLs can carry `?zip=`. The flag name should be verified at build-out.
- Workers emit only structured logs through one shared logger with a field allowlist:
  - route **template** (e.g. `/item/$slug`);
  - status and duration;
  - Worker version and release ID;
  - error type.
- Query strings, path parameters, bodies and free-text error messages are never logged. Validation failures are logged as the schema path that failed, not the value.
- **ZIP lookup is `POST /v1/zip` with the ZIP in the body,** so it never appears in a URL or a CDN log. No HTTP request logs are exported (no Logpush).
- **Client errors** go through the event beacon as error type, component and release ID, with no message text.

### Alerts

| Signal | Threshold | Route |
| --- | --- | --- |
| Weekly Workflow failed or was superseded twice in a row | Any | Email from the Workflow's notify step |
| Live movement data age | > 45 days | Email |
| API 5xx rate | > 1% over 10 min | Email |
| First usable verdict, p75 mobile | > 2.5 s for 3 days | Weekly report |
| CSP violation reports | New violation type | Weekly report |

### Content Security Policy

There are two policies, because a cached page can't reuse a nonce:

| Response | `script-src` |
| --- | --- |
| Server-rendered pages (first visits, items) | `'nonce-{per request}' 'strict-dynamic' https://challenges.cloudflare.com`. The nonce is passed to TanStack Start's injected hydration scripts and to the boot guard |
| App shell (cached by the service worker) | `'self' 'sha256-{boot guard}' https://challenges.cloudflare.com`. A hash works for a static script; a nonce would be replayed from cache |

The other directives are shared:

```
default-src 'self';
connect-src 'self' https://data.<domain> https://live.<domain>;
frame-src https://challenges.cloudflare.com;
worker-src 'self';
img-src 'self' data:;
style-src 'self';
object-src 'none';
base-uri 'none';
frame-ancestors 'none';
report-to csp
```

- Turnstile needs its host in both `script-src` and `frame-src` ([Turnstile CSP docs](https://developers.cloudflare.com/turnstile/reference/content-security-policy/)).
- Server data for hydration is embedded as a non-executable `<script type="application/json">`. The boot guard is the only hand-written inline script.
- **No Cloudflare Web Analytics script.** It would need two more hosts in the CSP ([docs](https://developers.cloudflare.com/web-analytics/faq/)), and the first-party beacon already reports the metrics we need.
- `require-trusted-types-for 'script'` ships report-only first, then enforced once reports are clean.
- **Other headers:** HSTS (preload), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a `Permissions-Policy` that turns off camera, microphone, payment and USB.

### Write-path and platform security

- Turnstile and the rate limiter guard the write endpoints as described in section 9. Every body is validated by the contract before it touches D1, and all queries are parameterized through Drizzle.
- **Least-privilege credentials** (sections 8 and 12):
  - Only the publisher's binding can write the manifest.
  - Previews can't reach production data or secrets.
  - The container's R2 token is limited to two buckets.
- **Supply chain:** lockfiles with hashes (uv, the JS lockfile), Renovate with a 7-day minimum release age, and provenance-checked npm packages where they are offered.

### Privacy

- No accounts and no cookies. The saved place, settings and pending prompts live only on the phone.
- Nothing on the server records an IP address, a ZIP or a precise location. Feedback stores the zone and a date only (section 9).
- **Retention:** feedback 24 months (the audit window); item requests 12 months; daily event counts kept indefinitely (they are aggregate only).
- The privacy page states all of this, and that Turnstile (a Cloudflare service) processes browser signals when the shopper sends feedback or a request. No third-party trackers, and no sale or sharing of data.

## 15. Repository and developer experience

There is one repository with hard internal boundaries. The halves share only `packages/contract/generated`.

```
produce-guide/
  apps/web/              TanStack Start app (web Worker)
  services/api/          Hono API Worker
  services/publisher/    Publisher Worker (manifest promotion)
  services/pipeline/     Python: CLI, assets, verdict engine (uv project)
  packages/contract/     TypeSpec source + generated/ (schemas, Pydantic, TS, validators)
  packages/ui/           Base UI wrappers, design tokens
  packages/fixtures/     Golden releases and small input snapshots
  content/               Items, varieties, type notes, methods (YAML + Markdown)
  data/reference/        Quality windows, calendars, advisories, zones, ZIP map, rules/
  infra/                 wrangler configs, Cache Rules and Workflow definitions as code
  docs/adr/              One decision record per technology choice
```

- **Boundaries are enforced, not hoped for.** A lint rule forbids `apps/*` from importing `services/*` and vice versa, and both may import only the generated contract. The verdict engine can't import value code (section 7).
- **Learning log:** every new technology enters with a short decision record covering why it was chosen, what it replaced, and how to remove it, linked to its fallback in section 16.

### Everyday commands

```
vp install                      # JS dependencies (workspace)
uv sync                         # Python environment for services/pipeline
vp run contract:gen             # TypeSpec -> schemas, models, types, validators
uv run pipeline build --snapshot packages/fixtures/snapshots/small --out .out/release
uv run pipeline verify .out/release
vp dev                          # web + API Workers in workerd, serving .out/release locally
vp test                         # unit + browser tests
uv run pytest                   # pipeline tests
```

`vp dev` runs both Workers inside the real Workers runtime through the Cloudflare Vite plugin, with local D1 and R2. The `small` fixture snapshot (5 items, 3 zones, 2 origins each) builds in seconds. Real data needs `pipeline ingest` with a free USDA My Market News API key in `.env`.

### Native Windows (and macOS, Linux)

- Every tool above ships native Windows builds: Node 26, uv and Python 3.15, Polars, DuckDB, workerd, and TypeScript 7's native compiler. Nothing requires WSL or a dev container.
- **No shell scripts:** tasks are `vp run` or `uv run` entries, with paths built through `pathlib` or `node:path`.
- `.gitattributes` sets `* text=auto eol=lf`, so canonical JSON and fixtures hash identically on every OS. A CI job on a Windows runner runs the unit, pipeline and determinism tests.
- Docker is needed only to build the pipeline image locally, which is optional, since CI builds it. The CLI runs directly in the uv environment.

### Editor and checks

- VS Code workspace settings recommend the TypeScript 7 native language service, Ruff, Pyrefly and Tailwind IntelliSense.
- `vp check` (types, Oxlint, formatting) and `ruff check` + `pyrefly check` run as pre-push hooks and in CI.

## 16. Risks and fallbacks

Each young dependency has a named exit. Ratings: **H** = likely or costly; **M** = plausible; **L** = unlikely.

| Risk | Rating | Mitigation | Fallback |
| --- | --- | --- | --- |
| TanStack Start 1.x is weeks old; SSR or Cloudflare adapter bugs | M | Walking skeleton exercises SSR, the shell and offline on real Workers first | Start in SPA mode + prerendering; or React Router 7 framework mode |
| Service-worker bug strands users on bad code | M (high impact) | Updates never apply mid-session; the mixed-version matrix | **Kill switch:** deploy a self-unregistering service worker at the same URL; `minClientVersion` |
| Phone storage evicted, or `persist()` refused (iOS especially) | H | Recovery paths in section 6; server render on first visit always works | None needed; the experience degrades to online-only |
| Contract seams: Pydantic and Ajv disagree on an edge case | M | Round-trip golden fixtures on every change | Narrow the schema to the dialect subset both handle |
| R2 conditional-write behavior differs from the local emulator | L | The skeleton tests promotion races against real R2, not only Miniflare | Durable Object as the manifest lock |
| Cloudflare Containers / Workflows (GA Apr 2026) | M | The CLI is the core; orchestration is a wrapper | Same image on a GitHub Actions schedule |
| Polars 2.0 no longer preserves row order by default | H (if ignored) | Explicit sort keys; determinism test | — |
| Python 3.15 wheels lag for a dependency | M | Check Polars, DuckDB, Dagster and Pydantic wheels at project start | Python 3.14 |
| TypeScript 7 has no programmatic API for tools that expect one | M | Use native `tsgo` for type-checking | `@typescript/typescript6` alias for those tools |
| Vite+ 1.0 is new | L | Thin wrapper over Vite, Vitest and Oxlint | Use those tools directly |
| React Compiler mis-optimizes a component | L | Compiler lint rules | `"use no memo"` per file |
| USDA feed changes or outages | M | Raw responses kept; freshness lowers confidence; typical outlook still shown | Manual import of the report files |
| Authoring effort for quality windows (35 items × origins × 24 windows, ≥ 2 sources each) | H | Scope and gates per the product spec; a review queue in `content/` | Fewer items marked Limited evidence until reviewed |
| Concentration on one vendor (Cloudflare) | M | Portable pieces: Hono, SQLite, S3-compatible storage, a plain CLI | AWS (S3 + CloudFront + Lambda) or Vercel, with the contract unchanged |
| Drizzle stays on 0.45 longer than expected | L | Thin query layer | Kysely |

## 17. First milestone: walking skeleton

Before any feature work, deploy one thin slice that crosses every risky seam end to end. It uses real infrastructure and tiny data: 3 items, 2 zones (Bay Area and Chicago) and 1 origin each, built by the real pipeline.

**Exit criteria (all must pass, in CI where possible):**

1. **Python generation:** `pipeline build` turns a committed snapshot into a release that `pipeline verify` accepts. Building it twice gives identical hashes on Linux and Windows.
2. **Contract round trip:** TypeSpec → JSON Schema → Pydantic → canonical JSON → Ajv → rendered verdicts in a browser test, including a fixture with an unknown verdict value.
3. **Safe promotion against real R2:**
   - the publisher promotes a release with a conditional manifest write;
   - a simultaneous second promotion loses and re-checks;
   - a retry is a no-op;
   - an older snapshot is rejected.
4. **Correct-location rendering:**
   - a first visit from San Francisco renders Bay Area verdicts on the server;
   - with a saved Chicago ZIP and the service worker removed, Bay Area verdicts never paint.
5. **Offline, unvisited:** after the first visit, go offline and open an item page never visited; it renders from the local release.
6. **Interrupted update:** abort a new release's download mid-way. The previous release stays active, and the next launch completes the switch.
7. **CDN caching:** a second request for a release object returns `cf-cache-status: HIT`; the manifest is at most 60 s stale.
8. **Native Windows:** a fresh clone on Windows runs every command in section 15 successfully, with no WSL.

**Deliberately left out:** Dagster, Workflows and Containers (the skeleton promotes from CI), Turnstile, feedback, search, value markers and visual design. Each is added afterward, one at a time (principle 8), and only once the layer beneath it works.

## Sources

- TanStack, [TanStack Start 1.0 is Stable](https://tanstack.com/blog/tanstack-start-1-0)
- React, [React 19.3](https://react.dev/blog/2026/09/09/react-19-3)
- Vite, [Vite 8.0 is out](https://vite.dev/blog/announcing-vite8)
- Microsoft, [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- InfoQ, [Vite+ 1.0 stable](https://infoq.com/news/2026/10/cloudflare-viteplus-stable)
- VoidZero, [Announcing Vitest 4](https://voidzero.dev/posts/announcing-vitest-4)
- Base UI, [v1.0.0 release notes](https://base-ui.com/react/overview/releases/v1-0-0.md)
- Polars, [Pre-release of Polars 2.0](https://pola.rs/posts/announcing-polars-2/); PBX Science, [Polars 2.0 release report](https://pbxscience.com/?p=24757)
- Python, [What's new in Python 3.15](https://docs.python.org/3.15/whatsnew/3.15.html)
- Pyrefly, [v1.0](https://pyrefly.org/blog/v1.0/)
- Fireup, [Node.js 26 LTS](https://fireup.pro/news/nodejs-26-lts-whats-new-upgrade)
- Cloudflare, [Containers and Sandboxes GA](https://developers.cloudflare.com/changelog/post/2026-04-13-containers-sandbox-ga/); [Geolocation fields in Workers](https://developers.cloudflare.com/workers/examples/geolocation-hello-world/)
- TypeSpec, [1.0 GA](https://typespec.io/blog/typespec-1-0-GA-release/)
- web.dev, [Screen Wake Lock in all browsers](https://web.dev/blog/screen-wake-lock-supported-in-all-browsers); [Web Vitals](https://web.dev/articles/vitals)
- Release trackers: [Tailwind CSS](https://releases.sh/tailwind-css/tailwind-css.md), [Dagster](https://releases.sh/dagster/dagster.md), [Hono](https://socket.dev/npm/package/hono/overview/4.13.13), [Orama](https://depscope.dev/pkg/npm/@orama/orama), [Serwist](https://openapps.pro/packages/serwist), [dataframely](https://socket.dev/pypi/package/dataframely/overview/2.0.0), [Zod](https://tech-insider.org/zod-vs-valibot-vs-arktype-2026/), [Drizzle](https://www.issoh.co.jp/md/tech/7939)
- Cloudflare R2: [Workers API reference (conditional writes)](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)
- Cloudflare Workflows: [Rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)
- Cloudflare Workers: [Gradual deployments](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/); [Rate Limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- Cloudflare Cache: [Default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)
- Cloudflare Turnstile: [Content Security Policy](https://developers.cloudflare.com/turnstile/reference/content-security-policy/); Cloudflare Web Analytics: [FAQ (CSP hosts)](https://developers.cloudflare.com/web-analytics/faq/)
- Google Chrome: [Lighthouse user flows](https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md); Search Engine Journal: [Why Lighthouse doesn't include INP](https://searchenginejournal.com/why-google-lighthouse-doesnt-include-inp-a-core-web-vital/528734)
- MDN: [Storage quotas and eviction criteria](https://developer.mozilla.org/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria); WebKit: [Updates to storage policy](https://webkit.org/?p=14403)
- USDA AMS: [Market News reports](https://www.ams.usda.gov/node/21104)

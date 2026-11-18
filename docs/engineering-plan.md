# Orchard — Engineering Plan

The product spec says *what* to build and the design system says *how it looks*. This plan covers how it's built, in what order, and how much verification each part gets. Where it is silent, pick the conventional option, write it into this plan in one line, and move on.

## 1. Shape of the system

Orchard is a static, offline-capable web app plus one small Cloudflare Worker. **The data ships inside the app build**, so a deploy *is* a data release. Code and data can never disagree, the service worker's precache is the offline copy, and Cloudflare switches versions atomically.

```
content/ + data/  ──(npm run data:build: validate, derive)──>  src/generated/*.json
                                                                     │ bundled
browser ── first visit ──> Cloudflare static assets (prerendered pages, app, data)
        <── service worker precaches app + all data ──  every covered item works offline
        ── /api/* (later): feedback, requests, events ──> Worker (Hono) ──> D1
```

- **The verdict engine runs on the phone.** It is a pure TypeScript module fed by the bundled inputs: quality windows, typical origins, supply index, advisories and rules. The inputs are tiny (a few thousand ratings), so this costs microseconds. Running it on the phone gives exact-date advisories, label-based advice and planning dates for free, and the same code runs in tests and scripts. One implementation, used everywhere.
- **Verdicts are national, and the app has no location.** It never asks for, infers or stores where the shopper is; Alaska and Hawaii are covered by one sentence on the Methods page.
- **No server render.** Today and every item page are **prerendered at build time** (verdicts are national, so one static page per route works), then hydrate; if the phone's window or an active advisory differs from the baked-in verdicts, the verdict region renders client-side before first paint. So a build stays correct across window boundaries, and no scheduled rebuild is needed.

## 2. Stack

Mature, widely used tools only. At scaffold time, take the newest release whose major version has been out for at least 3 months and is supported by the plugins listed here. Pin exact versions (`save-exact`).

| Concern | Choice | Notes |
| --- | --- | --- |
| Runtime | Node 26 LTS (installed via Scoop), npm | One package, no workspace. Scripts run with `tsx` |
| Language | TypeScript 6 (`tsc -b`, project references for app, Worker and Node scripts) | |
| App | React 19, Vite 8, React Router 8 in library mode | Build-time prerendering by `scripts/prerender.ts`: `renderToString` per route, injected into the built `index.html`, then hydrated. React Compiler on. Search is an overlay, not a route |
| Styling | Tailwind CSS 4 | Design-system tokens as CSS variables in `@theme`; native `<dialog>` and hand-written disclosure buttons for simple cases. Adopt Base UI (headless and accessible) at the first complex control (popover, select, tabs, sortable table); never hand-build those |
| Offline | `workbox-build` 7.4.1 (`generateSW`, dev only) | `scripts/sw-build.ts` runs after the prerender so the precache holds every page; precache everything; updates activate on the next launch. Pages are served at clean URLs (`html_handling: drop-trailing-slash`) |
| Worker | `@cloudflare/vite-plugin`, Wrangler, Hono (for `/api` routes) | Static assets with SPA fallback |
| Write store | D1, plain SQL migrations through Wrangler | Introduced in M8. No ORM unless queries grow |
| Validation and types | zod 4.6.7, yaml 2.9.1 | One schema per content and data file; types come from `z.infer`. Content and data files are YAML, parsed by `yaml` in `data:build` only. No code generation |
| Search | MiniSearch | Prefix and fuzzy matching over names, synonyms and misspellings |
| Images | sharp 0.35.5 (dev only) | `art:process`: checks painted masters and writes WebP derivatives |
| Lint and format | Biome | One tool, one config |
| Tests | Vitest, fast-check (property tests), Testing Library, Playwright + `@axe-core/playwright` | See §6 |
| CI | GitHub Actions on `ubuntu-latest`, on each push to `main` | Typecheck, lint, unit tests, Playwright e2e against the build |
| Hosting | Cloudflare Workers (static assets) on `workers.dev` until launch | Production domain added at M9 |

## 3. Repository layout

```
CLAUDE.md  PROGRESS.md  README.md
package.json  tsconfig.json  vite.config.ts  wrangler.jsonc  biome.json  playwright.config.ts
art/
  requests/batch-N.md        ready-to-paste prompts per asset (art track, §5)
  masters/<asset-id>.png     Jared's painted masters
  manifest.json              every asset: item, variety, role, alt-text context, revision, status
public/art/                  WebP derivatives written by `art:process`
content/
  items/<item-id>.yaml       one file per item: editorial copy, origins + quality windows, varieties, type notes
  evidence/<item-id>.yaml    each source's claims about the item: origin, rated windows, specificity, directness
  panel/                     model panel: PROMPT.md, scope.yaml, and one folder per model run (run.yaml + one file per category)
  summaries.yaml             24 national half-month Today summaries
  methods.md                 Methods page text
data/
  sources.yaml               every citation: id, tier, title, publisher, url, accessed date, optional basedOn
  source-registry.yaml       what the evidence pipeline reads: the batch's items with the words naming them, and pages
                             (source id, url, kind: chart or item page, origin, parser)
  rules.yaml                 rules version + the thresholds in §4.3
  categories.yaml            browse categories in display order
  advisories.yaml            scoped, expiring exceptions
  usda/typical-origins.csv   derived from USDA (committed, with source + date header)
  usda/supply-index.csv      derived from USDA (committed)
  usda/variety-calendar.csv  derived from USDA terminal market reports (committed)
  plu.csv                    IFPS PLU codes → item and variety (IFPS permits bundling them)
  us-states.csv              state code and name, for `us-<state>` origins
scripts/                     prerender.ts, data-build.ts, content-report.ts, review.ts; usda-client.ts and usda-lib.ts (shared),
                             usda-probe.ts, usda-terminal-probe.ts, usda-terminal-screen.ts, usda-derive.ts;
                             evidence-lib.ts (shared), evidence-fetch.ts, evidence-check.ts; panel-lib.ts, panel-check.ts;
                             art-lib.ts, art-process.ts
src/
  shared/                    zod schemas, verdict engine, evidence curves, window math. Imports nothing from app/ or worker/
  app/                       React app: routes, components, styles, service worker registration
  worker/                    Cloudflare Worker: /api/*
  generated/                 data-build output (gitignored)
tests/e2e/                   Playwright smoke tests
docs/                        product spec, engineering plan, design, data findings
```

**One file per item** is deliberately also the unit of editorial review. The item list, types, categories and classes are curated by hand. Scripts that pull from external sources (`usda:*`, `evidence:*`) run only on demand, when Claude or Jared want evidence for an update: never in CI, on a schedule or in a build, and they never write to `content/`. Their output is evidence for an editorial decision, not the decision. `.cache/` holds raw USDA responses and fetched source pages and is gitignored; derived CSVs are committed so builds never need the network.

## 4. Data and the verdict engine

### 4.1 Inputs (validated by `npm run data:build`)

- **Item** (`content/items/*.yaml`): id, names, synonyms, misspellings, category, `purchaseRank`, `alwaysGood` (editorial), three cited traits, each `{ value, sources, note? }` and defined in product spec §8: `shipsWell` (P14), `storesWell` (P14; a variety may override it) and `peakWorthSeeking` (rule 4), evidence basis (`supply+assessment` or `assessment-only`), card line, pick cues (3–5), avoid cues (1–2), store and ripen ranges with ripeness assumptions (storage temperature band, ethylene producer or sensitive, and storage life, cited to the UC Davis Postharvest Center fact sheets where they cover the item), prep, type notes. Also its rated origins, each with quality windows: half-month ranges rated `prime`, `fair` or `poor` (optional for items rated by variety, where they serve only label advice by origin). Where USDA doesn't report domestic supply, the item also lists its editorial `typicalOrigins`: runs of months (`from` and `to` month labels such as `nov`, which may wrap), each with its origins ranked and flagged `major` (P9) and at least one source; only on `assessment-only` items, and never beside USDA rows for the same item. These are the editorial call; a window that departs from the evidence proposal, or whose proposal is Low confidence, carries a `reason`. Its citations come from the evidence file. Plus `status` (`draft` or `reviewed`), `reviewedOn`, `reviewer`, and `synthetic: true` on invented test data. Word limits come from product spec §8. Windows are written as half-month labels (`jun-1` is Jun 1–15, `jun-2` Jun 16–end) and may wrap past December; one origin's windows must not overlap. Origins are `us-<state>` or an ISO country code (`mx`).
- **Source:** `tier` is `authoritative` (extension, commodity board or growers' association and cooperative, USDA, UC Davis, trade reference such as a distributor's quality reports) or `mainstream` (food publication, grocer guide, trade press, a single grower-shipper's own pages). `basedOn` names the source it restates, so the two count once.
- **Seasonal evidence** (`content/evidence/<item-id>.yaml`): one entry per source claim: source, origin (`us` when the source names none, meaning US-grown), optional variety, rated windows (`prime`, `fair`, `poor`), specificity (`half-month`, `month`, `season`), directness (`eating-quality`, `availability`, `secondhand`), and a one-line paraphrase. Drafted by Claude from web research, `status: draft` until Jared reviews it. Evidence drafted before its item file waits in `content/evidence-drafts/` (`npm run evidence:check -- content/evidence-drafts`), since `data:build` rejects evidence for unknown items, and moves to `content/evidence/` with its item file.
- **Model panel** (`content/panel/<run-id>/`): AI models' own judgments of every listed item, from `content/panel/PROMPT.md` (versioned; any model can be given it), one folder per model and date: per item, origins in order of supply with rated windows and a confidence per range, varieties for items rated by variety, the four traits with confidence, and a note. A run is judgment, not a citation, and never reads other runs or the evidence. `npm run panel:check [-- <run-id>]` validates runs against `scope.yaml` (the 89 items, provisional ids until item files exist). How runs enter the evidence is P15.
- **Variety** (inside its item file): traits on the group's anchored 1–5 scales, best uses, label/PLU text, and, for items rated by variety, quality windows in the same form as an origin's (editorial, cited from evidence claims that name the variety). A variety with windows is a rated variety, and any item with one is rated by variety. A variety's windows describe it as typically sold in US supermarkets, whatever the origin. A rated variety also lists `quotedAs`: the variety calendar names it's quoted under (`pink-lady-cripps-pink`).
- **Advisory:** items, optional origins (national scope), `from` ≤ `to` ≤ `from` + 90 days, effect (`skip`, or `cap-good`), note, `reviewedOn`, `status`.
- **Typical origins:** item × month → ranked origins covering at least 70% of reported volume, each with its share of the month's volume (used by P1, never shown) and flagged `major` at 25% or more (P9). `usda:derive` writes them for the 49 listed items whose US and import supply USDA reports throughout the period, pooling 3 years per calendar month; sub-state regions fold into their state, multi-state regions (New England, Appalachia) count toward the total but are never named, and a lump sum (a row over half the item's average month and over twice its origin's next-largest row) is dropped. Where USDA doesn't report domestic supply (citrus, carrots, garlic, mushrooms, winter squash and others), the item file's editorial `typicalOrigins` take their place.
- **Supply index:** item × origin × month → value, or `null` with a reason (`no_data`, `no_baseline`, `not_reported`). Missing never becomes 0.
- **Variety calendar:** item × variety × month → the share of USDA terminal market price quotes (12 cities, 3 years) naming that variety, and the origins quoted (those on at least 10% of its market-days, at most 3). `usda:derive` writes it for apples, pears, mandarins, oranges, avocados and mangoes; a variety is a slug of USDA's name, prefixed by the commodity where the item spans several (`tangerines-tango`), and varieties never reaching 2% are left out. Evidence of presence, not volume. It says which varieties are typically in stores each month (for "best now") and cross-checks variety quality windows and typical origins.
- **PLU codes** (IFPS's exported list; IFPS has permitted Orchard to bundle it): PLU → item, variety, size, organic. Label-based advice accepts a sticker code as well as an origin.

`data:build` fails on any schema error, unknown ID, duplicate key, a rated window covered by claims from fewer than 2 independent sources, a departing or Low-confidence window without a `reason`, an inverted or over-long advisory, or a NaN. With `--production` (run first by `npm run deploy`) it also fails on any `draft` or `synthetic` record. Without it, it also loads `content/fixtures/` (synthetic items, evidence and sources that put an item in every Today section), so dev and preview builds show them and production builds never do. Schemas live in `src/shared/data/schema.ts`, the checks in `scripts/data-validate.ts`. It writes `src/generated/data.json` (the full dataset, for scripts) and `src/generated/app.json` (each item's engine inputs and display text, built in `src/shared/app-data.ts`: the only data the app bundles), and prints counts. `dev`, `build`, `typecheck` and `check:changed` run it first, since `src/generated/` is gitignored.

Editorial review is a separate step, run only when content is being reviewed or updated, never during app work: `npm run content:report` reads the built dataset and lists what an editor should settle. First, every rated window that departs from its evidence proposal or rests on Low-confidence evidence, with its reason. Then per item: the typical year as a 24-window verdict strip, and its surprises (Peak where the deciding origin's or variety's evidence isn't prime, Skip where it is prime, Peak in more than 16 windows, a Peak worth seeking that never comes); windows where a typical origin, or an in-store rated variety, has no rating; `alwaysGood` disagreeing with the typical outlook; and per rated origin, rated variety and unrated typical origin, strips of the editorial rating, the evidence proposal, its confidence and each source's curve with its weight. The editor checks the strips against their own sense of the produce before approving a batch. Helpers in `scripts/review.ts`. It never changes content.

### 4.2 Engine (`src/shared/verdict/`)

```ts
evaluate(item: ItemInputs, ctx: { date: PlainDate; mode: "today" | "typical"; labelOrigin?: OriginId; labelVariety?: VarietyId }, env: { rules: Rules; snapshotTo: YearMonth | null }): VerdictResult
// VerdictResult: verdict, ruleFired, reasons[], confidence, weakProperties[], markers[], labelNote, byOrigin, byVariety, varietyLine
```

- **Rules 1–5 in product order, first match wins:** Limited evidence → Advisory → Skip (the deciding origin poor, P9) → Peak (supply not thin, no other typical origin rated poor, and the item's editorial `peakWorthSeeking`) → Good. A `cap-good` advisory is the exception: rules 3–5 still run and Peak becomes Good.
- `mode: "typical"` (Calendar and planning dates) ignores advisories and uses the typical supply index for that month. The planning date lives in `sessionStorage` (`src/app/date.ts`), so it survives reloads in a tab and a fresh launch opens on today; it can be up to a year ahead, and once its day arrives the screens are on today again. `mode: "today"` uses the same typical supply index plus the advisories active on `date`. Supply data is a yearly snapshot, so the two modes differ only by advisories.
- **Markers:** Last call, Reliable year-round (Good or better in at least 20 of 24 windows), Advisory, Check the label (P9), and "Usually improves in…" (the next window rated Good or better).
- **Varieties:** for an item rated by variety, `byVariety` runs the rules once per rated variety, with the variety's windows in place of the origins' and the item's supply index and advisories; the item verdict and the card's variety line follow P13.
- `byOrigin` re-runs the rules once per rated origin, for "What does the label say?"; an advisory applies to a label origin it names. The label note is computed only for items rated by origin.
- **Engine details:** a missing supply index is never thin or strong. The snapshot freshness check applies only to `supply+assessment` items. Verdicts rank Peak > Good > Skip > Limited evidence, so Limited evidence never wins "best variety", and an outlook turning to Limited evidence is not a Last call drop. `ItemInputs` arrive as per-window series, built from the dataset by `verdict/inputs.ts`.
- `windowIndex(date) = (month − 1) × 2 + (day > 15 ? 1 : 0)` lives in `src/shared/time.ts`, and nowhere else.
- **Always good** is the item's editorial `alwaysGood` field. `content:report` lists any item where the field disagrees with its typical outlook (Good in all 24 windows, no Peak, no Skip) for an editor to settle.
- **Today grouping** (up to 6 Peak, sorted by fewest Peak windows in the year's typical outlook, then confidence, then `purchaseRank`, never padded; each seasonal item exactly once; always-good items left out unless an advisory changes their verdict today) is one pure function in `src/shared/today.ts`. Good buys lists the overflow Peak items first in that order, then Good by confidence then `purchaseRank`; Skip and Limited evidence go by `purchaseRank`.

### 4.3 Methodology (confirmed by Jared; revised when practice shows a better value)

Each lives in `rules.yaml` or a single function, so changing it is cheap.

- **P1 (rule 1):** Limited evidence unless the typical origins rated for the window hold at least 75% of the typical origins' combined volume (rules.yaml `ratedTypicalShare`). Unrated typical origins below that are passed over, and the rated ones decide (P9). Editorial typical origins carry no share, so every one must be rated.
- **P9:** the deciding origin is the top typical origin, unless it is rated poor and the second is rated better with evidence that isn't Low confidence; then the second decides (never Peak, since a typical origin is poor). Advisories and the supply index follow the deciding origin. The label note and the `check-label` marker appear when the typical origins' ratings include poor and something better; label advice never shows them. The second origin can take over only when it has at least 25% of the month's reported volume (rules.yaml `decidingOriginShare`); `typical-origins.csv` marks such origins with `major`, used internally and never shown as a share.
- **P10 (confidence):**
  - *coverage* is weak when rule 1 fired, or the deciding origin's (or variety's) seasonal evidence for the window is Low combined confidence (P12);
  - *relevance* is weak for assessment-only items;
  - *freshness* is weak when the yearly supply snapshot is more than 15 months old, or an active advisory wasn't reviewed this window;
  - *agreement* is weak when the top origin is prime but supply is thin, or poor but supply is strong, or when the label note applies.
  - High = no weak property, Medium = one, Low = two or more.
- **P11:** an origin's typical supply index for a month is its 3-year average volume that month ÷ its average over the months it reports volume. The engine reads the deciding origin's index (for a variety, the top typical origin's); an origin or month without one is never thin or strong.
- **Last call:** the verdict is Peak or Good and the typical outlook drops to a lower verdict within the next 2 windows.
- **P12 (combining seasonal evidence as quality curves),** in `src/shared/evidence.ts`, per item × origin, and per variety for claims that name one:
  - *source curve:* each claim's rated windows become values over the 24 windows (prime 1, fair 0.5, poor 0); windows the claim doesn't rate have no value, never 0, except for availability claims (P14). A `season`-level claim gets a soft shoulder: one window beyond each end at half the edge value, never over a window the claim rates, the higher one where two meet. `half-month` and `month` claims keep sharp edges;
  - *weight* = tier (authoritative 2, mainstream 1) × directness (eating-quality 1, availability 0.6, secondhand 0.3). The source's confidence label is High at weight ≥ 1.5, Medium at ≥ 0.6, Low below;
  - US-grown claims (`us`) apply to every US origin of the item; a source's state-specific claim replaces its US-grown claim for that state. Claims naming a variety feed only that variety's curve, whatever their origin. A source restating another (`basedOn`) counts as that source throughout: per window, one source counts once, keeping its highest-weight curve (equal weights average);
  - *combined value* per window = weighted mean of the curves covering it; prime at ≥ 0.75, poor at ≤ 0.25, fair between. No covering curve: no proposal;
  - *combined confidence* per window, from total weight, weighted spread (standard deviation) and tier: High with at least 2 independent sources, total weight ≥ 3, spread ≤ 0.2, an authoritative source among them and at least one `eating-quality` claim; Low with fewer than 2 independent sources or spread > 0.35; Medium otherwise.
- **P13 (items rated by variety):** a variety is in stores in a month when its `quotedAs` names together appear on at least 10% of the item's terminal-market days that month (rules.yaml `varietyInStoreShare`; the sum is capped at 1). The item verdict is the best verdict among in-store rated varieties. The card's variety line names the varieties holding that verdict, ordered by confidence and then by their order in the item file: one or two by name, with the first one's art; three or more as a count, with the item's art. With no rated variety in stores, the item is Limited evidence.
- **P15 (model panel),** confirmed by Jared, not yet built: each panel run becomes claims with tier `model` and directness `model`. Only each provider's latest run on the current prompt version counts; older runs stay listed in `content:report`. All counted runs share one root, so the panel is one source however many models answer: per window its value is the mean of the runs that rate it, leaving out low-confidence ranges, and it abstains where runs differ by more than one level. Its weight is 1, the same as one mainstream eating-quality source. Toward the 2-source minimum it counts only where its rating matches a cited source's; a window resting on the panel and one cited source is Medium confidence at most, because models learned from many of the same pages. It never satisfies the "authoritative source among them" or `eating-quality` conditions for High confidence, and it never rates a window alone. `content:report` shows the panel strip beside the evidence proposal and lists where they disagree, where the panel's leading origins differ from the typical origins, and where its traits differ from the editorial traits (which still cite sources), so research goes there first. The panel can't be the independent reviewer of Gate 1, since it feeds the ratings.
- **P14 (availability claims),** in `claimValues`: a harvest chart or in-season list speaks for the whole year. Its claim records only the months the source names, rated `prime` for in season; the combiner reads the window either side of each listed range as fair (never above the edge it touches) and every other window as poor, or fair where the item (or variety) `storesWell`. A US-grown claim naming no state (`us`) gets no off-season reading: only its listed windows and shoulders. An import's availability curve sits one level lower, so an import in its own season reads fair (Good) where the item `shipsWell`; where it doesn't, the import's availability curve is poor in every window. An import of an item (or variety) that `shipsWell` and `storesWell` reads only its listed windows: no shoulders, no off-season. Eating-quality and secondhand claims are read as written, so an import that sources praise can still read prime. A variety's claims span origins, so one origin's chart doesn't speak for another's season: for a variety, an availability claim's off-season reading is dropped in any window that a claim from another origin covers with its own season (its listed windows and shoulders); a national US claim (`us`) is no other origin than any state's. `traitsFor` resolves a target's traits. The `availability` directness weight (0.6) still applies.

## 5. Milestones

Each milestone takes 1–3 sessions and ends with something Jared can review. The content track runs alongside from M2 on.

| # | Milestone | Done when | Needs |
| --- | --- | --- | --- |
| M0 | **Scaffold and deploy.** Vite + React + TS app and Worker via the Cloudflare Vite plugin; Tailwind, React Compiler, Biome, Vitest, Playwright; CI; a placeholder page deployed | The `workers.dev` URL opens on Jared's phone; CI is green | Cloudflare account; Jared runs `wrangler login` once |
| M1 | **USDA probe** (runs alongside M0–M3). Fetch movement data for 5 candidate items; write a one-page `docs/data/usda.md` | Clear answers: which reports and fields, units, history depth, and whether typical origins (≥ 70%) and a supply index are computable. **If not computable, Jared decides the evidence fallback** | USDA API key |
| M2 | **Content schemas and the verdict engine.** Reference-data coverage across the launch candidates (which items USDA reports, typical origins, variety calendar from terminal markets); zod schemas, `data:build`, `rules.yaml`, engine, Today grouping; evidence curves (P12) and the evidence pipeline; `usda:derive`. 5 draft items (content batch 1) | Engine and evidence tests pass (§6). Jared reviews batch 1 through `npm run content:report`: per item, each source's curve, the proposal with its confidence strip, the editorial ratings and the resulting verdicts | — |
| M3 | **Today and item page, styled.** Tokens from the design system, verdict marks, cards that expand in place (with the variety line and variety art), item page in product order with the variety strips, date chip (display), draft badge in previews; build-time prerendering of Today and item pages; the art workflow (art track below) with the first batch of thumbnails | **Jared's first real review on his phone** | — |
| M4 | **Offline in the store.** Precache downloaded in the background after the first load, readiness line on Today (counts precached item pages), updates that activate on the next launch | E2E: after one visit, go offline and open an item never visited | — |
| M5 | **Date, advisories and label advice.** Planning date with the typical-outlook banner; "Share for this date"; national advisories; label-based advice (origin or variety, plus PLU code if licensed); recompute at midnight and on `visibilitychange` | Unit tests for window math; e2e for a pinned date | — |
| M6 | **Browse, search, Calendar, Methods.** Categories; MiniSearch with synonyms and misspellings; no-match flow; Calendar as a month list on phone and a heatmap with a table equivalent on wider screens; Methods and privacy pages; headless component library adopted here or in M5, whichever first needs a complex control | Every item reachable in ≤ 3 taps or one search; "scallion" and "corriander" find the right items | — |
| M7 | **Variety guides:** apples, mandarins & oranges, pears: traits, finder, cards on phone, a sortable table on wider screens, variety pages | Jared reviews the 3 guides | Variety content |
| M8 | **Feedback and measurement.** D1 tables; feedback, taste, request and event endpoints; rate limiting; `web-vitals` + `verdict-visible` beacon; privacy-safe logging | A test proves no IP reaches logs or D1; a feedback row records app version, date, item, and the label origin or variety when the shopper set one. `content:report` then flags any item × window whose Peak or Good verdict draws at least 30% "Disappointing" taste answers or "Looked poor" over at least 20 responses, and any Peak that fails the audit, so the editor reviews those windows; a flag never changes a verdict by itself | — |
| M9 | **Launch readiness.** All launch content reviewed, illustrations, Turnstile, CSP and security headers, axe plus a quick VoiceOver/TalkBack pass, a performance check on a mid-range Android, offline check on a real iPhone, production domain | Jared decides launch once Gate 1 (product spec §12) is met | Domain, devices, the independent reviewer |

**Content track.** Claude drafts in batches of about 10 items (5 in M2), all marked `draft`. Research is mostly programmatic, so AI effort goes to judgment, not gathering:
  1. **Source registry** (`data/source-registry.yaml`, curated): built once by category, then extended as items need. Sources about eating quality come first, for the origins that actually supply supermarkets (the item's typical origins: Washington, California, Mexico, Chile and so on): commodity boards' variety and season guides, UC Davis postharvest fact sheets, trade quality references and food publications' tasting guides. Harvest charts fill in timing, preferably from the producing state or country rather than a local one. Before an item goes to review, every rated origin and variety should have at least one eating-quality claim; without one its windows stay at Medium confidence at best (P12). Pages the pipeline can't fetch may be read in a browser for research, but only fetched pages give excerpts. No search API unless the registry proves too thin.
  2. **`npm run evidence:fetch`** downloads each registered page once (robots.txt respected, cached in `.cache/evidence/`), strips it to text, and writes per-item excerpts (`.cache/evidence/excerpts/`): only the passages naming the item with a season or month. Charts get a parser and become draft claims directly, with no AI (`.cache/evidence/parsed/`, copied into `content/evidence/` when a batch is drafted); `item-months` reads item-to-months rows ("Apples | June–October", "Strawberry: December through April"). Prose excerpts go to `.cache/evidence/worklist.md`. A page whose robots.txt disallows the pipeline is skipped and dropped from the registry.
  3. **Prose excerpts** (the worklist) go to a Haiku subagent with a compact worklist (excerpts only, a few hundred words per item), which returns draft claims in the evidence-file format.
  4. **`npm run evidence:check`** (`-- <dir>` to check parser drafts) rejects any claim whose source isn't a registered page, or whose ranges' first and last months (or, for a `season` claim, their seasons) aren't named in its excerpt, or whose URL no longer resolves, and records the accessed date in `sources.yaml`.
  5. **`data:build`** combines the curves (P12). Then Claude (Opus) reads only a per-item digest (the proposal, its confidence strip, and the excerpts behind Low-confidence or conflicting windows), writes a `reason` for each of those, and drafts the copy. High-confidence windows seed the draft without deliberation.
  Claims are paraphrased; raw pages stay in the gitignored cache. Research runs only when a batch is being drafted or Jared asks for a refresh. Jared reviews in the preview app or the content report (per item and origin: each source's curve, the combined curve with its confidence strip, and the editorial rating; Low-confidence and departing windows first), and approves or edits. Approval means Claude sets `status: reviewed`, `reviewer`, and `reviewedOn`. Order: the 5 M2 items → the rest of the 30 first-release items → the other listed items, always-good items last → variety guides → the 24 summaries → Methods text.

**Art track.** Jared generates all painted artwork with his ChatGPT subscription, the same tool that made the design language and the mockups in `docs/design/references/`. Claude never generates images. The workflow is built in M3, when the first item art is needed, and then runs in batches alongside the content track. Batches follow `purchaseRank` within two tiers, seasonal items first and then always-good items, so the most commonly bought seasonal produce is illustrated first. An item rated by variety gets its varieties' art in the same batch as its own.

1. **Request.** Claude writes a batch file `art/requests/batch-N.md`. It holds one block per asset: the asset ID (`persimmon-fuyu-thumbnail-v1`, per the illustration guide), its class and display size, a ready-to-paste prompt assembled from illustration guide §2, the botanical checks, and the export settings (transparent background, size).
2. **Generate.** Jared pastes each prompt into ChatGPT, keeping one conversation per batch so the style stays consistent. He saves each result as `art/masters/<asset-id>.png`.
3. **Process.** `npm run art:process` checks each master (square, at least 1024 px, a real alpha channel with a mostly clear canvas, the painting clear of every edge, no pale halo), writes WebP derivatives at 160, 320 and 640 px to `public/art/`, moves the asset from `requested` to `review`, and writes a contact sheet of every asset over ivory and warm charcoal (`.cache/art/contact-sheet.html`). Masters and derivatives are committed.
4. **Review.** Jared approves or rejects each asset from the contact sheet; Claude records it in `art/manifest.json` (asset ID, item, variety, role, alt-text context, revision, status: `requested`, `review`, `approved` or `rejected`). The batch's entries are added as `requested` with the batch file. A rejected asset gets a targeted revision prompt (§2 F) in the next batch.
5. `data:build` validates the manifest and picks each item's and variety's asset: the highest approved revision, or in dev and preview the highest approved or `review` one. Production builds ship only approved art and refuse an item without it. A variety without its own art shows the placeholder, never its item's painting (illustration guide: one specimen never stands for several varieties). Missing art shows a mostly transparent placeholder of the same size, so layouts don't shift while the art catches up.

**After v1 (v1.1+):** value markers; named-chain notes; Spanish; location-aware context (regional advisories, local harvest) only if usage shows a need.

## 6. Verification

| Area | What runs | Depth |
| --- | --- | --- |
| Verdict engine, Today grouping, window math | Vitest: a table-driven case per rule and per precedence pair; fast-check invariants (advisory decides unless rule 1 fired; no Peak on thin supply; no Peak while a typical origin is poor; no Peak without `peakWorthSeeking`; typical mode ignores advisories; `byOrigin` and `byVariety` equal re-running the rules; value inputs never change a verdict, once they exist) | **Thorough.** This is where correctness lives |
| Evidence curves (P12) | Vitest table cases per rule; fast-check invariants (the combined value lies between the covering curves' minimum and maximum; an uncovered window has no proposal; adding a claim that agrees with the proposal never lowers its confidence; `basedOn` sources count once) | Thorough |
| Content and data | `data:build` validation, plus one broken-input fixture per check | Thorough |
| UI components | Typecheck, plus a test only where a component carries a product rule | Light |
| End to end | Playwright smoke in Chromium: Today renders, open an item, offline after the first visit, axe finds no violations. WebKit added at M9 | A handful of tests |
| Visual | Screenshots at 375 px and one wide width, shown to Jared | No baseline suites |

Run the tests for what you touched while working. Run the full suite before pushing. CI runs everything on each push.

## 7. Operations

- **Deploy:** `npm run deploy` (build, then `wrangler deploy`) from a machine signed in with `wrangler login`. Move deploys into CI when it becomes convenient, using a scoped API token in a GitHub secret.
- **Data refresh:** on demand, usually with the yearly content review. `npm run usda:derive` rewrites the typical-origins and supply-index CSVs from the last 3 years; Jared reviews the diff before it is committed and deployed. Items without usable USDA data use cited editorial origins and a `null` supply index. Seasonal evidence refreshes the same way: `evidence:fetch` and `evidence:check`, reviewed like content.
- **Stale data:** each build records its supply snapshot's date range. When the snapshot is more than 15 months old (a missed yearly refresh), freshness lowers confidence and the item page says so; the app never pretends to be current.
- **Privacy:** no accounts, cookies or location. The Worker never logs URLs, query strings, bodies or IPs; automatic invocation logs are turned off at M8. D1 stores the date, never anything about where the shopper is.
- **Rollback:** redeploy the previous Worker version (`wrangler rollback`). Data rolls back with it.

## 8. Deliberately not built

Don't add these unless Jared asks:

- separate data releases, R2 buckets, manifests, a publisher Worker, IndexedDB release slots;
- TypeSpec and generated contracts, a Python pipeline, Dagster, Cloudflare Workflows and Containers;
- a mixed-version test matrix, gradual deployments, a full boot guard (the small pre-paint check in §1 is the only one), nonce-based CSP for server rendering;
- any location feature: state or ZIP lookup, regional advisories, harvest zones, local-harvest calendars, region-month summaries;
- Windows CI runners, cross-OS byte-for-byte builds, screenshot baselines, Lighthouse CI, Trusted Types, Renovate.

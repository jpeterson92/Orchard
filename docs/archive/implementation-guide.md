# Seasonal Produce Guide — Implementation Guide for a Coding Agent

Nov 16, 2026 · @Jared Peterson

> **Archived Nov 16, 2026. Not instructions.** Superseded by [docs/engineering-plan.md](../engineering-plan.md) after decisions D1–D3 ([pre-build review](../reviews/2026-11-16-pre-build-review.md)). Kept for reference detail only: failure states, readiness copy, CSP directives, D1 fields, event names.

## How to use this guide

This guide turns the product and engineering specifications into 16 milestones (M0–M15), ordered by dependency, that a coding agent carries out starting from an empty repository. The two specifications still define *what* to build. This guide defines the order of work, the interfaces, how each step is verified, and what to do when something fails.

**A fresh session reads, in this order:**

1. `AGENTS.md`
2. `PROGRESS.md`
3. §1 of this guide (invariants and decisions)
4. The current milestone in §3
5. Only the specification sections that milestone links to

**When documents disagree, authority runs:**

1. The user's explicit instructions and accepted decisions, recorded in `docs/decisions/`
2. The product specification, for behavior
3. The engineering specification, for architecture and technology
4. This guide, for sequencing and for the conflicts it resolves (§1.5)
5. Review feedback, which is a recommendation unless accepted. The engineering review is already folded into the engineering spec.

This guide's resolutions apply until the user overrides one.

**Evidence labels used throughout**

| Label | Meaning | What the agent does |
| --- | --- | --- |
| **Verified** | Confirmed in current primary documentation (linked) | Rely on it, and still test it |
| **Assumption** | Believed true, not confirmed by primary docs | Confirm cheaply in the named milestone and record the result |
| **Experiment** | Integration behavior the docs don't settle | Run the named experiment against its pass criteria before building on it; record the outcome as a decision |
| **Needs user** | Credentials, hardware, money, editorial judgment or a product decision | Build everything around it, list it as blocking in `PROGRESS.md`, and continue with unblocked work |

Global rules live in one place each: invariants in §1.4, verification rules in §7, agent workflow in §8. Milestones refer to them by ID (`I-n` for invariants, `F-n` for failure scenarios) instead of repeating them.

**Specifications in the repository:** at M0 the user exports both specifications and this guide to Markdown under `docs/specs/` (product-spec.md, engineering-spec.md, implementation-guide.md). Agents read those copies, not the web versions.

## 1. Orientation, decisions and invariants

The system computes every verdict ahead of time, publishes it as an immutable release, and serves that release to an edge web app that keeps a full copy on the phone. Correctness depends on 15 invariants (§1.4) holding across every milestone, deploy and data update.

### 1.1 System and boundaries

The system deploys four units, uses two storage services and shares one contract (engineering spec §3 has the architecture diagram).

| Unit | Owns | May not |
| --- | --- | --- |
| `apps/web`: web Worker (TanStack Start) | Pages, service worker, the on-device release | Import `services/*`; hold any R2 or D1 binding; write anything except through `/api/*` |
| `services/api`: API Worker (Hono) | `/v1/*` endpoints, the D1 database | Read or write release buckets; render verdicts |
| `services/publisher`: publisher Worker | Making a release live; the weekly schedule (from M12) | Compute data; accept a release it hasn't verified |
| `services/pipeline`: Python CLI | Ingestion, every transform, the verdict engine, release files | Write the manifest; call the network during `build` |
| `packages/contract` | TypeSpec source and generated artifacts | Contain hand-written logic beyond enum normalizers |

- **Storage:** four R2 buckets (`pg-inputs`, `pg-releases`, `pg-manifest`, `pg-preview`) and one D1 database per environment.
- **Reading releases:** the web Worker and the phone read releases over HTTPS from the `data.` and `live.` hosts, not through bindings (decision R2 below).

### 1.2 Governing documents

| Document | Governs | Version used |
| --- | --- | --- |
| [Product specification](https://claude.ai/artifact/Wmq62uiUHEse1s2QGd28Li) | Behavior, verdict methodology, scope, release gates | Rev 38, Nov 16 2026 |
| [Engineering specification](https://claude.ai/artifact/PUFL9XWKz9DWdyFHaCPNKg) | Architecture, technologies, protocols | Rev 43, Nov 16 2026 (includes the independent review) |
| This guide | Sequencing, interfaces, verification, resolved conflicts | Nov 16 2026 |

### 1.3 Version identities

These are seven different things, and none of them substitutes for another.

| Identity | Form | Set by | Changes when | Used for |
| --- | --- | --- | --- | --- |
| App version | semver + build ID (git short SHA), e.g. `1.4.0+3f2a9c1` | Web build | Any web deploy | Service-worker cache names, `minClientVersion` checks, events, feedback |
| API version | URL major `/v1` + build ID in `x-api-build` | API build | Breaking API change = `/v2` | Mixed-version tests |
| Contract version | semver in `packages/contract/package.json` | Contract change | Additive = minor, breaking = major (engineering spec §10) | Every published document carries it; clients accept the same major |
| Rules version | `version:` field in `data/reference/rules/v1.yaml`, plus the file's SHA-256 in provenance | Rules edit | Any threshold or rule change | Stamped in releases and feedback |
| Snapshot ID | SHA-256 of the snapshot manifest | `pipeline snapshot` | Any input change | Reproducing a build |
| Run key | SHA-256 of (snapshot ID, image digest, rules version, contract version) | Publisher protocol | Any input to a build | Idempotent retries |
| Release ID + sequence | ULID + monotonic integer | Release ID: build start. Sequence: promotion | Each new build / each promotion | The published dataset's identity and order |

### 1.4 Invariants (must hold in every milestone)

| ID | Invariant | Verified by |
| --- | --- | --- |
| I-1 | Every verdict shown, on the server or the phone, comes from exactly one release. The page exposes that release ID (`data-release` on `<main>`). | End-to-end test comparing the DOM release ID with the manifest used |
| I-2 | The live manifest references only objects that exist and pass their hash and schema checks | Publisher tests; post-promotion smoke test fetches every part |
| I-3 | `sequence` strictly increases; a release built from an older snapshot than live is rejected. Rollback is a new, higher sequence. | F-5 |
| I-4 | The same run key produces byte-identical objects, on Linux and Windows | Build twice and compare hashes, in CI on both operating systems |
| I-5 | The phone replaces its active release only with a fully downloaded, hash- and schema-valid release, in one IndexedDB transaction | F-1, F-8 |
| I-6 | With an active release on the phone, the first verdict renders without waiting on any network request | End-to-end test with the network blocked at launch |
| I-7 | No frame paints verdicts for a place or date window other than the resolved one | F-3, F-4 (first-frame capture) |
| I-8 | Verdicts are unchanged by any price or promotion input | Property test + import-boundary lint |
| I-9 | Published data contains no NaN or Infinity. Missing values are explicit `null` with a reason code; a zero baseline yields a `null` supply index | Semantic checks; F-7 |
| I-10 | An unknown enum value never crashes rendering and never renders as a known verdict | F-6 |
| I-11 | No server store or log holds an IP address, ZIP, coordinates, query string or search text; precise coordinates never leave the phone | Log-capture test; D1 schema review; network assertion in the precise-location test |
| I-12 | Only the publisher Worker can write `pg-manifest`; preview deployments cannot write production stores | Credential inventory check; a deliberate failing write from preview |
| I-13 | Each web or API version works with the previous version of the other, and with every release in the support window | Mixed-version matrix (§6.3) |
| I-14 | Each feedback row carries enough (release ID, rules version, target date, zone, item, chosen origin) to recompute the verdict the shopper saw | Reconstruction test (M11) |
| I-15 | Today uses the current assessment. Any other date uses the typical outlook, under a "Typical outlook" banner. Advisories never apply past their end date | Unit tests + pinned-date end-to-end test |

### 1.5 Conflicts and how this guide resolves them

| # | Conflict | Resolution | Status |
| --- | --- | --- | --- |
| C1 | **Offline scope.** The product spec promises "every viewed item page"; the engineering spec makes every covered item work offline | Adopt the engineering spec; it is a superset. Product spec wording can be updated later | Resolved |
| C2 | **Precise location.** The product spec offers "Use my precise location" and never sends precise location to a server; the engineering spec doesn't handle it | Map coordinates to a zone **on the phone**, using a small grid lookup published with each release (§5.3) | Resolved (method provisional, P4) |
| C3 | **Read-only bindings.** The engineering spec gives web and API Workers "read-only bindings" to R2. R2 bindings have only `binding` and `bucket_name`, and a bound bucket can read, list, write and delete ([R2 demo](https://developers.cloudflare.com/r2/examples/demo-worker/)) | Web and API get **no** R2 bindings and read releases over HTTPS from the CDN hosts (R2) | Resolved |
| C4 | **Pre-rendered pages.** The engineering spec calls them "immutable per deploy", but they live at stable URLs | Stable URLs revalidate (`no-cache`); only hashed assets are immutable (R6) | Resolved |
| C5 | **Serialized search index** cached across releases, built in a Web Worker | Build the Orama index in memory on first use from the release's search documents; never persist it. \~200 documents is small. Move to a Web Worker only if measured build time at p75 on a mid-tier Android exceeds 50 ms (R4) | Resolved (departure, justified by simplicity) |
| C6 | **Rule 1 wording.** The product spec says the assessment "doesn't cover the origins that typically supply"; the engineering spec's test says assessed share < 70% | Literal product reading: Limited evidence unless **every** typical origin has a reviewed rating for that window. Align the engineering test to it | Provisional (P1, user to confirm) |
| C7 | **Supply index "this month"** during a weekly run is a partial month | Use the latest complete calendar month. The denominator is the prior 36 months' total ÷ 36, as defined | Provisional (P2) |
| C8 | **Boot guard checks only place**, but the server's time zone can differ from the phone's near midnight or a half-month boundary | The boot guard compares place **and** date window (R7) | Resolved |
| C9 | **Weekly orchestration first.** The engineering spec's architecture runs the weekly job on Workflows + Containers, while its principle 8 says to add infrastructure one layer at a time | GitHub Actions runs the CLI on a schedule until M12; Workflows + Containers replace it in M12 (R10) | Resolved |
| C10 | **Product NFR "supply data refreshed monthly"** vs a weekly engineering run | Compatible: the weekly run produces a new release only when the run key changes, so an unchanged snapshot republishes nothing | Resolved |

### 1.6 Decision register

Statuses: **Resolved** (do it), **Provisional** (do it, flag for confirmation, isolate it so changing it is cheap), **Needs user** (blocking only for the milestone named).

| ID | Decision | Status | Needed by |
| --- | --- | --- | --- |
| R1 | `AGENTS.md` is canonical; `CLAUDE.md` is one import line, `@AGENTS.md`, the mechanism Claude Code documents ([docs](https://code.claude.com/docs/en/memory)) | Resolved | M0 |
| R2 | No R2 bindings in web or API; read releases over HTTPS from `data.`/`live.` with a CORS policy for the app origin | Resolved | M4 |
| R3 | The publisher Worker also hosts the cron trigger, the Workflow and the Container class (one ops Worker, not two) | Resolved | M12 |
| R4 | Search index built in memory, never persisted (C5) | Resolved | M9 |
| R5 | `/api/*` on the app host is forwarded by the web Worker to the API Worker over its Service Binding (same origin, no CORS) | Resolved | M5 |
| R6 | HTML: `Cache-Control: no-cache`. Hashed assets: `public, max-age=31536000, immutable` via `_headers`. Static assets otherwise default to `max-age=0, must-revalidate` with an ETag ([docs](https://developers.cloudflare.com/workers/static-assets/headers/)) | Resolved | M5 |
| R7 | Boot guard compares place and date window (C8) | Resolved | M7 |
| R8 | Content-addressed release objects; RFC 8785 canonical JSON; values rounded to 3 decimals | Resolved | M2 |
| R9 | Open enums via TypeSpec unions with a `string` variant, the documented extensible-enum pattern ([TypeSpec Azure guide](https://azure.github.io/typespec-azure/docs/troubleshoot/enum-not-extensible)) | Resolved | M1 |
| R10 | GitHub Actions schedule until M12; afterwards only a manual `workflow_dispatch` of the same CLI remains, for recovery | Resolved | M4 |
| R11 | DuckDB lives in an optional `explore` dependency group. Production code never imports it, and its wheels may lag new Python releases | Resolved | M0 |
| P1 | Rule 1 = every typical origin rated (C6) | Provisional | M2 |
| P2 | Supply index uses the latest complete month (C7) | Provisional | M3 |
| P3 | Advisories scope by zone IDs or price-region IDs, expanded to zones at build time | Provisional | M2 |
| P4 | Precise location: 0.25° grid over the 50 states, each cell assigned to its majority zone, built from Census cartographic boundary files | Provisional | M7 |
| P5 | ZIP → zone from Census ZCTA–county relationship files; unmatched ZIPs fall back to their 3-digit prefix's state | Provisional | M7 |
| P6 | Retention: 8 weeks of releases plus the newest release per supported contract major for ≥ 180 days; feedback 24 months; item requests 12 months | Provisional | M12 |
| P7 | Rate limits: 30/min writes, 120/min ZIP, 60/min event batches, per IP + route | Provisional | M11 |
| P8 | Python 3.15 unless M0 finds a blocking wheel gap, then 3.14 | Provisional | M0 |
| P9 | When typical origins' ratings differ, the verdict follows the top-ranked origin; the label note appears only when they differ by more than one level (§4.3) | Provisional | M2 |
| P10 | Computable definitions of the four confidence properties (§4.3) | Provisional | M2 |
| P11 | Typical-outlook supply index = 3-year same-month average ÷ 36-month average (§4.3) | Provisional | M2 |
| N1 | Cloudflare account, API tokens, and a domain (`workers.dev` is enough until M4) | Needs user | M0 deploy, M4 |
| N2 | USDA My Market News API key | Needs user | M3 |
| N3 | California and Florida north/south split (county lists) | Needs user | M14 (fixtures until then) |
| N4 | Editorial content: quality windows (\~100 origin profiles, ≥ 2 citations each), 53 zone calendars, item and variety text, 96 region-month summaries, \~35 illustrations | Needs user | M14 |
| N5 | Product name and domain | Needs user | M13 |
| N6 | Two independent reviewers (back-test and audits) | Needs user | M14 |
| N7 | A real iPhone and a mid-tier Android phone, for device checks | Needs user | M10, M13 |

**Not the agent's to decide:** verdict methodology, thresholds and quality ratings. The agent implements the rules as written, builds tooling that validates editorial data, and labels every synthetic fixture `synthetic: true`. It never authors real quality ratings, calendars or advisories.

## 2. Repository and developer foundation

The project is one repository with hard internal boundaries, two lockfiles (JS and Python) and one generated-contract directory, and it runs natively on Windows, macOS and Linux. Commands marked **‡** are project commands that a milestone has to implement; everything else is an existing tool command.

### 2.1 Layout and ownership

```
produce-guide/
  AGENTS.md                 canonical agent instructions (§2.2)
  CLAUDE.md                 one line: @AGENTS.md
  PROGRESS.md               the only status file (§9)
  docs/specs/               product-spec.md, engineering-spec.md, implementation-guide.md (exported, read-only)
  docs/decisions/           NNNN-short-title.md decision notes (§8.3)
  docs/data/                findings about real sources (e.g. usda-probe.md)
  apps/web/                 TanStack Start app = web Worker; src/sw.ts = service worker
  services/api/             Hono API Worker; drizzle/ migrations
  services/publisher/       publisher Worker (promotion; cron/Workflow/Container from M12)
  services/pipeline/        Python uv project: src/pipeline/{cli,ingest,snapshot,build,verify,upload,verdict,checks,io}
  packages/contract/        src/*.tsp + generated/ (never hand-edited)
  packages/ui/              Base UI wrappers, tokens
  packages/fixtures/        golden/ (contract), snapshots/small/ (synthetic), usda/ (trimmed real responses, M3)
  content/                  items, varieties, type notes, methods, region-month summaries (YAML + Markdown)
  data/reference/           quality_windows, harvest_calendars, advisories, zones, zip_zone_map, commodity_map, rules/v1.yaml
  infra/                    Cache Rules, R2 CORS policies, bucket list (JSON, applied by a ‡ script)
  tools/                    small cross-platform Node scripts (data:serve, contract:gen, checks)
  .github/workflows/        ci.yml, deploy.yml, weekly.yml (until M12), content.yml
```

- Ownership follows §1.1. A lint rule enforces the import boundaries; it is configured in M0.
- `content/` and `data/reference/` hold editorial inputs. The agent writes their **schemas and validators**; real values come from the user (N4).

### 2.2 Agent instruction files

`AGENTS.md` is the single instruction file. Claude Code reads `CLAUDE.md` rather than `AGENTS.md`, and its documentation recommends a `CLAUDE.md` that imports `AGENTS.md` with `@AGENTS.md` ([Claude Code memory docs](https://code.claude.com/docs/en/memory)). On Windows, use the import, not a symlink: a symlink needs Administrator rights or Developer Mode (same source). Keep `AGENTS.md` short and operational, and link to the specs rather than copying them.

`CLAUDE.md`, complete:

```
@AGENTS.md
```

`AGENTS.md`, starting version (M0 creates it; later milestones add only commands that now exist):

```markdown
# Seasonal Produce Guide: agent instructions

## Read first, every session
1. PROGRESS.md: current milestone, next action, blockers.
2. docs/specs/implementation-guide.md §1 (invariants I-1..I-15, decisions) and the current milestone in §3.
3. Only the spec sections that milestone links to (docs/specs/product-spec.md, docs/specs/engineering-spec.md).

## Map
- apps/web: TanStack Start web Worker + service worker. No R2/D1 bindings.
- services/api: Hono API Worker; sole owner of D1.
- services/publisher: sole writer of the manifest bucket.
- services/pipeline: Python CLI; all transforms; verdict engine in src/pipeline/verdict/.
- packages/contract: TypeSpec in src/; generated/ is never edited by hand.
- content/, data/reference/: editorial inputs. Never invent real values.

## Commands (only those that exist; see guide §2.4)
- Install: vp install && uv sync --project services/pipeline
- Check: vp check && uv run --project services/pipeline ruff check && uv run --project services/pipeline pyrefly check
- Test: vp test && uv run --project services/pipeline pytest

## Rules
- One milestone task at a time. Small diffs. Never mix refactoring, upgrades, formatting and features.
- Never hand-edit generated files. Never weaken validation, types, tests or security controls to get green.
  Investigate before changing a failing expectation or snapshot.
- Never invent verdict methodology, thresholds, quality ratings, calendars, advisories or product requirements.
  Synthetic fixtures carry `synthetic: true`.
- One implementation per shared behavior (window math, verdict rules, enum normalizers, place resolution).
  Search the repo before writing a helper.
- A new direct dependency, deployed service or large abstraction outside the design needs a decision note
  in docs/decisions/ first (the requirement + the simpler alternative considered). It is a note, not an approval request.
- Failures stay visible: no catch-all handlers returning plausible substitutes.
- No secrets in git or logs. Logs use route templates only: never ZIPs, query strings, bodies or coordinates.
- Must work on Windows, macOS and Linux: no shell-only scripts; use vp run / uv run tasks and path APIs.

## Definition of done
Acceptance criteria met; checks run; evidence recorded in PROGRESS.md as implemented / automatically verified /
manually verified / unverified; review questions in guide §8.5 answered; next concrete action written.
Then continue with the next unblocked task without asking for confirmation.
```

### 2.3 Dependencies and locking

- **JavaScript:** a pnpm workspace driven by Vite+. `vp install` installs dependencies, and the `packageManager` field selects the package manager ([Vite+ guide](https://viteplus.dev/)). Commit `pnpm-lock.yaml` and pin exact versions. Node 26 LTS.
- **Python:** one uv project at `services/pipeline` with a committed `uv.lock` and `requires-python` set by P8. Dependency groups:
  - `dev`: pytest, Hypothesis, Ruff, Pyrefly, datamodel-code-generator.
  - `explore`: DuckDB and notebook tools (R11). DuckDB's wheels stopped at cp314 when Python 3.15 shipped, so it built from source ([Kanaries, Python 3.15 guide](https://docs.kanaries.net/topics/Python/python-3-15-upgrade-lazy-imports)).
- **Contract tools** are dev dependencies of `packages/contract`: `@typespec/compiler`, `@typespec/json-schema`, `@typespec/openapi3`, `json-schema-to-typescript`, `ajv`, `ajv-formats`.
- **Upgrades** are their own changes, never mixed with feature work. From M13, Renovate applies them with a 7-day minimum release age.

### 2.4 Commands

| Command | Kind | What it does | Exists from |
| --- | --- | --- | --- |
| `vp install` | Tool | Install the JS workspace | M0 |
| `uv sync --project services/pipeline` | Tool | Create or refresh the Python environment from `uv.lock` | M0 |
| `vp check` | Tool | Format, lint and type checks in one pass | M0 |
| `vp test` | Tool | Vitest (unit + browser mode) | M0 |
| `vp run dev` ‡ | Project | Web Worker + API Worker in workerd via the Cloudflare Vite plugin (Assumption: auxiliary-Worker support, confirmed in M0) | M0 |
| `uv run --project services/pipeline pipeline <cmd>` ‡ | Project | `ingest`, `snapshot`, `build`, `verify`, `upload` (§4.2) | M2–M4 |
| `uv run --project services/pipeline pytest` | Tool | Pipeline tests | M0 |
| `vp run contract:gen` ‡ | Project | TypeSpec → schemas → Pydantic, TS types, Ajv validators, normalizers | M1 |
| `vp run contract:check` ‡ | Project | Regenerate into a temp dir and fail on any diff | M1 |
| `vp run data:serve` ‡ | Project | Serve `.out/publish/` as the local `data.`/`live.` hosts with CORS headers (a \~30-line `node:http` script, no new dependency) | M5 |
| `vp run e2e` ‡ | Project | Playwright suites against local or a deployed URL (`BASE_URL`) | M5 |
| `vp run deploy:<env>` ‡ | Project | Build, then `wrangler deploy` with that environment's config | M0/M4 |
| `vp run infra:apply` ‡ | Project | Apply the `infra/` CORS policies and Cache Rules via the Cloudflare API | M4 |

### 2.5 Environment variables, secrets and bindings

No real values in git. `.env.example` lists every name. Local Worker secrets go in each Worker's `.dev.vars` (gitignored); CI secrets live in GitHub environment secrets.

| Name | Kind | Used by | Scope | From |
| --- | --- | --- | --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | Variable | CI | — | M0 |
| `CLOUDFLARE_API_TOKEN` | Secret | CI deploy jobs | Workers scripts + routes, D1, Cache Rules. **No R2 object access** | M0 |
| `R2_ENDPOINT` | Variable | Pipeline (CI, container) | Account S3 endpoint | M4 |
| `PIPELINE_R2_ACCESS_KEY_ID`, `PIPELINE_R2_SECRET_ACCESS_KEY` | Secret | Pipeline jobs, container | Object Read & Write on `pg-inputs` + `pg-releases` only. R2 tokens can be bucket-scoped ([R2 tokens](https://developers.cloudflare.com/r2/api/tokens/)) | M4 |
| `PREVIEW_R2_ACCESS_KEY_ID`, `PREVIEW_R2_SECRET_ACCESS_KEY` | Secret | Preview jobs | Object Read & Write on `pg-preview` only | M4 |
| `PUBLISH_TOKEN` | Secret | CI (caller); publisher Worker secret | Authorizes *asking* for promotion; the publisher still verifies everything | M4 |
| `MARS_API_KEY` | Secret | Local `.env`, pipeline jobs | USDA basic-auth username | M3 |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Variable / secret | Web / API | Outside production, the documented test pair `1x00000000000000000000AA` / `1x0000000000000000000000000000000AA` ([Turnstile testing](https://developers.cloudflare.com/turnstile/troubleshooting/testing/)) | M11 |
| `APP_ORIGIN`, `DATA_ORIGIN`, `LIVE_ORIGIN` | Variable | Web, API, publisher | Per environment | M4/M5 |

| Worker | Binding | Type | From |
| --- | --- | --- | --- |
| web | `API` | Service Binding → API Worker | M0 |
| api | `DB` | D1 | M11 |
| api | `RL_WRITE`, `RL_ZIP`, `RL_EVENTS` | Rate limiting | M11 |
| publisher | `MANIFEST` | R2 `pg-manifest` (the only binding to it anywhere) | M4 |
| publisher | `RELEASES` | R2 `pg-releases` (used for verification reads) | M4 |
| publisher | `PIPELINE`, `WEEKLY` | Container, Workflow | M12 |

### 2.6 Local fixtures and platform emulation

- `packages/fixtures/snapshots/small/` is a synthetic snapshot: 5 items, 3 zones, 2 origins each, 24 windows, with deliberate edge cases (a zero baseline, an origin with no rating, an active advisory, a "depends on the label" item). Every file says `synthetic: true`.
- `packages/fixtures/golden/` holds valid and invalid contract documents (§4.8).
- `packages/fixtures/usda/` holds trimmed real responses captured in M3, with the API key removed from any recorded request.
- **Local platform:** `wrangler`/Vite local mode emulates D1 and R2 under `.wrangler/state`. The web app reads releases from `vp run data:serve` (default `http://localhost:8788`), the same HTTPS code path it uses in production.

### 2.7 Generated code

| Output | Location | Generator | Consumer |
| --- | --- | --- | --- |
| JSON Schema 2020-12 | `packages/contract/generated/schema/` | `@typespec/json-schema` | Everything below |
| OpenAPI 3.1 | `packages/contract/generated/openapi.yaml` | `@typespec/openapi3` | API docs; type fallback (§4.8) |
| Pydantic v2 models | `packages/contract/generated/python/produce_contract/` | `datamodel-codegen --input-file-type jsonschema --output-model-type pydantic_v2.BaseModel` | Pipeline (path dependency) |
| TS types | `packages/contract/generated/ts/types.ts` | `json-schema-to-typescript` | Web, API |
| Validators | `packages/contract/generated/ts/validators.js` | Ajv standalone (ESM output) | Phone, web Worker, API |
| Enum normalizers | `packages/contract/generated/ts/normalize.ts` | `tools/contract-normalize.ts` ‡ | Web |

Every generated file starts with a `GENERATED by <tool> from packages/contract/src. Do not edit.` header. The only way to change one is to edit `src/*.tsp` and run `vp run contract:gen`. CI runs `contract:check`.

### 2.8 How inputs reach the pipeline

1. **Editorial and reference inputs live in git** (`content/`, `data/reference/`). Locally, `pipeline snapshot --repo . --usda <dir> --out .out/snapshots` freezes them, along with any USDA files, into a snapshot directory named by its ID.
2. **On merge to `main`**, CI packages the same inputs as `pg-inputs/content/{git_sha}.tar.zst`.
3. **USDA responses** enter only through `pipeline ingest`, which writes raw and normalized objects to `pg-inputs/usda/…` (§4.4).
4. **A build reads only its snapshot.** No `build` code path touches git, the network or the clock (I-4).

## 3. Milestones

Sixteen milestones take the project from an empty repository to v1.1. M0–M7 build a thin path through every risky seam: synthetic data becomes a validated release, reaches a deployed page, works offline and starts up consistently. M7 completes the walking skeleton defined in engineering spec §17. M8–M15 then fill in product scope. M3 runs alongside M4–M7. The diagram of dependencies follows M15.

Each milestone lists: objective · outcome · dependencies · tasks · modules · interfaces fixed · simplest acceptable version · what to avoid · commands · checks · done when · deferred. The rules in §7 and §8 apply to all of them.

### M0 · Foundation and compatibility proof

- **Objective:** prove the chosen stack installs, builds, tests and deploys on Windows and Linux before any product code exists.
- **Outcome:** a `workers.dev` URL serves a server-rendered page containing a value the API Worker returned over a Service Binding. CI is green on `ubuntu-latest` and `windows-latest`.
- **Depends on:** nothing. N1 is needed for the deploy step only.
- **Tasks:**
  1. Create the layout (§2.1), plus `AGENTS.md`, `CLAUDE.md`, `PROGRESS.md`, `.gitattributes` (`* text=auto eol=lf`), `.gitignore` and `.env.example`. Ask the user to place the three exported specs in `docs/specs/`.
  2. JS workspace with Vite+, TypeScript 7 and Node 26.
     - `apps/web` follows the documented TanStack Start setup for Workers: the Cloudflare Vite plugin first, configured as `cloudflare({ viteEnvironment: { name: 'ssr' } })`, and `wrangler.jsonc` with `main: "@tanstack/react-start/server-entry"` and `nodejs_compat` ([TanStack hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)).
     - `services/api`: Hono, exposing `GET /v1/health → {"ok":true,"build":"…"}`.
     - The `/` route server-renders the result of `env.API.fetch("/v1/health")`.
  3. Python: a uv project with Polars, Pydantic, dataframely, Hypothesis and pytest. `pipeline --version` uses argparse (no CLI framework). Record wheel availability for 3.15 on Windows and Linux; if a required package builds from source on Windows, apply P8 (3.14) and write a decision note.
  4. TypeSpec compiles a one-model file to JSON Schema.
  5. Import-boundary lint (Assumption: Oxlint's `no-restricted-imports` expresses the §1.1 rules; if not, record the gap and use a path check in `tools/`).
  6. CI `ci.yml`: install, check and test on both operating systems. On Linux, also build and run `wrangler deploy --dry-run` (the documented validation step). `deploy.yml` deploys `main` to `dev`.
  7. Write `docs/decisions/0001-toolchain.md`: resolved versions, experiment results and any fallback taken.
- **Experiments:**
  - E0-1: the Cloudflare Vite plugin runs the API Worker as an auxiliary Worker in `vp run dev`, with the Service Binding working locally.
  - E0-2: `vp check` type-checks with TypeScript 7.
  - E0-3: does `globalThis.Temporal` exist in workerd and in the target browsers? This decides where the polyfill loads.
- **Interfaces fixed:**
  - Worker names `pg-web`, `pg-api`, `pg-publisher`.
  - Environments `dev`, `preview`, `staging`, `production`.
  - Binding name `API`.
  - `/v1/health` shape.
- **Simplest acceptable:** an unstyled page; one endpoint; argparse.
- **Avoid:** Tailwind, Base UI, routing beyond `/`, Docker, Dagster, data code.
- **Commands:**

```
vp install
uv sync --project services/pipeline
vp check && vp test
uv run --project services/pipeline pytest
uv run --project services/pipeline pipeline --version
vp run dev                     # ‡ then open http://localhost:5173
vp run deploy:dev              # ‡
```

- **Checks:** the CI matrix. A deployed smoke test asserts that the HTML of `/` contains `"ok":true` without running JavaScript.
- **Manual:** run every command on one native Windows machine (no WSL) and record the results.
- **Done when:** both operating systems pass in CI; the deployed smoke test passes; 0001-toolchain.md records E0-1 to E0-3.
- **Deferred:** everything else.

### M1 · Contract round trip

- **Objective:** prove TypeSpec → JSON Schema → Python serialization → TypeScript validation → rendering on real files, before any data or UI depends on it.
- **Outcome:** `vp run contract:gen` produces every artifact in §2.7, and a cross-language suite proves that Python and TypeScript accept and reject exactly the same documents.
- **Depends on:** M0.
- **Tasks:**
  1. Model a minimal real subset (§4.8): `Verdict`, `Confidence` and `Marker` as open unions; `Manifest`; `ZoneBundle` with one `currentAssessment` window and `typicalOutlook`; `ZipLookupRequest/Response`; `ProblemDetails`. Use dates as `plainDate` and a nullable `supplyIndex`.
  2. Implement `contract:gen` and `contract:check` (§2.7). Ajv uses the 2020-12 build with standalone ESM output; ajv-formats is detected automatically in standalone mode ([Ajv standalone](https://ajv.js.org/standalone.html)).
  3. Golden fixtures (§4.8), valid and invalid, each with its expected accept-or-reject result in a `cases.json` table.
  4. Python test: each valid fixture loads into the generated model, dumps, canonicalizes (RFC 8785), and matches the stored canonical bytes.
  5. Parity test: the same fixture set through Python `jsonschema` (Draft 2020-12) and Ajv in Node and in a browser. Any disagreement fails.
  6. A `VerdictBadge` component renders every valid fixture in Vitest browser mode; an unknown verdict renders the neutral "Update to see this rating" state.
- **Experiments:**
  - E1-1: `json-schema-to-typescript` handles the emitted `$defs`/`$ref` and open unions. If it doesn't, switch to `openapi-typescript` on the emitted OpenAPI 3.1 and delete the first path; one implementation only.
  - E1-2: `datamodel-codegen` turns open unions into `Literal[...] | str` or `str`. Either is acceptable, because `pipeline verify` enforces the known values.
- **Interfaces fixed:** generated paths; the open-enum pattern; a "required and nullable, never optional" rule for published data (§4.8); the canonical JSON library (`rfc8785` on PyPI, with a decision note).
- **Simplest acceptable:** six models, about 15 fixtures, one component.
- **Avoid:** Zod for contract data; hand-written types; a custom schema compiler. The normalizer generator only lists enum values.
- **Commands:** `vp run contract:gen`, `vp run contract:check`, `vp test`, `uv run --project services/pipeline pytest -k contract`.
- **Done when:** the parity table passes in CI on both operating systems; drift check is on; E1-1 and E1-2 are recorded.
- **Deferred:** the full document set (it grows with M2, M8, M9 and M11).

### M2 · Pipeline core on synthetic fixtures

- **Objective:** `pipeline snapshot → build → verify` turns the synthetic snapshot into a deterministic, validated release with the complete verdict rules.
- **Outcome:** `.out/release/` holds the release index, 3 zone bundles, the editorial bundle, the ZIP table, the location grid and provenance. `verify` passes, and building twice gives identical hashes on both operating systems.
- **Depends on:** M1.
- **Tasks:**
  1. Input schemas (§4.5) for every `data/reference` table and `content/` file, plus the synthetic `small` snapshot (§2.6).
  2. `snapshot`, `build` and `verify` per §4.2. `build` takes its as-of date from the snapshot, never from the clock.
  3. The verdict engine as a pure module (§4.3): rules 1–5, the "Depends on the label" note, confidence, markers (last call, reliable year-round, advisory), `byOrigin`, the typical outlook and the current assessment.
  4. Semantic checks (§4.6) and determinism (§4.7).
  5. Tests: one table-driven case per rule and per precedence pair, the Hypothesis invariants (§7.2), and deliberately broken fixtures, one per check.
- **Interfaces fixed:**
  - CLI arguments and exit codes (§4.2).
  - Release layout (§5.1).
  - The engine's function signature (§4.3).
  - The input schemas.
- **Simplest acceptable:** one process, plain functions, Polars only.
- **Avoid:** Dagster, DuckDB in `src/`, upload code, a plugin system for rules, configurable rule order, parallelism.
- **Commands:**

```
uv run --project services/pipeline pipeline snapshot --repo . --usda packages/fixtures/snapshots/small/usda --out .out/snapshots
uv run --project services/pipeline pipeline build --snapshot .out/snapshots/<id> --out .out/release
uv run --project services/pipeline pipeline verify .out/release
uv run --project services/pipeline pytest
```

- **Done when:** I-4, I-8 and I-9 are tested and pass; every check in §4.6 has a failing fixture; F-7 passes.
- **Deferred:** search documents (M9), the region value bundle (M15), real USDA data (M3).

### M3 · Live source probe and ingestion

- **Objective:** confront the data assumptions with real USDA responses early.
- **Outcome:** `pipeline ingest` stores real responses byte-for-byte with metadata and normalizes them. `docs/data/usda-probe.md` records what is true about the source.
- **Depends on:** M2 and N2. Runs in parallel with M4–M7.
- **Tasks:**
  1. Use the My Market News API: endpoint `https://marsapi.ams.usda.gov/services/v1.2/reports`, with the API key as the basic-auth username ([MMN authentication](https://mymarketnews.ams.usda.gov/mymarketnews-api/authentication); Verified). Identify the shipment and import series used for typical origins and the supply index.
  2. Implement `ingest` per §4.4 for those series, idempotently.
  3. Write the probe document covering:
     - field names;
     - units;
     - observation period vs publication date;
     - corrections;
     - history depth for the 3-year baseline;
     - request limits (Assumption from a secondary listing: 180 days and 100,000 rows per call; confirm);
     - missing weeks.
  4. A `commodity_map` coverage report: unmapped names among the top 200 by volume.
  5. Replace the synthetic USDA files in the fixtures with trimmed real responses. Quality windows stay synthetic.
  6. Confirm or reopen P2 (complete-month supply index) from what the data supports.
- **Simplest acceptable:** sequential requests with a fixed delay; no scheduler.
- **Avoid:** guessing units; silently dropping rows (every dropped row is counted and reported); the full 3-year backfill before the probe is reviewed.
- **Done when:** at least 2 weekly reports for at least 5 launch-candidate commodities ingest and normalize on both operating systems; every assumption in the probe document is marked confirmed or refuted; mixed units fail loudly.
- **Deferred:** the backfill job (M12); the retail report (M15).

### M4 · Publication path

- **Objective:** make releases live safely on real infrastructure.
- **Outcome:** staging has a live manifest promoted by the publisher. Races, retries and stale runs are proven safe against real R2, and JSON is served from cache.
- **Depends on:** M2 and N1 (account, scoped tokens, a domain on Cloudflare).
- **Tasks:**
  1. `infra/`: buckets per environment, custom domains `data.` and `live.`, R2 CORS (GET/HEAD from `APP_ORIGIN`), and Cache Rules that mark both hosts eligible for cache. JSON isn't cached by default ([default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)). Apply with `vp run infra:apply`.
  2. `pipeline upload` per §5.1: content-addressed objects with `Cache-Control: public, max-age=31536000, immutable`, the release index, then `_COMPLETE` last. It checks for an object before putting it, which makes it idempotent.
  3. The publisher Worker's `POST /promote` (§5.1), using R2 conditional `put` with `onlyIf.etagMatches` ([R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)).
     - Manifest cache: `public, max-age=60`, no purge call. This simplification is accepted: at most 60 s stale.
  4. GitHub Actions:
     - `content.yml`: on merge, snapshot → build → verify → upload → promote, to staging.
     - `weekly.yml`: scheduled plus `workflow_dispatch`; fixture data until M3 lands.
  5. Tests: publisher unit tests in Miniflare (F-5) and `vp run publisher:race-test` ‡ against staging R2.
- **Interfaces fixed:** the promote request and response (§5.1); bucket names; object keys; Cache-Control values.
- **Simplest acceptable:** a bearer-token promote endpoint, and a CI-only weekly run.
- **Avoid:** Workflows, Containers, Durable Objects, cache purge, a second publisher.
- **Done when:**
  - A second fetch of a release object returns `cf-cache-status: HIT`.
  - F-5 passes against real R2.
  - A preview-credential write to `pg-releases` and `pg-manifest` fails (I-12).
  - The post-promotion smoke test fetches and validates every part (I-2).
- **Deferred:** retention and garbage collection (M12); production promotion (M13).

### M5 · First deployed render

- **Objective:** close the visible path: the published release appears on a deployed page for the inferred place.
- **Outcome:** from San Francisco, the staging URL server-renders Bay Area verdicts from the live release; `?zip=60601` renders Chicago; `/item/<slug>` loads directly with its verdict in the raw HTML.
- **Depends on:** M4.
- **Tasks:**
  1. API `POST /v1/locate`, reachable only over the Service Binding (not routed publicly). Its input is the web Worker's `request.cf` postal code, region, country and city. It returns zone, price region, locally checked flag, city label and a national flag. The ZIP table is fetched over HTTPS and cached in memory per release ID. ([Workers geolocation fields](https://developers.cloudflare.com/workers/examples/geolocation-hello-world/))
  2. Web Worker loaders:
     - Manifest, cached in the isolate for at most 60 s.
     - Place resolution per §5.4.
     - The date window from `request.cf.timezone`.
     - The zone bundle read over HTTPS and validated.
     - Embed `{releaseId, zoneId, window}` for the boot guard (M7).
  3. Routes `/` (grouped by verdict, unstyled) and `/item/$slug`. `<main data-release=…>`. A footer with "Supply data through" and the release ID.
  4. `/api/*` forwarding (R5); headers per R6.
  5. `vp run data:serve` and `vp run e2e`; Playwright smoke tests against `BASE_URL`.
- **Interfaces fixed:** the `/v1/locate` contract; the place-resolution function (one implementation, shared with the client in M7); `windowIndex(date)`.
- **Simplest acceptable:** no styling, no client data path yet.
- **Avoid:** caching HTML at the edge; personalizing beyond place and date.
- **Done when:** the outcome checks pass against staging with JavaScript disabled; I-1 is asserted; the API never sees anything beyond the four `request.cf` fields.
- **Deferred:** the offline path (M6), saved place (M7), design (M8).

### M6 · Offline release on the phone

- **Objective:** keep one complete, validated release on the phone and render from it, including item pages never visited.
- **Outcome:** after one online visit, airplane mode can open any covered item URL; an interrupted update leaves the previous release working.
- **Depends on:** M5.
- **Tasks:**
  1. **E6-1, the app shell.**
     - **Candidate A:** a `/__shell` route with `ssr: false`, prerendered at build time. Selective SSR renders a route's pending component on the server in place of an `ssr: false` route ([selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr)).
     - **Not usable:** SPA mode, which produces `/_shell.html` but turns off server-side rendering app-wide ([SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode)).
     - **Pass criteria:** the shell served for `/item/pears` renders pears from IndexedDB with no hydration error, in Chromium and WebKit.
     - **Candidate B, if A fails:** the client entry mounts with `createRoot` when the shell flag is present.
  2. **E6-2, the service worker build.**
     - Try `@serwist/vite` (`injectManifest`, [Serwist Vite](https://serwist.pages.dev/docs/vite/getting-started)) first.
     - If it can't see the client build in Start's multi-environment build, use `@serwist/build` `injectManifest` as a post-build step over the client output.
     - Keep only the working approach.
  3. IndexedDB stores and the update protocol in §5.2, with SHA-256 via Web Crypto and the generated validators.
  4. One `selectAssessment(bundle, date)` function shared by server and client. Route loaders read through a `ReleaseSource` with two implementations: HTTPS on the server and IndexedDB on the phone.
  5. Service-worker lifecycle: no automatic `skipWaiting`. A waiting worker activates on the next launch.
  6. A basic readiness status line (§5.5).
- **Interfaces fixed:** IndexedDB schema v1; readiness states; the shell URL.
- **Simplest acceptable:** the whole release for the saved zone; no illustration sprite yet.
- **Avoid:** prefetching HTML; Background Sync; a second cache of data in Cache Storage.
- **Done when:** F-1, F-2, F-8, F-9 and F-10 pass in Chromium and WebKit; I-5 and I-6 are asserted; E6-1 and E6-2 are recorded.
- **Deferred:** `persist()` and in-store wording (M10); real devices (M10/M13).

### M7 · Place, date and startup consistency (walking skeleton complete)

- **Objective:** one answer at startup, correct place and date handling, and location changes that keep the user's context.
- **Outcome:** a saved ZIP that differs from the inferred location never shows a flash of the wrong verdicts; crossing midnight or a half-month boundary updates the window; precise location works without coordinates leaving the phone.
- **Depends on:** M6.
- **Tasks:**
  1. Saved place in IndexedDB, mirrored to `localStorage` for the boot guard.
  2. Place picker:
     - ZIP entry → `POST /v1/zip`.
     - "Use my precise location" → permission only after the tap → a grid lookup on the phone (P4, §5.3).
     - Location unknown → national view. Alaska and Hawaii → the "not locally assessed" banner.
  3. Precedence and URL rules (§5.4). Changing place is a same-route navigation that keeps page, filters and scroll.
  4. Boot guard (R7): a static inline script, allowed by hash (§6.6), that compares the saved place and the phone's local window with the server's embedded values before first paint.
  5. Date: re-evaluate at local midnight and on `visibilitychange`.
  6. Dates:
     - A pinned `?date=` shows the typical outlook under a "Typical outlook for Dec 20 · Back to today" banner.
     - "Share for this date" pins the date; other shares follow today.
- **Done when:** F-3, F-4 and F-11 pass; I-7 and I-15 are asserted; a network assertion proves no coordinates leave the phone (I-11). The walking-skeleton criteria in engineering spec §17 all pass and are recorded in `PROGRESS.md`.
- **Deferred:** visual design; search.

### M8 · Today and item page

- **Objective:** implement the product's primary in-store screens to spec (product spec §5 and §9).
- **Outcome:** Today and item pages match the product spec at phone, tablet and desktop widths, with one information hierarchy (product §6).
- **Depends on:** M7.
- **Tasks:**
  1. Tokens: Tailwind 4 `@theme` in OKLCH; the verdict palette as shape + word + color (Peak star, Good check, Skip clock, Limited evidence open circle in a neutral tone); type scale; 8 px grid. Wrap Base UI primitives once in `packages/ui`.
  2. Today (product §5), in order:
     - the location-and-date chip;
     - the region-month summary line;
     - a search field slot;
     - **Best right now**: up to 6 Peak items, sorted by confidence then the editorial `purchaseRank` (never padded);
     - **Good buys**, with filter chips;
     - **Skip for now**, collapsed, with "usually improves in…";
     - **Limited evidence**, collapsed, with the reason. Each item appears exactly once.
  3. Cards expand in place, with a **Details →** button; `<ViewTransition>` from card to item page; list rows navigate.
  4. Item page in product order:
     - **Verdict block:** badge, 1–3 reasons, confidence, a one-line evidence basis, and "Supply data through…" plus "Guidance reviewed…".
     - **Context notes.**
     - **"What does the label say?"**, from `byOrigin`.
     - **How to pick; store and ripen.**
     - **Typical-outlook strip:** 24 cells with an origins band, plus a table equivalent.
     - **Advisory block:** scope and end date.
     - **Varieties list; prep;** and a feedback slot.
  5. Accessibility: one accessible name per card, markers included; focus moves to the heading on route change; 44 px targets; body text ≥ 16 px; contrast ≥ 4.5:1; usable at 200% zoom.
  6. Contract minor version for the editorial fields these screens need. The pipeline emits them from `content/`.
- **Simplest acceptable:** CSS only for motion (`@starting-style`, reduced-motion respected); no illustration sprite until the artwork exists (N4).
- **Avoid:** device-specific layouts; ranking logic outside the shared selector; copy hard-coded in components (strings go in the message catalog).
- **Done when:** a component test exists for each Today rule; axe reports 0 violations; Playwright screenshots at 375, 768 and 1280 px are reviewed and committed as baselines; card names read as in product §9.
- **Deferred:** search behavior (M9), feedback (M11), value note (M15).

### M9 · Browse, variety guides, calendar, search, Methods

- **Objective:** complete the navigation model and the depth features.
- **Outcome:** every item and variety can be reached within 3 taps of Today or with one search, and the calendar shows the typical outlook.
- **Depends on:** M8.
- **Tasks:**
  1. Browse: groups and categories from product §4, showing only categories with covered items; Category → Item → Variety.
  2. Variety guides (apples, mandarins & oranges, pears):
     - traits on anchored 1–5 scales;
     - a finder that filters by use and trait;
     - cards on phone, a sortable table on tablet and desktop;
     - variety pages with the label/PLU text and "can't find it? try…".
  3. Calendar ("Typical seasonal outlook"): one month at a time on phone, a half-year heatmap on tablet, a full year on desktop, each with a table equivalent. Advisories are never projected forward.
  4. Search (R4):
     - The pipeline emits `SearchDocuments` (id, kind, name, synonyms, misspellings, category, rank).
     - The phone builds an in-memory Orama index on first focus.
     - Suggestions from the first letter; results with badges.
     - No match → "We don't cover this yet" + the closest items + a "Request it" button (wired in M11).
  5. Methods page from `content/methods`: definitions, sources with their update schedules, and audit results (empty until M14).
- **Checks:**
  - A crawl test computes the minimum taps from Today to every item and variety (≤ 3).
  - Synonym and misspelling cases ("scallion", "corriander") find the right item.
  - Measure index build time; record the p75 for R4.
- **Done when:** the checks pass and every product §5 screen exists.
- **Deferred:** Spanish (v2); further guides.

### M10 · In-store mode

- **Objective:** the cart-mounted experience from product §6.
- **Outcome:** the in-store toggle keeps the screen awake, prepares the offline copy, shows its readiness, enlarges type and holds the layout still.
- **Depends on:** M8 (and M6 for readiness).
- **Tasks:**
  1. A toggle remembered on the phone. Request the Screen Wake Lock, re-acquire it on `visibilitychange`, and show a quiet note if it is refused.
  2. `navigator.storage.persist()` on enable, recording the result.
  3. Readiness copy exactly as in product §6.
  4. Body text ≥ 18 px; forced high-contrast light theme; no animation, prompts or layout shift; data and service-worker switches deferred while the mode is on.
- **Manual (N7):**
  - iPhone, Safari tab and Home Screen app: offline after a day away; whether storage survives; the `persist()` result; wake lock while backgrounded.
  - Android Chrome: the same checks.
  - Record results as manual evidence.
- **Done when:** automated emulation tests pass and the manual results are recorded. Browser emulation is not claimed as iOS evidence.

### M11 · Write path and measurement

- **Objective:** feedback, taste answers, requests, events and real-user performance, all without personal data.
- **Outcome:** feedback rows reconstruct the verdict shown; the dashboard query shows p75 first usable verdict by device class.
- **Depends on:** M8, M9.
- **Tasks:**
  1. D1 schema via Drizzle (`feedback`, `item_requests`, `event_daily`) with expand-then-contract migrations (§6.4).
  2. Endpoints per engineering spec §9 and §6.7:
     - Turnstile on feedback, taste and requests only.
     - Rate limiting on everything. The binding allows a 10 s or 60 s period, counts per location and is approximate ([rate limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)).
  3. Item-page feedback, the "Bought it" toggle, the next-visit taste prompt and "Request it".
  4. Events and the beacon (§6.8): `web-vitals` plus `performance.mark('verdict-visible')`; the 14-day return-visit event computed on the phone; the optional end-of-session "Did this change what you bought?" prompt.
  5. Log redaction (§6.7) and invocation logs off.
- **Checks:**
  - The I-14 reconstruction test.
  - The I-11 log-capture test.
  - Turnstile test keys in CI.
  - A rate-limit test asserting HTTP 429 with a problem-details body.
- **Done when:** these pass and a staging query returns aggregated counts.

### M12 · Scheduled operations

- **Objective:** move the weekly run to Cloudflare as the learning target, and make data operations self-monitoring.
- **Outcome:** a cron-started Workflow runs the containerized CLI and promotes; freshness and failures open GitHub issues; old releases are garbage-collected by policy.
- **Depends on:** M3, M4.
- **Tasks:**
  1. Dagster definitions wrap the existing CLI steps and run in-process inside the container. No Dagster service.
  2. Container image: `Dockerfile` for `services/pipeline`, built and pushed by CI, digest recorded. Assumption: Containers need linux/amd64 images (secondary source), to confirm.
  3. The publisher Worker gains a Container class, a Workflow and a cron trigger (R3).
     - Steps: mint IDs → ingest → snapshot → build+verify → upload → promote → report.
     - Every step is idempotent, and a completed step's result is persisted and never re-run.
     - Step timeouts ≤ 30 min; longer waits use `step.waitForEvent` ([rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)).
  4. **E12-1, the container job pattern.**
     - The Workflow posts `/run` and gets 202.
     - The container calls back by event, or the Workflow polls `/status` with `step.sleep`.
     - **Pass:** a 20-minute synthetic job completes, and a forced retry doesn't duplicate uploads.
     - **If it fails:** keep the GitHub Actions schedule (R10) and record why.
  5. The content fast path (§4.10). Retention garbage collection (P6) as a publisher cron that never deletes an object referenced by a retained release.
  6. A daily `health.yml` checks the publisher's `/status` (live sequence, observation period, last run) and opens or updates a GitHub issue when:
     - movement data is more than 45 days old;
     - the last run failed;
     - a run was superseded twice.
  7. After 2 consecutive green Workflow runs, remove the scheduled trigger from `weekly.yml` and keep `workflow_dispatch`.
- **Done when:** two scheduled runs are green; F-12 passes; a garbage-collection dry run lists only unreferenced objects.

### M13 · Hardening and launch readiness

- **Objective:** security, compatibility, rollback and performance proven before production promotion.
- **Depends on:** M9–M12; N5, N7.
- **Tasks:**
  1. CSP per §6.6: a nonce for server-rendered pages, a hash for the shell; Trusted Types in report-only mode.
  2. Security headers.
  3. The mixed-version matrix in CI (§6.3).
  4. Rollback drills: release rollback, Worker rollback, and a D1 Time Travel restore. Time Travel covers 30 days on the paid plan ([D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)).
  5. CI performance budgets and Lighthouse user flows.
  6. The real-device checklist (§7.5) and VoiceOver/TalkBack passes.
  7. Renovate.
  8. Production environment and domain.
- **Done when:** all of §7's launch checks are green or explicitly waived by the user, and production serves the first real release.

### M14 · Launch data and gate tooling

- **Objective:** load the real editorial data and produce the evidence that Gate 1 needs (product §12). The agent builds the tools; reviewers judge.
- **Depends on:** M3, M9; N3, N4, N6.
- **Tasks:**
  1. `pipeline lint-content` ‡: actionable reports for missing citations (fewer than 2), uncovered typical origins, and expired or overlapping advisories.
  2. The evidence screen (product §8). An item launches only on one of the two evidence bases; assessment-only items are capped at Medium confidence.
  3. "Locally checked" flags for the 3 launch metros.
  4. Back-test export: rules over 2 years of history in the 3 metros, as a sheet for comparing against a reviewer's calls (the Gate 1 target is ≥ 85% agreement).
  5. Audit sampler (product §2):
     - per metro × 2 store formats, 8 Peak + 4 controls, randomly drawn from that day's verdicts;
     - a blind sheet with verdicts hidden;
     - an import of results that publishes to Methods.
- **Done when:** the real release builds and verifies, and the back-test and audit tools run end to end. Whether Gate 1 passes is for the user to decide.

### M15 · v1.1 value markers

- **Objective:** display-only value markers from regional ad data (product §7).
- **Depends on:** M12; launch.
- **Tasks:**
  1. Ingest the National Retail Report (FVWRETAIL); confirm its report ID in the M3 probe.
  2. Promotion index and price ratio per item × region × week. "Good value" at an index ≥ 1.2 or a price ≤ 0.95× the yearly average; "Pricier than usual" at ≥ 1.15×.
  3. Hide markers when the report is more than 14 days old, and for future dates.
  4. A separate `RegionValueBundle`; the UI value note.
  5. Extend the I-8 test: value code stays unimportable by the verdict engine.
- **Done when:** a 4-week comparison report against advertised prices exists (Gate 3 evidence).

### Dependencies

&#91;embedded content: milestone dependencies · skeleton chain, then 3 groups\]

Only M3 leaves the M0–M7 chain early. Product scope waits on the finished skeleton, and operations wait on real data plus the publication path. Everything converges on M13 and M14 before launch, and M15 follows launch.

### Requirement coverage

| Requirement | Source | Milestone | Evidence |
| --- | --- | --- | --- |
| Verdict rules 1–5, first match wins | Product §7 | M2 | Rule table + property tests |
| Label-based advice re-runs the rules per origin | Product §7 | M2, M8 | `byOrigin` unit tests; end-to-end label selection |
| Confidence from 4 properties, not a probability | Product §7 | M2, M9 | Unit tests; Methods text |
| Value never changes a verdict | Product §7 | M2, M15 | I-8 property test + lint |
| Typical outlook vs current assessment vs advisory | Product §7 | M2, M7 | I-15 tests; pinned-date end-to-end test |
| Missing evidence → Limited evidence | Product §10 | M2 | F-7; rule-1 tests |
| Today layout, ≤ 6 Best right now, each item once | Product §5 | M8 | Component tests |
| Cards expand; rows navigate | Product §5 | M8 | Component + end-to-end tests |
| 3 variety guides, finder, comparison table | Product §5 | M9 | Component tests; screenshots |
| ≤ 3 taps or one search to any item or variety | Product §4 | M9 | Crawl test |
| Search: synonyms, misspellings, request flow | Product §5 | M9, M11 | Search cases; endpoint test |
| Location default, ZIP, precise location without upload | Product §5, §10 | M5, M7 | F-3; I-11 network assertion |
| Changing location keeps page, filters, scroll | Product §4 | M7 | End-to-end test |
| Shared links follow today unless pinned | Product §10 | M7 | End-to-end test |
| Offline after first visit; readiness status | Product §6, §10 | M6, M10 | F-1, F-2, F-8–F-10; device checks |
| In-store mode: wake lock, ≥ 18 px, no interruptions | Product §6 | M10 | Emulation + manual iOS/Android |
| First verdict ≤ 2.5 s p75 on mobile; LCP/INP/CLS good | Product §2, §10 | M11, M13 | Real-user beacon; CI budgets |
| WCAG 2.2 AA, 44 px targets | Product §9 | M8–M10, M13 | axe; screen-reader passes |
| Feedback outcomes, "Bought it", taste prompt | Product §2, §5 | M11 | I-14 reconstruction test |
| Privacy: no accounts, no precise location, aggregate analytics | Product §10 | M5, M7, M11 | I-11 tests; schema review |
| Locally checked vs national guidance | Product §12 | M5, M14 | Zone flag tests |
| Release gates and audit protocol tooling | Product §2, §12 | M14 | Tool runs; user-judged gates |
| Publication safety (atomic, monotonic, idempotent) | Engineering §8 | M4, M12 | F-5, F-12; I-2, I-3 |
| Mixed-version compatibility | Engineering §9, §13 | M13 | Matrix in CI (I-13) |
| Windows-native development | Engineering §15 | M0 onward | CI on Windows; manual check |
| v1.1 value markers, display only | Product §7, §12 | M15 | Comparison report |

## 4. Data pipeline and contracts

The pipeline is one Python CLI whose `build` step is a pure function from a frozen snapshot to a release directory. Everything else (ingestion, upload, orchestration) sits outside that function, so builds stay reproducible and testable without a network.

### 4.1 Fixtures

| Fixture | Contents | Purpose |
| --- | --- | --- |
| `snapshots/small` (synthetic) | 5 items × 3 zones × 2 origins × 24 windows | Rules, checks, determinism, UI development |
| Edge cases inside `small` | A zero historical baseline; a typical origin with no rating; an active advisory; a "depends on the label" item; an assessment-only item; a missing USDA week; a reliable-year-round item; a last-call item | One fixture per rule branch and check |
| `snapshots/broken/*` | One input defect each (duplicate key, unknown origin, mixed units, share > 1, inverted dates, overlapping advisories) | Every check in §4.6 must fail on its fixture |
| `usda/` (M3) | Trimmed real responses, API key removed from recorded requests | Parser tests against real shapes |
| `golden/` (M1) | Valid and invalid contract documents with a `cases.json` expectation table | Cross-language parity |

Synthetic files carry `synthetic: true`. A release built from any input marked synthetic is labelled synthetic in its index, and the production publisher refuses it.

### 4.2 CLI entry point

```
pipeline ingest   --report <slug> --from <date> --to <date> --out <dir | r2://pg-inputs>
pipeline snapshot --repo <path> --usda <dir | r2-prefix> [--as-of <date>] --out <dir>     # prints snapshot_id
pipeline build    --snapshot <dir> --release-id <ulid> --out <dir>
pipeline verify   <release-dir> [--against <previous-release-dir>]
pipeline upload   <release-dir> --bucket <name>
pipeline lint-content --repo <path>                                                       # M14
```

- **Exit codes:**
  - `0`: success.
  - `1`: a blocking check failed. Do not retry; fix the inputs.
  - `2`: usage error.
  - `3`: an external dependency failed (USDA, R2). Retryable.
- **Output:** human-readable logs go to stderr. `--json` writes one summary object to stdout for orchestrators: counts, hashes, warnings.
- **Determinism boundary:** `--as-of` defaults to the latest USDA observation period end found in the snapshot. `build` reads no clock, environment, network or git. The release ID is minted by the caller and written only to `index.json`, never into content objects.

### 4.3 Verdict engine

The engine lives in `src/pipeline/verdict/` as plain functions over Polars frames. It has no I/O, and it imports nothing from `value/`. One public entry point:

```python
@dataclass(frozen=True)
class EngineInputs:
    quality_windows: pl.DataFrame   # item_id, origin_id, window 0-23, rating {prime,fair,poor}, provenance_ids
    typical_origins: pl.DataFrame   # item_id, month 1-12, origin_id, rank (rank only; never shown as shares)
    supply_index: pl.DataFrame      # item_id, month, value: float | null, reason: str | null
    advisories: pl.DataFrame        # advisory_id, item_id, origin_id | null, zone_id, effective_from, effective_to, imposed_verdict
    harvest: pl.DataFrame           # zone_id, item_id, window, stage {off,early,peak,late}

def evaluate(inputs: EngineInputs, rules: Rules, target: Target) -> pl.DataFrame:
    """One row per item x zone x window in target: verdict, rule_fired, reason_codes,
    confidence, weak_properties, markers, label_note, by_origin. Pure; deterministic."""
```

- **Rules 1–5, in product order, first match wins:**
  1. Limited evidence (P1: every typical origin needs a rating for the window)
  2. Advisory
  3. Skip
  4. Peak (supply not thin)
  5. Good
- **Typical outlook:** runs rules 1, 3, 4 and 5 with **no advisories**. Rule 4 uses the typical supply index for that calendar month (P11).
- **Current assessment:** runs all five rules for the windows that the release's validity range touches. The range runs from the as-of date to as-of + 21 days, so a phone crossing a half-month boundary offline still has a dated assessment.
- **Markers:**
  - *Last call:* the typical outlook drops within the next 2 windows.
  - *Reliable year-round:* Good or better in ≥ 20 of 24 windows.
  - *Advisory:* an active advisory applies.
  - *"Usually improves in…"* (Skip items): the next window whose typical outlook is Good or better.
- **Label advice:** `by_origin` re-runs rules 1–5 for each origin the item has a rating for. Local harvest enters only here: a local origin uses its own quality window.
- **Methodology points the specs leave open.** Each is a **provisional** default, isolated in `rules/v1.yaml` or one function, listed in `PROGRESS.md` for the user to confirm, and never blocking:
  - **P9:** when typical origins' ratings differ, the verdict follows the top-ranked origin; the "Depends on the label" note appears only when they differ by more than one level.
  - **P10, confidence predicates:**
    - *coverage weak* when rule 1 fired;
    - *relevance weak* for assessment-only items;
    - *freshness weak* when the movement data is more than 45 days old, or an active advisory wasn't reviewed in the current window;
    - *agreement weak* when the top origin is prime but supply is thin, or poor but supply is strong, or when the label note applies.
  - **P11:** the typical outlook's supply index is the 3-year same-month average ÷ the 36-month average.

### 4.4 Ingestion and normalization

- **Raw retention:** each response is stored byte-for-byte as `pg-inputs/usda/{report}/{published_date}/{sha256}.json.gz`, with a sidecar `.meta.json`: request path and parameters with the key removed, HTTP status, `fetched_at` (UTC), and the source's own publication date. Raw files are never deleted. They are how parser bugs get fixed and historical builds reproduced.
- **Normalized frame:** report, commodity (USDA name), origin (USDA name), unit, quantity, observation period start and end, published date, correction flag. Validated by a dataframely schema.
- **Mapping:** `commodity_map` and an origin map turn USDA names into internal IDs. Unmapped names are counted and reported. They are never guessed and never dropped silently.
- **Units:** convert to pounds with explicit per-unit factors from `data/reference/units.csv`. An unknown unit, or a series that mixes units, fails the run (exit 1).
- **Duplicates and corrections:** the key is (report, commodity, origin, period, unit). When a correction exists, the latest publication wins; earlier versions remain in raw storage.
- **Missing vs zero:** an absent row is *missing* and never becomes 0. Only an explicit reported 0 is zero. A month without data gives a supply index of `null` with the reason `no_data`. A zero baseline gives `null` with `no_baseline`.
- **Idempotence:** re-ingesting the same response writes nothing new, because objects are keyed by hash.

### 4.5 Input schemas (editorial and reference)

| Input | Key | Notable constraints |
| --- | --- | --- |
| `content/items/*.yaml` | `item_id` | Names, synonyms, category, `purchaseRank`, evidence basis, `reviewedOn`, card text ≤ 12 words, sections ≤ 60 words |
| `content/varieties/*.yaml` | `variety_id` | Parent item, trait scores 1–5 with the group's trait set, PLU text |
| `data/reference/quality_windows.csv` | (item, origin, window) | Rating enum; ≥ 2 provenance IDs per row |
| `data/reference/harvest_calendars.csv` | (zone, item, window) | Stage enum; all 53 zones |
| `data/reference/advisories.yaml` | `advisory_id` | Items, origins (optional), zone or price-region scope (P3), `effective_from` ≤ `effective_to` ≤ from + 90 days, imposed verdict, note, `reviewedOn` |
| `data/reference/zones.csv`, `zip_zone_map.csv`, `price_regions.csv` | IDs | 53 zones; `locallyChecked`; DC → Northeast price region (product §7) |
| `data/reference/provenance.csv` | `source_id` | Citation, URL, accessed date |
| `data/reference/rules/v1.yaml` | — | `version`; thresholds 0.70, 0.8, 1.2, 20/24, 45 days |

### 4.6 Validation

`verify` runs two independent layers: JSON Schema validation of every output against the emitted schema, using the Python `jsonschema` package, which is separate from the Pydantic models that produced it; and the semantic checks below. Either failing blocks the release.

| Check | Rule | On failure |
| --- | --- | --- |
| Known enums | Every enum value belongs to the contract version targeted (open unions are for consumers only) | Block |
| Unique keys | (item, zone, window), (item, origin, window), (advisory\_id) | Block |
| References | Every item, variety, origin, zone, provenance and advisory ID exists | Block |
| Units | Normalized to pounds; mixed or unknown units fail | Block |
| Origin shares | Each in \[0, 1\]; per item-month sum ≤ 1 (tolerance 1e-6) | Block |
| Missing values | No NaN or Infinity anywhere; every `null` has a reason code | Block |
| Denominators | A zero or missing baseline gives a `null` index, never infinity | Block |
| Date ranges | `effectiveFrom` ≤ `effectiveTo`; advisories end within 90 days; validity range non-empty | Block |
| Coverage | Every item × zone × window has a verdict (Limited evidence counts) | Block |
| Synthetic flag | Production refuses synthetic inputs | Block |
| Stability (`--against`) | ≤ 10% of cells change week over week unless inputs or rules changed | Block + alert |
| Freshness | Movement data ≤ 45 days old | Lower confidence; publish |
| Plausibility | 3–30 Peak items per zone-window | Warn |
| Size | Zone bundle ≤ 25 KB, editorial ≤ 60 KB, search ≤ 15 KB (gzip) | Warn |

### 4.7 Determinism

Sorting alone does not make output byte-identical. All of these are required:

1. **Canonical JSON:** RFC 8785 (sorted keys, ECMAScript number formatting, UTF-8, no insignificant whitespace).
2. **Numbers:** quantize every float with `Decimal(str(x)).quantize(Decimal("0.001"), ROUND_HALF_EVEN)` before serialization; turn `-0` into `0`; reject NaN and Infinity.
3. **Order:** Polars 2.0 no longer guarantees row order by default ([Real Python, Oct 2026](https://realpython.com/python-news-october-2026/)). Every frame written out has an explicit sort on its full key, and arrays in JSON are sorted by a documented key.
4. **No execution metadata in content objects:** no timestamps, hostnames, paths or release ID. `publishedAt` and the release ID live only in `index.json` and the manifest.
5. **Identity of the code:** provenance records the snapshot ID, `uv.lock` hash, rules version and contract version. The container image digest is recorded in the index. The run key covers all of them (§1.3).
6. **Environment:** the code never reads local time or locale. The container sets `TZ=UTC`, and tests set it too.
7. **Test:** CI builds the `small` snapshot twice on Linux and once on Windows; all `objects/` hashes must match.

### 4.8 Contract and its proof

- **Documents:**
  - `Manifest`, `ReleaseIndex`, `ZoneBundle`, `EditorialBundle`, `SearchDocuments` (M9), `LocationGrid`, `ZipTable` (API only), `RegionValueBundle` (M15);
  - API bodies for locate, zip, feedback, taste, request and event batch;
  - `ProblemDetails`.
- **Nullability rule:** published documents use required, nullable fields, so a field is never absent and missing means `null` plus a reason. Optional fields exist only in request bodies.
- **Open enums (R9):** verdict, marker, confidence, outcome and event name are TypeSpec unions with a `string` variant. The generated `normalize*` maps unlisted values to `"unknown"` so components switch over closed types.
- **Golden fixtures (M1):**
  - *Valid:* full; minimal; explicit nulls with reasons; unknown verdict `"superb"`; unknown marker; empty advisories; zero baseline.
  - *Invalid:* wrong type; missing required field; `"2026-13-40"`; window 24; share 1.2; `"NaN"` where a number is required; malformed ULID.
- **Parity procedure:** `cases.json` lists each file with its expected result. Python `jsonschema`, Ajv in Node and Ajv in a browser must all agree with it. Pydantic must round-trip each valid file to the same canonical bytes. Tested at every layer: optional fields, nulls, constraints, malformed values and unknown enum members.
- **No custom compiler.** Standard generators only (§2.7). If `json-schema-to-typescript` can't handle the emitted schemas (E1-1), switch to `openapi-typescript` on the OpenAPI output, not to a hand-written generator.

### 4.9 Time fields, provenance and freshness

| Field | Meaning | Where |
| --- | --- | --- |
| `source.observationPeriod` | Conditions a source describes (e.g. USDA week Nov 7–13) | Provenance table; drives "Supply data through…" |
| `source.publishedAt` | When USDA published it | Raw sidecar; provenance |
| `source.ingestedAt` | When we fetched it | Raw sidecar only (excluded from content objects) |
| `editorial.reviewedOn` | When written guidance was last checked | Editorial bundle; "Guidance reviewed…" |
| `advisory.effectiveFrom/To` | When an advisory applies | Zone bundle |
| `currentAssessment.validFrom/To` | Dates the dated verdicts cover | Zone bundle |
| `release.publishedAt` | When the release went live | Manifest only |

The three kinds of claim are separate structures: `typicalOutlook[0..23]` (no year), `currentAssessment` windows (dated), and `advisories` (scoped, expiring). An advisory never alters `typicalOutlook` (I-15).

Provenance is a per-bundle table (`p1`, `p2`, …), and cells cite its IDs. Freshness is computed against the snapshot's as-of date, never the clock.

### 4.10 Search ownership

The pipeline owns search content. It publishes `SearchDocuments` (id, kind, name, synonyms, common misspellings, category, rank), and the phone builds the Orama index in memory on first use (R4). No serialized library index exists, so an Orama upgrade never touches the pipeline, and no index can outlive the release it was built from.

### 4.11 What each change requires

| Change | Rebuild image | Recompute verdicts | Rebuild search docs | New release | Deploy web | Deploy API |
| --- | --- | --- | --- | --- | --- | --- |
| Copy-only content (wording, tips) | No | No | If names or synonyms changed | Yes, fast path (reuses zone objects) | No | No |
| New item, variety or ID change | No | Yes | Yes | Yes, full | No (data-driven) | No |
| Quality windows, calendars, advisories, zones, ZIP map | No | Yes | No | Yes, full | No | No |
| Rule thresholds (`rules/v1.yaml`) | No | Yes; rules version bump | No | Yes, full | No | No |
| Rule or pipeline code; Python dependencies | Yes | Yes (new run key) | Yes | Yes, full | No | No |
| Contract minor | Yes | Yes | Yes | Yes, full | Yes | Yes |
| Contract major | Yes | Yes, dual publish | Yes | Two releases | Yes | Yes (`/v2` if API changed) |
| Web code or JS dependencies | No | No | No | No | Yes | No |
| API code | No | No | No | No | No | Yes |
| New USDA week | No | Yes | No | Yes, if the run key changed | No | No |

CI classifies content changes by diffing the *parsed* content against the live release. Anything it can't classify takes the full path.

## 5. Publication, serving and offline consistency

A release moves through three gates, and each one is atomic: the publisher's conditional manifest write, the CDN's immutable objects, and the phone's single-transaction switch. A failure at any gate leaves the previous release serving.

### 5.1 Publication protocol

**Objects.** `pg-releases/objects/{sha256}.json` holds content-addressed parts, and `pg-releases/releases/{releaseId}/index.json` lists them. `pipeline upload`:

1. Checks each object with HEAD and puts only the missing ones, with `Cache-Control: public, max-age=31536000, immutable`.
2. Writes `index.json`.
3. Writes `_COMPLETE` last.

Re-running an upload is harmless.

**Promote interface** (publisher Worker, bearer `PUBLISH_TOKEN`):

```
POST /promote
{"releaseId":"01JD3Q8Z…","runKey":"sha256:…","mode":"promote"}          # or "rollback"

200 {"result":"promoted","sequence":42}
200 {"result":"already_live","sequence":41}                  # idempotent retry
409 {"result":"superseded","liveSequence":43}                 # candidate older than live
422 {"result":"incomplete","missing":["objects/ab12…"]}
422 {"result":"incompatible","reason":"contract major 2 not supported"}
```

**Promotion steps:**

1. Read `manifest.json` and its ETag.
2. If `runKey` is already live, return `already_live`.
3. Require `_COMPLETE`, then check every object in the index exists and has the right size and SHA-256.
4. Reject when:
   - the candidate's snapshot is older than live (observation period end, then content commit time), unless mode is `rollback`;
   - the release is synthetic in production;
   - its contract major is outside the support window.
5. Write the new manifest with `sequence = live + 1` and `onlyIf: {etagMatches}`.
   - On a precondition failure, go back to step 1, at most 3 times, then return 409.
6. Write `history/{sequence}.json`.

At most one writer wins each sequence (I-2, I-3).

**Manifest** (as served from `live.`):

```json
{
  "sequence": 42,
  "releaseId": "01JD3Q8Z5K7Q9V2M4N6P8R0T1W",
  "runKey": "sha256:…",
  "contractVersion": "1.3.0",
  "rulesVersion": "1.0.0",
  "minClientVersion": "1.2.0",
  "publishedAt": "2026-11-21T14:22:05Z",
  "observationPeriod": { "start": "2026-11-07", "end": "2026-11-13" },
  "synthetic": false,
  "parts": {
    "editorial": { "url": "https://data.example/objects/9f2c….json", "sha256": "9f2c…", "bytes": 48211 },
    "search":    { "url": "…", "sha256": "…", "bytes": 9133 },
    "grid":      { "url": "…", "sha256": "…", "bytes": 11870 },
    "zones": { "CA-N": { "url": "…", "sha256": "…", "bytes": 21402 } }
  },
  "fallbacks": { "0": "01J9…" }
}
```

- **Concurrent runs:** each weekly run's identity is its ISO week, so a second start is a no-op. A content release racing a weekly run is resolved by step 5: the loser re-checks, and if its snapshot lacks the winner's content commit it is rebuilt on top of it, never promoted over it.
- **Copy-only vs structural:** a copy-only change (§4.11) builds a new editorial bundle and search documents and reuses every zone object by hash. Anything else is a full build.
- **Rollback:** `mode: "rollback"` promotes an earlier, still-retained release under a **new, higher** sequence, so clients accept it and the history log records it.

### 5.2 Client update protocol

The phone holds `active`, plus at most one `pending` release.

1. **Show first:** on launch, render from `active` immediately (I-6). There is no network on this path, and no timeout.
2. **Discover:** in the background, fetch the manifest. Stop if `releaseId` equals `active`.
3. **Compatibility:**
   - If app version < `minClientVersion`: keep `active` and show "Update available". The service worker update is fetched, and applies at the next launch.
   - If the manifest's contract major is newer than the app supports: use `fallbacks[major]` when it is present, otherwise keep `active`.
4. **Download into `pending`:** the editorial bundle, the zone bundle for the saved place, search documents and the location grid. Each part is checked against its SHA-256 and the generated validator. Progress drives the readiness line.
5. **Switch:** when every part is valid, one IndexedDB transaction sets `active = pending` (I-5). It takes effect on the next navigation, never under the reader, and is deferred while in-store mode is on.
6. **Clean up:** delete the previous release after the next successful launch on the new one.
7. **Interrupted:** a partial `pending` is resumed if its manifest is still live; otherwise it is discarded. `active` is never touched.

### 5.3 Precise location without uploading coordinates (P4)

The release includes a `LocationGrid` covering the 50 states at 0.25°, with each cell assigned to its majority zone. It is built in the pipeline from Census cartographic boundary files plus the California and Florida split (N3). The phone maps coordinates to a cell and then to a zone locally.

- Cells offshore or across borders use their majority zone, and the place chip always shows the result so it can be corrected.
- No request carries coordinates (I-11, asserted in M7).
- The grid's size is recorded in M2; the target is ≤ 15 KB gzip.

### 5.4 Rendering, precedence and time

| Situation | Who renders | Place used | Date used |
| --- | --- | --- | --- |
| URL has `?zip=` | Server or phone | URL | `?date=` if present, else today in the phone's time zone |
| First visit, nothing saved | Server | Inferred (`/v1/locate`); unknown → national view | Today in `request.cf.timezone` |
| Returning, service worker active | Phone only (shell) | Saved place | Today, local |
| Returning, service worker missing | Server, then phone | Server: inferred. Boot guard switches to saved | Server's date; boot guard re-checks |

- **Boot guard (R7):** before first paint, a static inline script compares the embedded `{zoneId, window}` with the saved zone (from `localStorage`) and the phone's local window. On a mismatch it hides `[data-verdicts]` behind a skeleton, and the client renders the correct answer (I-7).
- **Date:** `windowIndex = (month − 1) × 2 + (day > 15 ? 1 : 0)`, one shared implementation. The window is recomputed at local midnight and on `visibilitychange`. A pinned `?date=` always shows the typical outlook and its banner (I-15).
- **Direct item loads** are server-rendered with the verdict in the HTML on the first visit, and rendered from IndexedDB once a release is active.
- **Shared links** carry `?zip=` only when the user shares a place, and `?date=` only through "Share for this date".

### 5.5 Caching

| Response | Cache-Control | Edge cache | Notes |
| --- | --- | --- | --- |
| Server-rendered HTML | `no-cache` | No | Varies by place, date and pin, so it never gets a shared cache key |
| `/__shell` | Precached by the service worker; HTTP `no-cache` | No | Revalidated on each deploy through the precache manifest |
| Hashed JS/CSS (`/assets/*`) | `public, max-age=31536000, immutable` via `_headers` | Yes | The static-assets default is `max-age=0, must-revalidate` ([docs](https://developers.cloudflare.com/workers/static-assets/headers/)) |
| `/sw.js`, stable static files | Default (`max-age=0, must-revalidate` + ETag) | — | Lets service-worker updates be found |
| `objects/*`, `releases/*/index.json` | `public, max-age=31536000, immutable` | Yes, via Cache Rule | Content-addressed |
| `manifest.json` | `public, max-age=60` | Yes, via Cache Rule | At most 60 s stale; no purge |
| `/api/*` | `no-store` | No | — |

The M4 smoke test proves the CDN caches JSON: the second request returns `cf-cache-status: HIT`. R2 CORS allows `GET`/`HEAD` from `APP_ORIGIN` on both data hosts.

### 5.6 What the phone needs offline

- **Precache:** the shell and **every** route's code chunks (no lazy route without a precached chunk).
- **IndexedDB:**
  - editorial bundle: all items, varieties, type notes, Methods text;
  - zone bundle for the saved place;
  - search documents;
  - location grid.
- **Optional:** illustrations, dropped first under storage pressure.
- **Never:** prefetched HTML.

An item URL never visited before renders from the shell plus IndexedDB (F-2).

### 5.7 Failure states

| Situation | Behavior | Readiness line |
| --- | --- | --- |
| First download in progress | Server-rendered page stays usable | "Preparing for offline… 12 of 35 items" |
| Release active | — | "Ready offline · 35 items · supply data through Nov 13" |
| Past `validTo` while offline | Show the typical outlook, labelled | "Offline copy is from Nov 13; reconnect to refresh" |
| Download interrupted | `active` unchanged; resume or discard | Unchanged |
| Hash or schema failure | Discard `pending`; retry with backoff; error event | Unchanged |
| `QuotaExceededError` | Keep `active`; drop illustrations; retry once | "Couldn't save the new offline copy" |
| IndexedDB unavailable (blocked, private mode) | Online-only rendering | "Offline copy not available on this browser" |
| Storage evicted | Online: refetch, render, rebuild. Offline: the shell explains | "Not ready offline" |
| Place changed online | Download the new zone into `pending`; switch when valid | "Preparing {city}…" |
| Place changed offline, zone not saved | Keep the old place | "{city} needs a connection" |
| New service worker during a session | Wait; activate on the next launch | — |
| App older than `minClientVersion` | Keep `active`; service worker update at next launch | "Update available" |

Browser storage is best-effort and can be evicted ([MDN](https://developer.mozilla.org/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)). M10 requests `persist()`, but recovery never depends on it.

### 5.8 Retention and recovery (P6)

- **Keep:**
  - every release referenced by the last 8 weeks of manifests;
  - the newest release for each contract major still inside its ≥ 180-day support window (listed in `fallbacks`).
- **Garbage collection** (M12) deletes a release only 30 days after it leaves that set, and deletes an object only when no retained index references it.
- **Old clients:** an app too old for the live contract keeps working from its active release, then from `fallbacks`. The forced path is `minClientVersion` plus a service-worker update, used only when an old client would show something *wrong*, not merely incomplete.

## 6. Deployment, operations, security and observability

Environments arrive one at a time: local at M0, staging at M4, production at M13. Every environment has its own credentials, so a preview or staging mistake can't touch production. Mixed versions are assumed to coexist, and are tested rather than avoided by deploy order.

### 6.1 Environments

| Environment | From | Web / API | D1 | Release data read from | Can write |
| --- | --- | --- | --- | --- | --- |
| Local | M0 | `vp run dev` (workerd) | Local emulation | `vp run data:serve` | Local only |
| Preview (per PR) | M4 | Worker version preview URLs | `pg-preview` database | Staging `data.`/`live.` over HTTPS | Preview D1, `pg-preview` |
| Staging | M4 | Separate Workers | Staging database | Staging buckets | Its own buckets and manifest |
| Production | M13 | Gradual deployments | Production database | Production buckets | Publisher only for the manifest |

Preview Workers have no publisher, no `MANIFEST` binding and no production secrets (I-12). Turnstile uses the test keys everywhere except production.

### 6.2 Deploying

- **Workers:**
  1. CI builds once.
  2. `wrangler versions upload` uploads a version, and the mixed-version suite (§6.3) runs against its preview URL.
  3. The version is promoted gradually: 10% → 50% → 100%. It moves on only while the error-event rate and the first-usable-verdict p75 stay within 10% of the previous version.
  - TanStack Start's Vite build writes the deploy config to `.wrangler/deploy/config.json`. Keep that file between CI jobs, and don't point Wrangler at the source config ([TanStack hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)).
- **Order for a change that spans components:**
  1. D1 expand migration.
  2. Contract minor.
  3. API.
  4. Web.
  5. Pipeline image.
  6. D1 contract migration, at least one deploy later.
- **Order alone is not relied on.** Gradual deployments route requests independently unless version affinity is used, and a Service Binding call can reach a callee at a different version ([gradual deployments](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/)).

### 6.3 Mixed-version compatibility

| Combination that can coexist | How it is tested | When |
| --- | --- | --- |
| New API ← requests from the previous web version | Recorded request fixtures from the last released web version, replayed against the new API in CI | Every PR touching the API or contract |
| New web ← responses from the previous API | Recorded response fixtures from the last released API, fed to the new web's loaders | Every PR touching the web or contract |
| Old app code (precached N−1, N−2) ← new release | Golden documents of the new contract run through the previous app's generated validators and normalizers (kept in `packages/fixtures/compat/`) | Every contract change |
| New app ← previous release (rollback) | End-to-end suite against the previous retained release | M13, then before each production promotion |
| New app ← previous contract major (dual publish) | End-to-end suite with `fallbacks` | Before any major |
| Deployed web version × new API version, live | **E13-1:** pin the Service Binding's downstream version via version overrides ([docs](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/)). If that mechanism proves unusable, deploy API-then-web to staging and run the suite after each step | M13; before each production deploy |

### 6.4 Database migrations

- Drizzle Kit generates SQL. `wrangler d1 migrations apply <db> --remote` runs in CI **before** the code that needs it is deployed.
- Expand, then contract. Add nullable columns or new tables first, and ship code that reads both shapes. Drop old columns only after no running version uses them.
- Each migration is tested by running the previous release's API test suite against the migrated schema.
- Recovery uses D1 Time Travel: 30 days on the paid plan, 7 on free. `wrangler d1 time-travel info` gets a bookmark; `restore` overwrites the database in place ([D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)).

### 6.5 Rollback and recovery runbook

| Problem | Action |
| --- | --- |
| Bad data release | `POST /promote` with `mode: "rollback"` to the last good release ID (new sequence) |
| Bad web or API deploy | Revert the gradual deployment to the previous version; then fix forward |
| Service worker strands users on bad code | Deploy a self-unregistering `/sw.js` at the same URL; raise `minClientVersion` |
| Corrupt or wrong D1 data | Time Travel restore to a timestamp before the incident; record the undo bookmark |
| Weekly run failing | The live release is untouched by design. Open issue → fix → `workflow_dispatch` |
| Leaked `PUBLISH_TOKEN` | Rotate it. The publisher still verifies completeness, ordering and compatibility, so the exposure is limited to promoting valid newer releases |
| Leaked pipeline R2 token | Rotate it, then run `pipeline verify` on the live release and compare object hashes with the index |

M13 runs the release rollback, the Worker rollback and the D1 restore drills on staging, and records the results.

### 6.6 Content Security Policy

There are two policies, because a cached page can't reuse a nonce.

| Response | `script-src` |
| --- | --- |
| Server-rendered pages | `'nonce-{per request}' 'strict-dynamic' https://challenges.cloudflare.com` |
| `/__shell` (cached by the service worker) | `'self' 'sha256-{boot guard}' 'sha256-{shell bootstrap, if any}' https://challenges.cloudflare.com` |

- **Shared directives:** `default-src 'self'; connect-src 'self' <DATA_ORIGIN> <LIVE_ORIGIN>; frame-src https://challenges.cloudflare.com; worker-src 'self'; img-src 'self' data:; style-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; report-to csp`.
- **Turnstile** needs `challenges.cloudflare.com` in both `script-src` and `frame-src` ([Turnstile CSP](https://developers.cloudflare.com/turnstile/reference/content-security-policy/)).
- **Server bootstrap data** goes in `<script type="application/json">`, which doesn't execute. The boot guard is the only hand-written inline script, and it is static, so its hash is stable.
- **E13-2:** TanStack Router accepts a nonce through `ssr.nonce` and applies it to framework-injected scripts. Assumption: this is described by community packages and TanStack discussion #3028, not by primary docs I could open. **Pass:** zero CSP violations on server-rendered pages with no `'unsafe-inline'`. Ship the policy as report-only first, then enforce.
- **No third-party analytics script.** The first-party beacon (§6.8) carries the performance metrics.
- **Other headers:** HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a `Permissions-Policy` that turns off camera, microphone, payment and USB.

### 6.7 Abuse protection and log redaction

| Endpoint | Turnstile | Rate limit (P7) | Body cap |
| --- | --- | --- | --- |
| `POST /v1/locate` (Service Binding only) | No | No | 1 KB |
| `POST /v1/zip` | No | `RL_ZIP` 120/min | 1 KB |
| `POST /v1/feedback`, `/v1/feedback/{token}/taste`, `/v1/requests` | Yes | `RL_WRITE` 30/min | 4 KB |
| `POST /v1/events` | No (keeps the beacon light) | `RL_EVENTS` 60 batches/min | 16 KB |

Rate limits are keyed on route + IP. The binding counts per location and approximately, with a 10 s or 60 s period ([rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)), so these are brakes on abuse, not quotas. An exceeded limit returns `429` with a problem-details body.

**Redaction (I-11):**

- Turn off automatic invocation logs in each Worker (`"observability": {"logs": {"invocation_logs": false}}`). They include the request URL, which can carry `?zip=` ([Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)).
- One shared logger accepts only these fields: route template, status, duration, Worker version, release ID, error type.
- Never logged: query strings, path parameters, bodies, coordinates, Turnstile tokens, free-text error messages.
- Validation failures log the failing schema path only. Problem-details responses never echo input values.
- Client error events carry the error type, component and release ID, never message text.
- M11 has a test that captures log output for requests containing a ZIP and coordinates and asserts neither appears.

### 6.8 Feedback and events

- **Feedback rows:**
  - id (ULID), item\_id, variety\_id?, origin\_label?, zone\_id;
  - outcome (`looked_good`, `looked_poor`, `not_in_stock`, `too_pricey`), bought, taste? (`great`, `ok`, `disappointing`);
  - **release\_id, rules\_version, target\_date**, client\_version, created\_on (date only). M11 tests the claim (I-14): from a row plus the retained release, recompute the verdict and confirm it matches what the phone displayed.
- **Events** are a closed list in the contract, aggregated on arrival into `event_daily(day, event, dims_key, count)`. No raw rows are kept.
- **Allowed dimensions:** zone, device class (by viewport: phone, tablet, desktop), app version, bucket.

| Event | Fires when | Serves |
| --- | --- | --- |
| `verdict_visible` | `performance.mark('verdict-visible')` after the first verdict badge commits, measured from `timeOrigin`. Buckets: <0.5, 0.5–1, 1–1.5, 1.5–2, 2–2.5, 2.5–4, >4 s | First usable verdict, p75 ≤ 2.5 s |
| `lcp`, `inp`, `cls` | `web-vitals` reports | Core Web Vitals in the field |
| `screen_view` | Route template | Diagnostics |
| `card_expand`, `item_open`, `variety_open` | User action | Diagnostics (product §2) |
| `search_no_result` | Search with no match | Diagnostics |
| `label_origin_chosen` | Label control used | Diagnostics |
| `instore_on`, `offline_ready`, `update_applied` | State changes | Reliability |
| `return_visit_14d` | Launch within 14 days of the last stored visit date | Diagnostics |
| `session_prompt` | "Did this change what you bought?" answered yes, no or skipped | Primary metric (baseline) |
| `feedback_submitted`, `taste_answered` | Write succeeded | Feedback volume by outcome |
| `error` | Caught error type | Monitoring |

The p75 comes from the bucket histogram, and the bucket edges include 2.5 s so the target can be read directly.

### 6.9 Monitoring and cost

- **Freshness and pipeline failures:** a daily `health.yml` reads the publisher's `/status` and opens or updates a GitHub issue. This is the only alerting channel, with no extra service.
- **Application errors and usage:** daily counts from `event_daily`. Workers Logs keeps 7 days on the paid plan, for incidents.
- **Cost:** the user checks the Cloudflare billing page monthly against the $25/month budget and records the figure in `PROGRESS.md`.

### 6.10 Performance: CI regressions vs field objectives

- **CI gates (catch regressions only):**
  - initial JS on Today ≤ 120 KB gzip;
  - CSS ≤ 20 KB;
  - bundle sizes per §4.6;
  - Lighthouse navigation runs and scripted timespan user flows ([user flows](https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md)): no regression against `main`. A plain Lighthouse page load can't measure INP, because it never interacts with the page.
- **Field objectives (product §2, §10):** first usable verdict ≤ 2.5 s, LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, each at p75 on mobile, from the beacon. They are judged only with real traffic, and a lab number never stands in for them.

### 6.11 What needs the user

| Item | Why | Milestone |
| --- | --- | --- |
| Export the three docs to `docs/specs/` | The agent reads repo copies | M0 |
| GitHub repository + Actions environments and secrets | CI/CD | M0 |
| Cloudflare account; scoped API tokens (§2.5); a domain on Cloudflare | Deploys, buckets, Cache Rules | M0, M4 |
| Turnstile widget for the production hostname | Production keys | M11/M13 |
| USDA My Market News account + API key | Live data | M3 |
| California and Florida split definitions | Zone map, location grid | M14 |
| Editorial content and illustrations | Real releases | M14 |
| Independent reviewers | Gate 1 and audits | M14 |
| iPhone + mid-tier Android, 30 minutes per check | Real-device evidence | M10, M13 |
| Product name and production domain | Launch | M13 |

None of these is a routine approval. The agent keeps working on unblocked tasks and lists each item in `PROGRESS.md` until it is resolved.

## 7. Verification strategy

Tests come from the requirements, the invariants and realistic failures, not from the implementation. Most of the risk is in transitions (releases, versions, places, dates, online and offline), so most of the effort goes there, and the important integrations are exercised for real at least once.

### 7.1 Priorities

| Priority | Proven by |
| --- | --- |
| 1. Verdict-engine correctness | Rule tables + property tests (§7.2) |
| 2. Cross-language contract behavior | Golden parity suite (§4.8) |
| 3. Data integrity | Semantic checks with a failing fixture each (§4.6); determinism on two operating systems |
| 4. Publication and rollback | F-5, F-12; rollback drill |
| 5. Mixed-version compatibility | §6.3 matrix |
| 6. Location and date handling | F-3, F-4, F-11; unit tests of `windowIndex` and place resolution |
| 7. Offline reopening and interrupted updates | F-1, F-2, F-8–F-10, F-13–F-15 |
| 8. Accessibility | axe in component tests; screen-reader passes (manual) |
| 9. Actual deployed integration | Smoke and end-to-end suites against staging (§7.4) |

### 7.2 Test layers

| Layer | Tool | Tests | Doesn't test |
| --- | --- | --- | --- |
| Unit | pytest, Vitest | Window math, place resolution, normalizers, check functions | Framework behavior |
| Property | Hypothesis | Verdict invariants (below) | Specific copy |
| Contract | Golden parity | Same accept/reject decisions in Python, Node and a browser | Business rules |
| Pipeline | pytest on fixture snapshots | Checks, determinism, missing data | Real USDA availability (M3 does that) |
| Publisher | Vitest + Miniflare; real-R2 race script | F-5, F-12 | — |
| Component | Vitest browser mode + axe | Today rules, cards, badges, accessibility | Routing |
| End to end | Playwright (Chromium, WebKit, Firefox; mobile profiles; network and clock control) | Journeys and F-scenarios | Real devices |
| Lab performance | Lighthouse navigation + timespan flows | Regressions | Field targets |

**Verdict invariants (Hypothesis):**

- If any typical origin lacks a rating for the window, the verdict is Limited evidence (P1).
- An active advisory always decides the verdict, unless rule 1 fired.
- Peak never appears when supply is thin.
- The "Depends on the label" note appears only when the top two origins differ by more than one level, and `byOrigin` equals re-running the rules per origin.
- Reliable year-round matches its count of Good-or-better windows.
- The typical outlook is independent of advisories.
- Changing any value or price input leaves every verdict unchanged (I-8).

Don't write tests that restate the implementation, such as recomputing the same formula in the test. Assert outcomes on hand-chosen cases instead.

### 7.3 Failure scenarios

| ID | Scenario | Technique | Pass condition | Milestone |
| --- | --- | --- | --- | --- |
| F-1 | Download interrupted after a new manifest | Playwright aborts a part request midway | `active` unchanged; same verdicts; resumes next launch | M6 |
| F-2 | Offline, open an item never visited | Visit once → offline → `goto('/item/pears')` | Renders from IndexedDB | M6 |
| F-3 | Saved ZIP differs from the inferred location; no service worker | Seed `localStorage`; unregister the service worker; capture first frame | The inferred zone's verdicts never paint | M7 |
| F-4 | Local midnight; 15th→16th; Dec 31→Jan 1; DST change | Playwright clock + `timezoneId` emulation | Correct window after each; no reload | M7 |
| F-5 | Two promotions race; a retry repeats; an older snapshot promotes | Miniflare, then real R2 | One winner; retry is a no-op; older rejected | M4 |
| F-6 | Old app code reads new data with unknown enums and fields | Previous app's validators + normalizers on new golden documents | Neutral "update" state; no crash | M1, M13 |
| F-7 | Missing USDA week; zero baseline; missing rating | Fixture snapshot | Confidence drops; `null` + reason; Limited evidence; no NaN | M2 |
| F-8 | Quota exceeded during an update | Test hook throws `QuotaExceededError` from the IndexedDB write | `active` intact; illustrations dropped; status shown | M6 |
| F-9 | Storage cleared mid-session | Clear site data via the DevTools Protocol | Online: rebuilds. Offline: clear message | M6 |
| F-10 | New service worker arrives mid-session | Deploy two builds in the test; navigate | Old worker serves until relaunch | M6 |
| F-11 | Place changed offline to an unsaved zone | Offline → enter another ZIP | Old place kept; message shown | M7 |
| F-12 | Copy-only release while a weekly run is in flight | Staging script | Both changes end up live; nothing lost | M4, M12 |
| F-13 | IndexedDB unavailable | Browser context with storage blocked | Online-only rendering with its status line | M6 |
| F-14 | App older than `minClientVersion` | Manifest fixture | Keeps `active`; "Update available" | M6 |
| F-15 | Offline past `validTo` | Clock moved forward | Typical outlook, labelled; stale status line | M7 |

### 7.4 Real integrations (not only mocked)

These are run for real at least once and then on a schedule. Each run is recorded with its date and environment:

- R2 conditional manifest writes and races (M4).
- CDN caching of JSON, by `cf-cache-status` (M4, then every deploy).
- The deployed SSR → Service Binding → API path (M5).
- USDA responses (M3, then weekly).
- Turnstile with test keys in CI, and real keys on staging (M11).
- Remote D1 migrations (M11).
- Gradual deployment and version previews (M13).
- Containers + Workflows (M12).

Miniflare and local emulation cover fast feedback. They never count as proof of the platform behaviour above.

### 7.5 Real-device checklist (manual, N7)

Run at M10 and again at M13. Record device, OS version, browser and date.

1. iPhone, Safari tab **and** Home Screen web app: install; airplane mode; open an item never visited; reopen after 24 h; record whether storage survived and what `persist()` returned.
2. Android Chrome, in the browser and installed: the same steps.
3. In-store mode: wake lock held with the screen on; behavior after backgrounding; the refusal message when wake lock is denied (for example, under low-power mode).
4. Background for several hours, then reopen in the store: correct date window, no blank screen, any update applied only at the next navigation.
5. VoiceOver and TalkBack through Today, an item page and feedback.
6. A mid-tier Android phone on throttled 4G: first verdict time from the beacon.

Browser emulation is never reported as evidence for installed-iOS behavior, storage persistence or wake lock.

### 7.6 Recording evidence

Every milestone close-out in `PROGRESS.md` sorts its claims into four bins:

- **Implemented:** code exists (paths).
- **Automatically verified:** test names plus the CI run link or command output.
- **Manually verified:** who, device or environment, date.
- **Unverified:** assumptions and limitations still open, each with the milestone that will settle it.

### 7.7 Proportionate checks

| Change touches | Run at minimum |
| --- | --- |
| Pipeline code | `pytest`; `pipeline verify` on `small`; the determinism test |
| Contract | `contract:check`; the parity suite; the §6.3 fixture compatibility tests; everything that consumes the changed documents |
| Web UI | `vp check`; component tests; end-to-end journeys for the routes touched |
| Service worker, offline or startup code | All F-scenarios marked M6/M7 in Chromium and WebKit |
| API | API tests; recorded-request compatibility; redaction test |
| Publisher or infra | Publisher tests; staging smoke; F-5 against real R2 if promotion logic changed |
| Dependencies | The full suite on both operating systems |

Broaden beyond the minimum when a failure appears, when a shared module changed, or when §1.6 lists the area as provisional.

### 7.8 When a check fails

- Investigate the failure before changing any expectation, golden file or screenshot baseline. The decision note or commit message says why the old expectation was wrong.
- Never weaken validation, types, tests or security controls to get to green: no widening a schema, `any`, `# type: ignore`, skipped tests, or a loosened CSP.
- A flaky test is fixed or quarantined with a linked issue and a recorded entry in `PROGRESS.md`. It is never silently retried into passing.

## 8. Coding-agent workflow and safeguards

The agent works in small, verified increments and keeps going without asking for routine confirmation. It stops only for the "Needs user" items in §1.6, and even then only on the blocked task.

### 8.1 Operating loop

1. **Read** `AGENTS.md`, `PROGRESS.md` and the current milestone (§3), plus the spec sections it links.
2. **Inspect** the existing code for the area before changing it, and search for an existing implementation of any helper you need.
3. **Pick the smallest complete increment**: one task, or part of one, that ends in an observable, testable result.
4. **Implement** it within the established patterns. If a pattern is wrong, raise it as its own change.
5. **Run** the relevant checks (§7.7).
6. **Investigate and fix** failures at their cause (§7.8).
7. **Review the diff**: no unrelated edits, no debug output, no leftover experiments, no generated file edited by hand.
8. **Record** evidence and limitations in `PROGRESS.md` (§7.6), plus a decision note if one is due (§8.3).
9. **Continue** to the next unblocked task.

### 8.2 Change size

- One concern per change. Never combine feature work with refactoring, dependency upgrades or formatting.
- Prefer changes a reviewer can read in about 10 minutes. Split larger work along the milestone's task list.
- Generated files change only through their generator, in the same change as their source.
- Each commit message says what changed and how it was verified.

### 8.3 Decision notes

Before adding a direct dependency, a deployed service, or a substantial abstraction outside the approved design, write `docs/decisions/NNNN-title.md`. Also write one for each experiment outcome (E-ids) and each provisional choice that gets implemented. It is a record, not a request for approval.

```markdown
# NNNN: <decision>
Date: YYYY-MM-DD · Milestone: Mx · Status: accepted | provisional | superseded by NNNN

Requirement: <which requirement or invariant needs this>
Decision: <what we do>
Simpler alternative considered: <and why it doesn't meet the requirement>
Evidence: <docs link, experiment result, measurement>
Reversal cost: <what changes if we undo it>
```

### 8.4 Prohibited

- Competing implementations of shared behavior: window math, verdict rules, place resolution, assessment selection, enum normalization, canonical serialization.
- Speculative features, configuration options, extension points or provider abstractions without a current requirement.
- Fallback systems built in advance. A fallback is built only after its trigger has actually happened.
- Catch-all error handling that hides defects or returns plausible-looking substitute data.
- Presenting fixtures, placeholders or synthetic data as a finished live integration.
- Hand-editing generated files.
- Broad rewrites to solve a local problem.
- Leaving abandoned approaches, unused dependencies, dead flags or obsolete instructions behind. When an experiment's losing candidate is discarded, its code goes too.
- Inventing verdict methodology, thresholds, quality ratings, calendars, advisories or product requirements.

### 8.5 Before marking a milestone complete

Answer each question in `PROGRESS.md`, briefly:

1. Does it satisfy every "Done when" criterion?
2. Can anything be removed without losing required behavior or clarity?
3. Does it duplicate logic, or introduce a pattern inconsistent with the rest of the code?
4. Are the important failures visible and recoverable?
5. Are temporary shortcuts removed, or recorded with the milestone that removes them?
6. What verification was actually performed: automated, manual, and against which environment?
7. What remains unverified?

Fix material problems before moving on, without turning the review into an unrelated cleanup. Anything cosmetic goes on a list in `PROGRESS.md` for later.

## 9. Progress tracking and resumption

`PROGRESS.md` is the only status document. A fresh session that reads `AGENTS.md`, then `PROGRESS.md`, then the current milestone has everything it needs: no conversation history and no parallel notes files.

### 9.1 Format

Keep it current, delete superseded lines, and keep it under about 150 lines. Completed milestones shrink to one line each; their detail lives in commits and decision notes.

```markdown
# PROGRESS
Updated: YYYY-MM-DD · Current milestone: M6 · Current task: M6.3 IndexedDB update protocol

## Next concrete action
Implement resume-or-discard for a partial `pending` release (guide §5.2 step 7), then add F-1 to e2e/offline.spec.ts.

## Blocking (needs user)
- N2 USDA API key: blocks M3 ingestion only. Requested YYYY-MM-DD.

## Milestones
- M0 done YYYY-MM-DD (decision 0001)
- M1 done YYYY-MM-DD (0002 json-schema-to-typescript kept; 0003 rfc8785)
- M2 done YYYY-MM-DD
- M3 blocked (N2); probe script ready
- M4 done YYYY-MM-DD
- M5 done YYYY-MM-DD
- M6 in progress: tasks 1-2 done (E6-1 Candidate A passed; E6-2 @serwist/vite kept), task 3 in progress

## Consequential decisions (latest first; details in docs/decisions/)
- 0007 Shell via /__shell prerender (E6-1 A)
- P1, P9, P10, P11 implemented provisionally; awaiting user confirmation

## Evidence for the current milestone
Implemented: apps/web/src/release/*.ts
Automatically verified: F-2 (e2e/offline.spec.ts, CI run #212), I-6 (same)
Manually verified: none yet
Unverified: WebKit eviction behavior (M10 real device)

## Known failures, limitations, temporary shortcuts
- Readiness line text is a placeholder until M10 (tracked)

## Checks last run
YYYY-MM-DD: vp check ✓ · vp test ✓ (412) · pytest ✓ (188) · e2e offline ✓ Chromium, ✓ WebKit
```

### 9.2 Resuming in a fresh session

1. Read `AGENTS.md`, then `PROGRESS.md`.
2. Run `git status` and `git log -10 --oneline`. If the working tree has uncommitted changes, read the diff and either finish that increment or revert it. Record which.
3. Run the checks named under "Checks last run". If they now fail, that failure is the next task.
4. Read the current milestone in §3 and the spec sections it links.
5. Do the "Next concrete action".

### 9.3 Finding the next unblocked task

1. Take the current milestone's first task that isn't done.
2. If it is blocked by a **Needs user** item, record it under Blocking, and take the next task in the same milestone that doesn't depend on it.
3. If every remaining task in the milestone is blocked, move to the earliest milestone whose dependencies (§3 diagram) are all done.
   - M3 can always run in parallel with M4–M7.
   - M14's tooling can start once M9 is done, even without real content.
4. If nothing is unblocked, write the blocking items and stop. This is the only time the agent stops on its own.

## 10. Start here

The first milestone is **M0 · Foundation and compatibility proof**. Its tasks and completion criteria are in §3. The steps below are the exact opening sequence for a coding agent in an empty repository.

1. **Check inputs.** Confirm that `docs/specs/product-spec.md`, `engineering-spec.md` and `implementation-guide.md` exist. If they don't, ask the user once to export them, and carry on with steps 2–5 meanwhile.
2. **Toolchain.** Node 26 LTS. The global `vp` CLI, installed as described at [viteplus.dev](https://viteplus.dev/guide/). uv, then `uv python install 3.15`. Record exact versions.
3. **Instruction and status files.** Create `AGENTS.md` (the §2.2 text), `CLAUDE.md` (`@AGENTS.md`), `.gitattributes`, `.gitignore`, `.env.example`, and this initial `PROGRESS.md`:

```markdown
# PROGRESS
Updated: YYYY-MM-DD · Current milestone: M0 · Current task: M0.1 repository skeleton

## Next concrete action
Scaffold apps/web with the Cloudflare TanStack Start template, then bring it into the Vite+ workspace.

## Blocking (needs user)
- N1 Cloudflare account + CLOUDFLARE_API_TOKEN: blocks the M0 deploy step only

## Milestones
- M0 in progress

## Consequential decisions
- R1–R11 adopted from the implementation guide §1.6; P1–P11 provisional

## Evidence for the current milestone
Implemented: — · Automatically verified: — · Manually verified: — · Unverified: E0-1, E0-2, E0-3

## Known failures, limitations, temporary shortcuts
- none

## Checks last run
- none
```

4. **Web app.** Run `npm create cloudflare@latest -- apps/web --framework=tanstack-start`, the documented Cloudflare path for TanStack Start. Then:
   - bring it into the Vite+ workspace with `vp migrate` (read `vp help migrate` first);
   - check `wrangler.jsonc` against §3 M0 task 2;
   - add `"services": [{ "binding": "API", "service": "pg-api" }]`.
5. **API Worker.** Hand-write `services/api` with Hono: `wrangler.jsonc`, `src/index.ts`, and `GET /v1/health`. No generator is needed.
6. **Pipeline.** Run `uv init --package services/pipeline`, add Polars, Pydantic and dataframely, and dev dependencies pytest, Hypothesis, Ruff and Pyrefly. Add an argparse `pipeline --version`. Record any package that has no 3.15 wheel on Windows (E0-3 and P8).
7. **Contract smoke test.** `packages/contract` compiles one TypeSpec model to JSON Schema.
8. **CI.** `ci.yml` runs install, check and test on `ubuntu-latest` and `windows-latest`, plus the Linux build and `wrangler deploy --dry-run`.
9. **Experiments E0-1 to E0-3.** Run them, then write `docs/decisions/0001-toolchain.md`.
10. **Deploy.** When N1 is available, run `vp run deploy:dev` and the smoke test (§3, M0 checks).
11. **Close M0.** Answer §8.5 in `PROGRESS.md`, mark M0 done, and set the next action to "M1.1: model the minimal contract subset (§4.8)". Then continue without waiting for confirmation.

## Sources

Checked on Nov 16, 2026. The governing specifications are linked in §1.2.

- TanStack: [Hosting (Cloudflare Workers)](https://tanstack.com/start/latest/docs/framework/react/guide/hosting); [SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode); [Selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr)
- Cloudflare Workers: [Static assets headers](https://developers.cloudflare.com/workers/static-assets/headers/); [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/); [Gradual deployments](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/); [Rate limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/); [Geolocation fields](https://developers.cloudflare.com/workers/examples/geolocation-hello-world/)
- Cloudflare R2: [Workers API reference](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/); [API tokens](https://developers.cloudflare.com/r2/api/tokens/); [Demo Worker (binding operations)](https://developers.cloudflare.com/r2/examples/demo-worker/)
- Cloudflare platform: [Rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/); [Container class](https://developers.cloudflare.com/containers/container-class/); [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/); [Default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)
- Cloudflare Turnstile: [Testing keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/); [Content Security Policy](https://developers.cloudflare.com/turnstile/reference/content-security-policy/)
- Anthropic: [Claude Code memory and imports](https://code.claude.com/docs/en/memory)
- Contract tooling: [Ajv standalone code](https://ajv.js.org/standalone.html); [TypeSpec JSON Schema emitter](https://typespec.io/docs/emitters/json-schema/reference/emitter/); [TypeSpec extensible enums (Azure guide)](https://azure.github.io/typespec-azure/docs/troubleshoot/enum-not-extensible)
- Serwist: [Vite getting started](https://serwist.pages.dev/docs/vite/getting-started)
- Vite+: [Guide](https://viteplus.dev/guide/)
- USDA AMS: [My Market News API authentication](https://mymarketnews.ams.usda.gov/mymarketnews-api/authentication); [Specialty Crops on My Market News](https://mymarketnews.ams.usda.gov/node/8569)
- Python ecosystem: [Kanaries, Python 3.15 upgrade guide (wheel availability)](https://docs.kanaries.net/topics/Python/python-3-15-upgrade-lazy-imports); [Real Python, October 2026 news (Polars row order)](https://realpython.com/python-news-october-2026/)
- Web platform: [MDN, storage quotas and eviction](https://developer.mozilla.org/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria); [Lighthouse user flows](https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md)

# Pre-build review

Nov 16, 2026 · Claude (implementer), for Jared (product owner and editorial reviewer)

**Scope.** The product spec, engineering spec, implementation guide and Orchard Editorial design system, with its nine reference images, all read in full. The question: is this ready to build, with Claude implementing, Jared reviewing, and development kept efficient?

**Outcome (Nov 16, 2026).** Jared adopted D1–D3 as recommended. The engineering spec and implementation guide are now archived and replaced by `docs/engineering-plan.md`, and the §2 fixes have been applied. D4 and the verdict-rule confirmations (§2 #11) remain open.

## Bottom line

| Document | Ready? | What it needs |
| --- | --- | --- |
| Product spec | Nearly | Three product decisions (§4) and some consistency fixes (§2). The product thinking is strong. |
| Design system | Yes | Done today: the art-production half moved to its own guide, and references now point at local files. Four small conflicts with the product spec to settle. |
| Engineering spec | No | Sound reasoning, but sized for a funded team running a high-traffic service. Rewrite it as a lean plan. |
| Implementation guide | No | Same problem, plus a verification regime that works against efficient development. Replace it with a short build plan. |

The biggest risks are not in the code. They are (1) the volume of editorial data needed before the app can show a single real verdict, and (2) an unproven assumption about what USDA data can tell us. Both should start in week one, not at milestone 14.

## 1. Findings that change the plan

### 1.1 Verdicts don't vary by location under the current rules

The product promises "the produce worth buying now, where you are." The engineering design builds 53 harvest zones, a ZIP-to-zone map, a 0.25° location grid, 53 zone bundles, and a boot guard to keep the right place on screen. But the rules in product §7 work like this:

- *Typical supermarket origins* come from national shipments and imports.
- The *supply index* is national.
- *Quality windows* are per item × origin, with no geography.
- Only *advisories* are scoped to regions.
- *Local harvest* is "shown as context." It affects a verdict only through label-based advice.

So a Peak in Chicago is a Peak in Atlanta unless an advisory says otherwise. The spec's 44,500 "verdict cells" are really 840 (35 items × 24 windows), copied 53 times. That is consistent with the supermarket-first thesis, because chains source nationally. But it means the location machinery exists to support a context note.

**Recommendation (D2).** For v1, say it plainly: verdicts are national. Location adds regional advisories, the "Locally checked" label, the Alaska and Hawaii banner, and the header. Resolve location to a state, either from Cloudflare's request geodata or from a ZIP the shopper types. Defer local-harvest context, the California/Florida split, the location grid and "Use my precise location" to a later release. The USDA probe (§1.3) should also check whether regional arrival data exists. If it does, regional verdicts become a real v1.1 feature rather than an implied one.

### 1.2 Editorial data is the critical path, and the plan assigns all of it to Jared

| Content | Volume at launch | Notes |
| --- | --- | --- |
| Quality windows | \~100 origin profiles × 24 half-months ≈ 2,400 ratings | ≥ 2 citations per row |
| Harvest calendars | 53 zones × 35 items × 24 windows ≈ 44,500 stage values | Cited; they drive only a context note and label advice |
| Items | 35 × names, synonyms, 3–5 pick cues, avoid cues, storage and ripening ranges, prep, evidence record, purchase rank | Word limits per section |
| Varieties | \~40 × 5 anchored trait scores, best uses, label/PLU text | 3 guides |
| Type notes | \~10 | |
| Region-month summaries | 96, each edited by hand | One line on Today |
| Commodity and unit maps | USDA names → items; units → pounds | |
| Illustrations | \~35 watercolors with real transparency | Not needed for the app to function |

The implementation guide says the agent "never authors real quality ratings, calendars or advisories," and it schedules real data for M14, the second-to-last milestone. The result would be an elaborate system with nothing true to show until very late, and all of the authoring on one person.

**Recommendation (D3).** Claude researches and drafts editorial data in batches. Every rating carries real, checked citations and is marked `status: draft`. Jared reviews and approves; only approved records count as reviewed, and production builds refuse drafts. This matches the roles as you described them: Claude implements, Jared edits.

Cut the volume too. Harvest calendars wait along with local-harvest context (§1.1). The 96 region-month summaries become 24 national ones, one per half-month, with advisories covering regional exceptions. Start content in week one, with the 5 items the first screens are built around.

### 1.3 The USDA supply assumption is load-bearing and unproven

Rules 1, 3 and 4 depend on "typical origins" (the origins behind ≥ 70% of an item's reported shipments and imports in a month, averaged over 3 years) and on the supply index. Nobody has confirmed that USDA data gives origin-level volumes for our \~35 items, with 3 years of history, in a form we can map. The guide's M3 probe exists to check this, but it sits behind the contract and pipeline milestones.

**Recommendation.** Make the probe the first task. It needs only a free USDA My Market News API key. If the data can't support typical origins, the supermarket-first verdict needs a different evidence source, and it is far better to learn that before building anything.

A related simplification: typical origins change little from year to year, so they can be computed once a year and committed as reference data. Only the supply index needs regular refreshes, and it can only cap Peak at Good and lower confidence. A weekly automated ingestion pipeline can therefore wait until after launch. Until then, the supply index is refreshed by running one command each month.

### 1.4 The architecture is sized for a large team and a high-traffic service

The engineering spec treats data releases as independent of code deploys. Almost everything heavy follows from that one choice:

- a publisher Worker, four R2 buckets, a manifest with sequence numbers and conditional writes, and a content-addressed object store;
- hash and schema validation of downloaded data on the phone, with an active/pending slot protocol in IndexedDB;
- contract major versions, dual publishing for 180 days, fallback releases, and a retention garbage collector;
- a mixed-version test matrix across app code, API and data releases;
- a TypeSpec contract compiled to JSON Schema, Pydantic, TypeScript types and precompiled Ajv validators, needed because the producer is Python and the consumer is TypeScript;
- Dagster, Cloudflare Workflows and Containers for the weekly run.

By the spec's own size budgets, the whole published dataset is about 100 KB compressed. If the data ships inside the app build instead, a deploy *is* a release. Cloudflare switches versions atomically, the service worker's precache is the offline copy, and code and data can never disagree. Everything in the list above disappears. What remains is small: one Worker serving static assets plus a few `/api` routes (location, feedback, item requests, events), and a D1 database.

**What stays from the engineering spec:** the verdict engine as a pure, table-tested module; rules and thresholds kept as data (`rules/v1.yaml`); deterministic builds; missing evidence never defaulting to a verdict; the offline readiness states; the privacy and logging rules; and feedback rows that record enough to reconstruct the verdict the shopper saw.

### 1.5 The newest-release stack slows an AI implementer down

The spec deliberately picks tools only weeks past their stable release, "for a learning project": TanStack Start 1.0, Vite+ (`vp`), TypeScript 7's native compiler, React 19.3, Python 3.15, Polars 2.0, Node 26, Drizzle, Dagster and TypeSpec. My training knowledge thins out after mid-2026. Every one of these means more documentation lookups, more wrong guesses about APIs, and more of the rabbit holes you want to avoid. The spec's own risk table names a fallback for most of them, which suggests they add risk without adding product value. Several version claims also cite secondary aggregator sites rather than release notes, so they need checking against npm and PyPI at scaffold time regardless.

Two languages are the other cost. A Python pipeline feeding a TypeScript app is what forces the whole contract-generation chain: an entire milestone up front, and a drift check forever after.

**Recommendation (D1).** Optimize for shipping. Use one TypeScript codebase for the app, the Worker and the data pipeline; the data is small enough that TypeScript handles it easily. Build on mature tools I know well: Vite, React, React Router, Tailwind CSS 4, a Workbox-based service worker, Vitest and Playwright, Hono, D1 and Wrangler, on a current Node LTS. Python stays available for exploratory notebooks on USDA data if you want to keep learning it, but nothing in production would depend on it.

### 1.6 The process would cost more time than the code

The implementation guide mandates, among other things:

- 15 invariants and 15 failure scenarios, each with dedicated tests;
- 7 named experiments, each needing a decision note;
- a four-part evidence log and a 7-question review before any milestone closes;
- CI on Windows and Linux, with builds compared byte for byte across both;
- offline test suites in Chromium and WebKit, and committed screenshot baselines;
- "continue with the next unblocked task without asking for confirmation."

Each item is reasonable on its own. Together they would make every prompt spend more time proving than building, which is what you want to avoid.

The sequencing has a related problem. M0–M7, half the milestones, are infrastructure with unstyled pages. As editorial reviewer, you would have nothing meaningful to look at for a long time.

**Recommendation.** Replace both documents with a short build plan, plus a working agreement (now in `CLAUDE.md`):

- Test thoroughly where correctness lives: the verdict engine and data validation, with a table-driven test per rule and property tests for the invariants.
- Elsewhere, typecheck, lint and test only the module touched, plus a handful of end-to-end smoke tests for the core journeys and offline use.
- Each session ends with something Jared can review (a preview URL on his phone, a screenshot, or a draft content batch), then a commit.
- A styled Today screen and item page should be on the phone by about the fourth session, on draft data.

## 2. Smaller consistency fixes

To apply once the decisions are made. All are mechanical.

| # | Issue | Where | Suggested fix |
| --- | --- | --- | --- |
| 1 | The product is called "Seasonal Produce Guide" (specs), "Produce Guide" (design system, mockups), "Orchard" (project) and "Open" (product §13) | All | Use Orchard as the project name; the in-app brand stays your call |
| 2 | Limited evidence mark: an open circle (product §9) vs an information symbol (design §6) | Product, design | The design system governs visuals; pick one |
| 3 | Reliable year-round is a marker under the verdict (product §5, §9) but a verdict-style row with a dash icon in design §6 | Design §6 | Treat it as a marker, per the product spec |
| 4 | Per-item accent colors (product §9, engineering §5) don't exist in the design system | Product, engineering | Drop them, or add them to the design system |
| 5 | Design tokens define Peak and Good icon colors, but none for Skip or Limited evidence | Design §3 | Add two tokens |
| 6 | Today's first section is "Best right now" in product §5 but "Peak now" in the approved mockup | Product, mockup | Product copy governs |
| 7 | Product §9 restates visual rules that the design system now governs | Product §9 | Trim it to principles plus a pointer, so the two can't drift apart |
| 8 | The implementation guide never references the design system; its M8 builds visuals from product §9 | Guide | Moot once the guide is replaced |
| 9 | Three diagrams were lost in export ("[embedded content: …]") | All three specs | Replace with short text, or a Mermaid diagram where one helps |
| 10 | The product spec ends with a stale note that the engineering spec needs revising | Product §13 | Remove |
| 11 | The guide flagged verdict-rule ambiguities that nobody has confirmed: does rule 1 need every typical origin rated, or ≥ 70% of volume rated? Which origin decides when ratings differ? What triggers "Last call": any drop, or only a drop from Peak? How are the four confidence properties computed? | Product §7 | Confirm the guide's provisional answers (P1, P9, P10, P11), or adjust them |
| 12 | Launch gates assume moderated in-store tests with 12+ people, monthly blind audits by two independent reviewers in three metros, and a back-test against an independent reviewer | Product §2, §12 | Decide whether these gate launch or become a post-launch quality program (D4) |

## 3. What's strong and should not change

- **The honesty model:** reasons, evidence basis and confidence on every verdict; "Limited evidence" instead of a guess; the typical outlook kept separate from today's assessment; advisories that are scoped and expire.
- **The rules:** a fixed order where the first match wins, and value that can never move a verdict.
- **The positioning:** supermarket-first verdicts fill a real gap in the competition.
- **In-store mode:** wake lock, readiness status, larger type, nothing that moves.
- **The design direction:** distinctive, specific, and written so an agent can extend it without the images. The prompt pack is reusable as is.
- **The privacy posture:** no accounts, no precise location on the server, aggregate analytics only.

## 4. Decisions needed

| ID | Decision | Recommendation |
| --- | --- | --- |
| D1 | Optimize for efficient shipping, or keep the learning-oriented stack? | Efficient: one TypeScript codebase on mature tools, data shipped with the app, one Worker plus D1 (§1.4, §1.5) |
| D2 | Verdict geography for v1 | National verdicts plus regional advisories; location resolved to a state; local-harvest context and precise location deferred (§1.1) |
| D3 | Who authors editorial data? | Claude drafts with checked citations; Jared approves; production refuses drafts; 24 national summaries instead of 96 (§1.2) |
| D4 | Validation gates (can wait) | Launch on Jared's review of the data plus a back-test sanity check; audits and moderated store tests become a post-launch program |

## 5. Next steps

1. **Jared:** answer D1–D3. D4 can wait.
2. **Claude:** replace the engineering spec and implementation guide with one lean engineering plan, apply the §2 fixes, and move the originals to `docs/archive/` for reference.
3. **Jared, small setup tasks:**
   - Sign in to GitHub on this machine (`gh auth login`) so the repository can be pushed.
   - Request a free USDA My Market News API key.
   - Create a Cloudflare account; the free plan is enough to start.
   - Node on this machine is v20, which reached end of life in April 2026. Claude will install the current LTS when scaffolding.
4. **Claude, first sessions** (if D1–D3 go as recommended):
   1. USDA data probe: can we compute typical origins and a supply index for the launch candidates?
   2. Scaffold the repository and deploy a placeholder to a Cloudflare preview URL.
   3. Content schemas and the verdict engine, fully tested, on 5 draft items.
   4. A styled Today screen and item page on the phone, for Jared's first real review.
   5. Then offline and in-store mode; Browse, Calendar and search; variety guides; location and advisories; feedback.

   Content drafting runs alongside, starting at step 3.

## 6. Done today

- Put the folder under git. The original documents were committed unchanged first, so every later edit is a reviewable diff.
- Moved the documents into `docs/` with plain file names, and numbered the reference images to match the design system's study index.
- Split the design system. Art direction and image prompts (the old §7–8) now live in `docs/design/illustration-guide.md`, so UI sessions don't load them. Reference links now point at the local images instead of ChatGPT library URLs that Claude can't open.
- Marked the engineering spec and implementation guide "under revision," so no session starts building from them.
- Added `CLAUDE.md` (the working agreement, loaded automatically in every session), `README.md`, and `PROGRESS.md` (the handoff file between sessions).

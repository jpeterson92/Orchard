# Orchard: working agreement

Orchard is a phone-first web app that tells supermarket shoppers which produce is worth buying now (Peak, Good, Skip or Limited evidence) and how to pick, store and ripen it. Claude Code implements. Jared is product owner and editorial reviewer: he decides product and content questions and reviews what each session produces. Engineering choices are Claude's to make.

## Where things stand

Read `PROGRESS.md` first: milestones, next action, blockers, open questions. How it's built and in what order: `docs/engineering-plan.md`.

## Documents

Read only the sections a task needs: Grep for the heading, then Read with offset and limit. Don't re-read whole specs every session.

| Doc | Governs | Most-used sections |
| --- | --- | --- |
| `docs/engineering-plan.md` | Architecture, stack, milestones, verification depth | §1 shape · §2 stack · §4 data and engine · §5 milestones · §6 verification |
| `docs/product-spec.md` | Behavior, scope, copy | §4 navigation · §5 screens · §6 in-store mode · §7 verdict rules · §8 content model and writing standards · §10 non-functional |
| `docs/design/design-system.md` | Visual design, tokens, components | §3 color · §4 type and tokens · §5 layout · §6 components · §7 accessibility · §9 acceptance criteria |
| `docs/design/illustration-guide.md` | Painted artwork and image prompts | Only for image work |
| `docs/design/references/` | Mockups: inspiration for the look only (`00-today-anchor.png` is the anchor). Layout and information design are Claude's call | Glance at them for visual language, never copy their layout |
| `docs/data/usda.md` | What USDA reference data covers, the 89-item list and the 30 first-release items | Coverage by item · Launch scope screen |

When documents conflict: Jared's latest instruction > product spec for behavior > design system for visuals > engineering plan for how it's built. Fix the conflict in the losing doc in the same commit.

**Docs state the current truth only.** When Jared decides something, rewrite the governing doc so it simply says the new thing: no decision logs, D-numbers, "changed from", version notes or superseded text. Git history is the changelog. Delete detail that no longer applies.

## Working efficiently

- **One increment at a time, sized to finish.** It ends in a commit and a short plain-language summary for Jared of what was done; add a screenshot, link or artifact only when it helps. `/next` (`.claude/skills/next/`) runs one increment.
- **Read narrowly, act early.** For an engineering detail, pick the conventional option, write it into the governing doc in one line, and move on. Don't reopen what the docs already settle.
- **Ask Jared only** about product behavior, editorial content, money, accounts or credentials. Batch the questions into the end-of-increment summary and keep building whatever doesn't depend on the answers; don't stop for routine confirmation.
- **Run slow jobs in the background** (data fetches, long probes, builds over a minute) and keep working meanwhile. Cache raw responses so reruns are free, and never poll or sleep waiting on them.
- **Timebox tooling trouble.** After two failed attempts at the same setup or config problem, take the simpler alternative or record a blocker in `PROGRESS.md` and move on. Don't dig through library internals.
- **Prefer mature, widely used libraries** over the newest release. Pin exact versions. A new direct dependency gets a row or line in the engineering plan's stack table (§2).
- **No speculative work:** no config options, abstractions, extension points or fallbacks without a current need. No new docs beyond `PROGRESS.md` unless asked.
- Use subagents only for wide searches or research that would otherwise flood the context. Give mechanical work (extraction, wide reads) to a Haiku subagent; keep Opus for engine logic and editorial judgment.
- Jared is on a usage-limited plan. Prefer a script over model work for anything mechanical, keep chat output short, put long material in generated reports, and once a conversation gets long, end the reply with "Run /nextnew?" (on yes, run the `nextnew` skill: it starts `/next` in a fresh session and archives this one).

## Verification, in proportion

- **Verdict engine and data validation: test thoroughly.** A table-driven case per rule and per precedence pair, plus property tests for the invariants. This is where correctness matters most.
- **Everything else:** `npm run check:changed` before each commit (typecheck and lint of the whole project, which take seconds, plus only the tests downstream of uncommitted changes). Docs-only commits need no checks. The full suite runs only before a GitHub sync or a deploy.
- **UI:** check phone width (375 px) and one wide width, and show Jared a screenshot. No pixel-baseline suites until the design settles.
- **Never weaken** a test, type or validation to get green. If a failure still isn't understood after a real look, stop and report it with the output.
- Don't re-verify what a passing check already shows, and don't re-read a file to confirm an edit landed.

## Content and data

- The produce list, types, categories and classes are curated. Data scripts (`usda:*` and any future source) run on demand only, inform Claude's and Jared's judgment, and never change content themselves; propose list changes to Jared with the evidence.
- Never present invented data as real. Synthetic fixtures carry `synthetic: true`.
- Verdict methodology, thresholds and requirements come from the product spec or Jared. Never invent them.
- Quality ratings start from the model panel (`content/panel/`, P15): the combined judgments of the counted models form the first-order source, and real, checked citations validate it, fill its gaps (at least 2 where the panel has no rating) and can overrule it only with eating-quality evidence. Traits, typical origins and store ranges still need real, checked citations. Editorial data starts as `status: draft`. A record becomes `reviewed` only on Jared's explicit approval. Drafts deploy like reviewed records, so in conversation flag anything uncertain or needing Jared's judgment rather than relying on review to catch it.
- Copy follows the product spec's §8 writing standards: concrete cues, ranges rather than guarantees, card text of at most 12 words.
- `generated/` is build output: never edit it; read it for analysis and editorial review.
- Privacy: never log or store a ZIP, coordinates, IP address or search text on a server.

## Environment

- The dev machine is Windows 11. Scripts must be cross-platform: Node or package.json scripts, never bash-only.
- Node 26 LTS (Scoop). Commands:
  - `npm run dev`: app and Worker locally, with hot reload
  - `npm run check:changed`: typecheck, lint, and the unit tests affected by uncommitted changes (before each commit; `-- HEAD~3` widens it to recent commits)
  - `npm run check`: assessments drift check, typecheck, lint, all unit tests (before a GitHub sync or a deploy)
  - `npm run e2e`: build, then Playwright smoke tests in both browsers against the build running in workerd, with four local test workers
  - `npm run build`: client build plus the prerendered HTML (`scripts/prerender.ts`)
  - `npm run deploy`: from a clean `main`, check previous CI, run production validation and tests, push the tested commit, deploy that build, and smoke-test the live site. `npm run deploy -- --dry-run` runs the local checks and Wrangler dry run.
  - `npm run format`: Biome autofix (Markdown is excluded, so docs keep their formatting)
  - `npm run cf-typegen`: regenerate Worker types after changing `wrangler.jsonc`
  - `npm run data:build`: validate `content/` and `data/`, write `src/generated/data.json` and the committed assessments in `generated/assessments/`, print counts (`-- --production` refuses synthetic records and items without approved art). `npm run data:check` (first step of `check` and CI) fails when the committed assessments differ from a fresh build
  - `npm run content:report`: editorial review listings (unrated windows, `alwaysGood` vs outlook). Run only for content review, never during app work
  - `npm run brand:icons`: write `public/` favicon and home-screen icons from the mark in `src/shared/brand.ts`
  - `npm run art:process`: check Jared's painted masters in `art/masters/`, write `public/art/` derivatives and the contact sheet (`.cache/art/contact-sheet.html`)
  - `npm run usda:probe`, `usda:terminal-probe`, `usda:terminal-screen`: USDA reference-data probes (cached in `.cache/usda/`, run in the background)
- Secrets: `.env.pipeline` holds pipeline-only keys (the USDA key), read by `scripts/` only. Don't use `.env`: the Cloudflare plugin loads it into the Worker.

## Git and GitHub

- Work on `main` in small commits. Each message says what changed and how it was checked. Never mix refactors, upgrades or formatting with feature work.
- Commit locally after each increment. **Sync to GitHub (push `origin`, a private repository) only when Jared asks**, and before a deploy. Say in the summary how many commits are unsynced.
- For a sync without deployment, run `npm run check` and `npm run e2e` before pushing. GitHub CI runs `npm run check` and both browser projects in parallel jobs as a backstop. **Never wait on, poll or watch GitHub Actions after a push.**
- Deploy only when Jared asks. `npm run deploy` stops if the previous CI run failed. Read the failed log (`gh run view <id> --log-failed`) before resolving it. The command checks the homepage and Worker health once after publication. Live URL: https://orchard.jpeterson92.workers.dev
- No secrets in git. `.env` and `.dev.vars` are ignored; `.env.example` lists variable names only.

## End of every session

Update `PROGRESS.md`: what changed, the next concrete action, and blockers. Keep it under about 60 lines, and delete whatever is superseded.

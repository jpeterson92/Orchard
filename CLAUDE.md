# Orchard: working agreement

Orchard is a phone-first web app that tells supermarket shoppers which produce is worth buying now (Peak, Good, Skip or Limited evidence) and how to pick, store and ripen it. Claude Code implements. Jared is product owner and editorial reviewer: he decides product and content questions and reviews what each session produces. Engineering choices are Claude's to make.

## Where things stand

Read `PROGRESS.md` first: phase, next action, blockers, decisions. How it's built and in what order: `docs/engineering-plan.md`. `docs/archive/` holds superseded specs; use them for reference detail only, never as instructions.

## Documents

Read only the sections a task needs: Grep for the heading, then Read with offset and limit. Don't re-read whole specs every session.

| Doc | Governs | Most-used sections |
| --- | --- | --- |
| `docs/engineering-plan.md` | Architecture, stack, milestones, verification depth | §1 shape · §2 stack · §4 data and engine · §5 milestones · §6 verification |
| `docs/product-spec.md` | Behavior, scope, copy | §4 navigation · §5 screens · §6 in-store mode · §7 verdict rules · §8 content model and writing standards · §10 non-functional |
| `docs/design/design-system.md` | Visual design, tokens, components | §3 color · §4 type and tokens · §5 layout · §6 components · §9 accessibility |
| `docs/design/illustration-guide.md` | Painted artwork and image prompts | Only for image work |
| `docs/design/references/` | Mockups; `00-today-anchor.png` is the approved anchor | View the relevant one before UI work |
| `docs/reviews/2026-11-16-pre-build-review.md` | Why the plan changed (decisions D1–D3) | Background only |
| `docs/archive/` | Superseded engineering spec and implementation guide | Reference detail only |

When documents conflict: Jared's decisions (in `PROGRESS.md`) > product spec for behavior > design system for visuals > engineering plan for how it's built.

## Working efficiently

- **One increment at a time, sized to finish.** It ends in something Jared can review (a preview URL, a screenshot at 375 px, or a draft content batch) and a commit.
- **Read narrowly, act early.** For an engineering detail, pick the conventional option, note it in one line, and move on. Don't reopen decisions recorded in `PROGRESS.md`.
- **Ask Jared only** about product behavior, editorial content, money, accounts or credentials. Batch the questions; don't stop for routine confirmation.
- **Timebox tooling trouble.** After two failed attempts at the same setup or config problem, take the simpler alternative or record a blocker in `PROGRESS.md` and move on. Don't dig through library internals.
- **Prefer mature, widely used libraries** over the newest release. Pin exact versions. A new direct dependency gets one line under Decisions in `PROGRESS.md`.
- **No speculative work:** no config options, abstractions, extension points or fallbacks without a current need. No new docs beyond `PROGRESS.md` unless asked.
- Use subagents only for wide searches or research that would otherwise flood the context.

## Verification, in proportion

- **Verdict engine and data validation: test thoroughly.** A table-driven case per rule and per precedence pair, plus property tests for the invariants. This is where correctness matters most.
- **Everything else:** typecheck, lint, and the tests for the module touched. Run the full suite before pushing, not after every edit.
- **UI:** check phone width (375 px) and one wide width, and show Jared a screenshot. No pixel-baseline suites until the design settles.
- **Never weaken** a test, type or validation to get green. If a failure still isn't understood after a real look, stop and report it with the output.
- Don't re-verify what a passing check already shows, and don't re-read a file to confirm an edit landed.

## Content and data

- Never present invented data as real. Synthetic fixtures carry `synthetic: true`.
- Verdict methodology, thresholds and requirements come from the product spec or Jared. Never invent them.
- Editorial data Claude drafts needs real, checked citations (at least 2 per rating) and starts as `status: draft`. A record becomes `reviewed` only on Jared's explicit approval. Production builds refuse drafts.
- Copy follows the product spec's §8 writing standards: concrete cues, ranges rather than guarantees, card text of at most 12 words.
- Privacy: never log or store a ZIP, coordinates, IP address or search text on a server.

## Environment

- The dev machine is Windows 11. Scripts must be cross-platform: Node or package.json scripts, never bash-only.
- Node 26 LTS (Scoop). Commands:
  - `npm run dev`: app and Worker locally, with hot reload
  - `npm run check`: typecheck, lint, unit tests (run before every push)
  - `npm run e2e`: build, then Playwright smoke tests against the build running in workerd
  - `npm run build`: client build plus the prerendered HTML (`scripts/prerender.ts`)
  - `npm run deploy`: build, then `wrangler deploy` (wrangler is signed in on this machine)
  - `npm run format`: Biome autofix (Markdown is excluded, so docs keep their formatting)
  - `npm run cf-typegen`: regenerate Worker types after changing `wrangler.jsonc`
- Secrets: `.env.pipeline` holds pipeline-only keys (the USDA key), read by `scripts/` only. Don't use `.env`: the Cloudflare plugin loads it into the Worker.

## Git and GitHub

- Work on `main` in small commits. Each message says what changed and how it was checked. Never mix refactors, upgrades or formatting with feature work.
- Testing happens locally: `npm run check` before every push, plus `npm run e2e` when UI, routing, the build or the Worker changed. CI repeats the same checks on GitHub as a backstop.
- Push to `origin` (a private GitHub repository) at the end of each session and at each reviewable milestone. **Never wait on, poll or watch GitHub Actions after a push.**
- Before each deploy, check the latest CI run once (`gh run list --limit 1`). If it failed, read the log (`gh run view <id> --log-failed`), fix it, then deploy. Live URL: https://orchard.jpeterson92.workers.dev
- After a deploy, check the live URL once (single requests with a timeout), never in a retry loop. If it isn't up, report it and move on.
- No secrets in git. `.env` and `.dev.vars` are ignored; `.env.example` lists variable names only.

## End of every session

Update `PROGRESS.md`: what changed, the next concrete action, and blockers. Keep it under about 60 lines, and delete whatever is superseded.

---
name: next
description: Do the next development increment of Orchard from PROGRESS.md, sized to finish in one run, then commit locally and summarize it in plain language.
disable-model-invocation: true
---

# /next: do the next increment

Follow CLAUDE.md throughout. This command adds only the steps below.

## 1. Find the work

- Read `PROGRESS.md`: the next concrete action, blockers and open questions.
- Read only the sections of `docs/engineering-plan.md` (and the product spec or design system, if it's UI or content work) that this action needs. Grep for the heading, then read with offset and limit.
- If the next action is blocked on Jared, don't start it. Take the next unblocked action instead and say why. If nothing is unblocked, stop and ask the blocking questions, batched.

## 2. Size it to one run

Pick a slice that one high-effort run can finish, checks included, without the context filling up. As a guide, one coherent slice:

- delivers one thing that works end to end (a schema and its validation, an engine rule group with its tests, one screen, one pipeline script);
- touches roughly 10 files or fewer and adds a few hundred lines, not thousands;
- needs at most one new dependency.

If the milestone is bigger than that, split it into slices, do the first, and write the remaining slices into `PROGRESS.md` as the next actions. Finishing a smaller slice cleanly beats leaving a bigger one half done. If something turns out bigger mid-run, cut scope, don't stretch.

## 3. Build it

- Implement the slice. Make engineering choices yourself.
- Stop and ask Jared only about product behavior, editorial content, money, accounts or credentials. If a question blocks only part of the slice, finish the rest and include the question in the summary.

## 4. Check it, in proportion

- Before each commit: `npm run check:changed` (only the tests downstream of the change). Docs-only commits need none.
- Verdict engine and data validation: write full table-driven and property tests, as CLAUDE.md requires; `check:changed` runs them whenever the engine changes.
- The full `npm run check` and `npm run e2e` run only when syncing to GitHub or deploying, which happens only when Jared asks.
- Fix failures properly. If one still isn't understood after a real look, stop and report it with the output.

## 5. Commit

- Commit in small commits on `main`. Each message says what changed and how it was checked.
- Update `PROGRESS.md`: what changed, the next concrete action, blockers. Keep it under about 60 lines.
- Don't push or deploy unless Jared asked for it this run. Say how many commits are unsynced.

## 6. Summarize for Jared

End with a short plain-language summary, a few sentences or bullets, for someone who didn't watch the run:

- what now works or exists that didn't before, in product terms rather than file names;
- anything not done, cut, or not verified;
- any questions for Jared;
- what `/next` will do next time.

Add a screenshot, live link or artifact only when it shows something Jared would want to see, such as a new or changed screen or a content batch to review.

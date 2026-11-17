# PROGRESS

Updated: 2026-11-16 · Phase: pre-build · Waiting on: Jared's decisions D1–D3

## Next concrete action

Once D1–D3 are answered: replace `docs/engineering-spec.md` and `docs/implementation-guide.md` with one lean `docs/engineering-plan.md`, move the originals to `docs/archive/`, and apply the consistency fixes in review §2.

## Blocking (needs Jared)

- **D1–D3** (`docs/reviews/2026-11-16-pre-build-review.md` §4). Blocks the engineering plan.
- **`gh auth login`** on this machine. Blocks the first push to GitHub.
- **USDA My Market News API key.** Blocks the USDA data probe, the first build task.
- **Cloudflare account.** Blocks the first preview deploy.

## Decisions

Record each as: date · ID · decision · one-line reason.

- (none yet)

## Done

- 2026-11-16 Pre-build review written. Repository initialized with the original docs committed unchanged first; docs reorganized; design system split into design system + illustration guide; `CLAUDE.md`, `README.md` and this file added.

## Environment notes

- Node v20.10 is installed and past end of life; install the current LTS when scaffolding. pnpm and Wrangler aren't installed.
- Python 3.12 and uv 0.13 are available. The GitHub CLI is installed but not signed in.

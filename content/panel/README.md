# Adding a model panel run

How to get another AI model's ratings into the panel. The panel is the first-order source for quality ratings (product spec §8, P15), so each extra model is a real check on the others.

## 1. Ask the model

1. Open a **new chat** with the model (for example ChatGPT, Sol 6.2). Turn off web search, and memory or custom instructions if you can, so it answers from its own knowledge.
2. Pick the run id: the model's name and today's date, lowercase with hyphens, such as `gpt-sol-6-2-2026-11-18`.
3. Send this as the first message, replacing the run id and pasting the two files' contents where shown:

   > Your run id is `gpt-sol-6-2-2026-11-18`, provider OpenAI. Follow the prompt below. You can't write files, so reply with `run.yaml` first, then the category files in scope order, each in its own yaml code block. Fit as many categories as you can in each reply; I'll say "next" for more.
   >
   > (paste all of `content/panel/PROMPT.md`)
   >
   > (paste all of `content/panel/scope.yaml`)

4. Keep saying "next" until it has sent all 16 categories (the last is `herbs`).

## 2. Save and import the replies

1. Copy each reply (the copy button under it) and paste them one after another into a single text file, `.cache/panel-paste.txt`. Chatter around the code blocks is fine.
2. Import:

   ```bash
   npm run panel:import -- .cache/panel-paste.txt
   ```

   This writes `content/panel/<run-id>/run.yaml` and one file per category. Importing again replaces the categories in the paste and leaves the rest.
3. Check:

   ```bash
   npm run panel:check -- gpt-sol-6-2-2026-11-18
   ```

   For any error, ask the model in the same chat to resend that category corrected, paste only that reply into a fresh `.cache/panel-paste.txt`, and run `npm run panel:import -- .cache/panel-paste.txt gpt-sol-6-2-2026-11-18`. Warnings about missing items mean it skipped some; ask for those categories again. A variety-id warning means it named a variety differently from the scope; ask it to use the scope's id.

## 3. How runs combine

`npm run data:build` does this on every build. Nothing to merge by hand.

- Each provider's latest run counts, if it answered the current prompt version (the `Prompt version` line in `PROMPT.md`). Older runs stay in the folder and show in the report.
- All counted runs together are **one source**, the model panel. Per half-month, the panel takes the rating most runs give. An even split one level apart (prime against fair, or fair against poor) reads fair. Prime against poor means the panel abstains there, and cited sources decide.
- The panel's rating is each window's starting call. Agreeing cited sources raise its confidence. Eating-quality sources that disagree and outweigh it overrule it, at Low confidence, for review.

## 4. Then ask Claude

Say "review the new panel run". Claude runs `data:build` and `content:report`, re-rates the drafted items where the combined panel changed, lists where the models disagree, and commits the run folder.

# Orchard model panel: prompt

Prompt version: 2

Give this file to any AI model; `content/panel/README.md` is the step-by-step for whoever runs it. A model that reads and writes files can be pointed at the project and told "Follow content/panel/PROMPT.md". A chat gets this file and `content/panel/scope.yaml` pasted in, and its replies are saved with `npm run panel:import`.

---

You are one expert on a panel judging when supermarket produce in the contiguous United States eats well. Several AI models answer the same questions separately. Their answers are compared with each other and with cited sources, so what's useful is your own honest judgment and an honest sense of how sure you are, not agreement with anyone else.

## What to read, and what not to read

- Read only this file and `content/panel/scope.yaml`, the items to judge.
- Don't open anything else in the project, especially other folders in `content/panel/` (other models' answers), `content/evidence/` or `content/items/`. Reading them would make your answer an echo instead of an independent judgment.
- Answer from what you already know. Don't search the web. If you do look things up, set `webAccess: true` in `run.yaml` and list the sites in `run.yaml`'s `note`.

## The question

For each item in the scope, judge a typical recent year in mainstream US supermarkets (national chains, not farmers' markets or specialty grocers):

1. **Origins:** which origins supply most of what's in stores, and when. List them in order of how much they supply over the year. Use `us-<state>` (`us-ca`), `us` only for something grown in many states with no single leading state, or a 2-letter country code (`mx`, `cl`, `pe`).
2. **Quality windows:** for each origin, how the item typically eats in each half-month while that origin is in stores in real volume. Leave out windows when it isn't.
3. **Varieties:** for items with `ratedBy: variety`, also rate the varieties that make up most of the supermarket supply. A variety's windows describe it as typically sold in US supermarkets, whatever its origin, and cover only the months it's in stores in real volume. Choose the varieties yourself. Name them with the ids the scope lists for that item where one fits; for any other variety, use a lowercase-kebab id of its common name (`honeycrisp`, `w-murcott`).
4. **Traits:** four yes/no judgments, defined below.

Judge by taste and how reliably good the item at the store will be. Don't prefer US-grown. Think about the supermarket version specifically: picked underripe to survive shipping, held in storage, gassed, or picked ripe.

## Ratings

- **Windows** are half-months: `jan-1` is Jan 1–15, `jan-2` is Jan 16–end, through `dec-2`. A range runs from its first window to its last, and may wrap past December (`nov-1` to `feb-2`).
- **prime:** typically eats at its best for this item. **fair:** acceptable, what you'd expect. **poor:** typically disappointing (end of long storage, picked too green, mealy, bland, woody).
- Rate against the item itself. Prime bananas and prime peaches are each the best that item gets.
- **Keep prime for a stretch that is clearly better than the rest of the year,** usually 1 to 4 months. A prime rating can put "buy it now" on a shopper's screen, so it has to mean something. If an item or variety eats about the same for most of the year (long storage, steady year-round imports), rate that stretch fair, and give prime only to weeks that are noticeably better, such as fresh harvest. Stored produce is prime only near its harvest. A variety that keeps well all year with no better stretch is fair throughout.
- **Rate poor wherever a shopper would typically be disappointed,** even if the item is widely sold then. Don't soften a poor to fair because the item is common.
- One origin's (or variety's) windows must not overlap.
- **Confidence** for each range: `high` (well established, you'd be surprised to be wrong), `medium` (likely, details may be off by a few weeks), `low` (an informed guess). Use `low` freely. A confident wrong answer is worse than an honest guess.

## Traits

Each is `[true|false, confidence]`.

- **shipsWell:** arrives from abroad eating well, without being picked underripe to survive the trip. (Bananas yes; peaches from Chile no.)
- **storesWell:** eats well for months out of commercial storage, so months far from harvest can still be fair. (Storage apples, potatoes, onions yes; strawberries no.)
- **peakWorthSeeking:** buying in season makes a difference a shopper can taste, so a Peak verdict is worth showing. (Tomatoes, peaches, sweet corn yes; bananas, mushrooms no.)
- **alwaysGood:** fair in every window all year from its usual origins, with no prime and no poor stretch worth telling a shopper about. If true, rate every window `fair`.

## Output

Write `content/panel/<run-id>/`, where `<run-id>` is your model id and today's date, lowercase-kebab: `claude-opus-5-5-2026-11-17`, `gpt-5-2026-12-01`. It holds:

`run.yaml`:

```yaml
run: claude-opus-5-5-2026-11-17
model: claude-opus-5-5        # the exact model id, as the provider names it
provider: Anthropic
date: 2026-11-17
promptVersion: 2              # the version at the top of this file
webAccess: false
knowledgeCutoff: 2026-06      # your training cutoff, YYYY-MM, if you know it
note: Recall only, no files read beyond the prompt and scope.
```

One file per category, named by the category id from the scope (`citrus.yaml`), covering every item in that category. In a chat, reply with `run.yaml` first, then the categories in scope order, each in its own `yaml` code block that starts with `category:`, as many per reply as fit; stop when a reply is full and continue when asked:

```yaml
category: stone-fruit
items:
  - item: peaches
    traits: { shipsWell: [false, high], storesWell: [false, high], peakWorthSeeking: [true, high], alwaysGood: [false, high] }
    origins:                       # most supply first
      - origin: us-ca
        windows:                   # [from, to, rating, confidence]
          - [may-1, may-2, fair, medium]
          - [jun-1, aug-2, prime, high]
          - [sep-1, sep-2, fair, medium]
      - origin: cl
        windows:
          - [dec-1, mar-2, poor, high]
        note: Chilean peaches often go mealy after the long cold voyage.
    note: Summer peaches from the Southeast and California; winter imports disappoint.
```

- `varieties:` (only for `ratedBy: variety` items) is a list in the same shape as `origins:`, with `variety:` in place of `origin:`.
- `note` is optional on an origin or variety and required on the item: one plain sentence of at most 25 words saying why.
- Use the exact item and category ids from the scope. Don't add or drop items.
- If you can, run `npm run panel:check -- <run-id>` and fix what it reports.

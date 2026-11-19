---
status: draft
---
Orchard says which produce is likely to eat well in US supermarkets right now. Here is how each verdict is reached, and what it rests on.

## The verdicts

- **Peak:** at its best this time of year, and worth seeking out. Much of what's on the shelf is among the best you'll find all year; where some isn't, Check the label shows and the card or item page says what to look for. An item has at most one Peak season a year.
- **Good:** eats well, but isn't at its best, or its best season makes little difference you can taste.
- **Skip:** out of season, or what's typically on the shelf now usually disappoints, for example fruit out of long storage.
- **Limited evidence:** we don't have reviewed evidence for where stores usually get it now. We never fill the gap with a guess.

Prices and promotions never change a verdict. An expensive item can be Peak, and a heavily advertised one can't become Peak because stores are pushing it.

## Markers

- **Check the label:** the places that commonly supply stores now differ: one disappoints while another eats well, or the item is Peak from some places but not all. The label tells you which you have, and the item page names the places to look for and any to avoid.
- **Last call:** the item is usually past its best within about a month.
- **Reliable year-round:** Good or better in at least {{reliableYearRoundWindows}} of the year's 24 half-months.
- **Always good:** tastes much the same all year, so it stays off Today. Find it in Browse, Calendar or search.

## How a verdict is reached

The year is split into 24 half-months: the 1st to the 15th, and the 16th to the end of the month. For each item, each half-month is rated for every major growing region, or for every variety where the variety matters most (apples, for example): *prime* when it typically eats best, *fair* when it's acceptable, *poor* when it typically disappoints. Each rating rests on at least two sources.

USDA shipment and import reports show where supermarkets typically get an item each month: the regions that together supply at least {{typicalOriginShare}} of reported volume, averaged over three years. The same reports show where each region is in its own season. Supply below {{supplyThin}} times the region's usual level is thin, as at the first and last picks of a season.

The rules run in order, and the first that applies decides:

1. **Limited evidence** when our ratings don't cover the regions that typically supply stores now.
2. **Skip** when the item is out of season, or the main region is rated poor.
3. **Peak** when you have a good chance of finding it at its best: the top region is rated prime, or regions rated prime supply at least {{peakShare}} of the month's volume. Those regions count only if their supply isn't thin and they're in the US, Mexico or Canada, and the item's best season must be one you can taste.
4. **Good** otherwise.

When the top region is rated poor but the next one is rated better and supplies at least {{decidingOriginShare}} of the month's volume, the next region decides, so the verdict shows that a good buy is commonly on the shelf.

An item is Peak for one season a year at most. If the ratings give it two, the longer one is its Peak season, and the other reads Good. For items rated by variety, each variety typically in stores gets its own verdict, and the item shows the best.

Produce shipped from further away than Mexico or Canada is Good at most, because produce that travels far is less reliably at its best when it arrives. "What does the label say?" still shows its own rating.

Some produce you can pick out by the sign or label is at its best even when most of the bin isn't, such as ripe local field tomatoes in summer. When it is common in stores, the item is Peak, the card says what to look for, and Check the label shows.

Future dates show the typical seasonal outlook: what is normally good around that time, never a current assessment.

## Confidence

Confidence says how complete and current the evidence is. It isn't the chance that the item is good. Four checks go into it:

- **Coverage:** the ratings cover the regions or varieties that typically supply stores now, on solid seasonal evidence.
- **Relevance:** the evidence describes supermarket supply, not only local farms.
- **Freshness:** the USDA supply data is under {{snapshotMaxAgeMonths}} months old.
- **Agreement:** the ratings and the typical supply pattern point the same way.

**High** when all four hold, **Medium** when one is weak, **Low** when two or more are.

## Two kinds of evidence

Each item page says which applies:

- **Seasonal assessment and typical national supply:** USDA data ranks where stores get the item, and our ratings cover those regions.
- **Seasonal assessment only:** for items whose USDA data is too thin to use. These verdicts are Medium confidence at most.

USDA supply data is a yearly snapshot of the last three years of reports. The seasonal assessment is reviewed at least once a year. Neither means anyone checked the produce in a store.

## How sources are weighed

Ratings start from an AI model panel: several AI models each rate every item from what they learned, using one shared prompt, and together they count as one source. Cited sources then check that rating. Where they agree, confidence rises. Where sources about eating quality clearly disagree, they win and the rating is marked Low confidence. A rating from the panel alone is Medium confidence. Where the panel gives no rating, at least two cited sources are needed.

The cited sources come from a wide range of places that say when an item eats best:

- **Authoritative sources** (university extension services, commodity boards, USDA and trade references) carry more weight.
- **Mainstream sources** (major food publications and grocer guides) count too, with less weight.
- A source that restates another counts once.
- Harvest calendars show timing but not taste, so on their own they support Medium confidence at most. High confidence needs a source about eating quality.

## What the guidance covers

- **The contiguous US.** Alaska and Hawaii have their own supply chains.
- **The typical season.** One year's unusual weather isn't reflected, and the typical outlook is never edited for it.

## Audits

Two reviewers who didn't write these rules buy and taste a sample of Peak items each month, mixed blind with Good and Skip items. A Peak call only adds value if it clearly beats the others. No audit has run yet; the results will be published here.

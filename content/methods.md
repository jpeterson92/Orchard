---
status: draft
---
Orchard says which produce is likely to eat well in US supermarkets right now. Here is how each verdict is reached, and what it rests on.

## The verdicts

- **Peak:** you should really get it now. It's this item's best season, and you have a good chance of finding it among the best you'll get all year. Where only some of the bin is, the card says what to look for. An item has at most one Peak season a year.
- **Good:** if you want it now, you'll be happy with it.
- **Skip:** not a great time of year; what's on the shelf will be mediocre, for example fruit out of long storage, or it's out of season.
- **Not rated:** we don't have reviewed ratings for where stores usually get it now, so we make no call. We never fill the gap with a guess.

Prices and promotions never change a verdict. An expensive item can be Peak, and a heavily advertised one can't become Peak because stores are pushing it.

## Markers

- **Look for …:** the verdict holds for only part of what's in stores, so the card names what to pick: varieties, places it's grown, or something on the sign such as "local field-grown". It shows when at most {{lookForShare}} of the typical supply qualifies; above that, a mis-pick is unlikely and the card doesn't ask you to check. The item page names any place to avoid.
- **Last call:** the item is usually past its best within about a month.
- **Reliable year-round:** Good or better in at least {{reliableYearRoundWindows}} of the year's 24 half-months.
- **Always good:** tastes much the same all year, so it stays off Today. Find it in Browse, Calendar or search.

## How a verdict is reached

The year is split into 24 half-months: the 1st to the 15th, and the 16th to the end of the month. For each item, each half-month is rated for every major growing region, or for every variety where the variety matters most (apples, for example): *prime* when it typically eats best, *fair* when a shopper who wants it will be happy with it, *poor* when it's mediocre or worse. Each rating rests on at least two sources.

USDA shipment and import reports show where supermarkets typically get an item each month: the regions that together supply at least {{typicalOriginShare}} of reported volume, averaged over three years. The same reports show where each region is in its own season. Supply below {{supplyThin}} times the region's usual level is thin, as at the first and last picks of a season.

The rules run in order, and the first that applies decides:

1. **Not rated** when our ratings don't cover the regions that typically supply stores now.
2. **Skip** when the item is out of season, or too little of what's in stores is rated better than poor.
3. **Peak** when regions rated prime are reasonably likely on the shelf. Those regions count only if their supply isn't thin and they're in the US, Mexico or Canada, and the item's best season must be one you can taste.
4. **Good** when regions rated fair or better are reasonably likely on the shelf.

Reasonably likely means those regions together supply about {{availableShare}} or more of what stores typically carry, or sources show mainstream supermarkets commonly carry them then. Shipment figures are rough, so they inform the call rather than settle it. A rating resting on thin evidence counts only for the top region.

An item is Peak for one season a year at most. If the ratings give it two, the longer one is its Peak season, and the other reads Good. For items rated by variety, each variety typically in stores gets its own verdict, and the item shows the best.

Produce shipped from further away than Mexico or Canada is Good at most, because produce that travels far is less reliably at its best when it arrives. "What does the label say?" still shows its own rating.

Some produce you can pick out by the sign or label is at its best even when most of the bin isn't, such as ripe local field tomatoes in summer. When it is common in stores, the item is Peak and the card says what to look for.

Future dates show the typical seasonal outlook: what is normally good around that time, never a current assessment.

## Overall variety scores

The apple and pear guides rate how enjoyable each variety is to eat raw. Apple scores average [Apple Rankings](https://applerankings.com/) and Orchard's own scores. For pears, Orchard estimates ripe flavor, juiciness and texture on a 100-point scale. The estimates draw on a [Pacific Northwest consumer tasting study](https://pubmed.ncbi.nlm.nih.gov/38204401/) and [published variety profiles](https://www.usapears.org/pear-varieties/). The tasting covered six of Orchard's ten pears and tested summer and winter varieties with different groups of tasters. The overall score applies year-round. Today's verdict reflects what's typically good and available at this time of year.

## Two kinds of evidence

Each item page says which applies:

- **Seasonal assessment and typical national supply:** USDA data ranks where stores get the item, and our ratings cover those regions.
- **Seasonal assessment only:** for items whose USDA data is too thin to use.

USDA supply data is a yearly snapshot of the last three years of reports. The seasonal assessment is reviewed at least once a year. Neither means anyone checked the produce in a store.

## How sources are weighed

Ratings start from an AI model panel: several AI models each rate every item from what they learned, using one shared prompt, and together they count as one source. Cited sources then check that rating. Where sources about eating quality clearly disagree, they win. Where the panel gives no rating, at least two cited sources are needed.

The cited sources come from a wide range of places that say when an item eats best:

- **Authoritative sources** (university extension services, commodity boards, USDA and trade references) carry more weight.
- **Mainstream sources** (major food publications and grocer guides) count too, with less weight.
- A source that restates another counts once.
- Harvest calendars show timing but not taste, so they count for less than a source about eating quality.

## What the guidance covers

- **The contiguous US.** Alaska and Hawaii have their own supply chains.
- **The typical season.** One year's unusual weather isn't reflected, and the typical outlook is never edited for it.

## Audits

Two reviewers who didn't write these rules buy and taste a sample of Peak items each month, mixed blind with Good and Skip items. A Peak call only adds value if it clearly beats the others. No audit has run yet; the results will be published here.

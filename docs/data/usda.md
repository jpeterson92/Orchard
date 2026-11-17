# USDA data findings

What USDA Market News data can and can't support, from 3 years of reports (Nov 2023 to Oct 2026). Rerun with `npm run usda:probe`, `usda:terminal-probe` and `usda:terminal-screen`; raw responses are cached in `.cache/usda/`.

## Verdict

- **Apples, pears, strawberries and broccoli:** typical origins (≥ 70%) and the P11 supply index can both be computed. Results are stable year to year.
- **Mandarins:** fail on domestic data. USDA stopped reporting California and Florida citrus shipments in early 2025, and before that the California data arrived in irregular lump sums. Imports are fine. Such items use cited editorial origins and a null supply index.
- **Regional verdicts (v1.1):** no regional arrival volumes exist. Only city price reports with the origins on offer.

## Source

The USDA AMS Market News API (`marsapi.ams.usda.gov/services/v1.2`), "Movement" market type, section `Report Details`. A key is passed as the basic-auth username. A request filtered by commodity and a 3-year range returns in about 1 second, under the 100,000-row cap.

| Report | Carries |
| --- | --- |
| `WA_FV170` (3283), national | **All imports**: country of origin, port of entry, truck/boat/air. History back to 1998 |
| 16 office reports `*_FV170` (Yakima, Fresno, El Centro, Idaho Falls, Phoenix, Orlando, Thomasville, Benton Harbor, …) | **Domestic shipments and exports** for their districts. 7 offices closed in Dec 2024 (Atlanta, Boston, Chicago, Dallas, Philadelphia, Seattle, San Francisco); their history must still be fetched |
| `WA_FV568` national rail | Discontinued Jun 2025 |

The two report groups don't overlap: no import row appears in an office report. Exact repeats are rare (73 rows in 51,000).

## Fields and units

- **Volume:** `1 lb units` is already in pounds. `package_count` and `package` give the raw count.
- **Who and where:** `commodity`, `variety` (sometimes), `origin`, `district`, `import/Export` (`D`, `I`, `Exp`), `trans_Mode`, `organic`, `season`.
- **Domestic origin:** a state, or a sub-state region such as `California-Central`, `California-South` or `California-North`. Import origin: a country.
- **`asw_Flag` matters:**
  - `Week Ending` rows are weekly totals, and the only form some districts report. For example, all Washington apple and pear data is weekly.
  - `Add` and `Subtract` rows are late corrections for the shipment date in `asw_date`; subtract rows have negative volume.
  - A first parse that treated these as duplicates undercounted apples by about 25%.
- Exports are excluded from supply.

## Results (3-year pooled; full tables from `npm run usda:probe`)

| Item | Supply/season | Domestic | Origins to reach 70% | Supply index range | Top origin by month |
| --- | --- | --- | --- | --- | --- |
| Apples | ~5.2B lb | 97% | 1 in every month | 0.82 (Jun) – 1.17 (Oct) | Washington all year (75–84%) |
| Pears | ~0.8B lb | 87% | 2–3 | 0.46 (Jul) – 1.46 (Nov) | Washington and Oregon Sep–Mar; Argentina Apr–Jun; California-North Jul–Aug |
| Strawberries | ~2.9B lb | 75% | 1–3 | 0.50 (Nov) – 1.43 (May) | Mexico Dec–Mar; California-Central Apr–Oct; Florida is a strong 2nd Jan–Mar |
| Broccoli | ~1.1B lb | 46% | 2 in every month | 0.72 (Sep) – 1.34 (Mar) | Mexico Nov–May; California-Central Jun–Oct |
| Mandarins | imports ~1.1B lb | not usable | — | — | Imports: Morocco Dec–Apr, Chile and Peru Jun–Nov |

The top origin matches in all 3 years for most item-months. Where it flips (pears in Mar–May, broccoli in Apr–May and Oct), the top two are within a few points of each other. That is the case P9's "Depends on the label" note exists for.

**Mandarin detail.** California mandarins came only through El Centro (`San Joaquin Valley California`) and stopped on Feb 12, 2025. One row on Sep 5, 2024 carries 559M lb. Florida tangerines (Orlando) stopped in Apr 2025. In the 2025–26 season there is no domestic mandarin data at all, so a supply index would read California's winter peak as a trough.

## What this means for the build

- **`npm run usda:derive`** writes `data/usda/typical-origins.csv` and `supply-index.csv` for 49 launch items (the first two groups below, as launch items, plus plantains, coconuts, ginger, jicama, yuca, tomatillos and hot peppers), with per-item month tables and dropped rows in `.cache/usda/derive-report.md`. It drops 4 lump sums (peaches, watermelon, avocados, sweet potatoes, all California). An item joins its list only when its evidence basis is set to USDA-backed at drafting; items with a domestic reporting gap stay off it.
- **Commodity names containing a comma** (`Lettuce, Romaine`) must be quoted in API queries, or the API reads them as two values. `scripts/usda-client.ts` does this.

## Coverage by item

`npm run usda:probe` covers 57 core candidates plus the items added by the launch scope screen. It writes the full table to `.cache/usda/coverage.md`. Each item falls into one of four groups:

| Group | Items | Evidence basis |
| --- | --- | --- |
| **USDA works, domestic and imports** | apples, pears, peaches, nectarines, plums, cherries, strawberries, blueberries, raspberries, blackberries, grapes, watermelon, cantaloupe, honeydew, avocados, romaine, iceberg, spinach, kale, broccoli, cauliflower, cabbage, Brussels sprouts, potatoes, sweet potatoes, onions, tomatoes, bell peppers, cucumbers, eggplant, sweet corn, green beans, asparagus, celery, zucchini, cilantro, parsley | Supply + assessment |
| **USDA works, imports dominate** (little or no US production reported, which matches where supermarket supply comes from) | bananas, limes, mangoes, pineapples, papaya, green onions, snap peas | Supply + assessment |
| **Domestic reporting stopped in early 2025** (California and Florida tree crops) | mandarins, oranges, lemons, grapefruit, kiwifruit, persimmons, pomegranates | Editorial origins, null index |
| **Large US production never reported** | carrots (California), garlic (California), mushrooms (Pennsylvania), butternut squash | Editorial origins, null index |
| **Too little data** | apricots (~7M lb a season), basil | Assessment only, or leave out |

Notes:
- Stone fruit, grapes and berries from California are unaffected by the 2025 gap; they're reported through Fresno.
- Ten items have a few lump-sum rows, each bigger than half an average month. The derive step must cap or drop these before computing the index.
- Thin months (supply index < 0.8) are mostly where expected: the winter import months for stone fruit and cherries, and summer for broccoli, cabbage and Brussels sprouts.
- The fourth group is my reading of where US supply actually comes from. Each needs citations in the item's content before it's used.

## Launch scope screen

`npm run usda:terminal-screen` samples one week per season (Oct 2025, Jan, Apr and Jul 2026) from the fruit, vegetable, and onion-and-potato price reports of all 11 city terminal markets. It found 289 commodities; about 150 are quoted in 8 or more cities. Wholesale markets also supply ethnic grocers and restaurants, so the proposed list also asks whether mainstream supermarkets stock the item.

Reported volume (`npm run usda:probe`) can't serve as the filter. Cranberries, pumpkins, winter squash, Asian pears, dates, figs, shallots and most herbs have large US production that movement reports never include, so their reported volume understates them badly.

**Launch list (89 items).** The screens above informed it; the list itself is curated, and changes to it are editorial decisions. Types in brackets are one item, not separate items.

| Category | Items |
| --- | --- |
| Apples & pears | apples, pears, Asian pears |
| Citrus | mandarins [clementines, satsumas, tangelos], oranges [navel, Valencia, blood, Cara Cara], lemons, limes, grapefruit |
| Stone fruit | peaches, nectarines, plums, cherries, apricots |
| Berries | strawberries, blueberries, raspberries, blackberries, cranberries |
| Grapes | grapes |
| Melons | watermelon, cantaloupe, honeydew |
| Tropical & subtropical | bananas, plantains, avocados, mangoes, pineapples, papaya, kiwifruit, coconuts, dragon fruit, persimmons, pomegranates, dates, figs |
| Leafy greens & lettuces | romaine, iceberg, leaf lettuce [green, red], butter lettuce, spring mix, spinach, kale, arugula, collard greens, Swiss chard, mustard greens |
| Brassicas | broccoli, broccoli rabe, cauliflower, cabbage, Brussels sprouts, bok choy, napa cabbage |
| Roots & tubers | potatoes, sweet potatoes, carrots, beets, radishes, turnips, parsnips, rutabagas, ginger, jicama, yuca |
| Alliums | onions, green onions, garlic, leeks, shallots |
| Squash | summer squash [zucchini, yellow squash], winter squash [butternut, acorn, spaghetti, kabocha, delicata, pie pumpkin] |
| Tomatoes, peppers & eggplant | tomatoes [round, plum, cherry, grape], bell peppers, mini sweet peppers, hot peppers [jalapeño, serrano, poblano, habanero, Anaheim], cucumbers, eggplant, tomatillos |
| Beans, peas & corn (plus stalks) | sweet corn, green beans [incl. haricots verts], snap and snow peas, asparagus, okra, artichokes, celery, fennel, rhubarb |
| Mushrooms | mushrooms |
| Herbs | herbs [cilantro, parsley, basil, mint, dill, thyme, rosemary, chives]: one item, expected to be always good |

**Not at launch:** chayote, nopales, daikon, celery root, chicories (endive, escarole, radicchio), watercress, guava, lychee, star fruit, cactus pears, kumquats, quince, and individual herbs beyond the herbs item.

**Left out as specialty:** aloe leaves, sugarcane, tamarind, rambutan, jackfruit, cherimoya, mamey sapote, taro, malanga, calabaza, culantro, turmeric, horseradish, bean sprouts, and the Asian and Caribbean specialty greens and squashes.

The evidence basis for each added item is set when its record is drafted:
- **USDA-backed** where imports dominate and are reported, as with plantains, coconuts, ginger, jicama, yuca, tomatillos and hot peppers.
- **Cited editorial origins** where US production is unreported, as with cranberries, pumpkins, winter squash, dates, figs and herbs.

## Variety calendar from terminal markets

`npm run usda:terminal-probe` reads 3 years of fruit price reports from 12 city terminal markets (11 current, plus San Francisco until May 2025), giving 478k apple quotes, 115k pear quotes and 175k citrus quotes. For each variety it gives the share of market-days quoting the item that quoted that variety, by month, plus its main origins. The output is `.cache/usda/variety-calendar.md`.

- **Pears and citrus give clear seasonal shapes.** For example:
  - Comice is quoted on about 35% of market-days from Nov to Feb, and on 3–4% in Jul–Aug.
  - Starkrimson is quoted Aug–Jan.
  - Nadorcott mandarins (Morocco) are quoted Feb–May.
  - W. Murcott mandarins (Peru) are quoted Jul–Oct.
  - Hamlin oranges (Florida) are quoted Oct–Jan.
- **Apples are on offer all year,** because of cold storage. Gala, Fuji, Granny Smith, Red and Golden Delicious and Honeycrisp are quoted on 83–100% of market-days every month. Presence says nothing about freshness for storage crops, so "freshest months" in the apple guide needs citations. Only a few apple varieties show a season: Cortland, Rome and Braeburn are scarce from Jun to Sep.
- **Citrus origins are still visible here** after domestic movement reporting stopped: California leads the navel, clementine and tango quotes. This can cross-check the editorial origins for citrus, as presence rather than share.
- Variety names need a mapping to guide varieties: `PINK LADY/CRIPPS PINK`, `W. MURCOTT AFOURER`, `TANGO`, plus some quotes with no variety. That mapping belongs to the variety content in M7.

## Quality notes in terminal reports

Terminal market rows carry `appearance`, `quality` and `condition` fields, plus a free-text `reporter_comment`. They are exception flags, not a measure of taste: over 3 years, under 1% of apple, pear and mandarin quotes carry one ("Fair Quality", "Fair Condition", "Holdovers", "poorer quality and condition lower"). Apples show a faint rise in January–May, which fits storage decline, but the counts are too small to rate a window. The `storage` field is empty (`N/A`) on every apple quote, so it can't show which varieties sell from long storage. Quality windows therefore rest on cited sources; these flags may later help an editor spot advisory candidates.

## Regional data (v1.1)

No movement data by destination. Terminal market reports for 11 cities (Atlanta, Asheville, Baltimore, Boston, Chicago, Columbia, Detroit, Los Angeles, Miami, New York, Philadelphia) give daily prices by commodity, variety, origin and grade, plus market tone. They show which origins are on offer in a city, but not their share. They could support regional notes or value markers later, but not regional verdicts based on volume.

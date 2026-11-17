# USDA probe (M1)

Run 2026-11-17 with `npm run usda:probe` (`scripts/usda-probe.ts`). Period: Nov 2023 to Oct 2026, 36 months. Items: apples, pears, mandarins, strawberries, broccoli. Raw responses are cached in `.cache/usda/`.

## Verdict

- **Apples, pears, strawberries and broccoli:** typical origins (≥ 70%) and the P11 supply index can both be computed. Results are stable year to year.
- **Mandarins:** fail on domestic data. USDA stopped reporting California and Florida citrus shipments in early 2025, and before that the California data arrived in irregular lump sums. Imports are fine. **Jared needs to decide the fallback for items without domestic data (below).**
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

- **`usda-derive` (M2) can reuse `scripts/usda-lib.ts`:** parsing, `asw_Flag` dates, dedupe, splitting volumes across months, origins to 70%, and the supply index (tests in `usda-lib.test.ts`).
- **Before deriving, it needs checks for:**
  - lump-sum outliers: one row larger than a typical month;
  - a season with no domestic data for an item that had it before.
- **Data is fresh:** reports publish the next business day, so a supply index for "today" is feasible.
- **Not yet known:** which other launch items lack domestic reporting. Citrus is the likely group (oranges, grapefruit, lemons). Running the probe over the full launch list is a quick first step in M2.

## Regional data (v1.1)

No movement data by destination. Terminal market reports for 11 cities (Atlanta, Asheville, Baltimore, Boston, Chicago, Columbia, Detroit, Los Angeles, Miami, New York, Philadelphia) give daily prices by commodity, variety, origin and grade, plus market tone. They show which origins are on offer in a city, but not their share. They could support regional notes or value markers later, but not regional verdicts based on volume.

## Decision for Jared: items without domestic shipment data

1. **Recommended: editorial origins, null index.** Typical origins come from cited editorial records (state citrus statistics, industry calendars), drafted by Claude and reviewed by Jared as in D3. The supply index is `null` with reason `not_reported`, so confidence drops and the Peak-on-thin-supply guard can't fire.
2. **Imports only.** Compute both from imports alone. Simple, but wrong for winter citrus, when California dominates.
3. **Leave such items out of launch**, or show them as Limited evidence until data exists.

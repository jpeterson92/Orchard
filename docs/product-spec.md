# Orchard — Product Specification

Nov 16, 2026 · @Jared Peterson

Visual details are governed by `docs/design/design-system.md`; how it's built, by `docs/engineering-plan.md`.

## 1. Summary

The site opens straight to a **Today** view: the produce worth buying now at US supermarkets, judged on expected eating quality and marked Peak, Good or Skip, with one tap down to any item or variety. It is built first for a phone propped on a shopping cart, and second for planning on a tablet or desktop.

Three ideas set it apart:

- **Supermarket-first.** Verdicts judge how well what supermarkets typically stock here, right now, is likely to eat, based on where that supply comes from. Farmers-market seasonality alone misleads supermarket shoppers, because chains import much of their produce year-round.
- **Glance, then depth.** Five seconds gets the day's six best picks. Two taps get how to choose a ripe one. A variety guide settles Honeycrisp vs Cosmic Crisp.
- **Honest verdicts.** Every verdict says why, what evidence it rests on, and how complete that evidence is. When the evidence is thin, the site says "Limited evidence" instead of guessing.

**Precision reality check.** "Exact day" should be promised as "this half-month window," not literally. The most detailed consumer seasonality guide advertises data accurate to half-month increments ([source](https://apps.apple.com/us/app/-/id1235820625)). Verdicts are national, because US supermarkets source nationally: in a given window, chains across the country sell largely the same crops from the same origins. The app never asks where the shopper is. Today is a current assessment; a future date shows a typical seasonal outlook instead, and is labeled that way.

One more limit shapes the price feature: USDA retail reporting focuses on advertised specials, not everyday prices ([source](https://www.ams.usda.gov/content/dive-specialty-crops-market-news-national-retail-report)). The price signal therefore means "how hard stores nationally are promoting this," a rough guide to value, not a shelf price. It feeds a separate value note (v1.1) and never changes the verdict.

## 2. Goals, non-goals and success metrics

The product succeeds if a shopper can pick a good purchase within five seconds of opening the site, and that purchase holds up when they eat it.

**Goals (v1)**

1. Let a shopper identify a good purchase within 5 seconds of opening, one-handed, with no setup.
2. Let a shopper find selection, storage and ripening advice for any covered item in at most 2 taps or one search.
3. Make every verdict's meaning plain: expected eating quality, shown with its reasons, its evidence and how complete that evidence is.
4. Go deep where variety changes the decision: 3 full variety guides at launch, plus short type notes wherever the type changes the advice.
5. Work in a store with weak or no signal, and say clearly when the offline copy is ready.

**Non-goals (v1)**

- Recipes, meal plans and shopping lists.
- Accounts, sign-in or cross-device sync.
- Store-specific stock or shelf prices.
- Price-driven recommendations. Value is shown as a separate note (v1.1) and never decides a verdict.
- Nutrition or health claims, and pesticide or organic rankings.
- Device-specific experiences: a desktop planning workspace, a kitchen view and printable sheets wait until there is evidence people want them (section 6).
- Users outside the US, and any e-commerce or delivery.

### Primary metrics: did the shopper succeed?

These measure shopping outcomes, not clicks. Reading a verdict in search results, or expanding a card and never opening the item page, both count as success.

| Metric | How it's measured | Proposed target |
| --- | --- | --- |
| Good purchase found within 5 s | Moderated phone tests in real stores, 12+ participants per round | ≥ 80% of participants |
| Selection advice found for a named item ("How do you pick a ripe mango?") | Same tests | ≥ 90% within 2 taps or one search |
| Guidance changed or improved a decision | Optional one-question prompt at the end of a session: "Did this change what you bought?" | Baseline first, then set |
| Purchase met expectations | Optional next-visit prompt for items the shopper marked "Bought it": "How was it?" (Great · OK · Disappointing) | ≥ 80% Great or OK for Peak items |
| Peak audit pass rate | The audit protocol below | Set after 2 audit cycles |
| Time to first verdict on a mid-range phone over 4G (75th percentile) | Real-user monitoring | ≤ 2.5 s |

### Diagnostic metrics: watched, no targets

Item and variety page opens, card expansions, search queries with no result, 14-day return visits, and feedback volume by outcome. These explain why a primary metric moved; they don't count as success or failure on their own.

### In-store feedback keeps outcomes apart

The item page's one-tap feedback records *which* thing happened, rather than a single yes/no: **Looked good · Looked poor · Not in stock · Too pricey**. Taste is asked separately on the next visit, and only for items the shopper marked "Bought it". Availability, appearance, price and eating quality are different findings, and audits analyze them separately.

### What "Peak confirmed" means: the audit protocol

- **Who:** two reviewers who did not write the verdict rules, working from a shared checklist.
- **What they assess:** first, appearance and feel in the store, against the item's own selection cues; second, eating quality. They buy a sample and score flavor and texture on a 1–5 scale with written anchors.
- **Blind controls:** each audit mixes Peak items with Good and Skip items, and the taster doesn't know which verdict each item had.
- **Sampling:** each month, in each of the 3 audit cities (section 12), 2 store formats (warehouse club and supermarket), with 8 Peak items and 4 controls chosen at random from that day's verdicts.
- **Pass:** a Peak item passes when it clears the appearance checklist and scores ≥ 4 of 5 on eating quality. The headline result is the Peak pass rate compared with the controls' pass rate. Peak calls only add value if they clearly beat the controls.
- **Target:** set after the first 2 cycles, once the baseline gap is known.

## 3. Users, contexts and jobs

The primary user is a supermarket shopper standing in the produce section; everything else is secondary. The site serves one person in four different moments, so moments drive the design rather than personas.

| Moment | Device | Time and attention | Conditions | What they need first |
| --- | --- | --- | --- | --- |
| **In the store** (primary) | Phone, one hand, on the cart | 5–20 min, glancing between tasks | Bright light, weak signal, gloves or full hands | Today's picks; a quick lookup; how to pick a ripe one |
| **Planning at home** | Desktop or tablet | 10–30 min, focused | Seated, good connection | What's coming, what to wait for, variety comparisons |
| **In the kitchen** | Tablet or phone on the counter | 1–2 min, messy hands | Glance from a distance | How to store and ripen what they just bought |
| **Curious reading** | Any | Open-ended | Browsing | Why things are in season; variety stories |

**Jobs, in priority order**

1. *What's best right now?* The ranked Today list.
2. *Is this specific thing good now?* Search or tap gives a verdict and its reason.
3. *Which one in the pile do I take?* Look, feel and smell cues, what to avoid, and whether the origin or variety on the label changes the advice.
4. *Which variety suits my use?* Filter by use, flavor and texture.
5. *Should I wait?* "Usually improves in early December" and "Last call" markers.
6. *How do I keep it?* Counter or fridge, days it lasts, what not to store it next to.
7. *Is this a good price?* A value note from national promotions (v1.1), shown beside the verdict and never changing it.

The original brief named Costco, Trader Joe's and Whole Foods. For a US-wide audience, v1 stays store-agnostic and adds tips by store format (warehouse club, limited-assortment grocer, full-service supermarket). Notes per named chain come in v1.1.

## 4. Information architecture and navigation

There are three destinations: Today, Browse and Calendar. Search is a global control on every screen, not a destination of its own. Everything follows one date setting.

Today, Calendar and search all lead to the same item page. Browse reaches it through a category, and variety pages sit one level below.

**Navigation rules**

- Today is home. Opening the site lands there unless a shared link points somewhere else.
- **Search** is always in reach: a field pinned above the tab bar on phone, and in the top bar on tablet and desktop. Results open item or variety pages.
- The date chip is on every screen. **Changing the date keeps the current page, the selected item, filters and scroll position**; only the verdicts update.
- Browse goes Category → Item → Variety, three levels at most. Items without a variety guide stop at the item.
- Every item and variety can be reached in at most 3 taps from Today, or with one search.
- Phone: a bottom tab bar (Today, Browse, Calendar) with the pinned search field. Tablet and desktop: a top bar with the same three plus search.
- **Shared links follow today by default:** a shared item link shows the recipient's current verdict. "Share for this date" pins the date; the recipient then sees a "Showing Dec 20 · Switch to today" banner.
- Back returns to the exact scroll position the user left.

**Browse categories (v1)**

| Group | Categories |
| --- | --- |
| Fruit | Apples & pears; Citrus; Stone fruit; Berries; Grapes; Melons; Tropical & subtropical (incl. avocados) |
| Vegetables | Leafy greens & lettuces; Brassicas; Roots & tubers; Alliums; Squash; Tomatoes, peppers & eggplant; Beans, peas & corn |
| Other | Mushrooms; Herbs |

A category appears only when it holds at least one covered item.

**Variety depth follows shopping decisions, not a quota.**

- **Full variety guides at launch:** apples, mandarins & oranges, and pears. These are the items where the variety on the label most changes flavor, use or ripening advice. Pears are included because ripening advice differs by variety.
- **Short type notes** go on any item page where the type changes how to pick or ripen it. Examples: Hass vs green-skin avocados, starchy vs waxy potatoes, and on-the-vine vs Roma vs cherry vs heirloom tomatoes.
- **Further guides** are chosen by the names shoppers actually meet, measured by search queries and the variety names on retailer labels and in USDA data. Some items earn a deep guide; others need only a few sharp comparisons.

**Item page order (phone):** verdict and why → how to pick (with type notes) → store and ripen → "What does the label say?" (optional) → typical seasonal outlook → varieties → value note (v1.1) → prep → feedback. The in-store needs come first.

## 5. Core screens and behavior

Today leads with up to six strong recommendations, and every seasonal item appears on it exactly once. Always-good items (below) stay off Today; they appear in search, Browse, Calendar and their own pages. Interaction rules are the same on every screen: cards expand in place, and list rows open pages.

### Verdict states and markers

| Kind | Values | Meaning |
| --- | --- | --- |
| **Verdict** (exactly one per item) | Peak · Good · Skip · Limited evidence | Expected eating quality of typical supermarket supply here and now (rules in section 7) |
| **Markers** (zero or more, shown on the card) | Last call · Reliable year-round · Advisory · Good value (v1.1) | Extra facts that never move the item to a different section |
| **Always good** (an item class) | An editorial call, written in the item file. The usual evidence is a typical outlook of Good in all 24 windows, never Peak and never Skip; the data build flags any item where the two disagree, and an editor decides | Shown as "Always good" wherever they appear. They join Today only while an advisory changes their verdict |

### Today (home)

1. **Date chip:** "Mon Nov 16". Tap to plan for another date.
2. **One-line summary** of what's typically happening this time of year, plus any active advisory. It is edited by hand for each of the 24 half-month windows, nationally.
3. **Search field**, visible without scrolling.
4. **Best right now:** up to 6 Peak items, highest confidence first, then the most commonly bought. If fewer than 6 items are Peak, it shows fewer; it is never padded with Good items.
5. **Good buys:** every other Peak and Good item except always-good items, with filter chips (All · Fruit · Vegetables · Herbs & mushrooms).
6. **Skip for now** (collapsed): each item says when it usually improves ("Usually improves in early December").
7. **Limited evidence** (collapsed): items the site can't call today, each with the reason ("Supply this month is mostly from origins we haven't assessed").

An item that is both Peak and Last call appears once, under Best right now, carrying a Last call marker.

### Card behavior (the same everywhere)

- **Tapping a card expands it in place.** The expanded card shows how to pick, the typical storage range, and a clear **Details →** button that opens the item page.
- **Tapping a list row** (search results, Browse lists) opens the page directly, because a row is a lookup. Rows still show the verdict badge, so the answer is often visible without a tap.

### Item page

- **Verdict block:** the badge, 1–3 reasons, the confidence level, and one line on what it rests on ("Reviewed seasonal assessment + typical national supply"). Two dates appear, worded so they can't be mistaken for an in-store check: "Supply data through Nov 13" and "Guidance reviewed Oct 2026".
- **Context notes**, separate and only shown when relevant:
  - "Typical supermarket supply: favorable this month"
  - "Depends on the label: origin matters for this item"
- **What does the label say?** (optional): pick the origin or variety shown on the label or sticker, and the verdict and tips update for it. Today's verdict never needs this input.
- **How to pick:** 3–5 cues (look, feel, smell, weight), 1–2 "avoid" cues, and a type note where the type changes the advice.
- **Store and ripen:** typical ranges, never guarantees, each with its ripeness assumption. For example: "Firm Hass: 3–5 days on the counter to ripen. Ripe: 2–3 days in the fridge."
- **Typical seasonal outlook:** 24 half-month cells, with today marked. A band underneath shows the typical main supply origins by month.
- **Advisory** (when active): states exactly what it covers and when it ends, e.g. "Affects: avocados from Mexico · through Dec 5." Supply from other origins is unaffected.
- **Varieties** (where a guide exists): a variety is marked "best right now" only when there is variety-specific seasonal evidence for it. Otherwise varieties are listed without a seasonal ranking.
- **Value note** (v1.1): e.g. "Advertised more than usual in Southwest stores this week." It never changes the verdict.
- **Prep and use:** 2–4 lines.
- **Feedback:** "At your store today:" Looked good · Looked poor · Not in stock · Too pricey, all one tap and optional. A "Bought it" toggle triggers a taste question on the next visit.

### Variety guide (launch: apples, mandarins & oranges, pears)

- **What matters:** a short lead on what actually differs between varieties of this item.
- **Traits fit the produce group.** Each trait uses a 1–5 scale with written anchors and reference varieties. For example, apple tartness: 1 = barely tart (Fuji), 3 = balanced (Honeycrisp), 5 = very tart (Granny Smith). Chile heat is shown as a range, never a single number.

| Group | Traits compared |
| --- | --- |
| Apples & pears | Sweetness, tartness, crispness when raw, holds shape when baked, juiciness; for pears, how to tell when ripe |
| Citrus | Sweetness, acidity, ease of peeling, seeds, juiciness |
| Stone fruit | Sweetness, firm vs melting flesh, freestone vs clingstone |
| Tomatoes | Sweetness, acidity, juiciness, best raw or cooked |
| Potatoes | Starchy ↔ waxy, holds shape when boiled |
| Chiles & peppers | Heat range, sweetness, wall thickness |
| Winter squash | Sweetness, dry ↔ moist flesh, ease of peeling |

- **Finder:** filter by use and by the group's traits. Results update instantly.
- **Phone:** variety cards. **Tablet and desktop:** a sortable comparison table.
- **Variety page:** traits, best uses, freshest months (only where evidence exists), what the label or price-lookup (PLU) sticker typically says, and "can't find it? try…". The label is the authority on identity. Pictures are decorative, and pages don't claim shoppers can tell similar varieties apart by sight.

### Calendar

- Titled **Typical seasonal outlook**. It shows what is normally favorable at each time of year, not a forecast.
- Current advisories are never projected forward, so a weather problem today doesn't change December's outlook.
- **Tablet and desktop:** a heatmap, items × 24 half-months. **Phone:** one month at a time.

### Search

- A global control, pinned in thumb reach. Suggestions start at the first letter.
- Results show the verdict badge, so a lookup often needs no tap.
- Matches item names, variety names ("Honeycrisp" → the apple variety), synonyms (scallion = green onion, cilantro = coriander leaf) and common misspellings. Spanish names come in v2.
- No match: "We don't cover this yet", the closest items, and a "Request it" button.

### Date

- **Date:** today by default. "Plan for another date" shows that date's **typical seasonal outlook**, under a banner that says so ("Typical outlook for Dec 20 · Back to today"). It is never presented as a current assessment.
- **No onboarding screens.**

### Methods page

Defines each verdict, marker and confidence level. Explains the two kinds of evidence (typical supply data from a yearly USDA snapshot vs reviewed seasonal assessment). Lists every source with its update schedule, and publishes audit results. Every reason chip links here.

## 6. Views by device

v1 uses one information hierarchy on every device. Layouts adapt to the screen width, but there are no device-specific experiences until each one proves it is useful.

|  | Phone (< 600 px wide) | Tablet (600–1,024 px) | Desktop (> 1,024 px) |
| --- | --- | --- | --- |
| Navigation | Bottom tabs; search pinned above them | Top bar with search | Top bar with search |
| Today | One column of cards | The same sections; cards 2–3 across | Same as tablet, with a wider content column |
| Item page | One column | One column, wider | One column, wider |
| Variety guide | Cards + filter chips | Sortable comparison table | Sortable comparison table |
| Calendar | One month at a time | Half-year heatmap | Full-year heatmap |

**Candidates for later, each added only if testing or usage shows demand:** a two-pane tablet layout, a desktop planning workspace, a large-type kitchen view for storage and ripening, and a printable one-page sheet for a month.

### In-store mode (phone)

A single toggle on Today, remembered on the device. Turning it on:

- **Keeps the screen awake** while the page is open, so it stays readable on the cart. The Screen Wake Lock API has worked in Chrome, Safari and Firefox since May 2024 ([source](https://web.dev/blog/screen-wake-lock-supported-in-all-browsers)). The lock is released when the user leaves the tab.
- **Prepares the offline copy and shows its status** under the toggle, so the shopper knows when it is safe to lose signal:
  - "Preparing for offline… 40 of 89 items"
  - "Ready offline · 89 items · supply data through Oct 2026"
  - "Offline copy is from Nov 13; reconnect to refresh" (when it goes stale)
- **Enlarges type** to at least 18 px for body text and raises contrast, for reading at arm's length under bright store lighting.
- **Removes anything that interrupts:** no pop-ups, prompts or animation, and no layout that shifts after load.

Without the toggle, the phone view behaves the same except that the screen sleeps normally. Every covered item is still available offline (section 10).

## 7. Verdict logic

The verdict answers one question: is this item, as supermarkets here typically stock it right now, likely to eat well? Availability and value are shown beside the verdict, but they never decide it.

The rules run in a fixed order and the first match wins, so no two rules can produce conflicting verdicts. Promotions and prices are never inputs to the verdict.

### Three separate questions

| Dimension | Question it answers | Where it shows | Changes the verdict? |
| --- | --- | --- | --- |
| **Eating quality** | Is this likely to taste particularly good now? | The verdict itself | It is the verdict |
| **Availability** | Is this likely to be widely stocked? | "Typical supermarket supply" note; "Not in stock" feedback | Only by capping Peak at Good when supply is thin (rule 4) |
| **Value** | Is this a relatively good time to buy it? | "Good value" or "Pricier than usual" marker (v1.1) | Never |

So an expensive item can still be Peak, and a heavily advertised item can't become Peak just because stores are promoting it.

### Three kinds of claim

| View | What it promises |
| --- | --- |
| Today, and any item page for today | The best assessment from currently available evidence |
| Calendar, and any future date | What is normally favorable around that time: a *typical seasonal outlook*, labeled as such |
| Advisory | A specific, temporary exception, naming the items and origins it affects and when it expires |

An advisory changes only the windows it covers and never rewrites the typical outlook.

### Defined terms

| Term | Definition |
| --- | --- |
| **Quality window** | For each item × major origin, every half-month window rated *prime* (typically eats best), *fair* (acceptable), or *poor* (typically disappointing, e.g. out of long storage). Comes from a reviewed seasonal assessment that cites at least 2 sources (extension services, commodity boards, trade references). |
| **Typical supermarket origins** | The origins that together account for ≥ 70% of an item's reported shipments and imports in that month, averaged over 3 years. Used only to *rank* origins, never as precise shares. USDA notes that truck shipments for all commodities and origins are not available, and that the reported figures should not be read as complete movements ([source](https://www.ams.usda.gov/node/21104)). |
| **Supply index** | A typical value per month: the month's average reported volume over 3 years ÷ the item's average monthly reported volume over the same 3 years, from the same report series, taken from a yearly snapshot. Strong ≥ 1.2; normal 0.8–1.2; thin < 0.8. |
| **Local harvest** | Off, early, peak or late in the user's harvest zone. Shown as context. It affects a verdict only through label-based advice (below). Deferred: not in v1. |
| **Advisory** | An editor-entered exception: items, origins, start date, expiry date, the verdict it imposes, and a note. |
| **Reliable year-round** | A marker, set when the item's typical outlook is Good or better in ≥ 20 of 24 windows. Such an item can still have Peak windows and Skip windows. |
| **Value marker** (v1.1) | "Good value" when the promotion index is ≥ 1.2 or the advertised price is ≤ 0.95× its yearly average; "Pricier than usual" when the price is ≥ 1.15×. Display only. |

### Verdict rules, in order (first match wins)

1. **Limited evidence:** the reviewed quality assessment doesn't cover the origins that typically supply supermarkets in this window. Missing information never defaults to Good or Skip.
2. **Advisory:** an active advisory covers the typical origins → the verdict the advisory sets (usually Skip, or Peak capped at Good). This overrides everything below.
3. **Skip:** the typical origins are rated *poor* this window.
4. **Peak:** the typical origins are rated *prime* this window, and the supply index isn't thin.
5. **Good:** everything else, meaning the origins are *prime* but supply is thin, or they are rated *fair*.

When the top two origins differ by more than one rating level, the verdict follows the larger origin and the item gets a "Depends on the label" note.

**This rule set is complete for the MVP.** It needs no price or promotion data, and imported or national supply can reach Peak as easily as local harvest (Chilean cherries in late December, for example).

### Label-based advice

"What does the label say?" re-runs rules 1–5 for the origin or variety the shopper picks. Local harvest affects verdicts only this way. If the label shows a local origin during the local peak, that origin's own quality window applies. A shopper who never touches the control still gets the default verdict.

### Confidence

Confidence describes how complete and current the evidence is. It is not a probability that the item is good, and the Methods page says so.

| Property | Question |
| --- | --- |
| Coverage | Does the reviewed assessment cover the origins that typically supply supermarkets now? |
| Relevance | Does the evidence describe supermarket supply, rather than only local farms? |
| Freshness | Is the evidence current (yearly supply snapshot under 15 months old; advisories reviewed this window)? |
| Agreement | Do the quality assessment and the typical supply pattern point the same way? |

**High:** all four hold. **Medium:** exactly one is weak, e.g. stale supply data or mixed origins. **Low:** two or more are weak. A verdict built on strong national evidence isn't marked down just because no local data exists.

### Time

- Today's date maps to one of 24 half-month windows (1st–15th and 16th–end). Nov 16 falls in "late November."
- **Wording about change is approximate, never a countdown.** "Last call · usually fades by mid-December" appears when the outlook drops within the next 2 windows. "Usually improves in early December" appears on Skip items. Half-month calendars support approximate windows, not day-level precision.
- The value marker uses the latest weekly USDA retail report. That report is issued weekly, generally on Friday ([source](https://mymarketnews.ams.usda.gov/node/10018)). The marker is hidden once the report is more than 14 days old, and for future dates.

### Edge cases

- **Alaska and Hawaii:** separate supply chains. The guidance is written for the contiguous US, and the Methods page says so.
- **Unusual weather:** handled only through scoped, expiring advisories, never by editing the typical outlook.

## 8. Content and data model

An item launches only once its evidence passes review. Editors write content once per item and variety, and everything that varies by time is computed. So the work scales with the number of items, and the first release stays small on purpose.

| Entity | Key attributes | Written or computed | At launch | Target |
| --- | --- | --- | --- | --- |
| Item | Names and synonyms, how to pick, store and ripen (ranges + ripeness assumptions), prep, illustration | Written | 89 | New items as they become common |
| Evidence record | Evidence basis, sources (≥ 2), status (draft or reviewed), reviewer, review date | Drafted, then reviewed | 1 per item | 1 per item |
| Quality window | Item × major origin × 24 windows: prime / fair / poor, with citations | Written + reviewed | \~220 origin profiles (\~3 per seasonal item; always-good items need one year-round rating per origin) | Grows with items |
| Variety | Group-specific traits on anchored 1–5 scales, best uses, label/PLU text, freshest months where evidence exists | Written | \~40 (3 guides) | Driven by what shoppers meet |
| Type note | Short distinction where type changes the advice | Written | \~10 items | As needed |
| Category | Name, group, icon | Written | Only those with covered items | 16 |
| Advisory | Items, origins, start, expiry, imposed verdict, note | Written | As needed | As needed |
| Verdict | Item × window (national), with the advisories active on the date applied: verdict, markers, confidence, reason codes | Computed | \~2,140 (89 × 24) | Grows with items |
| Supply profile | Item × month: typical origins (ranked), supply index | Derived from USDA on demand, then reviewed | \~1,070 (89 × 12) | Grows with items |
| Value signal (v1.1) | Item × week, national | Computed | \~4,600 a year | Grows with items |
| Window summary | The one-line Today summary, national | Drafted, then edited | 24 | 24 |
| Feedback | Item, window, outcome (looked good / looked poor / not in stock / too pricey), optional taste answer | Collected | — | — |

**Evidence screen before an item is admitted.** There are two acceptable evidence bases, and the item page states which one applies:

- **Supply data + reviewed assessment:** USDA data ranks the item's typical origins with a consistent series, and quality windows cover those origins.
- **Reviewed seasonal assessment only:** for items where the USDA data is too thin or patchy to use. These verdicts carry at most Medium confidence.

An item that meets neither bar waits. It doesn't launch with a precise-looking but weak verdict.

**Drafting and review.** Claude researches and drafts items, quality windows, varieties and summaries. Every rating cites at least 2 real, checked sources, and every record starts as `draft`. Jared reviews and approves; only approved records are `reviewed`. Production builds refuse drafts, and previews label draft content visibly.

**Launch scope: all common supermarket produce, 89 items.** Close relatives are one item with types (summer squash, winter squash, hot peppers), and fresh herbs are a single always-good item with the common herbs as types. The list is curated: which items appear, their types, categories and classes are editorial decisions, and every new item also needs an illustration. Data informs those decisions without making them. The usual test is that most of USDA's 11 city terminal markets quote the item and mainstream US supermarkets stock it, year-round or in season. Specialty items sold mainly through ethnic or specialty grocers come later. The list and its evidence are in `docs/data/usda.md`. Always-good items need lighter content: one year-round rating per major origin, plus pick and store advice.

**Writing standards**

- Concrete, physical cues: "heavy for its size; gives slightly at the stem end," not "choose a good one."
- Storage and ripening as typical ranges with their assumptions, never as guarantees.
- Card text at most 12 words; item-page sections at most 60 words each.
- Plain US units (°F, lb, days); Spanish-ready strings from day one.
- Dates say exactly what happened: "Guidance reviewed Oct 2026" for editorial review, and "Supply data through Oct 2026" for data. Neither is ever worded to suggest someone has just checked the produce.

**Rights and sourcing**

- All copy and illustrations are original or licensed. Illustrations are decorative: one per item (89 at launch), not one per variety.
- Other guides' charts and data are not copied. Foodwise, for one, asks to be contacted before its charts are reproduced ([source](https://foodwise.org/wp-content/uploads/2025/07/Foodwise-Fruit-Seasonality-Chart.pdf)). Quality windows and harvest calendars are built from primary public sources and cited row by row.
- USDA Market News data is public and has a free API with a key ([source](https://mymarketnews.ams.usda.gov/node/8569)).

## 9. Design direction

Calm, editorial and produce-forward: a quiet canvas where the food supplies the color, and verdicts read clearly from arm's length.

Visual details are governed by the design system (`docs/design/design-system.md`). Where this section and the design system differ, the design system wins.

**Principles**

1. **Glanceable in the aisle, rich at the desk.** Each screen leads with its verdict and keeps the depth one tap down.
2. **The produce is the color.** The interface stays neutral so the items stand out.
3. **Never color alone.** Every verdict is shape + word + color.
4. **One idea per card.** One name, one verdict, one reason, plus at most two small markers.
5. **Honest, specific copy.** "Skip for now · usually better in July," never "Bad". "Typically keeps 2–3 days," never "keeps 3 days". No hype words like "superfood."

**Visual system**

| Element | Direction |
| --- | --- |
| Canvas | Warm off-white in light mode, deep warm gray in dark mode, following the device setting. In-store mode forces high-contrast light. |
| Type | A humanist sans for interface and body text; an editorial serif for page titles and variety names. Body at least 16 px (18 px in in-store mode). Fixed-width digits for days and prices. |
| Color | Neutral interface; the produce illustrations supply the color. Verdicts have their own reserved palette. |
| Verdict marks | Peak: filled star + "Peak" · Good: check + "Good" · Skip: clock + "Skip for now" · Limited evidence: information symbol + "Limited evidence", in a neutral tone so it never reads as a warning about the produce. The palette is checked under color-blindness simulation; red vs green is never the only difference. |
| Markers | Small text tags under the verdict: "Last call", "Reliable year-round", "Good value" (v1.1), and an outlined "Advisory" tag that opens its scope and expiry. |
| Imagery | One consistent illustration style, one drawing per item (89 at launch). Illustrations are decorative, not identification aids. For varieties, the label or PLU sticker is authoritative. |
| Layout | 8 px spacing grid; generous card padding; at most 2 levels of nesting on phone. |
| Motion | 150–250 ms, only for expand and collapse. Honors the device's reduced-motion setting. None in in-store mode. |
| Charts | The typical-outlook strip and heatmap use the verdict palette with a single ink-colored "today" marker, and each has a text equivalent. |

**Accessibility**

- **Target: WCAG 2.2 AA.** Its minimum for tap targets is 24×24 CSS px ([source](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)). We set 44×44 px for everything tappable, because cart use is one-handed and on the move.
- Body text contrast at least 4.5:1; the layout holds at 200% zoom.
- Screen readers announce each card as one phrase, markers included: "Persimmons, Peak, last call, typical supply favorable."

## 10. Non-functional requirements

The site has to feel instant on a phone with one bar of signal, be private by default, and never overstate what it knows. All three are product requirements, not polish.

| Area | Requirement |
| --- | --- |
| Speed | Pass Google's "good" Core Web Vitals on mobile at the 75th percentile: largest content painted ≤ 2.5 s, response to input ≤ 200 ms, layout shift ≤ 0.1 ([source](https://web.dev/articles/vitals)). Today must show its first verdicts within that 2.5 s on a mid-range phone over 4G. |
| Offline | After the first visit, every covered item works with no signal. In-store mode shows the offline copy's readiness status (section 6). |
| Freshness | Supply data is reference data, refreshed from the last 3 years of USDA reports on demand (about once a year) and reviewed like content; unusual seasons are handled by advisories. The value signal is weekly (v1.1). Quality windows, harvest calendars and written content reviewed at least once a year. Advisories always carry an expiry. |
| Honesty | Every verdict states its evidence basis and confidence. "Data through" and "reviewed" dates are kept distinct and never imply someone checked the produce. Future dates are always labeled as the typical outlook. Missing evidence shows as Limited evidence, never as a default verdict. |
| Privacy | No account needed. The app never asks for, infers or stores the shopper's location. Analytics are aggregate, with no ad trackers and no selling of data. |
| Accessibility | WCAG 2.2 AA throughout (details in section 9). |
| Trust | Every verdict traces to its inputs on the Methods page. Audit results are published. Any advisory or editorial override carries a visible note. |
| Reach | The last 2 versions of Safari on iOS, Chrome on Android, and desktop Chrome, Safari, Firefox and Edge. Can be added to the home screen. In-store mode must be tested in home-screen mode on iOS, not just in Safari. |
| Sharing | Every view has a stable link. Links follow today unless they were explicitly shared for a fixed date. |

## 11. Competitive landscape

The closest existing product already does "what's in season near me." The opening is in answering for the supermarket instead of the farm stand, and in going deep on varieties.

| Product | Coverage | Built for | Gap for a supermarket shopper |
| --- | --- | --- | --- |
| [Seasonal Food Guide](https://foodprint.org/?p=2116) (GRACE / FoodPrint) | Every state, half-month windows; 140+ items per its [App Store listing](https://apps.apple.com/us/app/-/id1235820625), 170+ per its website; finds you by ZIP or location | Eating locally: "a farmers' market cheat sheet" | Local harvest only: no import or supply view, no price signal. Shopping tips sit on a separate encyclopedia site |
| [Foodwise seasonality charts](https://foodwise.org/wp-content/uploads/2025/07/Foodwise-Fruit-Seasonality-Chart.pdf) | Bay Area farmers markets, by month | Farmers-market shoppers | A static PDF; it says it may not apply outside Northern California |
| Grocery chain apps and weekly ads | One chain's promotions | Driving sales | Shows what's on sale, not what's good; no seasonality or quality guidance |
| Food sites' "what's in season" articles | National, by season or month | Reading | Not location- or date-aware; goes stale |

**Where we win**

1. **Supermarket-first verdicts on eating quality:** based on where supermarket supply actually comes from, with advice that adapts to the origin on the label.
2. **Variety depth where it changes the decision:** 3 full guides at launch, plus type notes wherever the type changes how to pick or ripen.
3. **In-store mode:** screen stays awake, shows when it's ready offline, readable at arm's length.
4. **Honest evidence:** reasons, evidence basis and data dates on every verdict, published audits, and "Limited evidence" instead of a guess.

## 12. Release plan

The first release covers all common supermarket produce (89 items), with 3 variety guides and nationwide guidance, audited monthly in 3 cities. Coverage grows only by passing explicit gates.

Order: foundations → Gate 1 → first release → Gate 2 → v1.1 → Gate 3 → v2 (broader coverage).

**Scope**

| Essential for the first release | Later releases |
| --- | --- |
| Today, search and item guidance | Desktop planning workspace |
| Clear verdict explanations: reasons, evidence basis, confidence | Printable monthly sheets |
| Selection, storage and ripening advice | Large-type kitchen view |
| "What does the label say?" origin and variety advice | Value markers from promotions (v1.1) |
| Honest seasonal context; typical-outlook calendar | Deep guides beyond the first 3 |
| A verified offline shopping experience | Full illustration coverage |
| 3 excellent variety guides (apples, mandarins & oranges, pears) | Named-chain notes |
|  | Location-aware context (regional advisories, local harvest), only if usage shows a need |

**Nationwide guidance, audited in 3 cities.** The site works across the contiguous US from day one, with one national set of verdicts. The monthly audits (section 2) run in the San Francisco Bay Area, Chicago and Atlanta, three distinct climates and supply positions, to check that national calls hold in real stores.

**Gate criteria**

| Gate | Passes when |
| --- | --- |
| **Gate 1** · Foundations → first release | **Source coverage:** every launch item has reviewed quality windows covering the origins behind most of its supermarket supply, each citing ≥ 2 sources. **Rule check:** a back-test on 2 years of data agrees with an independent reviewer's seasonal calls in ≥ 85% of item-windows. |
| **Gate 2** · first release → v1.1 | **Phone shopping tasks:** in in-store tests with ≥ 12 participants, ≥ 80% identify a good purchase within 5 s and ≥ 90% find selection advice within 2 taps. **Reliability:** offline readiness verified on iOS and Android devices; LCP ≤ 2.5 s. **Accuracy:** the first 2 audit cycles are complete and Peak items clearly beat the controls. |
| **Gate 3** · v1.1 → broader coverage (v2) | **Independently reviewed accuracy:** the audit pass rate meets the target set after cycle 2 for 3 consecutive months. Value markers match advertised prices for 4 weeks. Every new item clears the Gate 1 evidence bar before it is added. |

Verdicts never use promotion or price data in any release. v1.1 adds value markers beside them.

## 13. Risks and open decisions

The biggest risk is a confident verdict that doesn't match the bin in front of the shopper. Most mitigations keep verdicts honest about what they know and narrow about what they claim.

| Risk | Effect | Mitigation |
| --- | --- | --- |
| Seasonal quality ratings are partly judgment | Peak calls that don't eat well | ≥ 2 sources per rating, independent review, evidence basis shown, monthly blind audits against controls |
| USDA shipment data is incomplete ([source](https://www.ams.usda.gov/node/21104)) | Misread origin mix | Data used only to rank typical origins and to compute a within-series supply index, never shown as precise shares; items with patchy data use the assessment-only basis |
| The bin's origin differs from the typical origin | Advice wrong for this bin | "Depends on the label" note and the optional "What does the label say?" control |
| Promotion data is ads, not shelf prices | Shoppers read it as their store's price | Value marker only, labeled "national ad activity"; never part of the verdict |
| Weather shifts a season | Verdicts run early or late | Scoped advisories that expire; the typical outlook is never edited for one year's weather |
| Verdicts read as guarantees | Lost trust after one bad purchase | "Likely" wording, storage as ranges, Methods page, confidence explained |
| Content volume | Slow launch or uneven quality | 89 items, but always-good items need only a year-round rating and short copy; seasonal items are drafted first, in batches of about 10; 3 guides; new items beyond common produce only through gates |

**Decisions needed**

| Decision | Recommendation |
| --- | --- |
| Product name and brand | Project name: Orchard. In-app brand: open |
| Audit cities | San Francisco Bay Area, Chicago and Atlanta: three distinct climates and supply positions |
| Who audits | Two reviewers independent of the rules' author; recruit before Gate 1 |
| Named store chains at launch? | No. Store-format tips first; named chains later |
| Value markers at launch? | No. v1.1, after a month of clean weekly data, and never part of the verdict |
| Business model | None in v1. If one is ever added, nothing paid can influence a verdict |
| Spanish at launch? | v2, with text Spanish-ready from day one |
| Accounts? | None in v1; settings stay on the device |

## Sources

- USDA AMS, [National Retail Report – Specialty Crops report page](https://mymarketnews.ams.usda.gov/node/10018)
- USDA AMS, [Specialty Crops on My Market News](https://mymarketnews.ams.usda.gov/node/8569) (API access)
- USDA AMS, [Dive into the Specialty Crops Market News National Retail Report](https://www.ams.usda.gov/content/dive-specialty-crops-market-news-national-retail-report)
- USDA AMS, [Agricultural Refrigerated Truck Quarterly datasets](https://www.ams.usda.gov/node/21104) (note on shipment-data completeness)
- [Seasonal Food Guide, App Store listing](https://apps.apple.com/us/app/-/id1235820625)
- FoodPrint, [Seasonal Food Guide](https://foodprint.org/?p=2116)
- Foodwise, [Fruit & Nuts Seasonality Chart](https://foodwise.org/wp-content/uploads/2025/07/Foodwise-Fruit-Seasonality-Chart.pdf)
- web.dev, [The Screen Wake Lock API is now supported in all browsers](https://web.dev/blog/screen-wake-lock-supported-in-all-browsers)
- web.dev, [Web Vitals](https://web.dev/articles/vitals)
- W3C, [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)

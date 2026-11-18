# Orchard — Product Specification

Owner: Jared Peterson

Visual details are governed by `docs/design/design-system.md`; how it's built, by `docs/engineering-plan.md`.

## 1. Summary

The site opens straight to a **Today** view: the produce worth buying now at US supermarkets, judged on expected eating quality and marked Peak, Good or Skip, with one tap down to any item or variety. It is built first for a phone propped on a shopping cart, and second for planning on a tablet or desktop.

Three ideas set it apart:

- **Supermarket-first.** Verdicts judge how well what US supermarkets typically stock right now is likely to eat, based on where that supply comes from. Farmers-market seasonality alone misleads supermarket shoppers, because chains import much of their produce year-round.
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
4. Go deep where variety changes the decision: verdicts per variety for the 6 items whose varieties peak at different times, 3 full variety guides, and short type notes wherever the type changes the advice.
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
- Browse goes Category → Item → Variety, three levels at most. Variety pages exist for the varieties in a guide; other items stop at the item page.
- There are no onboarding screens.
- Every item and variety can be reached in at most 3 taps from Today, or with one search.
- Phone: a bottom tab bar (Today, Browse, Calendar) with the pinned search field. Tablet and desktop: a top bar with the same three plus search.
- **Shared links follow today by default:** a shared item link shows the recipient's current verdict. "Share for this date" pins the date; the recipient then sees a "Showing Dec 20 · Switch to today" banner.
- Back returns to the exact scroll position the user left.

**Browse categories (v1)**

| Group | Categories |
| --- | --- |
| Fruit | Apples & pears; Citrus; Stone fruit; Berries; Grapes; Melons; Tropical & subtropical (incl. avocados) |
| Vegetables | Leafy greens & lettuces; Brassicas; Roots & tubers; Alliums; Squash; Tomatoes, peppers & eggplant; Beans, peas, corn & stalks |
| Other | Mushrooms; Herbs |

A category appears only when it holds at least one covered item.

**Variety depth follows shopping decisions, not a quota.**

- **Full variety guides at launch:** apples, mandarins & oranges, and pears. These are the items where the variety on the label most changes flavor, use or ripening advice. Pears are included because ripening advice differs by variety.
- **Short type notes** go on any item page where the type changes how to pick or ripen it. Examples: starchy vs waxy potatoes, and on-the-vine vs Roma vs cherry vs heirloom tomatoes.
- **Further guides** are chosen by the names shoppers actually meet, measured by search queries and the variety names on retailer labels and in USDA data. Some items earn a deep guide; others need only a few sharp comparisons.

**Item page order (phone):** verdict and why → varieties now (items rated by variety) → how to pick (with type notes) → store and ripen → "What does the label say?" (optional) → typical seasonal outlook → variety guide → value note (v1.1) → prep → feedback. The in-store needs come first.

## 5. Core screens and behavior

Today leads with up to six strong recommendations, and every seasonal item appears on it exactly once. Always-good items (below) stay off Today; they appear in search, Browse, Calendar and their own pages. Interaction rules are the same on every screen: cards expand in place, and list rows open pages.

### Verdict states and markers

| Kind | Values | Meaning |
| --- | --- | --- |
| **Verdict** (exactly one per item) | Peak · Good · Skip · Limited evidence | Expected eating quality of typical US supermarket supply right now (rules in section 7) |
| **Markers** (zero or more, shown on the card) | Last call · Reliable year-round · Advisory · Check the label · Good value (v1.1) | Extra facts that never move the item to a different section |
| **Always good** (an item class) | An editorial call, written in the item file. The usual evidence is a typical outlook of Good in all 24 windows, never Peak and never Skip; the data build flags any item where the two disagree, and an editor decides | Shown as "Always good" wherever they appear, in place of the Reliable year-round marker. They join Today only while an advisory changes their verdict |

**Items rated by variety.** Some items' varieties peak at different times: some apples are only worth buying near harvest, while Cosmic Crisp keeps well all year. These items are rated per variety as well as per origin:

- Each variety gets its own verdict for the window. The item's verdict is the best verdict among the rated varieties typically in stores then, so a shopper who picks the named variety gets what the badge says. If none of its rated varieties is typically in stores, the item is Limited evidence.
- **The card says which variety the verdict means**, in a smaller secondary line under the item name ("Mangoes" over "Ataulfo"), and shows that variety's illustration.
- When two varieties share the best verdict, the line names both and the card shows the first one's illustration. When more do (apples in October), the line gives the count ("6 varieties at their best"), the card shows the item's own illustration, and the item page lists them.
- **At launch:** apples, pears, mandarins, oranges and mangoes. Their varieties differ in season and are named on signs and labels. The rated varieties are those that make up most of each item's supermarket supply and eat well at their best, chosen with the content. A variety that isn't particularly good even at its peak (Red Delicious, Golden Delicious) is never rated or featured: the guide names produce that will be great. In each window the item takes the best rated variety in stores in enough volume. Where a variety's rating is marginal, it rates down. Avocados are rated as one item, since Hass is steady most of the year and makes up most supply. Later candidates, once evidence supports them: tomatoes (heirloom), onions (sweet onions), lemons (Meyer) and winter squash (delicata).

### Today (home)

1. **Date chip:** "Mon Nov 16". Tap to plan for another date.
2. **One-line summary** of what's typically happening this time of year, plus any active advisory. It is edited by hand for each of the 24 half-month windows, nationally.
3. **Search field**, visible without scrolling.
4. **Best right now:** up to 6 Peak items, the shortest Peak of the year first (a 4-week strawberry peak before a 4-month one, because it won't last), then highest confidence, then the most commonly bought. If fewer than 6 items are Peak, it shows fewer; it is never padded with Good items.
5. **Good buys:** every other Peak and Good item except always-good items, with filter chips (All · Fruit · Vegetables · Herbs & mushrooms).
6. **Skip for now** (collapsed): each item says when it usually improves ("Usually improves in early December").
7. **Limited evidence** (collapsed): items the site can't call today, each with the reason ("Supply this month is mostly from origins we haven't assessed").

An item that is both Peak and Last call appears once, under Best right now, carrying a Last call marker.

### Card behavior (the same everywhere)

- **Tapping a card expands it in place.** The expanded card shows how to pick, the typical storage range, and a clear **Details →** button that opens the item page.
- **Tapping a list row** (search results, Browse lists) opens the page directly, because a row is a lookup. Rows still show the verdict badge, so the answer is often visible without a tap.

### Item page

- **Verdict block:** the badge, 1–3 reasons, the confidence level, and one line on what it rests on ("Reviewed seasonal assessment + typical national supply"). Two dates appear, worded so they can't be mistaken for an in-store check: "Supply data through Oct 2026" and "Guidance reviewed Oct 2026".
- **Context notes**, separate and only shown when relevant:
  - "Typical supermarket supply: favorable this month"
  - "Depends on the label", naming the origin that is usually poor now ("Florida field tomatoes often disappoint now"), with the "What does the label say?" control just below
- **What does the label say?** (optional): pick the origin or variety shown on the label or sticker, and the verdict and tips update for it. Today's verdict never needs this input.
- **How to pick:** 3–5 cues (look, feel, smell, weight), 1–2 "avoid" cues, and a type note where the type changes the advice.
- **Store and ripen:** typical ranges, never guarantees, each with its ripeness assumption. For example: "Firm Hass: 3–5 days on the counter to ripen. Ripe: 2–3 days in the fridge."
- **Typical seasonal outlook:** 24 half-month cells, with today marked. A band underneath shows the typical main supply origins by month.
- **Advisory** (when active): states exactly what it covers and when it ends, e.g. "Affects: avocados from Mexico · through Dec 5." Supply from other origins is unaffected.
- **Varieties now** (items rated by variety): each variety's verdict for today and its quality across the year as a 24-window strip, best right now first, each with its confidence. A variety without variety-specific evidence is listed without a rating, never ranked.
- **Variety guide** (where one exists): a link to the item's guide.
- **Value note** (v1.1): e.g. "Advertised more than usual nationally this week." It never changes the verdict.
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
- **Variety page:** traits, best uses, its quality across the year (only where evidence exists), what the label or price-lookup (PLU) sticker typically says, and "can't find it? try…". The label is the authority on identity. Pictures are decorative, and pages don't claim shoppers can tell similar varieties apart by sight.

### Calendar

- Titled **Typical seasonal outlook**. It shows what is normally favorable at each time of year, not a forecast.
- Current advisories are never projected forward, so a weather problem today doesn't change December's outlook.
- **Tablet and desktop:** a heatmap, items × 24 half-months. **Phone:** one month at a time.

### Search

- A global control, pinned in thumb reach. Suggestions start at the first letter.
- Results show the verdict badge, so a lookup often needs no tap.
- Matches item names, variety names ("Honeycrisp" → its variety page; "Ataulfo" → the mango page, at that variety), synonyms (scallion = green onion, cilantro = coriander leaf) and common misspellings. Spanish names come in v2.
- No match: "We don't cover this yet", the closest items, and a "Request it" button.

### Date

Today by default. "Plan for another date" shows that date's **typical seasonal outlook**, under a banner that says so ("Typical outlook for Dec 20 · Back to today"). It is never presented as a current assessment.

### Methods page

Defines each verdict, marker and confidence level. Explains the two kinds of evidence (typical supply data from a yearly USDA snapshot vs reviewed seasonal assessment), and how source claims are weighted and combined. Says the guidance is written for the contiguous US. Lists every source with its update schedule, and the AI models on the panel, and publishes audit results. Every reason chip links here.

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

### In the store (phone)

There is no mode to switch on. The first visit shows Today at once; once the page has loaded, the offline copy of every covered item downloads in the background, with nothing for the shopper to do (section 10). A quiet line under Today's masthead says where it stands, so the shopper knows it's safe to lose signal:

- "Preparing for offline… 12 of 30 items"
- "Ready offline · 30 items · supply data through Oct 2026"
- "Offline copy is from Nov 13; reconnect to refresh" (when the phone is offline and the copy is more than 7 days old)

The phone view is the in-store view: no pop-ups, prompts or animation beyond expand and collapse, and no layout that shifts after load. The screen sleeps normally.

## 7. Verdict logic

The verdict answers one question: is this item, as US supermarkets typically stock it right now, likely to eat well? Availability and value are shown beside the verdict, but they never decide it.

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
| **Quality window** | For each item × major origin (and each variety, for items rated by variety), every half-month window rated *prime* (typically eats best), *fair* (acceptable), or *poor* (typically disappointing, e.g. out of long storage). Each rating is an editorial call that starts from the combined seasonal evidence (section 8) and rests on at least 2 sources, one of which may be the AI model panel (section 8). |
| **Typical supermarket origins** | The origins that together account for ≥ 70% of an item's reported shipments and imports in that month, averaged over 3 years. Used only to *rank* origins, never as precise shares. USDA notes that truck shipments for all commodities and origins are not available, and that the reported figures should not be read as complete movements ([source](https://www.ams.usda.gov/node/21104)). |
| **Supply index** | A typical value per origin and month: the origin's average reported volume that month over 3 years ÷ its average over the months it ships, from the same report series, taken from a yearly snapshot. It measures where an origin is in its own season (thin at the first and last picks), so an import's normal season is never thin just because US supply is low. The verdict uses the deciding origin's index. Strong ≥ 1.2; normal 0.8–1.2; thin < 0.8. |
| **Advisory** | An editor-entered exception: items, origins, start date, expiry date, its effect (Skip, or at most Good), and a note. |
| **Reliable year-round** | A marker, set when the item's typical outlook is Good or better in ≥ 20 of 24 windows. Such an item can still have Peak windows and Skip windows. |
| **Value marker** (v1.1) | "Good value" when the promotion index is ≥ 1.2 or the advertised price is ≤ 0.95× its yearly average; "Pricier than usual" when the price is ≥ 1.15×. Display only. |

### Verdict rules, in order (first match wins)

1. **Limited evidence:** the reviewed quality assessment doesn't cover the origins that typically supply supermarkets in this window. Missing information never defaults to Good or Skip.
2. **Advisory:** an active advisory covers the deciding origin (below) → Skip, or at most Good, as the advisory sets. A Skip advisory overrides everything below; a cap lets rules 3–5 run and lowers Peak to Good.
3. **Skip:** the deciding origin is rated *poor* this window.
4. **Peak:** the top typical origin is rated *prime* this window and no other typical origin is rated *poor* (what a shopper picks up should reliably eat well), that origin's supply index isn't thin, and the item is one whose Peak is worth seeking: buying it in its best season makes a difference a shopper can taste. Peak means "try to buy it now". An item that tastes much the same in and out of its best harvest weeks (lettuce, for one) is Good in those weeks, and may be Always good.
5. **Good:** everything else, meaning the top origin is *prime* but supply is thin, another typical origin is *poor*, or the item's Peak isn't worth seeking, or it is rated *fair*.

**The deciding origin** is the top typical origin, unless it is rated poor and the second typical origin is rated better on evidence that isn't Low confidence. Then the second origin decides, so the headline shows that a good buy is commonly on the shelf (winter tomatoes: Good, from Mexico, while Florida field tomatoes are poor), and the item is never Peak. A Low-confidence rating never lifts a Skip. Only the second typical origin can take over, and only when it supplies at least 25% of the month's reported volume, so a minor origin never sets the headline. The share is used internally, never shown.

**Check the label.** Whenever the typical origins this window include one rated poor and one rated better, the card shows a small "Check the label" marker, the item page's "Depends on the label" note names the poor origin, and confidence loses a level on agreement. On a card, Advisory and Check the label come before the other markers, since they help a shopper avoid a bad buy.

**Items rated by variety** run rules 1–5 once per rated variety typically in stores, with the variety's quality windows in place of the origins'. Supply and advisories are the item's (an advisory on the top typical origin applies to every variety). The item takes the best result.

**This rule set is complete for the MVP.** It needs no price or promotion data, and imported or national supply can reach Peak as easily as local harvest (Chilean cherries in late December, for example).

### Label-based advice

"What does the label say?" re-runs rules 1–5 for the origin or variety the shopper picks, using that origin's or variety's own quality windows. A shopper who never touches the control still gets the default verdict.

### Confidence

Confidence describes how complete and current the evidence is. It is not a probability that the item is good, and the Methods page says so.

| Property | Question |
| --- | --- |
| Coverage | Does the reviewed assessment cover the origins (or varieties) that typically supply supermarkets now, on seasonal evidence of at least Medium combined confidence? High combined confidence needs at least one source about eating quality; harvest charts alone reach Medium at most. |
| Relevance | Does the evidence describe supermarket supply, rather than only local farms? |
| Freshness | Is the evidence current (yearly supply snapshot under 15 months old; advisories reviewed this window)? |
| Agreement | Do the quality assessment and the typical supply pattern point the same way? |

**High:** all four hold. **Medium:** exactly one is weak, e.g. stale supply data or mixed origins. **Low:** two or more are weak.

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
| Item | Names and synonyms, how to pick, store and ripen (ranges + ripeness assumptions), prep, illustration | Written | 30 at first release, 89 in the full list | New items as they become common |
| Seasonal evidence | Per source claim: origin or variety, rated windows, specificity, directness, paraphrase; status, reviewer, review date | Gathered mostly by scripts, drafted, then reviewed | 1 file per item | 1 file per item |
| Quality window | Item × major origin (or rated variety) × 24 windows: prime / fair / poor, with citations | Written + reviewed | \~220 origin profiles (\~3 per seasonal item; always-good items need one year-round rating per origin), plus \~30 variety profiles | Grows with items |
| Variety | Group-specific traits on anchored 1–5 scales, best uses, label/PLU text, quality windows where evidence exists | Written | \~40 (the 3 guides, plus mango varieties) | Driven by what shoppers meet |
| Type note | Short distinction where type changes the advice | Written | \~10 items | As needed |
| Category | Name, group, icon | Written | 16 | 16 |
| Advisory | Items, origins, start, expiry, effect (Skip, or at most Good), note | Written | As needed | As needed |
| Verdict | Item × window (national), with the advisories active on the date applied: verdict, markers, confidence, reason codes | Computed | \~720 (30 × 24) at first release | Grows with items |
| Supply profile | Item × month: typical origins (ranked); item × origin × month: supply index | Derived from USDA on demand, then reviewed | \~360 (30 × 12) at first release | Grows with items |
| Value signal (v1.1) | Item × week, national | Computed | \~4,600 a year | Grows with items |
| Window summary | The one-line Today summary, national | Drafted, then edited | 24 | 24 |
| Feedback | Item, window, outcome (looked good / looked poor / not in stock / too pricey), optional taste answer | Collected | — | — |

**Evidence screen before an item is admitted.** There are two acceptable evidence bases, and the item page states which one applies:

- **Supply data + reviewed assessment:** USDA data ranks the item's typical origins with a consistent series, and quality windows cover those origins.
- **Reviewed seasonal assessment only:** for items where the USDA data is too thin or patchy to use. These verdicts carry at most Medium confidence.

An item that meets neither bar waits. It doesn't launch with a precise-looking but weak verdict.

**Seasonal evidence.** Each item's ratings start from what a wide range of sources say about when it eats best in US supermarkets:

- **Sources come in two tiers.** *Authoritative:* university extension services, commodity boards, USDA, UC Davis postharvest references and trade references. *Mainstream:* major food publications and grocer guides. Both count toward the 2-source minimum; authoritative sources carry more weight.
- **An AI model panel adds a judgment, not a citation.** Several AI models each rate every item from what they learned in training, using one shared prompt. Together they count as a single source with the weight of one mainstream source. The panel can be the second of a rating's 2 sources only where it gives the same rating as a cited source, and such a window is Medium confidence at most. It never rates a window on its own. Where it disagrees with the cited evidence, research goes there first. The Methods page names the models on the panel.
- **Each source gets its own quality curve:** for the origin it describes (and the variety, when it names one), how good the item typically is in each half-month window, from poor through fair to prime. A vague claim ("spring") gets soft edges; a precise one gets sharp edges. Where a source says nothing, it has no curve, never a poor one. The ratings follow taste and how reliably good the item at the store will be, with no preference for US-grown. A source that only says when an item is in season (a harvest chart) speaks for the whole year: in season reads prime, the couple of weeks either side fair, and the rest of the year poor, or fair for items (and varieties) that eat well for months out of storage, such as long-keeping apples; stored produce never reads prime from a harvest chart alone. For an import, a harvest chart reads one level lower, so an import in its own season reads fair (Good) when the item ships well, and poor when it doesn't, including produce picked underripe to survive the trip. For produce that stores well, an import's chart says nothing outside its own season, since stored US fruit is on sale then. An import that sources say tastes very good can still read prime. A variety sold from several countries is judged country by country in the same way: one country's chart never marks poor the weeks another country's sources cover (Chile's summer clementines don't make California's December clementines poor). Each source's view also carries a confidence label from its tier and from how direct the claim is (eating quality, or only availability). Claims are paraphrased, never copied.
- **Three cited calls per item shape how evidence is read.** Each is a yes or no with at least one source and an optional note, reviewed with the item:
  - *Ships well:* arrives from abroad eating well. Fruit that keeps ripening after harvest (pears, avocados, bananas, mangoes) ships well when picked mature; fruit that stops sweetening once picked (strawberries, cherries, grapes, pineapple) ships well only if it holds up when picked ripe, as citrus does. Produce picked underripe to survive the trip doesn't ship well.
  - *Stores well:* eats well for months out of commercial storage (long-keeping apples, potatoes, onions). A variety can differ from its item (Cosmic Crisp against Gala).
  - *Peak worth seeking:* buying in its best season makes a difference a shopper can taste. Without it the item is never Peak.
- **Claims that name no origin describe US-grown supply.** Common advice ("blueberries peak in summer") is usually about the US harvest, so imports are judged on their own evidence. Such a claim can't say when each state is out of season, so a national harvest chart never marks a state's other months poor (Florida's winter strawberries stay judged by Florida evidence).
- **The curves combine into a proposal:** their confidence-weighted average for each origin across the year, read as prime, fair or poor, with a combined confidence of High, Medium or Low per window that reflects how much evidence covers it and how far the sources disagree. Windows no source covers have no proposal. The proposal is the base case for the editorial call, not the call itself; the item review shows each source's curve beside it.
- **Low confidence gets an explicit review.** Every window whose combined confidence is Low, or whose editorial rating departs from the proposal, carries a written reason, and Jared reviews those windows one by one.

**Drafting and review.** Claude researches and drafts items, quality windows, varieties and summaries. Every rating cites at least one real, checked source plus a second source or an agreeing model panel, and every record starts as `draft`. Jared reviews and approves; only approved records are `reviewed`. Production builds refuse drafts, and previews label draft content visibly.

**Item list: all common supermarket produce, 89 items. First release: 30 of them** (apples, strawberries, grapes, blueberries, tomatoes, oranges, mandarins, watermelon, peaches, cantaloupe, pears, sweet corn, cherries, raspberries, blackberries, mangoes, nectarines, plums, asparagus, honeydew, winter squash, grapefruit, Brussels sprouts, pomegranates, artichokes, collard greens, apricots, okra, figs, persimmons): the produce US shoppers buy most whose eating quality changes through the year, so the verdict helps. Bananas and always-good items wait, as do avocados, whose quality turns on ripeness rather than season. The other items join after the first release, each clearing the Gate 1 evidence bar. Close relatives are one item with types (summer squash, winter squash, hot peppers), and fresh herbs are a single always-good item with the common herbs as types. The list is curated: which items appear, their types, categories and classes are editorial decisions, and every new item also needs an illustration. Data informs those decisions without making them. The usual test is that most of USDA's 11 city terminal markets quote the item and mainstream US supermarkets stock it, year-round or in season. Specialty items sold mainly through ethnic or specialty grocers come later. The list and its evidence are in `docs/data/usda.md`. Always-good items need lighter content: one year-round rating per major origin, plus pick and store advice.

**Writing standards**

- Concrete, physical cues: "heavy for its size; gives slightly at the stem end," not "choose a good one."
- Storage and ripening as typical ranges with their assumptions, never as guarantees.
- Card text at most 12 words; item-page sections at most 60 words each.
- Plain US units (°F, lb, days); Spanish-ready strings from day one.
- Dates say exactly what happened: "Guidance reviewed Oct 2026" for editorial review, and "Supply data through Oct 2026" for data. Neither is ever worded to suggest someone has just checked the produce.

**Rights and sourcing**

- All copy and illustrations are original or licensed. Illustrations are decorative: one per item, plus one per rated variety of the items rated by variety (about 30). Every item at launch has its own approved illustration; a rated variety without one uses its item's.
- Other guides' charts and data are not copied. Foodwise, for one, asks to be contacted before its charts are reproduced ([source](https://foodwise.org/wp-content/uploads/2025/07/Foodwise-Fruit-Seasonality-Chart.pdf)). Quality windows are built from public sources, paraphrased and cited claim by claim; no source's chart or wording is copied.
- USDA Market News data is public and has a free API with a key ([source](https://mymarketnews.ams.usda.gov/node/8569)).

## 9. Design direction

Calm, editorial and produce-forward: a quiet canvas where the food supplies the color, and verdicts read clearly from arm's length.

Visual details are governed by the design system (`docs/design/design-system.md`). Where this section and the design system differ, the design system wins.

**Principles**

1. **Glanceable in the aisle, rich at the desk.** Each screen leads with its verdict and keeps the depth one tap down.
2. **The produce is the color.** The interface stays neutral so the items stand out.
3. **Never color alone.** Every verdict is shape + word + color.
4. **One idea per card.** One name, one verdict, one reason, plus at most two small markers and, for items rated by variety, a quiet variety line.
5. **Honest, specific copy.** "Skip for now · usually better in July," never "Bad". "Typically keeps 2–3 days," never "keeps 3 days". No hype words like "superfood."

**Visual system**

| Element | Direction |
| --- | --- |
| Canvas | Warm off-white in light mode, deep warm gray in dark mode, following the device setting. |
| Type | A humanist sans for interface and body text; an editorial serif for page titles and variety names. Body at least 16 px. Fixed-width digits for days and prices. |
| Color | Neutral interface; the produce illustrations supply the color. Verdicts have their own reserved palette. |
| Verdict marks | Peak: filled star + "Peak" · Good: check + "Good" · Skip: clock + "Skip for now" · Limited evidence: information symbol + "Limited evidence", in a neutral tone so it never reads as a warning about the produce. The palette is checked under color-blindness simulation; red vs green is never the only difference. |
| Markers | Small text tags under the verdict: "Last call", "Reliable year-round", "Good value" (v1.1), and an outlined "Advisory" tag that opens its scope and expiry. |
| Imagery | One consistent illustration style: one drawing per item (all 30 at first release), plus one per rated variety (about 30; until its own is approved, a variety uses its item's). Illustrations are decorative, not identification aids. For varieties, the label or PLU sticker is authoritative. |
| Layout | 8 px spacing grid; generous card padding; at most 2 levels of nesting on phone. |
| Motion | 150–250 ms, only for expand and collapse. Honors the device's reduced-motion setting. |
| Charts | The typical-outlook strip and heatmap use the verdict palette with a single ink-colored "today" marker, and each has a text equivalent. |

**Accessibility**

- **Target: WCAG 2.2 AA.** Its minimum for tap targets is 24×24 CSS px ([source](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)). We set 44×44 px for everything tappable, because cart use is one-handed and on the move.
- Body text contrast at least 4.5:1; the layout holds at 200% zoom.
- Screen readers announce each card as one phrase, markers included: "Persimmons, Peak, last call, typical supply favorable," or "Mangoes, Ataulfo, Peak."

## 10. Non-functional requirements

The site has to feel instant on a phone with one bar of signal, be private by default, and never overstate what it knows. All three are product requirements, not polish.

| Area | Requirement |
| --- | --- |
| Speed | Pass Google's "good" Core Web Vitals on mobile at the 75th percentile: largest content painted ≤ 2.5 s, response to input ≤ 200 ms, layout shift ≤ 0.1 ([source](https://web.dev/articles/vitals)). Today must show its first verdicts within that 2.5 s on a mid-range phone over 4G. |
| Offline | After the first visit, every covered item works with no signal; the copy downloads by itself in the background. Today shows its readiness status (section 6). |
| Freshness | Supply data is reference data, refreshed from the last 3 years of USDA reports on demand (about once a year) and reviewed like content; unusual seasons are handled by advisories. The value signal is weekly (v1.1). Quality windows, seasonal evidence and written content reviewed at least once a year. Advisories always carry an expiry. |
| Honesty | Every verdict states its evidence basis and confidence. "Data through" and "reviewed" dates are kept distinct and never imply someone checked the produce. Future dates are always labeled as the typical outlook. Missing evidence shows as Limited evidence, never as a default verdict. |
| Privacy | No account needed. The app never asks for, infers or stores the shopper's location. Analytics are aggregate, with no ad trackers and no selling of data. |
| Accessibility | WCAG 2.2 AA throughout (details in section 9). |
| Trust | Every verdict traces to its inputs on the Methods page. Audit results are published. Any advisory or editorial override carries a visible note. |
| Reach | The last 2 versions of Safari on iOS, Chrome on Android, and desktop Chrome, Safari, Firefox and Edge. Can be added to the home screen. Offline use must be tested in home-screen mode on iOS, not just in Safari. |
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
2. **Variety depth where it changes the decision:** verdicts per variety where varieties peak at different times, 3 full guides at launch, and type notes wherever the type changes how to pick or ripen.
3. **Works in the store with no setup:** saves itself for offline after the first visit and shows when it's ready.
4. **Honest evidence:** reasons, evidence basis and data dates on every verdict, published audits, and "Limited evidence" instead of a guess.

## 12. Release plan

The first release covers 30 seasonal items (section 8) out of the 89-item list, with 3 variety guides and nationwide guidance, audited monthly in 3 cities. Coverage grows only by passing explicit gates.

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
| **Gate 1** · Foundations → first release | **Source coverage:** every launch item has reviewed quality windows covering the origins (or, for items rated by variety, the varieties) behind most of its supermarket supply, each citing ≥ 2 sources (the model panel may be the second). **Rule check:** a back-test on 2 years of data agrees with an independent reviewer's seasonal calls (a person; the model panel feeds the ratings, so it can't be the reviewer) in ≥ 85% of item-windows. |
| **Gate 2** · first release → v1.1 | **Phone shopping tasks:** in in-store tests with ≥ 12 participants, ≥ 80% identify a good purchase within 5 s and ≥ 90% find selection advice within 2 taps. **Reliability:** offline readiness verified on iOS and Android devices; LCP ≤ 2.5 s. **Accuracy:** the first 2 audit cycles are complete and Peak items clearly beat the controls. |
| **Gate 3** · v1.1 → broader coverage (v2) | **Independently reviewed accuracy:** the audit pass rate meets the target set after cycle 2 for 3 consecutive months. Value markers match advertised prices for 4 weeks. Every new item clears the Gate 1 evidence bar before it is added. |

Verdicts never use promotion or price data in any release. v1.1 adds value markers beside them.

## 13. Risks and open decisions

The biggest risk is a confident verdict that doesn't match the bin in front of the shopper. Most mitigations keep verdicts honest about what they know and narrow about what they claim.

| Risk | Effect | Mitigation |
| --- | --- | --- |
| Seasonal quality ratings are partly judgment | Peak calls that don't eat well | ≥ 2 sources per rating, authoritative sources weighted above mainstream ones, an AI model panel whose disagreements with the sources are researched first, Low-confidence windows reviewed one by one, independent review, evidence basis shown, monthly blind audits against controls |
| USDA shipment data is incomplete ([source](https://www.ams.usda.gov/node/21104)) | Misread origin mix | Data used only to rank typical origins and to compute a within-series supply index, never shown as precise shares; items with patchy data use the assessment-only basis |
| The bin's origin differs from the typical origin | Advice wrong for this bin | "Depends on the label" note and the optional "What does the label say?" control |
| The named variety isn't in the shopper's store | A "best now" pick they can't find | Only varieties typically in stores that month are named; the item page lists the other good options |
| Promotion data is ads, not shelf prices | Shoppers read it as their store's price | Value marker only, labeled "national ad activity"; never part of the verdict |
| Weather shifts a season | Verdicts run early or late | Scoped advisories that expire; the typical outlook is never edited for one year's weather |
| Verdicts read as guarantees | Lost trust after one bad purchase | "Likely" wording, storage as ranges, Methods page, confidence explained |
| Content volume | Slow launch or uneven quality | 30 seasonal items at first release, drafted in batches of about 10; 3 guides; the other listed items (mostly always good, needing only a year-round rating and short copy) and anything beyond common produce join only through gates |

**Decisions needed**

| Decision | Recommendation |
| --- | --- |
| Product name and brand | Orchard, as the project name and the in-app brand |
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
- web.dev, [Web Vitals](https://web.dev/articles/vitals)
- W3C, [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)

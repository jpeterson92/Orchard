# Orchard Editorial Design System
## Seasonal Produce Guide reference for coding and graphics agents

**Owner:** Jared Peterson  
**Status:** Approved visual direction; implementation values and unpictured states are an initial baseline requiring browser verification.

This document defines Orchard's visual design for code: direction, tokens, layout, components, accessibility and acceptance criteria. Painted artwork and image prompts are in [illustration-guide.md](illustration-guide.md).

The visual direction is **Orchard Editorial**: a practical produce companion with the warmth of an illustrated food journal—botanical watercolor, light ivory paper, plum typography, and an open, lightly ruled layout.

Orchard is the project name and the in-app brand. The mark is the wordmark's O as a fruit: Lora Bold's capital O with a short stem and leaf at its top centre (§6 "Brand and date").

## 1. Approved direction and source of truth

### The selected combination

| Source concept | What to carry forward |
| --- | --- |
| A1 Shopping First | Compact header, useful information density, shopping-friendly proportions |
| A2 Quiet Editorial | Open continuous canvas, borderless produce rows, fine horizontal dividers |
| A3 Botanical Richness | Naturalistic watercolor, observed botanical detail, restrained foliage |
| Original A verdict treatment | Small star or check with verdict text; no filled verdict backgrounds |

Verdicts are subtle. **Never use A4’s colored verdict pills**, even where the rest of A4 is useful as an interaction reference.

The approved look is **Good things today: Orchard produce guide.png**:
[Open the visual reference](references/00-today-anchor.png).

The reference images are graphical inspiration only: they set the palette, type, illustration style and quiet verdict marks. Their layouts, controls, screen structure and information are not requirements; Claude designs the UI and information for what serves shoppers best, and Jared reviews it with end users. That reference is an art-direction study. Its illustrative produce recommendations, dates, origin claims, and artwork are not a production dataset. Its exterior presentation title and rounded presentation frame are not app components. Its “Peak now” heading reads “Best right now” in the product. Its location chip ("Near San Francisco") is a date-only chip in the product: the app has no location.

### Authority and interpretation

1. Explicit user decisions govern.
2. The product specification governs behavior, coverage, and content requirements.
3. This document governs visual design and graphics production.
4. The engineering specification governs architecture and implementation tooling.
5. Reference images illustrate the look only; they set no layout or information design and never override readable text, accessibility, or functional behavior.

Preserve the selected identity when reconciling practical constraints. Explain consequential changes rather than silently creating a new visual direction.

### Decision status

| Established visual decisions | Initial implementation baseline | Still to develop |
| --- | --- | --- |
| Warm ivory, plum ink, olive rules, restrained orange | Exact color tokens and type sizes below | Painted wordmark and blossom ornament |
| Editorial serif hierarchy and clear functional text | Lora for the editorial serif, system sans for functional text | Item and variety page implementation |
| Rich botanical watercolor | Illustration sizes and responsive proportions | Responsive implementation verification |
| Open produce rows | Component states described below | Dark-mode review and implementation |
| Subtle icon-and-text verdicts | Motion and focus treatment | Reviewed production artwork |

An agent may implement the baseline without waiting for every later visual reference. Mark assumptions honestly. This document is not evidence that the browser UI, contrast in every context, or real-device behavior has already been verified.

## 2. Design intent

The main moment is a shopper using a phone in a produce section. A glance should identify worthwhile choices; a tap should reveal practical advice. Reading at home can be richer without changing the product’s visual identity.

### Principles

- **The produce supplies the color.** The surrounding interface stays quiet.
- **Practical information comes first.** Decorations leave room for names, verdicts, and selection advice.
- **Warmth comes from materials and illustration.** Keep controls and text clear.
- **Open structure is the default.** Use alignment, whitespace, and fine rules instead of enclosing every item.
- **Verdicts are restrained and explicit.** Words and icons carry their meaning together.
- **Detail grows through interaction.** Keep the initial row concise; expand useful information in place.

### Visual character

Cultivated, inviting, observant, understated, and useful. The design should feel contemporary despite its paper and watercolor qualities. It should not resemble an antique document, a scrapbook, an ecommerce catalog, or a metrics dashboard.

### Guardrails

Use bordered fields and filter chips where they communicate interaction. Do not extend that treatment to every row, origin, caption, and status. Avoid heavy shadows, glossy effects, decorative gradients, competing accent colors, and large hero illustrations that displace the shopping list.

## 3. Color and materials

These are implementable starting values chosen to express the approved direction, not measured samples extracted from the mockup.

| Token | Initial value | Use |
| --- | --- | --- |
| Canvas | #FBF6EA | Main light background |
| Surface | #F3EBD9 | Restrained selected or supporting surface |
| Ink | #42192D | Primary text and headings |
| Secondary ink | #6F625A | Supporting information |
| Olive | #4F572D | Utility links, quiet controls, verdict words |
| Accent | #B94C1D | Active navigation and selected filter |
| Rule | #CEC3AD | Decorative separators |
| Peak icon | #A56B12 | Small star, paired with a verdict word |
| Good icon | #3B6C47 | Small check, paired with a verdict word |
| Skip icon | #8B5E3C | Small clock, paired with explicit wording; never an alarming red |
| Limited evidence icon | #6F625A | Information symbol; same value as secondary ink, so it reads as neutral |

Use the main ink or olive for normal verdict text. The gold token is for the star, not small body copy.

Calculated solid-color contrast against the canvas is approximately 13.82:1 for ink, 5.45:1 for secondary ink, 7.12:1 for olive, 4.73:1 for accent, 5.69:1 for the good icon, and 5.17:1 for the skip icon. The limited-evidence icon shares secondary ink's 5.45:1. White on the accent fill is approximately 5.10:1. These calculations do not certify textured backgrounds, opacity changes, or full components. The pale rule is decorative; it is not sufficient as the sole boundary or indicator for an interactive control.

### Paper

Use a very light warm canvas. Paper grain is optional and should be almost imperceptible behind reading text. One reusable texture can provide material character; separate baked paper backgrounds in every fruit image cannot.

Keep any texture faint enough to read through under bright store lighting. Do not add artificial stains, torn edges, dark vignettes, or noisy patches.

### Initial dark-mode values

Dark mode is part of the product requirements. A proposed mode study exists, but its treatment has not been explicitly approved. Start with warm dark surfaces and light ink; preserve natural fruit colors.

| Role | Initial dark value |
| --- | --- |
| Canvas | #25211F |
| Surface | #302A27 |
| Ink | #F5EEE3 |
| Secondary ink | #C1B5A5 |
| Olive | #CBD0A2 |
| Accent | #E69A68 |
| Rule | #665B50 |
| Peak icon | #E6B65C |
| Good icon | #B0C7A6 |
| Skip icon | #D8AE8E |
| Limited evidence icon | #C1B5A5 |

Recheck foregrounds on filled controls in dark mode. Do not blindly reuse white text on a light accent. Inspect transparent artwork for pale halos.

### Higher contrast

There is no in-app contrast or large-type mode. When the device asks for more contrast (`prefers-contrast: more`), these values replace the standard ones; surface stays as it is.

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | #FFFDF7 | #25211F |
| Ink | #2A0F1C (17.4:1) | #F5EEE3 |
| Secondary ink, limited evidence icon | #463B34 (10.7:1) | #DDD2C3 (10.7:1) |
| Olive | #384020 (10.7:1) | #DDE1B8 (11.8:1) |
| Accent | #A3400F (6.3:1; white on it 6.4:1) | #E69A68 |
| Rule | #8F8573 (3.6:1) | #8A7D70 (4.0:1) |
| Peak icon | #8A5600 (6.1:1) | #E6B65C |
| Good icon | #2C5636 (8.3:1) | #B0C7A6 |
| Skip icon | #6F4628 (8.0:1) | #D8AE8E |

Text sizes are in rem, so the phone's own text-size setting scales them.

## 4. Typography and spacing

### Type roles

| Role | Baseline |
| --- | --- |
| Page title | Editorial serif, about 32 px / 1.15, bold |
| Section heading | Editorial serif, about 24 px / 1.2, bold |
| Produce name | Editorial serif, about 24 px / 1.2, bold |
| Body and practical advice | Clear sans-serif, at least 16 px / 1.45–1.55 |
| Control label | Sans-serif, 16 px, medium or semibold |
| Supporting caption | Sans-serif, generally 14 px / 1.4 |
| Editorial subtitle | Short serif italic or restrained body treatment |
| Verdict word | Compact serif or sans treatment, consistent throughout |

The editorial serif is Lora (SIL Open Font License), self-hosted in Latin only: regular, bold and bold italic, about 65 KB together. It is the wordmark's face too, so headings and brand agree. Functional text stays on the system sans stack.

Reserve serif italics for short editorial accents or verdicts. Practical instructions, errors, and form labels should remain easy to scan. Use sentence case for interface text and title case for produce names where appropriate. Do not alternate small-cap and title-case section systems arbitrarily.

### Layout rhythm

Use 8, 16, 24, 32, and 48 px as the main spacing scale. Small optical adjustments are allowed. Typical phone side gutters are 16 px, increasing on larger screens.

On a phone, produce rows pair 56 px artwork, a 12 px gap and a flexible text column. Let actual content determine row height. Do not shrink text to fit more rows.

Use modest corner radii for fields and chips. Produce rows have no enclosing corner treatment because they have no enclosing box.

### Illustrative token block

Copy these values into the application’s token layer when implementation begins; adapt the syntax to the chosen styling system without changing the intended roles.

```css
:root {
  --color-canvas: #fbf6ea;
  --color-surface: #f3ebd9;
  --color-ink: #42192d;
  --color-ink-secondary: #6f625a;
  --color-olive: #4f572d;
  --color-accent: #b94c1d;
  --color-rule: #cec3ad;
  --color-peak-icon: #a56b12;
  --color-good-icon: #3b6c47;
  --color-skip-icon: #8b5e3c;
  --color-limited-icon: #6f625a;

  --font-editorial: Lora, Georgia, "Times New Roman", serif;
  --font-functional: system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  --font-body-size: 1rem;
  --font-title-size: 2rem;
  --font-item-size: 1.5rem;

  --space-1: 0.5rem;
  --space-2: 1rem;
  --space-3: 1.5rem;
  --space-4: 2rem;
  --space-6: 3rem;
  --tap-target-min: 2.75rem;
}
```

Keep semantic values centralized. Avoid a token for every incidental measurement or separate competing theme files.

## 5. Layout and responsive behavior

### Mobile Today

Order: compact brand and date → short seasonal summary, led by its half-month ("Late November") as a run-in label in small accent capitals → produce sections → freshness information. The page title is for screen readers only, so the best items show on the first screen. Category filters sit in one row under Good buys and scroll sideways rather than wrap. Search and primary navigation remain within thumb reach.

Keep decorative header art secondary. It may occupy a small upper-right area but never sit behind text. Aim for a compact header rather than an oversized introduction. Reflow the date onto its own line when necessary.

Items appear in open horizontal rows. Use thin rules between groups or rows when helpful. Align text consistently; do not draw a vertical line between every picture and name.

Provide enough bottom content padding for the fixed search/navigation region and the device safe area. The fixed region must not cover advice, feedback, or the final row.

### Larger screens

Follow the product’s navigation and information architecture. Reuse the same typographic hierarchy, open rows, colors, and components. Introduce panes or comparison tables when they help the task; do not merely stretch a phone row across a wide screen.

Use the product’s proposed breakpoints as the initial baseline: phone below 600 px, tablet 600–1024 px, desktop above 1024 px. Content must also behave between those sizes.

Keep reading text to a comfortable measure, approximately 60–70 characters where applicable. From 768 px, Today's rows run in two columns inside a 1024 px page. The item page stays one reading column (at most 40 rem) in product order; from 1024 px its artwork moves to a column of its own on the right and stays in view. Below the verdict, the confidence level is visible and "About this verdict" opens what it rests on: why confidence isn't higher, the evidence basis and the two dates. Desktop calendar and comparison layouts may be wider. A two-pane desktop study is available; exact responsive arrangements still require implementation and review.

### In the store

The phone view is the in-store view; there is no separate mode, and the screen sleeps normally. Today shows a stale offline copy in one quiet secondary line under the masthead, never a banner, and otherwise says nothing about offline.

## 6. Component rules and states

### Brand and date

The masthead shows the wordmark: "Orchard" in Lora Bold at about 28 px, its O drawn as the mark with the stem and leaf in olive. In the interface the mark is always the flat vector in `src/shared/brand.ts`, never a painting; the painted wordmark is for large brand uses only. Browser and home-screen icons are the cream mark on a plum tile, generated from the same shapes (`npm run brand:icons`).

The date is a recognizable interactive control. A rounded outline or restrained wash is acceptable. Show planning mode explicitly with a return-to-today action. Keep full values accessible when visible text must abbreviate.

### Category filters

One selected state with a restrained orange fill and a contrasting foreground. Unselected filters use a fine outline or an equally clear neutral treatment. Support keyboard focus and pressed states without changing shape or moving nearby content.

### Produce row

Rows are compact so a shopper can scan many in an aisle (about 76 px tall on a phone, 10 px above and below). Collapsed content:
- Recognizable watercolor image, 56 px.
- Produce name as the strongest text, with no status labels beside it.
- Subtle icon and verdict word; markers (Last call, Reliable year-round) on a quiet olive line below. The collapsed row carries only what a shopper needs to choose well: an origin appears only when it decides the pick, as a "Look for ones from California" line under the name naming every origin at the verdict's level.
- A short factual reason only when it says more than the section heading (when it fades, when it improves, why it can't be called); "At its best this time of year" is never shown.
- For items rated by variety, a quieter variety line under the name ("Ataulfo", or "Honeycrisp, Gala, Fuji and Pink Lady"); the image is that variety's, or the item's when the line names more than two.
- A rated variety without approved art uses its item's. In development and preview, missing art shows a mostly transparent placeholder of the same size.

Do not repeat the same origin information in several adjacent labels. Examples in design references do not authorize invented source claims.

The row header can be a real expand button with the associated expanded state. Keep a separate detail link available. Do not nest links or buttons inside another interactive element. Make the expansion behavior consistent between items.

### Expanded practical advice

Use a short labeled instruction such as “Pick:” followed by clear sans-serif text. A small olive left rule or faint supporting wash is optional; a large nested rounded card is unnecessary.

A separate text link, such as “Picking & storage,” opens the detail page. Additional content should follow the product’s selection and storage hierarchy. Do not substitute vague placeholder advice for reviewed practical information.

### Verdicts

| Meaning | Treatment |
| --- | --- |
| Peak | Small ochre star and “Peak” in dark olive or ink |
| Good | Small green check and “Good” in dark olive or ink |
| Skip for now | Small clock and explicit wording; secondary explanation |
| Limited evidence | Neutral information symbol and “Not rated” |

Reliable year-round, Last call and Good value are markers, not verdicts: small text tags under the verdict word, per the product spec. Visual labels must follow the product’s approved terminology and contract. If methodology changes, update labels consistently. This table describes presentation, not new verdict logic.

No filled pill backgrounds, large medallions, numerical scores invented for display, or alarming red treatment for ordinary seasonal advice. Never convey a verdict only through color.

Supporting evidence can appear as secondary text or a short disclosure; confidence is never shown. Do not overwhelm Today with badges.

### Search

A generous field with a clear magnifier and normal text entry. The field may be outlined and rounded even though produce rows are borderless. Present item and variety results with restrained artwork and the same verdict language.

Cover empty input, results, no result, unavailable offline coverage, and errors. Suggestions should remain keyboard accessible. A successful search can end at the verdict in the result.

### Navigation and icons

Use one consistent set of simple line icons for Today, Browse, Calendar, search, date, disclosure, and utilities. Implement icons as reusable vector assets or code components, not individually generated raster illustrations.

Selected navigation uses a restrained orange icon/text treatment and optional short underline. Keep icons accompanied by labels where the approved UI shows them.

### Season strips and comparisons

Season strips and heatmaps require a stable, documented mapping between verdict and fill intensity or pattern. They cannot rely on tiny star icons alone. The phone calendar study uses a list; the heatmap treatment remains provisional.

The item page's 24-window strip: Peak is a solid ochre cell, Good a lighter green cell, Skip a hatched cell, Not rated an empty outlined cell; today's window carries an ink outline, month initials sit underneath, and a legend names all four. The strip's accessible name states its runs in words ("Peak early November to late May; Limited evidence early June to late October"). Typical main supply origins follow as a short list of month ranges.

Keep written labels or accessible tables available. Use the warm neutral canvas and clear ink rather than introducing an unrelated chart palette.

Comparison tables use readable headers, aligned values, and quiet separators. Cards on a phone and tables on larger screens should describe the same information consistently.

### Loading, empty, offline, and errors

Keep status messages useful and calm. Preserve layout where possible. Use neutral loading placeholders without decorative shimmer in in-store or reduced-motion modes.

Distinguish “No matching items,” “Not covered,” “Not saved offline,” and “Could not update.” An update failure should not disguise usable saved guidance or silently imply freshness.

Forms and feedback controls follow the same type, outline, spacing, and focus rules. Avoid inventing a new visual language for dialogs or error states.

## 7. Accessibility and interaction

The product target is WCAG 2.2 AA, with its chosen minimum 44 × 44 CSS px touch targets. These are project requirements, not a claim of completed certification.

- Maintain readable foreground/background contrast in actual rendered states.
- Use visible keyboard focus, with an initial 2 px contrasting outline and approximately 2 px offset.
- Support text enlargement, narrow layouts, long names, and 200% zoom without lost functions or overlapping controls.
- Preserve semantic headings, labels, buttons, and navigation.
- Announce verdicts once with their text; decorative icons should not repeat the same phrase.
- Expose expansion state and provide sensible focus behavior.
- Respect reduced motion; ordinary expansion can use roughly 150–200 ms when permitted.
- Keep essential information available without animation, color perception, hover, or a perfect network connection.

Device-size screenshots do not prove actual touch use, screen-reader behavior, or installed-app operation.

## 8. Coding-agent working agreement

Build real UI from components and data. Generated full-screen images are references, never the implemented interface.

Before adding a new treatment, check the existing tokens and component patterns. Use one canonical implementation per component. Do not build a second set of components solely for reference screenshots.

Use the existing project styling and accessibility primitives. This design does not authorize new services, state frameworks, component packages, or a separate documentation platform.

When a reference conflicts with real content, prioritize legibility, accurate information, semantics, and the established identity. Do not reduce text size or hide necessary information merely to match a picture.

For visual changes, inspect the relevant phone and larger-screen layout and affected states. Capture reference screenshots when a working app exists. Fix clipping, hierarchy, alignment, or artwork problems before declaring the change complete.

Keep design decisions in this document and implemented values in the application’s token layer once created. Update both coherently. Do not independently restate evolving rules in many agent files.

Suggested instruction for the repository’s canonical AGENTS.md:

> For UI or graphics work, read the Orchard Editorial design reference first. Reuse established tokens, components, and approved artwork. Preserve open rows, watercolor identity, and subtle icon-and-text verdicts. Verify the affected layouts and states, and record material design changes in the shared reference.

The repository's CLAUDE.md carries this instruction; there is no separate AGENTS.md.

## 9. Reference collection and acceptance criteria

The original mobile Today synthesis is the visual anchor for the look. Ten complementary reference studies have since been generated. All of them are inspiration for color, type and illustration only, not specifications of controls, placement, layout or content. The text in this guide remains usable without any of these images.

| Study | Purpose | Reference |
| --- | --- | --- |
| 01 Components and visual language | Type, controls, verdicts, rows, and status examples | [Open](references/01-components.png) |
| 02 Mobile item page | Practical selection and storage hierarchy | [Open](references/02-mobile-item-page.png) |
| 03 Variety guide and comparison | Wider comparison layout and restrained illustration scale | [Open](references/03-variety-comparison.png) |
| 04 Illustration language | Produce studies and painting detail | [Open](references/04-illustration-language.png) |
| 05 Desktop Today and detail | Two-pane shopping and detail layout | [Open](references/05-desktop-today-detail.png) |
| 06 Mobile variety finder | Phone filters and open variety rows | [Open](references/06-mobile-variety-finder.png) |
| 07 Mobile seasonal calendar | Month-based seasonal list | [Open](references/07-mobile-calendar.png) |
| 08 Standard, dark, and in-store | Proposed mode adaptations | [Open](references/08-modes-standard-dark-instore.png) |
| 09 Logo study | The leaf-topped O wordmark and app icon tiles | [Open](references/09-logo-study.png) |
| 10 Botanical study | Pear, pomegranate and apple blossom paint handling | [Open](references/10-botanical-study.png) |

The calendar study is a phone list, not an approved exact heatmap or season-strip mapping. The mode study does not establish measured accessibility compliance. Mockups sometimes use italic practical text or place search differently; implement the documented functional type and navigation behavior instead of copying those deviations. The anchor’s “Peak now” heading is an older label; use the product spec’s “Best right now”.

Future briefs should identify the task, screen size, exact content, specific decision being explored, and supplied references if any. Prefer focused revisions over reopening the whole direction.

### Review checklist

- **Identity:** Does the result retain the cultivated ivory/plum journal character and restrained interface?
- **Painting:** Are translucent layers, selective detail, natural pigment variation, and softly varied edges visible?
- **Shape:** Is the subject recognizable at its intended size and free of obvious anatomical invention?
- **Composition:** Are apparent scale, viewpoint, lighting, and foliage consistent with the asset class?
- **Background:** Does the delivered file actually meet its alpha/background requirement without halos or paper rectangles?
- **Hierarchy:** Is useful information visible before decoration, with readable real-content lengths?
- **Components:** Are rows open, dividers light, and verdicts small icon-and-word treatments without filled backgrounds?
- **Access:** Are controls recognizable and all important states distinguishable without color alone?
- **Truth:** Are illustrative content, unknown data, and unreviewed cultivar details represented honestly?
- **Continuity:** Does the result extend the system rather than establish an unrelated second style?

Review ordinary and awkward examples: long names, no image, limited evidence, multi-line reasons, expanded advice, offline data, no search match, and an error. Keep demonstration labels outside the product interface. Correct material failures before marking an output approved; a numerical score cannot compensate for wrong anatomy, unreadable text, or the wrong verdict treatment.

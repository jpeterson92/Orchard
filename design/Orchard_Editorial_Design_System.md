# Orchard Editorial Design System
## Seasonal Produce Guide reference for coding and graphics agents

**Version:** 1.1  
**Established:** November 16, 2026  
**Owner:** Jared Peterson  
**Status:** Approved visual direction; implementation values and unpictured states are an initial baseline requiring browser verification.

This document gives a future AI coding or graphics agent enough context to extend the Seasonal Produce Guide consistently. It codifies the design selected in the conversation, establishes usable implementation defaults, and provides reference-free art direction plus a reference-study index. It does not implement the app or create additional reference images.

The visual direction is **Orchard Editorial**: a practical produce companion with the warmth of an illustrated food journal—botanical watercolor, light ivory paper, plum typography, and an open, lightly ruled layout.

“Produce Guide” is the working interface name. A final product name and brand mark have not been selected.

## 1. Approved direction and source of truth

### The selected combination

| Source concept | What to carry forward |
| --- | --- |
| A1 Shopping First | Compact header, useful information density, shopping-friendly proportions |
| A2 Quiet Editorial | Open continuous canvas, borderless produce rows, fine horizontal dividers |
| A3 Botanical Richness | Naturalistic watercolor, observed botanical detail, restrained foliage |
| Original A verdict treatment | Small star or check with verdict text; no filled verdict backgrounds |

The user explicitly preferred subtle verdicts after initially considering A4. **Do not carry forward A4’s colored verdict pills.** This preference applies even when the rest of A4 is useful as an interaction reference.

The approved synthesis is **Good things today: Orchard produce guide.png**:
[Open the approved visual reference](https://chatgpt.com/library?file_id=libfile_2ad12622485081919e9a6375bfd66dde&account_id=personal).

That reference is an art-direction study. Its illustrative produce recommendations, dates, origin claims, and artwork are not a production dataset. Its exterior presentation title and rounded presentation frame are not app components.

### Authority and interpretation

1. Explicit user decisions govern.
2. The product specification governs behavior, coverage, and content requirements.
3. This document governs visual design and graphics production.
4. The engineering specification governs architecture and implementation tooling.
5. Approved reference images illustrate appearance; they do not override readable text, accessibility, or functional behavior.

Preserve the selected identity when reconciling practical constraints. Explain consequential changes rather than silently creating a new visual direction.

### Decision status

| Established visual decisions | Initial implementation baseline | Still to develop |
| --- | --- | --- |
| Warm ivory, plum ink, olive rules, restrained orange | Exact color tokens and type sizes below | Final webfont selection and brand mark |
| Editorial serif hierarchy and clear functional text | System font stacks for a working first implementation | Item and variety page implementation |
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

Use the main ink or olive for normal verdict text. The gold token is for the star, not small body copy.

Calculated solid-color contrast against the canvas is approximately 13.82:1 for ink, 5.45:1 for secondary ink, 7.12:1 for olive, 4.73:1 for accent, and 5.69:1 for the good icon. White on the accent fill is approximately 5.10:1. These calculations do not certify textured backgrounds, opacity changes, or full components. The pale rule is decorative; it is not sufficient as the sole boundary or indicator for an interactive control.

### Paper

Use a very light warm canvas. Paper grain is optional and should be almost imperceptible behind reading text. One reusable texture can provide material character; separate baked paper backgrounds in every fruit image cannot.

Disable texture in in-store mode. Do not add artificial stains, torn edges, dark vignettes, or noisy patches.

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

Recheck foregrounds on filled controls in dark mode. Do not blindly reuse white text on a light accent. Inspect transparent artwork for pale halos. In-store mode uses the high-contrast light treatment.

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

Begin with Georgia and a system sans stack to make the design implementable without an external font dependency. These are prototype defaults, not a claim about the typeface pictured. Choose final webfonts after checking actual produce names, long text, mobile rendering, licensing, and the project’s font budget.

Reserve serif italics for short editorial accents or verdicts. Practical instructions, errors, and form labels should remain easy to scan. Use sentence case for interface text and title case for produce names where appropriate. Do not alternate small-cap and title-case section systems arbitrarily.

### Layout rhythm

Use 8, 16, 24, 32, and 48 px as the main spacing scale. Small optical adjustments are allowed. Typical phone side gutters are 16 px, increasing on larger screens.

On a phone, begin with artwork around 96–112 px wide, an approximately 16 px gap, and a flexible text column. Let actual content determine row height. Do not shrink text to force four items into a fixed viewport.

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

  --font-editorial: Georgia, "Times New Roman", serif;
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

Order: compact brand and location/date → title and short seasonal summary → category filters → produce sections → freshness information. Search and primary navigation remain within thumb reach.

Keep decorative header art secondary. It may occupy a small upper-right area but never sit behind text. Aim for a compact header rather than an oversized introduction. Reflow the location onto its own line when necessary.

Items appear in open horizontal rows. Use thin rules between groups or rows when helpful. Align text consistently; do not draw a vertical line between every picture and name.

Provide enough bottom content padding for the fixed search/navigation region and the device safe area. The fixed region must not cover advice, feedback, or the final row.

### Larger screens

Follow the product’s navigation and information architecture. Reuse the same typographic hierarchy, open rows, colors, and components. Introduce panes or comparison tables when they help the task; do not merely stretch a phone row across a wide screen.

Use the product’s proposed breakpoints as the initial baseline: phone below 600 px, tablet 600–1024 px, desktop above 1024 px. Content must also behave between those sizes.

Keep reading text to a comfortable measure, approximately 60–70 characters where applicable. Desktop calendar and comparison layouts may be wider. A two-pane desktop study is available; exact responsive arrangements still require implementation and review.

### In-store mode

Use at least 18 px body text, stronger functional contrast, no paper texture, and no unnecessary motion. Retain the serif/watercolor identity without making decorative artwork larger. Keep planning content secondary as the product specifies. Reflect offline readiness and data age clearly without a dominant decorative banner.

## 6. Component rules and states

### Brand and location/date

The leaf mark is a provisional visual motif. Reuse a consistent asset rather than generating a different mark for every screen. The working brand is Produce Guide.

Location/date is a recognizable interactive control. A rounded outline or restrained wash is acceptable. Show planning mode explicitly with a return-to-today action. Keep full values accessible when visible text must abbreviate.

### Category filters

One selected state with a restrained orange fill and a contrasting foreground. Unselected filters use a fine outline or an equally clear neutral treatment. Support keyboard focus and pressed states without changing shape or moving nearby content.

### Produce row

Collapsed content:
- Recognizable watercolor image.
- Produce name as the strongest text.
- Subtle icon and verdict word.
- One short factual reason.
- Secondary origin caption when supported by data.

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
| Reliable year-round guidance | Quiet dash or equivalent restrained icon plus explicit wording |
| Limited evidence | Neutral information symbol and explicit wording |

Visual labels must follow the product’s approved terminology and contract. If methodology changes, update labels consistently. This table describes presentation, not new verdict logic.

No filled pill backgrounds, large medallions, numerical scores invented for display, or alarming red treatment for ordinary seasonal advice. Never convey a verdict only through color.

Confidence and supporting evidence can appear as secondary text or a short disclosure. Do not overwhelm Today with badges.

### Search

A generous field with a clear magnifier and normal text entry. The field may be outlined and rounded even though produce rows are borderless. Present item and variety results with restrained artwork and the same verdict language.

Cover empty input, results, no result, unavailable offline coverage, and errors. Suggestions should remain keyboard accessible. A successful search can end at the verdict in the result.

### Navigation and icons

Use one consistent set of simple line icons for Today, Browse, Calendar, search, location, disclosure, and utilities. Implement icons as reusable vector assets or code components, not individually generated raster illustrations.

Selected navigation uses a restrained orange icon/text treatment and optional short underline. Keep icons accompanied by labels where the approved UI shows them.

### Season strips and comparisons

Season strips and heatmaps require a stable, documented mapping between verdict and fill intensity or pattern. They cannot rely on tiny star icons alone. The phone calendar study uses a list; the detailed heatmap and strip treatment remains provisional.

Keep written labels or accessible tables available. Use the warm neutral canvas and clear ink rather than introducing an unrelated chart palette.

Comparison tables use readable headers, aligned values, and quiet separators. Cards on a phone and tables on larger screens should describe the same information consistently.

### Loading, empty, offline, and errors

Keep status messages useful and calm. Preserve layout where possible. Use neutral loading placeholders without decorative shimmer in in-store or reduced-motion modes.

Distinguish “No matching items,” “Not covered,” “Not saved offline,” and “Could not update.” An update failure should not disguise usable saved guidance or silently imply freshness.

Forms and feedback controls follow the same type, outline, spacing, and focus rules. Avoid inventing a new visual language for dialogs or error states.

## 7. Self-contained graphical style and illustration system

This section is sufficient to brief an artist or image model without access to any reference image. “Orchard Editorial” is a project label, not a style a model can be assumed to recognize. Include the actual visual description when requesting an image. References, when available, improve continuity but are optional inputs.

### The look to reconstruct

Imagine a contemporary produce-shopping companion printed on very pale ivory stock. Dark plum editorial headings sit above a light, open arrangement of naturally colored botanical watercolors and clear practical text. Fruit looks carefully observed and hand-painted: transparent color layers, slightly uneven pigment, soft brush transitions, and enough crisp detail to recognize stems, calyxes, seeds, and skin. Thin olive rules organize generous negative space. Orange appears sparingly in selected controls. Small stars and checks quietly explain recommendations.

The result feels warm, cultivated, fresh, and useful. It combines the material character of a good illustrated food journal with the legibility of a contemporary application. There are no parchment stains, distressed printing, ornate frames, dense scientific annotations, glossy product renders, or cartoon faces.

### Painting construction and surface

Describe the visible result rather than relying on “watercolor” alone:

| Property | Desired appearance |
| --- | --- |
| Base color | Luminous translucent washes; lighter areas appear to reserve the underlying light rather than receive thick white paint |
| Modeling | Several broad overlapping washes follow the fruit’s volume; transitions retain small hand-painted variations |
| Pigment | Subtle granulation, occasional darker pooling at a wash edge, gentle blooms, and softly broken color |
| Detail | Selective dry-brush or fine painted marks describe skin, seeds, veins, stems, and folds |
| Linework | Little or no visible contour line; any graphite-like accents are fine, warm, and subordinate to color |
| Silhouette | Clearly identifiable overall shape, with occasional soft or lightly broken edges |
| Finish | Observed and moderately detailed, with brushwork visible at larger sizes; simpler masses remain legible in thumbnails |

Do not simulate the effect by placing a paper/noise filter over a photograph. Avoid thick opaque impasto, heavy ink outlines, uniform vector edges, excessive blur, or thousands of equally sharp micro-details. The fruit should feel solid through painted color, not through a shiny 3D surface.

### Lighting and volume

Use one consistent soft, diffuse light, generally from the upper left. Shape is described with warm light areas and modest cooler or deeper natural-color shadow washes. Highlights are small, irregular, and integrated into the paint; they are not hard white plastic reflections.

Keep the subject isolated. A faint, close contact wash can be appropriate in a full reference composition, but do not add long cast shadows, studio backdrops, pedestals, tabletops, horizon lines, or dramatic spotlights. For reusable isolated assets, prefer no separate ground shadow so the illustration works across themes.

### Produce and foliage color

Preserve natural subject colors. The interface palette does not require every fruit to become orange or every vegetable to become olive.

Common color relationships include warm orange with ochre and red-orange variation; pomegranate skin in crimson and red with deeper ruby arils; pear skin in green-gold with restrained russet or blush; apples in observed red/gold or green combinations; and vegetables in believable fresh greens with softly shaded structure.

Foliage tends toward natural sage, olive, and yellow-green, with fine visible veins and slim brown or green stems where appropriate. Allow botanically justified variations. Do not attach the same generic leaf to every species or invent blossoms to fill space. Fruit generally carries the richest color; foliage supports it rather than forming a dominant wreath.

Avoid neon saturation, gray-brown dullness across all subjects, arbitrary recoloring, and deep black shadows. Do not force a warm cast that obscures distinguishing traits.

### Viewpoint, grouping, and visual weight

For a standard thumbnail, use a front or gently elevated three-quarter view. Show enough of the top to read the stem or calyx. Avoid extreme overhead views, dramatic perspective, and a different camera angle for every item.

Usually one principal specimen is enough. A second whole specimen or a carefully chosen cut section may explain the subject. Arrange companions close to the principal specimen with natural slight overlap; do not scatter small fragments across a wide canvas.

Keep the silhouette clear at approximately 96–112 CSS px display width. Balance apparent visual weight across the set rather than depicting every commodity at literal physical scale. A broccoli head and an apple should each make a readable thumbnail without forcing one to dwarf the other.

Use foliage selectively. A compact cluster can have several real leaves, but the readable produce remains the focal point. Preserve space around stems and edges; a starting production brief can reserve about a tenth of the canvas as crop safety. Adjust that margin to the composition rather than treating it as a pixel-perfect law.

### Asset classes and composition recipes

| Class | Composition recipe |
| --- | --- |
| Item thumbnail | One main specimen, optional compact companion, clear silhouette, limited foliage, no text, transparent background |
| Item detail | Same painting language and viewpoint family, more observed detail, optional verified cutaway, generous crop safety |
| Variety set | Matched framing, apparent scale, lighting, and detail; real distinguishing traits; identity cannot depend on arbitrary recoloring |
| Header branch | A slim asymmetric twig enters from an upper corner; one main fruit or small group hangs toward the edge; most interior space stays clear for text |
| Reference art sheet | Ivory ground, separated labeled specimens, simple rows or grid, fine olive rules, a few paint-detail crops |
| Utility icon | Clean consistent vector/code line icon; not a miniature watercolor painting |

Header art is a corner accent, not an illustrated banner across the page. Keep it out of text and away from functional controls. Today should reach useful produce information promptly. Item-detail artwork may be larger, but it must not push practical advice out of the screen unnecessarily.

### Transparency, paper, and export

Production subject artwork and the application canvas are separate layers. Ask for genuine transparency for isolated assets. Neither a white rectangle nor a checkerboard painted into the image is transparency.

Retain natural pigment variation within the painted subject without embedding an ivory paper patch around it. Inspect alpha edges against both ivory and warm charcoal. Reject obvious white halos, hard rectangular edges, clipped leaves, and a surrounding pale haze.

The page may have a single almost imperceptible paper texture. It should not appear as wrinkles, stains, darkened corners, or speckling that competes with text. In-store mode has no paper texture.

Reference sheets and interface mockups may have an opaque ivory canvas. They are visual studies, not already separated production assets. Select output dimensions for the intended display size and the model’s supported formats. Keep an editable or high-resolution master; prepare optimized derivatives during implementation. Do not claim a precise file size or transparent export without checking the actual file.

### Botanical accuracy and concrete subject checks

Style can be reconstructed from text; biological identity may still require a reliable subject reference. Describe identifying traits and verify them, especially for named cultivars. Do not imply that similar varieties are reliably distinguishable from appearance alone.

- **Fuyu persimmon:** a whole squat orange fruit with a broad green calyx. Use an observed whole specimen unless a checked cutaway is specifically needed. Early studies incorrectly showed a citrus-like interior; do not repeat it.
- **Pomegranate:** recognize the crown and natural red skin; a cut section shows ruby arils and pale internal membranes, not citrus wedges.
- **Mandarin:** a citrus subject may show plausible peeled segments; keep that anatomy confined to citrus.
- **Pear and apple:** retain real stems, shape, skin variation, and any cultivar-specific traits supported by a reference.
- **Broccoli:** preserve the relationship between florets and branching stalks, rather than painting a generic miniature tree.

A production variety set must reflect real differences. Do not label several copies of one specimen as different varieties. Reference images themselves can contain mistakes and are not a botanical authority.

### Asset identifiers and handoff

Use stable descriptive identifiers such as `persimmon-fuyu-thumbnail-v1`. Keep botanical identity separate from the UI label and verdict.

A future manifest can contain asset ID, item/variety association, intended role, file path, alt-text context, revision, approval status, and reference provenance when applicable. Such a production collection has not been implemented by this document.

If a nearby name already identifies a decorative thumbnail, appropriate empty alt text avoids repetition. When an illustration communicates a useful identifying distinction, describe that distinction. Component context determines the final alternative text.

### Extending the style to interface graphics

Use a very pale warm ivory continuous ground with deep plum text. Main headings and produce names are bold, moderately contrasted editorial serifs, with open counters and readable proportions. Avoid hairline fashion-magazine type, highly condensed lettering, elaborate calligraphy, or distressed letterpress effects. Functional text is clear nonitalic sans-serif. A short subtitle or verdict may use serif italic.

Lay out open rows with a small painting on the left and aligned text on the right. Establish hierarchy through size, spacing, and weight. Use fine olive horizontal rules rather than enclosing every row. Origins are quiet captions, not extra colored badges. Filters and search fields can be rounded and outlined; that does not turn the whole interface into a stack of cards.

A verdict is a small star or check followed by a word. It has no filled background. Orange highlights a selected filter or navigation item; it should not decorate every heading.

On desktop, a restrained vertical rule can separate a shopping list from a detail pane. In dark mode, use warm charcoal with light warm ink, preserve natural artwork colors, and avoid pale image mats. In-store mode keeps the identity with a smooth light ground, larger functional type, clear controls, and less decoration.

Exterior labels used on reference boards, presentation frames, sample annotations, and illustrative data do not belong in the actual app. Exact token values and functional placement in this guide govern implementation; raster mockups cannot guarantee exact hex values, fonts, or dimensions.

## 8. Reference-free prompt pack

These prompts are portable textual briefs. They do not require attached images. Fill the bracketed fields before sending; do not render the brackets or instruction labels as artwork. An available reference is an optional supplement, not a replacement for the style description.

### A. Isolated produce illustration

> Create a naturalistic botanical watercolor of [produce and type/cultivar], composed as [one whole specimen / a compact pair / a whole specimen with a verified cut section]. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: [verified distinguishing features]. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at [intended thumbnail or detail size].

Use the generation tool’s transparency setting when available. A request in the prompt alone does not establish that the file has an alpha channel.

### B. Decorative header branch

> Paint a small botanical watercolor corner accent for a contemporary produce guide. A slender [botanically appropriate branch] enters from the [corner] with [fruit/foliage subject and checked identifying traits]. Use natural colors, luminous transparent washes, subtle pigment variation, delicately observed stems and veins, and soft diffuse upper-left light. Let the branch curve near the outer edge and leave most of the composition empty for text. The fruit supplies the richest color; foliage remains supportive. Keep the painting refined, naturalistic, and compact, with no thick outlines or glossy 3D highlights. Isolate it on genuine transparency. Include no text, page background, frame, or unrelated decorative plants. Do not produce a full-width hero illustration.

### C. Mobile interface reference without images

> Design a straight-on mobile produce-shopping screen for “Produce Guide,” using a warm contemporary illustrated food-journal identity. Use a continuous very pale ivory ground, approximately #FBF6EA, deep plum headings around #42192D, olive utility details and fine horizontal rules around #4F572D, and sparse burnt-orange selected controls around #B94C1D. Set readable bold editorial-serif headings and item names above clear nonitalic sans-serif practical text. Optional material texture is barely perceptible. Illustrate [specified produce] as naturalistic watercolor: luminous layered washes, selective botanical detail, softly varied pigment edges, accurate anatomy, natural color, restrained leaves, and consistent soft upper-left light. Arrange [specified screen content] with modest artwork and generous usable spacing. Use open rows, not rounded enclosing cards. Show verdicts as a small ochre star with “Peak,” green check with “Good,” or the explicitly supplied equivalent; never put a filled pill behind a verdict. Use fine outlined search and filters, a compact header, and [specified navigation and selected destination]. Exact interface copy: [complete copy]. Keep decorative branches in margins away from text. Avoid gradients, heavy shadows, noisy parchment, shopping-cart buttons, invented metrics, and tiny type. This is a visual reference with illustrative data. Keep any presentation title or disclaimer outside the interface.

State the screen’s main job and whether it is a full scrollable page or one viewport. Do not shrink type simply to fit everything into a frame. Copying an old mockup’s accidental placement does not override the written search or navigation requirements.

### D. Desktop interface reference without images

> Create a straight-on desktop produce-guide interface on a pale ivory continuous canvas with deep plum editorial-serif headings, readable nonitalic sans-serif practical text, fine olive rules, and restrained burnt-orange active navigation. Use a compact top bar containing Produce Guide, Today, Browse, Calendar, and search; select [destination]. Arrange [specified content] as [an open comparison table / a shopping list and detail pane separated by one thin vertical rule]. Keep columns aligned and reading widths comfortable. Small botanically accurate watercolor illustrations have luminous translucent washes, selective natural detail, soft pigment edges, and restrained foliage; their natural colors provide the strongest color on the page. Produce rows remain borderless. Origins are secondary captions, and verdicts are small icon-and-word treatments without filled backgrounds. Use exact copy [complete copy]. Do not introduce dashboard cards, large colorful panels, gradients, heavy shadows, or a giant decorative hero. Put any reference title outside the app. The result should feel like a practical contemporary illustrated food journal.

### E. Artwork style-reference sheet without images

> Create an editorial botanical-watercolor reference sheet on very pale warm ivory paper. Arrange [specified subjects] in a spacious [grid or row arrangement], with simple deep plum serif labels and thin olive separators. Paint naturalistic observed forms using luminous layered transparent color, selective fine botanical detail, occasional pigment pooling, softly irregular edges, and consistent soft upper-left light. Keep fruit and vegetables naturally colored, with restrained species-appropriate foliage and no heavy outlines. Match apparent visual weight across specimens. Add small detail crops illustrating translucent pigment, softly varied edges, and restrained foliage. Use only supplied labels [labels]. Avoid photos, plastic 3D rendering, cartoons, ornate scientific annotation, distressed paper, and unnecessary decorations. The sheet is an opaque visual reference; isolated production artwork is a separate transparent export.

### F. Targeted revision when an image is available

> Change only [specific property] in the supplied image. Preserve the composition, subject identity, wording, painting construction, palette, and other components except where the named change requires adjustment. Retain luminous botanical watercolor, pale ivory/plum editorial character, open interface rows, and subtle icon-and-text verdicts. Do not introduce new objects, labels, or controls.

### Prompt assembly and independent reconstruction

For any new request, provide the asset role, subject, verified identifying traits, composition, destination size/aspect, background requirement, exact permitted text, and review criteria. Keep the project’s invariant style description unchanged across a batch, while changing subject and composition deliberately.

If no images are available, use a complete prompt above rather than only “match Orchard Editorial.” For a short brief, preserve these five anchors: luminous layered botanical watercolor; accurate naturally colored subject; pale ivory/plum editorial UI; open lightly ruled structure; subtle unfilled verdicts.

Textual art direction supports a similar family of graphics, not pixel-identical reproduction across models. A useful later reconstruction test is to give an agent only this document and ask for one new produce thumbnail and one small interface study. Review those against the checklist in section 11 before treating new output as an approved reference. This revision does not claim that such an independent test has been run.

Do not add prices, health claims, provenance, freshness dates, confidence claims, or functional controls just to make a picture seem complete. Use identified illustrative content where production data is unavailable. Exact charts and numerical mappings must come from real data and appropriate rendering tools, not an image model’s invented values.

## 9. Accessibility and interaction

The product target is WCAG 2.2 AA, with its chosen minimum 44 × 44 CSS px touch targets. These are project requirements, not a claim of completed certification.

- Maintain readable foreground/background contrast in actual rendered states.
- Use visible keyboard focus, with an initial 2 px contrasting outline and approximately 2 px offset.
- Support text enlargement, narrow layouts, long names, and 200% zoom without lost functions or overlapping controls.
- Preserve semantic headings, labels, buttons, and navigation.
- Announce verdicts once with their text; decorative icons should not repeat the same phrase.
- Expose expansion state and provide sensible focus behavior.
- Respect reduced motion; ordinary expansion can use roughly 150–200 ms when permitted.
- Keep essential information available without animation, color perception, hover, or a perfect network connection.

Device-size screenshots do not prove actual touch use, screen-reader behavior, installed-app operation, or wake-lock behavior.

## 10. Coding-agent working agreement

Build real UI from components and data. Generated full-screen images are references, never the implemented interface.

Before adding a new treatment, check the existing tokens and component patterns. Use one canonical implementation per component. Do not build a second set of components solely for reference screenshots.

Use the existing project styling and accessibility primitives. This design does not authorize new services, state frameworks, component packages, or a separate documentation platform.

When a reference conflicts with real content, prioritize legibility, accurate information, semantics, and the established identity. Do not reduce text size or hide necessary information merely to match a picture.

For visual changes, inspect the relevant phone and larger-screen layout and affected states. Capture reference screenshots when a working app exists. Fix clipping, hierarchy, alignment, or artwork problems before declaring the change complete.

Keep design decisions in this document and implemented values in the application’s token layer once created. Update both coherently. Do not independently restate evolving rules in many agent files.

Suggested instruction for the repository’s canonical AGENTS.md:

> For UI or graphics work, read the Orchard Editorial design reference first. Reuse established tokens, components, and approved artwork. Preserve open rows, watercolor identity, and subtle icon-and-text verdicts. Verify the affected layouts and states, and record material design changes in the shared reference.

CLAUDE.md should reference the same instructions using a supported mechanism. Neither repository file has been modified as part of this document.

## 11. Reference collection and acceptance criteria

The original mobile Today synthesis remains the approved visual anchor. Eight complementary reference studies have since been generated. They are drafts for extension and review, not blanket approval of every visible control, placement, letterform, or botanical detail. The text in this guide remains usable without any of these images.

| Study | Purpose | Reference |
| --- | --- | --- |
| 01 Components and visual language | Type, controls, verdicts, rows, and status examples | [Open](https://chatgpt.com/library?file_id=libfile_2d00aba6eca881919d55eb738dc76673&account_id=personal) |
| 02 Mobile item page | Practical selection and storage hierarchy | [Open](https://chatgpt.com/library?file_id=libfile_9c8047974b948191b7f83abc02e728d7&account_id=personal) |
| 03 Variety guide and comparison | Wider comparison layout and restrained illustration scale | [Open](https://chatgpt.com/library?file_id=libfile_ca4dbc3b47a08191b7dad76681f2c5c0&account_id=personal) |
| 04 Illustration language | Produce studies and painting detail | [Open](https://chatgpt.com/library?file_id=libfile_cd2a82403ea88191b6c3a0c26016c008&account_id=personal) |
| 05 Desktop Today and detail | Two-pane shopping and detail layout | [Open](https://chatgpt.com/library?file_id=libfile_752a203f62f08191b7ef1761ef6a8975&account_id=personal) |
| 06 Mobile variety finder | Phone filters and open variety rows | [Open](https://chatgpt.com/library?file_id=libfile_2770fbf75158819187ab9aa18e948211&account_id=personal) |
| 07 Mobile seasonal calendar | Month-based seasonal list | [Open](https://chatgpt.com/library?file_id=libfile_3400819a5d5881918a630c0ebbe0711f&account_id=personal) |
| 08 Standard, dark, and in-store | Proposed mode adaptations | [Open](https://chatgpt.com/library?file_id=libfile_5f13cfb0403881918fd69ed1cde48277&account_id=personal) |

The calendar study is a phone list, not an approved exact heatmap or season-strip mapping. The mode study does not establish measured accessibility compliance. Mockups sometimes use italic practical text or place search differently; implement the documented functional type and navigation behavior instead of copying those deviations.

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

## 12. Resume here

A future agent should read this document and check for later explicit user decisions. Images are optional: sections 7 and 8 provide a standalone description and prompt pack. When available, the approved Today synthesis and reviewed studies can improve continuity. Do not assume that described components, tokens, a component gallery, or a production asset collection have already been implemented.

For a new graphics request, choose the appropriate complete prompt in section 8, fill subject and composition details, and apply the section 11 review criteria. For code, reuse the documented tokens and interaction rules and verify the actual browser result. Keep painting, layout, typography, and content separable so one can be refined without recreating everything.

The immediate task completed by version 1.1 is strengthening this single reference document; it does not generate another image or approve previous draft studies. Continue with the user’s next specific request.

### Change record

| Version | Change |
| --- | --- |
| 1.0 | Codifies the approved synthesis, subtle verdict preference, implementation baselines, asset guidance, and reference-development workflow |
| 1.1 | Adds reference-free art direction, painting and composition recipes, portable image prompts, reconstruction review criteria, and an index of eight generated draft studies |


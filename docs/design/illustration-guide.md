# Orchard Editorial Illustration Guide
## Painted artwork and generated reference images

Split from the design system in v1.2 (Nov 16, 2026). Section numbers are kept from the original document. [design-system.md](design-system.md) governs the interface and tokens; this guide governs painted produce artwork, header art and generated visual studies. Review every output against the checklist in [design-system.md §11](design-system.md#11-reference-collection-and-acceptance-criteria).

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

Textual art direction supports a similar family of graphics, not pixel-identical reproduction across models. A useful later reconstruction test is to give an agent only this document and ask for one new produce thumbnail and one small interface study. Review those against the checklist in design-system.md section 11 before treating new output as an approved reference. This revision does not claim that such an independent test has been run.

Do not add prices, health claims, provenance, freshness dates, confidence claims, or functional controls just to make a picture seem complete. Use identified illustrative content where production data is unavailable. Exact charts and numerical mappings must come from real data and appropriate rendering tools, not an image model’s invented values.

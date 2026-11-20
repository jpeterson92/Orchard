# Art batch 1: item and variety thumbnails

Three items and their rated varieties, for 13 thumbnails. Use the [Codex illustrator prompt](../PROMPT.md) to pick the next request. The style text follows illustration guide §2 A.

**For every asset**

- Use the matching prompt below. Carry a processed pilot or approved master forward as the visual reference for related subjects.
- Export: square, 1024 × 1024, PNG, with the image tool's **transparent background** setting on (asking in the prompt alone doesn't make the file transparent).
- Save each usable result as `art/masters/<asset id>.png`. Run `npm run art:process` once for the step. It checks transparency, size and crop safety, writes the sizes the app uses, and builds a contact sheet (`.cache/art/contact-sheet.html`) showing each asset over ivory and warm charcoal.
- Review from the contact sheet for the botanical checks below, white halos, hard rectangular edges, clipped leaves, and pale haze. Jared names the assets to approve or redo. A redo gets a targeted revision prompt from guide §2 F.
- Variety sets: the same framing, apparent scale and light across each set, so varieties differ only by real traits. Check each cultivar against a reference photo; the image model's idea of a variety can be wrong.

## Apple review decision

Jared approved the latest apple candidate for each of the seven subjects: `apples-thumbnail-v2`, `apples-honeycrisp-thumbnail-v3`, `apples-gala-thumbnail-v3`, `apples-fuji-thumbnail-v2`, `apples-granny-smith-thumbnail-v2`, `apples-pink-lady-thumbnail-v2`, `apples-cosmic-crisp-thumbnail-v2`. Earlier revisions remain available for comparison.

## `apples-thumbnail-v1`

Item thumbnail · shown at 72 px on Today, up to 320 px on the item page

> Create a naturalistic botanical watercolor of an apple, composed as one whole specimen with a single leaf on its stem. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: a round red apple whose streaky red blush lets a yellow-green ground show through; short woody stem set in a shallow cavity; small pale lenticel dots; one green leaf with a finely serrated edge. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Reads as an apple in general, not one recognizable cultivar
- Stem in a cavity; a dimpled calyx end if visible
- Leaf is an apple leaf (oval, finely serrated), not a citrus leaf

Pilot generation used Orchard's [illustration-language sheet](../../docs/design/references/04-illustration-language.png) as the paint reference. The prompt centered the fruit at roughly three-quarters of the canvas width with clear margins and specified a single leaf, genuine transparency, and no cast shadow.

## `apples-thumbnail-v2`

Style review stage 1 · targeted revision of `apples-thumbnail-v1` · 72 px list and 320 px item page · square transparent PNG ≥1024 px.

**Review of v1:** The silhouette reads well at 72 px, but the leaf competes with the fruit. The thick cut stem and bright stepped highlight make the painting feel more polished than the guide’s restrained watercolor.

> Targeted edit for Orchard asset apples-thumbnail-v2. Image 1 is the existing Orchard apples-thumbnail-v1 master and the edit target. Reduce the leaf’s apparent area by roughly one third. Keep it recognizably oval and finely serrated with quiet olive-green washes and fine veins. Give the fruit a short, slim woody pedicel seated in its cavity, and show the leaf attached by its own slender petiole to a tiny adjacent spur, with the junction understated. Soften the bright segmented highlight to a few irregular warm reserved-light marks, and merge a few of the boldest red stripes into broader overlapping washes. Preserve the round silhouette, clear warm red blush, patches of yellow-green ground, and gently elevated view. Preserve the approximate placement, apparent fruit scale, gentle three-quarter view and soft upper-left light. Make this a luminous, naturalistic botanical watercolor with visible wash construction, selectively detailed skin, and a clear contour with a few soft pigment edges. Keep the whole single specimen isolated on genuine transparent alpha with generous clear margins. Deliver a square PNG at least 1024 px on each side, with no paper patch, halo, cast shadow, added objects, stickers or lettering. Check that the intended features are clear at 72 px list and 320 px item page.

**Result:** The smaller leaf gives the fruit more visual weight at 72 px. A finer stem and broader, less repetitive red washes carry through at 320 px.

## `apples-honeycrisp-thumbnail-v1`

Variety thumbnail · shown at 48 px in Varieties now on the item page

> Create a naturalistic botanical watercolor of a Honeycrisp apple, composed as one whole specimen. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: large, broad, round to slightly conical; bright red mottled and striped blush over a yellow ground, with patches of yellow showing; small pale lenticels; short stem. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Mottled, striped red over yellow, not solid dark red
- Large and broad, not small or elongated

Subject reference: [Washington Apple Commission specimen photo](https://waapple.org/wp-content/uploads/2021/06/Untitled-design-20-e1745534545813-550x550.png). The first-pass prompt used the item apple master for the paint, view, and light. It called for a leafless fruit with broad shoulders, separate patches of exposed creamy yellow, and a body about 73% of the canvas width.

**Touch-up:** At 48 px the fruit dominates the lineup. If revised, reduce the fruit from about 81% of the canvas width to about 74–75%, keeping it the largest of the set.

## `apples-honeycrisp-thumbnail-v2`

Targeted revision of `apples-honeycrisp-thumbnail-v1` · 48 px variety thumbnail · square PNG ≥1024 px with transparent background enabled. Use the Honeycrisp v1 master as the edit target.

> Targeted edit for Orchard asset apples-honeycrisp-thumbnail-v2. Image 1 is the Honeycrisp v1 edit target. Change only the scale of the existing painting within the square canvas. Uniformly reduce the entire apple and stem to approximately 92% of their current size around the same center. The apple body should span about 74–75% of the canvas width, leaving roughly one eighth of the canvas clear on each side. Preserve the broad round profile, short stem and cavity, bright mottled red patches and streaks over pale yellow, lenticels, soft upper-left light, and every other aspect of the existing botanical watercolor. Maintain comfortable legibility at 48 px. Deliver a square PNG at least 1024 px on each side with genuine clear alpha, generous margins, and no foliage, cast shadow, paper, lettering or extra elements.

Review result: v2 reduces the fruit from about 81% to 74% of canvas width and keeps the broad shape and red-over-yellow mottling legible at 48 px over ivory and warm charcoal. Both versions are available for review.

## `apples-honeycrisp-thumbnail-v3`

Style review stage 2 · targeted revision of `apples-honeycrisp-thumbnail-v2` · 48 px variety thumbnail · square transparent PNG ≥1024 px.

**Review of v2:** The broad silhouette and scale work at 48 px. At 320 px, the strong white reflection and sharp transitions around the bright yellow patches make the red wash feel glossier and more graphic than Orchard’s revised pilot.

> Targeted edit for Orchard asset apples-honeycrisp-thumbnail-v3. Image 1 is the existing Orchard apples-honeycrisp-thumbnail-v2 master and the edit target. Preserve the broad round shape, current placement, and body width of about three quarters of the canvas. Retain several separate creamy-yellow islands amid the bright warm red, distinct from Gala’s longer stripes. Soften the stark reflection into a few irregular warm reserved-light marks. Build the mottled blush with loosely overlapping translucent red washes and varied soft boundaries, retaining enough contrast to read at 48 px. Replace the stout cut stem with a short, slightly bent, slender brown stem seated in the same cavity. Keep the existing hue relationships and keep the fruit the largest in the set. Preserve one leafless specimen, a gentle elevated three-quarter view, soft upper-left light, lightly varied watercolor edges, and selective painted skin detail. Deliver square PNG at least 1024 px on each side with clear alpha and crop safety. No paper, halo, cast shadow, foliage, text, or sticker. Check readability at 48 px and the paint surfaces at 320 px.

**Result:** The revised fruit holds its size at about 75% of canvas width. The softer red-over-yellow mottling and less prominent stem read at 48 px on both backgrounds.

## `apples-gala-thumbnail-v1`

Variety thumbnail · shown at 48 px in Varieties now on the item page

> Create a naturalistic botanical watercolor of a Gala apple, composed as one whole specimen. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: small to medium, round-conical; pinkish-orange to red stripes and blush over a golden-yellow ground, the stripes clearly visible; thin stem. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Visible stripes over golden-yellow
- Smaller than the Honeycrisp, with the same framing and light

Subject reference: [Washington Apple Commission specimen photo](https://waapple.org/wp-content/uploads/2021/06/Variety_Gala-transparent-550x550.png). The first-pass prompt used the item apple master for the paint, view, and light. It called for a leafless fruit with a dominant golden ground, fine curved coral stripes, and a body about 63% of the canvas width.

**Touch-up:** At 48 px the fruit reads about 26 px wide. If revised, bring the fruit from about 53% to about 63% of the canvas width and give it a finer stem. Keep it smaller than Honeycrisp and preserve the gold ground and coral stripes.

## `apples-gala-thumbnail-v2`

Targeted revision of `apples-gala-thumbnail-v1` · 48 px variety thumbnail · square PNG ≥1024 px with transparent background enabled. Use the Gala v1 master as the edit target and its specimen reference for identity.

> Targeted edit for Orchard asset apples-gala-thumbnail-v2. Image 1 is the Gala v1 edit target. Change exactly two things. First, enlarge the whole apple uniformly around the existing visual center by approximately 19 percent, from 53 percent to about 63 percent of the square canvas width. Leave wide clear margins. Second, replace the prominent stout cut stem with a slender naturally tapered brown Gala pedicel: about half the current thickness and a little shorter, with an irregular narrow tip. Keep it seated in the same stem cavity at the same angle. Preserve the exact cultivar silhouette and proportions of the fruit body, golden-yellow ground, coral-pink vertical stripes, pale lenticels, upper-left light, watercolor granulation, soft edge and leafless composition. Keep the existing paint and colors closely matched. Deliver one centered square transparent PNG at least 1024 px per side with genuine alpha around the complete silhouette and no paper, shadow, additional objects or text. Maintain thumbnail readability at 48 px.

Review result: v2 has a finer stem and increases fruit width from about 53% to 57% of the canvas. The golden ground and coral stripes remain legible at 48 px over ivory and warm charcoal. Both versions are available for review.

**Touch-up:** With Honeycrisp v2 at 74% width, Gala v2 still reads small across the lineup at 57%. Bring Gala v2 toward the original 63% target and retain its finer stem. This would bring Gala from about 27 px to about 30 px on the 48 px tile, below Honeycrisp v2 at about 36 px.

## `apples-gala-thumbnail-v3`

Style review stage 2 · targeted revision of `apples-gala-thumbnail-v2` · 48 px variety thumbnail · square transparent PNG ≥1024 px.

**Review of v2:** The warmer gold ground and finer stem are working. The 57% body width makes Gala look small even after Honeycrisp’s scale correction. Long, hard-edged stripes look a little too regular at 320 px.

> Targeted edit for Orchard asset apples-gala-thumbnail-v3. Image 1 is the existing Orchard apples-gala-thumbnail-v2 master and the edit target. Increase the whole centered specimen uniformly by about 11%, bringing fruit width from 57% to 63% of the square canvas (about 30 px of a 48 px tile), with approximately 18–19% clear margin to each side. Keep the thin, gently angled stem and round-conical silhouette. Preserve the dominant golden-yellow ground and coral-pink vertical stripes. Soften selected stripe edges and break up a few of the most uniform strokes with translucent overlapping washes so the skin remains clearly striped and has more natural variation. Reduce the hard white reflection while retaining a small warm highlight. Keep the fruit visually smaller than Honeycrisp. Preserve one leafless specimen, a gentle elevated three-quarter view, soft upper-left light, lightly varied watercolor edges, and selective painted skin detail. Deliver square PNG at least 1024 px on each side with clear alpha and crop safety. No paper, halo, cast shadow, foliage, text, or sticker. Check readability at 48 px and the paint surfaces at 320 px.

**Result:** The fruit reaches 63% of canvas width, up from 57%, with softer coral stripes over gold. The stem stays slender at its base, though the tip is a little heavier than v2 at 320 px.

## `apples-fuji-thumbnail-v1`

Variety thumbnail · shown at 48 px in Varieties now on the item page

> Create a naturalistic botanical watercolor of a Fuji apple, composed as one whole specimen. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: medium-large, round, sometimes slightly lopsided; dull pinkish-red stripes and speckled blush over a yellow-green ground; matte rather than glossy skin; a touch of russet around the stem. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Muted pinkish-red streaks with yellow-green showing
- Not glossy, not uniformly red

Subject reference: [Washington Apple Commission specimen photo](https://waapple.org/wp-content/uploads/2021/06/Untitled-design-16-e1745533584723-550x550.png). The first-pass prompt used the item apple master for the paint, view, and light. It called for a leafless fruit with a dusty rose blush, yellow-green ground at the shoulder and flank, and a body about 69% of the canvas width.

## `apples-fuji-thumbnail-v2`

Style review stage 2 · targeted revision of `apples-fuji-thumbnail-v1` · 48 px variety thumbnail · square transparent PNG ≥1024 px.

**Review of v1:** The muted rose and yellow-green distinguish Fuji from the warmer apples. At 48 px the low contrast flattens the form, and at 320 px the stem looks like a thick cut twig.

> Targeted edit for Orchard asset apples-fuji-thumbnail-v2. Image 1 is the existing Orchard apples-fuji-thumbnail-v1 master and the edit target. Preserve the medium-large round and slightly asymmetric silhouette, the current centered framing and roughly 68–69% body width. Add a gentle shadow wash of dusty pink-red on the lower-right side to clarify volume at 48 px. Keep the highlights diffuse and matte. Retain fine broken rose streaks and clear pale yellow-green along the shoulder and flank. Stay quieter and more finely streaked than Pink Lady’s broad, brighter pink blush. Use a shorter, naturally tapered brown stem, and a small warm russet wash at the stem cavity. Keep the watercolor soft and luminous with restrained granulation. Preserve one leafless specimen, a gentle elevated three-quarter view, soft upper-left light, lightly varied watercolor edges, and selective painted skin detail. Deliver square PNG at least 1024 px on each side with clear alpha and crop safety. No paper, halo, cast shadow, foliage, text, or sticker. Check readability at 48 px and the paint surfaces at 320 px.

**Result:** The fruit holds at about 68% width and has stronger rose shading on the lower right. The stem is much shorter, though the cut tip remains apparent at 320 px. The matte rose and yellow-green skin still read at 48 px.

## `apples-granny-smith-thumbnail-v1`

Variety thumbnail · shown at 48 px in Varieties now on the item page

> Create a naturalistic botanical watercolor of a Granny Smith apple, composed as one whole specimen. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: medium, round; bright uniform grass-green skin with distinct small pale lenticel dots; no red blush; light natural sheen. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Uniform bright green, no red
- Pale lenticel dots visible

Subject reference: [Washington Apple Commission specimen photo](https://waapple.org/wp-content/uploads/2021/06/Variety_Granny-Smith-transparent-550x550.png). The pilot prompt used the item apple master for paint, view, light, and scale, and specified a short stem in the cavity, no foliage, and no pink blush.

## `apples-granny-smith-thumbnail-v2`

Style review stage 1 · targeted revision of `apples-granny-smith-thumbnail-v1` · 48 px variety thumbnail · square transparent PNG ≥1024 px.

**Review of v1:** The green fruit reads immediately. Its yellow-lime highlight is close to fluorescent, and the white segmented reflection and thick stem are more conspicuous than the watercolor modeling.

> Targeted edit for Orchard asset apples-granny-smith-thumbnail-v2. Image 1 is the existing Orchard apples-granny-smith-thumbnail-v1 master and the edit target. Replace the most fluorescent yellow-lime areas with a believable fresh apple green. Keep it bright, using a pale yellow-green lit side, a broad clean grass-green midtone, and restrained cooler green shadow. Replace the hard white highlight with smaller irregular pale green reserved-light marks. Describe the volume with broad overlapping transparent washes, slight granulation, and a few irregular small pale lenticels. Make the existing woody stem shorter and more slender, seated in the same cavity. Preserve the round silhouette, bright all-green skin, scale, and leafless composition. Preserve the approximate placement, apparent fruit scale, gentle three-quarter view and soft upper-left light. Make this a luminous, naturalistic botanical watercolor with visible wash construction, selectively detailed skin, and a clear contour with a few soft pigment edges. Keep the whole single specimen isolated on genuine transparent alpha with generous clear margins. Deliver a square PNG at least 1024 px on each side, with no paper patch, halo, cast shadow, added objects, stickers or lettering. Check that the intended features are clear at 48 px variety thumbnail.

**Result:** A cooler, less fluorescent green and smaller highlight marks keep the fruit bright at 48 px. The stem is finer and the layered green washes read at 320 px.

## `apples-pink-lady-thumbnail-v1`

Variety thumbnail · shown at 48 px in Varieties now on the item page

> Create a naturalistic botanical watercolor of a Pink Lady (Cripps Pink) apple, composed as one whole specimen. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: medium, slightly elongated and oval; a clear pink to rosy-red blush over a yellow-green ground, the blush patchy rather than all over. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Pink tone, not deep red
- Slightly taller than wide

Subject references: [Washington Apple Commission specimen photo](https://waapple.org/wp-content/uploads/2021/06/Untitled-design-15-e1745532495692-550x550.png) and [Golden Bay Fruit cultivar profile](https://www.goldenbayfruit.com/our-fruit/our-varieties/pink-lady/). The first-pass prompt used the item apple master for the paint, view, and light. It called for a leafless fruit about 5–10% taller than wide, with a short, slender stem, a clear rosy blush in broad irregular patches, and pale yellow-green visible on one flank. The body was to fill about 65–68% of the canvas width.

## `apples-pink-lady-thumbnail-v2`

Style review stage 3 · targeted revision of `apples-pink-lady-thumbnail-v1` · 48 px variety thumbnail · square transparent PNG ≥1024 px.

**Review of v1:** The taller body and broad rose-pink blush distinguish Pink Lady from Fuji at 48 px. At 320 px, the saturated pink, segmented white reflection, and conspicuous cut stem look more polished than the style guide calls for.

> Targeted edit for Orchard asset apples-pink-lady-thumbnail-v2. Image 1 is the existing Pink Lady master and the edit target. Preserve the gently tapered oval body, slightly taller than wide, centered at about 66% of canvas width, and the existing soft upper-left light. Keep the defining bright rose-pink blush over a visible pale yellow-green flank. Make the strongest magenta areas a more natural warm rose, still distinctly brighter than Fuji, and build the blush in broad translucent washes with softly irregular transitions, no pronounced stripes. Replace the hard segmented white reflection with small, broken warm highlights integrated into the wash. Use a finer, slightly shorter, irregular brown stem seated in the same cavity. Keep a few discreet pale lenticels and a softly varied pigment edge. Retain clear shape and color at 48 px and watercolor detail at 320 px. Deliver a square PNG at least 1024 px on each side with real transparent alpha and generous clear margins. No foliage, paper, halo, cast shadow, text, stickers, or other objects.

**Result:** The softer highlight and broader rose washes preserve Pink Lady’s stronger blush beside Fuji at 48 px. The elongated fruit holds at about 67% of canvas width and the stem is finer and shorter. Its cut tip is still visible at 320 px. Both versions are available for review.

## `apples-cosmic-crisp-thumbnail-v1`

Variety thumbnail · shown at 48 px in Varieties now on the item page

> Create a naturalistic botanical watercolor of a Cosmic Crisp apple, composed as one whole specimen. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: medium-large, round; deep dark purplish-red skin almost all over; conspicuous pale yellow lenticels scattered like small stars; a faint bloom. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Darkest red of the set, nearly uniform
- Pale star-like lenticels clearly visible

Subject references: [Cosmic Crisp specimen photo](https://cosmiccrisp.com/wp-content/uploads/2023/03/organic-apple.webp) and [Washington State University's WA 38 description](https://archive.news.wsu.edu/press-release/2014/05/21/wsu-announces-the-name-for-its-stellar-new-apple/). The pilot prompt used the item apple master for paint, view, light, and scale, and specified a short stem in the cavity, no foliage, and very limited green-yellow ground.

## `apples-cosmic-crisp-thumbnail-v2`

Style review stage 1 · targeted revision of `apples-cosmic-crisp-thumbnail-v1` · 48 px variety thumbnail · square transparent PNG ≥1024 px.

**Review of v1:** The burgundy color separates this cultivar from the other apples. On charcoal, the dark side loses some definition at 48 px, while the straight pale streaks and evenly spaced bright pores feel mechanical at 320 px.

> Targeted edit for Orchard asset apples-cosmic-crisp-thumbnail-v2. Image 1 is the existing Orchard apples-cosmic-crisp-thumbnail-v1 master and the edit target. Keep the apple deep wine red to burgundy overall, with a little muted plum in the shadows. Lift the deepest shadow subtly with a broad thin burgundy wash so the contour stays legible on warm charcoal. Soften the streaky upper-left reflection and trade regular pinpoints for a natural scatter of tiny pale cream lenticels of varied size and contrast, with a few brighter ones visible in the midtone at small size. Use a shorter, finer, naturally tapered stem in the same cavity. Preserve the round to slightly conical outline, broad shoulders, dark cultivar color, scale and balance. Keep yellow-green limited to the cavity. Preserve the approximate placement, apparent fruit scale, gentle three-quarter view and soft upper-left light. Make this a luminous, naturalistic botanical watercolor with visible wash construction, selectively detailed skin, and a clear contour with a few soft pigment edges. Keep the whole single specimen isolated on genuine transparent alpha with generous clear margins. Deliver a square PNG at least 1024 px on each side, with no paper patch, halo, cast shadow, added objects, stickers or lettering. Check that the intended features are clear at 48 px variety thumbnail.

**Result:** The burgundy silhouette reads on both backgrounds and the softer highlights and varied lenticels look more natural at 320 px. The darkest edge and the smallest lenticels remain subtle at 48 px.

## `strawberries-thumbnail-v1`

Item thumbnail · shown at 72 px on Today, up to 320 px on the item page

> Create a naturalistic botanical watercolor of strawberries, composed as a compact pair, one berry facing forward and one turned slightly. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: glossy bright red conical berries with small yellow achenes set in shallow pits over the whole surface; a fresh green leafy calyx of pointed sepals; red right up to the shoulders under the calyx. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Achenes sit in shallow pits, evenly spread over the surface
- Red to the shoulders, no white or green shoulders
- Calyx fresh green, not dry

## `mandarins-thumbnail-v1`

Item thumbnail · shown at 72 px on Today, up to 320 px on the item page

> Create a naturalistic botanical watercolor of a mandarin, composed as a whole specimen with two peeled segments in front. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: one whole flattened deep-orange mandarin with fine-pitted skin, a short stem and two glossy dark-green leaves; two peeled segments in front showing the thin translucent membrane and fine juice vesicles. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Fruit is flattened (wider than tall) and deep orange
- Segments show citrus anatomy: membrane and juice vesicles
- Leaves are glossy, pointed citrus leaves

## `mandarins-clementine-thumbnail-v1`

Variety thumbnail · shown at 48 px in Varieties now on the item page

> Create a naturalistic botanical watercolor of a clementine mandarin, composed as one whole specimen with a short stem and one leaf. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: small, slightly flattened, deep orange; smooth glossy skin with fine pores; a short stem with one glossy citrus leaf. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Smallest citrus of the set, smooth glossy skin
- Slightly flattened, deep orange

## `mandarins-w-murcott-thumbnail-v1`

Variety thumbnail · shown at 48 px in Varieties now on the item page

> Create a naturalistic botanical watercolor of a W. Murcott mandarin, composed as one whole specimen. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: medium, clearly flattened, deep reddish-orange; thin smooth skin with fine pitting; a short stem button. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Redder orange than the clementine
- Flattened shape, smooth thin skin

## `mandarins-minneola-thumbnail-v1`

Variety thumbnail · shown at 48 px in Varieties now on the item page

> Create a naturalistic botanical watercolor of a Minneola tangelo, composed as one whole specimen. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: medium-large, bright reddish-orange; a distinct protruding neck (knob) at the stem end; smooth to slightly pebbled skin. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- The neck at the stem end is clearly visible
- Larger than the mandarins, reddish-orange

## `mandarins-gold-nugget-thumbnail-v1`

Variety thumbnail · shown at 48 px in Varieties now on the item page

> Create a naturalistic botanical watercolor of a Gold Nugget mandarin, composed as one whole specimen. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: medium, slightly flattened; deep yellow-orange; rough, bumpy, pebbled skin. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Rough pebbled skin, its main visible trait
- Yellow-orange rather than red-orange

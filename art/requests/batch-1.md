# Art batch 1: item and variety thumbnails

The three drafted items and their rated varieties: 13 thumbnails. The workflow is the engineering plan's art track (§5); the style text is illustration guide §2 A, unchanged across the batch.

**For every asset**

- Use one ChatGPT conversation for the whole batch, so the style stays consistent. Paste each prompt as it is.
- Export: square, 1024 × 1024, PNG, with the image tool's **transparent background** setting on (asking in the prompt alone doesn't make the file transparent).
- Save each result as `art/masters/<asset id>.png`, then run `npm run art:process`. It checks transparency, size and crop safety, writes the sizes the app uses, and builds a contact sheet (`.cache/art/contact-sheet.html`) showing each asset over ivory and warm charcoal.
- Review from the contact sheet: the botanical checks below, plus no white halo, hard rectangular edge, clipped leaf or pale haze. Tell Claude which to approve and which to redo; a redo gets a targeted revision prompt (guide §2 F) in the next batch.
- Variety sets: the same framing, apparent scale and light across each set, so varieties differ only by real traits. Check each cultivar against a reference photo; the image model's idea of a variety can be wrong.

## `apples-thumbnail-v1`

Item thumbnail · shown at 72 px on Today, up to 320 px on the item page

> Create a naturalistic botanical watercolor of an apple, composed as one whole specimen with a single leaf on its stem. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: a round red apple whose streaky red blush lets a yellow-green ground show through; short woody stem set in a shallow cavity; small pale lenticel dots; one green leaf with a finely serrated edge. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Reads as an apple in general, not one recognizable cultivar
- Stem in a cavity; a dimpled calyx end if visible
- Leaf is an apple leaf (oval, finely serrated), not a citrus leaf

## `apples-honeycrisp-thumbnail-v1`

Variety thumbnail · shown at 48 px in Varieties now on the item page

> Create a naturalistic botanical watercolor of a Honeycrisp apple, composed as one whole specimen. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: large, broad, round to slightly conical; bright red mottled and striped blush over a yellow ground, with patches of yellow showing; small pale lenticels; short stem. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Mottled, striped red over yellow, not solid dark red
- Large and broad, not small or elongated

## `apples-gala-thumbnail-v1`

Variety thumbnail · shown at 48 px in Varieties now on the item page

> Create a naturalistic botanical watercolor of a Gala apple, composed as one whole specimen. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: small to medium, round-conical; pinkish-orange to red stripes and blush over a golden-yellow ground, the stripes clearly visible; thin stem. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Visible stripes over golden-yellow
- Smaller than the Honeycrisp, with the same framing and light

## `apples-fuji-thumbnail-v1`

Variety thumbnail · shown at 48 px in Varieties now on the item page

> Create a naturalistic botanical watercolor of a Fuji apple, composed as one whole specimen. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: medium-large, round, sometimes slightly lopsided; dull pinkish-red stripes and speckled blush over a yellow-green ground; matte rather than glossy skin; a touch of russet around the stem. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Muted pinkish-red streaks with yellow-green showing
- Not glossy, not uniformly red

## `apples-granny-smith-thumbnail-v1`

Variety thumbnail · shown at 48 px in Varieties now on the item page

> Create a naturalistic botanical watercolor of a Granny Smith apple, composed as one whole specimen. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: medium, round; bright uniform grass-green skin with distinct small pale lenticel dots; no red blush; light natural sheen. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Uniform bright green, no red
- Pale lenticel dots visible

## `apples-pink-lady-thumbnail-v1`

Variety thumbnail · shown at 48 px in Varieties now on the item page

> Create a naturalistic botanical watercolor of a Pink Lady (Cripps Pink) apple, composed as one whole specimen. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: medium, slightly elongated and oval; a clear pink to rosy-red blush over a yellow-green ground, the blush patchy rather than all over. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Pink tone, not deep red
- Slightly taller than wide

## `apples-cosmic-crisp-thumbnail-v1`

Variety thumbnail · shown at 48 px in Varieties now on the item page

> Create a naturalistic botanical watercolor of a Cosmic Crisp apple, composed as one whole specimen. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling, and selective fine detail in skin, stems, seeds, or veins. Keep the silhouette recognizable, with a few softly broken pigment edges rather than a heavy outline. Preserve true anatomy and natural color: medium-large, round; deep dark purplish-red skin almost all over; conspicuous pale yellow lenticels scattered like small stars; a faint bloom. Use restrained botanically appropriate foliage. The fruit or vegetable is the focal point. Leave crop safety around the subject. Deliver genuinely transparent isolated artwork, with no paper rectangle, tabletop, horizon, lettering, border, or long cast shadow. Avoid photorealistic plastic gloss, flat cartoon rendering, heavy black outlines, and uniform blur. The intended identity is a warm contemporary illustrated produce journal. It must read clearly at 72 px as a list thumbnail and at 320 px beside an item page.

Botanical checks:

- Darkest red of the set, nearly uniform
- Pale star-like lenticels clearly visible

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

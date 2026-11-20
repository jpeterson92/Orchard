# Oranges and grapefruit illustration batch

Scope is the Oranges item, Navel, Blood orange, Valencia, and the Grapefruit item. The first step covers the first three. The second step covers Valencia and the Grapefruit item.

The production target is a square PNG of at least 1024 px with genuine alpha. The accepted assets and integration instructions are recorded below.

## Accepted assets

Jared accepted all five v2 candidates. Use these files and manifest entries for integration. The v1 files remain available for comparison.

At integration, add the selected entries, copy the PNGs to their intended master paths, and run the art processor for the 160, 320, and 640 px WebPs. Confirm the canonical manifest records the approval after export.

- [oranges-thumbnail-v2](oranges-thumbnail-v2.png) — `{"id":"oranges-thumbnail-v2","item":"oranges","role":"thumbnail","alt":"A whole orange with a green leaf and a cut orange wedge","revision":2,"status":"approved"}`
- [oranges-navel-thumbnail-v2](oranges-navel-thumbnail-v2.png) — `{"id":"oranges-navel-thumbnail-v2","item":"oranges","variety":"navel","role":"thumbnail","alt":"A deep orange Navel orange showing its blossom-end navel","revision":2,"status":"approved"}`
- [oranges-blood-thumbnail-v2](oranges-blood-thumbnail-v2.png) — `{"id":"oranges-blood-thumbnail-v2","item":"oranges","variety":"blood","role":"thumbnail","alt":"A whole blood orange and a cut half showing deep crimson segments","revision":2,"status":"approved"}`
- [oranges-valencia-thumbnail-v2](oranges-valencia-thumbnail-v2.png) — `{"id":"oranges-valencia-thumbnail-v2","item":"oranges","variety":"valencia","role":"thumbnail","alt":"A Valencia orange with a green patch near the stem and a cut half","revision":2,"status":"approved"}`
- [grapefruit-thumbnail-v2](grapefruit-thumbnail-v2.png) — `{"id":"grapefruit-thumbnail-v2","item":"grapefruit","role":"thumbnail","alt":"A yellow grapefruit with a cut half showing rose-pink segments","revision":2,"status":"approved"}`

## References and shared generation prompt

The built-in image generator received [04-illustration-language.png](../../../docs/design/references/04-illustration-language.png), with its mandarin as the citrus style reference. The apple pilot and a staged mandarin were unavailable at dispatch. The [illustration guide](../../../docs/design/illustration-guide.md) supplies the production treatment. [Oranges catalog](../../../content/items/oranges.yaml) supplies the item and variety IDs.

> Paint a single isolated Orchard produce thumbnail as a naturalistic botanical watercolor. The reference sheet supplies paint handling only, especially its mandarin: luminous layered washes, gentle granulation, selective dry-brush detail, small pigment pools, soft edges, restrained olive foliage. Use a gently elevated three-quarter view, diffuse upper-left light and readable broad color masses. Center the compact artwork on a 1024×1024 square, with at least 10% clear margin on all sides. Deliver genuine transparency outside the subject. Exclude paper texture outside the painted fruit, ground shadows, lettering, borders, strong outlines and gloss.

Each generation appended its subject paragraph below to the shared prompt. Transparency was enabled for all three calls.

## Oranges item

- Manifest entry `{"id":"oranges-thumbnail-v1","item":"oranges","role":"thumbnail","alt":"A whole orange with a green leaf and a cut orange wedge","revision":1,"status":"requested"}`
- Intended master `art/masters/oranges-thumbnail-v1.png`
- Display at 72 px on Today and up to 320 px on the item page.
- Checked traits include a round sweet-orange profile, a gently pebbled orange rind and orange flesh. [UC Riverside sweet-orange accession](https://citrusvariety.ucr.edu/crc3754)

> Paint one whole round orange-colored sweet orange with a gently stippled golden-orange rind and a short stem with one olive-green citrus leaf. Bring a small rind-on orange wedge close against its lower right, exposing warm orange radial segments and a thin pale pith. Preserve a spherical, taller silhouette, distinct from the reference mandarin’s flattened profile. Readable at 72 px and 320 px.

## Navel

- Manifest entry `{"id":"oranges-navel-thumbnail-v1","item":"oranges","variety":"navel","role":"thumbnail","alt":"A deep orange Navel orange showing its blossom-end navel","revision":1,"status":"requested"}`
- Intended master `art/masters/oranges-navel-thumbnail-v1.png`
- Display at 48 px in the variety row.
- Checked traits include a round to slightly oval profile, deep-orange pebbled rind and a secondary fruit at the blossom end. [UC Riverside Washington navel accession](https://citrusvariety.ucr.edu/crc1241B)

> Paint one large, round to slightly oval Washington-type Navel orange, deep orange with a subtly coarse pebbled rind. Turn the blossom end toward the viewer in a mildly oblique three-quarter view. Show the small tucked secondary-fruit navel in a shallow irregular cleft at the blossom end, opposite the stem; leave foliage off to keep the navel in focus. Readable at 48 px.

## Blood orange

- Manifest entry `{"id":"oranges-blood-thumbnail-v1","item":"oranges","variety":"blood","role":"thumbnail","alt":"A whole blood orange and a cut half showing deep crimson segments","revision":1,"status":"requested"}`
- Intended master `art/masters/oranges-blood-thumbnail-v1.png`
- Display at 48 px in the variety row.
- A Moro-type specimen represents this catalog group. Its orange rind can show a reddish blush and the flesh can develop deep red pigmentation. [UC Riverside Moro accession](https://citrusvariety.ucr.edu/crc3811)

> Paint a Moro-type blood orange with one round whole fruit and one transverse half tucked against its lower right. Keep the finely pitted rind orange with irregular restrained red blush. Angle the cross-section toward the viewer so the deep crimson to burgundy flesh, slight orange variation, juice vesicles, thin radial membranes and pale pith rim are visible. One small leaf at most. Readable at 48 px.

## Review notes

All three first-pass candidates are 1254×1254 PNGs with genuine alpha. Each passed `checkMaster` from `scripts/art-lib.ts`. Composited previews on ivory and warm charcoal showed no obvious halo or clipping.

| Staged candidate | Visual check |
| --- | --- |
| [Oranges item](oranges-thumbnail-v1.png) | Round orange with pebbled rind, one leaf and a rind-on wedge. The whole fruit and wedge read at 72 px. |
| [Navel](oranges-navel-thumbnail-v1.png) | Pebbled round specimen with a visible secondary fruit at the blossom end. The navel is small at 48 px and clearer at larger sizes. |
| [Blood orange](oranges-blood-thumbnail-v1.png) | Crimson radial segments, pale pith and orange-red rind read at 48 px. The whole fruit has a broader blush than the prompt specified, consistent with the selected Moro example. |

## Second step references and shared generation prompt

The built-in generator received the [style sheet](../../../docs/design/references/04-illustration-language.png), the checked [staged mandarin](../01b-mandarins-strawberries/mandarins-thumbnail-v1.png), and the checked [apple pilot](../../masters/apples-thumbnail-v1.png), in that order. The final reference was the [staged Oranges item](oranges-thumbnail-v1.png) for Valencia and the [staged Blood orange](oranges-blood-thumbnail-v1.png) for Grapefruit. Transparency was enabled for each call.

> Paint one isolated Orchard produce thumbnail in naturalistic botanical watercolor. Use reference 1 as the general style sheet, reference 2 as the citrus paint treatment, and reference 3 as a guide for softly modeled volume and restrained texture. Use the last image only to match the visual weight of the orange-family thumbnails. Build color with luminous overlapping washes, gentle granulation, selective dry-brush detail and small, irregular highlights. Use diffuse upper-left light, a gently elevated three-quarter view and clear broad color masses. Center the compact arrangement on a square of at least 1024×1024 with roughly 10% clear margin on each side. Deliver genuine transparency outside the subject, with no paper matte, ground shadow, text, frame, contour ink, gloss, or unrelated props.

## Valencia

- Manifest entry `{"id":"oranges-valencia-thumbnail-v1","item":"oranges","variety":"valencia","role":"thumbnail","alt":"A Valencia orange with a green patch near the stem and a cut half","revision":1,"status":"requested"}`
- Intended master `art/masters/oranges-valencia-thumbnail-v1.png`
- Display at 48 px in the variety row.
- Checked traits include occasional regreening at the stem end, a thin rind and some seeds. These traits describe a plausible specimen. [Sunkist Valencia grower sheet](https://www.sunkist.com/wp-content/uploads/sites/3/2015/08/P1786_Valencia_SellSheet_Downloadable.pdf), [Government of Canada fresh fruit specification](https://publications.gc.ca/collections/collection_2019/mdn-dnd/D2-531-10-2018-eng.pdf)

> Paint one whole Valencia orange with one small transverse cut half resting close alongside. The whole fruit is round to slightly oval, predominantly golden orange with a narrow mottled olive-green wash close to the small stem scar, a plausible example of natural regreening on a ripe Valencia. Keep the rind mildly pitted, with no blossom-end navel. Show thin rind and pale pith, orange radial flesh and one or two small cream seeds in the cut half. Use no leaves. Both fruits must read at 48 px.

**Review.** [Staged Valencia PNG](oranges-valencia-thumbnail-v1.png) passed `checkMaster` at 1254×1254 with four-channel RGBA. Checked at 48 and 320 px on ivory and warm charcoal. The green stem patch and orange cut face read at 48 px. The two cream seeds are clearer at the larger size.

## Grapefruit item

- Manifest entry `{"id":"grapefruit-thumbnail-v1","item":"grapefruit","role":"thumbnail","alt":"A yellow grapefruit with a cut half showing rose-pink segments","revision":1,"status":"requested"}`
- Intended master `art/masters/grapefruit-thumbnail-v1.png`
- Display at 72 px on Today and up to 320 px on the item page.
- The [Grapefruit catalog](../../../content/items/grapefruit.yaml) names red grapefruit as the most common group. Rio Red is a representative specimen with a typical grapefruit shape, a rind that can show pink blush, and dark pink flesh. [UC Riverside Rio Red accession](https://citrusvariety.ucr.edu/crc3916)

> Paint a representative Rio Red grapefruit for the general Grapefruit item. Show one broad, slightly flattened round fruit and one large equatorial half tucked in front, cut face clearly visible and angled slightly up. Make the rind mostly golden yellow with a small, irregular warm pink blush, finely pitted, with a creamy pith ring thicker than in the orange reference. Paint wide radial segments of clear coral-rose pink flesh, with a small pale center and naturally spaced membranes. Keep the flesh appreciably lighter and pinker than the blood-orange reference, with no burgundy. Use no leaves. Readable at 72 px and 320 px.

**Review.** [Staged Grapefruit PNG](grapefruit-thumbnail-v1.png) passed `checkMaster` at 1254×1254 with four-channel RGBA. Checked at 72 and 320 px on ivory and warm charcoal. The yellow rind, creamy pith, and coral-pink segments distinguish it from Blood orange. The rind blush covers a wider patch than requested.

## Revision pass, stage 1

[Compare v1 and v2 on ivory and charcoal](review-stage-1.html). Stage 2 below covers Valencia and Grapefruit.

Reviewed the Oranges item, Navel, and Blood orange first at 72 or 48 px and at a larger size, on ivory and warm charcoal. The shared issue was that bright highlights and fine, evenly distributed marks sometimes read as photographic skin or glossy pulp. The apple pilot models volume with broader washes and uses crisp detail selectively.

The built-in generator used each v1 as its edit target, the [apple pilot](../../masters/apples-thumbnail-v1.png) for paint handling, and the [illustration-language sheet](../../../docs/design/references/04-illustration-language.png) for the overall style. Each render used the shared prompt and its subject paragraph below, with transparency enabled. The catalog IDs, role, and display sizes carry over from v1. The approved revision 2 manifest entries are listed under Accepted assets.

> Targeted repaint of reference 1 for an Orchard produce thumbnail. Reference 2 (the Orchard apple pilot) guides broad translucent pigment washes, soft brush transitions, and selective detail. Reference 3 (the Orchard illustration-language sheet) guides watercolor handling and restraint. Preserve the original subject, components, recognizable silhouette, overall visual weight, gently elevated view and diffuse upper-left lighting except for the specified corrections. Keep the fruit solid and luminous with softly modeled paint, slightly broken pigment edges, and clear anatomy. Use a square canvas of at least 1024 px, center all painted elements with about 10% clear margin, and deliver genuine alpha transparency. No paper, cast shadow, text, border, outline, or extra objects.

### `oranges-thumbnail-v2`

- The v1 rind has a hard highlight and high-frequency stippling. The wedge reads as a second object with little overlap, and the leaf and stem draw the eye away from the orange.
- Intended master `art/masters/oranges-thumbnail-v2.png`. Use the v1 alt text.

> Soften the whole orange’s specular white hotspot into a small irregular yellow-orange area of reserved light. Replace the even, dense surface speckling with broad warm gold to orange washes and a few clusters of subtle pores, strongest in the upper light. Make the original single leaf a little shorter and the stem finer, keeping their direction and muted olive color. Nudge the existing rind-on wedge inward so it overlaps the whole fruit naturally at front right and the two read as a compact group at 72 px. Keep the cut flesh natural orange with thin cream membranes.

**Review.** [Staged v2](oranges-thumbnail-v2.png) passed `checkMaster` at 1254×1254 RGBA. Broad golden washes and a finer stem put the emphasis back on the fruit. The more compact wedge placement reads as a single arrangement at 72 px. The cut face still uses crisp, even membranes.

### `oranges-navel-thumbnail-v2`

- The v1 round silhouette works. The blossom-end navel nearly disappears at 48 px, and the broad highlight competes with it.
- Intended master `art/masters/oranges-navel-thumbnail-v2.png`. Use the v1 alt text.

> Lift the blossom-end navel out of the shadow slightly so it reads at 48 px: preserve a small tucked secondary fruit, shift it slightly toward the viewer and use a short interrupted ochre groove and warm lit lip. Keep the surrounding folds shallow and natural, with no deep star-shaped crater. Soften the broad white hotspot and cluster the rind pores selectively over warm golden-orange washes. Preserve one rounded specimen and the original orientation, with no stem or leaf in view.

**Review.** [Staged v2](oranges-navel-thumbnail-v2.png) passed `checkMaster` at 1254×1254 RGBA. The lighter lip separates the secondary fruit from the surrounding fold at 48 px. The rind highlight is softer but still broad, and the rind remains distinctly pebbled.

### `oranges-blood-thumbnail-v2`

- The v1 cut half already identifies the variety at 48 px. The whole fruit's extensive dark-red blush competes with the cross-section and the many white streaks make the flesh look glossy.
- Intended master `art/masters/oranges-blood-thumbnail-v2.png`. Use the v1 alt text.

> Keep the whole Moro-type blood orange, one leaf and the clearly exposed transverse half in their original compact arrangement. Contain the exterior crimson blush to a smaller irregular patch on the lower-right side; the remainder of the peel is orange with broad translucent washes. Paint deep crimson-to-burgundy radial flesh in luminous broad segment washes, with small natural red-orange variations, gently irregular membranes and selective juice-vesicle detail. Reduce hard white flecks and fine streaks across the flesh. Preserve thin cream pith and a small pale center to keep the cross-section legible at 48 px.

**Review.** [Staged v2](oranges-blood-thumbnail-v2.png) passed `checkMaster` at 1254×1254 RGBA. The whole fruit has more orange peel showing and the cut face has broader red washes with fewer white flecks. The remaining blush is still substantial, but the cross-section now supplies the strongest dark red and reads at 48 px on both backgrounds.

## Revision pass, stage 2

[Compare Valencia and Grapefruit v1 and v2](review-stage-1.html#oranges-valencia). The comparison sheet now covers all five subjects.

Reviewed the two remaining v1 assets on ivory and charcoal at their display sizes and alongside the revised Oranges item and Blood orange. The built-in generator used each original as the edit target, with [Oranges v2](oranges-thumbnail-v2.png) and [Blood orange v2](oranges-blood-thumbnail-v2.png) as style references. Transparency was enabled for both. The catalog IDs, role, alt text, and display sizes carry over from v1. The approved revision 2 manifest entries are listed under Accepted assets.

> Repaint the first image as an Orchard botanical watercolor thumbnail. Image 1 is the edit target. Use image 2 for broad, luminous layered washes, soft upper-left light, irregular pigment transitions, and selective rind detail. Use image 3 only as a reference for the cut face's controlled detail and visual weight. Keep the subject, whole fruit plus cut half, compact arrangement, apparent scale and viewpoint from image 1. Keep a square of at least 1024 px with roughly ten percent of clear margin on each side. Export genuine transparency, with no paper matte, cast shadow, text, border or extra objects.

### `oranges-valencia-thumbnail-v2`

- The stem-end green patch and orange cut face identify the intended specimen. The rind hotspot and finely threaded cut face look glossy beside the broader washes of the revised oranges.
- Intended master `art/masters/oranges-valencia-thumbnail-v2.png`.

> Make the round Valencia feel painted by softening the bright white rind glare into broken golden light, layering warm orange washes, and keeping pore marks in a few small clusters. Preserve the muted olive regreening at the stem; make it a softly mottled transition within the orange rind with a clear enough value difference to register at 48 px. Simplify the bright radial threads in the cut face into a few varied soft warm-cream membranes and transparent orange segment washes. Retain a thin rind, small pale center and two natural cream seeds near it. Keep the whole-plus-half silhouette, with no leaves.

**Review.** [Staged v2](oranges-valencia-thumbnail-v2.png) passed `checkMaster` at 1254×1254 RGBA. The broader orange washes and simplified flesh bring it closer to the Oranges revision. The olive patch reads at 48 px on both backgrounds, and two seeds remain visible at larger sizes.

### `grapefruit-thumbnail-v2`

- The v1 pale pith and coral flesh are clear at 72 px. The extensive peel blush competes with the pink cut face. A sharp white rind highlight and dense pale pulp streaks give the fruit a glossy finish.
- Intended master `art/masters/grapefruit-thumbnail-v2.png`.

> Keep the broad Rio Red grapefruit, with golden-yellow rind, rose-coral segments, creamy pith and no leaves. Soften the glossy white rind highlight into a pale yellow wash; group the very fine pores selectively. Confine the red-pink rind blush to a small, broken wash at one shoulder, with sunny yellow dominating. On the cut face, reduce the mass of fine white radiating fibers and use broad alternating coral-rose washes and gently irregular pale segment boundaries, with a few observed juice-vesicle details. Keep the pale pith wide enough and the flesh light enough to distinguish it from Blood orange at 72 px. Preserve the large forward-facing half and the compact overlap.

**Review.** [Staged v2](grapefruit-thumbnail-v2.png) passed `checkMaster` at 1254×1254 RGBA. Broken yellow washes and a smaller shoulder blush put the emphasis on the coral cut face. The cut face has fewer fine streaks and its pale pith reads at 72 px on both backgrounds. The simplified segment edges are more uniform than in v1.

## Revision requested: grapefruit-thumbnail-v2 (Jared, 2026-11-19)

The approved painting was 88% of the canvas wide against 79–85% for the citrus with a cut half. Claude rescaled the master in `art/masters/` (×0.93 about the centre) to 82% so the app matches its family meanwhile. Paint `grapefruit-thumbnail-v3` with the same identifying traits at about 82% width (longer side 75–85% of the canvas), check it on the review sheet beside the family, and hand it off once Jared approves it.

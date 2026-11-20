# Satsuma and Pixie mandarin illustrations

First-pass guide thumbnails for the live `satsuma` and `pixie` varieties of `mandarins`. The staged and canonical artwork folders and the shared manifest were checked for existing candidates before generation. Review and approval belong to Jared.

Both illustrations are intended for 48 px variety rows. Master specification is a square PNG, at least 1024 px per side, with genuine alpha and crop safety. Intended integration exports are 160, 320, and 640 px WebP. The entries below describe the intended manifest after successful integration and processing.

## Review handoff

Both masters are original outputs from one built-in generation call per subject. Each staged PNG is 1254 × 1254 px in RGBA and passed `checkMaster` in `scripts/art-lib.ts` with no findings. The [review sheet](./review.png) compares both candidates with the approved Clementine, W. Murcott and Gold Nugget at 48 and 320 px on Orchard's ivory and warm charcoal. Both candidates show clear edges without obvious clipping, matte or halo.

- [`mandarins-satsuma-thumbnail-v1`](./mandarins-satsuma-thumbnail-v1.png) is broader than the Clementine, with a lower, narrower leaf. The warm orange sits between the Gold Nugget and W. Murcott. The upper-left rind highlight is brighter than the matte finish described in the brief.
- [`mandarins-pixie-thumbnail-v1`](./mandarins-pixie-thumbnail-v1.png) reads as a small, rounded, leafless fruit with finer grain than Gold Nugget. The stem collar is subtle at 320 px. The yellow-orange color and outline carry the distinction at 48 px.

Jared approved [Satsuma v2](./mandarins-satsuma-thumbnail-v2.png) and [Pixie v1](./mandarins-pixie-thumbnail-v1.png) on November 19, 2026. Both passed `checkMaster` again at handoff. The integration owner can use the two approved entries below, copy their masters into `art/masters/`, and run the shared processor. Satsuma v1 remains a comparison reference.

## Satsuma v2 · Shape revision

Jared flagged the vertically compressed appearance of v1. The [Frost Owari accession notes](https://citrusvariety.ucr.edu/crc3178) describe fruit that varies in shape and is typically oblate. The [revised master](./mandarins-satsuma-thumbnail-v2.png) has fuller shoulders and a rounder underside. The approximate painted rind height increased from 74% to 87% of its width, measured on orange pixels to exclude the leaf and stem.

The original built-in output is a 1254 × 1254 RGBA PNG and passed `checkMaster` after staging. The [v1 and v2 comparison](./satsuma-v2-review.png) shows the fuller profile clearly at 48 and 320 px against ivory and warm charcoal, with no obvious clipping, matte, or halo.

```json
{"id":"mandarins-satsuma-thumbnail-v2","item":"mandarins","variety":"satsuma","role":"thumbnail","alt":"A gently flattened orange Satsuma mandarin with a narrow green leaf","revision":2,"status":"approved"}
```

**Built-in generation prompt**, with Satsuma v1 as the edit target

> Edit the supplied Orchard botanical watercolor of a whole Frost Owari-style Satsuma mandarin. Change only the fruit's body proportions: it is reading as vertically compressed, with body height approximately 74% of width in the source. Repaint the rind form with a fuller, more rounded upper shoulder and underside, and a slightly narrower equator if needed. Target a visible orange rind silhouette (excluding the green leaf and stem) about 88–90% as tall as wide, still gently oblate and naturally asymmetric. At thumbnail size it should read as a volumetric mandarin with a slightly flattened top and base. Redraw the shading and the rind's pores so they follow the fuller volume naturally. Preserve the original softly granulated layered watercolor, warm orange palette, fine pores, upper-left diffuse lighting, three-quarter view, short clipped stem and narrow green leaf with their natural proportions, apparent size and centered framing. One fruit only, ample clear crop margin, square PNG at least 1024 pixels with genuinely transparent alpha. No matte, ground shadow, paper, backdrop, border, text, or extra objects.

## Satsuma

- Botanical references. [UC Riverside Frost Owari Satsuma accession](https://citrusvariety.ucr.edu/crc3178) and [Dan Willey’s Frost Owari specimen photograph](https://fruitmentor.com/es/mandarina-owari-satsuma). Selected Frost Owari as an example of the broader Satsuma catalog entry. The source specimens support an oblate body, orange skin and finely dimpled rind.
- Painting references. [Approved Clementine v2](../01b-mandarins-strawberries/mandarins-clementine-thumbnail-v2.png) and [approved W. Murcott v2](../01b-mandarins-strawberries/mandarins-w-murcott-thumbnail-v2.png). One restrained leaf is a composition choice.

```json
{"id":"mandarins-satsuma-thumbnail-v1","item":"mandarins","variety":"satsuma","role":"thumbnail","alt":"A flattened orange Satsuma mandarin with a narrow green leaf","revision":1,"status":"review"}
```

> Paint a new standalone Orchard Satsuma mandarin variety thumbnail. References 1 (approved Clementine) and 2 (approved W. Murcott) are style and scale guides: use their luminous botanical watercolor washes, soft granulation, subtle pigment pooling, selective detail, softly broken paint edges, gently elevated three-quarter view and diffuse upper-left light. Use Frost Owari as the representative Satsuma form: one whole fruit with a distinctly squat, broad oblate body, about 0.8 as high as wide, subtly uneven relaxed shoulders and a shallow stem depression with a low olive calyx and short clipped stem. Use warm orange rind with a gently matte finish and fine shallow pores. Show just a little yellow-orange variation in the upper shoulder. Add one small narrow lanceolate citrus leaf angled away from the stem so the flattened silhouette remains visible. The body should fill about 68% of the square width, centered with clear margins. Make the shape and warm color read at 48 px. Square PNG at least 1024 px per side, genuine transparent alpha, discreet highlights, no paper or checkerboard, ground, cast shadow, cut fruit, other fruit, border, text, hard outline, or photographic gloss.

## Pixie

- Botanical references. [UC Riverside Pixie accession and Churchill Orchard photo series](https://citrusvariety.ucr.edu/crc3568) and [Churchill Orchard’s Ojai Pixie tree photograph](https://tangerinemanstore.mybigcommerce.com/products/Ojai-Pixie-Tangerines-9-lb-box.html). The orchard photo shows compact, near-round ripe fruit. UC Riverside describes yellow-orange rind, slight pebbling and a variable short neck. This brief uses the low-collar form.
- Painting references. [Approved Clementine v2](../01b-mandarins-strawberries/mandarins-clementine-thumbnail-v2.png) and [approved Gold Nugget v3](../01b-mandarins-strawberries/mandarins-gold-nugget-thumbnail-v3.png).

```json
{"id":"mandarins-pixie-thumbnail-v1","item":"mandarins","variety":"pixie","role":"thumbnail","alt":"A small, round yellow-orange Pixie mandarin with finely pebbled rind","revision":1,"status":"approved"}
```

> Paint a new standalone Orchard Pixie mandarin variety thumbnail. References 1 (approved Clementine) and 2 (approved Gold Nugget) are style and scale guides: use their luminous botanical watercolor washes, soft granulation, subtle pigment pooling, selective detail, softly broken paint edges, gently elevated three-quarter view and diffuse upper-left light. Depict one small Ojai Pixie tangerine, nearly round to just slightly flattened, with a subtly irregular outline and a very low broad stem-end collar and a tiny clipped green-brown stem button. Rim and collar should flow into the shoulders without a protruding knob. Keep the rind bright yellow-orange with shallow, fine, irregular pebbles appreciably subtler than Gold Nugget. Keep the skin pattern quiet enough to read as one painted form. Use the stem button alone. Keep the fruit body about 54% of the square width, centered with clear margins, with the compact round outline and color readable at 48 px. Square PNG at least 1024 px per side, genuine transparent alpha, no foliage, cut pieces, paper or checkerboard, ground, cast shadow, border, text, hard outline, or photographic gloss.

## Revision requested: mandarins-satsuma-thumbnail-v2 (Jared, 2026-11-19)

The approved painting was 60% of the canvas wide against 68–73% for the round mandarins. Claude rescaled the master in `art/masters/` (×1.17 about the centre) to 70% so the app matches its family meanwhile. Paint `mandarins-satsuma-thumbnail-v3` with the same identifying traits at about 70% width (longer side 75–85% of the canvas), check it on the review sheet beside the family, and hand it off once Jared approves it.

## Revision requested: mandarins-pixie-thumbnail-v1 (Jared, 2026-11-19)

The approved painting was 50% of the canvas wide against 68–73% for the round mandarins. Claude rescaled the master in `art/masters/` (×1.36 about the centre) to 68% so the app matches its family meanwhile. Paint `mandarins-pixie-thumbnail-v2` with the same identifying traits at about 68% width (longer side 75–85% of the canvas), check it on the review sheet beside the family, and hand it off once Jared approves it.

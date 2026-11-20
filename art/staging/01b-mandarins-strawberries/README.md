# Batch 1B · Mandarins and strawberries

## Jared’s approval

Jared accepted the latest staged revision of each of the six subjects. All six passed `checkMaster` again after approval. The handoff below records the approved candidates for integration and derivative processing.

- [mandarins-thumbnail-v2](./mandarins-thumbnail-v2.png)
- [mandarins-clementine-thumbnail-v2](./mandarins-clementine-thumbnail-v2.png)
- [mandarins-gold-nugget-thumbnail-v3](./mandarins-gold-nugget-thumbnail-v3.png)
- [mandarins-w-murcott-thumbnail-v2](./mandarins-w-murcott-thumbnail-v2.png)
- [mandarins-minneola-thumbnail-v2](./mandarins-minneola-thumbnail-v2.png)
- [strawberries-thumbnail-v2](./strawberries-thumbnail-v2.png)

Earlier revisions are retained for reference where present. Gold Nugget v2 remains withdrawn.

## First pass · 2026-11-19

Each PNG is a candidate for Jared’s review. The built-in image tool used actual transparency and the [Orchard illustration-language sheet](../../../docs/design/references/04-illustration-language.png) as the shared style input. The checked apple pilot landed after these calls had started. Consult it and the staged mandarins when preparing the next step.

All three staged files passed `checkMaster` in `scripts/art-lib.ts` as generated, at 1254 × 1254 with four-channel RGBA. Thumbnails were visually checked over ivory and warm charcoal at the intended UI sizes and at 320 px. No obvious matte, clipping, or pale edge haze was visible. The manifest fields below describe the integration handoff. The status `review` is the target after processing.

### `mandarins-thumbnail-v1`

- Staged PNG [mandarins-thumbnail-v1.png](./mandarins-thumbnail-v1.png)
- Intended master `art/masters/mandarins-thumbnail-v1.png`
- Display 72 px on Today and up to 320 px on the item page.
- Subject reference. [UC Riverside Algerian Clementine collection photos and description](https://citrusvariety.ucr.edu/crc0279) informed the whole-fruit citrus anatomy. Batch 1 specifies the two peeled segments.
- Review. Flattened orange body, two pointed leaves and two peeled segments read at 72 px. At 320 px the segments show pith and fine internal texture. The composition fills more of the canvas than either single-fruit study.

```json
{
  "id": "mandarins-thumbnail-v1",
  "item": "mandarins",
  "role": "thumbnail",
  "alt": "A whole mandarin with leaves and two peeled segments",
  "revision": 1,
  "status": "review"
}
```

**Built-in generation prompt**

> Create a new standalone Orchard produce thumbnail, referring to image 1 only for its naturalistic botanical watercolor technique: luminous translucent washes, broad overlapping painted shapes, fine granulation, small pigment pools, delicate selective detail and softly broken edges. Match a gently elevated three-quarter viewpoint and soft diffuse upper-left light. Compose in a square 1024px canvas, with clear generous crop safety all around, silhouette legible at thumbnail size. Genuine transparent alpha with no paper, ground, cast shadow, text, border, rectangular backdrop or checkerboard. Avoid photorealistic gloss, heavy outlines or cartoon rendering. Ignore the reference sheet typography, layout and background. One squat flattened deep-orange whole mandarin with fine-pitted rind, a short stem and exactly two pointed glossy dark-green citrus leaves. In front place exactly two compact naturally curved peeled individual segments with fine juice vesicles visible through thin membranes and sparse pale pith threads. Depict intact individual segments, not cross-section slices, not multiple fan-shaped wedges. Make the whole fruit dominant. Reads at 72 and 320 px.

### `mandarins-clementine-thumbnail-v1`

- Staged PNG [mandarins-clementine-thumbnail-v1.png](./mandarins-clementine-thumbnail-v1.png)
- Intended master `art/masters/mandarins-clementine-thumbnail-v1.png`
- Display 48 px in Varieties now.
- Subject reference. [UC Riverside Algerian Clementine collection photos and description](https://citrusvariety.ucr.edu/crc0279) for shape, rind color and texture.
- Review. Slightly oblate, deep orange and comparatively smooth, with one leaf. The smaller scale reads at 48 px. The stem is longer than requested and the pores are pronounced at 320 px. Flag for Jared’s review.

```json
{
  "id": "mandarins-clementine-thumbnail-v1",
  "item": "mandarins",
  "variety": "clementine",
  "role": "thumbnail",
  "alt": "A small clementine with a leaf",
  "revision": 1,
  "status": "review"
}
```

**Built-in generation prompt**

> Create a new standalone Orchard produce thumbnail, referring to image 1 only for its naturalistic botanical watercolor technique: luminous translucent washes, broad overlapping painted shapes, fine granulation, small pigment pools, delicate selective detail and softly broken edges. Match a gently elevated three-quarter viewpoint and soft diffuse upper-left light. Compose in a square 1024px canvas, with clear generous crop safety all around, silhouette legible at thumbnail size. Genuine transparent alpha with no paper, ground, cast shadow, text, border, rectangular backdrop or checkerboard. Avoid photorealistic gloss, heavy outlines or cartoon rendering. Ignore the reference sheet typography, layout and background. One whole small Clementine mandarin, slightly flattened, with smooth deep-orange rind, fine subtle pores and a gentle natural sheen, short stem and one pointed glossy citrus leaf. Fruit body a little smaller than Gold Nugget at matched scale. Reads at 48 px.

### `mandarins-gold-nugget-thumbnail-v1`

- Staged PNG [mandarins-gold-nugget-thumbnail-v1.png](./mandarins-gold-nugget-thumbnail-v1.png)
- Intended master `art/masters/mandarins-gold-nugget-thumbnail-v1.png`
- Display 48 px in Varieties now.
- Subject reference. [UC Riverside Gold Nugget collection photos and breeder’s description](https://citrusvariety.ucr.edu/crc3913) for the slightly oblate profile, short neck and variable rind texture.
- Review. The golden-orange rind and rounder pebbles distinguish it from Clementine. The texture is clearest at 320 px, with the golden color carrying more of the distinction at 48 px. The tool included one leaf.

```json
{
  "id": "mandarins-gold-nugget-thumbnail-v1",
  "item": "mandarins",
  "variety": "gold-nugget",
  "role": "thumbnail",
  "alt": "A Gold Nugget mandarin with bumpy, pebbled skin",
  "revision": 1,
  "status": "review"
}
```

**Built-in generation prompt**

> Create a new standalone Orchard produce thumbnail, referring to image 1 only for its naturalistic botanical watercolor technique: luminous translucent washes, broad overlapping painted shapes, fine granulation, small pigment pools, delicate selective detail and softly broken edges. Match a gently elevated three-quarter viewpoint and soft diffuse upper-left light. Compose in a square 1024px canvas, with clear generous crop safety all around, silhouette legible at thumbnail size. Genuine transparent alpha with no paper, ground, cast shadow, text, border, rectangular backdrop or checkerboard. Avoid photorealistic gloss, heavy outlines or cartoon rendering. Ignore the reference sheet typography, layout and background. One whole medium-sized Gold Nugget mandarin, slightly flattened (height-to-width about 0.85), little or no neck, golden yellow-orange rather than red-orange. Rind is distinctly pebbled with irregular softly rounded shallow bumps and visibly depressed oil glands. Make the texture read at 48 px without exaggerating it into warts. Keep foliage minimal, short stem button.

## Second pass · 2026-11-19

All three built-in image generation outputs passed `checkMaster` as generated at 1254 × 1254 in four-channel RGBA. I inspected each over Orchard’s ivory and warm charcoal at its intended thumbnail size and at 320 px. The edges showed no obvious matte, clipping, or pale haze.

### `mandarins-w-murcott-thumbnail-v1`

- Staged PNG [mandarins-w-murcott-thumbnail-v1.png](./mandarins-w-murcott-thumbnail-v1.png)
- Intended master `art/masters/mandarins-w-murcott-thumbnail-v1.png`
- Display 48 px in Varieties now.
- Style inputs [04-illustration-language.png](../../../docs/design/references/04-illustration-language.png), [apples-thumbnail-v1.png](../../../art/masters/apples-thumbnail-v1.png), [Staged Clementine](./mandarins-clementine-thumbnail-v1.png).
- Subject reference. [UC Riverside W. Murcott Afourer accession and photographs](https://citrusvariety.ucr.edu/crc3953) for the flattened profile and smooth rind.
- Review. Flattened outline and low stem button read at 48 px. The red-orange shading is stronger on the right. At 320 px the stippling is finer than Gold Nugget’s pebbled texture.

```json
{
  "id": "mandarins-w-murcott-thumbnail-v1",
  "item": "mandarins",
  "variety": "w-murcott",
  "role": "thumbnail",
  "alt": "A flattened, deep reddish-orange W. Murcott mandarin",
  "revision": 1,
  "status": "review"
}
```

**Built-in generation prompt**

> Paint one whole W. Murcott Afourer mandarin for a 48 px thumbnail. Use image 1 for overall painting language, image 2 for wash and edge treatment and image 3 for citrus viewpoint and scale. Use Orchard’s naturalistic botanical watercolor: luminous translucent washes, broad overlapping paint shapes, subtle granulation and pigment pooling, selective fine detail, softly broken pigment edges and a legible silhouette. Use a gently elevated three-quarter view with soft diffuse upper-left light. Center an isolated composition on a square of at least 1024 pixels per side with ample clear margin on every side. Export real transparent alpha. No paper patch, painted checkerboard, tabletop, cast shadow, type, border, hard dark outlines or plastic gloss. Make the fruit distinctly oblate and a little larger than the Clementine, with a deep reddish-orange rind, visibly smooth with fine shallow pores and a low, short stem button. Keep the upper silhouette clear and use only the stem button, with no large leaves or peeled pieces.

### `mandarins-minneola-thumbnail-v1`

- Staged PNG [mandarins-minneola-thumbnail-v1.png](./mandarins-minneola-thumbnail-v1.png)
- Intended master `art/masters/mandarins-minneola-thumbnail-v1.png`
- Display 48 px in Varieties now.
- Style inputs [04-illustration-language.png](../../../docs/design/references/04-illustration-language.png), [apples-thumbnail-v1.png](../../../art/masters/apples-thumbnail-v1.png), [Staged Clementine](./mandarins-clementine-thumbnail-v1.png).
- Subject reference. [UC Riverside Minneola tangelo accession and photographs](https://citrusvariety.ucr.edu/crc3340) for the neck, body, and rind.
- Review. The stem-end neck remains visible at 48 px and gives the fruit a taller profile. The body renders slightly narrower than W. Murcott, so the larger fruit size comes through mainly in overall height. The neck is prominent enough to merit a look in the set.

```json
{
  "id": "mandarins-minneola-thumbnail-v1",
  "item": "mandarins",
  "variety": "minneola",
  "role": "thumbnail",
  "alt": "A Minneola tangelo with its knobbed neck",
  "revision": 1,
  "status": "review"
}
```

**Built-in generation prompt**

> Paint one whole Minneola tangelo for a 48 px thumbnail. Use image 1 for overall painting language, image 2 for wash and edge treatment and image 3 for citrus viewpoint and scale. Use Orchard’s naturalistic botanical watercolor: luminous translucent washes, broad overlapping paint shapes, subtle granulation and pigment pooling, selective fine detail, softly broken pigment edges and a legible silhouette. Use a gently elevated three-quarter view with soft diffuse upper-left light. Center an isolated composition on a square of at least 1024 pixels per side with ample clear margin on every side. Export real transparent alpha. No paper patch, painted checkerboard, tabletop, cast shadow, type, border, hard dark outlines or plastic gloss. Give it a medium-large rounded body, bright reddish-orange skin, fine pitting and the defining distinct short broad neck rising from its shoulders at the stem end. The neck is rind continuous with the body and should read in silhouette above the shoulders, with a tiny flush stem button at its tip. Keep the neck fully visible and omit leaves and sliced fruit.

### `strawberries-thumbnail-v1`

- Staged PNG [strawberries-thumbnail-v1.png](./strawberries-thumbnail-v1.png)
- Intended master `art/masters/strawberries-thumbnail-v1.png`
- Display 72 px on Today and up to 320 px on the item page.
- Style inputs [04-illustration-language.png](../../../docs/design/references/04-illustration-language.png), [apples-thumbnail-v1.png](../../../art/masters/apples-thumbnail-v1.png).
- Subject reference. [UC Agriculture and Natural Resources strawberry publication, figure 1](https://class.ucanr.edu/sites/default/files/2021-04/348577.pdf) for ripe berry color, achenes and calyx anatomy.
- Review. The two red cones and both green caps read at 72 px. The calyces are generous in size and some achenes read as raised at 320 px. Flag both details for Jared’s review.

```json
{
  "id": "strawberries-thumbnail-v1",
  "item": "strawberries",
  "role": "thumbnail",
  "alt": "Two red strawberries with green caps",
  "revision": 1,
  "status": "review"
}
```

**Built-in generation prompt**

> Paint two whole ripe garden strawberries as a compact lightly overlapping pair for a 72 px thumbnail and 320 px detail. Use image 1 for overall painting language and image 2 for the treatment of washes, edges and surface detail. Use Orchard’s naturalistic botanical watercolor: luminous translucent washes, broad overlapping paint shapes, subtle granulation and pigment pooling, selective fine detail, softly broken pigment edges and a legible silhouette. Use a gently elevated three-quarter view with soft diffuse upper-left light. Center an isolated composition on a square of at least 1024 pixels per side with ample clear margin on every side. Export real transparent alpha. No paper patch, painted checkerboard, tabletop, cast shadow, type, border, hard dark outlines or plastic gloss. Show one strawberry facing forward and the other turned slightly. Use natural asymmetric conical shapes with broad shoulders, fresh pointed green sepals crowning each fruit, bright ripe red right up to the shoulders, and small yellow-tan achenes set into shallow individual pits across each visible surface. Suggest fresh sheen using small broken highlights. Show only the pair, with no branch, extra leaves, flowers or sliced fruit.

## Handoff

All six first-pass candidates are staged for Jared’s review. The canonical manifest status shown in each handoff is the target after integration and processing.

## Review and re-render · Stage 1

The existing mandarin, Clementine, and Gold Nugget were compared over ivory and warm charcoal before revising. Each new candidate used its own v1 as the edit target and [Orchard’s illustration-language sheet](../../../docs/design/references/04-illustration-language.png) for paint handling. Botanical references are listed under the corresponding v1 briefs above. Each v2 is an original built-in image tool output at 1254 × 1254 in RGBA and passed `checkMaster`. The revisions were compared side by side over Orchard’s ivory and warm charcoal at 72 px for the item and 48 px for the varieties, with a larger proof for edge and texture inspection. No obvious clipping, matte, or edge haze was visible.

### `mandarins-thumbnail-v2`

- First-pass candidate [mandarins-thumbnail-v1.png](./mandarins-thumbnail-v1.png).
- Staged revision [mandarins-thumbnail-v2.png](./mandarins-thumbnail-v2.png).
- Intended master `art/masters/mandarins-thumbnail-v2.png`.
- Critique. The two segments and wide leaf canopy pulled attention from the whole fruit. The group filled almost the entire width of the canvas.
- Result. The smaller leaves and compact segment grouping give the whole fruit priority. Both segments read at 72 px. The reduction in overall footprint also makes the illustration quieter in the row. The segment membranes still trace a pale edge at large size.

```json
{
  "id": "mandarins-thumbnail-v2",
  "item": "mandarins",
  "role": "thumbnail",
  "alt": "A whole mandarin with leaves and two peeled segments",
  "revision": 2,
  "status": "approved"
}
```

**Built-in generation prompt**

> Revise image 1 as a new candidate for Orchard’s produce thumbnail. Use image 2 only for the paint handling of the Orchard style. Keep the gently elevated three-quarter view, soft upper-left light, natural citrus color and layered botanical watercolor. Build the fruit volume with broad translucent washes, visible brush shapes and restrained granulation, then add pigment details selectively. Use soft, broken edges and a readable silhouette. Deliver an isolated square PNG at least 1024 px per side with real transparent alpha and generous clear margins. Exclude paper, baked checkerboard, cast shadows, outlines, lettering and any added objects. Keep one flattened deep-orange fruit, two dark green citrus leaves on a short stem, and two individual peeled segments in front. The current leaf canopy and big front segments compete with the fruit. Reduce the total spread of the leaves, shorten the branch, and group two smaller segments close to the lower front of the fruit with a slight overlap so all three forms still read at 72 px. Each peeled piece is a small intact curved segment, with subtle translucent membrane and tiny juice vesicles, no white outline or fan-shaped citrus slice. Reduce the hard white highlights and use soft orange-to-ochre transitions while keeping a deep-orange identity. Center the compact grouping with about 8–12% clear margin left and right.

### `mandarins-clementine-thumbnail-v2`

- First-pass candidate [mandarins-clementine-thumbnail-v1.png](./mandarins-clementine-thumbnail-v1.png).
- Staged revision [mandarins-clementine-thumbnail-v2.png](./mandarins-clementine-thumbnail-v2.png).
- Intended master `art/masters/mandarins-clementine-thumbnail-v2.png`.
- Critique. The long branch, wide leaf and dense pores competed with the smooth rind cue. The fruit was already small relative to the cultivar canvas.
- Result. Shorter stem, smaller leaf and fewer pores give the rind a smoother read. The revised fruit actually occupies slightly less of the canvas, despite the request to increase it. At 48 px it still reads, though it sits noticeably smaller than Gold Nugget.

```json
{
  "id": "mandarins-clementine-thumbnail-v2",
  "item": "mandarins",
  "variety": "clementine",
  "role": "thumbnail",
  "alt": "A small clementine with a leaf",
  "revision": 2,
  "status": "approved"
}
```

**Built-in generation prompt**

> Revise image 1 as a new candidate for Orchard’s produce thumbnail. Use image 2 only for the paint handling of the Orchard style. Keep the gently elevated three-quarter view, soft upper-left light, natural citrus color and layered botanical watercolor. Build the fruit volume with broad translucent washes, visible brush shapes and restrained granulation, then add pigment details selectively. Use soft, broken edges and a readable silhouette. Deliver an isolated square PNG at least 1024 px per side with real transparent alpha and generous clear margins. Exclude paper, baked checkerboard, cast shadows, outlines, lettering and any added objects. Keep the single slightly flattened, deep-orange fruit and one pointed citrus leaf. The original has a long thick branch, a large leaf, large conspicuous pores, and excess empty space at 48 px. Shorten and thin the stem to a small clipped pedicel and reduce the leaf, with the join still botanically plausible. Use a smooth rind wash with tiny sparse pores and a soft restrained sheen. Make the fruit body approximately 64% of the canvas width and center it optically. It should read cleanly at 48 px and remain slightly smaller in apparent fruit size than Gold Nugget.

### `mandarins-gold-nugget-thumbnail-v2`

- First-pass candidate [mandarins-gold-nugget-thumbnail-v1.png](./mandarins-gold-nugget-thumbnail-v1.png).
- Removed from staging at Jared’s request. Skip revision 2 during integration.
- Critique. The bright white highlight and fine speckling made the rind read comparatively glossy. Its characteristic texture could be stronger at small size.
- Result. Irregular relief and broken golden washes separate the rind from Clementine’s smooth finish. The v2 texture is more pronounced than v1, particularly on the lit shoulder. At 48 px the warmer golden color still carries most of the cultivar distinction.

**Built-in generation prompt**

> Revise image 1 as a new candidate for Orchard’s produce thumbnail. Use image 2 only for the paint handling of the Orchard style. Keep the gently elevated three-quarter view, soft upper-left light, natural citrus color and layered botanical watercolor. Build the fruit volume with broad translucent washes, visible brush shapes and restrained granulation, then add pigment details selectively. Use soft, broken edges and a readable silhouette. Deliver an isolated square PNG at least 1024 px per side with real transparent alpha and generous clear margins. Exclude paper, baked checkerboard, cast shadows, outlines, lettering and any added objects. Keep the single slightly flattened golden yellow-orange Gold Nugget mandarin, with a low stem button, fruit body approximately 70% of canvas width, and one small pointed citrus leaf. The first version reads glossy and finely pitted from afar. Reduce the large white specular marks and oversized leaf. Make the naturally bumpy, matte, pebbled rind its main visual feature with low irregular rounded relief, subtle ochre pooling between bumps and a few breaks in the silhouette. Group texture selectively toward the lit shoulder and transition into broad golden-orange washes around the shaded side. The pebbles should be visible at 48 px without making the fruit knobby or warty.

## Review and re-render · Stage 2

Each revision used its staged v1 as the edit target and the [Orchard illustration-language sheet](../../../docs/design/references/04-illustration-language.png) for paint handling. Botanical references are recorded with the v1 briefs above. All three v2 files are original built-in image tool outputs at 1254 × 1254 in RGBA and passed `checkMaster`. The v1 and v2 pairs were compared on Orchard ivory and warm charcoal at 48 px for the varieties, 72 px for the item, and 320 px for detail. No obvious clipping, matte, or edge haze was visible.

### `mandarins-w-murcott-thumbnail-v2`

- First-pass candidate [mandarins-w-murcott-thumbnail-v1.png](./mandarins-w-murcott-thumbnail-v1.png).
- Staged revision [mandarins-w-murcott-thumbnail-v2.png](./mandarins-w-murcott-thumbnail-v2.png).
- Intended master `art/masters/mandarins-w-murcott-thumbnail-v2.png`.
- Critique. The sharp upper-left shine and busy stippling made the rind look glossier than the staged set. The warm-to-red shift was abrupt.
- Result. The longer red-orange wash and softer shoulder highlight give the fruit more continuous volume. The low stem and flattened silhouette still read at 48 px. The shallow central depression is more pronounced at 320 px.

```json
{
  "id": "mandarins-w-murcott-thumbnail-v2",
  "item": "mandarins",
  "variety": "w-murcott",
  "role": "thumbnail",
  "alt": "A flattened, deep reddish-orange W. Murcott mandarin",
  "revision": 2,
  "status": "approved"
}
```

**Built-in generation prompt**

> Revise image 1 as a new Orchard produce thumbnail candidate. Use image 2 only as a reference for layered botanical watercolor. Keep a gently elevated three-quarter view, soft upper-left light, natural produce colors, a readable silhouette and softly broken pigment edges. Use broad translucent washes with selective pigment pooling and fine detail. Deliver a square PNG at least 1024 px per side with genuine transparent alpha and clear crop margins. Exclude paper, baked checkerboard, cast shadows, outlines, lettering and additional objects. Keep the centered single distinctly oblate W. Murcott with a low clipped stem button and no leaves. The existing hard upper-left white patch, orange-to-red split, and scattered pinpoint highlights compete with its smooth skin. Paint a calm, continuous deep reddish-orange rind with layered coral-orange and burnt-orange washes, a soft warm highlight, and only fine shallow pores concentrated near the shoulder. The form should still feel ripe and luminous. Keep the body wider than tall and about two-thirds of the canvas width so it reads at 48 px.

### `mandarins-minneola-thumbnail-v2`

- First-pass candidate [mandarins-minneola-thumbnail-v1.png](./mandarins-minneola-thumbnail-v1.png).
- Staged revision [mandarins-minneola-thumbnail-v2.png](./mandarins-minneola-thumbnail-v2.png).
- Intended master `art/masters/mandarins-minneola-thumbnail-v2.png`.
- Critique. The tall, narrow approach to the neck made the whole fruit read pear-shaped. It also appeared narrower than W. Murcott.
- Result. The body and neck are both fuller and the fruit now reads larger than W. Murcott. The neck remains prominent at 48 px. At 320 px the stem button and a few bright rind pores are still conspicuous.

```json
{
  "id": "mandarins-minneola-thumbnail-v2",
  "item": "mandarins",
  "variety": "minneola",
  "role": "thumbnail",
  "alt": "A Minneola tangelo with its knobbed neck",
  "revision": 2,
  "status": "approved"
}
```

**Built-in generation prompt**

> Revise image 1 as a new Orchard produce thumbnail candidate. Use image 2 only as a reference for layered botanical watercolor. Keep a gently elevated three-quarter view, soft upper-left light, natural produce colors, a readable silhouette and softly broken pigment edges. Use broad translucent washes with selective pigment pooling and fine detail. Deliver a square PNG at least 1024 px per side with genuine transparent alpha and clear crop margins. Exclude paper, baked checkerboard, cast shadows, outlines, lettering and additional objects. Keep the centered single Minneola tangelo, its rich reddish-orange rind and tiny stem button, with no foliage. The original silhouette reads as an elongated pear with an exaggerated stem-end knob. Give the lower body fuller rounded shoulders and make the distinct protruding neck a little shorter and broader, rising naturally from the shoulders and still unmistakable at 48 px. The fruit body should read at least as substantial as the W. Murcott in the set. Reduce the hard white highlight and excess pores around the shoulder with softly layered transparent washes.

### `strawberries-thumbnail-v2`

- First-pass candidate [strawberries-thumbnail-v1.png](./strawberries-thumbnail-v1.png).
- Staged revision [strawberries-thumbnail-v2.png](./strawberries-thumbnail-v2.png).
- Intended master `art/masters/strawberries-thumbnail-v2.png`.
- Critique. The high, splayed caps pulled attention from the fruit, and some of the shiny achenes looked raised.
- Result. Flatter caps and softer highlights put more emphasis on the berries. Both silhouettes are clear at 72 px. The achenes are less bright overall, though some still appear raised at 320 px.

```json
{
  "id": "strawberries-thumbnail-v2",
  "item": "strawberries",
  "role": "thumbnail",
  "alt": "Two red strawberries with green caps",
  "revision": 2,
  "status": "approved"
}
```

**Built-in generation prompt**

> Revise image 1 as a new Orchard produce thumbnail candidate. Use image 2 only as a reference for layered botanical watercolor. Keep a gently elevated three-quarter view, soft upper-left light, natural produce colors, a readable silhouette and softly broken pigment edges. Use broad translucent washes with selective pigment pooling and fine detail. Deliver a square PNG at least 1024 px per side with genuine transparent alpha and clear crop margins. Exclude paper, baked checkerboard, cast shadows, outlines, lettering and additional objects. Retain the compact slightly overlapping pair of whole ripe strawberries, one facing forward and the other turned, with both red silhouettes distinct at 72 px. The pointed sepals on the existing image are oversized and raised, and the achenes look like gold beads. Shorten the two fresh leafy green calyces, lay most sepals gently over the tops, and keep ripe natural red all the way to the shoulders. Paint smaller muted pale-gold to tan achenes seated in shallow dimples, with fine shadows and small interrupted highlights. Replace the large hard white shine with a restrained soft sheen through luminous red washes. Keep the berries conical and preserve clear margins.

Both review stages are complete. Gold Nugget v2 was withdrawn after stage 2.

## Gold Nugget replacement

### `mandarins-gold-nugget-thumbnail-v3`

- Staged revision [mandarins-gold-nugget-thumbnail-v3.png](./mandarins-gold-nugget-thumbnail-v3.png).
- Intended master `art/masters/mandarins-gold-nugget-thumbnail-v3.png`.
- Style inputs. [Gold Nugget v1](./mandarins-gold-nugget-thumbnail-v1.png) for subject and framing and the [Orchard style sheet](../../../docs/design/references/04-illustration-language.png) for paint handling.
- Botanical reference. [UC Riverside Gold Nugget accession and breeder description](https://citrusvariety.ucr.edu/crc3913).
- Checks. Built-in image tool output at 1254 × 1254 in RGBA. Passed `checkMaster` and inspected at 48 and 320 px over Orchard ivory and warm charcoal. The broad golden-orange washes and shallow pebbled rind are visible, particularly at 320 px. The muted leaf is still broad relative to the stem.

```json
{
  "id": "mandarins-gold-nugget-thumbnail-v3",
  "item": "mandarins",
  "variety": "gold-nugget",
  "role": "thumbnail",
  "alt": "A Gold Nugget mandarin with bumpy, pebbled skin",
  "revision": 3,
  "status": "approved"
}
```

**Built-in generation prompt**

> Paint a fresh Orchard botanical watercolor thumbnail of one whole Gold Nugget mandarin. Use image 1 (first-pass fruit) as a loose guide to subject, scale and viewpoint. Use image 2 (Orchard style sheet) only for luminous translucent washes, soft pigment edges and selective detail. Show a slightly flattened fruit about 1.18 times as wide as tall, with a very short clipped stem button and one small muted green citrus leaf tucked to one side. Keep the leaves subordinate and the fruit body's visible width around 70 to 74 percent of the square canvas. Use golden yellow-orange on the lit shoulder and warm ochre-orange in the shade, with a diffuse upper-left highlight. Depict the distinctive natural bumpy rind with small, shallow, uneven pebbles and a few depressed oil glands, in irregular patches that fade into broader washes. Keep the relief delicate, avoiding repetitive round dimples, big bumps, hard white shine and a stippled outline. The fruit should be recognizable at 48 px. Center it in a square PNG at least 1024 px wide with real transparent alpha and clear crop safety on every side. No paper, checkerboard, cast shadow, lettering, border, second fruit or garnish.

## Revision requested: mandarins-clementine-thumbnail-v2 (Jared, 2026-11-19)

The approved painting was 52% of the canvas wide against 68–73% for the round mandarins. Claude rescaled the master in `art/masters/` (×1.31 about the centre) to 68% so the app matches its family meanwhile. Paint `mandarins-clementine-thumbnail-v3` in `art/staging/21-repaints/`, which has its prompt and saving steps, with the same identifying traits at about 68% width (longer side 75–85% of the canvas), check it on the review sheet beside the family, and hand it off once Jared approves it.

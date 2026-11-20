# Sweet corn

Intended master `art/masters/sweet-corn-thumbnail-v1.png`. Display at 72 CSS px on Today and 96–112 CSS px on item thumbnails. Canonical export settings are 160, 320 and 640 px square WebPs at quality 82, alpha quality 90 and effort 6.

## Proposed manifest entry

```json
{
  "id": "sweet-corn-thumbnail-v1",
  "item": "sweet-corn",
  "role": "thumbnail",
  "alt": "A partially husked ear of sweet corn with yellow kernels and pale silk",
  "revision": 1,
  "status": "requested"
}
```

## References

- [Catalog record](../../../content/items/sweet-corn.yaml). Fresh green husk, tapered filled ear with rows of plump kernels, and fine silk with brown tips.
- [Utah State University Extension, sweet corn harvest and handling](https://extension.usu.edu/vegetableguide/sweet-corn/harvest-handling) and [sweet corn in the garden](https://extension.usu.edu/yardandgarden/research/sweet-corn-in-the-garden).
- [Visual reference 1](../../../docs/design/references/04-illustration-language.png).
- [Visual reference 2](../../../art/masters/apples-thumbnail-v2.png).

## Built-in ImageGen prompt

Transparency enabled.

Paint one isolated Orchard item thumbnail as a naturalistic botanical watercolor for a contemporary produce journal. Match the Orchard illustration-language study for luminous layered washes, broad overlapping color shapes, subtle granulation, selective botanical detail and varied soft pigment edges. Use a gently elevated three-quarter view and soft diffuse upper-left light. Keep the produce centered and legible at 72 and 96–112 CSS px, with about 10% clear space around the entire silhouette. Deliver a square PNG at least 1024 px per side with genuine transparent alpha. No paper, ground shadow, halo, text, border, props, heavy outline or photorealistic gloss.

Show one fresh whole yellow sweet corn ear on a relaxed diagonal, its tapered tip pointing upper right. Peel back two fresh green husk blades close to the base so the exposed ear stays dominant. Show full, tightly packed rows of rounded kernels following the ear's curvature and narrowing toward the tip. Add only a few fine straw-colored silk strands with tawny tips emerging near the tapered end. Keep the green husk folds anatomically attached and compact, with modest lengthwise veining. Paint kernel groups in connected butter-yellow and gold washes with a few defined edges and irregular soft lights. The kernels should read as part of the cob, with natural spacing and no scattered kernels. Reference 1 is the Orchard style board for paint handling only. Reference 2 is the apple master for palette restraint, framing, edge finish and visual weight only.

## Review

[Staged master](sweet-corn-thumbnail-v1.png) · [Review sheet](review-stage-1.png). Generated with built-in ImageGen. Jared approved this staged candidate. The proposed manifest entry uses `requested` for the canonical processor. Carry this approval forward after export and verification.

Passed `checkMaster` as a 1470 × 1470 RGBA PNG. The generated 1254 × 1254 image had 25 px of top clearance at the validator’s visibility threshold, one pixel short of the minimum. The silk was intact. Added 108 px of transparent padding on each side without resampling the painting. At 72, 112 and 320 px on ivory and warm charcoal, the tapered ear, wrapped husk and kernel rows read clearly. The silk reads primarily at the larger sizes.

Touch-up if requested. Soften the brightest repeated kernel highlights for a less glossy finish.

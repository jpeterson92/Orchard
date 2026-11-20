# Nectarines

Intended master `art/masters/nectarines-thumbnail-v1.png`. Display at 72 CSS px on Today and 96–112 CSS px on item thumbnails. Canonical export settings are 160, 320 and 640 px square WebPs at quality 82, alpha quality 90 and effort 6.

## Proposed manifest entry

```json
{
  "id": "nectarines-thumbnail-v1",
  "item": "nectarines",
  "role": "thumbnail",
  "alt": "A whole smooth red nectarine with a golden shoulder and shallow seam",
  "revision": 1,
  "status": "requested"
}
```

## References

- [Catalog record](../../../content/items/nectarines.yaml). Smooth hairless skin distinguishes it from a peach. A shallow seam and crimson over warm yellow are plausible for a yellow nectarine.
- [Clemson Cooperative Extension](https://hgic.clemson.edu/different-kinds-of-peaches/) and [Rutgers Cooperative Extension](https://extension.rutgers.edu/fs1204).
- [Visual reference 1](../../../docs/design/references/04-illustration-language.png).
- [Visual reference 2](../../../art/staging/02-tomatoes-early-produce/peaches-thumbnail-v2.png).

## Built-in ImageGen prompt

Transparency enabled.

Create one isolated Orchard item thumbnail in naturalistic botanical watercolor. Image 1 is the Orchard illustration-language study. Follow its luminous layered washes, broad overlapping paint shapes, subtle granulation, selective fine detail and varied soft pigment boundaries. Center the subject in a gently elevated three-quarter view with soft upper-left light. Keep the silhouette readable at 72 and 96–112 CSS px and leave approximately 10% clear space around all parts. Deliver a square PNG at least 1024 px per side, on genuine transparent alpha. No background, paper, cast shadow, text, halo, border or heavy outline.

Use Image 2 for stone-fruit viewpoint, scale and warm upper-left light. Paint one whole nectarine with smooth taut hairless skin, a compact rounded to slightly ovate silhouette, a short stem recessed in a shallow dimple, and a subtle curved suture. Use broad saturated crimson and carmine washes over golden-yellow skin visible at one shoulder and along a narrow side. Let a small coherent soft highlight turn around the curved shoulder to convey the smooth skin clearly at card size. Keep brushwork visible in the larger washes with minimal surface granulation and a clean contour. No fuzz, velvety haze, dense speckles, apple-like streaks, leaf, or plastic gloss.

## Review

[Staged master](nectarines-thumbnail-v1.png) · [Review sheet](review-stage-2.png). Generated with built-in ImageGen. Jared approved this staged candidate. The proposed manifest entry uses `requested` for the canonical processor. Carry this approval forward after export and verification.

Passed `checkMaster` as a 1254 × 1254 RGBA PNG. Checked at 72, 112 and 320 px on ivory and warm charcoal. The clean contour and continuous shoulder highlight convey smoother skin than the staged peach, with broad crimson washes and a shallow seam. At 72 px the distinction relies mainly on the highlight and stronger red color.

Touch-up if requested. Deepen the crimson over more of the golden side to make the two thumbnails easier to tell apart.

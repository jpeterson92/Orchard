# Plums

Intended master `art/masters/plums-thumbnail-v1.png`. Display at 72 CSS px on Today and 96–112 CSS px on item thumbnails. Canonical export settings are 160, 320 and 640 px square WebPs at quality 82, alpha quality 90 and effort 6.

## Proposed manifest entry

```json
{
  "id": "plums-thumbnail-v1",
  "item": "plums",
  "role": "thumbnail",
  "alt": "A whole dark purple plum with a dusty blue-violet bloom",
  "revision": 1,
  "status": "requested"
}
```

## References

- [Catalog record](../../../content/items/plums.yaml). Round dark reddish-purple plum with a natural dusty bloom. The bloom is diffuse on the skin, with a clear fruit edge.
- [University of Florida IFAS Extension](https://ask.ifas.ufl.edu/publication/HS250) and the Orchard catalog record.
- [Visual reference 1](../../../docs/design/references/04-illustration-language.png).
- [Visual reference 2](../../../art/masters/apples-cosmic-crisp-thumbnail-v2.png).

## Built-in ImageGen prompt

Transparency enabled.

Create one isolated Orchard item thumbnail in naturalistic botanical watercolor. Image 1 is the Orchard illustration-language study. Follow its luminous layered washes, broad overlapping paint shapes, subtle granulation, selective fine detail and varied soft pigment boundaries. Center the subject in a gently elevated three-quarter view with soft upper-left light. Keep the silhouette readable at 72 and 96–112 CSS px and leave approximately 10% clear space around all parts. Deliver a square PNG at least 1024 px per side, on genuine transparent alpha. No background, paper, cast shadow, text, halo, border or heavy outline.

Use Image 2 for maintaining readable dark fruit edges on charcoal and for paint handling only. Paint one whole dark purple market plum, gently oblate to round with a subtly asymmetrical shoulder, a small shallow stem depression with a short thin brown stem, and a faint suture curving away down one side. Paint dark red-purple skin with naturally uneven dusty blue-violet wax bloom over the shoulders and a bit of transparent burgundy showing through near the side. Give the bloom soft patch boundaries and a broad muted upper-left light so the fruit reads at small sizes on charcoal. Keep the dark side luminous and the overall color distinctly purple. No pale coating around the silhouette, leaf, fuzzy peach texture, apple striations, blueberry crown, cut sections or glossy white highlights.

## Review

[Staged master](plums-thumbnail-v1.png) · [Review sheet](review-stage-2.png). Generated with built-in ImageGen. Jared approved this staged candidate. The proposed manifest entry uses `requested` for the canonical processor. Carry this approval forward after export and verification.

Passed `checkMaster` as a 1254 × 1254 RGBA PNG. Checked at 72, 112 and 320 px on ivory and warm charcoal. The diffuse blue-violet bloom reads over the darker burgundy skin. The stem dimple, faint seam and round silhouette stay legible on both backgrounds.

# Raspberries

Intended master `art/masters/raspberries-thumbnail-v1.png`. Display at 72 CSS px on Today and 96–112 CSS px on item thumbnails. Canonical export settings are 160, 320 and 640 px square WebPs at quality 82, alpha quality 90 and effort 6.

## Proposed manifest entry

```json
{
  "id": "raspberries-thumbnail-v1",
  "item": "raspberries",
  "role": "thumbnail",
  "alt": "Three red raspberries with clustered drupelets and one visible hollow",
  "revision": 1,
  "status": "requested"
}
```

## References

- [Catalog record](../../../content/items/raspberries.yaml). A naturally tapered red aggregate fruit with small drupelets and a hollow center after picking. The hollow distinguishes it from a picked blackberry with its retained core.
- [Oregon State University Extension, growing raspberries](https://extension.oregonstate.edu/catalog/ec-1306-growing-raspberries-your-home-garden).
- [Visual reference 1](../../../docs/design/references/04-illustration-language.png).
- [Visual reference 2](../../../art/staging/02-tomatoes-early-produce/blueberries-thumbnail-v1.png).

## Built-in ImageGen prompt

Transparency enabled.

Paint one isolated Orchard item thumbnail as a naturalistic botanical watercolor for a contemporary produce journal. Match the Orchard illustration-language study for luminous layered washes, broad overlapping color shapes, subtle granulation, selective botanical detail and varied soft pigment edges. Use a gently elevated three-quarter view and soft diffuse upper-left light. Keep the produce centered and legible at 72 and 96–112 CSS px, with about 10% clear space around the entire silhouette. Deliver a square PNG at least 1024 px per side with genuine transparent alpha. No paper, ground shadow, halo, text, border, props, heavy outline or photorealistic gloss.

Show three ripe red raspberries packed in a low, slightly asymmetric cluster. Show a broad-shouldered gently tapered fruit in front, another turned toward the viewer just enough to show the small dark hollow left by the receptacle, and a third nestled behind. Each fruit is made of many closely packed small rounded drupelets. Show selected drupelet edges over broad connected washes of rose, raspberry red and muted carmine, with a soft dry finish and just a few fine pale hairs at the contour. Keep each berry legible in the compact group. No stems, leaves, blueberry crowns, dark blackberry coloration or visible solid core. Reference 1 is the Orchard style board for paint handling only. Reference 2 is the staged blueberry candidate for cluster spacing and visual weight only. Use raspberry anatomy throughout.

## Review

[Staged master](raspberries-thumbnail-v1.png) · [Review sheet](review-stage-1.png). Generated with built-in ImageGen. Jared approved this staged candidate. The proposed manifest entry uses `requested` for the canonical processor. Carry this approval forward after export and verification.

Passed `checkMaster` as a 1254 × 1254 RGBA PNG. At 72, 112 and 320 px on ivory and warm charcoal, the three-fruit cluster remains legible and the hollow on the right-hand berry distinguishes it from a picked blackberry.

Touch-up if requested. Shorten and soften the most prominent straw-colored hairs, which read as loose threads at detail size.

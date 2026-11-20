# Cantaloupe and peaches staging brief

These are the final first-pass subjects for the [Tomatoes and early produce batch](batch-brief.md).

- One built-in ImageGen call per subject with transparency enabled. Both used the [Orchard illustration-language board](../../../docs/design/references/04-illustration-language.png) and the checked style references listed below.
- Intended display sizes are 72 px for cards, 96–112 px for thumbnails and 320 px for the item pane. Both masters are square 1254 × 1254 RGBA PNGs. Integration export targets are 160, 320 and 640 px square WebP at quality 82, alpha quality 90 and effort 6.
- Both passed [`checkMaster`](../../../scripts/art-lib.ts). Inspection at 72 and 320 px on ivory and warm charcoal found legible subjects and no conspicuous halo. No touch-ups or retries are queued. The [batch contact sheet](contact-sheet.html) is ready for Jared's review.
- The manifest entries are proposed at `requested`. The canonical processor sets `review` after export.

## Proposed manifest entries

```json
{
  "assets": [
    {
      "id": "cantaloupe-thumbnail-v1",
      "item": "cantaloupe",
      "role": "thumbnail",
      "alt": "A whole tan cantaloupe with raised netting and an orange-fleshed wedge",
      "revision": 1,
      "status": "requested"
    },
    {
      "id": "peaches-thumbnail-v1",
      "item": "peaches",
      "role": "thumbnail",
      "alt": "A golden-yellow peach with a rosy blush and a curved seam",
      "revision": 1,
      "status": "requested"
    }
  ]
}
```

## Shared prompt suffix

> Create a single naturalistic botanical watercolor for an Orchard produce thumbnail. Use the supplied Orchard art strictly as a reference for the translucent layered color, softly varied pigment edges, selective detail, footprint, and finished brushwork. Use a front or gently elevated three-quarter view, diffuse upper-left light, broad modeled washes, subtle granulation, and modest natural-color shadows. Center the compact composition on a square canvas with approximately 10% clear crop safety all around. It must read at 72 px and at 96–112 px and reward viewing at 320 px. Deliver genuine alpha transparency around the painted subject. No paper, lighting halo, ground shadow, backdrop, heavy outline, glossy plastic highlight, text, border, or props.

## Cantaloupe

- Asset ID `cantaloupe-thumbnail-v1`. Intended master `art/masters/cantaloupe-thumbnail-v1.png`. [Staged PNG](cantaloupe-thumbnail-v1.png).
- The [Orchard catalog](../../../content/items/cantaloupe.yaml) and [UC Davis postharvest guide](https://postharvest.ucdavis.edu/ar/produce-facts-sheets/cantaloupe) describe raised netting and a stem end without an attached stem. [Purdue Extension](https://extension.purdue.edu/foodlink/food.php?food=cantaloupe) confirms the netted rind and orange flesh of North American cantaloupe. [Staged watermelon](watermelon-thumbnail-v1.png) supplied the composition and apparent scale.
- Passed the master and visual checks for staging. The orange wedge and beige netting remain legible at card size. The stem scar is visible at pane size.

The following subject prompt preceded the shared suffix.

> Paint one whole ripe American netted cantaloupe with a single small overlapping cut wedge at lower right. The nearly spherical whole melon dominates. Show irregular raised relief netting of warm beige over subdued golden-tan skin with just a hint of olive in shadow. Paint the netting as a gently branching organic reticulation wrapping the curved surface, with low contrast, no regular mesh or polygon print. On top, show a small slightly sunken smooth stem scar with no stem attached. The cut wedge shows one clean face of solid warm salmon-orange flesh and thin pale green inner rind, plus the same netted outer rind along its curved edge. Its gently scooped inner edge follows the seed cavity, already cleaned of seeds. Keep the wedge subordinate and close to the whole fruit. No stem, loose seeds, leaves or flowers.

## Peaches

- Asset ID `peaches-thumbnail-v1`. Intended master `art/masters/peaches-thumbnail-v1.png`. [Staged PNG](peaches-thumbnail-v1.png).
- The [Orchard catalog](../../../content/items/peaches.yaml) describes yellow or creamy ground color and varietal blush. The [University of Florida peach identification guide](https://gardeningsolutions.ifas.ufl.edu/mastergardener/resources/plantid/fruits-and-nuts/peach/) confirms the fuzzy skin, suture and slightly pointed blossom end. The [checked apple pilot](../../masters/apples-thumbnail-v1.png) supplied the painting finish and scale.
- Passed the master and visual checks for staging. The curved suture, matte skin and peach shape are visible at both sizes.

The following subject prompt preceded the shared suffix.

> Paint one whole ripe yellow peach. Its gently rounded, slightly heart-shaped silhouette has full cheeks and a subtle point toward the blossom end. Show a single shallow curving suture from the small recessed stem dimple down one side, visible even as a small thumbnail; soften it into the flesh modeling, without outlining it. Keep the stem tiny and recessed, with no leaf. Use a creamy golden-yellow base showing clearly across much of the fruit, a diffuse coral to rose-red blush that blends softly into the yellow and delicate matte fuzz suggested by subtle pigment grain and a soft edge, not a halo. The blush should feather organically without apple-like striping, hard shine, or freckle pattern. Keep the whole specimen the entire composition.

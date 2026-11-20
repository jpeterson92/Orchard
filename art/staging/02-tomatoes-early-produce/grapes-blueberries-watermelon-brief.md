# Grapes, blueberries and watermelon staging brief

This is the second step in the [Tomatoes and early produce batch](batch-brief.md). The next first-pass subjects are Cantaloupe and Peaches.

- One built-in ImageGen call per subject with transparency enabled. The [illustration-language board](../../../docs/design/references/04-illustration-language.png) and [checked apple pilot](../../../art/masters/apples-thumbnail-v1.png) served as style references.
- Intended display sizes are 72 px for cards, 96–112 px for thumbnails and 320 px for the item pane. Each master is a 1254 × 1254 RGBA PNG. Integration export targets are 160, 320 and 640 px square WebPs with quality 82, alpha quality 90 and effort 6.
- All three passed [`checkMaster`](../../../scripts/art-lib.ts) and were checked at 72 and 320 px on ivory and warm charcoal. The images are legible and show no conspicuous halos. No retries or touch-ups are queued. See the [staged contact sheet](contact-sheet.html) for Jared's review.
- The manifest entries are proposed at `requested`. The canonical processor sets `review` after export.

## Proposed manifest entries

```json
{
  "assets": [
    {
      "id": "grapes-thumbnail-v1",
      "item": "grapes",
      "role": "thumbnail",
      "alt": "A bunch of plump red table grapes on a branching green stem",
      "revision": 1,
      "status": "requested"
    },
    {
      "id": "blueberries-thumbnail-v1",
      "item": "blueberries",
      "role": "thumbnail",
      "alt": "Five dusty blue blueberries with recessed star-shaped crowns",
      "revision": 1,
      "status": "requested"
    },
    {
      "id": "watermelon-thumbnail-v1",
      "item": "watermelon",
      "role": "thumbnail",
      "alt": "A striped green watermelon beside a red wedge with dark seeds",
      "revision": 1,
      "status": "requested"
    }
  ]
}
```

## Shared prompt suffix

> Create a single naturalistic botanical watercolor for an Orchard produce thumbnail. Use the reference board for its translucent color, lightly broken pigment edges and selective detail, and the isolated red apple pilot for the finished level of brushwork, apparent visual weight and framing. Treat both as style references only. Use soft diffuse upper-left light and a gently elevated three-quarter view. Build solid volume with broad overlapping washes, subtle granulation and modest cooler shadows. Center the compact composition in a square canvas with approximately 10% clear crop safety all around; it should read at 72 px, 96–112 px and 320 px. Deliver genuine transparency around the painting. No paper, ground shadow, backdrop, outline, hard glossy highlights, text, border or extra objects.

## Grapes

- Asset ID `grapes-thumbnail-v1`. Intended master `art/masters/grapes-thumbnail-v1.png`. [Staged PNG](grapes-thumbnail-v1.png).
- The [Orchard catalog](../../../content/items/grapes.yaml) calls for plump grapes attached to green stems. The [USDA-hosted fruit variety register](https://www.ars.usda.gov/ARSUserFiles/1718/PDF/2006/hortsci_45_1101_1113.pdf) documents oval red berries and well-filled clusters in table grapes.
- Passed the master and visual checks for staging. The green branch and nested red-to-violet berry shapes read at card size. The illustrative bunch represents red table grapes.

The following subject prompt preceded the shared suffix.

> Paint one compact, naturally tapered bunch of plump red table grapes with a short green flexible main stem and a little visible branching. The tightly nested round to softly oval grapes vary from warm red burgundy in light to cool red-violet in shadow, with a restrained waxy bloom and no hard white reflection. Keep the bunch wide enough to give the composition visual weight like the finished apple. No foliage, tendrils, loose grapes or mixed grape colors.

## Blueberries

- Asset ID `blueberries-thumbnail-v1`. Intended master `art/masters/blueberries-thumbnail-v1.png`. [Staged PNG](blueberries-thumbnail-v1.png).
- The [Orchard catalog](../../../content/items/blueberries.yaml) calls for deep blue berries with a silvery bloom. The [University of Florida blueberry identification guide](https://gardeningsolutions.ifas.ufl.edu/mastergardener/resources/plantid/fruits-and-nuts/blueberry/) confirms the round-to-oblate fruit and persistent blossom-end calyx.
- Passed the master and visual checks for staging. The silvery bloom and recessed calyx make the pile recognizable. The fronts of the berries remain distinct at card size.

The following subject prompt preceded the shared suffix.

> Paint a compact grouping of five whole ripe highbush blueberries, overlapping slightly, with variable orientation and two or three clearly visible small recessed five-point blossom crowns at their tips. Make the berries slightly flattened round globes with deep dusty indigo and blue-violet shadows and a muted silvery-blue waxy bloom. Keep the silhouette low and compact with one berry placed higher to break the line. No leaves, twigs, scattered berries, spiky crowns, shiny black skin or ivory wash around the perimeter.

## Watermelon

- Asset ID `watermelon-thumbnail-v1`. Intended master `art/masters/watermelon-thumbnail-v1.png`. [Staged PNG](watermelon-thumbnail-v1.png).
- The [Orchard catalog](../../../content/items/watermelon.yaml) calls for symmetry and a creamy yellow ground spot. [Purdue Extension](https://extension.purdue.edu/foodlink/food.php?food=watermelon) documents oval striped fruit and red flesh with dark seeds in seeded types.
- Passed the master and visual checks for staging. The striped whole fruit and red wedge read at card size. The ground spot is visible low on the left, with pale inner rind and dark seeds in the wedge.

The following subject prompt preceded the shared suffix.

> Paint one whole symmetrical, gently oval watermelon behind one small overlapping wedge in the lower-right foreground. Put broad irregular deep- and lighter-green longitudinal bands on the smooth rind, with a soft partly visible creamy yellow ground spot low on the left flank. Show a single readable coral-red cut face on the wedge with a clean narrow pale inner rind between the red flesh and the green outer skin. Include a few small, flat dark-brown seeds embedded naturally in the cut face. Keep the wedge subordinate and the grouping compact. No vine or leaves, no scattered seeds.

# Remaining launch produce · Step 1

[Review sheet](review-step-1.png) shows the candidates at 72 and 320 px over ivory and warm charcoal. The paintings remain pending Jared’s review.

Each candidate used one built-in ImageGen call with transparency enabled. All three staged masters are 1254 × 1254 RGBA PNGs and passed [`checkMaster`](../../../scripts/art-lib.ts). The visual check found readable silhouettes and no conspicuous pale halos on either background.

Intended displays are 72 px on cards, 96–112 px for standard thumbnails, and 320 px for item panes. Integration settings are 160, 320, and 640 px square WebP, quality 82, alpha quality 90, effort 6. The proposed manifest status is `requested` before canonical processing.

## Proposed manifest entries

```json
{
  "assets": [
    {
      "id": "asparagus-thumbnail-v1",
      "item": "asparagus",
      "role": "thumbnail",
      "alt": "A bundle of green asparagus spears with tight tips and pale cut ends",
      "revision": 1,
      "status": "requested"
    },
    {
      "id": "honeydew-thumbnail-v1",
      "item": "honeydew",
      "role": "thumbnail",
      "alt": "A whole cream-skinned honeydew with a pale green wedge",
      "revision": 1,
      "status": "requested"
    },
    {
      "id": "brussels-sprouts-thumbnail-v1",
      "item": "brussels-sprouts",
      "role": "thumbnail",
      "alt": "Two tightly wrapped green Brussels sprouts and a cut half with a pale core",
      "revision": 1,
      "status": "requested"
    }
  ]
}
```

## Shared prompt

Each call used `Use case: illustration-story. Asset: <asset-id>.` followed by the subject prompt below and this shared ending.

> Create a single naturalistic botanical watercolor for an Orchard produce thumbnail. Use the supplied local artwork strictly as style reference for translucent layered color, varied pigment edges, selective botanical detail, and visual weight. Use a gently elevated three-quarter view with soft diffuse upper-left light, broad overlapping washes, subtle pigment granulation, occasional pooling, and a few softly broken edges. Center the complete compact composition on a square PNG of at least 1024 px, aiming for 10% clear crop safety on all sides. Make the silhouette legible at 72 and 96–112 px. Isolate on genuine alpha transparency (fully clear around the subject), with no painted white, paper mat, ground wash, cast shadow, horizon, border, text, props, heavy outlines, or plastic gloss.

## Asparagus

- Staged master [asparagus-thumbnail-v1.png](asparagus-thumbnail-v1.png). Intended master `art/masters/asparagus-thumbnail-v1.png`.
- Subject references are the [Orchard catalog record](../../../content/items/asparagus.yaml) and the [University of Minnesota Extension asparagus harvest guide](https://extension.umn.edu/agriculture/specialty-crops/vegetable-farming/harvesting-asparagus).
- Image inputs were the [Orchard illustration-language study](../../../docs/design/references/04-illustration-language.png) and the [Granny Smith master](../../../art/masters/apples-granny-smith-thumbnail-v2.png).
- Five staggered, closed tips and pale cut ends read at card size. Touch-up for Jared’s review: the triangular scales along the lower stems are more prominent than on typical grocery spears. If revised, soften and shrink those marks while preserving the silhouette.

> Paint a small loose overlapping bundle of five fresh green asparagus spears from the grocery produce case. Arrange it diagonally with the pale cut ends toward lower left and the five distinct tapered tight tips staggered toward upper right, fanning just enough to make the silhouette readable. Show straight cylindrical stalks, subtle triangular scale marks, and closely closed tips with restrained violet-green accents. The cut faces should be small and creamy green. Use the broccoli on the Orchard study for the selective description of green vegetable structure and the apple master for brush finish and clean alpha edges. No band, string, roots, ferns, flowers, or detached tips.

## Honeydew

- Staged master [honeydew-thumbnail-v1.png](honeydew-thumbnail-v1.png). Intended master `art/masters/honeydew-thumbnail-v1.png`.
- Subject references are the [Orchard catalog record](../../../content/items/honeydew.yaml) and the [UC Davis honeydew maturity and quality guide](https://postharvest.ucdavis.edu/ar/produce-facts-sheets/honeydew).
- Image inputs were the [Orchard illustration-language study](../../../docs/design/references/04-illustration-language.png) and the [staged cantaloupe master](../../../art/staging/02-tomatoes-early-produce/cantaloupe-thumbnail-v2.png).
- The smooth cream-yellow rind and green wedge distinguish honeydew from the cantaloupe reference at card size. The outline stays readable on ivory.

> Paint one round to slightly oval whole ripe green-fleshed honeydew with one small overlapping wedge at lower right. The whole melon dominates. Make its skin smooth and creamy ivory to pale yellow, with soft waxy color variation, a modest warm sage shadow for a readable contour on ivory, and a small understated stem scar. Avoid cantaloupe netting, stripes and ribs. The wedge has a smoothly scooped seed cavity edge and one broad painted face of pale translucent celadon-green flesh bounded by the same thin cream exterior rind. No loose seeds, orange flesh, stems or leaves. Follow the cantaloupe master for the size and overlap of whole fruit and wedge, plus the paint finish. Preserve honeydew anatomy and colors.

## Brussels sprouts

- Staged master [brussels-sprouts-thumbnail-v1.png](brussels-sprouts-thumbnail-v1.png). Intended master `art/masters/brussels-sprouts-thumbnail-v1.png`.
- Subject references are the [Orchard catalog record](../../../content/items/brussels-sprouts.yaml) and the [University of Minnesota Extension Brussels sprouts guide](https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-brussels-sprouts).
- Image inputs were the [Orchard illustration-language study](../../../docs/design/references/04-illustration-language.png) and the [Granny Smith master](../../../art/masters/apples-granny-smith-thumbnail-v2.png).
- The two wrapped heads and the lengthwise half read at card size. The pale trimmed end and cut core are clear at pane size.

> Paint a compact asymmetrical cluster of two whole grocery Brussels sprout heads with one lengthwise half tucked close in front. Give the two whole sprouts small rounded ovoid forms, tightly overlapping broad smooth cupped leaves, faint veins, fresh medium green with cooler outer folds, and a small pale trimmed end visible on the turned head. The cut half faces the viewer enough to show tightly layered pale green leaves around a short cream-colored tapered central stem. Keep the cluster low, compact, and legible with distinct forms at thumbnail size. Use the broccoli on the Orchard study for closely observed green structure and the apple master for pigment and isolated edge finish. No branches, stalk, scattered leaves, frilly foliage, or pointed spiky bracts.

## Queue

Artichokes and okra are the next eligible subjects. Winter squash and collard greens are deferred until their item records exist. Confirm the representative winter squash type from its record before generating.


## Approval

Jared approved the step 1 and step 2 candidates (artichokes, asparagus, Brussels sprouts, honeydew, okra) on 2026-11-19 (in Claude Code, from the review sheets). They are listed in [handoff.json](handoff.json).

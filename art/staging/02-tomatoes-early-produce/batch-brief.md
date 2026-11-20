# Tomatoes and early produce staging brief

Jared approved one version of each of the eight subjects. The [contact sheet](contact-sheet.html) marks the selected versions. The [tomato style review](tomato-style-review-brief.md), [second style review](grapes-blueberries-watermelon-style-review-brief.md), and [final style review](cantaloupe-peaches-blueberries-style-review-brief.md) document the edit prompts and verification.

The first-pass briefs cover the Tomatoes item and both rated tomato catalog entries below, [Grapes, Blueberries and Watermelon](grapes-blueberries-watermelon-brief.md), and [Cantaloupe and Peaches](cantaloupe-peaches-brief.md).

## Approved selections for integration

Jared selected Blueberries v1 and Watermelon v1 and accepted the latest revision of every other subject. This table is the approval record for integration. Each linked PNG is the source for `art/masters/<asset-id>.png`. Use the matching catalog fields and alt text from the linked briefs, process the selected masters to generate the three WebP sizes, and record `approved` for these eight IDs in the canonical manifest. The other staged PNGs are retained for comparison.

| Subject | Approved asset |
| --- | --- |
| Tomatoes | [tomatoes-thumbnail-v2](tomatoes-thumbnail-v2.png) |
| Cherry or grape | [tomatoes-cherry-grape-thumbnail-v2](tomatoes-cherry-grape-thumbnail-v2.png) |
| Local field-grown | [tomatoes-local-field-thumbnail-v3](tomatoes-local-field-thumbnail-v3.png) |
| Grapes | [grapes-thumbnail-v2](grapes-thumbnail-v2.png) |
| Blueberries | [blueberries-thumbnail-v1](blueberries-thumbnail-v1.png) |
| Watermelon | [watermelon-thumbnail-v1](watermelon-thumbnail-v1.png) |
| Cantaloupe | [cantaloupe-thumbnail-v2](cantaloupe-thumbnail-v2.png) |
| Peaches | [peaches-thumbnail-v2](peaches-thumbnail-v2.png) |

## Shared production settings

- One built-in ImageGen call per asset with transparent background enabled. All three used [04-illustration-language.png](../../../docs/design/references/04-illustration-language.png) as a style reference. The checked apple pilot was unavailable when the calls started.
- Intended display sizes are 72 px for cards, 96–112 px for thumbnails and 320 px for the item pane. Masters are square 1254 × 1254 RGBA PNGs. The integration export target is square 160, 320 and 640 px WebP at quality 82, alpha quality 90 and effort 6.
- All three original tomato paintings passed `checkMaster` in [scripts/art-lib.ts](../../../scripts/art-lib.ts). Visual checks at 72 and 320 px on ivory and warm charcoal found legible subjects, adequate crop safety and no conspicuous halo.
- The entries below preserve the first-pass candidate metadata. The approved selection table identifies the versions for integration.

## Proposed manifest entries

```json
{
  "assets": [
    {
      "id": "tomatoes-thumbnail-v1",
      "item": "tomatoes",
      "role": "thumbnail",
      "alt": "A round red tomato with a green star-shaped calyx",
      "revision": 1,
      "status": "requested"
    },
    {
      "id": "tomatoes-cherry-grape-thumbnail-v1",
      "item": "tomatoes",
      "variety": "cherry-grape",
      "role": "thumbnail",
      "alt": "Two round red cherry tomatoes beside an oblong red grape tomato",
      "revision": 1,
      "status": "requested"
    },
    {
      "id": "tomatoes-local-field-thumbnail-v1",
      "item": "tomatoes",
      "variety": "local-field",
      "role": "thumbnail",
      "alt": "A deep red tomato with uneven shoulders and fine marks near the stem",
      "revision": 1,
      "status": "requested"
    }
  ]
}
```

## Shared prompt suffix

> Create a single naturalistic botanical watercolor illustration for an Orchard produce thumbnail. The supplied Orchard illustration-language sheet is a style reference for luminous layered washes, subtle pigment granulation, softly varied painted edges, and selective botanical detail only. Paint a gently elevated three-quarter view with diffuse upper-left light. Introduce volume with broad overlapping washes and modest cooler shadows. Center the compact composition on a square canvas, with approximately 10% clear crop safety on all sides and a silhouette that reads at 72 px and 96–112 px and rewards viewing at 320 px. Use authentic alpha transparency surrounding the paint. No paper, halo, ground shadow, background color, text, border, extra foliage, hard outline or plastic gloss.

## Tomatoes

- Asset ID `tomatoes-thumbnail-v1`. Intended master `art/masters/tomatoes-thumbnail-v1.png`. [Staged PNG](tomatoes-thumbnail-v1.png).
- Subject reference and identifying traits. [Orchard catalog](../../../content/items/tomatoes.yaml) and [Iowa State Extension tomato types](https://yardandgarden.extension.iastate.edu/how-to/recommended-cultivars-and-types-tomatoes-home-garden) for the smooth, standard round form.
- Check status. Passed `checkMaster` and visual review for staging. Smooth round silhouette and star calyx read at card size. No touch-up queued.

The following subject prompt preceded the shared suffix.

> Paint one whole ripe classic round red slicing tomato with smooth, gently flattened globe form, warm scarlet color and a compact star of narrow muted olive-green calyx sepals with a short stem stub. Make the visible top and broad smooth shoulder unmistakably tomato. Use a few subtle shifts from coral-red light to deep red shadow, with a clean silhouette. The single whole specimen is the entire composition.

## Cherry or grape

- Asset ID `tomatoes-cherry-grape-thumbnail-v1`. Intended master `art/masters/tomatoes-cherry-grape-thumbnail-v1.png`. [Staged PNG](tomatoes-cherry-grape-thumbnail-v1.png).
- Subject reference and identifying traits. [Orchard catalog](../../../content/items/tomatoes.yaml) and [NC State Extension grape tomato trials](https://newcropsorganics.ces.ncsu.edu/specialty-crops/specialty-crops-research/evaluating-new-lines-of-grape-tomatoes/) for relative size and shape.
- Check status. Passed `checkMaster` and visual review for staging. Two round cherries and an oblong grape read as a compact group. The grape is prominent in the foreground. No touch-up queued.

The following subject prompt preceded the shared suffix.

> Paint a compact group of three ripe red snacking tomatoes: a small round cherry at left, a slightly smaller round cherry with a tiny narrow-sepaled calyx and short stem at back, and an elongated oval grape tomato in the foreground, lying at a slight diagonal. Keep fruit close and slightly overlapping, and make round versus oblong silhouettes readable at thumbnail size. Warm vermilion reds with modest hue variation and subtle highlights, no loose stems or leaves.

## Local field-grown

- [Revision 2](local-field-tomato-v2-brief.md) is staged for review after Jared requested a more irregular silhouette and a yellow-orange blush.
- Asset ID `tomatoes-local-field-thumbnail-v1`. Intended master `art/masters/tomatoes-local-field-thumbnail-v1.png`. [Staged PNG](tomatoes-local-field-thumbnail-v1.png).
- Subject reference and identifying traits. [Orchard catalog cue](../../../content/items/tomatoes.yaml) for red shoulders, uneven shape and optional small stem cracks. [University of Maryland Extension tomato reference](https://www.extension.umd.edu/resource/key-common-problems-tomatoes) for where shallow cracks can occur. The specimen represents a summer field slicer. The catalog’s market sign or farm-label cue indicates provenance.
- Check status. Passed `checkMaster` and visual review for staging. Red shoulders, shallow lobing and fine stem marks match the brief. The irregular outline distinguishes this painting from the item thumbnail. No touch-up queued.

The following subject prompt preceded the shared suffix.

> Paint one representative ripe summer field-grown slicing tomato, deep warm red all the way to the shoulders, with gently uneven broad shoulders and shallow irregular lobing. Show a small muted olive calyx and one or two short, healed hairline marks confined to the stem recess. Make it a natural red field round with softly imperfect form. Do not exaggerate ribs or cracks, add green shoulders, suggest an identified cultivar, or add labels.

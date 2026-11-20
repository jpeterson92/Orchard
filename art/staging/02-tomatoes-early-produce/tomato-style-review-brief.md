# Tomato style review

Reviewed the three latest tomato paintings at 72 and 320 px on ivory and warm charcoal against the [Orchard illustration guide](../../../docs/design/illustration-guide.md). The edits focus on diffuse light, the balance of fruit and stem detail, and readable distinctions among the silhouettes.

One built-in ImageGen edit per subject used its prior staged PNG and the [Orchard illustration-language board](../../../docs/design/references/04-illustration-language.png). All three revisions are 1254 × 1254 RGBA PNGs and passed [`checkMaster`](../../../scripts/art-lib.ts). Each was compared against its source at both sizes on both backgrounds. No conspicuous halos appeared. The [contact sheet](contact-sheet.html#tomatoes-thumbnail-v1) pairs the versions in sequence for Jared's review.

Intended display sizes are 72 px for cards, 96–112 px for thumbnails and 320 px for the item pane. Integration export targets are square 160, 320 and 640 px WebPs at quality 82, alpha quality 90 and effort 6. The proposed status is `requested` so the canonical processor can move each exported revision to `review`.

## Proposed manifest entries

```json
{
  "assets": [
    {
      "id": "tomatoes-thumbnail-v2",
      "item": "tomatoes",
      "role": "thumbnail",
      "alt": "A round scarlet tomato with a small olive-green star-shaped calyx",
      "revision": 2,
      "status": "requested"
    },
    {
      "id": "tomatoes-cherry-grape-thumbnail-v2",
      "item": "tomatoes",
      "variety": "cherry-grape",
      "role": "thumbnail",
      "alt": "Two round red cherry tomatoes beside an oblong red grape tomato",
      "revision": 2,
      "status": "requested"
    },
    {
      "id": "tomatoes-local-field-thumbnail-v3",
      "item": "tomatoes",
      "variety": "local-field",
      "role": "thumbnail",
      "alt": "A broad, uneven red tomato with a soft golden-orange blush low on one side",
      "revision": 3,
      "status": "requested"
    }
  ]
}
```

## Shared edit prompt suffix

> The first supplied image is the artwork to edit. The second image is the Orchard style board, for paint handling only. Keep a gently elevated three-quarter view, soft diffuse upper-left light, the established visual footprint on a square canvas, and clean isolated true alpha transparency with generous crop safety. Favor luminous pigment washes with selective texture, naturally soft edge variation and fine detail around the stem. No paper rectangle, haze, separate shadow, extra foliage, text, border or black outline.

## Tomatoes

- [Prior painting](tomatoes-thumbnail-v1.png) and [staged revision](tomatoes-thumbnail-v2.png). Intended master `art/masters/tomatoes-thumbnail-v2.png`.
- Review of the prior painting. The round shape and star are clear at card size. The broad, pale glint gives the skin a polished look, and the wide calyx pulls attention from the fruit.
- Review of the new candidate. The calyx occupies less of the face, and a smaller coral highlight replaces the long pale band. The round silhouette still reads at 72 px, with broad red washes carrying the volume.

The following subject prompt preceded the shared suffix.

> Refine this single round red slicing tomato without changing its recognizable smooth, gently flattened globe. Reduce the spread of the olive star calyx and stem by about one fifth, keeping its narrow pointed sepals distinct at 72 px, their natural gentle curl, and the short stub. Soften the broad near-white glint on the upper left into a small irregular pale coral highlight with soft edges. Paint the surrounding red with a few broad overlapping scarlet-to-muted-red washes to describe the volume. Keep a predominantly scarlet skin with no large yellow patch or pronounced ribbing. The fruit is the focal point.

## Cherry or grape

- [Prior painting](tomatoes-cherry-grape-thumbnail-v1.png) and [staged revision](tomatoes-cherry-grape-thumbnail-v2.png). Intended master `art/masters/tomatoes-cherry-grape-thumbnail-v2.png`.
- Review of the prior painting. The three silhouettes read clearly, but the front oval is larger than either cherry and the tall rear stem draws the eye. The repeated bright highlights make the group look polished.
- Review of the new candidate. The rear stem is shorter, the reflections are softer, and the front oval has less visual weight. Its long axis remains roughly comparable to the largest cherry, and the cluster is slightly smaller overall. All three shapes remain legible at card size.

The following subject prompt preceded the shared suffix.

> Refine this compact group of two round red cherry tomatoes and one elongated red grape tomato. Keep the original three specimens, orientations and tight slightly overlapping arrangement. Reduce the foreground grape tomato to about the diameter of the larger cherry along its longest axis or slightly shorter; retain a clear oblong silhouette and do not bury it behind the others. Keep the green stars where they are but shorten the tall rear stem to a tiny stub, and keep stem detail subordinate. Reduce and soften the bright white highlights into irregular pink-coral accents modeled with layered washes. Maintain separation between the fruits with subtle red-violet overlap shadows and slightly varied warm red hues. Preserve a compact, balanced silhouette at 72 px.

## Local field-grown

- [Prior painting](tomatoes-local-field-thumbnail-v2.png) and [staged revision](tomatoes-local-field-thumbnail-v3.png). Intended master `art/masters/tomatoes-local-field-thumbnail-v3.png`.
- Review of the prior painting. The broad shoulders, uneven lobes and yellow-orange blush distinguish v2 from the item tomato. Two pale highlights pull attention from those features, and the bright yellow flank could blend more gradually into the coral-red washes.
- Review of the new candidate. The lighting is softer and the golden blush blends through more orange and coral, while the asymmetry and ripe red shoulders remain. The warmer patch covers more of the flank than in v2, and the stem marks are more visible at 320 px. V2 offers a more restrained blush.

The following subject prompt preceded the shared suffix.

> Refine the palette and lighting of this representative local field-grown heirloom-like slicer. Preserve the wider, slightly flattened, asymmetrical shape, the uneven shallow lobes, the olive calyx and small healed stem marks. Preserve the previous requested yellow-orange blush on the lower left and keep it clearly visible at 72 px. Render it with a small warm golden-yellow core feathering through warm apricot, muted orange and coral into ripe red, with natural mottling. Keep the shoulders ripe red. Soften the two brightest near-white glints into small integrated pale coral washes, preserving volume and gently varied pigment pooling around the lobes. Keep the existing fruit pose and composition.

The next style review covers Grapes, Blueberries and Watermelon. Cantaloupe and Peaches follow within this batch.

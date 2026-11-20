# Grapes, blueberries and watermelon style review

Compared the original paintings and edited candidates at 72 and 320 px on ivory and warm charcoal against the [Orchard illustration guide](../../../docs/design/illustration-guide.md). Each subject had one built-in ImageGen edit using its staged PNG and the [illustration-language board](../../../docs/design/references/04-illustration-language.png). See the [original first-pass brief](grapes-blueberries-watermelon-brief.md) for subject references.

Grapes v2 and Watermelon v2 are staged as 1254 × 1254 RGBA PNGs and passed [`checkMaster`](../../../scripts/art-lib.ts) and the visual check. Blueberries v1 remains in the [contact sheet](contact-sheet.html#grapes-thumbnail-v1), with a targeted retry for v2.

Intended display sizes are 72 px for cards, 96–112 px for thumbnails and 320 px for the item pane. Integration export targets are 160, 320 and 640 px square WebPs at quality 82, alpha quality 90 and effort 6. The proposed entries are at `requested` so the canonical processor can move successful exports to `review`.

## Proposed manifest entries

```json
{
  "assets": [
    {
      "id": "grapes-thumbnail-v2",
      "item": "grapes",
      "role": "thumbnail",
      "alt": "A tapered bunch of red-purple table grapes on a short green stem",
      "revision": 2,
      "status": "requested"
    },
    {
      "id": "watermelon-thumbnail-v2",
      "item": "watermelon",
      "role": "thumbnail",
      "alt": "A green-striped watermelon with a creamy ground spot beside a red seeded wedge",
      "revision": 2,
      "status": "requested"
    }
  ]
}
```

## Shared edit prompt suffix

> Edit the first supplied painting. The second image is the Orchard illustration-language board for paint handling only. Preserve the existing compact crop, gently elevated three-quarter view and soft diffuse upper-left light. Use layered translucent watercolor with broad washes, subtle granulation and selective detail. Give the fruit a readable footprint at 72, 96–112 and 320 px. Square canvas with roughly 10% clear margin, genuine alpha transparency, and lightly varied clean paint edges. No paper rectangle, ground shadow, halo, outline, added objects or text.

## Grapes

- [Prior painting](grapes-thumbnail-v1.png). [Staged revision](grapes-thumbnail-v2.png). Intended master `art/masters/grapes-thumbnail-v2.png`.
- Review of the prior painting. The silhouette is immediately recognizable, but the shiny crescents repeat across the front berries and the thick exposed stem can compete with them at card size.
- Review of the new candidate. A shorter, slimmer stem gives the berries more visual weight. The pink highlights are softer, and the warm red and wine-purple washes still separate individual berries at both sizes. The candidate passed the technical and visual checks.

The following subject prompt preceded the shared suffix.

> Refine the same compact tapered bunch of red table grapes. Keep the overlap, apparent scale and red-to-burgundy palette. Shorten the exposed tip of the green main stem by about a quarter and slim it slightly; leave enough branching visible for the cluster to read. Reduce repeated bright crescent reflections: use diffuse, irregular pinkish washes that vary from berry to berry, and suggest subtle natural dusty bloom on some skins. Let a few deeper wine-red and muted violet overlap washes create separation. Maintain recognizable oval berries and a full cohesive bunch. Keep one bunch only, with no added fruit or leaves.

## Blueberries

- [Prior painting](blueberries-thumbnail-v1.png). Retry ID `blueberries-thumbnail-v2`. Intended master `art/masters/blueberries-thumbnail-v2.png`.
- Review of the prior painting. The dusty bloom and compact group read well. At detail size the large, evenly outlined star cavities and their repeated tan centers look more graphic than the surrounding watercolor.
- Review of the new candidate. The five-berry group and softer calyces read clearly. The output passed the automated check, but the visual check found a faint background wash around the berries. Raw alpha inspection found low-level opacity across the outer canvas, including at the edges, and only about 12.5% of the canvas was fully clear. V1 remains the usable staged painting.
- **Retry** under `blueberries-thumbnail-v2` from the clean v1 source. Limit the edit to the calyx openings and diffuse highlights inside the berry silhouettes. Require zero alpha in open space around and between the berries, with semitransparency confined to the immediate painted edge. Check both mattes and the raw alpha footprint before staging.
- **Resolved.** The [targeted retry](cantaloupe-peaches-blueberries-style-review-brief.md#blueberries) passed both checks and is staged as v2.

The following subject prompt preceded the shared suffix.

> Refine the same five overlapping blueberries. Preserve the silhouette, berry count and dusty indigo palette. Reduce the visible calyx openings by roughly a quarter and give each a different believable orientation. The front and top calyces remain readable as shallow five-point blossom crowns, with softer muted blue-violet walls and subtly irregular rims. Let the far right crown stay foreshortened and subtle. Replace conspicuous orange pinpoints with low-contrast muted detail inside the recesses. Preserve the silvery bloom but soften the brightest strokes into broad, fine-grained blue washes. No stems or leaves.

## Watermelon

- [Prior painting](watermelon-thumbnail-v1.png). [Staged revision](watermelon-thumbnail-v2.png). Intended master `art/masters/watermelon-thumbnail-v2.png`.
- Review of the prior painting. The striped whole melon and wedge are clear at card size. The pale top glint and abrupt streak edges make the rind feel busier at 320 px, and the ground spot blends into the light striping.
- Review of the new candidate. The upper-left light is softer, and the creamy ground spot is more distinct while the red wedge and green stripes retain their contrast. The seed and wedge changes are subtle. The candidate passed the technical and visual checks.

The following subject prompt preceded the shared suffix.

> Refine this same whole striped watermelon and overlapping red wedge. Preserve their size, position, perspective and silhouette. Soften the pale glint on the whole fruit, especially at upper left, and let it read as softly lit green rather than white shine. Keep the natural longitudinal stripe shapes and contrast needed at 72 px, but feather a few hard boundaries into irregular broad translucent washes. Keep the existing low left ground patch visible as a small coherent buttery-cream area with a soft irregular transition that interrupts the stripes locally. Keep the existing wedge proportions and red flesh, green outer rind and pale inner rind; make the dark brown seeds lie flat and naturally embedded in the flesh, with modest contrast. No leaves or loose seeds.

The next style review covers Cantaloupe and Peaches, with one targeted Blueberries retry in the same step.

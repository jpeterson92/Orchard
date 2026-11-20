# Local field-grown tomato revision

Jared asked for a more heirloom-like field tomato with a less spherical shape and some yellow or orange blush. The [original painting](tomatoes-local-field-thumbnail-v1.png) provided the edit reference. The [catalog cue](../../../content/items/tomatoes.yaml) guided the deep red shoulders and uneven shape. The blush sits low on one flank, and the fruit represents a field-grown slicer.

- [Staged revision](tomatoes-local-field-thumbnail-v2.png). Intended master `art/masters/tomatoes-local-field-thumbnail-v2.png`.
- One built-in ImageGen edit with transparency enabled. The square 1254 × 1254 RGBA PNG passed [`checkMaster`](../../../scripts/art-lib.ts). Compared with v1 at 72 and 320 px on ivory and warm charcoal. The wider silhouette, uneven lobes and warm blush are visible at both sizes. No conspicuous halo. [Staged comparison](contact-sheet.html#tomatoes-local-field-thumbnail-v2).
- Export targets are 160, 320 and 640 px square WebPs at quality 82, alpha quality 90 and effort 6. Approval is pending Jared's review.

## Proposed manifest entry

```json
{
  "assets": [
    {
      "id": "tomatoes-local-field-thumbnail-v2",
      "item": "tomatoes",
      "variety": "local-field",
      "role": "thumbnail",
      "alt": "A slightly flattened, uneven red tomato with a yellow-orange blush low on one side",
      "revision": 2,
      "status": "requested"
    }
  ]
}
```

## Edit prompt

> Edit the supplied transparent Orchard editorial botanical watercolor of a single local field-grown tomato. Change only the silhouette and skin color distribution. Give the fruit a slightly flattened, asymmetrical heirloom-like silhouette, a little wider than the original and with three or four uneven shallow lobes that gently interrupt the outline. Make one shoulder sit a little higher than the other. Keep the natural tomato form and avoid straight regular ribs or an exaggerated pumpkin shape. Break up the uniform apple red with an unmistakable but restrained golden-orange blush and a touch of muted yellow on one lower side, softly mottling and blending the orange into coral and rich tomato red like natural ripened skin. The majority of the fruit, including both shoulders around the calyx, should remain ripe tomato red. Keep the green calyx, faint marks near the stem, three-quarter view, diffuse upper-left light, apparent size, central composition, layered watercolor grain, and gently varied painted edges. One whole specimen, square canvas with generous clear crop safety. Preserve real alpha transparency, with no paper, background color, shadow, extra objects or lettering.

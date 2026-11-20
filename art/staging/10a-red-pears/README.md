# Batch 10a red pear guide illustrations

The live catalog lists `red-anjou` and `red-bartlett` under `pears`. This first pass uses single whole specimens. Match the respective staged v2 family paintings and the [Orchard illustration guide](../../../docs/design/illustration-guide.md#a-isolated-produce-illustration). Evaluate at 72 px and 320 px on ivory and warm charcoal. Intended integration exports are transparent WebP at 160, 320 and 640 px from a square PNG master of at least 1024 px.

## Red Anjou

Asset ID `pears-red-anjou-thumbnail-v1`. Family reference [staged anjou v2](../04-pears/pears-anjou-thumbnail-v2.png), with visible bounds approximately 81% tall and 61% wide of the canvas including the stem. Subject references [USA Pears cultivar profile](https://www.usapears.org/RED-anjou/) and [Superfresh Growers specimen photo](https://superfreshgrowers.com/our-fruit/pears/red-anjou).

Intended manifest record at integration

```json
{
  "id": "pears-red-anjou-thumbnail-v1",
  "item": "pears",
  "variety": "red-anjou",
  "role": "thumbnail",
  "alt": "A maroon Red Anjou pear with a broad egg-shaped body",
  "revision": 1,
  "status": "approved"
}
```

### Generation prompt

> Create a naturalistic botanical watercolor of one whole Red Anjou pear for the Orchard guide. Use the supplied staged anjou painting as the family reference for apparent scale, framing, soft diffuse upper-left light, gently elevated front three-quarter view, and loose layered paint. Paint a fresh specimen with these observed cultivar features. A compact egg-shaped fruit with a full spherical lower body, a gradual even taper above the midpoint and a rounded top with almost no distinct neck. Use deep wine-maroon skin, a luminous muted crimson wash facing the light, and restrained fine lenticels. A short woody brown stem rises from a shallow depression. Match the family specimen's comfortable crop safety, approximately 81% tall and 61% wide of the square including stem. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle pigment granulation, occasional pooling and selective skin detail. Keep the upper-left highlight small, irregular and integrated into the paint. Maintain a clean, gently variable edge and a recognizable silhouette at 72 px. Output one square PNG at least 1024 px per side with genuinely transparent alpha around the entire fruit and stem. No paper, checkerboard, tabletop, shadow, hard outline, glossy reflection, foliage, text or cut fruit.

### Review

Look for the continuous taper and rounded crown at thumbnail size. Keep the deep wine-red skin readable on charcoal.

## Red Bartlett

Asset ID `pears-red-bartlett-thumbnail-v1`. Family reference [staged bartlett v2](../04-pears/pears-bartlett-thumbnail-v2.png), with visible bounds approximately 77% tall and 56% wide of the canvas including the stem. Subject references [USA Pears cultivar profile and specimen photo](https://www.usapears.org/red-bartlett/) and [Rhododendrites specimen photo](https://commons.wikimedia.org/wiki/File:Red_Bartlett_pear.jpg).

Intended manifest record at integration

```json
{
  "id": "pears-red-bartlett-thumbnail-v1",
  "item": "pears",
  "variety": "red-bartlett",
  "role": "thumbnail",
  "alt": "A vivid red Bartlett pear with a bell-shaped base and a distinct neck",
  "revision": 1,
  "status": "approved"
}
```

### Generation prompt

> Create a naturalistic botanical watercolor of one whole Red Bartlett pear for the Orchard guide. Use the supplied staged bartlett painting as the family reference for apparent scale, framing, soft diffuse upper-left light, gently elevated front three-quarter view, and loose layered paint. Paint a fresh specimen with these observed cultivar features. A true pear-shaped fruit with a rounded bell-shaped lower body, distinct shoulders, and a visibly narrower neck that draws in before reaching a small rounded stem end. Paint a ripe specimen in naturally vivid warm scarlet-red with subtle darker red modeling, a few gently lighter vertical skin variations, and sparse fine lenticels. Include a lightly curved woody brown stem. Match the family specimen's comfortable crop safety, approximately 77% tall and 56% wide of the square including stem. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle pigment granulation, occasional pooling and selective skin detail. Keep the upper-left highlight small, irregular and integrated into the paint. Maintain a clean, gently variable edge and a recognizable silhouette at 72 px. Output one square PNG at least 1024 px per side with genuinely transparent alpha around the entire fruit and stem. No paper, checkerboard, tabletop, shadow, hard outline, glossy reflection, foliage, text or cut fruit.

### Review

Check that the shoulder-to-neck transition reads at thumbnail size and the ripe red is lighter and warmer than Red Anjou.


## Validation and review handoff

One built-in generation call per subject used transparent output and the corresponding staged v2 painting as its attached family reference. The subject photos informed the briefs. Both generated files were already square and were staged byte-for-byte.

| Staged candidate | PNG | Fully clear pixels | Painted bounds, width × height | Family bounds, width × height | Orchard validator |
| --- | --- | --- | --- | --- | --- |
| [Red Anjou v1](pears-red-anjou-thumbnail-v1.png) | 1254 × 1254 RGBA | 66.7% | 60.1% × 82.0% | 60.7% × 81.1% | Pass |
| [Red Bartlett v1](pears-red-bartlett-thumbnail-v1.png) | 1254 × 1254 RGBA | 72.3% | 55.7% × 78.5% | 56.3% × 77.0% | Pass |

[Review sheet](review.png) pairs each candidate with its family reference at 320 px and 72 px on ivory and warm charcoal. At both sizes the stem and silhouette stay legible and the two reds are distinct. Red Anjou has a broad, gradual taper and a deep maroon shadow that reads on charcoal. Red Bartlett has a clearer shoulder and narrower neck, with a brighter scarlet wash. Neither shows an obvious pale fringe in the review composites. Red Bartlett's stem is slightly more prominent than in the yellow family reference. The shared art owner handles canonical placement, registration and WebP exports.

## Jared's approval

Jared approved both staged v1 candidates in the batch review on November 19, 2026.

- `pears-red-anjou-thumbnail-v1`
- `pears-red-bartlett-thumbnail-v1`

Use `approved` for both manifest records at integration. Canonical placement and the 160, 320, and 640 px WebP exports are ready for the shared art owner.

## Revision requested: pears-red-bartlett-thumbnail-v1 (Jared, 2026-11-19)

It is the same solid red as Starkrimson, so the two varieties can only be told apart by their labels. A Red Bartlett has the Bartlett bell shape with red striations and blush over a visible yellow or yellow-green ground, lighter near the neck and in streaks. Starkrimson is the solid, even crimson one. Paint the difference so the two read apart side by side at 72 px. Paint `pears-red-bartlett-thumbnail-v2` in `art/staging/21-repaints/`, which has its prompt and saving steps; check it on the review sheet beside the family, and hand it off once Jared approves it. The approved v1 stays in the app until then.

# Cara Cara orange

[Staged master](oranges-cara-cara-thumbnail-v1.png) · [Size and background comparison](review.png)

- Catalog record: `oranges` / `cara-cara`, **Cara Cara navel**, in [oranges.yaml](../../../content/items/oranges.yaml).
- Display: 48 px in the variety row.
- Subject reference: [UC Riverside Citrus Variety Collection, Cara Cara navel orange](https://citrusvariety.ucr.edu/crc3994) documents pink flesh and Washington navel ancestry. The [Washington navel record](https://citrusvariety.ucr.edu/crc1241B) documents the rounded pebbled fruit and small secondary fruit at the blossom end.
- Style references, in generation order: [Orchard illustration language](../../../docs/design/references/04-illustration-language.png), [Navel v2](../03-oranges-grapefruit/oranges-navel-thumbnail-v2.png) for anatomy and rind, and [Blood orange v2](../03-oranges-grapefruit/oranges-blood-thumbnail-v2.png) for the whole-and-cut composition and treatment of the cut face.

## Approved asset

Jared approved `oranges-cara-cara-thumbnail-v1` for integration.

```json
{
  "id": "oranges-cara-cara-thumbnail-v1",
  "item": "oranges",
  "variety": "cara-cara",
  "role": "thumbnail",
  "alt": "A whole Cara Cara navel orange beside a cut half with coral-pink flesh",
  "revision": 1,
  "status": "approved"
}
```

At integration, add the approved entry above, copy the staged PNG to `art/masters/oranges-cara-cara-thumbnail-v1.png`, and run the art processor for the 160, 320, and 640 px WebPs at quality 82, alpha quality 90, and effort 6. Verify the exports and the approved status in the canonical manifest.

## Generation prompt

One built-in generation call with background transparency enabled.

> Create a NEW naturalistic botanical watercolor of a Cara Cara navel orange for Orchard's 48 px variety row. References in order: Orchard illustration-language sheet for translucent watercolor technique only, staged Navel for rounded orange anatomy, pebbled rind and inset blossom-end secondary fruit, staged Blood orange for compact arrangement and cut-face rendering only. Paint a dominant whole rounded, subtly oval orange at a gentle three-quarter angle with its blossom end visible above and to the left of the overlapping cut piece. Show its small tucked secondary fruit in a shallow irregular cleft, clearly part of the orange. Paint healthy golden-orange finely pebbled rind with warm orange shadows. Tuck a compact transverse orange half against the lower right with its cut face angled toward the viewer and large enough to read at 48 px. Show even, distinctly salmon-coral pink seedless flesh with delicate radial membranes, modest pale pith and a narrow orange outer rind. Avoid wine-red blood-orange tones and thick grapefruit-like pith. Use no leaves. Match the citrus references' visual weight and gentle diffuse upper-left light. Build volume with luminous translucent washes, broad overlapping paint shapes, subtle granulation, occasional pigment pooling and selective fine detail, with softly varied pigment edges. Center the compact group on square canvas at around four-fifths of canvas width with clean crop safety on all four sides. Isolate on genuine transparency. No paper, tabletop, horizon, cast shadow, lettering, frame, heavy outline, or glossy 3D finish.

## Validation and review

The 1254 × 1254 RGBA PNG passed the project's `checkMaster` validator. The comparison shows Navel, Cara Cara and Blood orange left to right at 48 and 160 px, with ivory above and warm charcoal below. Both backgrounds show clean edges. The pebbled orange rind and inset navel read as a navel orange, and the cut face is visibly lighter and warmer than the Blood orange. The flesh reads as warm coral at 48 px. The cut half carries almost as much visual weight as the whole fruit, in the side-by-side comparison.

The staging batch is complete. Canonical integration is pending with the owner of the shared art files.

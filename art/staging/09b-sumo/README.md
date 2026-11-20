# Sumo mandarin illustration

## Jared’s approval

Jared approved [mandarins-sumo-thumbnail-v1](./mandarins-sumo-thumbnail-v1.png). The staged 1254 × 1254 RGBA master passed `checkMaster` again after approval and is ready for the integration owner to publish and process.

## First pass · 2026-11-19

- Asset `mandarins-sumo-thumbnail-v1`. Catalog IDs `mandarins` and `sumo` from [mandarins.yaml](../../../content/items/mandarins.yaml).
- Display at 48 CSS px in the cultivar row. Inspect at 320 px for rind and edge detail.
- The broad body, raised stem-end topknot and coarse yellow-orange rind identify the cultivar. [UC Riverside Shiranui accession](https://citrusvariety.ucr.edu/crc4249) documents the large neck and fruit proportions. [NSW Dekopon cultivar fact sheet](https://www.dpi.nsw.gov.au/__data/assets/pdf_file/0019/1206145/Dekopon-mandarin.pdf) confirms the coarse yellow-orange rind and prominent stem-end neck.
- Style inputs in prompt order are the [illustration-language sheet](../../../docs/design/references/04-illustration-language.png), [Minneola v2](../01b-mandarins-strawberries/mandarins-minneola-thumbnail-v2.png), and [Gold Nugget v3](../01b-mandarins-strawberries/mandarins-gold-nugget-thumbnail-v3.png). The Minneola and Gold Nugget are approved staged masters. The topknot is kept clear of foliage.
- No existing Sumo master, export, manifest entry or shared request was found before generation.
- The integration owner can place the approved master in `art/masters/` and use the project processor for transparent 160, 320, and 640 px WebPs (quality 82, alpha quality 90, effort 6). The intended manifest record below includes Jared’s approval.

```json
{
  "id": "mandarins-sumo-thumbnail-v1",
  "item": "mandarins",
  "variety": "sumo",
  "role": "thumbnail",
  "alt": "A Sumo mandarin with a raised topknot and bumpy orange rind",
  "revision": 1,
  "status": "approved"
}
```

## Built-in generation prompt

> Paint a new standalone naturalistic botanical watercolor of one whole Sumo mandarin (Shiranui/Dekopon) for Orchard’s 48 px cultivar-row thumbnail. Image 1 is the technique guide only. Images 2 and 3 are approved mandarin paintings for matching crop, apparent fruit scale, three-quarter viewpoint, soft diffuse upper-left light, luminous layered washes, subtle granulation, and selective skin detail. Use a broad, weighty, nearly round to slightly flattened body with full shoulders and a short, distinctly protruding broad stem-end topknot formed by the orange rind itself. Give the topknot naturally irregular sides and a shallow furrow at its base, and a tiny olive-brown stem scar at its crown. Paint coarse, yellow-orange rind with shallow irregular rounded bumps and pitted oil glands over the broad painted masses, with restrained burnt-orange shade to lower right. Keep the body broader and the rind coarser and more golden than the smooth red-orange Minneola reference. Make the neck distinct from the low shoulder of the Gold Nugget reference. No leaves so the topknot reads cleanly in silhouette. Center the entire fruit on a square canvas of at least 1024 px per side and leave about a tenth of the canvas clear on every edge. Keep the silhouette and topknot legible at 48 px. Use broad translucent washes, slight pigment pooling and softly varied edges with no heavy outlines or plastic gloss. Deliver actual alpha transparency around the subject, with no cast shadow, background wash, paper texture outside the fruit, checkerboard, props, slice, sticker, lettering, or border.

## Validation and review

- [Staged master](./mandarins-sumo-thumbnail-v1.png) is the original PNG from one built-in generation call with transparency enabled.
- `checkMaster` in `scripts/art-lib.ts` returned no issues. The 1254 × 1254 four-channel PNG has 53.8% fully transparent pixels and at least 119 px of crop safety on every side, measured to pixels with alpha above 16.
- Compared with the approved Minneola and Gold Nugget paintings over ivory and warm charcoal at 48 px and 320 px. The topknot reads at 48 px. The broader shoulders and golden, pebbled rind distinguish it from the more tapered, red-orange Minneola. The topknot distinguishes it from the flatter Gold Nugget. No visible paper matte, clipping, or pale halo on either background.
- The furrow beneath the topknot is pronounced at 320 px. Jared approved this first pass as staged.

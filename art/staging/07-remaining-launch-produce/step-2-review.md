# Remaining launch produce · Step 2

[Review sheet](review-step-2.png) shows both candidates at 72 and 320 px over ivory and warm charcoal. Both are pending Jared’s review.

Each candidate used one built-in ImageGen call with transparency enabled. Both staged masters are 1254 × 1254 RGBA PNGs and passed [`checkMaster`](../../../scripts/art-lib.ts). The visual check found readable silhouettes and no conspicuous pale halos on either background.

Intended displays are 72 px on cards, 96–112 px for standard thumbnails, and 320 px for item panes. Integration settings are 160, 320, and 640 px square WebP, quality 82, alpha quality 90, effort 6. Proposed manifest status is `requested` before canonical processing.

## Proposed manifest entries

```json
{
  "assets": [
    {
      "id": "artichokes-thumbnail-v1",
      "item": "artichokes",
      "role": "thumbnail",
      "alt": "A whole green globe artichoke with tightly overlapping bracts and a short stem",
      "revision": 1,
      "status": "requested"
    },
    {
      "id": "okra-thumbnail-v1",
      "item": "okra",
      "role": "thumbnail",
      "alt": "Three tapered green okra pods with lengthwise ridges and a star-shaped slice",
      "revision": 1,
      "status": "requested"
    }
  ]
}
```

## Shared prompt

Each call used `Use case: illustration-story. Asset: <asset-id>.` followed by the subject prompt and this shared ending.

> Create a single naturalistic botanical watercolor for an Orchard produce thumbnail. Use the supplied local artwork strictly as style reference for translucent layered color, varied pigment edges, selective botanical detail, and visual weight. Use a gently elevated three-quarter view with soft diffuse upper-left light, broad overlapping washes, subtle pigment granulation, occasional pooling, and a few softly broken edges. Center the complete compact composition on a square PNG of at least 1024 px, aiming for 10% clear crop safety on all sides. Make the silhouette legible at 72 and 96–112 px. Isolate on genuine alpha transparency (fully clear around the subject), with no painted white, paper mat, ground wash, cast shadow, horizon, border, text, props, heavy outlines, or plastic gloss.

## Artichokes

- Staged master [artichokes-thumbnail-v1.png](artichokes-thumbnail-v1.png). Intended master `art/masters/artichokes-thumbnail-v1.png`.
- Subject references are the [Orchard catalog record](../../../content/items/artichokes.yaml) and the [UC Davis produce fact sheet](https://postharvest.ucdavis.edu/ar/produce-facts-sheets/artichoke-globe).
- Image inputs were the [Orchard illustration-language study](../../../docs/design/references/04-illustration-language.png) and the [staged Brussels sprouts master](brussels-sprouts-thumbnail-v1.png).
- The rounded bud, layered bracts, and short stem read at card size. A few upper bract tips flare slightly. If Jared wants the catalog’s tight-bud cue emphasized, tuck those tips inward.

> Paint one whole fresh green globe artichoke in a gently elevated three-quarter view. Tilt it slightly off upright to make the compact rounded bud and short smooth-cut green stem legible. Build the bud from substantial broad pointed bracts that overlap in staggered tiers and hug the globe, with a modest tight crown and no exposed choke or flower. Bracts are predominantly natural sage and olive-green with warm yellow-green faces and cooler deep green at their overlaps. Keep any muted violet to a restrained tint at a few tips. Let the broad bracts taper toward softly pointed ends, avoiding an excessively spiny silhouette, cabbage-like veining or a uniformly geometric pattern. Exclude loose bracts and foliage.

## Okra

- Staged master [okra-thumbnail-v1.png](okra-thumbnail-v1.png). Intended master `art/masters/okra-thumbnail-v1.png`.
- Subject references are the [Orchard catalog record](../../../content/items/okra.yaml) and the [UC Davis produce fact sheet](https://postharvest.ucdavis.edu/produce-facts-sheets/okra).
- Image inputs were the [Orchard illustration-language study](../../../docs/design/references/04-illustration-language.png) and the [staged asparagus master](asparagus-thumbnail-v1.png).
- The taper, long ridges, and star-shaped slice read at card size. The pale caps are somewhat prominent. If revised, reduce the flare of the caps while keeping the pods and slice legible.

> Paint a compact group of three small whole fresh green okra pods in a gently elevated three-quarter view with a single small cross-cut slice nestled in front. Arrange the pods in a close low diagonal fan with lightly staggered tapering tips and visible short flared calyx shoulders. Each pod is straight or very gently curved, thick near its cap and smoothly tapering to a fine blunt point. Long ridges follow the pod from shoulder to tip, with softly shaded green faces and a little dry-brush texture. The small cut slice has a natural five-pointed lobed outline, pale-green interior and small round cream seeds set into its chambers. Keep the whole bright green pods dominant and their ridges legible. Exclude leaves, blossoms, loose seeds, long stem stalks and rings of empty holes.

## Queue

All five subjects with catalog records have first-pass candidates across [step 1](step-1-review.md) and step 2. Winter squash and collard greens are deferred until their catalog records exist. Confirm the representative winter squash type from its record before painting.


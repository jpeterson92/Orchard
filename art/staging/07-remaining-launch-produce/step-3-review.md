# Remaining launch produce · Step 3

[Review sheet](review-step-3.png) shows the two approved candidates at 72 and 320 px over ivory and warm charcoal.

## Approval

Jared approved `collard-greens-thumbnail-v1` and `winter-squash-thumbnail-v1` in response to the Step 3 review. Both are ready for canonical integration.

Each candidate used one built-in ImageGen call with transparency enabled. Both staged masters are 1254 × 1254 RGBA PNGs and passed [`checkMaster`](../../../scripts/art-lib.ts). Silhouettes are clear on both backgrounds, with no conspicuous pale halos.

Intended displays are 72 px on cards, 96–112 px for standard thumbnails, and 320 px for item panes. Integration settings are 160, 320, and 640 px square WebP, quality 82, alpha quality 90, effort 6. Proposed manifest status is `requested` before canonical processing.

## Proposed manifest entries

```json
{
  "assets": [
    {
      "id": "collard-greens-thumbnail-v1",
      "item": "collard-greens",
      "role": "thumbnail",
      "alt": "A bunch of broad dark green collard leaves with pale stems and prominent midribs",
      "revision": 1,
      "status": "requested"
    },
    {
      "id": "winter-squash-thumbnail-v1",
      "item": "winter-squash",
      "role": "thumbnail",
      "alt": "A whole tan butternut squash with a rounded base, narrow neck, and dry stem",
      "revision": 1,
      "status": "requested"
    }
  ]
}
```

## Shared prompt

Each call used `Use case: illustration-story. Asset: <asset-id>.` followed by the subject prompt and this shared ending.

> Create a naturalistic botanical watercolor for an Orchard produce thumbnail. Use the illustration-language study for the watercolor treatment and the second image for isolated production finish, visual weight, and edges. Gently elevated three-quarter view, diffuse upper-left light, luminous broad overlapping washes, subtle granulation, occasional pooling, and selective painted detail. Center the complete compact subject in a square PNG of at least 1024 px with about 10% clear crop safety. Make it read at 72 and 96–112 px. Isolate on genuine alpha transparency. No paper mat, white background, pale halo, ground shadow, props, text, border, heavy outlines, or plastic gloss.

## Collard greens

- Staged master [collard-greens-thumbnail-v1.png](collard-greens-thumbnail-v1.png). Intended master `art/masters/collard-greens-thumbnail-v1.png`.
- Subject references are the [Orchard catalog record](../../../content/items/collard-greens.yaml) and the [Colorado State University collard greens profile](https://www.chhs.colostate.edu/fsi/food-articles/produce/collard-greens/).
- Image inputs were the [Orchard illustration-language study](../../../docs/design/references/04-illustration-language.png) and the [staged Brussels sprouts master](brussels-sprouts-thumbnail-v1.png).
- The broad leaf blades, pale midribs, and separate cut stems remain legible at card size.

> Paint a compact market bunch of four overlapping freshly cut collard greens leaves. Fan the broad oval to paddle-shaped leaves upward in a slightly asymmetric arrangement from a close cluster of short cut petioles, with one main front leaf showing its whole shape. Leaves are deep blue-green to forest green, thick and mostly smooth, with gently undulating nearly continuous margins, prominent pale-green central midribs narrowing toward each tip, and a few softly branching secondary veins. The fresh light-green stems join their respective midribs. Use softly modeled fold planes and a subtle waxy bloom. Keep the bunch distinct from frilly kale, lobed mustard greens, or a spherical cabbage head. No rubber band, dirt, roots, flowers, holes, yellowing, or detached fragments.

## Winter squash

- Staged master [winter-squash-thumbnail-v1.png](winter-squash-thumbnail-v1.png). Intended master `art/masters/winter-squash-thumbnail-v1.png`.
- Subject references are the [Orchard catalog record](../../../content/items/winter-squash.yaml) and the [Tozer Seeds squash catalog](https://www.tozerseeds.com/wp-content/uploads/2024/11/Cucurbits-brochure-2024-25-compressed-1.pdf).
- Image inputs were the [Orchard illustration-language study](../../../docs/design/references/04-illustration-language.png) and the [staged honeydew master](honeydew-thumbnail-v1.png).
- Butternut represents the winter squash item because its catalog record specifically gives the fully tan rind as a shopping cue. The neck, rounded base, and dry stem read at card size. The rind runs golden in the midtones, and the pale highlights are stronger than a matte rind would suggest. If revised, soften those highlights and shift the midtones toward buff tan.

> Paint one whole mature butternut squash to represent Orchard’s winter squash item. Give it the recognizable bell silhouette of a long moderately slender cylindrical neck that widens smoothly into a plump round bulb at its base. The squash stands naturally upright with a slight three-quarter tilt, keeping the neck legible. Show a short dry attached tan-brown woody stem with a small angled cut face. The hard matte rind is fully buff tan with a little warm golden color variation, faint speckles and softly shaded ochre-brown contours that read against warm ivory. Preserve the primarily tan rind and unbroken smooth bell form. No green streaks, orange pumpkin ribs, leaves, vine, extra squash, cut piece, or seeds.

## Queue

The five candidates from [step 1](step-1-review.md) and [step 2](step-2-review.md) are outside this approval.


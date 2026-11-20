# Cantaloupe, peaches and blueberries style review

This step completes the [batch style review](batch-brief.md). It covers Cantaloupe and Peaches and resolves the [Blueberries retry](grapes-blueberries-watermelon-style-review-brief.md#blueberries).

Each subject got one built-in ImageGen edit. Cantaloupe and Peaches used their staged originals and the [Orchard illustration-language board](../../../docs/design/references/04-illustration-language.png). Blueberries used the original staged PNG as its sole reference to target the fruit interior. The [cantaloupe and peaches first-pass brief](cantaloupe-peaches-brief.md) and [blueberries first-pass brief](grapes-blueberries-watermelon-brief.md#blueberries) contain the subject references. The review followed the [Orchard illustration guide](../../../docs/design/illustration-guide.md).

All three revisions are 1254 × 1254 RGBA PNGs. Each passed [`checkMaster`](../../../scripts/art-lib.ts) and was visually compared with v1 at 72 and 320 px on ivory and warm charcoal. No further retries or touch-ups are queued. See the [contact sheet](contact-sheet.html) for Jared's review.

Intended display sizes are 72 px for cards, 96–112 px for thumbnails and 320 px for the item pane. Integration export targets are 160, 320 and 640 px square WebPs at quality 82, alpha quality 90 and effort 6. The proposed entries are at `requested` so the canonical processor can move successful exports to `review`.

## Proposed manifest entries

```json
{
  "assets": [
    {
      "id": "cantaloupe-thumbnail-v2",
      "item": "cantaloupe",
      "role": "thumbnail",
      "alt": "A whole cantaloupe with beige netting and an orange-fleshed wedge",
      "revision": 2,
      "status": "requested"
    },
    {
      "id": "peaches-thumbnail-v2",
      "item": "peaches",
      "role": "thumbnail",
      "alt": "A golden-yellow peach with a soft rosy blush and a curved seam",
      "revision": 2,
      "status": "requested"
    },
    {
      "id": "blueberries-thumbnail-v2",
      "item": "blueberries",
      "role": "thumbnail",
      "alt": "Five dusty indigo blueberries with recessed blossom crowns",
      "revision": 2,
      "status": "requested"
    }
  ]
}
```

## Shared edit prompt suffix

> Edit the first supplied image. When a second image is supplied, use it only as Orchard's paint-handling reference. Retain the existing subject, three-quarter angle, compact framing, apparent scale and diffuse upper-left light. Build volume with broad translucent watercolor washes, restrained granulation and selective fine detail. Deliver a square PNG with genuine alpha transparency, full crop safety, and zero background opacity outside the immediate painted edges. No backdrop, paper, paper grain outside the painting, ground shadow, edge halo, added objects or lettering. The group must remain legible at 72 px.

## Cantaloupe

- [Prior painting](cantaloupe-thumbnail-v1.png) and [staged revision](cantaloupe-thumbnail-v2.png). Intended master `art/masters/cantaloupe-thumbnail-v2.png`.
- Review of the prior painting. The wedge and whole melon read well at card size. At detail size bright, equally sharp netting over nearly the entire rind competes with its round form and looks drawn over the paint.
- Review of the revised candidate. The raised netting fades into the light and shadow along the sides and stays defined on the front. The round melon reads more clearly at pane size, and the orange wedge still distinguishes it at card size.

The following subject prompt preceded the shared suffix.

> Refine the netting on the whole cantaloupe and on the outer edge of the wedge. Preserve the characteristic raised branching texture but vary its contrast and definition. Let it fade into a warm tan wash on the lit upper left and a subdued olive-tan wash toward the perimeter and shadow; reserve the clearest small ridges for a few patches near the middle front. Maintain the stem scar, nearly round shape and the wedge's clean orange cut flesh, thin green inner rind, and gently scooped seed-cavity edge. Keep the original grouping and warm natural palette.

## Peaches

- [Prior painting](peaches-thumbnail-v1.png) and [staged revision](peaches-thumbnail-v2.png). Intended master `art/masters/peaches-thumbnail-v2.png`.
- Review of the prior painting. The matte blush, curved seam and single fruit read as a peach. The v1 blossom tip forms a sharp heart-like point, and the bright yellow cheek is fairly uniform, giving the fruit flatter volume than the tomato and melon illustrations.
- Review of the revised candidate. The tip is slightly rounder, the seam eases into the lower cheek, and warmer layered washes add volume through the golden side. The silhouette and blush remain clear at 72 px. The change is subtle at card size.

The following subject prompt preceded the shared suffix.

> Refine this single yellow peach. Round off the very tip of the blossom end just slightly, preserving its subtle peach taper and full asymmetric cheeks. Keep the stem tucked in its recess and the single curved suture legible, but soften the suture as it approaches the tip. Add subtle layered golden, pale apricot and peach-ochre washes to model the yellow cheek, with soft diffuse light and fine matte pigment, and blend it gradually into the existing rosy coral blush. Preserve a broad golden-yellow ground, keep the skin softly fuzzy and matte, and retain a natural peach silhouette. No leaves.

## Blueberries

- [Prior painting](blueberries-thumbnail-v1.png) and [staged revision](blueberries-thumbnail-v2.png). Intended master `art/masters/blueberries-thumbnail-v2.png`.
- Review of the prior painting. The clean v1 has recognizable berries and appropriate waxy bloom. Its large sharply rimmed calyces and tan pinpoints draw more attention than the fruit. The first revision introduced a low-opacity background wash.
- Review of the revised candidate. The front and top crowns have softer edges and less prominent tan centers, and the dusty bloom remains visible. The retry resolves the earlier background haze. About 68.4% of the canvas is fully transparent, compared with 68.1% in v1. Pixels more than 32 pixels (Manhattan distance) from the painted silhouette have alpha no greater than 1/255, matching the v1 maximum. The matte previews show no conspicuous haze.

The following subject prompt preceded the shared suffix.

> Make a narrowly targeted edit strictly inside the existing five blueberry silhouettes. Use the first image's clean alpha channel and preserve every transparent surrounding and inter-berry region. Do not repaint the outer silhouettes, do not generate an underpainting, and do not introduce any color, gray wash, haze, speckles or semitransparency outside the original silhouette. In the large front and top blossom crowns, slightly reduce the star-shaped openings and soften the sharp pale rims with muted indigo watercolor. Reduce the tan pinpoints inside the calyces. Slightly diffuse the brightest skin strokes while retaining the dusty blue bloom. Preserve berry count, positions, overlap, silhouette, colors and all crop margins.

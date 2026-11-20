# Forelle and Concorde guide illustrations

Two first-pass candidates for review by Jared. The [review sheet](review.png) shows each at 72 px and 320 px on ivory and warm charcoal. Both originals are 1254 × 1254 RGBA PNGs from one built-in generation call per cultivar with transparency enabled. Both passed the project’s `checkMaster` with zero issues. Neither showed a visible pale halo. The stems are slightly taller than specified. Both are ready for review without a queued retry.

The proposed manifest fields use [live catalog IDs](../../../content/items/pears.yaml). On integration, the processor makes 160, 320 and 640 px WebPs at quality 82 and alpha quality 90 and moves `requested` assets to `review`. Jared decides approval.

## Forelle

**Subject references.** [USA Pears](https://www.usapears.org/forelle), [CMI Orchards specimen photo](https://images.squarespace-cdn.com/content/v1/5da8cb49f6d96b1bf0e61ddd/1706555142742-16L9CS96ZNLE1QZ5DTAG/Forelle-Pear.png), and [Keepers Nursery ripe-fruit photo](https://www.keepers-nursery.co.uk/imagelibrary/products/forell/500px/forell-5.jpg).

**Style reference.** [Staged pear watercolor](../04-pears/pears-bartlett-thumbnail-v2.png) for brushwork, light and framing.

**Master.** [pears-forelle-thumbnail-v1.png](pears-forelle-thumbnail-v1.png) is staged for `art/masters/pears-forelle-thumbnail-v1.png`.

```json
{
  "id": "pears-forelle-thumbnail-v1",
  "item": "pears",
  "variety": "forelle",
  "role": "thumbnail",
  "alt": "A small yellow Forelle pear with red freckles and a coral blush",
  "revision": 1,
  "status": "requested"
}
```

**Generation prompt**

> Create a new Orchard guide thumbnail as a square PNG at least 1024 px per side with genuine alpha. The supplied Orchard pear is a style and framing reference only. Show one whole fruit with its woody stem, gently elevated front three-quarter view, softly lit from the upper left. Use naturalistic botanical watercolor with luminous translucent overlapping washes, subtle granulation, a few soft pigment edges, and selective stem and skin detail. Use pale colored washes for the highlights. Center the complete silhouette at approximately 76% of canvas height with generous transparent clearance all around. The cultivar should read at 72 px and the brushwork at 320 px. Leave the surrounding pixels transparent, with no paper rectangle, checkerboard, cast shadow, leaves, label, border, or watermark. Avoid glossy rendering and heavy outlines. Paint a ripe Forelle: a petite, slightly asymmetric bell-shaped pear with a rounded lower body, a compact, fairly short tapering neck and a slender, gently curved brown stem. Paint clear bright straw-yellow skin with a hint of yellow-green near the neck and a light coral-red blush on one cheek. The cultivar signature is individually visible small red lenticels, irregularly spaced and particularly clear where the delicate blush fades into yellow. Preserve a substantial yellow field. Keep the freckles botanical and readable without making them oversized or a regular polka-dot pattern.

**Review.** The compact bell silhouette and yellow skin with a coral cheek distinguish it from the staged Bartlett and Seckel. The red lenticels read most clearly at 320 px.

## Concorde

**Subject references.** [USA Pears](https://www.usapears.org/concorde), [Washington State University cultivar record](https://treefruit.wsu.edu/variety/concorde/), and [Dreiliņu Stādi nursery specimen photo](https://www.dreilinustadi.lv/5493-medium_default/bumbiere-ziemas-concorde-pyrus-.jpg).

**Style reference.** [Staged pear watercolor](../04-pears/pears-bosc-thumbnail-v2.png) for brushwork, light and framing.

**Master.** [pears-concorde-thumbnail-v1.png](pears-concorde-thumbnail-v1.png) is staged for `art/masters/pears-concorde-thumbnail-v1.png`.

```json
{
  "id": "pears-concorde-thumbnail-v1",
  "item": "pears",
  "variety": "concorde",
  "role": "thumbnail",
  "alt": "A long-necked yellow-green Concorde pear with a patch of golden russet",
  "revision": 1,
  "status": "requested"
}
```

**Generation prompt**

> Create a new Orchard guide thumbnail as a square PNG at least 1024 px per side with genuine alpha. The supplied Orchard pear is a style and framing reference only. Show one whole fruit with its woody stem, gently elevated front three-quarter view, softly lit from the upper left. Use naturalistic botanical watercolor with luminous translucent overlapping washes, subtle granulation, a few soft pigment edges, and selective stem and skin detail. Use pale colored washes for the highlights. Center the complete silhouette at approximately 76% of canvas height with generous transparent clearance all around. The cultivar should read at 72 px and the brushwork at 320 px. Leave the surrounding pixels transparent, with no paper rectangle, checkerboard, cast shadow, leaves, label, border, or watermark. Avoid glossy rendering and heavy outlines. Paint a Concorde: a distinctly elongated pear whose long, relatively narrow, gently tapered neck makes up much of the upper silhouette, widening into a rounded, moderately full lower bell. Give it a modest slim brown stem with a slight bend. Paint yellow-green skin with warm yellow highlights and olive-green half-tones, with fine lenticels and a small, irregular patch of light golden-brown russet. Keep the green ground dominant, including at thumbnail size. Omit red blush and all-over bronze russet.

**Review.** The extended neck and yellow-green skin distinguish it from Green Anjou and Bosc at both sizes. Golden russet stays localized.


## Concorde v2

Jared requested a fuller, slightly shorter upper neck with less taper near the tip. One built-in image generation call edited [Concorde v1](pears-concorde-thumbnail-v1.png) with transparent output enabled. The cultivar references above still apply.

**Master.** [pears-concorde-thumbnail-v2.png](pears-concorde-thumbnail-v2.png) is staged for `art/masters/pears-concorde-thumbnail-v2.png`.

```json
{
  "id": "pears-concorde-thumbnail-v2",
  "item": "pears",
  "variety": "concorde",
  "role": "thumbnail",
  "alt": "A yellow-green Concorde pear with an elongated, rounded neck and a patch of golden russet",
  "revision": 2,
  "status": "requested"
}
```

**Generation prompt**

> Make a targeted revision of the attached Orchard Concorde pear watercolor. The attached v1 is the edit target. Change the fruit contour from the shoulder up: shorten the exaggerated upper neck by roughly a quarter, give it visibly more width and volume on both sides especially immediately below the stem, and finish in a rounded, blunt crown with a shallow stem socket. Use a broad, flowing transition from the lower bell into the upper neck, with a gentle inward curve and mild taper. The neck should still be clearly elongated for a Concorde, with a slight natural asymmetry. The uppermost quarter should read as a substantial part of the pear, not a pointed or narrow projecting tip. Keep the rounded lower body, yellow-green skin, localized light golden russet, fine lenticels, woody stem and diffuse upper-left light of the attached painting. Preserve the layered botanical watercolor and scale, centering the revised pear with generous clear margins. Output one isolated whole pear and stem on genuinely transparent alpha as a square PNG, at least 1024 pixels per side. No shadows, background paper, leaves, lettering, border or watermark. The revised fuller outline must read clearly at 72 px.

**Validation and review.** The 1254 × 1254 RGBA PNG passed `checkMaster` with zero issues. The [side-by-side review sheet](review-concorde-v2.png) shows both versions at 72 and 320 px on ivory and warm charcoal. V2 has a shorter, substantially wider neck with a rounded top and a less pinched shoulder. The lower bell is slightly fuller as well. The elongated silhouette, yellow-green skin and local golden russet remain clear. No visible pale halo at either size.

**Approval.** Jared approved `pears-concorde-thumbnail-v2`. This is the selected Concorde master for integration. The art integration owner can record the approval after processing the proposed entry above.


## Approval

Jared approved `pears-forelle-thumbnail-v1` on 2026-11-19 (in Claude Code, from the review sheets). They are listed in [handoff.json](handoff.json).

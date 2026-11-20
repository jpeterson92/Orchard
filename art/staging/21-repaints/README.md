# Repaints, round 1

Twelve repaints, in four batches of three. Paint one batch per step and stop for Jared's review. This brief replaces the `## Revision requested` notes in the older folders' briefs.

- **Batch 1, identity and legibility:** blackberries, Keitt mango, Red Bartlett pear
- **Batch 2, mandarin scale:** Clementine, Satsuma, Pixie
- **Batch 3, scale:** Gala apple, nectarine, grapefruit
- **Batch 4, provisional items:** kiwifruit, papaya, iceberg lettuce

Batches 1 to 3 replace art that is already in the app. Batch 4 replaces approved `provisional-` paintings for items that have no catalog record yet.

## How to work and save

1. Work only in this folder, `art/staging/21-repaints/`. Never write `art/masters/`, `art/manifest.json` or `public/art/`.
2. For each asset, make one built-in image-generation call with transparency enabled. Attach the images listed under its **Inputs** in that order. Image 1 is the edit target: the current painting. Send the **shared prompt** followed by the asset's **subject prompt**.
3. Save the result here as `<new asset id>.png`, for example `blackberries-thumbnail-v2.png`. It must be a square PNG of at least 1024 px with genuine alpha. Run `checkMaster` from `scripts/art-lib.ts` on it. If the check fails or the subject is wrong, make one targeted retry for the same issue. If that also fails, record a `Retry` note under the asset and move on.
4. Make one review sheet per batch in this folder, `review-batch-<n>.png`. Show each new painting beside its edit target and the family references at 40, 72 and 320 px, over ivory (#fbf6ea) and warm charcoal (#25211f). Measure each painting's visible width and height as a percentage of the canvas (alpha above 16) and note them under its asset.
5. Under each asset below, record the result: file, check result, measured size, and any touch-up. Then stop and show Jared the review sheet.
6. When Jared approves an asset, record **Approved by Jared (date)** under it **in the same turn**. For batches 1 to 3, also add its **Handoff entry** to this folder's `handoff.json`, `{ "assets": [ … ] }`. Claude Code then runs `npm run art:process`, which puts the repaint in the app and retires the earlier revision. Batch 4 gets no handoff entry: approved provisional art waits here until its item record exists.
7. When Jared rejects an asset or asks for changes, write his feedback under it. Paint the next revision number in this folder on the next step.

## Shared prompt

> Revise this Orchard produce thumbnail as a naturalistic botanical watercolor. Image 1 is the current painting and the edit target: keep its subject, paint handling, palette and light, and change only what the subject paragraph asks. The other images are approved Orchard paintings of the same family; match their scale, framing, finish and visual weight. Gently elevated three-quarter view, diffuse upper-left light, luminous layered translucent washes, subtle pigment granulation, softly varied edges and small warm highlights integrated into the paint. Center the subject with even clear space on all sides. It must read at 40 and 72 px over both light ivory and dark warm charcoal, with observed botanical detail at 320 px. Deliver a square PNG at least 1024 px on genuine transparent alpha, with no paper, background, halo, cast or ground shadow, text, border, heavy outlines or glossy plastic finish.

Sizes below are the painting's visible width as a percentage of the canvas, unless stated otherwise.

## Batch 1: identity and legibility

### blackberries-thumbnail-v2

- **Why:** the berries are nearly black with little reflected light, so their outline disappears on warm charcoal at 40 and 72 px.
- **Inputs:** `art/masters/blackberries-thumbnail-v1.png` · `art/masters/raspberries-thumbnail-v1.png` · `art/masters/blueberries-thumbnail-v1.png`
- **Target size:** about 80% wide, matching the current painting.
- **Subject prompt:**
  > Two ripe blackberries, as in image 1: plump, slightly elongated, with tightly packed round drupelets and a tiny green-brown calyx on one. Keep the deep purple-black, but let each drupelet catch a cool blue-violet reflected rim on its shadow side and a small warm highlight on its lit side. Vary the highlights in size so they don't form a repeating pattern. The outer silhouette and the drupelet clusters must stay readable against dark charcoal at 40 px. No leaves.
- **Handoff entry:** `{ "id": "blackberries-thumbnail-v2", "item": "blackberries", "role": "thumbnail", "alt": "Two deep purple-black blackberries with plump, glinting drupelets", "revision": 2 }`

### mangoes-keitt-thumbnail-v2

- **Why:** at card size the plain green oval reads as an avocado or a lime.
- **Inputs:** `art/masters/mangoes-keitt-thumbnail-v1.png` · `art/masters/mangoes-kent-thumbnail-v1.png` · `art/masters/mangoes-ataulfo-thumbnail-v1.png`
- **Target size:** longer side about 85%, like Kent and Ataulfo.
- **Subject prompt:**
  > One whole ripe Keitt mango. Keep its mostly green skin, but make the mango shape unmistakable: a large, full oval with one fuller, rounded shoulder by the stem, one slightly flatter flank, and a small, softly offset beak toward the lower tip. Add faint pale-yellow lenticel dots, a short stem scar, and a modest yellow flush with a touch of pink on the upper shoulder, as ripe Keitts often show. Lay the long axis on a gentle diagonal like the Kent. It must read as a mango beside the Kent at 40 px, and never as an avocado or a lime.
- **Handoff entry:** `{ "id": "mangoes-keitt-thumbnail-v2", "item": "mangoes", "variety": "keitt", "role": "thumbnail", "alt": "A large oval Keitt mango, green with a yellow-pink flush on one shoulder", "revision": 2 }`

### pears-red-bartlett-thumbnail-v2

- **Why:** it is the same solid red as Starkrimson, so the two varieties look identical.
- **Inputs:** `art/masters/pears-red-bartlett-thumbnail-v1.png` · `art/masters/pears-bartlett-thumbnail-v2.png` (shape and scale) · `art/masters/pears-starkrimson-thumbnail-v1.png` (the look to avoid)
- **Target size:** about 57% wide and 77% tall, the Bartlett's proportions.
- **Subject prompt:**
  > One ripe Red Bartlett pear with the classic Bartlett bell shape of image 2: a full rounded base, a defined shoulder and a short neck, with a short woody stem. Unlike the solid, even crimson Starkrimson in image 3, the red is uneven: bright red blush and fine vertical red striations over a visible yellow-to-yellow-green ground. The yellow shows clearly through the streaks, at the neck and in one lighter area on the shaded flank. Add a few fine pale lenticel dots. Side by side at 72 px it must read as a different pear from Starkrimson.
- **Handoff entry:** `{ "id": "pears-red-bartlett-thumbnail-v2", "item": "pears", "variety": "red-bartlett", "role": "thumbnail", "alt": "A bell-shaped Red Bartlett pear with red streaks over a yellow ground", "revision": 2 }`

## Batch 2: mandarin scale

The approved paintings were painted small: Clementine and Pixie at about 50% of the canvas width, and Satsuma at 60%, against 68–73% for the other mandarins. Claude has already enlarged the masters in `art/masters/`, so image 1 is at the target scale. Repaint at that scale at full resolution and keep each variety's traits.

### mandarins-clementine-thumbnail-v3

- **Inputs:** `art/masters/mandarins-clementine-thumbnail-v2.png` · `art/masters/mandarins-w-murcott-thumbnail-v2.png` · `art/masters/mandarins-gold-nugget-thumbnail-v3.png`
- **Target size:** about 68% wide.
- **Subject prompt:**
  > One clementine as in image 1: a small, slightly flattened, glossy deep-orange fruit with fine, smooth pores, a tiny stem and one green leaf. Paint it at about 68% of the canvas width, matching the visual weight of the W. Murcott and Gold Nugget. Its smooth, tight, deep-orange rind sets it apart from their pebbled or reddish rinds.
- **Handoff entry:** `{ "id": "mandarins-clementine-thumbnail-v3", "item": "mandarins", "variety": "clementine", "role": "thumbnail", "alt": "A small clementine with a leaf", "revision": 3 }`

### mandarins-satsuma-thumbnail-v3

- **Inputs:** `art/masters/mandarins-satsuma-thumbnail-v2.png` · `art/masters/mandarins-w-murcott-thumbnail-v2.png` · `art/masters/mandarins-gold-nugget-thumbnail-v3.png`
- **Target size:** about 70% wide.
- **Subject prompt:**
  > One Satsuma mandarin as in image 1: gently flattened but not squashed, with a slightly loose, softly puffy orange rind and faint surface creases, a short stem and one narrow green leaf. Paint it at about 70% of the canvas width, matching the visual weight of the W. Murcott and Gold Nugget.
- **Handoff entry:** `{ "id": "mandarins-satsuma-thumbnail-v3", "item": "mandarins", "variety": "satsuma", "role": "thumbnail", "alt": "A gently flattened orange Satsuma mandarin with a narrow green leaf", "revision": 3 }`

### mandarins-pixie-thumbnail-v2

- **Inputs:** `art/masters/mandarins-pixie-thumbnail-v1.png` · `art/masters/mandarins-gold-nugget-thumbnail-v3.png` · `art/masters/mandarins-w-murcott-thumbnail-v2.png`
- **Target size:** about 68% wide.
- **Subject prompt:**
  > One Pixie mandarin as in image 1: round, lighter yellow-orange than a clementine, with a distinctly pebbled, bumpy rind and a small stem end with a tiny stub of stem. No leaf. Paint it at about 68% of the canvas width, matching the visual weight of the Gold Nugget. The pebbled texture and paler yellow-orange must still show at 72 px.
- **Handoff entry:** `{ "id": "mandarins-pixie-thumbnail-v2", "item": "mandarins", "variety": "pixie", "role": "thumbnail", "alt": "A small, round yellow-orange Pixie mandarin with finely pebbled rind", "revision": 2 }`

## Batch 3: scale

The approved Gala was painted small, at 63% of the canvas width against 68–75% for the other apples. The nectarine was painted at 84% against 70% for peaches and 78% for plums, and the grapefruit at 88% against 79–85% for the other citrus. Claude has already rescaled the masters in `art/masters/`, so image 1 is at the target scale.

### apples-gala-thumbnail-v4

- **Inputs:** `art/masters/apples-gala-thumbnail-v3.png` · `art/masters/apples-fuji-thumbnail-v2.png` · `art/masters/apples-honeycrisp-thumbnail-v3.png`
- **Target size:** about 69% wide.
- **Subject prompt:**
  > One Gala apple as in image 1: a small-to-medium, slightly conical round apple with bright orange-red stripes and blush over a golden-yellow ground, and a slender stem. Paint it at about 69% of the canvas width, matching the Fuji and Honeycrisp. The striping over gold sets it apart from Honeycrisp's mottling.
- **Handoff entry:** `{ "id": "apples-gala-thumbnail-v4", "item": "apples", "variety": "gala", "role": "thumbnail", "alt": "A small Gala apple with orange-red stripes over gold", "revision": 4 }`

### nectarines-thumbnail-v2

- **Inputs:** `art/masters/nectarines-thumbnail-v1.png` · `art/masters/peaches-thumbnail-v2.png` · `art/masters/plums-thumbnail-v1.png`
- **Target size:** about 74% wide.
- **Subject prompt:**
  > One whole nectarine as in image 1: smooth, fuzz-free, faintly glossy skin with a shallow seam, and deep crimson over most of the fruit, giving way to golden yellow on one shoulder. Paint it at about 74% of the canvas width, between the peach and the plum. Its smooth red skin sets it apart from the peach's soft, fuzzy blush.
- **Handoff entry:** `{ "id": "nectarines-thumbnail-v2", "item": "nectarines", "role": "thumbnail", "alt": "A whole smooth red nectarine with a golden shoulder and shallow seam", "revision": 2 }`

### grapefruit-thumbnail-v3

- **Inputs:** `art/masters/grapefruit-thumbnail-v2.png` · `art/masters/oranges-blood-thumbnail-v2.png` · `art/masters/oranges-valencia-thumbnail-v2.png`
- **Target size:** longer side about 82%.
- **Subject prompt:**
  > One whole yellow grapefruit with a cut half in front, as in image 1: the whole fruit's pale yellow rind is blushed faintly pink, and the cut half shows rose-pink segments, thin pale membranes and a white pith ring. Keep the whole fruit and the half overlapping compactly, at about 82% of the canvas on the longer side, matching the blood orange and the Valencia.
- **Handoff entry:** `{ "id": "grapefruit-thumbnail-v3", "item": "grapefruit", "role": "thumbnail", "alt": "A yellow grapefruit with a cut half showing rose-pink segments", "revision": 3 }`

## Batch 4: provisional items

These items have no catalog record yet. Save the PNGs here under their `provisional-` names. Record Jared's decision under each one, but add no handoff entry.

### provisional-kiwifruit-thumbnail-v2

- **Why:** a whole brown oval reads as a potato or a mango at card size; a kiwi is recognized by its green cut face.
- **Inputs:** `art/staging/11-tropical-staples/provisional-kiwifruit-thumbnail-v1.png` · `art/masters/grapefruit-thumbnail-v2.png` (cut-half composition) · `art/staging/12-citrus-orchard-fruit/provisional-limes-thumbnail-v1.png`
- **Target size:** longer side about 80%.
- **Subject prompt:**
  > One whole kiwifruit with a cut half in front. The whole fruit is an oval with fine, short, fuzzy brown skin. The cut half shows bright translucent green flesh, a creamy white core with fine pale rays, and a ring of tiny black seeds around the core. Overlap the two compactly. The green cut face must read clearly at 40 px on both backgrounds.
- **Proposed alt:** A fuzzy brown kiwifruit beside a cut half with green flesh and a ring of black seeds

### provisional-papaya-thumbnail-v2

- **Why:** a whole orange oblong reads as a mango at card size; a papaya is recognized by its cut half with black seeds.
- **Inputs:** `art/staging/11-tropical-staples/provisional-papaya-thumbnail-v1.png` · `art/staging/17-roots-tropical-fruit/provisional-dragon-fruit-thumbnail-v1.png` (cut-half composition) · `art/masters/mangoes-thumbnail-v1.png` (the shape to avoid)
- **Target size:** longer side about 85%.
- **Subject prompt:**
  > One whole ripe papaya with a lengthwise cut half in front of it. The skin is smooth, yellow with green streaks fading toward the stem end. The cut face shows salmon-orange flesh around a long central cavity filled with glossy round black seeds. Elongated pear-oval shape with a blunt stem end. The black-seeded cavity must read at 40 px, and it must not look like a mango.
- **Proposed alt:** A papaya cut lengthwise, showing salmon-orange flesh and a cavity of black seeds

### provisional-iceberg-thumbnail-v2

- **Why:** it is indistinguishable from the green cabbage.
- **Inputs:** `art/staging/14-lettuce-spinach/provisional-iceberg-thumbnail-v1.png` · `art/staging/13-brassicas/provisional-cabbage-thumbnail-v1.png` (the look to avoid) · `art/staging/14-lettuce-spinach/provisional-romaine-thumbnail-v1.png`
- **Target size:** longer side about 82%.
- **Subject prompt:**
  > One head of iceberg lettuce with a wedge cut from it, the wedge resting in front. The head is pale, nearly white-green at the center, fresh light green on the outer leaves. The leaves are thin, crisp and loosely crinkled, with wavy, slightly ruffled edges and fine pale veins. Unlike the smooth, waxy, blue-green cabbage in image 2, it has no thick prominent ribs and no tight, heavy layers. The wedge shows densely packed, pale, crisp, wavy layers. At 72 px it must read as lettuce, not cabbage.
- **Proposed alt:** A pale green head of iceberg lettuce with a crisp cut wedge

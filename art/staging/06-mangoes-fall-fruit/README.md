# Mangoes and fall fruit

## Stage 1 · Mangoes, Ataulfo and Kent

Review the [stage 1 contact sheet](review-stage-1.png) at 320 px and 72 px on Orchard ivory and warm charcoal. All three staged candidates are original 1254 × 1254 RGBA PNGs from one built-in image-generation call per subject, with transparent backgrounds enabled. Orchard’s `checkMaster` returned no problems for each image. The preview shows intact silhouettes and no obvious pale halos at either size.

Catalog IDs come from [mangoes.yaml](../../../content/items/mangoes.yaml). The [Orchard illustration-language study](../../../docs/design/references/04-illustration-language.png) and [approved staged item pear](../04-pears/pears-thumbnail-v2.png) were supplied for paint handling. The [National Mango Board cultivar photo plate and descriptions](https://www.mango.org/wp-content/uploads/2017/10/Mango_Handling_and_Ripening_Protocol_Eng.pdf) and labeled photographs below were used to check fruit shape and color when writing the prompts.

The manifest entries below are proposed for integration. The canonical export settings are 160, 320 and 640 px WebP, quality 82 and alpha quality 90.

### Mangoes

Staged PNG [`mangoes-thumbnail-v1.png`](mangoes-thumbnail-v1.png). Intended master `art/masters/mangoes-thumbnail-v1.png`.

```json
{
  "id": "mangoes-thumbnail-v1",
  "item": "mangoes",
  "role": "thumbnail",
  "alt": "A whole oval mango with a deep red blush and green and golden skin",
  "revision": 1,
  "status": "requested"
}
```

[National Mango Board cultivar profile](https://www.mango.org/mango-variety/tommy-atkins/) · [Labeled specimen photo](https://www.mango.org/wp-content/uploads/2024/06/plu-tommy-atkins-mango_v2.png)

#### Generation prompt

> Create one whole mango for an Orchard produce thumbnail, on a square 1024 px or larger PNG with genuine transparent alpha. Center the entire fruit with balanced clear padding on all sides, occupying around 76% of the longest canvas dimension. Show a gently elevated three-quarter view with the long axis tilted slightly from vertical and soft diffuse upper-left light. Match the luminous botanical watercolor of the attached Orchard illustration-language study and approved staged pear. Use those images for paint handling, framing and isolation only. Model volume with broad overlapping translucent washes, subtly granulated pigment, local pigment pooling, and occasional soft or broken edges. Reserve a small irregular highlight within the paint. Keep useful detail at 320 px and a strong silhouette at 72 px. The whole fruit stands alone, with no leaves, sliced fruit, ground shadow, text, paper outside the fruit, checkerboard, outlines, or glossy plastic finish. Use a Tommy Atkins specimen as the representative item mango. Paint a medium-to-large, asymmetric oblong oval, fuller at the stem end and gently tapered at the other, with a broad muted red blush across much of the visible skin, grading into orange-gold and a definite patch of natural green. Add a few subtle lenticels and a tiny stem scar. Keep the red-led fruit legible as a mango at 72 px, with the asymmetric outline and slightly off-center, rounded tip.

#### Review

The red wash blends into gold and green, and the gently tapered silhouette reads as a mango on both backgrounds. The Tommy Atkins specimen represents the item as a whole.

### Ataulfo (Honey)

Staged PNG [`mangoes-ataulfo-thumbnail-v1.png`](mangoes-ataulfo-thumbnail-v1.png). Intended master `art/masters/mangoes-ataulfo-thumbnail-v1.png`.

```json
{
  "id": "mangoes-ataulfo-thumbnail-v1",
  "item": "mangoes",
  "variety": "ataulfo",
  "role": "thumbnail",
  "alt": "A slender golden-yellow Ataulfo mango with a gently curved tip",
  "revision": 1,
  "status": "requested"
}
```

[National Mango Board cultivar profile](https://www.mango.org/mango-variety/honey/) · [Labeled specimen photo](https://www.mango.org/wp-content/uploads/2024/06/plu-honey-mango_v2.png)

#### Generation prompt

> Create one whole mango for an Orchard produce thumbnail, on a square 1024 px or larger PNG with genuine transparent alpha. Center the entire fruit with balanced clear padding on all sides, occupying around 76% of the longest canvas dimension. Show a gently elevated three-quarter view with the long axis tilted slightly from vertical and soft diffuse upper-left light. Match the luminous botanical watercolor of the attached Orchard illustration-language study and approved staged pear. Use those images for paint handling, framing and isolation only. Model volume with broad overlapping translucent washes, subtly granulated pigment, local pigment pooling, and occasional soft or broken edges. Reserve a small irregular highlight within the paint. Keep useful detail at 320 px and a strong silhouette at 72 px. The whole fruit stands alone, with no leaves, sliced fruit, ground shadow, text, paper outside the fruit, checkerboard, outlines, or glossy plastic finish. Paint a ripe Ataulfo (Honey) mango. Show the smaller, flattened oblong profile, with one slightly straighter flank, one gently curved flank and a subtly offset, rounded tapered tip. Use rich golden-yellow and honey-ochre, a little deeper toward the shaded rim, with no red blush. Add a tiny stem scar and just a few fine shallow wrinkles nearby. Keep the fruit neither perfectly symmetrical nor dramatically hooked.

#### Review

The golden skin, slightly curved outline and faint stem-end wrinkles distinguish Ataulfo at card size. Its displayed height is close to the other mangoes to match the thumbnail framing of the other assets.

### Kent

Staged PNG [`mangoes-kent-thumbnail-v1.png`](mangoes-kent-thumbnail-v1.png). Intended master `art/masters/mangoes-kent-thumbnail-v1.png`.

```json
{
  "id": "mangoes-kent-thumbnail-v1",
  "item": "mangoes",
  "variety": "kent",
  "role": "thumbnail",
  "alt": "A broad, dark green Kent mango with yellow flecks and a small wine-red blush",
  "revision": 1,
  "status": "requested"
}
```

[National Mango Board cultivar profile](https://www.mango.org/mango-variety/kent/) · [Labeled specimen photo](https://www.mango.org/wp-content/uploads/2024/06/plu-kent-mango_v2.png)

#### Generation prompt

> Create one whole mango for an Orchard produce thumbnail, on a square 1024 px or larger PNG with genuine transparent alpha. Center the entire fruit with balanced clear padding on all sides, occupying around 76% of the longest canvas dimension. Show a gently elevated three-quarter view with the long axis tilted slightly from vertical and soft diffuse upper-left light. Match the luminous botanical watercolor of the attached Orchard illustration-language study and approved staged pear. Use those images for paint handling, framing and isolation only. Model volume with broad overlapping translucent washes, subtly granulated pigment, local pigment pooling, and occasional soft or broken edges. Reserve a small irregular highlight within the paint. Keep useful detail at 320 px and a strong silhouette at 72 px. The whole fruit stands alone, with no leaves, sliced fruit, ground shadow, text, paper outside the fruit, checkerboard, outlines, or glossy plastic finish. Paint one large, full-bodied Kent mango, broad and plump with an asymmetric, gently tapering oval silhouette and rounded tip. The skin should read predominantly deep natural green. Show restrained olive-yellow undertones and a few tiny yellow lenticels. Add a small, subdued wine-red blush on one shoulder, taking up no more than about one fifth of the face. Include a tiny stem scar. The shape is much fuller than a yellow Ataulfo, with no dramatically hooked beak.

#### Review

The green body, fuller oval and yellow lenticels read clearly. The upper shoulder has a brighter red blush and a broader yellow area than the prompt specified. The fruit still reads as predominantly green at card size.

## Stage 2 · Keitt and pomegranates

The [stage 2 contact sheet](review-stage-2.png) shows both candidates at 320 px and 72 px on Orchard ivory and warm charcoal, with the staged Kent alongside Keitt for comparison. Each is an original 1254 × 1254 RGBA PNG from one built-in generation with transparency enabled. `checkMaster` returned no problems for either file. The preview shows intact silhouettes and no obvious pale halos. Canonical export settings are 160, 320 and 640 px WebP, quality 82 and alpha quality 90.

### Keitt

Staged PNG [`mangoes-keitt-thumbnail-v1.png`](mangoes-keitt-thumbnail-v1.png). Intended master `art/masters/mangoes-keitt-thumbnail-v1.png`.

```json
{
  "id": "mangoes-keitt-thumbnail-v1",
  "item": "mangoes",
  "variety": "keitt",
  "role": "thumbnail",
  "alt": "A broad oval Keitt mango with green skin and a short stem scar",
  "revision": 1,
  "status": "requested"
}
```

[National Mango Board Keitt profile](https://www.mango.org/mango-variety/keitt/) and [labeled cultivar photograph](https://www.mango.org/wp-content/uploads/2024/06/plu-keitt-mago_v2.png) establish the large oval and skin that stays green when ripe. The Orchard illustration-language study and [staged Kent](mangoes-kent-thumbnail-v1.png) guided paint handling, scale, and lighting.

#### Generation prompt

> Paint an isolated botanical watercolor for Orchard’s produce catalog. Deliver a square PNG at least 1024 px per side with genuine transparent alpha and fully clear margins. Center the subject, leaving approximately 10% crop safety on all sides. Use a gently elevated three-quarter view and soft diffuse upper-left light. Build volume using layered translucent washes, restrained granulation, intermittent pigment pooling, and a few finely observed details. Reserve small irregular highlights within the paint. The overall shape should be clear at 72 px and the brushwork visible at 320 px. No paper or texture beyond the subject, checkerboard, tabletop, ground shadow, lettering, leaves, border, or watermark. Avoid hard outlines and plastic gloss. Show one large whole Keitt mango with a wide, elongated oval body, softly asymmetric shoulders and a rounded, slightly tapering tip, angled a little from vertical. Paint a ripe green specimen in medium leaf green and deeper natural green with a quiet yellow-green wash where the light hits, sparse small lenticels, and a very short stem scar. Choose a specimen without a pink shoulder blush so it reads distinctly from the red-shouldered Kent. Keep the shape fleshy, broad and gently asymmetric, with a smooth margin and no hooked point. Use the Orchard illustration-language sheet and the staged Kent as style, framing, and illumination references. Do not repeat Kent’s blush or golden shoulder. No cut fruit.

#### Review

Keitt matches Kent closely in tilt and outline. Its medium-to-deep green body and lack of pink or red are the clearest differences at 72 px. The yellow-green highlight on the shoulder is broader than requested.

### Pomegranates

Staged PNG [`pomegranates-thumbnail-v1.png`](pomegranates-thumbnail-v1.png). Intended master `art/masters/pomegranates-thumbnail-v1.png`.

```json
{
  "id": "pomegranates-thumbnail-v1",
  "item": "pomegranates",
  "role": "thumbnail",
  "alt": "A red pomegranate with a pointed crown beside a cut half showing ruby arils",
  "revision": 1,
  "status": "requested"
}
```

[USDA Wonderful accession](https://npgsweb.ars-grin.gov/gringlobal/accessiondetail?id=1549472), [UF/IFAS pomegranate description and cultivar photo](https://ask.ifas.ufl.edu/publication/mg056), and the [OECD Wonderful photo plate](https://www.oecd.org/content/dam/oecd/en/publications/reports/2014/03/pomegranate_g1g39429/9789264206700-en-fr.pdf) ground the crown, rind, and cut anatomy. The Orchard illustration-language study, [pear and pomegranate study](../../../docs/design/references/Pear%2C%20Pomegranate%2C%20and%20Apple%20Blossom%20Study-1.png), and [approved staged item pear](../04-pears/pears-thumbnail-v2.png) guided paint handling.

#### Generation prompt

> Paint an isolated botanical watercolor for Orchard’s produce catalog. Deliver a square PNG at least 1024 px per side with genuine transparent alpha and fully clear margins. Center the subject, leaving approximately 10% crop safety on all sides. Use a gently elevated three-quarter view and soft diffuse upper-left light. Build volume using layered translucent washes, restrained granulation, intermittent pigment pooling, and a few finely observed details. Reserve small irregular highlights within the paint. The overall shape should be clear at 72 px and the brushwork visible at 320 px. No paper or texture beyond the subject, checkerboard, tabletop, ground shadow, lettering, leaves, border, or watermark. Avoid hard outlines and plastic gloss. Use a Wonderful pomegranate as the representative item. Compose a compact grouping with one dominant whole fruit to the left and behind, and one attached-to-the-composition cut half resting visually in front at the lower right, overlapping the whole fruit without hiding its crown. Give the whole fruit broad rounded shoulders, subtly flattened sides, taut red-to-crimson leathery rind, and a short persistent open crown with several triangular sepals curling slightly outward, with restrained tawny tips. Show the cut face in three-quarter view: narrow red outer skin and pale rind, naturally irregular ivory partitions enclosing tightly packed, angular translucent deep ruby arils. Avoid evenly radiating citrus sections, rows of spherical beads, detached arils, branches, and a tall decorative crown. Use the central pomegranate and the pear in the Orchard Pear, Pomegranate, and Apple Blossom Study for the layered pigment and painted highlights. Use the illustration-language sheet and isolated staged pear for the editorial style and clean alpha treatment. Paint the two pieces as a single compact silhouette.

#### Review

The whole fruit’s crown and the cut half’s ruby arils and cream partitions are legible at 72 px. The crown is taller and more flared than briefed. The grouping follows the Orchard study and keeps both pieces legible at card size.

## Stage 3 · Figs and persimmons

The [stage 3 contact sheet](review-stage-3.png) shows both candidates at 320 px and 72 px on Orchard ivory and warm charcoal. Each is an original 1254 × 1254 RGBA PNG from one built-in generation with transparency enabled. `checkMaster` returned no problems for either file. Both silhouettes read clearly on the two backgrounds, with no obvious pale halos. Canonical export settings are 160, 320 and 640 px WebP, quality 82 and alpha quality 90.

### Figs

Staged PNG [`figs-thumbnail-v1.png`](figs-thumbnail-v1.png). Intended master `art/masters/figs-thumbnail-v1.png`.

```json
{
  "id": "figs-thumbnail-v1",
  "item": "figs",
  "role": "thumbnail",
  "alt": "A dark purple Black Mission fig beside a cut half with pink flesh and tiny seeds",
  "revision": 1,
  "status": "requested"
}
```

[University of California cultivar photo sheet](https://ucanr.edu/?legacy-file=363634.pdf&legacy-file-path=sites%2FUC_Master_Gardeners%2Ffiles%2F) and [UC Marin Black Mission description](https://ucanr.edu/site/uc-marin-master-gardeners/document/fig) ground the fruit shape, purple-black skin and pink flesh. The Orchard illustration-language study and [staged pomegranate](pomegranates-thumbnail-v1.png) guide the paint handling and overlap of whole and cut fruit.

#### Generation prompt

> Paint an Orchard produce thumbnail in naturalistic botanical watercolor. Deliver one square 1024 px or larger PNG with genuine transparent alpha and fully clear padding of about 10% on all sides. Center the compact grouping. Use a gently elevated three-quarter view and soft diffuse upper-left light. Describe volume with broad layered translucent washes, subtle granulation, a few softly broken edges, occasional pigment pooling, and selective fine detail. Keep the main shape recognizable at 72 px and the painted texture visible at 320 px. Match the Orchard illustration-language reference for paint handling and the staged reference for clean isolation. Keep the background genuinely transparent and free of shadows, paper texture, borders, lettering, tabletop, and watermark. Avoid heavy outlines and glossy plastic highlights. Use a ripe Black Mission as the representative fig. Show one whole fig upright behind one lengthwise half angled forward to its lower right, tucked closely against the whole fruit. Give the whole fruit a plump teardrop body, a short slightly bent tapering neck and small olive-brown stem. Paint deep violet, aubergine and purple-black skin with a muted dusty violet bloom where the light hits and dark plum toward the shaded side. The longitudinal cut runs from stem toward the fig eye. Inside, paint a very thin dark purple skin, a narrow pale cream-to-pink band and soft densely textured rose to strawberry-colored pulp with many tiny pale tan seed flecks embedded in the flesh. Use subtle fine radial fibers that follow the shape into the center. Do not paint large ruby beads, citrus-like sections, or prominent partitions. No foliage or loose seeds.

#### Review

The purple skin, bent neck, and pink cut face are distinct at both sizes. The cut face uses fine seed flecks and fibers. The whole fig’s neck and stem are longer than briefed.

### Persimmons

Staged PNG [`persimmons-thumbnail-v1.png`](persimmons-thumbnail-v1.png). Intended master `art/masters/persimmons-thumbnail-v1.png`.

```json
{
  "id": "persimmons-thumbnail-v1",
  "item": "persimmons",
  "role": "thumbnail",
  "alt": "A squat orange Fuyu persimmon with a broad green four-lobed cap",
  "revision": 1,
  "status": "requested"
}
```

[UC ANR labeled cultivar photograph](https://ucanr.edu/rec/south-coast-research-and-extension-center/about-persimmons) and [UF/IFAS fruit anatomy](https://ask.ifas.ufl.edu/publication/HS1493) ground the flattened fruit, smooth orange skin, and four-lobed calyx. The [Orchard illustration-language study](../../../docs/design/references/04-illustration-language.png) and [approved staged item pear](../04-pears/pears-thumbnail-v2.png) guide the wash and isolation.

#### Generation prompt

> Paint an Orchard produce thumbnail in naturalistic botanical watercolor. Deliver one square 1024 px or larger PNG with genuine transparent alpha and fully clear padding of about 10% on all sides. Center the compact grouping. Use a gently elevated three-quarter view and soft diffuse upper-left light. Describe volume with broad layered translucent washes, subtle granulation, a few softly broken edges, occasional pigment pooling, and selective fine detail. Keep the main shape recognizable at 72 px and the painted texture visible at 320 px. Match the Orchard illustration-language reference for paint handling and the staged reference for clean isolation. Keep the background genuinely transparent and free of shadows, paper texture, borders, lettering, tabletop, and watermark. Avoid heavy outlines and glossy plastic highlights. Paint one whole ripe Fuyu persimmon as the item representative. Give it a squat oblate tomato-like silhouette clearly wider than tall, gently rounded shoulders, a broad nearly flat base, and smooth skin with a warm clear orange wash shading into red-orange. Show the top in three-quarter view. A broad persistent green calyx has exactly four broad contiguous leaflike lobes arranged around a short central woody stem stub. The lobes lie close over the shoulder, with subtle olive veins and gently irregular edges, and emerge from a single common base. Keep all four lobes individually readable. No separate branch or leaves. No cutaway. Avoid deep pumpkin grooves, protruding pointed base, a long stem, or an upright pomegranate crown. Use the painted Fuyu in the illustration-language study for the orange wash and the isolated pear for the finish, and follow the four-lobed anatomy described here.

#### Review

The squat orange shape and four individually visible calyx lobes read at both sizes. The cap is broad and contiguous around the stem. The stem stub is slightly taller and the cap more golden at its edges than briefed.

## Acceptance record

Jared approved all seven staged candidates together. Each PNG passed `checkMaster` and is ready for the integration owner to register, place at its intended master path, and process.

| Approved asset ID | Staged PNG |
| --- | --- |
| `mangoes-thumbnail-v1` | [Mangoes](mangoes-thumbnail-v1.png) |
| `mangoes-ataulfo-thumbnail-v1` | [Ataulfo](mangoes-ataulfo-thumbnail-v1.png) |
| `mangoes-kent-thumbnail-v1` | [Kent](mangoes-kent-thumbnail-v1.png) |
| `mangoes-keitt-thumbnail-v1` | [Keitt](mangoes-keitt-thumbnail-v1.png) |
| `pomegranates-thumbnail-v1` | [Pomegranates](pomegranates-thumbnail-v1.png) |
| `figs-thumbnail-v1` | [Figs](figs-thumbnail-v1.png) |
| `persimmons-thumbnail-v1` | [Persimmons](persimmons-thumbnail-v1.png) |

The [stage 1](review-stage-1.png), [stage 2](review-stage-2.png), and [stage 3](review-stage-3.png) contact sheets cover the approved batch. No illustration work remains in this batch.


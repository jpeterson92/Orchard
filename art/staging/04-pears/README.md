# Pear batch

Pear item and rated varieties Anjou, Bartlett, Bosc, Comice, Seckel and Starkrimson from [`content/items/pears.yaml`](../../../content/items/pears.yaml). Jared accepted the latest staged version of all seven subjects. The approved selection is listed in the acceptance record below.

## Shared production brief

- Use a single whole pear as a 72 px list thumbnail and 320 px detail illustration, following [illustration guide §2 A](../../../docs/design/illustration-guide.md#a-isolated-produce-illustration).
- Built-in image generation used [04 Illustration Language](../../../docs/design/references/04-illustration-language.png) and the left-hand pear in the [local pear study](../../../docs/design/references/10-botanical-study.png) for paint handling. The checked apple pilot was unavailable for the first step.
- The first three source paintings were centered on a 1440 × 1440 transparent RGBA PNG canvas without resampling, to align framing and give the stems crop safety. The staged PNGs each passed `checkMaster`. A visual check at 72 and 320 px on ivory and warm charcoal found clear silhouettes and no obvious pale halos.
- Manifest fields below are proposed for integration. The canonical processor generates square 160, 320 and 640 px WebP derivatives at quality 82 and alpha quality 90. It moves integrated `requested` entries to `review` after processing. Jared makes review and approval decisions.

## Pears

Staged file [`pears-thumbnail-v1.png`](pears-thumbnail-v1.png). Intended master `art/masters/pears-thumbnail-v1.png`.

```json
{
  "id": "pears-thumbnail-v1",
  "item": "pears",
  "role": "thumbnail",
  "alt": "A golden-green pear with a soft coral blush",
  "revision": 1,
  "status": "requested"
}
```

[USA Pears Bartlett](https://www.usapears.org/bartlett/) grounds the archetypal bell-shaped base and distinct shoulder. The color and brushwork follow the local pear study.

### Generation prompt

> Create one square 1024×1024 or larger transparent PNG for an Orchard produce thumbnail, a single centered whole pear with comfortable clear margins, around 76% of the square's height. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Paint a naturalistic botanical watercolor for a warm contemporary produce journal. Build volume with luminous translucent overlapping washes, subtle granulation and pigment pooling, selective stem and lenticel detail, and a few softened irregular pigment edges. Keep the color natural and the silhouette legible at 72 px and the paint texture legible at 320 px. Use the local illustration-language sheet and the pear at the left of the local pear study for paint handling only. Exclude their paper, cast shadows, layout, typography, and accompanying specimens. Surround the subject with real transparent alpha, with no checkerboard, paper, tabletop, horizon, shadow, border, letters, or watermark. Avoid glossy 3D, heavy outlines, cartoons, and uniform blur. Show an archetypal European pear with a bell-shaped lower body, clear shoulder narrowing into a medium neck, and a short gently curved woody stem. Use luminous golden-green skin and a soft, localized coral blush on one flank, with delicate lenticels. Paint the fruit and stem alone.

### Check and review notes

Checked. The broad base, distinct shoulder and coral flank read clearly at both sizes. The blush preserves separation from the green Anjou. The stem is longer than specified in the brief.

## Green Anjou

Staged file [`pears-anjou-thumbnail-v1.png`](pears-anjou-thumbnail-v1.png). Intended master `art/masters/pears-anjou-thumbnail-v1.png`.

```json
{
  "id": "pears-anjou-thumbnail-v1",
  "item": "pears",
  "variety": "anjou",
  "role": "thumbnail",
  "alt": "A green Anjou pear with a rounded base and short, tapered neck",
  "revision": 1,
  "status": "requested"
}
```

[USA Pears Green Anjou](https://www.usapears.org/green-anjou/) documents the round-based egg shape, gentle taper and green skin.

### Generation prompt

> Create one square 1024×1024 or larger transparent PNG for an Orchard produce thumbnail, a single centered whole pear with comfortable clear margins, around 76% of the square's height. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Paint a naturalistic botanical watercolor for a warm contemporary produce journal. Build volume with luminous translucent overlapping washes, subtle granulation and pigment pooling, selective stem and lenticel detail, and a few softened irregular pigment edges. Keep the color natural and the silhouette legible at 72 px and the paint texture legible at 320 px. Use the local illustration-language sheet and the pear at the left of the local pear study for paint handling only. Exclude their paper, cast shadows, layout, typography, and accompanying specimens. Surround the subject with real transparent alpha, with no checkerboard, paper, tabletop, horizon, shadow, border, letters, or watermark. Avoid glossy 3D, heavy outlines, cartoons, and uniform blur. Show a Green Anjou with a compact upright egg shape, rounded broad base, full shoulders gently tapering to a very short neck, and short woody stem. Skin is clear yellow-green to leaf-green throughout, with tiny scattered lenticels and a modest light-to-dark green wash. Paint the fruit and stem alone. Avoid an elongated neck or an overall yellow or brown skin.

### Check and review notes

Checked. Full shoulders and a short fruit neck distinguish it from the other two paintings. The green skin reads clearly at both sizes. The stem is more prominent than specified in the brief.

## Bosc

Staged file [`pears-bosc-thumbnail-v1.png`](pears-bosc-thumbnail-v1.png). Intended master `art/masters/pears-bosc-thumbnail-v1.png`.

```json
{
  "id": "pears-bosc-thumbnail-v1",
  "item": "pears",
  "variety": "bosc",
  "role": "thumbnail",
  "alt": "A cinnamon-brown Bosc pear with a long neck and curved stem",
  "revision": 1,
  "status": "requested"
}
```

[USA Pears Bosc](https://www.usapears.org/bosc/) documents the long neck, curved stem, rounded base and cinnamon russet.

### Generation prompt

> Create one square 1024×1024 or larger transparent PNG for an Orchard produce thumbnail, a single centered whole pear with comfortable clear margins, around 76% of the square's height. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Paint a naturalistic botanical watercolor for a warm contemporary produce journal. Build volume with luminous translucent overlapping washes, subtle granulation and pigment pooling, selective stem and lenticel detail, and a few softened irregular pigment edges. Keep the color natural and the silhouette legible at 72 px and the paint texture legible at 320 px. Use the local illustration-language sheet and the pear at the left of the local pear study for paint handling only. Exclude their paper, cast shadows, layout, typography, and accompanying specimens. Surround the subject with real transparent alpha, with no checkerboard, paper, tabletop, horizon, shadow, border, letters, or watermark. Avoid glossy 3D, heavy outlines, cartoons, and uniform blur. Show a Bosc with a distinctive elongated slender neck that widens gradually into a full rounded lower body and a long curved woody stem. Paint warm cinnamon and ochre-brown russet across most of the matte skin, with fine mottling and a little golden undertone. Keep the pigment varied and the russet organic. Paint the fruit and stem alone.

### Check and review notes

Checked. The slender neck, curved stem and russet-brown coloring read at both sizes. The source failed crop safety at top. The stem tip is intact, and the staged export passed after transparent padding. The highlights lean orange-gold.

## Second illustration step

Used the illustration-language sheet, local pear study, staged pear item master, and checked apple pilot for paint treatment and framing. Added transparent padding to center each painting without resampling. Checked each at 72 and 320 px on ivory and warm charcoal. The silhouettes are clear and the edges show no obvious pale halos.

### Bartlett

Staged file [`pears-bartlett-thumbnail-v1.png`](pears-bartlett-thumbnail-v1.png). Intended master `art/masters/pears-bartlett-thumbnail-v1.png`.

```json
{
  "id": "pears-bartlett-thumbnail-v1",
  "item": "pears",
  "variety": "bartlett",
  "role": "thumbnail",
  "alt": "A golden-yellow Bartlett pear with a bell-shaped base and defined shoulder",
  "revision": 1,
  "status": "requested"
}
```

The rounded bell, defined shoulder, narrower neck and golden ripe skin are documented by [USA Pears Bartlett](https://www.usapears.org/bartlett/).

#### Generation prompt

> Paint one whole pear with its stem for an Orchard produce thumbnail. Render a square transparent PNG, 1024 pixels per side or larger, with fully transparent padding on every side. Center the entire specimen and keep its stem safely inside the frame. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Paint a naturalistic botanical watercolor with luminous layered washes, pigment granulation and pooling, softly broken edges, and selective fine details in skin and stem. Match the paint treatment of the pear in the local pear study and illustration-language sheet, and the handling and isolation of the checked pear and apple masters. Use these local images for style only. The rendered result must read at 72 px and 320 px. Keep the fruit and stem alone, with genuine transparent alpha and no paper texture outside the fruit, checkerboard, horizon, tabletop, shadow, leaves, letters, labeling, border, or watermark. Avoid glossy 3D, heavy outlines, cartoons, and uniform blur. Show a ripe yellow Bartlett (Williams). Paint a broad, rounded bell-shaped bottom, a distinct shoulder, a modest narrow neck and a short woody stem. Use predominantly warm golden-yellow skin with pale yellow-green undertones, especially near the stem, fine freckles, and at most a whisper of warm blush. Keep the skin visibly golden-yellow throughout at thumbnail size.

#### Check and review notes

`checkMaster` passed on the 1440 × 1440 RGBA PNG. Golden yellow, bell-shaped base and distinct shoulder read clearly at both sizes. The curved stem is more prominent than specified.

### Comice

Staged file [`pears-comice-thumbnail-v1.png`](pears-comice-thumbnail-v1.png). Intended master `art/masters/pears-comice-thumbnail-v1.png`.

```json
{
  "id": "pears-comice-thumbnail-v1",
  "item": "pears",
  "variety": "comice",
  "role": "thumbnail",
  "alt": "A broad green Comice pear with a short neck and rosy blush",
  "revision": 1,
  "status": "requested"
}
```

The rotund body, short defined neck, green skin and occasional red blush are documented by [USA Pears Comice](https://www.usapears.org/comice/).

#### Generation prompt

> Paint one whole pear with its stem for an Orchard produce thumbnail. Render a square transparent PNG, 1024 pixels per side or larger, with fully transparent padding on every side. Center the entire specimen and keep its stem safely inside the frame. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Paint a naturalistic botanical watercolor with luminous layered washes, pigment granulation and pooling, softly broken edges, and selective fine details in skin and stem. Match the paint treatment of the pear in the local pear study and illustration-language sheet, and the handling and isolation of the checked pear and apple masters. Use these local images for style only. The rendered result must read at 72 px and 320 px. Keep the fruit and stem alone, with genuine transparent alpha and no paper texture outside the fruit, checkerboard, horizon, tabletop, shadow, leaves, letters, labeling, border, or watermark. Avoid glossy 3D, heavy outlines, cartoons, and uniform blur. Show a green Comice with a rotund, broad body, and a very short but well-defined pear neck and small woody stem. Give the fruit full sides and a broad rounded base. Use a clear green ground with a localized rose-red blush high on one shoulder and a few subtle lenticels. Keep the round body unmistakably pear-shaped and the green ground dominant.

#### Check and review notes

`checkMaster` passed on the 1440 × 1440 RGBA PNG. The rounded body and localized rosy shoulder read clearly at both sizes. The neck is subtle in the front view.

### Seckel

Staged file [`pears-seckel-thumbnail-v1.png`](pears-seckel-thumbnail-v1.png). Intended master `art/masters/pears-seckel-thumbnail-v1.png`.

```json
{
  "id": "pears-seckel-thumbnail-v1",
  "item": "pears",
  "variety": "seckel",
  "role": "thumbnail",
  "alt": "A small olive-green Seckel pear with a dark maroon blush",
  "revision": 1,
  "status": "requested"
}
```

The petite proportions, chubby body, small neck, short stem, olive ground and maroon blush are documented by [USA Pears Seckel](https://www.usapears.org/seckel/).

#### Generation prompt

> Paint one whole pear with its stem for an Orchard produce thumbnail. Render a square transparent PNG, 1024 pixels per side or larger, with fully transparent padding on every side. Center the entire specimen and keep its stem safely inside the frame. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Paint a naturalistic botanical watercolor with luminous layered washes, pigment granulation and pooling, softly broken edges, and selective fine details in skin and stem. Match the paint treatment of the pear in the local pear study and illustration-language sheet, and the handling and isolation of the checked pear and apple masters. Use these local images for style only. The rendered result must read at 72 px and 320 px. Keep the fruit and stem alone, with genuine transparent alpha and no paper texture outside the fruit, checkerboard, horizon, tabletop, shadow, leaves, letters, labeling, border, or watermark. Avoid glossy 3D, heavy outlines, cartoons, and uniform blur. Show a petite Seckel sugar pear, slightly smaller in the square than the existing pear master, while remaining readable at list size. Give it a chubby, round body, a small but discernible pear neck and a short, slim woody stem. Use muted olive-green skin with a deep wine-maroon blush across approximately half the fruit; let a substantial olive patch remain visible to distinguish it from a uniformly red pear. Include sparse fine freckles.

#### Check and review notes

`checkMaster` passed on the 1298 × 1298 RGBA PNG. The compact body, olive ground and broader maroon blush read clearly at both sizes. The woody stem is longer than specified. The specimen occupies 68% of its canvas height, giving it a modest size cue alongside Bartlett and Comice.

## Third illustration step

### Starkrimson

Staged file [`pears-starkrimson-thumbnail-v1.png`](pears-starkrimson-thumbnail-v1.png). Intended master `art/masters/pears-starkrimson-thumbnail-v1.png`.

```json
{
  "id": "pears-starkrimson-thumbnail-v1",
  "item": "pears",
  "variety": "starkrimson",
  "role": "thumbnail",
  "alt": "A vivid crimson Starkrimson pear with a thick, curved stem",
  "revision": 1,
  "status": "requested"
}
```

The ripe crimson skin and stout stem are documented by [USA Pears Starkrimson](https://www.usapears.org/starkrimson/). The broad, tapered pear shape follows the USDA description of the parent cultivar and its resemblance to Starkrimson. [USDA Starkrimson accession](https://npgsweb.ars-grin.gov/gringlobal/accessiondetail?id=1436288) · [USDA Clapp Favorite accession](https://npgsweb.ars-grin.gov/gringlobal/accessiondetail?id=1397107)

Used the illustration-language sheet, local pear study, staged pear item master, and checked apple pilot for style and framing.

#### Generation prompt

> Paint one whole ripe Starkrimson pear with its stem for an Orchard produce thumbnail. Render a square transparent PNG, 1024 pixels per side or larger, with fully transparent padding on all sides. Center the entire specimen and keep the painted silhouette to around 78% of the square's height. Use a front or gently elevated three-quarter view and soft diffuse upper-left light. Paint a naturalistic botanical watercolor with luminous layered washes, pigment granulation and pooling, softly broken edges, and selective fine details in skin and stem. Use the illustration-language sheet and left-hand fruit in the local pear study for paint treatment, and the checked pear and apple assets for framing and handling only. Show the Starkrimson's classic pear silhouette, with a rounded broad lower body, softly sloping shoulders and moderately tapered rounded neck. Give it a thick, stocky woody stem with a very slight curve. Paint the entire skin vivid natural crimson, with a luminous bright crimson-red light side and a deeper wine-crimson shaded side, and sparse discreet lenticels. Keep reds distinctly crimson with no green or golden panels and no contrasting blush border. The red hue and stout stem should read clearly at 72 px and 320 px. Keep the fruit and stem alone, with genuine transparent alpha and no paper texture outside the fruit, checkerboard, horizon, tabletop, shadow, leaves, lettering, border, or watermark. Avoid glossy 3D, heavy outlines, cartoons, and uniform blur.

#### Check and review notes

`checkMaster` passed on the centered 1440 × 1440 RGBA PNG. Transparent padding centers the painting without resampling. The continuous crimson skin, tapered silhouette and thick stem read at 72 and 320 px on ivory and warm charcoal, with no obvious pale halo. The stem is slightly taller than the stocky profile in the brief. At 72 px the solid crimson skin distinguishes this painting from the olive-and-maroon Seckel.

## Revision pass, stage 1

Reviewed the item pear, Green Anjou, and Bosc against Orchard’s [painting and lighting guidance](../../../docs/design/illustration-guide.md#painting-construction-and-surface). The original v1 for each subject was the edit target. The local pear study and checked apple pilot guided paint handling. One built-in image generation call per subject used transparent output. Each staged revision was centered with transparent padding without resampling, passed `checkMaster`, and was inspected against its v1 at 72 and 320 px on ivory and warm charcoal. No obvious pale halos appeared in the comparison.

### Pear item

Compared [`pears-thumbnail-v1.png`](pears-thumbnail-v1.png) with staged [`pears-thumbnail-v2.png`](pears-thumbnail-v2.png). Intended master `art/masters/pears-thumbnail-v2.png`.

The long, heavy stem competes with the fruit. The bright highlight streak and orange-heavy blush flatten the layered paint at list size. The bell silhouette already reads clearly.

The item silhouette follows the local pear study and the bell-shaped form documented by [USA Pears Bartlett](https://www.usapears.org/bartlett/).

```json
{
  "id": "pears-thumbnail-v2",
  "item": "pears",
  "role": "thumbnail",
  "alt": "A golden-green pear with a soft coral blush and a short woody stem",
  "revision": 2,
  "status": "requested"
}
```

#### Revision prompt

> Targeted repaint for an Orchard botanical produce thumbnail. The first attached image is the original painting to revise. The pear study and checked apple master are secondary references for the luminous translucent washes, controlled granulation, and selective detail. Keep the subject a single whole pear in a gently elevated front three-quarter view, with consistent soft diffuse upper-left light. Preserve the watercolor character with gently irregular pigment edges, modest natural-color shade, and observed botanical proportion. Keep the centered fruit legible at 72 px while retaining selective brush texture at 320 px. Output one square PNG of at least 1024 × 1024 with genuinely transparent alpha. The entire silhouette must fit comfortably inside the frame, with at least 8% transparent margin at the top and bottom. Include only the pear and stem; exclude added leaves, shadow, tabletop, paper background, borders, typography, and watermarks. Keep the broad bell-shaped base and recognizable moderate neck, with the same slight asymmetry. Shorten the visible stem to roughly half its current length (8–10% of the fruit body height), slim it, and keep a gentle natural curve. Keep the golden-green ground dominant and soften the coral blush into a localized wash on the right flank. Soften the near-white highlight streak into a small translucent cream-gold wash, and make the freckles fewer and less uniform.

#### Check and review notes

`checkMaster` passed on the 1319 × 1319 RGBA PNG. The stem is visibly shorter and less dominant. The broad fruit silhouette and coral flank hold at list size. Softer highlights and fewer strong lenticels give the gold-green wash a gentler transition at detail size.

### Green Anjou

Compared [`pears-anjou-thumbnail-v1.png`](pears-anjou-thumbnail-v1.png) with staged [`pears-anjou-thumbnail-v2.png`](pears-anjou-thumbnail-v2.png). Intended master `art/masters/pears-anjou-thumbnail-v2.png`.

The compact pear reads at 72 px, but the thick stem and lime-yellow highlights distract from its gently tapered egg shape. The sharp glints make the skin feel shinier than the guide calls for.

The egg shape, rounded base, gentle taper, and persistent green skin follow [USA Pears Green Anjou](https://www.usapears.org/green-anjou/).

```json
{
  "id": "pears-anjou-thumbnail-v2",
  "item": "pears",
  "variety": "anjou",
  "role": "thumbnail",
  "alt": "An egg-shaped green Anjou pear with a rounded base and a short stem",
  "revision": 2,
  "status": "requested"
}
```

#### Revision prompt

> Targeted repaint for an Orchard botanical produce thumbnail. The first attached image is the original painting to revise. The pear study and checked apple master are secondary references for the luminous translucent washes, controlled granulation, and selective detail. Keep the subject a single whole pear in a gently elevated front three-quarter view, with consistent soft diffuse upper-left light. Preserve the watercolor character with gently irregular pigment edges, modest natural-color shade, and observed botanical proportion. Keep the centered fruit legible at 72 px while retaining selective brush texture at 320 px. Output one square PNG of at least 1024 × 1024 with genuinely transparent alpha. The entire silhouette must fit comfortably inside the frame, with at least 8% transparent margin at the top and bottom. Include only the pear and stem; exclude added leaves, shadow, tabletop, paper background, borders, typography, and watermarks. Refine the fruit into a compact upright egg shape with a broad, full rounded base and softly curved upper shoulders that taper continuously to the top. Keep the neck nearly absent, avoiding a pinched hourglass. Replace the heavy hooked stem with a short, slender brown stem with only a slight curve, around 6–8% of fruit body height. Use a lively natural leaf-green wash, yellow-green light at upper left, and olive-green shadow. Reduce the chartreuse cast and soften bright glints into small washed highlights. Keep the green skin free of a contrasting red blush.

#### Check and review notes

`checkMaster` passed on the 1282 × 1282 RGBA PNG. The slim stem and rounded, nearly neckless body read at 72 px. The green shadow is more olive and the pale glints are smaller, though the lit flank remains quite bright at detail size.

### Bosc

Compared [`pears-bosc-thumbnail-v1.png`](pears-bosc-thumbnail-v1.png) with staged [`pears-bosc-thumbnail-v2.png`](pears-bosc-thumbnail-v2.png). Intended master `art/masters/pears-bosc-thumbnail-v2.png`.

The long-necked silhouette is right, but the bright orange-gold skin and shiny stripe make it read close to the yellow pears at 72 px. The russet needs finer, less regular texture.

The long neck, rounded base, curved stem, and cinnamon russet follow [USA Pears Bosc](https://www.usapears.org/bosc/).

```json
{
  "id": "pears-bosc-thumbnail-v2",
  "item": "pears",
  "variety": "bosc",
  "role": "thumbnail",
  "alt": "A matte cinnamon-brown Bosc pear with a slender neck and curved woody stem",
  "revision": 2,
  "status": "requested"
}
```

#### Revision prompt

> Targeted repaint for an Orchard botanical produce thumbnail. The first attached image is the original painting to revise. The pear study and checked apple master are secondary references for the luminous translucent washes, controlled granulation, and selective detail. Keep the subject a single whole pear in a gently elevated front three-quarter view, with consistent soft diffuse upper-left light. Preserve the watercolor character with gently irregular pigment edges, modest natural-color shade, and observed botanical proportion. Keep the centered fruit legible at 72 px while retaining selective brush texture at 320 px. Output one square PNG of at least 1024 × 1024 with genuinely transparent alpha. The entire silhouette must fit comfortably inside the frame, with at least 8% transparent margin at the top and bottom. Include only the pear and stem; exclude added leaves, shadow, tabletop, paper background, borders, typography, and watermarks. Preserve the distinctive elongated, slim neck flowing into a rounded broad lower body and the clearly curved stem. Thin and taper the stem slightly, keeping it visibly longer than the cultivar stems of the pear family. Repaint the skin in warm cinnamon-tan and muted ochre-brown with deeper umber granulation and finely mottled russet across the whole surface, gently brighter at upper left. Suppress the vivid orange and yellow patches and replace the shiny stripe with a soft matte light wash. Retain warm watercolor luminosity so the brown does not become flat or muddy.

#### Check and review notes

`checkMaster` passed on the 1360 × 1360 RGBA PNG. The long, thinner curved stem and slender neck stay distinct at both sizes. The wash has finer russet mottling and a softer highlight. The color still leans warm orange-brown at 72 px, so the silhouette does more of the work there.

## Revision pass, stage 2

Reviewed Bartlett, Comice, and Seckel against Orchard’s [painting and lighting guidance](../../../docs/design/illustration-guide.md#painting-construction-and-surface) and the first three revised pears. Each v1 was the edit target. The staged pear item v2, local pear study, and checked apple pilot guided paint handling. One built-in image generation call per subject used transparent output. The exports were centered with transparent padding without resampling. Each passed `checkMaster` and was compared with its v1 at 72 and 320 px on ivory and warm charcoal. No obvious pale halos appeared.

### Bartlett

Compared [`pears-bartlett-thumbnail-v1.png`](pears-bartlett-thumbnail-v1.png) with staged [`pears-bartlett-thumbnail-v2.png`](pears-bartlett-thumbnail-v2.png). Intended master `art/masters/pears-bartlett-thumbnail-v2.png`.

The first pass has the right bell shape and immediately reads yellow, but the long curved stem, oversized shiny patches and evenly scattered dots overpower the fruit.

The ripe yellow skin, bell-shaped base, and defined shoulder follow [USA Pears Bartlett](https://www.usapears.org/bartlett/).

```json
{
  "id": "pears-bartlett-thumbnail-v2",
  "item": "pears",
  "variety": "bartlett",
  "role": "thumbnail",
  "alt": "A golden-yellow Bartlett pear with a bell-shaped base and a defined shoulder",
  "revision": 2,
  "status": "requested"
}
```

#### Revision prompt

> Targeted repaint for a transparent Orchard botanical produce thumbnail. Revise the first attached image. The other attachments are Orchard style references for translucent pigment, restrained detail, and matched framing. Keep one whole pear and its stem, front or gently elevated front three-quarter view, and soft diffuse upper-left light. Use warm naturalistic botanical watercolor with broad layered washes, subtle granulation, softly broken pigment edges, and selective skin and stem detail. Render light with a pale color wash integrated into the fruit, avoiding hard white specular patches. Keep the silhouette legible at 72 px and the brushwork at 320 px. Output one square PNG, 1024 px per side or larger, with real transparent alpha and comfortable clear margin around the entire specimen. Include only the pear and stem, with no paper outside the fruit, tabletop, shadow, added leaves, labels, borders, or watermark. Preserve the rounded bell-shaped lower body and distinct shoulder breaking into a moderately narrow neck. Shorten and slim the woody stem by about half, keeping a slight natural curve. Repaint the ripe skin in luminous straw-yellow and golden-yellow, with a touch of yellow-green near the stem and a muted ochre wash on the shaded side. Preserve the clearly yellow reading, without an orange or red blush. Replace the long bright reflection with a small cream-gold wash. Keep fewer, finer, irregular freckles.

#### Check and review notes

`checkMaster` passed on the 1280 × 1280 RGBA PNG. The lighter gold wash and sparse freckles lower the shine and preserve the warm yellow reading at 72 px. The stem is shorter and less prominent. A pale leaf-green wash at the lower left remains visible at detail size.

### Comice

Compared [`pears-comice-thumbnail-v1.png`](pears-comice-thumbnail-v1.png) with staged [`pears-comice-thumbnail-v2.png`](pears-comice-thumbnail-v2.png). Intended master `art/masters/pears-comice-thumbnail-v2.png`.

The generous body is right, but the top tapers without much of a neck break. The bright coral upper flank and large white glints pull attention from the shape.

The rotund body, very short neck, green ground, and optional red blush follow [USA Pears Comice](https://www.usapears.org/comice/).

```json
{
  "id": "pears-comice-thumbnail-v2",
  "item": "pears",
  "variety": "comice",
  "role": "thumbnail",
  "alt": "A rounded green Comice pear with a short neck and rosy shoulder",
  "revision": 2,
  "status": "requested"
}
```

#### Revision prompt

> Targeted repaint for a transparent Orchard botanical produce thumbnail. Revise the first attached image. The other attachments are Orchard style references for translucent pigment, restrained detail, and matched framing. Keep one whole pear and its stem, front or gently elevated front three-quarter view, and soft diffuse upper-left light. Use warm naturalistic botanical watercolor with broad layered washes, subtle granulation, softly broken pigment edges, and selective skin and stem detail. Render light with a pale color wash integrated into the fruit, avoiding hard white specular patches. Keep the silhouette legible at 72 px and the brushwork at 320 px. Output one square PNG, 1024 px per side or larger, with real transparent alpha and comfortable clear margin around the entire specimen. Include only the pear and stem, with no paper outside the fruit, tabletop, shadow, added leaves, labels, borders, or watermark. Retain the broad, rotund body. Give it a distinct but extremely short pear neck, with a small break in the slope of the shoulders immediately below the stem. Keep the fruit wider and rounder than a Bartlett; the neck should remain clearly visible without lengthening the fruit. Make the short woody stem slightly slimmer. Paint muted yellow-green to leaf-green as the main skin color, with a compact, softly blended rosy-red wash high on one shoulder and soft pale-green illumination on the opposite side. Keep the lower body dominantly green and the lenticels discreet.

#### Check and review notes

`checkMaster` passed on the 1280 × 1280 RGBA PNG. The broader body and small shoulder break give the Comice a more distinct outline. The green field and the localized rosy shoulder read at list size. The stem remains more prominent than the slim stem requested in the brief.

### Seckel

Compared [`pears-seckel-thumbnail-v1.png`](pears-seckel-thumbnail-v1.png) with staged [`pears-seckel-thumbnail-v2.png`](pears-seckel-thumbnail-v2.png). Intended master `art/masters/pears-seckel-thumbnail-v2.png`.

The olive and maroon separate it from the other pears, but the stem is too long for the petite fruit. The glossy glints draw the eye away from its compact profile.

The petite rounded body, short stem, olive skin, and dark maroon blush follow [USA Pears Seckel](https://www.usapears.org/seckel/).

```json
{
  "id": "pears-seckel-thumbnail-v2",
  "item": "pears",
  "variety": "seckel",
  "role": "thumbnail",
  "alt": "A petite olive-green Seckel pear with a broad maroon blush and a short stem",
  "revision": 2,
  "status": "requested"
}
```

#### Revision prompt

> Targeted repaint for a transparent Orchard botanical produce thumbnail. Revise the first attached image. The other attachments are Orchard style references for translucent pigment, restrained detail, and matched framing. Keep one whole pear and its stem, front or gently elevated front three-quarter view, and soft diffuse upper-left light. Use warm naturalistic botanical watercolor with broad layered washes, subtle granulation, softly broken pigment edges, and selective skin and stem detail. Render light with a pale color wash integrated into the fruit, avoiding hard white specular patches. Keep the silhouette legible at 72 px and the brushwork at 320 px. Output one square PNG, 1024 px per side or larger, with real transparent alpha and comfortable clear margin around the entire specimen. Include only the pear and stem, with no paper outside the fruit, tabletop, shadow, added leaves, labels, borders, or watermark. Make the body chubby and compact, with a small but discernible neck. Replace the long hook with a short, slim woody stem with only a small bend, around 6–8% of fruit body height. Keep the deep wine-maroon blush broad across one side with a substantial patch of muted olive-green clearly visible on the other. Soften near-white glints into a small pale olive-gold wash and keep skin details sparse. Center the specimen at 68–72% canvas height to retain its petite scale relative to the others.

#### Check and review notes

`checkMaster` passed on the 1341 × 1341 RGBA PNG. The visibly shorter stem, softer olive highlights, and maroon flank read at both sizes. The rounder painting takes up about 71% of the canvas height and remains shorter in the lineup.

## Jared’s acceptance

Jared accepted the latest staged revision of each subject. Use the following seven PNGs for integration.

- [`pears-thumbnail-v2`](pears-thumbnail-v2.png)
- [`pears-anjou-thumbnail-v2`](pears-anjou-thumbnail-v2.png)
- [`pears-bartlett-thumbnail-v2`](pears-bartlett-thumbnail-v2.png)
- [`pears-bosc-thumbnail-v2`](pears-bosc-thumbnail-v2.png)
- [`pears-comice-thumbnail-v2`](pears-comice-thumbnail-v2.png)
- [`pears-seckel-thumbnail-v2`](pears-seckel-thumbnail-v2.png)
- [`pears-starkrimson-thumbnail-v1`](pears-starkrimson-thumbnail-v1.png)

The JSON blocks above are registration fields. After copying these seven masters and verifying their canonical derivatives, record `approved` on the listed IDs in the canonical manifest. Earlier versions remain staged for comparison. The Starkrimson v1 acceptance closes its queued repaint.


# Leafy greens and herbs

The [curated expansion list](../../../docs/data/usda.md) includes kale, arugula, Swiss chard, mustard greens and one combined herbs item. Step 1 covers kale, arugula and Swiss chard. Step 2 covers mustard greens and one combined herbs illustration. All five are revision 1, with provisional asset IDs while their catalog records are pending. No matching standalone assets were found in staging, the masters or the manifest.

Style references are [staged leaf lettuce](../14-lettuce-spinach/provisional-leaf-lettuce-thumbnail-v1.png), [staged spinach](../14-lettuce-spinach/provisional-spinach-thumbnail-v1.png) and [the Orchard illustration guide §2 A](../../../docs/design/illustration-guide.md#a-isolated-produce-illustration). Export target is square PNG, at least 1024 px per side, with alpha transparency. Each step 1 first pass used one built-in image generation call with transparency enabled. The exports have 32 px of clear padding added on each side to bring the visible silhouettes to 83–85% of the canvas. The [review sheet](review-step-1.png) compares the candidates with both style references at 40, 72 and 320 px on ivory and warm charcoal. All three step 1 paintings passed [`checkMaster`](../../../scripts/art-lib.ts).

## Approval

Jared approved all five revision 1 paintings on November 19, 2026.

- [`provisional-kale-thumbnail-v1`](provisional-kale-thumbnail-v1.png)
- [`provisional-arugula-thumbnail-v1`](provisional-arugula-thumbnail-v1.png)
- [`provisional-swiss-chard-thumbnail-v1`](provisional-swiss-chard-thumbnail-v1.png)
- [`provisional-mustard-greens-thumbnail-v1`](provisional-mustard-greens-thumbnail-v1.png)
- [`provisional-herbs-thumbnail-v1`](provisional-herbs-thumbnail-v1.png)

The approved paintings remain in staging until their catalog records supply the item IDs for handoff.

## Shared generation prompt

> Create one new isolated botanical watercolor thumbnail for Orchard. Use image 1, staged leaf lettuce, for softly broken watercolor edges and luminous pigment washes. Use image 2, staged spinach, for the scale, fresh leaf surfaces and legibility of a detached bunch. Both are style references. Paint the subject described below with broad translucent washes, subtle granulation, selective botanical detail and soft diffuse upper-left light in a gently elevated three-quarter view. Center the complete silhouette so its longer dimension spans about 80% of a square canvas, with clear crop safety on every side. Read clearly at 40 and 72 px and reward a closer look at 320 px. Deliver a square PNG at least 1024 px per side with genuine alpha transparency. Omit paper, painted background, ground wash, cast shadows, props, borders, text, heavy outlines and photographic gloss.

## Kale

**Proposed asset ID** `provisional-kale-thumbnail-v1`

**Suggested alt text** A fan of blue-green kale leaves with tightly curled edges and pale ribs.

**Botanical reference and traits** Green curly market kale in the Vates form. Broad, elongated, blue-green blades have densely curled margins and a sturdy central rib with branching veins. [Clemson Extension, kale cultivar descriptions and photos](https://hgic.clemson.edu/kale-is-a-headless-cabbage/), [Mississippi State Extension, curly kale](https://cto.extension.msstate.edu/lawn-and-garden/vegetable-gardens/kale).

**Subject prompt**

> Paint three mature green curly kale leaves in a compact market bunch. The harvested leaves have broadly elongated, irregular blades with tight three-dimensional curls along both margins, puckered shoulders and a sturdy pale sage midrib continuing from each cut stem. Allow a few tapering lateral veins to disappear into the deep folds. Use cool blue-green washes with lifted sage and olive on the curled edges, and enough reflected light to separate overlapping leaves on warm charcoal. Let one facing blade and two offset blades read distinctly. Keep the frills dense and smaller than the broad waves of lettuce. Avoid a cabbage head, smooth spinach blades and florets.

**Check status** [Staged PNG](provisional-kale-thumbnail-v1.png). 1318 × 1318 RGBA, `checkMaster` passed. Three elongated blue-green blades have tight, pale-edged curls, substantial ribs and branching veins. At 40 px, the curly perimeter holds on both backgrounds.

## Arugula

**Proposed asset ID** `provisional-arugula-thumbnail-v1`

**Suggested alt text** A small fan of narrow arugula leaves with deep side lobes and larger tips.

**Botanical reference and traits** Mature garden arugula (*Eruca vesicaria*) has pinnately lobed basal leaves, with a large terminal lobe and roughly four to ten smaller lateral lobes. [NC State Extension, arugula leaf description and close-up](https://plants.ces.ncsu.edu/plants/eruca-vesicaria/common-name/arugula/), [UW–Madison Extension, mature and young arugula leaves](https://hort.extension.wisc.edu/articles/arugula/).

**Subject prompt**

> Paint a low asymmetrical fan of four harvested garden arugula leaves, their slim green cut petioles crossing loosely at lower left. Keep each blade narrow and elongated with about four to eight lateral lobes total and a visibly larger rounded to softly pointed terminal lobe. Deep irregular sinuses leave a continuous strip of blade along the pale green midrib. Show a few fine angled lateral veins entering lobes. Vary lobe sizes, angles and spacing across leaves. Keep the lobe edges mostly smooth, the leaf faces relatively flat and the palette fresh medium green. Leave small windows of transparency between the lobes of neighboring leaves. Avoid fern-like separate leaflets, frilly lettuce texture and grasslike stems.

**Check status** [Staged PNG](provisional-arugula-thumbnail-v1.png). 1318 × 1318 RGBA, `checkMaster` passed. Four narrow blades show smooth, deeply separated side lobes and a larger terminal lobe. Fine lateral veins are visible at 320 px. At 40 px, the open, lobed outline still distinguishes the lighter silhouette.

## Swiss chard

**Proposed asset ID** `provisional-swiss-chard-thumbnail-v1`

**Suggested alt text** Broad green chard leaves with ruby and gold stalks and branching colored veins.

**Botanical reference and traits** Bright Lights–type chard has broad, gently crinkled green leaves with substantial fleshy stalks. Petiole color continues up each leaf’s midrib. [UW–Madison Extension, Swiss chard and Bright Lights photographs](https://hort.extension.wisc.edu/articles/swiss-chard/).

**Subject prompt**

> Paint a compact harvest fan of three mature rainbow Swiss chard leaves. The main leaf has a rich ruby petiole and broad red midrib, the second a golden yellow stalk and matching midrib, and the third a quieter pink stalk and midrib. Give each leaf a continuous broad ovate-to-oblong green blade, a soft point and gently undulating intact margins. Show restrained puckering across the dark green surfaces. Each broad fleshy cut stalk tapers into a single continuous rib with branching lateral veins that soften toward the blade edge. Keep the cut stalks visible in the lower part of the painting and leave enough of two leaf faces open to show the venation. Keep the color botanical. Avoid deep lobes, fine curly margins, bare celery stalks and roots.

**Check status** [Staged PNG](provisional-swiss-chard-thumbnail-v1.png). 1318 × 1318 RGBA, `checkMaster` passed. Three broad, gently wavy blades show continuous red, yellow and pink stalks and midribs with tapering side veins. The ruby stalk remains visible at 40 px on both backgrounds.

## Mustard greens

**Proposed asset ID** `provisional-mustard-greens-thumbnail-v1`

**Suggested alt text** A bunch of broad green mustard leaves with saw-toothed edges and pale branching veins.

**Botanical references and traits** Florida Broadleaf mustard (*Brassica juncea*) has broad, fairly flat green blades with saw-toothed margins and a pale midrib. [Mississippi State Extension, mustard greens](https://extension.msstate.edu/lawn-and-garden/vegetable-gardens/mustard-greens), [Seedway, Florida Broadleaf photograph and characteristics](https://www.seedway.com/app/uploads/2019/05/SEEDWAY_Florida-Broadleaf_April2021.pdf).

**Subject prompt**

> Paint a compact hand-sized bunch of three freshly cut Florida Broadleaf mustard greens. Fan the rounded-oval blades upward from three short pale green stalks that overlap near the base. The open face of the largest blade shows a flattened cream-green midrib tapering into the tip, with gently bowed lateral veins branching outward. Give every blade a clearly visible irregular saw-toothed edge with shallow, asymmetric pointed teeth and a few broad undulations. Paint medium-to-deep natural leaf green, with light catching the overlapping shoulders and restrained shallows in the leaf surface. Keep at least two long outer margins exposed for recognition. Avoid deep arugula lobes, tight kale curls, smooth spinach margins, a lettuce heart, red stems and flowers.

**Check status** [Staged PNG](provisional-mustard-greens-thumbnail-v1.png). 1300 × 1300 RGBA, `checkMaster` passed. Three broad blades show shallow saw teeth, pale midribs and bowed lateral veins. The exposed toothed outline holds on both backgrounds at 40 px.

## Herbs

**Proposed asset ID** `provisional-herbs-thumbnail-v1`

**Suggested alt text** A small bunch of fresh basil, cilantro, rosemary, and chives.

**Botanical references and traits** A representative assortment for the single herbs item. Sweet basil contributes broad, softly pointed leaves in opposite pairs. Cilantro has rounded, scalloped divisions on slender stems. Rosemary has short needle-like leaves on a woody stem. Chives have narrow, tapering tubular leaves. [UC Agriculture and Natural Resources, herb reference photos](https://ucanr.edu/sites/default/files/2021-06/352677.pdf), [UMass Extension, fresh herbs](https://www.umass.edu/agriculture-food-and-environment/nutrition/publications-resources/produce-spotlight/fresh-herbs), [VA guide, common herbs and chives](https://www.nutrition.va.gov/docs/UpdatedPatientEd/2021GardentoTableCookbook.pdf).

**Subject prompt**

> Paint one compact, gently overlapping cut bunch of four familiar kitchen herbs for a single combined catalog entry. Keep each herb attached only to its own stem. In the foreground place one sweet basil tip with two visible pairs of broad, smooth, pointed oval leaves, curved surfaces, and quiet green midribs and fine angled veins. Beside it put two slim cilantro stems with small rounded, scalloped leaf divisions held in airy clusters; keep the cilantro distinctly smaller than the basil. At the back include one short sprig of rosemary with closely spaced, slender blue-green needle-like leaves and a subtle woody stem, and two or three slim tapering tubular chive leaves with gentle bends. Gather their cut ends naturally toward one point, with no tie. Leave each leaf shape visible at the perimeter, keeping basil and cilantro most prominent so the silhouette reads as herbs at 40 px. No blooms, kitchen props, scenery or decorative greenery.

**Check status** [Staged PNG](provisional-herbs-thumbnail-v1.png). 1326 × 1326 RGBA, `checkMaster` passed. Broad basil leaves, scalloped cilantro, needle-like rosemary and two tapering chives read as a mixed bunch. The basil and cilantro shapes carry the grouping at 40 px. The fine chives are clearer in the larger views.

## Step 2 review

The [step 2 review sheet](review-step-2.png) compares mustard greens and the combined herbs candidate with staged leaf lettuce and spinach at 40, 72 and 320 px on ivory and warm charcoal. Each painting used one built-in image generation call with transparency enabled. Added 23 px of transparent padding per side to the mustard greens and 36 px to the herbs. Each silhouette spans about 84% of the canvas.

Both step 2 paintings passed `checkMaster`.

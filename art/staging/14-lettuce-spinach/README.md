# Lettuce and spinach

All six subjects appear in the [curated expansion list](../../../docs/data/usda.md). The approved paintings use provisional IDs and remain in staging until matching catalog records exist.

[Orchard illustration guide, §2 A](../../../docs/design/illustration-guide.md#a-isolated-produce-illustration) and [illustration-language style study](../../../docs/design/references/04-illustration-language.png) guide the paintings. The [step 1 brief](step-1.md) and [step 1 review sheet](review-step-1.png) cover romaine, iceberg, and butter lettuce.

The [step 2 review sheet](review-step-2.png) shows leaf lettuce, spring mix, and spinach at 40, 72, 104, and 320 px on ivory and warm charcoal. Each step 2 master used one built-in image generation call with transparency enabled and passed Orchard’s [`checkMaster`](../../../scripts/art-lib.ts). The silhouettes remain distinguishable at 40 px. No conspicuous halos appeared on either background.

## Approval

Jared approved all six revision 1 paintings in review on November 19, 2026.

- [`provisional-romaine-thumbnail-v1`](provisional-romaine-thumbnail-v1.png)
- [`provisional-iceberg-thumbnail-v1`](provisional-iceberg-thumbnail-v1.png)
- [`provisional-butter-lettuce-thumbnail-v1`](provisional-butter-lettuce-thumbnail-v1.png)
- [`provisional-leaf-lettuce-thumbnail-v1`](provisional-leaf-lettuce-thumbnail-v1.png)
- [`provisional-spring-mix-thumbnail-v1`](provisional-spring-mix-thumbnail-v1.png)
- [`provisional-spinach-thumbnail-v1`](provisional-spinach-thumbnail-v1.png)

## Shared prompt

> Create one naturalistic botanical watercolor for an Orchard produce thumbnail. Use the Orchard illustration-language sheet for translucent washes, subtle granulation, broad overlapping paint shapes, selective botanical detail, and softly broken edges. Use a gently elevated three-quarter view and soft diffuse upper-left light. Center the complete compact specimen on a square PNG of at least 1024 px, with roughly 10% clear margin on every side of the visible silhouette. Keep shapes distinct at 72 and 96–112 px. Deliver genuine alpha transparency, fully clear around the subject. Omit all paper, background, ground wash, cast shadows, props, borders, text, roots, heavy outlines, or glossy rendering.

## Leaf lettuce

**Proposed ID** `provisional-leaf-lettuce-thumbnail-v1`

**Verified anatomy.** Green loose-leaf lettuce shown as one non-heading specimen. Black Seeded Simpson is a reference for upright growth and light green, frilled blades. [Mississippi State Extension](https://cto.extension.msstate.edu/lawn-and-garden/vegetable-gardens/lettuce), [UF/IFAS lettuce identification](https://gardeningsolutions.ifas.ufl.edu/mastergardener/resources/plantid/vegetables/lettuce/).

**Subject prompt**

> Paint one whole, market-trimmed green loose-leaf lettuce rosette in the form of Black Seeded Simpson. Show a softly upright fan of broad, thin, pale-to-medium fresh green leaves attached at a short shared base. Vary their heights and angles. Make the outer edges visibly wavy and frilled with broad irregular curls, keeping the veins delicate and the broad leaf surfaces visible. Keep the loose center leafy and irregular, without a nested round heart, a tightly wrapped head, long white romaine ribs, or dense kale-like micro-ruffles. Paint a single specimen.

**Check status.** [Staged PNG](provisional-leaf-lettuce-thumbnail-v1.png). 1254 × 1254 RGBA. A single non-heading rosette with frilled edges and no closed heart. The main silhouette spans 93% of the canvas width, tighter than the framing target. It passed the crop check.

## Spring mix

**Proposed ID** `provisional-spring-mix-thumbnail-v1`

**Verified anatomy.** Four individual baby leaves from recognizable mix ingredients. Green oakleaf has blunt lobes, Lollo Rossa has frilled red edges, and red chard has colored petioles and midribs. [Earthbound Farm ingredient list](https://earthboundfarmca.com/products/spring-mix/), [RHS lettuce types](https://www.rhs.org.uk/vegetables/lettuce/grow-your-own), [UMass Extension chard](https://www.umass.edu/agriculture-food-and-environment/nutrition/publications-resources/produce-spotlight/swiss-chard).

**Subject prompt**

> Paint a compact, gently overlapping handful of four real detached baby leaves: two light-green oakleaf lettuce blades with rounded oak-like lobes, one green-based Lollo Rossa lettuce blade with wine-red frilled edges, and one smooth oval young ruby chard leaf with a slim ruby petiole and branching red midrib. Preserve each leaf's visible identifying edge or rib. Give the assortment a low asymmetrical footprint with short separate stem ends and leaves pointing naturally in different directions. All leaves are tender and at baby-leaf scale. Avoid a shared growing center, full heads, large mature chard stalks, tossed-salad ingredients, bowl, and scattered fragments.

**Check status.** [Staged PNG](provisional-spring-mix-thumbnail-v1.png). 1254 × 1254 RGBA. Four separate young leaves are visible, including two green oakleaf blades, one red-edged Lollo Rossa, and one red-veined chard.

## Spinach

**Proposed ID** `provisional-spinach-thumbnail-v1`

**Verified anatomy.** A compact bunch of smooth-leaf spinach, with oval to spade-shaped, often pointed blades and individual green petioles. [UC Marin Master Gardeners](https://ucanr.edu/site/uc-marin-master-gardeners/document/spinach), [UF/IFAS spinach identification](https://gardeningsolutions.ifas.ufl.edu/mastergardener/resources/plantid/vegetables/spinach/).

**Subject prompt**

> Paint one small harvested bunch of five mature smooth-leaf spinach leaves (Spinacia oleracea), lying in a compact diagonal fan, stems loosely gathered and visible at lower left. Show deep fresh green blades, several gently pointed ovate to spade-shaped leaves with smooth unlobed margins or subtle basal shoulders. Each blade joins its own slim green petiole with a single modest midrib and a few fine branching veins. Give the leaves restrained surface waviness and tonal variation, with readable open faces and modest overlap. Avoid red stalks, broad lettuce ribs, serrated edges, heavy savoy crinkles, and serrated herb-like foliage.

**Check status.** [Staged PNG](provisional-spinach-thumbnail-v1.png). 1254 × 1254 RGBA. Five smooth, pointed green blades and individual slender petioles read as a harvested bunch.


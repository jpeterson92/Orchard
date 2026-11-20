# Brand batch

Two paintings for large brand uses. Inside the app the mark stays the flat vector in [`src/shared/brand.ts`](../../../src/shared/brand.ts); these are for the About page header, the not-found page and the link-preview image. Jared approved the leaf-topped O on 2026-11-20 and asked for both.

References: [09 Logo study](../../../docs/design/references/09-logo-study.png) for the wordmark, [10 Botanical study](../../../docs/design/references/10-botanical-study.png) for the blossom sprig and paint handling. The in-app wordmark is the anchor for letterforms and leaf position: run `npm run dev` and look at the masthead.

## Painted wordmark

Asset ID `brand-wordmark-v1`. Transparent PNG, at least 2048 px wide.

The 09 study puts the leaf at the O's top right, where at small sizes it reads as an accent ("Órchard"). Move it to the top centre on a short upright stem, like an apple's, with the leaf reaching out to the right at a shallow angle, as in the vector mark.

> Paint only a single watercolor leaf with a short woody stem, for a wordmark. The stem rises straight up from the top centre of a capital letter O; the leaf grows from the top of the stem and reaches out to the right at a shallow upward angle, about a third as long as the O is tall. Naturalistic botanical watercolor: luminous translucent olive and leaf-green washes, a fine paler midrib, a few softly broken pigment edges, soft upper-left light. No lettering, no fruit, no shadow, no paper. Genuine transparent background.

The letters stay type: Claude sets "Orchard" in Lora Bold in plum (#42192d) and places the painted leaf where the vector leaf sits. Painting the letters too would bring back generated letterforms that don't match the font.

## Apple blossom sprig

Asset ID `brand-blossom-v1`. Square transparent PNG, at least 1024 px, illustration guide class "Header branch".

> Paint a small botanical watercolor corner accent for a contemporary produce guide. A slender apple twig enters from the lower left with two open five-petalled apple blossoms (white petals flushed pale pink at the edges, a cluster of yellow stamens), one pink bud and three or four serrated leaves. Use natural colors, luminous transparent washes, subtle pigment variation, delicately observed stems and veins, and soft diffuse upper-left light. Leave most of the composition empty. Keep the painting refined and compact, with no thick outlines or glossy highlights. Isolate it on genuine transparency. Include no text, page background, frame, fruit or other plants.

Botanical checks: apple blossoms have five separate rounded petals, many yellow-tipped stamens and buds pinker than open flowers; leaves are oval with finely serrated edges and alternate on the twig.

## First review

[Review sheet](brand-review-v1.png) with both designs on Orchard ivory and warm charcoal. The sheet includes the masthead and app icons for scale. Jared approved the painted wordmark and apple blossom on 2026-11-20. The [approved masters](../../brand) and [web exports](../../../public/brand) include both wordmark colorways.

- [Painted wordmark](brand-wordmark-v1.png) and [reverse wordmark](brand-wordmark-v1-dark.png), 2400 × 640 transparent PNGs. The letters are set in the bundled Lora Bold. The [painted leaf source](brand-leaf-v1.png) is placed at the top center of the O with a short stem that overlaps the letter. Use the plum lettering on ivory and the cream lettering on charcoal.
- [Apple blossom sprig](brand-blossom-v1.png), 1254 × 1254 transparent PNG. The two open flowers, pink bud and four leaves are clear at 72 px. At 40 px it reads as a small floral accent. The visible painting spans 87% of the square’s height, with at least 6% clear margin at alpha above 16.
- The leaf and blossom passed the repository’s `checkMaster` validation. Both wordmark exports were checked for transparency, crop clearance and matching dimensions. The standing brand brief governs approval and placement.

### Generation prompts

The built-in ImageGen tool generated the leaf and sprig separately with transparency enabled. The wordmark was then typeset and composited from the leaf.

**Painted leaf**

```text
Create a single isolated botanical watercolor ornament for the Orchard brand wordmark. Image 1 is the logo study: use the painted leaf's olive color, precise tapered silhouette and fine vein as inspiration. Image 2 is the botanical study: match the luminous real watercolor washes and lightly broken pigment edges. Deliver ONLY one leaf and its attached short upright woody stem, on genuine transparent background. The lower end of the stem is a clean centered attachment point to be placed on a capital O in a later layout; paint no letter. From that point the thin stem rises almost vertically, then one compact oval apple leaf projects to the right at a shallow upward angle (roughly 20 degrees); its gently pointed tip finishes well to the right. Aim for a 3:1 horizontal leaf span versus visible stem rise, readable silhouette, fine serrations, quiet olive and sage with a delicate pale midrib, subtle translucent pigment, soft upper-left light. Let the stem stay distinguishable in dark green-brown. Center the complete small silhouette on a square with generous clear margins and no clipping. No other leaves, lettering, fruit, blossoms, paper, background, shadow, line art, logo mockup, or supporting marks.
```

**Blossom sprig**

```text
Paint one isolated apple blossom sprig for a small Orchard brand corner ornament, genuine transparent background. Image 1 is the Orchard botanical study, especially the apple sprig at the right: carry over its naturalistic transparent watercolor, soft warm-pink petal glazing, observed vein structure and slender woody twig. Paint a compact, airy diagonal arrangement leaning up and right from a fine twig that enters visually from the lower left; keep its painted end fully inside the canvas. Two open Malus blossoms at slightly different angles, each visibly five separate rounded white petals with pale blush at the edges and a small cluster of yellow-tipped stamens; one distinctly pink closed bud; three or four alternating oval apple leaves with finely serrated edges. Show delicate but readable blossom edges with pale rose and muted warm-gray modeling so the white petals read on ivory as well as dark charcoal. Use restrained fresh olive and sage greens, familiar orchard botanical anatomy, warm brown twig, varied watercolor washes and soft diffuse upper-left light. Give this one asymmetrical sprig clear breathing room on a square canvas with about 12 percent transparent margins and a strong compact silhouette at small header size. No fruit, other plants, text, rules, paper patch, frame, cast shadow, glossy rendering, or flat vector look.
```

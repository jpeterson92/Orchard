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

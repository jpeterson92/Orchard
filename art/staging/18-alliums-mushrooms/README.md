# Alliums and mushrooms

The [curated catalog expansion](../../../docs/data/usda.md) authorizes onions, green onions, garlic, leeks, shallots and mushrooms. All six subjects are awaiting item records, so their asset IDs and proposed item IDs are provisional. The [Orchard illustration-language sheet](../../../docs/design/references/04-illustration-language.png) was the style reference for the batch.

The [first-pass batch review sheet](review.png) shows all six subjects at 40, 72 and 320 px on ivory and warm charcoal. The [green-onion comparison](green-onion-revision-review.png) and [leek comparison](leek-revision-review.png) show the revisions.

## Approved selections

Jared approved the six subjects. The green-onion selection follows his preference for v1 with cut tubular tips. The leek selection is v3, with the cut perpendicular to the shank.

| Subject | Approved provisional asset |
| --- | --- |
| Onions | [`provisional-onions-thumbnail-v1`](provisional-onions-thumbnail-v1.png) |
| Green onions | [`provisional-green-onions-thumbnail-v1`](provisional-green-onions-thumbnail-v1.png) |
| Garlic | [`provisional-garlic-thumbnail-v1`](provisional-garlic-thumbnail-v1.png) |
| Leeks | [`provisional-leeks-thumbnail-v3`](provisional-leeks-thumbnail-v3.png) |
| Shallots | [`provisional-shallots-thumbnail-v1`](provisional-shallots-thumbnail-v1.png) |
| Mushrooms | [`provisional-mushrooms-thumbnail-v1`](provisional-mushrooms-thumbnail-v1.png) |

The approved PNGs stay in staging with their provisional names until the catalog item records are available. At that point, confirm the item IDs, rename the approved files to the catalog IDs, and add the six matching entries to the local `handoff.json`.

## Onions

- Proposed asset ID `provisional-onions-thumbnail-v1`
- Provisional item ID `onions` · thumbnail · revision 1
- Specimen · Cured yellow storage onion
- Alt · A golden yellow onion with a short dry neck and a small tuft of trimmed roots.

[NC State Extension, bulb onion curing](https://content.ces.ncsu.edu/bulb-onions) documents the dry neck, papery outer scales and clipped roots. [Purdue Extension, bulb onions](https://extension.purdue.edu/foodlink/food.php?food=onion%2C+green+onion%2C+scallion) documents round yellow storage onions and opposite root and stem ends.

**Prompt**

Paint one whole round, slightly flattened golden yellow storage onion, gently tilted so both ends are visible. Give the bulb a swollen smooth globe with overlapping papery ochre and copper outer scales, fine longitudinal creases, a short pinched straw-colored dry neck on the upper right, and a small cluster of clipped fibrous roots from one flattened basal plate on the lower left. Keep the main contour full and rounded, without individual clove lobes. No cut onion, detached skins, or green shoots.

Create a single Orchard produce thumbnail asset in the naturalistic botanical watercolor language of the attached Orchard style sheet. Use the reference for paint handling only. Front or gently elevated three-quarter view, soft diffuse upper-left light, luminous overlapping translucent washes, understated granulation and selective fine brush marks. Use soft pigment transitions within a clean silhouette. Realistic fresh produce colors and form, with enough value and edge separation for both ivory and charcoal. Center the compact composition on a square 1024 px or larger PNG with genuine transparent alpha, aiming for 75–85% coverage along its longest canvas axis. Preserve all tips and root ends. Readable at 40 and 72 px, with detail visible at 320 px. No paper, backdrop, detached shadow, border, lettering, or heavy ink outlines.

**Export and check** · One built-in generation call. Centered and reduced painted coverage from 94% to about 80%. The 1254 × 1254 RGBA candidate passed `checkMaster`. The round bulb, dry neck and root tuft read on both themes. Approved by Jared. Catalog record pending.

## Green onions

- Proposed asset ID `provisional-green-onions-thumbnail-v1`
- Provisional item ID `green-onions` · thumbnail · revision 1
- Specimen · Bunching scallions (*Allium fistulosum*)
- Alt · Three scallions with narrow white bases, short roots and tubular green leaves.

[University of Minnesota Extension, scallions](https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-scallions-in-home-gardens) documents the green and white non-bulbing stalks and root trimming. [Singapore National Parks Board, bunching onion](https://www.nparks.gov.sg/florafaunaweb/flora/4/9/4944) identifies the hollow, tubular leaves. [Purdue Extension, scallions](https://extension.purdue.edu/foodlink/food.php?food=onion%2C+green+onion%2C+scallion) describes the narrow white base.

**Prompt**

Paint three whole grocery scallions in a compact untied diagonal bunch from lower left to upper right, with overlapping stems and a slight natural fan of tips. Each plant has its own slender cylindrical white sheath base and small attached tuft of short cream fibrous roots. Show the smooth transition through pale green to gently tapering hollow tubular darker green leaves, round in cross-section, with subtle curved highlights. No separate round bulbs, flat leek-like blades, blooms, loose garnish, or tie.

Create a single Orchard produce thumbnail asset in the naturalistic botanical watercolor language of the attached Orchard style sheet. Use the reference for paint handling only. Front or gently elevated three-quarter view, soft diffuse upper-left light, luminous overlapping translucent washes, understated granulation and selective fine brush marks. Use soft pigment transitions within a clean silhouette. Realistic fresh produce colors and form, with enough value and edge separation for both ivory and charcoal. Center the compact composition on a square 1024 px or larger PNG with genuine transparent alpha, aiming for 75–85% coverage along its longest canvas axis. Preserve all tips and root ends. Readable at 40 and 72 px, with detail visible at 320 px. No paper, backdrop, detached shadow, border, lettering, or heavy ink outlines.

**Export and check** · One built-in generation call. The initial export failed crop safety. Centered and reduced painted coverage from 96% to about 80%. The 1254 × 1254 RGBA candidate passed `checkMaster`. Three pale bases and separate root tufts are visible, and the bunch silhouette holds on both themes. Approved by Jared. Catalog record pending.

**Review decision** · Jared selected v1 with the clean-cut tubular tips. Revision 2 remains available for comparison.

### Green-onion revision 2

- Proposed asset ID `provisional-green-onions-thumbnail-v2`
- Provisional item ID `green-onions` · thumbnail · revision 2
- Alt · Three green onions with white bases, short roots, and tubular leaves tapering to fine points.

The v1 candidate is the edit target. This touch-up keeps the cylindrical leaf structure and gives the bunch intact tips. The species reference identifies the leaves as hollow tubes. [Singapore National Parks Board, bunching onion](https://www.nparks.gov.sg/florafaunaweb/flora/4/9/4944).

**Prompt**

Edit the attached Orchard green-onion watercolor as the image target. Make a targeted revision to the five visible green leaf ends. Replace all five blunt circular openings with intact, naturally tapered scallion tips. Each leaf stays a slender cylindrical tube through most of its length and narrows gradually over its final section into a fine closed point. Use slightly different tip lengths and gentle curves, with rounded cylindrical shading so the tops still read as tubular scallion leaves. No open rims, holes, squared-off cuts, flat leek-like blades, or extra shoots. Fit the tapered tips within the original overall image footprint.

Keep the same three scallions and diagonal arrangement, three narrow white sheath bases, separate trimmed fibrous root tufts, color transitions, soft upper-left light, and layered translucent watercolor. Keep the altered ends sharp enough to read in the thumbnail and the paint handling consistent with the rest of the bunch. Center the isolated subject in a square transparent RGBA PNG at least 1024 px on each side, with a safe clear margin and 75–85% painted coverage along the longest canvas axis. No paper, shadow, border, or text.

**Export and check** · One built-in edit call. The 1254 × 1254 RGBA PNG passed `checkMaster` at about 81% painted coverage along the longest canvas axis. All five tips taper to closed points, and the three white bases and separate root tufts are visible. The revised silhouette reads on both themes in the [v1/v2 review sheet](green-onion-revision-review.png). The finest tip detail is clearest at 72 and 320 px. Retained for comparison.

## Garlic

- Proposed asset ID `provisional-garlic-thumbnail-v1`
- Provisional item ID `garlic` · thumbnail · revision 1
- Specimen · White softneck garlic (*Allium sativum*)
- Alt · An ivory garlic bulb with papery skin and a single clove beside it.

[New Mexico State University Extension, garlic plant parts](https://pubs.nmsu.edu/_h/H234/index.html) shows cloves enclosed by a papery outer sheath. [Washington State University Extension, garlic](https://pubs.extension.wsu.edu/product/vegetables-growing-garlic-in-home-gardens/) describes white papery softneck sheaths, clove orientation and roots on the bottom basal plate.

**Prompt**

Paint a single whole white softneck garlic bulb with one small unpeeled clove nestled beside it. Give the bulb a squat, segmented outline with subdued rounded clove ridges beneath a continuous ivory papery tunic, pale beige and lavender-gray shading, a short dry tapering neck, and a few clipped straw root fibers attached to a single flat basal disk at the broad bottom. Tilt the bulb subtly to reveal the disk along its lower edge. Give the companion clove a rounded base, one broad curved back and a pointed tip. No green foliage or long roots. Keep both specimens close and use subtle tonal modeling so the ivory wrapper and root edge remain readable on light and dark.

Create a single Orchard produce thumbnail asset in the naturalistic botanical watercolor language of the attached Orchard style sheet. Use the reference for paint handling only. Front or gently elevated three-quarter view, soft diffuse upper-left light, luminous overlapping translucent washes, understated granulation and selective fine brush marks. Use soft pigment transitions within a clean silhouette. Realistic fresh produce colors and form, with enough value and edge separation for both ivory and charcoal. Center the compact composition on a square 1024 px or larger PNG with genuine transparent alpha, aiming for 75–85% coverage along its longest canvas axis. Preserve all tips and root ends. Readable at 40 and 72 px, with detail visible at 320 px. No paper, backdrop, detached shadow, border, lettering, or heavy ink outlines.

**Export and check** · One built-in generation call. Centered and reduced painted coverage from 93% to about 80%. The 1254 × 1254 RGBA candidate passed `checkMaster`. The clove and bulb remain distinguishable at card size on both themes. The dry neck is longer than briefed, but the squat bulb, papery ridges and basal disk remain clear. Approved by Jared. Catalog record pending.

## Leeks

- Proposed asset ID `provisional-leeks-thumbnail-v1`
- Provisional item ID `leeks` · thumbnail · revision 1
- Specimen · One trimmed grocery leek
- Alt · A leek with a thick white shank, short fibrous roots and a fan of flat blue-green leaves.

[University of Minnesota Extension, leeks](https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-leeks) describes the broad folded leaves, white shank, blue-green tops and fibrous roots. [University of Florida IFAS Extension, leek anatomy](https://ask.ifas.ufl.edu/publication/HS1388) identifies the shank as a cylinder of bundled leaf sheaths.

**Prompt**

Paint one whole trimmed grocery leek diagonally from lower left to upper right. Show a sturdy straight cylindrical ivory shank of tightly wrapped leaf sheaths, ending below in a flat basal plate with one short attached tuft of fibrous cream roots. The upper shank grades through pale green into broad, flat, folded blue-green strap leaves. Show the overlapping leaves opening into one broad two-ranked fan in the plane of the picture. Let several leaf tips remain naturally pointed and use gentle parallel veins to show each leaf's width. Keep the thick white shank and the flat dark fan legible at thumbnail size. No swollen bulb, hollow tubes, detached leaves, or cutaway.

Create a single Orchard produce thumbnail asset in the naturalistic botanical watercolor language of the attached Orchard style sheet. Use the reference for paint handling only. Front or gently elevated three-quarter view, soft diffuse upper-left light, luminous overlapping translucent washes, understated granulation and selective fine brush marks. Use soft pigment transitions within a clean silhouette. Realistic fresh produce colors and form, with enough value and edge separation for both ivory and charcoal. Center the compact composition on a square 1024 px or larger PNG with genuine transparent alpha, aiming for 75–85% coverage along its longest canvas axis. Preserve all tips and root ends. Readable at 40 and 72 px, with detail visible at 320 px. No paper, backdrop, detached shadow, border, lettering, or heavy ink outlines.

**Export and check** · One built-in generation call. Centered and reduced painted coverage from 96% to about 80%. The 1254 × 1254 RGBA candidate passed `checkMaster`. The single thick shank and broad flat leaf fan distinguish the leek from the scallions on both themes. The fibrous roots remain visible in the larger view. Retained for comparison.

### Leek revision 2

- Proposed asset ID `provisional-leeks-thumbnail-v2`
- Provisional item ID `leeks` · thumbnail · revision 2
- Alt · A leek with a thick white shank, short fibrous roots, and blue-green leaves trimmed straight across.

Jared asked for store-trimmed upper leaves. The v1 candidate is the edit target. The harvest manual describes cutting the tops straight across at the same height. [SARE, leek harvest and handling](https://www.sare.org/publications/northeast-crop-production-harvest-manual/leeks/).

**Prompt**

Edit the attached Orchard leek watercolor as the image target. Change the leaf tips to a grocery-store crosswise trim. Preserve the single leek, thick ivory shank, small attached fibrous root tuft, pale-green transition, broad folded blue-green strap leaves, diagonal lower-left to upper-right orientation, soft upper-left light, and layered botanical watercolor pigment.

Imagine the leek held upright for trimming. A single straight horizontal knife cut passes across the upper blades at one height, perpendicular to the long white shank. Then lay this trimmed specimen back on the original diagonal. Visually shorten the foliage moderately and replace every pointed tip with a blunt straight edge. Show four or five overlapping flat blades ending along the same overall crosswise trim line, with tiny offsets and thin lighter cut edges where the individual folded blades overlap. Keep a modest fan and some dark green above the white shank. Avoid jagged serrations, intact pointed tips, individual tubular cross-sections, a rectangular crop cutoff, or a new cut through the main shank. All foliage and roots must fit fully inside the image.

Deliver one centered square RGBA PNG at least 1024 px per side, with genuine transparency and safe clear margins. Aim for 75–85% painted coverage along the longest canvas axis after framing. Preserve the v1 watercolor detail and contour softness. The cut top should read at 40 and 72 px. No ground shadow, paper, labels, packaging, or props.

**Export and check** · One built-in edit call. Centered and increased painted coverage from 74% to about 80%. The 1254 × 1254 RGBA PNG passed `checkMaster`. The broad, nearly level cut top reads at 40 and 72 px on both themes. The overlapping blade edges are slightly stepped, with a shorter blunt edge on the right. The white shank and root tuft remain visible. The [revision review sheet](leek-revision-review.png) shows v1 and v2 together. Retained for comparison.

### Leek revision 3

- Proposed asset ID `provisional-leeks-thumbnail-v3`
- Provisional item ID `leeks` · thumbnail · revision 3
- Alt · A leek with a white shank and blue-green leaves trimmed straight across at a right angle to the shank.

Jared clarified that the trim should run perpendicular to the shank. The v1 candidate is the edit target. The [leek harvest and handling reference](https://www.sare.org/publications/northeast-crop-production-harvest-manual/leeks/) describes a single cut across the tops.

**Prompt**

Edit the attached Orchard leek watercolor, revision 1, as a targeted revision. Keep one leek in its original diagonal pose, with the cream roots at lower left, thick ivory shank running up and right at roughly 45 degrees, and broad folded blue-green leaves in the upper right. Keep the layered botanical watercolor, upper-left light, and isolated transparent background.

Replace the pointed leaf tips with one clean straight knife trim across all of the upper leaves, PERPENDICULAR TO THE LONG AXIS OF THE WHITE SHANK. The shank rises from lower left to upper right like a slash (/). The cut edge slopes from upper left to lower right like a backslash, at about 45 degrees downward to the right. In the picture the cut's left endpoint is clearly HIGHER than its right endpoint. This is a single oblique edge across the leaf fan. It is not horizontal or vertical in the canvas. For placement, the upper-left end of the trim can sit near 59% of the canvas width and 17% of its height, and the lower-right end near 83% of width and 41% of height. Treat those coordinates as visual guidance only.

Gather the fan slightly near the trim so every broad blade ends along that same sloping cut edge. Show subtle thin light-green cross sections and distinct layered blade seams where they meet that edge. Preserve natural curved outer sides to the fan and avoid a second cut edge, a stair-step profile, any blade tip sticking up, or a rectangular outline. The cut should look like setting the leek upright, trimming the leaves level across the shank, then laying the trimmed leek back on the same diagonal.

Deliver one centered square transparent RGBA PNG at least 1024 px per side, with a clear margin around the full specimen. Aim for 75–85% of the canvas along its longest painted axis and check that the shank and single diagonal cut read at 40 and 72 px. No text, backdrop, or shadow.

**Export and check** · One completed built-in edit call. Centered and increased painted coverage from 72% to about 80%. The 1254 × 1254 RGBA candidate passed `checkMaster`. The cut forms one straight edge at approximately 90 degrees to the shank. The contrast between the white shank and blue-green fan holds at 40 and 72 px on both themes. The [leek comparison](leek-revision-review.png) shows all three revisions. Approved by Jared. Catalog record pending.

## Shallots

- Proposed asset ID `provisional-shallots-thumbnail-v1`
- Provisional item ID `shallots` · thumbnail · revision 1
- Specimen · Two cured copper-skinned shallot bulbs
- Alt · Two elongated copper-rose shallots with papery skins, tapered necks and small trimmed root ends.

[Ontario Ministry of Agriculture, shallot bulb form](https://www.ontario.ca/page/shallots-what-they-are-and-how-grow-them) describes pear-shaped bulbs tapering to a long point and copper-red russet skin. [Texas A&M AgriLife Extension, shallots](https://aggie-horticulture.tamu.edu/vegetable/guides/specialty-vegetables/shallots/) describes the small, generally elongated bulbs. [Clemson Extension, alliums](https://hgic.clemson.edu/factsheet/onion-leek-shallot-garlic/) describes clumping and curing to a dry neck and papery outer skin.

**Prompt**

Paint a compact pair of separate whole dry copper shallots with slight natural overlap. Each bulb is an elongated pear or teardrop, about twice as long as wide including the dry pinched neck, with the fullest part toward the flattened base and a smooth taper toward the neck. Paint layered dull copper-red and muted rose-brown papery husks, subdued violet undertones, and occasional fine lengthwise creases. Turn the nearer bulb enough to show its single small basal disk and a short tuft of clipped straw roots. Keep each bulb individually readable. No green shoots, detached skin, exposed flesh, or garlic-like lobes. Keep the shapes distinctly narrower and the skin redder than the golden storage-onion thumbnail.

Create a single Orchard produce thumbnail asset in the naturalistic botanical watercolor language of the attached Orchard style sheet. Use the reference for paint handling only. Front or gently elevated three-quarter view, soft diffuse upper-left light, luminous overlapping translucent washes, understated granulation and selective fine brush marks. Use soft pigment transitions within a clean silhouette. Realistic fresh produce colors and form, with enough value and edge separation for both ivory and charcoal. Center the compact composition on a square 1024 px or larger PNG with genuine transparent alpha, aiming for 75–85% coverage along its longest canvas axis. Preserve all tips and root ends. Readable at 40 and 72 px, with detail visible at 320 px. No paper, backdrop, detached shadow, border, lettering, or heavy ink outlines.

**Export and check** · One built-in generation call. Centered and reduced painted coverage from 91% to about 80%. The 1254 × 1254 RGBA candidate passed `checkMaster`. The two tapered copper-red bulbs read distinctly from the round golden onion at card size. The front bulb's basal disk and roots are clear in the larger view. Approved by Jared. Catalog record pending.

## Mushrooms

- Proposed asset ID `provisional-mushrooms-thumbnail-v1`
- Provisional item ID `mushrooms` · thumbnail · revision 1
- Specimen · White button mushroom (*Agaricus bisporus*)
- Alt · Two white button mushrooms with rounded caps, one tilted to show its short stem and closed veil.

[UC Davis Postharvest Research and Extension Center, button mushrooms](https://postharvest.ucdavis.edu/produce-facts-sheets/mushroom) describes the rounded cap, white color and intact veil. [Penn State Extension, Agaricus mushrooms](https://extension.psu.edu/basic-procedures-for-agaricus-mushroom-growing) describes closed market mushrooms and trimmed stems.

**Prompt**

Paint two fresh white button mushrooms as a compact grocery specimen for the single mushrooms catalog item. Give the main mushroom a smooth rounded ivory cap with an inward-curled margin and a short thick white stem with a clean trimmed base. Nestle a slightly smaller whole mushroom beside it, lightly tilted to reveal the thin intact white veil bridging the inrolled cap margin and stem. Keep the cap domes plump and low, with subtle beige and cool taupe washes near the underside for separation on ivory. No exposed dark gills, open umbrella caps, tall stems, roots, flecks of soil, or foliage.

Create a single Orchard produce thumbnail asset in the naturalistic botanical watercolor language of the attached Orchard style sheet. Use the reference for paint handling only. Front or gently elevated three-quarter view, soft diffuse upper-left light, luminous overlapping translucent washes, understated granulation and selective fine brush marks. Use soft pigment transitions within a clean silhouette. Realistic fresh produce colors and form, with enough value and edge separation for both ivory and charcoal. Center the compact composition on a square 1024 px or larger PNG with genuine transparent alpha, aiming for 75–85% coverage along its longest canvas axis. Preserve all tips and root ends. Readable at 40 and 72 px, with detail visible at 320 px. No paper, backdrop, detached shadow, border, lettering, or heavy ink outlines.

**Export and check** · One built-in generation call. Centered and reduced painted coverage from 93% to about 80%. The 1254 × 1254 RGBA candidate passed `checkMaster`. The two rounded ivory caps and short trimmed stems read on both themes. The tilted specimen's pale veil is visible in the larger view, with no exposed dark gills. Approved by Jared. Catalog record pending.



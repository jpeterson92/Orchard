# Brassicas illustration review

[First-pass review sheet](review-brassicas.png) shows the six original candidates at 40, 72 and 320 px on Orchard ivory and warm charcoal. The [bok choy comparison](review-bok-choy-v2.png) adds the compact revision at the same sizes. The candidates use provisional IDs because none of the six subjects has a matching catalog record.

## Jared’s approval

Jared approved these six illustrations on November 19, 2026. The staging batch is complete. Each approved illustration is eligible for production handoff once its catalog record exists.

- [Broccoli `provisional-broccoli-thumbnail-v1`](provisional-broccoli-thumbnail-v1.png)
- [Broccoli rabe `provisional-broccoli-rabe-thumbnail-v1`](provisional-broccoli-rabe-thumbnail-v1.png)
- [Cauliflower `provisional-cauliflower-thumbnail-v1`](provisional-cauliflower-thumbnail-v1.png)
- [Green cabbage `provisional-cabbage-thumbnail-v1`](provisional-cabbage-thumbnail-v1.png)
- [Bok choy `provisional-bok-choy-thumbnail-v2`](provisional-bok-choy-thumbnail-v2.png)
- [Napa cabbage `provisional-napa-cabbage-thumbnail-v1`](provisional-napa-cabbage-thumbnail-v1.png)

## Step 1

[Broccoli, cauliflower and green cabbage](step-1-review.md) have their prompts, anatomy sources and check results in the first-step brief. Broccoli reads slightly larger than the other heads.

## Step 2

The broccoli study on the [Orchard illustration board](../../../docs/design/references/04-illustration-language.png) supplied the paint reference. Each subject also used the related step-one candidate identified below to guide lighting, scale and edge finish. The examples on the review sheet are staged candidates. Each of the three new paintings used one built-in image generation call with transparency enabled. Each is a 1254 × 1254 RGBA PNG and passed [`checkMaster`](../../../scripts/art-lib.ts). The head forms and leaf attachments read clearly across the two backgrounds, with no conspicuous halo at the reviewed sizes. Future export settings are 160, 320 and 640 px square WebP, quality 82, alpha quality 90 and effort 6.

**Scale at review.** The three first-pass paintings in this step measure 90–92% of the canvas on their longest painted side. Bok choy revision 2 brings the fill to 82%. Jared approved the staged broccoli rabe and napa cabbage at 90% and 91%, respectively.

### Broccoli rabe

Proposed asset ID [`provisional-broccoli-rabe-thumbnail-v1`](provisional-broccoli-rabe-thumbnail-v1.png), thumbnail revision 1. Alt text “A bunch of slender green shoots with lobed leaves and small unopened flower buds.” Image checks passed. Canvas fill 90%. Approved by Jared.

Separate cut shoots remain visible. Leaves attach at staggered points along the stems, and small, loose bud clusters sit on short shoots amid the foliage. [NC State Extension’s plant profile and photographs](https://plants.ces.ncsu.edu/plants/brassica-rapa-ruvo-group/common-name/rabe/) and [Nebraska Extension’s broccoli type comparison](https://lancaster.unl.edu/year-broccoli/).

Paint reference for this call [staged broccoli](provisional-broccoli-thumbnail-v1.png).

**Image generation prompt**

> Create a square isolated Orchard grocery thumbnail in naturalistic editorial botanical watercolor. Use the lower-right broccoli on the first reference board for paint handling only. Use the second reference, a staged Orchard brassica painting, for diffuse upper-left light, apparent scale and edge finish only. Follow the subject anatomy below. Paint with luminous transparent color washes, subtle pigment granulation and pooling, selective detail on ribs and buds, and softly broken clean edges. Use believable natural colors; preserve clear leaf shapes and shadow separation on both ivory and warm charcoal. Gently elevated three-quarter view, isolated and centered. Target 80% of the square canvas along the specimen’s longest dimension, with generous clear crop safety. Read clearly at 40 and 72 px. True transparent alpha throughout the background. Exclude paper, ground wash, shadow, text, border, labels, props, glossy 3D finish and heavy outlines.
>
> Paint one small, loose grocery bunch of broccoli rabe (rapini), with four or five overlapping slender green cut shoots, angled slightly from lower left to upper right. Keep individual cut stems narrow and distinct at the base, with no shared thick trunk. Most of the visual mass is deep fresh green foliage: simple elongated leaves with variable lobing and wavy to toothed margins, each on its own short petiole or attached closely at staggered points along an individual stem. Show two or three small loose clusters of unopened olive-green flower buds on short stem tips or side shoots, staggered and partly framed by leaves. Make buds clearly visible but much smaller than a grocery broccoli crown, and keep the base visibly stemmy. No open yellow flowers, ties, roots, or bare broccolini-like spears.

### Bok choy

**Revision 2 approved.** Jared asked for a more compact clump with less leaf splay. [Revision 2 `provisional-bok-choy-thumbnail-v2`](provisional-bok-choy-thumbnail-v2.png) has five visible overlapping blades held more upright. Each white petiole continues into a leaf rib and the stalks converge at the cut base. The top still reads as an open clump. The longest painted side spans 82% of the canvas. The 1254 × 1254 RGBA PNG passed `checkMaster` and remained legible at 40, 72 and 320 px on both backgrounds.

**Revision 2 prompt** (one built-in generation call, transparency enabled, using revision 1 as the edit target)

> Targeted revision of the attached Orchard bok choy thumbnail. Paint the same single whole trimmed white-stem bok choy from the same gently elevated three-quarter angle, but make the plant modestly more compact. Compose about five clearly distinguishable smooth oval dark-jade blades, with one smaller inner leaf tucked behind. Bring the outer leaves inward and angle them more upright so they overlap naturally; remove the extra low sideways leaves and avoid a wide flat fan. The finished specimen should be a slightly taller-than-wide, open upright clump, with a modest opening and small separations at the top. Keep distinctly thick curved creamy-white spoon-shaped petioles, each continuous with the midrib of its own blade and all meeting at one shared flat-cut basal plate. Keep the lower white stalks visible and avoid the closed barrel form of napa cabbage. Preserve the original palette, luminous layered botanical watercolor, subtle granulation, diffuse upper-left light, and soft clean edges. Keep the square centered framing with true transparent crop safety, with painted height around 82% of the canvas. Make it legible at 40 and 72 px. Output a square transparent PNG on genuine alpha with no paper, checkerboard, shadow, lettering, props or border.

**Revision 1**

Proposed asset ID [`provisional-bok-choy-thumbnail-v1`](provisional-bok-choy-thumbnail-v1.png), thumbnail revision 1. Alt text “An open fan of dark green leaves on thick white stalks.” Image checks passed. Canvas fill 92%. Superseded by revision 2.

The open clump shares one cut base. The thick white leaf stalks continue into the midribs of separate oval blades, and the blades spread at the top. [University of Minnesota Extension’s bok choy and Chinese cabbage guide](https://extension.umn.edu/garden-and-home/yard-and-garden/growing-chinese-cabbage-and-bok-choy).

Paint reference for this call [staged cauliflower](provisional-cauliflower-thumbnail-v1.png).

**Image generation prompt**

> Create a square isolated Orchard grocery thumbnail in naturalistic editorial botanical watercolor. Use the lower-right broccoli on the first reference board for paint handling only. Use the second reference, a staged Orchard brassica painting, for diffuse upper-left light, apparent scale and edge finish only. Follow the subject anatomy below. Paint with luminous transparent color washes, subtle pigment granulation and pooling, selective detail on ribs and buds, and softly broken clean edges. Use believable natural colors; preserve clear leaf shapes and shadow separation on both ivory and warm charcoal. Gently elevated three-quarter view, isolated and centered. Target 80% of the square canvas along the specimen’s longest dimension, with generous clear crop safety. Read clearly at 40 and 72 px. True transparent alpha throughout the background. Exclude paper, ground wash, shadow, text, border, labels, props, glossy 3D finish and heavy outlines.
>
> Paint one whole trimmed mature white-stem bok choy (pak choi), upright at a slight diagonal in an open vase-shaped clump. Six to eight fleshy spoon-shaped ivory-white petioles curve out and upward from one compact flat-trimmed basal plate. Each petiole is the broad, fleshy continuation of one leaf's midrib and flows directly into its own broad smooth oval dark jade-green blade. Use subtly wrinkled surfaces and slightly wavy, unlobed margins. Let the spreading blades read as individually attached leaves, slightly staggered with clear gaps among the top leaves. Shade the white petioles in cream, pale celadon and soft cool green to retain volume on ivory. No roots, exposed central trunk, flowers, floating leaves, or closed cabbage head.

### Napa cabbage

Proposed asset ID [`provisional-napa-cabbage-thumbnail-v1`](provisional-napa-cabbage-thumbnail-v1.png), thumbnail revision 1. Alt text “An elongated head with crinkled pale green leaves and broad ivory ribs.” Image checks passed. Canvas fill 91%. Approved by Jared.

Upright, tightly overlapping leaves form an elongated closed head. Broad pale ribs on the outer leaves meet at the cut base and taper into crinkled blades. [University of Minnesota Extension’s bok choy and Chinese cabbage guide](https://extension.umn.edu/garden-and-home/yard-and-garden/growing-chinese-cabbage-and-bok-choy).

Paint reference for this call [staged cabbage](provisional-cabbage-thumbnail-v1.png).

**Image generation prompt**

> Create a square isolated Orchard grocery thumbnail in naturalistic editorial botanical watercolor. Use the lower-right broccoli on the first reference board for paint handling only. Use the second reference, a staged Orchard brassica painting, for diffuse upper-left light, apparent scale and edge finish only. Follow the subject anatomy below. Paint with luminous transparent color washes, subtle pigment granulation and pooling, selective detail on ribs and buds, and softly broken clean edges. Use believable natural colors; preserve clear leaf shapes and shadow separation on both ivory and warm charcoal. Gently elevated three-quarter view, isolated and centered. Target 80% of the square canvas along the specimen’s longest dimension, with generous clear crop safety. Read clearly at 40 and 72 px. True transparent alpha throughout the background. Exclude paper, ground wash, shadow, text, border, labels, props, glossy 3D finish and heavy outlines.
>
> Paint one whole trimmed grocery napa cabbage, standing at a slight diagonal with an elongated barrel-shaped head, broad rounded shoulders and a softly rounded, mostly closed top. Make it distinctly taller than wide. Form the dense head entirely from tightly overlapping upright pale yellow-green leaves with softly crinkled blades. Each visible outer leaf wraps inward around the head and has a wide flattened ivory rib tapering upward into its blade, with all ribs seated close together at the short trimmed base. Show just two or three broad white-to-pale-green ribs on the lower front and soft green crinkles toward the tips. Preserve one continuous compact silhouette with restrained outer leaves. No separate stalks fanning outward, detached leaves, open center, roots, flowers, or cutaway.

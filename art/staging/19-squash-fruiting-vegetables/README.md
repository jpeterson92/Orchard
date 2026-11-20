# Summer squash and fruiting vegetables

This batch covers summer squash, bell peppers, mini sweet peppers, hot peppers, cucumbers, eggplant and tomatillos from the [curated catalog list](../../../docs/data/usda.md). Summer squash, mini sweet peppers and hot peppers each have one item-level thumbnail. The first three IDs are provisional while the item records are pending. These revision 1 thumbnails are staged for Jared's review.

## Step 1

[Review sheet](step-1-review.png) shows the three candidates beside the approved tomato at 40, 72 and 320 px on ivory and warm charcoal.

Paint direction follows the [Orchard illustration guide](../../../docs/design/illustration-guide.md) §2 A and the [illustration-language study](../../../docs/design/references/04-illustration-language.png). Each built-in ImageGen call used the [staged tomato painting](../02-tomatoes-early-produce/tomatoes-thumbnail-v2.png) as its attached paint reference. The review sheet uses the [approved tomato master](../../masters/tomatoes-thumbnail-v2.png). The exports preserve generated pixels without resampling and add transparent margins to bring each painted span to roughly 82% of the square. All three candidates passed `checkMaster` for square dimensions, minimum size, genuine alpha, crop safety and the pale-edge threshold.

### Summer squash

- Proposed ID and PNG · [`provisional-summer-squash-thumbnail-v1`](provisional-summer-squash-thumbnail-v1.png)
- Alt text · A green zucchini beside a golden-yellow straightneck squash.
- Form and scale references · Both specimens represent young summer squash of similar market size. Zucchini has a cylindrical to club-shaped body, while yellow straightneck has a narrower neck opening into a rounded blossom end. [Illinois Extension](https://extension.illinois.edu/gardening/summer-squash), [UC Agriculture and Natural Resources](https://ucanr.edu/node/131140/printable/print).
- Check · 1374 × 1374 RGBA, passed. The nearly cylindrical zucchini and tapered yellow squash are identifiable at 40 px on both grounds. Both cut stems and blossom ends are visible.

### Bell peppers

- Proposed ID and PNG · [`provisional-bell-peppers-thumbnail-v1`](provisional-bell-peppers-thumbnail-v1.png)
- Alt text · A ripe red bell pepper with broad rounded lobes and a curved green stem.
- Form and scale reference · The full-size bell is represented by a blocky red specimen with rounded lobes, following the common roughly 3-inch-wide, 4-inch-long form. [Virginia Cooperative Extension](https://www.pubs.ext.vt.edu/SPES/SPES-684/SPES-684.html).
- Check · 1350 × 1350 RGBA, passed. The broad body and lobes read clearly at 40 px on both grounds. The green stem is longer and more prominent than requested.

### Cucumbers

- Proposed ID and PNG · [`provisional-cucumbers-thumbnail-v1`](provisional-cucumbers-thumbnail-v1.png)
- Alt text · A dark green slicing cucumber with a round slice showing pale flesh and seeds.
- Form and scale references · The fresh-market slicing type has a dark-green rind and blunt ends. Penn State gives a typical harvest range of 6–8 inches in length and 1¼–2 inches in diameter. The cut face shows the pale green flesh and central seeds. [Penn State Extension](https://extension.psu.edu/cucumber-production), [Colorado State University](https://www.chhs.colostate.edu/fsi/food-articles/produce/cucumbers/), [University of Kentucky Cooperative Extension](https://publications.mgcafe.uky.edu/sites/publications.ca.uky.edu/files/FSHE11.pdf).
- Check · 1428 × 1428 RGBA, passed. The pale slice makes the cucumber recognizable at 40 px on both grounds.
- Touch-up for review · The whole cucumber reads a little stockier than the intended 7–8 by 1½–2 inch slicer. For a revision, slim the whole cucumber slightly and scale the slice to match its diameter.

### Prompts used

Each subject paragraph below was sent with the same opening paragraph and transparency enabled.

> Create an isolated Orchard botanical-watercolor produce thumbnail. Use the supplied Orchard tomato only as a reference for watercolor technique, selective detail, soft upper-left light, and apparent scale. Use luminous layered washes, restrained pigment granulation, broad overlapping painted shapes, and occasionally soft edges. Keep the silhouette clear on ivory and warm charcoal at 40 and 72 pixels. Center the composition across 75–85% of the square with clear margins. Deliver a square PNG at least 1024 px per side with genuine transparent alpha. No background, paper, tabletop, cast shadow, text, border, leaves, or plastic gloss.

**Summer squash**

> Paint two whole young summer squash in one compact, slightly overlapping diagonal arrangement. Include one green zucchini with a nearly cylindrical smooth finely speckled body and a short ridged cut stem, and one golden-yellow straightneck squash with a clearly narrower gently tapered straight neck widening into a rounded blossom-end body. Both should be recognizable with both stems and both blossom ends visible. Keep them close in length, around 7 inches in real life, and 3.5–4 times as long as their widest diameter. Keep the forms young and tender, with neither exaggerated warts nor hard winter-squash ribs.

**Bell peppers**

> Paint one whole full-size ripe red bell pepper upright in a gentle three-quarter view. It has broad shoulders, a compact thick blocky fruit roughly 4 inches tall by 3 inches wide, three or four rounded lobes with enough groove definition to read at thumbnail size, and a short sturdy green stem emerging from its shallow recessed crown. The bottom is broad and lobed with no pointed tip. Use vermilion and red-orange light and deeper red between the lobes, with restrained highlights. Preserve the recognizable squat bell-pepper identity distinct from round tomato or tapered mini sweet pepper.

**Cucumbers**

> Paint one whole fresh-market garden slicing cucumber with one close, thin round cross-cut slice in the foreground. Use a gentle diagonal and keep the whole cucumber's ends visible. The whole cucumber represents a roughly 7–8 inch fruit about 1.5–2 inches across, a mostly straight elongated cylinder with softly blunt ends, a tiny stem scar and cool dark-green skin with sparse fine low pebbles and pale pinpoints. Avoid a thick zucchini stalk, large pickle warts, or the long slender English cucumber proportions. Keep the round cut face approximately the same diameter as the fruit, with a narrow dark-green rind, watery very pale celadon flesh and subtle small seeds in its center. The whole cucumber remains the focus.

## Approval

Jared approved `provisional-summer-squash-thumbnail-v1`, `provisional-bell-peppers-thumbnail-v1` and `provisional-cucumbers-thumbnail-v1` on 2026-11-20 (in Claude Code). They wait here until their item records exist; then rename each to its catalog ID and add it to a `handoff.json` in this folder.

## Next step

Check records, staging and the approved manifest again, then take the next eligible first passes from mini sweet peppers, hot peppers, eggplant and tomatillos. Keep mini sweet peppers and hot peppers to one thumbnail each. Record any Jared-approved revisions or handoff decisions in this folder.

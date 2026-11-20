# Lettuce and spinach · Step 1

The [curated expansion list](../../../docs/data/usda.md) includes all three subjects. The filenames use provisional IDs because these subjects have no item records in `content/items/`. The manifest, request briefs, live masters, public export filenames, and staging filenames and briefs showed no existing candidates for these subjects.

**Art direction.** [Orchard illustration guide, §2 A](../../../docs/design/illustration-guide.md#a-isolated-produce-illustration) and [illustration-language style study](../../../docs/design/references/04-illustration-language.png). [Review sheet](review-step-1.png) shows each painting at 320, 72, and 104 px on ivory and warm charcoal. Each master used one built-in generation call with transparency enabled and passed Orchard’s [`checkMaster`](../../../scripts/art-lib.ts). All three are pending Jared’s review.

## Shared prompt

> Create one isolated naturalistic botanical watercolor for an Orchard produce thumbnail. Use the attached Orchard illustration-language sheet as a style reference for its translucent layered washes, subtle granulation, selective veins, and softly broken pigment edges. Paint from a gently elevated three-quarter view with soft diffuse upper-left light. Use natural greens, broad overlapping washes, selective fine detail, and warm light with cooler green shadows. Center the complete specimen on a square PNG of at least 1024 px, with about 10% clear crop safety around the silhouette. Make it readable at 72 px and 96–112 px. Use genuine alpha transparency, fully clear outside the specimen. Exclude paper, checkerboard, backdrop, ground wash, cast shadow, lettering, borders, props, roots, stray leaves, cutaways, heavy outlines, and plastic gloss.

## Romaine lettuce

**Proposed ID** `provisional-romaine-thumbnail-v1`

**Verified anatomy.** An upright, oblong head with overlapping elongated leaves and prominent central ribs. [UF/IFAS lettuce identification and photos](https://gardeningsolutions.ifas.ufl.edu/mastergardener/resources/plantid/vegetables/lettuce/), [RHS lettuce types](https://www.rhs.org.uk/vegetables/lettuce/grow-your-own#choosing).

**Subject prompt**

> Paint one whole market-trimmed green romaine (cos) head. Keep the silhouette tall and oblong, tapering at the short trimmed base and opening only slightly at the crown. Long, sturdy leaves overlap upward with gently wavering edges and a few mild puckers. Show several distinct pale crisp midribs narrowing up the blades. Let the outer blades be medium to deep green and the tightly nested young leaves yellow-green.

**Check status.** [Staged PNG](provisional-romaine-thumbnail-v1.png). 1254 × 1254 RGBA. `checkMaster` passed. The tall silhouette and pale ribs hold at 72 px. No conspicuous halo on either background.

## Iceberg lettuce

**Proposed ID** `provisional-iceberg-thumbnail-v1`

**Verified anatomy.** A dense, firm, round head encased by broad overlapping wrapper leaves. [UF/IFAS lettuce identification and photos](https://gardeningsolutions.ifas.ufl.edu/mastergardener/resources/plantid/vegetables/lettuce/), [RHS lettuce types](https://www.rhs.org.uk/vegetables/lettuce/grow-your-own#choosing).

**Subject prompt** 

> Paint one whole market-trimmed iceberg (crisphead) lettuce. Show a low, nearly spherical compact head with broad pale cool-green wrapper leaves that curve firmly around the ball and overlap closely. Add one or two visible curving leaf seams, modest crinkles, fine pale vein transitions, and a touch of darker outer green near the base. Keep the crown closed and rounded, like a crisp tight head with no open center, broad flaring rosette or waxy blue cabbage color.

**Check status.** [Staged PNG](provisional-iceberg-thumbnail-v1.png). 1254 × 1254 RGBA. `checkMaster` passed. The round, closed head and overlapping pale wrappers hold at 72 px. No conspicuous halo on either background.

## Butter lettuce

**Proposed ID** `provisional-butter-lettuce-thumbnail-v1`

**Verified anatomy.** A soft, loosely headed rosette of rounded leaves, with smooth wrapper leaves opening out from the heart. [UF/IFAS lettuce identification and photos](https://gardeningsolutions.ifas.ufl.edu/mastergardener/resources/plantid/vegetables/lettuce/), [RHS lettuce types](https://www.rhs.org.uk/vegetables/lettuce/grow-your-own#choosing).

**Subject prompt** 

> Paint one whole green Boston-type butterhead lettuce as a low, loose, open rosette. Show broad, rounded, thin, gently cupped outer blades that spread out and softly drape around a nested pale yellow-green heart. Use smooth, slightly undulating margins, soft silky folds, and delicately indicated branching veins. Preserve open gaps between some outer leaves and an asymmetrical profile. Keep the silhouette broader than tall and avoid a closed ball, deep sawtooth frills, large rigid ribs, or geometric flower petals.

**Check status.** [Staged PNG](provisional-butter-lettuce-thumbnail-v1.png). 1254 × 1254 RGBA. `checkMaster` passed. The broad, open rosette and soft rounded leaves hold at 72 px. No conspicuous halo on either background.

Romaine’s vertical margin and butter lettuce’s horizontal margin are tighter than the prompt’s 10% target. Both clear the crop check and remain fully visible at the reviewed sizes.

## Next step

Leaf lettuce as one representative specimen, spring mix as a compact selection of actual young leaves, and spinach.


// The Orchard mark: Lora Bold's capital O with a stem and leaf at its top (design system §6 "Brand and date").
// Units are Lora's (1000 per em), y up from the baseline as negative numbers, so the mark sits on the text baseline.
// The header wordmark (src/app/icons.tsx) and the home-screen icons (scripts/brand-icons.ts) draw from these.

/** Lora Bold "O", outline taken from the font. Its advance is 769 units; it overshoots the baseline by 16. */
export const O_PATH =
  "M383 16L383 16Q288 16 221.5-16Q155-48 114-101.5Q73-155 54-220Q35-285 35-350L35-350Q35-413 56.5-477.5Q78-542 121.5-596Q165-650 231-683Q297-716 386-716L386-716Q477-716 543-683Q609-650 651-595.5Q693-541 713.5-477Q734-413 734-350L734-350Q734-288 712.5-224Q691-160 647.5-105.5Q604-51 538-17.5Q472 16 383 16ZM394-57L394-57Q446-57 481-82.5Q516-108 537-149Q558-190 567-238.5Q576-287 576-333L576-333Q576-402 564-459Q552-516 527-557.5Q502-599 463.5-621.5Q425-644 373-643L373-643Q322-642 287-615.5Q252-589 231-547.5Q210-506 201-457Q192-408 192-362L192-362Q192-315 202.5-262Q213-209 236-162Q259-115 298-86Q337-57 394-57Z";
export const O_ADVANCE = 769;
export const STEM_PATH = "M366 -700C368 -745 372 -790 380 -830L410 -826C402 -790 398 -745 400 -700Z";
export const LEAF_PATH = "M396 -800C445 -920 580 -941 690 -870C620 -775 489 -735 396 -800Z";
/** The leaf's vein, stroked in the background color; left out below 48 px, where it only adds noise. */
export const VEIN_PATH = "M431 -808Q498 -830 631 -856";
export const VEIN_WIDTH = 12;
/** The mark spans y from MARK_TOP (the leaf's tip, with a margin) to 16 (the O's overshoot). */
export const MARK_TOP = -940;
export const MARK_BOTTOM = 16;

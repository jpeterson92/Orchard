// Schemas for every editorial and reference input (engineering plan §4.1). `scripts/data-build.ts` validates
// the files against these; the app only imports the inferred types.
import { z } from "zod";
import { MONTH_LABEL, WINDOW_LABEL } from "../time";

export const wordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "use a lowercase-kebab id");
/** `us-wa` for a US state, or an ISO 3166 alpha-2 country code such as `mx`. Existence is checked in data-build. */
export const originId = z
  .string()
  .regex(/^(us-[a-z]{2}|[a-z]{2})$/, 'use "us-<state>" or a 2-letter country code');
const stateCode = z.string().regex(/^[A-Z]{2}$/, "use a 2-letter state code");
const isoDate = z.iso.date();
const text = z.string().trim().min(1);
const words = (max: number) => text.refine((s) => wordCount(s) <= max, `at most ${max} words`);
const sourceIds = (min: number) => z.array(id).min(min, `cite at least ${min} source${min === 1 ? "" : "s"}`);

/** Product spec §8 writing standards. */
export const CARD_WORDS = 12;
export const SECTION_WORDS = 60;

const review = {
  status: z.enum(["draft", "reviewed"]),
  reviewedOn: isoDate.optional(),
  reviewer: text.optional(),
  /** Invented test data; production builds refuse it. */
  synthetic: z.literal(true).optional(),
};
const reviewComplete = (r: { status: string; reviewedOn?: string; reviewer?: string }) =>
  r.status === "draft" || (r.reviewedOn !== undefined && r.reviewer !== undefined);
const reviewMessage = { message: "a reviewed record needs reviewedOn and reviewer", path: ["status"] };

export const sourceSchema = z.strictObject({
  id,
  title: text,
  publisher: text,
  url: z.url(),
  accessed: isoDate,
  /** authoritative: extension, commodity board, USDA, UC Davis, trade reference; mainstream: food publication, grocer guide. */
  tier: z.enum(["authoritative", "mainstream"]),
  /** The source this one restates, so the two count once (P12). */
  basedOn: id.optional(),
  /** An invented source for synthetic fixtures; production builds refuse it. */
  synthetic: z.literal(true).optional(),
});

/** `group`: the Today filter chip (product spec §5): Fruit, Vegetables, or Herbs & mushrooms. */
export const categorySchema = z.strictObject({
  id,
  name: text,
  group: z.enum(["fruit", "vegetables", "herbs-mushrooms"]),
});

export const stateSchema = z.strictObject({ state: stateCode, name: text });

export const rulesSchema = z.strictObject({
  version: z.int().positive(),
  /** Typical origins cover at least this share of reported volume. */
  typicalOriginShare: z.number().gt(0).lte(1),
  /** P9: a typical origin below this share of the month's volume never takes over from the top one. */
  decidingOriginShare: z.number().gt(0).lte(1),
  /** P1: rule 1 passes when the rated typical origins hold at least this share of the typical origins' volume. */
  ratedTypicalShare: z.number().gt(0).lte(1),
  supplyIndex: z
    .strictObject({ thin: z.number().positive(), strong: z.number().positive() })
    .refine((s) => s.thin < s.strong, "thin must be below strong"),
  /** P13: a variety is in stores in a month when quoted on at least this share of the item's market-days. */
  varietyInStoreShare: z.number().gt(0).lte(1),
  /** P16: only origins in these countries (ISO alpha-2; `us` covers every US state) can make the item verdict Peak. */
  peakCountries: z.array(z.string().regex(/^[a-z]{2}$/, "use a 2-letter country code")).min(1),
  reliableYearRoundWindows: z.int().min(1).max(24),
  snapshotMaxAgeMonths: z.int().positive(),
  lastCallWindows: z.int().positive(),
});

const windowLabel = z.string().regex(WINDOW_LABEL, 'use a half-month label such as "jun-1"');

const rating = z.enum(["prime", "fair", "poor"]);

/** An editorial rating. Its citations are the evidence file's claims covering it (data-build checks them). */
export const qualityWindowSchema = z.strictObject({
  from: windowLabel,
  to: windowLabel,
  rating,
  /** Required where the rating departs from the evidence proposal, or the proposal is Low confidence. */
  reason: words(SECTION_WORDS).optional(),
});
const qualityWindows = z.array(qualityWindowSchema).min(1);

export const itemOriginSchema = z.strictObject({
  origin: originId,
  windows: qualityWindows,
});

const storageLife = z
  .strictObject({
    min: z.number().positive(),
    max: z.number().positive(),
    unit: z.enum(["days", "weeks", "months"]),
  })
  .refine((r) => r.min <= r.max, "min must not exceed max");

/** An editorial yes/no that shapes the rating (P14, rule 4), with the evidence behind it. */
const trait = z.strictObject({
  value: z.boolean(),
  sources: sourceIds(1),
  note: words(SECTION_WORDS).optional(),
});

/** Editorial typical origins for a run of months, where USDA doesn't report domestic supply (engineering plan §4.1). */
export const editorialTypicalOriginsSchema = z.strictObject({
  from: z.string().regex(MONTH_LABEL, 'use a month label such as "jun"'),
  /** May wrap past December. */
  to: z.string().regex(MONTH_LABEL, 'use a month label such as "jun"'),
  /** Ranked, top first. `major`: at least rules.decidingOriginShare of the month's supply (P9). */
  origins: z.array(z.strictObject({ origin: originId, major: z.boolean() })).min(1),
  sources: sourceIds(1),
});

export const varietySchema = z.strictObject({
  id,
  name: text,
  /** The group's anchored 1–5 scales, e.g. sweetness or crispness. */
  traits: z.record(id, z.int().min(1).max(5)),
  bestUses: z.array(words(CARD_WORDS)).min(1),
  label: words(CARD_WORDS),
  /** How to tell when it's ripe, on guides with `ripeCues` (e.g. a Bartlett turns yellow). */
  ripeCue: words(CARD_WORDS).optional(),
  /** Citations for the traits, uses and ripe cue. */
  sources: z.array(id).default([]),
  /** Overrides the item's `storesWell` (P14), e.g. a long-keeping apple. */
  storesWell: trait.optional(),
  /** Present on a rated variety: the item is then rated by variety (P13). As typically sold, whatever the origin. */
  windows: qualityWindows.optional(),
  /** The variety calendar's names for it (slugs of USDA's terminal-market names). Required on a rated variety. */
  quotedAs: z.array(id).min(1).optional(),
});

/** P16: what a shopper can pick out by the sign or label, e.g. local field tomatoes, grouping rated origins. */
export const selectionSchema = z.strictObject({
  id,
  /** Follows "Look for" on the card: "local field-grown". */
  label: words(6),
  /** How to find it and tell it apart in the store, on the item page. */
  cue: words(SECTION_WORDS),
  /** Rated origins of the item it groups, in rules.peakCountries; its rating in a window is the best of theirs. */
  origins: z.array(originId).min(1),
  /** Months mainstream supermarkets typically carry it, cited, where USDA volume undercounts it. */
  inStores: z
    .array(
      z.strictObject({
        from: z.string().regex(MONTH_LABEL, 'use a month label such as "jun"'),
        to: z.string().regex(MONTH_LABEL, 'use a month label such as "jun"'),
        sources: sourceIds(1),
      }),
    )
    .default([]),
});

const anchor = z.strictObject({
  text: words(CARD_WORDS),
  /** Reference varieties: each carries this value on the trait. Empty where no guide variety sits there. */
  varieties: z.array(id).default([]),
});

/** A variety guide (product spec §5): the items it covers and its anchored 1–5 trait scales. */
export const guideSchema = z
  .strictObject({
    id,
    name: text,
    items: z.array(id).min(1),
    /** Each variety gives a short cue for telling when it's ripe (pears). */
    ripeCues: z.boolean().default(false),
    traits: z
      .array(
        z.strictObject({
          id,
          name: text,
          anchors: z.strictObject({ 1: anchor, 3: anchor, 5: anchor }),
        }),
      )
      .min(1),
    ...review,
  })
  .refine(reviewComplete, reviewMessage);

export const itemSchema = z
  .strictObject({
    id,
    name: text,
    synonyms: z.array(text).default([]),
    misspellings: z.array(text).default([]),
    category: id,
    types: z.array(z.strictObject({ id, name: text, note: words(SECTION_WORDS).optional() })).default([]),
    purchaseRank: z.int().positive(),
    /** Editorial class; data-build reports where the typical outlook disagrees. */
    alwaysGood: z.boolean(),
    /** P14: arrives from abroad eating well, without being picked underripe to survive the trip. */
    shipsWell: trait,
    /** Rule 4: buying in its best season makes a difference a shopper can taste; only then can it be Peak. */
    peakWorthSeeking: trait,
    /** P14: eats well for months out of commercial storage; a variety may override it. */
    storesWell: trait,
    evidenceBasis: z.enum(["supply+assessment", "assessment-only"]),
    cardLine: words(CARD_WORDS),
    pick: z.array(text).min(3).max(5),
    avoid: z.array(text).min(1).max(2),
    store: z.strictObject({
      temperature: z.enum(["cold", "cool", "room"]),
      ethylene: z.enum(["producer", "sensitive", "both", "neither"]),
      life: storageLife,
      text: words(SECTION_WORDS),
      sources: sourceIds(1),
    }),
    ripen: z.strictObject({ text: words(SECTION_WORDS), sources: sourceIds(1) }).optional(),
    prep: words(SECTION_WORDS),
    /** Optional for items rated by variety, where origin windows serve only label advice. */
    origins: z.array(itemOriginSchema).default([]),
    varieties: z.array(varietySchema).default([]),
    /** P16: not on items rated by variety, whose varieties already name what to pick. */
    selections: z.array(selectionSchema).default([]),
    /** Only on assessment-only items, which USDA can't rank; data-build refuses them beside USDA rows. */
    typicalOrigins: z.array(editorialTypicalOriginsSchema).default([]),
    ...review,
  })
  .refine((i) => i.typicalOrigins.length === 0 || i.evidenceBasis === "assessment-only", {
    message: "editorial typical origins are for assessment-only items",
    path: ["typicalOrigins"],
  })
  .refine((i) => i.origins.length > 0 || i.varieties.some((v) => v.windows), {
    message: "rate at least one origin or variety",
    path: ["origins"],
  })
  .refine((i) => i.selections.length === 0 || !i.varieties.some((v) => v.windows), {
    message: "selections are for items not rated by variety",
    path: ["selections"],
  })
  .refine((i) => wordCount([...i.pick, ...i.avoid].join(" ")) <= SECTION_WORDS, {
    message: `pick and avoid cues together are at most ${SECTION_WORDS} words`,
    path: ["pick"],
  })
  .refine(reviewComplete, reviewMessage);

/** One source claim about when an item (or one variety) is at its best (engineering plan §4.1). */
export const evidenceClaimSchema = z.strictObject({
  source: id,
  /** `us` when the source names no state: US-grown, applying to every US origin of the item. */
  origin: originId.default("us"),
  variety: id.optional(),
  windows: z.array(z.strictObject({ from: windowLabel, to: windowLabel, rating })).min(1),
  specificity: z.enum(["half-month", "month", "season"]),
  directness: z.enum(["eating-quality", "availability", "secondhand"]),
  paraphrase: text.refine((s) => !/[\r\n]/.test(s), "keep the paraphrase to one line"),
});

/** `content/evidence/<item-id>.yaml`. */
export const evidenceFileSchema = z
  .strictObject({ item: id, claims: z.array(evidenceClaimSchema).min(1), ...review })
  .refine(reviewComplete, reviewMessage);

const month = z.coerce.number().pipe(z.int().min(1).max(12));

export const typicalOriginRowSchema = z.strictObject({
  item: id,
  month,
  rank: z.coerce.number().pipe(z.int().positive()),
  origin: originId,
  /** At least rules.decidingOriginShare of the month's volume (P9). Used internally, never shown as a share. */
  major: z.enum(["true", "false"]).transform((v) => v === "true"),
  /** Its share of the month's reported volume (P1). */
  share: z.coerce.number().pipe(z.number().gt(0).lte(1)),
});

const supplyNullReason = z.enum(["no_data", "no_baseline", "not_reported"]);

export const supplyIndexRowSchema = z
  .strictObject({
    item: id,
    month,
    /** The origin's own supply: its volume that month against its average over the months it ships (P11). */
    origin: originId,
    value: z.number().positive().nullable(),
    reason: supplyNullReason.nullable(),
  })
  .refine(
    (r) => (r.value === null) !== (r.reason === null),
    "give either a value or a null reason, not both",
  );

/** One USDA terminal-market variety in one month: presence in price quotes, not volume (P13). */
export const varietyCalendarRowSchema = z.strictObject({
  item: id,
  variety: id,
  month,
  /** Share of the item's market-days quoting this variety. */
  share: z.number().min(0).max(1),
  /** Origins on at least 10% of the variety's market-days, most quoted first. */
  origins: z.array(originId),
});

const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "use YYYY-MM");

/** Header of the derived USDA CSVs: what the snapshot covers. */
export const snapshotSchema = z
  .strictObject({ source: text, from: yearMonth, to: yearMonth, derived: isoDate })
  .refine((s) => s.from <= s.to, "from must not be after to");

export type Source = z.infer<typeof sourceSchema>;
export type Category = z.infer<typeof categorySchema>;
export type State = z.infer<typeof stateSchema>;
export type Rules = z.infer<typeof rulesSchema>;
export type Item = z.infer<typeof itemSchema>;
export type Guide = z.infer<typeof guideSchema>;
export type QualityWindow = z.infer<typeof qualityWindowSchema>;
export type EvidenceClaim = z.infer<typeof evidenceClaimSchema>;
export type EvidenceFile = z.infer<typeof evidenceFileSchema>;
export type TypicalOriginRow = z.infer<typeof typicalOriginRowSchema>;
export type SupplyIndexRow = z.infer<typeof supplyIndexRowSchema>;
export type VarietyCalendarRow = z.infer<typeof varietyCalendarRowSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;

/** The model panel's combined curve for one item and target (P15), from the counted runs. */
export interface PanelCurve {
  item: string;
  origin?: string | undefined;
  variety?: string | undefined;
  /** Indexed by window 0–23; null where the panel abstains. */
  values: (number | null)[];
}

/** What data-build writes to `src/generated/data.json`. */
export interface Dataset {
  rules: Rules;
  sources: Source[];
  categories: Category[];
  states: State[];
  items: Item[];
  guides: Guide[];
  evidence: EvidenceFile[];
  snapshot: Snapshot | null;
  typicalOrigins: TypicalOriginRow[];
  supplyIndex: SupplyIndexRow[];
  varietyCalendar: VarietyCalendarRow[];
  panel: PanelCurve[];
}

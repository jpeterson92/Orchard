// Schemas for every editorial and reference input (engineering plan §4.1). `scripts/data-build.ts` validates
// the files against these; the app only imports the inferred types.
import { z } from "zod";
import { WINDOW_LABEL } from "../time";

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
});

export const categorySchema = z.strictObject({ id, name: text });

export const stateSchema = z.strictObject({ state: stateCode, name: text });

export const rulesSchema = z.strictObject({
  version: z.int().positive(),
  /** Typical origins cover at least this share of reported volume. */
  typicalOriginShare: z.number().gt(0).lte(1),
  supplyIndex: z
    .strictObject({ thin: z.number().positive(), strong: z.number().positive() })
    .refine((s) => s.thin < s.strong, "thin must be below strong"),
  reliableYearRoundWindows: z.int().min(1).max(24),
  snapshotMaxAgeMonths: z.int().positive(),
  lastCallWindows: z.int().positive(),
  labelNoteLevelGap: z.int().min(1),
});

const windowLabel = z.string().regex(WINDOW_LABEL, 'use a half-month label such as "jun-1"');

export const qualityWindowSchema = z.strictObject({
  from: windowLabel,
  to: windowLabel,
  rating: z.enum(["prime", "fair", "poor"]),
  sources: sourceIds(2),
});

export const itemOriginSchema = z.strictObject({
  origin: originId,
  windows: z.array(qualityWindowSchema).min(1),
});

const storageLife = z
  .strictObject({
    min: z.number().positive(),
    max: z.number().positive(),
    unit: z.enum(["days", "weeks", "months"]),
  })
  .refine((r) => r.min <= r.max, "min must not exceed max");

export const varietySchema = z
  .strictObject({
    id,
    name: text,
    /** The group's anchored 1–5 scales, e.g. sweetness or crispness. */
    traits: z.record(id, z.int().min(1).max(5)),
    bestUses: z.array(words(CARD_WORDS)).min(1),
    label: words(CARD_WORDS),
    freshestMonths: z.array(z.int().min(1).max(12)).min(1).optional(),
    sources: z.array(id).default([]),
  })
  .refine((v) => v.freshestMonths === undefined || v.sources.length >= 2, {
    message: "freshestMonths needs at least 2 sources",
    path: ["freshestMonths"],
  });

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
    origins: z.array(itemOriginSchema).min(1),
    varieties: z.array(varietySchema).default([]),
    ...review,
  })
  .refine((i) => wordCount([...i.pick, ...i.avoid].join(" ")) <= SECTION_WORDS, {
    message: `pick and avoid cues together are at most ${SECTION_WORDS} words`,
    path: ["pick"],
  })
  .refine(reviewComplete, reviewMessage);

export const advisorySchema = z
  .strictObject({
    id,
    items: z.array(id).min(1),
    /** Absent: every origin of the items. */
    origins: z.array(originId).min(1).optional(),
    /** Absent: national. */
    states: z.array(stateCode).min(1).optional(),
    from: isoDate,
    to: isoDate,
    verdict: z.enum(["peak", "good", "skip"]),
    note: words(SECTION_WORDS),
    ...review,
  })
  .refine(reviewComplete, reviewMessage);

const month = z.coerce.number().pipe(z.int().min(1).max(12));

export const typicalOriginRowSchema = z.strictObject({
  item: id,
  month,
  rank: z.coerce.number().pipe(z.int().positive()),
  origin: originId,
});

const supplyNullReason = z.enum(["no_data", "no_baseline", "not_reported"]);

export const supplyIndexRowSchema = z
  .strictObject({
    item: id,
    month,
    value: z.number().positive().nullable(),
    reason: supplyNullReason.nullable(),
  })
  .refine(
    (r) => (r.value === null) !== (r.reason === null),
    "give either a value or a null reason, not both",
  );

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
export type Advisory = z.infer<typeof advisorySchema>;
export type TypicalOriginRow = z.infer<typeof typicalOriginRowSchema>;
export type SupplyIndexRow = z.infer<typeof supplyIndexRowSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;

/** What data-build writes to `src/generated/data.json`. */
export interface Dataset {
  rules: Rules;
  sources: Source[];
  categories: Category[];
  states: State[];
  items: Item[];
  advisories: Advisory[];
  snapshot: Snapshot | null;
  typicalOrigins: TypicalOriginRow[];
  supplyIndex: SupplyIndexRow[];
}

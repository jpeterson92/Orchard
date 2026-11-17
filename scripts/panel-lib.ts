// Pure helpers for `npm run panel:check`: the model panel's run format (content/panel/PROMPT.md) and the checks
// that run before a model's judgment is read alongside the cited evidence (engineering plan §4.1, P15).
import { z } from "zod";
import { WINDOW_LABEL, windowRange } from "../src/shared/time";

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "use a lowercase-kebab id");
const origin = z
  .string()
  .regex(/^(us-[a-z]{2}|[a-z]{2})$/, 'use "us-<state>", "us" or a 2-letter country code');
const confidence = z.enum(["high", "medium", "low"]);
const label = z.string().regex(WINDOW_LABEL, 'use a half-month label such as "jun-1"');
const windowTuple = z.tuple([label, label, z.enum(["prime", "fair", "poor"]), confidence]);
const trait = z.tuple([z.boolean(), confidence]);
export const NOTE_WORDS = 25;
const note = z
  .string()
  .trim()
  .min(1)
  .refine((s) => s.split(/\s+/).length <= NOTE_WORDS, `at most ${NOTE_WORDS} words`);

const rated = { windows: z.array(windowTuple).min(1), note: note.optional() };

export const panelItemSchema = z.strictObject({
  item: id,
  traits: z.strictObject({ shipsWell: trait, storesWell: trait, peakWorthSeeking: trait, alwaysGood: trait }),
  origins: z.array(z.strictObject({ origin, ...rated })).min(1),
  varieties: z.array(z.strictObject({ variety: id, ...rated })).optional(),
  note,
});

export const panelCategorySchema = z.strictObject({ category: id, items: z.array(panelItemSchema).min(1) });

export const panelRunSchema = z.strictObject({
  run: id,
  model: z.string().trim().min(1),
  provider: z.string().trim().min(1),
  date: z.iso.date(),
  promptVersion: z.int().positive(),
  webAccess: z.boolean(),
  knowledgeCutoff: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  note: z.string().trim().min(1).optional(),
});

export const scopeSchema = z.array(
  z.strictObject({ item: id, name: z.string(), category: id, ratedBy: z.literal("variety").optional() }),
);

export type PanelItem = z.infer<typeof panelItemSchema>;
export type Scope = z.infer<typeof scopeSchema>;

export interface RunReport {
  errors: string[];
  /** Judgment an editor might query; never fails the check. */
  warnings: string[];
  covered: number;
}

/** Windows that two ranges of one target both claim, as labels of the first clash. */
export function overlaps(windows: readonly (readonly [string, string, ...unknown[]])[]): string | null {
  const seen = new Set<number>();
  for (const [from, to] of windows) {
    for (const i of windowRange(from, to)) {
      if (seen.has(i)) return `${from}–${to}`;
      seen.add(i);
    }
  }
  return null;
}

/**
 * Checks a run's parsed category files against the scope: schema, ids, one category per file, each scope item
 * at most once and in its own category, varieties exactly where the scope rates by variety, known states, and
 * no overlapping windows within one origin or variety. Missing items are warnings, so partial runs still load.
 */
export function checkRun(
  files: readonly { name: string; data: unknown }[],
  scope: Scope,
  states: ReadonlySet<string>,
): RunReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const byId = new Map(scope.map((s) => [s.item, s]));
  const seen = new Set<string>();
  for (const file of files) {
    const parsed = panelCategorySchema.safeParse(file.data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues)
        errors.push(`${file.name}: ${issue.path.join(".") || "(file)"}: ${issue.message}`);
      continue;
    }
    const { category, items } = parsed.data;
    if (`${category}.yaml` !== file.name)
      errors.push(`${file.name}: category ${category} doesn't match the file name`);
    for (const item of items) {
      const at = `${file.name}: ${item.item}`;
      const s = byId.get(item.item);
      if (s === undefined) {
        errors.push(`${at}: not in the scope`);
        continue;
      }
      if (seen.has(item.item)) errors.push(`${at}: appears more than once`);
      seen.add(item.item);
      if (s.category !== category) errors.push(`${at}: belongs in ${s.category}`);
      if (s.ratedBy === "variety" && !item.varieties?.length)
        errors.push(`${at}: rated by variety, but no varieties`);
      if (s.ratedBy !== "variety" && item.varieties !== undefined) errors.push(`${at}: not rated by variety`);
      const targets = [
        ...item.origins.map((o) => ({ name: o.origin, windows: o.windows })),
        ...(item.varieties ?? []).map((v) => ({ name: v.variety, windows: v.windows })),
      ];
      const names = new Set<string>();
      for (const t of targets) {
        if (names.has(t.name)) errors.push(`${at}: ${t.name} listed twice`);
        names.add(t.name);
        const clash = overlaps(t.windows);
        if (clash !== null) errors.push(`${at}: ${t.name} windows overlap at ${clash}`);
      }
      for (const o of item.origins) {
        if (o.origin.startsWith("us-") && !states.has(o.origin.slice(3).toUpperCase()))
          errors.push(`${at}: unknown state in ${o.origin}`);
      }
      if (item.traits.alwaysGood[0] && targets.some((t) => t.windows.some((w) => w[2] !== "fair")))
        warnings.push(`${at}: alwaysGood, but some window isn't fair`);
      if (item.traits.alwaysGood[0] && item.traits.peakWorthSeeking[0])
        warnings.push(`${at}: alwaysGood and peakWorthSeeking both true`);
    }
  }
  for (const s of scope) if (!seen.has(s.item)) warnings.push(`missing: ${s.item}`);
  return { errors, warnings, covered: seen.size };
}

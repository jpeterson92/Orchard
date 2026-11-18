// Painted art: the manifest (`art/manifest.json`), which assets each build shows, and their derivative URLs
// (engineering plan §5, art track). `npm run art:process` writes the derivatives to public/art/; data:build
// validates the manifest and resolves each item's and variety's asset into the app data.
import { z } from "zod";

/** Derivative widths written by `art:process` (WebP, square): a 72 px card thumbnail up to a 320 px pane at 2x. */
export const ART_WIDTHS = [160, 320, 640] as const;
export const ART_ROLES = ["thumbnail"] as const;

const kebab = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "use a lowercase-kebab id");

export const artAssetSchema = z.strictObject({
  /** `<item>[-<variety>]-<role>-v<revision>`, as in the illustration guide. */
  id: kebab,
  item: kebab,
  variety: kebab.optional(),
  role: z.enum(ART_ROLES),
  /** What the painting shows, for alt text where no nearby name already says it. */
  alt: z.string().trim().min(1),
  revision: z.int().min(1),
  /** requested → review (art:process passed the master) → approved or rejected (Jared, from the contact sheet). */
  status: z.enum(["requested", "review", "approved", "rejected"]),
});
export const artManifestSchema = z.strictObject({ assets: z.array(artAssetSchema) });

export type ArtAsset = z.infer<typeof artAssetSchema>;

export const artId = (a: Pick<ArtAsset, "item" | "variety" | "role" | "revision">): string =>
  [a.item, a.variety, a.role, `v${a.revision}`].filter(Boolean).join("-");

export const artFile = (id: string, width: number): string => `${id}-${width}.webp`;
export const artSrcSet = (id: string): string =>
  ART_WIDTHS.map((w) => `/art/${artFile(id, w)} ${w}w`).join(", ");
export const artSrc = (id: string): string => `/art/${artFile(id, ART_WIDTHS[1])}`;

/** Asset ids the app shows: item thumbnails by item id, variety thumbnails by `<item>/<variety>`. */
export interface ArtMap {
  items: Record<string, string>;
  varieties: Record<string, string>;
}

export interface ArtSubjects {
  id: string;
  varieties: { id: string }[];
}

/**
 * Validates the manifest against the items and the derivatives on disk, and picks the asset each subject shows:
 * the highest revision that is approved (production) or approved or awaiting review (dev and preview).
 * Production also refuses any item without an approved thumbnail. A variety without its own art shows the
 * placeholder, never its item's painting, so one specimen never stands for several varieties.
 */
export function resolveArt(
  raw: unknown,
  items: readonly ArtSubjects[],
  opts: { production: boolean; processed: ReadonlySet<string> },
): { errors: string[]; art: ArtMap } {
  const errors: string[] = [];
  const art: ArtMap = { items: {}, varieties: {} };
  const parsed = artManifestSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues)
      errors.push(`art/manifest.json: ${issue.path.join(".")}: ${issue.message}`);
    return { errors, art };
  }

  const byItem = new Map(items.map((i) => [i.id, new Set(i.varieties.map((v) => v.id))]));
  const seen = new Set<string>();
  const best = new Map<string, ArtAsset>();
  for (const a of parsed.data.assets) {
    const at = `art ${a.id}`;
    if (seen.has(a.id)) errors.push(`${at}: duplicate id`);
    seen.add(a.id);
    if (a.id !== artId(a)) errors.push(`${at}: id must be ${artId(a)}`);
    const varieties = byItem.get(a.item);
    if (varieties === undefined) errors.push(`${at}: unknown item ${a.item}`);
    else if (a.variety !== undefined && !varieties.has(a.variety))
      errors.push(`${at}: unknown variety ${a.variety}`);
    const processed = opts.processed.has(a.id);
    if ((a.status === "review" || a.status === "approved") && !processed)
      errors.push(`${at}: ${a.status} but public/art has no derivatives; run npm run art:process`);

    const shown = a.status === "approved" || (!opts.production && a.status === "review");
    if (!shown || !processed) continue;
    const key = a.variety === undefined ? a.item : `${a.item}/${a.variety}`;
    const current = best.get(key);
    if (current === undefined || a.revision > current.revision) best.set(key, a);
  }

  for (const [key, a] of best) {
    if (a.variety === undefined) art.items[key] = a.id;
    else art.varieties[key] = a.id;
  }
  if (opts.production)
    for (const i of items)
      if (art.items[i.id] === undefined)
        errors.push(`item ${i.id}: no approved thumbnail (production build)`);
  return { errors, art };
}

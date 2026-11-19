// Pure validation behind `npm run data:build` (engineering plan §4.1): schema checks, then cross-file checks.
// Takes already-parsed inputs so tests can feed broken fixtures without touching the disk.
import type { z } from "zod";
import {
  type Category,
  categorySchema,
  type Dataset,
  type EvidenceFile,
  evidenceFileSchema,
  type Guide,
  guideSchema,
  type Item,
  itemSchema,
  type PanelCurve,
  type Rules,
  rulesSchema,
  type Snapshot,
  type Source,
  type State,
  type SupplyIndexRow,
  snapshotSchema,
  sourceSchema,
  stateSchema,
  supplyIndexRowSchema,
  type TypicalOriginRow,
  typicalOriginRowSchema,
  type VarietyCalendarRow,
  varietyCalendarRowSchema,
} from "../src/shared/data/schema";
import { PANEL as PANEL_SOURCE, panelFor, propose, type Target, traitsFor } from "../src/shared/evidence";
import { monthRange, windowLabel, windowRange } from "../src/shared/time";

export interface Csv {
  file: string;
  /** `# key: value` lines before the header. */
  meta: Record<string, string>;
  rows: Record<string, string>[];
}

export interface RawInputs {
  rules: unknown;
  sources: unknown;
  categories: unknown;
  states: Csv;
  items: { file: string; data: unknown }[];
  /** content/guides.yaml: the variety guides and their trait scales. */
  guides: unknown;
  evidence: { file: string; data: unknown }[];
  typicalOrigins: Csv | null;
  supplyIndex: Csv | null;
  varietyCalendar: Csv | null;
  /** The model panel's curves from the counted runs (P15), built by `panelCurves`. */
  panel: PanelCurve[];
}

export interface Result {
  errors: string[];
  warnings: string[];
  dataset: Dataset | null;
}

export function parseCsv(file: string, text: string, columns: readonly string[]): Csv {
  const meta: Record<string, string> = {};
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  while (lines[0]?.startsWith("#")) {
    const line = (lines.shift() as string).slice(1);
    const at = line.indexOf(":");
    if (at > 0) meta[line.slice(0, at).trim()] = line.slice(at + 1).trim();
  }
  const header = lines.shift()?.split(",") ?? [];
  if (header.join(",") !== columns.join(",")) {
    throw new Error(`${file}: header must be "${columns.join(",")}", found "${header.join(",")}"`);
  }
  const rows = lines.map((line, n) => {
    const cells = line.split(",");
    if (cells.length !== columns.length) {
      throw new Error(`${file}: line ${n + 2} has ${cells.length} cells, expected ${columns.length}`);
    }
    return Object.fromEntries(columns.map((c, i) => [c, (cells[i] as string).trim()]));
  });
  return { file, meta, rows };
}

type Windows = Item["origins"][number]["windows"];

/** An item's rated series: each origin, then each rated variety, with its name in messages and its P12 target. */
function ratedSeries(item: Item): [string, Windows, Target][] {
  return [
    ...item.origins.map((o): [string, Windows, Target] => [o.origin, o.windows, { origin: o.origin }]),
    ...item.varieties.flatMap((v): [string, Windows, Target][] =>
      v.windows ? [[`variety ${v.id}`, v.windows, { variety: v.id }]] : [],
    ),
  ];
}

const countryNames = new Intl.DisplayNames(["en"], { type: "region", fallback: "none" });
const NOT_COUNTRIES = new Set(["ZZ", "EU", "EZ", "UN", "US"]);

export function validate(raw: RawInputs, opts: { production: boolean }): Result {
  const errors: string[] = [];
  const warnings: string[] = [];

  function parse<S extends z.ZodType>(schema: S, value: unknown, where: string): z.output<S> | null {
    const r = schema.safeParse(value);
    if (r.success) return r.data;
    for (const issue of r.error.issues) {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      errors.push(`${where}: ${path}${issue.message}`);
    }
    return null;
  }
  function list<S extends z.ZodType>(schema: S, value: unknown, file: string): z.output<S>[] {
    if (!Array.isArray(value)) {
      errors.push(`${file}: expected a list`);
      return [];
    }
    return value.flatMap((v, i) => parse(schema, v, `${file}[${i}]`) ?? []);
  }
  function unique<T>(things: T[], key: (t: T) => string, what: string): void {
    const seen = new Set<string>();
    for (const t of things) {
      const k = key(t);
      if (seen.has(k)) errors.push(`duplicate ${what} ${k}`);
      seen.add(k);
    }
  }

  const rules: Rules | null = parse(rulesSchema, raw.rules, "data/rules.yaml");
  const sources: Source[] = list(sourceSchema, raw.sources, "data/sources.yaml");
  const categories: Category[] = list(categorySchema, raw.categories, "data/categories.yaml");
  const states: State[] = list(stateSchema, raw.states.rows, raw.states.file);
  const baseName = (file: string) =>
    file
      .split(/[\\/]/)
      .pop()
      ?.replace(/\.ya?ml$/, "");
  const items: Item[] = raw.items.flatMap(({ file, data }) => {
    const item = parse(itemSchema, data, file);
    if (item === null) return [];
    if (baseName(file) !== item.id) errors.push(`${file}: file name must match id "${item.id}"`);
    return [item];
  });
  const guides: Guide[] = list(guideSchema, raw.guides, "content/guides.yaml");
  const evidence: EvidenceFile[] = raw.evidence.flatMap(({ file, data }) => {
    const ev = parse(evidenceFileSchema, data, file);
    if (ev === null) return [];
    if (baseName(file) !== ev.item) errors.push(`${file}: file name must match item "${ev.item}"`);
    return [ev];
  });

  unique(sources, (s) => s.id, "source");
  unique(categories, (c) => c.id, "category");
  unique(states, (s) => s.state, "state");
  unique(items, (i) => i.id, "item");
  unique(items, (i) => String(i.purchaseRank), "purchaseRank");
  unique(evidence, (e) => e.item, "evidence file for");

  const sourceIds = new Set(sources.map((s) => s.id));
  const categoryIds = new Set(categories.map((c) => c.id));
  const stateCodes = new Set(states.map((s) => s.state));
  const itemIds = new Set(items.map((i) => i.id));

  const originProblem = (origin: string): string | null => {
    if (origin.startsWith("us-")) {
      return stateCodes.has(origin.slice(3).toUpperCase()) ? null : `unknown US state in origin ${origin}`;
    }
    const code = origin.toUpperCase();
    if (NOT_COUNTRIES.has(code) || countryNames.of(code) === undefined) {
      return `unknown origin ${origin} (use "us-<state>" for US origins)`;
    }
    return null;
  };
  const checkOrigin = (origin: string, where: string) => {
    const problem = originProblem(origin);
    if (problem !== null) errors.push(`${where}: ${problem}`);
  };
  const checkSources = (ids: string[], where: string) => {
    for (const s of ids) if (!sourceIds.has(s)) errors.push(`${where}: unknown source ${s}`);
  };

  for (const item of items) {
    const at = `item ${item.id}`;
    if (!categoryIds.has(item.category)) errors.push(`${at}: unknown category ${item.category}`);
    unique(item.origins, (o) => `${item.id}/${o.origin}`, "origin");
    unique(item.types, (t) => `${item.id}/${t.id}`, "type");
    unique(item.varieties, (v) => `${item.id}/${v.id}`, "variety");
    checkSources(item.store.sources, `${at} store`);
    if (item.ripen) checkSources(item.ripen.sources, `${at} ripen`);
    for (const v of item.varieties) checkSources(v.sources, `${at} variety ${v.id}`);
    for (const t of ["shipsWell", "storesWell", "peakWorthSeeking"] as const)
      checkSources(item[t].sources, `${at} ${t}`);
    for (const v of item.varieties)
      if (v.storesWell) checkSources(v.storesWell.sources, `${at} variety ${v.id} storesWell`);
    for (const o of item.origins) checkOrigin(o.origin, at);
    const typicalMonths = new Set<number>();
    for (const t of item.typicalOrigins) {
      const where = `${at} typical origins ${t.from}..${t.to}`;
      checkSources(t.sources, where);
      unique(t.origins, (o) => `${item.id}/${t.from}..${t.to}/${o.origin}`, "typical origin");
      for (const o of t.origins) checkOrigin(o.origin, where);
      for (const m of monthRange(t.from, t.to)) {
        if (typicalMonths.has(m)) errors.push(`${where}: months overlap`);
        typicalMonths.add(m);
      }
    }
    for (const [name, windows] of ratedSeries(item)) {
      const rated = new Set<number>();
      for (const w of windows) {
        for (const n of windowRange(w.from, w.to)) {
          if (rated.has(n)) errors.push(`${at} ${name}: windows overlap at ${w.from}..${w.to}`);
          rated.add(n);
        }
      }
    }
  }

  // Variety guides: a guide item's varieties use only the guide's scales, with a citation, and each anchor's
  // reference varieties carry that anchor's value. A trait no source covers yet stays unrated (a warning).
  unique(guides, (g) => g.id, "guide");
  const guideOf = new Map<string, Guide>();
  for (const g of guides) {
    const at = `guide ${g.id}`;
    unique(g.traits, (t) => `${g.id}/${t.id}`, "trait");
    const varieties = new Map<string, Item["varieties"][number]>();
    for (const id of g.items) {
      const item = items.find((i) => i.id === id);
      if (!item) {
        errors.push(`${at}: unknown item ${id}`);
        continue;
      }
      if (guideOf.has(id)) errors.push(`${at}: item ${id} is already in guide ${guideOf.get(id)?.id}`);
      guideOf.set(id, g);
      for (const v of item.varieties) {
        if (varieties.has(v.id)) errors.push(`${at}: variety id ${v.id} appears in two of its items`);
        varieties.set(v.id, v);
      }
    }
    for (const t of g.traits)
      for (const [level, a] of Object.entries(t.anchors))
        for (const ref of a.varieties) {
          const v = varieties.get(ref);
          if (!v) errors.push(`${at} ${t.id} ${level}: unknown reference variety ${ref}`);
          else if (v.traits[t.id] !== undefined && v.traits[t.id] !== Number(level))
            errors.push(`${at} ${t.id} ${level}: reference variety ${ref} is rated ${v.traits[t.id]}`);
        }
  }
  for (const item of items)
    for (const v of item.varieties) {
      const at = `item ${item.id} variety ${v.id}`;
      const g = guideOf.get(item.id);
      const keys = Object.keys(v.traits);
      if (!g) {
        if (keys.length > 0) errors.push(`${at}: traits need a guide for ${item.id}`);
        continue;
      }
      for (const k of keys)
        if (!g.traits.some((t) => t.id === k)) errors.push(`${at}: trait ${k} isn't on guide ${g.id}`);
      for (const t of g.traits) if (!(t.id in v.traits)) warnings.push(`${at}: no ${t.id} rating yet`);
      if (v.sources.length === 0) errors.push(`${at}: cite a source for its traits and uses`);
    }

  const sourcesById = new Map(sources.map((s) => [s.id, s]));
  for (const s of sources) {
    if (s.basedOn === undefined) continue;
    if (!sourceIds.has(s.basedOn)) errors.push(`source ${s.id}: basedOn unknown source ${s.basedOn}`);
    const seen = new Set([s.id]);
    for (let at = sourcesById.get(s.basedOn); at !== undefined; at = sourcesById.get(at.basedOn ?? "")) {
      if (seen.has(at.id)) {
        errors.push(`source ${s.id}: basedOn loops back to ${at.id}`);
        break;
      }
      seen.add(at.id);
    }
  }

  const itemsById = new Map(items.map((i) => [i.id, i]));
  for (const ev of evidence) {
    const item = itemsById.get(ev.item);
    if (item === undefined) errors.push(`evidence ${ev.item}: unknown item ${ev.item}`);
    for (const [n, c] of ev.claims.entries()) {
      const where = `evidence ${ev.item} claim ${n + 1}`;
      checkSources([c.source], where);
      if (c.origin !== "us") checkOrigin(c.origin, where);
      if (c.variety !== undefined && item && !item.varieties.some((v) => v.id === c.variety)) {
        errors.push(`${where}: unknown variety ${c.variety}`);
      }
      const rated = new Set<number>();
      for (const w of c.windows) {
        for (const i of windowRange(w.from, w.to)) {
          if (rated.has(i)) errors.push(`${where}: windows overlap at ${w.from}..${w.to}`);
          rated.add(i);
        }
      }
    }
  }

  // Every rated window rests on the evidence (P12, P15): the model panel's rating, an eating-quality overrule of
  // it, or 2 independent cited sources where the panel abstains; and a reason where the call departs from the
  // proposal or the proposal is Low confidence.
  for (const item of items) {
    const claims = (evidence.find((e) => e.item === item.id)?.claims ?? []).filter((c) =>
      sourceIds.has(c.source),
    );
    for (const [name, windows, target] of ratedSeries(item)) {
      const panel = panelFor(raw.panel, item.id, target);
      const proposal = propose(claims, sourcesById, target, traitsFor(item, target), panel).windows;
      for (const w of windows) {
        const at = `item ${item.id} ${name} ${w.from}..${w.to}`;
        const range = windowRange(w.from, w.to);
        const thin = range.find((i) => {
          const p = proposal[i];
          return p == null || !(p.sources.includes(PANEL_SOURCE) || p.overrules || p.sources.length >= 2);
        });
        if (thin !== undefined) {
          const n = proposal[thin]?.sources.length ?? 0;
          errors.push(
            `${at}: needs claims from 2 independent sources, has ${n} at ${windowLabel(thin)} (where the model panel abstains)`,
          );
          continue;
        }
        if (w.reason !== undefined) continue;
        const departs = range.find((i) => proposal[i]?.rating !== w.rating);
        const low = range.find((i) => proposal[i]?.confidence === "low");
        if (departs !== undefined) {
          errors.push(
            `${at}: rated ${w.rating}, but the evidence proposes ${proposal[departs]?.rating} at ${windowLabel(departs)}; add a reason`,
          );
        } else if (low !== undefined) {
          errors.push(`${at}: the evidence is Low confidence at ${windowLabel(low)}; add a reason`);
        }
      }
    }
  }

  const snapshots: Snapshot[] = [];
  function csvRows<S extends z.ZodType<{ item: string }>>(
    csv: Csv | null,
    schema: S,
    convert: (r: Record<string, string>) => unknown,
  ) {
    if (csv === null) return [];
    const snapshot = parse(snapshotSchema, csv.meta, `${csv.file} header`);
    if (snapshot) snapshots.push(snapshot);
    const rows = csv.rows.flatMap((r, n) => parse(schema, convert(r), `${csv.file} line ${n + 2}`) ?? []);
    const unknown = new Set(rows.map((r) => r.item).filter((i) => !itemIds.has(i)));
    if (unknown.size > 0)
      warnings.push(`${csv.file}: no item file yet for ${[...unknown].sort().join(", ")}`);
    return rows as z.output<S>[];
  }

  const typicalOrigins: TypicalOriginRow[] = csvRows(raw.typicalOrigins, typicalOriginRowSchema, (r) => r);
  unique(typicalOrigins, (r) => `${r.item}/${r.month}/rank ${r.rank}`, "typical origin");
  unique(typicalOrigins, (r) => `${r.item}/${r.month}/${r.origin}`, "typical origin");
  const months = new Map<string, TypicalOriginRow[]>();
  for (const r of typicalOrigins) {
    checkOrigin(r.origin, `typical origin ${r.item}/${r.month}`);
    const key = `${r.item}/${r.month}`;
    months.set(key, [...(months.get(key) ?? []), r]);
  }
  for (const [key, rows] of months) {
    rows.sort((a, b) => a.rank - b.rank);
    if (rows.some((r, i) => r.rank !== i + 1)) errors.push(`typical origin ${key}: ranks must run 1..n`);
    if (rows.some((r, i) => i > 0 && r.share > (rows[i - 1]?.share ?? 1)))
      errors.push(`typical origin ${key}: shares must not rise with rank`);
    // Shares are rounded to 3 places, so a sum may run a little over 1.
    if (rows.reduce((a, r) => a + r.share, 0) > 1.005)
      errors.push(`typical origin ${key}: shares sum over 1`);
  }
  for (const item of items)
    if (item.typicalOrigins.length > 0 && typicalOrigins.some((r) => r.item === item.id))
      errors.push(`item ${item.id}: editorial typical origins and USDA ones (typical-origins.csv); keep one`);

  const supplyIndex: SupplyIndexRow[] = csvRows(raw.supplyIndex, supplyIndexRowSchema, (r) => ({
    ...r,
    value: r.value === "" ? null : Number(r.value),
    reason: r.reason === "" ? null : r.reason,
  }));
  unique(supplyIndex, (r) => `${r.item}/${r.origin}/${r.month}`, "supply index");
  for (const r of supplyIndex) checkOrigin(r.origin, `supply index ${r.item}/${r.origin}/${r.month}`);

  const varietyCalendar: VarietyCalendarRow[] = csvRows(
    raw.varietyCalendar,
    varietyCalendarRowSchema,
    (r) => ({
      ...r,
      share: Number(r.share),
      origins: r.origins ? r.origins.split(" ") : [],
    }),
  );
  unique(varietyCalendar, (r) => `${r.item}/${r.variety}/${r.month}`, "variety calendar");
  for (const r of varietyCalendar)
    for (const o of r.origins) checkOrigin(o, `variety calendar ${r.item}/${r.variety}/${r.month}`);
  for (const item of items)
    for (const v of item.varieties) {
      const at = `item ${item.id} variety ${v.id}`;
      if (v.windows && !v.quotedAs) errors.push(`${at}: a rated variety needs quotedAs (P13)`);
      for (const q of v.quotedAs ?? [])
        if (raw.varietyCalendar && !varietyCalendar.some((r) => r.item === item.id && r.variety === q))
          errors.push(`${at}: quotedAs ${q} isn't in the variety calendar`);
    }

  // The derived CSVs come from one usda:derive run: same period and date, though their sources differ.
  const [snapshot = null] = snapshots;
  const period = (s: Snapshot) => `${s.from}..${s.to} derived ${s.derived}`;
  if (snapshot && snapshots.some((s) => period(s) !== period(snapshot))) {
    errors.push("the data/usda CSV headers describe different snapshots");
  }

  if (opts.production) {
    const records = [
      ...items,
      ...guides.map((g) => ({ ...g, id: `guide ${g.id}` })),
      ...evidence.map((e) => ({ ...e, id: `evidence ${e.item}` })),
    ];
    for (const s of sources)
      if (s.synthetic) errors.push(`source ${s.id}: synthetic records can't ship (production build)`);
    for (const r of records) {
      if (r.status === "draft") errors.push(`${r.id}: draft records can't ship (production build)`);
      if (r.synthetic) errors.push(`${r.id}: synthetic records can't ship (production build)`);
    }
  }

  if (errors.length > 0 || rules === null) return { errors, warnings, dataset: null };
  const byId = <T extends { id: string }>(xs: T[]) => [...xs].sort((a, b) => a.id.localeCompare(b.id));
  return {
    errors,
    warnings,
    dataset: {
      rules,
      sources: byId(sources),
      categories,
      states,
      items: byId(items),
      guides,
      evidence: [...evidence].sort((a, b) => a.item.localeCompare(b.item)),
      snapshot,
      typicalOrigins,
      supplyIndex,
      varietyCalendar,
      panel: raw.panel,
    },
  };
}

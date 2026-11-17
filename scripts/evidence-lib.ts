// Helpers for the evidence pipeline (engineering plan, content track): the source registry's schema,
// HTML to text, robots.txt, excerpts, the `item-months` parser, the checks behind evidence:check, and the
// two network helpers both scripts share (everything else is pure).
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";
import type { EvidenceClaim } from "../src/shared/data/schema";
import { originId } from "../src/shared/data/schema";
import { WINDOW_COUNT, windowFromLabel, windowLabel, windowRange } from "../src/shared/time";

export const USER_AGENT = "OrchardEvidence/0.1 (seasonal produce research)";
/** The token robots.txt groups are matched against. */
const AGENT_TOKEN = "orchardevidence";

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "use a lowercase-kebab id");

/** `data/source-registry.yaml`: the item match terms of the batch being researched, and the pages to read. */
export const registrySchema = z.strictObject({
  items: z.record(id, z.array(z.string().trim().min(1)).min(1)),
  pages: z.array(
    z.strictObject({
      source: id,
      url: z.url(),
      /** chart: one page covering many items; item-page: prose about the items listed. */
      kind: z.enum(["chart", "item-page"]),
      /** Where the page's claims apply, when it names one place (`us` when it names none). */
      origin: originId.default("us"),
      /** A chart whose rows become claims directly. */
      parser: z.enum(["item-months"]).optional(),
      /** Item pages only: the items they cover. Charts cover every registry item. */
      items: z.array(id).min(1).optional(),
    }),
  ),
});
export type Registry = z.infer<typeof registrySchema>;
export type RegistryPage = Registry["pages"][number];

// ---------- HTML to text ----------

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  hellip: "…",
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name: string) => {
    if (name[0] === "#") {
      const code =
        name[1] === "x" || name[1] === "X" ? Number.parseInt(name.slice(2), 16) : Number(name.slice(1));
      if (code === 160) return " ";
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[name.toLowerCase()] ?? whole;
  });
}

const BLOCK =
  /<\/?(p|div|li|ul|ol|h[1-6]|br|section|article|header|footer|table|tbody|thead|dt|dd|blockquote)\b[^>]*>/gi;
const flatten = (html: string) =>
  decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

/** A page's visible text, one line per block. A table row becomes one line, its cells joined by " | ". */
export function htmlToLines(html: string): string[] {
  const body = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(head|script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi, (_, row: string) => {
      const cells = row
        .split(/<\/t[dh]>/i)
        .map(flatten)
        .filter(Boolean);
      return `\n${cells.join(" | ")}\n`;
    })
    .replace(BLOCK, "\n");
  return body
    .split("\n")
    .map(flatten)
    .filter((l) => l.length > 0);
}

// ---------- robots.txt ----------

export interface RobotsRule {
  allow: boolean;
  path: string;
}

/** The rules of the group naming this pipeline's agent, else the `*` group (RFC 9309). */
export function parseRobots(txt: string): RobotsRule[] {
  const groups: { agents: string[]; rules: RobotsRule[] }[] = [];
  let current: { agents: string[]; rules: RobotsRule[] } | null = null;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line);
    if (!m) continue;
    const key = (m[1] as string).toLowerCase();
    const value = (m[2] as string).trim();
    if (key === "user-agent") {
      if (current === null || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if ((key === "allow" || key === "disallow") && current !== null) {
      if (value !== "") current.rules.push({ allow: key === "allow", path: value });
    }
  }
  const mine = groups.filter((g) => g.agents.some((a) => a !== "*" && AGENT_TOKEN.includes(a)));
  const chosen = mine.length > 0 ? mine : groups.filter((g) => g.agents.includes("*"));
  return chosen.flatMap((g) => g.rules);
}

const ruleRegex = (path: string) =>
  new RegExp(
    `^${path
      .replace(/[.+?^{}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".*")
      .replace(/\\?\$$/, "$")}`,
  );

/** The longest matching rule decides; Allow wins a tie; no matching rule allows. */
export function robotsAllows(rules: RobotsRule[], pathAndQuery: string): boolean {
  let best: RobotsRule | null = null;
  for (const r of rules) {
    if (!ruleRegex(r.path).test(pathAndQuery)) continue;
    if (best === null || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow))
      best = r;
  }
  return best === null || best.allow;
}

// ---------- excerpts ----------

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
const MONTH_WORD = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?/gi;
const SEASON_WORD = /\b(spring|summer|fall|autumn|winter)\b/i;

/** Month numbers (1–12) named in a text, by full name or 3-letter abbreviation. */
export function monthsNamed(text: string): Set<number> {
  const out = new Set<number>();
  for (const m of text.matchAll(MONTH_WORD)) {
    const word = m[0].toLowerCase().replace(/\.$/, "");
    const i = MONTH_NAMES.findIndex(
      (n) => n === word || (word.length <= 4 && n.startsWith(word.slice(0, 3))),
    );
    if (i >= 0) out.add(i + 1);
  }
  return out;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const termRegex = (terms: string[]) => new RegExp(`\\b(${terms.map(escapeRegex).join("|")})\\b`, "i");

export const EXCERPT_CHARS = 400;

/** Lines naming the item together with a month or a season, each cut to EXCERPT_CHARS. */
export function excerpts(lines: string[], terms: string[]): string[] {
  const term = termRegex(terms);
  return lines
    .filter((l) => term.test(l) && (monthsNamed(l).size > 0 || SEASON_WORD.test(l)))
    .map((l) => (l.length > EXCERPT_CHARS ? `${l.slice(0, EXCERPT_CHARS - 1)}…` : l));
}

// ---------- month ranges ----------

type Half = 0 | 1;
const FIRST_HALF =
  /^(early|beginning of|start of|first week (in|of)|1st week (in|of)|second week (in|of)|2nd week (in|of))\s+/;
const MID = /^(mid|middle of)\s+/;
const THIRD_WEEK = /^(third week (in|of)|3rd week (in|of))\s+/;
const SECOND_HALF = /^(late|end of|the end of|fourth week (in|of)|4th week (in|of)|last week (in|of))\s+/;

interface Point {
  month: number;
  /** First and last window of the month this point allows, as a range start and as a range end. */
  start: Half;
  end: Half;
  qualified: boolean;
}

function parsePoint(text: string): Point | null {
  let s = text.trim().toLowerCase();
  let start: Half = 0;
  let end: Half = 1;
  let qualified = true;
  if (FIRST_HALF.test(s)) {
    s = s.replace(FIRST_HALF, "");
    end = 0;
  } else if (MID.test(s)) {
    s = s.replace(MID, "");
    start = 1;
    end = 0;
  } else if (THIRD_WEEK.test(s)) {
    s = s.replace(THIRD_WEEK, "");
    start = 1;
  } else if (SECOND_HALF.test(s)) {
    s = s.replace(SECOND_HALF, "");
    start = 1;
  } else qualified = false;
  const months = [...monthsNamed(s)];
  if (months.length !== 1 || !/^[a-z]+\.?$/.test(s)) return null;
  return { month: months[0] as number, start, end, qualified };
}

export interface MonthRanges {
  /** Merged windows, sorted from the earliest start. */
  windows: { from: string; to: string }[];
  /** True when any point named part of a month ("late June"). */
  halfMonth: boolean;
}

/** Window runs covered by a set of window indexes; a run may wrap past December. A full year starts at `fullYearFrom`. */
export function runs(covered: Set<number>, fullYearFrom = 0): { from: string; to: string }[] {
  if (covered.size === WINDOW_COUNT)
    return [
      { from: windowLabel(fullYearFrom), to: windowLabel((fullYearFrom + WINDOW_COUNT - 1) % WINDOW_COUNT) },
    ];
  const out: { from: string; to: string }[] = [];
  for (let i = 0; i < WINDOW_COUNT; i++) {
    if (!covered.has(i) || covered.has((i + WINDOW_COUNT - 1) % WINDOW_COUNT)) continue;
    let j = i;
    while (covered.has((j + 1) % WINDOW_COUNT)) j = (j + 1) % WINDOW_COUNT;
    out.push({ from: windowLabel(i), to: windowLabel(j) });
  }
  return out;
}

/**
 * "June–October", "April–May and October–November", "End of June through end of November",
 * "2nd week in August through 3rd week in October", "December through April" (wraps). Null when any part
 * isn't a month or a month range.
 */
export function parseMonthRanges(text: string): MonthRanges | null {
  const s = text
    .toLowerCase()
    .replace(/[*†]+/g, "")
    .replace(/\bmid-\s*/g, "mid ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.;]$/, "");
  if (s === "") return null;
  const covered = new Set<number>();
  let halfMonth = false;
  let firstStart: number | null = null;
  for (const segment of s.split(/\s*,\s*(?:and\s+)?|\s+and\s+/)) {
    const ends = segment.split(/\s*(?:–|—|-|\bthrough\b|\bthru\b|\bto\b|\buntil\b)\s*/).filter(Boolean);
    if (ends.length === 0 || ends.length > 2) return null;
    const from = parsePoint(ends[0] as string);
    const to = ends.length === 2 ? parsePoint(ends[1] as string) : from;
    if (from === null || to === null) return null;
    halfMonth ||= from.qualified || to.qualified;
    let a = (from.month - 1) * 2 + from.start;
    let b = (to.month - 1) * 2 + to.end;
    // A lone "mid-June" names the middle of the month: take the whole month.
    if (ends.length === 1 && b < a) [a, b] = [(from.month - 1) * 2, (from.month - 1) * 2 + 1];
    firstStart ??= a;
    for (const i of windowRange(windowLabel(a), windowLabel(b))) covered.add(i);
  }
  return { windows: runs(covered, firstStart ?? 0), halfMonth };
}

// ---------- the item-months parser ----------

export interface ParsedRow {
  item: string;
  label: string;
  months: string;
  ranges: MonthRanges | null;
}

const normalizeLabel = (label: string) =>
  label
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[*†]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Rows of an item-to-months chart: "Apples | June–October |" (a table) or "Strawberry: December through April". */
export function parseItemMonths(lines: string[], items: Record<string, string[]>): ParsedRow[] {
  const out: ParsedRow[] = [];
  for (const line of lines) {
    const m = /^([^|:]{1,60}?)\s*(?:\||:)\s*([^|]+?)\s*\|?$/.exec(line);
    if (!m) continue;
    const label = normalizeLabel(m[1] as string);
    const months = (m[2] as string).trim();
    for (const [item, terms] of Object.entries(items)) {
      if (terms.some((t) => t.toLowerCase() === label))
        out.push({ item, label: (m[1] as string).trim(), months, ranges: parseMonthRanges(months) });
    }
  }
  return out;
}

const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "late Jun to Nov", "Apr to mid-May" */
export function describeWindows(windows: { from: string; to: string }[]): string {
  const part = (label: string, edge: "from" | "to") => {
    const [m, h] = label.split("-") as [string, string];
    const name =
      SHORT[["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(m)];
    if (edge === "from") return h === "2" ? `late ${name}` : `${name}`;
    return h === "1" ? `mid-${name}` : `${name}`;
  };
  return windows
    .map((w) =>
      w.from.split("-")[0] === w.to.split("-")[0] && w.from !== w.to
        ? part(w.from, "from")
        : `${part(w.from, "from")} to ${part(w.to, "to")}`,
    )
    .join(", ");
}

/**
 * A chart row as a draft claim. An availability chart says when an item is in season, not how good it is:
 * listed windows rate prime, and the combiner reads the rest of the year from them (P14, `claimValues`).
 */
export function rowClaim(row: ParsedRow, page: RegistryPage, placeName: string): EvidenceClaim | null {
  if (row.ranges === null) return null;
  return {
    source: page.source,
    origin: page.origin,
    windows: row.ranges.windows.map((w) => ({ ...w, rating: "prime" as const })),
    specificity: row.ranges.halfMonth ? "half-month" : "month",
    directness: "availability",
    paraphrase: `${placeName} harvest chart lists ${row.label.replace(/[*†]+/g, "").toLowerCase()} in season ${describeWindows(row.ranges.windows)}.`,
  };
}

// ---------- evidence:check ----------

const SEASON_OF_MONTH = [
  "winter",
  "winter",
  "spring",
  "spring",
  "spring",
  "summer",
  "summer",
  "summer",
  "fall",
  "fall",
  "fall",
  "winter",
];

/**
 * Why a claim's months or season don't appear in its excerpt: each rated range's first and last month must be
 * named there. A `season` claim may name the season instead ("fall" or "autumn").
 */
export function claimProblems(
  claim: Pick<EvidenceClaim, "windows" | "specificity">,
  excerpt: string,
): string[] {
  const named = monthsNamed(excerpt);
  const lower = excerpt.toLowerCase();
  const seasonNamed = (month: number) => {
    const season = SEASON_OF_MONTH[month - 1] as string;
    return new RegExp(`\\b${season === "fall" ? "(fall|autumn)" : season}\\b`).test(lower);
  };
  const problems: string[] = [];
  for (const w of claim.windows) {
    for (const label of [w.from, w.to]) {
      const m = Math.floor(windowFromLabel(label) / 2) + 1;
      if (named.has(m)) continue;
      if (claim.specificity === "season" && seasonNamed(m)) continue;
      const what =
        claim.specificity === "season" ? `${MONTH_NAMES[m - 1]} or its season` : MONTH_NAMES[m - 1];
      const message = `${w.from}–${w.to}: the excerpt doesn't name ${what}`;
      if (!problems.includes(message)) problems.push(message);
    }
  }
  return problems;
}

// ---------- loading ----------

/** The registry, checked against the source list: every page's source exists and every item page names registry items. */
export function checkRegistry(
  raw: unknown,
  sourceIds: Set<string>,
): { registry: Registry | null; errors: string[] } {
  const parsed = registrySchema.safeParse(raw);
  if (!parsed.success)
    return {
      registry: null,
      errors: parsed.error.issues.map((i) => `data/source-registry.yaml ${i.path.join(".")}: ${i.message}`),
    };
  const errors: string[] = [];
  for (const [n, page] of parsed.data.pages.entries()) {
    const at = `data/source-registry.yaml pages.${n} (${page.source})`;
    if (!sourceIds.has(page.source)) errors.push(`${at}: no source ${page.source} in data/sources.yaml`);
    if (page.kind === "chart" && page.items) errors.push(`${at}: a chart covers every item; drop items`);
    if (page.kind === "item-page" && !page.items) errors.push(`${at}: an item page lists its items`);
    if (page.kind === "item-page" && page.parser) errors.push(`${at}: only charts take a parser`);
    for (const item of page.items ?? [])
      if (!(item in parsed.data.items)) errors.push(`${at}: item ${item} isn't in the registry's items`);
  }
  return { registry: errors.length === 0 ? parsed.data : null, errors };
}

/** The items a page is read for. */
export const pageItems = (page: RegistryPage, registry: Registry): string[] =>
  page.items ?? Object.keys(registry.items);

// ---------- network ----------

export const hash = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 16);

export async function get(url: string): Promise<{ status: number; body: string }> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(30_000),
  });
  return { status: res.status, body: await res.text() };
}

/** Whether the site's robots.txt (cached in `dir`) lets this pipeline read the URL. */
export async function robotsAllow(url: URL, dir: string): Promise<boolean> {
  const file = `${dir}/${hash(url.origin)}.txt`;
  if (!existsSync(file)) {
    const res = await get(`${url.origin}/robots.txt`).catch(() => ({ status: 0, body: "" }));
    // A missing robots.txt (4xx) allows everything; an unreachable one is treated as missing.
    writeFileSync(file, res.status >= 200 && res.status < 300 ? res.body : "");
  }
  return robotsAllows(parseRobots(readFileSync(file, "utf8")), url.pathname + url.search);
}

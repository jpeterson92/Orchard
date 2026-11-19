// The Methods and Privacy pages (product spec §5 "Methods page", §10): their text is Markdown in content/, rendered
// to HTML at build time. A page starts with front matter giving its review status (`status: draft | reviewed`), and
// may name rule values as {{name}} so the published thresholds always match data/rules.yaml.
import { Marked } from "marked";
import { parse as parseYaml } from "yaml";
import type { Dataset } from "../src/shared/data/schema";

export interface PageText {
  html: string;
  draft: boolean;
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Headings get ids, so a link can point at one section (`/methods#confidence`).
const marked = new Marked({
  renderer: {
    heading({ tokens, depth }) {
      const inner = this.parser.parseInline(tokens);
      return `<h${depth} id="${slug(inner)}">${inner}</h${depth}>\n`;
    },
  },
});

/** Renders one page, or returns why it can't be published. */
export function renderPage(
  file: string,
  text: string,
  vars: Record<string, string>,
): { page: PageText | null; errors: string[] } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
  const status = match ? (parseYaml(match[1] ?? "") as { status?: unknown } | null)?.status : undefined;
  if (status !== "draft" && status !== "reviewed") {
    return { page: null, errors: [`${file}: front matter needs status: draft or status: reviewed`] };
  }
  const errors: string[] = [];
  const body = text.slice(match?.[0].length ?? 0).replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, name: string) => {
    const value = vars[name];
    if (value === undefined) errors.push(`${file}: unknown value {{${name}}}`);
    return value ?? "";
  });
  if (errors.length > 0) return { page: null, errors };
  return { page: { html: marked.parse(body, { async: false }), draft: status === "draft" }, errors };
}

const percent = (share: number) => `${Math.round(share * 100)}%`;

/** The rule values the Methods text may name. */
export function ruleValues(rules: Dataset["rules"]): Record<string, string> {
  return {
    typicalOriginShare: percent(rules.typicalOriginShare),
    availableShare: percent(rules.availableShare),
    lookForShare: percent(rules.lookForShare),
    supplyThin: String(rules.supplyIndex.thin),
    supplyStrong: String(rules.supplyIndex.strong),
    reliableYearRoundWindows: String(rules.reliableYearRoundWindows),
    snapshotMaxAgeMonths: String(rules.snapshotMaxAgeMonths),
  };
}

/** Every source the bundled items cite, in their copy, their quality windows or their evidence. */
export function citedSourceIds(data: Pick<Dataset, "items" | "evidence">): Set<string> {
  const ids = new Set<string>();
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value !== null && typeof value === "object") {
      for (const [key, v] of Object.entries(value)) {
        if (key === "sources" && Array.isArray(v)) {
          for (const s of v) if (typeof s === "string") ids.add(s);
        } else walk(v);
      }
    }
  };
  walk(data.items);
  for (const file of data.evidence) for (const claim of file.claims) ids.add(claim.source);
  return ids;
}

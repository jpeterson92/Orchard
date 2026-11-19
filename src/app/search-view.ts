// Search (product spec §5 "Search"): item names, synonyms, misspellings and variety names, matched from the first
// letter, with typos forgiven. Results carry their verdict, so a lookup often ends without a tap. Runs on the phone
// over the bundled data, so it works offline.
import MiniSearch from "minisearch";
import type { AppData } from "../shared/app-data";
import { evaluate, type PlainDate, type Verdict } from "../shared/verdict";
import { tags, varietyLine } from "./today-view";

interface Doc {
  key: string;
  item: string;
  /** Set on a variety's own entry. */
  variety: string | null;
  name: string;
  synonyms: string[];
  misspellings: string[];
}

export interface SearchResult {
  key: string;
  /** The item page this opens. */
  item: string;
  /** "v:honeycrisp" on a variety: the item page opens with that variety picked in the label check. */
  label: string | null;
  title: string;
  /** The item a variety belongs to, or the item's in-store varieties. */
  subtitle: string | null;
  art: string | null;
  verdict: Verdict;
  tags: string[];
  draft: boolean;
  synthetic: boolean;
}

export type SearchOutcome =
  | { kind: "empty" }
  | { kind: "results"; results: SearchResult[] }
  /** Nothing covered matches: the closest names instead, possibly none. */
  | { kind: "none"; closest: SearchResult[] };

const MAX_RESULTS = 8;
const MAX_CLOSEST = 3;

/** Lowercase, accents dropped ("jalapeño" finds "jalapeno"). */
const processTerm = (term: string) => term.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export function searchIndex(data: AppData): MiniSearch<Doc> {
  const index = new MiniSearch<Doc>({
    idField: "key",
    fields: ["name", "synonyms", "misspellings"],
    extractField: (doc, field) => {
      const value = doc[field as keyof Doc];
      return Array.isArray(value) ? value.join(" ") : (value ?? "");
    },
    processTerm,
    searchOptions: {
      prefix: true,
      // One typo in a short word, two in a long one; none under 4 letters, where every word would match.
      fuzzy: (term) => (term.length < 4 ? false : term.length < 8 ? 1 : 2),
      boost: { name: 3, synonyms: 2, misspellings: 1 },
      combineWith: "AND",
    },
  });
  index.addAll(
    data.items.flatMap((item): Doc[] => [
      {
        key: item.inputs.id,
        item: item.inputs.id,
        variety: null,
        name: item.name,
        synonyms: item.synonyms,
        misspellings: item.misspellings,
      },
      ...item.varieties.map((v) => ({
        key: `${item.inputs.id}/${v.id}`,
        item: item.inputs.id,
        variety: v.id,
        name: v.name,
        synonyms: [],
        misspellings: [],
      })),
    ]),
  );
  return index;
}

export function search(index: MiniSearch<Doc>, data: AppData, query: string, date: PlainDate): SearchOutcome {
  const q = query.trim();
  if (q === "") return { kind: "empty" };
  const toResults = (hits: { id: unknown }[], max: number) =>
    hits.slice(0, max).flatMap((h) => {
      const r = result(data, String(h.id), date);
      return r ? [r] : [];
    });
  const results = toResults(index.search(q), MAX_RESULTS);
  if (results.length > 0) return { kind: "results", results };
  // Closest: any word, and looser spelling.
  const closest = index.search(q, { combineWith: "OR", fuzzy: 0.4 });
  return { kind: "none", closest: toResults(closest, MAX_CLOSEST) };
}

function result(data: AppData, key: string, date: PlainDate): SearchResult | null {
  const [itemId, varietyId] = key.split("/");
  const item = data.items.find((i) => i.inputs.id === itemId);
  if (!item) return null;
  const variety = varietyId ? item.varieties.find((v) => v.id === varietyId) : undefined;
  const r = evaluate(item.inputs, { date, ...(variety ? { labelVariety: variety.id } : {}) }, data.env);
  const common = { key, item: item.inputs.id, draft: item.status === "draft", synthetic: item.synthetic };
  if (variety)
    return {
      ...common,
      label: `v:${variety.id}`,
      title: variety.name,
      subtitle: item.name,
      art: variety.art ?? item.art,
      verdict: r.verdict,
      tags: tags(item, r.markers),
    };
  return {
    ...common,
    label: null,
    title: item.name,
    subtitle: varietyLine(item, r, data),
    art: item.art,
    verdict: r.verdict,
    tags: tags(item, r.markers),
  };
}

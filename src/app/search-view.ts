// Search (product spec §5 "Search"): item names, synonyms, misspellings and variety names, matched from the first
// letter, with typos forgiven. Results carry their verdict, so a lookup often ends without a tap. Runs on the phone
// over the bundled data, so it works offline.
import MiniSearch, { type SearchResult as SearchHit } from "minisearch";
import type { AppData } from "../shared/app-data";
import { evaluate, type PlainDate, typicalOutlook, type Verdict } from "../shared/verdict";
import { alwaysGoodRow, varietyAlwaysGood } from "./always-good";
import { tags, varietyLine } from "./today-view";
import { varietyDestination } from "./variety-view";

interface Doc {
  key: string;
  item: string;
  /** Set on a variety's own entry. */
  variety: string | null;
  name: string;
  label?: string;
  family?: string;
  synonyms: string[];
  misspellings: string[];
}

export interface SearchResult {
  key: string;
  /** The item page this opens. */
  item: string;
  /** Where a tap goes: a guide variety's own page, else the item page (at the variety's label check). */
  to: string;
  /** "v:honeycrisp" on a variety: the item page opens with that variety picked in the label check. */
  label: string | null;
  title: string;
  /** The item a variety belongs to, or the item's in-store varieties. */
  subtitle: string | null;
  art: string | null;
  verdict: Verdict;
  tags: string[];
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

/** A named variety should lead its family, even when the family has the same words as synonyms. */
function namesVariety(hit: SearchHit): boolean {
  if (!hit.variety || typeof hit.name !== "string") return false;
  const hasFamily = Object.values(hit.match).some((fields) => fields.includes("family"));
  const names = hasFamily ? hit.name.replace(/\s*\(([^()]+)\)/g, " or $1").split(" or ") : [hit.name];
  const tokenize = MiniSearch.getDefault("tokenize");
  return names.some((name) => {
    const words: string[] = tokenize(name.trim()).filter(Boolean);
    return words.length > 0 && words.every((word) => hit.queryTerms.includes(processTerm(word)));
  });
}

export function searchIndex(data: AppData): MiniSearch<Doc> {
  const index = new MiniSearch<Doc>({
    idField: "key",
    fields: ["name", "synonyms", "misspellings", "label", "family"],
    storeFields: ["name", "variety"],
    extractField: (doc, field) => {
      const value = doc[field as keyof Doc];
      return Array.isArray(value) ? value.join(" ") : (value ?? "");
    },
    processTerm,
    searchOptions: {
      prefix: true,
      // One typo in a short word, two in a long one; none under 4 letters, where every word would match.
      fuzzy: (term) => (term.length < 4 ? false : term.length < 8 ? 1 : 2),
      boost: { name: 3, synonyms: 2, misspellings: 1, label: 1, family: 0.5 },
      // Parent words complete a variety query, but a search for the family alone still finds the family.
      filter: (hit) => Object.values(hit.match).some((fields) => fields.some((field) => field !== "family")),
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
        label: v.label,
        family: item.name,
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
  const hits = index
    .search(q)
    .map((hit) => ({ hit, named: namesVariety(hit) }))
    .sort((a, b) => Number(b.named) - Number(a.named))
    .map(({ hit }) => hit);
  const results = toResults(hits, MAX_RESULTS);
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
  const common = { key, item: item.inputs.id };
  if (variety)
    return {
      ...common,
      ...varietyDestination(item.inputs.id, variety.id, item.guide !== null),
      title: variety.name,
      subtitle: item.name,
      art: variety.art ?? item.art,
      verdict: r.verdict,
      tags: tags(item, r.markers, {
        alwaysGood:
          variety.alwaysGood === true &&
          varietyAlwaysGood(item, variety, typicalOutlook(item.inputs, data.env, date.year, variety.id)),
      }),
    };
  return {
    ...common,
    to: `/items/${item.inputs.id}`,
    label: null,
    title: item.name,
    subtitle: varietyLine(item, r, data),
    art: item.art,
    verdict: r.verdict,
    tags: tags(item, r.markers, {
      alwaysGood:
        (item.inputs.alwaysGood || item.varietiesCoverItem === true) &&
        alwaysGoodRow(item, data.env, date.year, typicalOutlook(item.inputs, data.env, date.year))
          ?.listing === "whole",
    }),
  };
}

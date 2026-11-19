// What the app bundles (engineering plan §1): each item's engine inputs plus the text its screens show.
// Built by `npm run data:build` into src/generated/app.json; raw evidence and USDA rows stay out of the bundle.
import type { ArtMap } from "./art";
import type { Category, Dataset, Guide, Item, Snapshot, Source } from "./data/schema";
import type { Env, ItemInputs } from "./verdict";
import { engineEnv, itemInputs } from "./verdict/inputs";

export type FilterGroup = Category["group"];

export interface AppVariety {
  id: string;
  name: string;
  label: string;
  bestUses: string[];
  /** How to find it in the store, or null where the name says enough. */
  cue: string | null;
  /** Asset id of the variety's own painting (src/shared/art.ts), or null: the placeholder shows. */
  art: string | null;
  /** Its value on each of its guide's 1–5 scales; a trait no source places it on is absent. */
  traits: Record<string, number>;
  /** How to tell when it's ripe, on guides with ripe cues (pears). */
  ripeCue: string | null;
  /** On guides with an overall rating (apples): the mean of the source's and the editorial 0–100 scores, and its
   * tier. */
  overall: { score: number; tier: OverallTier } | null;
}

export type OverallTier = "amazing" | "great" | "fine" | "bad";

/** The tier a 0–100 score falls in, by the guide's floors; below `fine` is bad. */
export function overallTier(
  score: number,
  floors: { amazing: number; great: number; fine: number },
): OverallTier {
  if (score >= floors.amazing) return "amazing";
  if (score >= floors.great) return "great";
  return score >= floors.fine ? "fine" : "bad";
}

/** A variety guide (product spec §5 "Variety guide"): its items and its anchored 1–5 scales. */
export interface AppGuide {
  id: string;
  name: string;
  items: string[];
  ripeCues: boolean;
  /** What the overall rating judges (e.g. eating raw) and whose scores it uses, or null where there is none. */
  overall: { basis: string; source: Pick<Source, "title" | "publisher" | "url"> } | null;
  traits: { id: string; name: string; anchors: Record<1 | 3 | 5, { text: string; varieties: string[] }> }[];
}

export interface AppItem {
  inputs: ItemInputs;
  name: string;
  /** Search matches these too (product spec §5 "Search"). */
  synonyms: string[];
  misspellings: string[];
  category: string;
  group: FilterGroup;
  purchaseRank: number;
  cardLine: string;
  pick: string[];
  avoid: string[];
  store: { text: string; temperature: Item["store"]["temperature"]; life: Item["store"]["life"] };
  ripen: string | null;
  prep: string;
  /** Type notes, shown with the pick cues where the type changes the advice. */
  types: { name: string; note: string | null }[];
  varieties: AppVariety[];
  /** The id of the variety guide covering it, or null. */
  guide: string | null;
  /** P16: what to look for when a selection makes the item Peak. */
  selections: { id: string; label: string; cue: string }[];
  /** Asset id of the item's thumbnail, or null: the placeholder shows (dev and preview only). */
  art: string | null;
  status: Item["status"];
  reviewedOn: string | null;
  synthetic: boolean;
}

/** A Browse category that holds at least one bundled item, in display order (product spec §4). */
export interface AppCategory {
  id: string;
  name: string;
  group: FilterGroup;
}

export interface AppData {
  env: Env;
  items: AppItem[];
  guides: AppGuide[];
  categories: AppCategory[];
  /** US state origins (`us-wa`) to names; countries are named with Intl.DisplayNames. */
  stateNames: Record<string, string>;
  /** The build's date (YYYY-MM-DD): prerendered pages show verdicts for it until the phone recomputes. */
  builtOn: string;
  about: About;
}

/** The Methods and Privacy pages (product spec §5 "Methods page", §10): their text, and what Methods lists. */
export interface About {
  methods: { html: string; draft: boolean };
  privacy: { html: string; draft: boolean };
  /** Every real source the bundled items cite, authoritative first. */
  sources: Pick<Source, "id" | "title" | "publisher" | "url" | "accessed" | "tier">[];
  /** The AI model panel's runs (product spec §8). */
  panel: { model: string; provider: string; date: string }[];
  /** The USDA supply snapshot, or null before one is derived. */
  snapshot: Snapshot | null;
}

export function appData(data: Dataset, builtOn: string, art: ArtMap, about: About): AppData {
  const groups = new Map(data.categories.map((c) => [c.id, c.group]));
  const guideFor = (itemId: string) => data.guides.find((g) => g.items.includes(itemId));
  const overallOf = (
    scores: { source: number; editorial: number } | undefined,
    overall: Guide["overall"],
  ) => {
    if (!scores || !overall) return null;
    const score = (scores.source + scores.editorial) / 2;
    return { score, tier: overallTier(score, overall.tiers) };
  };
  const sourceRef = (id: string) => {
    const s = data.sources.find((x) => x.id === id);
    return { title: s?.title ?? id, publisher: s?.publisher ?? id, url: s?.url ?? "" };
  };
  return {
    env: engineEnv(data),
    items: data.items.map((item) => ({
      inputs: itemInputs(item, data),
      name: item.name,
      synonyms: item.synonyms,
      misspellings: item.misspellings,
      category: item.category,
      group: groups.get(item.category) ?? "vegetables",
      purchaseRank: item.purchaseRank,
      cardLine: item.cardLine,
      pick: item.pick,
      avoid: item.avoid,
      store: { text: item.store.text, temperature: item.store.temperature, life: item.store.life },
      ripen: item.ripen?.text ?? null,
      prep: item.prep,
      types: item.types.map((t) => ({ name: t.name, note: t.note ?? null })),
      varieties: item.varieties.map((v) => ({
        id: v.id,
        name: v.name,
        label: v.label,
        bestUses: v.bestUses,
        cue: v.cue ?? null,
        art: art.varieties[`${item.id}/${v.id}`] ?? null,
        traits: v.traits,
        ripeCue: v.ripeCue ?? null,
        overall: overallOf(v.overallScore, guideFor(item.id)?.overall),
      })),
      guide: guideFor(item.id)?.id ?? null,
      selections: item.selections.map((s) => ({ id: s.id, label: s.label, cue: s.cue })),
      art: art.items[item.id] ?? null,
      status: item.status,
      reviewedOn: item.reviewedOn ?? null,
      synthetic: item.synthetic === true,
    })),
    guides: data.guides.map((g) => ({
      id: g.id,
      name: g.name,
      items: g.items,
      ripeCues: g.ripeCues,
      overall: g.overall ? { basis: g.overall.basis, source: sourceRef(g.overall.source) } : null,
      traits: g.traits.map((t) => ({ id: t.id, name: t.name, anchors: t.anchors })),
    })),
    categories: data.categories
      .filter((c) => data.items.some((i) => i.category === c.id))
      .map((c) => ({ id: c.id, name: c.name, group: c.group })),
    stateNames: Object.fromEntries(data.states.map((s) => [`us-${s.state.toLowerCase()}`, s.name])),
    builtOn,
    about,
  };
}

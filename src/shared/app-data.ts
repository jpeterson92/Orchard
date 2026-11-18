// What the app bundles (engineering plan §1): each item's engine inputs plus the text its screens show.
// Built by `npm run data:build` into src/generated/app.json; raw evidence and USDA rows stay out of the bundle.
import type { ArtMap } from "./art";
import type { Category, Dataset, Item } from "./data/schema";
import type { Env, ItemInputs } from "./verdict";
import { engineEnv, itemInputs } from "./verdict/inputs";

export type FilterGroup = Category["group"];

export interface AppVariety {
  id: string;
  name: string;
  label: string;
  bestUses: string[];
  /** Asset id of the variety's own painting (src/shared/art.ts), or null: the placeholder shows. */
  art: string | null;
}

export interface AppItem {
  inputs: ItemInputs;
  name: string;
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
  /** Asset id of the item's thumbnail, or null: the placeholder shows (dev and preview only). */
  art: string | null;
  status: Item["status"];
  reviewedOn: string | null;
  synthetic: boolean;
}

export interface AppData {
  env: Env;
  items: AppItem[];
  /** US state origins (`us-wa`) to names; countries are named with Intl.DisplayNames. */
  stateNames: Record<string, string>;
  /** The build's date (YYYY-MM-DD): prerendered pages show verdicts for it until the phone recomputes. */
  builtOn: string;
}

export function appData(data: Dataset, builtOn: string, art: ArtMap): AppData {
  const groups = new Map(data.categories.map((c) => [c.id, c.group]));
  return {
    env: engineEnv(data),
    items: data.items.map((item) => ({
      inputs: itemInputs(item, data),
      name: item.name,
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
        art: art.varieties[`${item.id}/${v.id}`] ?? null,
      })),
      art: art.items[item.id] ?? null,
      status: item.status,
      reviewedOn: item.reviewedOn ?? null,
      synthetic: item.synthetic === true,
    })),
    stateNames: Object.fromEntries(data.states.map((s) => [`us-${s.state.toLowerCase()}`, s.name])),
    builtOn,
  };
}

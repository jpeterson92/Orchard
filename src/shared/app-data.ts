// What the app bundles (engineering plan §1): each item's engine inputs plus the text its screens show.
// Built by `npm run data:build` into src/generated/app.json; raw evidence and USDA rows stay out of the bundle.
import type { Category, Dataset, Item } from "./data/schema";
import type { Env, ItemInputs } from "./verdict";
import { engineEnv, itemInputs } from "./verdict/inputs";

export type FilterGroup = Category["group"];

export interface AppVariety {
  id: string;
  name: string;
  label: string;
  bestUses: string[];
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
  varieties: AppVariety[];
  status: Item["status"];
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

export function appData(data: Dataset, builtOn: string): AppData {
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
      varieties: item.varieties.map((v) => ({
        id: v.id,
        name: v.name,
        label: v.label,
        bestUses: v.bestUses,
      })),
      status: item.status,
      synthetic: item.synthetic === true,
    })),
    stateNames: Object.fromEntries(data.states.map((s) => [`us-${s.state.toLowerCase()}`, s.name])),
    builtOn,
  };
}

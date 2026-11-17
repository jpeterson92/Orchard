// Builds the engine's inputs from the validated dataset (engineering plan §4.1 → §4.2).
import type { Dataset, Item } from "../data/schema";
import { WINDOW_COUNT, windowRange } from "../time";
import type { Env, ItemInputs, RatedSeries, Rating } from "./index";

const MONTHS = 12;

function series(windows: Item["origins"][number]["windows"]): RatedSeries {
  const ratings: (Rating | null)[] = Array(WINDOW_COUNT).fill(null);
  for (const w of windows) for (const i of windowRange(w.from, w.to)) ratings[i] = w.rating;
  return { windows: ratings };
}

export function itemInputs(item: Item, data: Dataset): ItemInputs {
  const typicalOrigins = Array.from({ length: MONTHS }, (_, m) =>
    data.typicalOrigins
      .filter((r) => r.item === item.id && r.month === m + 1)
      .sort((a, b) => a.rank - b.rank)
      .map((r) => r.origin),
  );
  const supply = Array.from(
    { length: MONTHS },
    (_, m) => data.supplyIndex.find((r) => r.item === item.id && r.month === m + 1)?.value ?? null,
  );
  return {
    id: item.id,
    evidenceBasis: item.evidenceBasis,
    alwaysGood: item.alwaysGood,
    origins: Object.fromEntries(item.origins.map((o) => [o.origin, series(o.windows)])),
    // Variety quality windows arrive with M2 slice 4; until then no item is rated by variety.
    varieties: [],
    typicalOrigins,
    supply,
    advisories: data.advisories
      .filter((a) => a.items.includes(item.id))
      .map(({ id, origins, from, to, effect, reviewedOn }) => ({
        id,
        origins,
        from,
        to,
        effect,
        reviewedOn,
      })),
  };
}

export const engineEnv = (data: Dataset): Env => ({
  rules: data.rules,
  snapshotTo: data.snapshot?.to ?? null,
});

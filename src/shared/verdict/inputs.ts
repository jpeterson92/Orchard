// Builds the engine's inputs from the validated dataset (engineering plan §4.1 → §4.2).
import type { Dataset, Item } from "../data/schema";
import { type Claim, type EvidenceSource, propose, type Target } from "../evidence";
import { WINDOW_COUNT, windowRange } from "../time";
import type { Env, ItemInputs, RatedSeries, RatedVariety, Rating } from "./index";

const MONTHS = 12;

/** Which months each variety is typically in stores comes from the variety calendar (M2 slice 6). Until then no
 * variety counts as in stores, so items rated by variety show Limited evidence rather than an invented presence. */
const NOT_YET_KNOWN: readonly boolean[] = Array(MONTHS).fill(false);

function series(
  windows: Item["origins"][number]["windows"],
  claims: readonly Claim[],
  sources: ReadonlyMap<string, EvidenceSource>,
  target: Target,
): RatedSeries {
  const ratings: (Rating | null)[] = Array(WINDOW_COUNT).fill(null);
  for (const w of windows) for (const i of windowRange(w.from, w.to)) ratings[i] = w.rating;
  const evidence = propose(claims, sources, target).windows.map((p) => p?.confidence ?? null);
  return { windows: ratings, evidence };
}

export function itemInputs(item: Item, data: Dataset): ItemInputs {
  const claims = data.evidence.find((e) => e.item === item.id)?.claims ?? [];
  const sources = new Map(data.sources.map((s) => [s.id, s]));
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
  const varieties = item.varieties.flatMap((v): RatedVariety[] =>
    v.windows
      ? [{ id: v.id, ...series(v.windows, claims, sources, { variety: v.id }), inStore: NOT_YET_KNOWN }]
      : [],
  );
  return {
    id: item.id,
    evidenceBasis: item.evidenceBasis,
    alwaysGood: item.alwaysGood,
    origins: Object.fromEntries(
      item.origins.map((o) => [o.origin, series(o.windows, claims, sources, { origin: o.origin })]),
    ),
    varieties,
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

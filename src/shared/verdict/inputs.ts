// Builds the engine's inputs from the validated dataset (engineering plan §4.1 → §4.2).
import type { Dataset, Item, TypicalOriginRow } from "../data/schema";
import { type Claim, type EvidenceSource, panelFor, propose, type Target, traitsFor } from "../evidence";
import { monthRange, WINDOW_COUNT, windowRange } from "../time";
import type { Env, ItemInputs, RatedSeries, RatedVariety, Rating, Selection } from "./index";

const MONTHS = 12;

/** P13: per month, whether the variety is typically in stores: a cited supermarket month, or its calendar names'
 * combined share of the item's market-days (capped at 1; a day quoting two of its names counts twice) reaching
 * rules.varietyInStoreShare. */
function inStore(item: Item, v: Item["varieties"][number], data: Dataset): boolean[] {
  const quotedAs = v.quotedAs ?? [];
  const cited = new Set(v.inStores.flatMap((r) => monthRange(r.from, r.to)));
  const share: number[] = Array(MONTHS).fill(0);
  for (const r of data.varietyCalendar)
    if (r.item === item.id && quotedAs.includes(r.variety))
      share[r.month - 1] = (share[r.month - 1] ?? 0) + r.share;
  return share.map((s, m) => cited.has(m + 1) || Math.min(1, s) >= data.rules.varietyInStoreShare);
}

/** P16: per month, whether a selection is common enough: cited supermarket months, or its origins together
 * holding rules.varietyInStoreShare of the month's reported volume. */
function selectionInStore(
  s: Item["selections"][number],
  typicalOrigins: readonly (readonly string[])[],
  typicalShares: readonly (readonly (number | null)[])[],
  share: number,
): boolean[] {
  const cited = new Set(s.inStores.flatMap((r) => monthRange(r.from, r.to)));
  return Array.from({ length: MONTHS }, (_, m) => {
    if (cited.has(m + 1)) return true;
    const volume = (typicalOrigins[m] ?? []).reduce(
      (sum, o, i) => sum + (s.origins.includes(o) ? (typicalShares[m]?.[i] ?? 0) : 0),
      0,
    );
    return volume >= share - 1e-9;
  });
}

function series(
  windows: Item["origins"][number]["windows"],
  claims: readonly Claim[],
  sources: ReadonlyMap<string, EvidenceSource>,
  target: Target,
  item: Item,
  data: Dataset,
): RatedSeries {
  const ratings: (Rating | null)[] = Array(WINDOW_COUNT).fill(null);
  for (const w of windows) for (const i of windowRange(w.from, w.to)) ratings[i] = w.rating;
  const panel = panelFor(data.panel, item.id, target);
  const evidence = propose(claims, sources, target, traitsFor(item, target), panel).windows.map(
    (p) => p?.confidence ?? null,
  );
  return { windows: ratings, evidence };
}

/** The item's typical origins: its editorial ones where it has them (USDA can't rank it), else `usda:derive`'s. */
export function typicalOriginRows(
  item: Item,
  data: Dataset,
): (Omit<TypicalOriginRow, "share"> & { share: number | null })[] {
  if (item.typicalOrigins.length === 0) return data.typicalOrigins.filter((r) => r.item === item.id);
  // Editorial typical origins carry no volume share.
  return item.typicalOrigins.flatMap((t) =>
    monthRange(t.from, t.to).flatMap((month) =>
      t.origins.map((o, i) => ({
        item: item.id,
        month,
        rank: i + 1,
        origin: o.origin,
        major: o.major,
        share: null,
      })),
    ),
  );
}

export function itemInputs(item: Item, data: Dataset): ItemInputs {
  const claims = data.evidence.find((e) => e.item === item.id)?.claims ?? [];
  const sources = new Map(data.sources.map((s) => [s.id, s]));
  const rows = typicalOriginRows(item, data);
  const byMonth = Array.from({ length: MONTHS }, (_, m) =>
    rows.filter((r) => r.month === m + 1).sort((a, b) => a.rank - b.rank),
  );
  const typicalOrigins = byMonth.map((rs) => rs.map((r) => r.origin));
  const typicalShares = byMonth.map((rs) => rs.map((r) => r.share));
  const minorOrigins = typicalOrigins.map((origins, m) =>
    origins.filter((o) => rows.some((r) => r.month === m + 1 && r.origin === o && !r.major)),
  );
  const supply: Record<string, (number | null)[]> = {};
  for (const r of data.supplyIndex) {
    if (r.item !== item.id) continue;
    supply[r.origin] ??= Array(MONTHS).fill(null);
    (supply[r.origin] as (number | null)[])[r.month - 1] = r.value;
  }
  const varieties = item.varieties.flatMap((v): RatedVariety[] =>
    v.windows
      ? [
          {
            id: v.id,
            ...series(v.windows, claims, sources, { variety: v.id }, item, data),
            inStore: inStore(item, v, data),
          },
        ]
      : [],
  );
  const selections = item.selections.map(
    (s): Selection => ({
      id: s.id,
      origins: s.origins,
      inStore: selectionInStore(s, typicalOrigins, typicalShares, data.rules.varietyInStoreShare),
    }),
  );
  return {
    id: item.id,
    evidenceBasis: item.evidenceBasis,
    alwaysGood: item.alwaysGood,
    peakWorthSeeking: item.peakWorthSeeking.value,
    origins: Object.fromEntries(
      item.origins.map((o) => [
        o.origin,
        series(o.windows, claims, sources, { origin: o.origin }, item, data),
      ]),
    ),
    varieties,
    selections,
    typicalOrigins,
    typicalShares,
    minorOrigins,
    originInStores: Object.fromEntries(
      item.origins
        .filter((o) => o.inStores.length > 0)
        .map((o) => {
          const cited = new Set(o.inStores.flatMap((r) => monthRange(r.from, r.to)));
          return [o.origin, Array.from({ length: MONTHS }, (_, m) => cited.has(m + 1))];
        }),
    ),
    supply,
  };
}

export const engineEnv = (data: Dataset): Env => ({
  rules: data.rules,
  snapshotTo: data.snapshot?.to ?? null,
});

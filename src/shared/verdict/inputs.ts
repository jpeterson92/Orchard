// Builds the engine's inputs from the validated dataset (engineering plan §4.1 → §4.2).
import type { Dataset, Item, TypicalOriginRow } from "../data/schema";
import { type Claim, type EvidenceSource, propose, type Target, traitsFor } from "../evidence";
import { monthRange, WINDOW_COUNT, windowRange } from "../time";
import type { Env, ItemInputs, RatedSeries, RatedVariety, Rating } from "./index";

const MONTHS = 12;

/** P13: per month, whether the variety is typically in stores: its calendar names' combined share of the item's
 * market-days (capped at 1; a day quoting two of its names counts twice) reaches rules.varietyInStoreShare. */
function inStore(item: Item, quotedAs: readonly string[], data: Dataset): boolean[] {
  const share: number[] = Array(MONTHS).fill(0);
  for (const r of data.varietyCalendar)
    if (r.item === item.id && quotedAs.includes(r.variety))
      share[r.month - 1] = (share[r.month - 1] ?? 0) + r.share;
  return share.map((s) => Math.min(1, s) >= data.rules.varietyInStoreShare);
}

function series(
  windows: Item["origins"][number]["windows"],
  claims: readonly Claim[],
  sources: ReadonlyMap<string, EvidenceSource>,
  target: Target,
  item: Item,
): RatedSeries {
  const ratings: (Rating | null)[] = Array(WINDOW_COUNT).fill(null);
  for (const w of windows) for (const i of windowRange(w.from, w.to)) ratings[i] = w.rating;
  const evidence = propose(claims, sources, target, traitsFor(item, target)).windows.map(
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
            ...series(v.windows, claims, sources, { variety: v.id }, item),
            inStore: inStore(item, v.quotedAs ?? [], data),
          },
        ]
      : [],
  );
  return {
    id: item.id,
    evidenceBasis: item.evidenceBasis,
    alwaysGood: item.alwaysGood,
    peakWorthSeeking: item.peakWorthSeeking.value,
    origins: Object.fromEntries(
      item.origins.map((o) => [o.origin, series(o.windows, claims, sources, { origin: o.origin }, item)]),
    ),
    varieties,
    typicalOrigins,
    typicalShares,
    minorOrigins,
    supply,
  };
}

export const engineEnv = (data: Dataset): Env => ({
  rules: data.rules,
  snapshotTo: data.snapshot?.to ?? null,
});

// USDA Market News (MARS) API client for pipeline scripts. Raw responses are cached in .cache/usda/.
// Needs USDA_MARS_API_KEY in .env.pipeline.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const API = "https://marsapi.ams.usda.gov/services/v1.2/reports";
export const CACHE = ".cache/usda";

process.loadEnvFile(".env.pipeline");
const key = process.env.USDA_MARS_API_KEY;
if (!key) throw new Error("USDA_MARS_API_KEY missing from .env.pipeline");
const auth = `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
mkdirSync(CACHE, { recursive: true });

export type RawRow = Record<string, unknown>;

const usdaDate = (iso: string) => `${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso.slice(0, 4)}`;
const day = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / 86_400_000;
const iso = (d: number) => new Date(d * 86_400_000).toISOString().slice(0, 10);

async function get(url: string): Promise<{ rows: RawRow[]; truncated: boolean }> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: auth },
        signal: AbortSignal.timeout(180_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as {
        results?: RawRow[];
        stats?: { totalRows: number; returnedRows: number };
      };
      const rows = body.results ?? [];
      return { rows, truncated: !!body.stats && body.stats.returnedRows < body.stats.totalRows };
    } catch (err) {
      if (attempt >= 3) throw new Error(`${url}: ${String(err)}`);
    }
  }
}

/**
 * Detail rows of one report for one commodity between two ISO dates (inclusive), cached per range.
 * A response cut off at the API's row cap is split in half and fetched again.
 */
export async function fetchDetails(
  report: number,
  commodity: string,
  from: string,
  to: string,
  section = "Report%20Details",
): Promise<RawRow[]> {
  const file = `${CACHE}/${report}-${commodity.replace(/\W+/g, "_")}-${from}-${to}.json`;
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
  // The API reads a comma as a list of values, so a name like "Lettuce, Romaine" must be quoted.
  const name = commodity.includes(",") ? `"${commodity}"` : commodity;
  const q = `commodity=${encodeURIComponent(name)};report_begin_date=${usdaDate(from)}:${usdaDate(to)}`;
  const { rows, truncated } = await get(`${API}/${report}/${section}?q=${q}`);
  if (truncated) {
    const mid = Math.floor((day(from) + day(to)) / 2);
    if (mid <= day(from)) throw new Error(`${report} ${commodity}: one day exceeds the row cap`);
    return [
      ...(await fetchDetails(report, commodity, from, iso(mid), section)),
      ...(await fetchDetails(report, commodity, iso(mid + 1), to, section)),
    ];
  }
  writeFileSync(file, JSON.stringify(rows));
  return rows;
}

/** Runs `fn` over `items` with at most `size` in flight, keeping order. */
export async function pool<T, R>(items: T[], size: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i] as T);
      }
    }),
  );
  return out;
}

// The offline line on Today (product spec §6). The service worker saves the offline copy by itself after the first
// visit; the line appears only when the phone is offline and the copy is stale, asking for a connection.
import { useEffect, useState } from "react";
import type { AppData } from "../shared/app-data";

/** Offline and older than this many days, the copy asks for a connection. */
export const STALE_AFTER_DAYS = 7;

export type Readiness =
  | { state: "checking" }
  | { state: "unavailable" }
  | { state: "preparing"; saved: number; total: number }
  | { state: "ready"; total: number }
  | { state: "stale" };

const DAY_MS = 86_400_000;
const utc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const fmt = (ms: number, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "UTC" }).format(ms);

export function isStale(builtOn: string, todayIso: string, online: boolean): boolean {
  return !online && utc(todayIso) - utc(builtOn) > STALE_AFTER_DAYS * DAY_MS;
}

export function readinessText(r: Readiness, data: Pick<AppData, "builtOn">): string | null {
  return r.state === "stale"
    ? `Offline copy is from ${fmt(utc(data.builtOn), { month: "short", day: "numeric" })}; reconnect to refresh`
    : null;
}

/** Item ids whose prerendered page is in the service worker's precache (scripts/sw-build.ts). */
async function savedItems(ids: Set<string>): Promise<number> {
  const saved = new Set<string>();
  for (const name of await caches.keys()) {
    if (!name.startsWith("workbox-precache")) continue;
    for (const req of await (await caches.open(name)).keys()) {
      const id = /^\/items\/([^/]+)$/.exec(new URL(req.url).pathname)?.[1];
      if (id && ids.has(id)) saved.add(id);
    }
  }
  return saved.size;
}

/** Watches the offline copy: every second until it's ready, then on connection changes. */
export function useReadiness(data: AppData, todayIso: string): Readiness {
  const [r, setR] = useState<Readiness>({ state: "checking" });
  useEffect(() => {
    if (import.meta.env.DEV) return; // No service worker in dev, so no line.
    if (!("serviceWorker" in navigator) || !("caches" in window)) {
      setR({ state: "unavailable" });
      return;
    }
    const ids = new Set(data.items.map((i) => i.inputs.id));
    let timer: ReturnType<typeof setTimeout> | undefined;
    let done = false;
    const check = async () => {
      clearTimeout(timer);
      const [reg, saved] = await Promise.all([navigator.serviceWorker.getRegistration(), savedItems(ids)]);
      if (done) return;
      if (reg?.active && saved >= ids.size)
        setR(
          isStale(data.builtOn, todayIso, navigator.onLine)
            ? { state: "stale" }
            : { state: "ready", total: ids.size },
        );
      else {
        setR({ state: "preparing", saved, total: ids.size });
        timer = setTimeout(check, 1000);
      }
    };
    void check();
    window.addEventListener("online", check);
    window.addEventListener("offline", check);
    return () => {
      done = true;
      clearTimeout(timer);
      window.removeEventListener("online", check);
      window.removeEventListener("offline", check);
    };
  }, [data, todayIso]);
  return r;
}

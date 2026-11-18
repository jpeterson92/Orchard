// The one date every screen follows (product spec §4, §5 "Date"). Today by default: the build's date while
// prerendered, then the device's, recomputed at midnight and whenever the app comes back to the foreground. A
// planning date shows that date's typical outlook; it lasts for this tab's session, so a fresh launch opens on today.
// A link shared for a date carries it as `?date=`: opening one adopts that date as the planning date, and the banner
// says it came from the link. Plain links carry no date, so they follow the recipient's today.
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "react-router";
import type { AppData } from "../shared/app-data";

export type Mode = "today" | "typical";

export interface AppDate {
  /** The date the screens show (YYYY-MM-DD): the planning date, or today. */
  iso: string;
  /** The device's today. */
  today: string;
  /** True for a planning date: verdicts are the typical outlook and a banner says so. */
  planning: boolean;
  /** True when the planning date came from a link shared for that date (`?date=`). */
  pinned: boolean;
  mode: Mode;
}

const PLAN_KEY = "orchard.planDate";
export const DATE_PARAM = "date";

/** A real calendar date written YYYY-MM-DD, or null. */
export function parseIsoDate(value: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value) ? value : null;
}

export const localIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Today's date as YYYY-MM-DD: the build date while prerendered, the device's after hydrating. */
export function useToday(data: AppData): string {
  const [iso, setIso] = useState(data.builtOn);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      clearTimeout(timer);
      const now = new Date();
      setIso(localIso(now));
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(update, midnight.getTime() - now.getTime() + 1000);
    };
    const onVisible = () => document.visibilityState === "visible" && update();
    update();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return iso;
}

// The planning date, shared by every screen and kept in sessionStorage so a reload keeps it.
const listeners = new Set<() => void>();
let plan: string | null | undefined;
const readPlan = (): string | null => {
  if (plan === undefined) {
    try {
      plan = sessionStorage.getItem(PLAN_KEY);
    } catch {
      plan = null;
    }
  }
  return plan;
};

/** Sets the planning date (YYYY-MM-DD), or returns to today with null. */
export function setPlanDate(iso: string | null) {
  plan = iso;
  try {
    if (iso) sessionStorage.setItem(PLAN_KEY, iso);
    else sessionStorage.removeItem(PLAN_KEY);
  } catch {
    // Storage blocked: the date still holds for this page.
  }
  for (const fn of listeners) fn();
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/**
 * A planning date counts only while it is after today; once the day arrives, the screens are on today again. It is
 * pinned while the page's link names that same date.
 */
export function appDate(today: string, planIso: string | null, linkIso: string | null = null): AppDate {
  const planning = planIso !== null && planIso > today;
  const iso = planning ? planIso : today;
  return { iso, today, planning, pinned: planning && linkIso === iso, mode: planning ? "typical" : "today" };
}

export function useAppDate(data: AppData): AppDate {
  const today = useToday(data);
  const planIso = useSyncExternalStore(subscribe, readPlan, () => null);
  const [params] = useSearchParams();
  const linkIso = parseIsoDate(params.get(DATE_PARAM));
  // Adopted after hydrating, so the prerendered markup (which has no query) still matches the first render.
  useEffect(() => {
    if (linkIso) setPlanDate(linkIso);
  }, [linkIso]);
  return appDate(today, planIso, linkIso);
}

/** Choosing a date (or today, with null) also drops a shared link's date, keeping the page and its scroll. */
export function useChooseDate(): (iso: string | null) => void {
  const [params, setParams] = useSearchParams();
  return useCallback(
    (iso) => {
      setPlanDate(iso);
      if (params.has(DATE_PARAM)) {
        const next = new URLSearchParams(params);
        next.delete(DATE_PARAM);
        setParams(next, { replace: true, preventScrollReset: true });
      }
    },
    [params, setParams],
  );
}

/** The link that shares a page for a date: the same page, with the date pinned. */
export const sharedLink = (origin: string, pathname: string, iso: string) =>
  `${origin}${pathname}?${DATE_PARAM}=${iso}`;

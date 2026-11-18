// The one date every screen follows (product spec §4, §5 "Date"). Today by default: the build's date while
// prerendered, then the device's, recomputed at midnight and whenever the app comes back to the foreground. A
// planning date shows that date's typical outlook; it lasts for this tab's session, so a fresh launch opens on today.
import { useEffect, useState, useSyncExternalStore } from "react";
import type { AppData } from "../shared/app-data";

export type Mode = "today" | "typical";

export interface AppDate {
  /** The date the screens show (YYYY-MM-DD): the planning date, or today. */
  iso: string;
  /** The device's today. */
  today: string;
  /** True for a planning date: verdicts are the typical outlook and a banner says so. */
  planning: boolean;
  mode: Mode;
}

const PLAN_KEY = "orchard.planDate";

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

/** A planning date counts only while it is after today; once the day arrives, the screens are on today again. */
export function appDate(today: string, planIso: string | null): AppDate {
  const planning = planIso !== null && planIso > today;
  return { iso: planning ? planIso : today, today, planning, mode: planning ? "typical" : "today" };
}

export function useAppDate(data: AppData): AppDate {
  const today = useToday(data);
  const planIso = useSyncExternalStore(subscribe, readPlan, () => null);
  return appDate(today, planIso);
}

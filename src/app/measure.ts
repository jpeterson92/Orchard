// Real-user measurement on the phone (product spec §2, §10; engineering plan §5 M8). Each page load sends its final
// LCP, INP, CLS and time to first verdict once, in one beacon, when the page is first hidden. The beacon carries only
// metric names and values: no page, item, search text, identifier or cookie. Production builds only.
import { useEffect } from "react";
import { onCLS, onFCP, onINP, onLCP } from "web-vitals";
import type { Metric } from "../shared/measure";
import { windowIndex } from "../shared/time";
import { localIso } from "./date";

const queue = new Map<Metric, number>();
const sent = new Set<Metric>();
let started = false;
let prerendered = false;
let landing = "";
/** When the page was first hidden: a verdict shown after that isn't counted (web-vitals does the same). */
let hiddenAt = Number.POSITIVE_INFINITY;
let verdictDone = false;

function add(metric: Metric, value: number) {
  // A page restored from the back-forward cache reports again; the first load's value is the one counted.
  if (!sent.has(metric) && !queue.has(metric)) queue.set(metric, value);
}

function flush() {
  if (queue.size === 0) return;
  const body = JSON.stringify({ m: [...queue].map(([metric, value]) => ({ metric, value })) });
  for (const metric of queue.keys()) sent.add(metric);
  queue.clear();
  if (!navigator.sendBeacon?.("/api/measure", body))
    void fetch("/api/measure", { method: "POST", body, keepalive: true }).catch(() => {});
}

/** Starts measuring this page load. `fromPrerender`: the page arrived as prerendered markup that hydrates. */
export function startMeasuring(fromPrerender: boolean) {
  if (started) return;
  started = true;
  prerendered = fromPrerender;
  landing = location.pathname;
  if (document.visibilityState === "hidden") hiddenAt = 0;
  onLCP((m) => add("lcp", m.value));
  onINP((m) => add("inp", m.value));
  onCLS((m) => add("cls", m.value));
  addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "hidden") return;
    hiddenAt = Math.min(hiddenAt, performance.now());
    flush();
  });
}

const sameWindow = (a: string, b: string) =>
  windowIndex(Number(a.slice(5, 7)), Number(a.slice(8, 10))) ===
  windowIndex(Number(b.slice(5, 7)), Number(b.slice(8, 10)));

/**
 * Time to first verdict, for the page the visit lands on (Today or an item page; a later screen isn't counted).
 * When the prerendered markup already shows the verdicts for the phone's date (the build date falls in the same
 * half-month), they were on screen at the first contentful paint. Otherwise they appear at the first paint after the app renders the phone's date, taken as
 * the frame after that render commits. A page hidden before then isn't counted.
 *
 * `builtOn` is the build date; `today` is the date the screen currently shows verdicts for; `shown` is false on a
 * page with no verdict (an item we don't cover).
 */
export function useVerdictVisible(builtOn: string, today: string, shown = true) {
  useEffect(() => {
    if (!started || verdictDone) return;
    if (!shown || location.pathname !== landing) {
      verdictDone = true;
      return;
    }
    const device = localIso(new Date());
    if (prerendered && sameWindow(builtOn, device)) {
      verdictDone = true;
      onFCP((m) => add("verdict", m.value));
      return;
    }
    if (today !== device) return; // still the build date's verdicts: wait for the phone's
    verdictDone = true;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const now = performance.now();
        if (now < hiddenAt) add("verdict", now);
      }),
    );
  }, [builtOn, today, shown]);
}

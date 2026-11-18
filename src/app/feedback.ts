// In-store feedback (product spec §5 "Item page"): one tap of "At your store today:", sent to POST /api/feedback.
// A tap made without signal waits on the phone and goes out when the connection returns. Each item takes one answer a
// day, remembered on the phone so the page shows it again.
import type { Verdict } from "../shared/verdict";

export const OUTCOMES = [
  { value: "looked-good", text: "Looked good" },
  { value: "looked-poor", text: "Looked poor" },
  { value: "not-in-stock", text: "Not in stock" },
  { value: "too-pricey", text: "Too pricey" },
] as const;

export type Outcome = (typeof OUTCOMES)[number]["value"];

export interface FeedbackTap {
  appVersion: string;
  item: string;
  window: number;
  verdict: Verdict;
  outcome: Outcome;
  labelOrigin?: string;
  labelVariety?: string;
}

export interface Deps {
  fetch: typeof fetch;
  storage: Pick<Storage, "getItem" | "setItem"> | null;
}

const QUEUE_KEY = "orchard.feedback.queue";
const GIVEN_KEY = "orchard.feedback.given";

const browserDeps = (): Deps => {
  let storage: Storage | null = null;
  try {
    storage = window.localStorage;
  } catch {
    // Storage blocked (private mode): taps still send, they just can't wait offline.
  }
  return { fetch: (...args) => fetch(...args), storage };
};

function read<T>(storage: Deps["storage"], key: string, empty: T): T {
  try {
    const raw = storage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : empty;
  } catch {
    return empty;
  }
}

function write(storage: Deps["storage"], key: string, value: unknown) {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    // Full or blocked storage loses only the offline wait.
  }
}

/** The label pick ("o:mx" or "v:honeycrisp") as the tap's fields. */
export function labelFields(choice: string): Pick<FeedbackTap, "labelOrigin" | "labelVariety"> {
  if (choice.startsWith("o:")) return { labelOrigin: choice.slice(2) };
  if (choice.startsWith("v:")) return { labelVariety: choice.slice(2) };
  return {};
}

/** Today's answer for this item, if the shopper gave one. */
export function givenToday(item: string, today: string, deps: Deps = browserDeps()): Outcome | null {
  const given = read<Record<string, { on: string; outcome: Outcome }>>(deps.storage, GIVEN_KEY, {});
  const entry = given[item];
  return entry?.on === today ? entry.outcome : null;
}

let inFlight: Promise<void> | null = null;

/** Sends every waiting tap, oldest first; stops at the first network failure and keeps the rest for later. */
export function flushFeedback(deps: Deps = browserDeps()): Promise<void> {
  if (inFlight) return inFlight;
  // Cleared in .finally, which always runs after this assignment, even when the queue is empty.
  inFlight = drain(deps).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function drain(deps: Deps): Promise<void> {
  // Re-read each time: a tap made while this runs is appended to the stored queue and sent in turn.
  for (;;) {
    const tap = read<FeedbackTap[]>(deps.storage, QUEUE_KEY, [])[0];
    if (!tap) return;
    let res: Response;
    try {
      res = await deps.fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(tap),
      });
    } catch {
      return; // Offline: try again when the connection returns.
    }
    if (res.status >= 500) return;
    // Sent, or refused for good (invalid, too large, rate-limited): either way it leaves the queue.
    write(deps.storage, QUEUE_KEY, read<FeedbackTap[]>(deps.storage, QUEUE_KEY, []).slice(1));
  }
}

/** Records the answer on the phone at once, then sends it (or leaves it waiting). */
export function sendFeedback(tap: FeedbackTap, today: string, deps: Deps = browserDeps()): Promise<void> {
  const given = read<Record<string, { on: string; outcome: Outcome }>>(deps.storage, GIVEN_KEY, {});
  // Only today's answers matter; older ones are dropped as new ones are written.
  const kept = Object.fromEntries(Object.entries(given).filter(([, g]) => g.on === today));
  write(deps.storage, GIVEN_KEY, { ...kept, [tap.item]: { on: today, outcome: tap.outcome } });
  write(deps.storage, QUEUE_KEY, [...read<FeedbackTap[]>(deps.storage, QUEUE_KEY, []), tap]);
  if (!deps.storage) {
    // Nowhere to queue: one attempt.
    return deps
      .fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(tap),
      })
      .then(
        () => undefined,
        () => undefined,
      );
  }
  return flushFeedback(deps);
}

// Feedback from the shopper (product spec §2 "In-store feedback keeps outcomes apart", §5 "Item page"):
// - "At your store today:" one tap, sent to POST /api/feedback. Each item takes one answer a day, remembered on the
//   phone so the page shows it again.
// - "Bought it": kept on the phone only. On a later day it asks "How was it?", sent to POST /api/taste with what the
//   page showed when the shopper bought it. Unanswered questions lapse after TASTE_DAYS.
// Anything sent without signal waits on the phone and goes out when the connection returns.
import type { Verdict } from "../shared/verdict";

export const OUTCOMES = [
  { value: "looked-good", text: "Looked good" },
  { value: "looked-poor", text: "Looked poor" },
  { value: "not-in-stock", text: "Not in stock" },
  { value: "too-pricey", text: "Too pricey" },
] as const;

export const TASTES = [
  { value: "great", text: "Great" },
  { value: "ok", text: "OK" },
  { value: "disappointing", text: "Disappointing" },
] as const;

/** Days a "Bought it" waits for its taste answer before it lapses. */
export const TASTE_DAYS = 14;

export type Outcome = (typeof OUTCOMES)[number]["value"];
export type Taste = (typeof TASTES)[number]["value"];

/** What the item page showed: the fields every answer carries. */
export interface Shown {
  appVersion: string;
  item: string;
  window: number;
  verdict: Verdict;
  labelOrigin?: string;
  labelVariety?: string;
}

export interface FeedbackTap extends Shown {
  outcome: Outcome;
}

export interface TasteAnswer extends Shown {
  taste: Taste;
}

/** An item marked "Bought it" on `on` (YYYY-MM-DD), waiting for its taste answer. */
export interface Purchase extends Shown {
  on: string;
}

type Queued = { to: "/api/feedback"; body: FeedbackTap } | { to: "/api/taste"; body: TasteAnswer };

export interface Deps {
  fetch: typeof fetch;
  storage: Pick<Storage, "getItem" | "setItem"> | null;
}

const QUEUE_KEY = "orchard.feedback.queue";
const GIVEN_KEY = "orchard.feedback.given";
const BOUGHT_KEY = "orchard.bought";

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

/** The label pick ("o:mx" or "v:honeycrisp") as the answer's fields. */
export function labelFields(choice: string): Pick<Shown, "labelOrigin" | "labelVariety"> {
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

/** Sends everything waiting, oldest first; stops at the first network failure and keeps the rest for later. */
export function flushFeedback(deps: Deps = browserDeps()): Promise<void> {
  if (inFlight) return inFlight;
  // Cleared in .finally, which always runs after this assignment, even when the queue is empty.
  inFlight = drain(deps).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

const post = (deps: Deps, q: Queued) =>
  deps.fetch(q.to, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(q.body),
  });

async function drain(deps: Deps): Promise<void> {
  // Re-read each time: an answer given while this runs is appended to the stored queue and sent in turn.
  for (;;) {
    const next = read<Queued[]>(deps.storage, QUEUE_KEY, [])[0];
    if (!next) return;
    let res: Response;
    try {
      res = await post(deps, next);
    } catch {
      return; // Offline: try again when the connection returns.
    }
    if (res.status >= 500) return;
    // Sent, or refused for good (invalid, too large, rate-limited): either way it leaves the queue.
    write(deps.storage, QUEUE_KEY, read<Queued[]>(deps.storage, QUEUE_KEY, []).slice(1));
  }
}

function enqueue(q: Queued, deps: Deps): Promise<void> {
  if (!deps.storage) {
    // Nowhere to queue: one attempt.
    return post(deps, q).then(
      () => undefined,
      () => undefined,
    );
  }
  write(deps.storage, QUEUE_KEY, [...read<Queued[]>(deps.storage, QUEUE_KEY, []), q]);
  return flushFeedback(deps);
}

/** Records the answer on the phone at once, then sends it (or leaves it waiting). */
export function sendFeedback(tap: FeedbackTap, today: string, deps: Deps = browserDeps()): Promise<void> {
  const given = read<Record<string, { on: string; outcome: Outcome }>>(deps.storage, GIVEN_KEY, {});
  // Only today's answers matter; older ones are dropped as new ones are written.
  const kept = Object.fromEntries(Object.entries(given).filter(([, g]) => g.on === today));
  write(deps.storage, GIVEN_KEY, { ...kept, [tap.item]: { on: today, outcome: tap.outcome } });
  return enqueue({ to: "/api/feedback", body: tap }, deps);
}

const daysBetween = (from: string, to: string) => (Date.parse(to) - Date.parse(from)) / 86_400_000;

const purchases = (deps: Deps) => read<Record<string, Purchase>>(deps.storage, BOUGHT_KEY, {});

/** True when the shopper marked this item "Bought it" today. */
export function boughtToday(item: string, today: string, deps: Deps = browserDeps()): boolean {
  return purchases(deps)[item]?.on === today;
}

/**
 * Marks or unmarks "Bought it" for today. Marking again (say, after picking the label) replaces the record, and an
 * item bought again before its taste answer asks about the latest purchase.
 */
export function setBought(shown: Shown, today: string, bought: boolean, deps: Deps = browserDeps()) {
  const { [shown.item]: _, ...rest } = purchases(deps);
  write(deps.storage, BOUGHT_KEY, bought ? { ...rest, [shown.item]: { ...shown, on: today } } : rest);
}

/** Purchases from earlier days still waiting for "How was it?", oldest first. Lapsed ones are forgotten. */
export function tasteDue(today: string, deps: Deps = browserDeps()): Purchase[] {
  const all = Object.values(purchases(deps));
  const live = all.filter((p) => daysBetween(p.on, today) <= TASTE_DAYS);
  if (live.length < all.length)
    write(deps.storage, BOUGHT_KEY, Object.fromEntries(live.map((p) => [p.item, p])));
  return live
    .filter((p) => p.on < today)
    .sort((a, b) => a.on.localeCompare(b.on) || a.item.localeCompare(b.item));
}

/** Answers "How was it?" for a purchase (sent, or left waiting) and forgets the purchase. */
export function sendTaste(purchase: Purchase, taste: Taste, deps: Deps = browserDeps()): Promise<void> {
  dismissTaste(purchase.item, deps);
  const { on: _, ...shown } = purchase;
  return enqueue({ to: "/api/taste", body: { ...shown, taste } }, deps);
}

/** Forgets a purchase without answering. */
export function dismissTaste(item: string, deps: Deps = browserDeps()) {
  const { [item]: _, ...rest } = purchases(deps);
  write(deps.storage, BOUGHT_KEY, rest);
}

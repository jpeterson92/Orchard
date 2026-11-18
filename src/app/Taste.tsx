// The next-visit taste question (product spec §2 "Purchase met expectations", §5 "Item page"): for an item marked
// "Bought it" on an earlier day, "How was it?" Great · OK · Disappointing, optional, one purchase at a time. Shown on
// Today and on that item's page.
import { useEffect, useState } from "react";
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import { useAppDate } from "./date";
import { dismissTaste, type Purchase, sendTaste, TASTES, type Taste, tasteDue } from "./feedback";
import { originName, plainDate } from "./today-view";

const data = appJson as unknown as AppData;

const shortDate = (iso: string) => {
  const { year, month, day } = plainDate(iso);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
};

/** "Apples · Honeycrisp · bought Nov 18", or null for an item this build no longer covers. */
function purchaseLine(p: Purchase): string | null {
  const item = data.items.find((i) => i.inputs.id === p.item);
  if (!item) return null;
  const label = p.labelVariety
    ? item.varieties.find((v) => v.id === p.labelVariety)?.name
    : p.labelOrigin && originName(p.labelOrigin, data);
  return [item.name, label, `bought ${shortDate(p.on)}`].filter(Boolean).join(" · ");
}

/** The oldest waiting question, or only `item`'s. Renders nothing when none is due. */
export function TasteQuestion({ item, className = "" }: { item?: string; className?: string }) {
  const { today } = useAppDate(data);
  const [due, setDue] = useState<Purchase[]>([]);
  const [thanked, setThanked] = useState(false);
  // Read after hydration: the prerendered page never shows a question.
  useEffect(() => {
    const waiting = tasteDue(today).filter((p) => !item || p.item === item);
    // An item this build no longer covers can't be asked about.
    for (const p of waiting) if (!purchaseLine(p)) dismissTaste(p.item);
    setDue(waiting.filter((p) => purchaseLine(p)));
  }, [today, item]);

  const current = due[0];
  const done = (answer: Taste | null) => {
    if (!current) return;
    if (answer) void sendTaste(current, answer);
    else dismissTaste(current.item);
    setThanked(answer !== null);
    setDue(due.slice(1));
  };

  return (
    // Announced when it changes, so a screen-reader user hears the next question or the thanks.
    <div aria-live="polite" className={className}>
      {current ? (
        <section className="rounded-lg border border-rule bg-surface p-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-editorial text-xl font-bold">How was it?</h2>
            <button
              type="button"
              onClick={() => done(null)}
              className="min-h-11 shrink-0 text-sm text-ink-secondary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Don't ask
            </button>
          </div>
          <p className="text-ink-secondary">{purchaseLine(current)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TASTES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => done(t.value)}
                className="min-h-11 flex-1 rounded-full border border-rule bg-surface px-4 font-medium text-ink hover:border-olive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:flex-none"
              >
                {t.text}
              </button>
            ))}
          </div>
        </section>
      ) : (
        thanked && <p className="text-ink-secondary">Thanks for telling us.</p>
      )}
    </div>
  );
}

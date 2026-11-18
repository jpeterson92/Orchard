// Today (product spec §5, design system §5–6, reference 00-today-anchor.png).
import { useEffect, useState } from "react";
import appJson from "../generated/app.json";
import type { AppData, FilterGroup } from "../shared/app-data";
import type { Verdict } from "../shared/verdict";
import { LeafMark, VerdictIcon } from "./icons";
import { type Card, plainDate, todayView } from "./today-view";

const data = appJson as unknown as AppData;

const VERDICT_WORD: Record<Verdict, string> = {
  peak: "Peak",
  good: "Good",
  skip: "Skip for now",
  limited: "Limited evidence",
};

const FILTERS: { id: FilterGroup | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fruit", label: "Fruit" },
  { id: "vegetables", label: "Vegetables" },
  { id: "herbs-mushrooms", label: "Herbs & mushrooms" },
];

const localIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const chipDate = (iso: string) => {
  const { year, month, day } = plainDate(iso);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(Date.UTC(year, month - 1, day)))
    .replace(",", "");
};

export function Today() {
  // Prerendered with the build date; the phone recomputes for its own date after hydrating.
  const [iso, setIso] = useState(data.builtOn);
  useEffect(() => setIso(localIso(new Date())), []);
  const [filter, setFilter] = useState<FilterGroup | "all">("all");
  const view = todayView(data, plainDate(iso));
  const good = view.good.filter((c) => filter === "all" || c.group === filter);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 sm:px-6">
      <header className="flex items-center justify-between gap-4 border-b border-olive/60 py-3">
        <div className="flex items-center gap-2">
          <LeafMark />
          <span className="font-editorial text-2xl font-bold">Orchard</span>
        </div>
        <span className="rounded-full border border-olive px-3 py-1 text-sm font-medium text-olive">
          <time dateTime={iso}>{chipDate(iso)}</time>
        </span>
      </header>
      <main>
        <h1 className="mt-6 font-editorial text-[2rem] leading-tight font-bold">Good things today</h1>

        {view.best.length > 0 && (
          <Section title="Best right now">
            <Rows cards={view.best} />
          </Section>
        )}

        {view.good.length > 0 && (
          <Section title="Good buys">
            <fieldset className="mt-3 flex flex-wrap gap-2">
              <legend className="sr-only">Show</legend>
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={`min-h-11 rounded-full border px-4 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    filter === f.id ? "border-accent bg-accent text-white" : "border-olive text-ink"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </fieldset>
            {good.length > 0 ? (
              <Rows cards={good} />
            ) : (
              <p className="py-6 text-ink-secondary">No good buys in this group today.</p>
            )}
          </Section>
        )}

        {view.skip.length > 0 && <Collapsed title="Skip for now" cards={view.skip} />}
        {view.limited.length > 0 && <Collapsed title="Limited evidence" cards={view.limited} />}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-4 font-editorial text-2xl font-bold">
        {title}
        <span aria-hidden className="h-px flex-1 bg-olive/60" />
      </h2>
      {children}
    </section>
  );
}

function Collapsed({ title, cards }: { title: string; cards: Card[] }) {
  return (
    <details className="group mt-8">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-4 font-editorial text-2xl font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        {title}
        <span className="font-sans text-base font-normal text-ink-secondary">({cards.length})</span>
        <span aria-hidden className="h-px flex-1 bg-olive/60" />
        <span aria-hidden className="text-olive transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <Rows cards={cards} />
    </details>
  );
}

function Rows({ cards }: { cards: Card[] }) {
  return (
    <ul className="divide-y divide-rule">
      {cards.map((c) => (
        <Row key={c.id} card={c} />
      ))}
    </ul>
  );
}

function Row({ card }: { card: Card }) {
  return (
    <li className="flex gap-4 py-5">
      {/* Art slot: a mostly transparent placeholder until approved art exists (design system §6). */}
      <div aria-hidden className="size-24 shrink-0 rounded-full bg-surface/70 sm:size-28" />
      <div className="min-w-0 flex-1">
        <h3 className="font-editorial text-2xl leading-tight font-bold">{card.name}</h3>
        {card.varietyLine && <p className="font-editorial text-lg text-ink-secondary">{card.varietyLine}</p>}
        <p className="mt-1 flex items-center gap-1.5 font-editorial text-lg font-bold text-olive italic">
          <VerdictIcon verdict={card.verdict} />
          {VERDICT_WORD[card.verdict]}
        </p>
        {card.tags.length > 0 && <p className="text-sm font-medium text-olive">{card.tags.join(" · ")}</p>}
        <p className="mt-1">{card.reason}</p>
        {card.origin && <p className="font-editorial text-ink-secondary italic">{card.origin}</p>}
        {card.draft && (
          <p className="mt-1 text-sm text-ink-secondary">
            <span className="rounded border border-rule px-1.5 py-0.5">Draft</span>
          </p>
        )}
      </div>
    </li>
  );
}

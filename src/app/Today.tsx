// Today (product spec §5, design system §5–6, reference 00-today-anchor.png).
import { useId, useState } from "react";
import { Link } from "react-router";
import appJson from "../generated/app.json";
import type { AppData, FilterGroup } from "../shared/app-data";
import { useToday } from "./date";
import { VerdictIcon } from "./icons";
import { Masthead } from "./Masthead";
import { type Card, plainDate, todayView, VERDICT_WORD } from "./today-view";

const data = appJson as unknown as AppData;

const FILTERS: { id: FilterGroup | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fruit", label: "Fruit" },
  { id: "vegetables", label: "Vegetables" },
  { id: "herbs-mushrooms", label: "Herbs & mushrooms" },
];

export function Today() {
  const iso = useToday(data);
  const [filter, setFilter] = useState<FilterGroup | "all">("all");
  const view = todayView(data, plainDate(iso));
  const good = view.good.filter((c) => filter === "all" || c.group === filter);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 sm:px-6">
      <Masthead iso={iso} />
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
  const [open, setOpen] = useState(false);
  const panel = useId();
  return (
    <li className="py-5">
      {/* The whole collapsed card is the expand button; the Details link sits outside it (design system §6). */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panel}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer gap-4 rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        {/* Art slot: a mostly transparent placeholder until approved art exists (design system §6). */}
        <span aria-hidden className="size-24 shrink-0 rounded-full bg-surface/70 sm:size-28" />
        <span className="block min-w-0 flex-1">
          <span className="block font-editorial text-2xl leading-tight font-bold">{card.name}</span>
          {card.varietyLine && (
            <span className="block font-editorial text-lg text-ink-secondary">{card.varietyLine}</span>
          )}
          <span className="mt-1 flex items-center gap-1.5 font-editorial text-lg font-bold text-olive italic">
            <VerdictIcon verdict={card.verdict} />
            {VERDICT_WORD[card.verdict]}
          </span>
          {card.tags.length > 0 && (
            <span className="block text-sm font-medium text-olive">{card.tags.join(" · ")}</span>
          )}
          <span className="mt-1 block">{card.reason}</span>
          {card.origin && (
            <span className="block font-editorial text-ink-secondary italic">{card.origin}</span>
          )}
          {(card.draft || card.synthetic) && (
            <span className="mt-1 flex gap-2 text-sm text-ink-secondary">
              {card.draft && <span className="rounded border border-rule px-1.5 py-0.5">Draft</span>}
              {card.synthetic && (
                <span className="rounded border border-rule px-1.5 py-0.5">Sample data</span>
              )}
            </span>
          )}
        </span>
      </button>
      {/* Expands in place over 200 ms (none with reduced motion); inert while closed. */}
      <div
        id={panel}
        inert={!open}
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
      >
        <div className="overflow-hidden">
          <div className="mt-4 space-y-1 border-l-2 border-olive/70 pl-3">
            <p>
              <span className="font-semibold">Pick:</span> {card.pick}
            </p>
            <p>
              <span className="font-semibold">Store:</span> {card.storage}
            </p>
          </div>
          <Link
            to={`/items/${card.id}`}
            className="mt-1 inline-flex min-h-11 items-center gap-1 font-semibold text-olive underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Details <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </li>
  );
}

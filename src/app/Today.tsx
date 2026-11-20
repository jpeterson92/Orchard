// Today (product spec §5, design system §5–6). Built for scanning in a store aisle: compact rows, the verdict and
// origin on one line, a reason only when it says more than the section heading, two columns of rows on wide screens.
import { useId, useState } from "react";
import { Link } from "react-router";
import appJson from "../generated/app.json";
import type { AppData, FilterGroup } from "../shared/app-data";
import { Art } from "./Art";
import { useAppDate } from "./date";
import { StatusLabels, VerdictMark } from "./icons";
import { Masthead, PageTitle, PreviewNotice } from "./Masthead";
import { count, useVerdictVisible } from "./measure";
import { readinessText, useReadiness } from "./offline";
import { type Card, plainDate, todayView } from "./today-view";

const data = appJson as unknown as AppData;

const FILTERS: { id: FilterGroup | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fruit", label: "Fruit" },
  { id: "vegetables", label: "Vegetables" },
  { id: "herbs-mushrooms", label: "Herbs & mushrooms" },
];

export function Today() {
  const date = useAppDate(data);
  useVerdictVisible(data.builtOn, date.today);
  const [filter, setFilter] = useState<FilterGroup | "all">("all");
  const view = todayView(data, plainDate(date.iso), date.mode);
  const inGroup = (c: Card) => filter === "all" || c.group === filter;
  const best = view.best.filter(inGroup);
  const good = view.good.filter(inGroup);
  const any = view.best.length + view.good.length > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 sm:px-6 md:max-w-5xl">
      <Masthead date={date} />
      <PreviewNotice data={data} />
      <main>
        <PageTitle />
        <h1 className="sr-only">Today</h1>
        {view.summary && (
          <p className="mt-3 text-lg leading-snug text-ink">
            <span className="font-editorial">{view.summary}</span>{" "}
            <StatusLabels draft={data.summaries.draft} synthetic={false} />
          </p>
        )}
        <OfflineStatus iso={date.today} />

        {any && (
          // One row of filters for both lists; it scrolls sideways on a narrow phone rather than wrapping.
          <fieldset className="-mx-4 mt-3 min-w-0 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <legend className="sr-only">Show</legend>
            <div className="flex w-max gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={`min-h-11 rounded-full border px-4 text-sm font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    filter === f.id
                      ? "border-accent bg-accent text-white dark:text-canvas"
                      : "border-olive text-ink"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {best.length > 0 && (
          <Section title={date.planning ? "Typically best" : "Best right now"}>
            <Rows cards={best} />
          </Section>
        )}
        {good.length > 0 && (
          <Section title="Good buys">
            <Rows cards={good} />
          </Section>
        )}
        {any && best.length + good.length === 0 && (
          <p className="py-6 text-ink-secondary">Nothing in this group today.</p>
        )}
      </main>
    </div>
  );
}

/** Where the offline copy stands. It downloads by itself after the first visit; this line only reports it. */
function OfflineStatus({ iso }: { iso: string }) {
  const text = readinessText(useReadiness(data, iso), data);
  return (
    <p role="status" className="mt-2 min-h-5 text-sm text-ink-secondary">
      {text}
    </p>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="flex items-center gap-4 font-editorial text-2xl font-bold">
        {title}
        <span aria-hidden className="h-px flex-1 bg-olive/60" />
      </h2>
      {children}
    </section>
  );
}

function Rows({ cards }: { cards: Card[] }) {
  return (
    <ul className="md:grid md:grid-cols-2 md:gap-x-10">
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
    <li className="border-b border-rule py-4">
      {/* The whole collapsed card is the expand button; the Details link sits outside it (design system §6). */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panel}
        onClick={() => {
          if (!open) count("expand");
          setOpen(!open);
        }}
        className="flex w-full cursor-pointer items-start gap-4 rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <Art id={card.art} sizes="72px" className="size-18 shrink-0" />
        <span className="block min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-editorial text-xl leading-tight font-bold">{card.name}</span>
            <StatusLabels draft={card.draft} synthetic={card.synthetic} />
          </span>
          {card.varietyLine && (
            <span className="block font-editorial text-ink-secondary">{card.varietyLine}</span>
          )}
          {/* Inline, so a long line wraps inside its text rather than starting a line with a separator. */}
          <span className="mt-0.5 block">
            <VerdictMark verdict={card.verdict} />
            {card.origin && <span className="text-sm text-ink-secondary"> · {card.origin}</span>}
          </span>
          {card.tags.length > 0 && (
            <span className="block text-sm font-medium text-olive">{card.tags.join(" · ")}</span>
          )}
          {card.reason && <span className="mt-0.5 block text-sm">{card.reason}</span>}
        </span>
        <span
          aria-hidden
          className={`mt-1 shrink-0 text-olive transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {/* Expands in place over 200 ms (none with reduced motion); inert while closed. Classes rather than a style
          attribute, so the CSP needs no inline styles. */}
      <div
        id={panel}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="mt-3 ml-22 space-y-1 border-l-2 border-olive/70 pl-3">
            {card.avoid && <p>{card.avoid}</p>}
            <p>
              <span className="font-semibold">Pick:</span> {card.pick}
            </p>
            <p>
              <span className="font-semibold">Store:</span> {card.storage}
            </p>
            <Link
              to={`/items/${card.id}`}
              className="inline-flex min-h-11 items-center gap-1 font-semibold text-olive underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Details <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

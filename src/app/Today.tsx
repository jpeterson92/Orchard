// Today (product spec §5, design system §5–6). Built for scanning in a store aisle: compact rows carrying only what
// a shopper needs to choose (an origin only when it decides the pick), a reason only when it says more than the
// section heading, two columns of rows on wide screens.
import { useId, useState } from "react";
import { Link } from "react-router";
import appJson from "../generated/app.json";
import type { AppData, FilterGroup } from "../shared/app-data";
import { Art } from "./Art";
import type { AlwaysGoodRow } from "./always-good";
import { useAppDate } from "./date";
import { Arrow, Chevron, VerdictMark } from "./icons";
import { PageFrame, PageTitle } from "./Masthead";
import { count, useVerdictVisible } from "./measure";
import { readinessText, useReadiness } from "./offline";
import { type Card, plainDate, todayView } from "./today-view";
import { varietyDestination } from "./variety-view";

const data = appJson as unknown as AppData;

// Only groups the covered items fill.
const FILTERS = (
  [
    { id: "all", label: "All" },
    { id: "fruit", label: "Fruit" },
    { id: "vegetables", label: "Vegetables" },
    { id: "herbs-mushrooms", label: "Herbs & mushrooms" },
  ] satisfies { id: FilterGroup | "all"; label: string }[]
).filter((f) => f.id === "all" || data.categories.some((c) => c.group === f.id));

export function Today() {
  const date = useAppDate(data);
  useVerdictVisible(data.builtOn, date.today);
  const [filter, setFilter] = useState<FilterGroup | "all">("all");
  const view = todayView(data, plainDate(date.iso), date.mode);
  const inGroup = (c: { group: FilterGroup }) => filter === "all" || c.group === filter;
  const best = view.best.filter(inGroup);
  const good = view.good.filter(inGroup);
  const alwaysGood = view.alwaysGood.filter(inGroup);
  const any = view.best.length + view.good.length + view.alwaysGood.length > 0;

  return (
    <PageFrame date={date}>
      <main>
        <PageTitle />
        <h1 className="sr-only">Today</h1>
        {view.summary && (
          <p className="mt-2 font-editorial leading-snug text-ink sm:text-lg">
            {/* A run-in label, so the half-month costs no extra line. */}
            <span className="mr-2 font-sans text-xs font-semibold tracking-widest text-accent uppercase">
              {view.period}
              <span className="sr-only">. </span>
            </span>
            {view.summary}
          </p>
        )}
        <OfflineStatus iso={date.today} />

        {any && (
          // One row of filters for all three lists; it scrolls sideways on a narrow phone rather than wrapping.
          <fieldset className="-mx-4 mt-2 min-w-0 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
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
        {alwaysGood.length > 0 && (
          <a href="#always-good" className={`mt-1 text-sm ${textLink}`}>
            Always good <Chevron />
          </a>
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
        {alwaysGood.length > 0 && (
          <Section title="Always good" id="always-good">
            <ul className="md:grid md:grid-cols-2 md:gap-x-10">
              {alwaysGood.map((row) => (
                <StapleRow key={row.id} row={row} />
              ))}
            </ul>
          </Section>
        )}
        {any && best.length + good.length + alwaysGood.length === 0 && (
          <p className="py-6 text-ink-secondary">Nothing in this group today.</p>
        )}
      </main>
    </PageFrame>
  );
}

/** Speaks up only when the offline copy is out of date; it downloads by itself after the first visit. */
function OfflineStatus({ iso }: { iso: string }) {
  const text = readinessText(useReadiness(data, iso), data);
  return (
    <p role="status" className="mt-2 text-sm text-ink-secondary empty:mt-0">
      {text}
    </p>
  );
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section className="mt-4">
      <h2
        id={id}
        tabIndex={id ? -1 : undefined}
        className="flex scroll-mt-4 items-center gap-4 font-editorial text-2xl font-bold"
      >
        {title}
        <span aria-hidden className="h-px flex-1 bg-olive/60" />
      </h2>
      {children}
    </section>
  );
}

const textLink =
  "inline-flex min-h-11 items-center gap-1 rounded-sm font-semibold text-olive underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function StapleRow({ row }: { row: AlwaysGoodRow }) {
  return (
    <li className="border-b border-rule py-0.5">
      <Link to={`/items/${row.id}`} className={`${textLink} font-editorial text-lg`}>
        {row.name} <Arrow />
      </Link>
      {row.varieties.length > 0 && (
        <p className="-mt-1 text-sm text-ink-secondary">
          {row.listing === "except" && "Except "}
          {row.varieties.map((variety, index) => {
            const { to, label } = varietyDestination(row.id, variety.id, row.hasGuide);
            return (
              <span key={variety.id}>
                {index > 0 && (index === row.varieties.length - 1 ? " and " : ", ")}
                <Link to={to} state={{ label }} className={`${textLink} underline`}>
                  {variety.name}
                </Link>
              </span>
            );
          })}
        </p>
      )}
    </li>
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
    <li className="border-b border-rule py-2.5">
      {/* The whole collapsed card expands; the item link sits outside it. */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panel}
        onClick={() => {
          if (!open) count("expand");
          setOpen(!open);
        }}
        className="flex w-full cursor-pointer items-start gap-3 rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <Art id={card.art} sizes="56px" className="size-14 shrink-0" />
        <span className="block min-w-0 flex-1">
          <span className="block font-editorial text-xl leading-tight font-bold">{card.name}</span>
          {card.varietyLine && <span className="block text-sm text-ink-secondary">{card.varietyLine}</span>}
          {/* Inline, so a long line wraps inside its text rather than starting a line with a separator. */}
          <span className="mt-0.5 block">
            <VerdictMark verdict={card.verdict} />
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
          <Chevron />
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
          <div className="mt-2 mb-1 ml-17 space-y-1 border-l-2 border-olive/70 pl-3">
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
              Picking &amp; storage <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

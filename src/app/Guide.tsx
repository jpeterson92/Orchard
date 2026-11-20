// Variety guide (product spec §5 "Variety guide", §6 layouts): every variety of the guide's items, its traits on the
// guide's 1–5 scales, best uses and, where rated, today's verdict. Phone: cards. Wider screens: a sortable table.
// The finder above both narrows them by use and by trait. Each variety links to its own page.
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import { Art } from "./Art";
import { useAppDate } from "./date";
import {
  type Finder,
  filterRows,
  finderParams,
  type GuideRow,
  type GuideView,
  guideView,
  NO_FILTER,
  parseFinder,
  type SortKey,
  sortRows,
  type TraitChip,
  toggleTrait,
  traitChips,
} from "./guide-view";
import { VerdictMark } from "./icons";
import { Masthead, PageTitle } from "./Masthead";
import { atDate, listNames, plainDate } from "./today-view";
import { varietyPath } from "./variety-view";

const data = appJson as unknown as AppData;

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const linkClass = `inline-flex min-h-11 items-center gap-1 font-semibold text-olive underline-offset-4 hover:underline ${focus}`;

export function Guide() {
  const { id = "" } = useParams();
  const date = useAppDate(data);
  const view = guideView(data, id, plainDate(date.iso));
  const back = view?.guide.items.length === 1 ? view.guide.items[0] : undefined;
  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 sm:px-6 md:max-w-5xl">
      <Masthead date={date} shareTitle={view ? `${view.guide.name} variety guide · Orchard` : undefined} />
      {back && (
        <nav aria-label="Back">
          <Link to={`/items/${back}`} className={`${linkClass} mt-1`}>
            <span aria-hidden>←</span> {view?.guide.name}
          </Link>
        </nav>
      )}
      {view ? (
        <GuideBody view={view} mode={date.mode} />
      ) : (
        <main>
          <PageTitle name="Not covered" />
          <h1 className="mt-4 font-editorial text-[2rem] leading-tight font-bold">Not covered</h1>
          <p className="mt-2">Orchard doesn't have a guide for this item yet.</p>
        </main>
      )}
    </div>
  );
}

function GuideBody({ view, mode }: { view: GuideView; mode: "today" | "typical" }) {
  const [sort, setSort] = useState<{ key: SortKey; descending: boolean }>({
    key: view.defaultSort,
    descending: true,
  });
  const overall = view.guide.overall;
  const chips = useMemo(() => traitChips(view.guide), [view.guide]);
  // The finder is copied to the address, so Back returns to it. Taps update state first (the router's navigation
  // lags a quick second tap); the address is read once after hydrating, since the prerendered page has no query.
  const [picked, setPicked] = useState<Finder | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    setPicked(parseFinder(new URLSearchParams(window.location.search), view.guide, chips));
  }, [view.guide, chips]);
  useEffect(() => {
    if (picked === null) return;
    const search = finderParams(new URLSearchParams(window.location.search), picked).toString();
    if (search !== window.location.search.slice(1))
      navigate({ search: search && `?${search}` }, { replace: true, preventScrollReset: true });
  }, [picked, navigate]);
  const finder = picked ?? NO_FILTER;
  const cards = filterRows(view.rows, finder, chips);
  const rows = filterRows(sortRows(view.rows, sort.key, sort.descending), finder, chips);
  const choose = (key: SortKey) =>
    setSort((s) => ({ key, descending: s.key === key ? !s.descending : key !== "name" }));
  return (
    <main>
      <PageTitle name={`${view.guide.name} variety guide`} />
      <h1 className="mt-4 font-editorial text-[2rem] leading-tight font-bold">
        {view.guide.name} by variety
      </h1>
      <p className="mt-2 max-w-prose font-editorial text-lg leading-snug">{view.guide.lead}</p>
      <p className="mt-2 text-ink-secondary">
        {view.rows.length} varieties compared on {view.guide.traits.length} traits, each scored 1 to 5.
      </p>
      {overall && (
        <p className="mt-2">
          <span className="font-semibold">Overall</span> rates each variety for {overall.basis.toLowerCase()}:
          bad, fine, great or amazing. It averages the 100-point scores at{" "}
          <a href={overall.source.url} className="text-olive underline underline-offset-4" rel="noopener">
            {overall.source.publisher}
          </a>{" "}
          with Orchard's own.
        </p>
      )}

      <FinderControls
        view={view}
        chips={chips}
        finder={finder}
        shown={cards.length}
        onChange={(change) => setPicked((f) => change(f ?? NO_FILTER))}
      />

      {/* Phone: one card per variety, in the default order (overall rating, or best right now). */}
      <ul className="mt-2 sm:hidden">
        {cards.map((r) => (
          <Card key={r.key} row={r} view={view} mode={mode} />
        ))}
      </ul>

      {/* Wider screens: the same rows as a table, sorted by any column. */}
      <div className={`mt-2 hidden overflow-x-auto ${rows.length > 0 ? "sm:block" : ""}`}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-olive/60 align-bottom">
              <SortHeader label="Variety" k="name" sort={sort} onChoose={choose} />
              {overall && <SortHeader label="Overall (raw)" k="overall" sort={sort} onChoose={choose} />}
              <SortHeader label={mode === "typical" ? "Then" : "Now"} k="now" sort={sort} onChoose={choose} />
              {view.guide.traits.map((t) => (
                <SortHeader key={t.id} label={t.name} k={t.id} sort={sort} onChoose={choose} />
              ))}
              <th scope="col" className="py-2 pr-2 font-semibold">
                Best for
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-rule align-top">
                <th scope="row" className="py-3 pr-3">
                  <span className="flex items-center gap-2">
                    <Art id={r.art} sizes="32px" className="size-8 shrink-0" />
                    <span>
                      <Link
                        to={varietyPath(r.item, r.variety)}
                        className={`font-editorial text-lg font-bold text-olive underline-offset-4 hover:underline ${focus}`}
                      >
                        {r.name}
                      </Link>
                      {view.multiItem && (
                        <span className="block text-sm font-normal text-ink-secondary">{r.itemName}</span>
                      )}
                    </span>
                  </span>
                </th>
                {overall && (
                  <td className="py-3 pr-3">
                    <Overall value={r.overall} />
                  </td>
                )}
                <td className="py-3 pr-3">
                  <Now row={r} mode={mode} short />
                </td>
                {view.guide.traits.map((t) => (
                  <td key={t.id} className="py-3 pr-3">
                    <Score value={r.traits[t.id]} />
                  </td>
                ))}
                <td className="py-3 pr-2">
                  {r.bestUses.join(", ")}
                  {r.ripeCue && <span className="block text-sm text-ink-secondary">Ripe: {r.ripeCue}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section id="scores" className="mt-8 scroll-mt-4 border-t border-olive/60 pt-4">
        <h2 className="font-editorial text-2xl font-bold">How to read the scores</h2>
        <dl className="mt-2 space-y-3">
          {view.guide.traits.map((t) => (
            <div key={t.id}>
              <dt className="font-semibold">{t.name}</dt>
              {([1, 3, 5] as const).map((n) => {
                const a = t.anchors[n];
                const refs = a.varieties.map((v) => view.names[v] ?? v);
                return (
                  <dd key={n} className="text-ink-secondary">
                    {n}: {a.text}
                    {refs.length > 0 && ` (${listNames(refs)})`}
                  </dd>
                );
              })}
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-ink-secondary">
          A dash means no source places the variety on that scale.
        </p>
      </section>
    </main>
  );
}

const chipClass = (on: boolean) =>
  `min-h-11 rounded-full border px-4 text-sm font-medium whitespace-nowrap ${focus} ${
    on ? "border-accent bg-accent text-white dark:text-canvas" : "border-olive text-ink"
  }`;

/** The finder (product spec §5): one use at a time, and trait chips that must all hold. Results update as you tap. */
function FinderControls({
  view,
  chips,
  finder,
  shown,
  onChange,
}: {
  view: GuideView;
  chips: TraitChip[];
  finder: Finder;
  shown: number;
  /** Each tap passes how it changes the finder, so taps in quick succession all count. */
  onChange: (change: (f: Finder) => Finder) => void;
}) {
  const filtered = finder.use !== null || finder.traits.length > 0;
  return (
    <div className="mt-5 space-y-3 border-t border-olive/60 pt-4">
      <fieldset>
        <legend className="mb-1.5 font-semibold">Use</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={finder.use === null}
            onClick={() => onChange((f) => ({ ...f, use: null }))}
            className={chipClass(finder.use === null)}
          >
            Any use
          </button>
          {view.guide.uses.map((u) => (
            <button
              key={u.id}
              type="button"
              aria-pressed={finder.use === u.id}
              onClick={() => onChange((f) => ({ ...f, use: f.use === u.id ? null : u.id }))}
              className={chipClass(finder.use === u.id)}
            >
              {u.name}
            </button>
          ))}
        </div>
      </fieldset>
      {chips.length > 0 && (
        <fieldset>
          <legend className="mb-1.5 font-semibold">Traits</legend>
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => {
              const on = finder.traits.includes(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange((f) => toggleTrait(f, c))}
                  className={chipClass(on)}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-4">
        <p aria-live="polite" className="text-ink-secondary">
          {!filtered
            ? `All ${view.rows.length} varieties`
            : shown === 0
              ? "No variety has all of these."
              : `${shown} of ${view.rows.length} varieties`}
        </p>
        {filtered && (
          <button type="button" onClick={() => onChange(() => NO_FILTER)} className={linkClass}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function Card({ row, view, mode }: { row: GuideRow; view: GuideView; mode: "today" | "typical" }) {
  return (
    <li className="border-b border-rule py-4 last:border-b-0">
      <div className="flex items-center gap-3">
        <Art id={row.art} sizes="48px" className="size-12 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h2 className="font-editorial text-xl font-bold">
              <Link
                to={varietyPath(row.item, row.variety)}
                className={`inline-flex min-h-11 items-center text-olive underline-offset-4 hover:underline ${focus}`}
              >
                {row.name} <span aria-hidden>&nbsp;→</span>
              </Link>
            </h2>
            <Now row={row} mode={mode} />
          </div>
          {view.guide.overall && (
            <p className="mt-0.5">
              <span className="sr-only">Overall, eating raw: </span>
              <Overall value={row.overall} />
            </p>
          )}
          <p className="text-sm text-ink-secondary">
            {view.multiItem && `${row.itemName} · `}Best for {row.bestUses.join(", ").toLowerCase()}
          </p>
        </div>
      </div>
      <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
        {view.guide.traits.map((t) => (
          <div key={t.id} className="contents">
            <dt>{t.name}</dt>
            <dd>
              <Score value={row.traits[t.id]} />
            </dd>
          </div>
        ))}
      </dl>
      {row.ripeCue && (
        <p className="mt-2">
          <span className="font-semibold">Ripe when:</span> {row.ripeCue}
        </p>
      )}
    </li>
  );
}

/** Today's verdict for a rated variety; unrated varieties show nothing here (never ranked). */
function Now({ row, mode, short = false }: { row: GuideRow; mode: "today" | "typical"; short?: boolean }) {
  if (row.verdict === null) return short ? <span className="text-ink-secondary">Not rated</span> : null;
  if (!row.inStore)
    return <span className="text-sm text-ink-secondary">{atDate("Not usually in stores now", mode)}</span>;
  return <VerdictMark verdict={row.verdict} />;
}

const TIER_WORD = { amazing: "Amazing", great: "Great", fine: "Fine", bad: "Bad" } as const;
const TIER_LEVEL = { amazing: 4, great: 3, fine: 2, bad: 1 } as const;

/** The overall tier as a four-step bar and its word; a dash where the source has no score. */
export function Overall({ value }: { value: GuideRow["overall"] }) {
  if (value === null)
    return (
      <span className="text-ink-secondary">
        <span aria-hidden>–</span>
        <span className="sr-only">No overall rating</span>
      </span>
    );
  const level = TIER_LEVEL[value.tier];
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span aria-hidden className="inline-flex gap-0.5">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`h-2.5 w-4 rounded-sm border border-olive ${n <= level ? "bg-olive" : "bg-transparent"}`}
          />
        ))}
      </span>
      <span className="font-semibold">{TIER_WORD[value.tier]}</span>
    </span>
  );
}

/** A 1–5 score as five dots with the number for screen readers; a dash where no source gives one. */
export function Score({ value }: { value: number | undefined }) {
  if (value === undefined)
    return (
      <span className="text-ink-secondary">
        <span aria-hidden>–</span>
        <span className="sr-only">No score</span>
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <span aria-hidden className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`size-2.5 rounded-full border border-olive ${n <= value ? "bg-olive" : "bg-transparent"}`}
          />
        ))}
      </span>
      <span className="text-sm text-ink-secondary">
        {value}
        <span className="sr-only"> of 5</span>
      </span>
    </span>
  );
}

function SortHeader({
  label,
  k,
  sort,
  onChoose,
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; descending: boolean };
  onChoose: (k: SortKey) => void;
}) {
  const active = sort.key === k;
  return (
    <th
      scope="col"
      className="py-1 pr-3 font-semibold"
      aria-sort={active ? (sort.descending ? "descending" : "ascending") : "none"}
    >
      <button
        type="button"
        onClick={() => onChoose(k)}
        className={`inline-flex min-h-11 items-end gap-1 rounded-sm text-left ${focus}`}
      >
        {label}
        <span aria-hidden className={active ? "text-olive" : "text-transparent"}>
          {sort.descending ? "↓" : "↑"}
        </span>
      </button>
    </th>
  );
}

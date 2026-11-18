// Item page (product spec §4 "Item page order", §5 "Item page"). One readable column in the spec's order, the
// in-store answer first: the verdict and why, then varieties, how to pick and store. What the verdict rests on is one
// tap away under "About this verdict". On wide screens the artwork takes a column of its own.
// Not yet here: the variety guide link (M7).
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import { Art } from "./Art";
import type { BackTo } from "./Browse";
import { type Mode, useAppDate } from "./date";
import { StatusLabels, VerdictMark } from "./icons";
import { type ItemView, itemView, type LabelOption, labelResult, type VarietyRow } from "./item-view";
import { Masthead, PreviewNotice } from "./Masthead";
import { MonthAxis, SeasonStrip, StripLegend } from "./SeasonStrip";
import { atDate, plainDate } from "./today-view";

const data = appJson as unknown as AppData;

const CONFIDENCE_WORD = { high: "High", medium: "Medium", low: "Low" } as const;

const linkClass =
  "inline-flex min-h-11 items-center gap-1 font-semibold text-olive underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function ItemPage() {
  const { id = "" } = useParams();
  const date = useAppDate(data);
  const view = itemView(data, id, plainDate(date.iso), date.mode);
  // Back to the Browse list it was opened from; Today otherwise (a shared link, search, Today itself).
  const back = (useLocation().state as { back?: BackTo } | null)?.back ?? { to: "/", label: "Today" };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 sm:px-6 md:max-w-5xl">
      <Masthead date={date} shareTitle={view ? `${view.name} · Orchard` : undefined} />
      <PreviewNotice data={data} />
      <Link to={back.to} className={`${linkClass} mt-1`}>
        <span aria-hidden>←</span> {back.label}
      </Link>
      {view ? (
        <div className="lg:grid lg:grid-cols-[minmax(0,40rem)_1fr] lg:gap-12">
          <Item view={view} mode={date.mode} />
          {/* Wide screens: the artwork gets its own column and stays in view. */}
          <aside className="hidden lg:block">
            <Art id={view.art} sizes="320px" className="sticky top-6 aspect-square w-full max-w-80" />
          </aside>
        </div>
      ) : (
        <main>
          <h1 className="mt-4 font-editorial text-[2rem] leading-tight font-bold">Not covered</h1>
          <p className="mt-2">Orchard doesn't have guidance for this item yet.</p>
        </main>
      )}
    </div>
  );
}

function Item({ view, mode }: { view: ItemView; mode: Mode }) {
  // A variety found by search opens with it picked in the label check.
  const picked = (useLocation().state as { label?: string | null } | null)?.label;
  const [label, setLabel] = useState(picked ?? "");
  const labelCheck = <LabelCheck view={view} choice={label} onChoose={setLabel} />;
  return (
    <main>
      <div className="mt-1 flex gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-editorial text-[2rem] leading-tight font-bold">{view.name}</h1>
          <StatusLabels draft={view.draft} synthetic={view.synthetic} />
          {view.varietyLine && (
            <p className="font-editorial text-lg text-ink-secondary">{view.varietyLine}</p>
          )}
          <p className="mt-1">
            <VerdictMark verdict={view.verdict} size="lg" />
          </p>
          {view.tags.length > 0 && <p className="text-sm font-medium text-olive">{view.tags.join(" · ")}</p>}
        </div>
        {/* Phone and tablet art slot; wide screens show it in its own column. */}
        <Art
          id={view.art}
          sizes="(min-width: 640px) 112px, 96px"
          className="size-24 shrink-0 sm:size-28 lg:hidden"
        />
      </div>

      <div className="mt-3 space-y-1">
        {view.reasons.map((r) => (
          <p key={r}>{r}</p>
        ))}
      </div>

      {view.notes.length > 0 && (
        <div className="mt-3 space-y-1 border-l-2 border-accent/70 pl-3">
          {view.notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>
      )}
      {/* Where the label decides it, the control sits just below the note; otherwise in the page order. */}
      {view.labelNote && labelCheck}

      <details className="group mt-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-sm text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          <span className="font-semibold">{CONFIDENCE_WORD[view.confidence]} confidence</span>
          <span aria-hidden className="text-ink-secondary">
            ·
          </span>
          <span className="font-semibold text-olive underline-offset-4 group-hover:underline">
            About this verdict
          </span>
          <span aria-hidden className="text-olive transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="space-y-1 border-l-2 border-olive/70 pb-1 pl-3 text-sm text-ink-secondary">
          {view.confidenceNote && <p>Not higher because {view.confidenceNote}.</p>}
          <p>Based on: {view.basis.charAt(0).toLowerCase() + view.basis.slice(1)}.</p>
          <p>{[view.supplyDate, view.reviewDate].filter(Boolean).join(" · ")}</p>
          <p>
            <Link to="/methods" className={linkClass}>
              How Orchard rates produce →
            </Link>
          </p>
        </div>
      </details>

      {view.varieties.length > 0 && (
        <Section title={atDate("Varieties now", mode)}>
          <StripLegend />
          <div className="mt-3">
            <MonthAxis current={Math.floor(view.window / 2)} />
          </div>
          <ul>
            {view.varieties.map((v) => (
              <Variety key={v.id} row={v} today={view.window} mode={mode} />
            ))}
          </ul>
        </Section>
      )}

      <Section title="How to pick">
        <Bullets items={view.pick} />
        <h3 className="mt-3 font-semibold">Avoid</h3>
        <Bullets items={view.avoid} />
        {view.types
          .filter((t) => t.note)
          .map((t) => (
            <p key={t.name} className="mt-2">
              <span className="font-semibold">{t.name}:</span> {t.note}
            </p>
          ))}
      </Section>

      <Section title={view.ripen ? "Store and ripen" : "Store"}>
        <p>{view.store}</p>
        {view.ripen && <p className="mt-2">{view.ripen}</p>}
      </Section>

      {!view.labelNote && <Section title="What does the label say?">{labelCheck}</Section>}

      <Section title="Typical seasonal outlook">
        <SeasonStrip outlook={view.outlook} today={view.window} />
        <div className="mt-1">
          <MonthAxis current={Math.floor(view.window / 2)} />
        </div>
        <div className="mt-3">
          <StripLegend />
        </div>
        <h3 className="mt-4 font-semibold">Main supply</h3>
        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          {view.supply.map((s) => (
            <div key={s.months} className="contents">
              <dt className="text-ink-secondary">{s.months}</dt>
              <dd>{s.origins}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Prep and use">
        <p>{view.prep}</p>
      </Section>
    </main>
  );
}

/** Pick the origin or variety on the label or sticker; its own verdict shows below. The page's verdict stays. */
function LabelCheck({
  view,
  choice,
  onChoose,
}: {
  view: ItemView;
  choice: string;
  onChoose: (choice: string) => void;
}) {
  const date = useAppDate(data);
  const { varieties, origins } = view.labelChoices;
  if (varieties.length + origins.length === 0) return null;
  const result = choice ? labelResult(data, view.id, plainDate(date.iso), choice, date.mode) : null;
  const both = varieties.length > 0 && origins.length > 0;
  const what = both ? "origin or variety" : varieties.length > 0 ? "variety" : "origin";
  const options = (list: LabelOption[]) =>
    list.map((o) => (
      <option key={o.value} value={o.value}>
        {o.text}
      </option>
    ));

  return (
    <div id="label" className={`scroll-mt-16 ${view.labelNote ? "mt-3" : ""}`}>
      <label className="block">
        <span className={view.labelNote ? "font-semibold" : "text-ink-secondary"}>
          {view.labelNote ? "What does the label say?" : `Pick the ${what} on the label or sticker.`}
        </span>
        <select
          value={choice}
          onChange={(e) => onChoose(e.target.value)}
          className="mt-1 block min-h-11 w-full max-w-sm rounded-md border border-rule bg-surface px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <option value="">
            Choose {/^[aeiou]/.test(what) ? "an" : "a"} {what}
          </option>
          {both ? (
            <>
              <optgroup label="Varieties">{options(varieties)}</optgroup>
              <optgroup label="Origins">{options(origins)}</optgroup>
            </>
          ) : (
            options(varieties.length > 0 ? varieties : origins)
          )}
        </select>
      </label>
      {/* Announced when it changes, so a screen-reader user hears the new verdict. */}
      <div aria-live="polite" className="mt-3">
        {result && (
          <div className="space-y-1 rounded-md bg-surface/60 p-3">
            <p>
              <VerdictMark verdict={result.verdict} />
            </p>
            {result.reasons.map((r) => (
              <p key={r}>{r}</p>
            ))}
            {result.bestUses.length > 0 && <p>Best for: {result.bestUses.join(", ").toLowerCase()}.</p>}
            {result.verdict !== "limited" && (
              <p className="text-sm text-ink-secondary">{CONFIDENCE_WORD[result.confidence]} confidence</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Variety({ row, today, mode }: { row: VarietyRow; today: number; mode: Mode }) {
  return (
    <li className="border-b border-rule py-3 last:border-b-0">
      <div className="flex items-center gap-3">
        <Art id={row.art} sizes="48px" className="size-12 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="font-editorial text-lg font-bold">{row.name}</h3>
            {row.verdict ? (
              <VerdictMark verdict={row.verdict} />
            ) : (
              <span className="text-ink-secondary">Not rated</span>
            )}
          </div>
          {row.confidence && (
            <p className="text-sm text-ink-secondary">
              {CONFIDENCE_WORD[row.confidence]} confidence
              {!row.inStore && atDate(" · Not usually in stores now", mode)}
            </p>
          )}
        </div>
      </div>
      {/* Full width, so the strip lines up with the month axis above the list. */}
      {row.outlook && (
        <div className="mt-2">
          <SeasonStrip outlook={row.outlook} today={today} />
        </div>
      )}
    </li>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 border-t border-olive/60 pt-4">
      <h2 className="font-editorial text-2xl font-bold">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-1 list-disc space-y-1 pl-5 marker:text-olive">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

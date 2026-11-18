// Item page (product spec §4 "Item page order", §5 "Item page"). One readable column in the spec's order, the
// in-store answer first: the verdict and why, then varieties, how to pick and store. What the verdict rests on is one
// tap away under "About this verdict". On wide screens the artwork takes a column of its own.
// Not yet here: "What does the label say?", the variety guide link and feedback (later slices).
import { Link, useParams } from "react-router";
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import { useToday } from "./date";
import { StatusLabels, VerdictMark } from "./icons";
import { type ItemView, itemView, type VarietyRow } from "./item-view";
import { Masthead, PreviewNotice } from "./Masthead";
import { MonthAxis, SeasonStrip, StripLegend } from "./SeasonStrip";
import { plainDate } from "./today-view";

const data = appJson as unknown as AppData;

const CONFIDENCE_WORD = { high: "High", medium: "Medium", low: "Low" } as const;

const linkClass =
  "inline-flex min-h-11 items-center gap-1 font-semibold text-olive underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function ItemPage() {
  const { id = "" } = useParams();
  const iso = useToday(data);
  const view = itemView(data, id, plainDate(iso));

  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 sm:px-6 md:max-w-5xl">
      <Masthead iso={iso} />
      <PreviewNotice data={data} />
      <Link to="/" className={`${linkClass} mt-1`}>
        <span aria-hidden>←</span> Today
      </Link>
      {view ? (
        <div className="lg:grid lg:grid-cols-[minmax(0,40rem)_1fr] lg:gap-12">
          <Item view={view} />
          {/* Wide screens: the artwork gets its own column and stays in view (placeholder until art exists). */}
          <aside aria-hidden className="hidden lg:block">
            <span className="sticky top-6 block aspect-square w-full max-w-80 rounded-full bg-surface/70" />
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

function Item({ view }: { view: ItemView }) {
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
        <span aria-hidden className="size-24 shrink-0 rounded-full bg-surface/70 sm:size-28 lg:hidden" />
      </div>

      <div className="mt-3 space-y-1">
        {view.reasons.map((r) => (
          <p key={r}>{r}</p>
        ))}
      </div>

      {(view.notes.length > 0 || view.advisory) && (
        <div className="mt-3 space-y-1 border-l-2 border-accent/70 pl-3">
          {view.advisory && <p>{view.advisory}</p>}
          {view.notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>
      )}

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
        </div>
      </details>

      {view.varieties.length > 0 && (
        <Section title="Varieties now">
          <StripLegend />
          <div className="mt-3">
            <MonthAxis current={Math.floor(view.window / 2)} />
          </div>
          <ul>
            {view.varieties.map((v) => (
              <Variety key={v.id} row={v} today={view.window} />
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

function Variety({ row, today }: { row: VarietyRow; today: number }) {
  return (
    <li className="border-b border-rule py-3 last:border-b-0">
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
          {!row.inStore && " · Not usually in stores now"}
        </p>
      )}
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

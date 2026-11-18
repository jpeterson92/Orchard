// Item page (product spec §4 "Item page order", §5 "Item page"; reference 02-mobile-item-page.png).
// Not yet here: "What does the label say?", the variety guide link and feedback (later slices).
import { Link, useParams } from "react-router";
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import { useToday } from "./date";
import { VerdictIcon } from "./icons";
import { type ItemView, itemView, type VarietyRow } from "./item-view";
import { Masthead } from "./Masthead";
import { SeasonStrip, StripLegend } from "./SeasonStrip";
import { plainDate, VERDICT_WORD } from "./today-view";

const data = appJson as unknown as AppData;

const CONFIDENCE_WORD = { high: "High", medium: "Medium", low: "Low" } as const;

const linkClass =
  "inline-flex min-h-11 items-center gap-1 font-semibold text-olive underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function ItemPage() {
  const { id = "" } = useParams();
  const iso = useToday(data);
  const view = itemView(data, id, plainDate(iso));

  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 sm:px-6">
      <Masthead iso={iso} />
      <Link to="/" className={`${linkClass} mt-2`}>
        <span aria-hidden>←</span> Today
      </Link>
      {view ? (
        <Item view={view} />
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
      <div className="mt-2 flex gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-editorial text-[2rem] leading-tight font-bold">{view.name}</h1>
          {view.varietyLine && (
            <p className="font-editorial text-lg text-ink-secondary">{view.varietyLine}</p>
          )}
          <p className="mt-1 flex items-center gap-1.5 font-editorial text-xl font-bold text-olive italic">
            <VerdictIcon verdict={view.verdict} />
            {VERDICT_WORD[view.verdict]}
          </p>
          {view.tags.length > 0 && <p className="text-sm font-medium text-olive">{view.tags.join(" · ")}</p>}
        </div>
        {/* Art slot: a mostly transparent placeholder until approved art exists (design system §6). */}
        <span aria-hidden className="size-28 shrink-0 rounded-full bg-surface/70 sm:size-36" />
      </div>

      <ul className="mt-3 space-y-1">
        {view.reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-ink-secondary">
        <span className="font-semibold">{CONFIDENCE_WORD[view.confidence]} confidence</span>
        {view.confidenceNote && `: ${view.confidenceNote}`}
      </p>
      <p className="text-sm text-ink-secondary">{view.basis}</p>
      <p className="text-sm text-ink-secondary">
        {[view.supplyDate, view.reviewDate].filter(Boolean).join(" · ")}
      </p>
      {(view.draft || view.synthetic) && (
        <p className="mt-2 flex gap-2 text-sm text-ink-secondary">
          {view.draft && <span className="rounded border border-rule px-1.5 py-0.5">Draft</span>}
          {view.synthetic && <span className="rounded border border-rule px-1.5 py-0.5">Sample data</span>}
        </p>
      )}

      {(view.notes.length > 0 || view.advisory) && (
        <div className="mt-4 space-y-1 border-l-2 border-accent/70 pl-3">
          {view.advisory && <p>{view.advisory}</p>}
          {view.notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>
      )}

      {view.varieties.length > 0 && (
        <Section title="Varieties now">
          <StripLegend />
          <ul className="divide-y divide-rule">
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
        <SeasonStrip outlook={view.outlook} today={view.window} months />
        <StripLegend />
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
    <li className="py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className="font-editorial text-xl font-bold">{row.name}</h3>
        {row.verdict ? (
          <span className="flex items-center gap-1.5 font-editorial font-bold text-olive italic">
            <VerdictIcon verdict={row.verdict} />
            {VERDICT_WORD[row.verdict]}
          </span>
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
          <SeasonStrip outlook={row.outlook} today={today} months />
        </div>
      )}
    </li>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 border-t border-olive/60 pt-5">
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

// Variety page (product spec §5 "Variety page"): one variety of a guide, linked from the guide's cards and rows. Its
// verdict and outlook where it is rated, traits, best uses, what the label says and close alternatives. The label is
// the authority on identity: nothing here claims the variety can be told apart by sight.
import { Link, useLocation, useParams } from "react-router";
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import { Art } from "./Art";
import type { BackTo } from "./Browse";
import { type Mode, useAppDate } from "./date";
import { Overall, Score } from "./Guide";
import { VerdictMark } from "./icons";
import { Masthead, PageTitle } from "./Masthead";
import { useCount } from "./measure";
import { MonthAxis, SeasonStrip, StripLegend } from "./SeasonStrip";
import { atDate, plainDate } from "./today-view";
import { type VarietyView, varietyPath, varietyView } from "./variety-view";

const data = appJson as unknown as AppData;

/** "a", "a or b", "a, b or c". */
const orList = (xs: string[]) =>
  xs.length < 2 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} or ${xs.at(-1)}`;

const CONFIDENCE_WORD = { high: "High", medium: "Medium", low: "Low" } as const;
const linkClass =
  "inline-flex min-h-11 items-center gap-1 font-semibold text-olive underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function VarietyPage() {
  const { id = "", variety = "" } = useParams();
  const date = useAppDate(data);
  const view = varietyView(data, id, variety, plainDate(date.iso));
  useCount("variety", view ? `${id}/${variety}` : null);
  // Back to where it was opened from (the item page, search); the guide otherwise.
  const back =
    (useLocation().state as { back?: BackTo } | null)?.back ??
    (view
      ? { to: `/guides/${view.guide.id}`, label: `${view.guide.name} variety guide` }
      : { to: "/", label: "Today" });
  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 sm:px-6">
      <Masthead
        date={date}
        shareTitle={view ? `${view.variety.name} ${view.item.name.toLowerCase()} · Orchard` : undefined}
      />
      <nav aria-label="Back">
        <Link to={back.to} className={`${linkClass} mt-1`}>
          <span aria-hidden>←</span> {back.label}
        </Link>
      </nav>
      {view ? (
        <Body view={view} mode={date.mode} />
      ) : (
        <main>
          <PageTitle name="Not covered" />
          <h1 className="mt-4 font-editorial text-[2rem] leading-tight font-bold">Not covered</h1>
          <p className="mt-2">Orchard doesn't have a page for this variety yet.</p>
        </main>
      )}
    </div>
  );
}

function Body({ view, mode }: { view: VarietyView; mode: Mode }) {
  const { variety: v, guide, rating } = view;
  return (
    <main>
      <div className="mt-1 flex gap-4">
        <div className="min-w-0 flex-1">
          <PageTitle name={`${v.name} ${view.item.name.toLowerCase()}`} />
          <h1 className="font-editorial text-[2rem] leading-tight font-bold">{v.name}</h1>
          <p className="font-editorial text-lg text-ink-secondary">{view.item.name}</p>
          {rating && (
            <p className="mt-1">
              {rating.inStore ? (
                <VerdictMark verdict={rating.verdict} size="lg" />
              ) : (
                <span className="text-ink-secondary">{atDate("Not usually in stores now", mode)}</span>
              )}
            </p>
          )}
          {rating?.inStore && (
            <p className="text-sm text-ink-secondary">{CONFIDENCE_WORD[rating.confidence]} confidence</p>
          )}
        </div>
        <Art id={v.art} sizes="(min-width: 640px) 112px, 96px" className="size-24 shrink-0 sm:size-28" />
      </div>

      <Section title="On the label">
        <p>
          Look for <span className="font-semibold">{v.label}</span> on the sign or sticker. The label is the
          surest way to tell varieties apart.
        </p>
        {v.plu.length > 0 && (
          <p className="mt-2">
            Sticker number (PLU):{" "}
            <span className="font-semibold tabular-nums">{orList(v.plu.map(String))}</span>. Organic ones put
            a 9 in front, as in <span className="tabular-nums">9{v.plu[0]}</span>.
          </p>
        )}
        {v.cue && <p className="mt-2">How to find it: {v.cue}</p>}
      </Section>

      <Section title="What it's like">
        {guide.overall && (
          <p className="mb-3">
            <span className="font-semibold">Overall, {guide.overall.basis.toLowerCase()}:</span>{" "}
            <Overall value={v.overall} />
          </p>
        )}
        <dl className="grid max-w-sm grid-cols-[1fr_auto] gap-x-4 gap-y-1">
          {guide.traits.map((t) => (
            <div key={t.id} className="contents">
              <dt>{t.name}</dt>
              <dd>
                <Score value={v.traits[t.id]} />
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-1">
          <Link to={`/guides/${guide.id}#scores`} className={`${linkClass} text-sm`}>
            How to read the scores
          </Link>
        </p>
        <p className="mt-2">
          <span className="font-semibold">Best for:</span> {v.bestUses.join(", ").toLowerCase()}
        </p>
        {v.ripeCue && (
          <p className="mt-2">
            <span className="font-semibold">Ripe when:</span> {v.ripeCue}
          </p>
        )}
      </Section>

      {/* Only where variety evidence exists (product spec §5). */}
      {rating && (
        <Section title="Across the year">
          <SeasonStrip outlook={rating.outlook} today={view.window} />
          <div className="mt-1">
            <MonthAxis current={Math.floor(view.window / 2)} />
          </div>
          <div className="mt-3">
            <StripLegend />
          </div>
        </Section>
      )}

      {view.alternatives.length > 0 && (
        <Section title="Can't find it? Try…">
          <ul>
            {view.alternatives.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-x-4">
                <Link to={varietyPath(view.item.id, a.id)} className={linkClass}>
                  {a.name} <span aria-hidden>→</span>
                </Link>
                {a.verdict && <VerdictMark verdict={a.verdict} />}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-sm text-ink-secondary">Closest on the scores above.</p>
        </Section>
      )}

      <Section title="More">
        <p className="flex flex-col">
          <Link to={`/items/${view.item.id}`} className={linkClass}>
            {view.item.name}: how to pick and store <span aria-hidden>→</span>
          </Link>
          <Link to={`/guides/${guide.id}`} className={linkClass}>
            {guide.name} variety guide: every variety side by side <span aria-hidden>→</span>
          </Link>
        </p>
      </Section>
    </main>
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

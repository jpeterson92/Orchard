// Calendar, "Typical seasonal outlook" (product spec §5 "Calendar", §6): one month at a time on phone; from 600 px a
// full-year heatmap that is a real table (item rows, half-month columns, each cell's verdict in words for screen
// readers), grouped by Browse category. Cells use the season-strip fills (design system §6).
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import { windowIndex } from "../shared/time";
import type { Verdict } from "../shared/verdict";
import type { BackTo } from "./Browse";
import { type CalendarRow, calendarRows, monthSections } from "./calendar-view";
import { useAppDate } from "./date";
import { StatusLabels } from "./icons";
import { Masthead, PageTitle, PreviewNotice } from "./Masthead";
import { FILL, StripLegend } from "./SeasonStrip";
import { MONTHS, plainDate, VERDICT_WORD } from "./today-view";

const data = appJson as unknown as AppData;

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const back: BackTo = { to: "/calendar", label: "Calendar" };
const MONTH_PARAM = "month";
const SECTION_TITLE: Record<Verdict, string> = {
  peak: "Peak",
  good: "Good",
  skip: "Skip",
  limited: "Limited evidence",
};
const word = (v: Verdict | undefined) => VERDICT_WORD[v ?? "limited"];

export function Calendar() {
  const date = useAppDate(data);
  const { year, month, day } = plainDate(date.iso);
  const rows = calendarRows(data, year);
  const current = windowIndex(month, day);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 sm:px-6 md:max-w-5xl">
      <Masthead date={date} />
      <PreviewNotice data={data} />
      <main>
        <PageTitle name="Typical seasonal outlook" />
        <h1 className="mt-6 font-editorial text-3xl font-bold">Typical seasonal outlook</h1>
        <div className="mt-3">
          <StripLegend />
        </div>
        <div className="sm:hidden">
          <MonthList rows={rows} initial={month - 1} />
        </div>
        <div className="hidden sm:block">
          <Heatmap rows={rows} current={current} />
        </div>
      </main>
    </div>
  );
}

/** Phone: one month, each item once under the better of its two half-month verdicts. */
function MonthList({ rows, initial }: { rows: CalendarRow[]; initial: number }) {
  // The chosen month lives in the address (?month=1–12), so Back and the item page's back link return to it. With
  // none, the list follows the date's month. Read after hydrating: the prerendered page has no query.
  const [params, setParams] = useSearchParams();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const fromLink = Number(params.get(MONTH_PARAM));
  const m =
    hydrated && Number.isInteger(fromLink) && fromLink >= 1 && fromLink <= 12 ? fromLink - 1 : initial;
  const step = (by: number) => {
    const next = new URLSearchParams(params);
    next.set(MONTH_PARAM, String(((m + by + 12) % 12) + 1));
    setParams(next, { replace: true, preventScrollReset: true });
  };
  const backHere: BackTo = { ...back, to: `/calendar?${MONTH_PARAM}=${m + 1}` };
  const name = MONTHS[m] ?? "";
  const stepButton = `flex size-11 items-center justify-center rounded-full border border-olive text-olive ${focus}`;

  return (
    <>
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={`Previous month, ${MONTHS[(m + 11) % 12]}`}
          className={stepButton}
        >
          <span aria-hidden>‹</span>
        </button>
        <h2 aria-live="polite" className="flex-1 text-center font-editorial text-2xl font-bold">
          {name}
        </h2>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label={`Next month, ${MONTHS[(m + 1) % 12]}`}
          className={stepButton}
        >
          <span aria-hidden>›</span>
        </button>
      </div>
      {monthSections(rows, m).map((s) => (
        <section key={s.verdict} className="mt-5">
          <h3 className="flex items-center gap-3 font-editorial text-xl font-bold">
            {SECTION_TITLE[s.verdict]}
            <span aria-hidden className="h-px flex-1 bg-olive/60" />
            <span aria-hidden className="w-16 text-center font-sans text-xs font-normal text-ink-secondary">
              Early · Late
            </span>
          </h3>
          <ul>
            {s.rows.map((r) => {
              const early = r.outlook[m * 2];
              const late = r.outlook[m * 2 + 1];
              return (
                <li key={r.id} className="border-b border-rule">
                  <Link
                    to={`/items/${r.id}`}
                    state={{ back: backHere }}
                    className={`flex min-h-12 items-center gap-3 rounded-sm py-2 ${focus}`}
                  >
                    <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
                      <span className="font-editorial text-lg font-bold">{r.name}</span>
                      {r.alwaysGood && <span className="text-sm font-medium text-olive">Always good</span>}
                      <StatusLabels draft={r.draft} synthetic={r.synthetic} />
                    </span>
                    <span className="sr-only">
                      {early === late
                        ? `${word(early)} all month`
                        : `Early ${name}: ${word(early)}. Late ${name}: ${word(late)}.`}
                    </span>
                    <span aria-hidden className="grid w-16 grid-cols-2 gap-0.5">
                      <span className={`h-5 rounded-[2px] ${FILL[early ?? "limited"]}`} />
                      <span className={`h-5 rounded-[2px] ${FILL[late ?? "limited"]}`} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}

/** From 600 px: items × 24 half-months, the date's window outlined. */
function Heatmap({ rows, current }: { rows: CalendarRow[]; current: number }) {
  const windows = Array.from({ length: 24 }, (_, w) => w);
  const label = (w: number) => `${w % 2 === 0 ? "Early" : "Late"} ${MONTHS[Math.floor(w / 2)]}`;
  return (
    <table className="mt-5 w-full table-fixed border-separate border-spacing-0.5">
      <caption className="sr-only">Typical verdict for each item by half-month</caption>
      <colgroup>
        <col className="w-36 md:w-44" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col" className="sr-only">
            Item
          </th>
          {windows.map((w) => (
            <th
              key={w}
              scope="col"
              className={`overflow-visible text-left text-xs font-normal whitespace-nowrap ${
                Math.floor(w / 2) === Math.floor(current / 2) ? "font-bold text-accent" : "text-ink-secondary"
              }`}
            >
              {w % 2 === 0 && <span aria-hidden>{MONTHS[w / 2]?.slice(0, 3)}</span>}
              <span className="sr-only">{label(w)}</span>
            </th>
          ))}
        </tr>
      </thead>
      {data.categories.map((c) => {
        const inCategory = rows.filter((r) => r.category === c.id);
        if (inCategory.length === 0) return null;
        return (
          <tbody key={c.id}>
            <tr>
              <th
                scope="colgroup"
                colSpan={25}
                className="pt-4 pb-1 text-left font-editorial text-lg font-bold"
              >
                {c.name}
              </th>
            </tr>
            {inCategory.map((r) => (
              <tr key={r.id}>
                <th scope="row" className="pr-2 text-left font-normal">
                  <Link
                    to={`/items/${r.id}`}
                    state={{ back }}
                    className={`flex min-h-8 flex-wrap items-baseline gap-x-1.5 rounded-sm underline-offset-4 hover:underline ${focus}`}
                  >
                    <span className="font-semibold">{r.name}</span>
                    <StatusLabels draft={r.draft} synthetic={r.synthetic} />
                  </Link>
                </th>
                {windows.map((w) => (
                  <td key={w} className="p-0">
                    <span
                      className={`block h-6 rounded-[2px] ${FILL[r.outlook[w] ?? "limited"]} ${
                        w === current ? "outline-2 outline-offset-1 outline-ink" : ""
                      }`}
                    >
                      <span className="sr-only">{word(r.outlook[w])}</span>
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        );
      })}
    </table>
  );
}

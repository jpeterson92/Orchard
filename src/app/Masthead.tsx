// Brand and date chip, the same on every screen (design system §6 "Brand and date").
import { Link } from "react-router";
import type { AppData } from "../shared/app-data";
import { type AppDate, setPlanDate } from "./date";
import { LeafMark } from "./icons";
import { plainDate } from "./today-view";

const fullDate = (iso: string) => {
  const { year, month, day } = plainDate(iso);
  return new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
};

const bannerDate = (iso: string) => chipDate(iso).split(" ").slice(1).join(" ");

/** A year ahead at most: planning is for the coming seasons. */
const maxPlan = (today: string) => {
  const { year, month, day } = plainDate(today);
  const d = new Date(Date.UTC(year + 1, month - 1, day - 1));
  return d.toISOString().slice(0, 10);
};

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

export function Masthead({ date }: { date: AppDate }) {
  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-olive/60 py-3">
        <Link
          to="/"
          className="flex min-h-11 items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <LeafMark />
          <span className="font-editorial text-2xl font-bold">Orchard</span>
        </Link>
        <DateChip date={date} />
      </header>
      {date.planning && (
        <aside
          aria-label="Planning date"
          className="mt-3 flex flex-wrap items-center gap-x-2 rounded-sm bg-olive/15 px-3 py-1 font-medium"
        >
          <span>Typical outlook for {bannerDate(date.iso)}</span>
          <span aria-hidden>·</span>
          <button
            type="button"
            onClick={() => setPlanDate(null)}
            className="min-h-11 rounded-sm text-olive underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Back to today
          </button>
        </aside>
      )}
    </>
  );
}

/**
 * The date chip is the date control (design system §6 "Brand and date"): a native date input laid over the chip,
 * so a tap opens the phone's own picker. A planning date fills the chip, and the banner below offers the way back.
 */
function DateChip({ date }: { date: AppDate }) {
  return (
    <label
      className={`relative flex min-h-11 items-center rounded-full border px-3 text-sm font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
        date.planning ? "border-olive bg-olive text-canvas" : "border-olive text-olive"
      }`}
    >
      <time dateTime={date.iso} aria-hidden>
        {chipDate(date.iso)}
      </time>
      <input
        type="date"
        aria-label={`Date: ${fullDate(date.iso)}${date.planning ? ", typical outlook" : ", today"}. Choose a date to plan for`}
        value={date.iso}
        min={date.today}
        max={maxPlan(date.today)}
        onChange={(e) => setPlanDate(e.target.value && e.target.value !== date.today ? e.target.value : null)}
        onClick={(e) => {
          try {
            e.currentTarget.showPicker();
          } catch {
            // Already open, or not allowed here: the input still takes typed dates.
          }
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
}

/** One line for preview builds, so the per-row Draft and Sample labels need no explaining. */
export function PreviewNotice({ data }: { data: AppData }) {
  const draft = data.items.some((i) => i.status === "draft");
  const synthetic = data.items.some((i) => i.synthetic);
  if (!draft && !synthetic) return null;
  // Its own landmark, so no page content sits outside one (axe "region").
  return (
    <aside aria-label="Preview" className="mt-3 rounded-sm bg-surface px-3 py-2 text-sm text-ink-secondary">
      Preview.
      {draft && " Draft guidance hasn't been reviewed yet."}
      {synthetic && " Sample items are made-up test data."}
    </aside>
  );
}

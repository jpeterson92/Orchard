// Brand and date chip, the same on every screen (design system §6 "Brand and date").
import { Link } from "react-router";
import type { AppData } from "../shared/app-data";
import { LeafMark } from "./icons";
import { plainDate } from "./today-view";

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

export function Masthead({ iso }: { iso: string }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-olive/60 py-3">
      <Link
        to="/"
        className="flex min-h-11 items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <LeafMark />
        <span className="font-editorial text-2xl font-bold">Orchard</span>
      </Link>
      <span className="rounded-full border border-olive px-3 py-1 text-sm font-medium text-olive">
        <time dateTime={iso}>{chipDate(iso)}</time>
      </span>
    </header>
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

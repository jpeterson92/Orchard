// Brand and date chip, the same on every screen (design system §6 "Brand and date").
import { Link } from "react-router";
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

// A 24-window season strip (design system §6 "Season strips"): Peak a solid ochre cell, Good a lighter green
// cell, Skip a hatched cell, Limited evidence an empty outlined cell, so no state relies on color alone.
// The strip is one image whose label gives the runs in words.
import type { Verdict } from "../shared/verdict";
import { outlookSummary } from "./item-view";
import { MONTHS } from "./today-view";

const FILL: Record<Verdict, string> = {
  peak: "bg-peak-icon",
  good: "bg-good-icon/55",
  skip: "strip-hatch",
  limited: "border border-rule",
};

export function SeasonStrip({
  outlook,
  today,
  months = false,
}: {
  outlook: readonly Verdict[];
  /** The current window, marked under its cell. */
  today?: number;
  /** Month initials under the strip. */
  months?: boolean;
}) {
  return (
    <div>
      <div role="img" aria-label={outlookSummary(outlook)} className="grid grid-cols-24 gap-0.5">
        {outlook.map((v, w) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: the 24 windows are fixed positions
            key={w}
            className={`h-5 rounded-[2px] ${FILL[v]} ${w === today ? "outline-2 outline-offset-1 outline-ink" : ""}`}
          />
        ))}
      </div>
      {months && (
        <div aria-hidden className="mt-1 grid grid-cols-12 text-center text-xs text-ink-secondary">
          {MONTHS.map((m) => (
            <span key={m}>{m[0]}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function StripLegend() {
  const entries: [Verdict, string][] = [
    ["peak", "Peak"],
    ["good", "Good"],
    ["skip", "Skip"],
    ["limited", "Limited evidence"],
  ];
  return (
    <ul aria-hidden className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-secondary">
      {entries.map(([v, label]) => (
        <li key={v} className="flex items-center gap-1.5">
          <span className={`size-3.5 rounded-[2px] ${FILL[v]}`} />
          {label}
        </li>
      ))}
    </ul>
  );
}

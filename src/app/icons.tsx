// One set of simple line icons (design system §6 "Navigation and icons"). Decorative: callers pair each with text.
import type { Verdict } from "../shared/verdict";
import { VERDICT_WORD } from "./today-view";

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  focusable: false,
} as const;

export function VerdictIcon({ verdict }: { verdict: Verdict }) {
  if (verdict === "peak")
    return (
      <svg aria-hidden="true" {...base} className="text-peak-icon" fill="currentColor" stroke="none">
        <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
      </svg>
    );
  if (verdict === "good")
    return (
      <svg aria-hidden="true" {...base} className="text-good-icon" strokeWidth={2.6}>
        <path d="M4.5 12.5l5 5 10-11" />
      </svg>
    );
  if (verdict === "skip")
    return (
      <svg aria-hidden="true" {...base} className="text-skip-icon">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
    );
  return (
    <svg aria-hidden="true" {...base} className="text-limited-icon">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 7.6v.1" />
    </svg>
  );
}

/** Navigation destinations: Today (the day's sun), Browse (a grid of categories), Calendar. */
export function TodayIcon() {
  return (
    <svg aria-hidden="true" {...base} width={22} height={22} strokeWidth={1.7}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
    </svg>
  );
}

export function BrowseIcon() {
  return (
    <svg aria-hidden="true" {...base} width={22} height={22} strokeWidth={1.7}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg aria-hidden="true" {...base} width={22} height={22} strokeWidth={1.7}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8.5 3v4M15.5 3v4" />
    </svg>
  );
}

export function LeafMark() {
  return (
    <svg aria-hidden="true" {...base} width={26} height={26} className="text-olive" strokeWidth={1.6}>
      <path d="M4 20c2-6 6-11 15-15-1 8-5 13-12 14" />
      <path d="M4 20c4-4 7-7 10-9" />
    </svg>
  );
}

/** The verdict as icon and word, announced once by its word (design system §6 "Verdicts"). */
export function VerdictMark({ verdict, size = "base" }: { verdict: Verdict; size?: "base" | "lg" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-editorial font-bold text-olive italic ${size === "lg" ? "text-xl" : "text-lg"}`}
    >
      <VerdictIcon verdict={verdict} />
      {VERDICT_WORD[verdict]}
    </span>
  );
}

export function SearchIcon() {
  return (
    <svg aria-hidden="true" {...base} width={20} height={20} strokeWidth={1.8}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5" />
    </svg>
  );
}

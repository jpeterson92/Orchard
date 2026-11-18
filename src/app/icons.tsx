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

/** Quiet preview labels beside a name: unreviewed guidance and made-up test data. */
export function StatusLabels({ draft, synthetic }: { draft: boolean; synthetic: boolean }) {
  if (!draft && !synthetic) return null;
  return (
    <span className="text-xs font-semibold tracking-wide text-ink-secondary uppercase">
      {[draft && "Draft", synthetic && "Sample"].filter(Boolean).join(" · ")}
    </span>
  );
}

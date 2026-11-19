// The item page for a date (product spec §5 "Item page"): the engine's result for one item, worded for display.
import type { AppData, AppItem } from "../shared/app-data";
import { WINDOW_COUNT, windowIndex } from "../shared/time";
import {
  type Confidence,
  confidenceRank,
  evaluate,
  type PlainDate,
  type Reason,
  typicalOutlook,
  type Verdict,
  verdictRank,
  type WeakProperty,
} from "../shared/verdict";
import {
  atDate,
  GENERIC_REASON,
  listNames,
  MONTHS,
  originName,
  reasonText,
  tags,
  varietyLine,
  windowPhrase,
} from "./today-view";

/** One line of the variety summary: "Peak: Honeycrisp, Gala and Fuji". `verdict` null: not in stores now. */
export interface VarietyGroup {
  verdict: Verdict | null;
  names: string[];
}

/** Rated varieties grouped by today's verdict, best first, then those not usually in stores now. Unrated varieties
 * are left out: they have no verdict to report. */
export function varietySummary(rows: readonly VarietyRow[]): VarietyGroup[] {
  const order: (Verdict | null)[] = ["peak", "good", "skip", "limited", null];
  return order.flatMap((verdict) => {
    const names = rows
      .filter(
        (r) => r.verdict !== null && (verdict === null ? !r.inStore : r.inStore && r.verdict === verdict),
      )
      .map((r) => r.name);
    return names.length > 0 ? [{ verdict, names }] : [];
  });
}

export interface VarietyRow {
  id: string;
  name: string;
  /** The variety's own painting, or null for the placeholder (never its item's art). */
  art: string | null;
  /** Null for a variety without variety-specific evidence: listed, never ranked. */
  verdict: Verdict | null;
  confidence: Confidence | null;
  inStore: boolean;
  outlook: Verdict[] | null;
}

export interface SupplyRun {
  months: string;
  origins: string;
}

export interface ItemView {
  id: string;
  name: string;
  art: string | null;
  varietyLine: string | null;
  verdict: Verdict;
  tags: string[];
  /** 1–3 short reasons, the headline first. */
  reasons: string[];
  confidence: Confidence;
  /** Why confidence isn't High, in plain words. */
  confidenceNote: string | null;
  basis: string;
  supplyDate: string | null;
  reviewDate: string;
  /** "Depends on the label" and other context notes, shown only when relevant. */
  notes: string[];
  /** The "Depends on the label" note applies: the label control then sits just below the notes. */
  labelNote: boolean;
  labelChoices: LabelChoices;
  varieties: VarietyRow[];
  /** Items rated by variety: where each rated variety falls today, for a quick check at the top of the page. */
  varietySummary: VarietyGroup[];
  pick: string[];
  avoid: string[];
  types: AppItem["types"];
  store: string;
  ripen: string | null;
  prep: string;
  outlook: Verdict[];
  window: number;
  supply: SupplyRun[];
  draft: boolean;
  synthetic: boolean;
}

const RATED: Record<"prime" | "fair" | "poor", string> = {
  prime: "typically at its best now",
  fair: "typically eats well now",
  poor: "typically below its best now",
};

const WEAK: Record<WeakProperty, string> = {
  coverage: "little evidence covers this time of year",
  relevance: "no national supply data confirms what stores carry",
  freshness: "some of the data behind it is out of date",
  agreement: "the signals behind it disagree",
};

const monthYear = (iso: string) => {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]?.slice(0, 3)} ${y}`;
};

function reasonLines(item: AppItem, data: AppData, reasons: readonly Reason[]): string[] {
  const out: string[] = [];
  for (const r of reasons) {
    if (r.code === "rated") {
      const subject = r.variety
        ? (item.varieties.find((v) => v.id === r.variety)?.name ?? r.variety)
        : r.origin
          ? `${originName(r.origin, data)} supply`
          : item.name;
      out.push(`${subject}: ${RATED[r.rating]}.`);
    } else if (r.code === "supply-thin") out.push("Supply is typically thin now.");
    else if (r.code === "peak-not-worth-seeking")
      out.push("Tastes much the same in and out of season, so never rated Peak.");
    else if (r.code === "far-origin")
      out.push(`Shipped from ${originName(r.origin, data)}, so rated Good at most.`);
    else if (r.code === "selection") {
      const label = item.selections.find((s) => s.id === r.selection)?.label ?? r.selection;
      const now = r.level === "peak" ? "is at its best now" : "is good now";
      out.push(`${label.charAt(0).toUpperCase()}${label.slice(1)} ${now}; most supply isn't.`);
    } else if (r.code === "main-peak")
      out.push(
        `Its Peak season is ${r.from === r.to ? windowPhrase(r.from) : `${windowPhrase(r.from)} to ${windowPhrase(r.to)}`}.`,
      );
  }
  return out;
}

/** Consecutive months with the same main origins, merged; December joins January when they match. */
export function supplyRuns(item: AppItem, data: AppData): SupplyRun[] {
  const key = (m: number) =>
    (item.inputs.typicalOrigins[m] ?? [])
      .filter((o) => !item.inputs.minorOrigins[m]?.includes(o))
      .slice(0, 2)
      .map((o) => originName(o, data))
      .join(", ");
  const runs: { from: number; to: number; origins: string }[] = [];
  for (let m = 0; m < 12; m++) {
    const last = runs.at(-1);
    if (last && last.origins === key(m)) last.to = m;
    else runs.push({ from: m, to: m, origins: key(m) });
  }
  const first = runs[0];
  const last = runs.at(-1);
  if (runs.length > 1 && first && last && first.origins === last.origins) {
    first.from = last.from;
    runs.pop();
  }
  const short = (m: number) => MONTHS[m]?.slice(0, 3) ?? "";
  return runs.map((r) => ({
    months: r.from === r.to ? short(r.from) : `${short(r.from)}–${short(r.to)}`,
    origins: r.origins || "No typical origins on record",
  }));
}

/** "Peak late September to early November; Good early January to late August": the strip as words. */
export function outlookSummary(outlook: readonly Verdict[]): string {
  const WORD: Record<Verdict, string> = {
    peak: "Peak",
    good: "Good",
    skip: "Skip",
    limited: "Limited evidence",
  };
  if (outlook.every((v) => v === outlook[0])) return `${WORD[outlook[0] ?? "limited"]} all year`;
  // Start at a change so a run across the new year stays whole.
  const start = outlook.findIndex((v, w) => v !== outlook[(w + WINDOW_COUNT - 1) % WINDOW_COUNT]);
  const parts: string[] = [];
  let from = start;
  for (let k = 1; k <= WINDOW_COUNT; k++) {
    const w = (start + k) % WINDOW_COUNT;
    if (k === WINDOW_COUNT || outlook[w] !== outlook[from]) {
      const to = (start + k - 1) % WINDOW_COUNT;
      const v = outlook[from] ?? "limited";
      parts.push(
        `${WORD[v]} ${from === to ? windowPhrase(from) : `${windowPhrase(from)} to ${windowPhrase(to)}`}`,
      );
      from = w;
    }
  }
  return parts.join("; ");
}

export function itemView(
  data: AppData,
  id: string,
  date: PlainDate,
  mode: "today" | "typical" = "today",
): ItemView | null {
  const item = data.items.find((i) => i.inputs.id === id);
  if (!item) return null;
  const window = windowIndex(date.month, date.day);
  const result = evaluate(item.inputs, { date }, data.env);

  // The card's reason leads when it says something specific (Last call, when it improves, why it's unknown);
  // the generic "At its best this time of year" gives way to the rating behind it.
  const headline = reasonText(result.verdict, result.reasons, result.markers);
  // Items rated by variety: the variety summary says which varieties hold the verdict, so the reasons don't repeat it.
  const lines = reasonLines(
    item,
    data,
    result.reasons.filter((r) => !(r.code === "rated" && r.variety)),
  );
  const generic = headline === GENERIC_REASON.peak || headline === GENERIC_REASON.good;
  const reasons = (generic && lines.length > 0 ? lines : [headline, ...lines]).slice(0, 3);

  const notes: string[] = [];
  const selection = item.selections.find((s) => s.id === result.selection);
  if (selection) notes.push(`How to find it: ${selection.cue}`);
  // P20: which origins hold the verdict, and which often disappoint.
  const label: string[] = [];
  for (const r of result.reasons)
    if (r.code === "look-for")
      label.push(
        `${result.verdict === "peak" ? "best" : "good"} now from ${listNames(r.origins.map((o) => originName(o, data)))}`,
      );
  for (const r of result.reasons)
    if (r.code === "typical-origin-poor")
      label.push(`often disappointing from ${originName(r.origin, data)}`);
  if (label.length > 0) notes.push(`Depends on the label: ${label.join("; ")}.`);

  const rated = new Set(item.inputs.varieties.map((v) => v.id));
  const varieties: VarietyRow[] = item.inputs.varieties
    .map((v) => {
      const r = result.byVariety[v.id];
      return {
        id: v.id,
        name: item.varieties.find((x) => x.id === v.id)?.name ?? v.id,
        art: item.varieties.find((x) => x.id === v.id)?.art ?? null,
        verdict: r?.verdict ?? null,
        confidence: r?.confidence ?? null,
        inStore: r?.inStore ?? false,
        outlook: typicalOutlook(item.inputs, data.env, date.year, v.id),
      };
    })
    // Best right now first: in stores, then verdict, then confidence; file order breaks ties (stable sort).
    .sort(
      (a, b) =>
        Number(b.inStore) - Number(a.inStore) ||
        verdictRank(b.verdict ?? "limited") - verdictRank(a.verdict ?? "limited") ||
        confidenceRank(b.confidence ?? "low") - confidenceRank(a.confidence ?? "low"),
    );
  for (const v of item.varieties)
    if (!rated.has(v.id))
      varieties.push({
        id: v.id,
        name: v.name,
        art: v.art,
        verdict: null,
        confidence: null,
        inStore: false,
        outlook: null,
      });

  const supplyBacked = item.inputs.evidenceBasis === "supply+assessment";
  const reviewed = item.status === "reviewed";
  return {
    id: item.inputs.id,
    name: item.name,
    art: item.art,
    varietyLine: varietyLine(item, result, data),
    verdict: result.verdict,
    tags: tags(item, result.markers),
    reasons: reasons.map((r) => atDate(r, mode)),
    confidence: result.confidence,
    confidenceNote:
      result.weakProperties.length > 0 ? result.weakProperties.map((w) => WEAK[w]).join("; ") : null,
    basis: `${reviewed ? "Reviewed seasonal assessment" : "Draft seasonal assessment"}${supplyBacked ? " + typical national supply" : " only"}`,
    supplyDate:
      supplyBacked && data.env.snapshotTo ? `Supply data through ${monthYear(data.env.snapshotTo)}` : null,
    reviewDate:
      reviewed && item.reviewedOn
        ? `Guidance reviewed ${monthYear(item.reviewedOn)}`
        : "Guidance not yet reviewed",
    notes: notes.map((n) => atDate(n, mode)),
    labelNote: result.labelNote,
    labelChoices: labelChoices(item, data, window),
    varieties,
    varietySummary: varietySummary(varieties),
    pick: item.pick,
    avoid: item.avoid,
    types: item.types,
    store: item.store.text,
    ripen: item.ripen,
    prep: item.prep,
    outlook: typicalOutlook(item.inputs, data.env, date.year),
    window,
    supply: supplyRuns(item, data),
    draft: item.status === "draft",
    synthetic: item.synthetic,
  };
}

// "What does the label say?" (product spec §5 "Item page", §7 "Label-based advice"): rules 1–5 re-run for the
// origin or variety the shopper picks.

export interface LabelOption {
  /** "o:mx" or "v:honeycrisp". */
  value: string;
  text: string;
}

export interface LabelChoices {
  varieties: LabelOption[];
  origins: LabelOption[];
}

export interface LabelResult {
  verdict: Verdict;
  reasons: string[];
  confidence: Confidence;
  /** A variety's best uses, as the tip that changes with the label. */
  bestUses: string[];
}

/** Varieties as labels name them; origins usual this month first (top-ranked first), then the other assessed ones.
 * Origins are offered only where origins are rated, so an item rated only by variety never lists dead ends. */
export function labelChoices(item: AppItem, data: AppData, window: number): LabelChoices {
  const varieties = item.varieties.map((v) => ({ value: `v:${v.id}`, text: v.label }));
  const rated = Object.keys(item.inputs.origins);
  if (rated.length === 0) return { varieties, origins: [] };
  const usual = item.inputs.typicalOrigins[Math.floor(window / 2)] ?? [];
  const rest = rated
    .filter((o) => !usual.includes(o))
    .sort((a, b) => originName(a, data).localeCompare(originName(b, data)));
  const origins = [...usual, ...rest].map((o) => ({ value: `o:${o}`, text: originName(o, data) }));
  return { varieties, origins };
}

export function labelResult(
  data: AppData,
  id: string,
  date: PlainDate,
  choice: string,
  mode: "today" | "typical" = "today",
): LabelResult | null {
  const item = data.items.find((i) => i.inputs.id === id);
  const [kind, key] = [choice.slice(0, 2), choice.slice(2)];
  if (!item || !key || (kind !== "o:" && kind !== "v:")) return null;
  const variety = kind === "v:" ? item.varieties.find((v) => v.id === key) : undefined;
  const ctx = kind === "v:" ? { labelVariety: key } : { labelOrigin: key };
  const r = evaluate(item.inputs, { date, ...ctx }, data.env);

  const subject = variety ? variety.name : originName(key, data);
  const unrated = r.reasons.some((x) => x.code === "origin-unrated" || x.code === "variety-unrated");
  const headline = unrated
    ? variety
      ? `${subject} isn't rated yet.`
      : `${item.name} from ${subject} aren't assessed yet.`
    : r.verdict === "limited"
      ? reasonText(r.verdict, r.reasons, r.markers)
      : null;
  const lines = reasonLines(item, data, r.reasons);
  const timing = r.markers.some((m) => m.kind === "last-call" || m.kind === "improves")
    ? reasonText(r.verdict, r.reasons, r.markers)
    : null;
  const reasons = [headline, ...lines, timing].filter((x): x is string => x !== null).slice(0, 3);
  return {
    verdict: r.verdict,
    reasons: reasons.map((x) => atDate(x, mode)),
    confidence: r.confidence,
    bestUses: variety?.bestUses ?? [],
  };
}

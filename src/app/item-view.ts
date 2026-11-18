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
import { MONTHS, originName, reasonText, tags, varietyLine, windowPhrase } from "./today-view";

export interface VarietyRow {
  id: string;
  name: string;
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
  advisory: string | null;
  varieties: VarietyRow[];
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

const GENERIC = { peak: "At its best this time of year.", good: "Eating well this time of year." };

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

export function itemView(data: AppData, id: string, date: PlainDate): ItemView | null {
  const item = data.items.find((i) => i.inputs.id === id);
  if (!item) return null;
  const window = windowIndex(date.month, date.day);
  const result = evaluate(item.inputs, { date, mode: "today" }, data.env);

  // The card's reason leads when it says something specific (Last call, when it improves, why it's unknown);
  // the generic "At its best this time of year" gives way to the rating behind it.
  const headline = reasonText(result.verdict, result.reasons, result.markers);
  const severalVarieties = (result.varietyLine?.length ?? 0) > 1;
  const lines = reasonLines(
    item,
    data,
    result.reasons.filter((r) => !(severalVarieties && r.code === "rated" && r.variety)),
  );
  const generic = headline === GENERIC.peak || headline === GENERIC.good;
  const reasons = (generic && lines.length > 0 ? lines : [headline, ...lines]).slice(0, 3);

  const notes: string[] = [];
  const poor = result.reasons.find((r) => r.code === "typical-origin-poor");
  if (poor?.code === "typical-origin-poor")
    notes.push(
      `Depends on the label: ${item.name} from ${originName(poor.origin, data)} often disappoint now.`,
    );

  const advisoryId = result.advisory;
  const advisory = advisoryId
    ? (() => {
        const a = item.inputs.advisories.find((x) => x.id === advisoryId);
        const where = a?.origins?.length
          ? ` from ${a.origins.map((o) => originName(o, data)).join(", ")}`
          : "";
        const until = a ? ` · through ${monthDay(a.to)}` : "";
        const note = data.advisoryNotes[advisoryId];
        return `Affects: ${item.name.toLowerCase()}${where}${until}.${note ? ` ${note}` : ""}`;
      })()
    : null;

  const rated = new Set(item.inputs.varieties.map((v) => v.id));
  const varieties: VarietyRow[] = item.inputs.varieties
    .map((v) => {
      const r = result.byVariety[v.id];
      return {
        id: v.id,
        name: item.varieties.find((x) => x.id === v.id)?.name ?? v.id,
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
    varietyLine: varietyLine(item, result.varietyLine, result.verdict),
    verdict: result.verdict,
    tags: tags(item, result.markers),
    reasons,
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
    notes,
    advisory,
    varieties,
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

function monthDay(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]?.slice(0, 3)} ${d}`;
}

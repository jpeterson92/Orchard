// Search (product spec §5 "Search", design system §6 "Search"): an overlay, not a route. The field is pinned above
// the tab bar on phone and sits in the top bar from 600 px; either opens one dialog whose results are links, each
// with its verdict. Arrow keys move between the field and the results; Enter opens the first result.
import { createContext, type KeyboardEvent, type ReactNode, use, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import { Art } from "./Art";
import { useAppDate } from "./date";
import { SearchIcon, StatusLabels, VerdictMark } from "./icons";
import { count } from "./measure";
import { type SearchResult, search, searchIndex } from "./search-view";
import { plainDate } from "./today-view";

const data = appJson as unknown as AppData;
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Built on the first query, not at load: most visits never search. */
let cachedIndex: ReturnType<typeof searchIndex> | null = null;
const index = () => {
  cachedIndex ??= searchIndex(data);
  return cachedIndex;
};

const OpenSearch = createContext<() => void>(() => {});

/** Holds the one search dialog; the fields in the tab bar and top bar open it. */
export function SearchProvider({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const open = () => {
    dialog.current?.showModal();
    input.current?.focus();
  };
  return (
    <OpenSearch value={open}>
      {children}
      <SearchDialog dialog={dialog} input={input} />
    </OpenSearch>
  );
}

/** Looks like a field and opens the dialog, so the keyboard comes up in a screen made for results. */
export function SearchField({ className = "" }: { className?: string }) {
  const open = use(OpenSearch);
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={open}
      className={`flex min-h-11 items-center gap-2 rounded-full border border-rule bg-surface px-4 text-left text-ink-secondary ${focus} ${className}`}
    >
      <SearchIcon />
      {/* Icon only in the narrowest top bar, where the destinations and date need the room. */}
      <span className="truncate sm:max-md:sr-only">Search produce</span>
    </button>
  );
}

function SearchDialog({
  dialog,
  input,
}: {
  dialog: React.RefObject<HTMLDialogElement | null>;
  input: React.RefObject<HTMLInputElement | null>;
}) {
  const [query, setQuery] = useState("");
  const date = useAppDate(data);
  const navigate = useNavigate();
  const list = useRef<HTMLUListElement>(null);
  const outcome =
    query.trim() === "" ? ({ kind: "empty" } as const) : search(index(), data, query, plainDate(date.iso));
  const shown = outcome.kind === "results" ? outcome.results : outcome.kind === "none" ? outcome.closest : [];
  const close = () => dialog.current?.close();

  const links = () => Array.from(list.current?.querySelectorAll("a") ?? []);
  const onFieldKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowDown") return;
    e.preventDefault();
    links()[0]?.focus();
  };
  const onListKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const all = links();
    const at = all.indexOf(document.activeElement as HTMLAnchorElement);
    const next = at + (e.key === "ArrowDown" ? 1 : -1);
    if (next < 0) input.current?.focus();
    else all[Math.min(next, all.length - 1)]?.focus();
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the backdrop tap's keyboard equivalent is Escape, built in.
    <dialog
      ref={dialog}
      aria-label="Search produce"
      onClose={() => {
        // A search that ends with nothing matched counts once, without its text (product spec §2).
        if (outcome.kind === "none") count("nomatch");
        setQuery("");
      }}
      // A tap on the dimmed backdrop (wide screens) closes it, like Escape.
      onClick={(e) => e.target === e.currentTarget && close()}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-canvas text-ink backdrop:bg-ink/40 sm:mx-auto sm:mt-20 sm:h-auto sm:max-h-[75dvh] sm:max-w-xl sm:rounded-lg sm:shadow-xl"
    >
      <div className="flex flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-6 sm:px-6 sm:pt-5">
        <search>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const first = shown[0];
              if (outcome.kind === "results" && first) {
                close();
                navigate(`/items/${first.item}${first.label ? "#label" : ""}`, {
                  state: { label: first.label },
                });
              }
            }}
            className="flex items-center gap-2"
          >
            <label
              className={`flex min-h-12 flex-1 items-center gap-2 rounded-full border border-olive bg-surface px-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent`}
            >
              <SearchIcon />
              <input
                ref={input}
                type="search"
                aria-label="Search produce"
                placeholder="Produce or variety"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onFieldKey}
                className="min-w-0 flex-1 bg-transparent text-lg text-ink outline-none placeholder:text-ink-secondary"
              />
            </label>
            <button
              type="button"
              onClick={close}
              className={`min-h-11 rounded-sm px-1 font-semibold text-olive ${focus}`}
            >
              Close
            </button>
          </form>
        </search>
        {date.planning && (
          <p className="mt-2 text-sm text-ink-secondary">Typical outlook for {shortDate(date.iso)}</p>
        )}

        {/* Announced as the query changes, so a screen-reader user hears whether anything matched. */}
        <p role="status" className="sr-only">
          {outcome.kind === "results"
            ? `${outcome.results.length} ${outcome.results.length === 1 ? "result" : "results"}`
            : outcome.kind === "none"
              ? "We don't cover this yet"
              : ""}
        </p>

        {outcome.kind === "empty" && (
          <p className="mt-6 text-ink-secondary">
            Type a fruit, vegetable or variety, like Honeycrisp. Or{" "}
            <Link to="/browse" onClick={close} className={`font-semibold text-olive underline ${focus}`}>
              browse every category
            </Link>
            .
          </p>
        )}
        {outcome.kind === "none" && (
          <div className="mt-6">
            <p className="font-editorial text-xl font-bold">We don't cover this yet</p>
            <p className="mt-1 text-ink-secondary">
              {outcome.closest.length > 0 ? "The closest we cover:" : "Check the spelling, or "}
              {outcome.closest.length === 0 && (
                <>
                  <Link
                    to="/browse"
                    onClick={close}
                    className={`font-semibold text-olive underline ${focus}`}
                  >
                    browse every category
                  </Link>
                  .
                </>
              )}
            </p>
          </div>
        )}
        {shown.length > 0 && (
          <ul ref={list} onKeyDown={onListKey} className="mt-3 overflow-y-auto">
            {shown.map((r) => (
              <ResultRow key={r.key} result={r} onOpen={close} />
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}

/** A lookup row: the verdict shows in the result; a tap opens the page (a variety opens at that variety). */
function ResultRow({ result: r, onOpen }: { result: SearchResult; onOpen: () => void }) {
  return (
    <li className="border-b border-rule">
      <Link
        to={`/items/${r.item}${r.label ? "#label" : ""}`}
        state={{ label: r.label }}
        onClick={onOpen}
        className={`flex items-center gap-3 rounded-sm py-2.5 ${focus}`}
      >
        <Art id={r.art} sizes="48px" className="size-12 shrink-0" />
        <span className="block min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-editorial text-lg leading-tight font-bold">{r.title}</span>
            {r.label && <span className="font-editorial text-ink-secondary">{r.subtitle}</span>}
            <StatusLabels draft={r.draft} synthetic={r.synthetic} />
          </span>
          {!r.label && r.subtitle && (
            <span className="block font-editorial text-ink-secondary">{r.subtitle}</span>
          )}
          <span className="block">
            <VerdictMark verdict={r.verdict} />
            {r.tags.length > 0 && (
              <span className="text-sm font-medium text-olive"> · {r.tags.join(" · ")}</span>
            )}
          </span>
        </span>
        <span aria-hidden className="text-olive">
          →
        </span>
      </Link>
    </li>
  );
}

const shortDate = (iso: string) => {
  const { year, month, day } = plainDate(iso);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
};

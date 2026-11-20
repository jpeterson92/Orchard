// Browse (product spec §4): categories under Fruit, Vegetables and Other, then a category's items as list rows that
// open the item page directly, each with its verdict so the answer often shows without a tap.
import { Link, useParams } from "react-router";
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import { Art } from "./Art";
import { type BrowseRow, browseGroups, categoryRows } from "./browse-view";
import { useAppDate } from "./date";
import { Arrow, VerdictMark } from "./icons";
import { PageFrame, PageTitle } from "./Masthead";
import { plainDate } from "./today-view";

const data = appJson as unknown as AppData;

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const backLink = `inline-flex min-h-11 items-center gap-1 font-semibold text-olive underline-offset-4 hover:underline ${focus}`;

/** Where the item page's back link returns to, carried in the link's state. */
export interface BackTo {
  to: string;
  label: string;
}

export function Browse() {
  const date = useAppDate(data);
  return (
    <PageFrame date={date} reading>
      <main>
        <PageTitle name="Browse" />
        <h1 className="mt-6 font-editorial text-3xl font-bold">Browse</h1>
        {browseGroups(data).map((g) => (
          <section key={g.label} className="mt-6">
            <h2 className="flex items-center gap-4 font-editorial text-2xl font-bold">
              {g.label}
              <span aria-hidden className="h-px flex-1 bg-olive/60" />
            </h2>
            <ul>
              {g.categories.map((c) => (
                <li key={c.id} className="border-b border-rule">
                  <Link
                    to={`/browse/${c.id}`}
                    className={`flex min-h-14 items-center gap-3 rounded-sm py-2 ${focus}`}
                  >
                    <span className="flex-1 font-editorial text-xl font-bold">{c.name}</span>
                    <span className="text-sm text-ink-secondary">
                      {c.count} {c.count === 1 ? "item" : "items"}
                    </span>
                    <span aria-hidden className="text-olive">
                      <Arrow />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </PageFrame>
  );
}

export function BrowseCategory() {
  const { category = "" } = useParams();
  const date = useAppDate(data);
  const name = data.categories.find((c) => c.id === category)?.name;
  const rows = categoryRows(data, category, plainDate(date.iso));
  const back: BackTo = { to: `/browse/${category}`, label: name ?? "Browse" };

  return (
    <PageFrame date={date} reading>
      <nav aria-label="Back">
        <Link to="/browse" className={`${backLink} mt-1`}>
          <Arrow direction="left" /> Browse
        </Link>
      </nav>
      <main>
        {rows && name ? (
          <>
            <PageTitle name={name} />
            <h1 className="mt-2 font-editorial text-3xl font-bold">{name}</h1>
            <ul className="mt-2">
              {rows.map((r) => (
                <Row key={r.id} row={r} back={back} />
              ))}
            </ul>
          </>
        ) : (
          <>
            <PageTitle name="Category not found" />
            <h1 className="mt-2 font-editorial text-3xl font-bold">Category not found</h1>
            <p className="mt-2">We don't have a category at this address.</p>
          </>
        )}
      </main>
    </PageFrame>
  );
}

/** A list row is a lookup: the whole row opens the item page (product spec §5 "Card behavior"). */
function Row({ row, back }: { row: BrowseRow; back: BackTo }) {
  return (
    <li className="border-b border-rule">
      <Link
        to={`/items/${row.id}`}
        state={{ back }}
        className={`flex items-center gap-4 rounded-sm py-3 ${focus}`}
      >
        <Art id={row.art} sizes="56px" className="size-14 shrink-0" />
        <span className="block min-w-0 flex-1">
          <span className="block font-editorial text-xl leading-tight font-bold">{row.name}</span>
          {row.varietyLine && <span className="block text-sm text-ink-secondary">{row.varietyLine}</span>}
          <span className="block">
            <VerdictMark verdict={row.verdict} />
            {row.tags.length > 0 && (
              <span className="text-sm font-medium text-olive"> · {row.tags.join(" · ")}</span>
            )}
          </span>
        </span>
        <span aria-hidden className="text-olive">
          <Arrow />
        </span>
      </Link>
    </li>
  );
}

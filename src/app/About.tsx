// About, recovery, Methods and Privacy. The long-form text is Markdown from content/,
// rendered at build time; Methods then lists the sources the bundled items cite, the USDA snapshot and the model panel.
import { Link } from "react-router";
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import { useAppDate } from "./date";
import { Arrow } from "./icons";
import { PageFrame, PageTitle } from "./Masthead";
import { SearchField } from "./Search";

const data = appJson as unknown as AppData;
const { about } = data;

const action =
  "inline-flex min-h-11 items-center gap-1 rounded-sm font-semibold text-olive underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const monthYear = (ym: string) => {
  const [year, month] = ym.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year ?? 2000, (month ?? 1) - 1, 1)),
  );
};
const dayMonthYear = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  );

function TextPage({
  title,
  text,
  children,
}: {
  title: string;
  text: AppData["about"]["methods"];
  children?: React.ReactNode;
}) {
  const date = useAppDate(data);
  return (
    <PageFrame date={date} reading>
      <main>
        <PageTitle name={title} />
        <h1 className="mt-6 font-editorial text-3xl font-bold">{title}</h1>
        {/* Built from our own Markdown in content/, never from user input. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: build-time HTML from committed content */}
        <div className="page-text" dangerouslySetInnerHTML={{ __html: text.html }} />
        {children}
      </main>
    </PageFrame>
  );
}

export function About() {
  const date = useAppDate(data);
  return (
    <PageFrame date={date} reading>
      <main>
        <PageTitle name="About" />
        <div className="mt-6 flex items-center gap-1 border-b border-rule pb-4 sm:gap-6">
          <h1 className="min-w-0 flex-1">
            <span className="sr-only">About Orchard</span>
            <picture>
              <source media="(prefers-color-scheme: dark)" srcSet="/brand/wordmark-dark.webp" />
              <img
                src="/brand/wordmark.webp"
                alt=""
                width={880}
                height={235}
                loading="lazy"
                className="h-auto w-full max-w-96"
              />
            </picture>
          </h1>
          <img
            src="/brand/blossom.webp"
            alt=""
            width={420}
            height={420}
            loading="lazy"
            className="size-24 sm:size-36"
          />
        </div>
        <p className="mt-5 max-w-prose font-editorial text-xl leading-relaxed">
          Orchard helps you see what’s worth buying right now at U.S. supermarkets and how to pick, store, and
          ripen it.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6">
          <Link to="/" className={action}>
            See what’s good today <Arrow />
          </Link>
          <Link to="/methods" className={action}>
            How Orchard rates produce <Arrow />
          </Link>
        </div>
      </main>
    </PageFrame>
  );
}

export function NotFound() {
  const date = useAppDate(data);
  return (
    <PageFrame date={date} reading>
      <main>
        <PageTitle name="Page not found" />
        <div className="mt-6 flex items-center gap-2 border-b border-rule pb-4 sm:gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="font-editorial text-3xl font-bold">Page not found</h1>
            <p className="mt-2">Try searching for a fruit, vegetable, or variety.</p>
          </div>
          <img
            src="/brand/blossom.webp"
            alt=""
            width={420}
            height={420}
            loading="lazy"
            className="size-24 sm:size-36"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <SearchField />
          <Link to="/browse" className={action}>
            Browse produce <Arrow />
          </Link>
        </div>
      </main>
    </PageFrame>
  );
}

export function Methods() {
  const tiers = [
    { tier: "authoritative", label: "Authoritative" },
    { tier: "mainstream", label: "Mainstream" },
  ] as const;
  return (
    <TextPage title="How Orchard rates produce" text={about.methods}>
      <div className="page-text">
        <h2 id="sources">Sources</h2>
        {about.snapshot && (
          <p>
            <strong>USDA supply data:</strong> USDA Market News shipment and import reports,{" "}
            {monthYear(about.snapshot.from)} to {monthYear(about.snapshot.to)}. Taken{" "}
            {dayMonthYear(about.snapshot.derived)} and refreshed about once a year.
          </p>
        )}
        <p>Seasonal sources are checked again when an item's assessment is reviewed, at least once a year.</p>
        {tiers.map(({ tier, label }) => {
          const list = about.sources.filter((s) => s.tier === tier);
          if (list.length === 0) return null;
          return (
            <section key={tier}>
              <h3>
                {label} ({list.length})
              </h3>
              <ul className="sources">
                {list.map((s) => (
                  <li key={s.id}>
                    <a href={s.url} rel="noopener">
                      {s.title}
                    </a>
                    <span>
                      {" "}
                      · {s.publisher} · read {dayMonthYear(s.accessed)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {about.panel.length > 0 && (
          <>
            <h2 id="model-panel">The AI model panel</h2>
            <ul>
              {about.panel.map((r) => (
                <li key={`${r.model}-${r.date}`}>
                  {r.model} ({r.provider}), {dayMonthYear(r.date)}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </TextPage>
  );
}

export function Privacy() {
  return <TextPage title="Privacy" text={about.privacy} />;
}

// Methods and Privacy (product spec §5 "Methods page", §10 Privacy and Trust). The text is Markdown from content/,
// rendered at build time; Methods then lists the sources the bundled items cite, the USDA snapshot and the model panel.
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import { useAppDate } from "./date";
import { Masthead, PageTitle } from "./Masthead";

const data = appJson as unknown as AppData;
const { about } = data;

const page = "mx-auto max-w-2xl px-4 pb-12 sm:px-6";

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
    <div className={page}>
      <Masthead date={date} />
      <main>
        <PageTitle name={title} />
        <h1 className="mt-6 font-editorial text-3xl font-bold">{title}</h1>
        {/* Built from our own Markdown in content/, never from user input. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: build-time HTML from committed content */}
        <div className="page-text" dangerouslySetInnerHTML={{ __html: text.html }} />
        {children}
      </main>
    </div>
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

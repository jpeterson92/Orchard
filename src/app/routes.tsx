import { Link, Outlet, type RouteObject, ScrollRestoration } from "react-router";
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import { Methods, Privacy } from "./About";
import { Browse, BrowseCategory } from "./Browse";
import { Calendar } from "./Calendar";
import { Guide } from "./Guide";
import { ItemPage } from "./ItemPage";
import { TabBar } from "./Nav";
import { SearchProvider } from "./Search";
import { Today } from "./Today";
import { VarietyPage } from "./VarietyPage";
import { hasVarietyPage, varietyPath } from "./variety-view";

const data = appJson as unknown as AppData;

const footerLink =
  "inline-flex min-h-11 items-center rounded-sm text-ink-secondary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

// Back returns to the exact scroll position; a new page opens at the top (product spec §4).
function Layout() {
  return (
    // On phone the fixed search field and tab bar sit below the page, so the last row is never under them
    // (design system §5).
    <SearchProvider>
      <div className="pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-0">
        <Outlet />
        <footer className="mx-auto max-w-2xl border-t border-rule px-4 py-2 text-sm sm:px-6">
          <nav aria-label="About Orchard" className="flex gap-6">
            <Link to="/methods" className={footerLink}>
              How Orchard rates produce
            </Link>
            <Link to="/privacy" className={footerLink}>
              Privacy
            </Link>
          </nav>
        </footer>
        <TabBar />
        {/* Every first load shares the key "default"; keying those by path stops one page restoring another's. */}
        <ScrollRestoration getKey={(l) => (l.key === "default" ? l.pathname : l.key)} />
      </div>
    </SearchProvider>
  );
}

// One route table, shared by the browser router and the build-time prerender.
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Today /> },
      { path: "/browse", element: <Browse /> },
      { path: "/browse/:category", element: <BrowseCategory /> },
      { path: "/calendar", element: <Calendar /> },
      { path: "/items/:id", element: <ItemPage /> },
      { path: "/items/:id/:variety", element: <VarietyPage /> },
      { path: "/guides/:id", element: <Guide /> },
      { path: "/methods", element: <Methods /> },
      { path: "/privacy", element: <Privacy /> },
    ],
  },
];

// Routes written to static HTML at build time: Today, Browse and each category, Calendar, Methods, Privacy, one page per
// bundled item, one per variety guide, and one per guide variety.
export const prerenderPaths = [
  "/",
  "/browse",
  ...data.categories.map((c) => `/browse/${c.id}`),
  "/calendar",
  "/methods",
  "/privacy",
  ...data.items.map((i) => `/items/${i.inputs.id}`),
  ...data.guides.map((g) => `/guides/${g.id}`),
  ...data.items.filter(hasVarietyPage).flatMap((i) => i.varieties.map((v) => varietyPath(i.inputs.id, v.id))),
];

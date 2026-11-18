import { Outlet, type RouteObject, ScrollRestoration } from "react-router";
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import { Browse, BrowseCategory } from "./Browse";
import { Calendar } from "./Calendar";
import { ItemPage } from "./ItemPage";
import { TabBar } from "./Nav";
import { SearchProvider } from "./Search";
import { Today } from "./Today";

const data = appJson as unknown as AppData;

// Back returns to the exact scroll position; a new page opens at the top (product spec §4).
function Layout() {
  return (
    // On phone the fixed search field and tab bar sit below the page, so the last row is never under them
    // (design system §5).
    <SearchProvider>
      <div className="pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-0">
        <Outlet />
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
    ],
  },
];

// Routes written to static HTML at build time: Today, Browse and each category, Calendar, and one page per bundled item.
export const prerenderPaths = [
  "/",
  "/browse",
  ...data.categories.map((c) => `/browse/${c.id}`),
  "/calendar",
  ...data.items.map((i) => `/items/${i.inputs.id}`),
];

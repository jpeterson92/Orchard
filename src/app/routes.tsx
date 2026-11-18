import { Outlet, type RouteObject, ScrollRestoration } from "react-router";
import appJson from "../generated/app.json";
import type { AppData } from "../shared/app-data";
import { ItemPage } from "./ItemPage";
import { Today } from "./Today";

const data = appJson as unknown as AppData;

// Back returns to the exact scroll position; a new page opens at the top (product spec §4).
function Layout() {
  return (
    <>
      <Outlet />
      {/* Every first load shares the key "default"; keying those by path stops one page restoring another's. */}
      <ScrollRestoration getKey={(l) => (l.key === "default" ? l.pathname : l.key)} />
    </>
  );
}

// One route table, shared by the browser router and the build-time prerender.
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Today /> },
      { path: "/items/:id", element: <ItemPage /> },
    ],
  },
];

// Routes written to static HTML at build time: Today and one page per bundled item.
export const prerenderPaths = ["/", ...data.items.map((i) => `/items/${i.inputs.id}`)];

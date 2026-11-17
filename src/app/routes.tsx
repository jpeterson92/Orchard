import type { RouteObject } from "react-router";
import { Home } from "./Home";

// One route table, shared by the browser router and the build-time prerender.
export const routes: RouteObject[] = [{ path: "/", element: <Home /> }];

// Routes written to static HTML at build time.
export const prerenderPaths = ["/"];

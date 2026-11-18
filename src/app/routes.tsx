import type { RouteObject } from "react-router";
import { Today } from "./Today";

// One route table, shared by the browser router and the build-time prerender.
export const routes: RouteObject[] = [{ path: "/", element: <Today /> }];

// Routes written to static HTML at build time.
export const prerenderPaths = ["/"];

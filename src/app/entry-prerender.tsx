import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from "react-router";
import { prerenderPaths, routes } from "./routes";

export { prerenderPaths };

// Renders one route to an HTML string at build time (no server render at request time).
export async function render(path: string): Promise<string> {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(`http://prerender${path}`));
  if (context instanceof Response) throw new Error(`Route ${path} returned a redirect or response`);
  const router = createStaticRouter(handler.dataRoutes, context);
  return renderToString(
    <StrictMode>
      <StaticRouterProvider router={router} context={context} hydrate={false} />
    </StrictMode>,
  );
}

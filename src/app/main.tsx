import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { routes } from "./routes";
import "./styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("#root missing from index.html");

const app = (
  <StrictMode>
    <RouterProvider router={createBrowserRouter(routes)} />
  </StrictMode>
);

// Prerendered pages arrive with markup to hydrate; the SPA fallback arrives empty.
if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);

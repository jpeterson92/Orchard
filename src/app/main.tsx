import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { startMeasuring } from "./measure";
import { routes } from "./routes";
import "./styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("#root missing from index.html");

const app = (
  <StrictMode>
    <RouterProvider router={createBrowserRouter(routes)} />
  </StrictMode>
);

// The service worker's precache is the offline copy (scripts/sw-build.ts). Production builds only: dev has none.
if (import.meta.env.PROD && "serviceWorker" in navigator)
  window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js"));

// The SPA and offline fallbacks may serve Today's HTML on a different path. Hydrate only the matching page.
const prerendered = container.dataset.prerenderPath === window.location.pathname;
// Real-user measurement (src/app/measure.ts), production builds only; started before the first render's effects run.
if (import.meta.env.PROD) startMeasuring(prerendered);
if (prerendered) hydrateRoot(container, app);
else createRoot(container).render(app);

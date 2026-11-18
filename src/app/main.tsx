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

// The service worker's precache is the offline copy (scripts/sw-build.ts). Production builds only: dev has none.
if (import.meta.env.PROD && "serviceWorker" in navigator)
  window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js"));

// Prerendered pages arrive with markup to hydrate; the SPA fallback and dev arrive with only the placeholder comment.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);

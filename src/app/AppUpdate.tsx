import { useEffect, useRef, useState } from "react";

export function AppUpdate() {
  const [update, setUpdate] = useState<ServiceWorkerRegistration>();
  const [applying, setApplying] = useState(false);
  const reloadRequested = useRef(false);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    const workers = navigator.serviceWorker;
    const listeners = new AbortController();
    const { signal } = listeners;
    let controller = workers.controller;

    void workers
      .register("/sw.js", { updateViaCache: "none" })
      .then((registration) => {
        if (signal.aborted) return;

        const showWaiting = () => {
          if (registration.active && registration.waiting) setUpdate(registration);
        };
        const watchInstall = () => {
          registration.installing?.addEventListener("statechange", showWaiting, { signal });
          showWaiting();
        };
        const check = () => {
          if (document.visibilityState === "visible" && navigator.onLine) {
            void registration.update().catch(() => undefined);
          }
        };

        workers.addEventListener(
          "controllerchange",
          () => {
            if (reloadRequested.current) {
              window.location.reload();
              return;
            }
            if (controller && workers.controller) setUpdate(registration);
            controller = workers.controller;
          },
          { signal },
        );
        registration.addEventListener("updatefound", watchInstall, { signal });
        document.addEventListener("visibilitychange", check, { signal });
        window.addEventListener("online", check, { signal });
        watchInstall();
        check();
      })
      // A browser can deny registration. Orchard remains usable online.
      .catch(() => undefined);

    return () => listeners.abort();
  }, []);

  if (!update) return null;

  const applyUpdate = () => {
    setApplying(true);
    reloadRequested.current = true;
    if (update.waiting) {
      update.waiting.postMessage({ type: "SKIP_WAITING" });
    } else if (update.active?.state === "activated") {
      window.location.reload();
    }
  };

  return (
    <div className="sticky top-0 z-10 border-b border-rule bg-canvas">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-x-4 px-4 text-sm sm:px-6">
        <p role="status">{applying ? "Updating Orchard…" : "An Orchard update is ready."}</p>
        <button
          type="button"
          className="min-h-11 rounded-sm font-semibold text-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
          onClick={applyUpdate}
          disabled={applying}
        >
          Update now
        </button>
      </div>
    </div>
  );
}

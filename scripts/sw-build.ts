// Writes the service worker (dist/client/sw.js) after the prerender, so its precache holds every page the build
// wrote: the app, its bundled data, the prerendered pages and the art. That precache is the offline copy
// (engineering plan §1). Workbox's generateSW; no skipWaiting or clientsClaim, so a new version installs in
// the background and takes over on the next launch, never mid-visit.
import { generateSW } from "workbox-build";

// Pages are served at clean URLs (wrangler.jsonc `html_handling`): items/apples/index.html is /items/apples.
const cleanUrl = (url: string): string =>
  url === "index.html" ? "/" : url.endsWith("/index.html") ? `/${url.slice(0, -"/index.html".length)}` : url;

const { count, size, warnings } = await generateSW({
  globDirectory: "dist/client",
  globPatterns: ["**/*.{html,js,css,webp,svg,png,ico,woff2}"],
  globIgnores: ["sw.js", "workbox-*.js"],
  swDest: "dist/client/sw.js",
  manifestTransforms: [
    async (entries) => ({ manifest: entries.map((e) => ({ ...e, url: cleanUrl(e.url) })), warnings: [] }),
  ],
  // Vite's hashed file names already change with their content.
  dontCacheBustURLsMatching: /^assets\//,
  // A page the build didn't write (an unknown item) gets the app shell, which routes it client-side.
  navigateFallback: "/",
  navigateFallbackDenylist: [/^\/api\//],
  cleanupOutdatedCaches: true,
  inlineWorkboxRuntime: true,
  mode: "production",
  sourcemap: false,
});

for (const w of warnings) console.warn(`warning: ${w}`);
console.log(`service worker: precaches ${count} files, ${Math.round(size / 1024)} KB`);

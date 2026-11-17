import { cloudflare } from "@cloudflare/vite-plugin";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// App (client build) + Worker (src/worker) in one project via the Cloudflare plugin.
// Prerendering is a separate SSR build: see vite.prerender.config.ts and scripts/prerender.ts.
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss(), cloudflare()],
});

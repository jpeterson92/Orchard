import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// SSR bundle of the app, used only at build time to write static HTML for each route.
// The client bundle (with React Compiler) is what ships; this one just renders markup.
export default defineConfig({
  plugins: [react()],
  build: {
    ssr: "src/app/entry-prerender.tsx",
    outDir: "dist/prerender",
    emptyOutDir: true,
  },
});

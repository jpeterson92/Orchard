import { defineConfig } from "vitest/config";

// Unit tests only; kept separate from vite.config.ts so the Cloudflare plugin doesn't start workerd.
export default defineConfig({
  test: {
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
  },
});

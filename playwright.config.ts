import { defineConfig, devices } from "@playwright/test";

const port = 4173;

// Smoke tests against the production build served locally by the Cloudflare plugin (workerd).
export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: `http://localhost:${port}` },
  projects: [{ name: "phone", use: { ...devices["Pixel 7"] } }],
  webServer: {
    command: `npm run build && npm run db:migrate:local && npm run preview -- --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});

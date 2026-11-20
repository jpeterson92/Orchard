import { defineConfig, devices } from "@playwright/test";

const port = 4173;
const prebuilt = process.env.ORCHARD_E2E_PREBUILT === "1";

// Smoke tests against the production build served locally by the Cloudflare plugin (workerd).
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: !process.env.CI,
  workers: process.env.CI ? 1 : 4,
  use: { baseURL: `http://localhost:${port}` },
  projects: [
    { name: "phone", use: { ...devices["Pixel 7"] } },
    { name: "iphone", use: { ...devices["iPhone 15"] } },
  ],
  webServer: {
    command: `${prebuilt ? "" : "npm run build && "}npm run db:migrate:local && npm run preview -- --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI && !prebuilt,
    timeout: 180_000,
  },
});

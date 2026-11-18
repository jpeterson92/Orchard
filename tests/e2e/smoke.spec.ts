import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home page is prerendered: heading is in the HTML before any JavaScript runs", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toMatch(/<h1[^>]*>Today<\/h1>/);
});

test("home page hydrates without errors and has no axe violations", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();
  expect(errors).toEqual([]);
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations).toEqual([]);
});

test("Worker answers /api/health", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBe(true);
  expect(await res.json()).toEqual({ ok: true });
});

test("after one visit, an item never visited opens offline", async ({ page, context }) => {
  await page.goto("/");
  // The service worker activates once its precache (every page, the app and its data) is complete.
  await page.evaluate("navigator.serviceWorker.ready.then(() => true)");
  // With nothing to switch on, Today says when the copy is complete.
  await expect(page.getByRole("status")).toHaveText(
    /^Ready offline · \d+ items · supply data through \w{3} \d{4}$/,
  );
  await context.setOffline(true);
  await page.goto("/items/strawberries");
  await expect(page.getByRole("heading", { level: 1, name: "Strawberries" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Strawberries" })).toBeVisible();
});

test("pages are served at clean URLs", async ({ request }) => {
  const res = await request.get("/items/strawberries");
  expect(res.status()).toBe(200);
  expect(await res.text()).toMatch(/<h1[^>]*>Strawberries<\/h1>/);
});

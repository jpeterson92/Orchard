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

test("a link shared for a date pins it; Switch to today drops it", async ({ page }) => {
  const d = new Date();
  d.setDate(d.getDate() + 40);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const shown = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
  const banner = page.getByRole("complementary", { name: "Planning date" });

  // A plain link follows today.
  await page.goto("/items/strawberries");
  await expect(page.getByRole("heading", { level: 1, name: "Strawberries" })).toBeVisible();
  await expect(banner).toHaveCount(0);

  await page.goto(`/items/strawberries?date=${iso}`);
  await expect(banner).toContainText(`Showing ${shown}`);
  await expect(banner.getByRole("link", { name: "Share for this date" })).toHaveAttribute(
    "href",
    `/items/strawberries?date=${iso}`,
  );
  // The pinned date carries to the other screens.
  await page.getByRole("link", { name: "Today" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Typically best" })).toBeVisible();
  await page.goBack();
  await banner.getByRole("button", { name: "Switch to today" }).click();
  await expect(banner).toHaveCount(0);
  await expect(page).toHaveURL(/\/items\/strawberries$/);
});

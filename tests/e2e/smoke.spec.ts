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

test("each page has its own title, in the prerendered head and after navigating", async ({
  page,
  request,
}) => {
  const html = await (await request.get("/items/apples")).text();
  expect(html).toMatch(/<head>[\s\S]*<title>Apples · Orchard<\/title>[\s\S]*<\/head>/);
  expect(html.match(/<title>/g)).toHaveLength(1);
  await page.goto("/items/apples");
  await expect(page.getByRole("heading", { level: 1, name: "Apples" })).toBeVisible();
  await expect(page).toHaveTitle("Apples · Orchard");
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Browse" }).click();
  await expect(page).toHaveTitle("Browse · Orchard");
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Today" }).click();
  await expect(page).toHaveTitle("Orchard");
  expect(await page.locator("title").count()).toBe(1);
});

test("Browse reaches an item in three taps from Today, and back returns to the category", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await nav.getByRole("link", { name: "Browse" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Browse" })).toBeVisible();
  await page.getByRole("link", { name: /^Berries/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Berries" })).toBeVisible();
  await page.getByRole("link", { name: /^Strawberries/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Strawberries" })).toBeVisible();
  await page.getByRole("link", { name: "Berries" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Berries" })).toBeVisible();
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations).toEqual([]);
});

test("Calendar: a month at a time on phone, kept on return; a heatmap table on wide screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Calendar" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Typical seasonal outlook" })).toBeVisible();
  const month = page.getByRole("heading", { level: 2 });
  const shown = await month.textContent();
  await page.getByRole("button", { name: /^Next month/ }).click();
  await expect(month).not.toHaveText(shown ?? "");
  const next = await month.textContent();
  await page.getByRole("link", { name: /^Strawberries/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Strawberries" })).toBeVisible();
  await page.getByRole("navigation", { name: "Back" }).getByRole("link", { name: "Calendar" }).click();
  // The month locator is strict, so wait for the Calendar first: the item page has several h2s.
  await expect(page.getByRole("heading", { level: 1, name: "Typical seasonal outlook" })).toBeVisible();
  await expect(month).toHaveText(next ?? "");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(
    page.getByRole("table", { name: "Typical verdict for each item by half-month" }),
  ).toBeVisible();
  await expect(page.getByRole("rowheader", { name: /^Strawberries/ })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
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
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Today" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Typically best" })).toBeVisible();
  await page.goBack();
  await banner.getByRole("button", { name: "Switch to today" }).click();
  await expect(banner).toHaveCount(0);
  await expect(page).toHaveURL(/\/items\/strawberries$/);
});

test("search from the pinned field: a misspelled guide variety opens its page; another variety its item at that variety", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Search produce" }).last().click();
  const dialog = page.getByRole("dialog", { name: "Search produce" });
  await dialog.getByRole("searchbox").fill("honeycrsp");
  await expect(dialog.getByRole("link", { name: /^Honeycrisp/ })).toBeVisible();
  const axe = await new AxeBuilder({ page }).include("dialog").analyze();
  expect(axe.violations).toEqual([]);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: "Honeycrisp" })).toBeVisible();
  await page.getByRole("button", { name: "Search produce" }).last().click();
  await dialog.getByRole("searchbox").fill("ataulfo");
  await expect(dialog.getByRole("link", { name: /^Ataulfo/ })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: "Mangoes" })).toBeVisible();
  await expect(page.locator("#label select")).toHaveValue("v:ataulfo");
  await page.getByRole("button", { name: "Search produce" }).last().click();
  await dialog.getByRole("searchbox").fill("rhubarb");
  await expect(dialog.getByText("We don't cover this yet", { exact: true }).first()).toBeVisible();
});

test("a page load sends one beacon with its metrics and time to first verdict, and the Worker counts it", async ({
  page,
}) => {
  await page.goto("/");
  // The readiness line appears once the app has hydrated and measurement has started.
  await expect(page.getByRole("status").filter({ hasText: /offline/i })).toBeVisible();
  // A first key press settles LCP (web-vitals finalizes it in an idle callback after trusted input); then leaving
  // the app hides the page, which sends the beacon. A synthetic hide alone isn't trusted, so it can't settle LCP.
  await page.keyboard.press("Shift");
  // Safari has no requestIdleCallback; web-vitals then finalizes on a timeout, so a short wait stands in.
  await page.evaluate(`new Promise((done) =>
    "requestIdleCallback" in window ? requestIdleCallback(done, { timeout: 2000 }) : setTimeout(done, 100))`);
  const beacon = page.waitForRequest("**/api/measure");
  await page.evaluate(`
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange", { bubbles: true }));
  `);
  const request = await beacon;
  const body = JSON.parse(request.postData() ?? "{}") as {
    m: { metric: string; value: number }[];
    e: { event: string; n: number }[];
  };
  expect(Object.keys(body)).toEqual(["m", "e"]);
  // A fresh browser's first load counts a visit, and nothing more about it.
  expect(body.e).toEqual([{ event: "visit", n: 1 }]);
  // Safari has no layout-shift entries, so its phones never report CLS.
  const shifts = await page.evaluate(`PerformanceObserver.supportedEntryTypes.includes("layout-shift")`);
  expect(body.m.map((e) => e.metric)).toEqual(
    expect.arrayContaining(["lcp", "verdict", ...(shifts ? ["cls"] : [])]),
  );
  for (const e of body.m) expect(Object.keys(e).sort()).toEqual(["metric", "value"]);
  expect((await request.response())?.status()).toBe(204);
});

test("static responses carry the CSP and security headers", async ({ request }) => {
  const html = await (await request.get("/")).text();
  const asset = html.match(/src="(\/assets\/[^"]+\.js)"/)?.[1] ?? "";
  // A prerendered page, the SPA fallback for a page the build didn't write, a hashed asset and the service worker.
  for (const url of ["/", "/items/apples", "/items/not-an-item", asset, "/sw.js"]) {
    const headers = (await request.get(url)).headers();
    expect(headers["content-security-policy"], url).toMatch(
      /^default-src 'self'; script-src 'self'; style-src 'self';/,
    );
    expect(headers["content-security-policy"], url).toContain("frame-ancestors 'none'");
    expect(headers["x-content-type-options"], url).toBe("nosniff");
    expect(headers["referrer-policy"], url).toBe("no-referrer");
  }
  expect((await request.get("/api/health")).headers()["content-security-policy"]).toBe(
    "default-src 'none'; frame-ancestors 'none'",
  );
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`every screen passes axe in ${colorScheme} mode, with no CSP or console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
    page.on("pageerror", (err) => errors.push(err.message));
    await page.emulateMedia({ colorScheme });
    const check = async (where: string) => {
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(
        violations.map((v) => `${where}: ${v.id} ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
      ).toEqual([]);
    };

    await page.goto("/");
    await expect(page.getByRole("status").filter({ hasText: /offline/i })).toBeVisible();
    await page.locator("button[aria-expanded]").first().click();
    await check("Today, a card open");
    for (const [url, heading] of [
      ["/items/apples", "Apples"],
      ["/guides/apples", "Apples by variety"],
      ["/items/pears/anjou", "Anjou"],
      ["/browse", "Browse"],
      ["/browse/citrus", "Citrus"],
      ["/calendar", "Typical seasonal outlook"],
      ["/methods", /^How Orchard rates produce/],
      ["/privacy", /Privacy/],
    ] as const) {
      await page.goto(url);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await check(url);
    }
    await page.goto("/items/apples");
    await page.locator("#label select").selectOption("v:honeycrisp");
    await check("/items/apples, a variety picked");
    await page.getByRole("button", { name: "Search produce" }).last().click();
    await page.getByRole("dialog", { name: "Search produce" }).getByRole("searchbox").fill("pear");
    await check("search");
    expect(errors).toEqual([]);
  });
}

import { once } from "node:events";
import { createServer } from "node:http";
import { expect, test } from "@playwright/test";

test("an open app can apply a downloaded release and keep the current page offline", async ({
  page,
  context,
  baseURL,
}) => {
  if (!baseURL) throw new Error("The production preview URL is missing");
  let released = false;

  // Serve two versions from the same origin. The second changes a precache revision and its matching HTML.
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", baseURL);
      if (req.method === "POST") {
        req.resume();
        res.writeHead(204).end();
        return;
      }
      const response = await fetch(url);
      const contentType = response.headers.get("content-type") ?? "application/octet-stream";
      res.writeHead(response.status, { "Content-Type": contentType, "Cache-Control": "no-store" });
      if (released && url.pathname === "/sw.js") {
        const worker = await response.text();
        res.end(worker.replace(/(url:"\/about",revision:")[^"]+/, "$1test-release"));
      } else if (released && url.pathname === "/about") {
        res.end((await response.text()).replace("<html ", '<html data-test-release="updated" '));
      } else {
        res.end(Buffer.from(await response.arrayBuffer()));
      }
    } catch {
      res.destroy();
    }
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  try {
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("The update test server did not start");
    const about = `http://127.0.0.1:${address.port}/about`;
    await page.goto(about);
    await expect.poll(() => page.evaluate("navigator.serviceWorker.controller?.state")).toBe("activated");
    const update = page.getByRole("button", { name: "Update now" });
    await expect(update).toHaveCount(0);

    released = true;
    await page.evaluate('window.dispatchEvent(new Event("online"))');
    await expect(update).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("html")).not.toHaveAttribute("data-test-release");

    await update.click();
    await expect(page).toHaveURL(about);
    await expect(page.locator("html")).toHaveAttribute("data-test-release", "updated");
    await expect(update).toHaveCount(0);

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-test-release", "updated");
  } finally {
    server.close();
    server.closeAllConnections();
  }
});

// Writes static HTML for each prerendered route into the client build (dist/client).
// Runs after `vite build` and the SSR build in vite.prerender.config.ts.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const clientDir = path.join(root, "dist", "client");
const entry = pathToFileURL(path.join(root, "dist", "prerender", "entry-prerender.js")).href;

const { render, prerenderPaths } = (await import(entry)) as {
  render: (path: string) => Promise<string>;
  prerenderPaths: string[];
};

const template = await readFile(path.join(clientDir, "index.html"), "utf8");
if (!template.includes("<!--app-html-->")) throw new Error("index.html is missing <!--app-html-->");

for (const route of prerenderPaths) {
  const html = template.replace("<!--app-html-->", await render(route));
  const file = path.join(clientDir, ...route.split("/").filter(Boolean), "index.html");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
  console.log(`prerendered ${route} -> ${path.relative(root, file)}`);
}

import { describe, expect, it } from "vitest";
import { citedSourceIds, renderPage } from "./pages-lib";

describe("renderPage", () => {
  it("renders Markdown with heading ids and fills rule values", () => {
    const { page, errors } = renderPage(
      "m.md",
      "---\nstatus: draft\n---\n## How confidence works\n\nAt least {{share}} of supply.\n",
      { share: "70%" },
    );
    expect(errors).toEqual([]);
    expect(page?.draft).toBe(true);
    expect(page?.html).toContain('<h2 id="how-confidence-works">How confidence works</h2>');
    expect(page?.html).toContain("<p>At least 70% of supply.</p>");
  });

  it("marks a reviewed page as not draft", () => {
    expect(renderPage("m.md", "---\nstatus: reviewed\n---\nText\n", {}).page?.draft).toBe(false);
  });

  it.each([
    ["no front matter", "Text\n"],
    ["an unknown status", "---\nstatus: done\n---\nText\n"],
  ])("refuses a page with %s", (_, text) => {
    const { page, errors } = renderPage("m.md", text, {});
    expect(page).toBeNull();
    expect(errors[0]).toContain("status");
  });

  it("refuses an unknown value", () => {
    const { page, errors } = renderPage("m.md", "---\nstatus: draft\n---\n{{nope}}\n", {});
    expect(page).toBeNull();
    expect(errors).toEqual(["m.md: unknown value {{nope}}"]);
  });
});

describe("citedSourceIds", () => {
  it("collects sources from item copy, nested windows and evidence claims", () => {
    const items = [
      { ripen: { sources: ["a"] }, origins: [{ windows: [{ sources: ["b", "a"] }] }] },
    ] as unknown as Parameters<typeof citedSourceIds>[0]["items"];
    const evidence = [{ claims: [{ source: "c" }] }] as unknown as Parameters<
      typeof citedSourceIds
    >[0]["evidence"];
    expect([...citedSourceIds({ items, evidence })].sort()).toEqual(["a", "b", "c"]);
  });
});

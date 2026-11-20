import { describe, expect, it } from "vitest";
import appJson from "../generated/app.json";
import type { AppData, AppItem } from "../shared/app-data";
import { search, searchIndex } from "./search-view";

const bundled = appJson as unknown as AppData;
const date = { year: 2026, month: 11, day: 18 };

// Herbs and green onions aren't drafted yet: copies of a bundled item under their names test the matching.
const base = bundled.items[0] as AppItem;
const named = (id: string, name: string, synonyms: string[], misspellings: string[] = []): AppItem => ({
  ...base,
  inputs: { ...base.inputs, id },
  name,
  synonyms,
  misspellings,
  varieties: [],
});
const data: AppData = {
  ...bundled,
  items: [
    ...bundled.items,
    named("cilantro", "Cilantro", ["coriander", "coriander leaf", "chinese parsley"], ["cilantero"]),
    named("green-onions", "Green onions", ["scallion", "scallions", "spring onion"]),
    named("jalapenos", "Jalapeños", ["jalapeño pepper"]),
  ],
};
const index = searchIndex(data);
const run = (q: string) => search(index, data, q, date);
const keys = (q: string) => {
  const o = run(q);
  return o.kind === "results" ? o.results.map((r) => r.key) : [];
};

describe("search", () => {
  it("is empty for a blank query", () => {
    expect(run("  ").kind).toBe("empty");
  });

  it.each([
    ["scallion", "green-onions"],
    ["corriander", "cilantro"],
    ["coriander leaf", "cilantro"],
    ["cilantero", "cilantro"],
    ["apple", "apples"],
    ["aple", "apples"],
    ["Strawberries", "strawberries"],
    ["strawbery", "strawberries"],
    ["tangerine", "mandarins"],
    ["jalapeno", "jalapenos"],
  ])("%s finds %s first", (q, id) => {
    expect(keys(q)[0]).toBe(id);
  });

  it("suggests from the first letter", () => {
    expect(keys("s")).toContain("strawberries");
    expect(keys("ma")).toContain("mandarins");
  });

  it("opens a variety at that variety, with its own verdict", () => {
    const o = run("Honeycrisp");
    if (o.kind !== "results") throw new Error(o.kind);
    const first = o.results[0];
    expect(first).toMatchObject({ key: "apples/honeycrisp", item: "apples", label: "v:honeycrisp" });
    expect(first?.title).toBe("Honeycrisp");
    expect(first?.subtitle).toBe("Apples");
    expect(first?.tags).not.toContain("Check the label");
  });

  it("opens a guide variety on its own page, and any other variety on its item page at that variety", () => {
    const honeycrisp = run("Honeycrisp");
    const ataulfo = run("Ataulfo");
    if (honeycrisp.kind !== "results" || ataulfo.kind !== "results") throw new Error("no results");
    expect(honeycrisp.results[0]?.to).toBe("/items/apples/honeycrisp");
    expect(ataulfo.results[0]).toMatchObject({ key: "mangoes/ataulfo", to: "/items/mangoes#label" });
    const apples = run("Apples");
    expect(apples.kind === "results" && apples.results[0]?.to).toBe("/items/apples");
  });

  it("matches every word of a multi-word query", () => {
    expect(keys("granny smith")[0]).toBe("apples/granny-smith");
    expect(keys("green onions")[0]).toBe("green-onions");
  });

  it.each([
    ["Honeycrisp apple", "apples/honeycrisp"],
    ["Ataulfo mango", "mangoes/ataulfo"],
    ["cherry tomatoes", "tomatoes/cherry-grape"],
    ["grape tomatoes", "tomatoes/cherry-grape"],
  ])("shows the named variety first for %s", (query, key) => {
    expect(keys(query)[0]).toBe(key);
  });

  it("finds every bundled item by its own name", () => {
    for (const item of data.items) expect(keys(item.name)).toContain(item.inputs.id);
  });

  it("offers the closest items when nothing is covered", () => {
    const none = run("rhubarb");
    expect(none.kind).toBe("none");
    const close = run("strawbrry jam");
    expect(close).toMatchObject({ kind: "none" });
    if (close.kind === "none") expect(close.closest.map((r) => r.key)).toContain("strawberries");
  });
});

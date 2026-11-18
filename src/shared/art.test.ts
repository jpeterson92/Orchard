import { describe, expect, it } from "vitest";
import { type ArtAsset, artId, artSrcSet, resolveArt } from "./art";

const items = [
  { id: "apples", varieties: [{ id: "gala" }, { id: "fuji" }] },
  { id: "strawberries", varieties: [] },
];

const asset = (over: Partial<ArtAsset> = {}): ArtAsset => {
  const a: ArtAsset = {
    id: "",
    item: "apples",
    role: "thumbnail",
    alt: "A red apple",
    revision: 1,
    status: "approved",
    ...over,
  };
  return { ...a, id: over.id ?? artId(a) };
};

const run = (assets: unknown[], production = false, processed?: string[]) =>
  resolveArt({ assets }, items, {
    production,
    processed: new Set(processed ?? assets.map((a) => (a as ArtAsset).id)),
  });

describe("artId", () => {
  it("follows <item>[-<variety>]-<role>-v<revision>", () => {
    expect(artId({ item: "apples", role: "thumbnail", revision: 1 })).toBe("apples-thumbnail-v1");
    expect(artId({ item: "apples", variety: "gala", role: "thumbnail", revision: 3 })).toBe(
      "apples-gala-thumbnail-v3",
    );
  });
});

describe("artSrcSet", () => {
  it("lists every derivative width", () => {
    expect(artSrcSet("apples-thumbnail-v1")).toBe(
      "/art/apples-thumbnail-v1-160.webp 160w, /art/apples-thumbnail-v1-320.webp 320w, /art/apples-thumbnail-v1-640.webp 640w",
    );
  });
});

describe("resolveArt: manifest errors", () => {
  const cases: [string, unknown[], RegExp][] = [
    ["schema: missing alt", [{ ...asset(), alt: undefined }], /alt/],
    ["schema: unknown status", [{ ...asset(), status: "done" }], /status/],
    ["schema: extra field", [{ ...asset(), size: 72 }], /size/],
    ["duplicate id", [asset(), asset()], /duplicate id/],
    ["id doesn't match fields", [asset({ id: "apples-thumb-v1" })], /id must be apples-thumbnail-v1/],
    ["id revision doesn't match", [asset({ id: "apples-thumbnail-v1", revision: 2 })], /id must be/],
    ["unknown item", [asset({ item: "kiwis" })], /unknown item kiwis/],
    ["unknown variety", [asset({ variety: "honeycrisp" })], /unknown variety honeycrisp/],
  ];
  it.each(cases)("%s", (_, assets, message) => {
    const { errors } = run(assets);
    expect(errors.join("\n")).toMatch(message);
  });

  it.each(["review", "approved"] as const)("a %s asset needs derivatives", (status) => {
    const { errors } = run([asset({ status })], false, []);
    expect(errors.join("\n")).toMatch(/run npm run art:process/);
  });

  it.each(["requested", "rejected"] as const)("a %s asset needs no derivatives", (status) => {
    expect(run([asset({ status })], false, []).errors).toEqual([]);
  });

  it("rejects a manifest that isn't an object with assets", () => {
    expect(resolveArt([], items, { production: false, processed: new Set() }).errors).not.toEqual([]);
  });
});

describe("resolveArt: which asset shows", () => {
  const cases: [string, ArtAsset["status"], boolean, boolean][] = [
    // status, production, shown
    ["approved, dev", "approved", false, true],
    ["approved, production", "approved", true, true],
    ["review, dev", "review", false, true],
    ["review, production", "review", true, false],
    ["requested, dev", "requested", false, false],
    ["rejected, dev", "rejected", false, false],
  ];
  it.each(cases)("%s", (_, status, production, shown) => {
    const { art } = run([asset({ status })], production);
    expect(art.items.apples !== undefined).toBe(shown);
  });

  it("an asset without derivatives never shows", () => {
    const { art } = run([asset({ status: "requested" })], false, []);
    expect(art.items).toEqual({});
  });

  it("the highest shown revision wins, whatever the manifest order", () => {
    const v1 = asset({ revision: 1 });
    const v2 = asset({ revision: 2, status: "review" });
    expect(run([v2, v1]).art.items.apples).toBe("apples-thumbnail-v2");
    expect(run([v1, v2]).art.items.apples).toBe("apples-thumbnail-v2");
    // Production ignores the revision awaiting review and keeps the approved one.
    const prod = run([v1, v2, asset({ item: "strawberries" })], true);
    expect(prod.art.items.apples).toBe("apples-thumbnail-v1");
  });

  it("a rejected newer revision leaves the older approved one in place", () => {
    const { art } = run([asset({ revision: 1 }), asset({ revision: 2, status: "rejected" })]);
    expect(art.items.apples).toBe("apples-thumbnail-v1");
  });

  it("varieties resolve under <item>/<variety> and never fall back to the item's art", () => {
    const { art } = run([asset(), asset({ variety: "gala" })]);
    expect(art.varieties).toEqual({ "apples/gala": "apples-gala-thumbnail-v1" });
    expect(art.varieties["apples/fuji"]).toBeUndefined();
    expect(art.items).toEqual({ apples: "apples-thumbnail-v1" });
  });
});

describe("resolveArt: production", () => {
  it("refuses an item without an approved thumbnail", () => {
    const { errors } = run([asset(), asset({ item: "strawberries", status: "review" })], true);
    expect(errors).toEqual(["item strawberries: no approved thumbnail (production build)"]);
  });

  it("a variety without approved art is not an error", () => {
    const { errors } = run([asset(), asset({ item: "strawberries" })], true);
    expect(errors).toEqual([]);
  });

  it("dev and preview builds accept items without art", () => {
    expect(run([]).errors).toEqual([]);
  });
});

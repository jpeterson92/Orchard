import { describe, expect, it } from "vitest";
import appJson from "../generated/app.json";
import type { AppData, AppVariety } from "../shared/app-data";
import { guideView } from "./guide-view";
import { itemView, varietySummary } from "./item-view";
import { prerenderPaths } from "./routes";
import { alternatives, hasVarietyPage, MAX_ALTERNATIVES, varietyPath, varietyView } from "./variety-view";

const data = appJson as unknown as AppData;
const date = { year: 2026, month: 11, day: 18 };

const v = (id: string, traits: Record<string, number>, uses: string[] = []): AppVariety => ({
  id,
  name: id.toUpperCase(),
  label: id,
  plu: [],
  bestUses: [],
  uses,
  cue: null,
  art: null,
  traits,
  ripeCue: null,
  overall: null,
  recommended: true,
});

describe("Can't find it? Try…", () => {
  const base = v("a", { s: 3, t: 3, c: 3, j: 3 }, ["snacking"]);
  const all = (..._: string[]) => "unrated" as const;

  it.each([
    ["an identical variety", v("b", { s: 3, t: 3, c: 3, j: 3 }, ["snacking"]), true],
    ["a mean gap of exactly 1", v("b", { s: 4, t: 2, c: 4, j: 2 }, ["snacking"]), true],
    ["a mean gap over 1", v("b", { s: 5, t: 5, c: 4, j: 3 }, ["snacking"]), false],
    ["only 2 shared scales", v("b", { s: 3, t: 3 }, ["snacking"]), false],
    ["3 shared scales", v("b", { s: 3, t: 3, c: 3 }, ["snacking"]), true],
    ["no shared use", v("b", { s: 3, t: 3, c: 3, j: 3 }, ["baking"]), false],
    ["no uses at all", v("b", { s: 3, t: 3, c: 3, j: 3 }), false],
  ])("%s: kept %s", (_, other, kept) => {
    expect(alternatives({ varieties: [base, other] }, base, all).map((a) => a.id)).toEqual(kept ? ["b"] : []);
  });

  it("needs no shared use when the variety has none", () => {
    const plain = v("a", { s: 3, t: 3, c: 3 });
    expect(
      alternatives({ varieties: [plain, v("b", { s: 3, t: 3, c: 3 }, ["x"])] }, plain, all),
    ).toHaveLength(1);
  });

  it("needs every scale when the variety is placed on fewer than 3", () => {
    const thin = v("a", { s: 3, t: 3 });
    const items = { varieties: [thin, v("b", { s: 3 }), v("c", { s: 3, t: 4 })] };
    expect(alternatives(items, thin, all).map((a) => a.id)).toEqual(["c"]);
    const none = v("a", {});
    expect(alternatives({ varieties: [none, v("b", {})] }, none, all)).toEqual([]);
  });

  it("never offers a variety that isn't recommended", () => {
    const meh = { ...v("b", base.traits, ["snacking"]), recommended: false };
    expect(alternatives({ varieties: [base, meh] }, base, all)).toEqual([]);
  });

  it("leaves out rated varieties not usually in stores now or Skip today, never itself", () => {
    const items = {
      varieties: [base, ...["b", "c", "d"].map((id) => v(id, base.traits, ["snacking"]))],
    };
    const out = alternatives(items, base, (id) => (id === "b" ? "out" : id === "d" ? "skip" : "good"));
    expect(out.map((a) => a.id)).toEqual(["c"]);
    expect(out[0]?.verdict).toBe("good");
  });

  it("orders closest first, then the better verdict today, then A to Z; at most two", () => {
    const close = { s: 3, t: 3, c: 3, j: 4 };
    const items = {
      varieties: [
        base,
        v("far", { s: 4, t: 4, c: 3, j: 3 }, ["snacking"]),
        v("zed", close, ["snacking"]),
        v("yak", close, ["snacking"]),
        v("peak", close, ["snacking"]),
      ],
    };
    const status = (id: string) => (id === "peak" ? "peak" : id === "zed" ? "good" : "unrated");
    expect(alternatives(items, base, status).map((a) => a.id)).toEqual(["peak", "zed"]);
    expect(MAX_ALTERNATIVES).toBe(2);
  });
});

describe("Variety page", () => {
  it("shows Cosmic Crisp in stores year-round and at Peak throughout November", () => {
    for (let month = 1; month <= 12; month++) {
      for (const day of [1, 16]) {
        const at = { ...date, month, day };
        const view = varietyView(data, "apples", "cosmic-crisp", at);
        expect(view?.rating).toMatchObject({ inStore: true, verdict: month === 11 ? "peak" : "good" });
        if (month === 11) {
          const varieties = itemView(data, "apples", at)?.varieties ?? [];
          const peak = varietySummary(varieties).find((group) => group.verdict === "peak");
          expect(peak?.names).toContain("Cosmic Crisp");
        }
      }
    }
  });

  it.each([
    ["pears", "seckel", 11, true],
    ["pears", "seckel", 8, false],
    ["mangoes", "keitt", 3, true],
    ["mangoes", "kent", 10, false],
    ["mandarins", "gold-nugget", 3, true],
    ["oranges", "cara-cara", 5, true],
    ["oranges", "cara-cara", 11, false],
  ])("shows %s / %s in month %i as in stores: %s", (item, variety, month, inStore) => {
    const row = itemView(data, item, { ...date, month })?.varieties.find((row) => row.id === variety);
    expect(row?.inStore).toBe(inStore);
  });

  it("exists for every variety of a guide's items, and only those, each prerendered", () => {
    for (const item of data.items)
      for (const variety of item.varieties) {
        const view = varietyView(data, item.inputs.id, variety.id, date);
        expect(view !== null).toBe(hasVarietyPage(item));
        expect(prerenderPaths.includes(varietyPath(item.inputs.id, variety.id))).toBe(hasVarietyPage(item));
      }
    expect(varietyView(data, "apples", "no-such-variety", date)).toBeNull();
  });

  it("shows today's verdict and outlook only for rated varieties, matching the guide", () => {
    for (const g of data.guides)
      for (const row of guideView(data, g.id, date)?.rows ?? []) {
        const view = varietyView(data, row.item, row.variety, date);
        expect(view?.rating?.verdict ?? null).toBe(row.verdict);
        if (view?.rating) {
          expect(view.rating.inStore).toBe(row.inStore);
          expect(view.rating.outlook).toHaveLength(24);
        }
      }
  });

  it("suggests only other varieties of the same item that are in stores or unrated", () => {
    for (const g of data.guides)
      for (const row of guideView(data, g.id, date)?.rows ?? []) {
        const view = varietyView(data, row.item, row.variety, date);
        const item = data.items.find((i) => i.inputs.id === row.item);
        for (const a of view?.alternatives ?? []) {
          expect(a.id).not.toBe(row.variety);
          expect(item?.varieties.some((x) => x.id === a.id)).toBe(true);
          expect(a.gap).toBeLessThanOrEqual(1);
        }
      }
  });
});

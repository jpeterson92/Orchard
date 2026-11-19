import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import appJson from "../src/generated/app.json";
import type { AppData } from "../src/shared/app-data";
import { drift, HEADER, renderAssessments } from "./assessments-lib";

const data = appJson as unknown as AppData;
const fresh = () => structuredClone(data);

describe("renderAssessments", () => {
  it("is deterministic: the same inputs give byte-identical files", () =>
    expect(renderAssessments(fresh())).toEqual(renderAssessments(fresh())));
  it("doesn't depend on the build date or the bundle's item order", () => {
    const other = fresh();
    other.builtOn = "1999-01-01";
    other.items.reverse();
    expect(renderAssessments(other)).toEqual(renderAssessments(fresh()));
  });
  it("writes one file per real item plus index.csv, each with the header, 24 windows per item", () => {
    const files = renderAssessments(fresh());
    const real = data.items.filter((i) => !i.synthetic).map((i) => `${i.inputs.id}.yaml`);
    expect([...files.keys()].sort()).toEqual([...real, "index.csv"].sort());
    for (const content of files.values()) expect(content.split("\n")[0]).toContain(HEADER);
    const csv = files.get("index.csv")?.trim().split("\n") ?? [];
    expect(csv.length).toBe(2 + real.length * 24);
  });
});

describe("drift", () => {
  let dir = "";
  afterEach(() => rmSync(dir, { recursive: true, force: true }));
  const setup = (files: Map<string, string>) => {
    dir = mkdtempSync(join(tmpdir(), "assessments-"));
    for (const [name, content] of files) writeFileSync(join(dir, name), content);
  };
  const files = new Map([
    ["a.yaml", "a: 1\n"],
    ["index.csv", "x\n"],
  ]);
  it("passes when the folder matches a fresh build", () => {
    setup(files);
    expect(drift(dir, files)).toEqual([]);
  });
  it("fails on a hand edit, a missing file and a stray file", () => {
    setup(files);
    writeFileSync(join(dir, "a.yaml"), "a: 2\n");
    writeFileSync(join(dir, "b.yaml"), "b: 1\n");
    expect(drift(dir, new Map([...files, ["c.yaml", ""]]))).toEqual([
      "a.yaml: differs",
      "c.yaml: missing",
      "b.yaml: not produced by the build",
    ]);
  });
  it("reports every file missing when the folder doesn't exist", () => {
    dir = join(tmpdir(), "assessments-none");
    expect(drift(dir, files)).toEqual(["a.yaml: missing", "index.csv: missing"]);
  });
});

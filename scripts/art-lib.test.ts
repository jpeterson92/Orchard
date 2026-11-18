import { describe, expect, it } from "vitest";
import { checkMaster, MIN_MASTER, type Pixels } from "./art-lib";

type Rgba = [number, number, number, number];
const CLEAR: Rgba = [0, 0, 0, 0];
const RED: Rgba = [180, 40, 30, 255];
const WHITE: Rgba = [255, 255, 255, 255];

/** A canvas filled with `bg` and a centered disc of `fg`, its outer ring painted `ring` at partial alpha. */
function image(
  opts: { size?: number; height?: number; bg?: Rgba; fg?: Rgba; radius?: number; ring?: Rgba } = {},
): Pixels {
  const width = opts.size ?? MIN_MASTER;
  const height = opts.height ?? width;
  const radius = opts.radius ?? width * 0.35;
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const d = Math.hypot(x - width / 2, y - height / 2);
      const px =
        d > radius
          ? (opts.bg ?? CLEAR)
          : d > radius - 4
            ? (opts.ring ?? [170, 40, 30, 120])
            : (opts.fg ?? RED);
      data.set(px, (y * width + x) * 4);
    }
  return { width, height, channels: 4, data };
}

const rgb = (p: Pixels): Pixels => {
  const data = new Uint8Array(p.width * p.height * 3);
  for (let i = 0; i < p.width * p.height; i++) data.set(p.data.subarray(i * 4, i * 4 + 3), i * 3);
  return { ...p, channels: 3, data };
};

describe("checkMaster", () => {
  it("passes a centered painting on real transparency", () => {
    expect(checkMaster(image())).toEqual([]);
  });

  const cases: [string, Pixels, RegExp][] = [
    ["not square", image({ height: MIN_MASTER + 512 }), /not square/],
    ["too small", image({ size: 512 }), /smaller than 1024/],
    ["no alpha channel", rgb(image()), /no alpha channel/],
    ["a white rectangle behind the subject", image({ bg: WHITE }), /no real transparency/],
    ["a painted checkerboard (opaque)", image({ bg: [204, 204, 204, 255] }), /no real transparency/],
    ["clipped at the edge", image({ radius: MIN_MASTER * 0.52 }), /reaches the edge/],
    ["a white halo", image({ ring: [250, 248, 245, 120] }), /pale halo/],
    ["nothing painted", image({ fg: CLEAR, ring: CLEAR }), /nothing painted/],
  ];
  it.each(cases)("flags %s", (_, pixels, problem) => {
    expect(checkMaster(pixels).join("\n")).toMatch(problem);
  });

  it("a pale cut face inside the subject is not a halo", () => {
    expect(checkMaster(image({ fg: [250, 245, 225, 255] }))).toEqual([]);
  });
});

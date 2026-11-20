// Writes the browser and home-screen icons from the mark in src/shared/brand.ts: a cream O and leaf on a plum tile.
// Run after changing the mark: `npm run brand:icons`. The outputs in public/ are committed.
import { writeFileSync } from "node:fs";
import sharp from "sharp";
import {
  LEAF_PATH,
  MARK_BOTTOM,
  MARK_TOP,
  O_ADVANCE,
  O_PATH,
  STEM_PATH,
  VEIN_PATH,
  VEIN_WIDTH,
} from "../src/shared/brand";

const PLUM = "#42192d"; // --color-ink
const CREAM = "#fbf6ea"; // --color-canvas

/**
 * A 512-unit square tile with the mark centered. `scale` is the mark's size in tile units per font unit: 0.44 keeps
 * it inside the 80% circle Android may crop a maskable icon to; the favicon, never cropped, uses more of the tile.
 */
function tile({ scale, radius, vein }: { scale: number; radius: number; vein: boolean }) {
  const width = O_ADVANCE * scale;
  const height = (MARK_BOTTOM - MARK_TOP) * scale;
  const x = (512 - width) / 2;
  const y = (512 - height) / 2 - MARK_TOP * scale;
  const veinPath = vein
    ? `<path d="${VEIN_PATH}" fill="none" stroke="${PLUM}" stroke-width="${VEIN_WIDTH}" stroke-linecap="round"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>Orchard</title><rect width="512" height="512" rx="${radius}" fill="${PLUM}"/><g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale})" fill="${CREAM}"><path d="${O_PATH}"/><path d="${STEM_PATH}"/><path d="${LEAF_PATH}"/>${veinPath}</g></svg>`;
}

const png = (svg: string, size: number, file: string) =>
  sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png().toFile(`public/${file}`);

// Browser tabs: rounded, no vein (it is noise at 16–32 px).
writeFileSync("public/favicon.svg", `${tile({ scale: 0.5, radius: 96, vein: false })}\n`);
// Home screen: full-bleed squares; iOS and Android round or crop them themselves.
const homeScreen = tile({ scale: 0.44, radius: 0, vein: true });
await Promise.all([
  png(homeScreen, 180, "apple-touch-icon.png"),
  png(homeScreen, 192, "icon-192.png"),
  png(homeScreen, 512, "icon-512.png"),
]);
console.log("Wrote public/favicon.svg, apple-touch-icon.png, icon-192.png, icon-512.png");

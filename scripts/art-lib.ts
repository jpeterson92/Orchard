// Checks on a painted master before art:process writes its derivatives (engineering plan §5, art track;
// illustration guide §1 "Transparency, paper, and export"). Pure: takes decoded pixels, returns problems.

/** Masters are square PNGs at least this wide; derivatives go up to 640 px. */
export const MIN_MASTER = 1024;
/** Alpha above this counts as painted. */
const VISIBLE = 16;
/** The painting must stay this far (fraction of the side) from every edge: crop safety, no rectangle. */
const MARGIN = 0.02;
/** At least this share of the canvas must be fully transparent, or the "transparency" is a painted background. */
const MIN_CLEAR = 0.1;
/** Edge pixels (partly transparent) this pale, over this share of the edge, read as a white halo. */
const PALE = 235;
const MAX_PALE_EDGE = 0.25;

export interface Pixels {
  width: number;
  height: number;
  channels: number;
  data: Uint8Array;
}

export function checkMaster({ width, height, channels, data }: Pixels): string[] {
  const problems: string[] = [];
  if (width !== height) problems.push(`not square (${width}×${height})`);
  if (Math.min(width, height) < MIN_MASTER) problems.push(`smaller than ${MIN_MASTER} px`);
  if (channels !== 4) {
    problems.push("no alpha channel: export with a transparent background");
    return problems;
  }

  let clear = 0;
  let edge = 0;
  let paleEdge = 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      const a = data[p + 3] ?? 0;
      if (a === 0) clear++;
      if (a <= VISIBLE) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (a < 200) {
        edge++;
        if (Math.min(data[p] ?? 0, data[p + 1] ?? 0, data[p + 2] ?? 0) >= PALE) paleEdge++;
      }
    }
  }

  if (maxX < 0) {
    problems.push("nothing painted: the image is fully transparent");
    return problems;
  }
  if (clear / (width * height) < MIN_CLEAR)
    problems.push("no real transparency: a white rectangle, paper patch or painted checkerboard");
  const mx = Math.ceil(width * MARGIN);
  const my = Math.ceil(height * MARGIN);
  if (minX < mx || minY < my || maxX >= width - mx || maxY >= height - my)
    problems.push("the painting reaches the edge: clipped, or a background rectangle; leave crop safety");
  if (edge > 0 && paleEdge / edge > MAX_PALE_EDGE) problems.push("a pale halo around the subject's edges");
  return problems;
}

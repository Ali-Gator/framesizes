import { CATALOG, findFrame, type Frame } from "./frames";
import { DIPLOMA, MAT_WIDTH, matBorders, matSizes, preCutFor } from "./mat";
import { gap, identifyFrame, type Identified, MEASURE_TOLERANCE } from "./measure";
import { ACTUAL_SIZES, type ActualSize, fromMm } from "./screen";
import type { Size } from "./units";

/*
 * The poster frame picker (F6): a poster size gives the frame it takes without a mat and the
 * standard frames that hold it with one. Lengths in inches. The sizes are checked in the
 * archived t6-poster-frame-engine change (`verification.md`).
 */

export type PosterGroup = "us" | "a-series";

/** A poster size the picker offers, upright. `id` names it: `24x36`, `A2`. */
export interface Poster extends Size {
  id: string;
  group: PosterGroup;
  use: string;
}

function us(id: string, use: string): Poster {
  const frame = findFrame(id);
  if (!frame) throw new Error(`${id} is not a catalog frame`);
  return { id, group: "us", use, w: frame.w, h: frame.h };
}

const aSeries = ({ id, w, h }: ActualSize, use: string): Poster => ({
  id,
  group: "a-series",
  use,
  w,
  h,
});

const A3 = ACTUAL_SIZES.find((s) => s.id === "A3");
if (!A3) throw new Error("A3 is not an actual size");
const A2 = fromMm("A2", 420, 594);
const A1 = fromMm("A1", 594, 841);

/**
 * The A-series frames F6 names by the paper's name, upright. Not in `METRIC_FRAMES`, so what
 * F4 and F5 match does not change.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-poster-near-a2-or-a1-is-named-that-a-series-frame}
 */
export const A_FRAMES: readonly ActualSize[] = [A2, A1];

/**
 * The picker's poster sizes, in its order.
 * {@link openspec/specs/size-engine/spec.md#requirement-the-poster-frame-picker-offers-ten-poster-sizes}
 */
export const POSTERS: readonly Poster[] = [
  us("11x17", "Small posters and flyers"),
  us("12x18", "Posters and photo enlargements"),
  us("16x20", "Art prints and small posters"),
  us("18x24", "Medium posters and art prints"),
  us("20x30", "Large photo prints and posters"),
  us("24x36", "Large posters"),
  us("27x40", "Movie posters"),
  aSeries(A3, "Small metric posters"),
  aSeries(A2, "Medium metric posters"),
  aSeries(A1, "Large metric posters"),
];

/**
 * The mat border a frame not sold with a pre-cut mat may leave on every side, in inches.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-mat-border-on-a-poster-frame-is-1-to-4-inches}
 */
export const POSTER_BORDER = { min: 1, max: 4 } as const;

/** A standard frame that holds a poster with a mat, turned to the poster's orientation. */
export interface MattedFrame {
  frame: Frame;
  /** Border at the sides, in inches. */
  side: number;
  /** Border at the top and bottom, in inches. */
  top: number;
  /** Sold with a pre-cut mat for this poster. */
  preCut: boolean;
  /** The print the mat is cut for, turned like `frame`: the poster, or a pre-cut mat's own print. */
  print: Size;
}

export interface PosterFrames {
  /** The frame without a mat: the poster's own size, matched as a measured inside size. */
  bare: Identified;
  /** A2 or A1, turned, when `bare` is custom and the poster is within ⅜ in of it. */
  aFrame?: ActualSize;
  /** Smallest area first; empty when no standard frame holds the poster with a mat. */
  matted: readonly MattedFrame[];
  /** Only when `matted` is empty: the frame a 2 in mat needs, as F5 gives it. */
  customFrame?: Size;
}

const positive = (n: number) => Number.isFinite(n) && n > 0;
const inRange = (n: number) => n >= POSTER_BORDER.min && n <= POSTER_BORDER.max;

function namedA(up: Size, landscape: boolean): ActualSize | undefined {
  const near = A_FRAMES.filter((a) => gap(a, up) <= MEASURE_TOLERANCE).sort(
    (a, b) => gap(a, up) - gap(b, up),
  )[0];
  if (!near) return undefined;
  return landscape ? { ...near, w: near.h, h: near.w } : { ...near };
}

/** The print a pre-cut frame's mat is cut for: its catalog pairing, else the diploma. */
const soldPrint = (f: Frame, up: Size): Size =>
  f.mat && gap(f.mat, up) <= MEASURE_TOLERANCE ? f.mat : DIPLOMA.print;

function matted(up: Size, landscape: boolean): MattedFrame[] {
  const square = up.h - up.w <= MEASURE_TOLERANCE;
  const preCut = new Set(preCutFor(up).map((f) => f.id));
  const found: MattedFrame[] = [];
  for (const f of CATALOG) {
    const pre = preCut.has(f.id);
    if (f.orientation === "square" && !square && !pre) continue;
    // A pre-cut mat's opening is cut for its own print, so its borders are the mat's as sold.
    const print = pre ? soldPrint(f, up) : up;
    const { side, top } = matBorders(f, print);
    if (pre || (inRange(side) && inRange(top)))
      found.push({ frame: f, side, top, preCut: pre, print });
  }
  found.sort((a, b) => a.frame.w * a.frame.h - b.frame.w * b.frame.h);
  if (!landscape) return found;
  return found.map((m) => {
    const turned =
      m.frame.orientation === "square" ? m.frame : findFrame(`${m.frame.h}x${m.frame.w}`);
    if (!turned) throw new Error(`${m.frame.id} has no landscape entry`);
    return {
      ...m,
      frame: turned,
      side: m.top,
      top: m.side,
      print: { w: m.print.h, h: m.print.w },
    };
  });
}

/**
 * The frame a poster takes without a mat, the A2 or A1 frame it is sold as, the standard frames
 * that hold it with a mat and, when there are none, the frame a 2 in mat needs; `undefined` for a
 * size that is not positive.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-poster-without-a-mat-takes-a-frame-of-its-own-size}
 * {@link openspec/specs/size-engine/spec.md#requirement-a-poster-with-a-mat-names-the-standard-frames-that-hold-it}
 * {@link openspec/specs/size-engine/spec.md#requirement-a-poster-with-no-standard-frame-for-a-mat-gets-the-frame-for-a-2-inch-mat}
 * {@link openspec/specs/size-engine/spec.md#requirement-a-poster-size-that-is-not-a-positive-number-gets-no-answer}
 */
export function posterFrames(poster: Size): PosterFrames | undefined {
  const { w, h } = poster;
  if (!positive(w) || !positive(h)) return undefined;
  const bare = identifyFrame({ kind: "inside", size: { w, h } });
  if (!bare) return undefined;
  const landscape = w > h;
  const up = landscape ? { w: h, h: w } : { w, h };
  const out: PosterFrames = { bare, matted: matted(up, landscape) };
  if (bare.kind === "custom") {
    const a = namedA(up, landscape);
    if (a) out.aFrame = a;
  }
  if (out.matted.length === 0) {
    const frame = matSizes({ from: "print", print: { w, h }, width: MAT_WIDTH })?.frame;
    if (frame) out.customFrame = frame;
  }
  return out;
}

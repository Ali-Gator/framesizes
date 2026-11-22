import { CATALOG, findFrame, MAT_OVERLAP, type Frame } from "./frames";
import { ACTUAL_SIZES, type ActualSize } from "./screen";
import { CM_PER_INCH, type Size } from "./units";

/*
 * Measuring a frame: four measurements in inches turned into the frame size (or, for a mat, the
 * print size) and the standard size it points to. The allowances are checked in the archived
 * t4-measure-engine change (`verification.md`).
 */

/**
 * How far each side may be from a size and still match it, in inches. Any two catalog sizes are
 * at least 1 in apart on some side, so a measurement matches at most one.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-measured-frame-size-is-matched-to-a-standard-size}
 */
export const MEASURE_TOLERANCE = 0.375;

/**
 * How much of the picture a frame's lip covers on each side, in inches.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-front-opening-gives-the-frame-size}
 */
export const LIP = 0.25;

function actual(id: string): ActualSize {
  const found = ACTUAL_SIZES.find((s) => s.id === id);
  if (!found) throw new Error(`${id} is not an actual size`);
  return found;
}

const fromCm = (w: number, h: number): ActualSize => ({
  id: `${w}x${h} cm`,
  label: `${w} × ${h} cm`,
  w: w / CM_PER_INCH,
  h: h / CM_PER_INCH,
});

/**
 * The metric ready-made frame sizes, upright. A4 and A3 are the actual size viewer's records.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-metric-frame-size-is-named-when-it-is-closer-than-the-us-size}
 */
export const METRIC_FRAMES: readonly ActualSize[] = [
  actual("A4"),
  actual("A3"),
  fromCm(30, 40),
  fromCm(40, 50),
  fromCm(50, 70),
];

/**
 * What the visitor measured, in inches. `inside`: the glass, backing or recess. `front`: the
 * window seen from the front of a frame with no mat. `outside`: edge to edge, with `face`, the
 * moulding's width seen from the front. `mat`: the mat's opening.
 */
export type Measurement =
  | { kind: "inside"; size: Size }
  | { kind: "front"; size: Size; lip?: number }
  | { kind: "outside"; size: Size; face: number; lip?: number }
  | { kind: "mat"; size: Size; overlap?: number };

/** `size` is the frame size the numbers give, or for a mat the print size, as measured. */
export type Identified =
  | { kind: "standard"; size: Size; frame: Frame }
  | { kind: "metric"; size: Size; metric: ActualSize; close?: Frame }
  | { kind: "custom"; size: Size; below?: Frame; above?: Frame }
  /** `frames` is empty when no pre-cut mat is sold for that print. */
  | { kind: "mat"; size: Size; frames: readonly Frame[] };

const positive = (n: number) => Number.isFinite(n) && n > 0;
const upright = ({ w, h }: Size): Size => (w <= h ? { w, h } : { w: h, h: w });
const gap = (a: Size, b: Size) => Math.max(Math.abs(a.w - b.w), Math.abs(a.h - b.h));

/** An upright catalog frame turned to the measured orientation; a square stays square. */
const turn = (frame: Frame, landscape: boolean): Frame =>
  landscape && frame.orientation !== "square"
    ? (findFrame(`${frame.h}x${frame.w}`) ?? frame)
    : frame;

function closest<T extends Size>(list: readonly T[], up: Size): { item: T; d: number } | undefined {
  let best: { item: T; d: number } | undefined;
  for (const item of list) {
    const d = gap(item, up);
    if (d <= MEASURE_TOLERANCE && (!best || d < best.d)) best = { item, d };
  }
  return best;
}

function nearest(up: Size, landscape: boolean): { below?: Frame; above?: Frame } {
  const square = up.h - up.w <= MEASURE_TOLERANCE;
  const area = (f: Frame) => f.w * f.h;
  let below: Frame | undefined;
  let above: Frame | undefined;
  for (const f of CATALOG) {
    if ((f.orientation === "square") !== square) continue;
    if (f.w <= up.w && f.h <= up.h && (!below || area(f) > area(below))) below = f;
    if (f.w >= up.w && f.h >= up.h && (!above || area(f) < area(above))) above = f;
  }
  return {
    below: below && turn(below, landscape),
    above: above && turn(above, landscape),
  };
}

function match(size: Size): Identified {
  const up = upright(size);
  const landscape = size.w > size.h;
  const us = closest(CATALOG, up);
  const metric = closest(METRIC_FRAMES, up);
  if (metric && (!us || metric.d < us.d)) {
    const m = metric.item;
    return {
      kind: "metric",
      size,
      metric: landscape ? { ...m, w: m.h, h: m.w } : { ...m },
      close: us && turn(us.item, landscape),
    };
  }
  if (us) return { kind: "standard", size, frame: turn(us.item, landscape) };
  return { kind: "custom", size, ...nearest(up, landscape) };
}

/**
 * The size a measurement gives and the standard, metric or custom size it is, or for a mat the
 * print and the frames sold with that mat; `undefined` when the numbers give no size.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-measured-frame-size-is-matched-to-a-standard-size}
 */
export function identifyFrame(m: Measurement): Identified | undefined {
  const { w, h } = m.size;
  if (!positive(w) || !positive(h)) return undefined;

  if (m.kind === "mat") {
    const overlap = m.overlap ?? MAT_OVERLAP;
    if (!positive(overlap)) return undefined;
    const size = { w: w + 2 * overlap, h: h + 2 * overlap };
    const print = upright(size);
    const frames = CATALOG.filter((f) => f.mat && gap(f.mat, print) <= MEASURE_TOLERANCE).map((f) =>
      turn(f, size.w > size.h),
    );
    return { kind: "mat", size, frames };
  }

  if (m.kind === "inside") return match({ w, h });

  const lip = m.lip ?? LIP;
  if (!positive(lip)) return undefined;
  let grow = 2 * lip;
  if (m.kind === "outside") {
    if (!positive(m.face)) return undefined;
    grow -= 2 * m.face;
  }
  const size = { w: w + grow, h: h + grow };
  if (size.w <= 0 || size.h <= 0) return undefined;
  return match(size);
}

import { CATALOG, findFrame, frameAnatomy, MAT_OVERLAP, MOULDING, type Frame } from "./frames";
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
  /** `squareBelow` and `squareAbove` only for a near-square size (long side under 1.2 × short). */
  | {
      kind: "custom";
      size: Size;
      below?: Frame;
      above?: Frame;
      squareBelow?: Frame;
      squareAbove?: Frame;
    }
  /** `frames` is empty when no pre-cut mat is sold for that print. */
  | { kind: "mat"; size: Size; frames: readonly Frame[] };

const positive = (n: number) => Number.isFinite(n) && n > 0;
const upright = ({ w, h }: Size): Size => (w <= h ? { w, h } : { w: h, h: w });
/** The larger of the two side differences, in inches. */
export const gap = (a: Size, b: Size) => Math.max(Math.abs(a.w - b.w), Math.abs(a.h - b.h));

/** An upright catalog frame turned to the measured orientation; a square stays square. */
function turn(frame: Frame, landscape: boolean): Frame {
  if (!landscape || frame.orientation === "square") return frame;
  const turned = findFrame(`${frame.h}x${frame.w}`);
  if (!turned) throw new Error(`${frame.id} has no landscape entry`);
  return turned;
}

function closest<T extends Size>(list: readonly T[], up: Size): { item: T; d: number } | undefined {
  let best: { item: T; d: number } | undefined;
  for (const item of list) {
    const d = gap(item, up);
    if (d <= MEASURE_TOLERANCE && (!best || d < best.d)) best = { item, d };
  }
  return best;
}

/** The largest catalog size no bigger on either side and the smallest at least as big on both. */
function bounds(up: Size, square: boolean): { below?: Frame; above?: Frame } {
  const area = (f: Frame) => f.w * f.h;
  let below: Frame | undefined;
  let above: Frame | undefined;
  for (const f of CATALOG) {
    if ((f.orientation === "square") !== square) continue;
    if (f.w <= up.w && f.h <= up.h && (!below || area(f) > area(below))) below = f;
    if (f.w >= up.w && f.h >= up.h && (!above || area(f) < area(above))) above = f;
  }
  return { below, above };
}

/** Squarer than every catalog rectangle (20x24 is 1.2): BL-106. */
const NEAR_SQUARE = 1.2;

function nearest(
  up: Size,
  landscape: boolean,
): Pick<
  Extract<Identified, { kind: "custom" }>,
  "below" | "above" | "squareBelow" | "squareAbove"
> {
  const square = up.h - up.w <= MEASURE_TOLERANCE;
  const { below, above } = bounds(up, square);
  const out: ReturnType<typeof nearest> = {
    below: below && turn(below, landscape),
    above: above && turn(above, landscape),
  };
  if (!square && up.h < NEAR_SQUARE * up.w) {
    const squares = bounds(up, true);
    if (squares.below) out.squareBelow = squares.below;
    if (squares.above) out.squareAbove = squares.above;
  }
  return out;
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

/** Why a measurement gives no size. */
export type NoAnswer = "number" | "narrow" | "room";

/** The frame size (or for a mat the print size) a measurement gives, or why it gives none. */
function sizeOf(m: Measurement): Size | NoAnswer {
  const { w, h } = m.size;
  if (!positive(w) || !positive(h)) return "number";
  if (m.kind === "mat") {
    const overlap = m.overlap ?? MAT_OVERLAP;
    if (!positive(overlap)) return "number";
    return { w: w + 2 * overlap, h: h + 2 * overlap };
  }
  if (m.kind === "inside") return { w, h };
  const lip = m.lip ?? LIP;
  if (!positive(lip)) return "number";
  let grow = 2 * lip;
  if (m.kind === "outside") {
    if (!positive(m.face)) return "number";
    if (m.face <= lip) return "narrow";
    grow -= 2 * m.face;
  }
  const size = { w: w + grow, h: h + grow };
  return size.w > 0 && size.h > 0 ? size : "room";
}

/**
 * Why a measurement gets no answer: a number that is not positive, a moulding no wider than its
 * lip, or mouldings that leave no room; `undefined` when it gets one.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-measurement-with-no-answer-says-why}
 */
export function whyNoAnswer(m: Measurement): NoAnswer | undefined {
  const size = sizeOf(m);
  return typeof size === "string" ? size : undefined;
}

/**
 * The size a measurement gives and the standard, metric or custom size it is, or for a mat the
 * print and the frames sold with that mat; `undefined` when the numbers give no size.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-measured-frame-size-is-matched-to-a-standard-size}
 */
export function identifyFrame(m: Measurement): Identified | undefined {
  const size = sizeOf(m);
  if (typeof size === "string") return undefined;
  if (m.kind !== "mat") return match(size);
  return { kind: "mat", size, frames: preCutFrames(size) };
}

/**
 * The catalog frames whose pre-cut mat holds a print within the tolerance of `print`, in catalog
 * order and turned to the print's orientation; empty when none is sold for it.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-print-names-the-frames-sold-with-a-pre-cut-mat-for-it}
 */
export function preCutFrames(print: Size): readonly Frame[] {
  const up = upright(print);
  return CATALOG.filter((f) => f.mat && gap(f.mat, up) <= MEASURE_TOLERANCE).map((f) =>
    turn(f, print.w > print.h),
  );
}

/** A catalog frame's four measurements, as F4's table lists them. */
export interface FrameMeasurements {
  /** The frame size. */
  inside: Size;
  /** The inside less two lips. */
  front: Size;
  /** With the example moulding. */
  outside: Size;
  /** The example moulding seen from the front: the moulding plus the lip. */
  face: number;
  /** Absent when no pre-cut mat is sold for the frame. */
  mat?: { opening: Size; print: Size };
}

/**
 * A catalog frame's inside, front opening, outside with the example moulding, that moulding's
 * width from the front, and its pre-cut mat's opening and print.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-standard-frames-measurements-are-listed}
 */
export function frameMeasurements(frame: Frame): FrameMeasurements {
  const inside = { w: frame.w, h: frame.h };
  const anatomy = frameAnatomy({ frame: inside, image: frame.mat ?? inside, moulding: MOULDING });
  const out: FrameMeasurements = {
    inside,
    front: { w: frame.w - 2 * LIP, h: frame.h - 2 * LIP },
    outside: anatomy.outside,
    face: MOULDING + LIP,
  };
  if (frame.mat) out.mat = { opening: anatomy.matOpening, print: { ...frame.mat } };
  return out;
}

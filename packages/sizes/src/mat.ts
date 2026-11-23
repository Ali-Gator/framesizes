import { CATALOG, findFrame, MAT_OVERLAP, type Frame } from "./frames";
import {
  identifyFrame,
  MEASURE_TOLERANCE,
  preCutFrames,
  type Identified,
  type NoAnswer,
} from "./measure";
import type { Size } from "./units";

/*
 * The frame and mat calculator: a print and a mat width give the frame, or a frame and a mat
 * width give the print. Lengths in inches; the mat width is the board cut on each side.
 */

/**
 * The mat width the calculator starts with, and its presets, in inches.
 * {@link openspec/specs/size-engine/spec.md#requirement-the-calculator-offers-four-mat-widths-and-starts-at-2-inches}
 */
export const MAT_WIDTH = 2;
export const MAT_WIDTHS = [1.5, 2, 2.5, 3] as const;

/** From a print: what frame it needs. From a frame: what print fits. `overlap` is ¼ in unless given. */
export type MatQuestion =
  | { from: "print"; print: Size; width: number; overlap?: number }
  | { from: "frame"; frame: Size; width: number; overlap?: number };

export interface MatAnswer {
  /** As given, or the largest print the mat holds. */
  print: Size;
  opening: Size;
  /** As given, or the frame size the print and mat give. */
  frame: Size;
  printMatch: Identified;
  frameMatch: Identified;
  /** Frames sold with a pre-cut mat for `print`, in its orientation; often empty from a frame. */
  preCut: readonly Frame[];
}

const positive = (n: number) => Number.isFinite(n) && n > 0;
const grow = ({ w, h }: Size, by: number): Size => ({ w: w + 2 * by, h: h + 2 * by });

/** Why a mat question gets no answer: `"narrow"` is a mat no wider than its overlap. */
export type NoMat = NoAnswer;

function catalogFrame(id: string): Frame {
  const found = CATALOG.find((f) => f.id === id);
  if (!found) throw new Error(`${id} is not a catalog frame`);
  return found;
}

/**
 * The usual US diploma, and the frame sold for it with a mat cut for that size, upright.
 * Checked against retail listings: `openspec/changes/archive/2026-11-23-t5-frame-mat-calculator/verification.md`.
 * {@link openspec/specs/size-engine/spec.md#requirement-the-engine-names-the-frame-sold-for-a-diploma}
 */
export const DIPLOMA: { readonly print: Size; readonly frame: Frame } = {
  print: { w: 8.5, h: 11 },
  frame: catalogFrame("11x14"),
};

type Sizes = Pick<MatAnswer, "print" | "opening" | "frame">;

/** A width so large it overflows to Infinity is refused as a number, like Infinity itself. */
const finite = (s: Sizes): Sizes | NoMat =>
  [s.print, s.opening, s.frame].every((z) => Number.isFinite(z.w) && Number.isFinite(z.h))
    ? s
    : "number";

function sizesOf(q: MatQuestion): Sizes | NoMat {
  const given = q.from === "print" ? q.print : q.frame;
  const overlap = q.overlap ?? MAT_OVERLAP;
  if (![given.w, given.h, q.width, overlap].every(positive)) return "number";
  if (q.width <= overlap) return "narrow";
  if (q.from === "print") {
    const opening = grow(q.print, -overlap);
    if (opening.w <= 0 || opening.h <= 0) return "room";
    return finite({ print: q.print, opening, frame: grow(opening, q.width) });
  }
  const opening = grow(q.frame, -q.width);
  if (opening.w <= 0 || opening.h <= 0) return "room";
  return finite({ print: grow(opening, overlap), opening, frame: q.frame });
}

/** `identifyFrame` on an inside size; every size here is positive and finite, so it always answers. */
function matched(size: Size): Identified {
  const found = identifyFrame({ kind: "inside", size });
  if (!found) throw new Error(`${size.w} × ${size.h} has no match`);
  return found;
}

/**
 * Why a mat question gets no answer: a number that is not positive, a mat no wider than its
 * overlap, or a mat or overlap that leaves no opening; `undefined` when it gets one.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-mat-question-that-gives-no-size-says-why}
 */
export function whyNoMat(q: MatQuestion): NoMat | undefined {
  const sizes = sizesOf(q);
  return typeof sizes === "string" ? sizes : undefined;
}

/**
 * The print, mat opening and frame a mat question gives, each matched as F4 matches an inside
 * measurement, and the frames sold with a pre-cut mat for the print; `undefined` when none.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-print-and-a-mat-width-give-the-mat-opening-and-the-frame-size}
 * {@link openspec/specs/size-engine/spec.md#requirement-a-frame-and-a-mat-width-give-the-mat-opening-and-the-largest-print}
 */
export function matSizes(q: MatQuestion): MatAnswer | undefined {
  const sizes = sizesOf(q);
  if (typeof sizes === "string") return undefined;
  return {
    ...sizes,
    printMatch: matched(sizes.print),
    frameMatch: matched(sizes.frame),
    preCut: preCutFor(sizes.print),
  };
}

const catalogIndex = (f: Frame) =>
  CATALOG.findIndex((c) => c.w === Math.min(f.w, f.h) && c.h === Math.max(f.w, f.h));

/** `preCutFrames`, plus the diploma frame for a diploma-size print, in catalog order. */
function preCutFor(print: Size): readonly Frame[] {
  const found = preCutFrames(print);
  const landscape = print.w > print.h;
  const up = landscape ? { w: print.h, h: print.w } : print;
  const { print: d, frame } = DIPLOMA;
  if (Math.max(Math.abs(up.w - d.w), Math.abs(up.h - d.h)) > MEASURE_TOLERANCE) return found;
  const diploma = landscape ? findFrame(`${frame.h}x${frame.w}`) : frame;
  if (!diploma || found.some((f) => f.id === diploma.id)) return found;
  return [...found, diploma].sort((a, b) => catalogIndex(a) - catalogIndex(b));
}

/**
 * The mat border at the sides and at the top and bottom for `print` in `frame`; 0 or less when
 * the print's opening does not fit. Plain arithmetic: pass sizes `matSizes` or the catalog gave.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-frame-and-a-print-give-the-mat-border-on-each-side}
 */
export function matBorders(
  frame: Size,
  print: Size,
  overlap = MAT_OVERLAP,
): { side: number; top: number } {
  return {
    side: (frame.w - print.w + 2 * overlap) / 2,
    top: (frame.h - print.h + 2 * overlap) / 2,
  };
}

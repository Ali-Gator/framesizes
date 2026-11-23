import { MAT_OVERLAP, type Frame } from "./frames";
import { identifyFrame, preCutFrames, type Identified, type NoAnswer } from "./measure";
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

function sizesOf(q: MatQuestion): Pick<MatAnswer, "print" | "opening" | "frame"> | NoAnswer {
  const given = q.from === "print" ? q.print : q.frame;
  const overlap = q.overlap ?? MAT_OVERLAP;
  if (![given.w, given.h, q.width, overlap].every(positive)) return "number";
  if (q.from === "print") {
    const opening = grow(q.print, -overlap);
    if (opening.w <= 0 || opening.h <= 0) return "room";
    return { print: q.print, opening, frame: grow(opening, q.width) };
  }
  const opening = grow(q.frame, -q.width);
  if (opening.w <= 0 || opening.h <= 0) return "room";
  return { print: grow(opening, overlap), opening, frame: q.frame };
}

/** `identifyFrame` on an inside size; every size here is positive, so it always answers. */
function matched(size: Size): Identified {
  const found = identifyFrame({ kind: "inside", size });
  if (!found) throw new Error(`${size.w} × ${size.h} has no match`);
  return found;
}

/**
 * Why a mat question gets no answer: a number that is not positive, or a mat or overlap that
 * leaves no opening; `undefined` when it gets one.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-mat-question-that-gives-no-size-says-why}
 */
export function whyNoMat(q: MatQuestion): NoAnswer | undefined {
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
    preCut: preCutFrames(sizes.print),
  };
}

/**
 * The mat border at the sides and at the top and bottom for `print` in `frame`; 0 or less when
 * the print's opening does not fit.
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

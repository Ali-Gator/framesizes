import type { NoNail, Unit } from "@framesizes/sizes";

import { writeDistance } from "@/components/frames-on-wall/display";

import type { Target, Warning } from "./state";

/** The planner's words, from the approved G1 canvas. */

export const WIDGET_TITLE = "Gallery wall layout generator";

/** Each template's frames, as the template table lists them. */
export const TEMPLATE_FRAMES: Record<string, string> = {
  "row-of-three": "3 × 11x14",
  "grid-of-four": "4 × 11x14",
  "grid-of-nine": "9 × 8x10",
  "one-big-two-each-side": "18x24 + 4 × 8x10",
  "two-rows": "2 × 11x14, 16x20, 3 × 8x10",
};

const NUMBERS = [
  "no",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];
/** "five frames", "one nail". */
export const count = (n: number, one: string, many: string) =>
  `${NUMBERS[n] ?? n} ${n === 1 ? one : many}`;

/** "8x10" written as the canvas's chips: "8×10". */
export const chipSize = (size: string) => size.replace("x", "×");

/** What a distance runs to, after "to" or "past". */
export function targetName(to: Target, furniture: string): string {
  if (to.kind === "frame") return `frame ${to.letter}`;
  if (to.kind === "furniture") return `the ${furniture}`;
  if (to.side === "above") return "the ceiling";
  if (to.side === "below") return "the floor";
  return "the wall's edge";
}

/**
 * The warning under the drawing: a title and one line.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-a-group-past-the-walls-edge-is-flagged}
 */
export function warningText(w: Warning, unit: Unit): { title: string; text: string } {
  switch (w.kind) {
    case "wide":
      return {
        title: "The group is wider than the wall",
        text: `It is ${writeDistance(w.by, unit)} too wide. Pick smaller frames or a narrower gap.`,
      };
    case "right":
      return {
        title: "The group runs past the wall's right edge",
        text: `By ${writeDistance(w.by, unit)}. Move it left or pick smaller frames.`,
      };
    case "left":
      return {
        title: "The group runs past the wall's left edge",
        text: `By ${writeDistance(w.by, unit)}. Move it right or pick smaller frames.`,
      };
    case "floor":
      return {
        title: "The group runs past the floor",
        text: `By ${writeDistance(w.by, unit)}. Move it up or pick smaller frames.`,
      };
    case "ceiling":
      return {
        title: "The group runs past the ceiling",
        text: `By ${writeDistance(w.by, unit)}. Pick smaller frames or a narrower gap.`,
      };
    case "photo":
      return {
        title: "The group runs past your photo",
        text: "Move it in or pick smaller frames.",
      };
  }
}

/**
 * Why a frame gets no nail, as one line under the nail table.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-a-frame-without-a-nail-says-why}
 */
export function noNailText(
  letter: string,
  reason: NoNail,
  size: { w: number; h: number },
  unit: Unit,
): string {
  switch (reason) {
    case "no-drop":
      return `${letter}: type the drop to place its nail.`;
    case "drop-out-of-range":
      return `${letter}: the drop has to be under ${writeDistance(size.h, unit)}, the frame's height on the wall.`;
    case "no-inset":
      return `${letter}: type the inset to place its two nails.`;
    case "inset-out-of-range":
      return `${letter}: the inset has to be between 0 and ${writeDistance(size.w / 2, unit)}, half the frame's width.`;
  }
}

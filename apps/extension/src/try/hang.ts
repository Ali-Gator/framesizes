import {
  ABOVE_SOFA,
  CENTRE_LINE,
  centreGroup,
  MOULDING,
  type Rect,
  type Side,
  setDistance,
  snapFrame,
  type SnapLines,
  type Wall,
} from "@framesizes/sizes";

import { clampTo, namedDistances } from "@/components/frames-on-wall/state";

/*
 * The print on the wall, alone: its size as it hangs, where it hangs, its four distances, and the
 * tip over the furniture. Pure, in wall inches (`y` up from the bottom).
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-print-hangs-at-true-size-on-the-saved-wall}
 */

export interface Size {
  w: number;
  h: number;
}

/**
 * The picked size turned so its longer side runs the way the picture's does; as written when the
 * picture's shape is unknown (`null`).
 */
export function turnSize(size: Size, landscape: boolean | null): Size {
  if (landscape === null) return { w: size.w, h: size.h };
  const long = Math.max(size.w, size.h);
  const short = Math.min(size.w, size.h);
  return landscape ? { w: long, h: short } : { w: short, h: long };
}

/** The size as written, its numbers swapped when the print hangs turned: "36 × 24 in". */
export function turnLabel(label: string, size: Size, turned: Size): string {
  if (size.w === turned.w) return label;
  const parts = /^(.+?) × (.+?) (\S+)$/.exec(label);
  return parts ? `${parts[2]} × ${parts[1]} ${parts[3]}` : label;
}

/** The wall the print covers: its own size, plus a 1 in moulding each side when framed. */
export const outsideOf = (size: Size, framed: boolean): Size => {
  const m = framed ? MOULDING : 0;
  return { w: size.w + 2 * m, h: size.h + 2 * m };
};

/**
 * Where the print hangs: 8 in above the furniture and centred on it, else its centre on the 57 in
 * line (mid-wall with no floor) and centred between the known side edges. As `layoutTemplate`
 * places a group. `ponytail:` duplicated placement; export it from the engine if a third caller
 * appears.
 */
export function hangPrint(outside: Size, wall: Wall, furniture: Rect | null): Rect {
  if (furniture) {
    return {
      x: furniture.x + furniture.w / 2 - outside.w / 2,
      y: furniture.y + furniture.h + ABOVE_SOFA,
      ...outside,
    };
  }
  const b = wall.bounds;
  const floor = wall.edges.bottom;
  const centre = floor === null ? b.y + b.h / 2 : floor + CENTRE_LINE;
  const rect = { x: b.x + b.w / 2 - outside.w / 2, y: centre - outside.h / 2, ...outside };
  return centreGroup([rect], wall)[0] ?? rect;
}

/** The rule's place moved by the visitor's offset. */
export const placed = (base: Rect, at: { dx: number; dy: number }): Rect => ({
  ...base,
  x: base.x + at.dx,
  y: base.y + at.dy,
});

export type To = "furniture" | Side;

/** The print's four distances, each with what it runs to: the furniture or a wall edge. */
export const distancesOf = (rect: Rect, wall: Wall, furniture: Rect | null) =>
  namedDistances<To>(
    rect,
    furniture ? [{ rect: furniture, to: "furniture" }] : [],
    wall,
    (side) => side,
  );

/** The print moved so one side's distance reads `value`. */
export const withDistance = (
  rect: Rect,
  side: Side,
  value: number,
  wall: Wall,
  furniture: Rect | null,
): Rect => setDistance(rect, side, value, furniture ? [furniture] : [], wall);

/** The print dragged from `from` by `dx`, `dy`: snapped, and kept on the wall. */
export function dragPrint(
  from: Rect,
  dx: number,
  dy: number,
  wall: Wall,
  furniture: Rect | null,
): { rect: Rect; lines: SnapLines } {
  const moved = clampTo({ ...from, x: from.x + dx, y: from.y + dy }, wall.bounds);
  const snapped = snapFrame(moved, [], furniture ? [furniture] : [], wall);
  return { rect: clampTo(snapped.frame, wall.bounds), lines: snapped.lines };
}

/**
 * The tip: art about two-thirds of the furniture's width fills the wall above it.
 * {@link openspec/specs/gallery-wall-extension/spec.md#scenario-the-tip-over-the-sample-sofa}
 */
export const tipOf = (furniture: Rect) => ({ art: (furniture.w * 2) / 3, under: furniture.w });

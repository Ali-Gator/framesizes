import { DEMO_ROOM, hangMockup, MOULDING, mockupView, type Rect } from "@framesizes/sizes";

import { current, type State } from "./state";

/** The sample room's wall, in inches. */
export const WALL = DEMO_ROOM.wall.bounds;

/** A rectangle in wall inches, `y` down from the wall's top. */
export type Box = Rect;

export interface Scene {
  /** The part of the wall shown: the whole wall, or the close-up around the frame. */
  view: Box;
  outside: Box;
  /** The mat, the frame's inside; only with a mat. */
  mat: Box | null;
  opening: Box;
  /** Where the whole artwork is drawn: the opening widened by the part the frame cuts. */
  art: Box;
  sofa: boolean;
}

/** The engine's wall rect (`y` up from the floor) turned to `y` down from the wall's top. */
const down = (r: Rect): Box => ({ ...r, y: WALL.h - (r.y + r.h) });

/**
 * The picture's one geometry, read by the screen and the PNG alike: every rect in wall inches,
 * `y` down from the wall's top.
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-frame-hangs-on-one-of-two-walls-seen-whole-or-close-up}
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-artwork-fills-the-opening-and-can-be-moved}
 */
export function scene(
  state: Pick<State, "art" | "size" | "mat" | "focus" | "placement" | "view">,
): Scene {
  const { option, opening: o, crop } = current(state);
  const wallRect = hangMockup(option.size, state.placement);
  const outside = down(wallRect);
  const view = down(mockupView(wallRect, state.view));
  const inside = {
    x: outside.x + MOULDING,
    y: outside.y + MOULDING,
    w: option.size.w,
    h: option.size.h,
  };
  const opening = {
    x: inside.x + (inside.w - o.w) / 2,
    y: inside.y + (inside.h - o.h) / 2,
    w: o.w,
    h: o.h,
  };
  const scale = o.w / crop.w;
  return {
    view,
    outside,
    mat: state.mat ? inside : null,
    opening,
    art: {
      x: opening.x - crop.x * scale,
      y: opening.y - crop.y * scale,
      w: state.art.width * scale,
      h: state.art.height * scale,
    },
    sofa: state.placement === "sofa",
  };
}

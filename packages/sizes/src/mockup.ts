import { framesFor, MAT_OVERLAP, MOULDING, type Orientation } from "./frames";
import { MAT_WIDTH } from "./mat";
import { POSTERS } from "./poster";
import { CENTRE_LINE, type Rect, wallScene } from "./scene";
import type { Size } from "./units";
import { DEMO_ROOM } from "./wall";

/*
 * The frame mockup (F7): an artwork in pixels gives the sizes offered, how much each cuts, the
 * size the mockup opens on, the opening the art fills, the part that shows, where the frame
 * hangs on the sample wall and the saved PNG's size. Lengths in inches, artwork sizes in pixels.
 */

/** An artwork's size in pixels. */
export interface Art {
  width: number;
  height: number;
}

/** A size a mockup offers, turned to the artwork. `id` names it: `24x36`, `36x24`, `A2`. */
export interface MockupSize extends Size {
  id: string;
  /** The pre-cut mat's print size, turned; `null` when none (A-series included). */
  mat: Size | null;
}

/** An offered size with the opening the artwork fills and the share of the artwork it cuts. */
export interface MockupOption {
  size: MockupSize;
  /** `null`: no room for a 2 in mat. */
  opening: Size | null;
  /** 0..1; `null` with no opening. */
  cut: number | null;
}

/** A rectangle in pixels of the artwork: `y` down from its top edge. */
export interface PixelRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Placement = "sofa" | "plain";
export type View = "wall" | "close";

/** Sides within this share of each other count as square: from there a square frame cuts less than 20x24, the squarest rectangle (≈ 0.087). */
export const SQUARE_TOLERANCE = 1 - Math.sqrt(20 / 24);
/** Cuts within one percentage point of the least count as tied. */
export const TIE = 0.01;
/** The saved PNG's longer side, in pixels. */
export const EXPORT_LONG_SIDE = 2400;
/** How far a key press moves the artwork, in inches. */
export const KEY_STEP = { arrow: 0.25, shift: 1 } as const;

const positive = (n: number) => Number.isFinite(n) && n > 0;
const valid = (art: Art) => positive(art.width) && positive(art.height);

function orientationOf({ width, height }: Art): Orientation {
  if (Math.min(width, height) / Math.max(width, height) >= 1 - SQUARE_TOLERANCE) return "square";
  return width < height ? "portrait" : "landscape";
}

/**
 * The catalog sizes and A3, A2, A1 turned to the artwork; square art gets the square sizes only.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-mockup-offers-the-catalog-sizes-and-three-a-series-sizes-in-the-artworks-orientation}
 */
export function mockupSizes(art: Art): readonly MockupSize[] | undefined {
  if (!valid(art)) return undefined;
  const orientation = orientationOf(art);
  const frames = framesFor(orientation).map(({ id, w, h, mat }) => ({
    id,
    w,
    h,
    mat: mat && { ...mat },
  }));
  if (orientation === "square") return frames;
  const turn = orientation === "landscape";
  const aSeries = POSTERS.filter((p) => p.group === "a-series").map(({ id, w, h }) => ({
    id,
    w: turn ? h : w,
    h: turn ? w : h,
    mat: null,
  }));
  return [...frames, ...aSeries];
}

/**
 * The opening the artwork fills: the frame, its pre-cut mat less the overlap, or the frame less a
 * 2 in mat; `undefined` when a 2 in mat leaves no room.
 * {@link openspec/specs/size-engine/spec.md#requirement-the-opening-a-mockup-artwork-fills-is-the-frame-or-its-mat-opening}
 */
export function mockupOpening(size: MockupSize, mat: boolean): Size | undefined {
  if (!mat) return { w: size.w, h: size.h };
  if (size.mat) return { w: size.mat.w - 2 * MAT_OVERLAP, h: size.mat.h - 2 * MAT_OVERLAP };
  const opening = { w: size.w - 2 * MAT_WIDTH, h: size.h - 2 * MAT_WIDTH };
  return opening.w > 0 && opening.h > 0 ? opening : undefined;
}

const cutOf = (art: Art, opening: Size) => {
  const ra = art.width / art.height;
  const ro = opening.w / opening.h;
  return 1 - Math.min(ra / ro, ro / ra);
};

/**
 * Every offered size with its opening and cut, in offered order.
 * {@link openspec/specs/size-engine/spec.md#requirement-each-mockup-size-says-how-much-of-the-artwork-it-cuts}
 */
export function mockupOptions(art: Art, mat: boolean): readonly MockupOption[] | undefined {
  return mockupSizes(art)?.map((size) => {
    const opening = mockupOpening(size, mat) ?? null;
    return { size, opening, cut: opening ? cutOf(art, opening) : null };
  });
}

/**
 * The size the mockup opens on: the least cut, ties within `TIE` going to the largest size.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-mockup-opens-on-the-size-that-cuts-least}
 */
export function mockupDefault(art: Art, mat: boolean): MockupOption | undefined {
  const options = mockupOptions(art, mat)?.filter((o) => o.cut !== null);
  if (!options?.length) return undefined;
  const least = Math.min(...options.map((o) => o.cut as number));
  const area = (o: MockupOption) => o.size.w * o.size.h;
  return options
    .filter((o) => (o.cut as number) <= least + TIE)
    .reduce((best, o) => (area(o) > area(best) ? o : best));
}

/** How the artwork, scaled to fill the opening, overhangs it: the cut axis and the overhang in px. */
function overhang(art: Art, opening: Size) {
  const ro = opening.w / opening.h;
  const w = Math.min(art.width, art.height * ro);
  const h = Math.min(art.height, w / ro);
  // Under half a pixel is float noise or an invisible cut: nothing to slide.
  const clean = (slack: number) => (slack < 0.5 ? 0 : slack);
  return art.width - w > art.height - h
    ? { axis: "x" as const, w, h, slack: clean(art.width - w) }
    : { axis: "y" as const, w, h, slack: clean(art.height - h) };
}

/**
 * The part of the artwork that shows, in px from its top left corner; `focus` (0..1, clamped,
 * 0.5 by default) slides it along the cut side.
 * {@link openspec/specs/size-engine/spec.md#requirement-the-visible-part-of-a-mockup-artwork-is-centred-and-follows-a-focus-point}
 */
export function visiblePart(art: Art, opening: Size, focus = 0.5): PixelRect | undefined {
  if (!valid(art) || !positive(opening.w) || !positive(opening.h)) return undefined;
  const { axis, w, h, slack } = overhang(art, opening);
  const offset = Math.min(1, Math.max(0, Number.isNaN(focus) ? 0.5 : focus)) * slack;
  return axis === "x" ? { x: offset, y: 0, w, h } : { x: 0, y: offset, w, h };
}

/**
 * The focus change that moves the artwork `step` inches along the cut side; 0 when not cut.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-key-press-moves-a-mockup-artwork-by-a-fixed-step}
 */
export function focusStep(art: Art, opening: Size, step: number): number | undefined {
  if (!valid(art) || !positive(opening.w) || !positive(opening.h)) return undefined;
  const { w, slack } = overhang(art, opening);
  if (slack <= 0) return 0;
  return step / (slack * (opening.w / w));
}

const WALL = DEMO_ROOM.wall.bounds;

/**
 * The frame's outside on the 144 × 96 in wall, centred across it: above the sofa by F1's rule, or
 * centred on the 57 in line on a plain wall.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-mockup-frame-hangs-at-true-scale-on-the-sample-wall}
 */
export function hangMockup(size: Size, placement: Placement): Rect {
  if (placement === "sofa") {
    const outside = wallScene({ frame: size, reference: "sofa" }).frame.outside;
    return { ...outside, x: outside.x + WALL.w / 2 };
  }
  const w = size.w + 2 * MOULDING;
  const h = size.h + 2 * MOULDING;
  return { x: WALL.w / 2 - w / 2, y: CENTRE_LINE - h / 2, w, h };
}

/**
 * The whole wall, or the frame's outside widened on every side by a quarter of its longer side.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-mockup-has-a-whole-wall-view-and-a-close-up}
 */
export function mockupView(outside: Rect, view: View): Rect {
  if (view === "wall") return { ...WALL };
  const m = Math.max(outside.w, outside.h) / 4;
  return { x: outside.x - m, y: outside.y - m, w: outside.w + 2 * m, h: outside.h + 2 * m };
}

/**
 * The saved PNG's pixel size: the view's longer side at `EXPORT_LONG_SIDE`, the other in proportion;
 * `undefined` for a view whose side is not a positive number.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-saved-mockup-is-2400-pixels-on-its-longer-side}
 */
export function exportSize(view: Rect): Size | undefined {
  if (!positive(view.w) || !positive(view.h)) return undefined;
  const scale = EXPORT_LONG_SIDE / Math.max(view.w, view.h);
  return { w: Math.round(view.w * scale), h: Math.round(view.h * scale) };
}

import { CENTRE_LINE, DOOR, REFERENCES, SOFA, wallScene, type Rect } from "./scene";
import { CHECK_OBJECTS } from "./screen";
import { CM_PER_INCH, toWholeCm, type Size, type Unit } from "./units";

/*
 * The wall tool's geometry. Lengths are in inches; a `Rect`'s `x` runs from the wall's (or
 * photo's) left edge and `y` up from its bottom edge. Pixels appear only at the photo's edge.
 */

export type KnownId = "wall" | "door" | "sofa" | "bed" | "letter" | "a4" | "card";

/** A fixed length in inches; an editable default per unit; or none (the visitor types it). */
export type KnownLength =
  | { kind: "fixed"; inches: number }
  | { kind: "default"; in: number; cm: number }
  | { kind: "none" };

export interface KnownThing {
  id: KnownId;
  /** What the visitor marks. */
  name: string;
  /** The edge to mark on it. */
  edge: string;
  length: KnownLength;
}

/**
 * The things a visitor can mark to set a photo's scale, in the order the page lists them.
 * {@link openspec/specs/size-engine/spec.md#requirement-the-wall-tool-offers-seven-known-things-to-set-the-scale}
 */
export const KNOWN_THINGS: readonly KnownThing[] = [
  { id: "wall", name: "The wall", edge: "Its width, corner to corner", length: { kind: "none" } },
  {
    id: "door",
    name: "A door",
    edge: "Its height, from the floor to the top edge",
    length: { kind: "default", in: DOOR.height, cm: 200 },
  },
  {
    id: "sofa",
    name: "A sofa",
    edge: "Its width, along the top of the back",
    length: { kind: "default", in: SOFA.width, cm: toWholeCm(SOFA.width) },
  },
  {
    id: "bed",
    name: "A bed",
    edge: "Its width, along the top of the mattress",
    length: { kind: "default", in: 60, cm: 160 },
  },
  {
    id: "letter",
    name: "A Letter sheet",
    edge: "The long edge",
    length: { kind: "fixed", inches: CHECK_OBJECTS.letter.long },
  },
  {
    id: "a4",
    name: "An A4 sheet",
    edge: "The long edge",
    length: { kind: "fixed", inches: CHECK_OBJECTS.a4.long },
  },
  {
    id: "card",
    name: "A credit card",
    edge: "The long edge",
    length: { kind: "fixed", inches: CHECK_OBJECTS.card.long },
  },
];

export const KNOWN_IDS: readonly KnownId[] = KNOWN_THINGS.map((k) => k.id);

/**
 * A known thing's starting length in the visitor's unit, or `null` for the wall.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-known-things-default-length-follows-the-visitors-unit}
 */
export function defaultLength(id: KnownId, unit: Unit): number | null {
  const length = KNOWN_THINGS.find((k) => k.id === id)?.length;
  if (!length || length.kind === "none") return null;
  if (length.kind === "default") return length[unit];
  return unit === "in" ? length.inches : Math.round(length.inches * CM_PER_INCH * 100) / 100;
}

/** A point on the photo in pixels, from its top-left corner. */
export interface Point {
  x: number;
  y: number;
}

/** A photo's size in pixels. */
export interface Photo {
  width: number;
  height: number;
}

/**
 * Pixels per inch from two marked points and the real length between them, or `null`.
 * {@link openspec/specs/size-engine/spec.md#requirement-two-marked-points-and-a-real-length-give-the-photos-scale}
 */
export function scaleFromMark(a: Point, b: Point, inches: number): number | null {
  const pixels = Math.hypot(b.x - a.x, b.y - a.y);
  if (!Number.isFinite(pixels) || pixels === 0 || !Number.isFinite(inches) || inches <= 0) {
    return null;
  }
  return pixels / inches;
}

/**
 * The wall area a photo shows, in inches.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-photos-size-and-a-frames-place-convert-between-inches-and-pixels}
 */
export function photoSize(photo: Photo, scale: number): Size {
  return { w: photo.width / scale, h: photo.height / scale };
}

/** A rectangle in wall inches as photo pixels, top-left origin. */
export function rectToPhoto(rect: Rect, photo: Photo, scale: number): Rect {
  return {
    x: rect.x * scale,
    y: photo.height - (rect.y + rect.h) * scale,
    w: rect.w * scale,
    h: rect.h * scale,
  };
}

/** A photo pixel as wall inches, bottom-left origin: the inverse of `rectToPhoto`. */
export function photoPointToWall(p: Point, photo: Photo, scale: number): Point {
  return { x: p.x / scale, y: (photo.height - p.y) / scale };
}

/** The wall's edges in inches; `null` where the visitor has not marked one. */
export interface Edges {
  left: number | null;
  right: number | null;
  top: number | null;
  bottom: number | null;
}

/** `bounds` is the rectangle a frame never leaves (the wall, or the photo's area). */
export interface Wall {
  bounds: Rect;
  edges: Edges;
}

const DEMO_WIDTH = 144;
const DEMO_HEIGHT = 96;
const demoScene = wallScene({ frame: { w: 16, h: 20 }, reference: "sofa" });
const shift = (r: Rect): Rect => ({ ...r, x: r.x + DEMO_WIDTH / 2 });

/**
 * A 12 × 8 ft wall with the F1 sofa centred and a 16x20 hung above it by F1's rule.
 * {@link openspec/specs/size-engine/spec.md#requirement-the-demo-room-needs-no-marking}
 */
export const DEMO_ROOM: { wall: Wall; sofa: Rect; frame: Rect } = {
  wall: {
    bounds: { x: 0, y: 0, w: DEMO_WIDTH, h: DEMO_HEIGHT },
    edges: { left: 0, right: DEMO_WIDTH, top: DEMO_HEIGHT, bottom: 0 },
  },
  sofa: shift(REFERENCES.sofa.box),
  frame: shift(demoScene.frame.outside),
};

export type Side = "left" | "right" | "above" | "below";
export type Distances = Record<Side, number | null>;

const SIDES: readonly Side[] = ["left", "right", "above", "below"];
const OPPOSITE: Record<Side, Side> = {
  left: "right",
  right: "left",
  above: "below",
  below: "above",
};

/** Spans on the other axis share more than an edge. */
const inLine = (a: Rect, b: Rect, side: Side) =>
  side === "left" || side === "right"
    ? a.y < b.y + b.h && b.y < a.y + a.h
    : a.x < b.x + b.w && b.x < a.x + a.w;

/** The gap from `frame` to `o` when `o` lies wholly on `side`, else `null`. */
function gapTo(frame: Rect, o: Rect, side: Side): number | null {
  const gap =
    side === "left"
      ? frame.x - (o.x + o.w)
      : side === "right"
        ? o.x - (frame.x + frame.w)
        : side === "above"
          ? o.y - (frame.y + frame.h)
          : frame.y - (o.y + o.h);
  return gap >= 0 && inLine(frame, o, side) ? gap : null;
}

/** The gap from `frame` to a wall coordinate on `side`. */
function gapToEdge(frame: Rect, at: number, side: Side): number {
  if (side === "left") return frame.x - at;
  if (side === "right") return at - (frame.x + frame.w);
  if (side === "above") return at - (frame.y + frame.h);
  return frame.y - at;
}

function bound(wall: Wall, side: Side): number {
  const b = wall.bounds;
  if (side === "left") return b.x;
  if (side === "right") return b.x + b.w;
  if (side === "above") return b.y + b.h;
  return b.y;
}

const EDGE: Record<Side, keyof Edges> = {
  left: "left",
  right: "right",
  above: "top",
  below: "bottom",
};

/**
 * The room on one side: to the known edge or the nearest in-line obstacle, whichever comes
 * first, else (when `toBorder`) the bounds, else `null`. Negative for a frame past the edge.
 * O(n) over `others`.
 */
function reach(frame: Rect, side: Side, others: readonly Rect[], wall: Wall, toBorder: boolean) {
  const edge = wall.edges[EDGE[side]];
  let nearest = edge === null ? null : gapToEdge(frame, edge, side);
  for (const o of others) {
    const gap = gapTo(frame, o, side);
    if (gap !== null && (nearest === null || gap < nearest)) nearest = gap;
  }
  if (nearest !== null) return nearest;
  return toBorder ? gapToEdge(frame, bound(wall, side), side) : null;
}

/**
 * A frame's four distances to the nearest frame or furniture in line with it, else to the
 * wall's known edge, else `null`. `others` holds the other frames and the furniture.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-frames-distances-run-to-the-nearest-thing-in-line-with-it}
 */
export function frameDistances(frame: Rect, others: readonly Rect[], wall: Wall): Distances {
  const out = {} as Distances;
  for (const side of SIDES) out[side] = reach(frame, side, others, wall, false);
  return out;
}

/**
 * The frame moved so its distance on `side` is `value` (negative counts as 0), stopping at the
 * wall's edge, the bounds or the first in-line obstacle it moves toward. Moves nothing else.
 * {@link openspec/specs/size-engine/spec.md#requirement-setting-a-distance-moves-only-that-frame}
 */
export function setDistance(
  frame: Rect,
  side: Side,
  value: number,
  others: readonly Rect[],
  wall: Wall,
): Rect {
  const current = reach(frame, side, others, wall, false);
  if (current === null || !Number.isFinite(value)) return frame;
  const grow = Math.max(0, value) - current;
  // Growing the gap moves the frame away from `side`, as far as the room on the other side allows.
  // A frame already past the far edge has no room that way, not negative room.
  const room = Math.max(0, reach(frame, OPPOSITE[side], others, wall, true) ?? 0);
  const step = grow > 0 ? Math.min(grow, room) : grow;
  if (side === "left") return { ...frame, x: frame.x + step };
  if (side === "right") return { ...frame, x: frame.x - step };
  if (side === "below") return { ...frame, y: frame.y + step };
  return { ...frame, y: frame.y - step };
}

/** What a visitor marked on the photo: the floor line's pixel row, the wall's width mark. */
export interface PhotoMarks {
  floor?: number | null;
  wall?: readonly [Point, Point] | null;
}

/**
 * A photo's known edges from the visitor's marks. The top edge stays unknown.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-photos-known-edges-come-from-what-the-visitor-marks}
 */
export function photoEdges(photo: Photo, scale: number, marks: PhotoMarks): Edges {
  const edges: Edges = { left: null, right: null, top: null, bottom: null };
  if (marks.floor != null)
    edges.bottom = photoPointToWall({ x: 0, y: marks.floor }, photo, scale).y;
  if (marks.wall) {
    const [a, b] = marks.wall.map((p) => photoPointToWall(p, photo, scale)) as [Point, Point];
    edges.left = Math.min(a.x, b.x);
    edges.right = Math.max(a.x, b.x);
  }
  return edges;
}

/**
 * A sofa or bed marked along its top as furniture: as wide as the mark, from the floor line
 * (or the photo's bottom) up to the mark's middle. `null` for anything else, or a mark at or
 * below the floor.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-marked-sofa-or-bed-becomes-furniture-on-the-photo}
 */
export function markedFurniture(
  known: KnownId,
  mark: readonly [Point, Point],
  scale: number,
  photo: Photo,
  edges: Edges,
): Rect | null {
  if (known !== "sofa" && known !== "bed") return null;
  const [a, b] = mark.map((p) => photoPointToWall(p, photo, scale)) as [Point, Point];
  const bottom = edges.bottom ?? 0;
  const top = (a.y + b.y) / 2;
  if (top <= bottom) return null;
  const x = Math.min(a.x, b.x);
  return { x, y: bottom, w: Math.max(a.x, b.x) - x, h: top - bottom };
}

/** How close, in inches, an edge or centre must come to snap. */
export const SNAP = 1;
export const EPSILON = 1e-9;

/** Lines the snapped frame lines up on: vertical ones at an `x`, horizontal ones at a `y`. */
export interface SnapLines {
  vertical: number[];
  horizontal: number[];
}

/** A rect's edges and centre on one axis, as [offset from its start, position]. */
const features = (start: number, size: number) =>
  [0, size / 2, size].map((o) => [o, start + o] as const);

/**
 * Snap one axis: the new start and the positions it lines up on. A start that would put the
 * frame outside `[lo, hi]` is skipped. On an exact tie the first pair checked wins.
 */
function snapAxis(
  start: number,
  size: number,
  targets: readonly number[],
  lo = -Infinity,
  hi = Infinity,
) {
  let best: { start: number; d: number } | null = null;
  for (const [offset, at] of features(start, size)) {
    for (const t of targets) {
      const d = Math.abs(t - at);
      const s = t - offset;
      const fits = s >= lo - EPSILON && s + size <= hi + EPSILON;
      if (d <= SNAP && fits && (best === null || d < best.d)) best = { start: s, d };
    }
  }
  const snapped = best?.start ?? start;
  const lines = new Set<number>();
  for (const [, at] of features(snapped, size)) {
    for (const t of targets) if (Math.abs(t - at) < EPSILON) lines.add(t);
  }
  return { start: snapped, lines: [...lines].sort((p, q) => p - q) };
}

/**
 * A dragged frame snapped, per axis, to the nearest edge or centre of another frame (or a piece
 * of furniture's centre, across) within 1 in, and every line it then lines up on. `others` must
 * not hold the dragged frame itself. Given the `wall`, no snap takes the frame past its bounds.
 * O(n) per call.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-dragged-frame-snaps-to-the-edges-and-centres-around-it}
 * {@link openspec/specs/size-engine/spec.md#requirement-a-snap-never-takes-a-frame-past-the-walls-bounds}
 * {@link openspec/specs/size-engine/spec.md#requirement-an-exact-snap-tie-goes-to-the-first-pair}
 */
export function snapFrame(
  frame: Rect,
  others: readonly Rect[],
  furniture: readonly Rect[],
  wall?: Wall,
): { frame: Rect; lines: SnapLines } {
  const xs = [
    ...others.flatMap((o) => features(o.x, o.w).map(([, at]) => at)),
    ...furniture.map((f) => f.x + f.w / 2),
  ];
  const ys = others.flatMap((o) => features(o.y, o.h).map(([, at]) => at));
  const b = wall?.bounds;
  const x = snapAxis(frame.x, frame.w, xs, b?.x, b && b.x + b.w);
  const y = snapAxis(frame.y, frame.h, ys, b?.y, b && b.y + b.h);
  return {
    frame: { ...frame, x: x.start, y: y.start },
    lines: { vertical: x.lines, horizontal: y.lines },
  };
}

/** The gap between a new frame and the selected one. */
export const PLACE_GAP = 3;

const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const inside = (r: Rect, b: Rect) =>
  r.x >= b.x && r.y >= b.y && r.x + r.w <= b.x + b.w && r.y + r.h <= b.y + b.h;

/** The bounds clipped by every edge the visitor marked. Internal: not exported from `index`. */
export function usableArea(wall: Wall): Rect {
  const b = wall.bounds;
  const { left, right, top, bottom } = wall.edges;
  const x = Math.max(b.x, left ?? b.x);
  const y = Math.max(b.y, bottom ?? b.y);
  const r = Math.min(b.x + b.w, right ?? b.x + b.w);
  const t = Math.min(b.y + b.h, top ?? b.y + b.h);
  return { x, y, w: Math.max(0, r - x), h: Math.max(0, t - y) };
}

/**
 * Where a new frame of outside `size` goes: 3 in right of `selected` with centres level, else
 * 3 in left, else centred between the marked side edges (else across the bounds) at the 57 in
 * centre line (the bounds' middle when the floor is unknown). A side spot must stay inside the
 * marked edges. `others` holds every frame and piece of furniture on the wall.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-new-frame-is-placed-beside-the-selected-one}
 */
export function placeBeside(
  size: Size,
  selected: Rect | null,
  others: readonly Rect[],
  wall: Wall,
): Rect {
  const { w, h } = size;
  const area = usableArea(wall);
  if (selected) {
    const y = selected.y + selected.h / 2 - h / 2;
    for (const x of [selected.x + selected.w + PLACE_GAP, selected.x - PLACE_GAP - w]) {
      const r = { x, y, w, h };
      if (inside(r, area) && !others.some((o) => overlaps(r, o))) return r;
    }
  }
  const b = wall.bounds;
  const floor = wall.edges.bottom;
  const centreY = floor === null ? b.y + b.h / 2 : floor + CENTRE_LINE;
  // Kept inside the bounds: a close-up photo can sit lower than the centre line, and a frame
  // wider than the marked wall stays centred on it rather than pinned to one edge.
  const fit = (at: number, lo: number, size: number, span: number) =>
    Math.max(lo, Math.min(at, lo + span - size));
  return {
    x: fit(area.x + area.w / 2 - w / 2, b.x, w, b.w),
    y: fit(centreY - h / 2, b.y, h, b.h),
    w,
    h,
  };
}

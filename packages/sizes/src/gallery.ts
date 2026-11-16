import { findFrame, MOULDING } from "./frames";
import { ABOVE_SOFA, CENTRE_LINE, type Rect } from "./scene";
import type { Size } from "./units";
import {
  EPSILON,
  frameDistances,
  PLACE_GAP,
  setDistance,
  usableArea,
  type Distances,
  type Point,
  type Side,
  type Wall,
} from "./wall";

/*
 * The gallery wall's geometry. Lengths are in inches, in the wall engine's coordinates:
 * `x` from the left, `y` up from the bottom.
 */

/** Rows and columns of oriented catalog ids, nested. */
export interface Stack {
  dir: "row" | "column";
  items: readonly (string | Stack)[];
}

export interface Template {
  id: string;
  name: string;
  stack: Stack;
}

const row = (...items: (string | Stack)[]): Stack => ({ dir: "row", items });
const column = (...items: (string | Stack)[]): Stack => ({ dir: "column", items });

/**
 * The gallery wall templates, in the order the page lists them.
 * {@link openspec/specs/size-engine/spec.md#requirement-the-gallery-wall-planner-offers-five-templates}
 */
export const TEMPLATES: readonly Template[] = [
  { id: "row-of-three", name: "Row of three", stack: row("11x14", "11x14", "11x14") },
  {
    id: "grid-of-four",
    name: "Grid of four",
    stack: column(row("11x14", "11x14"), row("11x14", "11x14")),
  },
  {
    id: "grid-of-nine",
    name: "Grid of nine",
    stack: column(...Array.from({ length: 3 }, () => row("8x10", "8x10", "8x10"))),
  },
  {
    id: "one-big-two-each-side",
    name: "One big, two on each side",
    stack: row(column("8x10", "8x10"), "18x24", column("8x10", "8x10")),
  },
  {
    id: "two-rows",
    name: "Two rows",
    stack: column(row("11x14", "16x20", "11x14"), row("10x8", "10x8", "10x8")),
  },
];

/** The default gap between neighbours: the same as a new frame's in F2. */
export const GALLERY_GAP = PLACE_GAP;

/** A frame's outside size, or `null` for an id outside the catalog. */
function outside(id: string): Size | null {
  const f = findFrame(id);
  return f ? { w: f.w + 2 * MOULDING, h: f.h + 2 * MOULDING } : null;
}

/** A stack's outside size, or `null` when it, or anything in it, is empty or unknown. */
function measure(item: string | Stack, gap: number): Size | null {
  if (typeof item === "string") return outside(item);
  if (item.items.length === 0) return null;
  const sizes = item.items.map((i) => measure(i, gap));
  if (sizes.some((s) => s === null)) return null;
  const all = sizes as Size[];
  const sum = (k: "w" | "h") => all.reduce((t, s) => t + s[k], 0) + gap * (all.length - 1);
  const max = (k: "w" | "h") => Math.max(...all.map((s) => s[k]));
  return item.dir === "row" ? { w: sum("w"), h: max("h") } : { w: max("w"), h: sum("h") };
}

/** Frames of a measured stack whose box has its left edge at `x` and its top edge at `top`. */
function place(
  item: string | Stack,
  gap: number,
  x: number,
  top: number,
): { id: string; rect: Rect }[] {
  // `layoutTemplate` measured the whole stack first, so these are never `null`.
  const size = measure(item, gap);
  if (!size) return [];
  if (typeof item === "string") return [{ id: item, rect: { x, y: top - size.h, ...size } }];
  const out: { id: string; rect: Rect }[] = [];
  let at = item.dir === "row" ? x : top;
  for (const child of item.items) {
    const s = measure(child, gap);
    if (!s) return [];
    if (item.dir === "row") {
      out.push(...place(child, gap, at, top - (size.h - s.h) / 2));
      at += s.w + gap;
    } else {
      out.push(...place(child, gap, x + (size.w - s.w) / 2, at));
      at -= s.h + gap;
    }
  }
  return out;
}

export interface Layout {
  frames: { id: string; rect: Rect }[];
  box: Rect;
}

/**
 * A template laid out with one `gap` between neighbours, each frame at its outside size, in the
 * order the stack names them. The group is centred on `furniture`, `ABOVE_SOFA` above it; else
 * centred across the wall's usable area at the 57 in centre line (the bounds' middle when the
 * floor is unknown). It is never shrunk or kept inside the wall. `null` for a negative or
 * non-finite gap, an unknown id or an empty stack.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-template-is-laid-out-with-one-gap-between-neighbours}
 * {@link openspec/specs/size-engine/spec.md#requirement-a-gallery-group-hangs-above-furniture-or-on-the-centre-line}
 */
export function layoutTemplate(
  stack: Stack,
  gap: number,
  wall: Wall,
  furniture: Rect | null,
): Layout | null {
  if (!Number.isFinite(gap) || gap < 0) return null;
  const size = measure(stack, gap);
  if (!size) return null;
  let centreX: number;
  let bottom: number;
  if (furniture) {
    centreX = furniture.x + furniture.w / 2;
    bottom = furniture.y + furniture.h + ABOVE_SOFA;
  } else {
    const area = usableArea(wall);
    const b = wall.bounds;
    const floor = wall.edges.bottom;
    centreX = area.x + area.w / 2;
    bottom = (floor === null ? b.y + b.h / 2 : floor + CENTRE_LINE) - size.h / 2;
  }
  const box = { x: centreX - size.w / 2, y: bottom, ...size };
  return { frames: place(stack, gap, box.x, box.y + box.h), box };
}

/**
 * How a frame hangs. `drop` is from the frame's top edge to the hanging point; `inset` from each
 * side to a D-ring. Both stay `null` until the visitor types them: the engine guesses neither.
 */
export type Hanger =
  { kind: "one"; drop: number | null } | { kind: "two"; drop: number | null; inset: number | null };

export type NoNail = "no-drop" | "drop-out-of-range" | "no-inset" | "inset-out-of-range";

const known = (n: number | null): n is number => n !== null && Number.isFinite(n);

/**
 * Why a frame of outside `rect` gets no nail from `hanger`, or `null` when it gets one.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-frame-with-no-nail-says-why}
 */
export function hangerProblem(rect: Rect, hanger: Hanger): NoNail | null {
  if (!known(hanger.drop)) return "no-drop";
  if (hanger.drop < 0 || hanger.drop >= rect.h) return "drop-out-of-range";
  if (hanger.kind === "one") return null;
  if (!known(hanger.inset)) return "no-inset";
  if (hanger.inset <= 0 || hanger.inset >= rect.w / 2) return "inset-out-of-range";
  return null;
}

/**
 * A frame's nail marks in wall inches, or `[]` when its hanger gives none.
 * {@link openspec/specs/size-engine/spec.md#requirement-nail-marks-come-from-the-frames-hanger}
 */
export function nailMarks(
  rect: Rect,
  hanger: Hanger,
): { ring: "left" | "right" | null; point: Point }[] {
  if (hangerProblem(rect, hanger) || hanger.drop === null) return [];
  const y = rect.y + rect.h - hanger.drop;
  if (hanger.kind === "one") return [{ ring: null, point: { x: rect.x + rect.w / 2, y } }];
  const { inset } = hanger;
  if (inset === null) return [];
  return [
    { ring: "left", point: { x: rect.x + inset, y } },
    { ring: "right", point: { x: rect.x + rect.w - inset, y } },
  ];
}

/** A nail in a measured group. `frame` is the frame's index in the measured items. */
export interface Nail {
  frame: number;
  ring: "left" | "right" | null;
  /** Right of the group's left edge. */
  across: number;
  /** Down from the group's top edge. */
  down: number;
  /** Above the floor, when it is known. */
  floor: number | null;
}

export interface GroupMeasure {
  width: number;
  height: number;
  /** The group's top edge above the floor. */
  aboveFloor: number | null;
  /** The group's top edge below the ceiling. */
  toCeiling: number | null;
  /** Gaps to the wall's known side edges; negative past them. */
  left: number | null;
  right: number | null;
  nails: Nail[];
  missing: { frame: number; reason: NoNail }[];
}

/** Nails 4 in or less below a row's first (highest) nail join that row. */
const ROW_BAND = 4;

/** The box around `rects`, or `null` when there are none. */
function boxOf(rects: readonly Rect[]): Rect | null {
  if (rects.length === 0) return null;
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  const w = Math.max(...rects.map((r) => r.x + r.w)) - x;
  const h = Math.max(...rects.map((r) => r.y + r.h)) - y;
  return { x, y, w, h };
}

/**
 * A group measured for hanging, each frame on its own hanger, with its nails listed in rows:
 * the highest unlisted nail starts a row, every nail `ROW_BAND` or less below it joins, and a
 * row reads left to right. `null` for no items.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-gallery-group-is-measured-for-hanging}
 * {@link openspec/specs/size-engine/spec.md#requirement-each-nail-names-its-frame-and-is-measured-from-the-groups-corner}
 * {@link openspec/specs/size-engine/spec.md#requirement-nails-are-listed-in-rows}
 */
export function measureGroup(
  items: readonly { rect: Rect; hanger: Hanger }[],
  wall: Wall,
): GroupMeasure | null {
  const box = boxOf(items.map((i) => i.rect));
  if (!box) return null;
  const { left, right, top, bottom } = wall.edges;
  const boxTop = box.y + box.h;
  const missing: GroupMeasure["missing"] = [];
  const marks: { frame: number; ring: Nail["ring"]; point: Point }[] = [];
  items.forEach(({ rect, hanger }, frame) => {
    const reason = hangerProblem(rect, hanger);
    if (reason) missing.push({ frame, reason });
    else for (const m of nailMarks(rect, hanger)) marks.push({ frame, ...m });
  });
  const pending = [...marks].sort((a, b) => b.point.y - a.point.y);
  const nails: Nail[] = [];
  for (let first = pending[0]; first; first = pending[0]) {
    const top = first.point.y;
    const n = pending.findIndex((p) => top - p.point.y > ROW_BAND + EPSILON);
    const rowNails = pending
      .splice(0, n === -1 ? pending.length : n)
      .sort((a, b) => a.point.x - b.point.x);
    for (const { frame, ring, point } of rowNails) {
      nails.push({
        frame,
        ring,
        across: point.x - box.x,
        down: boxTop - point.y,
        floor: bottom === null ? null : point.y - bottom,
      });
    }
  }
  return {
    width: box.w,
    height: box.h,
    aboveFloor: bottom === null ? null : boxTop - bottom,
    toCeiling: top === null ? null : top - boxTop,
    left: left === null ? null : box.x - left,
    right: right === null ? null : right - (box.x + box.w),
    nails,
    missing,
  };
}

const NO_DISTANCES: Distances = { left: null, right: null, above: null, below: null };
const shiftAll = (rects: readonly Rect[], dx: number, dy: number): Rect[] =>
  rects.map((r) => ({ ...r, x: r.x + dx, y: r.y + dy }));

/**
 * A group's four distances, from its outside edges to the furniture and the wall's known edges.
 * The group's own frames are left out.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-whole-group-moves-as-one}
 */
export function groupDistances(
  rects: readonly Rect[],
  furniture: Rect | null,
  wall: Wall,
): Distances {
  const box = boxOf(rects);
  return box ? frameDistances(box, furniture ? [furniture] : [], wall) : NO_DISTANCES;
}

/**
 * Every frame moved by the same amount so the group's distance on `side` is `value`, with the
 * same stops as a single frame.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-whole-group-moves-as-one}
 */
export function setGroupDistance(
  rects: readonly Rect[],
  side: Side,
  value: number,
  furniture: Rect | null,
  wall: Wall,
): Rect[] {
  const box = boxOf(rects);
  if (!box) return [...rects];
  const moved = setDistance(box, side, value, furniture ? [furniture] : [], wall);
  return shiftAll(rects, moved.x - box.x, moved.y - box.y);
}

/**
 * Every frame moved across so the group is centred between the wall's known side edges, else
 * across the bounds. Heights do not change.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-group-is-centred-on-the-wall}
 */
export function centreGroup(rects: readonly Rect[], wall: Wall): Rect[] {
  const box = boxOf(rects);
  if (!box) return [...rects];
  const area = usableArea(wall);
  return shiftAll(rects, area.x + area.w / 2 - (box.x + box.w / 2), 0);
}

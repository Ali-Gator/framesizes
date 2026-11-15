import {
  DEMO_ROOM,
  defaultLength,
  type Distances,
  findFrame,
  frameDistances,
  type Frame,
  KNOWN_THINGS,
  type KnownId,
  markedFurniture,
  MOULDING,
  type Orientation,
  type Photo,
  photoEdges,
  photoSize,
  placeBeside,
  type Point,
  type Rect,
  scaleFromMark,
  setDistance,
  type Side,
  type SnapLines,
  snapFrame,
  type Unit,
  type Wall,
} from "@framesizes/sizes";

import { MAX_FRAMES, parseLength, SHORT_MARK_PX, stepDistance } from "./display";

/*
 * The frame visualizer's state: a pure reducer over the size engine. Lengths are wall inches
 * (`x` from the left, `y` up from the bottom); marks and the floor line are photo pixels.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-the-widget-opens-in-the-sample-room-with-the-16x20-selected}
 */

export interface PlacedFrame {
  id: string;
  /** The catalog id as hung: `16x20`, or `20x16` turned. */
  size: string;
  /** The outside rectangle, moulding included. */
  rect: Rect;
}

/** sample: the sample room · upload: picking a file · pick/place/short/confirm: the three scale steps · photo: the scale is set. */
export type Mode = "sample" | "upload" | "pick" | "place" | "short" | "confirm" | "photo";

export type Mark = readonly [Point, Point];

export interface PhotoInfo {
  /** An object URL; the component revokes it. */
  url: string;
  width: number;
  height: number;
}

export interface WallState {
  mode: Mode;
  frames: PlacedFrame[];
  selected: string | null;
  nextId: number;
  /** The size picker, while it is open. */
  adding: { orientation: Orientation; size: string } | null;
  photo: PhotoInfo | null;
  known: KnownId;
  /** Each known thing's two ends, once the visitor moves them. */
  marks: Partial<Record<KnownId, Mark>>;
  /** Step 3's field as typed; `null` shows the known thing's default. */
  lengthText: string | null;
  lengthError: boolean;
  /** Pixels per inch, once set. */
  scale: number | null;
  /** The floor line's pixel row, once marked. */
  floor: number | null;
  confirmReset: boolean;
  /** Bumped on every change a live region reads out. */
  revision: number;
}

export const FIRST_SIZE = "16x20";
const OUTSIDE = (frame: Frame) => ({ w: frame.w + 2 * MOULDING, h: frame.h + 2 * MOULDING });

export const initialState = (): WallState => ({
  mode: "sample",
  frames: [{ id: "f1", size: FIRST_SIZE, rect: DEMO_ROOM.frame }],
  selected: "f1",
  nextId: 2,
  adding: null,
  photo: null,
  known: "door",
  marks: {},
  lengthText: null,
  lengthError: false,
  scale: null,
  floor: null,
  confirmReset: false,
  revision: 0,
});

/**
 * Where each known thing's ends start, as fractions of the photo (x, y from its top-left): the
 * canvas's starting points on its 1200 × 900 photo, so a straight-on photo framed like it needs
 * little dragging.
 */
const START: Record<KnownId, readonly [number, number, number, number]> = {
  wall: [8, 300, 1146, 300],
  door: [208, 820, 208, 180],
  sofa: [440, 548, 1112, 548],
  bed: [400, 450, 800, 450],
  letter: [600, 420, 600, 330],
  a4: [600, 425, 600, 330],
  card: [520, 478, 547, 478],
};

export function markOf(state: Pick<WallState, "known" | "marks">, photo: Photo): Mark {
  const own = state.marks[state.known];
  if (own) return own;
  const [ax, ay, bx, by] = START[state.known];
  const at = (x: number, y: number) => ({
    x: Math.round((x / 1200) * photo.width),
    y: Math.round((y / 900) * photo.height),
  });
  return [at(ax, ay), at(bx, by)];
}

export const markLength = ([a, b]: Mark) => Math.hypot(b.x - a.x, b.y - a.y);

/** The wall the frames hang on and the furniture on it, in inches. */
export function wallOf(state: WallState): { wall: Wall; furniture: Rect[] } {
  const { photo, scale } = state;
  if (state.mode === "sample" || !photo || !scale) {
    return { wall: DEMO_ROOM.wall, furniture: [DEMO_ROOM.sofa] };
  }
  const mark = markOf(state, photo);
  const edges = photoEdges(photo, scale, {
    floor: state.floor,
    wall: state.known === "wall" ? mark : null,
  });
  const area = photoSize(photo, scale);
  const bottom = Math.max(0, edges.bottom ?? 0);
  const furniture = markedFurniture(state.known, mark, scale, photo, edges);
  return {
    wall: { bounds: { x: 0, y: bottom, w: area.w, h: Math.max(0, area.h - bottom) }, edges },
    furniture: furniture ? [furniture] : [],
  };
}

export const selectedFrame = (state: WallState) =>
  state.frames.find((f) => f.id === state.selected) ?? null;

const othersThan = (state: WallState, id: string, furniture: readonly Rect[]) => [
  ...state.frames.filter((f) => f.id !== id).map((f) => f.rect),
  ...furniture,
];

export type Target = "frame" | "furniture" | "edge";
export interface Distance {
  value: number;
  /** What the distance runs to; `name` is a frame's size or the furniture's kind. */
  to: { kind: Target; name: string };
}

const NO_EDGES: Wall["edges"] = { left: null, right: null, top: null, bottom: null };

/**
 * The frame's four distances with what each runs to, `null` where nothing is known on that side.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-setting-a-distance-moves-the-selected-frame}
 */
export function distancesOf(state: WallState, id: string): Record<Side, Distance | null> {
  const frame = state.frames.find((f) => f.id === id);
  const { wall, furniture } = wallOf(state);
  const out = { left: null, right: null, above: null, below: null } as Record<
    Side,
    Distance | null
  >;
  if (!frame) return out;
  const named: { rect: Rect; to: Distance["to"] }[] = [
    ...state.frames
      .filter((f) => f.id !== id)
      .map((f) => ({ rect: f.rect, to: { kind: "frame" as const, name: f.size } })),
    ...furniture.map((rect) => ({
      rect,
      to: { kind: "furniture" as const, name: furnitureName(state) },
    })),
  ];
  const all = frameDistances(
    frame.rect,
    named.map((n) => n.rect),
    wall,
  );
  for (const side of Object.keys(out) as Side[]) {
    const value = all[side];
    if (value === null) continue;
    // The engine gives the nearest gap; the thing at exactly that gap is what it runs to.
    const hit = named.find((n) => {
      const one: Distances = frameDistances(frame.rect, [n.rect], { ...wall, edges: NO_EDGES });
      return one[side] !== null && Math.abs((one[side] ?? 0) - value) < 1e-9;
    });
    out[side] = { value, to: hit?.to ?? { kind: "edge", name: edgeName(side) } };
  }
  return out;
}

function furnitureName(state: WallState): string {
  return state.mode === "sample" || state.known === "sofa" ? "sofa" : "bed";
}

function edgeName(side: Side): string {
  if (side === "below") return "floor";
  return side === "above" ? "ceiling" : "wall's edge";
}

/** The selected frame's centre above the floor, when the floor is known. */
export function centreHeight(state: WallState): number | null {
  const frame = selectedFrame(state);
  const floor = wallOf(state).wall.edges.bottom;
  return frame && floor !== null ? frame.rect.y + frame.rect.h / 2 - floor : null;
}

/** Keeps a rectangle inside the bounds, as far as it fits. */
function clampTo(rect: Rect, b: Rect): Rect {
  const x = Math.max(b.x, Math.min(rect.x, b.x + b.w - rect.w));
  const y = Math.max(b.y, Math.min(rect.y, b.y + b.h - rect.h));
  return { ...rect, x, y };
}

/**
 * A frame dragged from `from` by `dx`, `dy` inches: snapped by the engine, kept on the wall.
 * The lines are what it lines up on, for the tape while dragging.
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-frames-are-dragged-and-snap}
 */
export function dragFrame(
  state: WallState,
  id: string,
  from: Rect,
  dx: number,
  dy: number,
): { rect: Rect; lines: SnapLines } {
  const { wall, furniture } = wallOf(state);
  const others = state.frames.filter((f) => f.id !== id).map((f) => f.rect);
  const moved = clampTo({ ...from, x: from.x + dx, y: from.y + dy }, wall.bounds);
  const snapped = snapFrame(moved, others, furniture);
  const rect = clampTo(snapped.frame, wall.bounds);
  // A snap undone by the bounds lines up on nothing.
  return rect.x === snapped.frame.x && rect.y === snapped.frame.y
    ? { rect, lines: snapped.lines }
    : { rect, lines: { vertical: [], horizontal: [] } };
}

/** The size picker's outline: where the picked size goes, by the engine's placement rule. */
export function previewRect(state: WallState): Rect | null {
  const frame = state.adding && findFrame(state.adding.size);
  if (!frame) return null;
  const { wall, furniture } = wallOf(state);
  return placeBeside(
    OUTSIDE(frame),
    selectedFrame(state)?.rect ?? null,
    [...state.frames.map((f) => f.rect), ...furniture],
    wall,
  );
}

/** The step 3 field's text: what was typed, else the known thing's default in the visitor's unit. */
export function lengthField(state: WallState, unit: Unit): string {
  if (state.lengthText !== null) return state.lengthText;
  const length = KNOWN_THINGS.find((k) => k.id === state.known)?.length;
  if (length?.kind !== "default") return "";
  return String(defaultLength(state.known, unit) ?? "");
}

/** The known thing's real length in inches, or `null` when the field is empty or not a length. */
function knownInches(state: WallState, unit: Unit): number | null {
  const length = KNOWN_THINGS.find((k) => k.id === state.known)?.length;
  if (length?.kind === "fixed") return length.inches;
  return parseLength(lengthField(state, unit), unit);
}

/** The default sizes a new picker opens on, per orientation. */
const PICKER_START: Record<Orientation, string> = {
  portrait: "11x14",
  landscape: "14x11",
  square: "12x12",
};

export type Action =
  | { type: "select"; id: string }
  | { type: "distance"; side: Side; text: string; unit: Unit }
  | { type: "step"; side: Side; direction: 1 | -1; unit: Unit }
  | { type: "place"; id: string; rect: Rect }
  | { type: "nudge"; id: string; dx: number; dy: number }
  | { type: "remove"; id: string }
  | { type: "openAdd" }
  | { type: "addOrientation"; orientation: Orientation }
  | { type: "addSize"; size: string }
  | { type: "add" }
  | { type: "closeAdd" }
  | { type: "upload" }
  | { type: "resume" }
  | { type: "photo"; photo: PhotoInfo }
  | { type: "known"; known: KnownId }
  | { type: "toPlace" }
  | { type: "handle"; end: 0 | 1; point: Point }
  | { type: "placeNext" }
  | { type: "useAnyway" }
  | { type: "back" }
  | { type: "lengthText"; text: string }
  | { type: "setScale"; unit: Unit }
  | { type: "markFloor" }
  | { type: "floor"; y: number }
  | { type: "openReset" }
  | { type: "cancelReset" }
  | { type: "restartPhoto" }
  | { type: "toSample" };

const changed = (state: WallState, next: Partial<WallState>): WallState => ({
  ...state,
  ...next,
  revision: state.revision + 1,
});

const withRect = (state: WallState, id: string, rect: Rect) =>
  state.frames.map((f) => (f.id === id ? { ...f, rect } : f));

/** The photo mode's empty start: no frames, no scale, no floor. */
const photoStart = (state: WallState): Partial<WallState> => ({
  mode: "pick",
  frames: [],
  selected: null,
  adding: null,
  known: "door",
  marks: {},
  lengthText: null,
  lengthError: false,
  scale: null,
  floor: null,
  confirmReset: false,
  nextId: state.nextId,
});

/**
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-setting-a-distance-moves-the-selected-frame}
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-frames-are-added-from-the-catalog-six-at-most}
 * {@link openspec/specs/frames-on-wall/spec.md#requirement-start-over-asks-first}
 */
export function reducer(state: WallState, action: Action): WallState {
  switch (action.type) {
    case "select":
      return state.frames.some((f) => f.id === action.id)
        ? { ...state, selected: action.id }
        : state;

    case "distance":
    case "step": {
      const frame = selectedFrame(state);
      if (!frame) return state;
      const d = distancesOf(state, frame.id)[action.side];
      if (!d) return state;
      const value =
        action.type === "step"
          ? stepDistance(d.value, action.direction, action.unit)
          : parseLength(action.text, action.unit);
      // Not a length: nothing moves; the field shows the distance again.
      if (value === null) return state;
      const { wall, furniture } = wallOf(state);
      const rect = setDistance(
        frame.rect,
        action.side,
        value,
        othersThan(state, frame.id, furniture),
        wall,
      );
      return changed(state, { frames: withRect(state, frame.id, rect) });
    }

    case "place":
      return changed(state, {
        frames: withRect(state, action.id, action.rect),
        selected: action.id,
      });

    case "nudge": {
      const frame = state.frames.find((f) => f.id === action.id);
      if (!frame) return state;
      const { bounds } = wallOf(state).wall;
      const rect = clampTo(
        { ...frame.rect, x: frame.rect.x + action.dx, y: frame.rect.y + action.dy },
        bounds,
      );
      return changed(state, { frames: withRect(state, frame.id, rect), selected: frame.id });
    }

    case "remove": {
      const frames = state.frames.filter((f) => f.id !== action.id);
      const selected = state.selected === action.id ? (frames[0]?.id ?? null) : state.selected;
      return changed(state, { frames, selected });
    }

    case "openAdd":
      if (state.frames.length >= MAX_FRAMES) return state;
      return { ...state, adding: { orientation: "portrait", size: PICKER_START.portrait } };

    case "addOrientation":
      return state.adding
        ? {
            ...state,
            adding: { orientation: action.orientation, size: PICKER_START[action.orientation] },
          }
        : state;

    case "addSize": {
      const frame = findFrame(action.size);
      return state.adding && frame
        ? { ...state, adding: { orientation: frame.orientation, size: frame.id } }
        : state;
    }

    case "add": {
      const rect = previewRect(state);
      if (!rect || !state.adding || state.frames.length >= MAX_FRAMES) return state;
      const id = `f${state.nextId}`;
      return changed(state, {
        frames: [...state.frames, { id, size: state.adding.size, rect }],
        selected: id,
        nextId: state.nextId + 1,
        adding: null,
      });
    }

    case "closeAdd":
      return { ...state, adding: null };

    case "upload":
      return { ...state, mode: "upload", adding: null, confirmReset: false };

    case "resume":
      // Back from "Change photo" to the photo whose scale is set.
      return state.photo && state.scale ? { ...state, mode: "photo" } : state;

    case "photo":
      return { ...state, ...photoStart(state), photo: action.photo };

    case "known":
      return { ...state, known: action.known, lengthText: null, lengthError: false };

    case "toPlace":
      return state.photo ? { ...state, mode: "place" } : state;

    case "handle": {
      if (!state.photo) return state;
      const { width, height } = state.photo;
      const point = {
        x: Math.round(Math.min(width, Math.max(0, action.point.x))),
        y: Math.round(Math.min(height, Math.max(0, action.point.y))),
      };
      const mark = [...markOf(state, state.photo)] as [Point, Point];
      mark[action.end] = point;
      return { ...state, marks: { ...state.marks, [state.known]: mark } };
    }

    case "placeNext":
      if (!state.photo) return state;
      return {
        ...state,
        mode: markLength(markOf(state, state.photo)) < SHORT_MARK_PX ? "short" : "confirm",
      };

    case "useAnyway":
      return { ...state, mode: "confirm" };

    case "back": {
      const previous: Partial<Record<Mode, Mode>> = {
        pick: "upload",
        place: "pick",
        short: "pick",
        confirm: "place",
      };
      const to = previous[state.mode];
      return to ? { ...state, mode: to, lengthError: false } : state;
    }

    case "lengthText":
      return { ...state, lengthText: action.text, lengthError: false };

    case "setScale": {
      if (!state.photo) return state;
      const inches = knownInches(state, action.unit);
      const [a, b] = markOf(state, state.photo);
      const scale = inches === null ? null : scaleFromMark(a, b, inches);
      if (scale === null) return { ...state, lengthError: true };
      const set: WallState = { ...state, mode: "photo", scale, floor: null, lengthError: false };
      // A first frame to start from, placed as a new frame would be.
      const first = findFrame(FIRST_SIZE);
      const { wall, furniture } = wallOf(set);
      const rect = first ? placeBeside(OUTSIDE(first), null, furniture, wall) : null;
      const id = `f${state.nextId}`;
      return changed(set, {
        frames: rect ? [{ id, size: FIRST_SIZE, rect }] : [],
        selected: rect ? id : null,
        nextId: state.nextId + 1,
      });
    }

    case "markFloor": {
      if (!state.photo || state.mode !== "photo") return state;
      // Starts at the bottom of the marked sofa or bed, else near the photo's bottom.
      const mark = markOf(state, state.photo);
      const y =
        state.known === "door"
          ? Math.max(mark[0].y, mark[1].y)
          : Math.round(state.photo.height * 0.9);
      return changed(state, { floor: y });
    }

    case "floor":
      if (!state.photo || state.floor === null) return state;
      return changed(state, {
        floor: Math.round(Math.min(state.photo.height, Math.max(0, action.y))),
      });

    case "openReset":
      return { ...state, confirmReset: true, adding: null };

    case "cancelReset":
      return { ...state, confirmReset: false };

    case "restartPhoto":
      return state.photo ? changed(state, { ...photoStart(state) }) : state;

    case "toSample":
      return { ...initialState(), nextId: state.nextId, revision: state.revision + 1 };
  }
}

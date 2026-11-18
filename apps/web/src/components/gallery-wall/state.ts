import {
  centreGroup,
  DEMO_ROOM,
  findFrame,
  GALLERY_GAP,
  groupDistances,
  type GroupMeasure,
  type Hanger,
  layoutTemplate,
  measureGroup,
  type Orientation,
  placeBeside,
  type Rect,
  setDistance,
  setGroupDistance,
  type Side,
  type SnapLines,
  snapFrame,
  type Stack,
  TEMPLATES,
  type Unit,
  type Wall,
} from "@framesizes/sizes";

import { outsideSize, parseLength, stepDistance } from "@/components/frames-on-wall/display";
import {
  type Mark,
  namedDistances,
  type PhotoAction,
  type PhotoInfo,
  photoReducer,
  type PhotoSlice,
  sampleSlice,
  wallOf,
} from "@/components/frames-on-wall/state";

/*
 * The gallery wall planner's state: a pure reducer over the size engine. Lengths are wall inches
 * (`x` from the left, `y` up from the bottom). Rectangles are derived, never stored: the template's
 * layout, then hand moves, then added frames, all shifted by the group's move.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-the-planner-opens-on-the-default-template-above-the-sofa}
 */

export const DEFAULT_TEMPLATE = "one-big-two-each-side";
/** The most frames the planner holds. */
export const MAX_FRAMES = 12;
/** The gap's range, a page rule. */
export const GAP_MAX = 12;

export type HangerKind = Hanger["kind"];
type Offset = { dx: number; dy: number };

export interface PlannerFrame {
  id: string;
  letter: string;
  /** The catalog id as hung. */
  size: string;
  /** The outside rectangle, moulding included. */
  rect: Rect;
}

export interface PlannerState extends PhotoSlice {
  view: "layout" | "nails";
  template: string;
  /** Size overrides by the template frame's index. */
  sizes: Record<number, string>;
  gap: number;
  gapError: boolean;
  /** Hand moves of template frames since the last layout, by index. */
  moved: Record<number, Offset>;
  /** The whole group's move. */
  group: Offset;
  /** Frames past the template, placed before the group's move. */
  added: { id: string; size: string; x: number; y: number }[];
  /** Template frames taken off, by index. */
  removed: number[];
  /** A frame's id, or the whole group. */
  selected: string;
  /** `group-size`: every frame of size `from`, opened from the whole group's size list. */
  picker: {
    mode: "add" | "size" | "group-size";
    orientation: Orientation;
    size: string;
    all: boolean;
    from?: string;
  } | null;
  hangers: { all: Hanger; byFrame: Record<string, Hanger> };
  /** The type picked last: a frame with no hanger of its own opens on it. */
  lastType: HangerKind | null;
  hangerFor: "all" | string;
  /** The form of a frame with no hanger of its own: it becomes the frame's once a drop is typed. */
  draft: Hanger | null;
  /** A template waiting on the "Switch?" dialog. */
  confirmSwitch: string | null;
  confirmReset: boolean;
  nextId: number;
  /** Bumped on every change the live region reads out. */
  revision: number;
}

const ZERO: Offset = { dx: 0, dy: 0 };
const ONE_NAIL: Hanger = { kind: "one", drop: null };

/** A fresh layout: the template as laid out, nothing moved, added or taken off. */
const LAYOUT_START = {
  moved: {},
  group: ZERO,
  added: [],
  removed: [],
  selected: "group",
  picker: null,
} as const satisfies Partial<PlannerState>;

export const initialState = (): PlannerState => ({
  ...sampleSlice(),
  ...LAYOUT_START,
  view: "layout",
  template: DEFAULT_TEMPLATE,
  sizes: {},
  gap: GALLERY_GAP,
  gapError: false,
  hangers: { all: ONE_NAIL, byFrame: {} },
  lastType: null,
  hangerFor: "all",
  draft: null,
  confirmSwitch: null,
  confirmReset: false,
  nextId: 1,
  revision: 0,
});

export const templateOf = (id: string) =>
  TEMPLATES.find((t) => t.id === id) ?? TEMPLATES.find((t) => t.id === DEFAULT_TEMPLATE);

/** The stack's catalog ids, in the order the engine lays them out. */
export function leaves(item: string | Stack): string[] {
  return typeof item === "string" ? [item] : item.items.flatMap(leaves);
}

/** The stack with the frames at `sizes`' indexes swapped. */
function withSizes(stack: Stack, sizes: Record<number, string>): Stack {
  let i = 0;
  const walk = (item: string | Stack): string | Stack =>
    typeof item === "string" ? (sizes[i++] ?? item) : { ...item, items: item.items.map(walk) };
  return walk(stack) as Stack;
}

const letter = (n: number) => String.fromCharCode(65 + n);
const outside = (size: string) => {
  const f = findFrame(size);
  return f ? outsideSize(f) : { w: 0, h: 0 };
};
const shift = (r: Rect, o: Offset): Rect => ({ ...r, x: r.x + o.dx, y: r.y + o.dy });

/** The wall the group hangs on and the furniture under it, if any. */
export function placeOf(state: PlannerState): { wall: Wall; furniture: Rect | null } {
  const { wall, furniture } = wallOf(state);
  return { wall, furniture: furniture[0] ?? null };
}

/**
 * Every frame on the wall, lettered A, B, C in the template's order, then the added ones.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-a-frames-size-is-changed-in-place}
 */
export function framesOf(state: PlannerState): PlannerFrame[] {
  const { wall, furniture } = placeOf(state);
  const layout = layoutTemplate(
    withSizes(templateOf(state.template)?.stack ?? { dir: "row", items: [] }, state.sizes),
    state.gap,
    wall,
    furniture,
  );
  const placed: Omit<PlannerFrame, "letter">[] = [];
  layout?.frames.forEach((f, i) => {
    if (state.removed.includes(i)) return;
    placed.push({
      id: `t${i}`,
      size: f.id,
      rect: shift(shift(f.rect, state.moved[i] ?? ZERO), state.group),
    });
  });
  for (const a of state.added) {
    placed.push({
      id: a.id,
      size: a.size,
      rect: shift({ x: a.x, y: a.y, ...outside(a.size) }, state.group),
    });
  }
  return placed.map((f, n) => ({ ...f, letter: letter(n) }));
}

/** The box around every frame. */
export function boxOf(frames: readonly { rect: Rect }[]): Rect | null {
  if (!frames.length) return null;
  const x = Math.min(...frames.map((f) => f.rect.x));
  const y = Math.min(...frames.map((f) => f.rect.y));
  const w = Math.max(...frames.map((f) => f.rect.x + f.rect.w)) - x;
  const h = Math.max(...frames.map((f) => f.rect.y + f.rect.h)) - y;
  return { x, y, w, h };
}

/** A frame's hanger: its own, else All frames'. */
export const hangerOf = (state: PlannerState, id: string): Hanger =>
  state.hangers.byFrame[id] ?? state.hangers.all;

/**
 * The group measured for hanging, each frame on its resolved hanger.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-nail-marks-are-numbered-once-a-drop-is-typed}
 */
export function measureOf(state: PlannerState, frames = framesOf(state)): GroupMeasure | null {
  return measureGroup(
    frames.map((f) => ({ rect: f.rect, hanger: hangerOf(state, f.id) })),
    placeOf(state).wall,
  );
}

export type Target =
  { kind: "frame"; letter: string } | { kind: "furniture" } | { kind: "edge"; side: Side };
export interface Distance {
  value: number;
  to: Target;
}

/**
 * The selection's four distances, each with what it runs to: for one frame the other frames, the
 * furniture and the edges; for the whole group the furniture and the edges.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-the-group-and-its-frames-move-like-f2s-frames}
 */
export function distancesOf(
  state: PlannerState,
  frames = framesOf(state),
): Record<Side, Distance | null> {
  const { wall, furniture } = placeOf(state);
  const edge = (side: Side): Target => ({ kind: "edge", side });
  const sofa = furniture ? [{ rect: furniture, to: { kind: "furniture" } as Target }] : [];
  if (state.selected === "group") {
    const box = boxOf(frames);
    if (!box) return { left: null, right: null, above: null, below: null };
    const d = groupDistances(
      frames.map((f) => f.rect),
      furniture,
      wall,
    );
    const named = namedDistances(box, sofa, wall, edge);
    const out = {} as Record<Side, Distance | null>;
    for (const side of ["left", "right", "above", "below"] as const) {
      const value = d[side];
      out[side] = value === null ? null : { value, to: named[side]?.to ?? edge(side) };
    }
    return out;
  }
  const frame = frames.find((f) => f.id === state.selected);
  if (!frame) return { left: null, right: null, above: null, below: null };
  const others = frames
    .filter((f) => f.id !== frame.id)
    .map((f) => ({ rect: f.rect, to: { kind: "frame", letter: f.letter } as Target }));
  return namedDistances(frame.rect, [...others, ...sofa], wall, edge);
}

export type Warning =
  | { kind: "wide"; by: number }
  | { kind: "right" | "left" | "ceiling" | "floor"; by: number }
  | { kind: "photo" };

/**
 * The group past a known wall edge, the ceiling, or, on a photo with no marked side edges, the
 * photo's border. `null` when it fits.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-a-group-past-the-walls-edge-is-flagged}
 */
export function warningOf(state: PlannerState, frames = framesOf(state)): Warning | null {
  const m = measureOf(state, frames);
  const box = boxOf(frames);
  if (!m || !box) return null;
  const { left, right } = placeOf(state).wall.edges;
  const tiny = 0.01;
  if (left !== null && right !== null && m.width > right - left + tiny) {
    return { kind: "wide", by: m.width - (right - left) };
  }
  if (m.right !== null && m.right < -tiny) return { kind: "right", by: -m.right };
  if (m.left !== null && m.left < -tiny) return { kind: "left", by: -m.left };
  if (m.toCeiling !== null && m.toCeiling < -tiny) return { kind: "ceiling", by: -m.toCeiling };
  const floor = placeOf(state).wall.edges.bottom;
  if (floor !== null && box.y < floor - tiny) return { kind: "floor", by: floor - box.y };
  if (state.mode !== "sample") {
    // Sides with no marked edge end at the photo's border.
    const { bounds } = wallOf(state).wall;
    const out =
      box.x < bounds.x - tiny ||
      box.x + box.w > bounds.x + bounds.w + tiny ||
      box.y < bounds.y - tiny ||
      box.y + box.h > bounds.y + bounds.h + tiny;
    if (out) return { kind: "photo" };
  }
  return null;
}

/** The selected frame, or `null` with the whole group selected. */
export const selectedFrame = (state: PlannerState, frames = framesOf(state)) =>
  frames.find((f) => f.id === state.selected) ?? null;

/** Something the "Switch?" dialog would replace: sizes, hand moves, added or removed frames. */
export const changedLayout = (s: PlannerState) =>
  Object.keys(s.sizes).length > 0 ||
  Object.keys(s.moved).length > 0 ||
  s.added.length > 0 ||
  s.removed.length > 0;

/**
 * The layout's sizes, largest first, each with its frames: the whole group's size list.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-a-frames-size-is-changed-in-place}
 */
export function sizesOf(
  frames: readonly PlannerFrame[],
): { size: string; frames: PlannerFrame[] }[] {
  const bySize = new Map<string, PlannerFrame[]>();
  for (const f of frames) bySize.set(f.size, [...(bySize.get(f.size) ?? []), f]);
  const area = (size: string) => {
    const f = findFrame(size);
    return f ? f.w * f.h : 0;
  };
  return [...bySize]
    .map(([size, of]) => ({ size, frames: of }))
    .sort((a, b) => area(b.size) - area(a.size));
}

/** Keeps a rectangle inside the bounds, as far as it fits. */
function clampTo(rect: Rect, b: Rect): Rect {
  const x = Math.max(b.x, Math.min(rect.x, b.x + b.w - rect.w));
  const y = Math.max(b.y, Math.min(rect.y, b.y + b.h - rect.h));
  return { ...rect, x, y };
}

/**
 * A frame dragged from `from` by `dx`, `dy` inches: snapped by the engine inside the wall, kept on
 * it. The lines are what it lines up on.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-the-group-and-its-frames-move-like-f2s-frames}
 */
export function dragFrame(
  state: PlannerState,
  id: string,
  from: Rect,
  dx: number,
  dy: number,
): { rect: Rect; lines: SnapLines } {
  const { wall, furniture } = placeOf(state);
  const others = framesOf(state)
    .filter((f) => f.id !== id)
    .map((f) => f.rect);
  const moved = clampTo({ ...from, x: from.x + dx, y: from.y + dy }, wall.bounds);
  const snapped = snapFrame(moved, others, furniture ? [furniture] : [], wall);
  const rect = clampTo(snapped.frame, wall.bounds);
  return rect.x === snapped.frame.x && rect.y === snapped.frame.y
    ? { rect, lines: snapped.lines }
    : { rect, lines: { vertical: [], horizontal: [] } };
}

/** Where a new frame of the picker's size goes: beside the selection. */
export function previewRect(state: PlannerState): Rect | null {
  if (state.picker?.mode !== "add") return null;
  const frames = framesOf(state);
  const { wall, furniture } = placeOf(state);
  const selected = selectedFrame(state, frames)?.rect ?? boxOf(frames);
  return placeBeside(
    outside(state.picker.size),
    selected,
    [...frames.map((f) => f.rect), ...(furniture ? [furniture] : [])],
    wall,
  );
}

/** The hanger form "Hanger for" shows: All frames', a frame's own, or its draft. */
export function formHanger(state: PlannerState): Hanger {
  if (state.hangerFor === "all") return state.hangers.all;
  return state.hangers.byFrame[state.hangerFor] ?? state.draft ?? draftFor(state);
}

/** A frame with no hanger of its own opens on the last type, with no drop and no inset. */
function draftFor(state: Pick<PlannerState, "lastType" | "hangers">): Hanger {
  const kind = state.lastType ?? state.hangers.all.kind;
  return kind === "one" ? { kind, drop: null } : { kind, drop: null, inset: null };
}

const asKind = (h: Hanger, kind: HangerKind): Hanger =>
  kind === "one"
    ? { kind, drop: h.drop }
    : { kind, drop: h.drop, inset: h.kind === "two" ? h.inset : null };

export type Action =
  | { type: "view"; view: PlannerState["view"] }
  | { type: "template"; id: string }
  | { type: "confirmSwitch" }
  | { type: "cancelSwitch" }
  | { type: "gapText"; text: string; unit: Unit }
  | { type: "gapStep"; direction: 1 | -1; unit: Unit }
  | { type: "select"; id: string }
  | { type: "distance"; side: Side; text: string; unit: Unit }
  | { type: "step"; side: Side; direction: 1 | -1; unit: Unit }
  | { type: "place"; id: string; rect: Rect }
  | { type: "nudge"; id: string; dx: number; dy: number }
  | { type: "moveGroup"; dx: number; dy: number }
  | { type: "centre" }
  | { type: "remove"; id: string }
  | { type: "openPicker"; mode: "add" | "size" }
  | { type: "openGroupSize"; size: string }
  | { type: "pickerOrientation"; orientation: Orientation }
  | { type: "pickerSize"; size: string }
  | { type: "pickerAll"; all: boolean }
  | { type: "applyPicker" }
  | { type: "closePicker" }
  | { type: "hangerFor"; for: "all" | string }
  | { type: "hangerType"; kind: HangerKind }
  | { type: "hangerField"; field: "drop" | "inset"; text: string; unit: Unit }
  | { type: "sameAsAll" }
  | { type: "openReset" }
  | { type: "cancelReset" }
  | { type: "resetSample" }
  | RestorePhoto
  | PhotoAction;

/** A saved, scaled wall photo put back: the extension's "My wall photo". */
export interface RestorePhoto {
  type: "restorePhoto";
  photo: PhotoInfo;
  known: PhotoSlice["known"];
  marks: Partial<Record<PhotoSlice["known"], Mark>>;
  floor: number | null;
  scale: number;
}

/** A fresh layout on a new wall: added frames go, and with them their hangers and the form. */
const relaid = (state: PlannerState): Partial<PlannerState> => ({
  ...LAYOUT_START,
  view: "layout",
  confirmReset: false,
  hangerFor: "all",
  draft: null,
  hangers: {
    ...state.hangers,
    byFrame: Object.fromEntries(
      Object.entries(state.hangers.byFrame).filter(([id]) => id.startsWith("t")),
    ),
  },
});

const changed = (state: PlannerState, next: Partial<PlannerState>): PlannerState => ({
  ...state,
  ...next,
  revision: state.revision + 1,
});

/** The picker's opening sizes per orientation, as on F2. */
const PICKER_START: Record<Orientation, string> = {
  portrait: "11x14",
  landscape: "14x11",
  square: "12x12",
};

/** Moves frame `id` to `rect`: a hand move for a template frame, a new place for an added one. */
function moveFrame(state: PlannerState, frame: PlannerFrame, rect: Rect): Partial<PlannerState> {
  const dx = rect.x - frame.rect.x;
  const dy = rect.y - frame.rect.y;
  if (frame.id.startsWith("t")) {
    const i = Number(frame.id.slice(1));
    const was = state.moved[i] ?? ZERO;
    return { moved: { ...state.moved, [i]: { dx: was.dx + dx, dy: was.dy + dy } } };
  }
  return {
    added: state.added.map((a) => (a.id === frame.id ? { ...a, x: a.x + dx, y: a.y + dy } : a)),
  };
}

/** A gap in range, with hand moves dropped: the frames line up again. */
const withGap = (state: PlannerState, gap: number): PlannerState =>
  gap === state.gap
    ? { ...state, gapError: false }
    : changed(state, { gap, gapError: false, moved: {} });

/**
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-a-template-is-picked-from-its-picture}
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-one-gap-spaces-every-frame}
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-frames-are-added-up-to-twelve}
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-the-hanger-type-carries-over-to-the-next-frame}
 */
export function reducer(state: PlannerState, action: Action): PlannerState {
  switch (action.type) {
    case "view":
      return { ...state, view: action.view, picker: null };

    case "template": {
      if (!TEMPLATES.some((t) => t.id === action.id) || action.id === state.template) return state;
      if (changedLayout(state)) return { ...state, confirmSwitch: action.id };
      return reducer({ ...state, confirmSwitch: action.id }, { type: "confirmSwitch" });
    }

    case "confirmSwitch": {
      if (!state.confirmSwitch) return state;
      return changed(state, {
        ...LAYOUT_START,
        template: state.confirmSwitch,
        sizes: {},
        confirmSwitch: null,
        hangers: { ...state.hangers, byFrame: {} },
        hangerFor: "all",
        draft: null,
      });
    }

    case "cancelSwitch":
      return { ...state, confirmSwitch: null };

    case "gapText": {
      const gap = parseLength(action.text, action.unit);
      if (gap === null || gap > GAP_MAX + 1e-9) return { ...state, gapError: true };
      return withGap(state, gap);
    }

    case "gapStep": {
      const gap = stepDistance(state.gap, action.direction, action.unit);
      return withGap(state, Math.min(GAP_MAX, Math.max(0, gap)));
    }

    case "select":
      return action.id === "group" || framesOf(state).some((f) => f.id === action.id)
        ? { ...state, selected: action.id, picker: null }
        : state;

    case "distance":
    case "step": {
      const frames = framesOf(state);
      const d = distancesOf(state, frames)[action.side];
      if (!d) return state;
      const value =
        action.type === "step"
          ? stepDistance(d.value, action.direction, action.unit)
          : parseLength(action.text, action.unit);
      // Not a length: nothing moves; the field shows the distance again.
      if (value === null) return state;
      const { wall, furniture } = placeOf(state);
      if (state.selected === "group") {
        const box = boxOf(frames);
        const moved = boxOf(
          setGroupDistance(
            frames.map((f) => f.rect),
            action.side,
            value,
            furniture,
            wall,
          ).map((rect) => ({ rect })),
        );
        if (!box || !moved) return state;
        return reducer(state, { type: "moveGroup", dx: moved.x - box.x, dy: moved.y - box.y });
      }
      const frame = selectedFrame(state, frames);
      if (!frame) return state;
      const others = [
        ...frames.filter((f) => f.id !== frame.id).map((f) => f.rect),
        ...(furniture ? [furniture] : []),
      ];
      return changed(
        state,
        moveFrame(state, frame, setDistance(frame.rect, action.side, value, others, wall)),
      );
    }

    case "place": {
      const frame = framesOf(state).find((f) => f.id === action.id);
      return frame
        ? changed(state, { ...moveFrame(state, frame, action.rect), selected: frame.id })
        : state;
    }

    case "nudge": {
      const frame = framesOf(state).find((f) => f.id === action.id);
      if (!frame) return state;
      const { bounds } = placeOf(state).wall;
      const rect = clampTo(
        { ...frame.rect, x: frame.rect.x + action.dx, y: frame.rect.y + action.dy },
        bounds,
      );
      return changed(state, { ...moveFrame(state, frame, rect), selected: frame.id });
    }

    case "moveGroup":
      // The group is not kept on the wall: past an edge, the warning says by how much.
      return changed(state, {
        group: { dx: state.group.dx + action.dx, dy: state.group.dy + action.dy },
      });

    case "centre": {
      const frames = framesOf(state);
      const before = boxOf(frames);
      const after = boxOf(
        centreGroup(
          frames.map((f) => f.rect),
          placeOf(state).wall,
        ).map((rect) => ({ rect })),
      );
      if (!before || !after) return state;
      return reducer(state, { type: "moveGroup", dx: after.x - before.x, dy: 0 });
    }

    case "remove": {
      const frames = framesOf(state);
      if (frames.length <= 1 || !frames.some((f) => f.id === action.id)) return state;
      const byFrame = { ...state.hangers.byFrame };
      delete byFrame[action.id];
      return changed(state, {
        removed: action.id.startsWith("t")
          ? [...state.removed, Number(action.id.slice(1))]
          : state.removed,
        added: state.added.filter((a) => a.id !== action.id),
        selected: "group",
        hangers: { ...state.hangers, byFrame },
        hangerFor: state.hangerFor === action.id ? "all" : state.hangerFor,
      });
    }

    case "openPicker": {
      if (action.mode === "add") {
        if (framesOf(state).length >= MAX_FRAMES) return state;
        return {
          ...state,
          picker: { mode: "add", orientation: "portrait", size: PICKER_START.portrait, all: false },
        };
      }
      const frame = selectedFrame(state);
      const f = frame && findFrame(frame.size);
      if (!f) return state;
      return {
        ...state,
        picker: { mode: "size", orientation: f.orientation, size: f.id, all: true },
      };
    }

    case "openGroupSize": {
      const f = findFrame(action.size);
      if (!f || !framesOf(state).some((frame) => frame.size === f.id)) return state;
      return {
        ...state,
        picker: {
          mode: "group-size",
          orientation: f.orientation,
          size: f.id,
          all: true,
          from: f.id,
        },
      };
    }

    case "pickerOrientation":
      return state.picker
        ? {
            ...state,
            picker: {
              ...state.picker,
              orientation: action.orientation,
              size: PICKER_START[action.orientation],
            },
          }
        : state;

    case "pickerSize": {
      const f = findFrame(action.size);
      return state.picker && f
        ? { ...state, picker: { ...state.picker, orientation: f.orientation, size: f.id } }
        : state;
    }

    case "pickerAll":
      return state.picker ? { ...state, picker: { ...state.picker, all: action.all } } : state;

    case "applyPicker": {
      const { picker } = state;
      if (!picker) return state;
      if (picker.mode === "add") {
        const rect = previewRect(state);
        if (!rect || framesOf(state).length >= MAX_FRAMES) return state;
        const id = `a${state.nextId}`;
        const at = shift(rect, { dx: -state.group.dx, dy: -state.group.dy });
        return changed(state, {
          added: [...state.added, { id, size: picker.size, x: at.x, y: at.y }],
          selected: id,
          nextId: state.nextId + 1,
          picker: null,
        });
      }
      // A size from the group's list is a change to its first frame with "also the others" on.
      const all = framesOf(state);
      const frame =
        picker.mode === "group-size"
          ? all.find((f) => f.size === picker.from)
          : selectedFrame(state);
      if (!frame) return { ...state, picker: null };
      const others = picker.all || picker.mode === "group-size";
      const hit = all.filter((f) => f.id === frame.id || (others && f.size === frame.size));
      const ids = new Set(hit.map((f) => f.id));
      const sizes = { ...state.sizes };
      for (const id of ids) if (id.startsWith("t")) sizes[Number(id.slice(1))] = picker.size;
      // A size change lines the template up again, as a gap change does.
      return changed(state, {
        sizes,
        added: state.added.map((a) => (ids.has(a.id) ? { ...a, size: picker.size } : a)),
        moved: {},
        picker: null,
      });
    }

    case "closePicker":
      return { ...state, picker: null };

    case "hangerFor": {
      const id = action.for;
      if (id !== "all" && !framesOf(state).some((f) => f.id === id)) return state;
      return {
        ...state,
        hangerFor: id,
        draft: id === "all" || state.hangers.byFrame[id] ? null : draftFor(state),
      };
    }

    case "hangerType": {
      const { kind } = action;
      const id = state.hangerFor;
      if (id === "all") {
        return changed(state, {
          lastType: kind,
          hangers: { ...state.hangers, all: asKind(state.hangers.all, kind) },
        });
      }
      const own = state.hangers.byFrame[id];
      if (own) {
        return changed(state, {
          lastType: kind,
          hangers: {
            ...state.hangers,
            byFrame: { ...state.hangers.byFrame, [id]: asKind(own, kind) },
          },
        });
      }
      return { ...state, lastType: kind, draft: asKind(formHanger(state), kind) };
    }

    case "hangerField": {
      const value = action.text.trim() ? parseLength(action.text, action.unit) : null;
      const set = (h: Hanger): Hanger =>
        action.field === "drop"
          ? { ...h, drop: value }
          : h.kind === "two"
            ? { ...h, inset: value }
            : h;
      const id = state.hangerFor;
      if (id === "all") {
        return changed(state, { hangers: { ...state.hangers, all: set(state.hangers.all) } });
      }
      const own = state.hangers.byFrame[id];
      const next = set(own ?? formHanger(state));
      // A frame keeps All frames' hanger until its own drop is typed.
      if (!own && next.drop === null) return { ...state, draft: next };
      return changed(state, {
        hangers: { ...state.hangers, byFrame: { ...state.hangers.byFrame, [id]: next } },
        draft: null,
      });
    }

    case "sameAsAll": {
      const id = state.hangerFor;
      if (id === "all") return state;
      const byFrame = { ...state.hangers.byFrame };
      delete byFrame[id];
      return changed(state, {
        hangers: { ...state.hangers, byFrame },
        draft: draftFor(state),
      });
    }

    case "openReset":
      return { ...state, confirmReset: true, picker: null };

    case "cancelReset":
      return { ...state, confirmReset: false };

    case "resetSample":
      return { ...initialState(), nextId: state.nextId, revision: state.revision + 1 };

    case "upload":
      return { ...photoReducer(state, action), picker: null, confirmReset: false };

    case "photo":
      return changed(photoReducer(state, action), relaid(state));

    case "toSample":
      // Out of the upload step with no photo picked: the layout stays as it was.
      // {@link openspec/specs/gallery-wall-planner/spec.md#requirement-backing-out-of-the-upload-keeps-the-layout}
      return state.photo
        ? changed(photoReducer(state, action), relaid(state))
        : photoReducer(state, action);

    case "restorePhoto": {
      // As a scale just set: the template hangs again on the photo.
      const { photo, known, marks, floor, scale } = action;
      return changed(
        {
          ...state,
          mode: "photo",
          photo,
          known,
          marks,
          floor,
          scale,
          lengthText: null,
          lengthError: false,
        },
        relaid(state),
      );
    }

    case "restartPhoto":
      return state.photo ? changed(photoReducer(state, action), relaid(state)) : state;

    case "setScale": {
      if (!state.photo) return state;
      const set = photoReducer(state, action);
      // The template hangs again on the photo: above the marked sofa or bed, else centred.
      return set.lengthError ? set : changed(set, relaid(state));
    }

    case "markFloor":
    case "floor": {
      const next = photoReducer(state, action);
      return next === state ? state : changed(next, {});
    }

    case "resume":
    case "known":
    case "toPlace":
    case "handle":
    case "placeNext":
    case "useAnyway":
    case "back":
    case "lengthText":
      return photoReducer(state, action);
  }
}

/**
 * The template table: each template's size on the wall at the default gap, from the engine's
 * layout, and the furniture it suits, 1.5 times its width.
 * {@link openspec/specs/gallery-wall-planner/spec.md#requirement-the-template-table-lists-each-templates-size-on-the-wall}
 */
export function templateTable(): {
  id: string;
  name: string;
  w: number;
  h: number;
  fits: number;
}[] {
  return TEMPLATES.flatMap((t) => {
    const box = layoutTemplate(t.stack, GALLERY_GAP, DEMO_ROOM.wall, null)?.box;
    return box ? [{ id: t.id, name: t.name, w: box.w, h: box.h, fits: box.w * 1.5 }] : [];
  });
}

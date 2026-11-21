import {
  ACTUAL_SIZES,
  type ActualSize,
  CHECK_OBJECTS,
  CM_PER_INCH,
  oneDecimal,
  scaleFromDiagonal,
  type Size,
  type Unit,
  writeActual,
} from "@framesizes/sizes";

/*
 * The actual size viewer's state: one pure reducer, so every step is a unit test.
 * {@link openspec/specs/actual-size/spec.md#requirement-the-first-look-at-actual-size-asks-for-a-check}
 */

/** How the scale was checked. */
export type Method = "card" | "ruler" | "sheet" | "screen";
export type Mode = "view" | Method | "full";
export type Sheet = "letter" | "a4";

export interface ViewerState {
  /** An `ACTUAL_SIZES` id. */
  size: string;
  mode: Mode;
  /** Where a finished or skipped check goes. */
  next: "view" | "full";
  /** CSS pixels per inch. 0 until the client knows the screen. */
  scale: number;
  /** The scale a check started from, restored by Cancel and Skip. */
  prevScale: number;
  check: Method | null;
  /** The picked or typed screen diagonal in inches. */
  diagonal: number | null;
  sheet: Sheet;
}

export type ViewerAction =
  | { type: "init"; scale: number; check: Method | null }
  | { type: "pick"; size: string }
  | { type: "open"; method: Method }
  | { type: "see" }
  | { type: "slide"; scale: number }
  | { type: "nudge"; by: number }
  /** A picked or typed diagonal for a screen of `w` × `h` CSS px; ignored unless it is a positive number. */
  | { type: "diagonal"; value: number | string; w: number; h: number }
  | { type: "sheet"; sheet: Sheet }
  | { type: "done" }
  | { type: "skip" }
  | { type: "cancel" }
  | { type: "close" };

/** The slider's widest range, px per inch: 60–240 on a desktop, 100–200 on a phone. */
export const SCALE_RANGE = { desk: [60, 240], phone: [100, 200] } as const;
const clamp = (n: number) => Math.min(SCALE_RANGE.desk[1], Math.max(SCALE_RANGE.desk[0], n));

export const initialState: ViewerState = {
  size: "8x10",
  mode: "view",
  next: "view",
  scale: 0,
  prevScale: 0,
  check: null,
  diagonal: null,
  sheet: "letter",
};

const isMethod = (mode: Mode): mode is Method => mode !== "view" && mode !== "full";

export function reducer(state: ViewerState, action: ViewerAction): ViewerState {
  switch (action.type) {
    case "init":
      return { ...state, scale: action.scale, prevScale: action.scale, check: action.check };
    case "pick":
      return ACTUAL_SIZES.some((s) => s.id === action.size)
        ? { ...state, size: action.size }
        : state;
    case "open":
      // Switching tabs keeps the scale to restore and where to go next.
      return isMethod(state.mode)
        ? { ...state, mode: action.method }
        : { ...state, mode: action.method, next: "view", prevScale: state.scale };
    case "see":
      return state.check
        ? { ...state, mode: "full" }
        : { ...state, mode: "card", next: "full", prevScale: state.scale };
    case "slide":
      return Number.isFinite(action.scale) ? { ...state, scale: clamp(action.scale) } : state;
    case "nudge":
      return { ...state, scale: clamp(state.scale + action.by) };
    case "diagonal": {
      const value = typeof action.value === "number" ? action.value : Number(action.value);
      const scale = action.value === "" ? null : scaleFromDiagonal(action.w, action.h, value);
      return scale === null ? state : { ...state, diagonal: value, scale };
    }
    case "sheet":
      return { ...state, sheet: action.sheet };
    case "done":
      return isMethod(state.mode)
        ? { ...state, check: state.mode, mode: state.next, next: "view" }
        : state;
    case "skip":
      return { ...state, mode: state.next, next: "view", scale: state.prevScale };
    case "cancel":
      return {
        ...state,
        mode: "view",
        next: "view",
        scale: isMethod(state.mode) ? state.prevScale : state.scale,
      };
    case "close":
      return { ...state, mode: "view" };
  }
}

export function sizeOf(state: ViewerState): ActualSize {
  return ACTUAL_SIZES.find((s) => s.id === state.size) ?? (ACTUAL_SIZES[2] as ActualSize);
}

const CHECKED_WITH: Record<Method, string> = {
  card: "a card",
  ruler: "a ruler",
  sheet: "a sheet",
  screen: "screen size",
};

/**
 * The scale status.
 * {@link openspec/specs/actual-size/spec.md#requirement-the-scale-is-a-guess-until-checked}
 */
export const statusText = (check: Method | null) =>
  check ? `Checked with ${CHECKED_WITH[check]}` : "Scale is a guess";

/** The drawing's label. */
export const tagText = (check: Method | null) =>
  check ? "Actual size" : "Approximate: scale not checked";

/** The distance in px between two lines `edge` inches apart. */
export const lineGap = (scale: number, edge: number) => edge * scale;

/**
 * The ruler mark to match, in inches: 2 in or 5 cm on a phone, 5 in or 12 cm on a desktop.
 * {@link openspec/specs/actual-size/spec.md#requirement-a-ruler-can-check-the-scale}
 */
export function rulerInches(phone: boolean, unit: Unit): number {
  if (unit === "in") return phone ? 2 : 5;
  return (phone ? 5 : 12) / CM_PER_INCH;
}

/**
 * How many phone screens wide and tall a size is.
 * {@link openspec/specs/actual-size/spec.md#requirement-the-phone-answer-step-comes-first}
 */
export function phonesLine(size: Size, screen: Size, scale: number): string {
  const wide = size.w / (screen.w / scale);
  const tall = size.h / (screen.h / scale);
  if (wide <= 1 && tall <= 1) return "It fits on your phone's screen.";
  return `About ${oneDecimal(wide)} phone screens wide and ${oneDecimal(tall)} tall.`;
}

/** The rulers' width along the box's top and left, px. */
export const RULER = 24;

/**
 * The part of a size a box of `box` CSS px shows past its rulers, in both units.
 * {@link openspec/specs/actual-size/spec.md#requirement-the-desktop-box-shows-the-size-at-11}
 */
export function visiblePart(size: Size, box: Size, scale: number) {
  const view = { w: (box.w - RULER) / scale, h: (box.h - RULER) / scale };
  const part = { w: Math.min(size.w, view.w), h: Math.min(size.h, view.h) };
  const fits = size.w <= view.w + 1e-9 && size.h <= view.h + 1e-9;
  return { view, fits, in: writeActual(part, "in"), cm: writeActual(part, "cm") };
}

/**
 * The sheet is offered only where a Letter sheet's short edge fits across the box at the guess.
 * {@link openspec/specs/actual-size/spec.md#requirement-a-sheet-of-paper-is-offered-only-where-it-fits}
 */
export const sheetFits = (boxWidth: number, guess: number) =>
  RULER + CHECK_OBJECTS.letter.short * guess <= boxWidth;

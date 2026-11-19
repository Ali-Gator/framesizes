import type { Unit } from "@framesizes/sizes";

import { parseLength, writeDistance } from "@/components/frames-on-wall/display";

import { type FoundSize, MAX_SIDE, MIN_SIDE } from "../find-sizes";

/*
 * The try's own state: the size step's pick, typed size and frame, then the print hanging with the
 * visitor's move. In memory only, so a reload starts again at the size step.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-size-step-asks-for-the-size-the-visitor-would-buy}
 */

export interface TryState {
  /** The try record this state is for. */
  id: string;
  step: "size" | "hang";
  /** A found size's index, "other" for the typed size, or nothing picked yet. */
  picked: number | "other" | null;
  wText: string;
  hText: string;
  /** The unit the size was typed in: in | cm switched later does not change it. */
  typedUnit: Unit;
  framed: boolean;
  /** The visitor's move from where the rule hangs it, in inches. */
  at: { dx: number; dy: number };
}

export type TryAction =
  | { type: "start"; id: string; sizes: readonly FoundSize[] }
  | { type: "pick"; picked: number | "other" }
  | { type: "text"; field: "w" | "h"; text: string; unit: Unit }
  | { type: "frame"; framed: boolean }
  | { type: "hang" }
  | { type: "change" }
  | { type: "move"; dx: number; dy: number };

const ZERO = { dx: 0, dy: 0 };

/** A new try: one size found is picked; none found opens the width and height fields. */
export const startTry = (id: string, sizes: readonly FoundSize[]): TryState => ({
  id,
  step: "size",
  picked: sizes.length === 1 ? 0 : sizes.length === 0 ? "other" : null,
  wText: "",
  hText: "",
  typedUnit: "in",
  framed: false,
  at: ZERO,
});

export function tryReducer(state: TryState, action: TryAction): TryState {
  switch (action.type) {
    case "start":
      return action.id === state.id ? state : startTry(action.id, action.sizes);
    case "pick":
      return { ...state, picked: action.picked, at: ZERO };
    case "text":
      return {
        ...state,
        [action.field === "w" ? "wText" : "hText"]: action.text,
        typedUnit: action.unit,
        at: ZERO,
      };
    case "frame":
      return { ...state, framed: action.framed };
    case "hang":
      return { ...state, step: "hang", at: ZERO };
    case "change":
      return { ...state, step: "size" };
    case "move":
      return { ...state, at: { dx: action.dx, dy: action.dy } };
  }
}

/** The typed width and height in inches, in the unit they were typed in. */
const typed = (state: TryState) => ({
  w: parseLength(state.wText, state.typedUnit),
  h: parseLength(state.hText, state.typedUnit),
});
const inRange = (side: number | null) => side !== null && side >= MIN_SIDE && side <= MAX_SIDE;

/** The size picked or typed, in inches as written, with its label; `null` while it waits. */
export function chosenSize(
  state: TryState,
  sizes: readonly FoundSize[],
): { w: number; h: number; label: string } | null {
  if (typeof state.picked === "number") return sizes[state.picked] ?? null;
  if (state.picked !== "other") return null;
  const { w, h } = typed(state);
  if (!inRange(w) || !inRange(h) || w === null || h === null) return null;
  const label = `${state.wText.trim()} × ${state.hText.trim()} ${state.typedUnit}`;
  return { w, h, label };
}

const COUNT = ["", "one", "two", "three", "four", "five", "six", "seven", "eight"];

/**
 * Why "Hang it on my wall" waits, or `null` when it does not.
 * {@link openspec/specs/gallery-wall-extension/spec.md#scenario-several-sizes-found}
 */
export function waitReason(
  state: TryState,
  sizes: readonly FoundSize[],
  unit: Unit,
): string | null {
  if (chosenSize(state, sizes)) return null;
  if (state.picked === "other") {
    const { w, h } = typed(state);
    if (!w || !h) return "Type the width and height first.";
    return `Type a width and height from ${writeDistance(MIN_SIDE, unit)} to ${writeDistance(MAX_SIDE, unit)}.`;
  }
  return `Pick a size first: this page lists ${COUNT[sizes.length] ?? sizes.length}.`;
}

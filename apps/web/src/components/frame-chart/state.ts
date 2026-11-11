import {
  findFrame,
  REFERENCE_IDS,
  type Frame,
  type Orientation,
  type ReferenceId,
} from "@framesizes/sizes";

export type View = "wall" | "all";

/** The widget's whole state. The size is an oriented id, so it also carries the orientation. */
export interface ChartState {
  size: string;
  view: View;
  ref: ReferenceId;
}

export const DEFAULT_STATE: ChartState = { size: "16x20", view: "wall", ref: "sofa" };
const VIEWS: readonly View[] = ["wall", "all"];

const oneOf = <T extends string>(options: readonly T[], value: string | null): T | undefined =>
  options.find((o) => o === value);

/**
 * The state in a query string; a value the widget does not know falls back to its default.
 * {@link openspec/specs/frame-size-chart/spec.md#requirement-the-widgets-state-lives-in-the-url}
 */
export function parseChartState(search: string): ChartState {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  return {
    size: size && findFrame(size) ? size : DEFAULT_STATE.size,
    view: oneOf(VIEWS, params.get("view")) ?? DEFAULT_STATE.view,
    ref: oneOf(REFERENCE_IDS, params.get("ref")) ?? DEFAULT_STATE.ref,
  };
}

/** The query string for a state, without `?`: defaults left out, always `size`, `view`, `ref`. */
export function chartSearch(state: ChartState): string {
  const params = new URLSearchParams();
  for (const key of ["size", "view", "ref"] as const) {
    if (state[key] !== DEFAULT_STATE[key]) params.set(key, state[key]);
  }
  return params.toString();
}

/** The selected size, always a catalog size (a parsed state never holds another). */
export function selectedFrame(state: ChartState): Frame {
  const frame = findFrame(state.size) ?? findFrame(DEFAULT_STATE.size);
  if (!frame) throw new Error("The default size is missing from the catalog");
  return frame;
}

const turn = (id: string) => id.split("x").reverse().join("x");

/**
 * Portrait and landscape turn the selected size; entering square selects 12x12; leaving it
 * selects 16x20 in the chosen orientation.
 * {@link openspec/specs/frame-size-chart/spec.md#requirement-orientation-turns-or-swaps-the-list}
 */
export function withOrientation(state: ChartState, orientation: Orientation): ChartState {
  const current = selectedFrame(state).orientation;
  if (current === orientation) return state;
  if (orientation === "square") return { ...state, size: "12x12" };
  const upright = current === "square" ? DEFAULT_STATE.size : selectedFrame(state).id;
  const portrait = current === "landscape" ? turn(upright) : upright;
  return { ...state, size: orientation === "landscape" ? turn(portrait) : portrait };
}

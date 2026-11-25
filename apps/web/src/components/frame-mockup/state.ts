import {
  type Art,
  focusStep,
  KEY_STEP,
  mockupDefault,
  type MockupOption,
  mockupOptions,
  type MockupPlacement,
  type MockupView,
  type PixelRect,
  type Size,
  visiblePart,
} from "@framesizes/sizes";

/*
 * F7's widget state: one pure reducer and the selectors that read the engine. Every number the
 * widget shows or draws comes through `current`.
 */

export type Finish = "black" | "white" | "oak" | "walnut";
export const FINISHES: readonly Finish[] = ["black", "white", "oak", "walnut"];
export type Panel = "size" | "style" | "mat" | "wall";
export const PANELS: readonly Panel[] = ["size", "style", "mat", "wall"];

/** What the live region says: an upload's note, the sample coming back, or why a file was refused. */
export type Note = "opened" | "replaced" | "back" | "notimg" | "decode";

/** The artwork in the frame: the sample or the visitor's file, read on the device. */
export interface Artwork extends Art {
  url: string;
  sample: boolean;
}

export interface State {
  art: Artwork;
  /** The offered size's id: `24x36`, `36x24`, `A2`. */
  size: string;
  mat: boolean;
  finish: Finish;
  placement: MockupPlacement;
  view: MockupView;
  /** 0..1 along the cut side. */
  focus: number;
  /** The group a phone shows. */
  panel: Panel;
  note: Note | null;
  /** A file is being read. */
  reading: boolean;
  download: "idle" | "making" | "done" | "failed";
}

export type Action =
  | { type: "size"; id: string }
  | { type: "mat"; on: boolean }
  | { type: "finish"; finish: Finish }
  | { type: "placement"; placement: MockupPlacement }
  | { type: "view"; view: MockupView }
  | { type: "panel"; panel: Panel }
  | { type: "uploaded"; art: Omit<Artwork, "sample"> }
  | { type: "sample" }
  | { type: "failed"; kind: "notimg" | "decode" }
  | { type: "reading" }
  | { type: "focus"; delta: number }
  | { type: "drag"; focus: number }
  | { type: "download"; state: State["download"] };

/** The site's own 2:3 sample artwork, drawn as a 2000 × 3000 SVG. */
export const SAMPLE: Artwork = {
  url: "/frame-mockup/sample.svg",
  width: 2000,
  height: 3000,
  sample: true,
};
export const SAMPLE_SIZE = "24x36";

export const INITIAL: State = {
  art: SAMPLE,
  size: SAMPLE_SIZE,
  mat: false,
  finish: "black",
  placement: "sofa",
  view: "wall",
  focus: 0.5,
  panel: "size",
  note: null,
  reading: false,
  download: "idle",
};

const clamp = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0.5));

/** The art's offered sizes under a mat setting; the engine always answers for a decoded artwork. */
export function optionsFor(art: Art, mat: boolean): readonly MockupOption[] {
  const options = mockupOptions(art, mat);
  if (!options) throw new Error(`no sizes for ${art.width} × ${art.height}`);
  return options;
}

const optionOf = (art: Art, mat: boolean, id: string) =>
  optionsFor(art, mat).find((o) => o.size.id === id);

/**
 * {@link openspec/specs/frame-mockup/spec.md#requirement-an-upload-opens-on-the-size-that-cuts-least}
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-sample-can-come-back}
 * {@link openspec/specs/frame-mockup/spec.md#requirement-a-file-that-cannot-be-used-leaves-the-artwork-as-it-was}
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-mat-switch-keeps-the-size}
 */
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "size":
      // A size with no opening under the current mat (4x6 with a mat) is refused.
      if (!optionOf(state.art, state.mat, action.id)?.opening) return state;
      return { ...state, size: action.id, focus: 0.5, download: "idle" };
    case "mat":
      if (action.on && !optionOf(state.art, true, state.size)?.opening) return state;
      return { ...state, mat: action.on, focus: 0.5, download: "idle" };
    case "finish":
      return { ...state, finish: action.finish, download: "idle" };
    case "placement":
      return { ...state, placement: action.placement, download: "idle" };
    case "view":
      return { ...state, view: action.view, download: "idle" };
    case "panel":
      return { ...state, panel: action.panel };
    case "uploaded": {
      const art = { ...action.art, sample: false };
      const best = mockupDefault(art, state.mat);
      if (!best) return { ...state, reading: false, note: "decode" };
      return {
        ...state,
        art,
        size: best.size.id,
        focus: 0.5,
        note: state.art.sample ? "opened" : "replaced",
        reading: false,
        download: "idle",
      };
    }
    case "sample":
      return {
        ...state,
        art: SAMPLE,
        size: SAMPLE_SIZE,
        focus: 0.5,
        note: "back",
        reading: false,
        download: "idle",
      };
    case "failed":
      return { ...state, note: action.kind, reading: false };
    case "reading":
      return { ...state, reading: true };
    case "focus":
      return { ...state, focus: clamp(state.focus + action.delta) };
    case "drag":
      return { ...state, focus: clamp(action.focus) };
    case "download":
      return { ...state, download: action.state };
  }
}

/** The picked size with everything the picture and the answer need. */
export interface Current {
  option: MockupOption;
  opening: Size;
  /** The part of the artwork that shows, px from its top left. */
  crop: PixelRect;
  /** The side the frame cuts: the crop is narrower (`x`) or shorter (`y`) than the artwork. */
  axis: "x" | "y";
  /** Focus changes for an arrow key (¼ in) and Shift + arrow (1 in); 0 when nothing moves. */
  step: { arrow: number; shift: number };
  /** Nothing to move: the engine finds no cut to slide (its half-pixel rule). */
  still: boolean;
}

/**
 * The state's size, opening, crop and steps from the engine.
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-artwork-fills-the-opening-and-can-be-moved}
 */
export function current(state: Pick<State, "art" | "size" | "mat" | "focus">): Current {
  const option = optionOf(state.art, state.mat, state.size);
  const opening = option?.opening;
  if (!option || !opening) throw new Error(`${state.size} has no opening`);
  const crop = visiblePart(state.art, opening, state.focus);
  const arrow = focusStep(state.art, opening, KEY_STEP.arrow);
  const shift = focusStep(state.art, opening, KEY_STEP.shift);
  if (!crop || arrow === undefined || shift === undefined) throw new Error("no crop");
  return {
    option,
    opening,
    crop,
    axis: crop.w < state.art.width ? "x" : "y",
    step: { arrow, shift },
    still: shift === 0,
  };
}

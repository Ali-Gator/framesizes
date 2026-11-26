import {
  type Art,
  CENTRE_LINE,
  exportSize,
  focusStep,
  hangMockup,
  inEighths,
  KEY_STEP,
  MAT_WIDTH,
  type MockupOption,
  type MockupSize,
  mockupView,
  MOULDING,
  oneDecimal,
  type Rect,
  type Size,
  SOFA,
  toCm,
  type Unit,
} from "@framesizes/sizes";

import { article } from "@/components/measure-frame/answer";

import { current, type Finish, type Note, type Panel, type State } from "./state";

/*
 * Every sentence and label the widget shows, from the engine's numbers. A length comes back in
 * the unit asked; the markup asks for both and wraps them in `<U>`.
 */

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const withArticle = (text: string) => `${article(text)} ${text}`;

/** A length: eighths of an inch, or centimetres to one decimal. */
export const len = (inches: number, unit: Unit) =>
  `${unit === "cm" ? toCm(inches) : inEighths(inches)} ${unit}`;
/** A size: `19½ × 29½ in`, `49.5 × 74.9 cm`. */
export const dims = (s: Size, unit: Unit) =>
  unit === "cm" ? `${toCm(s.w)} × ${toCm(s.h)} cm` : `${inEighths(s.w)} × ${inEighths(s.h)} in`;
const idOf = (s: Size) => `${s.w}x${s.h}`;
const isA = (size: MockupSize) => /^A\d$/.test(size.id);

export const FINISH_NAMES: Record<Finish, string> = {
  black: "Black",
  white: "White",
  oak: "Light oak",
  walnut: "Walnut",
};

/** A chip's name: `24×36`, `8.5×11`, `A2`. */
export const chipLabel = (size: MockupSize) => size.id.replace("x", "×");

/** The cut as a whole percent, and whether the engine finds nothing to move. */
function cutOf(art: Art, option: MockupOption) {
  if (option.cut === null || !option.opening) return undefined;
  return {
    pct: Math.round(option.cut * 100),
    still: focusStep(art, option.opening, KEY_STEP.shift) === 0,
  };
}

/**
 * A chip's sub: `0% cut` only when nothing moves, `<1% cut` for a smaller cut, `No room` with no
 * opening.
 * {@link openspec/specs/frame-mockup/spec.md#requirement-each-size-chip-shows-how-much-of-the-artwork-it-cuts}
 */
export function chipSub(art: Art, option: MockupOption): string {
  const cut = cutOf(art, option);
  if (!cut) return "No room";
  if (cut.still) return "0% cut";
  return cut.pct === 0 ? "<1% cut" : `${cut.pct}% cut`;
}

/** The answer's head: the frame size; an A-series size leads with millimetres. */
export function frameValue(size: MockupSize, unit: Unit): { value: string; sub?: string } {
  if (!isA(size)) return { value: dims(size, unit) };
  const mm = `${Math.round(size.w * 25.4)} × ${Math.round(size.h * 25.4)} mm`;
  return {
    value: mm,
    sub: unit === "cm" ? dims(size, "cm") : `${oneDecimal(size.w)} × ${oneDecimal(size.h)} in`,
  };
}

type Shot = Pick<State, "art" | "size" | "mat" | "focus" | "placement" | "view">;

const artName = (art: State["art"]) => (art.sample ? "the sample" : "your artwork");

/** The frame's outside on the wall, `y` up from the floor. */
const outsideOf = (state: Shot): Rect => hangMockup(current(state).option.size, state.placement);

/**
 * The answer's facts: the cut, the mat, the outside and its heights, the close-up's wall.
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-answer-names-the-frame-in-both-units}
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-mat-switch-keeps-the-size}
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-frame-hangs-on-one-of-two-walls-seen-whole-or-close-up}
 */
export function facts(state: Shot, unit: Unit): { text: string; whole?: boolean }[] {
  const { option, opening } = current(state);
  const { size } = option;
  const cut = cutOf(state.art, option);
  const name = artName(state.art);
  const lines: { text: string; whole?: boolean }[] = [];
  if (cut?.still) lines.push({ text: `Nothing is cut: ${name} has this shape.`, whole: true });
  else if (cut?.pct === 0) lines.push({ text: `Cuts under 1% of ${name}.` });
  else lines.push({ text: `Cuts ${cut?.pct ?? 0}% of ${name}.` });

  if (state.mat && size.mat) {
    const side = (size.w - opening.w) / 2;
    const top = (size.h - opening.h) / 2;
    lines.push({
      text: `Mat opening ${dims(opening, unit)}. Border ${len(side, unit)} at the sides, ${len(top, unit)} at the top and bottom. The frame is sold with this mat, cut for ${withArticle(idOf(size.mat))} print.`,
    });
  } else if (state.mat) {
    lines.push({
      text: `This frame is not sold with a mat, so it gets a ${len(MAT_WIDTH, unit)} mat. Opening ${dims(opening, unit)}.`,
    });
  }

  const out = outsideOf(state);
  const where =
    state.placement === "sofa"
      ? `Bottom edge ${len(out.y, unit)}, top edge ${len(out.y + out.h, unit)} above the floor, ${len(out.y - SOFA.back, unit)} over the sofa.`
      : `Centred ${len(CENTRE_LINE, unit)} above the floor, from ${len(out.y, unit)} to ${len(out.y + out.h, unit)}.`;
  lines.push({
    text: `Outside ${dims(out, unit)}, with a ${len(MOULDING, unit)} moulding. ${where}`,
  });
  if (state.view === "close")
    lines.push({ text: `Close-up: ${dims(mockupView(out, "close"), unit)} of wall.` });
  return lines;
}

/** The line under the picture: how to move the artwork, or that nothing moves. */
export const hint = (still: boolean, unit: Unit) =>
  still
    ? "Nothing to move: the artwork fills this frame as it is."
    : `Drag the artwork to choose what is cut. Arrow keys move it ${len(KEY_STEP.arrow, unit)}, Shift + arrow ${len(KEY_STEP.shift, unit)}.`;

/**
 * The live region's text for a note.
 * {@link openspec/specs/frame-mockup/spec.md#requirement-an-upload-opens-on-the-size-that-cuts-least}
 * {@link openspec/specs/frame-mockup/spec.md#requirement-a-file-that-cannot-be-used-leaves-the-artwork-as-it-was}
 */
export function noteText(note: Note, size: string): string {
  switch (note) {
    case "opened":
      return `${size} cuts your artwork least, so the mockup opened on ${size}.`;
    case "replaced":
      return `New artwork. ${size} cuts it least, so the frame changed to ${size}.`;
    case "back":
      return "The sample is back on 24x36. Your style, mat, wall and view stay as they were.";
    case "notimg":
      return "This file is not an image. Choose a JPEG or a PNG.";
    case "decode":
      return "Your browser cannot open this file. Try a JPEG or a PNG.";
  }
}
export const isError = (note: Note) => note === "notimg" || note === "decode";
export const ERROR_SUB = "The last artwork stays in the frame.";
export const PNG_FAILED = "Your browser could not make the PNG. Try again, or try the close-up.";

/** The art line: what is in the frame. */
export const artLine = (art: State["art"]) =>
  art.sample
    ? { title: "Sample artwork", sub: "2:3, drawn for this site" }
    : { title: "Your artwork", sub: `${art.width} × ${art.height} px` };

/**
 * The picture's accessible label.
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-pictures-label-follows-the-state}
 */
export function pictureLabel(state: Shot & Pick<State, "finish">): string {
  const where = state.placement === "sofa" ? "above a sofa" : "on a plain wall";
  const view = state.view === "close" ? "close-up" : "the whole 12 by 8 ft wall";
  return `Poster mockup: ${artName(state.art)} in ${withArticle(state.size)} ${FINISH_NAMES[state.finish].toLowerCase()} frame, ${state.mat ? "with a white mat" : "no mat"}, ${where}, ${view}, drawn to true scale.`;
}

export const MOVE_LABEL =
  "Move the artwork in the frame. Arrow keys move it; Shift moves it further.";

/** Why the mat is off for a size with no room for one: `A 4x6 has no room for a mat.` */
export const noRoom = (size: string) => `${cap(withArticle(size))} has no room for a mat.`;

/** The phone buttons' current values. */
export function panelValue(panel: Panel, state: State): string {
  switch (panel) {
    case "size":
      return state.size.replace("x", "×");
    case "style":
      return FINISH_NAMES[state.finish];
    case "mat":
      return state.mat ? "Mat" : "No mat";
    case "wall":
      return `${state.placement === "sofa" ? "Sofa" : "Plain"}${state.view === "close" ? ", close" : ""}`;
  }
}

/** The PNG's pixel size for the view on screen. */
export function pngSize(state: Shot): Size {
  const size = exportSize(mockupView(outsideOf(state), state.view));
  if (!size) throw new Error("no PNG size");
  return size;
}

/**
 * The line under Download, and the file's name.
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-png-saves-the-view-on-screen}
 */
export function pngLine(state: Shot): string {
  const { w, h } = pngSize(state);
  return `${w.toLocaleString("en-US")} × ${h.toLocaleString("en-US")} px PNG of the view above. No watermark.`;
}
export const fileName = (size: string) => `frame-mockup-${size.toLowerCase()}.png`;

import { inEighths, POSTERS, type Size, toCm, type Unit } from "@framesizes/sizes";

import { inches } from "@/components/frame-mat/state";

/** Width and height of a typed size. */
export type Field = "w" | "h";
export const FIELDS: readonly Field[] = ["w", "h"];

export interface State {
  /** The chips, or the typed width and height. */
  mode: "chips" | "custom";
  /** The chip pressed, kept while the custom size is open. */
  poster: string;
  mat: boolean;
  landscape: boolean;
  /** As typed, in the visitor's unit; kept when the visitor goes back to the chips. */
  fields: Record<Field, string>;
  /** Which with-a-mat frame is drawn. */
  pick: number;
}

export type Action =
  | { type: "poster"; id: string }
  | { type: "mat"; on: boolean }
  | { type: "landscape"; on: boolean }
  | { type: "custom" }
  | { type: "chips" }
  | { type: "type"; field: Field; text: string }
  | { type: "pick"; i: number }
  | { type: "unit"; from: Unit; to: Unit };

export const INITIAL: State = {
  mode: "chips",
  poster: "24x36",
  mat: false,
  landscape: false,
  fields: { w: "", h: "" },
  pick: 0,
};

/** A length in inches as a field holds it: eighths of an inch, or centimetres to one decimal. */
const write = (n: number, unit: Unit) => (unit === "cm" ? String(toCm(n)) : inEighths(n));

/**
 * The widget's state. Every action but `pick` and `unit` draws the first with-a-mat frame again.
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-back-to-standard-sizes-keeps-the-chip-and-the-typed-size}
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-unit-switch-writes-every-number-in-the-visitors-unit}
 */
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "poster":
      return { ...state, poster: action.id, pick: 0 };
    case "mat":
      return { ...state, mat: action.on, pick: 0 };
    case "landscape":
      return { ...state, landscape: action.on, pick: 0 };
    case "custom":
      return { ...state, mode: "custom", pick: 0 };
    case "chips":
      return { ...state, mode: "chips", pick: 0 };
    case "type":
      return { ...state, fields: { ...state.fields, [action.field]: action.text }, pick: 0 };
    case "pick":
      return { ...state, pick: action.i };
    case "unit": {
      if (action.from === action.to) return state;
      const fields = { ...state.fields };
      for (const f of FIELDS) {
        const n = inches(fields[f], action.from);
        if (n !== undefined && Number.isFinite(n) && n > 0) fields[f] = write(n, action.to);
      }
      return { ...state, fields };
    }
  }
}

/** The poster the widget answers for: a chip, turned when landscape, or a typed size. */
export interface Picked {
  size: Size;
  /** A chip's name as shown: `11x17`, `17x11`, `A3`. Absent for a typed size. */
  name?: string;
  use?: string;
  /** An A-series chip: its sizes lead with millimetres. */
  isA: boolean;
}

export type PosterPick = Picked | { empty: true } | { error: Record<Field, boolean> };

/**
 * The poster the state gives: a chip, an empty custom size, or the custom fields that hold no
 * length above 0.
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-a-custom-size-takes-inches-with-fractions-or-centimetres}
 * {@link openspec/specs/poster-frame-sizes/spec.md#requirement-bad-input-gets-one-message-and-no-answer}
 */
export function poster(state: State, unit: Unit): PosterPick {
  if (state.mode === "chips") {
    const p = POSTERS.find((x) => x.id === state.poster) ?? POSTERS[5];
    if (!p) throw new Error("no posters");
    const isA = p.group === "a-series";
    if (!state.landscape) return { size: { w: p.w, h: p.h }, name: p.id, use: p.use, isA };
    return {
      size: { w: p.h, h: p.w },
      name: isA ? p.id : `${p.h}x${p.w}`,
      use: p.use,
      isA,
    };
  }
  const text = { w: state.fields.w.trim(), h: state.fields.h.trim() };
  const n = { w: inches(text.w, unit), h: inches(text.h, unit) };
  const bad = (f: Field) => {
    const x = n[f] ?? 0;
    return text[f] !== "" && !(Number.isFinite(x) && x > 0);
  };
  const error = { w: bad("w"), h: bad("h") };
  if (error.w || error.h) return { error };
  if (n.w === undefined || n.h === undefined) return { empty: true };
  return { size: { w: n.w, h: n.h }, isA: false };
}

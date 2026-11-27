import {
  CM_PER_INCH,
  inEighths,
  MAT_OVERLAP,
  MAT_WIDTH,
  type MatAnswer,
  type MatQuestion,
  matSizes,
  readLength,
  type Size,
  toCm,
  type Unit,
  whyNoMat,
} from "@framesizes/sizes";

import { writeLength } from "@/components/measure-frame/state";

/** Start from a print to get the frame, or from a frame to get the print. */
export type From = "print" | "frame";
/** Width, height and the mat border. */
export type Field = "w" | "h" | "m";
export const FIELDS: readonly Field[] = ["w", "h", "m"];

export interface State {
  from: From;
  /** As typed, in the visitor's unit. */
  fields: Record<Field, string>;
  /** The find button was pressed: errors show, and the answer follows every edit. */
  submitted: boolean;
  /** A field's length in inches as a unit switch read it, kept until the field changes. */
  exact?: Partial<Record<Field, number>>;
}

export type Action =
  | { type: "type"; field: Field; text: string }
  /** A border chip, its width in inches. */
  | { type: "preset"; inches: number; unit: Unit }
  /** `carry`: the answer's frame (from a print) or print (from a frame), when there is one. */
  | { type: "swap"; carry?: Size; unit: Unit }
  | { type: "find" }
  | { type: "reset"; unit: Unit }
  | { type: "unit"; from: Unit; to: Unit };

/** A length in inches as a field holds it: eighths of an inch, or centimetres to one decimal. */
const write = (inches: number, unit: Unit) =>
  unit === "cm" ? toCm(inches).toFixed(1) : inEighths(inches);

/** The state without the kept lengths of `fields`. */
function forget({ exact, ...state }: State, fields: readonly Field[]): State {
  const left = Object.entries(exact ?? {}).filter(([f]) => !fields.includes(f as Field));
  return left.length ? { ...state, exact: Object.fromEntries(left) } : state;
}

export const INITIAL: State = {
  from: "print",
  fields: { w: "", h: "", m: write(MAT_WIDTH, "in") },
  submitted: false,
};

/** A field's length in inches, or `undefined` when it holds none. */
export function inches(text: string, unit: Unit): number | undefined {
  const n = readLength(text.trim());
  return n === undefined ? undefined : unit === "cm" ? n / CM_PER_INCH : n;
}

const NAMES: Record<From, Record<Field, string>> = {
  print: { w: "print width", h: "print height", m: "mat border" },
  frame: { w: "frame width", h: "frame height", m: "mat border" },
};

export type Outcome =
  | { errors: Partial<Record<Field, string>> }
  /** `width` is the mat border in inches. */
  | { answer: MatAnswer; width: number };

/**
 * The answer the fields give, or a message for each field that gives none.
 * {@link openspec/specs/frame-mat-calculator/spec.md#requirement-bad-input-marks-the-field-and-gets-no-answer}
 */
export function outcome(state: State, unit: Unit): Outcome {
  const names = NAMES[state.from];
  const errors: Partial<Record<Field, string>> = {};
  const x: Partial<Record<Field, number>> = {};
  for (const field of FIELDS) {
    const text = state.fields[field].trim();
    const above = `Enter a ${names[field]} above 0 ${unit}.${field === "m" ? " With no mat, the frame is the print size." : ""}`;
    const n = state.exact?.[field] ?? inches(text, unit);
    if (!text) errors[field] = `Enter the ${names[field]}.`;
    else if (n === undefined)
      errors[field] =
        text.startsWith("-") && readLength(text.slice(1).trim()) !== undefined
          ? above
          : unit === "cm"
            ? "Use a number, like 20.3."
            : "Use a number, like 8 or 8 1/2.";
    else if (!(n > 0)) errors[field] = above;
    else x[field] = n;
  }
  const { w, h, m } = x;
  if (w === undefined || h === undefined || m === undefined) return { errors };
  const size = { w, h };
  const q: MatQuestion =
    state.from === "print"
      ? { from: "print", print: size, width: m }
      : { from: "frame", frame: size, width: m };
  const why = whyNoMat(q);
  if (why === "narrow")
    return {
      errors: {
        m: `Enter a mat border above ${writeLength(MAT_OVERLAP, unit)}. A narrower one leaves the frame no bigger than the print.`,
      },
    };
  if (why === "room" && state.from === "print") {
    const side: Field = w <= 2 * MAT_OVERLAP ? "w" : "h";
    return {
      errors: {
        [side]: `Enter a ${names[side]} above ${writeLength(2 * MAT_OVERLAP, unit)}. The mat covers ${writeLength(MAT_OVERLAP, unit)} on each side.`,
      },
    };
  }
  if (why === "room") {
    const wide = w <= 2 * m;
    return {
      errors: {
        m: `A ${writeLength(m, unit)} border on each side leaves no opening in a frame ${writeLength(wide ? w : h, unit)} ${wide ? "wide" : "tall"}. Pick a narrower border.`,
      },
    };
  }
  const answer = matSizes(q);
  if (!answer) return { errors: { w: `Enter a ${names.w} above 0 ${unit}.` } };
  return { answer, width: m };
}

/**
 * The calculator's state: the direction, the fields as typed, and whether find was pressed. The
 * unit is the site's, passed in.
 * {@link openspec/specs/frame-mat-calculator/spec.md#requirement-reverse-swaps-the-direction-and-carries-the-answer-over}
 * {@link openspec/specs/frame-mat-calculator/spec.md#requirement-switching-the-unit-converts-the-numbers-already-typed}
 */
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "type":
      return {
        ...forget(state, [action.field]),
        fields: { ...state.fields, [action.field]: action.text },
      };
    case "preset":
      return {
        ...forget(state, ["m"]),
        fields: { ...state.fields, m: write(action.inches, action.unit) },
      };
    case "swap": {
      const from = state.from === "print" ? "frame" : "print";
      const { carry, unit } = action;
      return carry
        ? {
            ...forget(state, ["w", "h"]),
            from,
            fields: { ...state.fields, w: write(carry.w, unit), h: write(carry.h, unit) },
          }
        : { ...state, from };
    }
    case "find":
      return { ...state, submitted: true };
    case "reset":
      return {
        ...forget(state, FIELDS),
        fields: { w: "", h: "", m: write(MAT_WIDTH, action.unit) },
        submitted: false,
      };
    case "unit": {
      if (action.from === action.to) return state;
      // The length read before the first switch is kept, so a rounded field never moves the answer.
      const fields = { ...state.fields };
      const exact = { ...state.exact };
      for (const field of FIELDS) {
        const n = exact[field] ?? inches(fields[field], action.from);
        if (n !== undefined) {
          fields[field] = write(n, action.to);
          exact[field] = n;
        }
      }
      return Object.keys(exact).length ? { ...state, fields, exact } : { ...state, fields };
    }
  }
}

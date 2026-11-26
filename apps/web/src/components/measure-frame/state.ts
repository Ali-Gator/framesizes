import {
  CM_PER_INCH,
  type Identified,
  identifyFrame,
  inEighths,
  type Measurement,
  readLength,
  type Size,
  toCm,
  type Unit,
  whyNoAnswer,
} from "@framesizes/sizes";

/** What the visitor measures. */
export type Kind = "inside" | "front" | "mat" | "outside";
export const KINDS: readonly Kind[] = ["inside", "front", "mat", "outside"];
/** Width, height and, for the outside, the moulding width. */
export type Field = "w" | "h" | "f";
/** On a phone each step is its own screen; a desktop shows them together. */
export type Step = "pick" | "enter" | "result";

/** A field as typed; `eighths` (0 to 7) is the fraction the eighths row adds, inches only. */
export interface FieldState {
  text: string;
  eighths: number;
}

export interface State {
  step: Step;
  kind: Kind;
  fields: Record<Field, FieldState>;
  /** The field the eighths row sets. */
  active: Field;
  /** "Find" was pressed: errors show, and on a desktop the answer follows every change. */
  submitted: boolean;
  /** Back from an answer with the numbers kept. */
  kept: boolean;
  /** A field's length in inches as a unit switch read it, kept until the field changes. */
  exact?: Partial<Record<Field, number>>;
}

export type Action =
  | { type: "pick"; kind: Kind }
  | { type: "enter" }
  | { type: "back" }
  | { type: "type"; field: Field; text: string }
  | { type: "eighth"; eighths: number }
  | { type: "focus"; field: Field }
  | { type: "blur"; field: Field; unit: Unit }
  | { type: "unit"; from: Unit; to: Unit }
  | { type: "find"; unit: Unit }
  | { type: "change" }
  | { type: "checkSpot" }
  | { type: "reset" };

const EMPTY: FieldState = { text: "", eighths: 0 };

export const INITIAL: State = {
  step: "pick",
  kind: "inside",
  fields: { w: EMPTY, h: EMPTY, f: EMPTY },
  active: "w",
  submitted: false,
  kept: false,
};

/** The fields a kind asks for. */
export const fieldsOf = (kind: Kind): readonly Field[] =>
  kind === "outside" ? ["w", "h", "f"] : ["w", "h"];

/** A length in inches as a whole number and eighths, the way a field holds it. */
function toEighths(inches: number): FieldState {
  const eighths = Math.round(inches * 8);
  const whole = Math.floor(eighths / 8);
  return { text: String(whole), eighths: eighths - whole * 8 };
}

type Read = { empty: true } | { bad: true } | { inches: number };

function read({ text, eighths }: FieldState, unit: Unit): Read {
  const t = text.trim();
  // The eighths add to a whole number only; a typed fraction or decimal replaces them on blur.
  const extra = unit === "in" && /^\d*$/.test(t) ? eighths / 8 : 0;
  if (!t && !extra) return { empty: true };
  const n = t ? readLength(t) : 0;
  if (n === undefined) return { bad: true };
  return { inches: unit === "cm" ? n / CM_PER_INCH : n + extra };
}

/** A field's length: the one a unit switch kept, else the one its text gives. */
function value(state: State, field: Field, unit: Unit): Read {
  const kept = state.exact?.[field];
  return kept === undefined ? read(state.fields[field], unit) : { inches: kept };
}

/** A field's length in inches, when it holds one above 0. */
export function fieldValue(state: State, field: Field, unit: Unit): number | undefined {
  const r = value(state, field, unit);
  return "inches" in r && r.inches > 0 ? r.inches : undefined;
}

/** A length in the visitor's unit: eighths of an inch, or centimetres to one decimal. */
export const writeLength = (inches: number, unit: Unit) =>
  unit === "cm" ? `${toCm(inches).toFixed(1)} cm` : `${inEighths(inches)} in`;

const NAMES: Record<Field, string> = { w: "width", h: "height", f: "moulding width" };
const AGAIN = "Measure it again from the front, from the outer edge to the glass.";

export type Outcome =
  | { errors: Partial<Record<Field, string>> }
  /** `measured` in inches as typed; `face` the moulding width, outside only. */
  | { answer: Identified; measured: Size; face?: number };

/**
 * The answer the fields give, or a message for each field that gives none.
 * {@link openspec/specs/measure-frame/spec.md#requirement-bad-input-marks-the-field-and-gets-no-answer}
 */
export function outcome(state: State, unit: Unit): Outcome {
  const errors: Partial<Record<Field, string>> = {};
  const x: Partial<Record<Field, number>> = {};
  for (const field of fieldsOf(state.kind)) {
    const r = value(state, field, unit);
    if ("empty" in r) errors[field] = `Enter the ${NAMES[field]}.`;
    else if ("bad" in r)
      errors[field] = unit === "cm" ? "Use a number, like 20.6." : "Use a number, like 8 or 8 1/8.";
    else if (!(r.inches > 0)) errors[field] = `Enter a ${NAMES[field]} above 0 ${unit}.`;
    else x[field] = r.inches;
  }
  const { w, h, f } = x;
  if (w === undefined || h === undefined || Object.keys(errors).length) return { errors };
  const measured = { w, h };
  const m: Measurement =
    state.kind === "outside"
      ? { kind: "outside", size: measured, face: f ?? 0 }
      : { kind: state.kind, size: measured };
  const why = whyNoAnswer(m);
  if (why === "room" && f !== undefined) {
    const wide = w <= h;
    return {
      errors: {
        f: `A ${writeLength(f, unit)} moulding leaves no room for a picture in a frame ${writeLength(wide ? w : h, unit)} ${wide ? "wide" : "tall"}. ${AGAIN}`,
      },
    };
  }
  if (why === "narrow" && f !== undefined) {
    return {
      errors: {
        f: `A ${writeLength(f, unit)} moulding is no wider than the lip that holds the glass. ${AGAIN}`,
      },
    };
  }
  const answer = identifyFrame(m);
  if (!answer) return { errors: { w: `Enter a width above 0 ${unit}.` } };
  return state.kind === "outside" ? { answer, measured, face: f } : { answer, measured };
}

/** The state with `next` in a field, which drops the length a unit switch kept for it. */
function setField({ exact, ...state }: State, field: Field, next: Partial<FieldState>): State {
  const left = Object.entries(exact ?? {}).filter(([f]) => f !== field);
  return {
    ...state,
    ...(left.length ? { exact: Object.fromEntries(left) } : {}),
    fields: { ...state.fields, [field]: { ...state.fields[field], ...next } },
  };
}

/**
 * The wizard's state: the step, the choice, the fields as typed. The unit is the site's, passed in.
 * {@link openspec/specs/measure-frame/spec.md#requirement-a-phone-shows-one-step-per-screen}
 * {@link openspec/specs/measure-frame/spec.md#requirement-the-sizes-take-whole-inches-and-eighths-or-centimetres}
 */
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "pick":
      return {
        ...state,
        kind: action.kind,
        active: fieldsOf(action.kind).includes(state.active) ? state.active : "w",
      };
    case "enter":
      return { ...state, step: "enter", active: "w" };
    case "back":
      return { ...state, step: "pick" };
    case "type":
      return setField(state, action.field, { text: action.text });
    case "eighth":
      return setField(state, state.active, { eighths: action.eighths });
    case "focus":
      return { ...state, active: action.field };
    case "blur": {
      // A typed fraction or decimal moves into the eighths row: "8 1/8" becomes 8 and ⅛.
      const { text } = state.fields[action.field];
      if (action.unit !== "in" || /^\s*\d*\s*$/.test(text)) return state;
      const n = readLength(text);
      return n === undefined ? state : setField(state, action.field, toEighths(n));
    }
    case "unit": {
      if (action.from === action.to) return state;
      // The length read before the first switch is kept, so a rounded field never moves the answer.
      const fields = { ...state.fields };
      const exact = { ...state.exact };
      for (const field of ["w", "h", "f"] as const) {
        const r = value(state, field, action.from);
        if (!("inches" in r)) continue;
        fields[field] =
          action.to === "cm"
            ? { text: toCm(r.inches).toFixed(1), eighths: 0 }
            : toEighths(r.inches);
        exact[field] = r.inches;
      }
      return Object.keys(exact).length ? { ...state, fields, exact } : { ...state, fields };
    }
    case "find":
      return "answer" in outcome(state, action.unit)
        ? { ...state, step: "result", submitted: true, kept: false }
        : { ...state, submitted: true };
    case "change":
      return { ...state, step: "enter", kept: true };
    case "checkSpot":
      return { ...state, step: "pick", kept: true, submitted: false };
    case "reset":
      return INITIAL;
  }
}

import { describe, expect, it } from "vitest";

import { type Action, fieldValue, INITIAL, outcome, reducer, type State } from "../state";

const run = (...actions: Action[]) => actions.reduce(reducer, INITIAL);
const typed = (w: string, h: string, f?: string): Action[] => [
  { type: "type", field: "w", text: w },
  { type: "type", field: "h", text: h },
  ...(f === undefined ? [] : [{ type: "type", field: "f", text: f } as Action]),
];
const errors = (state: State, unit: "in" | "cm" = "in") => {
  const o = outcome(state, unit);
  if (!("errors" in o)) throw new Error("expected errors");
  return o.errors;
};

describe("the first step", () => {
  /** {@link openspec/specs/measure-frame/spec.md#scenario-the-choices-in-the-server-html} */
  it("starts on the choice, inside chosen, every field empty", () => {
    expect(INITIAL).toEqual({
      step: "pick",
      kind: "inside",
      fields: {
        w: { text: "", eighths: 0 },
        h: { text: "", eighths: 0 },
        f: { text: "", eighths: 0 },
      },
      active: "w",
      submitted: false,
      kept: false,
    });
  });
});

describe("moving through the steps", () => {
  /** {@link openspec/specs/measure-frame/spec.md#scenario-through-the-steps} */
  it("goes from the choice to the fields to the answer", () => {
    const entered = run({ type: "enter" }, ...typed("8 1/8", "10 1/8"));
    expect(entered.step).toBe("enter");
    const found = reducer(entered, { type: "find", unit: "in" });
    expect(found.step).toBe("result");
    expect(found.submitted).toBe(true);
  });

  it("goes back to the choice from the fields", () => {
    expect(run({ type: "enter" }, { type: "back" }).step).toBe("pick");
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-back-keeps-the-numbers} */
  it("keeps every number on Change measurement", () => {
    const found = run({ type: "enter" }, ...typed("8", "10"), { type: "find", unit: "in" });
    const back = reducer(found, { type: "change" });
    expect(back.step).toBe("enter");
    expect(back.kept).toBe(true);
    expect(back.fields).toEqual(found.fields);
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-check-where-to-measure} */
  it("keeps the numbers on Check where to measure and shows step 1", () => {
    const found = run({ type: "enter" }, ...typed("9", "12"), { type: "find", unit: "in" });
    const back = reducer(found, { type: "checkSpot" });
    expect(back.step).toBe("pick");
    expect(back.kept).toBe(true);
    expect(back.fields).toEqual(found.fields);
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-measure-another-frame} */
  it("clears everything on Measure another frame", () => {
    const found = run(
      { type: "pick", kind: "outside" },
      { type: "enter" },
      ...typed("10", "12", "1 1/4"),
      { type: "find", unit: "in" },
    );
    expect(reducer(found, { type: "reset" })).toEqual(INITIAL);
  });

  it("stays on the fields when Find meets an error", () => {
    const found = run({ type: "enter" }, { type: "find", unit: "in" });
    expect(found.step).toBe("enter");
    expect(found.submitted).toBe(true);
  });

  it("moves the eighths row off the moulding when the choice drops it", () => {
    const s = run({ type: "pick", kind: "outside" }, { type: "focus", field: "f" });
    expect(reducer(s, { type: "pick", kind: "inside" }).active).toBe("w");
  });
});

describe("the eighths", () => {
  /** {@link openspec/specs/measure-frame/spec.md#scenario-eighths-added-to-a-whole-number} */
  it("adds ⅛ to the whole number in the active field", () => {
    const s = run({ type: "type", field: "w", text: "8" }, { type: "eighth", eighths: 1 });
    expect(s.fields.w).toEqual({ text: "8", eighths: 1 });
    expect(fieldValue(s, "w", "in")).toBe(8.125);
  });

  it("sets the field in use", () => {
    const s = run({ type: "focus", field: "h" }, { type: "eighth", eighths: 4 });
    expect(s.fields.h.eighths).toBe(4);
    expect(s.fields.w.eighths).toBe(0);
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-a-typed-fraction} */
  it("moves a typed fraction into the row on leaving the field", () => {
    const s = run(
      { type: "type", field: "w", text: "8 1/8" },
      { type: "blur", field: "w", unit: "in" },
    );
    expect(s.fields.w).toEqual({ text: "8", eighths: 1 });
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-other-typed-forms} */
  it("reads 8.125, 8⅛, 8-1/8 and 8,5", () => {
    for (const text of ["8.125", "8⅛", "8-1/8"])
      expect(fieldValue(run({ type: "type", field: "w", text }), "w", "in"), text).toBe(8.125);
    expect(fieldValue(run({ type: "type", field: "w", text: "8,5" }), "w", "in")).toBe(8.5);
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-centimetres} */
  it("reads 20.6 in centimetres and leaves a cm field as typed", () => {
    const s = run(
      { type: "type", field: "w", text: "20.6" },
      { type: "blur", field: "w", unit: "cm" },
    );
    expect(s.fields.w).toEqual({ text: "20.6", eighths: 0 });
    expect(fieldValue(s, "w", "cm")).toBeCloseTo(20.6 / 2.54);
  });
});

describe("switching the unit", () => {
  /** {@link openspec/specs/measure-frame/spec.md#scenario-inches-to-centimetres-and-back} */
  it("turns 8⅛ in into 20.6 cm and back", () => {
    const inches = run({ type: "type", field: "w", text: "8" }, { type: "eighth", eighths: 1 });
    const cm = reducer(inches, { type: "unit", from: "in", to: "cm" });
    expect(cm.fields.w).toEqual({ text: "20.6", eighths: 0 });
    expect(reducer(cm, { type: "unit", from: "cm", to: "in" }).fields.w).toEqual({
      text: "8",
      eighths: 1,
    });
  });

  it("leaves empty and unreadable fields as they are", () => {
    const s = run(
      { type: "type", field: "h", text: "abc" },
      { type: "unit", from: "in", to: "cm" },
    );
    expect(s.fields.w).toEqual({ text: "", eighths: 0 });
    expect(s.fields.h).toEqual({ text: "abc", eighths: 0 });
  });
});

describe("bad input", () => {
  /** {@link openspec/specs/measure-frame/spec.md#scenario-empty-fields} */
  it("asks for both sides when both are empty", () => {
    expect(errors(INITIAL)).toEqual({ w: "Enter the width.", h: "Enter the height." });
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-not-a-number-or-0} */
  it("asks for a number, and for one above 0", () => {
    expect(errors(run(...typed("abc", "10"))).w).toBe("Use a number, like 8 or 8 1/8.");
    expect(errors(run(...typed("0", "10"))).w).toBe("Enter a width above 0 in.");
    expect(errors(run(...typed("abc", "10")), "cm").w).toBe("Use a number, like 20.6.");
    expect(errors(run(...typed("0", "10")), "cm").w).toBe("Enter a width above 0 cm.");
  });

  it("asks for the moulding width on the outside", () => {
    expect(errors(run({ type: "pick", kind: "outside" }, ...typed("10", "12"))).f).toBe(
      "Enter the moulding width.",
    );
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-a-moulding-too-wide-for-the-frame} */
  it("marks a moulding too wide for the frame", () => {
    expect(errors(run({ type: "pick", kind: "outside" }, ...typed("10", "12", "6")))).toEqual({
      f: "A 6 in moulding leaves no room for a picture in a frame 10 in wide. Measure it again from the front, from the outer edge to the glass.",
    });
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-a-moulding-no-wider-than-the-lip} */
  it("marks a moulding no wider than the lip", () => {
    expect(errors(run({ type: "pick", kind: "outside" }, ...typed("13", "16", "1/4")))).toEqual({
      f: "A ¼ in moulding is no wider than the lip that holds the glass. Measure it again from the front, from the outer edge to the glass.",
    });
  });
});

describe("the answer", () => {
  it("gives the measured size in inches, and the moulding on the outside", () => {
    const o = outcome(run({ type: "pick", kind: "outside" }, ...typed("10", "12", "1 1/4")), "in");
    expect(o).toMatchObject({ measured: { w: 10, h: 12 }, face: 1.25 });
    expect("answer" in o && o.answer.kind).toBe("standard");
  });
});

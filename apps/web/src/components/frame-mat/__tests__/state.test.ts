import { describe, expect, it } from "vitest";

import { type Action, type From, INITIAL, outcome, reducer, type State } from "../state";

type Unit = "in" | "cm";

const run = (actions: Action[], start: State = INITIAL) => actions.reduce(reducer, start);
const typed = (w: string, h: string, m?: string, from: From = "print"): State => ({
  from,
  fields: { w, h, m: m ?? INITIAL.fields.m },
  submitted: true,
});
const errors = (s: State, unit: Unit = "in") => {
  const o = outcome(s, unit);
  if (!("errors" in o)) throw new Error("expected errors");
  return o.errors;
};
const answer = (s: State, unit: Unit = "in") => {
  const o = outcome(s, unit);
  if (!("answer" in o)) throw new Error(JSON.stringify(o.errors));
  return o.answer;
};

describe("the initial state", () => {
  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-calculator-in-the-server-html} */
  it("starts from a print, sizes empty, the border 2", () => {
    expect(INITIAL).toEqual({ from: "print", fields: { w: "", h: "", m: "2" }, submitted: false });
  });
});

describe("typing, chips, find and start over", () => {
  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-chip-and-a-typed-border} */
  it("sets the border from a chip, in inches and in centimetres, and from typing", () => {
    expect(run([{ type: "preset", inches: 2.5, unit: "in" }]).fields.m).toBe("2½");
    expect(run([{ type: "preset", inches: 2.5, unit: "cm" }]).fields.m).toBe("6.4");
    expect(run([{ type: "type", field: "m", text: "1.75" }]).fields.m).toBe("1.75");
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-answer-follows-an-edit} */
  it("marks the state found, and the answer follows the fields", () => {
    const s = run([
      { type: "type", field: "w", text: "8" },
      { type: "type", field: "h", text: "10" },
      { type: "find" },
    ]);
    expect(s.submitted).toBe(true);
    expect(answer(s).frame).toEqual({ w: 11.5, h: 13.5 });
    expect(answer(run([{ type: "type", field: "h", text: "14" }], s)).frame).toEqual({
      w: 11.5,
      h: 17.5,
    });
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-start-over} */
  it("empties the sizes and puts the border back to 2 in or 5.1 cm", () => {
    const s = typed("8", "10", "3");
    expect(run([{ type: "reset", unit: "in" }], s)).toEqual({ ...INITIAL });
    expect(run([{ type: "reset", unit: "cm" }], s).fields).toEqual({ w: "", h: "", m: "5.1" });
  });
});

describe("Reverse", () => {
  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-there-and-back} */
  it("carries the answer there and back", () => {
    const start = typed("8", "10");
    const there = run([{ type: "swap", carry: answer(start).frame, unit: "in" }], start);
    expect(there.from).toBe("frame");
    expect([there.fields.w, there.fields.h, there.fields.m]).toEqual(["11½", "13½", "2"]);
    expect(answer(there).print).toEqual({ w: 8, h: 10 });
    const back = run([{ type: "swap", carry: answer(there).print, unit: "in" }], there);
    expect(back.from).toBe("print");
    expect([back.fields.w, back.fields.h]).toEqual(["8", "10"]);
    expect(answer(back).frame).toEqual({ w: 11.5, h: 13.5 });
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-reverse-before-an-answer} */
  it("only flips the direction before an answer", () => {
    const s = run([
      { type: "type", field: "w", text: "8" },
      { type: "type", field: "h", text: "10" },
      { type: "swap", unit: "in" },
    ]);
    expect(s).toEqual({ from: "frame", fields: { w: "8", h: "10", m: "2" }, submitted: false });
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-there-and-back} */
  it("writes the carried size in centimetres", () => {
    const s = run([{ type: "swap", carry: { w: 11.5, h: 13.5 }, unit: "cm" }], typed("", ""));
    expect([s.fields.w, s.fields.h]).toEqual(["29.2", "34.3"]);
  });
});

describe("switching the unit", () => {
  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-inches-to-centimetres-and-back} */
  it("converts 8, 10 and 2 in to 20.3, 25.4 and 5.1 cm and back", () => {
    const cm = run([{ type: "unit", from: "in", to: "cm" }], typed("8", "10", "2"));
    expect(cm.fields).toEqual({ w: "20.3", h: "25.4", m: "5.1" });
    expect(run([{ type: "unit", from: "cm", to: "in" }], cm).fields).toEqual({
      w: "8",
      h: "10",
      m: "2",
    });
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#requirement-switching-the-unit-converts-the-numbers-already-typed} */
  it("keeps text that is not a number", () => {
    const s = run([{ type: "unit", from: "in", to: "cm" }], typed("abc", "", "2"));
    expect(s.fields).toEqual({ w: "abc", h: "", m: "5.1" });
  });
});

describe("bad input", () => {
  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-empty-fields} */
  it("asks for both empty sizes", () => {
    expect(errors(typed("", ""))).toEqual({
      w: "Enter the print width.",
      h: "Enter the print height.",
    });
    expect(errors(typed("", "", "", "frame"))).toEqual({
      w: "Enter the frame width.",
      h: "Enter the frame height.",
      m: "Enter the mat border.",
    });
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-not-a-number-0-or-negative} */
  it("refuses abc, 0 and -10", () => {
    expect(errors(typed("abc", "10")).w).toBe("Use a number, like 8 or 8 1/2.");
    expect(errors(typed("abc", "25.4", "5.1"), "cm").w).toBe("Use a number, like 20.3.");
    expect(errors(typed("0", "10")).w).toBe("Enter a print width above 0 in.");
    expect(errors(typed("-10", "10")).w).toBe("Enter a print width above 0 in.");
    expect(errors(typed("-10", "25.4", "5.1"), "cm").w).toBe("Enter a print width above 0 cm.");
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-border-of-0} */
  it("refuses a border of 0", () => {
    expect(errors(typed("8", "10", "0"))).toEqual({
      m: "Enter a mat border above 0 in. With no mat, the frame is the print size.",
    });
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-border-no-wider-than-the-overlap} */
  it("refuses a border no wider than the overlap, in both units", () => {
    expect(errors(typed("8", "10", "0.1"))).toEqual({
      m: "Enter a mat border above ¼ in. A narrower one leaves the frame no bigger than the print.",
    });
    expect(errors(typed("20.3", "25.4", "0.2"), "cm")).toEqual({
      m: "Enter a mat border above 0.6 cm. A narrower one leaves the frame no bigger than the print.",
    });
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-print-too-small-for-the-mat} */
  it("marks a print side too small for the mat", () => {
    expect(errors(typed("1/2", "6"))).toEqual({
      w: "Enter a print width above ½ in. The mat covers ¼ in on each side.",
    });
    expect(errors(typed("6", "0.5"))).toEqual({
      h: "Enter a print height above ½ in. The mat covers ¼ in on each side.",
    });
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-border-too-wide-for-the-frame} */
  it("marks a border that leaves no opening in the frame", () => {
    expect(errors(typed("4", "6", "2", "frame"))).toEqual({
      m: "A 2 in border on each side leaves no opening in a frame 4 in wide. Pick a narrower border.",
    });
    expect(errors(typed("10.2", "15.2", "5.1", "frame"), "cm")).toEqual({
      m: "A 5.1 cm border on each side leaves no opening in a frame 10.2 cm wide. Pick a narrower border.",
    });
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-three-ways-to-type-8} */
  it("reads 8 1/2, 8.5 and 8½ alike", () => {
    for (const w of ["8 1/2", "8.5", "8½"])
      expect(answer(typed(w, "11")).frame).toEqual({ w: 12, h: 14.5 });
  });
});

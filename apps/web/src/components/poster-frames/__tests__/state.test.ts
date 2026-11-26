import { posterFrames } from "@framesizes/sizes";
import { describe, expect, it } from "vitest";

import { type Action, INITIAL, poster, reducer, type State } from "../state";

const run = (actions: Action[], start: State = INITIAL) => actions.reduce(reducer, start);
const typed = (w: string, h: string): State => ({ ...INITIAL, mode: "custom", fields: { w, h } });

describe("the initial state", () => {
  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-the-widget-in-the-server-html} */
  it("opens on the chips, 24x36, no mat, portrait, empty fields", () => {
    expect(INITIAL).toEqual({
      mode: "chips",
      poster: "24x36",
      mat: false,
      landscape: false,
      fields: { w: "", h: "" },
      pick: 0,
    });
    expect(poster(INITIAL, "in")).toEqual({
      size: { w: 24, h: 36 },
      name: "24x36",
      use: "Large posters",
      isA: false,
    });
  });
});

describe("the actions", () => {
  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-drawing-another-frame} */
  it("sets the pick back to 0 on every change but pick and unit", () => {
    const picked = run([{ type: "pick", i: 2 }]);
    expect(picked.pick).toBe(2);
    const resets: Action[] = [
      { type: "poster", id: "11x17" },
      { type: "mat", on: true },
      { type: "landscape", on: true },
      { type: "custom" },
      { type: "chips" },
      { type: "type", field: "w", text: "13" },
    ];
    for (const a of resets) expect(reducer(picked, a).pick).toBe(0);
    expect(reducer(picked, { type: "unit", from: "in", to: "cm" }).pick).toBe(2);
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-landscape} */
  it("sets the poster, the mat and the orientation", () => {
    const s = run([
      { type: "poster", id: "11x17" },
      { type: "mat", on: true },
      { type: "landscape", on: true },
    ]);
    expect(s).toMatchObject({ poster: "11x17", mat: true, landscape: true });
    expect(poster(s, "in")).toEqual({
      size: { w: 17, h: 11 },
      name: "17x11",
      use: "Small posters and flyers",
      isA: false,
    });
    const a2 = poster(
      run([
        { type: "poster", id: "A2" },
        { type: "landscape", on: true },
      ]),
      "in",
    );
    expect(a2).toMatchObject({ name: "A2", isA: true });
    if (!("size" in a2)) throw new Error("expected a size");
    expect(a2.size.w).toBeGreaterThan(a2.size.h);
  });
});

describe("back to standard sizes", () => {
  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-there-and-back} */
  it("keeps the chip and the typed size", () => {
    const s = run([
      { type: "poster", id: "18x24" },
      { type: "custom" },
      { type: "type", field: "w", text: "13" },
      { type: "type", field: "h", text: "19" },
      { type: "chips" },
    ]);
    expect(s.mode).toBe("chips");
    expect(poster(s, "in")).toMatchObject({ name: "18x24" });
    const again = reducer(s, { type: "custom" });
    expect(again.fields).toEqual({ w: "13", h: "19" });
  });
});

describe("the unit", () => {
  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-typed-size-converts} */
  it("converts 13 × 19 in to 33 × 48.3 cm and back", () => {
    const cm = reducer(typed("13", "19"), { type: "unit", from: "in", to: "cm" });
    expect(cm.fields).toEqual({ w: "33", h: "48.3" });
    const back = reducer(cm, { type: "unit", from: "cm", to: "in" });
    expect(back.fields).toEqual({ w: "13", h: "19" });
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-unit-switch-writes-every-number-in-the-visitors-unit} */
  it("leaves text that is not a length as it is", () => {
    const s = reducer(typed("abc", ""), { type: "unit", from: "in", to: "cm" });
    expect(s.fields).toEqual({ w: "abc", h: "" });
    expect(reducer(typed("0", "-3"), { type: "unit", from: "in", to: "cm" }).fields).toEqual({
      w: "0",
      h: "-3",
    });
  });
});

describe("a typed size", () => {
  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-empty-fields} */
  it("is empty, not wrong, with one or both fields empty", () => {
    expect(poster(typed("", ""), "in")).toEqual({ empty: true });
    expect(poster(typed("13", ""), "in")).toEqual({ empty: true });
    expect(poster(typed(" ", "19"), "in")).toEqual({ empty: true });
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-zero-a-letter-a-negative} */
  it("marks only the bad field", () => {
    expect(poster(typed("0", "19"), "in")).toEqual({ error: { w: true, h: false } });
    expect(poster(typed("13", "a"), "in")).toEqual({ error: { w: false, h: true } });
    expect(poster(typed("-13", "19"), "in")).toEqual({ error: { w: true, h: false } });
    expect(poster(typed("−13", "19"), "in")).toEqual({ error: { w: true, h: false } });
    expect(poster(typed("a", ""), "in")).toEqual({ error: { w: true, h: false } });
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-zero-a-letter-a-negative} */
  it("marks a number too big to be a length", () => {
    const huge = "9".repeat(400);
    expect(poster(typed(huge, "19"), "in")).toEqual({ error: { w: true, h: false } });
    expect(reducer(typed(huge, "19"), { type: "unit", from: "in", to: "cm" }).fields.w).toBe(huge);
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-three-ways-to-type-13} */
  it("reads 13 1/2, 13.5 and 13½ the same", () => {
    for (const w of ["13 1/2", "13.5", "13½", "13,5"])
      expect(poster(typed(w, "19"), "in")).toEqual({ size: { w: 13.5, h: 19 }, isA: false });
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-orientation-from-the-typed-size} */
  it("keeps the typed order, so 19 × 13 is landscape", () => {
    expect(poster(typed("19", "13"), "in")).toEqual({ size: { w: 19, h: 13 }, isA: false });
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-centimetres} */
  it("reads centimetres", () => {
    const p = poster(typed("40", "50"), "cm");
    if (!("size" in p)) throw new Error("expected a size");
    expect(p.size.w).toBeCloseTo(40 / 2.54, 9);
    expect(p.size.h).toBeCloseTo(50 / 2.54, 9);
  });
});

describe("a unit switch keeps the typed length", () => {
  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-switch-keeps-a-near-standard-answer} */
  it("still answers 16x20 for 16⅜ × 20 in after a switch to cm, until the width is retyped", () => {
    const frame = (s: State) => {
      const p = poster(s, "cm");
      if (!("size" in p)) throw new Error("expected a size");
      return posterFrames(p.size)?.bare;
    };
    const cm = reducer(typed("16 3/8", "20"), { type: "unit", from: "in", to: "cm" });
    expect(cm.fields.w).toBe("41.6");
    expect(frame(cm)).toMatchObject({ kind: "standard", frame: { id: "16x20" } });
    const retyped = reducer(cm, { type: "type", field: "w", text: "41.6" });
    expect(retyped).not.toHaveProperty("exact.w");
    const p = poster(retyped, "cm");
    expect("size" in p && p.size.w).toBeCloseTo(41.6 / 2.54, 9);
  });
});

import { placeBeside } from "@framesizes/sizes";
import { describe, expect, it } from "vitest";

import { frameSize } from "../copy";
import {
  type Action,
  boxOf,
  framesOf,
  initialState,
  MAX_FRAMES,
  placeOf,
  type PlannerState,
  type Print,
  reducer,
  sizesOf,
} from "../state";

/*
 * A print from a shop, added by the Chrome extension's "Add to my layout": a lettered frame of its
 * own size, framed or not, with no "Change size". The site never dispatches `addPrint`.
 */
const run = (actions: Action[], from: PlannerState = initialState()) =>
  actions.reduce(reducer, from);
const PRINT: Print = { w: 24, h: 36, label: "24 × 36 in", framed: false };
const CM_PRINT: Print = { w: 60 / 2.54, h: 90 / 2.54, label: "60 × 90 cm", framed: false };
const add = (print: Print, from: PlannerState = initialState()) =>
  reducer(from, { type: "addPrint", print });
const last = (state: PlannerState) => {
  const frame = framesOf(state).at(-1);
  if (!frame) throw new Error("no frames");
  return frame;
};

/** {@link openspec/specs/gallery-wall-planner/spec.md#requirement-a-print-from-a-shop-is-a-frame-of-its-own-size} */
describe("a print in the layout", () => {
  it("is the next lettered frame, placed beside the layout, and selected", () => {
    const before = initialState();
    const frames = framesOf(before);
    const { wall, furniture } = placeOf(before);
    const expected = placeBeside(
      { w: 24, h: 36 },
      boxOf(frames),
      [...frames.map((f) => f.rect), ...(furniture ? [furniture] : [])],
      wall,
    );
    const state = add(PRINT, before);
    const all = framesOf(state);
    expect(all.map((f) => f.letter)).toEqual(["A", "B", "C", "D", "E", "F"]);
    expect(all.slice(0, 5)).toEqual(frames);
    expect(last(state).rect).toEqual(expected);
    expect(last(state).print).toEqual(PRINT);
    expect(state.selected).toBe(last(state).id);
  });

  it("covers the wall at its own size, plus a 1 in moulding when framed", () => {
    const bare = last(add(PRINT)).rect;
    expect([bare.w, bare.h]).toEqual([24, 36]);
    const framed = last(add({ ...PRINT, framed: true })).rect;
    expect([framed.w, framed.h]).toEqual([26, 38]);
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-a-centimetre-print-in-the-layout} */
  it("names a centimetre print by its size as found", () => {
    const state = add(CM_PRINT);
    const f = last(state);
    expect(f.rect.w).toBeCloseTo(23.622, 3);
    expect(f.rect.h).toBeCloseTo(35.433, 3);
    expect(frameSize(f)).toBe("60 × 90 cm print");
    expect(frameSize({ size: "8x10" })).toBe("8×10");
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-size-list-with-a-print} */
  it("gets its own row in the size list, and the other rows stay", () => {
    const before = sizesOf(framesOf(initialState()));
    const state = add({ ...PRINT, framed: true });
    const rows = sizesOf(framesOf(state));
    const print = rows.find((r) => r.frames.some((f) => f.print));
    expect(print?.frames.map((f) => f.letter)).toEqual(["F"]);
    expect(rows.filter((r) => r !== print)).toEqual(before);
  });

  it("offers no size change, alone or with its group", () => {
    const state = add(PRINT);
    const id = last(state).id;
    expect(reducer(state, { type: "openPicker", mode: "size" })).toBe(state);
    expect(reducer(state, { type: "openGroupSize", size: last(state).size })).toBe(state);
    // Changing every 8x10 with "also the others" leaves the print as it is.
    const changed = run(
      [
        { type: "select", id: "t0" },
        { type: "openPicker", mode: "size" },
        { type: "pickerSize", size: "11x14" },
        { type: "applyPicker" },
      ],
      state,
    );
    expect(framesOf(changed).find((f) => f.id === id)?.print).toEqual(PRINT);
  });

  it("drags and sets distances like any added frame", () => {
    const state = add(PRINT);
    const f = last(state);
    const moved = reducer(state, { type: "nudge", id: f.id, dx: -2, dy: 1 });
    expect(last(moved).rect.x).toBeCloseTo(f.rect.x - 2, 9);
    expect(last(moved).rect.y).toBeCloseTo(f.rect.y + 1, 9);
  });

  it("is not added past twelve frames", () => {
    let state = initialState();
    while (framesOf(state).length < MAX_FRAMES) {
      state = add({ w: 4, h: 4, label: "4 × 4 in", framed: false }, state);
    }
    expect(framesOf(state)).toHaveLength(MAX_FRAMES);
    expect(add(PRINT, state)).toBe(state);
  });
});

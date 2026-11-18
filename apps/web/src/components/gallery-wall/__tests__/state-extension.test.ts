import { describe, expect, it } from "vitest";

import {
  type Action,
  distancesOf,
  framesOf,
  initialState,
  type PlannerState,
  reducer,
  sizesOf,
} from "../state";

/*
 * The planner's additions for the Chrome extension and the G1 backlog fixes that came with it:
 * the whole group's size list (BL-52), backing out of the upload (BL-48) and a saved photo put back.
 */
const run = (actions: Action[], from: PlannerState = initialState()) =>
  actions.reduce(reducer, from);
const sizes = (state: PlannerState) =>
  Object.fromEntries(framesOf(state).map((f) => [f.letter, f.size]));
const PHOTO = { url: "blob:test", width: 1200, height: 900 };
const ON_SOFA: Action[] = [
  { type: "upload" },
  { type: "photo", photo: PHOTO },
  { type: "known", known: "sofa" },
  { type: "toPlace" },
  { type: "placeNext" },
  { type: "setScale", unit: "in" },
];

describe("the whole group's size list", () => {
  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-changing-a-size-with-all-frames-selected} */
  it("lists the sizes largest first and changes every frame of one size", () => {
    const state = initialState();
    expect(state.selected).toBe("group");
    expect(
      sizesOf(framesOf(state)).map((s) => [s.size, s.frames.map((f) => f.letter).join("")]),
    ).toEqual([
      ["18x24", "C"],
      ["8x10", "ABDE"],
    ]);
    const opened = run([
      { type: "nudge", id: "t0", dx: -2, dy: 0 },
      { type: "select", id: "group" },
      { type: "openGroupSize", size: "8x10" },
    ]);
    expect(opened.picker).toMatchObject({ mode: "group-size", size: "8x10", from: "8x10" });
    const changed = run([{ type: "pickerSize", size: "11x14" }, { type: "applyPicker" }], opened);
    expect(sizes(changed)).toEqual({ A: "11x14", B: "11x14", C: "18x24", D: "11x14", E: "11x14" });
    expect(changed.moved).toEqual({});
    expect(changed.selected).toBe("group");
    expect(changed.picker).toBeNull();
  });

  it("opens no picker for a size the layout does not hold", () => {
    const state = initialState();
    expect(reducer(state, { type: "openGroupSize", size: "5x7" })).toBe(state);
  });
});

describe("backing out of the upload", () => {
  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-back-to-the-sample-room-before-picking-a-photo} */
  it("keeps the layout, moves and added frames with no photo picked", () => {
    const before = run([
      { type: "nudge", id: "t0", dx: -2, dy: 0 },
      { type: "openPicker", mode: "add" },
      { type: "applyPicker" },
    ]);
    const back = run([{ type: "upload" }, { type: "toSample" }], before);
    expect(back.mode).toBe("sample");
    expect(framesOf(back)).toEqual(framesOf(before));
    expect(framesOf(back)).toHaveLength(6);
    expect(back.confirmReset).toBe(false);
    expect(back.confirmSwitch).toBeNull();
  });
});

describe("a saved photo put back", () => {
  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-to-the-sample-room-and-back} */
  it("returns to the photo with the same scale, 8 in above the sofa", () => {
    const onPhoto = run(ON_SOFA);
    const sample = run([{ type: "nudge", id: "t0", dx: -3, dy: 0 }, { type: "toSample" }], onPhoto);
    expect(sample.mode).toBe("sample");
    const back = reducer(sample, {
      type: "restorePhoto",
      photo: { ...PHOTO, url: "blob:again" },
      known: onPhoto.known,
      marks: onPhoto.marks,
      floor: onPhoto.floor,
      scale: onPhoto.scale ?? 0,
    });
    expect(back.mode).toBe("photo");
    expect(back.photo?.url).toBe("blob:again");
    expect(back.scale).toBe(onPhoto.scale);
    expect(framesOf(back)).toEqual(framesOf(onPhoto));
    expect(distancesOf(back).below?.to).toEqual({ kind: "furniture" });
    expect(distancesOf(back).below?.value).toBeCloseTo(8);
  });
});

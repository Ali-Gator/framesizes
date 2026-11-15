import { describe, expect, it } from "vitest";

import {
  type Action,
  centreHeight,
  distancesOf,
  dragFrame,
  initialState,
  lengthField,
  markLength,
  markOf,
  previewRect,
  reducer,
  selectedFrame,
  type WallState,
} from "../state";

const run = (actions: Action[], from: WallState = initialState()) => actions.reduce(reducer, from);
const values = (state: WallState, id = state.selected ?? "") =>
  Object.fromEntries(
    Object.entries(distancesOf(state, id)).map(([side, d]) => [side, d?.value ?? null]),
  );

const PHOTO = { url: "blob:test", width: 1200, height: 900 };
/** The fixture photo with the scale set from the door (640 px = 80 in, so 8 px/in). */
const scaled = () =>
  run([
    { type: "photo", photo: PHOTO },
    { type: "toPlace" },
    { type: "placeNext" },
    { type: "setScale", unit: "in" },
  ]);

describe("the sample room", () => {
  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-default-state-in-the-server-html} */
  it("opens with the 16x20 selected and its four distances", () => {
    const state = initialState();
    expect(state.mode).toBe("sample");
    expect(selectedFrame(state)?.size).toBe("16x20");
    expect(values(state)).toEqual({ left: 63, right: 63, above: 32, below: 8 });
    const d = distancesOf(state, "f1");
    expect(d.below?.to).toEqual({ kind: "furniture", name: "sofa" });
    expect(d.above?.to.kind).toBe("edge");
    expect(centreHeight(state)).toBe(53);
  });
});

describe("setting a distance", () => {
  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-raising-the-sample-frame} */
  it("moves the frame to a typed distance", () => {
    const state = run([{ type: "distance", side: "below", text: "10", unit: "in" }]);
    expect(values(state)).toMatchObject({ below: 10, above: 30 });
    expect(state.revision).toBe(1);
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-a-fraction-is-typed} */
  it("takes a fraction", () => {
    expect(
      values(run([{ type: "distance", side: "below", text: "8 1/4", unit: "in" }])).below,
    ).toBe(8.25);
    expect(values(run([{ type: "distance", side: "below", text: "8¼", unit: "in" }])).below).toBe(
      8.25,
    );
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-more-button} */
  it("steps by the more and less buttons", () => {
    expect(values(run([{ type: "step", side: "below", direction: 1, unit: "in" }])).below).toBe(
      8.25,
    );
    expect(values(run([{ type: "step", side: "below", direction: -1, unit: "in" }])).below).toBe(
      7.75,
    );
    const cm = run([{ type: "step", side: "below", direction: 1, unit: "cm" }]);
    expect(Math.round((values(cm).below ?? 0) * 2.54)).toBe(21);
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-text-that-is-not-a-length} */
  it("leaves the frame in place for text that is not a length", () => {
    const state = initialState();
    expect(reducer(state, { type: "distance", side: "below", text: "abc", unit: "in" })).toBe(
      state,
    );
  });
});

describe("adding frames", () => {
  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-adding-an-11x14-in-the-sample-room} */
  it("places an 11x14 3 in right of the 16x20, centres level, and selects it", () => {
    const open = run([{ type: "openAdd" }, { type: "addSize", size: "11x14" }]);
    expect(previewRect(open)).toEqual({ x: 84, y: 45, w: 13, h: 16 });
    const added = reducer(open, { type: "add" });
    expect(added.frames).toHaveLength(2);
    expect(selectedFrame(added)).toMatchObject({ id: "f2", size: "11x14" });
    expect(values(added, "f1").right).toBe(3);
    expect(added.adding).toBeNull();
  });

  it("switches the picker's orientation", () => {
    const state = run([{ type: "openAdd" }, { type: "addOrientation", orientation: "landscape" }]);
    expect(state.adding).toEqual({ orientation: "landscape", size: "14x11" });
    expect(run([{ type: "addSize", size: "8x8" }], state).adding?.orientation).toBe("square");
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-seventh-frame} */
  it("holds six frames at most", () => {
    let state = initialState();
    for (let i = 0; i < 7; i++)
      state = run([{ type: "openAdd" }, { type: "addSize", size: "4x6" }, { type: "add" }], state);
    expect(state.frames).toHaveLength(6);
    expect(reducer(state, { type: "openAdd" }).adding).toBeNull();
  });
});

describe("moving and removing", () => {
  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-nudging-with-the-keyboard} */
  it("nudges a frame and keeps it selected", () => {
    const state = run([
      { type: "nudge", id: "f1", dx: 0, dy: 0.25 },
      { type: "nudge", id: "f1", dx: 0, dy: 0.25 },
    ]);
    expect(values(state).below).toBe(8.5);
    expect(state.selected).toBe("f1");
  });

  it("never nudges a frame off the wall", () => {
    const state = run([{ type: "nudge", id: "f1", dx: -500, dy: 500 }]);
    expect(selectedFrame(state)?.rect).toMatchObject({ x: 0, y: 74 });
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-removing-a-frame} */
  it("removes a frame and selects one that is left", () => {
    const two = run([{ type: "openAdd" }, { type: "add" }]);
    const state = reducer(two, { type: "remove", id: "f2" });
    expect(state.frames.map((f) => f.id)).toEqual(["f1"]);
    expect(state.selected).toBe("f1");
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-a-tap-selects} */
  it("selects a frame", () => {
    const two = run([{ type: "openAdd" }, { type: "add" }]);
    expect(reducer(two, { type: "select", id: "f1" }).selected).toBe("f1");
    expect(reducer(two, { type: "select", id: "nope" })).toBe(two);
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-a-drag-snaps-to-the-sofas-centre} */
  it("snaps a dragged frame's centre to the sofa's and keeps it on the wall", () => {
    const state = initialState();
    const from = selectedFrame(state)?.rect ?? { x: 0, y: 0, w: 0, h: 0 };
    const near = dragFrame(state, "f1", from, 0.6, 5);
    expect(near.rect.x).toBe(from.x);
    expect(near.lines.vertical).toEqual([72]);
    const off = dragFrame(state, "f1", from, -1000, 0);
    expect(off.rect.x).toBe(0);
  });
});

describe("the photo flow", () => {
  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-door-by-default} */
  it("opens step 1 with the door and no frames", () => {
    const state = run([{ type: "upload" }, { type: "photo", photo: PHOTO }]);
    expect(state).toMatchObject({ mode: "pick", known: "door", frames: [], scale: null });
    expect(markLength(markOf(state, PHOTO))).toBe(640);
    expect(reducer(state, { type: "back" }).mode).toBe("upload");
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-moving-a-handle-by-keyboard} */
  it("moves a handle and keeps it on the photo", () => {
    const state = run([{ type: "photo", photo: PHOTO }, { type: "toPlace" }]);
    const [a] = markOf(state, PHOTO);
    const moved = reducer(state, { type: "handle", end: 0, point: { x: a.x + 10, y: a.y } });
    expect(markOf(moved, PHOTO)[0]).toEqual({ x: a.x + 10, y: a.y });
    const out = reducer(state, { type: "handle", end: 1, point: { x: -5, y: 2000 } });
    expect(markOf(out, PHOTO)[1]).toEqual({ x: 0, y: 900 });
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-doors-default-in-centimetres} */
  it("starts the door at its default in the visitor's unit, and the typed value wins", () => {
    const state = run([
      { type: "photo", photo: PHOTO },
      { type: "toPlace" },
      { type: "placeNext" },
    ]);
    expect(state.mode).toBe("confirm");
    expect(lengthField(state, "cm")).toBe("200");
    expect(lengthField(state, "in")).toBe("80");
    const typed = run(
      [
        { type: "lengthText", text: "84" },
        { type: "setScale", unit: "in" },
      ],
      state,
    );
    expect(typed.scale).toBeCloseTo(640 / 84);
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-wall-has-no-default} */
  it("does not set the scale from an empty wall width", () => {
    const state = run([
      { type: "photo", photo: PHOTO },
      { type: "known", known: "wall" },
      { type: "toPlace" },
      { type: "placeNext" },
      { type: "setScale", unit: "in" },
    ]);
    expect(state).toMatchObject({ mode: "confirm", scale: null, lengthError: true });
    expect(lengthField(state, "in")).toBe("");
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-a-fixed-length} */
  it("sets the scale from a fixed length with no field", () => {
    const state = run([
      { type: "photo", photo: PHOTO },
      { type: "known", known: "a4" },
      { type: "toPlace" },
      { type: "placeNext" },
      { type: "setScale", unit: "cm" },
    ]);
    expect(lengthField(state, "cm")).toBe("");
    expect(state.mode).toBe("photo");
    expect(state.scale).toBeCloseTo(95 / (297 / 25.4));
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-a-credit-card-on-a-wide-photo} */
  it("warns about a short mark, then goes on or back", () => {
    const short = run([
      { type: "photo", photo: PHOTO },
      { type: "known", known: "card" },
      { type: "toPlace" },
      { type: "placeNext" },
    ]);
    expect(short.mode).toBe("short");
    expect(markLength(markOf(short, PHOTO))).toBe(27);
    expect(reducer(short, { type: "useAnyway" }).mode).toBe("confirm");
    expect(reducer(short, { type: "back" }).mode).toBe("pick");
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-distances-before-and-after-the-floor} */
  it("runs Below to the floor only once the floor is marked", () => {
    const state = scaled();
    expect(state).toMatchObject({ mode: "photo", frames: [{ size: "16x20" }] });
    expect(values(state).below).toBeNull();
    expect(centreHeight(state)).toBeNull();
    const floor = reducer(state, { type: "markFloor" });
    expect(floor.floor).toBe(820);
    expect(values(floor).below).toBeCloseTo(56.25 - 11 - 10);
    expect(distancesOf(floor, floor.selected ?? "").below?.to).toEqual({
      kind: "edge",
      name: "floor",
    });
    expect(centreHeight(floor)).toBeCloseTo(46.25);
  });

  it("makes a marked sofa furniture on the photo", () => {
    const state = run([
      { type: "photo", photo: PHOTO },
      { type: "known", known: "sofa" },
      { type: "toPlace" },
      { type: "placeNext" },
      { type: "setScale", unit: "in" },
    ]);
    expect(state.scale).toBe(8);
    const below = distancesOf(state, state.selected ?? "").below;
    expect(below?.to).toEqual({ kind: "furniture", name: "sofa" });
  });
});

describe("start over", () => {
  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-cancel-keeps-everything} */
  it("changes nothing on Cancel", () => {
    const state = scaled();
    const back = run([{ type: "openReset" }, { type: "cancelReset" }], state);
    expect(back).toEqual(state);
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#requirement-start-over-asks-first} */
  it("starts over with the photo, or goes back to the sample room", () => {
    const state = reducer(scaled(), { type: "openReset" });
    expect(state.confirmReset).toBe(true);
    const again = reducer(state, { type: "restartPhoto" });
    expect(again).toMatchObject({
      mode: "pick",
      photo: PHOTO,
      frames: [],
      scale: null,
      confirmReset: false,
    });
    const sample = reducer(state, { type: "toSample" });
    expect(sample).toMatchObject({ mode: "sample", photo: null, confirmReset: false });
    expect(values(sample)).toEqual(values(initialState()));
  });
});

describe("the photo's wall", () => {
  /** {@link openspec/specs/frames-on-wall/spec.md#requirement-frames-are-dragged-and-snap} */
  it("keeps frames between the marked wall corners", () => {
    const state = run([
      { type: "photo", photo: PHOTO },
      { type: "known", known: "wall" },
      { type: "toPlace" },
      { type: "handle", end: 0, point: { x: 100, y: 300 } },
      { type: "handle", end: 1, point: { x: 1100, y: 300 } },
      { type: "placeNext" },
      { type: "lengthText", text: "125" },
      { type: "setScale", unit: "in" },
    ]);
    expect(state.scale).toBe(8);
    const id = state.selected ?? "";
    const moved = run([{ type: "nudge", id, dx: -500, dy: 0 }], state);
    expect(selectedFrame(moved)?.rect.x).toBe(12.5);
    expect(values(moved).left).toBe(0);
    const from = selectedFrame(state)?.rect ?? { x: 0, y: 0, w: 0, h: 0 };
    expect(dragFrame(state, id, from, 500, 0).rect.x).toBe(137.5 - from.w);
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#requirement-the-floor-line-is-optional} */
  it("lifts a frame the floor line passes", () => {
    const state = run([{ type: "markFloor" }, { type: "floor", y: 400 }], scaled());
    const frame = selectedFrame(state);
    expect(frame?.rect.y).toBeCloseTo((900 - 400) / 8);
    expect(values(state).below).toBe(0);
  });
});

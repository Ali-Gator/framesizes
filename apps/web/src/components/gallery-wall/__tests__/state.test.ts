import { DEMO_ROOM, TEMPLATES } from "@framesizes/sizes";
import { describe, expect, it } from "vitest";

import {
  type Action,
  distancesOf,
  dragFrame,
  formHanger,
  framesOf,
  initialState,
  leaves,
  MAX_FRAMES,
  measureOf,
  type PlannerState,
  reducer,
  templateTable,
  warningOf,
} from "../state";
import { TEMPLATE_FRAMES } from "../copy";

const run = (actions: Action[], from: PlannerState = initialState()) =>
  actions.reduce(reducer, from);
const values = (state: PlannerState) =>
  Object.fromEntries(
    Object.entries(distancesOf(state)).map(([side, d]) => [side, d?.value ?? null]),
  );
const sizes = (state: PlannerState) =>
  Object.fromEntries(framesOf(state).map((f) => [f.letter, f.size]));
/** A nail's row as the table reads it: number, frame letter, right, down, up from floor. */
const nailRows = (state: PlannerState) => {
  const frames = framesOf(state);
  return (measureOf(state, frames)?.nails ?? []).map((n, i) => [
    i + 1,
    frames[n.frame]?.letter,
    n.across,
    n.down,
    n.floor,
  ]);
};
const ONE_NAIL_2: Action[] = [
  { type: "hangerType", kind: "one" },
  { type: "hangerField", field: "drop", text: "2", unit: "in" },
];

describe("opening", () => {
  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-planners-default-state-in-the-server-html} */
  it("lays out One big, two on each side 8 in above the sofa with the group selected", () => {
    const state = initialState();
    expect(state.view).toBe("layout");
    expect(state.selected).toBe("group");
    expect(framesOf(state).map((f) => f.letter)).toEqual(["A", "B", "C", "D", "E"]);
    expect(sizes(state)).toEqual({ A: "8x10", B: "8x10", C: "18x24", D: "8x10", E: "8x10" });
    const m = measureOf(state);
    expect(m).toMatchObject({ width: 46, height: 27, aboveFloor: 69, left: 49, right: 49 });
    expect(values(state)).toEqual({ left: 49, right: 49, above: 27, below: 8 });
    expect(distancesOf(state).below?.to).toEqual({ kind: "furniture" });
    expect(warningOf(state)).toBeNull();
  });
});

describe("templates", () => {
  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-switching-with-nothing-changed} */
  it("switches at once when nothing changed", () => {
    const state = run([{ type: "template", id: "grid-of-nine" }]);
    expect(state.confirmSwitch).toBeNull();
    const frames = framesOf(state);
    expect(frames.map((f) => f.letter).join("")).toBe("ABCDEFGHI");
    expect(Math.min(...frames.map((f) => f.rect.y))).toBeCloseTo(
      DEMO_ROOM.sofa.y + DEMO_ROOM.sofa.h + 8,
    );
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-switching-after-a-change-asks-first} */
  it("asks first after a change, and Cancel keeps the frames", () => {
    const moved = run([{ type: "nudge", id: "t0", dx: -2, dy: 0 }]);
    const asked = reducer(moved, { type: "template", id: "row-of-three" });
    expect(asked.confirmSwitch).toBe("row-of-three");
    expect(asked.template).toBe("one-big-two-each-side");
    const kept = reducer(asked, { type: "cancelSwitch" });
    expect(kept.confirmSwitch).toBeNull();
    expect(framesOf(kept)).toEqual(framesOf(moved));
    const switched = reducer(asked, { type: "confirmSwitch" });
    expect(switched.template).toBe("row-of-three");
    expect(framesOf(switched)).toHaveLength(3);
    expect(switched.moved).toEqual({});
  });

  it("keeps the gap and All frames' hanger", () => {
    const state = run([
      { type: "gapText", text: "2", unit: "in" },
      ...ONE_NAIL_2,
      { type: "template", id: "row-of-three" },
    ]);
    expect(state.gap).toBe(2);
    expect(state.hangers.all).toEqual({ kind: "one", drop: 2 });
  });
});

describe("the gap", () => {
  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-a-2-inch-gap-in-the-planner} */
  it("spaces Row of three 2 in apart", () => {
    const state = run([
      { type: "template", id: "row-of-three" },
      { type: "gapText", text: "2", unit: "in" },
    ]);
    expect(framesOf(state).map((f) => f.rect.x)).toEqual([50.5, 65.5, 80.5]);
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-a-gap-out-of-range} */
  it.each(["13", "-1", "wide"])("keeps the gap for %s and flags the field", (text) => {
    const state = run([{ type: "gapText", text, unit: "in" }]);
    expect(state.gap).toBe(3);
    expect(state.gapError).toBe(true);
  });

  it("steps by ¼ in or 1 cm and stays in range", () => {
    expect(run([{ type: "gapStep", direction: 1, unit: "in" }]).gap).toBe(3.25);
    expect(run([{ type: "gapStep", direction: 1, unit: "cm" }]).gap).toBeCloseTo(9 / 2.54);
    expect(
      run([
        { type: "gapText", text: "0", unit: "in" },
        { type: "gapStep", direction: -1, unit: "in" },
      ]).gap,
    ).toBe(0);
  });

  it("lines the frames up again, dropping hand moves", () => {
    const moved = run([{ type: "nudge", id: "t0", dx: -2, dy: 0 }]);
    expect(moved.moved).not.toEqual({});
    const state = reducer(moved, { type: "gapText", text: "2", unit: "in" });
    expect(state.moved).toEqual({});
    expect(framesOf(state)).toEqual(framesOf(run([{ type: "gapText", text: "2", unit: "in" }])));
  });
});

describe("sizes", () => {
  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-changing-every-8x10-at-once} */
  it("changes every 8x10 with the option on", () => {
    const state = run([
      { type: "select", id: "t0" },
      { type: "openPicker", mode: "size" },
      { type: "pickerSize", size: "5x7" },
      { type: "applyPicker" },
    ]);
    expect(sizes(state)).toEqual({ A: "5x7", B: "5x7", C: "18x24", D: "5x7", E: "5x7" });
    expect(measureOf(state)?.width).toBe(2 * 7 + 20 + 2 * 3);
  });

  it("changes one frame with the option off", () => {
    const state = run([
      { type: "select", id: "t0" },
      { type: "openPicker", mode: "size" },
      { type: "pickerSize", size: "5x7" },
      { type: "pickerAll", all: false },
      { type: "applyPicker" },
    ]);
    expect(sizes(state)).toEqual({ A: "5x7", B: "8x10", C: "18x24", D: "8x10", E: "8x10" });
  });
});

describe("moving", () => {
  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-hanging-the-group-higher} */
  it("sets the group 10 in above the sofa", () => {
    const before = framesOf(initialState());
    const state = run([{ type: "distance", side: "below", text: "10", unit: "in" }]);
    framesOf(state).forEach((f, i) => expect(f.rect.y).toBe((before[i]?.rect.y ?? 0) + 2));
    expect(measureOf(state)?.aboveFloor).toBe(71);
  });

  it("shows a frame's distances to its neighbours and moves only that frame", () => {
    const state = run([{ type: "select", id: "t0" }]);
    const d = distancesOf(state);
    expect(d.right).toEqual({ value: 3, to: { kind: "frame", letter: "C" } });
    const moved = reducer(state, { type: "distance", side: "right", text: "4", unit: "in" });
    expect(framesOf(moved)[0]?.rect.x).toBe(48);
    expect(framesOf(moved)[2]).toEqual(framesOf(state)[2]);
  });

  it("drags a frame with the wall, snapping inside it", () => {
    const state = initialState();
    const frame = framesOf(state)[0];
    if (!frame) throw new Error("no frame");
    const { rect } = dragFrame(state, frame.id, frame.rect, -200, 0);
    expect(rect.x).toBe(0);
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-past-the-right-edge} */
  it("flags the group 3 in past the right edge and centres it", () => {
    const state = run([{ type: "moveGroup", dx: 52, dy: 0 }]);
    expect(warningOf(state)).toEqual({ kind: "right", by: 3 });
    expect(measureOf(state)?.right).toBe(-3);
    const centred = reducer(state, { type: "centre" });
    expect(measureOf(centred)).toMatchObject({ left: 49, right: 49 });
    expect(warningOf(centred)).toBeNull();
  });

  it("flags the group past the ceiling", () => {
    const state = run([{ type: "moveGroup", dx: 0, dy: 30 }]);
    expect(warningOf(state)).toEqual({ kind: "ceiling", by: 3 });
  });
});

describe("adding", () => {
  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-twelfth-frame} */
  it("adds up to 12 frames", () => {
    const add: Action[] = [{ type: "openPicker", mode: "add" }, { type: "applyPicker" }];
    let state = run([{ type: "template", id: "grid-of-nine" }, ...add, ...add, ...add]);
    expect(framesOf(state)).toHaveLength(MAX_FRAMES);
    expect(framesOf(state).at(-1)?.letter).toBe("L");
    state = run(add, state);
    expect(framesOf(state)).toHaveLength(MAX_FRAMES);
    expect(state.picker).toBeNull();
  });
});

describe("hangers", () => {
  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-no-drop-yet} */
  it("starts with no drop and no nails", () => {
    const state = initialState();
    expect(formHanger(state)).toEqual({ kind: "one", drop: null });
    expect(measureOf(state)?.nails).toEqual([]);
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-one-nail-with-a-2-inch-drop} */
  it("numbers the nails once All frames get a 2 in drop", () => {
    const state = run(ONE_NAIL_2);
    expect(nailRows(state).map((r) => `${r[0]} ${r[1]}`)).toEqual([
      "1 A",
      "2 C",
      "3 D",
      "4 B",
      "5 E",
    ]);
    expect(nailRows(state)[1]).toEqual([2, "C", 23, 2.5, 66.5]);
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-a-drop-longer-than-the-frame} */
  it("gives frame B its own 13 in drop and no nail", () => {
    const state = run([
      ...ONE_NAIL_2,
      { type: "hangerFor", for: "t1" },
      { type: "hangerField", field: "drop", text: "13", unit: "in" },
    ]);
    expect(nailRows(state).map((r) => r[1])).toEqual(["A", "C", "D", "E"]);
    expect(measureOf(state)?.missing).toEqual([{ frame: 1, reason: "drop-out-of-range" }]);
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-next-frame-starts-on-d-rings} */
  it("carries the type over, not the drop or inset", () => {
    const before = run(ONE_NAIL_2);
    const state = run(
      [
        { type: "hangerFor", for: "t2" },
        { type: "hangerType", kind: "two" },
        { type: "hangerField", field: "drop", text: "3", unit: "in" },
        { type: "hangerField", field: "inset", text: "4", unit: "in" },
        { type: "hangerFor", for: "t3" },
      ],
      before,
    );
    expect(state.hangers.byFrame.t2).toEqual({ kind: "two", drop: 3, inset: 4 });
    expect(formHanger(state)).toEqual({ kind: "two", drop: null, inset: null });
    expect(state.hangers.byFrame.t3).toBeUndefined();
    const d = (s: PlannerState) => measureOf(s)?.nails.filter((n) => n.frame === 3);
    expect(d(state)).toEqual(d(before));
  });

  it("starts a frame added later on the last type", () => {
    const state = run([
      { type: "hangerType", kind: "two" },
      { type: "openPicker", mode: "add" },
      { type: "applyPicker" },
    ]);
    const added = state.selected;
    const opened = reducer(state, { type: "hangerFor", for: added });
    expect(formHanger(opened)).toEqual({ kind: "two", drop: null, inset: null });
  });

  it("types drops in centimetres, stored in inches", () => {
    const state = run([{ type: "hangerField", field: "drop", text: "5.1", unit: "cm" }]);
    expect(state.hangers.all.drop).toBeCloseTo(5.1 / 2.54);
  });

  it("returns a frame to All frames' hanger", () => {
    const state = run([
      ...ONE_NAIL_2,
      { type: "hangerFor", for: "t1" },
      { type: "hangerField", field: "drop", text: "13", unit: "in" },
      { type: "sameAsAll" },
    ]);
    expect(state.hangers.byFrame).toEqual({});
    expect(nailRows(state)).toHaveLength(5);
  });
});

describe("the photo", () => {
  const PHOTO = { url: "blob:test", width: 1200, height: 900 };
  const toConfirm: Action[] = [
    { type: "upload" },
    { type: "photo", photo: PHOTO },
    { type: "toPlace" },
    { type: "placeNext" },
  ];

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-a-photo-scaled-from-the-sofa} */
  it("hangs the template 8 in above a marked sofa", () => {
    const state = run([
      { type: "upload" },
      { type: "photo", photo: PHOTO },
      { type: "known", known: "sofa" },
      { type: "toPlace" },
      { type: "placeNext" },
      { type: "setScale", unit: "in" },
    ]);
    expect(state.mode).toBe("photo");
    const below = distancesOf(state).below;
    expect(below?.to).toEqual({ kind: "furniture" });
    expect(below?.value).toBeCloseTo(8);
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-wider-than-the-wall} */
  it("says by how much a group is wider than a 38 in wall", () => {
    const state = run([
      { type: "upload" },
      { type: "photo", photo: PHOTO },
      { type: "known", known: "wall" },
      { type: "toPlace" },
      { type: "placeNext" },
      { type: "lengthText", text: "38" },
      { type: "setScale", unit: "in" },
    ]);
    const w = warningOf(state);
    expect(w?.kind).toBe("wide");
    expect(w && "by" in w ? w.by : 0).toBeCloseTo(8);
  });

  it("warns past the photo's border when no side edge is marked", () => {
    const state = run([
      ...toConfirm,
      { type: "setScale", unit: "in" },
      { type: "moveGroup", dx: 500, dy: 0 },
    ]);
    expect(warningOf(state)).toEqual({ kind: "photo" });
  });

  it("goes back to the sample room with the layout reset", () => {
    const state = run([...toConfirm, { type: "setScale", unit: "in" }, { type: "toSample" }]);
    expect(state.mode).toBe("sample");
    expect(framesOf(state)).toEqual(framesOf(initialState()));
  });
});

describe("the template table", () => {
  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-template-table-in-the-server-html} */
  it("lists the five templates' sizes and the furniture each suits", () => {
    const rows = templateTable().map((r) => [r.name, r.w, r.h, Math.round(r.fits)]);
    expect(rows).toEqual([
      ["Row of three", 45, 16, 68],
      ["Grid of four", 29, 35, 44],
      ["Grid of nine", 36, 42, 54],
      ["One big, two on each side", 46, 27, 69],
      ["Two rows", 50, 35, 75],
    ]);
  });
});

describe("review fixes", () => {
  /** {@link openspec/specs/gallery-wall-planner/spec.md#requirement-one-gap-spaces-every-frame} */
  it("keeps hand moves when a gap step changes nothing", () => {
    const state = run([
      { type: "gapText", text: "12", unit: "in" },
      { type: "nudge", id: "t0", dx: -1, dy: 0 },
      { type: "gapStep", direction: 1, unit: "in" },
    ]);
    expect(state.gap).toBe(12);
    expect(state.moved).not.toEqual({});
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#requirement-the-hanger-type-carries-over-to-the-next-frame} */
  it("drops an added frame's hanger when the layout starts again on the sample wall", () => {
    const added = run([{ type: "openPicker", mode: "add" }, { type: "applyPicker" }]);
    const id = added.selected;
    const state = run(
      [
        { type: "hangerFor", for: id },
        { type: "hangerField", field: "drop", text: "2", unit: "in" },
        { type: "upload" },
        { type: "toSample" },
      ],
      added,
    );
    expect(state.hangerFor).toBe("all");
    expect(state.hangers.byFrame).toEqual({});
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#requirement-a-group-past-the-walls-edge-is-flagged} */
  it("flags a group moved below the floor", () => {
    const state = run([{ type: "moveGroup", dx: 0, dy: -60 }]);
    expect(warningOf(state)?.kind).toBe("floor");
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#requirement-a-group-past-the-walls-edge-is-flagged} */
  it("flags a group past the photo's bottom border", () => {
    const PHOTO = { url: "blob:test", width: 1200, height: 900 };
    const state = run([
      { type: "upload" },
      { type: "photo", photo: PHOTO },
      { type: "toPlace" },
      { type: "placeNext" },
      { type: "setScale", unit: "in" },
      { type: "moveGroup", dx: 0, dy: -500 },
    ]);
    expect(warningOf(state)).toEqual({ kind: "photo" });
  });

  it("lists each template's frames as many as the engine lays out", () => {
    for (const t of TEMPLATES) {
      const text = TEMPLATE_FRAMES[t.id] ?? "";
      const total = text
        .split(/[,+]/)
        .map((part) => Number(/^\s*(\d+) ×/.exec(part)?.[1] ?? 1))
        .reduce((a, b) => a + b, 0);
      expect(total, t.id).toBe(leaves(t.stack).length);
    }
  });
});

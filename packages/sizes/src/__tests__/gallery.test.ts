import { describe, expect, it } from "vitest";

import { findFrame } from "../frames";
import {
  GALLERY_GAP,
  TEMPLATES,
  centreGroup,
  groupDistances,
  hangerProblem,
  layoutTemplate,
  measureGroup,
  nailMarks,
  setGroupDistance,
  type Hanger,
  type Stack,
} from "../gallery";
import type { Rect } from "../scene";
import { DEMO_ROOM, type Wall } from "../wall";

const NO_EDGES = { left: null, right: null, top: null, bottom: null };
const template = (id: string): Stack => {
  const found = TEMPLATES.find((t) => t.id === id);
  if (!found) throw new Error(`no template ${id}`);
  return found.stack;
};
const ids = (stack: Stack): string[] =>
  stack.items.flatMap((i) => (typeof i === "string" ? [i] : ids(i)));
const at = (r: Rect) => [r.x, r.y];

const { wall: room, sofa } = DEMO_ROOM;
const laidOut = (id: string, wall: Wall, furniture: Rect | null, gap = GALLERY_GAP) => {
  const laid = layoutTemplate(template(id), gap, wall, furniture);
  if (!laid) throw new Error(`no layout for ${id}`);
  return laid;
};
const aboveSofa = (id: string, gap = GALLERY_GAP) => laidOut(id, room, sofa, gap);
const one = (drop: number | null): Hanger => ({ kind: "one", drop });
/** Every frame on one hanger with a 2 in drop, except those `except` names by index. */
const onOne = (rects: readonly Rect[], except: Record<number, Hanger> = {}) =>
  rects.map((rect, i) => ({ rect, hanger: except[i] ?? one(2) }));
/** A 120 × 80 in photo with no edge marked. */
const PHOTO: Wall = { bounds: { x: 0, y: 0, w: 120, h: 80 }, edges: NO_EDGES };

describe("templates", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-five-templates} */
  it("lists the five templates in order", () => {
    expect(TEMPLATES.map((t) => [t.name, ids(t.stack)])).toEqual([
      ["Row of three", ["11x14", "11x14", "11x14"]],
      ["Grid of four", ["11x14", "11x14", "11x14", "11x14"]],
      ["Grid of nine", Array(9).fill("8x10")],
      ["One big, two on each side", ["8x10", "8x10", "18x24", "8x10", "8x10"]],
      ["Two rows", ["11x14", "16x20", "11x14", "10x8", "10x8", "10x8"]],
    ]);
    expect(template("grid-of-four")).toEqual({
      dir: "column",
      items: [
        { dir: "row", items: ["11x14", "11x14"] },
        { dir: "row", items: ["11x14", "11x14"] },
      ],
    });
    expect(template("one-big-two-each-side")).toEqual({
      dir: "row",
      items: [
        { dir: "column", items: ["8x10", "8x10"] },
        "18x24",
        { dir: "column", items: ["8x10", "8x10"] },
      ],
    });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-every-template-frame-is-in-the-catalog} */
  it("uses only catalog sizes", () => {
    for (const t of TEMPLATES) for (const id of ids(t.stack)) expect(findFrame(id)?.id).toBe(id);
  });
});

describe("laying out a template", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-row-of-three-above-the-demo-sofa} */
  it("lays the row of three above the demo sofa", () => {
    const { frames } = aboveSofa("row-of-three");
    expect(frames.map((f) => f.id)).toEqual(["11x14", "11x14", "11x14"]);
    expect(frames.map((f) => f.rect)).toEqual([
      { x: 49.5, y: 42, w: 13, h: 16 },
      { x: 65.5, y: 42, w: 13, h: 16 },
      { x: 81.5, y: 42, w: 13, h: 16 },
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-narrower-gap} */
  it("takes a narrower gap", () => {
    expect(aboveSofa("row-of-three", 2).frames.map((f) => at(f.rect))).toEqual([
      [50.5, 42],
      [65.5, 42],
      [80.5, 42],
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-big-frame-centred-between-two-stacks} */
  it("centres a big frame between two stacks", () => {
    const { frames, box } = aboveSofa("one-big-two-each-side");
    expect(box).toEqual({ x: 49, y: 42, w: 46, h: 27 });
    expect(frames.map((f) => at(f.rect))).toEqual([
      [49, 57],
      [49, 42],
      [62, 42.5],
      [85, 57],
      [85, 42],
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-layout-that-cannot-be-made} */
  it("gives no layout for a bad gap, an unknown size or an empty row", () => {
    const row = template("row-of-three");
    expect(layoutTemplate(row, -1, room, sofa)).toBeNull();
    expect(layoutTemplate(row, Number.NaN, room, sofa)).toBeNull();
    expect(layoutTemplate({ dir: "row", items: ["11x14", "7x99"] }, 3, room, sofa)).toBeNull();
    const empty: Stack = { dir: "column", items: ["11x14", { dir: "row", items: [] }] };
    expect(layoutTemplate(empty, 3, room, sofa)).toBeNull();
  });
});

describe("where a group hangs", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-centred-on-the-57-inch-line} */
  it("centres on the 57 in line with the floor known", () => {
    const wall: Wall = {
      bounds: { x: 0, y: 0, w: 144, h: 96 },
      edges: { left: 0, right: 144, top: 96, bottom: 0 },
    };
    const { box, frames } = laidOut("grid-of-nine", wall, null);
    expect(box).toEqual({ x: 54, y: 36, w: 36, h: 42 });
    expect(frames[0]?.rect).toMatchObject({ x: 54, y: 66 });
    expect(frames[8]?.rect).toMatchObject({ x: 80, y: 36 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-photo-with-no-floor} */
  it("centres in the middle of a photo with no floor", () => {
    const laid = layoutTemplate(template("grid-of-four"), GALLERY_GAP, PHOTO, null);
    expect(laid?.frames.map((f) => at(f.rect))).toEqual([
      [45.5, 41.5],
      [61.5, 41.5],
      [45.5, 22.5],
      [61.5, 22.5],
    ]);
  });
});

describe("nail marks", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-one-nail} */
  it("puts one nail at the centre, its drop below the top", () => {
    expect(nailMarks({ x: 49.5, y: 42, w: 13, h: 16 }, one(2))).toEqual([
      { ring: null, point: { x: 56, y: 56 } },
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-two-d-rings} */
  it("puts two nails an inset in from each side", () => {
    const rect = { x: 62, y: 42.5, w: 20, h: 26 };
    expect(nailMarks(rect, { kind: "two", drop: 3, inset: 4 })).toEqual([
      { ring: "left", point: { x: 66, y: 65.5 } },
      { ring: "right", point: { x: 78, y: 65.5 } },
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-hanger-that-gives-no-nail} */
  it("gives no nail, with a reason, for a bad hanger", () => {
    const rect = { x: 0, y: 0, w: 20, h: 26 };
    const two = (drop: number | null, inset: number | null): Hanger => ({
      kind: "two",
      drop,
      inset,
    });
    expect(hangerProblem(rect, one(null))).toBe("no-drop");
    expect(hangerProblem(rect, one(-1))).toBe("drop-out-of-range");
    expect(hangerProblem(rect, one(26))).toBe("drop-out-of-range");
    expect(hangerProblem(rect, two(3, null))).toBe("no-inset");
    expect(hangerProblem(rect, two(3, 0))).toBe("inset-out-of-range");
    expect(hangerProblem(rect, two(3, 10))).toBe("inset-out-of-range");
    expect(nailMarks(rect, two(3, 10))).toEqual([]);
    expect(hangerProblem(rect, one(0))).toBeNull();
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-frame-with-no-nail} */
  it("lists a frame that gets no nail", () => {
    const rects = aboveSofa("one-big-two-each-side").frames.map((f) => f.rect);
    const m = measureGroup(onOne(rects, { 1: one(13) }), room);
    expect(m?.nails.map((n) => n.frame).sort()).toEqual([0, 2, 3, 4]);
    expect(m?.missing).toEqual([{ frame: 1, reason: "drop-out-of-range" }]);
  });
});

describe("measuring a group", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-row-of-three-in-the-demo-room} */
  it("measures the row of three in the demo room", () => {
    const m = measureGroup(onOne(aboveSofa("row-of-three").frames.map((f) => f.rect)), room);
    expect(m).toEqual({
      width: 45,
      height: 16,
      aboveFloor: 58,
      toCeiling: 38,
      left: 49.5,
      right: 49.5,
      nails: [
        { frame: 0, ring: null, across: 6.5, down: 2, floor: 56 },
        { frame: 1, ring: null, across: 22.5, down: 2, floor: 56 },
        { frame: 2, ring: null, across: 38.5, down: 2, floor: 56 },
      ],
      missing: [],
    });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-group-on-a-photo-with-no-edge-marked} */
  it("measures a group on a photo with no edge marked", () => {
    const laid = laidOut("grid-of-four", PHOTO, null);
    const m = measureGroup(onOne(laid.frames.map((f) => f.rect)), PHOTO);
    expect(m).toMatchObject({
      width: 29,
      height: 35,
      aboveFloor: null,
      toCeiling: null,
      left: null,
      right: null,
    });
    expect(m?.nails.map((n) => [n.across, n.down, n.floor])).toEqual([
      [6.5, 2, null],
      [22.5, 2, null],
      [6.5, 21, null],
      [22.5, 21, null],
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-one-frame-on-its-own-d-rings} */
  it("names each nail's frame and ring", () => {
    const rects = aboveSofa("one-big-two-each-side").frames.map((f) => f.rect);
    const items = onOne(rects, { 2: { kind: "two", drop: 3, inset: 4 } });
    const nails = measureGroup(items, room)?.nails ?? [];
    expect(nails.map((n) => [n.frame, n.ring, n.across])).toEqual([
      [0, null, 5],
      [2, "left", 17],
      [2, "right", 29],
      [3, null, 41],
      [1, null, 5],
      [4, null, 41],
    ]);
    expect(nails.filter((n) => n.frame === 2).map((n) => [n.down, n.floor])).toEqual([
      [3.5, 65.5],
      [3.5, 65.5],
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-nails-a-little-lower-join-the-row} */
  it("lists nails a little lower in the same row", () => {
    const m = measureGroup(
      onOne(aboveSofa("one-big-two-each-side").frames.map((f) => f.rect)),
      room,
    );
    expect(m).toMatchObject({
      width: 46,
      height: 27,
      aboveFloor: 69,
      toCeiling: 27,
      left: 49,
      right: 49,
    });
    expect(m?.nails.map((n) => [n.frame, n.across, n.down, n.floor])).toEqual([
      [0, 5, 2, 67],
      [2, 23, 2.5, 66.5],
      [3, 41, 2, 67],
      [1, 5, 17, 52],
      [4, 41, 17, 52],
    ]);
  });
});

describe("the group as one", () => {
  const rects = () => aboveSofa("one-big-two-each-side").frames.map((f) => f.rect);

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-groups-distances} */
  it("reads the group's four distances", () => {
    expect(groupDistances(rects(), sofa, room)).toEqual({
      left: 49,
      right: 49,
      above: 27,
      below: 8,
    });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-hanging-the-group-higher-above-the-sofa} */
  it("moves every frame when a distance is set", () => {
    expect(setGroupDistance(rects(), "below", 10, sofa, room).map(at)).toEqual([
      [49, 59],
      [49, 44],
      [62, 44.5],
      [85, 59],
      [85, 44],
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-centring-a-group-that-runs-past-the-edge} */
  it("centres a group that runs past the edge", () => {
    const moved = rects().map((r) => ({ ...r, x: r.x + 52 }));
    const centred = centreGroup(moved, room);
    expect(Math.min(...centred.map((r) => r.x))).toBe(49);
    expect(centred.map((r) => r.y)).toEqual(moved.map((r) => r.y));
  });
});

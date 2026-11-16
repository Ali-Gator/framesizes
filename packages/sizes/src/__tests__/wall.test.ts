import { describe, expect, it } from "vitest";

import type { Rect } from "../scene";
import {
  DEMO_ROOM,
  KNOWN_IDS,
  KNOWN_THINGS,
  defaultLength,
  frameDistances,
  markedFurniture,
  photoEdges,
  photoPointToWall,
  photoSize,
  placeBeside,
  rectToPhoto,
  scaleFromMark,
  setDistance,
  snapFrame,
  type Photo,
  type Wall,
} from "../wall";

const known = (id: (typeof KNOWN_IDS)[number]) => {
  const found = KNOWN_THINGS.find((k) => k.id === id);
  if (!found) throw new Error(`no known thing ${id}`);
  return found;
};
const frameAt = (x: number, y: number): Rect => ({ x, y, w: 18, h: 22 });

/** A 144 × 96 in wall with all four edges known. */
const WALL: Wall = {
  bounds: { x: 0, y: 0, w: 144, h: 96 },
  edges: { left: 0, right: 144, top: 96, bottom: 0 },
};
const PHOTO: Photo = { width: 1200, height: 900 };
/** The 1200 × 900 px photo at 5 px/in, with the given edges. */
const photoWall = (edges: Wall["edges"]): Wall => ({
  bounds: { x: 0, y: 0, ...photoSize(PHOTO, 5) },
  edges,
});
const NO_EDGES = { left: null, right: null, top: null, bottom: null };

describe("known things", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-list-of-known-things} */
  it("lists the seven known things in order, each naming its edge", () => {
    expect(KNOWN_IDS).toEqual(["wall", "door", "sofa", "bed", "letter", "a4", "card"]);
    expect(KNOWN_THINGS.map((k) => k.id)).toEqual(KNOWN_IDS);
    for (const k of KNOWN_THINGS) {
      expect(k.name, k.id).not.toBe("");
      expect(k.edge, k.id).not.toBe("");
    }
    expect(known("wall").edge).toMatch(/corner to corner/);
    expect(known("door").edge).toMatch(/floor/);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-sofa-and-the-bed-are-marked-along-their-top} */
  it("marks the sofa along its back and the bed along its mattress", () => {
    expect(known("sofa").edge).toMatch(/top of the back/);
    expect(known("bed").edge).toMatch(/top of the mattress/);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-standard-objects-have-fixed-lengths} */
  it("gives Letter, A4 and the card fixed lengths", () => {
    expect(known("letter").length).toEqual({ kind: "fixed", inches: 11 });
    const a4 = known("a4").length;
    const card = known("card").length;
    expect(a4.kind).toBe("fixed");
    expect(card.kind).toBe("fixed");
    if (a4.kind !== "fixed" || card.kind !== "fixed") return;
    expect(a4.inches * 25.4).toBeCloseTo(297, 9);
    expect(card.inches * 25.4).toBeCloseTo(85.6, 9);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-defaults-in-inches} */
  it("gives US defaults in inches", () => {
    expect(defaultLength("door", "in")).toBe(80);
    expect(defaultLength("sofa", "in")).toBe(84);
    expect(defaultLength("bed", "in")).toBe(60);
    expect(defaultLength("wall", "in")).toBeNull();
    for (const id of ["door", "sofa", "bed"] as const)
      expect(known(id).length.kind).toBe("default");
    expect(known("wall").length).toEqual({ kind: "none" });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-defaults-in-centimetres} */
  it("gives European defaults in centimetres", () => {
    expect(defaultLength("door", "cm")).toBe(200);
    expect(defaultLength("sofa", "cm")).toBe(213);
    expect(defaultLength("bed", "cm")).toBe(160);
    expect(defaultLength("wall", "cm")).toBeNull();
  });

  it("gives fixed lengths in centimetres without float noise", () => {
    expect(defaultLength("a4", "cm")).toBe(29.7);
    expect(defaultLength("card", "cm")).toBe(8.56);
    expect(defaultLength("letter", "in")).toBe(11);
  });
});

describe("scale from a mark", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-door-marked-on-a-photo} */
  it("reads 5 px/in from a door 400 px tall", () => {
    expect(scaleFromMark({ x: 600, y: 100 }, { x: 600, y: 500 }, 80)).toBe(5);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-slanted-mark} */
  it("measures a slanted mark along its length", () => {
    expect(scaleFromMark({ x: 0, y: 0 }, { x: 300, y: 400 }, 100)).toBe(5);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-mark-that-gives-no-scale} */
  it("gives no scale for one point or a bad length", () => {
    const a = { x: 10, y: 10 };
    const b = { x: 10, y: 50 };
    expect(scaleFromMark(a, { ...a }, 80)).toBeNull();
    for (const len of [0, -5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(scaleFromMark(a, b, len), String(len)).toBeNull();
    }
    expect(scaleFromMark(a, { x: Number.NaN, y: 0 }, 80)).toBeNull();
  });
});

describe("photo and wall coordinates", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-photos-size-in-inches} */
  it("gives the photo's size in inches", () => {
    expect(photoSize(PHOTO, 5)).toEqual({ w: 240, h: 180 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-frames-place-in-pixels} */
  it("maps a frame in inches to top-left pixels", () => {
    expect(rectToPhoto(frameAt(20, 50), PHOTO, 5)).toEqual({ x: 100, y: 540, w: 90, h: 110 });
  });

  it("maps a marked point back to wall inches", () => {
    expect(photoPointToWall({ x: 100, y: 540 }, PHOTO, 5)).toEqual({ x: 20, y: 72 });
  });
});

describe("demo room", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-demo-room-opens-with-a-16x20-above-the-sofa} */
  it("opens with a 16x20 above the sofa", () => {
    expect(DEMO_ROOM.wall).toEqual(WALL);
    expect(DEMO_ROOM.sofa).toEqual({ x: 30, y: 0, w: 84, h: 34 });
    expect(DEMO_ROOM.frame).toEqual({ x: 63, y: 42, w: 18, h: 22 });
  });
});

describe("frame distances", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-two-frames-side-by-side} */
  it("measures two frames side by side", () => {
    const a = frameAt(40, 42);
    const b = frameAt(60, 42);
    expect(frameDistances(a, [b], WALL)).toMatchObject({ left: 40, right: 2 });
    expect(frameDistances(b, [a], WALL)).toMatchObject({ left: 2, right: 66 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-frame-that-is-not-in-line} */
  it("looks past a frame that is not in line", () => {
    expect(frameDistances(frameAt(40, 42), [frameAt(60, 70)], WALL).right).toBe(86);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-frame-in-the-demo-room} */
  it("measures the demo frame", () => {
    expect(frameDistances(DEMO_ROOM.frame, [DEMO_ROOM.sofa], DEMO_ROOM.wall)).toEqual({
      left: 63,
      right: 63,
      above: 32,
      below: 8,
    });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-photo-with-no-edge-marked} */
  it("has no distance to an edge that is not marked", () => {
    expect(frameDistances(frameAt(100, 40), [frameAt(130, 40)], photoWall(NO_EDGES))).toEqual({
      left: null,
      right: 12,
      above: null,
      below: null,
    });
  });
});

describe("distances past a marked edge", () => {
  const marked = photoWall({ ...NO_EDGES, left: 20, right: 220 });

  it("ignores an obstacle that overlaps the frame", () => {
    expect(frameDistances(frameAt(40, 42), [frameAt(45, 50)], WALL).right).toBe(86);
  });

  it("stops at the marked edge before a frame beyond it", () => {
    const a = frameAt(100, 40);
    const outside = frameAt(230, 40);
    expect(frameDistances(a, [outside], marked).right).toBe(102);
    expect(setDistance(a, "left", 200, [outside], marked).x).toBe(202);
  });

  it("does not move a frame past the far edge the wrong way", () => {
    expect(setDistance(frameAt(225, 40), "left", 210, [], marked)).toEqual(frameAt(225, 40));
  });
});

describe("setting a distance", () => {
  const a = frameAt(40, 42);
  const b = frameAt(60, 42);

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-gap-is-widened} */
  it("widens a gap by moving only that frame", () => {
    expect(setDistance(a, "right", 3, [b], WALL)).toEqual(frameAt(39, 42));
    expect(b).toEqual(frameAt(60, 42));
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-distance-that-would-push-the-frame-off-the-wall} */
  it("stops at the wall's edge", () => {
    expect(setDistance(a, "right", 100, [b], WALL).x).toBe(0);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-distance-that-would-push-the-frame-through-another} */
  it("stops against the next frame", () => {
    const moved = setDistance(a, "left", 50, [b], WALL);
    expect(moved.x).toBe(42);
    expect(frameDistances(moved, [b], WALL).right).toBe(0);
    expect(b).toEqual(frameAt(60, 42));
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-negative-distance} */
  it("counts a negative distance as zero", () => {
    expect(setDistance(a, "left", -5, [b], WALL).x).toBe(0);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-demo-frame-is-raised-above-the-sofa} */
  it("raises the demo frame", () => {
    const { frame, sofa, wall } = DEMO_ROOM;
    expect(setDistance(frame, "below", 10, [sofa], wall).y).toBe(44);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-gap-on-a-photo-with-no-edge-marked} */
  it("stops at the photo's border where the edge is unknown", () => {
    const photoB = frameAt(130, 40);
    expect(setDistance(frameAt(100, 40), "right", 200, [photoB], photoWall(NO_EDGES)).x).toBe(0);
    expect(photoB).toEqual(frameAt(130, 40));
  });

  it("ignores a value that is not a number", () => {
    expect(setDistance(a, "left", Number.NaN, [b], WALL)).toEqual(a);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-side-with-no-distance} */
  it("leaves the frame in place on a side with no distance", () => {
    expect(setDistance(frameAt(100, 40), "above", 5, [], photoWall(NO_EDGES))).toEqual(
      frameAt(100, 40),
    );
  });
});

describe("a photo's edges and furniture", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-floor-line} */
  it("takes the bottom edge from the floor line", () => {
    const edges = photoEdges(PHOTO, 5, { floor: 850 });
    expect(edges).toEqual({ left: null, right: null, top: null, bottom: 10 });
    expect(frameDistances(frameAt(100, 40), [], photoWall(edges)).below).toBe(30);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-walls-width-gives-its-side-edges} */
  it("takes the side edges from the wall's width", () => {
    const mark = [
      { x: 1100, y: 400 },
      { x: 100, y: 400 },
    ] as const;
    const scale = scaleFromMark(mark[0], mark[1], 200);
    expect(scale).toBe(5);
    const edges = photoEdges(PHOTO, 5, { wall: mark });
    expect(edges).toEqual({ left: 20, right: 220, top: null, bottom: null });
    expect(frameDistances(frameAt(100, 40), [], photoWall(edges))).toMatchObject({
      left: 80,
      right: 102,
    });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-frame-above-a-marked-sofa} */
  it("turns a marked sofa into furniture", () => {
    const mark = [
      { x: 300, y: 600 },
      { x: 720, y: 600 },
    ] as const;
    expect(scaleFromMark(mark[0], mark[1], 84)).toBe(5);
    const sofa = markedFurniture("sofa", mark, 5, PHOTO, NO_EDGES);
    expect(sofa).toEqual({ x: 60, y: 0, w: 84, h: 60 });
    expect(frameDistances(frameAt(80, 68), [sofa as Rect], photoWall(NO_EDGES)).below).toBe(8);
  });

  it("starts furniture at the floor line, and only for a sofa or a bed", () => {
    const mark = [
      { x: 300, y: 600 },
      { x: 720, y: 600 },
    ] as const;
    const edges = photoEdges(PHOTO, 5, { floor: 850 });
    expect(markedFurniture("bed", mark, 5, PHOTO, edges)).toEqual({ x: 60, y: 10, w: 84, h: 50 });
    expect(markedFurniture("door", mark, 5, PHOTO, edges)).toBeNull();
  });
});

describe("snapping", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-frame-snaps-beside-another} */
  it("snaps beside another frame", () => {
    expect(snapFrame(frameAt(58.6, 42.6), [frameAt(40, 42)], [])).toEqual({
      frame: frameAt(58, 42),
      lines: { vertical: [58], horizontal: [42, 53, 64] },
    });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-frame-snaps-to-the-sofas-centre} */
  it("snaps to the sofa's centre", () => {
    const { frame, sofa } = DEMO_ROOM;
    expect(snapFrame({ ...frame, x: 63.7 }, [], [sofa])).toEqual({
      frame,
      lines: { vertical: [72], horizontal: [] },
    });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-nothing-within-an-inch} */
  it("leaves a frame with nothing within an inch", () => {
    expect(snapFrame(frameAt(80, 70), [frameAt(40, 42)], [])).toEqual({
      frame: frameAt(80, 70),
      lines: { vertical: [], horizontal: [] },
    });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-snap-that-would-leave-the-wall} */
  it("makes no snap that would leave the wall", () => {
    const { frame, lines } = snapFrame(frameAt(125.5, 10), [frameAt(117.4, 42)], [], WALL);
    expect(frame.x).toBeCloseTo(125.5);
    expect(frame.y).toBeCloseTo(10);
    expect(lines).toEqual({ vertical: [], horizontal: [] });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-tie-between-two-frames} */
  it("gives an exact tie to the dragged frame's left edge", () => {
    const others = [frameAt(40, 42), frameAt(77, 42)];
    expect(snapFrame(frameAt(58.5, 70), others, [], WALL)).toEqual({
      frame: frameAt(58, 70),
      lines: { vertical: [58], horizontal: [] },
    });
  });
});

describe("placing a new frame", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-frame-added-beside-the-demo-frame} */
  it("goes 3 in right of the selected frame, centres level", () => {
    const { frame, sofa, wall } = DEMO_ROOM;
    expect(placeBeside({ w: 13, h: 16 }, frame, [frame, sofa], wall)).toEqual({
      x: 84,
      y: 45,
      w: 13,
      h: 16,
    });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-no-room-on-the-right} */
  it("goes left when the right is full", () => {
    const selected = frameAt(120, 42);
    expect(placeBeside({ w: 18, h: 22 }, selected, [selected], WALL)).toEqual(frameAt(99, 42));
  });

  it("goes left when another frame takes the right", () => {
    const selected = frameAt(60, 42);
    const taken = frameAt(82, 42);
    expect(placeBeside({ w: 18, h: 22 }, selected, [selected, taken], WALL)).toEqual(
      frameAt(39, 42),
    );
    const both = [selected, taken, frameAt(40, 42)];
    expect(placeBeside({ w: 18, h: 22 }, selected, both, WALL)).toEqual(frameAt(63, 46));
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-marked-wall-edge-on-the-right} */
  it("goes left when the right crosses a marked wall edge", () => {
    const photo: Wall = {
      bounds: { x: 0, y: 0, w: 200, h: 100 },
      edges: { ...NO_EDGES, right: 130 },
    };
    const selected = frameAt(105, 42);
    expect(placeBeside({ w: 18, h: 22 }, selected, [selected], photo)).toEqual(frameAt(84, 42));
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-centred-between-the-marked-side-edges} */
  it("centres between the marked side edges", () => {
    const photo: Wall = {
      bounds: { x: 0, y: 0, w: 200, h: 100 },
      edges: { ...NO_EDGES, left: 20, right: 130 },
    };
    expect(placeBeside({ w: 18, h: 22 }, null, [], photo)).toEqual(frameAt(66, 39));
  });

  it("keeps a centred frame inside a close-up photo", () => {
    const closeUp: Wall = {
      bounds: { x: 0, y: 0, w: 34, h: 25 },
      edges: { ...NO_EDGES, bottom: 2 },
    };
    expect(placeBeside({ w: 18, h: 22 }, null, [], closeUp)).toEqual(frameAt(8, 3));
  });

  it("centres on the 57 in line, or in the photo's middle without a floor", () => {
    expect(placeBeside({ w: 18, h: 22 }, null, [], WALL)).toEqual(frameAt(63, 46));
    expect(placeBeside({ w: 18, h: 22 }, null, [], photoWall(NO_EDGES))).toEqual(frameAt(111, 79));
    const floor = photoWall({ ...NO_EDGES, bottom: 10 });
    expect(placeBeside({ w: 18, h: 22 }, null, [], floor)).toEqual(frameAt(111, 56));
  });
});

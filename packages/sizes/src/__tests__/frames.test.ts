import { describe, expect, it } from "vitest";

import {
  CATALOG,
  CHECK,
  commonFrames,
  findFrame,
  frameAnatomy,
  framesFor,
  nextSizeUp,
  type Frame,
} from "../frames";
import { writeSize } from "../units";

const ids = (frames: readonly { id: string }[]) => frames.map((f) => f.id);
const frame = (id: string): Frame => {
  const found = findFrame(id);
  if (!found) throw new Error(`no frame ${id}`);
  return found;
};
const matOf = (id: string) => {
  const mat = frame(id).mat;
  return mat && writeSize(mat, "search");
};

describe("catalog", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-rectangular-sizes} */
  it("lists the rectangular sizes", () => {
    expect(ids(framesFor("portrait"))).toEqual([
      "4x6",
      "5x7",
      "8x10",
      "8.5x11",
      "11x14",
      "11x17",
      "12x16",
      "12x18",
      "16x20",
      "18x24",
      "20x24",
      "20x30",
      "24x36",
      "27x40",
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-square-sizes} */
  it("lists the square sizes", () => {
    expect(ids(framesFor("square"))).toEqual(["8x8", "10x10", "12x12", "16x16", "20x20"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-six-most-common-sizes} */
  it("marks the six most common sizes", () => {
    expect(ids(commonFrames())).toEqual(["4x6", "5x7", "8x10", "11x14", "16x20", "24x36"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-every-entry-is-well-formed} */
  it("holds well-formed entries", () => {
    expect(new Set(ids(CATALOG)).size).toBe(CATALOG.length);
    for (const entry of CATALOG) {
      expect(entry.id).toBe(`${entry.w}x${entry.h}`);
      expect(entry.w).toBeLessThanOrEqual(entry.h);
      expect(entry.use.trim()).not.toBe("");
    }
    // Rectangular first, then square, each by width and then height.
    const rank = (e: (typeof CATALOG)[number]) => (e.w === e.h ? 1000 : 0) + e.w + e.h / 100;
    const sorted = [...CATALOG].sort((a, b) => rank(a) - rank(b));
    expect(ids(sorted)).toEqual(ids(CATALOG));
  });
});

describe("orientation", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-landscape-turns-the-size} */
  it("turns the size in the landscape list", () => {
    const third = framesFor("landscape")[2];
    expect(third).toMatchObject({ id: "10x8", w: 10, h: 8, orientation: "landscape" });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-oriented-id-is-looked-up} */
  it("finds an oriented id", () => {
    expect(findFrame("10x8")?.orientation).toBe("landscape");
    expect(findFrame("8x10")?.orientation).toBe("portrait");
    expect(findFrame("12x12")?.orientation).toBe("square");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-unknown-id} */
  it("finds nothing for an unknown id", () => {
    expect(findFrame("9x9")).toBeUndefined();
    expect(findFrame("banana")).toBeUndefined();
  });
});

describe("next size up", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-size-in-the-middle-of-the-list} */
  it("is the next entry of the list", () => {
    expect(nextSizeUp(frame("16x20"))?.id).toBe("18x24");
    expect(nextSizeUp(frame("20x16"))?.id).toBe("24x18");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-largest-size} */
  it("is none for the last entry", () => {
    expect(nextSizeUp(frame("27x40"))).toBeUndefined();
    expect(nextSizeUp(frame("20x20"))).toBeUndefined();
  });
});

describe("mat image", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-frames-with-a-common-mat} */
  it("pairs rectangular frames", () => {
    const frames = [
      "5x7",
      "8x10",
      "11x14",
      "11x17",
      "12x16",
      "12x18",
      "16x20",
      "18x24",
      "20x24",
      "24x36",
    ];
    expect(frames.map(matOf)).toEqual([
      "4x6",
      "5x7",
      "8x10",
      "8x12",
      "8.5x11",
      "11x17",
      "11x14",
      "16x20",
      "16x20",
      "20x30",
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-square-frames-with-a-common-mat} */
  it("pairs square frames", () => {
    expect(["8x8", "10x10", "12x12", "16x16", "20x20"].map(matOf)).toEqual([
      "4x4",
      "8x8",
      "8x8",
      "12x12",
      "16x16",
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-frames-usually-sold-without-a-mat} */
  it("is none where no pairing is common", () => {
    expect(["4x6", "8.5x11", "20x30", "27x40"].map(matOf)).toEqual([null, null, null, null]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-turned-frame} */
  it("turns with the frame", () => {
    expect(frame("14x11").mat).toEqual({ w: 10, h: 8 });
  });

  /** {@link openspec/specs/size-engine/spec.md#requirement-a-frame-size-names-the-image-usually-framed-in-it-with-a-mat} */
  it("is smaller than its frame in every orientation", () => {
    for (const orientation of ["portrait", "landscape", "square"] as const) {
      for (const f of framesFor(orientation)) {
        if (!f.mat) continue;
        expect(f.mat.w, f.id).toBeLessThan(f.w);
        expect(f.mat.h, f.id).toBeLessThan(f.h);
      }
    }
  });
});

describe("anatomy", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-an-8x10-photo-with-a-mat-in-an-11x14-frame} */
  it("computes the outside size and the mat opening", () => {
    const anatomy = frameAnatomy({ frame: { w: 11, h: 14 }, image: { w: 8, h: 10 } });
    expect(anatomy.outside).toEqual({ w: 13, h: 16 });
    expect(anatomy.matOpening).toEqual({ w: 7.5, h: 9.5 });
  });
});

describe("check record", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-check-record} */
  it("holds a past date and a named source with a URL", () => {
    expect(CHECK.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(`${CHECK.date}T00:00:00Z`).getTime()).toBeLessThanOrEqual(Date.now());
    expect(CHECK.sources.length).toBeGreaterThan(0);
    for (const source of CHECK.sources) {
      expect(source.name).not.toBe("");
      expect(() => new URL(source.url)).not.toThrow();
    }
  });
});

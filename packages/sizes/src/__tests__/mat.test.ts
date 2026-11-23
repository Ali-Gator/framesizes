import { describe, expect, it } from "vitest";

import {
  MAT_WIDTH,
  MAT_WIDTHS,
  matBorders,
  type MatAnswer,
  type MatQuestion,
  matSizes,
  whyNoMat,
} from "../mat";
import { type Identified, preCutFrames } from "../measure";

const print = (w: number, h: number, width: number, overlap?: number): MatQuestion => ({
  from: "print",
  print: { w, h },
  width,
  overlap,
});
const frame = (w: number, h: number, width: number): MatQuestion => ({
  from: "frame",
  frame: { w, h },
  width,
});
const ids = (frames: readonly { id: string }[]) => frames.map((f) => f.id);

function answer(q: MatQuestion): MatAnswer {
  const found = matSizes(q);
  if (!found) throw new Error(`no answer: ${whyNoMat(q)}`);
  return found;
}

function as<K extends Identified["kind"]>(
  found: Identified,
  kind: K,
): Extract<Identified, { kind: K }> {
  if (found.kind !== kind) throw new Error(`expected ${kind}, got ${found.kind}`);
  return found as Extract<Identified, { kind: K }>;
}

describe("the frames sold with a pre-cut mat for a print", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-an-8x10-print} */
  it("lists the 11x14 for an 8x10", () => {
    expect(ids(preCutFrames({ w: 8, h: 10 }))).toEqual(["11x14"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-11x14-print} */
  it("lists the 16x20 for an 11x14", () => {
    expect(ids(preCutFrames({ w: 11, h: 14 }))).toEqual(["16x20"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-16x20-print} */
  it("lists the 18x24 and the 20x24 for a 16x20", () => {
    expect(ids(preCutFrames({ w: 16, h: 20 }))).toEqual(["18x24", "20x24"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-landscape-prints-pre-cut-frame} */
  it("lists the landscape 14x11 for a 10x8", () => {
    expect(ids(preCutFrames({ w: 10, h: 8 }))).toEqual(["14x11"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-12x16-print-with-no-pre-cut-mat} */
  it("lists none for a 12x16", () => {
    expect(preCutFrames({ w: 12, h: 16 })).toEqual([]);
  });
});

describe("a print and a mat width", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-an-8x10-print-with-a-2-inch-mat} */
  it("give the 7½ × 9½ opening and the 11½ × 13½ frame for an 8x10", () => {
    const a = answer(print(8, 10, 2));
    expect(a.print).toEqual({ w: 8, h: 10 });
    expect(a.opening).toEqual({ w: 7.5, h: 9.5 });
    expect(a.frame).toEqual({ w: 11.5, h: 13.5 });
    expect(ids(a.preCut)).toEqual(["11x14"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-landscape-print-with-a-2-inch-mat} */
  it("keep a landscape print landscape", () => {
    const a = answer(print(10, 8, 2));
    expect(a.opening).toEqual({ w: 9.5, h: 7.5 });
    expect(a.frame).toEqual({ w: 13.5, h: 11.5 });
    expect(ids(a.preCut)).toEqual(["14x11"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-different-overlap} */
  it("use the overlap given", () => {
    const a = answer(print(8, 10, 2, 0.125));
    expect(a.opening).toEqual({ w: 7.75, h: 9.75 });
    expect(a.frame).toEqual({ w: 11.75, h: 13.75 });
  });
});

describe("the frame size from a print", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-print-is-named} */
  it("names the 8x10 print", () => {
    expect(as(answer(print(8, 10, 2)).printMatch, "standard").frame.id).toBe("8x10");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-frame-size-that-is-standard} */
  it("is the standard 8x10 for a 5x7 with a 1¾ in mat", () => {
    const a = answer(print(5, 7, 1.75));
    expect(a.frame).toEqual({ w: 8, h: 10 });
    expect(as(a.frameMatch, "standard").frame.id).toBe("8x10");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-11x14-print-with-a-2-inch-mat} */
  it("is a custom 14½ × 17½ for an 11x14 with a 2 in mat", () => {
    const a = answer(print(11, 14, 2));
    expect(a.frame).toEqual({ w: 14.5, h: 17.5 });
    const m = as(a.frameMatch, "custom");
    expect(m.below?.id).toBe("12x16");
    expect(m.above?.id).toBe("16x20");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-8x10-print-with-a-2-inch-mat-is-near-square} */
  it("is a near-square custom size for an 8x10 with a 2 in mat", () => {
    const m = as(answer(print(8, 10, 2)).frameMatch, "custom");
    expect(m.size).toEqual({ w: 11.5, h: 13.5 });
    expect([m.below?.id, m.above?.id]).toEqual(["8.5x11", "12x16"]);
    expect([m.squareBelow?.id, m.squareAbove?.id]).toEqual(["10x10", "16x16"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-landscape-frame-size} */
  it("keeps the neighbours landscape for a 10x8", () => {
    const m = as(answer(print(10, 8, 2)).frameMatch, "custom");
    expect([m.below?.id, m.above?.id]).toEqual(["11x8.5", "16x12"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-frame-size-that-is-metric} */
  it("is the metric 30 × 40 cm for an 8x12 with a 2 in mat", () => {
    const a = answer(print(8, 12, 2));
    expect(a.frame).toEqual({ w: 11.5, h: 15.5 });
    const m = as(a.frameMatch, "metric");
    expect(m.metric.id).toBe("30x40 cm");
    expect(m.close).toBeUndefined();
  });
});

describe("a frame and a mat width", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-an-11x14-frame-with-a-2-inch-mat} */
  it("give the 7 × 10 opening and a print up to 7½ × 10½ for an 11x14", () => {
    const a = answer(frame(11, 14, 2));
    expect(a.frame).toEqual({ w: 11, h: 14 });
    expect(a.opening).toEqual({ w: 7, h: 10 });
    expect(a.print).toEqual({ w: 7.5, h: 10.5 });
    expect(a.preCut).toEqual([]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-landscape-frame-with-a-2-inch-mat} */
  it("keep a landscape frame landscape", () => {
    const a = answer(frame(14, 11, 2));
    expect(a.opening).toEqual({ w: 10, h: 7 });
    expect(a.print).toEqual({ w: 10.5, h: 7.5 });
  });
});

describe("the largest print for a frame", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-print-that-is-standard} */
  it("is the standard 5x7 for an 8x10 with a 1¾ in mat", () => {
    const a = answer(frame(8, 10, 1.75));
    expect(a.print).toEqual({ w: 5, h: 7 });
    expect(as(a.printMatch, "standard").frame.id).toBe("5x7");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-print-between-two-sizes} */
  it("is a custom size between the 5x7 and the 8.5x11 for an 11x14 with a 2 in mat", () => {
    const m = as(answer(frame(11, 14, 2)).printMatch, "custom");
    expect([m.below?.id, m.above?.id]).toEqual(["5x7", "8.5x11"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-landscape-print-between-two-sizes} */
  it("keeps the neighbours landscape for a 14x11", () => {
    const m = as(answer(frame(14, 11, 2)).printMatch, "custom");
    expect([m.below?.id, m.above?.id]).toEqual(["7x5", "11x8.5"]);
  });
});

describe("a frame given in reverse", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-frame-sold-with-a-pre-cut-mat} */
  it("is the standard 11x14 with its 8x10 mat", () => {
    const f = as(answer(frame(11, 14, 2)).frameMatch, "standard").frame;
    expect(f.id).toBe("11x14");
    expect(f.mat).toEqual({ w: 8, h: 10 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-frame-usually-sold-without-a-mat} */
  it("is the standard 8.5x11 with no mat", () => {
    const f = as(answer(frame(8.5, 11, 1.5)).frameMatch, "standard").frame;
    expect(f.id).toBe("8.5x11");
    expect(f.mat).toBeNull();
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-custom-frame} */
  it("is a custom size for a 9 × 12", () => {
    expect(answer(frame(9, 12, 2)).frameMatch.kind).toBe("custom");
  });
});

describe("the mat borders", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-an-8x10-print-in-an-11x14-frame} */
  it("are 1¾ and 2¼ in for an 8x10 in an 11x14", () => {
    expect(matBorders({ w: 11, h: 14 }, { w: 8, h: 10 })).toEqual({ side: 1.75, top: 2.25 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-8x10-print-in-a-16x16-frame} */
  it("are 4¼ and 3¼ in for an 8x10 in a 16x16", () => {
    expect(matBorders({ w: 16, h: 16 }, { w: 8, h: 10 })).toEqual({ side: 4.25, top: 3.25 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-5x7-print-in-an-11x14-frame} */
  it("are 3¼ and 3¾ in for a 5x7 in an 11x14", () => {
    expect(matBorders({ w: 11, h: 14 }, { w: 5, h: 7 })).toEqual({ side: 3.25, top: 3.75 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-landscape-print-in-a-landscape-frame} */
  it("are 2¼ and 1¾ in for a 10x8 in a 14x11", () => {
    expect(matBorders({ w: 14, h: 11 }, { w: 10, h: 8 })).toEqual({ side: 2.25, top: 1.75 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-print-too-big-for-the-frame} */
  it("are −1¼ in for an 8x10 in a 5x7", () => {
    expect(matBorders({ w: 5, h: 7 }, { w: 8, h: 10 })).toEqual({ side: -1.25, top: -1.25 });
  });
});

describe("the calculator's mat widths", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-presets-and-the-default} */
  it("are 1½, 2, 2½ and 3 in, starting at 2", () => {
    expect(MAT_WIDTHS).toEqual([1.5, 2, 2.5, 3]);
    expect(MAT_WIDTH).toBe(2);
  });
});

describe("a mat question with no answer", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-number-that-is-not-positive} */
  it.each([0, -1, Number.NaN])("refuses %s as a number that is not positive", (bad) => {
    const questions: MatQuestion[] = [
      print(bad, 10, 2),
      print(8, bad, 2),
      frame(bad, 14, 2),
      frame(11, bad, 2),
      print(8, 10, bad),
      frame(11, 14, bad),
      print(8, 10, 2, bad),
      { ...frame(11, 14, 2), overlap: bad },
    ];
    for (const q of questions) {
      expect(matSizes(q)).toBeUndefined();
      expect(whyNoMat(q)).toBe("number");
    }
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-mat-as-wide-as-the-frame} */
  it("refuses a 4x6 frame with a 2 or 3 in mat as leaving no room", () => {
    for (const q of [frame(4, 6, 2), frame(4, 6, 3)]) {
      expect(matSizes(q)).toBeUndefined();
      expect(whyNoMat(q)).toBe("room");
    }
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-overlap-as-wide-as-the-print} */
  it("refuses a ½ × 6 print as leaving no room", () => {
    expect(matSizes(print(0.5, 6, 2))).toBeUndefined();
    expect(whyNoMat(print(0.5, 6, 2))).toBe("room");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-question-with-an-answer} */
  it("gives no reason for an 8x10 print with a 2 in mat", () => {
    expect(whyNoMat(print(8, 10, 2))).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";

import { DIPLOMA, matBorders, type MatQuestion, matSizes, whyNoMat } from "../mat";
import { identifyFrame } from "../measure";

const print = (w: number, h: number, width: number): MatQuestion => ({
  from: "print",
  print: { w, h },
  width,
});
const ids = (frames: readonly { id: string }[]) => frames.map((f) => f.id);

describe("a mat no wider than its overlap", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-mat-no-wider-than-its-overlap} */
  it.each<MatQuestion>([
    print(8, 10, 0.1),
    print(8, 10, 0.25),
    { from: "frame", frame: { w: 11, h: 14 }, width: 0.2 },
  ])("refuses %o as too narrow", (q) => {
    expect(matSizes(q)).toBeUndefined();
    expect(whyNoMat(q)).toBe("narrow");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-number-that-is-not-positive} */
  it("still calls a 0 width a number that is not positive", () => {
    expect(whyNoMat(print(8, 10, 0))).toBe("number");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-mat-just-wider-than-its-overlap} */
  it("answers a ⅜ in mat with an 8¼ × 10¼ frame", () => {
    const q = print(8, 10, 0.375);
    expect(whyNoMat(q)).toBeUndefined();
    expect(matSizes(q)?.frame).toEqual({ w: 8.25, h: 10.25 });
  });
});

describe("the diploma", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-diploma-and-its-frame} */
  it("is 8½ × 11 in, in the catalog's 11x14 frame", () => {
    expect(DIPLOMA.print).toEqual({ w: 8.5, h: 11 });
    expect(DIPLOMA.frame.id).toBe("11x14");
    expect([DIPLOMA.frame.w, DIPLOMA.frame.h]).toEqual([11, 14]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-border-a-diploma-frame-gives} */
  it("gets 1½ in at the sides, 1¾ in at the top and an 8 × 10½ opening", () => {
    expect(matBorders(DIPLOMA.frame, DIPLOMA.print)).toEqual({ side: 1.5, top: 1.75 });
    expect(matSizes(print(8.5, 11, 1.5))?.opening).toEqual({ w: 8, h: 10.5 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-diploma-size-print-in-the-mat-calculator} */
  it("lists the 11x14 and the 12x16 as pre-cut for an 8½ × 11 print", () => {
    const narrow = matSizes(print(8.5, 11, 1.5));
    expect(ids(narrow?.preCut ?? [])).toEqual(["11x14", "12x16"]);
    expect(ids(matSizes(print(8.5, 11, 2))?.preCut ?? [])).toEqual(["11x14", "12x16"]);
    expect(narrow?.frame).toEqual({ w: 11, h: 13.5 });
    expect(narrow?.frameMatch.kind).toBe("custom");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-diploma-size-print-in-the-mat-calculator} */
  it("turns the diploma frame for a landscape diploma", () => {
    expect(ids(matSizes(print(11, 8.5, 2))?.preCut ?? [])).toEqual(["14x11", "16x12"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-diploma-size-print-that-gets-the-diploma-frame} */
  it("matches the standard 11x14 with a 1⅝ in mat", () => {
    const a = matSizes(print(8.5, 11, 1.625));
    expect(a?.frame).toEqual({ w: 11.25, h: 13.75 });
    expect(a?.frameMatch.kind === "standard" && a.frameMatch.frame.id).toBe("11x14");
    expect(ids(a?.preCut ?? [])).toEqual(["11x14", "12x16"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-f4s-mat-answer-is-unchanged} */
  it("leaves F4's mat answer as it was", () => {
    const found = identifyFrame({ kind: "mat", size: { w: 8, h: 10.5 } });
    expect(found?.kind === "mat" && ids(found.frames)).toEqual(["12x16"]);
  });
});

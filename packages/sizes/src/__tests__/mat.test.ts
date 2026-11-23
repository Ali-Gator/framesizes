import { describe, expect, it } from "vitest";

import { preCutFrames } from "../measure";

const ids = (frames: readonly { id: string }[]) => frames.map((f) => f.id);

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

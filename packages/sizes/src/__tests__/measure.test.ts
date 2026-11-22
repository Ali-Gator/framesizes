import { describe, expect, it } from "vitest";

import { CATALOG, frameAnatomy, MOULDING } from "../frames";
import {
  identifyFrame,
  LIP,
  MEASURE_TOLERANCE,
  METRIC_FRAMES,
  type Identified,
  type Measurement,
} from "../measure";
import { ACTUAL_SIZES } from "../screen";
import type { Size } from "../units";

const cm = (w: number, h: number): Size => ({ w: w / 2.54, h: h / 2.54 });
const inside = (w: number, h: number): Measurement => ({ kind: "inside", size: { w, h } });
const gap = (a: Size, b: Size) => Math.max(Math.abs(a.w - b.w), Math.abs(a.h - b.h));
const pairs = <T>(list: readonly T[]) =>
  list.flatMap((a, i) => list.slice(i + 1).map((b) => [a, b] as const));

function as<K extends Identified["kind"]>(
  answer: Identified | undefined,
  kind: K,
): Extract<Identified, { kind: K }> {
  if (answer?.kind !== kind) throw new Error(`expected ${kind}, got ${answer?.kind}`);
  return answer as Extract<Identified, { kind: K }>;
}

describe("an inside measurement", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-an-8x10-measured-inside} */
  it("names the 8x10 measured exactly or ⅛ in large", () => {
    expect(as(identifyFrame(inside(8, 10)), "standard").frame.id).toBe("8x10");
    const large = as(identifyFrame(inside(8.125, 10.125)), "standard");
    expect(large.frame.id).toBe("8x10");
    expect(large.size).toEqual({ w: 8.125, h: 10.125 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-edge-of-the-tolerance} */
  it("matches at ⅜ in and not past it", () => {
    expect(MEASURE_TOLERANCE).toBe(0.375);
    expect(as(identifyFrame(inside(8.375, 10)), "standard").frame.id).toBe("8x10");
    expect(identifyFrame(inside(8.4, 10))?.kind).toBe("custom");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-landscape-frame} */
  it("keeps a landscape frame landscape", () => {
    const frame = as(identifyFrame(inside(10, 8)), "standard").frame;
    expect(frame.id).toBe("10x8");
    expect(frame.orientation).toBe("landscape");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-square-frame-measured-slightly-off} */
  it("names the square 10x10 measured 10.1 by 9.9", () => {
    const frame = as(identifyFrame(inside(10.1, 9.9)), "standard").frame;
    expect(frame.id).toBe("10x10");
    expect(frame.orientation).toBe("square");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-custom-size} */
  it("calls 9 by 12 a custom size and gives the size back", () => {
    expect(as(identifyFrame(inside(9, 12)), "custom").size).toEqual({ w: 9, h: 12 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-measurement-matches-at-most-one-catalog-size} */
  it("has every pair of catalog sizes at least 1 in apart", () => {
    for (const [a, b] of pairs(CATALOG))
      expect(gap(a, b), `${a.id} ${b.id}`).toBeGreaterThanOrEqual(1);
  });
});

describe("a metric frame", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-an-a4-frame} */
  it("names A4 with no US size close", () => {
    const answer = as(identifyFrame({ kind: "inside", size: cm(21, 29.7) }), "metric");
    expect(answer.metric.id).toBe("A4");
    expect(answer.close).toBeUndefined();
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-30--40-cm-frame} */
  it("names 30 × 40 cm and the 12x16 as close too", () => {
    const answer = as(identifyFrame({ kind: "inside", size: cm(30, 40) }), "metric");
    expect(answer.metric.id).toBe("30x40 cm");
    expect(answer.metric.label).toBe("30 × 40 cm");
    expect(answer.close?.id).toBe("12x16");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-12x16-frame} */
  it("keeps a measured 12 by 16 in the US 12x16", () => {
    expect(as(identifyFrame(inside(12, 16)), "standard").frame.id).toBe("12x16");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-landscape-a4} */
  it("turns A4 landscape and keeps its id", () => {
    const { metric } = as(identifyFrame({ kind: "inside", size: cm(29.7, 21) }), "metric");
    expect(metric.id).toBe("A4");
    expect(metric.w).toBeCloseTo(297 / 25.4, 6);
    expect(metric.h).toBeCloseTo(210 / 25.4, 6);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-measurement-matches-at-most-one-metric-size} */
  it("has five metric sizes, A4 and A3 shared with the actual size viewer, each pair over ¾ in apart", () => {
    expect(METRIC_FRAMES.map((m) => m.id)).toEqual([
      "A4",
      "A3",
      "30x40 cm",
      "40x50 cm",
      "50x70 cm",
    ]);
    expect(METRIC_FRAMES[0]).toBe(ACTUAL_SIZES.find((s) => s.id === "A4"));
    expect(METRIC_FRAMES[1]).toBe(ACTUAL_SIZES.find((s) => s.id === "A3"));
    for (const [a, b] of pairs(METRIC_FRAMES))
      expect(gap(a, b), `${a.id} ${b.id}`).toBeGreaterThan(0.75);
  });
});

describe("the nearest sizes to a custom size", () => {
  const nearest = (w: number, h: number) => {
    const { below, above } = as(identifyFrame(inside(w, h)), "custom");
    return [below?.id, above?.id];
  };

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-9--12-frame} */
  it("are 8.5x11 and 11x14 for 9 by 12", () => {
    expect(nearest(9, 12)).toEqual(["8.5x11", "11x14"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-landscape-custom-frame} */
  it("are landscape for 12 by 9", () => {
    expect(nearest(12, 9)).toEqual(["11x8.5", "14x11"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-square-custom-frame} */
  it("are squares for 13 by 13", () => {
    expect(nearest(13, 13)).toEqual(["12x12", "16x16"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-larger-than-every-size} */
  it("have nothing above 30 by 44", () => {
    expect(nearest(30, 44)).toEqual(["27x40", undefined]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-smaller-than-every-size} */
  it("have nothing below 3 by 5", () => {
    expect(nearest(3, 5)).toEqual([undefined, "4x6"]);
  });
});

describe("a front opening", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-front-opening-of-an-8x10} */
  it("adds a ¼ in lip on each side", () => {
    expect(LIP).toBe(0.25);
    const answer = as(identifyFrame({ kind: "front", size: { w: 7.5, h: 9.5 } }), "standard");
    expect(answer.size).toEqual({ w: 8, h: 10 });
    expect(answer.frame.id).toBe("8x10");
  });
});

describe("an outside measurement", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-an-11x14-measured-outside} */
  it("gives 11x14 for 13 by 16 with a 1¼ in face, as frame anatomy draws it", () => {
    const answer = as(
      identifyFrame({ kind: "outside", size: { w: 13, h: 16 }, face: 1.25 }),
      "standard",
    );
    expect(answer.size).toEqual({ w: 11, h: 14 });
    expect(answer.frame.id).toBe("11x14");
    const { outside } = frameAnatomy({ frame: { w: 11, h: 14 }, image: { w: 8, h: 10 } });
    const drawn = identifyFrame({ kind: "outside", size: outside, face: MOULDING + LIP });
    expect(as(drawn, "standard").frame.id).toBe("11x14");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-8x10-measured-outside} */
  it("gives 8x10 for 10 by 12 with a 1¼ in face", () => {
    const answer = as(
      identifyFrame({ kind: "outside", size: { w: 10, h: 12 }, face: 1.25 }),
      "standard",
    );
    expect(answer.size).toEqual({ w: 8, h: 10 });
    expect(answer.frame.id).toBe("8x10");
  });
});

describe("a mat opening", () => {
  const mat = (w: number, h: number) => {
    const answer = as(identifyFrame({ kind: "mat", size: { w, h } }), "mat");
    return { size: answer.size, frames: answer.frames.map((f) => f.id) };
  };

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-8x10-print-in-a-mat} */
  it("names the 8x10 print and the 11x14 frame", () => {
    expect(mat(7.5, 9.5)).toEqual({ size: { w: 8, h: 10 }, frames: ["11x14"] });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-print-sold-in-two-frame-sizes} */
  it("lists both frames sold with a 16x20 mat", () => {
    expect(mat(15.5, 19.5)).toEqual({ size: { w: 16, h: 20 }, frames: ["18x24", "20x24"] });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-landscape-mat} */
  it("turns the frame for a landscape mat", () => {
    expect(mat(9.5, 7.5)).toEqual({ size: { w: 10, h: 8 }, frames: ["14x11"] });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-print-no-pre-cut-mat-is-sold-for} */
  it("lists no frame for a 12x16 print", () => {
    expect(mat(11.5, 15.5)).toEqual({ size: { w: 12, h: 16 }, frames: [] });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-mat-print-matches-at-most-one-pairing} */
  it("has every pair of mat print sizes at least 1 in apart", () => {
    const prints = [
      ...new Map(
        CATALOG.flatMap((f) => (f.mat ? [[`${f.mat.w}x${f.mat.h}`, f.mat] as const] : [])),
      ).values(),
    ];
    for (const [a, b] of pairs(prints))
      expect(gap(a, b), `${a.w}x${a.h} ${b.w}x${b.h}`).toBeGreaterThanOrEqual(1);
  });
});

describe("no answer", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-side-that-is-not-a-positive-number} */
  it("for a side of 0, below 0, NaN or Infinity", () => {
    for (const side of [0, -8, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(identifyFrame(inside(side, 10))).toBeUndefined();
      expect(identifyFrame(inside(8, side))).toBeUndefined();
    }
  });

  /** {@link openspec/specs/size-engine/spec.md#requirement-a-measurement-that-gives-no-size-gets-no-answer} */
  it("for a lip, overlap or face width of 0", () => {
    const size = { w: 8, h: 10 };
    expect(identifyFrame({ kind: "front", size, lip: 0 })).toBeUndefined();
    expect(identifyFrame({ kind: "outside", size, face: 1, lip: 0 })).toBeUndefined();
    expect(identifyFrame({ kind: "outside", size, face: 0 })).toBeUndefined();
    expect(identifyFrame({ kind: "outside", size, face: Number.NaN })).toBeUndefined();
    expect(identifyFrame({ kind: "mat", size, overlap: 0 })).toBeUndefined();
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-mouldings-wider-than-the-frame} */
  it("for a 4 by 6 outside with a 3 in face", () => {
    expect(identifyFrame({ kind: "outside", size: { w: 4, h: 6 }, face: 3 })).toBeUndefined();
  });
});

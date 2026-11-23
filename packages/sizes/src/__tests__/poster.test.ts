import { describe, expect, it } from "vitest";

import { findFrame } from "../frames";
import { matSizes } from "../mat";
import { identifyFrame, type Identified } from "../measure";
import {
  A_FRAMES,
  type MattedFrame,
  POSTER_BORDER,
  type PosterFrames,
  POSTERS,
  posterFrames,
} from "../poster";
import { writeActual } from "../screen";
import { inEighths } from "../units";

const poster = (id: string) => {
  const found = POSTERS.find((p) => p.id === id);
  if (!found) throw new Error(`${id} is not a poster size`);
  return found;
};

function frames(size: { w: number; h: number }): PosterFrames {
  const found = posterFrames(size);
  if (!found) throw new Error(`no answer for ${size.w} × ${size.h}`);
  return found;
}

function as<K extends Identified["kind"]>(
  found: Identified,
  kind: K,
): Extract<Identified, { kind: K }> {
  if (found.kind !== kind) throw new Error(`expected ${kind}, got ${found.kind}`);
  return found as Extract<Identified, { kind: K }>;
}

/** `id (side / top, pre-cut)` with borders to the nearest eighth, for one readable assertion. */
const write = (m: readonly MattedFrame[]) =>
  m.map(
    (f) =>
      `${f.frame.id} (${inEighths(f.side)} / ${inEighths(f.top)}${f.preCut ? ", pre-cut" : ""})`,
  );

describe("the poster sizes", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-poster-list} */
  it("lists ten sizes in order", () => {
    expect(POSTERS.map((p) => p.id)).toEqual([
      "11x17",
      "12x18",
      "16x20",
      "18x24",
      "20x30",
      "24x36",
      "27x40",
      "A3",
      "A2",
      "A1",
    ]);
    for (const p of POSTERS) expect(p.w).toBeLessThanOrEqual(p.h);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-poster-use-lines} */
  it("gives each a use line", () => {
    expect(POSTERS.map((p) => p.use)).toEqual([
      "Small posters and flyers",
      "Posters and photo enlargements",
      "Art prints and small posters",
      "Medium posters and art prints",
      "Large photo prints and posters",
      "Large posters",
      "Movie posters",
      "Small metric posters",
      "Medium metric posters",
      "Large metric posters",
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-us-poster-sizes-are-catalog-sizes} */
  it("has every US size in the frame catalog", () => {
    const us = POSTERS.filter((p) => p.group === "us").map((p) => [p.id, p.w, p.h]);
    expect(us).toEqual([
      ["11x17", 11, 17],
      ["12x18", 12, 18],
      ["16x20", 16, 20],
      ["18x24", 18, 24],
      ["20x30", 20, 30],
      ["24x36", 24, 36],
      ["27x40", 27, 40],
    ]);
    for (const [id, w, h] of us) expect(findFrame(String(id))).toMatchObject({ w, h });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-a-series-posters-from-their-millimetre-sizes} */
  it("builds A3, A2 and A1 from millimetres", () => {
    expect(["A3", "A2", "A1"].map((id) => writeActual(poster(id), "cm"))).toEqual([
      "29.7 × 42.0 cm",
      "42.0 × 59.4 cm",
      "59.4 × 84.1 cm",
    ]);
    expect(poster("A2").group).toBe("a-series");
  });
});

describe("a poster without a mat", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-24x36-poster-without-a-mat} */
  it("puts a 24x36 in the standard 24x36", () => {
    expect(as(frames(poster("24x36")).bare, "standard").frame.id).toBe("24x36");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-a3-poster-without-a-mat} */
  it("puts an A3 in the metric A3", () => {
    expect(as(frames(poster("A3")).bare, "metric").metric.id).toBe("A3");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-a2-poster-without-a-mat} */
  it("gives an A2 a custom size between 16x20 and 18x24", () => {
    const c = as(frames(poster("A2")).bare, "custom");
    expect([c.below?.id, c.above?.id]).toEqual(["16x20", "18x24"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-landscape-poster-without-a-mat} */
  it("puts a 17x11 in the landscape 17x11", () => {
    expect(as(frames({ w: 17, h: 11 }).bare, "standard").frame.id).toBe("17x11");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-typed-poster-size-between-standard-sizes} */
  it("gives a 13x19 a custom size between 12x18 and 16x20", () => {
    const c = as(frames({ w: 13, h: 19 }).bare, "custom");
    expect([c.below?.id, c.above?.id]).toEqual(["12x18", "16x20"]);
  });
});

describe("the A-series frame named for a poster", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-an-a2-poster-names-the-a2-frame} */
  it("names the A2 frame and keeps the custom answer", () => {
    const f = frames(poster("A2"));
    expect(f.aFrame?.id).toBe("A2");
    const c = as(f.bare, "custom");
    expect([c.below?.id, c.above?.id]).toEqual(["16x20", "18x24"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-a1-poster-names-the-a1-frame} */
  it("names the A1 frame and keeps the custom answer", () => {
    const f = frames(poster("A1"));
    expect(f.aFrame?.id).toBe("A1");
    const c = as(f.bare, "custom");
    expect([c.below?.id, c.above?.id]).toEqual(["20x30", "24x36"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-typed-poster-size-near-a2} */
  it("names A2 for a typed 16.4 × 23.3, and turns it for a landscape poster", () => {
    expect(frames({ w: 16.4, h: 23.3 }).aFrame?.id).toBe("A2");
    const turned = frames({ w: 23.3, h: 16.4 }).aFrame;
    expect(turned?.id).toBe("A2");
    expect(turned && turned.w > turned.h).toBe(true);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-standard-or-metric-poster-names-no-a-series-frame} */
  it("names none for a 24x36 or an A3", () => {
    expect(frames(poster("24x36")).aFrame).toBeUndefined();
    expect(frames(poster("A3")).aFrame).toBeUndefined();
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-measuring-near-a2-is-unchanged} */
  it("leaves a measured 16½ × 23⅜ custom", () => {
    const m = identifyFrame({ kind: "inside", size: { w: 16.5, h: 23.375 } });
    expect(m?.kind).toBe("custom");
    expect(A_FRAMES.map((a) => a.id)).toEqual(["A2", "A1"]);
  });
});

describe("a poster with a mat", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-an-11x17-poster-with-a-mat} */
  it("fits an 11x17 in the 12x18, 16x20 and 18x24", () => {
    expect(write(frames(poster("11x17")).matted)).toEqual([
      "12x18 (¾ / ¾, pre-cut)",
      "16x20 (2¾ / 1¾)",
      "18x24 (3¾ / 3¾)",
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-16x20-poster-with-a-mat} */
  it("fits a 16x20 in the pre-cut 18x24 and 20x24", () => {
    expect(write(frames(poster("16x20")).matted)).toEqual([
      "18x24 (1¼ / 2¼, pre-cut)",
      "20x24 (2¼ / 2¼, pre-cut)",
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-18x24-poster-with-a-mat} */
  it("fits an 18x24 in the 20x30 only", () => {
    expect(write(frames(poster("18x24")).matted)).toEqual(["20x30 (1¼ / 3¼)"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-24x36-poster-with-a-mat} */
  it("fits a 24x36 in the 27x40 only", () => {
    expect(write(frames(poster("24x36")).matted)).toEqual(["27x40 (1¾ / 2¼)"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-27x40-poster-with-a-mat} */
  it("lists nothing for a 27x40", () => {
    expect(frames(poster("27x40")).matted).toEqual([]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-a2-poster-with-a-mat} */
  it("fits an A2 in the 20x30 only", () => {
    expect(write(frames(poster("A2")).matted)).toEqual(["20x30 (2 / 3½)"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-landscape-poster-with-a-mat} */
  it("turns the frames and borders for a 17x11", () => {
    expect(write(frames({ w: 17, h: 11 }).matted)).toEqual([
      "18x12 (¾ / ¾, pre-cut)",
      "20x16 (1¾ / 2¾)",
      "24x18 (3¾ / 3¾)",
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-non-square-poster-leaves-out-square-frames} */
  it("leaves the 16x16 out for a 13x14", () => {
    expect(write(frames({ w: 13, h: 14 }).matted)).toEqual(["16x20 (1¾ / 3¼)"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-square-poster-with-a-mat} */
  it("fits a 12x12 in its pre-cut 16x16", () => {
    expect(write(frames({ w: 12, h: 12 }).matted)).toEqual(["16x16 (2¼ / 2¼, pre-cut)"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-poster-frames-smallest-first} */
  it("sorts a 10x10's frames by area", () => {
    expect(write(frames({ w: 10, h: 10 }).matted)).toEqual([
      "12x12 (1¼ / 1¼)",
      "12x16 (1¼ / 3¼)",
      "16x16 (3¼ / 3¼)",
    ]);
  });
});

describe("pre-cut frames", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-near-square-poster-keeps-its-pre-cut-square-frames} */
  it("keeps the pre-cut 10x10 and 12x12 for a 7.7 × 8.3", () => {
    expect(write(frames({ w: 7.7, h: 8.3 }).matted)).toEqual([
      "10x10 (1¼ / 1¼, pre-cut)",
      "12x12 (2¼ / 2¼, pre-cut)",
      "11x14 (1⅞ / 3⅛)",
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-diploma-size-poster} */
  it("marks the 11x14 and 12x16 pre-cut for a diploma, as F5 does", () => {
    const pre = frames({ w: 8.5, h: 11 })
      .matted.filter((f) => f.preCut)
      .map((f) => f.frame.id);
    expect(pre).toEqual(["11x14", "12x16"]);
    expect(
      matSizes({ from: "print", print: { w: 8.5, h: 11 }, width: 2 })?.preCut.map((f) => f.id),
    ).toEqual(pre);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-poster-a-little-larger-than-its-pre-cut-mat} */
  it("gives the 12x18 the borders of its 11x17 mat for an 11.3 × 17.3", () => {
    expect(write(frames({ w: 11.3, h: 17.3 }).matted)[0]).toBe("12x18 (¾ / ¾, pre-cut)");
  });
});

describe("the custom frame when no standard frame takes a mat", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-27x40-posters-custom-frame} */
  it("gives a 27x40 the 30½ × 43½ frame", () => {
    expect(frames(poster("27x40")).customFrame).toEqual({ w: 30.5, h: 43.5 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-landscape-40x27-posters-custom-frame} */
  it("turns it for a 40x27", () => {
    expect(frames({ w: 40, h: 27 }).customFrame).toEqual({ w: 43.5, h: 30.5 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-poster-with-a-standard-frame-gets-no-custom-frame} */
  it("gives none to a 24x36", () => {
    expect(frames(poster("24x36")).customFrame).toBeUndefined();
  });
});

describe("the border range", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-poster-border-range} */
  it("is 1 to 4 inches", () => {
    expect(POSTER_BORDER).toEqual({ min: 1, max: 4 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-poster-border-just-outside-the-range} */
  it("leaves out the 20x24 for a 12x18", () => {
    const ids = frames(poster("12x18")).matted.map((f) => f.frame.id);
    expect(ids).toEqual(["16x20", "18x24"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-pre-cut-poster-frame-with-a-narrow-border} */
  it("keeps the pre-cut 12x18 for an 11x17 at ¾ in", () => {
    const first = frames(poster("11x17")).matted[0];
    expect(first?.frame.id).toBe("12x18");
    expect(first?.preCut).toBe(true);
    expect(first?.side).toBeLessThan(POSTER_BORDER.min);
  });
});

describe("a poster size that is not a positive number", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-poster-with-a-zero-width} */
  it("gets no answer for 0 by 17 or a negative side", () => {
    expect(posterFrames({ w: 0, h: 17 })).toBeUndefined();
    expect(posterFrames({ w: -11, h: 17 })).toBeUndefined();
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-poster-height-that-is-not-a-number} */
  it("gets no answer for NaN or Infinity", () => {
    expect(posterFrames({ w: 11, h: Number.NaN })).toBeUndefined();
    expect(posterFrames({ w: 11, h: Number.POSITIVE_INFINITY })).toBeUndefined();
  });
});

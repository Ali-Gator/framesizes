import { describe, expect, it } from "vitest";

import {
  type Art,
  exportSize,
  focusStep,
  hangMockup,
  KEY_STEP,
  mockupDefault,
  mockupOpening,
  mockupOptions,
  type MockupSize,
  mockupSizes,
  mockupView,
  type Placement,
  visiblePart,
} from "../mockup";
import { oneDecimal } from "../screen";

const PORTRAIT: Art = { width: 2000, height: 3000 };
const LANDSCAPE: Art = { width: 3000, height: 2000 };
const THREE_FOUR: Art = { width: 3000, height: 4000 };
const SQUARE: Art = { width: 2000, height: 2000 };
const A_SERIES: Art = { width: 2480, height: 3508 };
const WALL = { x: 0, y: 0, w: 144, h: 96 };

function sizes(art: Art): readonly MockupSize[] {
  const found = mockupSizes(art);
  if (!found) throw new Error(`no sizes for ${art.width} × ${art.height}`);
  return found;
}

function size(art: Art, id: string): MockupSize {
  const found = sizes(art).find((s) => s.id === id);
  if (!found) throw new Error(`${id} is not offered`);
  return found;
}

/** `id cut%` to one decimal, for one readable assertion. */
function cuts(art: Art, mat: boolean, ids?: readonly string[]): string[] {
  const options = mockupOptions(art, mat) ?? [];
  return options
    .filter((o) => !ids || ids.includes(o.size.id))
    .map((o) => `${o.size.id} ${o.cut === null ? "none" : oneDecimal(o.cut * 100)}`);
}

const defaultId = (art: Art, mat: boolean) => mockupDefault(art, mat)?.size.id;

const PORTRAIT_IDS = [
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
  "A3",
  "A2",
  "A1",
];

describe("the sizes a mockup offers", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-portrait-artwork} */
  it("lists the catalog then A3, A2, A1 for a portrait artwork", () => {
    const list = sizes(PORTRAIT);
    expect(list.map((s) => s.id)).toEqual(PORTRAIT_IDS);
    for (const s of list) expect(s.w).toBeLessThan(s.h);
    expect(size(PORTRAIT, "16x20").mat).toEqual({ w: 11, h: 14 });
    expect(size(PORTRAIT, "A2").mat).toBeNull();
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-landscape-artwork} */
  it("turns them for a landscape artwork", () => {
    const list = sizes(LANDSCAPE);
    expect(list).toHaveLength(17);
    expect(list.slice(0, 3).map((s) => s.id)).toEqual(["6x4", "7x5", "10x8"]);
    const a1 = list.at(-1);
    expect(a1?.id).toBe("A1");
    expect([oneDecimal(a1?.w ?? 0), oneDecimal(a1?.h ?? 0)]).toEqual(["33.1", "23.4"]);
    expect(size(LANDSCAPE, "36x24").mat).toEqual({ w: 30, h: 20 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-square-artwork} */
  it("gives a square artwork the square sizes", () => {
    expect(sizes(SQUARE).map((s) => s.id)).toEqual(["8x8", "10x10", "12x12", "16x16", "20x20"]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-nearly-square-artwork-counts-as-square} */
  it("counts a nearly square artwork as square", () => {
    expect(sizes({ width: 1000, height: 1050 }).map((s) => s.id)).toEqual([
      "8x8",
      "10x10",
      "12x12",
      "16x16",
      "20x20",
    ]);
  });
});

describe("the opening the artwork fills", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-pre-cut-16x20} */
  it("uses the 11x14 pre-cut mat of a 16x20", () => {
    expect(mockupOpening(size(PORTRAIT, "16x20"), true)).toEqual({ w: 10.5, h: 13.5 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-20x30-with-no-pre-cut-mat} */
  it("gives a 20x30 a 2 in mat", () => {
    expect(mockupOpening(size(PORTRAIT, "20x30"), true)).toEqual({ w: 16, h: 26 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-a2-with-a-mat} */
  it("gives an A2 a 2 in mat", () => {
    const opening = mockupOpening(size(PORTRAIT, "A2"), true);
    expect([oneDecimal(opening?.w ?? 0), oneDecimal(opening?.h ?? 0)]).toEqual(["12.5", "19.4"]);
    expect(opening?.w).toBeCloseTo(420 / 25.4 - 4, 9);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-without-a-mat-the-opening-is-the-frame} */
  it("is the frame without a mat", () => {
    expect(mockupOpening(size(PORTRAIT, "24x36"), false)).toEqual({ w: 24, h: 36 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-4x6-with-a-mat-has-no-opening} */
  it("keeps 4x6 first with no opening and no cut", () => {
    expect(mockupOpening(size(PORTRAIT, "4x6"), true)).toBeUndefined();
    const options = mockupOptions(PORTRAIT, true) ?? [];
    expect(options).toHaveLength(17);
    expect(options[0]).toMatchObject({ size: { id: "4x6" }, opening: null, cut: null });
    for (const o of options.slice(1)) {
      expect(o.opening).not.toBeNull();
      expect(o.cut).not.toBeNull();
    }
  });
});

describe("how much each size cuts", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-23-artwork-without-a-mat} */
  it("gives every size's cut for a 2:3 artwork without a mat", () => {
    expect(cuts(PORTRAIT, false)).toEqual([
      "4x6 0",
      "5x7 6.7",
      "8x10 16.7",
      "8.5x11 13.7",
      "11x14 15.2",
      "11x17 2.9",
      "12x16 11.1",
      "12x18 0",
      "16x20 16.7",
      "18x24 11.1",
      "20x24 20",
      "20x30 0",
      "24x36 0",
      "27x40 1.2",
      "A3 5.7",
      "A2 5.7",
      "A1 5.6",
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-34-artwork-with-a-mat} */
  it("gives the matted cuts for a 3:4 artwork", () => {
    expect(cuts(THREE_FOUR, true, ["12x16", "16x20", "18x24"])).toEqual([
      "12x16 1.6",
      "16x20 3.6",
      "18x24 5.6",
    ]);
  });
});

describe("the size a mockup opens on", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-23-artwork-opens-on-24x36} */
  it("opens a 2:3 artwork on 24x36", () => {
    expect(defaultId(PORTRAIT, false)).toBe("24x36");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-34-artwork-opens-on-18x24} */
  it("opens a 3:4 artwork on 18x24", () => {
    expect(defaultId(THREE_FOUR, false)).toBe("18x24");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-a-series-artwork-opens-on-a1} */
  it("opens an A-series artwork on A1", () => {
    expect(defaultId(A_SERIES, false)).toBe("A1");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-23-artwork-with-a-mat-opens-on-24x36} */
  it("opens a matted 2:3 artwork on 24x36", () => {
    expect(cuts(PORTRAIT, true, ["24x36", "A1"])).toEqual(["24x36 0.8", "A1 0.1"]);
    expect(defaultId(PORTRAIT, true)).toBe("24x36");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-34-artwork-with-a-mat-opens-on-12x16} */
  it("opens a matted 3:4 artwork on 12x16", () => {
    expect(defaultId(THREE_FOUR, true)).toBe("12x16");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-square-artwork-opens-on-20x20} */
  it("opens a square artwork on 20x20", () => {
    expect(defaultId(SQUARE, false)).toBe("20x20");
  });

  /** {@link openspec/specs/size-engine/spec.md#requirement-the-opening-a-mockup-artwork-fills-is-the-frame-or-its-mat-opening} */
  it("never opens on a size with no opening", () => {
    for (const art of [
      PORTRAIT,
      LANDSCAPE,
      THREE_FOUR,
      SQUARE,
      A_SERIES,
      { width: 10, height: 1000 },
    ])
      for (const mat of [false, true]) {
        const found = mockupDefault(art, mat);
        expect(found?.opening).toBeTruthy();
        expect(found?.cut).not.toBeNull();
      }
  });
});

describe("the visible part", () => {
  const opening = { w: 16, h: 20 };

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-23-artwork-in-a-16x20-centred} */
  it("centres a 2:3 artwork in a 16x20", () => {
    expect(visiblePart(PORTRAIT, opening)).toEqual({ x: 0, y: 250, w: 2000, h: 2500 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-focus-point-moves-it} */
  it("moves with the focus point", () => {
    expect(visiblePart(PORTRAIT, opening, 0)?.y).toBe(0);
    expect(visiblePart(PORTRAIT, opening, 1)?.y).toBe(500);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-34-artwork-in-a-16x20} */
  it("centres a 3:4 artwork in a 16x20", () => {
    expect(visiblePart(THREE_FOUR, opening)).toEqual({ x: 0, y: 125, w: 3000, h: 3750 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-focus-point-outside-0-to-1-is-held-at-the-edge} */
  it("holds a focus outside 0..1 at the edge", () => {
    expect(visiblePart(PORTRAIT, opening, 1.5)?.y).toBe(500);
    expect(visiblePart(PORTRAIT, opening, -1)?.y).toBe(0);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-artwork-of-the-openings-shape-is-not-cut} */
  it("shows the whole artwork in an opening of its shape", () => {
    for (const focus of [0, 0.5, 1])
      expect(visiblePart(PORTRAIT, { w: 24, h: 36 }, focus)).toEqual({
        x: 0,
        y: 0,
        w: 2000,
        h: 3000,
      });
  });

  /** {@link openspec/specs/size-engine/spec.md#requirement-the-visible-part-of-a-mockup-artwork-is-centred-and-follows-a-focus-point} */
  it("slides a landscape artwork along its width", () => {
    expect(visiblePart(LANDSCAPE, { w: 20, h: 16 }, 0)).toEqual({ x: 0, y: 0, w: 2500, h: 2000 });
    expect(visiblePart(LANDSCAPE, { w: 20, h: 16 }, 1)?.x).toBe(500);
  });
});

describe("a key press", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-arrow-and-shift--arrow-on-a-23-artwork-in-a-16x20} */
  it("moves a 2:3 artwork in a 16x20 by a quarter inch and an inch", () => {
    expect(focusStep(PORTRAIT, { w: 16, h: 20 }, KEY_STEP.arrow)).toBe(0.0625);
    expect(focusStep(PORTRAIT, { w: 16, h: 20 }, KEY_STEP.shift)).toBe(0.25);
    expect(focusStep(LANDSCAPE, { w: 20, h: 16 }, KEY_STEP.shift)).toBe(0.25);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-an-artwork-that-is-not-cut-does-not-move} */
  it("does not move an artwork that is not cut", () => {
    expect(focusStep(PORTRAIT, { w: 24, h: 36 }, KEY_STEP.arrow)).toBe(0);
  });
});

describe("the wall and the views", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-24x36-above-the-sofa} */
  it("hangs a 24x36 above the sofa", () => {
    expect(hangMockup({ w: 24, h: 36 }, "sofa")).toEqual({ x: 59, y: 42, w: 26, h: 38 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-24x36-on-a-plain-wall} */
  it("centres a 24x36 on the 57 in line", () => {
    expect(hangMockup({ w: 24, h: 36 }, "plain")).toEqual({ x: 59, y: 38, w: 26, h: 38 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-whole-wall} */
  it("gives the whole wall", () => {
    expect(mockupView(hangMockup({ w: 24, h: 36 }, "sofa"), "wall")).toEqual(WALL);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-24x36-close-up-above-the-sofa} */
  it("gives a 24x36 close-up", () => {
    expect(mockupView(hangMockup({ w: 24, h: 36 }, "sofa"), "close")).toEqual({
      x: 49.5,
      y: 32.5,
      w: 45,
      h: 57,
    });
  });

  /**
   * {@link openspec/specs/size-engine/spec.md#scenario-the-largest-frame-fits-the-wall}
   * {@link openspec/specs/size-engine/spec.md#requirement-a-mockup-has-a-whole-wall-view-and-a-close-up}
   */
  it("keeps every offered size and its close-up inside the wall", () => {
    const inside = (r: { x: number; y: number; w: number; h: number }) =>
      r.x >= 0 && r.y >= 0 && r.x + r.w <= WALL.w && r.y + r.h <= WALL.h;
    for (const art of [PORTRAIT, LANDSCAPE, SQUARE])
      for (const s of sizes(art))
        for (const placement of ["sofa", "plain"] as Placement[]) {
          const outside = hangMockup(s, placement);
          expect(inside(outside), `${s.id} ${placement}`).toBe(true);
          expect(inside(mockupView(outside, "close")), `${s.id} ${placement} close`).toBe(true);
        }
  });
});

describe("the saved PNG", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-whole-wall-saved} */
  it("saves the whole wall at 2400 × 1600", () => {
    expect(exportSize(WALL)).toEqual({ w: 2400, h: 1600 });
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-24x36-close-up-saved} */
  it("saves the 24x36 close-up at 1895 × 2400", () => {
    expect(exportSize(mockupView(hangMockup({ w: 24, h: 36 }, "sofa"), "close"))).toEqual({
      w: 1895,
      h: 2400,
    });
  });
});

describe("an artwork with no answer", () => {
  const BAD: readonly Art[] = [
    { width: 0, height: 3000 },
    { width: -2000, height: 3000 },
    { width: 2000, height: Number.NaN },
    { width: 2000, height: Number.POSITIVE_INFINITY },
  ];

  /**
   * {@link openspec/specs/size-engine/spec.md#scenario-a-zero-width}
   * {@link openspec/specs/size-engine/spec.md#scenario-a-negative-side-nan-and-infinity}
   */
  it("gets no sizes, options, default, visible part or focus change", () => {
    for (const art of BAD) {
      expect(mockupSizes(art)).toBeUndefined();
      expect(mockupOptions(art, false)).toBeUndefined();
      expect(mockupDefault(art, true)).toBeUndefined();
      expect(visiblePart(art, { w: 16, h: 20 })).toBeUndefined();
      expect(focusStep(art, { w: 16, h: 20 }, KEY_STEP.arrow)).toBeUndefined();
    }
  });
});

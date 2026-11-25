import { describe, expect, it } from "vitest";

import { scene } from "../scene";
import { INITIAL, type State } from "../state";

const at = (patch: Partial<State>) => scene({ ...INITIAL, ...patch });

describe("the picture's geometry", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-above-the-sofa} */
  it("hangs 24x36 above the sofa with its outside 16 in from the wall's top", () => {
    const s = at({});
    expect(s.outside).toEqual({ x: 59, y: 16, w: 26, h: 38 });
    expect(s.view).toEqual({ x: 0, y: 0, w: 144, h: 96 });
    expect(s.sofa).toBe(true);
    expect(s.mat).toBeNull();
    expect(s.opening).toEqual({ x: 60, y: 17, w: 24, h: 36 });
    expect(s.art).toEqual(s.opening);
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-a-plain-wall-in-close-up} */
  it("starts the close-up 6.5 in from the wall's top, and drops the sofa on a plain wall", () => {
    expect(at({ view: "close" }).view).toEqual({ x: 49.5, y: 6.5, w: 45, h: 57 });
    const plain = at({ view: "close", placement: "plain" });
    expect(plain.sofa).toBe(false);
    expect(plain.outside).toEqual({ x: 59, y: 20, w: 26, h: 38 });
    expect(plain.view).toEqual({ x: 49.5, y: 10.5, w: 45, h: 57 });
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-24x36-with-its-pre-cut-mat} */
  it("draws 24x36's pre-cut mat and its 19½ × 29½ in opening", () => {
    const s = at({ mat: true });
    expect(s.mat).toEqual({ x: 60, y: 17, w: 24, h: 36 });
    expect(s.opening).toEqual({ x: 62.25, y: 20.25, w: 19.5, h: 29.5 });
  });

  /** {@link openspec/specs/frame-mockup/spec.md#requirement-the-artwork-fills-the-opening-and-can-be-moved} */
  it("draws 2:3 art in 16x20 at its focus, filling the opening and never stretched", () => {
    const base = at({ size: "16x20" });
    const { opening } = base;
    for (const [focus, dy] of [
      [0, 0],
      [0.5, 2],
      [1, 4],
    ] as const) {
      const { art } = at({ size: "16x20", focus });
      expect(art.x).toBeCloseTo(opening.x, 9);
      expect(art.y).toBeCloseTo(opening.y - dy, 9);
      expect(art.w).toBeCloseTo(16, 9);
      expect(art.h).toBeCloseTo(24, 9);
    }
  });
});

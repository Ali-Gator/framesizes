import { describe, expect, it } from "vitest";

import { initialState, placeOf } from "@/components/gallery-wall/state";

import type { FoundSize } from "../find-sizes";
import {
  distancesOf,
  hangPrint,
  outsideOf,
  placed,
  tipOf,
  turnSize,
  withDistance,
} from "../try/hang";
import { chosenSize, startTry, tryReducer, waitReason } from "../try/try-reducer";

const { wall, furniture } = placeOf(initialState());
const size = (w: number, h: number, label = `${w} × ${h} in`): FoundSize => ({
  w,
  h,
  unit: "in",
  label,
});
const P24 = size(24, 36);
/** The four distances, read as the rows show them: ceiling, sofa, left, right. */
const four = (rect: ReturnType<typeof hangPrint>) => {
  const d = distancesOf(rect, wall, furniture);
  return [d.above?.value, d.below?.value, d.left?.value, d.right?.value];
};

/** {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-print-hangs-at-true-size-on-the-saved-wall} */
describe("the print on the wall", () => {
  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-unframed-in-the-sample-room} */
  it("hangs a 24 × 36 print 8 in above the sample sofa, centred", () => {
    const rect = hangPrint(outsideOf(P24, false), wall, furniture);
    expect(four(rect)).toEqual([18, 8, 60, 60]);
    expect(distancesOf(rect, wall, furniture).below?.to).toBe("furniture");
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-with-a-1-in-frame} */
  it("adds the 1 in moulding when framed", () => {
    const rect = hangPrint(outsideOf(P24, true), wall, furniture);
    expect([rect.w, rect.h]).toEqual([26, 38]);
    expect(four(rect)).toEqual([16, 8, 59, 59]);
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-landscape-picture} */
  it("turns the size the way the picture runs", () => {
    expect(turnSize(P24, true)).toEqual({ w: 36, h: 24 });
    expect(turnSize(size(36, 24), false)).toEqual({ w: 24, h: 36 });
    expect(turnSize(size(36, 24), null)).toEqual({ w: 36, h: 24 });
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-setting-a-distance} */
  it("moves the print to a set distance", () => {
    const base = hangPrint(outsideOf(P24, false), wall, furniture);
    const moved = withDistance(base, "below", 10, wall, furniture);
    expect(four(moved).slice(0, 2)).toEqual([16, 10]);
    const at = { dx: moved.x - base.x, dy: moved.y - base.y };
    expect(placed(base, at)).toEqual(moved);
  });

  it("centres on the 57 in line with no furniture", () => {
    const rect = hangPrint({ w: 24, h: 36 }, wall, null);
    expect(rect.y + rect.h / 2).toBe(57);
    expect(rect.x).toBe(60);
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-the-tip-over-the-sample-sofa} */
  it("names art two-thirds of the sofa's width", () => {
    expect(furniture && tipOf(furniture)).toEqual({ art: 56, under: 84 });
  });
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-size-step-asks-for-the-size-the-visitor-would-buy} */
describe("the size step", () => {
  const three = [size(12, 16), size(18, 24), P24];

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-several-sizes-found} */
  it("waits for a pick when the page lists several sizes", () => {
    const state = startTry("t1", three);
    expect(state.picked).toBeNull();
    expect(waitReason(state, three, "in")).toBe("Pick a size first: this page lists three.");
    const picked = tryReducer(state, { type: "pick", picked: 2 });
    expect(waitReason(picked, three, "in")).toBeNull();
    expect(chosenSize(picked, three, "in")).toEqual(P24);
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-one-size-found} */
  it("picks the one size found", () => {
    const state = startTry("t1", [P24]);
    expect(state.picked).toBe(0);
    expect(waitReason(state, [P24], "in")).toBeNull();
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-no-size-found} */
  it("opens the fields when no size is found and waits for both lengths", () => {
    let state = startTry("t1", []);
    expect(state.picked).toBe("other");
    expect(waitReason(state, [], "in")).toBe("Type the width and height first.");
    state = tryReducer(state, { type: "text", field: "w", text: "60" });
    expect(waitReason(state, [], "cm")).not.toBeNull();
    state = tryReducer(state, { type: "text", field: "h", text: "90" });
    const chosen = chosenSize(state, [], "cm");
    expect(chosen?.label).toBe("60 × 90 cm");
    expect(chosen?.w).toBeCloseTo(60 / 2.54, 9);
  });

  it("starts again only for a new try, and goes back to the size step", () => {
    const state = tryReducer(startTry("t1", three), { type: "pick", picked: 1 });
    expect(tryReducer(state, { type: "start", id: "t1", sizes: three })).toBe(state);
    expect(tryReducer(state, { type: "start", id: "t2", sizes: three }).picked).toBeNull();
    const hung = tryReducer(tryReducer(state, { type: "hang" }), { type: "move", dx: 2, dy: 1 });
    expect(hung.step).toBe("hang");
    expect(tryReducer(hung, { type: "change" })).toMatchObject({ step: "size", picked: 1 });
  });
});

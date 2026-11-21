// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { forgetCheck, loadCheck, saveCheck } from "../saved";

const SCREEN = { w: 393, h: 852, dpr: 2 };

beforeEach(() => {
  window.localStorage.clear();
  forgetCheck();
});
afterEach(() => vi.restoreAllMocks());

describe("the saved check", () => {
  /** {@link openspec/specs/actual-size/spec.md#scenario-the-same-phone-tomorrow} */
  it("comes back for the same screen", () => {
    saveCheck({ scale: 156.2, method: "card" }, SCREEN);
    forgetCheck(); // a new page view: only storage is left
    expect(loadCheck(SCREEN)).toEqual({ scale: 156.2, method: "card" });
    expect(JSON.parse(window.localStorage.getItem("screen-scale") ?? "")).toEqual({
      scale: 156.2,
      method: "card",
      w: 393,
      h: 852,
      dpr: 2,
    });
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-a-new-pixel-ratio} */
  it("is ignored once the screen's width, height or pixel ratio changes", () => {
    saveCheck({ scale: 156.2, method: "card" }, SCREEN);
    forgetCheck();
    expect(loadCheck({ ...SCREEN, dpr: 3 })).toBeNull();
    expect(loadCheck({ ...SCREEN, w: 390 })).toBeNull();
    expect(loadCheck({ ...SCREEN, h: 844 })).toBeNull();
  });

  /** {@link openspec/specs/actual-size/spec.md#requirement-a-check-is-kept-on-the-device-for-the-same-screen} */
  it("ignores a stored value that is not a check", () => {
    window.localStorage.setItem("screen-scale", "{nope");
    expect(loadCheck(SCREEN)).toBeNull();
    window.localStorage.setItem(
      "screen-scale",
      JSON.stringify({ ...SCREEN, scale: -1, method: "card" }),
    );
    expect(loadCheck(SCREEN)).toBeNull();
    window.localStorage.setItem(
      "screen-scale",
      JSON.stringify({ ...SCREEN, scale: 150, method: "glue" }),
    );
    expect(loadCheck(SCREEN)).toBeNull();
  });

  /** {@link openspec/specs/actual-size/spec.md#requirement-a-check-is-kept-on-the-device-for-the-same-screen} */
  it("lasts the page view when storage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    saveCheck({ scale: 140, method: "ruler" }, SCREEN);
    expect(loadCheck(SCREEN)).toEqual({ scale: 140, method: "ruler" });
    expect(loadCheck({ ...SCREEN, dpr: 3 })).toBeNull();
  });
});

describe("a rotated screen", () => {
  /** {@link openspec/specs/actual-size/spec.md#scenario-a-turned-phone} */
  it("keeps the check when the width and height swap", () => {
    saveCheck({ scale: 156.2, method: "card" }, SCREEN);
    forgetCheck();
    expect(loadCheck({ w: 852, h: 393, dpr: 2 })).toEqual({ scale: 156.2, method: "card" });
  });
});

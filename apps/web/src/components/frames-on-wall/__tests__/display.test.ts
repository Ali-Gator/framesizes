import { describe, expect, it } from "vitest";

import {
  markError,
  MAX_FRAMES,
  parseLength,
  roundDistance,
  SHORT_MARK_PX,
  stepDistance,
  writeDistance,
  writeNumber,
} from "../display";

describe("writing a distance", () => {
  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-sample-room-in-centimetres} */
  it("writes the sample room's distances in both units", () => {
    expect([8, 32, 63].map((d) => writeDistance(d, "in"))).toEqual(["8 in", "32 in", "63 in"]);
    expect([8, 32, 63].map((d) => writeDistance(d, "cm"))).toEqual(["20 cm", "81 cm", "160 cm"]);
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#requirement-every-number-shows-in-the-visitors-unit} */
  it("rounds to the nearest ¼ in or whole centimetre", () => {
    expect(writeDistance(8.25, "in")).toBe("8¼ in");
    expect(writeDistance(8.4, "in")).toBe("8½ in");
    expect(writeNumber(0.75, "in")).toBe("¾");
    expect(writeNumber(0, "in")).toBe("0");
    expect(roundDistance(8.1, "in")).toBe(8);
    expect(roundDistance(8.25, "cm")).toBe(21);
  });
});

describe("parseLength", () => {
  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-a-fraction-is-typed} */
  it("reads decimals and fractions in inches", () => {
    expect(parseLength("8.25", "in")).toBe(8.25);
    expect(parseLength("8,25", "in")).toBe(8.25);
    expect(parseLength("8 1/4", "in")).toBe(8.25);
    expect(parseLength("8¼", "in")).toBe(8.25);
    expect(parseLength(" 10 ", "in")).toBe(10);
    expect(parseLength("1/2", "in")).toBe(0.5);
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-text-that-is-not-a-length} */
  it("gives null for text that is not a length", () => {
    for (const text of ["abc", "", " ", "-3", "8 1/0", "8.", "1/2/3"]) {
      expect(parseLength(text, "in"), text).toBeNull();
    }
  });

  it("reads a typed number in the visitor's unit", () => {
    expect(parseLength("20", "cm")).toBeCloseTo(20 / 2.54);
  });
});

describe("stepDistance", () => {
  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-more-button} */
  it("steps ¼ in or 1 cm from the shown value", () => {
    expect(stepDistance(8, 1, "in")).toBe(8.25);
    expect(stepDistance(8.1, -1, "in")).toBe(7.75);
    expect(stepDistance(8, 1, "cm")).toBeCloseTo(21 / 2.54);
  });
});

describe("the short-mark rule", () => {
  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-a-credit-card-on-a-wide-photo} */
  it("flags marks under 134 px and gives the worst-case error", () => {
    expect(SHORT_MARK_PX).toBe(134);
    expect(markError(SHORT_MARK_PX)).toBeLessThan(0.03);
    expect(markError(SHORT_MARK_PX - 1)).toBeGreaterThan(0.03);
    expect(Math.round(markError(27) * 100)).toBe(15);
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-seventh-frame} */
  it("holds six frames", () => {
    expect(MAX_FRAMES).toBe(6);
  });
});

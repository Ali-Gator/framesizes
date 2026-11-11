import { describe, expect, it } from "vitest";

import { feetAndInches, toCm, writeSize } from "../units";

describe("units", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-common-sizes-in-centimetres} */
  it("converts inches to centimetres at one decimal", () => {
    expect([8, 10, 8.5, 24, 36].map(toCm)).toEqual([20.3, 25.4, 21.6, 61, 91.4]);
    expect(String(toCm(24))).toBe("61");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-three-forms-of-one-size} */
  it("writes a size in the three forms", () => {
    const size = { w: 8, h: 10 };
    expect(writeSize(size, "search")).toBe("8x10");
    expect(writeSize(size, "in")).toBe("8 × 10 in");
    expect(writeSize(size, "cm")).toBe("20.3 × 25.4 cm");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-turned-size} */
  it("writes a turned size width first", () => {
    expect(writeSize({ w: 10, h: 8 }, "in")).toBe("10 × 8 in");
  });

  it("writes a height in feet and inches", () => {
    expect(feetAndInches(96)).toBe("8 ft");
    expect(feetAndInches(69)).toBe("5 ft 9 in");
    expect(feetAndInches(80)).toBe("6 ft 8 in");
  });
});

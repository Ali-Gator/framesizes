import { describe, expect, it } from "vitest";

import { feetAndInches, inEighths, readLength, toCm, writeEighths, writeSize } from "../units";

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

describe("eighths of an inch", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-lengths-in-eighths} */
  it("writes a length to the nearest eighth", () => {
    expect([7.5, 0.25, 8.125, 1.25, 10, 8.04].map(inEighths)).toEqual([
      "7½",
      "¼",
      "8⅛",
      "1¼",
      "10",
      "8",
    ]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-size-in-eighths} */
  it("writes a size in eighths, and in one-decimal centimetres", () => {
    const size = { w: 7.5, h: 9.5 };
    expect(writeEighths(size)).toBe("7½ × 9½ in");
    expect(writeSize(size, "cm")).toBe("19.1 × 24.1 cm");
  });
});

describe("a typed length", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-forms-of-eight-and-an-eighth} */
  it("reads eight and an eighth in every form", () => {
    for (const text of ["8 1/8", "8-1/8", "8⅛", "8.125", " 8.125 "])
      expect(readLength(text), text).toBe(8.125);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-other-forms} */
  it("reads a decimal comma, a glyph, a fraction and a whole number", () => {
    expect(["8,5", "½", "3/4", "12"].map(readLength)).toEqual([8.5, 0.5, 0.75, 12]);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-text-that-is-not-a-length} */
  it("gives no number for text that is not a length", () => {
    for (const text of ["", "abc", "8 1/0", "-2", "8 in"])
      expect(readLength(text), text).toBeUndefined();
  });
});

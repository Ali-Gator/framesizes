import { describe, expect, it } from "vitest";

import { findSizes } from "../find-sizes";

const labels = (text: string) => findSizes(text).map((s) => s.label);

/** {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-sizes-come-from-the-page-text} */
describe("the sizes in a page's text", () => {
  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-the-forms-the-canvas-names} */
  it("reads the canvas's three forms, the third the same size as the first", () => {
    const sizes = findSizes("Pick 24 x 36 in, or 60 × 90 cm. Also sold as 24x36.");
    expect(sizes.map((s) => s.label)).toEqual(["24 × 36 in", "60 × 90 cm"]);
    expect(sizes[0]).toEqual({ w: 24, h: 36, unit: "in", label: "24 × 36 in" });
    expect(sizes[1]?.unit).toBe("cm");
    expect(sizes[1]?.w).toBeCloseTo(60 / 2.54, 9);
    expect(sizes[1]?.h).toBeCloseTo(90 / 2.54, 9);
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-numbers-that-are-not-print-sizes} */
  it("finds no size in pixels or out of range", () => {
    expect(findSizes("1920x1080, 1920 x 1080 px and 2 x 2 in")).toEqual([]);
    // A pixel size in range, so only the px check keeps it out: no "24 × 3".
    expect(findSizes("Image 24 x 36 px, 18x24 pixels")).toEqual([]);
  });

  it("reads past a canvas's depth, and skips feet and metres", () => {
    expect(labels("Canvas, 60 × 90 × 3 cm")).toEqual(["60 × 90 cm"]);
    expect(labels('16 x 20 x 1.5" deep')).toEqual(["16 × 20 in"]);
    expect(findSizes("Rug 4 x 6 ft, mat 5 x 7 m, 6 x 9' runner")).toEqual([]);
    expect(labels("24 x 36 matte")).toEqual(["24 × 36 in"]);
  });

  it("reads millimetres and comma decimals as exact inches", () => {
    const [mm] = findSizes("A2 poster, 420 x 594 mm");
    expect(mm?.label).toBe("420 × 594 mm");
    expect(mm?.w).toBeCloseTo(420 / 25.4, 9);
    const [comma] = findSizes("Format 29,7 x 42 cm");
    expect(comma?.label).toBe("29,7 × 42 cm");
    expect(comma?.w).toBeCloseTo(29.7 / 2.54, 9);
  });

  it("counts a size with no unit as inches, and a unit on either number for both", () => {
    expect(findSizes("16x20")).toEqual([{ w: 16, h: 20, unit: "in", label: "16 × 20 in" }]);
    expect(labels("50 cm x 70")).toEqual(["50 × 70 cm"]);
    expect(labels('Sizes: 24" x 36", 12″ × 16″ and 18 by 24 inches')).toEqual([
      "24 × 36 in",
      "12 × 16 in",
      "18 × 24 in",
    ]);
    expect(labels("11in x 14in")).toEqual(["11 × 14 in"]);
  });

  it("lists a size once whichever way round, in page order", () => {
    expect(labels("36 x 24 in, then 24 x 36 in, then 60.96 x 91.44 cm")).toEqual(["36 × 24 in"]);
  });

  it("keeps the first eight", () => {
    const text = Array.from({ length: 10 }, (_, i) => `${10 + i} x ${20 + i} in`).join(", ");
    const sizes = findSizes(text);
    expect(sizes).toHaveLength(8);
    expect(sizes[0]?.label).toBe("10 × 20 in");
    expect(sizes[7]?.label).toBe("17 × 27 in");
  });
});

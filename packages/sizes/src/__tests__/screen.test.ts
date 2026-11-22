import { describe, expect, it } from "vitest";

import { findFrame } from "../frames";
import { KNOWN_THINGS } from "../wall";
import {
  ACTUAL_SIZES,
  CHECK_OBJECTS,
  guessDiagonal,
  guessScale,
  isTabletScreen,
  scaleFromDiagonal,
  writeActual,
} from "../screen";

const MM = 25.4;
const actual = (id: string) => {
  const found = ACTUAL_SIZES.find((s) => s.id === id);
  if (!found) throw new Error(`no actual size ${id}`);
  return found;
};

describe("the actual size list", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-list} */
  it("holds seven sizes in order, the inch ones from the catalog", () => {
    expect(ACTUAL_SIZES.map((s) => s.id)).toEqual([
      "4x6",
      "5x7",
      "8x10",
      "11x14",
      "16x20",
      "A4",
      "A3",
    ]);
    expect(ACTUAL_SIZES.map((s) => s.label)).toEqual([
      "4×6",
      "5×7",
      "8×10",
      "11×14",
      "16×20",
      "A4",
      "A3",
    ]);
    for (const id of ["4x6", "5x7", "8x10", "11x14", "16x20"]) {
      const frame = findFrame(id);
      expect(frame, id).toBeDefined();
      expect({ w: actual(id).w, h: actual(id).h }).toEqual({ w: frame?.w, h: frame?.h });
    }
    for (const s of ACTUAL_SIZES) expect(s.w, s.id).toBeLessThan(s.h);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-a-series-sizes-in-both-units} */
  it("writes A4 and A3 in both units from their millimetres", () => {
    expect(actual("A4").w).toBeCloseTo(210 / MM, 10);
    expect(actual("A3").h).toBeCloseTo(420 / MM, 10);
    expect(writeActual(actual("A4"), "cm")).toBe("21.0 × 29.7 cm");
    expect(writeActual(actual("A4"), "in")).toBe("8.3 × 11.7 in");
    expect(writeActual(actual("A3"), "cm")).toBe("29.7 × 42.0 cm");
    expect(writeActual(actual("A3"), "in")).toBe("11.7 × 16.5 in");
    expect(writeActual(actual("8x10"), "in")).toBe("8 × 10 in");
    expect(writeActual(actual("8x10"), "cm")).toBe("20.3 × 25.4 cm");
  });
});

describe("the things that check a scale", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-cards-edges} */
  it("holds both edges of the card, the Letter sheet and the A4 sheet", () => {
    expect(CHECK_OBJECTS.card.short * MM).toBeCloseTo(53.98, 10);
    expect(CHECK_OBJECTS.card.long * MM).toBeCloseTo(85.6, 10);
    expect(CHECK_OBJECTS.letter).toEqual({ short: 8.5, long: 11 });
    expect(CHECK_OBJECTS.a4.short * MM).toBeCloseTo(210, 10);
    expect(CHECK_OBJECTS.a4.long * MM).toBeCloseTo(297, 10);
  });
});

describe("a screen's scale from its diagonal", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-61-in-phone} */
  it("divides the screen's straight-line length by the diagonal", () => {
    expect(scaleFromDiagonal(393, 852, 6.1)).toBeCloseTo(153.8, 1);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-no-diagonal} */
  it("gives no scale for a diagonal or side that is not a positive number", () => {
    expect(scaleFromDiagonal(393, 852, 0)).toBeNull();
    expect(scaleFromDiagonal(393, 852, -6)).toBeNull();
    expect(scaleFromDiagonal(393, 852, Number.NaN)).toBeNull();
    expect(scaleFromDiagonal(393, 852, Number.POSITIVE_INFINITY)).toBeNull();
    expect(scaleFromDiagonal(0, 852, 6.1)).toBeNull();
  });
});

describe("the first guess", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-phone} */
  it("guesses 6.1 in for a phone", () => {
    const screen = { w: 393, h: 852, coarse: true };
    expect(guessDiagonal(screen)).toBe(6.1);
    expect(guessScale(screen)).toBeCloseTo(153.8, 1);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-13-in-laptop} */
  it("guesses 14 in for a laptop", () => {
    const screen = { w: 1470, h: 956, coarse: false };
    expect(guessDiagonal(screen)).toBe(14);
    expect(Math.abs(guessScale(screen) - 125.2)).toBeLessThan(0.1);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-monitor} */
  it("guesses 23 in for a monitor", () => {
    const screen = { w: 1920, h: 1080, coarse: false };
    expect(guessDiagonal(screen)).toBe(23);
    expect(guessScale(screen)).toBeCloseTo(95.8, 1);
  });

  /** {@link openspec/specs/size-engine/spec.md#requirement-a-screens-scale-has-a-first-guess} */
  it("guesses 11 in for a tablet with a coarse pointer", () => {
    expect(guessDiagonal({ w: 820, h: 1180, coarse: true })).toBe(11);
    expect(guessDiagonal({ w: 1180, h: 820, coarse: true })).toBe(11);
  });
});

describe("a tablet's screen", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-tablet} */
  it("is a coarse screen too wide for a phone, and gets the 11 in guess", () => {
    const tablet = { w: 820, h: 1180, coarse: true };
    expect(isTabletScreen(tablet)).toBe(true);
    expect(guessDiagonal(tablet)).toBe(11);
    expect(guessScale(tablet)).toBeCloseTo(130.6, 1);
    expect(isTabletScreen({ ...tablet, coarse: false })).toBe(false);
    expect(isTabletScreen({ w: 393, h: 852, coarse: true })).toBe(false);
  });
});

describe("the wall tool's fixed lengths", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-wall-tool-still-marks-long-edges} */
  it("are the long edges of the shared record", () => {
    const fixed = (id: string) => {
      const length = KNOWN_THINGS.find((k) => k.id === id)?.length;
      return length?.kind === "fixed" ? length.inches : undefined;
    };
    expect(fixed("letter")).toBe(11);
    expect((fixed("a4") ?? 0) * MM).toBeCloseTo(297, 10);
    expect((fixed("card") ?? 0) * MM).toBeCloseTo(85.6, 10);
    expect(fixed("card")).toBe(CHECK_OBJECTS.card.long);
  });
});

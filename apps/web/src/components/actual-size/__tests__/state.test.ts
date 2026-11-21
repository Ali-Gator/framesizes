import { CHECK_OBJECTS } from "@framesizes/sizes";
import { describe, expect, it } from "vitest";

import {
  initialState,
  lineGap,
  phonesLine,
  reducer,
  rulerInches,
  SCALE_RANGE,
  sheetFits,
  sizeOf,
  statusText,
  tagText,
  type ViewerAction,
  type ViewerState,
  visiblePart,
} from "../state";

const PHONE = { w: 393, h: 852 };
const run = (actions: ViewerAction[], from: ViewerState = initialState) =>
  actions.reduce(reducer, from);
/** The state once the client knows a guessed scale of 150 and no saved check. */
const guessed = run([{ type: "init", scale: 150, check: null }]);

describe("the viewer's steps", () => {
  /** {@link openspec/specs/actual-size/spec.md#scenario-first-visit} */
  it("opens on 8x10 in view, with no check", () => {
    expect(initialState.size).toBe("8x10");
    expect(initialState.mode).toBe("view");
    expect(initialState.check).toBeNull();
    expect(statusText(initialState.check)).toBe("Scale is a guess");
    expect(tagText(initialState.check)).toBe("Approximate: scale not checked");
  });

  /** {@link openspec/specs/actual-size/spec.md#requirement-the-viewer-offers-seven-sizes-and-opens-on-8x10} */
  it("picks a size", () => {
    const s = run([{ type: "pick", size: "A4" }], guessed);
    expect(s.size).toBe("A4");
    expect(sizeOf(s).label).toBe("A4");
    expect(run([{ type: "pick", size: "9x9" }], guessed).size).toBe("8x10");
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-unchecked} */
  it("opens the card check first when unchecked, then the full view after Done", () => {
    const card = run([{ type: "see" }], guessed);
    expect(card.mode).toBe("card");
    expect(card.next).toBe("full");
    const done = run([{ type: "done" }], card);
    expect(done.mode).toBe("full");
    expect(done.check).toBe("card");
    expect(statusText(done.check)).toBe("Checked with a card");
    expect(tagText(done.check)).toBe("Actual size");
  });

  /** {@link openspec/specs/actual-size/spec.md#requirement-the-first-look-at-actual-size-asks-for-a-check} */
  it("goes straight to the full view with a checked scale", () => {
    const checked = run([{ type: "init", scale: 160, check: "screen" }]);
    expect(run([{ type: "see" }], checked).mode).toBe("full");
    expect(statusText("screen")).toBe("Checked with screen size");
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-skipping-the-check} */
  it("skips to the full view, keeping the guess and no check", () => {
    const s = run([{ type: "see" }, { type: "slide", scale: 170 }, { type: "skip" }], guessed);
    expect(s.mode).toBe("full");
    expect(s.check).toBeNull();
    expect(s.scale).toBe(150);
  });

  /** {@link openspec/specs/actual-size/spec.md#requirement-the-desktop-box-shows-the-size-at-11} */
  it("cancels a check back to the scale it started with", () => {
    const s = run(
      [{ type: "open", method: "sheet" }, { type: "slide", scale: 99 }, { type: "cancel" }],
      guessed,
    );
    expect(s.mode).toBe("view");
    expect(s.scale).toBe(150);
  });

  /** {@link openspec/specs/actual-size/spec.md#requirement-the-desktop-box-shows-the-size-at-11} */
  it("switches tabs without losing the scale to restore", () => {
    const s = run(
      [
        { type: "open", method: "card" },
        { type: "slide", scale: 120 },
        { type: "open", method: "ruler" },
        { type: "cancel" },
      ],
      guessed,
    );
    expect(s.scale).toBe(150);
  });

  /** {@link openspec/specs/actual-size/spec.md#requirement-the-card-check-matches-one-edge-of-a-credit-card} */
  it("slides and nudges the scale, within the slider's range", () => {
    expect(run([{ type: "slide", scale: 140 }], guessed).scale).toBe(140);
    expect(run([{ type: "nudge", by: 0.2 }], guessed).scale).toBeCloseTo(150.2, 10);
    expect(run([{ type: "nudge", by: -0.2 }], guessed).scale).toBeCloseTo(149.8, 10);
    expect(run([{ type: "slide", scale: 999 }], guessed).scale).toBe(240);
    expect(run([{ type: "slide", scale: Number.NaN }], guessed).scale).toBe(150);
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-matching-the-card} */
  it("saves 156.2 px per inch when the card's lines are 332.0 px apart", () => {
    const scale = 332 / CHECK_OBJECTS.card.short;
    const s = run(
      [
        { type: "open", method: "card" },
        { type: "slide", scale },
      ],
      guessed,
    );
    expect(lineGap(s.scale, CHECK_OBJECTS.card.short)).toBeCloseTo(332.0, 6);
    const done = run([{ type: "done" }], s);
    expect(done.scale).toBeCloseTo(156.2, 1);
    expect(done.check).toBe("card");
    expect(done.mode).toBe("view");
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-a-61-in-phone} */
  it("sets the scale from a picked diagonal", () => {
    const s = run(
      [
        { type: "open", method: "screen" },
        { type: "diagonal", value: 6.1, ...PHONE },
      ],
      guessed,
    );
    expect(s.diagonal).toBe(6.1);
    expect(s.scale).toBeCloseTo(153.8, 1);
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-a-length-that-is-not-a-number} */
  it("ignores a typed diagonal that is not a positive number", () => {
    for (const value of ["abc", "0", "", "-5", 0]) {
      const s = run([{ type: "diagonal", value, ...PHONE }], guessed);
      expect(s.scale, String(value)).toBe(150);
      expect(s.diagonal, String(value)).toBeNull();
    }
    expect(run([{ type: "diagonal", value: "6.1", ...PHONE }], guessed).scale).toBeCloseTo(
      153.8,
      1,
    );
  });

  /** {@link openspec/specs/actual-size/spec.md#requirement-the-phone-shows-the-size-at-11-over-the-whole-screen} */
  it("closes the full view back to the answer step", () => {
    const s = run([
      { type: "init", scale: 150, check: "card" },
      { type: "see" },
      { type: "close" },
    ]);
    expect(s.mode).toBe("view");
  });

  /** {@link openspec/specs/actual-size/spec.md#requirement-a-sheet-of-paper-is-offered-only-where-it-fits} */
  it("picks a Letter or A4 sheet", () => {
    expect(initialState.sheet).toBe("letter");
    expect(run([{ type: "sheet", sheet: "a4" }], guessed).sheet).toBe("a4");
  });
});

describe("what the viewer says", () => {
  /** {@link openspec/specs/actual-size/spec.md#scenario-8x10-on-a-61-in-phone} */
  it("counts phone screens for 8x10 on a 6.1 in phone", () => {
    expect(phonesLine(sizeOf(initialState), PHONE, 153.8)).toBe(
      "About 3.1 phone screens wide and 1.8 tall.",
    );
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-a-size-smaller-than-the-phone} */
  it("says a small size fits the phone", () => {
    const s = run([{ type: "pick", size: "4x6" }], guessed);
    expect(phonesLine(sizeOf(s), PHONE, 80)).toBe("It fits on your phone's screen.");
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-8x10-on-a-monitor} */
  it("shows 8 × 5.6 in of 8x10 in a 1038 × 560 box at 95.8", () => {
    const part = visiblePart(sizeOf(initialState), { w: 1038, h: 560 }, 95.8);
    expect(part.fits).toBe(false);
    expect(part.in).toBe("8 × 5.6 in");
    expect(part.cm).toBe("20.3 × 14.2 cm");
    expect(visiblePart({ w: 4, h: 6 }, { w: 1038, h: 900 }, 95.8).fits).toBe(true);
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-a-monitor} */
  it("offers the sheet on a 1038 px box at 95.8", () => {
    expect(sheetFits(1038, 95.8)).toBe(true);
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-a-13-in-laptop} */
  it("does not offer the sheet on a 1038 px box at 125.2", () => {
    expect(sheetFits(1038, 125.2)).toBe(false);
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-a-ruler-on-a-phone-in-centimetres} */
  it("matches the ruler at 2 in or 5 cm on a phone, 5 in or 12 cm on a desktop", () => {
    expect(rulerInches(true, "in")).toBe(2);
    expect(rulerInches(true, "cm")).toBeCloseTo(5 / 2.54, 10);
    expect(rulerInches(false, "in")).toBe(5);
    expect(rulerInches(false, "cm")).toBeCloseTo(12 / 2.54, 10);
  });
});

describe("the scale stays where the controls can show it", () => {
  /** {@link openspec/specs/actual-size/spec.md#requirement-the-card-check-matches-one-edge-of-a-credit-card} */
  it("keeps a phone's slide and nudge inside 100–200", () => {
    const phone = SCALE_RANGE.phone;
    const at200 = run([{ type: "slide", scale: 200, range: phone }], guessed);
    expect(run([{ type: "nudge", by: 0.2, range: phone }], at200).scale).toBe(200);
    expect(run([{ type: "slide", scale: 80, range: phone }], guessed).scale).toBe(100);
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-a-length-that-is-not-a-number} */
  it("ignores a half-typed diagonal whose scale no screen has", () => {
    const s = run([{ type: "diagonal", value: "1", w: 1920, h: 1080 }], guessed);
    expect(s.scale).toBe(150);
    expect(s.diagonal).toBeNull();
  });

  /** {@link openspec/specs/actual-size/spec.md#requirement-the-screen-size-can-set-the-scale} */
  it("forgets a diagonal picked in a check that was cancelled or skipped", () => {
    const picked: ViewerAction[] = [
      { type: "open", method: "screen" },
      { type: "diagonal", value: 27, w: 1920, h: 1080 },
    ];
    expect(run([...picked, { type: "cancel" }], guessed).diagonal).toBeNull();
    expect(run([...picked, { type: "skip" }], guessed).diagonal).toBeNull();
    expect(run([...picked, { type: "done" }], guessed).diagonal).toBe(27);
  });
});

describe("a typed size the screen cannot have", () => {
  /** {@link openspec/specs/actual-size/spec.md#scenario-a-size-the-screen-cannot-have} */
  it("is ignored, so the picked size and its scale stay", () => {
    const screen = { w: 1920, h: 1080 };
    const s = run(
      [
        { type: "open", method: "screen" },
        { type: "diagonal", value: 27, ...screen },
        { type: "diagonal", value: "50", ...screen },
      ],
      guessed,
    );
    expect(s.diagonal).toBe(27);
    expect(s.scale).toBeCloseTo(Math.hypot(1920, 1080) / 27, 6);
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-a-61-in-phone} */
  it("finishes a check at the scale the component saved", () => {
    const s = run(
      [
        { type: "open", method: "screen" },
        { type: "done", scale: 255 },
      ],
      guessed,
    );
    expect(s.check).toBe("screen");
    expect(s.scale).toBe(255);
  });

  /** {@link openspec/specs/actual-size/spec.md#requirement-the-screen-size-can-set-the-scale} */
  it("drops a picked diagonal when another method finishes the check", () => {
    const s = run(
      [
        { type: "open", method: "screen" },
        { type: "diagonal", value: 27, w: 1920, h: 1080 },
        { type: "open", method: "card" },
        { type: "done" },
      ],
      guessed,
    );
    expect(s.check).toBe("card");
    expect(s.diagonal).toBeNull();
  });
});

describe("a screen that is not a phone's", () => {
  /** {@link openspec/specs/actual-size/spec.md#scenario-a-screen-that-is-not-a-phones} */
  it("counts screens, not phone screens", () => {
    expect(phonesLine(sizeOf(initialState), { w: 744, h: 1133 }, 163, false)).toBe(
      "About 1.8 screens wide and 1.4 tall.",
    );
    expect(phonesLine({ w: 4, h: 6 }, { w: 744, h: 1133 }, 100, false)).toBe(
      "It fits on your screen.",
    );
  });
});

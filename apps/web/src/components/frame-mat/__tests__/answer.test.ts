import { describe as group, expect, it } from "vitest";

import { type Card, describe, drawing } from "../answer";
import { type From, outcome, type State } from "../state";

type Unit = "in" | "cm";

function result(from: From, w: string, h: string, m: string, unit: Unit = "in") {
  const state: State = { from, fields: { w, h, m }, submitted: true };
  const o = outcome(state, unit);
  if (!("answer" in o)) throw new Error(JSON.stringify(o.errors));
  return o;
}
const say = (from: From, w: string, h: string, m: string, unit: Unit = "in") =>
  describe(result(from, w, h, m, unit), from, unit);
const titles = (cards: readonly Card[]) => cards.map((c) => c.title);

group("a standard frame", () => {
  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-5x7-print-with-a-1-inch-border} */
  it("names the 8x10 for a 5x7 print with a 1¾ in border", () => {
    expect(say("print", "5", "7", "1 3/4")).toEqual({
      head: "Use an 8x10 frame.",
      label: "Frame size",
      value: "8 × 10 in",
      opening: "4½ × 6½ in",
      how: "The opening is your print less ¼ in on each side. The frame adds the 1¾ in border on each side: 8 × 10 in. That is the standard 8x10.",
      cards: [
        {
          title: "Ready-made frame",
          rows: [{ chip: "8x10 frame", border: "Mat border 1¾ in all round." }],
          text: "Sold with this mat pre-cut, for a 5x7 print.",
        },
      ],
    });
    expect(describe(result("print", "5", "7", "1 3/4"), "print", "cm").value).toBe(
      "20.3 × 25.4 cm",
    );
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-diploma-size-print-with-a-1-inch-border} */
  it("names the 11x14 for a diploma-size print with a 1⅝ in border", () => {
    const a = say("print", "8 1/2", "11", "1⅝");
    expect([a.head, a.value]).toEqual(["Use an 11x14 frame.", "11 × 14 in"]);
    expect(a.how).toBe(
      "The opening is your print less ¼ in on each side. The frame adds the 1⅝ in border on each side: 11¼ × 13¾ in. That is within ⅜ in of 11x14.",
    );
    expect(a.cards).toEqual([
      {
        title: "Ready-made frame",
        rows: [
          {
            chip: "11x14 frame",
            border: "Mat border 1½ in at the sides, 1¾ in at the top and bottom.",
          },
        ],
        text: "Sold with this mat pre-cut, for an 8.5x11 print.",
      },
      {
        title: "Also sold with a pre-cut mat",
        rows: [
          {
            chip: "12x16 frame",
            border: "Mat border 2 in at the sides, 2¾ in at the top and bottom.",
          },
        ],
      },
    ]);
  });
});

group("a metric frame", () => {
  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-12x16-print-with-a-2-inch-border} */
  it("names 40 × 50 cm for a 12x16 print", () => {
    const a = say("print", "12", "16", "2");
    expect(a.head).toBe("Use a 40 × 50 cm frame, a metric size.");
    expect(titles(a.cards)).toEqual(["Metric frame", "Ready-made, with a pre-cut mat"]);
    expect(a.cards[0]?.text).toBe(
      "40 × 50 cm frames are sold in the US too. Have the mat cut for a 12x16 print.",
    );
    expect(a.cards[1]).toEqual({
      title: "Ready-made, with a pre-cut mat",
      rows: [],
      text: "No frame is sold with a pre-cut mat for a 12x16 print. Have one cut to size.",
    });
  });
});

group("a custom frame", () => {
  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-an-8x10-print-with-a-2-inch-border} */
  it("offers the exact size, the pre-cut 11x14, the 12x16 and the 16x16 for an 8x10", () => {
    expect(say("print", "8", "10", "2")).toEqual({
      head: "Your frame: 11½ × 13½ in. Not a standard size.",
      label: "Frame size",
      value: "11½ × 13½ in",
      opening: "7½ × 9½ in",
      how: "The opening is your print less ¼ in on each side. The frame adds the 2 in border on each side: 11½ × 13½ in. No standard frame is within ⅜ in of it.",
      cards: [
        {
          title: "Order this size",
          rows: [{ chip: "11½ × 13½ in", custom: true, border: "Mat border 2 in all round." }],
          text: "A custom frame with the mat cut to fit. Frame shops and online framers cut any size.",
        },
        {
          title: "Ready-made, with a pre-cut mat",
          rows: [
            {
              chip: "11x14 frame",
              border: "Mat border 1¾ in at the sides, 2¼ in at the top and bottom.",
              note: undefined,
            },
          ],
          text: "Sold with a mat cut for an 8x10 print.",
        },
        {
          title: "Next size up",
          rows: [
            {
              chip: "12x16 frame",
              border: "Mat border 2¼ in at the sides, 3¼ in at the top and bottom.",
            },
          ],
          text: "With a mat cut for an 8x10 print.",
        },
        {
          title: "Square frames",
          rows: [
            {
              chip: "16x16 frame",
              border: "Mat border 4¼ in at the sides, 3¼ in at the top and bottom.",
            },
          ],
          text: "10x10 is too small for this mat.",
        },
      ],
    });
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-an-8x10-print-with-a-2-inch-border} */
  it("writes the 8x10 answer in centimetres", () => {
    const a = describe(result("print", "8", "10", "2"), "print", "cm");
    expect([a.head, a.opening]).toEqual([
      "Your frame: 29.2 × 34.3 cm. Not a standard size.",
      "19.1 × 24.1 cm",
    ]);
    expect(a.how).toBe(
      "The opening is your print less 0.6 cm on each side. The frame adds the 5.1 cm border on each side: 29.2 × 34.3 cm. No standard frame is within 1.0 cm of it.",
    );
    expect(a.cards[0]?.rows[0]?.border).toBe("Mat border 5.1 cm all round.");
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-two-pre-cut-frames-one-the-next-size-up} */
  it("lists the 18x24 and the 20x24 for a 16x20, the 20x24 as the next size up", () => {
    const a = say("print", "16", "20", "2");
    expect(a.head).toBe("Your frame: 19½ × 23½ in. Not a standard size.");
    expect(titles(a.cards)).toEqual(["Order this size", "Ready-made, with a pre-cut mat"]);
    expect(a.cards[1]).toEqual({
      title: "Ready-made, with a pre-cut mat",
      rows: [
        {
          chip: "18x24 frame",
          border: "Mat border 1¼ in at the sides, 2¼ in at the top and bottom.",
          note: undefined,
        },
        {
          chip: "20x24 frame",
          border: "Mat border 2¼ in all round.",
          note: "Also the next size up.",
        },
      ],
      text: "Both are sold with a mat cut for a 16x20 print.",
    });
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-diploma-size-print-with-a-custom-frame} */
  it("lists both diploma frames for an 8.5x11 print with a 1½ in border", () => {
    const a = say("print", "8.5", "11", "1.5");
    expect(a.head).toBe("Your frame: 11 × 13½ in. Not a standard size.");
    expect(titles(a.cards)).toEqual(["Order this size", "Ready-made, with a pre-cut mat"]);
    expect(a.cards[1]).toEqual({
      title: "Ready-made, with a pre-cut mat",
      rows: [
        {
          chip: "11x14 frame",
          border: "Mat border 1½ in at the sides, 1¾ in at the top and bottom.",
          note: "Also the next size up.",
        },
        {
          chip: "12x16 frame",
          border: "Mat border 2 in at the sides, 2¾ in at the top and bottom.",
          note: undefined,
        },
      ],
      text: "Both are sold with a mat cut for an 8.5x11 print.",
    });
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-landscape-print} */
  it("keeps a landscape print landscape", () => {
    const a = say("print", "10", "8", "2");
    expect(a.head).toBe("Your frame: 13½ × 11½ in. Not a standard size.");
    expect(a.cards[1]?.rows[0]?.chip).toBe("14x11 frame");
  });
});

group("a reverse answer", () => {
  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-an-11x14-frame-with-a-2-inch-border} */
  it("gives the largest print and the frame's own mat for an 11x14", () => {
    expect(say("frame", "11", "14", "2")).toEqual({
      head: "Largest print: 7½ × 10½ in. Not a standard print size.",
      label: "Largest print",
      value: "7½ × 10½ in",
      opening: "7 × 10 in",
      how: "The opening is your frame less the 2 in border on each side. The print is ¼ in bigger on each side, under the mat.",
      cards: [
        {
          title: "Standard print that fits",
          rows: [
            {
              chip: "5x7 print",
              border: "Mat border 3¼ in at the sides, 3¾ in at the top and bottom.",
            },
          ],
          text: "The next print up, 8.5x11, is too big for a 2 in border.",
        },
        {
          title: "Sold with this frame",
          rows: [
            {
              chip: "8x10 print",
              border: "Mat border 1¾ in at the sides, 2¼ in at the top and bottom.",
            },
          ],
          text: "An 11x14 frame comes with a mat pre-cut for an 8x10 print.",
        },
      ],
    });
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-frame-whose-own-mat-is-the-answer} */
  it("folds the frame's own mat into the print card", () => {
    const a = say("frame", "8", "10", "1¾");
    expect(a.head).toBe("A 5x7 print fits.");
    expect(a.cards).toEqual([
      {
        title: "Standard print that fits",
        rows: [{ chip: "5x7 print", border: "Mat border 1¾ in all round." }],
        text: "An 8x10 frame is sold with this mat pre-cut.",
      },
    ]);
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#requirement-a-reverse-answer-gives-the-largest-print-and-the-frames-own-mat} */
  it("folds the diploma frame's mat into the print card, as the forward answer has it", () => {
    const a = say("frame", "11¼", "13¾", "1⅝");
    expect(a.head).toBe("An 8.5x11 print fits.");
    expect(a.cards).toEqual([
      {
        title: "Standard print that fits",
        rows: [{ chip: "8.5x11 print", border: "Mat border 1⅝ in all round." }],
        text: "An 11x14 frame is sold with this mat pre-cut.",
      },
    ]);
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-metric-frame-size} */
  it("names the 12x16 print for a 15¾ × 19¾ frame, with no pre-cut mat", () => {
    const a = say("frame", "15¾", "19¾", "2");
    expect(a.head).toBe("A 12x16 print fits.");
    expect(a.cards.at(-1)).toEqual({
      title: "Sold with this frame",
      rows: [],
      text: "No frame this size is sold with a pre-cut mat.",
    });
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-there-and-back} */
  it("names the 8x10 print for the 11½ × 13½ frame", () => {
    expect(say("frame", "11½", "13½", "2").head).toBe("An 8x10 print fits.");
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-standard-print-a-little-too-big-is-not-named} */
  it("names the 4x6, not the 5x7, for an 8x10 frame with a 1⅞ in border", () => {
    const a = say("frame", "8", "10", "1⅞");
    expect(a.head).toBe("Largest print: 4¾ × 6¾ in. Not a standard print size.");
    expect(a.cards[0]).toEqual({
      title: "Standard print that fits",
      rows: [{ chip: "4x6 print", border: "Mat border 2¼ in all round." }],
      text: "The next print up, 5x7, is too big for a 1⅞ in border.",
    });
    expect(JSON.stringify(a)).not.toContain("A 5x7 print fits.");
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-print-bigger-than-the-frame-is-not-named} */
  it("does not name the 4x6 for a 10 × 15 cm frame with a 0.7 cm border", () => {
    const a = say("frame", "10", "15", "0.7", "cm");
    expect(JSON.stringify(a)).not.toContain("A 4x6 print fits.");
  });
});

group("the drawing", () => {
  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-drawing-before-an-answer} */
  it("shows the example 8x10 in an 11x14 before an answer", () => {
    const d = drawing(undefined, "print", "in");
    expect(d.legend.map((g) => [g.name, g.value.in])).toEqual([
      ["Frame size", "11 × 14 in"],
      ["Mat opening", "7½ × 9½ in"],
      ["Print, edge under the mat", "8 × 10 in"],
      ["Mat border, sides / top", "1¾ / 2¼ in"],
    ]);
    expect(d.legend[3]?.value.cm).toBe("4.4 / 5.7 cm");
    expect(d.caption).toBe("Example: an 8x10 print in an 11x14 frame with a pre-cut mat.");
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-drawing-of-a-custom-answer} */
  it("draws the custom 8x10 answer at the exact frame size", () => {
    const d = drawing(result("print", "8", "10", "2"), "print", "in");
    expect(d.label).toBe(
      "Drawing of an 11½ by 13½ in frame with a 2 in mat border at the sides and at the top and bottom, and a 7½ by 9½ in opening. The print's edge is under the mat.",
    );
    expect(d.legend.at(-1)).toEqual({
      name: "Mat border",
      value: { in: "2 in", cm: "5.1 cm" },
      swatch: "mat",
    });
    expect(d.caption).toBe("Drawn at the exact frame size.");
  });
});

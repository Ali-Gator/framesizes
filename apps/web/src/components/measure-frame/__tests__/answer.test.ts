import { describe as group, expect, it } from "vitest";

import { article, describe, drawing } from "../answer";
import { type Action, INITIAL, type Kind, outcome, reducer } from "../state";

type Unit = "in" | "cm";

/** The engine's answer for numbers typed into the wizard. */
function result(kind: Kind, unit: Unit, w: string, h: string, f?: string) {
  const actions: Action[] = [
    { type: "pick", kind },
    { type: "type", field: "w", text: w },
    { type: "type", field: "h", text: h },
    ...(f === undefined ? [] : [{ type: "type", field: "f", text: f } as Action]),
  ];
  const o = outcome(actions.reduce(reducer, INITIAL), unit);
  if (!("answer" in o)) throw new Error(JSON.stringify(o.errors));
  return o;
}
const say = (kind: Kind, unit: Unit, w: string, h: string, f?: string) =>
  describe(result(kind, unit, w, h, f), kind, unit);

group("articles", () => {
  it("use an before 8, 11, 18 and A, and a before the rest", () => {
    expect(
      ["8x10", "11x14", "18x24", "A4", "80 cm", "5x7", "110 cm", "16x20"].map(article),
    ).toEqual(["an", "an", "an", "an", "an", "a", "a", "a"]);
  });
});

group("a standard size", () => {
  /** {@link openspec/specs/measure-frame/spec.md#scenario-the-inside-slightly-large} */
  it("names the 8x10 measured ⅛ in large inside", () => {
    expect(say("inside", "in", "8 1/8", "10 1/8")).toEqual({
      label: "Frame size",
      head: "Your frame is an 8x10.",
      value: "8 × 10 in",
      how: "You measured 8⅛ × 10⅛ in. Each side is within ⅜ in of the standard 8 × 10 in.",
      holds: "It holds an 8x10 print with no mat, or a 5x7 print with a pre-cut mat.",
      link: { page: "F3", href: "/how-big-is-8x10", text: "See 8x10 at actual size" },
    });
    const cm = say("inside", "cm", "20.6", "25.7");
    expect(cm.value).toBe("20.3 × 25.4 cm");
    expect(cm.how).toBe(
      "You measured 20.6 × 25.7 cm. Each side is within about 1 cm of the standard 20.3 × 25.4 cm.",
    );
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-the-front-opening} */
  it("adds the lip to a front opening", () => {
    const a = say("front", "in", "7 1/2", "9 1/2");
    expect(a.head).toBe("Your frame is an 8x10.");
    expect(a.how).toBe(
      "You measured a 7½ × 9½ in opening. The frame covers ¼ in of the picture on each side, so the inside is 8 × 10 in.",
    );
    expect(say("front", "cm", "19.1", "24.1").how).toMatch(
      /^You measured a 19\.1 × 24\.1 cm opening\. The frame covers 0\.6 cm of the picture on each side, so the inside is /,
    );
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-the-outside} */
  it("takes the mouldings off the outside", () => {
    const a = say("outside", "in", "10", "12", "1 1/4");
    expect(a.head).toBe("Your frame is an 8x10.");
    expect(a.how).toBe(
      "10 × 12 in outside, less two 1¼ in mouldings, plus the ¼ in lip on each side, gives 8 × 10 in.",
    );
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-a-landscape-frame} */
  it("names a landscape frame with its upright size", () => {
    const a = say("inside", "in", "10", "8");
    expect(a.head).toBe("Your frame is a 10x8 (landscape 8x10).");
    expect(a.value).toBe("10 × 8 in");
    expect(a.link?.href).toBe("/how-big-is-8x10");
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-a-size-linked-to-the-chart} */
  it("links any other size to its row in the chart", () => {
    expect(say("inside", "in", "11", "14").link).toEqual({
      page: "F1",
      href: "/?size=11x14",
      text: "Find 11x14 in the frame size chart",
    });
  });
});

group("a metric size", () => {
  /** {@link openspec/specs/measure-frame/spec.md#scenario-an-a4-frame} */
  it("names an A4 measured in centimetres", () => {
    const a = say("inside", "cm", "21.0", "29.7");
    expect(a.head).toBe("Your frame is an A4, a metric size.");
    expect(a.value).toBe("21.0 × 29.7 cm");
    expect(a.link).toEqual({
      page: "F3",
      href: "/how-big-is-8x10",
      text: "Compare A4 and 8x10 at actual size",
    });
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-a-metric-size-with-a-us-size-close-too} */
  it("says the 12x16 is close too but 30 × 40 cm is closer", () => {
    const a = say("inside", "cm", "30", "40");
    expect(a.head).toBe("Your frame is a 30 × 40 cm, a metric size.");
    expect(a.value).toBe("30.0 × 40.0 cm");
    expect(a.how).toContain("12x16 is close too, but 30 × 40 cm is closer.");
    expect(a.link).toBeUndefined();
  });
});

group("a custom size", () => {
  /** {@link openspec/specs/measure-frame/spec.md#scenario-a-9--12-frame} */
  it("lists the closest sizes below and above 9 × 12", () => {
    const a = say("inside", "in", "9", "12");
    expect(a.label).toBe("Custom size");
    expect(a.head).toBe("No standard frame matches 9 × 12 in.");
    expect(a.how).toBe(
      "No standard size is within ⅜ in of it on both sides, so it is likely a custom size. Before you buy, check where you measured: the front opening is ½ in smaller than the inside.",
    );
    expect(a.nearest).toEqual([
      { id: "8.5x11", text: "½ in narrower and 1 in shorter. Too small to fill your frame." },
      {
        id: "11x14",
        text: "Next size up: 2 in wider and 2 in taller. Your picture fits with a mat cut to size.",
      },
    ]);
    expect(say("inside", "cm", "22.9", "30.5").head).toBe(
      "No standard frame matches 22.9 × 30.5 cm.",
    );
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-a-near-square-frame} */
  it("adds the nearest squares for 9 × 9½", () => {
    expect(say("inside", "in", "9", "9 1/2").nearest?.map((n) => n.id)).toEqual([
      "5x7",
      "11x14",
      "8x8",
      "10x10",
    ]);
  });

  it("says the same width rather than 0 in narrower", () => {
    expect(say("inside", "in", "8", "13").nearest?.[0]).toEqual({
      id: "8x10",
      text: "the same width and 3 in shorter. Too small to fill your frame.",
    });
  });
});

group("a mat opening", () => {
  /** {@link openspec/specs/measure-frame/spec.md#scenario-one-frame} */
  it("names the 8x10 print and the 11x14 frame", () => {
    const a = say("mat", "in", "7 1/2", "9 1/2");
    expect(a.label).toBe("Print size");
    expect(a.head).toBe("This mat holds an 8x10 print.");
    expect(a.mat).toEqual({
      label: "Frames sold with this mat",
      frames: ["11x14 frame"],
      text: "Mats for an 8x10 print are sold in an 11x14 frame.",
    });
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-two-frames} */
  it("lists both frames sold with a 16x20 mat", () => {
    const a = say("mat", "in", "15 1/2", "19 1/2");
    expect(a.head).toBe("This mat holds a 16x20 print.");
    expect(a.mat?.frames).toEqual(["18x24 frame", "20x24 frame"]);
    expect(a.mat?.text).toBe(
      "Mats for a 16x20 print are sold in 18x24 and 20x24 frames. To tell which one you have, measure the inside at the back.",
    );
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-no-pre-cut-mat} */
  it("says a mat with no frame was likely cut to order", () => {
    const a = say("mat", "in", "9", "12");
    expect(a.head).toBe("This mat holds a 9½ × 12½ in print.");
    expect(a.mat?.text).toBe(
      "No frame in our list is sold with a pre-cut mat this size. The mat was likely cut to order.",
    );
    expect(a.mat?.label).toBe("Frames sold with this mat: none");
  });
});

group("the drawing", () => {
  /** {@link openspec/specs/measure-frame/spec.md#scenario-the-drawing-before-an-answer} */
  it("shows the back of an example 8x10 before an answer", () => {
    const d = drawing("inside", "in", {});
    expect(d.view).toBe("Back of the frame");
    expect(d.label).toBe(
      "Drawing of the back of the frame. The yellow tape shows where to measure: the inside, at the back.",
    );
    expect(d.caption).toBe("Example: an 8x10 frame. The yellow tape shows where to measure.");
    expect(d.tapes.map((t) => t.text)).toEqual(["?", "?"]);
    expect(d.legend).toEqual([]);
  });

  it("labels the tapes with what was typed", () => {
    expect(drawing("inside", "cm", { w: 8.125, h: 10 }).tapes.map((t) => t.text)).toEqual([
      "20.6 cm",
      "25.4 cm",
    ]);
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-the-legend-after-an-answer} */
  it("lists the outside, the inside and the front opening after an answer", () => {
    const r = result("inside", "in", "8", "10");
    expect(drawing("inside", "in", { w: 8, h: 10 }, r).legend).toEqual([
      { name: "Outside, with a 1¼ in moulding", value: "10 × 12 in", swatch: "oak", on: false },
      { name: "Inside: the frame size", value: "8 × 10 in", swatch: "board", on: true },
      { name: "Front opening", value: "7½ × 9½ in", swatch: "open", on: false },
    ]);
  });

  it("marks the mat opening and says which frame it is drawn as", () => {
    const r = result("mat", "in", "15 1/2", "19 1/2");
    const d = drawing("mat", "in", { w: 15.5, h: 19.5 }, r);
    expect(d.caption).toBe("Drawn as the 18x24. The 20x24 has a wider mat at the sides.");
    expect(d.legend.find((g) => g.on)?.name).toBe("Mat opening");
  });

  it("keeps every box on the stage", () => {
    for (const kind of ["inside", "front", "mat", "outside"] as const) {
      const d = drawing(kind, "in", {});
      for (const b of [d.outside, d.inside, ...d.tapes.map((t) => t.box)]) {
        expect(b.l).toBeGreaterThanOrEqual(0);
        expect(b.t).toBeGreaterThanOrEqual(0);
        expect(b.l + b.w).toBeLessThanOrEqual(100);
        expect(b.t + b.h).toBeLessThanOrEqual(100);
      }
    }
  });
});

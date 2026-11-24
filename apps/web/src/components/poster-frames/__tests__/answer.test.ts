import { posterFrames } from "@framesizes/sizes";
import { describe as group, expect, it } from "vitest";

import { type Answer, describe, drawing } from "../answer";
import { INITIAL, poster, type Picked, type State } from "../state";

type Unit = "in" | "cm";

function chip(id: string, landscape = false): Picked {
  const p = poster({ ...INITIAL, poster: id, landscape }, "in");
  if (!("size" in p)) throw new Error(id);
  return p;
}
function typed(w: string, h: string, unit: Unit = "in"): Picked {
  const s: State = { ...INITIAL, mode: "custom", fields: { w, h } };
  const p = poster(s, unit);
  if (!("size" in p)) throw new Error(`${w} × ${h}`);
  return p;
}
function framesOf(p: Picked) {
  const f = posterFrames(p.size);
  if (!f) throw new Error("no frames");
  return f;
}
const say = (p: Picked, mat: boolean, unit: Unit = "in", pick = 0): Answer =>
  describe(p, framesOf(p), mat, pick, unit);
const draw = (p: Picked, mat: boolean, pick = 0) => drawing(p, framesOf(p), mat, pick);

group("without a mat", () => {
  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-24x36-poster} */
  it("names the 24x36 frame for a 24x36 poster", () => {
    expect(say(chip("24x36"), false)).toEqual({
      use: "Large posters",
      head: "Use a 24x36 frame.",
      label: "Frame size",
      value: "24 × 36 in",
      sub: "61 × 91.4 cm",
      how: "Without a mat, the frame is the poster's own size. 24x36 is a standard US frame size.",
      cards: [
        {
          title: "Ready-made frame",
          rows: [{ chip: "24x36 frame", note: "No mat. The poster fills the frame." }],
        },
      ],
      box: {
        text: "With a mat it takes a bigger frame: 27x40.",
        button: "See frames with a mat",
        mat: true,
      },
    });
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-an-a3-poster} */
  it("names the A3 frame and the US frames with a mat for an A3 poster", () => {
    const a = say(chip("A3"), false);
    expect(a).toMatchObject({
      head: "Use an A3 frame (297 × 420 mm).",
      value: "297 × 420 mm",
      sub: "11.7 × 16.5 in",
      how: "A3 frames are sold under the paper's name. No US frame size is within ⅜ in of it.",
    });
    expect(a.cards).toEqual([
      { title: "Metric frame", rows: [{ chip: "A3 frame", note: "297 × 420 mm" }] },
      {
        title: "US frames, with a mat",
        rows: [
          {
            chip: "16x20 frame",
            badge: { pre: false, text: "Mat cut to order" },
            border: "Border 2⅜ / 2 in",
          },
          {
            chip: "18x24 frame",
            badge: { pre: false, text: "Mat cut to order" },
            border: "Border 3⅜ / 4 in",
          },
        ],
      },
    ]);
    /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-no-box} */
    expect(a.box).toBeUndefined();
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-an-a2-poster} */
  it("names the A2 frame and the sizes either side for an A2 poster", () => {
    const a = say(chip("A2"), false);
    expect(a).toMatchObject({
      head: "Use an A2 frame (420 × 594 mm).",
      sub: "16.5 × 23.4 in",
      how: "A2 frames are sold under the paper's name. No US frame size is within ⅜ in of it: 16x20 is smaller, 18x24 is bigger.",
    });
    expect(a.cards[1]?.rows.map((r) => [r.chip, r.border])).toEqual([
      ["20x30 frame", "Border 2 / 3½ in"],
    ]);
    expect(say(chip("A2"), false, "cm").cards[1]?.rows[0]?.border).toBe("Border 5 / 9 cm");
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-metric-size-with-a-us-frame-just-as-close} */
  it("names 40 × 50 cm and the 16x20 just as close", () => {
    const a = say(typed("40", "50", "cm"), false, "cm");
    expect(a.head).toBe("Use a 40 × 50 cm frame.");
    expect(a.how).toBe("A metric frame size. A 16x20 frame is within 1 cm of it too.");
    expect(say(typed("40", "50", "cm"), false, "in").how).toBe(
      "A metric frame size. A 16x20 frame is within ⅜ in of it too.",
    );
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-13--19-inch-poster} */
  it("offers the exact size and the closest standard sizes for 13 × 19 in", () => {
    const a = say(typed("13", "19"), false);
    expect(a).toEqual({
      head: "Not a standard size: 13 × 19 in.",
      label: "Frame size, custom",
      value: "13 × 19 in",
      sub: "33 × 48.3 cm",
      how: "Without a mat, the frame is the poster's own size. No standard frame is within ⅜ in of it.",
      cards: [
        {
          title: "Order this size",
          rows: [{ chip: "13 × 19 in", custom: true, note: "A custom frame, made to this size." }],
        },
        {
          title: "Closest standard sizes",
          rows: [
            { chip: "12x18 frame", note: "Too small: 1 in narrower and 1 in shorter." },
            { chip: "16x20 frame", note: "3 in wider and 1 in taller than the poster." },
          ],
        },
      ],
      /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-from-a-custom-size} */
      box: {
        text: "With a mat it fits a standard frame: 18x24 or 20x24.",
        button: "See frames with a mat",
        mat: true,
      },
    });
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-no-box} */
  it("shows no box for 40 × 60 in", () => {
    expect(say(typed("40", "60"), false).box).toBeUndefined();
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-standard-frame-with-none-for-a-mat} */
  it("says no standard frame takes a 27x40 with a mat", () => {
    expect(say(chip("27x40"), false).box).toEqual({
      text: "No standard frame takes it with a mat.",
      button: "See frames with a mat",
      mat: true,
    });
  });
});

group("with a mat", () => {
  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-three-frames-for-an-11x17-poster} */
  it("lists three frames for an 11x17 poster, the first drawn", () => {
    const a = say(chip("11x17"), true);
    expect(a).toMatchObject({
      head: "3 standard frames fit an 11x17 poster with a mat.",
      label: "Frame in the drawing",
      value: "12 × 18 in",
      how: "Borders are sides / top and bottom. The mat overlaps the poster by ¼ in on each side. Tap a frame to draw it.",
    });
    expect(a.cards).toEqual([
      {
        title: "Frame 1 of 3",
        pick: 0,
        selected: true,
        rows: [
          {
            chip: "12x18 frame",
            badge: { pre: true, text: "Pre-cut mat included" },
            border: "Border ¾ / ¾ in",
            note: "Sold with a mat cut for an 11x17 poster.",
          },
        ],
      },
      {
        title: "Frame 2 of 3",
        pick: 1,
        selected: false,
        rows: [
          {
            chip: "16x20 frame",
            badge: { pre: false, text: "Mat cut to order" },
            border: "Border 2¾ / 1¾ in",
            note: "Have the mat cut for an 11x17 poster.",
          },
        ],
      },
      {
        title: "Frame 3 of 3",
        pick: 2,
        selected: false,
        rows: [
          {
            chip: "18x24 frame",
            badge: { pre: false, text: "Mat cut to order" },
            border: "Border 3¾ / 3¾ in",
            note: "Have the mat cut for an 11x17 poster.",
          },
        ],
      },
    ]);
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-drawing-another-frame} */
  it("draws the frame picked", () => {
    const a = say(chip("11x17"), true, "in", 1);
    expect(a.value).toBe("16 × 20 in");
    expect(a.cards.map((c) => c.selected)).toEqual([false, true, false]);
    expect(draw(chip("11x17"), true, 1).legend[0]?.value.in).toBe("16 × 20 in");
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-one-frame-for-a-24x36-poster} */
  it("names one frame, not a button, for a 24x36 poster", () => {
    const a = say(chip("24x36"), true);
    expect(a).toMatchObject({
      head: "A 27x40 frame fits a 24x36 poster with a mat.",
      label: "Frame size",
      value: "27 × 40 in",
      how: "Borders are sides / top and bottom. The mat overlaps the poster by ¼ in on each side.",
    });
    expect(a.cards).toEqual([
      {
        title: "Frame",
        rows: [
          {
            chip: "27x40 frame",
            badge: { pre: false, text: "Mat cut to order" },
            border: "Border 1¾ / 2¼ in",
            note: "Have the mat cut for a 24x36 poster.",
          },
        ],
      },
    ]);
    expect(a.box).toBeUndefined();
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-typed-size-names-your-poster} */
  it("names your poster for a typed 13 × 19 in", () => {
    const a = say(typed("13", "19"), true);
    expect(a.head).toBe("2 standard frames fit your poster with a mat.");
    expect(a.cards.map((c) => [c.rows[0]?.chip, c.rows[0]?.border])).toEqual([
      ["18x24 frame", "Border 2¾ / 2¾ in"],
      ["20x24 frame", "Border 3¾ / 2¾ in"],
    ]);
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-landscape} */
  it("turns every frame for a landscape 17x11", () => {
    const a = say(chip("11x17", true), true);
    expect(a.head).toBe("3 standard frames fit a 17x11 poster with a mat.");
    expect(a.cards.map((c) => [c.rows[0]?.chip, c.rows[0]?.badge?.pre, c.rows[0]?.border])).toEqual(
      [
        ["18x12 frame", true, "Border ¾ / ¾ in"],
        ["20x16 frame", false, "Border 1¾ / 2¾ in"],
        ["24x18 frame", false, "Border 3¾ / 3¾ in"],
      ],
    );
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-custom-size-with-no-frame-for-a-mat} */
  it("shows no box for a typed 40 × 60 in with a mat", () => {
    const a = say(typed("40", "60"), true);
    expect(a.label).toBe("Custom frame");
    expect(a.box).toBeUndefined();
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-27x40-poster} */
  it("gives the custom frame for a 2 in mat on a 27x40 poster", () => {
    const a = say(chip("27x40"), true);
    expect(a).toEqual({
      use: "Movie posters",
      head: "No standard frame fits a 27x40 poster with a mat.",
      label: "Custom frame",
      value: "30½ × 43½ in",
      sub: "77.5 × 110.5 cm",
      how: "No standard frame leaves a 1 in to 4 in border on every side. For a 2 in mat, order a custom frame.",
      cards: [
        {
          title: "Custom frame",
          rows: [
            {
              chip: "30½ × 43½ in",
              custom: true,
              border: "Border 2 / 2 in",
              note: "Made to order, with the mat cut to fit.",
            },
          ],
        },
      ],
      calculator: true,
      box: {
        text: "Without a mat it takes a 27x40 frame.",
        button: "See it without a mat",
        mat: false,
      },
    });
  });
});

group("in centimetres", () => {
  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-an-11x17-poster-with-a-mat-in-centimetres} */
  it("writes the 11x17 frames in cm", () => {
    const a = say(chip("11x17"), true, "cm");
    expect(a.value).toBe("30.5 × 45.7 cm");
    expect(a.cards[0]?.rows[0]?.border).toBe("Border 1.9 / 1.9 cm");
    expect(a.cards[0]?.rows[0]?.chip).toBe("12x18 frame");
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-24x36-poster-in-centimetres} */
  it("writes the 24x36 frame as 61 × 91.4 cm", () => {
    expect(say(chip("24x36"), false, "cm")).toMatchObject({
      value: "61 × 91.4 cm",
      sub: "24 × 36 in",
    });
  });
});

group("the drawing", () => {
  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-the-drawing-without-a-mat} */
  it("labels a 24x36 poster without a mat", () => {
    const d = draw(chip("24x36"), false);
    expect(d.label).toBe(
      "Drawn to scale: a 24 × 36 in (61 × 91.4 cm) poster in a 24 × 36 in (61 × 91.4 cm) frame, no mat.",
    );
    expect(d.legend.map((g) => [g.name, g.value.in])).toEqual([
      ["Frame", "24 × 36 in"],
      ["Poster", "24 × 36 in"],
    ]);
    expect(d.dashed).toBe(false);
    expect(d.borders).toBeUndefined();
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-the-drawing-with-a-mat} */
  it("labels an 11x17 poster in the 12x18 with its mat", () => {
    const d = draw(chip("11x17"), true);
    expect(d.label).toBe(
      "Drawn to scale: a 12 × 18 in (30.5 × 45.7 cm) frame with a mat around an 11 × 17 in (27.9 × 43.2 cm) poster. The border is ¾ in (1.9 cm) at the sides and ¾ in (1.9 cm) at the top and bottom.",
    );
    expect(d.legend.map((g) => [g.name, g.value.in])).toEqual([
      ["Frame", "12 × 18 in"],
      ["Poster, seen in the mat", "10½ × 16½ in"],
      ["Border, sides / top", "¾ / ¾ in"],
    ]);
    expect(d.borders?.side).toEqual({ in: "¾ in", cm: "1.9 cm" });
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-pre-cut-frame-is-drawn-with-the-mat-as-sold} */
  it("draws a typed 40 × 50 cm in the pre-cut 18x24 with the mat as sold", () => {
    const p = typed("40", "50", "cm");
    const frames = framesOf(p);
    const i = frames.matted.findIndex((m) => m.frame.id === "18x24");
    expect(frames.matted[i]?.preCut).toBe(true);
    expect(say(p, true, "in", i).cards[i]?.rows[0]?.border).toBe("Border 1¼ / 2¼ in");
    const d = draw(p, true, i);
    expect(d.label).toBe(
      "Drawn to scale: an 18 × 24 in (45.7 × 61 cm) frame with a mat around a 15¾ × 19⅝ in (40 × 50 cm) poster. The border is 1¼ in (3.2 cm) at the sides and 2¼ in (5.7 cm) at the top and bottom.",
    );
    expect(d.legend[1]).toMatchObject({
      name: "Poster, seen in the mat",
      value: { in: "15½ × 19½ in" },
    });
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-one-scale} */
  it("draws an 11x17 frame 11/24 as wide as a 24x36 frame", () => {
    const small = draw(chip("11x17"), false);
    const big = draw(chip("24x36"), false);
    expect(small.boxes.frame.w / big.boxes.frame.w).toBeCloseTo(11 / 24, 9);
    expect(small.caption).toBe("Drawn to scale. Every size on this page uses the same scale.");
    expect(big.caption).toBe(small.caption);
    // The largest frame on the page still fits the stage.
    const largest = draw(chip("27x40"), true);
    expect(largest.boxes.oak.t).toBeGreaterThanOrEqual(0);
    expect(largest.caption).toBe(small.caption);
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-custom-frame-is-dashed} */
  it("dashes a custom size and a custom frame", () => {
    for (const d of [draw(typed("13", "19"), false), draw(chip("27x40"), true)]) {
      expect(d.dashed).toBe(true);
      expect(d.legend[0]?.name).toBe("Frame, custom");
    }
    expect(draw(chip("27x40"), true).label).toBe(
      "Drawn to scale: a 30½ × 43½ in (77.5 × 110.5 cm) custom frame with a mat around a 27 × 40 in (68.6 × 101.6 cm) poster. The border is 2 in (5.1 cm) at the sides and 2 in (5.1 cm) at the top and bottom.",
    );
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-too-big-for-the-scale} */
  it("draws 40 × 60 in smaller, to fit", () => {
    const d = draw(typed("40", "60"), false);
    expect(d.caption).toBe("Drawn smaller than the other sizes, to fit.");
    expect(d.boxes.oak.t).toBeCloseTo((16 / 320) * 100, 6);
  });
});

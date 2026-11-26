import { describe, expect, it } from "vitest";

import {
  artLine,
  chipLabel,
  chipSub,
  ERROR_SUB,
  facts,
  fileName,
  frameValue,
  hint,
  noRoom,
  noteText,
  panelValue,
  pictureLabel,
  PNG_FAILED,
  pngLine,
} from "../copy";
import { current, INITIAL, optionsFor, type State } from "../state";

const upload = (width: number, height: number) => ({
  url: "blob:x",
  width,
  height,
  sample: false,
});
const at = (patch: Partial<State>): State => ({ ...INITIAL, ...patch });
const chips = (state: State) =>
  Object.fromEntries(
    optionsFor(state.art, state.mat).map((o) => [chipLabel(o.size), chipSub(state.art, o)]),
  );
const text = (state: State, unit: "in" | "cm" = "in") => facts(state, unit).map((f) => f.text);

describe("the chips", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-the-sample-without-a-mat} */
  it("name each size and its cut for the sample without a mat", () => {
    expect(chips(INITIAL)).toMatchObject({
      "4×6": "0% cut",
      "12×18": "0% cut",
      "20×30": "0% cut",
      "24×36": "0% cut",
      "27×40": "1% cut",
      "11×17": "3% cut",
      A3: "6% cut",
      A2: "6% cut",
      A1: "6% cut",
      "16×20": "17% cut",
      "20×24": "20% cut",
    });
    expect(Object.keys(chips(INITIAL))).toHaveLength(17);
    expect(Object.keys(chips(INITIAL))[0]).toBe("4×6");
    expect(Object.keys(chips(INITIAL)).slice(13)).toEqual(["27×40", "A3", "A2", "A1"]);
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-the-sample-with-a-mat} */
  it("say No room on 4x6 and <1% on A1 with the mat", () => {
    expect(chips(at({ mat: true }))).toMatchObject({
      "4×6": "No room",
      "24×36": "1% cut",
      "16×20": "14% cut",
      "20×30": "8% cut",
      A1: "<1% cut",
    });
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-an-a-series-file} */
  it("say <1% for an A-series file in A3, A2 and A1", () => {
    expect(chips(at({ art: upload(2480, 3508) }))).toMatchObject({
      A3: "<1% cut",
      A2: "<1% cut",
      A1: "<1% cut",
      "5×7": "1% cut",
    });
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-a-landscape-artwork} */
  it("turn to a landscape artwork", () => {
    const labels = Object.keys(chips(at({ art: upload(3000, 2000), size: "36x24" })));
    expect(labels).toHaveLength(17);
    expect(labels[0]).toBe("6×4");
    expect(labels.slice(13)).toEqual(["40×27", "A3", "A2", "A1"]);
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-a-square-artwork} */
  it("offer only the square sizes for square art", () => {
    expect(chips(at({ art: upload(2000, 2000), size: "20x20" }))).toEqual({
      "8×8": "0% cut",
      "10×10": "0% cut",
      "12×12": "0% cut",
      "16×16": "0% cut",
      "20×20": "0% cut",
    });
  });
});

describe("the answer", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-above-the-sofa} */
  it("names 24x36 above the sofa", () => {
    expect(frameValue(current(INITIAL).option.size, "in")).toEqual({ value: "24 × 36 in" });
    expect(text(INITIAL)).toEqual([
      "Nothing is cut: the sample has this shape.",
      "Outside 26 × 38 in, with a 1 in moulding. Bottom edge 42 in, top edge 80 in above the floor, 8 in over the sofa.",
    ]);
    expect(facts(INITIAL, "in")[0]?.whole).toBe(true);
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-a-plain-wall-in-close-up} */
  it("names a plain wall in close-up", () => {
    expect(text(at({ placement: "plain", view: "close" }))).toEqual([
      "Nothing is cut: the sample has this shape.",
      "Outside 26 × 38 in, with a 1 in moulding. Centred 57 in above the floor, from 38 in to 76 in.",
      "Close-up: 45 × 57 in of wall.",
    ]);
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-24x36-with-its-pre-cut-mat} */
  it("names 24x36's pre-cut mat", () => {
    expect(text(at({ mat: true })).slice(0, 2)).toEqual([
      "Cuts 1% of the sample.",
      "Mat opening 19½ × 29½ in. Border 2¼ in at the sides, 3¼ in at the top and bottom. The frame is sold with this mat, cut for a 20x30 print.",
    ]);
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-20x30-with-a-2-inch-mat} */
  it("names the 2 in mat on 20x30", () => {
    expect(text(at({ mat: true, size: "20x30" })).slice(0, 2)).toEqual([
      "Cuts 8% of the sample.",
      "This frame is not sold with a mat, so it gets a 2 in mat. Opening 16 × 26 in.",
    ]);
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-centimetres} */
  it("writes centimetres", () => {
    const s = at({ mat: true, view: "close" });
    expect(frameValue(current(s).option.size, "cm")).toEqual({ value: "61 × 91.4 cm" });
    const [, mat, outside, close] = text(s, "cm");
    expect(mat).toContain("Mat opening 49.5 × 74.9 cm.");
    expect(outside).toContain("Outside 66 × 96.5 cm, with a 2.5 cm moulding.");
    expect(close).toBe("Close-up: 114.3 × 144.8 cm of wall.");
    expect(chipLabel(current(s).option.size)).toBe("24×36");
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-an-a-series-size} */
  it("leads an A-series size with millimetres", () => {
    const s = at({ size: "A2" });
    const { size } = current(s).option;
    expect(frameValue(size, "in")).toEqual({ value: "420 × 594 mm", sub: "16.5 × 23.4 in" });
    expect(frameValue(size, "cm")).toEqual({ value: "420 × 594 mm", sub: "42 × 59.4 cm" });
    expect(text(s)[0]).toBe("Cuts 6% of the sample.");
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-a-cut-under-one-percent} */
  it("says under 1% for A1 with a mat", () => {
    expect(text(at({ mat: true, size: "A1" }))[0]).toBe("Cuts under 1% of the sample.");
  });

  it("names your artwork after an upload", () => {
    expect(text(at({ art: upload(3000, 4000), size: "18x24" }))[0]).toBe(
      "Nothing is cut: your artwork has this shape.",
    );
  });
});

describe("the hint", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-keys-move-the-artwork} */
  it("says how to move the artwork, in both units", () => {
    expect(hint(false, "in")).toBe(
      "Drag the artwork to choose what is cut. Arrow keys move it ¼ in, Shift + arrow 1 in.",
    );
    expect(hint(false, "cm")).toBe(
      "Drag the artwork to choose what is cut. Arrow keys move it 0.6 cm, Shift + arrow 2.5 cm.",
    );
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-nothing-to-move} */
  it("says when nothing moves", () => {
    expect(hint(true, "in")).toBe("Nothing to move: the artwork fills this frame as it is.");
  });
});

describe("the notes and errors", () => {
  /**
   * {@link openspec/specs/frame-mockup/spec.md#scenario-a-first-upload}
   * {@link openspec/specs/frame-mockup/spec.md#scenario-a-second-upload-replaces-the-first}
   * {@link openspec/specs/frame-mockup/spec.md#scenario-back-to-the-sample}
   */
  it("say which size an upload opened on, and that the sample is back", () => {
    expect(noteText("opened", "24x36")).toBe(
      "24x36 cuts your artwork least, so the mockup opened on 24x36.",
    );
    expect(noteText("replaced", "18x24")).toBe(
      "New artwork. 18x24 cuts it least, so the frame changed to 18x24.",
    );
    expect(noteText("back", "24x36")).toBe(
      "The sample is back on 24x36. Your style, mat, wall and view stay as they were.",
    );
  });

  /**
   * {@link openspec/specs/frame-mockup/spec.md#scenario-not-an-image}
   * {@link openspec/specs/frame-mockup/spec.md#scenario-an-image-the-browser-cannot-open}
   * {@link openspec/specs/frame-mockup/spec.md#scenario-the-browser-cannot-make-the-png}
   */
  it("say why a file or a PNG failed", () => {
    expect(noteText("notimg", "24x36")).toBe("This file is not an image. Choose a JPEG or a PNG.");
    expect(noteText("decode", "24x36")).toBe(
      "Your browser cannot open this file. Try a JPEG or a PNG.",
    );
    expect(ERROR_SUB).toBe("The last artwork stays in the frame.");
    expect(PNG_FAILED).toBe("Your browser could not make the PNG. Try again, or try the close-up.");
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-4x6-picked} */
  it("says a 4x6 has no room for a mat", () => {
    expect(noRoom("4x6")).toBe("A 4x6 has no room for a mat.");
  });
});

describe("the art line, the label and the phone buttons", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-a-first-upload} */
  it("names the sample or the upload's pixels, never the file", () => {
    expect(artLine(INITIAL.art)).toEqual({
      title: "Sample artwork",
      sub: "2:3, drawn for this site",
    });
    expect(artLine(upload(2000, 3000))).toEqual({ title: "Your artwork", sub: "2000 × 3000 px" });
  });

  /**
   * {@link openspec/specs/frame-mockup/spec.md#scenario-the-widget-in-the-server-html}
   * {@link openspec/specs/frame-mockup/spec.md#scenario-an-upload-in-walnut-on-a-plain-wall}
   */
  it("labels the picture from the state", () => {
    expect(pictureLabel(INITIAL)).toBe(
      "Poster mockup: the sample in a 24x36 black frame, no mat, above a sofa, the whole 12 by 8 ft wall, drawn to true scale.",
    );
    expect(
      pictureLabel(
        at({
          art: upload(3000, 4000),
          size: "18x24",
          finish: "walnut",
          mat: true,
          placement: "plain",
          view: "close",
        }),
      ),
    ).toBe(
      "Poster mockup: your artwork in an 18x24 walnut frame, with a white mat, on a plain wall, close-up, drawn to true scale.",
    );
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-phone} */
  it("gives each phone button its current value", () => {
    const s = at({ finish: "oak", mat: true, placement: "plain", view: "close" });
    expect(panelValue("size", s)).toBe("24×36");
    expect(panelValue("style", INITIAL)).toBe("Black");
    expect(panelValue("style", s)).toBe("Light oak");
    expect(panelValue("mat", s)).toBe("Mat");
    expect(panelValue("wall", s)).toBe("Plain, close");
    expect(panelValue("wall", INITIAL)).toBe("Sofa");
  });
});

describe("the PNG", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-the-whole-wall} */
  it("is 2,400 × 1,600 px for the whole wall, named for its size", () => {
    expect(pngLine(INITIAL)).toBe("2,400 × 1,600 px PNG of the view above. No watermark.");
    expect(fileName("24x36")).toBe("frame-mockup-24x36.png");
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-a-close-up-of-an-a-series-size} */
  it("names an A-series file in lower case", () => {
    expect(fileName("A2")).toBe("frame-mockup-a2.png");
    expect(pngLine(at({ view: "close" }))).toBe(
      "1,895 × 2,400 px PNG of the view above. No watermark.",
    );
  });
});

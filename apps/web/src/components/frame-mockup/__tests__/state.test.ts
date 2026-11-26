import { focusStep } from "@framesizes/sizes";
import { describe, expect, it } from "vitest";

import { type Action, current, INITIAL, reducer, type State } from "../state";

const art = (width: number, height: number) => ({ url: `blob:${width}x${height}`, width, height });
const run = (actions: readonly Action[], from: State = INITIAL) => actions.reduce(reducer, from);
const upload = (width: number, height: number): Action => ({
  type: "uploaded",
  art: art(width, height),
});

describe("the initial state", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-the-widget-in-the-server-html} */
  it("is the sample on 24x36, no mat, black, above the sofa, the whole wall, centred", () => {
    expect(INITIAL).toMatchObject({
      art: { width: 2000, height: 3000, sample: true },
      size: "24x36",
      mat: false,
      finish: "black",
      placement: "sofa",
      view: "wall",
      focus: 0.5,
      panel: "size",
      note: null,
      reading: false,
      download: "idle",
    });
  });
});

describe("an upload", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-a-first-upload} */
  it("opens a 2:3 file on 24x36 with the note 'opened'", () => {
    const s = run([{ type: "focus", delta: 0.3 }, upload(2000, 3000)]);
    expect(s).toMatchObject({ size: "24x36", focus: 0.5, note: "opened" });
    expect(s.art).toMatchObject({ width: 2000, height: 3000, sample: false });
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-a-landscape-artwork} */
  it("opens a 3:2 file on 36x24 and a square one on 20x20", () => {
    expect(run([upload(3000, 2000)]).size).toBe("36x24");
    expect(run([upload(2000, 2000)]).size).toBe("20x20");
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-a-second-upload-replaces-the-first} */
  it("replaces an upload, keeping the style, and says so", () => {
    const s = run([
      upload(2000, 3000),
      { type: "finish", finish: "oak" },
      { type: "placement", placement: "plain" },
      { type: "view", view: "close" },
      upload(3000, 4000),
    ]);
    expect(s).toMatchObject({
      size: "18x24",
      finish: "oak",
      placement: "plain",
      view: "close",
      note: "replaced",
    });
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-an-upload-with-the-mat-on} */
  it("opens a 3:4 file on 12x16 with the mat on, and keeps the mat", () => {
    const s = run([{ type: "mat", on: true }, upload(3000, 4000)]);
    expect(s).toMatchObject({ size: "12x16", mat: true });
  });

  it("opens a 2:3 file on 24x36 with the mat on", () => {
    expect(run([{ type: "mat", on: true }, upload(2000, 3000)]).size).toBe("24x36");
  });
});

describe("the sample again", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-back-to-the-sample} */
  it("puts the sample back on 24x36 and keeps the style, mat, wall and view", () => {
    const s = run([
      upload(3000, 4000),
      { type: "finish", finish: "oak" },
      { type: "mat", on: true },
      { type: "placement", placement: "plain" },
      { type: "view", view: "close" },
      { type: "focus", delta: 0.2 },
      { type: "sample" },
    ]);
    expect(s).toMatchObject({
      size: "24x36",
      mat: true,
      finish: "oak",
      placement: "plain",
      view: "close",
      focus: 0.5,
      note: "back",
    });
    expect(s.art.sample).toBe(true);
  });

  it("says 'opened' for an upload after the sample came back", () => {
    expect(run([upload(3000, 4000), { type: "sample" }, upload(2000, 3000)]).note).toBe("opened");
  });
});

describe("the mat and the size", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-24x36-with-its-pre-cut-mat} */
  it("keeps the size when the mat switches, and centres the artwork", () => {
    const s = run([
      { type: "size", id: "16x20" },
      { type: "focus", delta: 0.4 },
    ]);
    expect(run([{ type: "mat", on: true }], s)).toMatchObject({
      size: "16x20",
      mat: true,
      focus: 0.5,
    });
    expect(
      run(
        [
          { type: "mat", on: true },
          { type: "mat", on: false },
        ],
        s,
      ).size,
    ).toBe("16x20");
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-4x6-picked} */
  it("refuses the mat on 4x6, and 4x6 under the mat", () => {
    const on4x6 = run([{ type: "size", id: "4x6" }]);
    expect(run([{ type: "mat", on: true }], on4x6)).toBe(on4x6);
    const matted = run([{ type: "mat", on: true }]);
    expect(run([{ type: "size", id: "4x6" }], matted)).toBe(matted);
  });

  it("refuses a size the artwork is not offered", () => {
    expect(run([{ type: "size", id: "36x24" }])).toBe(INITIAL);
  });
});

describe("the focus", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-at-the-edge} */
  it("is clamped to 0..1, so a reverse step moves at once from an edge", () => {
    const s16 = run([{ type: "size", id: "16x20" }]);
    const { shift, arrow } = current(s16).step;
    const top = run(Array<Action>(40).fill({ type: "focus", delta: shift }), s16);
    expect(top.focus).toBe(1);
    expect(run([{ type: "focus", delta: -arrow }], top).focus).toBeCloseTo(1 - arrow, 10);
    expect(run([{ type: "drag", focus: -3 }], s16).focus).toBe(0);
    expect(run([{ type: "drag", focus: 7 }], s16).focus).toBe(1);
  });
});

describe("the current size", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-nothing-to-move} */
  it("has nothing to move for 2:3 art in 24x36", () => {
    const c = current(INITIAL);
    expect(c.still).toBe(true);
    expect(c.step).toEqual({ arrow: 0, shift: 0 });
    expect(c.opening).toEqual({ w: 24, h: 36 });
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-keys-move-the-artwork} */
  it("cuts the height of 2:3 art in 16x20, with the engine's steps", () => {
    const s = run([{ type: "size", id: "16x20" }]);
    const c = current(s);
    expect(c.axis).toBe("y");
    expect(c.still).toBe(false);
    expect(c.step.shift).toBe(focusStep(s.art, { w: 16, h: 20 }, 1));
    expect(c.crop).toEqual({ x: 0, y: 250, w: 2000, h: 2500 });
  });

  it("cuts the width of 3:2 art in 20x16", () => {
    const s = run([upload(3000, 2000), { type: "size", id: "20x16" }]);
    expect(current(s).axis).toBe("x");
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-an-a-series-file} */
  it("has something to move for an A-series file in A3", () => {
    const s = run([upload(2480, 3508), { type: "size", id: "A3" }]);
    expect(current(s).still).toBe(false);
  });
});

describe("a file that cannot be used", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-not-an-image} */
  it("keeps the artwork and the size, and names why", () => {
    const before = run([upload(3000, 4000), { type: "size", id: "12x16" }]);
    const reading = run([{ type: "reading" }], before);
    expect(reading.reading).toBe(true);
    expect(reading.art).toBe(before.art);
    for (const kind of ["notimg", "decode"] as const) {
      const s = run([{ type: "failed", kind }], reading);
      expect(s).toMatchObject({ art: before.art, size: "12x16", note: kind, reading: false });
    }
  });
});

describe("the download", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#requirement-the-png-saves-the-view-on-screen} */
  it("ignores a PNG that finishes after the view changed", () => {
    const making = run([{ type: "download", state: "making" }]);
    expect(run([{ type: "download", state: "done" }], making).download).toBe("done");
    const changed = run([{ type: "size", id: "16x20" }], making);
    expect(changed.download).toBe("idle");
    expect(run([{ type: "download", state: "done" }], changed).download).toBe("idle");
    expect(run([{ type: "download", state: "failed" }], changed).download).toBe("idle");
  });
});

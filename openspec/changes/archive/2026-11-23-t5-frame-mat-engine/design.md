# Design

## Context

See `proposal.md` for the motivation and the two-change split. What this change builds on:

- `packages/sizes/src/frames.ts`: the catalog (`CATALOG`, `findFrame`), each size's common pre-cut mat (`mat`, turned with the frame), `MAT_OVERLAP` (¼ in) and `frameAnatomy`, whose mat opening is the image less the overlap on every side.
- `packages/sizes/src/measure.ts` (T4): `identifyFrame` matches an inside measurement to a standard, metric or custom size, with the nearest sizes below and above (and the squares for a near-square size); its `mat` branch lists the frames whose pre-cut mat holds a print within ⅜ in; `whyNoAnswer` and `NoAnswer` name why a measurement gets no answer.
- `packages/sizes/src/**` maps to `size-engine` in `openspec/specs/README.md`, so a new file there is gated by the existing spec. Vitest already runs the package's tests.
- The consumer is the F5 page, drawn on the approved canvas (https://claude.ai/artifact/PjZ5GizsgyTKMvx6nAfdRp, approved 2026-11-23). Its `Calc` board runs the same arithmetic in its own script (`TOL`, `OVER`, `matchUS`, `matchMetric`, `precut`, `nearest`, `border`, `fromPrint`, `fromFrame`); this change is that logic, tested. The canvas answers are under "Canvas answers" below.

## Goals / Non-Goals

**Goals:**

- One pure entry point answers both directions (print → frame, frame → print), tested in Node.
- Every match and pre-cut answer comes from T4's code, so F4 and F5 never disagree about what size a number is.
- Every number the canvas's result cards and the "Mat board sizes" table print comes from the engine: sizes, matches, pre-cut frames and the border each frame gives a print.
- No new package, dependency or README row.

**Non-Goals:**

- Centimetre input. The page converts with `CM_PER_INCH`, as F2, F3 and F4 do.
- Metric mats. The catalog's mat pairings are US only, as in T4's mat path. (A metric frame size is still named by the match, as on F4: canvas Q8.)
- Choosing which cards to show and in what order (exact size, pre-cut frames, next size up, square frames; in reverse the print below and the frame's own mat). That is the page's layout from canvas Q1 and Q2; the engine gives every fact each card needs.
- Bottom-weighted and double mats (canvas Q4 and Q5: not in v1).
- Rounding or labels. The page writes sizes with `writeEighths` and `writeSize`.

## Decisions

### 1. A module in `packages/sizes`: `mat.ts`

`packages/sizes/src/mat.ts`, exported from `index.ts` with a requirement citation on each export.

- Alternative: add the two directions to `measure.ts` as more `Measurement` kinds. Rejected: a measurement is one size read off a frame; a mat question has two inputs and gives three sizes. Its result shape would bend `Identified` for every F4 caller.

### 2. One tagged question, one answer shape, one border helper

```ts
const MAT_WIDTH = 2; // in, the width the calculator starts with
const MAT_WIDTHS = [1.5, 2, 2.5, 3] as const; // in, the presets

type MatQuestion =
  | { from: "print"; print: Size; width: number; overlap?: number }
  | { from: "frame"; frame: Size; width: number; overlap?: number };

interface MatAnswer {
  print: Size; // as given, or the largest print the mat holds
  opening: Size;
  frame: Size; // as given, or the frame size the print and mat give
  printMatch: Identified; // the print matched
  frameMatch: Identified; // the frame matched
  /** Frames sold with a pre-cut mat for `print`, in its orientation; often empty from a frame. */
  preCut: readonly Frame[];
}

function matSizes(q: MatQuestion): MatAnswer | undefined;
function whyNoMat(q: MatQuestion): NoAnswer | undefined;

/** Mat border at the sides and at the top and bottom for `print` in `frame`. */
function matBorders(frame: Size, print: Size, overlap?: number): { side: number; top: number };
```

- Both directions give the same three sizes and both matches, so one shape serves the result card in either mode, and the Reverse button only flips `from` (carrying the answer over as the new input is page state, canvas "Other choices").
- From a print, `frameMatch` drives the answer (standard, metric or custom with `above` = next size up and `squareAbove` = the square frame card) and `printMatch` names the print ("for an 8x10 print"). From a frame, `printMatch` drives it (`below` = the standard print that fits) and `frameMatch` gives the frame's own pre-cut mat: `frameMatch.frame.mat` when it is standard.
- `matBorders` gives every border the canvas prints: each pre-cut frame, the next size up, the square frame, a standard or metric frame, the reverse print below, the frame's own mat, and the table's "Mat border" column (`matBorders(frame, frame.mat)`). It is plain arithmetic, so a print too big for the frame gives a negative border; the page never asks for one, since it only names frames at least as big as the exact size and prints no bigger than the largest print.
- `whyNoMat` mirrors `identifyFrame` / `whyNoAnswer`: the answer function stays a plain `T | undefined`, and the reason is asked for only when there is none.
- `MAT_WIDTH` and `MAT_WIDTHS` are engine constants because the site's rule is that pages never type a size by hand (canvas Q3: field filled with 2 in, chips 1½, 2, 2½ and 3 in; cm chips are their `toCm` values, 3.8, 5.1, 6.4 and 7.6).

### 3. The arithmetic

All in inches, per side, keeping the input's orientation (no upright turn is needed: each side is computed on its own).

- From a print: `opening = print − 2·overlap`; `frame = opening + 2·width`.
- From a frame: `opening = frame − 2·width`; `print = opening + 2·overlap`.
- Borders: `side = (frame.w − print.w + 2·overlap) / 2`; `top = (frame.h − print.h + 2·overlap) / 2`.

`width` is the cut width, the same quantity `frameAnatomy` implies (11x14 with an 8x10 → 1¾ at the sides, 2¼ at the top and bottom). The ¼ in the lip hides from the front is not subtracted: the page says it in copy (canvas Q6).

### 4. The matches are `identifyFrame` on an inside measurement

`frameMatch` and `printMatch` are each `identifyFrame({ kind: "inside", size })`. Same ⅜ in tolerance, metric rule and nearest below/above as F4, already tested.

- Matching a print against the frame catalog is sound: the catalog's sizes are also the common print sizes (4x6, 5x7, 8x10, 8.5x11, 11x14…). It lacks two print sizes its mats hold (8x12, 4x4), so the reverse "print below" never names them; the canvas's own script uses the same catalog, so page and canvas agree.
- Alternative: export T4's private `match`. Rejected: `identifyFrame` already is that function behind the positive-number check, and `matSizes` has done that check by then.

### 5. Pre-cut frames: one helper shared with `identifyFrame`

The filter in `identifyFrame`'s mat branch (catalog frames whose `mat` is within `MEASURE_TOLERANCE` of the upright print, turned to the print's orientation) moves to an exported `preCutFrames(print: Size): readonly Frame[]` in `measure.ts`. `identifyFrame` calls it; so does `matSizes`. `measure.test.ts` stays unedited and must stay green: that is the proof the move changed nothing.

### 6. Validation

`whyNoMat` returns `"number"` when a side, the width or the overlap is not a positive finite number, and `"room"` when the opening has a side ≤ 0. It reuses T4's `NoAnswer` type; `"narrow"` never occurs for a mat. A width of 0 is refused as `"number"`: the canvas's error for it adds the no-mat answer in copy ("With no mat, the frame is the print size"), which needs no engine call.

## Risks / Trade-offs

- [A custom answer carries many neighbours: an 8x10 print with a 2 in mat has 8.5x11 below, 12x16 above, squares 10x10 and 16x16, and pre-cut 11x14.] → The canvas (Q1 option A) shows the exact size, the pre-cut frames, the next size up (only when not already pre-cut) and the square above; it drops the sizes below. The engine still gives all of them, so the layout can change without an engine change.
- [Moving the pre-cut filter could change F4's mat answer.] → The move is a pure extraction, `measure.test.ts` is not edited and must pass, and F4's DOM tests cover the mat result.
- [Uniform width only.] → Real mats are often a little wider at the bottom. Out of v1 by the canvas (Q4).

## Migration Plan

None. New exports only; F5 stays `live: false`; F4's behaviour is unchanged.

## Canvas answers

Approved 2026-11-23 on https://claude.ai/artifact/PjZ5GizsgyTKMvx6nAfdRp. Every question took option A.

1. **Custom frame size:** cards in order: Order this size (the exact frame, mat cut to the asked border), Ready-made with a pre-cut mat (each frame with the border it gives), Next size up (only when it is not already a pre-cut frame), and, for a near-square print, Square frames (the square above with its borders; the square below named as too small). For 8x10 + 2 in: 11½ × 13½ in; 11x14 (1¾ / 2¼ in); 12x16 (2¼ / 3¼ in); 16x16 (4¼ / 3¼ in).
2. **Reverse:** the largest print first, then the standard print below it that fits with its borders, then the mat this frame is sold with. For 11x14 + 2 in: 7½ × 10½ in; 5x7 (3¼ / 3¾ in); the 11x14's pre-cut mat takes an 8x10 (1¾ / 2¼ in).
3. **Mat input:** field filled with 2 in, chips 1½, 2, 2½ and 3 in; typing any other number un-presses the chips.
4. **Bottom-weighted mat:** not in v1.
5. **Double mat:** not in v1.
6. **Wording:** "Mat border" is the cut width; the hint says the frame's lip covers about ¼ in of it.
7. **Units:** in/cm switch in the widget head and the site header, as on F4; switching converts the typed numbers.
8. **Metric frames:** kept. A 12x16 print with a 2 in mat lands on 40 × 50 cm; an 8x12 on 30 × 40 cm.

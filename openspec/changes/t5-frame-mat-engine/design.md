# Design

## Context

See `proposal.md` for the motivation and the two-change split. What this change builds on:

- `packages/sizes/src/frames.ts`: the catalog (`CATALOG`, `findFrame`), each size's common pre-cut mat (`mat`, turned with the frame), `MAT_OVERLAP` (¼ in) and `frameAnatomy`, whose mat opening is the image less the overlap on every side.
- `packages/sizes/src/measure.ts` (T4): `identifyFrame` matches an inside measurement to a standard, metric or custom size, with the nearest sizes below and above; its `mat` branch lists the frames whose pre-cut mat holds a print within ⅜ in; `whyNoAnswer` and `NoAnswer` name why a measurement gets no answer.
- `packages/sizes/src/**` maps to `size-engine` in `openspec/specs/README.md`, so a new file there is gated by the existing spec. Vitest already runs the package's tests.
- The consumer is the F5 page, not drawn yet. The canvas may change which standard sizes the answer names; phase 1's step 3 folds that in with `/opsx:update` before apply.

## Goals / Non-Goals

**Goals:**

- One pure entry point answers both directions (print → frame, frame → print), tested in Node.
- Every match and pre-cut answer comes from T4's code, so F4 and F5 never disagree about what size a number is.
- No new package, dependency, constant or README row.

**Non-Goals:**

- Centimetre input. The page converts with `CM_PER_INCH`, as F2, F3 and F4 do.
- Metric mats. The catalog's mat pairings are US only, as in T4's mat path. (A metric frame size can still be named by the match, as on F4.)
- Choosing one "best" standard frame or print. That is the canvas's first open question. Options 1a, 1c and 2a also need the mat widths a named frame gives a named print, which `MatAnswer` does not carry; picking one of them adds a one-line "mat widths for a frame and a print" function at `/opsx:update`.
- A default mat width. It is a widget setting the canvas picks (open question 3); if it becomes an engine constant, `/opsx:update` adds it.
- Bottom-weighted and double mats (open questions 4 and 5).
- Rounding or labels. The page writes sizes with `writeEighths` and `writeSize`.

## Decisions

### 1. A module in `packages/sizes`: `mat.ts`

`packages/sizes/src/mat.ts`, exported from `index.ts` with a requirement citation on each export.

- Alternative: add the two directions to `measure.ts` as more `Measurement` kinds. Rejected: a measurement is one size read off a frame; a mat question has two inputs and gives three sizes. Its result shape would bend `Identified` for every F4 caller.

### 2. One tagged question, one answer shape

```ts
type MatQuestion =
  | { from: "print"; print: Size; width: number; overlap?: number }
  | { from: "frame"; frame: Size; width: number; overlap?: number };

interface MatAnswer {
  print: Size; // as given, or the largest print the mat holds
  opening: Size;
  frame: Size; // as given, or the frame size the print and mat give
  /** The frame size matched (from a print) or the largest print matched (from a frame). */
  match: Identified;
  /** Frames sold with a pre-cut mat for `print`, in its orientation; often empty from a frame. */
  preCut: readonly Frame[];
}

function matSizes(q: MatQuestion): MatAnswer | undefined;
function whyNoMat(q: MatQuestion): NoAnswer | undefined;
```

- Both directions give the same three sizes, so one shape serves the page's result card in either mode, and the reverse button only flips `from`.
- `whyNoMat` mirrors `identifyFrame` / `whyNoAnswer`: the answer function stays a plain `T | undefined`, and the reason is asked for only when there is none.

### 3. The arithmetic

All in inches, per side, keeping the input's orientation (no upright turn is needed: each side is computed on its own).

- From a print: `opening = print − 2·overlap`; `frame = opening + 2·width`.
- From a frame: `opening = frame − 2·width`; `print = opening + 2·overlap`.

`width` is the cut width, (frame − opening) ÷ 2, the same quantity `frameAnatomy` implies (11x14 with an 8x10 → 1¾ at the sides, 2¼ at the top and bottom). The ¼ in the lip hides from the front is not subtracted here: what the visitor is told is a canvas copy question (open question 6).

### 4. The match is `identifyFrame` on an inside measurement

`match = identifyFrame({ kind: "inside", size })` with `size` the frame (from a print) or the print (from a frame). It is the same ⅜ in tolerance, metric rule and nearest below/above as F4, already tested.

- Matching a print against the frame catalog is sound: the catalog's sizes are also the common print sizes (4x6, 5x7, 8x10, 8.5x11, 11x14…). The catalog lacks two print sizes its mats hold (8x12, 4x4); that only matters if the canvas picks "name the standard print that fits", and `/opsx:update` would add them then.
- Alternative: export T4's private `match`. Rejected: `identifyFrame` already is that function behind the positive-number check, and `matSizes` has done that check by then.

### 5. Pre-cut frames: one helper shared with `identifyFrame`

The filter in `identifyFrame`'s mat branch (catalog frames whose `mat` is within `MEASURE_TOLERANCE` of the upright print, turned to the print's orientation) moves to an exported `preCutFrames(print: Size): readonly Frame[]` in `measure.ts`. `identifyFrame` calls it; so does `matSizes`. `measure.test.ts` stays unedited and must stay green: that is the proof the move changed nothing.

### 6. Validation

`whyNoMat` returns `"number"` when a side, the width or the overlap is not a positive finite number, and `"room"` when the opening has a side ≤ 0. It reuses T4's `NoAnswer` type; `"narrow"` never occurs for a mat. A width of 0 is refused as `"number"`: "no mat" is a different question (F1 and F4 answer it), and allowing it would quietly give a frame ½ in smaller than the print.

## Risks / Trade-offs

- [The custom answer reads oddly for common cases: an 8x10 print with a 2 in mat names 8.5x11 below and 12x16 above, plus two squares, while the frame people buy is the 11x14 with a pre-cut mat.] → The answer also carries `preCut` (11x14), and the canvas decides what the page names first (open question 1). If it picks a different rule, `/opsx:update` changes the spec before any test is written.
- [A frame and a mat width usually give a print size between two standards.] → The reverse answer names both neighbours; the canvas decides how to show it (open question 2).
- [Moving the pre-cut filter could change F4's mat answer.] → The move is a pure extraction, `measure.test.ts` is not edited and must pass, and F4's DOM tests cover the mat result.
- [Uniform width only.] → Real mats are often a little wider at the bottom. Kept out until the canvas asks for it (open question 4).

## Migration Plan

None. New exports only; F5 stays `live: false`; F4's behaviour is unchanged.

## Questions for the canvas

These go to the designer with the phase 1 prompt. The approved canvas answers them, and step 3 folds any change into this change with `/opsx:update` before `/opsx:apply`. Recommendation first.

1. **Which standard frame the forward answer names when the exact size is custom.** (a) Lead with the exact frame size to order, then "ready-made with a pre-cut mat" from `preCut`, then the size above with the real mat widths it gives (recommended). (b) The F4 pair, sizes below and above. (c) One "best" frame chosen by a rule (closest mat width).
2. **What the reverse answer names.** (a) The largest print, then the standard print below it that fits and the mat width it gives (recommended). (b) The F4 pair. (c) A frame plus a print gives the mat widths, instead of a frame plus a width.
3. **Default mat width and its input.** 2 in default, presets 1½, 2, 2½ and 3 in, plus a typed value (recommended); or a free field only.
4. **Bottom-weighted mat.** Not in v1 (recommended); or a toggle adding ½ in at the bottom.
5. **Double mat.** Not in v1 (recommended).
6. **Mat width wording.** Say "mat border" for the cut width and note that the frame's lip covers about ¼ in of it (recommended); or show the visible width.
7. **Centimetres.** An in/cm switch, as on F4, converting before the engine (recommended).
8. **Metric frame sizes in the answer.** The F4 match names a metric frame when it is closer than any US size: an 8x12 print with a 2 in mat gives 11½ × 15½ in, the metric 30 × 40 cm. Keep that, as F4 does, since 30 × 40 cm frames are sold in the US (recommended); or match US sizes only on F5.

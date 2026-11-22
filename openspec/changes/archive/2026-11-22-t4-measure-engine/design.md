# Design

## Context

See `proposal.md` for the motivation and the two-change split. What this change builds on:

- `packages/sizes/src/frames.ts` holds the catalog. It stores each size upright (`ENTRIES`), lists it in any orientation (`framesFor`, `findFrame`), and gives each size its common pre-cut mat (`mat`, turned with the frame). `frameAnatomy` already defines the two allowances this change inverts: the outside is the frame size plus the moulding on every side, and the mat opening is the image less `MAT_OVERLAP` (¼ in) on every side.
- `packages/sizes/src/**` maps to `size-engine` in `openspec/specs/README.md`, so a new file there is gated by the existing spec. Vitest already runs the package's tests.
- `packages/sizes/src/screen.ts` holds `ACTUAL_SIZES`, whose A4 and A3 entries are built from millimetres for F3.
- The consumer is the F4 page, drawn on the approved canvas (https://claude.ai/artifact/SqK52EoyyoLLXzRPPKSUkB). Its `Wizard` board runs the same arithmetic in its own script (`TOL`, `LIP`, `OVER`, `matchUS`, `matchMetric`, `nearest`); this change is that logic, tested.

## Goals / Non-Goals

**Goals:**

- One pure function turns any of the four measurements into the frame size (or print size) it points to and the standard sizes that match, tested in Node.
- The match is never ambiguous: at most one catalog size and one metric size per frame measurement, and a fixed rule picks between them.
- No new package, dependency or README row.

**Non-Goals:**

- Centimetre input. The page converts with `CM_PER_INCH`, as F2 and F3 do; the engine stays in inches.
- Metric sizes in the mat path. The catalog's mat pairings are US only, and the canvas matches mats against them alone.
- Metric sizes as nearest sizes for a custom size. The canvas names US sizes only.
- Rounding or labels. The page writes sizes with `writeSize`.

## Decisions

### 1. A module in `packages/sizes`: `measure.ts`

`packages/sizes/src/measure.ts`, exported from `index.ts` with a requirement citation on each export.

- It reads `CATALOG`, `findFrame` and `MAT_OVERLAP` from `frames.ts`. The catalog stays the one list of sizes (constitution: one mechanism per concern).
- Alternative: add the functions to `frames.ts`. Rejected: `frames.ts` is the checked data and its lookups; measuring is a separate concern with its own allowances and tests, as `scene.ts` and `wall.ts` are.

### 2. One entry point over a tagged measurement

```ts
type Measurement =
  | { kind: "inside"; size: Size }
  | { kind: "front"; size: Size; lip?: number }
  | { kind: "outside"; size: Size; face: number; lip?: number }
  | { kind: "mat"; size: Size; overlap?: number };

/** `size` is the frame size the numbers give, or for a mat the print size. */
type Identified =
  | { kind: "standard"; size: Size; frame: Frame }
  | { kind: "metric"; size: Size; metric: ActualSize; close?: Frame }
  | { kind: "custom"; size: Size; below?: Frame; above?: Frame }
  | { kind: "mat"; size: Size; frames: readonly Frame[] }; // empty: no pre-cut mat for that print

function identifyFrame(m: Measurement): Identified | undefined; // undefined = no answer
```

- The wizard will hold the kind the visitor picked and call one function, so its reducer stays a switch on the step, not on the math.
- Alternative: four functions (`frameFromInside`, `frameFromOutside`, …). Rejected: each would repeat the validation and the match, and the page would pick the function by kind anyway.
- The answer is tagged, so the page's result board is one switch over the canvas's results a to e (standard, metric, custom, mat with one or two frames, mat with none).
- Alternative: one shape with optional fields (`frames`, `metric?`, `below?`). Rejected: the page would have to know which combinations can occur.

### 3. The arithmetic

All per side, in inches:

| Kind    | Frame or print size           | Why                                                                                 |
| ------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| inside  | as measured                   | the glass, backing or recess is the frame size                                      |
| front   | opening + 2 × lip             | the lip covers the picture's edge                                                   |
| outside | outside − 2 × face + 2 × lip  | `face`, the moulding seen from the front, includes the lip; `frameAnatomy` inverted |
| mat     | opening + 2 × overlap → print | `frameAnatomy`'s mat opening inverted                                               |

`LIP = 0.25` is a new export beside `MAT_OVERLAP`. `frameAnatomy`'s `moulding` is the width beyond the frame size, which on a real frame is `face` less the lip. The field is named `face`, not `moulding`, so passing `MOULDING` by mistake cannot look right; the scenario "13 by 16 outside, 1¼ in moulding → 11x14" ties the two together (the anatomy scenario's 11x14 has a 1 in moulding beyond the frame size, 13 by 16 outside).

### 4. Matching: upright, Chebyshev distance, ⅜ inch

- The measured size is made upright (shorter side first) and compared with `CATALOG`, which is stored upright. A match is the entry whose width and height are each within `MEASURE_TOLERANCE = 0.375` of it (inclusive).
- The result is turned back: a landscape measurement returns `findFrame` of the landscape id, a square entry stays square.
- Why ⅜ in: it absorbs a recess cut up to ⅛ in large, a tape read to the nearest ⅛ in, and the lip varying between ³⁄₁₆ and ⁵⁄₁₆ in (twice, on the outside path). The closest two catalog sizes, 8x10 and 8.5x11, and 11x17 against 12x16 and 12x18, are 1 in apart on some side, so a tolerance under ½ in can never match two. A test pins that gap, so a future catalog entry that breaks it fails loudly.
- Alternative: the nearest size, with no tolerance. Rejected: a 9x12 frame would be called an 8x10 or 11x14, which is wrong, and the page's promise is to name the size you have.

### 5. Mat: through the catalog's mat pairings

- The print size (opening + 2 × overlap) is matched, upright and within the same tolerance, against the distinct `mat` sizes of the upright catalog. Every frame whose mat matches is listed, in catalog order, turned to the measured orientation.
- The same uniqueness test runs over the mat print sizes (8x10 against 8.5x11 and 8x12 against 8.5x11 are 1 in apart).
- The answer's `size` is the computed print size, not the matched pairing, so the page shows what the visitor measured.

### 6. Metric frames: a short list beside the catalog, the closer one wins

- `METRIC_FRAMES` in `measure.ts`: the A4 and A3 entries of `ACTUAL_SIZES` (one record of each, constitution: one mechanism per concern), then 30 × 40, 40 × 50 and 50 × 70 cm from centimetres, as `ActualSize` values (`id`, `label`, inches). It stays out of `CATALOG`, which F1 and F2 list in full as the US ready-made sizes.
- A frame size is matched against both lists with the same tolerance. Each list matches at most once (tests pin the gaps: 1 in for the catalog, more than ¾ in for the metric list). Both can match: 30 × 40 cm is 0.25 in from 12x16, and 40 × 50 cm 0.32 in from 16x20.
- The distance is the larger of the two side differences. The metric size wins only when strictly closer, so a measured 12 × 16 in stays the US 12x16 and a tie goes to the US size. A winning metric size carries the US match as `close`, which the canvas shows as "12x16 is close too, but 30 × 40 cm is closer".
- The metric answer is turned to the measured orientation; its `id` stays as is (A4, 30x40 cm).

### 7. Custom size: the nearest catalog sizes below and above

- With no match, the engine scans the upright catalog within the same shape class: square when the measured sides are within the tolerance, rectangular otherwise. `below` is the entry of largest area no bigger on either side; `above` the entry of smallest area at least as big on both sides. An area tie goes to the earlier catalog entry. Both are turned to the measured orientation.
- Alternative: `nextSizeUp`. Rejected: it walks from a catalog frame, and a custom size is not one (the canvas notes this); it also gives no size below.

### 8. Validation

Every side, the face width, the lip and the overlap must be finite and positive (a lip or overlap of 0 is refused too: no real frame or mat has none, and a 0 would hide a typing slip). On the outside path a face no wider than the lip is refused: the face includes the lip, so such a face would give a frame size as big as the outside or bigger (phase review). After the arithmetic, a frame size that is not positive (outside path) is no answer.

## Risks / Trade-offs

- [The lip differs by maker] → ⅜ in absorbs ³⁄₁₆ to ⁵⁄₁₆ in; `lip` is a parameter, so the page can ask for it if the canvas shows a frame with an unusual lip. The source check (task 2.1) confirms ¼ in is the common figure.
- [A visitor measures the front opening of a matted frame as "inside"] → the numbers then point to a size ½ in small, usually custom, or worse the wrong frame. The canvas must show where each measurement is taken; the engine cannot tell.
- [BL-17: the 20x30 and 27x40 pairings may change] → the mat path reads the pairings, so a later data change flows through without code changes; the mat scenarios do not use those two sizes.
- [The catalog grows a size within 1 in of another, or the metric list one within ¾ in] → the uniqueness test fails, and the tolerance or the matching must be revisited in that change.
- [The canvas's script and the engine drift] → the page change replaces the canvas's inline math with `identifyFrame`; the canvas stays a picture of the behaviour, not a second implementation.

## Migration Plan

None: additive engine exports and no page. Rollback is reverting the module and its exports.

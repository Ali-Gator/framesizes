# Design

## Context

See `proposal.md` for the motivation and the two-change split. What this change builds on:

- `packages/sizes/src/frames.ts`: the 19-size catalog (`CATALOG`, `findFrame`), each size's pre-cut mat (`mat`, turned with the frame) and `MAT_OVERLAP` (¼ in).
- `packages/sizes/src/measure.ts` (T4): `identifyFrame` matches an inside size to a standard, metric or custom size with the nearest sizes below and above; `preCutFrames` lists the frames whose pre-cut mat holds a print within ⅜ in, turned to the print's orientation.
- `packages/sizes/src/mat.ts` (T5): `matBorders` gives the border at the sides and at the top and bottom for a print in a frame; `matSizes` gives the exact frame for a print and a mat width.
- `packages/sizes/src/screen.ts` (T3): `ACTUAL_SIZES` holds A3 from its millimetre size.
- `packages/sizes/src/**` maps to `size-engine` in `openspec/specs/README.md`, so a new file there is gated by the existing spec.

## Goals / Non-Goals

**Goals:**

- One pure call answers a poster both ways (without and with a mat), tested in Node.
- Every match comes from T4's code and every border from T5's, so F4, F5 and F6 never disagree about a size.
- Every number the F6 widget and its "Poster frame sizes chart" table print comes from the engine.

**Non-Goals:**

- New `CATALOG` or `METRIC_FRAMES` sizes (24x30, 30x40, A2, A1). See decision 4.
- Choosing which answer the page shows first, or its wording. The engine gives every fact; the canvas settles the layout.
- Painting or canvas sizes. They belong to C1 (T20); see canvas question Q7.
- Centimetre input. The page converts with `CM_PER_INCH`, as F2 to F5 do.

## Decisions

### 1. A module in `packages/sizes`: `poster.ts`

`packages/sizes/src/poster.ts`, exported from `index.ts` with a requirement citation on each export.

- Alternative: add the poster list to `frames.ts` and the lookup to `mat.ts`. Rejected: the poster list is not frame data, and `mat.ts` answers one question shape (a print and a mat width); a poster lookup has no mat width.

### 2. The shapes

```ts
type PosterGroup = "us" | "a-series";
interface Poster extends Size {
  id: string; // "24x36", "A2"
  group: PosterGroup;
  use: string; // "Movie posters"
}
const POSTERS: readonly Poster[]; // upright, the picker's order
const POSTER_BORDER = { min: 1, max: 4 } as const; // in, ends included

interface MattedFrame {
  frame: Frame; // turned to the poster's orientation
  side: number; // border at the sides, in
  top: number; // border at the top and bottom, in
  preCut: boolean; // sold with a pre-cut mat for this poster
}
interface PosterFrames {
  bare: Identified; // the frame without a mat: identifyFrame on the poster's own size
  aFrame?: ActualSize; // A2 or A1, turned, when bare is custom and the poster is within ⅜ in of it
  matted: readonly MattedFrame[]; // smallest area first; empty when none
  customFrame?: Size; // only when matted is empty: the frame a 2 in mat needs (matSizes, MAT_WIDTH)
}
function posterFrames(poster: Size): PosterFrames | undefined; // undefined: not a positive size
```

- `bare` is `identifyFrame({ kind: "inside", size: poster })`, unchanged. A poster is a print with no mat, and a frame's size is its inside size, so this is the same question F4 answers.
- `aFrame` checks a module-local `A_FRAMES` list (A2, A1, built like `METRIC_FRAMES`' A3) with the same ⅜ in tolerance, only when `bare` is custom. It is a second field, not a new `Identified` kind, so the custom answer keeps its sizes below and above, which the canvas prints next to "Use an A2 frame".
- `matted` walks `CATALOG` upright, rectangles only for a non-square poster (all sizes for a square one, sides within ⅜ in), takes a frame when `preCutFrames(poster)` lists it or when both `matBorders` values are within `POSTER_BORDER`, sorts by area (a stable sort keeps catalog order on a tie), then turns each with `findFrame(`${h}x${w}`)` for a landscape poster (a square stays square) and swaps its borders.
- Phase review (2026-11-23): the pre-cut set is `mat.ts`'s `preCutFor` (the diploma pairing included, so F5 and F6 agree on an 8½ × 11); a frame in it is never skipped by the square rule (a 7.7 × 8.3 keeps its pre-cut 10x10 and 12x12); and its borders are the sold mat's, from its catalog pairing or the diploma, not the typed poster's. `gap` (`measure.ts`) and `fromMm` (`screen.ts`) are imported, not copied.
- `customFrame` is `matSizes({ from: "print", print: poster, width: MAT_WIDTH }).frame`, so F5 and F6 give the same number (27x40: 30½ × 43½ in).
- A3 reuses the numbers of the `ACTUAL_SIZES` A3 record; A2 and A1 are built from millimetres the same way (`mm / 25.4`).
- Alternative: return a `NoAnswer` reason as `whyNoMat` does. Rejected: a poster has one input and one way to fail (`number`), so `undefined` says it all.

### 3. The border range is 1 to 4 inches, pre-cut frames always listed

A border under 1 in reads as a thin line, and over 4 in the poster looks small in its frame. The range brackets F5's presets (1½–3 in). A frame sold with a pre-cut mat is a real product, so it is listed whatever its border (the 12x18 for an 11x17 poster has ¾ in).

- Alternative: pre-cut frames only. Rejected: 12x18, 18x24, 24x36 and 27x40 posters would get nothing, and 11x17 only a ¾ in mat.
- Alternative: also require even borders. Rejected for v1: the page shows both numbers, so the visitor sees an uneven mat (18x24 in 20x30: 1¼ / 3¼). Canvas question Q3.

### 4. The catalog and the metric frames do not change

- Adding 24x30 and 30x40 would give the 18x24 and 24x36 posters an even mat (3¼ / 3¼; 3¼ / 2¼), but F1's description says "from 4x6 to 27x40" and F2's says "all 19 standard frame sizes", both verbatim from the SEO guide, and F1's table and F4's and F5's answers would change. That is a cross-page change with a retail check of its own (canvas question Q5).
- Adding A2 and A1 to `METRIC_FRAMES` would change what F4 and F5 name for a measurement near those sizes. The canvas's engine note asks for them "in the metric frame list"; they go in an F6-only `A_FRAMES` list instead, which gives the canvas everything it draws (Q6 A) and leaves F4 and F5 as they are. A spec scenario pins that a measured 16½ × 23⅜ in stays custom.

### 5. BL-17 rides on this change's data check

The poster sizes are new size data, so `verification.md` records their sources (US poster sizes at retail, A-series from ISO 216) and the date. The same check looks again at the 20x30 and 27x40 mat pairings (BL-17: one listing in seven pairs them with a 16x24 / 24x36 mat). If the evidence now says to pair them, the change stops and asks the user: F1's table, F4's table and existing tests show "No mat" for both. Otherwise BL-17 stays deferred with the new check's date.

## Risks / Trade-offs

- [The 1–4 in range lists uneven mats, such as 18x24 in 20x30 (1¼ / 3¼)] → the page shows both borders, as the canvas draws (Q3 A).
- [A 27x40 poster has no standard frame with a mat] → `customFrame` gives the frame for a 2 in mat (30½ × 43½ in) and the page links to F5 (Q4 A).
- [An "A2 frame" is a retail claim] → task 1.2 records US listings that sell A2 and A1 frames under those names; if they do not hold, the page change falls back to Q6 B and `aFrame` goes unused.
- [The poster list is a draft until checked] → `verification.md` before the code; a size that fails the check is dropped and the SEO guide's range is fixed if it moves.
- [The A4 print matches the 11x17 frame's 8x12 pre-cut mat within ⅜ in] → A4 is not a poster preset, so the picker never shows it; a typed A4 size would. Accepted: the same tolerance F4 and F5 use.

## Canvas answers

The F6 canvas (https://claude.ai/artifact/43JSmmnTJHtj55WBpR84qT) was approved on 2026-11-23 with option A on all ten questions. What reaches the engine:

- **Q1 A:** the ten poster sizes; the use lines are the canvas's ("other choices" note), stored per poster.
- **Q3 A:** pre-cut frames plus any frame with a 1–4 in border, both borders shown. The canvas's engine note adds: frames sorted small to large, and squares left out for a non-square poster.
- **Q4 A:** `customFrame`, the frame for a 2 in mat, when no standard frame holds the poster.
- **Q5 A:** no 24x30 or 30x40 frames; a backlog item to check them at retail is logged before archive.
- **Q6 A:** `aFrame` names the A2 or A1 frame; the custom answer's sizes below and above stay.
- Page only (the page change): Q2 custom size field, Q7 painting section, Q8 orientation switch, Q9 default 24x36 without a mat, Q10 one three-column table; one-decimal cm without a trailing .0 and one-decimal A-series inches; one drawing scale for every size; the intro naming 12x18, 16x20 and 18x24.

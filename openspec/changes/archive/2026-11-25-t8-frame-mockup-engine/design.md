# Design

## Context

See `proposal.md` for the motivation and the two-change split. What this change builds on:

- `packages/sizes/src/frames.ts`: the 19-size catalog. `framesFor(orientation)` gives it turned, in catalog order. Each `Frame` carries its pre-cut mat's print size (`mat`, turned with it, `null` when none). `MAT_OVERLAP` is ¼ in and `MOULDING` is 1 in.
- `packages/sizes/src/poster.ts` (T6): `POSTERS` holds A3, A2 and A1 (group `"a-series"`), upright, from their millimetre sizes.
- `packages/sizes/src/mat.ts` (T5): `MAT_WIDTH` is the 2 in default mat.
- `packages/sizes/src/scene.ts` (T2) and `wall.ts` (T7):
  - `wallScene` hangs a frame above the sofa or on the 57 in centre line, centred on x = 0;
  - `DEMO_ROOM` shifts it onto the 144 × 96 in wall by `+72` on x;
  - `SOFA`, `ABOVE_SOFA` and `CENTRE_LINE` hold the rules.
  - Rects are in inches, `y` up from the floor to the bottom edge.
- `packages/sizes/src/**` maps to `size-engine` in `openspec/specs/README.md`, so a new file there is gated by the existing spec.

## Goals / Non-Goals

**Goals:**

- Pure calls, tested in Node, that the page draws on screen and into the PNG alike, so the two never differ.
- Every size and rule comes from the existing catalog, poster list, mat and wall code.

**Non-Goals:**

- Reading files, decoding, drawing, `canvas.toBlob`, the download. That is browser code for the page change. The same goes for EXIF orientation: an `<img>` applies it, as on F2, and gives the pixel size this engine takes.
- Frame style colours, names and textures, and any per-style moulding width. All styles use `MOULDING` (1 in) until the canvas says otherwise (prompt Q4).
- A custom typed frame size, a "fits without cropping" list (PH2), print sharpness or DPI (Q2).
- The visitor's own wall photo. F2 owns that flow (prompt Q5).

## Decisions

### 1. A module in `packages/sizes`: `mockup.ts`

`packages/sizes/src/mockup.ts`, exported from `index.ts` with a requirement citation on each export.

- Alternative: add to `scene.ts` or `wall.ts`. Rejected: those take frames in inches, while this starts from pixels and joins the catalog, posters, mats and wall. One module reads better and keeps the F7-only rules in one place.

### 2. The shapes

```ts
interface Art {
  width: number; // px
  height: number; // px
}
interface MockupSize extends Size {
  id: string; // "24x36", "36x24", "A2"
  /** The pre-cut mat's print size, turned; null when none (A-series included). */
  mat: Size | null;
}
interface MockupOption {
  size: MockupSize;
  opening: Size | null; // in, with or without the mat as asked; null: no room for a mat (4x6)
  cut: number | null; // 0..1; null with no opening
}
type Placement = "sofa" | "plain";
type View = "wall" | "close";

const SQUARE_TOLERANCE = 0.05;
const TIE = 0.01; // one percentage point
const EXPORT_LONG_SIDE = 2400; // px
const KEY_STEP = { arrow: 0.25, shift: 1 } as const; // in

function mockupSizes(art: Art): readonly MockupSize[] | undefined;
function mockupOpening(size: MockupSize, mat: boolean): Size | undefined; // undefined: no room for a mat
function mockupOptions(art: Art, mat: boolean): readonly MockupOption[] | undefined; // offered order
function mockupDefault(art: Art, mat: boolean): MockupOption | undefined;
function visiblePart(art: Art, opening: Size, focus?: number): Rect | undefined; // px, y down from the top
function hangMockup(size: Size, placement: Placement): Rect; // outside, on the 144 × 96 wall
function mockupView(outside: Rect, view: View): Rect;
function exportSize(view: Rect): Size; // px
function focusStep(art: Art, opening: Size, step: number): number | undefined; // 0 when not cut
```

`undefined` stands for "no answer" (requirement "An artwork size that is not a positive number…"). This matches `posterFrames` and `identifyFrame`.

### 3. Orientation and the size list

The orientation is portrait, landscape or square. Square means the shorter side is at least 95% of the longer. The list is `framesFor(orientation)` mapped to `{ id, w, h, mat }`. For portrait and landscape the three A-series `POSTERS` follow, turned, with `mat: null` and ids `A3`, `A2`, `A1`. Square art gets no A-series size.

- Alternative: exact square only, as the catalog does. Rejected: a photo crop of 1000 × 1050 px would get portrait frames that cut 16% or more (8x10) instead of square ones that cut 4.8%.
- Alternative: always add the square sizes to every list. Rejected: 22 sizes to scroll, and the square ones never win for a clearly portrait artwork.

### 4. The cut

`cut = 1 − min(ra / ro, ro / ra)`, where `ra` is the artwork's width over height and `ro` the opening's. It is the share of the artwork's area outside the visible part (decision 6), so the number and the picture agree.

### 5. The default, and ties

The least cut wins. Sizes within `TIE` of it count as tied, and the largest area among them wins. Without a tie rule, 2:3 art would open on 4x6 (the first of four sizes that cut 0), which is a poor first mockup for a "poster mockup" query. The tie also absorbs rounding: A3, A2 and A1 are not exactly 1:√2.

### 6. The opening and the visible part

The opening is decided per case:

- without a mat: the frame;
- with a pre-cut mat: `mat − 2 × MAT_OVERLAP`;
- otherwise: `frame − 2 × MAT_WIDTH`, and `undefined` when that leaves no positive side (4x6). `mockupOptions` keeps such a size with `opening: null` and `cut: null`, so the page can show it disabled (canvas answer 2), and `mockupDefault` skips it.

`visiblePart` takes the largest rect of the opening's ratio inside the artwork. On the cut axis it sits at `focus × slack`, where `focus` is clamped to 0..1 (default 0.5). The rect is in fractional pixels, which `drawImage` takes as they are. A focus is one number because only one axis is ever cut.

`focusStep` turns a key step in inches into a focus change: `step / slackInches`, where `slackInches` is the artwork's length on the cut axis, scaled to fill the opening, less the opening's length. With less than half a pixel of slack it returns 0, so float noise never becomes a huge step. The page adds the result to the focus and clamps the stored focus to 0..1 after every step (`visiblePart` clamps too), so a key never pushes the artwork off its edge and a reverse press moves it at once. The cut axis is the one where the visible part is shorter than the artwork.

### 7. The wall, the views and the PNG

`hangMockup` centres the frame across the wall (`x = 72 − w / 2`, with the outside size from `MOULDING`). Above the sofa it calls `wallScene({ frame: size, reference: "sofa" })` and shifts x by half the wall's width, as `DEMO_ROOM` does; the sofa's `frameX` is 0. On the plain wall it sets `y = CENTRE_LINE − h / 2` itself.

- Alternative: `wallScene` with the `"person"` reference for its centred rule. Rejected: the person's `frameX` is 10 in (the frame hangs beside the person), so the frame would sit off-centre on an empty wall.

The close-up widens the outside by `max(w, h) / 4` on every side. The largest frame (27x40, 29 × 42 in outside) gives 50 × 63 in, which fits the 144 × 96 in wall by either rule. A test covers every offered size, both placements and both orientations, so no clamp is written.

`exportSize` scales the view's longer side to `EXPORT_LONG_SIDE` and rounds. The whole wall is 2400 × 1600 px, 3.84 megapixels, well under iOS Safari's ~16.7-megapixel canvas limit. A 4800 px HD export would still fit (15.4 megapixels for the wall), which leaves room for the Pro tier the research names.

## Risks / Trade-offs

- [A 5% square tolerance turns a 1000 × 1050 px artwork into a square frame that crops 4.8%.] → That is less than any portrait frame would cut. The rule is one constant if the canvas wants another.
- [The tie rule picks the largest size, so a small sticker-sized design opens on a big frame.] → The visitor picks another size in one tap. The rule only sets the first picture.
- [Fractional pixel rects.] → `drawImage` and CSS both take fractions. The PNG draw rounds only at the canvas size.

## Migration Plan

None. New exports only. Nothing on the site uses them until the page change.

## Canvas answers

The F7 canvas (https://claude.ai/artifact/8YexFJ28z3TrXTGLJteFSf), approved 2026-11-24 with option A on Q1–Q10, draws the engine's numbers as this change has them (sizes, cuts, the 24x36 default, the mats, the wall heights, the close-up and the PNG sizes). Its notes add four engine points, folded in:

1. **The opening size follows the mat.** An upload with the mat on opens on the size that cuts least with the mat. `mockupDefault(art, mat)` already takes the setting; a 3:4 scenario with a mat (12x16) pins it.
2. **4x6 stays listed with a mat**, disabled, instead of being left out (decision 6). The spec scenario changes with it.
3. **Key steps.** Arrow keys move the artwork ¼ in, Shift + arrow 1 in, along the cut side (`KEY_STEP`, `focusStep`).
4. **Q8 A, a money answer from the owner:** the PNG is free at 2,400 px with no watermark, and HD is not offered for now. `EXPORT_LONG_SIDE` stays 2400.

Page-only answers (switching the mat keeps the size, "Use the sample again", the file name, the answer's heights, the phone tabs, the design system gaps, the shop-listing FAQ) are listed in `proposal.md` for the page change.

## Open Questions

None.

# size-engine Specification

## Purpose

The single source of every size the site shows. It holds the frame size catalog and derives from it everything a page prints or draws: centimetres, the written form of a size, orientation, the next size up, mat pairings, frame anatomy, the true-scale wall scene and the wall tool's geometry. Pages never type a size by hand.

## Public Interface

```typescript
// packages/sizes (@framesizes/sizes), source-only: exports ./src/index.ts
interface Size {
  w: number;
  h: number;
} // inches, width first
type Unit = "in" | "cm";
type SizeForm = "search" | Unit; // "8x10" | "8 × 10 in" | "20.3 × 25.4 cm"
function toCm(inches: number): number; // one decimal
function toWholeCm(inches: number): number;
function writeSize(size: Size, form: SizeForm): string;
function feetAndInches(inches: number): string; // "5 ft 9 in"
function inEighths(inches: number): string; // nearest eighth: "7½", "¼", "10"
function writeEighths(size: Size): string; // "7½ × 9½ in"
function readLength(text: string): number | undefined; // "8", "8.125", "8,5", "3/4", "8 1/8", "8-1/8", "8⅛"

type Orientation = "portrait" | "landscape" | "square";
interface Frame extends Size {
  id: string; // oriented: "10x8" is a landscape 8x10
  orientation: Orientation;
  use: string;
  common: boolean; // one of the six most common sizes
  major: boolean; // labelled first in a comparison drawing
  mat: Size | null; // the usual mat image, turned with the frame
}
const CATALOG: readonly Frame[]; // upright: rectangular, then square
function framesFor(orientation: Orientation): readonly Frame[];
function findFrame(id: string): Frame | undefined;
function commonFrames(): readonly Frame[];
function nextSizeUp(frame: Frame): Frame | undefined;
const MOULDING = 1; // in, the example moulding
const MAT_OVERLAP = 0.25; // in, per side
function frameAnatomy(args: { frame: Size; image: Size; moulding?: number; overlap?: number }): {
  outside: Size;
  frame: Size;
  matOpening: Size;
  image: Size;
};
const CHECK: { date: string; sources: readonly { name: string; url: string }[] };

type ReferenceId = "sofa" | "person" | "door";
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
} // in; x from the centre line, y above the floor
const WALL_HEIGHT = 96,
  ABOVE_SOFA = 8,
  PERSON_HEIGHT = 69,
  CENTRE_LINE = 57;
const SOFA = { width: 84, back: 34 },
  DOOR = { width: 30, height: 80 };
const REFERENCE_IDS: readonly ReferenceId[];
const REFERENCES: Record<
  ReferenceId,
  { name: string; frameX: number; centred: boolean; box: Rect }
>;
function wallScene(args: {
  frame: Size;
  ghost?: Size | null;
  reference: ReferenceId;
  moulding?: number;
}): {
  frame: { outside: Rect; art: Rect };
  ghost: Rect | null;
  reference: { id: ReferenceId; box: Rect };
  centreLine: number | null;
};
function referenceSentence(reference: ReferenceId, unit: Unit): string;

// The wall tool (wall.ts): Rect in inches, x from the wall's or photo's left edge, y up from its bottom.
type KnownId = "wall" | "door" | "sofa" | "bed" | "letter" | "a4" | "card";
type KnownLength =
  | { kind: "fixed"; inches: number }
  | { kind: "default"; in: number; cm: number }
  | { kind: "none" };
const KNOWN_THINGS: readonly { id: KnownId; name: string; edge: string; length: KnownLength }[];
const KNOWN_IDS: readonly KnownId[];
function defaultLength(id: KnownId, unit: Unit): number | null;
interface Point {
  x: number;
  y: number;
} // photo pixels, top-left origin
interface Photo {
  width: number;
  height: number;
} // pixels
function scaleFromMark(a: Point, b: Point, inches: number): number | null; // px per inch
function photoSize(photo: Photo, scale: number): Size;
function rectToPhoto(rect: Rect, photo: Photo, scale: number): Rect; // pixels, top-left origin
function photoPointToWall(p: Point, photo: Photo, scale: number): Point; // inches
interface Edges {
  left: number | null;
  right: number | null;
  top: number | null;
  bottom: number | null;
}
interface Wall {
  bounds: Rect;
  edges: Edges;
} // a frame never leaves bounds
const DEMO_ROOM: { wall: Wall; sofa: Rect; frame: Rect };
type Side = "left" | "right" | "above" | "below";
type Distances = Record<Side, number | null>;
function frameDistances(frame: Rect, others: readonly Rect[], wall: Wall): Distances;
function setDistance(
  frame: Rect,
  side: Side,
  value: number,
  others: readonly Rect[],
  wall: Wall,
): Rect;
function photoEdges(
  photo: Photo,
  scale: number,
  marks: { floor?: number | null; wall?: readonly [Point, Point] | null },
): Edges;
function markedFurniture(
  known: KnownId,
  mark: readonly [Point, Point],
  scale: number,
  photo: Photo,
  edges: Edges,
): Rect | null;
const SNAP = 1,
  PLACE_GAP = 3; // in
function snapFrame(
  frame: Rect,
  others: readonly Rect[],
  furniture: readonly Rect[],
  wall?: Wall, // given: no snap leaves its bounds
): { frame: Rect; lines: { vertical: number[]; horizontal: number[] } };
function placeBeside(size: Size, selected: Rect | null, others: readonly Rect[], wall: Wall): Rect;

// gallery.ts
interface Stack {
  dir: "row" | "column";
  items: readonly (string | Stack)[];
} // leaves are oriented catalog ids
interface Template {
  id: string;
  name: string;
  stack: Stack;
}
const TEMPLATES: readonly Template[]; // five, in page order
const GALLERY_GAP = 3; // in, = PLACE_GAP
interface Layout {
  frames: { id: string; rect: Rect }[];
  box: Rect;
}
function layoutTemplate(
  stack: Stack,
  gap: number,
  wall: Wall,
  furniture: Rect | null,
): Layout | null;
type Hanger =
  { kind: "one"; drop: number | null } | { kind: "two"; drop: number | null; inset: number | null };
type NoNail = "no-drop" | "drop-out-of-range" | "no-inset" | "inset-out-of-range";
function nailMarks(rect: Rect, hanger: Hanger): { ring: "left" | "right" | null; point: Point }[];
interface Nail {
  frame: number; // index into the measured items
  ring: "left" | "right" | null;
  across: number; // from the group's left edge
  down: number; // from the group's top edge
  floor: number | null;
}
interface GroupMeasure {
  width: number;
  height: number;
  aboveFloor: number | null;
  toCeiling: number | null;
  left: number | null;
  right: number | null; // negative past the edge
  nails: Nail[]; // in rows
  missing: { frame: number; reason: NoNail }[];
}
function measureGroup(
  items: readonly { rect: Rect; hanger: Hanger }[],
  wall: Wall,
): GroupMeasure | null;
function groupDistances(rects: readonly Rect[], furniture: Rect | null, wall: Wall): Distances;
function setGroupDistance(
  rects: readonly Rect[],
  side: Side,
  value: number,
  furniture: Rect | null,
  wall: Wall,
): Rect[];
function centreGroup(rects: readonly Rect[], wall: Wall): Rect[];

// screen.ts: the actual size viewer's sizes and a screen's scale (CSS px per inch)
interface ActualSize extends Size {
  id: string; // "8x10", "A4"
  label: string; // "8×10", "A4"
}
const ACTUAL_SIZES: readonly ActualSize[]; // 4x6, 5x7, 8x10, 11x14, 16x20 from the catalog, A4, A3 from mm
function oneDecimal(n: number): string; // "8", "8.3"
function writeActual(size: Size, unit: Unit): string; // "8.3 × 11.7 in", "21.0 × 29.7 cm"
const CHECK_OBJECTS: { card: Edges; letter: Edges; a4: Edges }; // { short, long } in inches
function scaleFromDiagonal(w: number, h: number, diagonal: number): number | null;
interface ScreenInfo {
  w: number;
  h: number;
  coarse: boolean;
}
function isPhoneScreen(screen: Size): boolean; // shorter side <= 500 CSS px
function isTabletScreen(screen: ScreenInfo): boolean; // not a phone, coarse pointer, shorter side <= 1100
function guessDiagonal(screen: ScreenInfo): number; // 6.1 | 11 | 14 | 23
function guessScale(screen: ScreenInfo): number;

// measure.ts: a measured frame named as a standard, metric or custom size (inches)
const MEASURE_TOLERANCE = 0.375; // in, per side, inclusive
const LIP = 0.25; // in, the frame lip per side
const METRIC_FRAMES: readonly ActualSize[]; // A4, A3 (ACTUAL_SIZES records), "30x40 cm", "40x50 cm", "50x70 cm"
type Measurement =
  | { kind: "inside"; size: Size }
  | { kind: "front"; size: Size; lip?: number }
  | { kind: "outside"; size: Size; face: number; lip?: number } // face: moulding seen from the front, lip included
  | { kind: "mat"; size: Size; overlap?: number };
type Identified =
  // size: the frame (or print) size the numbers give, as measured
  | { kind: "standard"; size: Size; frame: Frame }
  | { kind: "metric"; size: Size; metric: ActualSize; close?: Frame }
  | {
      kind: "custom";
      size: Size;
      below?: Frame;
      above?: Frame;
      squareBelow?: Frame; // only for a near-square size (BL-106)
      squareAbove?: Frame;
    }
  | { kind: "mat"; size: Size; frames: readonly Frame[] };
function identifyFrame(m: Measurement): Identified | undefined;
type NoAnswer = "number" | "narrow" | "room";
function whyNoAnswer(m: Measurement): NoAnswer | undefined; // the rule identifyFrame refused on
interface FrameMeasurements {
  inside: Size; // the frame size
  front: Size; // inside less two LIPs
  outside: Size; // frameAnatomy with MOULDING
  face: number; // MOULDING + LIP, seen from the front
  mat?: { opening: Size; print: Size }; // absent with no pre-cut mat
}
function frameMeasurements(frame: Frame): FrameMeasurements;
function preCutFrames(print: Size): readonly Frame[]; // frames sold with a pre-cut mat for it

const MAT_WIDTH = 2; // in, the calculator's start
const MAT_WIDTHS = [1.5, 2, 2.5, 3] as const; // in, the presets
type MatQuestion =
  | { from: "print"; print: Size; width: number; overlap?: number }
  | { from: "frame"; frame: Size; width: number; overlap?: number };
interface MatAnswer {
  print: Size; // as given, or the largest print the mat holds
  opening: Size;
  frame: Size; // as given, or the frame size the print and mat give
  printMatch: Identified; // identifyFrame on the print as an inside size
  frameMatch: Identified; // identifyFrame on the frame as an inside size
  preCut: readonly Frame[]; // preCutFrames(print)
}
function matSizes(q: MatQuestion): MatAnswer | undefined;
type NoMat = NoAnswer; // "number" | "narrow" | "room"
function whyNoMat(q: MatQuestion): NoMat | undefined;
function matBorders(frame: Size, print: Size, overlap?: number): { side: number; top: number };
const DIPLOMA: { readonly print: Size; readonly frame: Frame }; // 8½ × 11 in, the catalog 11x14

type PosterGroup = "us" | "a-series";
interface Poster extends Size {
  id: string; // "24x36", "A2"
  group: PosterGroup;
  use: string; // "Movie posters"
}
const POSTERS: readonly Poster[]; // upright: 11x17, 12x18, 16x20, 18x24, 20x30, 24x36, 27x40, A3, A2, A1
const A_FRAMES: readonly ActualSize[]; // A2, A1: named on F6 only, not in METRIC_FRAMES
const POSTER_BORDER = { min: 1, max: 4 } as const; // in, ends included
interface MattedFrame {
  frame: Frame; // turned to the poster
  side: number; // in, border at the sides
  top: number; // in, border at the top and bottom
  preCut: boolean;
}
interface PosterFrames {
  bare: Identified; // identifyFrame on the poster as an inside size
  aFrame?: ActualSize; // A2 or A1, turned, when bare is custom and within ⅜ in
  matted: readonly MattedFrame[]; // smallest area first
  customFrame?: Size; // only when matted is empty: the frame for a MAT_WIDTH mat
}
function posterFrames(poster: Size): PosterFrames | undefined;

interface Art {
  width: number; // px
  height: number; // px
}
interface MockupSize extends Size {
  id: string; // "24x36", "36x24", "A2"
  mat: Size | null; // the pre-cut mat's print size, turned, a copy; null when none (A-series included)
}
interface MockupOption {
  size: MockupSize;
  opening: Size | null; // in, with or without the mat as asked; null: no room for a 2 in mat (4x6)
  cut: number | null; // 0..1; null with no opening
}
type Placement = "sofa" | "plain";
type View = "wall" | "close";
const SQUARE_TOLERANCE = 0.05; // sides within 5% count as square
const TIE = 0.01; // cuts within one percentage point are tied
const EXPORT_LONG_SIDE = 2400; // px
const KEY_STEP = { arrow: 0.25, shift: 1 } as const; // in
function mockupSizes(art: Art): readonly MockupSize[] | undefined;
function mockupOpening(size: MockupSize, mat: boolean): Size | undefined; // undefined: no room for a mat
function mockupOptions(art: Art, mat: boolean): readonly MockupOption[] | undefined; // offered order
function mockupDefault(art: Art, mat: boolean): MockupOption | undefined;
function visiblePart(art: Art, opening: Size, focus?: number): Rect | undefined; // px, y down from the art's top
function focusStep(art: Art, opening: Size, step: number): number | undefined; // 0 when not cut
function hangMockup(size: Size, placement: Placement): Rect; // outside, on the 144 × 96 in wall
function mockupView(outside: Rect, view: View): Rect;
function exportSize(view: Rect): Size; // px
```

`apps/web` depends on it with `workspace:*` and lists it in `transpilePackages`. There is no build step.

## Behavior

The catalog is one literal of upright entries; ids, centimetres, landscape entries, the six common sizes and every table cell are derived from it. The landscape list swaps width, height and mat of each rectangular entry and keeps catalog order, so each list keeps catalog order.

`wallScene` works in inches: above the sofa a frame's outside bottom edge sits 8 in above the back and its centre on the sofa's centre line; beside a person or a door its centre is 57 in from the floor, 10 or 14 in right of the scene's centre line. A second frame (the next size up) hangs by the same rule. The next size up is the first later entry of the frame's own list that is at least as wide and as tall, so 11x17 skips the shorter 12x16. Reference boxes enclose the silhouettes the page draws.

`CHECK` records the date and the sources of the last data check (Target, Walmart and Amazon on 2026-11-11; evidence in `openspec/changes/archive/2026-11-12-t2-frame-size-chart/verification.md`). It changes in the same commit as the data.

The wall tool (`wall.ts`) works in inches with `y` up from the bottom; pixels appear only where a photo meets the wall (the scale, `rectToPhoto`, `photoPointToWall`). A visitor's unit is converted to inches before `scaleFromMark`. `DEMO_ROOM` is a 144 × 96 in wall with all four edges known, the F1 sofa centred and the `wallScene` 16x20 above it, shifted by half the wall's width. A photo's wall starts with no known edge: a floor line gives `bottom`, a marked wall width gives `left` and `right`, and `top` stays unknown. Distances and `setDistance` take the other frames and the furniture together as obstacles; an obstacle counts on a side when it lies wholly beyond that edge and overlaps the frame on the other axis by more than an edge. `snapFrame` compares edges and centres per axis (furniture only by its centre across) and takes the nearest pair within `SNAP`; Given the wall, `snapFrame` skips any pair that would put the frame past the bounds; an exact tie goes to the first pair checked (start edge, then centre, then far edge; targets in list order). `placeBeside` tries `PLACE_GAP` right, then left, then the centre. Its side spots and its horizontal centre use the usable area, the bounds clipped by every marked edge (internal `usableArea`); the vertical centre and the final clamp use the bounds. The reference lengths are checked in `openspec/changes/archive/2026-11-15-t7-wall-engine/verification.md`.

The gallery wall (`gallery.ts`) uses the same coordinates. A template is a tree of rows and columns of catalog ids. `layoutTemplate` measures the tree (a row's width is its children's widths plus the gaps, its height the tallest child; a column swaps the axes), then places it: a row centres its children on its middle, a column centres them across. Frames come out depth first. The group is centred on the furniture with its bottom `ABOVE_SOFA` above it, else centred across the usable area with its centre at `CENTRE_LINE` above a known floor or in the bounds' middle. `nailMarks` puts one nail at the centre or two D-ring nails `inset` in from each side, `drop` below the top edge; the engine holds no default for either. `measureGroup` sorts nails highest first: the highest unlisted nail starts a row, every nail 4 in or less below it joins, and each row reads left to right. `groupDistances` and `setGroupDistance` run `frameDistances` and `setDistance` on the group's box with only the furniture as an obstacle; `centreGroup` moves the group across to the usable area's middle.

The measure engine (`measure.ts`) works in inches; the page converts centimetres first. A front opening grows by two lips, an outside shrinks by two faces and grows by two lips, and a mat opening grows by two `MAT_OVERLAP`s to the print. The frame size is made upright and matched against `CATALOG` and `METRIC_FRAMES` by the larger side difference, within `MEASURE_TOLERANCE`; each list matches at most once (pinned gaps: 1 in and over ¾ in). The metric size wins only when strictly closer and carries the US match as `close`. With no match, `below` and `above` come from the upright catalog in the same shape class (square when the sides are within the tolerance), largest area below and smallest above, an area tie to the earlier entry. A rectangle whose long side is under 1.2 × its short side (squarer than every catalog rectangle; 20x24 is 1.2) also gets `squareBelow` and `squareAbove` from the squares, by the same rule; the keys are absent otherwise. `identifyFrame` and `whyNoAnswer` share one private check, so each refusal rule lives once. `readLength` matches whole forms only: a decimal with a point or comma, a glyph after an optional whole number, or a fraction after an optional whole number and a space or hyphen. A mat print is matched against the catalog's mat pairings, US only, and lists every frame sold with it in catalog order. Every answer is turned to the measured orientation; a metric answer keeps its upright `id` and `label`. The allowances are checked in `openspec/changes/archive/2026-11-22-t4-measure-engine/verification.md`.

The mat calculator (`mat.ts`) works in inches, per side and in the input's orientation, with no upright turn. From a print the opening is the print less two overlaps and the frame is the opening plus two mat widths; from a frame the opening is the frame less two mat widths and the print is the opening plus two overlaps. The mat width is the board cut on each side; the ¼ in the lip hides is not subtracted. Both sizes are matched with `identifyFrame` on an inside size, so F4 and F5 never disagree, and `preCutFrames` is the same filter `identifyFrame`'s mat branch calls. `matSizes` and `whyNoMat` share one private check. `matBorders` is plain arithmetic: (frame − print + 2 × overlap) ÷ 2 on each axis. `matSizes` adds `DIPLOMA.frame` (turned to the print) to `preCut` for a print within the tolerance of the diploma, in catalog order; `preCutFrames`, and so F4, are unchanged. The diploma data was checked against retail listings in the archived t5-frame-mat-calculator change (`verification.md`).

The poster engine (`poster.ts`, F6) works in inches. `bare` is `identifyFrame` on the poster as an inside size, so F4 and F6 agree. When it is custom, `aFrame` is the nearest of A2 and A1 within `MEASURE_TOLERANCE`, from a list only F6 reads. `matted` walks the upright catalog: a frame is taken when it is in `mat.ts`'s pre-cut set (`preCutFrames` plus the diploma, so F5 and F6 agree) or when both `matBorders` are within `POSTER_BORDER`. A square frame is skipped for a non-square poster (sides more than ⅜ in apart) unless it is pre-cut for it. A pre-cut frame's borders are those of its mat as sold (its catalog pairing, else `DIPLOMA.print`); every other frame's come from the poster. The list is sorted by area, stably, then turned for a landscape poster with its borders swapped. `customFrame` is `matSizes` from the poster at `MAT_WIDTH`. The poster sizes, the A2 and A1 frames and the BL-17 recheck are in `openspec/changes/archive/2026-11-23-t6-poster-frame-engine/verification.md`.

The mockup engine (`mockup.ts`, F7) takes an artwork in pixels and gives lengths in inches. Art whose shorter side is at least 95% of its longer counts as square and gets `framesFor("square")`; otherwise it gets `framesFor` of its orientation followed by the A-series `POSTERS`, turned, with no mat. The opening is the frame without a mat; with one it is the pre-cut mat less two `MAT_OVERLAP`s, else the frame less two `MAT_WIDTH`s. The cut is 1 − min(ra / ro, ro / ra) of the art and opening ratios, the share of the art outside `visiblePart`. `mockupDefault` takes the least cut, treats every cut within `TIE` of it as tied, and picks the largest frame area among them (first on an exact area tie). `visiblePart` is the largest rect of the opening's ratio inside the art, in fractional pixels; on the cut axis it sits at the clamped focus × slack, and a slack under half a pixel counts as no cut. `focusStep` is the step over the slack in inches; the page adds it to the focus and clamps the stored focus to 0..1. The cut axis is the one where the visible part is shorter than the art. `hangMockup` shifts `wallScene`'s sofa placement by half of `DEMO_ROOM`'s wall width, or centres the outside on `CENTRE_LINE`. The close-up widens the outside by a quarter of its longer side; every offered size fits the wall by either rule, so nothing is clamped. `exportSize` scales the view's longer side to `EXPORT_LONG_SIDE` and rounds.

## Edge Cases

- `writeActual` writes centimetres always to one decimal (`21.0`), unlike `writeSize`, which drops a trailing zero; F1 and F2 keep `writeSize`.
- `scaleFromDiagonal` returns `null` for a side or diagonal that is 0, negative or not finite; `guessScale` then falls back to 96 px per inch.
- An id outside the catalog (`9x9`, `banana`): `findFrame` returns `undefined`.
- The last entry of a list (27x40, 40x27, 20x20): no next size up.
- 4x6, 8.5x11, 20x30 and 27x40 have no common mat pairing: `mat` is `null` ("No mat" on the page).
- A whole centimetre value prints without a trailing zero (`61`, not `61.0`).
- A mark of one point, a NaN coordinate, or a length that is 0, negative or not finite: `scaleFromMark` returns `null`.
- Fixed lengths in centimetres are rounded to 2 decimals (A4 29.7, card 8.56).
- A known edge closer than an in-line obstacle wins: the distance runs to the edge, and `setDistance` stops there.
- A frame past a known edge has a negative distance on that side; it has no room to move further that way.
- An obstacle that overlaps the frame is not counted on any side.
- `setDistance` with a value that is not a finite number, or on a side with no distance, returns the frame unchanged.
- `markedFurniture` returns `null` for anything but a sofa or bed, and for a mark at or below the floor.
- `placeBeside`'s centred fallback is clamped inside the bounds (a close-up photo can sit below the 57 in line). A frame wider than the marked wall stays centred on it, clamped to the bounds.
- `snapFrame` without a wall can move a frame up to 1 in past the bounds; F2 clamps after the snap (BL-45).
- With only one side edge known, the usable area runs from it to the far bound (BL-46).
- `layoutTemplate` returns `null` for a negative or non-finite gap, an unknown id or an empty row or column. A group bigger than the wall is not shrunk or moved: its margins go negative.
- A hanger with a missing or non-finite drop or inset, a drop below 0 or not less than the frame's height, or an inset not above 0 or not below half its width gives no nail, and `measureGroup` lists the frame in `missing`.
- No items: `measureGroup` returns `null`, `groupDistances` gives all `null`, and the moves return the rects unchanged.
- `identifyFrame` returns `undefined` for a side, lip, face or overlap that is 0, negative or not finite, a face no wider than its lip, or an outside whose frame size comes out not positive.
- A near-square custom size (sides more than ⅜ in apart, long side under 1.2 × short) names the rectangles and the squares: 9 × 9.5 gets 5x7 and 11x14, plus 8x8 and 10x10. Exactly 1.2 (10 × 12) names no square.
- `readLength` gives `undefined` for empty text, a minus sign, a unit (`8 in`), a division by 0 and anything else; it reads `0` as 0, so a page can say "above 0".
- `inEighths` rounds to the nearest eighth: 8.04 reads "8", 8.07 reads "8⅛".
- `matSizes` returns `undefined` (`whyNoMat` "number") for a side, width or overlap that is 0, negative or not finite, and for a width so large a size overflows to Infinity; "narrow" for a width no wider than the overlap (it would give a frame no bigger than the print); "room" when the opening has a side of 0 or less (a 4x6 frame with a 2 in mat).
- A mat width at or below the overlap still answers, with a frame smaller than the print or a print bigger than the frame (BL-111).
- `matBorders` checks nothing: a print too big for the frame gives a negative border, a `NaN` side gives `NaN`. Pass it sizes from `matSizes` or the catalog.
- `posterFrames` returns `undefined` for a side that is 0, negative or not finite; a size so large that `matSizes` overflows gets no `customFrame`.
- A 27x40 poster has no standard frame with a mat: `matted` is empty and `customFrame` is 30½ × 43½ in.
- A typed poster near A4 (8.3 × 11.7) is listed with the 11x17 as pre-cut: A4 is within ⅜ in of that frame's 8x12 mat. A4 is not a poster preset.
- From a frame, `preCut` is often empty: the largest print rarely lands within ⅜ in of a mat pairing (11x14 with a 2 in mat gives 7½ × 10½).
- `mockupSizes`, `mockupOptions`, `mockupDefault`, `visiblePart` and `focusStep` return `undefined` for an artwork side that is 0, negative or not finite (`visiblePart` and `focusStep` also for such an opening side).
- With a mat, 4x6 stays first in `mockupOptions` with `opening: null` and `cut: null`; `mockupDefault` never picks it.
- Art with an aspect between about 0.894 and 0.95 is offered no square size although 20x20 would cut less than 8x10 (BL-129).
- `exportSize` checks nothing: a zero or NaN view gives `NaN` sides (BL-130).
- A `NaN` focus counts as 0.5; a focus outside 0..1 is held at the edge.

## Requirements

### Requirement: The catalog lists the US ready-made frame sizes

The engine SHALL hold one catalog of frame sizes in inches, each stored upright (width not larger than height) with an id of the form `<width>x<height>`. Rectangular sizes come first, then square sizes, each group ordered by width and then height. The catalog SHALL mark the six most common sizes and the sizes to label first in a comparison drawing.

#### Scenario: The rectangular sizes

- **WHEN** the rectangular sizes are listed
- **THEN** they are 4x6, 5x7, 8x10, 8.5x11, 11x14, 11x17, 12x16, 12x18, 16x20, 18x24, 20x24, 20x30, 24x36, 27x40, in that order

#### Scenario: The square sizes

- **WHEN** the square sizes are listed
- **THEN** they are 8x8, 10x10, 12x12, 16x16, 20x20, in that order

#### Scenario: The six most common sizes

- **WHEN** the most common sizes are listed
- **THEN** they are 4x6, 5x7, 8x10, 11x14, 16x20, 24x36

#### Scenario: Every entry is well formed

- **WHEN** the catalog is checked
- **THEN** ids are unique, every id equals its width and height joined by a letter x, no width is larger than its height, and every entry has a non-empty common-use text

### Requirement: A size can be listed and found in any orientation

The engine SHALL list sizes for an orientation: portrait gives the rectangular sizes as stored, landscape gives the same sizes with width and height swapped and the id swapped to match, square gives the square sizes. It SHALL find a size from an oriented id and report its orientation, and SHALL report an unknown id as not found.

#### Scenario: Landscape turns the size

- **WHEN** the landscape list is read
- **THEN** its third entry has the id 10x8, a width of 10 and a height of 8

#### Scenario: An oriented id is looked up

- **WHEN** the ids 10x8, 8x10 and 12x12 are looked up
- **THEN** they are found as landscape, portrait and square

#### Scenario: An unknown id

- **WHEN** the id 9x9 or the text "banana" is looked up
- **THEN** nothing is found

### Requirement: The next size up follows the list

For a size in an orientation, the engine SHALL give the next size up as the first later entry in that orientation's list that is at least as wide and at least as tall, and none when there is no such entry.

#### Scenario: A size in the middle of the list

- **WHEN** the next size up from 16x20 is asked for
- **THEN** it is 18x24

#### Scenario: A later size that is not larger

- **WHEN** the next size up from 11x17 is asked for
- **THEN** it is 12x18, not the shorter 12x16 that follows it in the list

#### Scenario: Every next size up holds the size

- **WHEN** the next size up is asked for every size in every orientation
- **THEN** it is never narrower or shorter than the size asked about

#### Scenario: The largest size

- **WHEN** the next size up from 27x40, or from 20x20, is asked for
- **THEN** there is none

### Requirement: Inches convert to centimetres at one decimal

The engine SHALL convert inches to centimetres at 2.54 cm per inch, rounded to one decimal, and SHALL write a whole number without a trailing zero.

#### Scenario: Common sizes in centimetres

- **WHEN** 8, 10, 8.5, 24 and 36 inches are converted
- **THEN** the results are 20.3, 25.4, 21.6, 61 and 91.4

### Requirement: A size is written in one of three fixed forms

The engine SHALL write a size, width first, in exactly these forms: the search form with a letter x for headings and sentences, the inch form and the centimetre form with a multiplication sign and spaces for tables and drawings.

#### Scenario: The three forms of one size

- **WHEN** the size 8 by 10 inches is written in each form
- **THEN** the results are `8x10`, `8 × 10 in` and `20.3 × 25.4 cm`

#### Scenario: A turned size

- **WHEN** the landscape size 10x8 is written in the inch form
- **THEN** the result is `10 × 8 in`

### Requirement: A frame size names the image usually framed in it with a mat

For each catalog size the engine SHALL give either the image size of the pre-cut mat most often sold for that frame, or none when no mat pairing is common for that size. A mat image SHALL be smaller than its frame in both dimensions and SHALL turn with the frame.

#### Scenario: Frames with a common mat

- **WHEN** the mat image is asked for 5x7, 8x10, 11x14, 11x17, 12x16, 12x18, 16x20, 18x24, 20x24 and 24x36
- **THEN** it is 4x6, 5x7, 8x10, 8x12, 8.5x11, 11x17, 11x14, 16x20, 16x20 and 20x30

#### Scenario: Square frames with a common mat

- **WHEN** the mat image is asked for 8x8, 10x10, 12x12, 16x16 and 20x20
- **THEN** it is 4x4, 8x8, 8x8, 12x12 and 16x16

#### Scenario: Frames usually sold without a mat

- **WHEN** the mat image is asked for 4x6, 8.5x11, 20x30 and 27x40
- **THEN** there is none

#### Scenario: A turned frame

- **WHEN** the mat image is asked for the landscape size 14x11
- **THEN** it is 10 wide and 8 high

### Requirement: Frame anatomy is computed from the frame and the image

The engine SHALL compute a frame's outside size as its size plus the moulding width on every side (1 inch unless given), and a mat's opening as the image size less the overlap on every side (¼ inch unless given).

#### Scenario: An 8x10 photo with a mat in an 11x14 frame

- **WHEN** the anatomy is computed for an 11x14 frame holding an 8x10 image
- **THEN** the outside size is 13 by 16 inches and the mat opening is 7.5 by 9.5 inches

### Requirement: The wall scene places a frame at true scale beside a reference

The engine SHALL describe a wall scene in inches for a frame, an optional second frame and one reference: a sofa 84 wide with its back 34 high, a person 69 tall, or a door 80 high and 30 wide, on a wall 96 high. Above the sofa a frame SHALL hang centred on it with its outside bottom edge 8 inches above the back. Beside a person or a door a frame SHALL hang with its centre 57 inches above the floor. The second frame SHALL hang by the same rule, centred on the first.

#### Scenario: A 16x20 frame above the sofa

- **WHEN** the scene is built for a 16x20 frame and the sofa
- **THEN** the frame's outside bottom edge is 42 inches above the floor, its outside top edge 64 inches, and its centre line is the sofa's centre line

#### Scenario: A 16x20 frame beside a person

- **WHEN** the scene is built for a 16x20 frame and the person
- **THEN** the frame's outside edges are 46 and 68 inches above the floor

#### Scenario: Every size fits the scene

- **WHEN** the scene is built for every catalog size in every orientation, with its next size up as the second frame, beside each reference
- **THEN** both frames stay between the floor and the top of the wall, and beside a person or a door neither frame overlaps the reference

### Requirement: The reference is described in the visitor's unit

The engine SHALL give one sentence per reference that names each measure it uses, in inches or in whole centimetres computed from the same constants.

#### Scenario: The sofa sentence

- **WHEN** the sofa's sentence is asked for in inches and in centimetres
- **THEN** it is "Hung 8 in above a sofa 84 in wide" and "Hung 20 cm above a sofa 213 cm wide"

#### Scenario: The person and door sentences in centimetres

- **WHEN** the person's and the door's sentences are asked for in centimetres
- **THEN** they are "Centred 145 cm from the floor, next to a person 175 cm tall" and "Centred 145 cm from the floor, next to a door 203 cm tall"

### Requirement: The catalog says when and against what it was checked

The engine SHALL expose the date the size data was last checked and the sources it was checked against, so a page can show both.

#### Scenario: The check record

- **WHEN** the check record is read
- **THEN** it holds a calendar date that is not in the future and at least one named source with a URL

### Requirement: The wall tool offers seven known things to set the scale

The engine SHALL offer seven things a visitor can mark on a wall photo to set its scale, in this order, each naming the edge to mark: the wall's width from corner to corner, a door's height from the floor to its top edge, a sofa's width along the top of its back, a bed's width along the top of its mattress, the long edge of a Letter sheet, the long edge of an A4 sheet and the long edge of a credit card.

#### Scenario: The list of known things

- **WHEN** the list of known things is read
- **THEN** it holds the wall, a door, a sofa, a bed, a Letter sheet, an A4 sheet and a credit card, in that order, and each names the edge the visitor marks

#### Scenario: The sofa and the bed are marked along their top

- **WHEN** the edges of the sofa and the bed are read
- **THEN** the sofa's edge runs along the top of its back and the bed's along the top of its mattress

#### Scenario: Standard objects have fixed lengths

- **WHEN** the lengths of the Letter sheet, the A4 sheet and the credit card are read
- **THEN** they are 11 inches, 297 mm and 85.6 mm, and none of them can be changed by the visitor

### Requirement: A known thing's default length follows the visitor's unit

The engine SHALL give the door, the sofa and the bed a default length that the visitor can change, chosen for the visitor's unit: a US default in inches and a European default in centimetres. The wall SHALL have no default length.

#### Scenario: Defaults in inches

- **WHEN** the default lengths are asked for in inches
- **THEN** the door is 80 in, the sofa 84 in, the bed 60 in, and the wall has none

#### Scenario: Defaults in centimetres

- **WHEN** the default lengths are asked for in centimetres
- **THEN** the door is 200 cm, the sofa 213 cm, the bed 160 cm, and the wall has none

### Requirement: Two marked points and a real length give the photo's scale

The engine SHALL compute a photo's scale in pixels per inch as the straight-line distance in pixels between two marked points divided by the real length between them. It SHALL give no scale when the two points are the same point or the length is not a positive finite number.

#### Scenario: A door marked on a photo

- **WHEN** a door is marked from pixel (600, 100) to pixel (600, 500) with its height of 80 inches
- **THEN** the scale is 5 pixels per inch

#### Scenario: A slanted mark

- **WHEN** a known thing is marked from pixel (0, 0) to pixel (300, 400) with a length of 100 inches
- **THEN** the scale is 5 pixels per inch

#### Scenario: A mark that gives no scale

- **WHEN** both marked points are the same pixel, or the length is 0, negative or not a number
- **THEN** no scale is given

### Requirement: A photo's size and a frame's place convert between inches and pixels

The engine SHALL give a photo's width and height in inches from its size in pixels and its scale. It SHALL map a rectangle given in inches, measured from the photo's bottom-left corner, to pixels measured from the photo's top-left corner.

#### Scenario: The photo's size in inches

- **WHEN** a photo 1200 by 900 pixels has a scale of 5 pixels per inch
- **THEN** it shows a wall area 240 inches wide and 180 inches high

#### Scenario: A frame's place in pixels

- **WHEN** a frame whose outside is 18 by 22 inches sits with its left edge 20 inches and its bottom edge 50 inches from the bottom-left corner of that photo
- **THEN** in pixels its left edge is at 100, its top edge at 540, and it is 90 wide and 110 high

### Requirement: The demo room needs no marking

The engine SHALL describe a demo room in inches, so a visitor without a photo starts at a known scale: a wall 144 wide and 96 high, the F1 sofa (84 wide, its back 34 high) centred on it, and a 16x20 frame hung above the sofa by the F1 rule.

#### Scenario: The demo room opens with a 16x20 above the sofa

- **WHEN** the demo room is read
- **THEN** the sofa spans 30 to 114 inches from the wall's left edge, and the frame's outside is 18 by 22 inches with its left edge at 63, its bottom edge at 42 and its top edge at 64 inches

### Requirement: A frame's distances run to the nearest thing in line with it

The engine SHALL give a frame's four distances, left, right, above and below. Each runs to the nearest frame or piece of furniture that lies wholly on that side and is in line with the frame, meaning their spans on the other axis share more than an edge. When nothing on that side is in line with the frame, the distance runs to the wall's edge on that side if that edge is known, and otherwise that side has no distance. All four edges of the demo room are known.

#### Scenario: A photo with no edge marked

- **GIVEN** a photo 1200 by 900 pixels at 5 pixels per inch with no floor line and no wall width marked, frame A with its outside 18 by 22 inches at (100, 40), and frame B the same size at (130, 40)
- **WHEN** A's distances are read
- **THEN** A's right distance is 12 inches to frame B, and A has no left, above or below distance

#### Scenario: Two frames side by side

- **GIVEN** a wall 144 by 96 inches, frame A with its outside 18 by 22 inches and its bottom-left corner at (40, 42), and frame B the same size at (60, 42)
- **WHEN** their distances are read
- **THEN** A's right distance and B's left distance are 2 inches, A's left distance is 40 and B's right distance is 66

#### Scenario: A frame that is not in line

- **GIVEN** the same wall and frame A, and frame B the same size with its bottom-left corner at (60, 70)
- **WHEN** A's distances are read
- **THEN** A's right distance runs to the wall's edge and is 86 inches

#### Scenario: The frame in the demo room

- **WHEN** the distances of the demo room's frame are read
- **THEN** below it is 8 inches to the sofa's back, above it 32 inches, and left and right 63 inches each

### Requirement: Setting a distance moves only that frame

The engine SHALL set one of a frame's distances by moving only that frame along that axis. A negative value SHALL count as zero. The frame SHALL stop at the wall's edge (the photo's border where that edge is unknown) or at the first frame or furniture in line with it on the side it moves toward. A side with no distance SHALL leave the frame in place.

#### Scenario: A gap on a photo with no edge marked

- **GIVEN** the photo with no edge marked: frame A 18 by 22 inches at (100, 40), frame B the same size at (130, 40)
- **WHEN** A's right distance (12 inches) is set to 200
- **THEN** A's left edge stops at the photo's left border, 0, and B does not move

#### Scenario: A side with no distance

- **GIVEN** the photo with no edge marked and frame A at (100, 40)
- **WHEN** A's distance above is set to 5 inches
- **THEN** A stays at (100, 40)

#### Scenario: A gap is widened

- **GIVEN** the side-by-side wall: 144 by 96 inches, frame A 18 by 22 at (40, 42), frame B the same size at (60, 42)
- **WHEN** A's right distance (2 inches) is set to 3
- **THEN** A's left edge moves from 40 to 39 inches and B does not move

#### Scenario: A distance that would push the frame off the wall

- **GIVEN** the side-by-side wall
- **WHEN** A's right distance is set to 100 inches
- **THEN** A's left edge stops at the wall's left edge, 0

#### Scenario: A distance that would push the frame through another

- **GIVEN** the side-by-side wall
- **WHEN** A's left distance is set to 50 inches
- **THEN** A stops against B: its left edge is at 42 and its right distance is 0, and B does not move

#### Scenario: A negative distance

- **GIVEN** the side-by-side wall
- **WHEN** A's left distance is set to -5
- **THEN** A's left edge is at the wall's left edge, 0

#### Scenario: The demo frame is raised above the sofa

- **WHEN** the demo room frame's distance below is set to 10 inches
- **THEN** its bottom edge moves from 42 to 44 inches

### Requirement: A photo's known edges come from what the visitor marks

The engine SHALL take a photo's wall edges from the visitor's marks, converting each marked point from photo pixels (measured from the top-left corner) to wall inches (measured from the bottom-left corner). A floor line SHALL give the bottom edge. When the wall is the known thing, the two ends of its mark SHALL give the left and right edges. The top edge of a photo's wall SHALL stay unknown.

#### Scenario: The floor line

- **GIVEN** a photo 1200 by 900 pixels at 5 pixels per inch and frame A with its outside 18 by 22 inches at (100, 40)
- **WHEN** the floor line is marked at pixel row 850
- **THEN** the bottom edge is at 10 inches, and A's distance below is 30 inches to the floor

#### Scenario: The wall's width gives its side edges

- **GIVEN** a photo 1200 by 900 pixels and frame A with its outside 18 by 22 inches at (100, 40)
- **WHEN** the wall is marked from pixel (100, 400) to pixel (1100, 400) with its width of 200 inches
- **THEN** the scale is 5 pixels per inch, the left edge is at 20 inches and the right edge at 220 inches, and A's left distance is 80 inches and its right distance 102 inches

### Requirement: A marked sofa or bed becomes furniture on the photo

The engine SHALL turn a sofa or a bed marked as the known thing into a piece of furniture on the photo: as wide as the mark, and reaching from the floor line, or from the photo's bottom edge when no floor line is marked, up to the height of the mark's middle.

#### Scenario: A frame above a marked sofa

- **GIVEN** a photo 1200 by 900 pixels with no floor line
- **WHEN** the sofa is marked from pixel (300, 600) to pixel (720, 600) with its width of 84 inches, and frame A with its outside 18 by 22 inches sits at (80, 68)
- **THEN** the scale is 5 pixels per inch, the sofa spans 60 to 144 inches with its top at 60 inches, and A's distance below is 8 inches to the sofa

### Requirement: A dragged frame snaps to the edges and centres around it

The engine SHALL snap a frame being moved: on each axis, when one of its edges or its centre lies within 1 inch of an edge or the centre of another frame, or of a piece of furniture's centre on the horizontal axis, the frame SHALL move so the two line up. The nearest pair SHALL win on each axis. The engine SHALL return every line the moved frame lines up on after the snap, so the page can draw them, and SHALL leave the frame where it is on an axis with nothing within 1 inch.

#### Scenario: A frame snaps beside another

- **GIVEN** a wall 144 by 96 inches and frame A with its outside 18 by 22 inches at (40, 42)
- **WHEN** frame B, the same size, is moved to (58.6, 42.6)
- **THEN** B snaps to (58, 42), with a vertical line at 58 inches and horizontal lines at 42, 53 and 64 inches, every line where B lines up with A

#### Scenario: A frame snaps to the sofa's centre

- **GIVEN** the demo room
- **WHEN** its frame is moved to a left edge of 63.7 inches, its bottom edge unchanged
- **THEN** its left edge snaps to 63, so its centre lines up with the sofa's centre at 72 inches

#### Scenario: Nothing within an inch

- **GIVEN** the wall with frame A at (40, 42)
- **WHEN** frame B is moved to (80, 70)
- **THEN** B stays at (80, 70) and no line is returned

### Requirement: A new frame is placed beside the selected one

The engine SHALL place a new frame 3 inches to the right of the selected frame with their centres level. When it would leave the wall's bounds, cross a wall edge the visitor marked, or overlap another frame or furniture there, it SHALL go 3 inches to the left instead. When neither side fits, or no frame is selected, it SHALL be centred between the marked side edges, else across the bounds, with its centre 57 inches above the floor, or in the middle of the bounds when the floor is unknown.

#### Scenario: A frame added beside the demo frame

- **GIVEN** the demo room with its 16x20 selected
- **WHEN** an 11x14 frame, its outside 13 by 16 inches, is added
- **THEN** it sits with its left edge at 84 inches and its bottom edge at 45 inches

#### Scenario: No room on the right

- **GIVEN** a wall 144 by 96 inches and the selected frame, outside 18 by 22 inches, at (120, 42)
- **WHEN** a frame of the same size is added
- **THEN** it sits with its left edge at 99 inches and its bottom edge at 42 inches

#### Scenario: A marked wall edge on the right

- **GIVEN** a photo 200 by 100 inches with the wall's right edge marked at 130 inches and no other edge, and the selected frame, outside 18 by 22 inches, at (105, 42)
- **WHEN** a frame of the same size is added
- **THEN** it sits with its left edge at 84 inches and its bottom edge at 42 inches, because on the right it would cross the marked edge

#### Scenario: Centred between the marked side edges

- **GIVEN** a photo 200 by 100 inches with the wall's edges marked at 20 and 130 inches, no floor, and no frame selected
- **WHEN** a frame with its outside 18 by 22 inches is added
- **THEN** it sits with its left edge at 66 inches and its bottom edge at 39 inches

### Requirement: A snap never takes a frame past the wall's bounds

When the engine is given the wall a frame is dragged on, it SHALL NOT make a snap that would put any part of the frame outside the wall's bounds. On that axis the nearest pair that keeps the frame inside SHALL win, and with none the frame SHALL stay where it was moved.

#### Scenario: A snap that would leave the wall

- **GIVEN** a wall 144 by 96 inches and frame A with its outside 18 by 22 inches at (117.4, 42)
- **WHEN** frame B, the same size, is moved to (125.5, 10) on that wall
- **THEN** B stays at (125.5, 10) and no line is returned, because lining up with A would put B's right edge at 144.4 inches

### Requirement: An exact snap tie goes to the first pair

When two pairs on one axis are exactly as close, the engine SHALL prefer the dragged frame's left or bottom edge over its centre, and its centre over its right or top edge. For the same edge of the dragged frame, the target listed first SHALL win.

#### Scenario: A tie between two frames

- **GIVEN** a wall 144 by 96 inches, frame A with its outside 18 by 22 inches at (40, 42) and frame C the same size at (77, 42)
- **WHEN** frame B, the same size, is moved to (58.5, 70), its left edge half an inch from A's right edge and its right edge half an inch from C's left edge
- **THEN** B snaps to (58, 70), with one vertical line at 58 inches and no horizontal line

### Requirement: The gallery wall planner offers five templates

The engine SHALL offer five gallery wall templates, each a name and catalog frame sizes arranged in nested rows and columns. A laid-out template SHALL list its frames in the order its rows and columns name them: a row from left to right, a column from top to bottom.

#### Scenario: The five templates

- **WHEN** the templates are listed
- **THEN** they are, in this order:
  - "Row of three": three 11x14 in a row
  - "Grid of four": two rows of two 11x14
  - "Grid of nine": three rows of three 8x10
  - "One big, two on each side": two 8x10 stacked, an 18x24, two 8x10 stacked
  - "Two rows": 11x14, 16x20 and 11x14 over three landscape 8x10

#### Scenario: Every template frame is in the catalog

- **WHEN** every template's frames are looked up
- **THEN** each one is a catalog size in the orientation the template names

### Requirement: A template is laid out with one gap between neighbours

The engine SHALL lay out a template with one gap, 3 inches unless the visitor sets another, between neighbours. A row SHALL run left to right with centres level. A column SHALL run top to bottom with centres aligned. Each frame SHALL take its outside size, the catalog size plus 1 inch on each side. A negative or non-numeric gap, an unknown size or an empty row or column SHALL give no layout.

#### Scenario: The row of three above the demo sofa

- **GIVEN** the demo room
- **WHEN** "Row of three" is laid out above the sofa with the 3 inch gap
- **THEN** the frames, each 13 by 16 inches, sit at (49.5, 42), (65.5, 42) and (81.5, 42)

#### Scenario: A narrower gap

- **GIVEN** the demo room
- **WHEN** "Row of three" is laid out above the sofa with a 2 inch gap
- **THEN** the frames sit at (50.5, 42), (65.5, 42) and (80.5, 42)

#### Scenario: A big frame centred between two stacks

- **GIVEN** the demo room
- **WHEN** "One big, two on each side" is laid out above the sofa with the 3 inch gap
- **THEN** the group is 46 by 27 inches with its left edge at 49 inches
- **AND** the left stack's frames sit at (49, 57) and (49, 42), the 18x24 at (62, 42.5), and the right stack's at (85, 57) and (85, 42)

#### Scenario: A layout that cannot be made

- **WHEN** a template is laid out with a gap of -1 inch, or a gap that is not a number, or with a size outside the catalog, or with an empty row
- **THEN** no layout is returned

### Requirement: A gallery group hangs above furniture or on the centre line

The engine SHALL place a laid-out group above a piece of furniture when one is given: centred on it, with the group's bottom edge 8 inches above its top. With no furniture, the group SHALL be centred between the wall's known side edges, else across the bounds, with its centre 57 inches above a known floor, or in the middle of the bounds when the floor is unknown.

#### Scenario: Centred on the 57 inch line

- **GIVEN** a wall 144 by 96 inches with its floor known and no furniture
- **WHEN** "Grid of nine" is laid out with the 3 inch gap
- **THEN** the group is 36 by 42 inches, from 54 to 90 inches across and 36 to 78 inches up
- **AND** its first frame sits at (54, 66) and its last at (80, 36)

#### Scenario: A photo with no floor

- **GIVEN** a photo 120 by 80 inches with no edge marked
- **WHEN** "Grid of four" is laid out with the 3 inch gap
- **THEN** the frames sit at (45.5, 41.5), (61.5, 41.5), (45.5, 22.5) and (61.5, 22.5)

### Requirement: Nail marks come from the frame's hanger

The engine SHALL give a frame's nail marks on the wall from its hanger. One hanger, a wire or a sawtooth, SHALL give one nail at the frame's centre, its drop below the top edge. Two D-rings SHALL give two nails, the left ring's its inset in from the left side and the right ring's its inset in from the right side, both their drop below the top edge. The engine SHALL hold no default drop or inset.

#### Scenario: One nail

- **GIVEN** a frame with its outside 13 by 16 inches at (49.5, 42)
- **WHEN** it hangs on one hanger with a 2 inch drop
- **THEN** its nail is at (56, 56)

#### Scenario: Two D-rings

- **GIVEN** a frame with its outside 20 by 26 inches at (62, 42.5)
- **WHEN** it hangs on two D-rings with a 3 inch drop and a 4 inch inset
- **THEN** its left ring's nail is at (66, 65.5) and its right ring's at (78, 65.5)

### Requirement: A frame with no nail says why

When a frame gets no nail, the engine SHALL give the reason:

- "no drop": the drop is missing or not a number;
- "drop out of range": the drop is negative or not less than the frame's height;
- "no inset": the D-rings' inset is missing or not a number;
- "inset out of range": the inset is not more than 0 or not less than half the frame's width.

A measured group SHALL list every frame that gets no nail, with its reason.

#### Scenario: A hanger that gives no nail

- **GIVEN** a frame with its outside 20 by 26 inches
- **WHEN** its drop is missing, or it is -1 or 26 inches, or its D-rings' inset is missing, or it is 0 or 10 inches
- **THEN** no nail is returned, and the reason is "no drop", "drop out of range", "no inset" or "inset out of range" in that order

#### Scenario: A frame with no nail

- **GIVEN** "One big, two on each side" laid out above the demo sofa, frame 2 with a 13 inch drop and every other frame with a 2 inch drop, all on one hanger
- **WHEN** the group is measured
- **THEN** it has four nails, for frames 1, 3, 4 and 5
- **AND** frame 2 is listed with "drop out of range", because it is 12 inches tall on the wall

### Requirement: A gallery group is measured for hanging

The engine SHALL measure a group of frames for hanging, each frame on its own hanger:

- the group's width and height;
- its top edge's height above the floor, when the floor is known;
- its top edge's gap to the ceiling, when the wall's top edge is known;
- its gap to each known side edge of the wall, negative when it runs past.

#### Scenario: The row of three in the demo room

- **GIVEN** "Row of three" laid out above the demo sofa, each frame on one hanger with a 2 inch drop
- **WHEN** the group is measured
- **THEN** it is 45 by 16 inches, its top edge 58 inches above the floor and 38 inches below the ceiling, 49.5 inches from the wall's left edge and 49.5 inches from its right edge
- **AND** its nails, for frames 1, 2 and 3, are 6.5, 22.5 and 38.5 inches right of the group's left edge, each 2 inches down from its top edge and 56 inches above the floor

#### Scenario: A group on a photo with no edge marked

- **GIVEN** "Grid of four" laid out on a photo 120 by 80 inches with no edge marked, each frame on one hanger with a 2 inch drop
- **WHEN** the group is measured
- **THEN** it is 29 by 35 inches, with no height above the floor, no gap to the ceiling and no gap to a side edge
- **AND** its nails, in order, are 6.5 and 22.5 inches across at 2 inches down, then 6.5 and 22.5 inches across at 21 inches down, with no height above the floor

### Requirement: Each nail names its frame and is measured from the group's corner

In a measured group, each nail SHALL name its frame (its place in the list) and, for D-rings, its ring. It SHALL be measured across from the group's left edge, down from its top edge, and up from a known floor.

#### Scenario: One frame on its own D-rings

- **GIVEN** "One big, two on each side" laid out above the demo sofa, frame 3 on two D-rings with a 3 inch drop and a 4 inch inset, every other frame on one hanger with a 2 inch drop
- **WHEN** the group is measured
- **THEN** its first row is frame 1 at 5 inches across, frame 3's left ring at 17, frame 3's right ring at 29, then frame 4 at 41; frame 3's rings are 3.5 inches down and 65.5 inches above the floor
- **AND** its second row is frames 2 and 5

### Requirement: Nails are listed in rows

The engine SHALL list a group's nails in rows. The highest nail not yet listed SHALL start a row, and every nail 4 inches or less below it SHALL join that row. A row SHALL read left to right, and the next row SHALL start below it.

#### Scenario: Nails a little lower join the row

- **GIVEN** "One big, two on each side" laid out above the demo sofa, each frame on one hanger with a 2 inch drop
- **WHEN** the group is measured
- **THEN** it is 46 by 27 inches, its top edge 69 inches above the floor and 27 inches below the ceiling, 49 inches from each side edge
- **AND** its first row of nails is frame 1 at 5 inches across, 2 down, 67 above the floor; frame 3 at 23 across, 2.5 down, 66.5 above the floor; frame 4 at 41 across, 2 down, 67 above the floor
- **AND** its second row is frame 2 at 5 across, 17 down, 52 above the floor, then frame 5 at 41 across, 17 down, 52 above the floor

### Requirement: A whole group moves as one

The engine SHALL give a group of frames the four distances a single frame has, measured from the group's outside edges to the furniture and the wall's known edges, with the group's own frames left out. Setting one of them SHALL move every frame in the group by the same amount, with the same stops as a single frame.

#### Scenario: The group's distances

- **GIVEN** "One big, two on each side" laid out above the demo sofa
- **WHEN** the group's distances are read
- **THEN** it is 49 inches from the wall's left edge, 49 from its right edge, 27 from the ceiling and 8 above the sofa

#### Scenario: Hanging the group higher above the sofa

- **GIVEN** "One big, two on each side" laid out above the demo sofa
- **WHEN** the group's distance above the sofa is set to 10 inches
- **THEN** every frame moves up 2 inches: (49, 59), (49, 44), (62, 44.5), (85, 59) and (85, 44)

### Requirement: A group is centred on the wall

Centring a group on the wall SHALL move every frame across by the same amount, so the group is centred between the wall's known side edges, else across the bounds. Its height SHALL NOT change.

#### Scenario: Centring a group that runs past the edge

- **GIVEN** "One big, two on each side" in the demo room, moved so its left edge is at 101 inches and its right edge 3 inches past the wall's
- **WHEN** the group is centred on the wall
- **THEN** its left edge is at 49 inches and every frame keeps its height

### Requirement: The actual size viewer has seven sizes

The engine SHALL list the sizes the actual size viewer offers, in this order, each upright: 4x6, 5x7, 8x10, 11x14 and 16x20 from the catalog, then A4 (210 × 297 mm) and A3 (297 × 420 mm) from their millimetre sizes.

#### Scenario: The list

- **WHEN** the actual-size list is read
- **THEN** it holds 4x6, 5x7, 8x10, 11x14, 16x20, A4 and A3 in that order, and the five inch sizes are the catalog's

#### Scenario: The A-series sizes in both units

- **WHEN** A4 and A3 are written
- **THEN** A4 is 21.0 × 29.7 cm and 8.3 × 11.7 in, and A3 is 29.7 × 42.0 cm and 11.7 × 16.5 in

### Requirement: The things that check a scale have both edges

The engine SHALL hold one record of the credit card (85.6 × 53.98 mm), the Letter sheet (8.5 × 11 in) and the A4 sheet (210 × 297 mm), each with its short and long edge, and the wall tool's fixed lengths for those three SHALL be their long edges from this record.

#### Scenario: The card's edges

- **WHEN** the credit card's edges are read
- **THEN** the short edge is 53.98 mm and the long edge is 85.6 mm

#### Scenario: The wall tool still marks long edges

- **WHEN** the wall tool's lengths for the Letter sheet, the A4 sheet and the credit card are read
- **THEN** they are 11 inches, 297 mm and 85.6 mm, the long edges of the record

### Requirement: A screen's diagonal gives its scale

The engine SHALL compute a screen's scale in CSS pixels per inch as the straight-line length of its CSS width and height divided by its diagonal in inches, and SHALL give no scale when the diagonal or either side is not a positive finite number.

#### Scenario: A 6.1 in phone

- **WHEN** a screen of 393 × 852 CSS px has a 6.1 in diagonal
- **THEN** its scale is about 153.8 px per inch

#### Scenario: No diagonal

- **WHEN** the diagonal is 0, negative or not a number
- **THEN** there is no scale

### Requirement: A screen's scale has a first guess

Before any check, the engine SHALL guess a diagonal from the screen's CSS size and pointer: 6.1 in when the shorter side is at most 500 px; 11 in when the pointer is coarse and the shorter side is at most 1,100 px; 14 in when the straight-line length is under 2,200 px; otherwise 23 in. The guess SHALL be that diagonal's scale. The engine SHALL export the 11 in rule as `isTabletScreen`, true exactly for a screen that is not a phone, has a coarse pointer and a shorter side of at most 1,100 px, and the guess SHALL use it.

#### Scenario: A phone

- **WHEN** the screen is 393 × 852 CSS px with a coarse pointer
- **THEN** the guessed diagonal is 6.1 in and the scale about 153.8 px per inch

#### Scenario: A 13 in laptop

- **WHEN** the screen is 1,470 × 956 CSS px with a fine pointer
- **THEN** the guessed diagonal is 14 in and the scale about 125.2 px per inch

#### Scenario: A monitor

- **WHEN** the screen is 1,920 × 1,080 CSS px with a fine pointer
- **THEN** the guessed diagonal is 23 in and the scale about 95.8 px per inch

#### Scenario: A tablet

- **WHEN** the screen is 820 × 1,180 CSS px with a coarse pointer
- **THEN** `isTabletScreen` is true, the guessed diagonal is 11 in and the scale about 130.6 px per inch; with a fine pointer, or at 393 × 852, `isTabletScreen` is false

### Requirement: A measured frame size is matched to a standard size

The engine SHALL match a frame size in inches to the catalog size whose width and height are each within ⅜ inch of it, in the orientation measured. It SHALL give the frame size itself with the match, and SHALL say the size is custom, with no match, when no catalog size is that close.

#### Scenario: An 8x10 measured inside

- **WHEN** a frame measured inside at the back is 8 by 10 inches, or 8⅛ by 10⅛ inches
- **THEN** it is the standard 8x10

#### Scenario: The edge of the tolerance

- **WHEN** a frame measured inside is 8⅜ by 10 inches, and another 8.4 by 10 inches
- **THEN** the first is the standard 8x10 and the second is a custom size

#### Scenario: A landscape frame

- **WHEN** a frame measured inside is 10 by 8 inches
- **THEN** it is the landscape 10x8

#### Scenario: A square frame measured slightly off

- **WHEN** a frame measured inside is 10.1 by 9.9 inches
- **THEN** it is the square 10x10

#### Scenario: A custom size

- **WHEN** a frame measured inside is 9 by 12 inches
- **THEN** it matches no standard size, and the frame size given is 9 by 12 inches

#### Scenario: A measurement matches at most one catalog size

- **WHEN** every pair of catalog sizes is compared, upright
- **THEN** each pair differs by at least 1 inch in width or height, so no measurement is within ⅜ inch of two catalog sizes

### Requirement: A metric frame size is named when it is closer than the US size

The engine SHALL also match a frame size against five metric frame sizes, A4 (21 × 29.7 cm), A3 (29.7 × 42 cm), 30 × 40 cm, 40 × 50 cm and 50 × 70 cm, within ⅜ inch on each side and in the measured orientation. It SHALL name the metric size only when its larger side difference is smaller than the US match's, and SHALL then name that US match as close too.

#### Scenario: An A4 frame

- **WHEN** a frame measured inside is 21 by 29.7 cm
- **THEN** it is the metric A4, and no US size is close

#### Scenario: A 30 × 40 cm frame

- **WHEN** a frame measured inside is 30 by 40 cm
- **THEN** it is the metric 30 × 40 cm, and the US 12x16 is named as close too

#### Scenario: A 12x16 frame

- **WHEN** a frame measured inside is 12 by 16 inches
- **THEN** it is the standard 12x16, and no metric size is named

#### Scenario: A landscape A4

- **WHEN** a frame measured inside is 29.7 by 21 cm
- **THEN** it is the metric A4, 29.7 cm wide and 21 cm high

#### Scenario: A measurement matches at most one metric size

- **WHEN** every pair of the five metric sizes is compared, upright
- **THEN** each pair differs by more than ¾ inch in width or height

### Requirement: A custom size names the nearest standard sizes below and above

For a frame size that matches no standard or metric size, the engine SHALL name the catalog size of largest area that is no bigger on either side, and the catalog size of smallest area that is at least as big on both sides, in the measured orientation. A square size, its sides within ⅜ inch, SHALL be compared only with square catalog sizes, and any other only with rectangular ones. A size whose long side is under 1.2 times its short side, but that is not square, SHALL also name the nearest square sizes below and above in the same way. Any of these may be absent.

#### Scenario: A 9 × 12 frame

- **WHEN** a frame measured inside is 9 by 12 inches
- **THEN** the size below is the 8.5x11 and the size above is the 11x14

#### Scenario: A landscape custom frame

- **WHEN** a frame measured inside is 12 by 9 inches
- **THEN** the size below is the landscape 11x8.5 and the size above is the landscape 14x11

#### Scenario: A square custom frame

- **WHEN** a frame measured inside is 13 by 13 inches
- **THEN** the size below is the 12x12 and the size above is the 16x16

#### Scenario: Larger than every size

- **WHEN** a frame measured inside is 30 by 44 inches
- **THEN** the size below is the 27x40 and there is no size above

#### Scenario: Smaller than every size

- **WHEN** a frame measured inside is 3 by 5 inches
- **THEN** there is no size below and the size above is the 4x6

#### Scenario: A near-square custom frame

- **WHEN** a frame measured inside is 9 by 9½ inches
- **THEN** the size below is the 5x7 and the size above is the 11x14, and the square below is the 8x8 and the square above is the 10x10

#### Scenario: A landscape near-square custom frame

- **WHEN** a frame measured inside is 9½ by 9 inches
- **THEN** the size below is the landscape 7x5 and the size above is the landscape 14x11, and the squares are the 8x8 and the 10x10

#### Scenario: Exactly 1.2 times as long

- **WHEN** a frame measured inside is 10 by 12 inches
- **THEN** the size below is the 8.5x11 and the size above is the 11x14, and no square size is named

### Requirement: A front opening gives the frame size

The engine SHALL take the window seen from the front of a frame with no mat as the frame size less the frame's lip on every side, ¼ inch unless given, and SHALL match the frame size that gives.

#### Scenario: The front opening of an 8x10

- **WHEN** a frame's front opening is 7½ by 9½ inches
- **THEN** its frame size is 8 by 10 inches, the standard 8x10

### Requirement: An outside measurement and the moulding width give the frame size

The engine SHALL take a frame's outside size, edge to edge, and the width of its moulding seen from the front, and SHALL give the frame size as the outside less two moulding widths plus two lips, ¼ inch each unless given. It SHALL match the frame size that gives.

#### Scenario: An 11x14 measured outside

- **WHEN** a frame is 13 by 16 inches outside and its moulding is 1¼ inches wide from the front
- **THEN** its frame size is 11 by 14 inches, the standard 11x14

#### Scenario: An 8x10 measured outside

- **WHEN** a frame is 10 by 12 inches outside and its moulding is 1¼ inches wide from the front
- **THEN** its frame size is 8 by 10 inches, the standard 8x10

### Requirement: A mat opening names the print and the frames sold with that mat

The engine SHALL take a mat's opening as the print size less the mat's overlap on every side, ¼ inch unless given, and SHALL give that print size. It SHALL list, in catalog order and in the measured orientation, every catalog frame whose common pre-cut mat holds a print within ⅜ inch of it, or none.

#### Scenario: An 8x10 print in a mat

- **WHEN** a mat's opening is 7½ by 9½ inches
- **THEN** the print is 8 by 10 inches and the frame is the 11x14

#### Scenario: A print sold in two frame sizes

- **WHEN** a mat's opening is 15½ by 19½ inches
- **THEN** the print is 16 by 20 inches and the frames are the 18x24 and the 20x24

#### Scenario: A landscape mat

- **WHEN** a mat's opening is 9½ by 7½ inches
- **THEN** the print is 10 by 8 inches and the frame is the landscape 14x11

#### Scenario: A print no pre-cut mat is sold for

- **WHEN** a mat's opening is 11½ by 15½ inches
- **THEN** the print is 12 by 16 inches and no frame is listed

#### Scenario: A mat print matches at most one pairing

- **WHEN** every pair of print sizes the catalog's mats hold is compared, upright
- **THEN** each pair differs by at least 1 inch in width or height

### Requirement: A measurement that gives no size gets no answer

The engine SHALL give no answer when a side, a moulding width, a lip or an overlap is not a positive finite number, when an outside measurement's moulding width is no wider than its lip, or when the frame size an outside measurement gives is not positive.

#### Scenario: A side that is not a positive number

- **WHEN** a side measured inside is 0, negative or not a number
- **THEN** there is no answer

#### Scenario: A lip, overlap or moulding width of 0

- **WHEN** a front opening is given with a lip of 0, an outside with a lip or moulding width of 0, or a mat opening with an overlap of 0
- **THEN** there is no answer

#### Scenario: Mouldings wider than the frame

- **WHEN** a frame is 4 by 6 inches outside and its moulding is 3 inches wide from the front
- **THEN** there is no answer

#### Scenario: A moulding no wider than its lip

- **WHEN** a frame is 13 by 16 inches outside and its moulding is ¼ inch or 0.1 inch wide from the front, with the ¼ inch lip
- **THEN** there is no answer

### Requirement: An inch length is written to the nearest eighth

The engine SHALL write a length in inches rounded to the nearest eighth, as a whole number followed by a fraction glyph (⅛, ¼, ⅜, ½, ⅝, ¾, ⅞), the glyph alone under one inch, and a whole number with no glyph when the eighths are 0. A size SHALL be written as its two lengths joined by " × " with " in" after them; its centimetre form stays the one-decimal form.

#### Scenario: Lengths in eighths

- **WHEN** 7.5, 0.25, 8.125, 1.25, 10 and 8.04 inches are written
- **THEN** they read "7½", "¼", "8⅛", "1¼", "10" and "8"

#### Scenario: A size in eighths

- **WHEN** the size 7.5 by 9.5 inches is written in eighths
- **THEN** it reads "7½ × 9½ in", and its centimetre form reads "19.1 × 24.1 cm"

### Requirement: A typed length is read with fractions

The engine SHALL read a typed length as a whole number, a decimal with a point or a comma, a fraction, a whole number and a fraction separated by a space or a hyphen, or a whole number followed by a fraction glyph. Text that is empty, holds anything else, starts with a minus sign or divides by 0 SHALL give no number.

#### Scenario: Forms of eight and an eighth

- **WHEN** "8 1/8", "8-1/8", "8⅛", "8.125" and " 8.125 " are read
- **THEN** each gives 8.125

#### Scenario: Other forms

- **WHEN** "8,5", "½", "3/4" and "12" are read
- **THEN** they give 8.5, 0.5, 0.75 and 12

#### Scenario: Text that is not a length

- **WHEN** "", "abc", "8 1/0", "-2" and "8 in" are read
- **THEN** each gives no number

### Requirement: A standard frame's measurements are listed

For a catalog frame the engine SHALL give its inside (the frame size), its front opening (the inside less two lips), its outside with the example moulding, the example moulding's width seen from the front (the moulding plus the lip), and, when a pre-cut mat is sold for it, the mat's opening and the print it holds.

#### Scenario: The 8x10

- **WHEN** the measurements of the 8x10 are listed
- **THEN** the inside is 8 × 10 in, the front opening 7½ × 9½ in, the outside 10 × 12 in with a moulding 1¼ in wide from the front, and the mat opening 4½ × 6½ in for a 5x7 print

#### Scenario: A frame with no pre-cut mat

- **WHEN** the measurements of the 4x6 are listed
- **THEN** the inside is 4 × 6 in, the front opening 3½ × 5½ in, the outside 6 × 8 in, and there is no mat

### Requirement: A measurement with no answer says why

For a measurement that gets no answer the engine SHALL say which rule refused it: a number that is not a positive finite number, a moulding no wider than its lip, or mouldings that leave no room for a picture. A measurement that gets an answer SHALL have no reason.

#### Scenario: Mouldings that leave no room

- **WHEN** a frame is 10 by 12 inches outside with a moulding 6 inches wide
- **THEN** the reason is that the mouldings leave no room

#### Scenario: A moulding no wider than the lip

- **WHEN** a frame is 13 by 16 inches outside with a moulding ¼ inch wide and the ¼ inch lip
- **THEN** the reason is that the moulding is no wider than the lip

#### Scenario: A side of 0

- **WHEN** a side measured inside is 0
- **THEN** the reason is a number that is not positive

#### Scenario: A measurement with an answer

- **WHEN** a frame measured inside is 8 by 10 inches
- **THEN** there is no reason

### Requirement: A print and a mat width give the mat opening and the frame size

Given a print size and a mat width in inches, the engine SHALL give the mat opening as the print less the mat's overlap on every side, ¼ inch unless given, and the frame size as that opening plus the mat width on every side. The mat width is the board cut on each side, from the mat's outer edge to its opening. Both sizes SHALL keep the print's orientation.

#### Scenario: An 8x10 print with a 2 inch mat

- **WHEN** an 8 by 10 inch print gets a mat 2 inches wide
- **THEN** the mat opening is 7½ by 9½ inches and the frame size is 11½ by 13½ inches

#### Scenario: A landscape print with a 2 inch mat

- **WHEN** a 10 by 8 inch print gets a mat 2 inches wide
- **THEN** the mat opening is 9½ by 7½ inches and the frame size is 13½ by 11½ inches

#### Scenario: A different overlap

- **WHEN** an 8 by 10 inch print gets a mat 2 inches wide that overlaps it by ⅛ inch on each side
- **THEN** the mat opening is 7¾ by 9¾ inches and the frame size is 11¾ by 13¾ inches

### Requirement: The frame size from a print is matched to a standard size

The engine SHALL match the frame size a print and a mat width give exactly as it matches a frame measured inside: a standard or metric size within ⅜ inch, else a custom size with the nearest standard sizes below and above. It SHALL also match the print itself the same way, so the page can name it.

#### Scenario: The print is named

- **WHEN** an 8 by 10 inch print gets a mat 2 inches wide
- **THEN** the print is the standard 8x10

#### Scenario: A frame size that is standard

- **WHEN** a 5 by 7 inch print gets a mat 1¾ inches wide
- **THEN** the frame size is 8 by 10 inches, the standard 8x10

#### Scenario: An 11x14 print with a 2 inch mat

- **WHEN** an 11 by 14 inch print gets a mat 2 inches wide
- **THEN** the frame size is 14½ by 17½ inches, a custom size with the 12x16 below and the 16x20 above

#### Scenario: An 8x10 print with a 2 inch mat is near-square

- **WHEN** an 8 by 10 inch print gets a mat 2 inches wide
- **THEN** the frame size 11½ by 13½ inches is a custom size with the 8.5x11 below and the 12x16 above, and the squares 10x10 below and 16x16 above

#### Scenario: A landscape frame size

- **WHEN** a 10 by 8 inch print gets a mat 2 inches wide
- **THEN** the frame size is a custom size with the landscape 11x8.5 below and the landscape 16x12 above

#### Scenario: A frame size that is metric

- **WHEN** an 8 by 12 inch print gets a mat 2 inches wide
- **THEN** the frame size is 11½ by 15½ inches, the metric 30 × 40 cm, and no US size is close

### Requirement: A print names the frames sold with a pre-cut mat for it

For a print size the engine SHALL list, in catalog order and in the print's orientation, every catalog frame whose common pre-cut mat holds a print within ⅜ inch of it, or none. This SHALL be the same list a measured mat opening gives for the print it points to.

#### Scenario: An 8x10 print

- **WHEN** the frames sold with a pre-cut mat are asked for an 8 by 10 inch print
- **THEN** the frame is the 11x14

#### Scenario: An 11x14 print

- **WHEN** the frames sold with a pre-cut mat are asked for an 11 by 14 inch print
- **THEN** the frame is the 16x20

#### Scenario: A 16x20 print

- **WHEN** the frames sold with a pre-cut mat are asked for a 16 by 20 inch print
- **THEN** the frames are the 18x24 and the 20x24

#### Scenario: A landscape print's pre-cut frame

- **WHEN** the frames sold with a pre-cut mat are asked for a 10 by 8 inch print
- **THEN** the frame is the landscape 14x11

#### Scenario: A 12x16 print with no pre-cut mat

- **WHEN** the frames sold with a pre-cut mat are asked for a 12 by 16 inch print
- **THEN** no frame is listed

### Requirement: A frame and a mat width give the mat opening and the largest print

Given a frame size and a mat width in inches, the engine SHALL give the mat opening as the frame less the mat width on every side, and the largest print the mat holds as that opening plus the mat's overlap on every side, ¼ inch unless given. Both sizes SHALL keep the frame's orientation.

#### Scenario: An 11x14 frame with a 2 inch mat

- **WHEN** an 11 by 14 inch frame gets a mat 2 inches wide
- **THEN** the mat opening is 7 by 10 inches and the largest print is 7½ by 10½ inches

#### Scenario: A landscape frame with a 2 inch mat

- **WHEN** a 14 by 11 inch frame gets a mat 2 inches wide
- **THEN** the mat opening is 10 by 7 inches and the largest print is 10½ by 7½ inches

### Requirement: The largest print for a frame is matched to a standard size

The engine SHALL match the largest print a frame and a mat width give exactly as it matches a frame measured inside: a standard or metric size within ⅜ inch, else a custom size with the nearest standard sizes below and above.

#### Scenario: A print that is standard

- **WHEN** an 8 by 10 inch frame gets a mat 1¾ inches wide
- **THEN** the largest print is 5 by 7 inches, the standard 5x7

#### Scenario: A print between two sizes

- **WHEN** an 11 by 14 inch frame gets a mat 2 inches wide
- **THEN** the largest print, 7½ by 10½ inches, is a custom size with the 5x7 below and the 8.5x11 above

#### Scenario: A landscape print between two sizes

- **WHEN** a 14 by 11 inch frame gets a mat 2 inches wide
- **THEN** the largest print is a custom size with the landscape 7x5 below and the landscape 11x8.5 above

### Requirement: A frame given in reverse is matched to a standard size

From a frame, the engine SHALL also match the frame size exactly as it matches a frame measured inside, so the page can name the pre-cut mat that frame is sold with. From a print, the frame match SHALL be the frame size's match.

#### Scenario: A frame sold with a pre-cut mat

- **WHEN** an 11 by 14 inch frame gets a mat 2 inches wide
- **THEN** the frame is the standard 11x14, whose pre-cut mat holds an 8x10 print

#### Scenario: A frame usually sold without a mat

- **WHEN** an 8.5 by 11 inch frame gets a mat 1½ inches wide
- **THEN** the frame is the standard 8.5x11, which has no pre-cut mat

#### Scenario: A custom frame

- **WHEN** a 9 by 12 inch frame gets a mat 2 inches wide
- **THEN** the frame is a custom size

### Requirement: A frame and a print give the mat border on each side

Given a frame size and a print size in inches, the engine SHALL give the mat border at the sides as (frame width − print width + 2 × overlap) ÷ 2 and at the top and bottom as (frame height − print height + 2 × overlap) ÷ 2, with the overlap ¼ inch unless given. A border of 0 or less SHALL be given as computed: the print's opening does not fit that frame.

#### Scenario: An 8x10 print in an 11x14 frame

- **WHEN** the borders are asked for an 8 by 10 inch print in an 11 by 14 inch frame
- **THEN** they are 1¾ inches at the sides and 2¼ inches at the top and bottom

#### Scenario: An 8x10 print in a 16x16 frame

- **WHEN** the borders are asked for an 8 by 10 inch print in a 16 by 16 inch frame
- **THEN** they are 4¼ inches at the sides and 3¼ inches at the top and bottom

#### Scenario: A 5x7 print in an 11x14 frame

- **WHEN** the borders are asked for a 5 by 7 inch print in an 11 by 14 inch frame
- **THEN** they are 3¼ inches at the sides and 3¾ inches at the top and bottom

#### Scenario: A landscape print in a landscape frame

- **WHEN** the borders are asked for a 10 by 8 inch print in a 14 by 11 inch frame
- **THEN** they are 2¼ inches at the sides and 1¾ inches at the top and bottom

#### Scenario: A print too big for the frame

- **WHEN** the borders are asked for an 8 by 10 inch print in a 5 by 7 inch frame
- **THEN** they are −1¼ inches at the sides and at the top and bottom

### Requirement: The calculator offers four mat widths and starts at 2 inches

The engine SHALL give the mat widths the calculator offers as presets, 1½, 2, 2½ and 3 inches, and the width it starts with, 2 inches.

#### Scenario: The presets and the default

- **WHEN** the calculator's mat widths are asked for
- **THEN** the presets are 1½, 2, 2½ and 3 inches and the default is 2 inches

### Requirement: A mat question that gives no size says why

The engine SHALL give no answer, and SHALL say which rule refused it, when a print or frame side, a mat width or an overlap is not a positive finite number, when the mat width is no wider than the overlap, or when the mat or the overlap leaves no opening. A question that gets an answer SHALL have no reason.

#### Scenario: A number that is not positive

- **WHEN** a print side, a frame side, a mat width or an overlap is 0, negative or not a number
- **THEN** there is no answer, and the reason is a number that is not positive

#### Scenario: A mat as wide as the frame

- **WHEN** a 4 by 6 inch frame gets a mat 2 inches wide, or 3 inches wide
- **THEN** there is no answer, and the reason is that the mat leaves no room

#### Scenario: An overlap as wide as the print

- **WHEN** a ½ by 6 inch print gets a mat 2 inches wide with the ¼ inch overlap
- **THEN** there is no answer, and the reason is that the mat leaves no room

#### Scenario: A mat no wider than its overlap

- **WHEN** an 8 by 10 inch print gets a mat 0.1 inch or ¼ inch wide, or an 11 by 14 inch frame gets a mat 0.2 inch wide, each with the ¼ inch overlap
- **THEN** there is no answer, and the reason is that the mat is too narrow

#### Scenario: A mat just wider than its overlap

- **WHEN** an 8 by 10 inch print gets a mat ⅜ inch wide with the ¼ inch overlap
- **THEN** there is no reason, and the frame is 8¼ by 10¼ inches

#### Scenario: A question with an answer

- **WHEN** an 8 by 10 inch print gets a mat 2 inches wide
- **THEN** there is no reason

### Requirement: The engine names the frame sold for a diploma

The engine SHALL give the usual US diploma size, 8½ by 11 inches, and the frame sold for it with a mat cut for that size, 11 by 14 inches, as checked against retail listings. A mat question whose print is the diploma size SHALL list that frame among the frames sold with a pre-cut mat for it, in catalog order; the pre-cut lookup that F4 uses SHALL NOT change.

#### Scenario: The diploma and its frame

- **WHEN** the diploma size and its frame are asked for
- **THEN** the diploma is 8½ by 11 inches and the frame is 11 by 14 inches, a catalog frame

#### Scenario: The border a diploma frame gives

- **WHEN** the mat borders are asked for the diploma in its frame
- **THEN** they are 1½ inches at the sides and 1¾ inches at the top and bottom, and the mat opening is 8 by 10½ inches

#### Scenario: A diploma-size print in the mat calculator

- **WHEN** an 8½ by 11 inch print gets a mat 1½ inches wide, or 2 inches wide
- **THEN** the frames sold with a pre-cut mat for it are the 11x14 and the 12x16, in that order; with 1½ inches the frame is 11 by 13½ inches, a custom size

#### Scenario: A diploma-size print that gets the diploma frame

- **WHEN** an 8½ by 11 inch print gets a mat 1⅝ inches wide
- **THEN** the frame is 11¼ by 13¾ inches, matched to the standard 11x14, and the frames sold with a pre-cut mat for it are the 11x14 and the 12x16

#### Scenario: F4's mat answer is unchanged

- **WHEN** F4 is given an 8 by 10½ inch mat opening
- **THEN** the frames sold with that mat are the 12x16 only, as before

### Requirement: The poster frame picker offers ten poster sizes

The engine SHALL list the poster sizes the poster frame picker offers, in this order, each upright and with a short use: the US sizes 11x17, 12x18, 16x20, 18x24, 20x30, 24x36 and 27x40, then A3 (297 × 420 mm), A2 (420 × 594 mm) and A1 (594 × 841 mm) from their millimetre sizes. Every US poster size SHALL be a catalog frame size.

#### Scenario: The poster list

- **WHEN** the poster sizes are read
- **THEN** they are 11x17, 12x18, 16x20, 18x24, 20x30, 24x36, 27x40, A3, A2 and A1 in that order, each with a use

#### Scenario: The poster use lines

- **WHEN** the poster sizes' uses are read
- **THEN** they are, in order: "Small posters and flyers", "Posters and photo enlargements", "Art prints and small posters", "Medium posters and art prints", "Large photo prints and posters", "Large posters", "Movie posters", "Small metric posters", "Medium metric posters" and "Large metric posters"

#### Scenario: The US poster sizes are catalog sizes

- **WHEN** each US poster size is looked up in the frame catalog
- **THEN** it is found, at the same width and height

#### Scenario: The A-series posters from their millimetre sizes

- **WHEN** A3, A2 and A1 are written in centimetres as the actual size viewer writes them
- **THEN** they are 29.7 × 42.0 cm, 42.0 × 59.4 cm and 59.4 × 84.1 cm, from 297 × 420 mm, 420 × 594 mm and 594 × 841 mm

### Requirement: A poster without a mat takes a frame of its own size

For a poster size in inches the engine SHALL give the frame it takes without a mat as the poster's own size, matched exactly as a frame measured inside: a standard or metric size within ⅜ inch, else a custom size with the nearest standard sizes below and above, in the poster's orientation.

#### Scenario: A 24x36 poster without a mat

- **WHEN** the frame without a mat is asked for a 24 by 36 inch poster
- **THEN** it is the standard 24x36 frame

#### Scenario: An A3 poster without a mat

- **WHEN** the frame without a mat is asked for an A3 poster
- **THEN** it is the metric A3 frame

#### Scenario: An A2 poster without a mat

- **WHEN** the frame without a mat is asked for an A2 poster
- **THEN** it is a custom size with the 16x20 below and the 18x24 above

#### Scenario: A landscape poster without a mat

- **WHEN** the frame without a mat is asked for a 17 by 11 inch poster
- **THEN** it is the standard landscape 17x11 frame

#### Scenario: A typed poster size between standard sizes

- **WHEN** the frame without a mat is asked for a 13 by 19 inch poster
- **THEN** it is a custom size with the 12x18 below and the 16x20 above

### Requirement: A poster near A2 or A1 is named that A-series frame

When a poster's own size matches no standard or metric frame and is within ⅜ inch of A2 (420 × 594 mm) or A1 (594 × 841 mm) on each side, the engine SHALL also name that A-series frame, in the poster's orientation, beside the custom answer. This SHALL NOT change what a measured frame or a mat question matches.

#### Scenario: An A2 poster names the A2 frame

- **WHEN** the frame without a mat is asked for an A2 poster
- **THEN** the A2 frame is named, and the answer stays custom with the 16x20 below and the 18x24 above

#### Scenario: An A1 poster names the A1 frame

- **WHEN** the frame without a mat is asked for an A1 poster
- **THEN** the A1 frame is named, and the answer stays custom with the 20x30 below and the 24x36 above

#### Scenario: A typed poster size near A2

- **WHEN** the frame without a mat is asked for a 16.4 by 23.3 inch poster
- **THEN** the A2 frame is named

#### Scenario: A standard or metric poster names no A-series frame

- **WHEN** the frame without a mat is asked for a 24 by 36 inch poster or an A3 poster
- **THEN** no A2 or A1 frame is named

#### Scenario: Measuring near A2 is unchanged

- **WHEN** an inside measurement of 16½ by 23⅜ inches is matched
- **THEN** it is a custom size, as before

### Requirement: A poster with a mat names the standard frames that hold it

For a poster size the engine SHALL list, smallest area first (catalog order on a tie) and in the poster's orientation, every catalog frame sold with a pre-cut mat for it, the diploma pairing included, and every catalog frame whose mat border is within the border range on every side. A square frame not sold pre-cut for it SHALL be considered only for a square poster (sides within ⅜ inch). Each frame SHALL come with its two borders and whether its mat is sold pre-cut.

#### Scenario: An 11x17 poster with a mat

- **WHEN** the frames with a mat are asked for an 11 by 17 inch poster
- **THEN** they are the 12x18 with a pre-cut mat and borders of ¾ and ¾ inch, the 16x20 with 2¾ and 1¾ inches, and the 18x24 with 3¾ and 3¾ inches

#### Scenario: A 16x20 poster with a mat

- **WHEN** the frames with a mat are asked for a 16 by 20 inch poster
- **THEN** they are the 18x24 with a pre-cut mat and borders of 1¼ and 2¼ inches, and the 20x24 with a pre-cut mat and borders of 2¼ and 2¼ inches

#### Scenario: An 18x24 poster with a mat

- **WHEN** the frames with a mat are asked for an 18 by 24 inch poster
- **THEN** the only frame is the 20x30, not pre-cut, with borders of 1¼ and 3¼ inches

#### Scenario: A 24x36 poster with a mat

- **WHEN** the frames with a mat are asked for a 24 by 36 inch poster
- **THEN** the only frame is the 27x40, not pre-cut, with borders of 1¾ and 2¼ inches

#### Scenario: A 27x40 poster with a mat

- **WHEN** the frames with a mat are asked for a 27 by 40 inch poster
- **THEN** no frame is listed

#### Scenario: An A2 poster with a mat

- **WHEN** the frames with a mat are asked for an A2 poster
- **THEN** the only frame is the 20x30, with borders that write as 2 and 3½ inches to the nearest eighth

#### Scenario: A landscape poster with a mat

- **WHEN** the frames with a mat are asked for a 17 by 11 inch poster
- **THEN** they are the landscape 18x12, 20x16 and 24x18, with the borders of the upright case turned

#### Scenario: A non-square poster leaves out square frames

- **WHEN** the frames with a mat are asked for a 13 by 14 inch poster
- **THEN** the only frame is the 16x20, with borders of 1¾ and 3¼ inches, and the 16x16 is not listed

#### Scenario: A square poster with a mat

- **WHEN** the frames with a mat are asked for a 12 by 12 inch poster
- **THEN** the only frame is the 16x16, with a pre-cut mat and borders of 2¼ and 2¼ inches

#### Scenario: Poster frames smallest first

- **WHEN** the frames with a mat are asked for a 10 by 10 inch poster
- **THEN** they are the 12x12 (1¼ and 1¼ inches), the 12x16 (1¼ and 3¼ inches) and the 16x16 (3¼ and 3¼ inches), in that order

#### Scenario: A near-square poster keeps its pre-cut square frames

- **WHEN** the frames with a mat are asked for a 7.7 by 8.3 inch poster
- **THEN** they are the 10x10 and the 12x12, both sold with a pre-cut mat, then the 11x14

#### Scenario: A diploma-size poster

- **WHEN** the frames with a mat are asked for an 8½ by 11 inch poster
- **THEN** the 11x14 and the 12x16 are both marked as sold with a pre-cut mat, as the frame and mat calculator names them

### Requirement: A pre-cut frame's borders are those of the mat as sold

For a frame sold with a pre-cut mat for a poster, the engine SHALL give the borders of that mat as sold: the frame with the print the mat is cut for (its catalog pairing, or the diploma for the diploma frame), not the poster's own size, which may differ by up to ⅜ inch.

#### Scenario: A poster a little larger than its pre-cut mat

- **WHEN** the frames with a mat are asked for an 11.3 by 17.3 inch poster
- **THEN** the 12x18 is listed as pre-cut with borders of ¾ and ¾ inch, the borders of its 11x17 mat

### Requirement: A poster with no standard frame for a mat gets the frame for a 2 inch mat

When no catalog frame holds a poster with a mat, the engine SHALL give the frame size a 2 inch mat needs, as the frame and mat calculator gives it from the print: the poster less the overlap on every side, plus 2 inches on every side, in the poster's orientation. A poster that has a standard frame with a mat SHALL get no such size.

#### Scenario: A 27x40 poster's custom frame

- **WHEN** the frames with a mat are asked for a 27 by 40 inch poster
- **THEN** the frame for a 2 inch mat is 30½ by 43½ inches

#### Scenario: A landscape 40x27 poster's custom frame

- **WHEN** the frames with a mat are asked for a 40 by 27 inch poster
- **THEN** the frame for a 2 inch mat is 43½ by 30½ inches

#### Scenario: A poster with a standard frame gets no custom frame

- **WHEN** the frames with a mat are asked for a 24 by 36 inch poster
- **THEN** no custom frame size is given

### Requirement: A mat border on a poster frame is 1 to 4 inches

The engine SHALL give the border range the poster frame picker accepts for a frame that is not sold with a pre-cut mat: at least 1 inch and at most 4 inches on every side, ends included. A frame sold with a pre-cut mat for the poster SHALL be listed whatever its borders.

#### Scenario: The poster border range

- **WHEN** the border range is read
- **THEN** it is 1 inch to 4 inches

#### Scenario: A poster border just outside the range

- **WHEN** the frames with a mat are asked for a 12 by 18 inch poster
- **THEN** the 20x24, with borders of 4¼ and 3¼ inches, is not listed, and the 16x20 and 18x24 are

#### Scenario: A pre-cut poster frame with a narrow border

- **WHEN** the frames with a mat are asked for an 11 by 17 inch poster
- **THEN** the 12x18 is listed, with borders of ¾ inch, because its mat is sold pre-cut

### Requirement: A poster size that is not a positive number gets no answer

The engine SHALL give no frame, with or without a mat, for a poster size whose width or height is zero, negative or not a finite number.

#### Scenario: A poster with a zero width

- **WHEN** the frames are asked for a 0 by 17 inch poster
- **THEN** there is no answer

#### Scenario: A poster height that is not a number

- **WHEN** the frames are asked for a poster whose height is not a number
- **THEN** there is no answer

### Requirement: A mockup offers the catalog sizes and three A-series sizes in the artwork's orientation

For an artwork given in pixels the engine SHALL list the sizes a mockup offers: the catalog frame sizes and A3, A2 and A1 from the poster sizes, turned to the artwork's orientation, catalog sizes first in catalog order. An artwork whose shorter side is within 5% of its longer side SHALL count as square and get the square catalog sizes only.

#### Scenario: A portrait artwork

- **WHEN** the sizes are listed for a 2000 by 3000 pixel artwork
- **THEN** they are 4x6, 5x7, 8x10, 8.5x11, 11x14, 11x17, 12x16, 12x18, 16x20, 18x24, 20x24, 20x30, 24x36, 27x40, A3, A2 and A1, in that order, all portrait

#### Scenario: A landscape artwork

- **WHEN** the sizes are listed for a 3000 by 2000 pixel artwork
- **THEN** they are the same seventeen sizes turned, starting 6x4, 7x5, 10x8, and ending with A1 at 33.1 by 23.4 inches

#### Scenario: A square artwork

- **WHEN** the sizes are listed for a 2000 by 2000 pixel artwork
- **THEN** they are 8x8, 10x10, 12x12, 16x16 and 20x20

#### Scenario: A nearly square artwork counts as square

- **WHEN** the sizes are listed for a 1000 by 1050 pixel artwork
- **THEN** they are the five square sizes, because 1000 is within 5% of 1050

### Requirement: Each mockup size says how much of the artwork it cuts

The artwork SHALL fill the opening edge to edge without stretching, so an opening of another shape cuts part of it. For each offered size the engine SHALL give the share of the artwork that is cut, from 0 to 1, as 1 minus the smaller of the two width-to-height ratios divided by the larger, for the opening without a mat and for the opening with a mat.

#### Scenario: A 2:3 artwork without a mat

- **WHEN** the cut is asked for a 2000 by 3000 pixel artwork without a mat
- **THEN** 4x6, 12x18, 20x30 and 24x36 cut nothing, 27x40 cuts 1.2%, 11x17 2.9%, A3 and A2 5.7%, A1 5.6%, 16x20 16.7% and 20x24 20%, each to one decimal

#### Scenario: A 3:4 artwork with a mat

- **WHEN** the cut is asked for a 3000 by 4000 pixel artwork with a mat
- **THEN** 12x16 cuts 1.6%, 16x20 3.6% and 18x24 5.6%, each to one decimal

### Requirement: A mockup opens on the size that cuts least

For an artwork and a mat choice the engine SHALL name the size the mockup opens on: the offered size that cuts least. Sizes whose cut is within 1 percentage point of the least SHALL count as tied, and the tied size with the largest area SHALL win.

#### Scenario: A 2:3 artwork opens on 24x36

- **WHEN** the opening size is asked for a 2000 by 3000 pixel artwork without a mat
- **THEN** it is 24x36, the largest of 4x6, 12x18, 20x30 and 24x36, which cut nothing; 27x40 at 1.2% is not tied

#### Scenario: A 3:4 artwork opens on 18x24

- **WHEN** the opening size is asked for a 3000 by 4000 pixel artwork without a mat
- **THEN** it is 18x24

#### Scenario: An A-series artwork opens on A1

- **WHEN** the opening size is asked for a 2480 by 3508 pixel artwork without a mat
- **THEN** it is A1, the largest of A3, A2 and A1, which all cut less than 1%

#### Scenario: A 2:3 artwork with a mat opens on 24x36

- **WHEN** the opening size is asked for a 2000 by 3000 pixel artwork with a mat
- **THEN** it is 24x36, which cuts 0.8%, larger than A1 at 0.1%, both within 1 point of the least

#### Scenario: A 3:4 artwork with a mat opens on 12x16

- **WHEN** the opening size is asked for a 3000 by 4000 pixel artwork with a mat
- **THEN** it is 12x16, which cuts 1.6%; 16x20 at 3.6% is not tied

#### Scenario: A square artwork opens on 20x20

- **WHEN** the opening size is asked for a 2000 by 2000 pixel artwork without a mat
- **THEN** it is 20x20

### Requirement: The opening a mockup artwork fills is the frame or its mat opening

Without a mat the opening SHALL be the frame size. With a mat, a frame sold with a pre-cut mat SHALL use that mat: the opening is the mat's print size less the ¼ inch overlap on each side. A frame with no pre-cut mat SHALL get a 2 inch mat on every side. A size with no room for a 2 inch mat SHALL stay in the sizes offered with a mat, with no opening and no cut, and a mockup SHALL never open on it.

#### Scenario: A pre-cut 16x20

- **WHEN** the opening is asked for a 16x20 frame with a mat
- **THEN** it is 10½ by 13½ inches, from the 11x14 pre-cut mat

#### Scenario: A 20x30 with no pre-cut mat

- **WHEN** the opening is asked for a 20x30 frame with a mat
- **THEN** it is 16 by 26 inches

#### Scenario: An A2 with a mat

- **WHEN** the opening is asked for an A2 frame with a mat
- **THEN** it is 4 inches less than 420 by 594 mm on each axis, 12.5 by 19.4 inches to one decimal

#### Scenario: A 4x6 with a mat has no opening

- **WHEN** the sizes are listed for a 2000 by 3000 pixel artwork with a mat
- **THEN** 4x6 is listed first with no opening and no cut, and the other sixteen each have an opening and a cut

#### Scenario: Without a mat the opening is the frame

- **WHEN** the opening is asked for a 24x36 frame without a mat
- **THEN** it is 24 by 36 inches

### Requirement: The visible part of a mockup artwork is centred and follows a focus point

For an artwork and an opening the engine SHALL give the part of the artwork that shows, in pixels, with the opening's shape and as large as the artwork allows. It SHALL be centred by default. A focus point from 0 to 1 SHALL slide it along the side that is cut, 0 at the left or top edge and 1 at the right or bottom edge, and the part SHALL never leave the artwork.

#### Scenario: A 2:3 artwork in a 16x20, centred

- **WHEN** the visible part is asked for a 2000 by 3000 pixel artwork in a 16 by 20 inch opening
- **THEN** it is 2000 by 2500 pixels with its top edge at 250

#### Scenario: The focus point moves it

- **WHEN** the same part is asked with the focus at 0, and then at 1
- **THEN** its top edge is at 0, and then at 500

#### Scenario: A 3:4 artwork in a 16x20

- **WHEN** the visible part is asked for a 3000 by 4000 pixel artwork in a 16 by 20 inch opening
- **THEN** it is 3000 by 3750 pixels with its top edge at 125

#### Scenario: A focus point outside 0 to 1 is held at the edge

- **WHEN** the visible part of the 2000 by 3000 pixel artwork in a 16 by 20 inch opening is asked with the focus at 1.5
- **THEN** its top edge is at 500, as at 1

#### Scenario: An artwork of the opening's shape is not cut

- **WHEN** the visible part is asked for a 2000 by 3000 pixel artwork in a 24 by 36 inch opening
- **THEN** it is the whole artwork, 2000 by 3000 pixels from 0, 0, whatever the focus

### Requirement: A mockup frame hangs at true scale on the sample wall

The engine SHALL place a mockup frame, with its moulding, on the sample wall 144 inches wide and 96 high, centred across it, by one of two rules: above the sofa, its outside bottom edge 8 inches over the 34 inch sofa back, as on the frame size chart; or on a plain wall, its centre 57 inches above the floor.

#### Scenario: A 24x36 above the sofa

- **WHEN** a 24x36 frame is placed above the sofa
- **THEN** its outside is 26 by 38 inches, its left edge at 59, its bottom edge at 42 and its top edge at 80 inches

#### Scenario: A 24x36 on a plain wall

- **WHEN** a 24x36 frame is placed on the plain wall
- **THEN** its outside bottom edge is at 38 and its top edge at 76 inches, its left edge at 59

#### Scenario: The largest frame fits the wall

- **WHEN** a 27x40 frame, portrait and then landscape, is placed by either rule
- **THEN** its outside lies inside the 144 by 96 inch wall

### Requirement: A mockup has a whole-wall view and a close-up

The engine SHALL give two views of the wall in inches: the whole wall, and a close-up of the frame whose outside is widened on every side by a quarter of the outside's longer side. The close-up SHALL lie inside the wall for every offered size, either rule and either orientation.

#### Scenario: The whole wall

- **WHEN** the whole-wall view is asked
- **THEN** it is 144 by 96 inches from the wall's bottom left corner

#### Scenario: A 24x36 close-up above the sofa

- **WHEN** the close-up is asked for a 24x36 frame above the sofa
- **THEN** it is 45 by 57 inches, its left edge at 49.5 and its bottom edge at 32.5 inches

### Requirement: A saved mockup is 2400 pixels on its longer side

The engine SHALL give the pixel size of a saved mockup from its view: the view's longer side becomes 2400 pixels and the other side is scaled to match, rounded to a whole pixel.

#### Scenario: The whole wall saved

- **WHEN** the pixel size is asked for the whole-wall view
- **THEN** it is 2400 by 1600 pixels

#### Scenario: A 24x36 close-up saved

- **WHEN** the pixel size is asked for the 45 by 57 inch close-up
- **THEN** it is 1895 by 2400 pixels

### Requirement: A key press moves a mockup artwork by a fixed step

The engine SHALL hold two key steps, ¼ inch for an arrow key and 1 inch with Shift. For an artwork, an opening and a step in inches it SHALL give the change in focus point that moves the artwork by that step along the cut side: the step divided by how far the artwork, scaled to fill the opening, reaches past the opening on that side. An artwork that is not cut SHALL get no change.

#### Scenario: Arrow and Shift + arrow on a 2:3 artwork in a 16x20

- **WHEN** the focus change is asked for a 2000 by 3000 pixel artwork in a 16 by 20 inch opening, for ¼ inch and then for 1 inch
- **THEN** it is 0.0625 and then 0.25, because the filled artwork is 16 by 24 inches and reaches 4 inches past the opening

#### Scenario: An artwork that is not cut does not move

- **WHEN** the focus change is asked for a 2000 by 3000 pixel artwork in a 24 by 36 inch opening
- **THEN** it is 0

### Requirement: An artwork size that is not a positive number gets no mockup answer

An artwork whose width or height in pixels is not a positive finite number SHALL get no sizes, no opening size, no visible part and no focus change.

#### Scenario: A zero width

- **WHEN** the sizes are asked for a 0 by 3000 pixel artwork
- **THEN** there is no answer

#### Scenario: A negative side, NaN and Infinity

- **WHEN** the sizes are asked for a -2000 by 3000, a 2000 by NaN and a 2000 by Infinity pixel artwork
- **THEN** there is no answer for any of them

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
): { frame: Rect; lines: { vertical: number[]; horizontal: number[] } };
function placeBeside(size: Size, selected: Rect | null, others: readonly Rect[], wall: Wall): Rect;
```

`apps/web` depends on it with `workspace:*` and lists it in `transpilePackages`. There is no build step.

## Behavior

The catalog is one literal of upright entries; ids, centimetres, landscape entries, the six common sizes and every table cell are derived from it. The landscape list swaps width, height and mat of each rectangular entry and keeps catalog order, so each list keeps catalog order.

`wallScene` works in inches: above the sofa a frame's outside bottom edge sits 8 in above the back and its centre on the sofa's centre line; beside a person or a door its centre is 57 in from the floor, 10 or 14 in right of the scene's centre line. A second frame (the next size up) hangs by the same rule. The next size up is the first later entry of the frame's own list that is at least as wide and as tall, so 11x17 skips the shorter 12x16. Reference boxes enclose the silhouettes the page draws.

`CHECK` records the date and the sources of the last data check (Target, Walmart and Amazon on 2026-11-11; evidence in `openspec/changes/archive/2026-11-12-t2-frame-size-chart/verification.md`). It changes in the same commit as the data.

The wall tool (`wall.ts`) works in inches with `y` up from the bottom; pixels appear only where a photo meets the wall (the scale, `rectToPhoto`, `photoPointToWall`). A visitor's unit is converted to inches before `scaleFromMark`. `DEMO_ROOM` is a 144 × 96 in wall with all four edges known, the F1 sofa centred and the `wallScene` 16x20 above it, shifted by half the wall's width. A photo's wall starts with no known edge: a floor line gives `bottom`, a marked wall width gives `left` and `right`, and `top` stays unknown. Distances and `setDistance` take the other frames and the furniture together as obstacles; an obstacle counts on a side when it lies wholly beyond that edge and overlaps the frame on the other axis by more than an edge. `snapFrame` compares edges and centres per axis (furniture only by its centre across) and takes the nearest pair within `SNAP`; `placeBeside` tries `PLACE_GAP` right, then left, then the centre. The reference lengths are checked in `openspec/changes/archive/2026-11-15-t7-wall-engine/verification.md`.

## Edge Cases

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
- `placeBeside`'s centred fallback is clamped inside the bounds (a close-up photo can sit below the 57 in line). Its beside spots check the bounds, not the known edges (BL-36).
- `snapFrame` takes no wall, so a snap can move a frame up to 1 in past the bounds (BL-37); an exact tie goes to the first pair checked (BL-38).

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

The engine SHALL place a new frame 3 inches to the right of the selected frame with their centres level. When it would leave the wall's bounds or overlap another frame or furniture there, it SHALL go 3 inches to the left instead. When neither side fits, or no frame is selected, it SHALL be centred across the bounds with its centre 57 inches above the floor, or in the middle of the bounds when the floor is unknown.

#### Scenario: A frame added beside the demo frame

- **GIVEN** the demo room with its 16x20 selected
- **WHEN** an 11x14 frame, its outside 13 by 16 inches, is added
- **THEN** it sits with its left edge at 84 inches and its bottom edge at 45 inches

#### Scenario: No room on the right

- **GIVEN** a wall 144 by 96 inches and the selected frame, outside 18 by 22 inches, at (120, 42)
- **WHEN** a frame of the same size is added
- **THEN** it sits with its left edge at 99 inches and its bottom edge at 42 inches

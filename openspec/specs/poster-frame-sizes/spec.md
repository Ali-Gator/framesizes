# poster-frame-sizes Specification

## Purpose

The F6 page, "Poster frame sizes" (`/poster-frame-sizes`), and its widget. A visitor picks a poster size or types one and sees the frame it takes without a mat and the standard frames that hold it with one, with their borders, drawn to one scale, then reads the same answers for every common poster in a chart.

## Public Interface

```typescript
// apps/web/src/app/poster-frame-sizes/page.tsx: the page, prerendered; opengraph-image.tsx: its
// 1200 × 630 social image; poster-frames.css: the widget's and the page's styles (on top of
// F5's frame-mat.css, which the page also imports)

// apps/web/src/components/poster-frames/poster-frames.tsx (client)
function PosterFrames(): JSX.Element;

// apps/web/src/components/poster-frames/poster-drawing.tsx (server or client)
function PosterDrawing(props: { draw: Drawing }): JSX.Element;

// apps/web/src/components/poster-frames/state.ts (pure)
type Field = "w" | "h";
const FIELDS: readonly Field[];
interface State {
  mode: "chips" | "custom";
  poster: string; // the chip pressed, kept while the custom size is open
  mat: boolean;
  landscape: boolean;
  fields: Record<Field, string>; // as typed, in the visitor's unit
  pick: number; // the with-a-mat frame drawn
}
type Action =
  | { type: "poster"; id: string }
  | { type: "mat"; on: boolean }
  | { type: "landscape"; on: boolean }
  | { type: "custom" }
  | { type: "chips" }
  | { type: "type"; field: Field; text: string }
  | { type: "pick"; i: number }
  | { type: "unit"; from: Unit; to: Unit }; // converts every field that reads
const INITIAL: State; // chips, "24x36", no mat, portrait, "", "", pick 0
function reducer(state: State, action: Action): State; // every action but pick and unit sets pick to 0
interface Picked {
  size: Size; // inches, turned when landscape
  name?: string; // a chip's name as shown: "11x17", "17x11", "A3"
  use?: string;
  isA: boolean; // an A-series chip
}
type PosterPick = Picked | { empty: true } | { error: Record<Field, boolean> };
function poster(state: State, unit: Unit): PosterPick; // F5's inches(); bad = not a finite length above 0

// apps/web/src/components/poster-frames/answer.ts (pure)
function len(inches: number, unit: Unit): string; // "1¾ in" | "4.4 cm"
function size(s: Size, unit: Unit): string; // "24 × 36 in" | "61 × 91.4 cm"
function pair(side: number, top: number, unit: Unit): string; // "¾ / ¾ in"
interface Row {
  chip: string;
  custom?: boolean;
  badge?: { pre: boolean; text: string };
  border?: string;
  note?: string;
}
interface Card {
  title: string;
  rows: readonly Row[];
  pick?: number; // a with-a-mat frame the visitor can draw
  selected?: boolean;
}
interface Answer {
  head: string;
  label: string;
  value: string;
  sub: string; // the other unit, or inches under millimetres
  use?: string;
  how: string;
  cards: readonly Card[];
  box?: { text: string; button: string; mat: boolean };
  calculator?: boolean; // links to F5
}
function describe(p: Picked, frames: PosterFrames, mat: boolean, pick: number, unit: Unit): Answer;
interface Both {
  in: string;
  cm: string;
}
interface Drawing {
  boxes: { oak: Box; frame: Box; poster: Box; opening?: Box }; // percent of a 440 × 320 stage
  dashed: boolean; // a custom frame
  borders?: {
    sideAt: { l: number; t: number };
    topAt: { l: number; t: number };
    side: Both;
    top: Both;
  };
  label: string; // every size in both units
  legend: readonly { name: string; value: Both; swatch: string }[];
  caption: string;
}
function drawing(p: Picked, frames: PosterFrames, mat: boolean, pick: number): Drawing;
```

## Behavior

The server renders the widget on 24x36, without a mat, in portrait, with its answer and drawing; every number goes through `<U>` in both units, so the HTML is right before hydration and the site header's in/cm switch only toggles CSS. The widget answers from `posterFrames` in the engine: `describe` once per unit gives the copy, `drawing` the boxes. A typed size is read with F5's `inches`; a field that is empty waits, one that is not a finite length above 0 is marked. With a mat on, a side of ½ in or less (two mat overlaps) waits like an empty field, which also covers the render before a unit switch converts the fields.

The drawing has one scale for every size: the longest side, moulding included, of any frame the page names for its ten posters (the 27x40's 30½ × 43½ in custom frame) fits the stage. A frame whose moulded box does not fit at that scale is drawn to fit, with the "Drawn smaller" caption. With a mat, the borders come from the engine's `MattedFrame` (a pre-cut frame's are the mat's as sold) and the opening is the frame less them.

One render serves both layouts: below 48rem one column in DOM order (chips and controls, answer, drawing) with "Your answer" visually hidden; from 48rem F5's grid, the controls and drawing on the left and the answer on the right. Buttons that remove themselves move focus: Custom size to the width field, Back to the pressed chip, the box button to the Mat control.

The page's table, size-group cards, painting list and questions read the engine at build time; the large group's sentence throws at build if a large poster stops having exactly one frame with a mat, or 27x40 gains one.

## Edge Cases

- Switching in to cm and back rewrites a typed field to 0.1 cm or the nearest eighth; near the ⅜ in tolerance that can flip a match (BL-126).
- A pre-cut frame matched within ⅜ in says its mat is cut for "your poster" with a ¼ in overlap, though it is cut for the standard print (BL-127).
- A typed size with a mat and no standard frame names the frame without a mat only when the engine names one; a custom size has no box.
- A huge number that reads as Infinity is marked as bad input, and a unit switch leaves it as typed.
- Chip names stay as they are in cm; only the line under each chip and the answer change.

## Requirements

### Requirement: The page follows the chart outline

The page SHALL hold, in order: breadcrumbs, the `h1`, the answer paragraph, the widget, "Poster frame sizes chart", the three size groups, "Painting frame sizes", "How to choose a poster frame", "Questions about poster frames" and "Related tools", all in the server HTML.

#### Scenario: The heading outline of the server HTML

- **WHEN** `/poster-frame-sizes` is requested
- **THEN** the HTML has one `h1`, "Poster Frame Sizes", and its `h2`s in order are "Find the frame for your poster", "Poster frame sizes chart", "Frames for small posters: 11x17, 12x18 and 16x20", "Frames for large posters: 18x24 to 27x40", "Frames for A-series posters: A3, A2 and A1", "Painting frame sizes", "How to choose a poster frame", "Questions about poster frames" and "Related tools"; the how-to holds three numbered steps with the `h3`s "Measure the poster", "Decide on a mat" and "Pick the frame"

### Requirement: The answer paragraph names the head keyword with numbers

The paragraph under the `h1` SHALL answer "poster frame sizes" with sizes from the engine, and on a small phone the `h1`, that paragraph and the widget's title SHALL show without scrolling.

#### Scenario: The answer in the server HTML

- **WHEN** `/poster-frame-sizes` is requested
- **THEN** the paragraph after the `h1` reads "Poster frame sizes match the poster when there is no mat: an 18x24 poster takes an 18x24 frame. With a mat it takes a bigger frame: an 11x17 poster takes a 12x18, 16x20 or 18x24 frame."

#### Scenario: The first screen on a small phone

- **WHEN** the page is opened at 360 × 740
- **THEN** the `h1`, the answer paragraph and the widget's title "Find the frame for your poster" are inside the first screen

### Requirement: The widget opens on a 24x36 poster without a mat

The server HTML SHALL render the widget with the 24x36 chip pressed, "Without a mat" and "Portrait" chosen, and the 24x36 answer and drawing shown.

#### Scenario: The widget in the server HTML

- **WHEN** `/poster-frame-sizes` is requested
- **THEN** the widget shows the chips "11×17", "12×18", "16×20", "18×24", "20×30", "24×36", "27×40", "A3", "A2" and "A1" with only "24×36" pressed, a "Custom size" chip, "Without a mat" and "Portrait" chosen, the answer "Use a 24x36 frame.", and a drawing captioned "Drawn to scale. Every size on this page uses the same scale."

### Requirement: The chips name each poster in both units

Each chip SHALL show the poster's name and, under it, its size in whole centimetres, or in millimetres for an A-series size. Pressing a chip SHALL press only that chip and answer for that poster. "Landscape" SHALL turn every chip label and every frame in the answer.

#### Scenario: Chip labels

- **WHEN** the widget is shown in portrait
- **THEN** the "11×17" chip reads "28×43 cm" under its name and the "A2" chip reads "420×594 mm"

#### Scenario: Landscape

- **WHEN** the visitor chooses "Landscape" with 11x17 and "With a mat"
- **THEN** the chip reads "17×11", the answer reads "3 standard frames fit a 17x11 poster with a mat.", and the cards name an 18x12 frame (pre-cut, border ¾ / ¾ in), a 20x16 frame (1¾ / 2¾ in) and a 24x18 frame (3¾ / 3¾ in), in that order

### Requirement: A poster without a mat takes a frame of its own size

Without a mat, when the poster is a standard US frame size, the answer SHALL name that frame, give the frame size in both units, the poster's use line, how it was found, and a "Ready-made frame" card.

#### Scenario: A 24x36 poster

- **WHEN** the visitor picks 24x36 without a mat
- **THEN** the answer reads "Use a 24x36 frame.", "Frame size" 24 × 36 in (61 × 91.4 cm), "Large posters", and "Without a mat, the frame is the poster's own size. 24x36 is a standard US frame size."; the "Ready-made frame" card names a 24x36 frame with "No mat. The poster fills the frame."

### Requirement: A metric or A-series poster is named its metric frame

Without a mat, when the poster is within ⅜ in of a metric frame or of A2 or A1, the answer SHALL name that frame with its millimetre size for an A-series frame, say no US frame matches, and list the US frames that take it with a mat, with their borders.

#### Scenario: An A3 poster

- **WHEN** the visitor picks A3 without a mat
- **THEN** the answer reads "Use an A3 frame (297 × 420 mm).", "Frame size" 297 × 420 mm with 11.7 × 16.5 in under it, and "A3 frames are sold under the paper's name. No US frame size is within ⅜ in of it."; a "Metric frame" card names an A3 frame, 297 × 420 mm, and a "US frames, with a mat" card names a 16x20 frame (border 2⅜ / 2 in) and an 18x24 frame (3⅜ / 4 in), each "Mat cut to order"

#### Scenario: An A2 poster

- **WHEN** the visitor picks A2 without a mat
- **THEN** the answer reads "Use an A2 frame (420 × 594 mm).", with 16.5 × 23.4 in under the size, and "A2 frames are sold under the paper's name. No US frame size is within ⅜ in of it: 16x20 is smaller, 18x24 is bigger."; the "US frames, with a mat" card names a 20x30 frame with a border of 2 / 3½ in (5 / 9 cm)

#### Scenario: A metric size with a US frame just as close

- **WHEN** the visitor types 40 × 50 cm without a mat
- **THEN** the answer reads "Use a 40 × 50 cm frame." and "A metric frame size. A 16x20 frame is within ⅜ in of it too."

### Requirement: A custom size without a mat offers the exact size and the closest standard sizes

Without a mat, when no standard or metric frame is within ⅜ in, the answer SHALL give the exact size to order and the standard sizes just below and just above, each with how much it differs from the poster.

#### Scenario: A 13 × 19 inch poster

- **WHEN** the visitor types 13 × 19 in without a mat
- **THEN** the answer reads "Not a standard size: 13 × 19 in.", "Frame size, custom" 13 × 19 in (33 × 48.3 cm), and "Without a mat, the frame is the poster's own size. No standard frame is within ⅜ in of it."; the "Order this size" card says "A custom frame, made to this size.", and the "Closest standard sizes" card names a 12x18 frame, "Too small: 1 in narrower and 1 in shorter.", and a 16x20 frame, "3 in wider and 1 in taller than the poster."

### Requirement: Each answer offers the other mat choice

A standard frame answer without a mat SHALL end with a box naming the standard frames that take the poster with a mat, or saying none does, and a "See frames with a mat" button; a custom answer SHALL do so only when some standard frame takes it. A metric answer has no box: its card lists those frames. A with-a-mat answer with no standard frame SHALL end with a box naming the frame without a mat and a "See it without a mat" button. Each button SHALL switch the mat control.

#### Scenario: From a standard frame

- **WHEN** the visitor picks 24x36 without a mat and presses "See frames with a mat"
- **THEN** the box first read "With a mat it takes a bigger frame: 27x40.", then "With a mat" is chosen and the answer names the 27x40 frame

#### Scenario: From a custom size

- **WHEN** the visitor types 13 × 19 in without a mat
- **THEN** the box reads "With a mat it fits a standard frame: 18x24 or 20x24."

#### Scenario: No box

- **WHEN** the visitor picks A3 without a mat, or types 40 × 60 in without a mat
- **THEN** no "See frames with a mat" button shows

#### Scenario: A custom size with no frame for a mat

- **WHEN** the visitor types 40 × 60 in with a mat
- **THEN** no "See it without a mat" button shows: a custom size has no frame to name

#### Scenario: A standard frame with none for a mat

- **WHEN** the visitor picks 27x40 without a mat
- **THEN** the box reads "No standard frame takes it with a mat." with a "See frames with a mat" button

### Requirement: With a mat the answer lists the standard frames that hold the poster

With a mat, the answer SHALL list every standard frame the engine gives, smallest first, each in a card with its borders at the sides and at the top and bottom, a "Pre-cut mat included" or "Mat cut to order" badge, and a note saying so. With more than one, the cards SHALL be buttons: the first is drawn, and pressing another draws that one.

#### Scenario: Three frames for an 11x17 poster

- **WHEN** the visitor picks 11x17 with a mat
- **THEN** the answer reads "3 standard frames fit an 11x17 poster with a mat.", "Frame in the drawing" 12 × 18 in, and "Borders are sides / top and bottom. The mat overlaps the poster by ¼ in on each side. Tap a frame to draw it."; the cards are "Frame 1 of 3" (12x18 frame, "Pre-cut mat included", "Border ¾ / ¾ in", "Sold with a mat cut for an 11x17 poster."), "Frame 2 of 3" (16x20 frame, "Mat cut to order", "Border 2¾ / 1¾ in", "Have the mat cut for an 11x17 poster.") and "Frame 3 of 3" (18x24 frame, "Border 3¾ / 3¾ in"), with only the first pressed and marked "In the drawing"

#### Scenario: Drawing another frame

- **WHEN** the visitor presses "Frame 2 of 3" for an 11x17 poster
- **THEN** only that card is pressed and marked "In the drawing", and the answer and the drawing show a 16 × 20 in frame

#### Scenario: One frame for a 24x36 poster

- **WHEN** the visitor picks 24x36 with a mat
- **THEN** the answer reads "A 27x40 frame fits a 24x36 poster with a mat.", "Frame size" 27 × 40 in, and one card, "Frame", that is not a button: a 27x40 frame, "Mat cut to order", "Border 1¾ / 2¼ in", "Have the mat cut for a 24x36 poster."

#### Scenario: A typed size names "your poster"

- **WHEN** the visitor types 13 × 19 in with a mat
- **THEN** the answer reads "2 standard frames fit your poster with a mat." and names an 18x24 frame (border 2¾ / 2¾ in) and a 20x24 frame (3¾ / 2¾ in)

### Requirement: A poster with no standard frame for a mat gets the frame for a 2 inch mat

With a mat, when no standard frame holds the poster, the answer SHALL say so, give the custom frame a 2 in mat needs, and link to the frame and mat calculator.

#### Scenario: A 27x40 poster

- **WHEN** the visitor picks 27x40 with a mat
- **THEN** the answer reads "No standard frame fits a 27x40 poster with a mat.", "Custom frame" 30½ × 43½ in (77.5 × 110.5 cm), and "No standard frame leaves a 1 in to 4 in border on every side. For a 2 in mat, order a custom frame."; the "Custom frame" card says "Border 2 / 2 in" and "Made to order, with the mat cut to fit."; a link "Try other mat widths in the frame and mat calculator" points to `/frame-mat-calculator`; the box reads "Without a mat it takes a 27x40 frame." with a "See it without a mat" button

### Requirement: A custom size takes inches with fractions, or centimetres

"Custom size" SHALL replace the chips and the orientation control with width and height fields and a "Back to standard sizes" button. Each field SHALL accept a whole number, a decimal with `.` or `,`, and in inches a fraction typed as `a/b`, `n a/b` or a glyph; in centimetres one decimal. The answer SHALL follow every edit, with no button to press, and the typed width and height SHALL set the orientation.

#### Scenario: Three ways to type 13½

- **WHEN** the width is typed as "13 1/2", "13.5" or "13½" in inches, with height 19
- **THEN** each gives the same answer, and the hint reads "Fractions work: 13 1/2, 13.5 or 13½."

#### Scenario: Centimetres

- **WHEN** the unit is cm and the custom size is open
- **THEN** the hint reads "Centimetres, to one decimal, like 33.5."

#### Scenario: Orientation from the typed size

- **WHEN** the custom size is open
- **THEN** no Portrait / Landscape control shows, the text reads "Width first. A size wider than it is tall is landscape.", and a typed 19 × 13 in gets landscape frames

#### Scenario: Empty fields

- **WHEN** the visitor opens "Custom size" with both fields empty, or fills only one
- **THEN** no field is marked, the answer area reads "Type the poster's width and height. The frame shows here.", and no drawing shows

### Requirement: Bad input gets one message and no answer

A custom field holding 0, a negative number or anything that is not a length SHALL be marked invalid, the fields SHALL share the message "Enter a width and a height above 0.", the answer area SHALL read "Fix the size above to see a frame.", and no answer or drawing SHALL show.

#### Scenario: Zero, a letter, a negative

- **WHEN** the visitor types width 0 and height 19, or width 13 and height "a", or width −13 and height 19
- **THEN** only the bad field has `aria-invalid="true"`, the message reads "Enter a width and a height above 0.", and the answer area reads "Fix the size above to see a frame."

### Requirement: Back to standard sizes keeps the chip and the typed size

"Back to standard sizes" SHALL show the chips again with the chip pressed before "Custom size" still pressed and its answer showing. Reopening "Custom size" SHALL show the size typed before.

#### Scenario: There and back

- **WHEN** the visitor has 18x24 pressed, opens "Custom size", types 13 × 19, presses "Back to standard sizes", then opens "Custom size" again
- **THEN** the chips show with "18×24" pressed and the 18x24 answer, then the fields read "13" and "19"

### Requirement: The unit switch writes every number in the visitor's unit

The site header's in/cm switch SHALL set the unit for every number the widget writes: inches to the nearest eighth, centimetres to one decimal with no trailing ".0", each from the true length. A-series sizes SHALL lead with millimetres, their inches to one decimal. Switching SHALL convert the typed custom size and leave other text as it is. Chip names stay as they are.

#### Scenario: An 11x17 poster with a mat in centimetres

- **WHEN** the unit is cm and the visitor picks 11x17 with a mat
- **THEN** the chip still reads "11×17", the answer gives the frame as 30.5 × 45.7 cm and the 12x18 card reads "Border 1.9 / 1.9 cm"

#### Scenario: A 24x36 poster in centimetres

- **WHEN** the unit is cm and the visitor picks 24x36 without a mat
- **THEN** the frame size reads "61 × 91.4 cm"

#### Scenario: A typed size converts

- **WHEN** the custom fields hold 13 and 19 in inches and the visitor switches to cm, then back to in
- **THEN** they read "33" and "48.3", then "13" and "19"

### Requirement: The answer is announced and drawn to one scale

The answer area SHALL be a polite live region. A drawing SHALL show the frame and the poster, and with a mat the mat and the poster seen in it, as one image whose label gives every size in both units, with a legend. Every size SHALL be drawn at one scale, set by the largest frame the page names, so a bigger poster looks bigger; a typed frame bigger than that SHALL be drawn smaller, to fit.

#### Scenario: The drawing without a mat

- **WHEN** the answer is for a 24x36 poster without a mat
- **THEN** the drawing's label reads "Drawn to scale: a 24 × 36 in (61 × 91.4 cm) poster in a 24 × 36 in (61 × 91.4 cm) frame, no mat.", and its legend reads "Frame" 24 × 36 in and "Poster" 24 × 36 in

#### Scenario: The drawing with a mat

- **WHEN** the answer is for an 11x17 poster with a mat, the 12x18 frame drawn
- **THEN** the drawing's label reads "Drawn to scale: a 12 × 18 in (30.5 × 45.7 cm) frame with a mat around an 11 × 17 in (27.9 × 43.2 cm) poster. The border is ¾ in (1.9 cm) at the sides and ¾ in (1.9 cm) at the top and bottom.", and its legend reads "Frame" 12 × 18 in, "Poster, seen in the mat" 10½ × 16½ in and "Border, sides / top" ¾ / ¾ in

#### Scenario: A pre-cut frame is drawn with the mat as sold

- **WHEN** the visitor types 40 × 50 cm with a mat and the 18x24 frame is drawn
- **THEN** its card reads "Border 1¼ / 2¼ in" and the drawing's label reads "Drawn to scale: an 18 × 24 in (45.7 × 61 cm) frame with a mat around a 15¾ × 19⅝ in (40 × 50 cm) poster. The border is 1¼ in (3.2 cm) at the sides and 2¼ in (5.7 cm) at the top and bottom.", with "Poster, seen in the mat" 15½ × 19½ in in the legend

#### Scenario: One scale

- **WHEN** the drawing shows an 11x17 poster without a mat, then a 24x36 poster without a mat
- **THEN** the first frame is drawn 11/24 as wide as the second, and the caption reads "Drawn to scale. Every size on this page uses the same scale."

#### Scenario: A custom frame is dashed

- **WHEN** the answer is a custom size or a custom frame
- **THEN** the drawn frame is dashed and its legend row reads "Frame, custom"

#### Scenario: Too big for the scale

- **WHEN** the visitor types 40 × 60 in without a mat
- **THEN** the frame fills the drawing and the caption reads "Drawn smaller than the other sizes, to fit."

### Requirement: A desktop shows the controls beside the answer, a phone one column

At 768 px and wider the widget SHALL show the chips, the controls and the drawing on the left and "Your answer" on the right. Below 768 px it SHALL be one column: the chips, the controls, the answer, then the drawing. Nothing SHALL be wider than the screen.

#### Scenario: Desktop

- **WHEN** the page is opened at 1280 wide
- **THEN** the answer's left edge is right of the chips' right edge, and the drawing is below the mat control

#### Scenario: Phone

- **WHEN** the page is opened at 390 × 844
- **THEN** the answer is below the mat control, the drawing is below the answer, and no element is wider than 390 px

### Requirement: The chart table maps each poster to its frames

Under "Poster frame sizes chart" the page SHALL hold one table titled "Standard poster frame sizes", with one row per picker poster and three columns: the poster with its use line, the frame without a mat, and the frames with a mat with "pre-cut" and their borders (sides / top and bottom). Every number SHALL come from the engine, in both units in the HTML.

#### Scenario: The table

- **WHEN** `/poster-frame-sizes` is requested
- **THEN** the table has ten rows, its columns are "Poster", "Without a mat" and "With a mat"; the 11x17 row reads "11 × 17 in", "Small posters and flyers", "11 × 17 in", and "12 × 18 in, pre-cut · ¾ / ¾ in", "16 × 20 in · 2¾ / 1¾ in", "18 × 24 in · 3¾ / 3¾ in"; the 27x40 row's last cell reads "No standard frame" and "Custom 30½ × 43½ in for a 2 in mat"; the A2 row reads "A2 (420 × 594 mm)", "16.5 × 23.4 in", "A2 frame (420 × 594 mm)", "No US size" and "20 × 30 in · 2 / 3½ in"

#### Scenario: The table in centimetres

- **WHEN** the unit is cm
- **THEN** the 11x17 row's first frame with a mat reads "30.5 × 45.7 cm, pre-cut · 1.9 / 1.9 cm"

### Requirement: The size groups answer each poster in a card

The small, large and A-series sections SHALL each hold one card per poster in the group, with the frame without a mat and the frames with a mat, from the engine.

#### Scenario: Small posters

- **WHEN** `/poster-frame-sizes` is requested
- **THEN** the "11x17 poster" card reads "11x17 frame" and "With a mat: 12x18 (sold with a pre-cut mat, ¾ in border), 16x20 or 18x24.", the "12x18 poster" card reads "With a mat: 16x20 or 18x24. No frame is sold with a pre-cut mat for 12x18." and the "16x20 poster" card reads "With a mat: 18x24 or 20x24. Both are sold with a pre-cut mat for 16x20."

#### Scenario: Large posters

- **WHEN** `/poster-frame-sizes` is requested
- **THEN** the "18x24 poster" card reads "With a mat: 20x30. The border is 1¼ in at the sides and 3¼ in at the top and bottom." and the "27x40 poster" card reads "No standard frame takes it with a mat. A 2 in mat needs a custom frame, 30½ × 43½ in."

#### Scenario: A-series posters

- **WHEN** `/poster-frame-sizes` is requested
- **THEN** the "A3 poster" card reads "297 × 420 mm", "A3 frame" and "With a mat: 16x20 or 18x24.", and the "A2 poster" card reads "A2 frame" and "No US frame size matches A2: 16x20 is smaller, 18x24 is bigger. With a mat: 20x30."

### Requirement: The painting section names canvas frame sizes

"Painting frame sizes" SHALL say a painting on canvas takes a frame of the canvas's own size, with no mat and no glass, list four examples from the catalog, and send a painting on paper to the widget.

#### Scenario: Four canvas sizes

- **WHEN** `/poster-frame-sizes` is requested
- **THEN** the section lists 11 × 14 in, 16 × 20 in, 18 × 24 in and 24 × 36 in, each with its own frame ("11x14 frame"), and ends "A painting on paper is framed like a poster, with or without a mat. Use the tool above."

### Requirement: The how-to links to poster sizes only when that page is live

Step 1 of "How to choose a poster frame" SHALL link "poster sizes" to `/poster-sizes` only while P1 is live; otherwise the step ends after "Most posters come in a standard size." Step 2 SHALL give the 1 to 4 in (2.5 to 10.2 cm) border range from the engine.

#### Scenario: P1 not live

- **WHEN** `/poster-frame-sizes` is requested while P1 is not live
- **THEN** step 1 reads "Width first, edge to edge. Most posters come in a standard size.", step 2 gives the border range as 1 to 4 in (2.5 to 10.2 cm), and no link points to `/poster-sizes`

### Requirement: The questions answer in the server HTML

The page SHALL answer six questions in its server HTML, the first open, with every size in both units from the engine.

#### Scenario: The six questions

- **WHEN** `/poster-frame-sizes` is requested
- **THEN** the questions are "What are typical poster frame sizes?", "What are the standard print frame sizes?", "Does a poster need a mat?", "What size frame for an A2 poster?", "Is there a frame with a mat for a 27x40 poster?" and "Can I use centimetres?", and the first answer is visible without a click

### Requirement: The page links only to live pages

Related tools SHALL list the live Frames pages other than F6, then P1 when live, and SHALL be left out, heading included, while none is live.

#### Scenario: F1, F2, F3, F4, F5, F6 and G1 are live

- **WHEN** `/poster-frame-sizes` is requested while only F1, F2, F3, F4, F5, F6, G1 and the company pages are live
- **THEN** Related tools holds five cards, linking to `/`, `/frame-sizes-on-wall`, `/how-big-is-8x10`, `/measure-picture-frame` and `/frame-mat-calculator` in that order; no link points to `/poster-sizes`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4, F5, F6, F7 and G1 are live

- **WHEN** `/poster-frame-sizes` is requested while only F1, F2, F3, F4, F5, F6, F7, G1 and the company pages are live
- **THEN** Related tools holds six cards, linking to `/`, `/frame-sizes-on-wall`, `/how-big-is-8x10`, `/measure-picture-frame`, `/frame-mat-calculator` and `/frame-mockup` in that order; no link points to `/poster-sizes`; and no `href` starts with `#`

### Requirement: The page carries its head values and breadcrumbs

The page SHALL take its title, `h1`, description and content date from its site map entry, carry breadcrumbs Home › Poster frame sizes with a matching `BreadcrumbList`, and send its own 1200 × 630 social image with the alt "A 24x36 poster in a 24x36 frame, and in a 27x40 frame with a mat".

#### Scenario: The head of the page

- **WHEN** `/poster-frame-sizes` is requested
- **THEN** the title is "Poster Frame Sizes Chart: With or Without a Mat", the canonical is `https://framesizes.app/poster-frame-sizes`, and `og:image:alt` is the alt above

#### Scenario: F6's breadcrumbs

- **WHEN** `/poster-frame-sizes` is requested
- **THEN** the breadcrumb `nav` holds "Home" linking to `/` and "Poster frame sizes" as the current page, and the HTML holds one `BreadcrumbList` with the same two items and no `FAQPage` or `HowTo`

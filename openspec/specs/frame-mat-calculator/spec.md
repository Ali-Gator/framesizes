# frame-mat-calculator Specification

## Purpose

The F5 page, "Frame and mat calculator" (`/frame-mat-calculator`), and its calculator. From a print and a mat border the visitor gets the frame size, the mat opening and the frames sold with a pre-cut mat for that print; in reverse, from a frame and a mat border, the largest print that fits and the mat the frame is sold with.

## Public Interface

```typescript
// apps/web/src/app/frame-mat-calculator/page.tsx: the page, prerendered; opengraph-image.tsx: its
// 1200 × 630 social image; frame-mat.css: the calculator's and the page's styles

// apps/web/src/components/frame-mat/frame-mat.tsx (client)
function FrameMat(): JSX.Element;

// apps/web/src/components/frame-mat/mat-drawing.tsx (server or client)
function MatDrawing(props: { draw: Drawing; caption?: ReactNode; className?: string }): JSX.Element;
// `caption` replaces the drawing's caption and legend (the page's formula figure)

// apps/web/src/components/frame-mat/state.ts (pure)
type From = "print" | "frame";
type Field = "w" | "h" | "m"; // m: the mat border
const FIELDS: readonly Field[];
interface State {
  from: From;
  fields: Record<Field, string>; // as typed, in the visitor's unit
  submitted: boolean; // find pressed: errors show, the answer follows every edit
}
type Action =
  | { type: "type"; field: Field; text: string }
  | { type: "preset"; inches: number; unit: Unit } // a border chip
  | { type: "swap"; carry?: Size; unit: Unit } // carry: the answer's frame or print, in inches
  | { type: "find" }
  | { type: "reset"; unit: Unit } // sizes empty, border back to MAT_WIDTH
  | { type: "unit"; from: Unit; to: Unit }; // converts every field that reads
const INITIAL: State; // from a print, "", "", "2" (inches)
function reducer(state: State, action: Action): State;
function inches(text: string, unit: Unit): number | undefined;
type Outcome = { errors: Partial<Record<Field, string>> } | { answer: MatAnswer; width: number }; // width: the border in inches
function outcome(state: State, unit: Unit): Outcome; // readLength, whyNoMat, matSizes

// apps/web/src/components/frame-mat/answer.ts (pure)
interface Row {
  chip: string;
  custom?: boolean;
  border?: string;
  note?: string;
}
interface Card {
  title: string;
  rows: readonly Row[];
  text?: string;
}
interface Answer {
  head: string;
  label: string; // "Frame size" | "Largest print"
  value: string;
  opening: string;
  how: string;
  cards: readonly Card[];
}
function describe(result: { answer: MatAnswer; width: number }, from: From, unit: Unit): Answer;
interface Both {
  in: string;
  cm: string;
}
interface Drawing {
  frame: Size;
  opening: Size;
  print: Size;
  boxes: { oak: Box; mat: Box; opening: Box; print: Box }; // percent of a 440 × 320 stage
  sideAt: { l: number; t: number };
  topAt: { l: number; t: number };
  side: Both;
  top: Both;
  label: string; // in the unit given
  legend: readonly { name: string; value: Both; swatch: string }[];
  caption: string;
}
function drawing(
  result: { answer: MatAnswer; width: number } | undefined,
  from: From,
  unit: Unit,
): Drawing;
```

## Behavior

The server renders the calculator from a print, sizes empty, the border "2" with the 2 in chip pressed, the empty text and the example drawing (the catalog's 11x14 with its 8x10 mat). Chips, hints, the drawing's legend and its border tags carry both units in `<U>`; the fields, the answer and the drawing's `aria-label` are written in the visitor's unit. The unit is the site's (`useUnit`), not reducer state: a layout effect dispatches `unit` from the last unit it saw, starting at "in" because `INITIAL` holds inches, so the header switch, the calculator's switch and a client-side visit in cm all convert the fields. While a stored cm is pending, `[data-unit-pending] .mc-input` hides the server's inch digits.

`outcome` reads each field with `readLength` (centimetres ÷ 2.54), then asks `whyNoMat`: "narrow" marks the border, "room" marks the print side no bigger than two overlaps (from a print) or the border (from a frame), naming the first side the border closes. `describe` follows the canvas's option A: a print is named only when `printMatch` is a US standard size, a standard frame shows the matched frame's size with "That is the standard X." or "That is within ⅜ in of X.", borders come from `matBorders`. From a frame, the frame's own mat, or a pairing the engine lists in `preCut` for the print (the diploma's 11x14), folds into the print card.

One render serves both layouts: below 48rem one column in DOM order (fields, button, answer, drawing) with "Your answer" visually hidden; from 48rem a grid with the fields and the drawing on the left and the answer on the right. Every number in the page's formula, table, cases and questions comes from `matSizes`, `matBorders`, `CATALOG` and `DIPLOMA`; the cases throw at build time if the catalog stops giving one or two pre-cut frames or a custom size between two. Related tools are the live Frames pages other than F5, then PH2.

## Edge Cases

- Reverse after an answer carries the exact frame or print, not the matched standard, so Reverse twice returns the numbers typed.
- Switching in to cm and back rounds to the nearest eighth, so a value can move by up to 1⁄16 in.
- An empty or unreadable field is left as it is on a unit switch; "-10" reads as "above 0", "abc" as "Use a number".
- An 8.5x11 print with a 1½ in border gives a custom 11 × 13½ in frame (a uniform border cannot reach 14 in); with 1⅝ in it matches the 11x14.
- A standard print within ⅜ in of the largest print "fits" even when a little bigger (BL-116).
- The formula figure's `aria-label` is in inches only (BL-117).

## Requirements

### Requirement: The page follows the approved outline

The page SHALL hold, in order: breadcrumbs, the `h1`, the intro sentence, the calculator, "How to use the frame and mat calculator", "Frame and mat size formula" with the "Mat board sizes" table, "Frame sizes for common prints", "Questions about frame and mat sizes" and "Related tools", all in the server HTML.

#### Scenario: The heading outline of the server HTML

- **WHEN** `/frame-mat-calculator` is requested
- **THEN** the HTML has one `h1`, "Frame and Mat Size Calculator", and its `h2`s in order are "Frame and mat calculator", "How to use the frame and mat calculator", "Frame and mat size formula", "Frame sizes for common prints", "Questions about frame and mat sizes" and "Related tools"; the how-to holds four numbered steps with the `h3`s "Pick a direction", "Enter the width and height", "Pick a mat border" and "Read the answer"

### Requirement: The intro sentence names the head keyword

The paragraph under the `h1` SHALL say what the calculator does in one sentence holding "picture frame size calculator", and on a small phone the `h1`, that sentence and the top of the calculator SHALL show without scrolling.

#### Scenario: The intro in the server HTML

- **WHEN** `/frame-mat-calculator` is requested
- **THEN** the paragraph after the `h1` reads "A picture frame size calculator for framing a print with a mat: enter the print and the mat border to get the frame size and the mat opening, or start from a frame to find the print that fits."

#### Scenario: The first screen on a small phone

- **WHEN** the page is opened at 360 × 740
- **THEN** the `h1`, the intro and the calculator's title "Frame and mat calculator" are inside the first screen

### Requirement: The calculator starts from a print with a 2 inch border

The server HTML SHALL render the calculator from a print, with empty size fields, the mat border filled with 2 in and its chip pressed, no answer, and an example drawing.

#### Scenario: The calculator in the server HTML

- **WHEN** `/frame-mat-calculator` is requested
- **THEN** the calculator shows "You enter" "Print size", "You get" "Frame size", a "Reverse: start from a frame" button, empty "Print width" and "Print height" fields, a "Mat border" field holding "2" with the "2 in" chip pressed among "1½ in", "2 in", "2½ in" and "3 in", the button "Find my frame size", the text "Enter your print size and a mat border. The frame size and mat opening show here.", and a drawing captioned "Example: an 8x10 print in an 11x14 frame with a pre-cut mat."

### Requirement: The fields take inches with fractions, or centimetres

Each size and border field SHALL accept a whole number, a decimal with `.` or `,`, and in inches a fraction typed as `a/b`, `n a/b` or a glyph. In centimetres it SHALL take one decimal. The hint under the size fields SHALL say which.

#### Scenario: Three ways to type 8½

- **WHEN** the print width is typed as "8 1/2", "8.5" or "8½" in inches, with height 11 and border 2
- **THEN** each gives the same answer, a 12 × 14½ in frame, and the hint reads "Fractions work: 8 1/2, 8.5 or 8½."

#### Scenario: Centimetres

- **WHEN** the unit is cm
- **THEN** the hint reads "Centimetres, to one decimal, like 20.3." and the chips read "3.8 cm", "5.1 cm", "6.4 cm" and "7.6 cm"

### Requirement: The mat border chips set the border

Pressing a chip SHALL fill the border field with its width and press only that chip. A typed border SHALL press the chip of equal width, or none. The hint under the field SHALL say the border is the cut width and that the frame's lip covers about ¼ in (0.6 cm) of it.

#### Scenario: A chip and a typed border

- **WHEN** the visitor presses "2½ in", then types "1.75" in the border field
- **THEN** the field first reads "2½" with only "2½ in" pressed, then no chip is pressed; the hint reads "The cut width on each side. The frame's lip covers about ¼ in of it."

### Requirement: Switching the unit converts the numbers already typed

The in/cm switch in the calculator's head and the one in the site header SHALL set one unit for the page. Switching SHALL rewrite every field that holds a number, in centimetres to one decimal and in inches to the nearest eighth, and leave other text as it is.

#### Scenario: Inches to centimetres and back

- **WHEN** the fields hold 8, 10 and 2 in inches and the visitor switches to cm, then back to in
- **THEN** they read "20.3", "25.4" and "5.1", then "8", "10" and "2"

#### Scenario: The header switch

- **WHEN** the visitor switches the site header's unit to cm with 8, 10 and 2 typed
- **THEN** the calculator's own switch shows cm and its fields read "20.3", "25.4" and "5.1"

### Requirement: The answer shows after the button and then follows every edit

No answer SHALL show until the visitor presses the find button. After that the answer SHALL follow every edit of a field, a chip or the unit. "Start over" SHALL empty the size fields, set the border back to 2 in (5.1 cm) and remove the answer.

#### Scenario: The answer follows an edit

- **WHEN** the visitor enters 8 and 10, presses "Find my frame size", then changes the height to 14
- **THEN** the answer first names an 11½ × 13½ in frame, then an 11½ × 17½ in frame, with no second press

#### Scenario: Start over

- **WHEN** the visitor presses "Start over" after an answer with a 3 in border
- **THEN** both size fields are empty, the border reads "2" with "2 in" pressed, and the answer area shows the empty text

### Requirement: A standard frame answer says how it was found

When the frame a print needs is within ⅜ in of a US catalog size, the answer SHALL name that frame, give the frame size, the mat opening and how it was worked out, and a "Ready-made frame" card with the border that frame gives.

#### Scenario: A 5x7 print with a 1¾ inch border

- **WHEN** the visitor enters a 5 × 7 in print with a 1¾ in border and presses the button
- **THEN** the answer reads "Use an 8x10 frame.", "Frame size" 8 × 10 in (20.3 × 25.4 cm), "Mat opening" 4½ × 6½ in, and "The opening is your print less ¼ in on each side. The frame adds the 1¾ in border on each side: 8 × 10 in. That is the standard 8x10."; the "Ready-made frame" card names an 8x10 frame, "Mat border 1¾ in all round." and "Sold with this mat pre-cut, for a 5x7 print."

#### Scenario: A diploma-size print with a 1⅝ inch border

- **WHEN** the visitor enters an 8½ × 11 in print with a 1⅝ in border
- **THEN** the answer reads "Use an 11x14 frame.", "Frame size" 11 × 14 in, and "The opening is your print less ¼ in on each side. The frame adds the 1⅝ in border on each side: 11¼ × 13¾ in. That is within ⅜ in of 11x14."; the "Ready-made frame" card names an 11x14 frame, "Mat border 1½ in at the sides, 1¾ in at the top and bottom." and "Sold with this mat pre-cut, for an 8.5x11 print.", and an "Also sold with a pre-cut mat" card names a 12x16 frame, 2 in at the sides and 2¾ in at the top and bottom

### Requirement: A metric frame answer names the metric frame

When a metric frame (A4, A3, 30 × 40, 40 × 50 or 50 × 70 cm) is closer than any US size, the answer SHALL name it as a metric size, give its border in a "Metric frame" card, and list the frames sold with a pre-cut mat for the print, or say none is.

#### Scenario: A 12x16 print with a 2 inch border

- **WHEN** the visitor enters a 12 × 16 in print with a 2 in border
- **THEN** the answer reads "Use a 40 × 50 cm frame, a metric size.", the "Metric frame" card says "40 × 50 cm frames are sold in the US too. Have the mat cut for a 12x16 print.", and the pre-cut card says "No frame is sold with a pre-cut mat for a 12x16 print. Have one cut to size."

### Requirement: A custom frame answer offers the exact size and ready-made frames

When no standard or metric frame is within ⅜ in, the answer SHALL give, in order: "Order this size" with the exact frame; "Ready-made, with a pre-cut mat" with each pre-cut frame and its border; "Next size up" only when that frame is not pre-cut; and, for a near-square print, "Square frames" with the square above and the square below named as too small.

#### Scenario: An 8x10 print with a 2 inch border

- **WHEN** the visitor enters an 8 × 10 in print with a 2 in border
- **THEN** the answer reads "Your frame: 11½ × 13½ in. Not a standard size.", "Mat opening" 7½ × 9½ in, and its cards are "Order this size" (11½ × 13½ in, "Mat border 2 in all round."), "Ready-made, with a pre-cut mat" (11x14 frame, "Mat border 1¾ in at the sides, 2¼ in at the top and bottom.", "Sold with a mat cut for an 8x10 print."), "Next size up" (12x16 frame, 2¼ in at the sides, 3¼ in at the top and bottom) and "Square frames" (16x16 frame, 4¼ in at the sides, 3¼ in at the top and bottom, "10x10 is too small for this mat.")

#### Scenario: Two pre-cut frames, one the next size up

- **WHEN** the visitor enters a 16 × 20 in print with a 2 in border
- **THEN** the answer names a 19½ × 23½ in frame, the pre-cut card lists the 18x24 frame (1¼ in at the sides, 2¼ in at the top and bottom) and the 20x24 frame (2¼ in all round, "Also the next size up.") with "Both are sold with a mat cut for a 16x20 print.", and there is no "Next size up" card and no "Square frames" card

#### Scenario: A diploma-size print with a custom frame

- **WHEN** the visitor enters an 8½ × 11 in print with a 1½ in border
- **THEN** the answer reads "Your frame: 11 × 13½ in. Not a standard size.", the "Ready-made, with a pre-cut mat" card lists the 11x14 frame (1½ in at the sides, 1¾ in at the top and bottom, "Also the next size up.") and the 12x16 frame (2 in at the sides, 2¾ in at the top and bottom) with "Both are sold with a mat cut for an 8.5x11 print.", and there is no "Next size up" card and no "Square frames" card

#### Scenario: A landscape print

- **WHEN** the visitor enters a 10 × 8 in print with a 2 in border
- **THEN** the answer names a 13½ × 11½ in frame and the pre-cut card lists a 14x11 frame

### Requirement: A reverse answer gives the largest print and the frame's own mat

From a frame, the answer SHALL give the largest print, the mat opening and how they were worked out, then the standard or metric print that fits with its border (and the next print up as too big), then "Sold with this frame": the print the frame's own pre-cut mat takes, that the frame is usually sold without a mat, or that no frame this size comes with one.

#### Scenario: An 11x14 frame with a 2 inch border

- **WHEN** the visitor reverses to a frame, enters 11 × 14 in with a 2 in border and presses "Find the print that fits"
- **THEN** the answer reads "Largest print: 7½ × 10½ in. Not a standard print size.", "Mat opening" 7 × 10 in, "The opening is your frame less the 2 in border on each side. The print is ¼ in bigger on each side, under the mat."; the "Standard print that fits" card names a 5x7 print, "Mat border 3¼ in at the sides, 3¾ in at the top and bottom." and "The next print up, 8.5x11, is too big for a 2 in border."; the "Sold with this frame" card names an 8x10 print, 1¾ in at the sides and 2¼ in at the top and bottom, and "An 11x14 frame comes with a mat pre-cut for an 8x10 print."

#### Scenario: A frame whose own mat is the answer

- **WHEN** the visitor enters an 8 × 10 in frame with a 1¾ in border, from a frame
- **THEN** the answer reads "A 5x7 print fits.", its card says "Mat border 1¾ in all round." and "An 8x10 frame is sold with this mat pre-cut.", and there is no separate "Sold with this frame" card

#### Scenario: A metric frame size

- **WHEN** the visitor enters a 15¾ × 19¾ in frame with a 2 in border, from a frame
- **THEN** the answer names a 12x16 print and the "Sold with this frame" card says "No frame this size is sold with a pre-cut mat."

### Requirement: Reverse swaps the direction and carries the answer over

The Reverse button SHALL switch between "from a print" and "from a frame", changing the end labels, the field labels and the find button. After an answer it SHALL carry the exact frame or largest print over as the new sizes and keep the border; before an answer it SHALL keep the typed numbers.

#### Scenario: There and back

- **WHEN** the visitor gets the answer for an 8 × 10 in print with a 2 in border, presses Reverse, then presses Reverse again
- **THEN** after the first press the fields "Frame width" and "Frame height" read "11½" and "13½" and the answer reads "An 8x10 print fits."; after the second the fields "Print width" and "Print height" read "8" and "10" and the answer names an 11½ × 13½ in frame

#### Scenario: Reverse before an answer

- **WHEN** the visitor types 8 and 10 and presses Reverse without pressing the find button
- **THEN** "You enter" reads "Frame size", the fields read "8" and "10" under "Frame width" and "Frame height", the button reads "Find the print that fits", and no answer shows

### Requirement: Bad input marks the field and gets no answer

A field that is empty, not a number, not above 0, a border no wider than the mat's overlap, a print side no bigger than the overlap on both sides, or a border that leaves no opening in the frame SHALL be marked with its message after the find button. Focus SHALL move to the first marked field, and the answer area SHALL read "Check the marked fields, then try again."

#### Scenario: Empty fields

- **WHEN** the visitor presses "Find my frame size" with both size fields empty
- **THEN** "Print width" shows "Enter the print width.", "Print height" shows "Enter the print height.", both have `aria-invalid="true"`, and focus is on "Print width"

#### Scenario: Not a number, 0 or negative

- **WHEN** the print width is "abc", "0" or "-10" in inches
- **THEN** it shows "Use a number, like 8 or 8 1/2." for "abc" and "Enter a print width above 0 in." for "0" and "-10"

#### Scenario: A border of 0

- **WHEN** an 8 × 10 in print gets a border of 0
- **THEN** the border field shows "Enter a mat border above 0 in. With no mat, the frame is the print size." and no chip is pressed

#### Scenario: A border no wider than the overlap

- **WHEN** an 8 × 10 in print gets a border of 0.1 in, or 0.2 cm in centimetres
- **THEN** the border field shows "Enter a mat border above ¼ in. A narrower one leaves the frame no bigger than the print.", or in cm "Enter a mat border above 0.6 cm. A narrower one leaves the frame no bigger than the print."

#### Scenario: A print too small for the mat

- **WHEN** a print ½ in wide and 6 in tall gets a 2 in border
- **THEN** "Print width" shows "Enter a print width above ½ in. The mat covers ¼ in on each side."

#### Scenario: A border too wide for the frame

- **WHEN** a 4 × 6 in frame gets a 2 in border, from a frame
- **THEN** the border field shows "A 2 in border on each side leaves no opening in a frame 4 in wide. Pick a narrower border."

### Requirement: The answer is announced and drawn

The answer area SHALL be a polite live region. A drawing SHALL show the frame, the mat, the opening and the print's edge under the mat, as one image with a label that gives the frame, the borders and the opening, and a legend with the frame size, the mat opening, the print and the mat border.

#### Scenario: The drawing before an answer

- **WHEN** the calculator has no answer
- **THEN** the drawing shows an 8x10 print in an 11x14 frame, its legend reads "Frame size" 11 × 14 in, "Mat opening" 7½ × 9½ in, "Print, edge under the mat" 8 × 10 in and "Mat border, sides / top" 1¾ / 2¼ in

#### Scenario: The drawing of a custom answer

- **WHEN** the answer is for an 8 × 10 in print with a 2 in border
- **THEN** the drawing's label names an 11½ by 13½ in frame with a 2 in border at the sides and at the top and bottom and a 7½ by 9½ in opening, its legend's last row reads "Mat border" 2 in, and its caption reads "Drawn at the exact frame size."

### Requirement: A desktop shows the inputs beside the answer, a phone one column

At 768 px and wider the calculator SHALL show the direction, the fields and the drawing on the left and "Your answer" on the right. Below 768 px it SHALL be one column: the fields, the button, the answer, then the drawing. Nothing SHALL be wider than the screen.

#### Scenario: Desktop

- **WHEN** the page is opened at 1280 wide and an answer is shown
- **THEN** the answer's left edge is right of the fields' right edge, and the drawing is below the fields

#### Scenario: Phone

- **WHEN** the page is opened at 390 × 844 and an answer is shown
- **THEN** the answer is below the find button, the drawing is below the answer, and no element is wider than 390 px

### Requirement: The formula section gives the rules and the mat board sizes

The formula section SHALL give the three rules (from a print, from a frame, the mat opening) in the visitor's unit with worked examples, a drawing of an 8x10 print with a 2 in border, and a table titled "Mat board sizes" with every catalog frame sold with a pre-cut mat: frame, mat opening, print and mat border at the sides and top. A sentence under it SHALL name the frames usually sold without a mat.

#### Scenario: The rules in inches

- **WHEN** `/frame-mat-calculator` is requested
- **THEN** the section holds "frame = print − ½ in + 2 × mat border", "An 8x10 print with a 2 in mat: 8 − ½ + 4 = 11½ and 10 − ½ + 4 = 13½. The frame is 11½ × 13½ in.", "print = frame − 2 × mat border + ½ in" and "opening = print − ½ in"

#### Scenario: The rules in centimetres

- **WHEN** the unit is cm
- **THEN** the from-a-print rule reads "frame = print − 1.3 cm + 2 × mat border" and its example "An 8x10 print (20.3 × 25.4 cm) with a 5.1 cm mat needs a 29.2 × 34.3 cm frame."

#### Scenario: The table

- **WHEN** `/frame-mat-calculator` is requested
- **THEN** the "Mat board sizes" table has 15 rows, among them 11x14 with a 7½ × 9½ in opening, an 8x10 print and "1¾ / 2¼ in", and 20x20 with a 15½ × 15½ in opening, a 16x16 print and "2¼ in"; the text under it holds "frame mat sizes" and names 4x6, 8.5x11, 20x30 and 27x40 as usually sold without a mat

### Requirement: The common prints section answers three frame questions

"Frame sizes for common prints" SHALL answer what frame an 11x14 print, a 16x20 print and a diploma take: the frames sold with a pre-cut mat for each and their borders, and for the two prints the exact frame with a 2 in border cut to order.

#### Scenario: An 11x14 print

- **WHEN** `/frame-mat-calculator` is requested
- **THEN** the 11x14 case names a 16x20 frame with 2¾ in at the sides and 3¼ in at the top and bottom, and with a 2 in mat cut to order a 14½ × 17½ in frame, between 12x16 and 16x20

#### Scenario: A diploma

- **WHEN** `/frame-mat-calculator` is requested
- **THEN** the diploma case names an 11x14 frame with a mat cut for an 8.5x11 diploma, 1½ in at the sides and 1¾ in at the top and bottom, and a 12x16 frame with a pre-cut 8.5x11 mat, 2 in at the sides and 2¾ in at the top and bottom; no text on the page says "Unverified"

### Requirement: The questions answer in the server HTML

The page SHALL answer seven questions in its server HTML, the first open, with every size in both units from the engine.

#### Scenario: The seven questions

- **WHEN** `/frame-mat-calculator` is requested
- **THEN** the questions are "What size frame for 11x14 print do I need?", "What size frame for diploma certificates?", "How much bigger than the print is the frame?", "Why is the mat opening smaller than the print?", "How wide is a pre-cut mat?", "Does the frame cover part of the mat?" and "Can I use centimetres?", and the first answer is visible without a click

### Requirement: The shop block stays out until affiliate links are wired

The page SHALL hold no affiliate link and no "Where to buy" heading until T21 wires them.

#### Scenario: No affiliate links

- **WHEN** `/frame-mat-calculator` is requested
- **THEN** no link has a `rel` containing "sponsored" and no heading reads "Where to buy"

### Requirement: The page links only to live pages

Related tools SHALL list the live Frames pages other than F5, then PH2 when live, and SHALL be left out, heading included, while none is live.

#### Scenario: F1, F2, F3, F4, F5 and G1 are live

- **WHEN** `/frame-mat-calculator` is requested while only F1, F2, F3, F4, F5, G1 and the company pages are live
- **THEN** Related tools holds four cards, linking to `/`, `/frame-sizes-on-wall`, `/how-big-is-8x10` and `/measure-picture-frame` in that order; no link points to `/art-print-sizes`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4, F5, F6 and G1 are live

- **WHEN** `/frame-mat-calculator` is requested while only F1, F2, F3, F4, F5, F6, G1 and the company pages are live
- **THEN** Related tools holds five cards, linking to `/`, `/frame-sizes-on-wall`, `/how-big-is-8x10`, `/measure-picture-frame` and `/poster-frame-sizes` in that order; no link points to `/art-print-sizes`; and no `href` starts with `#`

### Requirement: The page carries its head values and breadcrumbs

The page SHALL take its title, `h1`, description and content date from its site map entry, carry breadcrumbs Home › Frame and mat calculator with a matching `BreadcrumbList`, and send its own 1200 × 630 social image with the alt "8x10 print in an 11½ × 13½ in frame with a 2 in mat and a 7½ × 9½ in opening".

#### Scenario: The head of the page

- **WHEN** `/frame-mat-calculator` is requested
- **THEN** the title is "Picture Frame & Mat Calculator | Frame Sizes", the canonical is `https://framesizes.app/frame-mat-calculator`, and `og:image:alt` is the alt above

#### Scenario: F5's breadcrumbs

- **WHEN** `/frame-mat-calculator` is requested
- **THEN** the breadcrumb `nav` holds "Home" linking to `/` and "Frame and mat calculator" as the current page, and the HTML holds one `BreadcrumbList` with the same two items and no `FAQPage` or `HowTo`

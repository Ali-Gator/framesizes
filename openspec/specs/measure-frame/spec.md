# measure-frame Specification

## Purpose

The F4 page, "Measure a picture frame" (`/measure-picture-frame`), and its wizard. The visitor measures the inside, the front opening, the mat opening or the outside of a frame they own, and the wizard names the standard, metric or custom size it is, or for a mat the print it holds and the frames sold with that mat.

## Public Interface

```typescript
// apps/web/src/app/measure-picture-frame/page.tsx: the page, prerendered; opengraph-image.tsx: its
// 1200 × 630 social image; measure-frame.css: the wizard's and the page's styles

// apps/web/src/components/measure-frame/measure-frame.tsx (client)
function MeasureFrame(): JSX.Element;

// apps/web/src/components/measure-frame/state.ts (pure)
type Kind = "inside" | "front" | "mat" | "outside";
type Field = "w" | "h" | "f"; // f: the moulding width, outside only
type Step = "pick" | "enter" | "result";
interface FieldState {
  text: string; // as typed
  eighths: number; // 0–7, added in inches only, and only to a whole number
}
interface State {
  step: Step;
  kind: Kind;
  fields: Record<Field, FieldState>;
  active: Field; // the field the eighths row sets
  submitted: boolean; // Find pressed: errors show, a desktop answer follows the fields
  kept: boolean; // back from an answer with the numbers kept
}
type Action =
  | { type: "pick"; kind: Kind }
  | { type: "enter" }
  | { type: "back" }
  | { type: "type"; field: Field; text: string }
  | { type: "eighth"; eighths: number }
  | { type: "focus"; field: Field }
  | { type: "blur"; field: Field; unit: Unit } // a typed fraction moves into the eighths
  | { type: "unit"; from: Unit; to: Unit } // converts every field
  | { type: "find"; unit: Unit }
  | { type: "change" } // back to the fields, kept
  | { type: "checkSpot" } // back to step 1, kept, not submitted
  | { type: "reset" };
const INITIAL: State;
function reducer(state: State, action: Action): State;
type Outcome =
  | { errors: Partial<Record<Field, string>> }
  | { answer: Identified; measured: Size; face?: number }; // inches
function outcome(state: State, unit: Unit): Outcome; // readLength, whyNoAnswer, identifyFrame
function fieldValue(state: State, field: Field, unit: Unit): number | undefined; // inches, above 0
function writeLength(inches: number, unit: Unit): string; // "1¼ in" | "3.2 cm"

// apps/web/src/components/measure-frame/answer.ts (pure)
function article(text: string): "a" | "an"; // "an" before 8, 11, 18, A
function writeIn(size: Size, unit: Unit): string; // "7½ × 9½ in" | "19.1 × 24.1 cm"
interface Answer {
  label: string; // "Frame size" | "Custom size" | "Print size"
  head: string;
  value: string;
  how: string;
  holds?: string;
  link?: { page: PageId; href: string; text: string }; // shown only while the page is live
  nearest?: readonly { id: string; text: string }[];
  mat?: { label: string; frames: readonly string[]; text: string };
}
function describe(
  result: { answer: Identified; measured: Size; face?: number },
  kind: Kind,
  unit: Unit,
): Answer;
function drawing(
  kind: Kind,
  unit: Unit,
  typed: { w?: number; h?: number; f?: number },
  result?: { answer: Identified; measured: Size; face?: number },
): Drawing; // boxes in percent of a 4:3 stage, tapes, label, caption, legend

// apps/web/src/components/measure-frame/diagram.tsx: the canvas's measuring drawings as inline SVG
type DiagramKind = "inside" | "front" | "mat" | "outside" | "back" | "result" | "xsec" | "round";
function Diagram(props: { kind: DiagramKind; decorative?: boolean }): JSX.Element;
```

## Behavior

The server renders step 1 with Inside chosen, empty fields, the eighths row wrapped in `.u-in` and the centimetre hint in `.u-cm`, "Enter both sides and press Find my frame size." and the example 8x10 drawing. The unit is the site's (`useUnit`), not reducer state: a layout effect dispatches `unit` when it changes, so the header toggle and the wizard's toggle (`fs-units`, the same pre-hydration look) convert the fields before the next paint.

One render serves both layouts. The root carries `data-step`; below 48rem CSS shows only that step's section and the controls whose `data-phone` names it, and `[data-desk-only]` text is hidden; from 48rem the choice, the fields and the answer show together and `[data-phone-only]` controls are hidden. `find` moves to `result` when the fields give an answer, else only sets `submitted`. A step change moves focus to its heading when `(max-width: 767px)` matches at the event, and "Check where to measure" and "Measure another frame" always move it to step 1's legend, since the button that had focus goes away. On Find with errors, focus moves to the first marked field.

`outcome` reads each field with `readLength` (centimetres divided by 2.54; inches plus the eighths when the text is a whole number), then `whyNoAnswer` (the moulding messages), then `identifyFrame`. `describe` writes the answer in one unit from the engine's answer and constants; the component writes it in the visitor's unit with the other unit's value under it. The cm allowance reads "about 1 cm" (⅜ in is 0.95 cm). The table's rows come from `frameMeasurements` over 4x6, 5x7, 8x10, 11x14, 16x20 and 24x36. Related tools are the live Frames pages other than F4, then PH1.

## Edge Cases

- A typed decimal that is not an eighth (8.3) is rounded to the nearest eighth on blur (8¼); centimetres are left as typed.
- Switching in to cm and back can move a value by up to 1⁄16 in; it stays inside the ⅜ in allowance.
- An empty or unreadable field is left as it is on a unit switch.
- A custom size whose side matches a catalog size reads "the same width" (or height), not "0 in narrower".
- A mat whose print no frame is sold with draws the frame at the print plus 3 in and lists only the mat opening and the print in the legend.
- A landscape metric answer writes its size from `w` and `h`, never from the upright `label`.
- The cross-section's accessible name gives both units, since CSS cannot switch an `aria-label`.

## Requirements

### Requirement: The page follows the approved outline

The HTML the server returns for `/measure-picture-frame` SHALL hold, in this order: the breadcrumbs, the single `h1`, the answer paragraph, the wizard titled "Measure your frame", the canvas's content sections under their `h2` headings, and "Related tools" (`h2`) while a related page is live.

#### Scenario: The heading outline of the server HTML

- **WHEN** `/measure-picture-frame` is requested
- **THEN** the response HTML holds the `h1` "How to Measure a Picture Frame", then the wizard title "Measure your frame", then the `h2` headings "How to measure picture frame size", "8x10 frame measurements and other sizes" and "Questions about frame dimensions" in that order
- **AND** a three-item ordered list of steps under the first of them, and one `h3` per question, six in all

### Requirement: The first paragraph answers with the frame's dimensions

The paragraph under the `h1` SHALL open with "Picture frame dimensions", say the frame size is the inside, name the four things the wizard can measure, and give an 8x10 frame's inside, front opening and outside in both units. On a 360 × 740 screen the `h1`, this paragraph and the wizard's first step title SHALL be visible without scrolling.

#### Scenario: The answer in the server HTML

- **WHEN** `/measure-picture-frame` is requested
- **THEN** the first paragraph after the `h1` starts with "Picture frame dimensions" and contains "8 × 10 in", "20.3 × 25.4 cm", "7½ × 9½ in", "19.1 × 24.1 cm", "10 × 12 in" and "25.4 × 30.5 cm"

#### Scenario: The first screen on a small phone

- **WHEN** the page is opened at 360 × 740
- **THEN** the `h1`, the answer paragraph and the wizard's "What are you measuring?" are inside the first screen

### Requirement: The wizard offers four measurements, inside first

Step 1 SHALL offer four choices as radio buttons, each with a drawing and one line: "Inside, at the back", marked "Most exact" and chosen when the page loads; "Front opening, no mat"; "Mat opening"; and "Outside, edge to edge". The drawings on the choices SHALL be hidden from assistive technology.

#### Scenario: The choices in the server HTML

- **WHEN** `/measure-picture-frame` is requested
- **THEN** the wizard holds four radio buttons named "Inside, at the back", "Front opening, no mat", "Mat opening" and "Outside, edge to edge" in that order, only the first is checked, and "Most exact" appears once, in the first

### Requirement: The sizes take whole inches and eighths, or centimetres

In inches each field SHALL take a number on the phone's number pad, and a row of eight buttons (0, ⅛, ¼, ⅜, ½, ⅝, ¾, ⅞) SHALL set the fraction of the field in use. A typed fraction, decimal, glyph or decimal comma SHALL be read too and, on leaving the field, moved into the eighths row. In centimetres the eighths row SHALL be hidden and a field takes one decimal.

#### Scenario: Eighths added to a whole number

- **WHEN** the visitor types 8 in Width and presses ⅛
- **THEN** Width reads 8⅛ in, the ⅛ button is pressed, and the answer uses 8.125 in

#### Scenario: A typed fraction

- **WHEN** the visitor types "8 1/8" in Width on a desktop and leaves the field
- **THEN** the field shows 8 and the ⅛ button is pressed

#### Scenario: Other typed forms

- **WHEN** the visitor types "8.125", "8⅛" or "8-1/8" in Width
- **THEN** each is read as 8.125 in, and "8,5" is read as 8.5

#### Scenario: Centimetres

- **WHEN** the unit is cm
- **THEN** no eighths row is shown, the fields hint "Centimetres, to one decimal, like 20.6.", and 20.6 is read as 20.6 cm

### Requirement: The outside choice asks for the moulding width

For "Outside, edge to edge" step 2 SHALL add a third field, "Moulding width", with the hint "Seen from the front: outer edge to the glass." and a "Rounded edge?" note that shows how to measure a rounded moulding flat from the front, not around the curve.

#### Scenario: The outside fields

- **WHEN** the visitor picks "Outside, edge to edge"
- **THEN** step 2 has the fields Width, Height and Moulding width, and a "Rounded edge?" control that opens the rounded-edge drawing and its text

### Requirement: Switching the unit converts the numbers already typed

The wizard SHALL have an in/cm toggle that sets the same unit as the site header's toggle. Switching SHALL convert every field: inches to centimetres at one decimal, centimetres to inches at the nearest eighth.

#### Scenario: Inches to centimetres and back

- **WHEN** Width reads 8⅛ in and the visitor switches to cm, then back to in
- **THEN** Width reads 20.6 cm, then 8⅛ in

#### Scenario: One unit for the page

- **WHEN** the visitor switches the wizard to cm
- **THEN** the site header's toggle shows cm and the page's other sizes show centimetres

### Requirement: A phone shows one step per screen

Below the site's 768 px breakpoint the wizard SHALL show one step at a time, headed "Step N of 3": the choice with "Enter the sizes", the fields with a Back button and "Find my frame size" ("Find my print size" for a mat), and the answer with "Change measurement" and "Measure another frame". Going back SHALL keep every number.

#### Scenario: Through the steps

- **WHEN** at 390 × 844 the visitor presses "Enter the sizes", enters 8⅛ and 10⅛ and presses "Find my frame size"
- **THEN** the wizard shows "Step 3 of 3", the answer and the buttons "Change measurement" and "Measure another frame"

#### Scenario: Back keeps the numbers

- **WHEN** the visitor presses "Change measurement" on the answer
- **THEN** step 2 shows the same numbers and "Your numbers are kept. Change what you need."

#### Scenario: Measure another frame

- **WHEN** the visitor presses "Measure another frame"
- **THEN** the wizard returns to step 1 with "Inside, at the back" chosen and every field empty

### Requirement: A desktop shows the steps and the answer together

At 768 px and wider the wizard SHALL show the choice and the fields side by side with the answer and the drawing, under "1. What are you measuring?", "2. Enter the sizes" and "3. Your answer". Before the first "Find my frame size" the answer SHALL read "Enter both sides and press Find my frame size."; after it, the answer SHALL follow every change.

#### Scenario: The answer follows the fields

- **WHEN** at 1280 the visitor enters 8 and 10, presses "Find my frame size", then changes Width to 11 and Height to 14
- **THEN** the answer reads "Your frame is an 11x14." without another press

### Requirement: Bad input marks the field and gets no answer

On "Find", each field that is empty, not a number or not above 0 SHALL show its own message, be marked invalid and get no answer, and focus SHALL move to the first marked field. An outside measurement the engine refuses SHALL mark the moulding field with the reason: too wide for the frame, or no wider than the lip.

#### Scenario: Empty fields

- **WHEN** the visitor presses "Find my frame size" with both fields empty
- **THEN** Width shows "Enter the width.", Height shows "Enter the height.", both have `aria-invalid="true"`, and focus is on Width

#### Scenario: Not a number, or 0

- **WHEN** Width is "abc" or 0 in inches
- **THEN** Width shows "Use a number, like 8 or 8 1/8." or "Enter a width above 0 in."

#### Scenario: A moulding too wide for the frame

- **WHEN** the outside is 10 × 12 in and the moulding 6 in
- **THEN** Moulding width shows "A 6 in moulding leaves no room for a picture in a frame 10 in wide. Measure it again from the front, from the outer edge to the glass."

#### Scenario: A moulding no wider than the lip

- **WHEN** the outside is 13 × 16 in and the moulding ¼ in
- **THEN** Moulding width shows a message naming the ¼ in moulding and the lip, and no answer is given

### Requirement: A standard size answer says how it was found

For a standard size the answer SHALL say "Your frame is a(n) <id>." (a landscape id adds "(landscape <upright id>)"), give the size in both units, say how the measurement became the frame size, say what the frame holds with and without a mat, and link to the size: 8x10 to "See 8x10 at actual size" on F3, any other size to its row in the frame size chart.

#### Scenario: The inside, slightly large

- **WHEN** the inside measures 8⅛ × 10⅛ in
- **THEN** the answer reads "Your frame is an 8x10.", shows "8 × 10 in" and "20.3 × 25.4 cm", says "You measured 8⅛ × 10⅛ in. Each side is within ⅜ in of the standard 8 × 10 in.", says it holds an 8x10 print with no mat or a 5x7 print with a pre-cut mat, and links to `/how-big-is-8x10`

#### Scenario: The front opening

- **WHEN** the front opening measures 7½ × 9½ in
- **THEN** the answer names the 8x10 and says the frame covers ¼ in of the picture on each side, so the inside is 8 × 10 in

#### Scenario: The outside

- **WHEN** the outside measures 10 × 12 in with a 1¼ in moulding
- **THEN** the answer names the 8x10 and says "10 × 12 in outside, less two 1¼ in mouldings, plus the ¼ in lip on each side, gives 8 × 10 in."

#### Scenario: A landscape frame

- **WHEN** the inside measures 10 × 8 in
- **THEN** the answer reads "Your frame is a 10x8 (landscape 8x10)." and shows "10 × 8 in"

#### Scenario: A size linked to the chart

- **WHEN** the answer is the 11x14
- **THEN** it links "Find 11x14 in the frame size chart" to `/?size=11x14`

### Requirement: A metric size answer names the metric frame

When the engine names a metric size, the answer SHALL say "Your frame is a(n) <name>, a metric size.", give it in the measured orientation in both units, name the US size that is close too when there is one, and link A4 and A3 to F3.

#### Scenario: An A4 frame

- **WHEN** the unit is cm and the inside measures 21.0 × 29.7 cm
- **THEN** the answer reads "Your frame is an A4, a metric size.", shows "21.0 × 29.7 cm", and links "Compare A4 and 8x10 at actual size" to `/how-big-is-8x10`

#### Scenario: A metric size with a US size close too

- **WHEN** the inside measures 30 × 40 cm
- **THEN** the answer names the 30 × 40 cm frame and says the 12x16 is close too but 30 × 40 cm is closer

### Requirement: A custom size answer names the closest standard sizes

For a custom size the answer SHALL say "No standard frame matches <size>.", explain the ⅜ in allowance, ask the visitor to check where they measured, list each nearest size the engine names with how much smaller or bigger it is, and offer "Check where to measure", which returns to step 1 with the numbers kept.

#### Scenario: A 9 × 12 frame

- **WHEN** the inside measures 9 × 12 in
- **THEN** the answer reads "No standard frame matches 9 × 12 in.", is labelled "Custom size", and under "Closest standard sizes" lists 8.5x11, "½ in narrower and 1 in shorter. Too small to fill your frame.", then 11x14, "Next size up: 2 in wider and 2 in taller. Your picture fits with a mat cut to size."

#### Scenario: A near-square frame

- **WHEN** the inside measures 9 × 9½ in
- **THEN** "Closest standard sizes" lists 5x7, 11x14, 8x8 and 10x10

#### Scenario: Check where to measure

- **WHEN** the visitor presses "Check where to measure"
- **THEN** the wizard shows step 1 with the numbers kept

### Requirement: A mat answer names the print and the frames sold with that mat

For a mat opening the answer SHALL be labelled "Print size", say "This mat holds a(n) <id> print." (or the print's size when it is not a standard print), and list the frames sold with that mat, or say that none is.

#### Scenario: One frame

- **WHEN** the mat opening measures 7½ × 9½ in
- **THEN** the answer reads "This mat holds an 8x10 print.", lists "11x14 frame", and says "Mats for an 8x10 print are sold in an 11x14 frame."

#### Scenario: Two frames

- **WHEN** the mat opening measures 15½ × 19½ in
- **THEN** the answer names the 16x20 print, lists "18x24 frame" and "20x24 frame", and says "To tell which one you have, measure the inside at the back."

#### Scenario: No pre-cut mat

- **WHEN** the mat opening measures 9 × 12 in
- **THEN** the answer reads "This mat holds a 9½ × 12½ in print." and says "No frame in our list is sold with a pre-cut mat this size. The mat was likely cut to order."

### Requirement: The answer is announced and drawn

The answer SHALL sit in a polite live region. A drawing SHALL show the frame from the back (inside) or the front (the rest), with a yellow tape where the visitor measures, as one image whose label names what is measured. Once there is an answer, a legend SHALL give the outside, the inside and the front or mat opening in both units, the measured one marked.

#### Scenario: The drawing before an answer

- **WHEN** the page loads
- **THEN** the drawing has `role="img"` and a label naming the back of the frame and the inside, and the caption reads "Example: an 8x10 frame. The yellow tape shows where to measure."

#### Scenario: The legend after an answer

- **WHEN** the answer is the 8x10 from the inside
- **THEN** the legend lists the outside with a 1¼ in moulding as 10 × 12 in, the inside as 8 × 10 in and the front opening as 7½ × 9½ in, with the inside marked

### Requirement: The table gives six frames' four measurements

Under "8x10 frame measurements and other sizes" a table titled "Picture frame dimensions by size" SHALL list 4x6, 5x7, 8x10, 11x14, 16x20 and 24x36 with the inside, front opening, outside with a 1¼ in moulding and mat opening in both units, and the print the mat holds, or "—" where no pre-cut mat is sold.

#### Scenario: The 8x10 row

- **WHEN** `/measure-picture-frame` is requested
- **THEN** the 8x10 row reads 8 × 10 in, 7½ × 9½ in, 10 × 12 in, 4½ × 6½ in and "5x7 print", with 20.3 × 25.4 cm beside the first

#### Scenario: A frame with no pre-cut mat

- **WHEN** `/measure-picture-frame` is requested
- **THEN** the 4x6 row's mat opening and mat print are "—"

### Requirement: The questions answer in the server HTML

"Questions about frame dimensions" SHALL hold six questions, the first open: inside or outside, why the opening is smaller, with the mat or without, the frame for an 8x10 photo, a frame matching no size, and a rounded edge. Their sizes SHALL come from the size engine.

#### Scenario: The six questions

- **WHEN** `/measure-picture-frame` is requested
- **THEN** the HTML holds the six questions as `h3` headings, each answer in the HTML, and the first is open

### Requirement: The shop block stays out until affiliate links are wired

The page SHALL hold no affiliate link and no "Where to buy" section until T21 adds them.

#### Scenario: No affiliate links

- **WHEN** `/measure-picture-frame` is requested
- **THEN** no link has a `rel` containing "sponsored" and no heading reads "Where to buy"

### Requirement: The page links only to live pages

Related tools SHALL list the live Frames pages other than F4, then PH1 when live, and SHALL be left out, heading included, while none is live. A link from the answer SHALL point only to a live page.

#### Scenario: F1, F2, F3, F4 and G1 are live

- **WHEN** `/measure-picture-frame` is requested while only F1, F2, F3, F4, G1 and the company pages are live
- **THEN** Related tools holds three cards, linking to `/`, `/frame-sizes-on-wall` and `/how-big-is-8x10` in that order; no link points to `/photo-print-sizes`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4, F5 and G1 are live

- **WHEN** `/measure-picture-frame` is requested while only F1, F2, F3, F4, F5, G1 and the company pages are live
- **THEN** Related tools holds four cards, linking to `/`, `/frame-sizes-on-wall`, `/how-big-is-8x10` and `/frame-mat-calculator` in that order; no link points to `/photo-print-sizes`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4, F5, F6 and G1 are live

- **WHEN** `/measure-picture-frame` is requested while only F1, F2, F3, F4, F5, F6, G1 and the company pages are live
- **THEN** Related tools holds five cards, linking to `/`, `/frame-sizes-on-wall`, `/how-big-is-8x10`, `/frame-mat-calculator` and `/poster-frame-sizes` in that order; no link points to `/photo-print-sizes`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4, F5, F6, F7 and G1 are live

- **WHEN** `/measure-picture-frame` is requested while only F1, F2, F3, F4, F5, F6, F7, G1 and the company pages are live
- **THEN** Related tools holds six cards, linking to `/`, `/frame-sizes-on-wall`, `/how-big-is-8x10`, `/frame-mat-calculator`, `/poster-frame-sizes` and `/frame-mockup` in that order; no link points to `/photo-print-sizes`; and no `href` starts with `#`

### Requirement: The page carries its head values and breadcrumbs

The page SHALL take its title, `h1`, description and content date from its site map entry, carry breadcrumbs Home › Measure a picture frame with a matching `BreadcrumbList`, and send its own 1200 × 630 social image with the alt "8x10 picture frame with its inside, front opening and outside measured".

#### Scenario: The head of the page

- **WHEN** `/measure-picture-frame` is requested
- **THEN** the title is "How to Measure Picture Frame Dimensions | Frame Sizes", the canonical is `https://framesizes.app/measure-picture-frame`, and `og:image:alt` is the alt above

#### Scenario: F4's breadcrumbs

- **WHEN** `/measure-picture-frame` is requested
- **THEN** the breadcrumb `nav` holds "Home" linking to `/` and "Measure a picture frame" as the current page, and the HTML holds one `BreadcrumbList` with the same two items and no `FAQPage` or `HowTo`

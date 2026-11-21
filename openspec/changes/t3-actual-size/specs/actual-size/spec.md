# Spec Delta

## Purpose

The F3 page, "How big is 8x10" (`/how-big-is-8x10`), and its actual size viewer: seven frame sizes drawn at 1:1 on the visitor's screen once its scale is checked with a credit card, a ruler, a sheet of paper or the screen's size, with a map of the whole frame beside the part the screen holds.

## ADDED Requirements

### Requirement: The page follows the approved outline

The HTML the server returns for `/how-big-is-8x10` SHALL hold, in this order: the breadcrumbs, the single `h1`, the answer paragraph, the viewer titled "8x10 at actual size", the canvas's content sections under their `h2` headings, and "Related tools" (`h2`) while a related page is live.

#### Scenario: The heading outline of the server HTML

- **WHEN** `/how-big-is-8x10` is requested
- **THEN** the response HTML holds the `h1` "How Big Is 8x10?", then the viewer title "8x10 at actual size", then the `h2` headings "How to see a frame size at actual size", "How big is 8x10 next to things you know", "8x10 picture frame sizes compared" and "Questions about frame sizes" in that order
- **AND** a three-item ordered list of steps under the first of them, and one `h3` per question, six in all

### Requirement: The first paragraph answers how big 8x10 is

The paragraph under the `h1` SHALL give 8x10 in inches and in centimetres, compare it with a Letter sheet, and say how the box below shows it at its real size. On a 360 × 740 screen the `h1`, this paragraph and the top of the viewer SHALL be visible without scrolling.

#### Scenario: The answer in the server HTML

- **WHEN** `/how-big-is-8x10` is requested
- **THEN** the first paragraph after the `h1` contains "8 by 10 inches", "20.3 × 25.4 cm" and "Letter"

#### Scenario: The first screen on a small phone

- **WHEN** the page is opened at 360 × 740
- **THEN** the `h1`, the answer paragraph and the viewer's title are inside the first screen

### Requirement: The viewer offers seven sizes and opens on 8x10

The viewer SHALL offer 4x6, 5x7, 8x10, 11x14, 16x20, A4 and A3, in that order, as pressable buttons, with 8x10 pressed when the page loads. It SHALL NOT offer a way to turn a size. On a phone the buttons SHALL sit in rows without sideways scrolling.

#### Scenario: The size buttons in the server HTML

- **WHEN** `/how-big-is-8x10` is requested
- **THEN** the viewer holds seven size buttons, "4×6", "5×7", "8×10", "11×14", "16×20", "A4" and "A3", and only "8×10" has `aria-pressed="true"`

#### Scenario: No sideways scroll on a phone

- **WHEN** the page is opened at 360 × 740
- **THEN** every size button is fully inside the viewer's width

### Requirement: Every size shows in the visitor's unit

The viewer SHALL write the picked size in the unit the header's toggle shows, in centimetres to one decimal, and the rulers SHALL count in that unit.

#### Scenario: 8x10 in centimetres

- **WHEN** the visitor picks centimetres
- **THEN** the viewer reads "20.3 × 25.4 cm" and the rulers are numbered in centimetres

#### Scenario: A4 in inches

- **WHEN** the visitor picks A4 in inches
- **THEN** the viewer reads "8.3 × 11.7 in"

### Requirement: The phone answer step comes first

On a phone the viewer SHALL first show, on one screen: the size buttons, the picked size, how many phone screens wide and tall it is, a map of the whole size with the phone's outline at the same scale, a "See <size> at actual size" button, and the scale status with a link to check it.

#### Scenario: 8x10 on a 6.1 in phone

- **WHEN** the viewer is on a phone whose screen is 393 × 852 CSS px with a scale of 153.8 px per inch
- **THEN** it says "About 3.1 phone screens wide and 1.8 tall" and shows "See 8x10 at actual size"

#### Scenario: A size smaller than the phone

- **WHEN** a size fits inside the phone's screen both ways
- **THEN** the line says "It fits on your phone's screen."

### Requirement: The first look at actual size asks for a check

On a phone, tapping "See <size> at actual size" while the scale is unchecked SHALL open the check step first and SHALL open the actual-size view after the check is done or skipped. With a checked scale it SHALL open the actual-size view at once.

#### Scenario: Unchecked

- **WHEN** the visitor taps "See 8x10 at actual size" with no saved check
- **THEN** the check step opens, and after "Done, it matches" the actual-size view of 8x10 opens

#### Scenario: Skipping the check

- **WHEN** the visitor taps "Skip, use the guess" in the check step
- **THEN** the actual-size view opens and labels its scale as a guess

### Requirement: The card check matches one edge of a credit card

The card check SHALL draw two vertical lines a credit card's short edge apart (53.98 mm) at the current scale, a slider and minus and plus buttons that move the right line, and a picture with three steps of how to hold the card. "Done, it matches" SHALL save the scale. On a phone the step SHALL fit one screen.

#### Scenario: Matching the card

- **WHEN** the lines are 332.0 px apart and the visitor taps "Done, it matches"
- **THEN** the saved scale is 332.0 ÷ (53.98 ÷ 25.4) ≈ 156.2 px per inch, and the status reads "Checked with a card"

#### Scenario: The step on a small phone

- **WHEN** the card check is open at 360 × 740 with the viewer's title at the top of the screen
- **THEN** the picture, the two lines, the slider and "Done, it matches" are all inside the screen

### Requirement: A ruler can check the scale

The check SHALL offer a ruler: on a phone as "Have a ruler? Use it instead" under the card step, on a desktop as a tab. It SHALL draw two lines whose distance is 2 in or 5 cm on a phone and 5 in or 12 cm on a desktop, in the visitor's unit, with the same slider and "Done, it matches".

#### Scenario: A ruler on a phone in centimetres

- **WHEN** the visitor opens the ruler check on a phone with centimetres picked
- **THEN** the step asks to slide until the right line is at 5 cm, and the lines are 5 ÷ 2.54 in apart at the current scale

### Requirement: The screen size can set the scale

The check SHALL let the visitor pick the screen's diagonal from a list or type it, and SHALL set the scale to the screen's diagonal in CSS pixels divided by that length. The list SHALL be 5.4, 6.1, 6.3, 6.7 and 6.9 in on a phone and 13.3, 14, 15.6, 21.5, 23, 24, 27 and 32 in on a desktop.

#### Scenario: A 6.1 in phone

- **WHEN** a phone whose screen is 393 × 852 CSS px picks 6.1 in
- **THEN** the scale is √(393² + 852²) ÷ 6.1 ≈ 153.8 px per inch

#### Scenario: A length that is not a number

- **WHEN** the visitor types "abc" or 0 as the screen size
- **THEN** the scale stays as it was

### Requirement: A sheet of paper is offered only where it fits

On a desktop the check SHALL offer a Letter or A4 sheet matched along its short edge (8.5 in or 210 mm) only when that edge fits across the box at the guessed scale. A phone SHALL never offer the sheet.

#### Scenario: A monitor

- **WHEN** the box is 1,038 px wide and the guessed scale is 95.8 px per inch
- **THEN** the "Sheet of paper" tab is offered

#### Scenario: A 13 in laptop

- **WHEN** the box is 1,038 px wide and the guessed scale is 125.2 px per inch
- **THEN** no "Sheet of paper" tab is offered, and the card and ruler tabs are

### Requirement: The scale is a guess until checked

Before any check the viewer SHALL draw sizes at a guessed scale, show "Scale is a guess" with the warning style, and label the drawing "Approximate: scale not checked". After a check it SHALL show "Checked with <a card | a ruler | a sheet | screen size>" with the success style and label the drawing "Actual size".

#### Scenario: First visit

- **WHEN** the viewer loads with no saved check
- **THEN** it shows "Scale is a guess" and the drawing's label reads "Approximate: scale not checked"

### Requirement: A check is kept on the device for the same screen

A check SHALL be saved in the browser with the screen's CSS width and height and its device pixel ratio, and SHALL be used on a later visit only while the screen's shorter side, longer side and pixel ratio are the same, so turning a phone keeps it. Nothing about the check SHALL leave the device.

#### Scenario: The same phone tomorrow

- **WHEN** the visitor returns on the same screen
- **THEN** the viewer opens with the saved scale and "Checked with a card"

#### Scenario: A turned phone

- **WHEN** the check was made at 393 × 852 CSS px and the screen now reports 852 × 393 at the same pixel ratio
- **THEN** the viewer opens with the saved scale

#### Scenario: A new pixel ratio

- **WHEN** the saved check was made at a pixel ratio of 2 and the page now runs at 3
- **THEN** the viewer ignores it and shows "Scale is a guess"

### Requirement: The phone shows the size at 1:1 over the whole screen

On a phone the actual-size view SHALL cover the viewport with a bar holding the size and a Close button, the size drawn at the scale from its top-left corner with rulers along the top and the left, a mini map whose dashed box follows the part on screen, and "Drag to see the rest" while the size does not fit. Close SHALL return to the answer step.

#### Scenario: 16x20 on a phone

- **WHEN** the visitor opens 16x20 at actual size on a 390 × 700 viewport
- **THEN** the view shows the top-left part of the 16 × 20 in drawing with rulers, "Drag to see the rest" and the mini map

#### Scenario: Panning

- **WHEN** the visitor drags the drawing 2 in to the left
- **THEN** the mini map's dashed box moves 2 in to the right at the map's scale

### Requirement: Pinch zoom cannot pass as actual size

In the phone's actual-size view, pinch zoom SHALL be blocked; where the browser zooms anyway, the view SHALL say the page is zoomed and the size is off until the zoom is undone.

#### Scenario: Zoomed in

- **WHEN** the visual viewport's scale is not 1 in the actual-size view
- **THEN** the view shows "Zoomed in, the size is off"

### Requirement: The desktop box shows the size at 1:1

On a desktop the viewer SHALL show, on one screen: the size buttons, the scale status with its check buttons, a scrolling box with the size at the scale and rulers, the size, how much of it the box shows, and a map of the whole size with the box's part dashed. The check SHALL open inline above the box, without leaving the page.

#### Scenario: 8x10 on a monitor

- **WHEN** 8x10 is drawn at 95.8 px per inch in a box 1,038 × 560 px with 24 px rulers
- **THEN** the viewer says the box shows "8 × 5.6 in" of it and "Scroll the box to see the rest"

### Requirement: The comparison table and drawing come from the size engine

The section "8x10 picture frame sizes compared" SHALL draw the seven sizes from one shared corner at one scale with 8x10 filled, and list them by area with each size in the visitor's unit and its area as a multiple of 8x10 to one decimal.

#### Scenario: The table in the server HTML

- **WHEN** `/how-big-is-8x10` is requested
- **THEN** the table's rows are 4x6, 5x7, 8x10, A4, 11x14, A3 and 16x20 with areas 0.3×, 0.4×, 1×, 1.2×, 1.9×, 2.4× and 4×

### Requirement: The shop block stays out until affiliate links are wired

The page SHALL NOT show a "Where to buy" section or any affiliate link until the affiliate programs (T21) are wired.

#### Scenario: No affiliate links

- **WHEN** `/how-big-is-8x10` is requested
- **THEN** the response HTML holds no link with `rel` containing "sponsored"

### Requirement: The page links only to live pages

Related tools SHALL list the live Frames pages other than F3, then PH1, Q2 and G1 when live, and SHALL be left out, heading included, while none is live. Links to the frame size chart (`/`) SHALL always appear.

#### Scenario: F1, F2, F3 and G1 are live

- **WHEN** `/how-big-is-8x10` is requested while only F1, F2, F3, G1 and the company pages are live
- **THEN** Related tools holds three cards, linking to `/`, `/frame-sizes-on-wall` and `/gallery-wall-planner`; no link points to `/photo-print-sizes` or `/dpi-checker`; and no `href` starts with `#`

### Requirement: The page carries its head values and breadcrumbs

The page SHALL take its title, `h1`, description and content date from its site map entry, carry breadcrumbs Home › How big is 8x10 with a matching `BreadcrumbList`, and send its own 1200 × 630 social image with the alt "8x10 frame compared with 11x14, 16x20, A4 and A3 frames at the same scale".

#### Scenario: The head of the page

- **WHEN** `/how-big-is-8x10` is requested
- **THEN** the title is "How Big Is 8x10? See It at Actual Size | Frame Sizes", the canonical is `https://framesizes.app/how-big-is-8x10`, and `og:image:alt` is the alt above

#### Scenario: F3's breadcrumbs

- **WHEN** `/how-big-is-8x10` is requested
- **THEN** the breadcrumbs read Home › How big is 8x10, the last item is the current page, and one `BreadcrumbList` holds the same two items

### Requirement: The viewer is accessible

Every size button, check tab, slider, link and Close SHALL be a native control with a name; the drawing's box SHALL be focusable and named for the size; the readout SHALL announce changes politely; and the phone's actual-size view SHALL be a modal dialog that Escape closes.

#### Scenario: Keyboard only

- **WHEN** a keyboard user tabs through the viewer and presses Enter on "8×10" and then on "See 8x10 at actual size" with a checked scale
- **THEN** the actual-size view opens as a dialog with focus on Close, and Escape returns focus to the button

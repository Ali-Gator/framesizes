## MODIFIED Requirements

### Requirement: The table is the size chooser

Each visible row SHALL hold a radio button named by its size, all in one group, so that the group is one tab stop and the arrow keys move the selection. Selecting a row, by pointer anywhere on the row or by keyboard, SHALL update the preview at once. When the widget is narrower than 600px, the table SHALL show each row as one block as wide as the table's box, at least 44px tall and of the same height in inches and in centimetres, giving the size, the size in the other unit, the image with a mat (or "No mat") and the common use, with a visible radio mark; the table SHALL NOT scroll sideways.

#### Scenario: A row is clicked

- **WHEN** the visitor clicks the common-use cell of the 11x14 row
- **THEN** the 11x14 radio is checked and the drawing is named "11x14 picture frame at true scale next to a three-seat sofa"

#### Scenario: The selection is moved with the keyboard

- **WHEN** the selected radio has focus and the visitor presses the down arrow
- **THEN** the next row's radio is checked and focused, and the drawing shows that size

#### Scenario: The rows on a phone

- **WHEN** `/` is opened at 390 × 664
- **THEN** every visible row is at least 44 px tall and as wide as the table's box, the table's box does not scroll sideways, and the 27x40 row is as tall with centimetres selected as with inches

#### Scenario: A row is tapped on a phone

- **WHEN** at 390 × 664 the visitor taps the mat line of the 11x14 row
- **THEN** the 11x14 radio is checked

### Requirement: The all-sizes view compares every listed size

In the "All sizes" view the widget SHALL draw every size of the current list as nested outlines from one corner at one scale, highlight the selected size, hide the reference choice, and, when the drawing is clicked, select the size whose top-right corner is nearest the click; a click more than 3 in (drawn scale) from every top-right corner SHALL select nothing. The drawing SHALL be named "Standard frame sizes chart from <smallest> to <largest> inches, <selected> highlighted".

#### Scenario: The view is switched

- **WHEN** the visitor chooses "All sizes"
- **THEN** the drawing is named "Standard frame sizes chart from 4x6 to 27x40 inches, 16x20 highlighted" and the "Next to" control is not shown

#### Scenario: An outline is clicked

- **WHEN** the visitor clicks the 24x36 outline
- **THEN** the 24x36 radio in the table is checked

#### Scenario: A click near a small outline's corner

- **WHEN** the visitor clicks 0.2 in (drawn scale) above and to the right of the 8.5x11 outline's top-right corner
- **THEN** the 8.5x11 radio is checked

#### Scenario: A click far from every corner

- **WHEN** the visitor clicks more than 3 in (drawn scale) from every outline's top-right corner
- **THEN** the selection does not change

### Requirement: The six most common sizes are drawn at one scale

The page SHALL show the six most common sizes as six frames drawn at one scale from the size engine, each labelled with its size in inches, in centimetres and its common use. From a viewport width of 640px the six frames SHALL stand on one baseline; below it they SHALL stand in two rows of three (4x6, 5x7, 8x10, then 11x14, 16x20, 24x36), each row on its own baseline with its labels under it, and the block SHALL NOT scroll sideways. The drawing's accessible name SHALL be "Six common picture frame sizes from 4x6 to 24x36 inches compared at the same scale".

#### Scenario: The frames are in proportion

- **WHEN** the six frames are measured on the page
- **THEN** the 24x36 frame is six times as wide and six times as tall as the 4x6 frame, within one pixel

#### Scenario: The labels come from the engine

- **WHEN** `/` is requested
- **THEN** the response HTML labels the fourth frame "11×14" and "27.9 × 35.6 cm"

#### Scenario: The six sizes on a phone

- **WHEN** `/` is opened at 390 × 664
- **THEN** the 4x6, 5x7 and 8x10 frames share one baseline, the 11x14, 16x20 and 24x36 frames share a lower one, the 24x36 frame is six times as wide as the 4x6 frame within one pixel, and the block does not scroll sideways

## ADDED Requirements

### Requirement: The widget's controls are thumb-sized on a phone

When the widget is narrower than 600px, the Orientation, Preview and Next to controls SHALL each be at least 44px tall and each SHALL fill a row as wide as the widget's content (Next to sharing its row with its visible label), and at a viewport width of 360px neither the widget nor the page SHALL scroll sideways.

#### Scenario: The filters on a phone

- **WHEN** `/` is opened at 390 × 664
- **THEN** the Orientation, Preview and Next to controls are each at least 44 px tall, and the Orientation and Preview controls, and the Next to row, are each as wide as the widget's content

#### Scenario: The narrowest phone

- **WHEN** `/` is opened at 360 × 640
- **THEN** the document does not scroll sideways and no element inside the widget scrolls sideways

## MODIFIED Requirements

### Requirement: The six most common sizes are drawn at one scale

The page SHALL show the six most common sizes as six frames drawn at one scale from the size engine, each labelled with its size in inches and its common use, and, when the visitor's unit is centimetres, with its size in centimetres. The response HTML SHALL hold the centimetre label of every frame whatever the unit. From a viewport width of 640px the six frames SHALL stand on one baseline; below it they SHALL stand in two rows of three (4x6, 5x7, 8x10, then 11x14, 16x20, 24x36), each row on its own baseline with its labels under it, and the block SHALL NOT scroll sideways. The drawing's accessible name SHALL be "Six common picture frame sizes from 4x6 to 24x36 inches compared at the same scale".

#### Scenario: The frames are in proportion

- **WHEN** the six frames are measured on the page
- **THEN** the 24x36 frame is six times as wide and six times as tall as the 4x6 frame, within one pixel

#### Scenario: The labels come from the engine

- **WHEN** `/` is requested
- **THEN** the response HTML labels the fourth frame "11×14" and "27.9 × 35.6 cm"

#### Scenario: The six sizes on a phone

- **WHEN** `/` is opened at 390 × 664
- **THEN** the 4x6, 5x7 and 8x10 frames share one baseline, the 11x14, 16x20 and 24x36 frames share a lower one, the 24x36 frame is six times as wide as the 4x6 frame within one pixel, and the block does not scroll sideways

#### Scenario: The cm line follows the unit

- **WHEN** `/` is opened with inches selected, and then the visitor selects "cm"
- **THEN** with inches the fourth frame shows "11×14" and no visible "27.9 × 35.6 cm", and with centimetres it shows "27.9 × 35.6 cm"

### Requirement: The frame anatomy example is computed

The page SHALL explain the four measurements of a framed photo with an 8x10 image in an 11x14 frame, taking the outside size, the mat opening and the mat's overlap from the size engine, beside a drawing named "8x10 photo with a mat in an 11x14 frame: moulding, mat, mat opening and photo". Each measurement and the overlap SHALL be shown in the visitor's unit, and the response HTML SHALL hold both units.

#### Scenario: The four measurements

- **WHEN** `/` is requested
- **THEN** the response HTML lists Outside size "13 × 16 in", Frame size "11 × 14 in", Mat opening "7.5 × 9.5 in" and Image size "8 × 10 in"

#### Scenario: The four measurements in centimetres

- **WHEN** `/` is opened and the visitor selects "cm"
- **THEN** the visible measurements read "33 × 40.6 cm", "27.9 × 35.6 cm", "19.1 × 24.1 cm" and "20.3 × 25.4 cm", the overlap reads "0.6 cm smaller", and no inch measurement is visible in the example

### Requirement: The page says where its sizes come from

Under the widget the page SHALL state the height of the drawn wall in the visitor's unit ("8 ft" in inches, "244 cm" in centimetres), name the source of the sizes, and show the month and year the size data was last checked, taken from the size engine's check record. The response HTML SHALL hold both forms of the wall height.

#### Scenario: The proof line

- **WHEN** `/` is requested
- **THEN** the widget's footer in the response HTML contains "8 ft", "244 cm" and "last checked" followed by the month and year of the engine's check date

#### Scenario: The wall height follows the unit

- **WHEN** `/` is opened with inches selected, and then the visitor selects "cm"
- **THEN** the footer shows "8 ft" and not "244 cm" with inches, and "244 cm" and not "8 ft" with centimetres

## ADDED Requirements

### Requirement: The page's static numbers show the stored unit from first paint

A visitor whose stored unit is centimetres SHALL see the six common sizes, the anatomy example and the wall height in centimetres from the first paint, without an inch form showing first.

#### Scenario: A stored unit at load

- **WHEN** a visitor whose stored unit is centimetres opens `/` with JavaScript bundles not yet run
- **THEN** the anatomy example shows "33 × 40.6 cm" and the footer shows "244 cm", and no inch measurement of the example is visible

### Requirement: The phone preview shows the whole drawing

In the phone layout, when the preview's stage is wider than 345px, the stage SHALL grow to the drawing's own aspect ratio so that no part of the drawing is cut off at the top or bottom, as far as a pinned preview's bottom edge stays in the upper half of the viewport. Up to a stage width of 345px the stage SHALL stay 184px tall. A pinned preview SHALL NOT cover the row that has keyboard focus at any phone width.

#### Scenario: A tall frame on a wide phone

- **WHEN** `/?size=27x40` is opened at 430 × 932 and at 620 × 800
- **THEN** the drawn 27x40 frame and each dimension label lie inside the preview's stage

#### Scenario: The smallest outline on a wide phone

- **WHEN** `/?view=all` is opened at 620 × 800
- **THEN** the 4x6 outline lies inside the preview's stage

#### Scenario: A wide phone keeps the preview in the upper half

- **WHEN** `/` is opened at 620 × 800 and the last table row is scrolled into view
- **THEN** the preview is inside the viewport and its bottom edge is in the upper half

#### Scenario: Keyboard focus on a wide phone

- **WHEN** at 620 × 800 the visitor moves the selection down the table with the arrow keys to the last row
- **THEN** each focused row is fully visible below the preview

#### Scenario: A narrow phone is unchanged

- **WHEN** `/` is opened at 390 × 664
- **THEN** the preview's stage is 184 px tall

### Requirement: The drawings' labels are legible on a capped one-column stage

In the one-column layout, where the preview's stage is capped by the viewport's height to 520px wide or less, the wall drawing's dimension labels and the all-sizes outline labels SHALL be drawn at least 12px tall on screen.

#### Scenario: Labels at 800 × 600

- **WHEN** `/` is opened at 800 × 600, in the wall view and then in the "All sizes" view
- **THEN** each dimension label and each outline label renders at a font size of at least 12 px

### Requirement: The selected size stays marked in forced colors

When the browser forces its own colours, the selected row of the size table SHALL carry a visible outline or border that unselected rows do not, and in the phone layout the selected row's radio SHALL look different from the others.

#### Scenario: The table in forced colors

- **WHEN** `/` is opened with forced colors active at 1280 × 800
- **THEN** the selected row has an outline or border and an unselected row has none

#### Scenario: The phone rows in forced colors

- **WHEN** `/` is opened with forced colors active at 390 × 664
- **THEN** the checked radio's computed fill differs from an unchecked radio's, and the selected row has an outline or border that an unselected row does not

## MODIFIED Requirements

### Requirement: The all-sizes view compares every listed size

In the "All sizes" view the widget SHALL draw every size of the current list as nested outlines from one corner at one scale, highlight the selected size, hide the reference choice, and, when the drawing is clicked, select the size whose top-right corner is nearest the click; a click more than 3 in (drawn scale) from every top-right corner SHALL select nothing. The drawing SHALL be named "Standard frame sizes chart from <smallest> to <largest> inches, <selected> highlighted".

Each outline's label SHALL sit under the outline's top edge, ending near its top-right corner; a label too wide for the room left of that corner SHALL start at the outlines' shared left edge instead, so no label starts outside the drawing. No two labels SHALL overlap, measured as text boxes at the largest label size the widget draws. The selected size SHALL always carry its label, and with no size selected every major size SHALL carry one.

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

#### Scenario: Labels stay inside the drawing and apart

- **WHEN** the drawing is laid out for any size of the portrait, landscape or square list, in inches and in centimetres
- **THEN** the selected size's label comes first, every label starts at or right of the outlines' left edge, and no two labels' text boxes overlap

#### Scenario: A label wider than its outline on a phone

- **WHEN** `/?view=all&size=8.5x11` is opened at 390 × 664
- **THEN** the "8.5×11" label's left edge is at or right of the 4x6 outline's left edge

### Requirement: The widget follows the site's unit

When the visitor's unit is centimetres, the table's first column SHALL give centimetres and its second column, headed "Inches", the inch form; the mat column, the wall drawing's dimension labels and the reference sentence SHALL be in centimetres. The all-sizes drawing SHALL label each outline in the visitor's unit: by its size's name in inches (`11×14`), or in whole centimetres (`28×36`); its accessible name stays in inches. With inches selected the second column is headed "Centimetres".

#### Scenario: The visitor switches to centimetres

- **WHEN** the visitor selects "cm" in the header
- **THEN** the selected row's first cell reads "40.6 × 50.8 cm", the second column is headed "Inches", and the sentence under the drawing reads "Hung 20 cm above a sofa 213 cm wide"

#### Scenario: All sizes in centimetres

- **WHEN** the visitor's unit is centimetres and the "All sizes" view shows 16x20 selected
- **THEN** the 16x20 outline is labelled "41×51", the 5x7 outline "13×18", and the drawing is still named "Standard frame sizes chart from 4x6 to 27x40 inches, 16x20 highlighted"

### Requirement: The preview stays in view while the table scrolls

In the two-column layout the preview and the filter row SHALL stay pinned while the visitor scrolls the table, and the preview's drawing SHALL keep its full aspect height whatever the viewport's height. In the one-column layout the preview SHALL stay pinned only when the table keeps at least half of the viewport's height beside it; on a shorter screen it SHALL scroll away with the page. Where a pinned drawing is capped by the viewport's height it SHALL be centred in the preview, the wall drawing's floor reaching both sides of the preview. A pinned preview SHALL NOT cover the row that has keyboard focus.

#### Scenario: A desktop screen

- **WHEN** `/` is opened at 1280 × 800 and the last table row is scrolled into view
- **THEN** the whole preview and the filter row are inside the viewport

#### Scenario: A short desktop screen

- **WHEN** `/` is opened at 1280 × 640
- **THEN** the preview's drawing is as tall as its width at its aspect ratio, within 1 px

#### Scenario: A one-column screen

- **WHEN** `/` is opened at 768 × 900 and at 900 × 800
- **THEN** the drawing's left and right gaps inside the preview are equal within 1 px, and the floor reaches both sides of the preview

#### Scenario: A phone

- **WHEN** `/` is opened at 390 × 664 and the last table row is scrolled into view
- **THEN** the preview is inside the viewport and its bottom edge is in the upper half

#### Scenario: A short phone

- **WHEN** `/` is opened at 375 × 548 and the last table row is scrolled into view
- **THEN** the preview is outside the viewport

#### Scenario: Keyboard focus under a pinned preview

- **WHEN** at 390 × 664 the visitor moves the selection down the table with the arrow keys to the last row
- **THEN** each focused row is fully visible below the preview

## ADDED Requirements

### Requirement: The drawings' labels are legible on a phone

In the phone layout the wall drawing's dimension labels and the all-sizes outline labels SHALL be drawn at least 12px tall on screen.

#### Scenario: Labels at 390px

- **WHEN** `/` is opened at 390 × 664, in the wall view and then in the "All sizes" view
- **THEN** each dimension label and each outline label renders at a font size of at least 12 px

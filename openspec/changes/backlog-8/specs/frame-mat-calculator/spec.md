## MODIFIED Requirements

### Requirement: A reverse answer gives the largest print and the frame's own mat

From a frame, the answer SHALL give the largest print, the mat opening and how they were worked out, then the standard or metric print that fits with its border (and the next print up as too big), then "Sold with this frame": the print the frame's own pre-cut mat takes, that the frame is usually sold without a mat, or that no frame this size comes with one. A print more than ⅟₁₆ in bigger than the largest print SHALL never be named as the print that fits.

#### Scenario: An 11x14 frame with a 2 inch border

- **WHEN** the visitor reverses to a frame, enters 11 × 14 in with a 2 in border and presses "Find the print that fits"
- **THEN** the answer reads "Largest print: 7½ × 10½ in. Not a standard print size.", "Mat opening" 7 × 10 in, "The opening is your frame less the 2 in border on each side. The print is ¼ in bigger on each side, under the mat."; the "Standard print that fits" card names a 5x7 print, "Mat border 3¼ in at the sides, 3¾ in at the top and bottom." and "The next print up, 8.5x11, is too big for a 2 in border."; the "Sold with this frame" card names an 8x10 print, 1¾ in at the sides and 2¼ in at the top and bottom, and "An 11x14 frame comes with a mat pre-cut for an 8x10 print."

#### Scenario: A frame whose own mat is the answer

- **WHEN** the visitor enters an 8 × 10 in frame with a 1¾ in border, from a frame
- **THEN** the answer reads "A 5x7 print fits.", its card says "Mat border 1¾ in all round." and "An 8x10 frame is sold with this mat pre-cut.", and there is no separate "Sold with this frame" card

#### Scenario: A metric frame size

- **WHEN** the visitor enters a 15¾ × 19¾ in frame with a 2 in border, from a frame
- **THEN** the answer names a 12x16 print and the "Sold with this frame" card says "No frame this size is sold with a pre-cut mat."

#### Scenario: A standard print a little too big is not named

- **WHEN** the visitor enters an 8 × 10 in frame with a 1⅞ in border, from a frame
- **THEN** the answer reads "Largest print: 4¾ × 6¾ in. Not a standard print size.", the "Standard print that fits" card names a 4x6 print with "Mat border 2¼ in all round." and "The next print up, 5x7, is too big for a 1⅞ in border.", and the answer never reads "A 5x7 print fits."

#### Scenario: A print bigger than the frame is not named

- **WHEN** the visitor enters a 10 × 15 cm frame with a 0.7 cm border, from a frame
- **THEN** the answer does not read "A 4x6 print fits." and shows no border below the one typed

### Requirement: The answer is announced and drawn

The answer area SHALL be a polite live region. A drawing SHALL show the frame, the mat, the opening and the print's edge under the mat, as one image with a label that gives the frame, the borders and the opening, and a legend with the frame size, the mat opening, the print and the mat border. While a field is marked after a find, no drawing SHALL show, so the drawing never disagrees with the fields. The print's name SHALL show inside the opening only where it fits across and down; a narrower or shorter opening SHALL show no name. The formula section's drawing, rendered once on the server, SHALL give every size in its label in both units.

#### Scenario: The drawing before an answer

- **WHEN** the calculator has no answer and no field is marked
- **THEN** the drawing shows an 8x10 print in an 11x14 frame, its legend reads "Frame size" 11 × 14 in, "Mat opening" 7½ × 9½ in, "Print, edge under the mat" 8 × 10 in and "Mat border, sides / top" 1¾ / 2¼ in

#### Scenario: The drawing of a custom answer

- **WHEN** the answer is for an 8 × 10 in print with a 2 in border
- **THEN** the drawing's label names an 11½ by 13½ in frame with a 2 in border at the sides and at the top and bottom and a 7½ by 9½ in opening, its legend's last row reads "Mat border" 2 in, and its caption reads "Drawn at the exact frame size."

#### Scenario: No drawing while a field is marked

- **WHEN** the visitor has an answer for a 10 × 15 cm frame with a 2 cm border, from a frame, then changes the border to 5 cm and presses "Find the print that fits"
- **THEN** the border field is marked and no drawing shows, in particular not the 11x14 example

#### Scenario: A print name that does not fit the opening

- **WHEN** the answer is for a 10 × 15 cm frame with a 4.5 cm border, from a frame
- **THEN** the drawing shows no "Print" text inside the 1 cm opening, and no text overlaps the border's side tag

#### Scenario: The formula figure in both units

- **WHEN** the page's server HTML is read
- **THEN** the formula section's drawing label gives the frame as "11 by 14 in (27.9 by 35.6 cm)" and every other size the same way, in inches with centimetres in brackets

### Requirement: Switching the unit converts the numbers already typed

The in/cm switch in the calculator's head and the one in the site header SHALL set one unit for the page. Switching SHALL rewrite every field that holds a number, in centimetres to one decimal and in inches to the nearest eighth, and leave other text as it is. Until the visitor edits a rewritten field, the answer SHALL use the length the field held before the switch, so a switch alone never changes the answer.

#### Scenario: Inches to centimetres and back

- **WHEN** the fields hold 8, 10 and 2 in inches and the visitor switches to cm, then back to in
- **THEN** they read "20.3", "25.4" and "5.1", then "8", "10" and "2"

#### Scenario: The header switch

- **WHEN** the visitor switches the site header's unit to cm with 8, 10 and 2 typed
- **THEN** the calculator's own switch shows cm and its fields read "20.3", "25.4" and "5.1"

#### Scenario: A switch keeps a near-standard print standard

- **WHEN** the visitor finds a mat for an 8⅜ × 10 in print, which is the standard 8x10, then switches to cm
- **THEN** the width field reads "21.3" and the answer still treats the print as the standard 8x10

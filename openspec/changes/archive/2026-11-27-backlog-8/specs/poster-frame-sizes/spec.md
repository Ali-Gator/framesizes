## MODIFIED Requirements

### Requirement: The unit switch writes every number in the visitor's unit

The site header's in/cm switch SHALL set the unit for every number the widget writes: inches to the nearest eighth, centimetres to one decimal with no trailing ".0", each from the true length. A-series sizes SHALL lead with millimetres, their inches to one decimal. Switching SHALL convert the typed custom size and leave other text as it is. Chip names stay as they are. Until the visitor edits a rewritten field, the answer SHALL use the length the field held before the switch, so a switch alone never changes the answer.

#### Scenario: An 11x17 poster with a mat in centimetres

- **WHEN** the unit is cm and the visitor picks 11x17 with a mat
- **THEN** the chip still reads "11×17", the answer gives the frame as 30.5 × 45.7 cm and the 12x18 card reads "Border 1.9 / 1.9 cm"

#### Scenario: A 24x36 poster in centimetres

- **WHEN** the unit is cm and the visitor picks 24x36 without a mat
- **THEN** the frame size reads "61 × 91.4 cm"

#### Scenario: A typed size converts

- **WHEN** the custom fields hold 13 and 19 in inches and the visitor switches to cm, then back to in
- **THEN** they read "33" and "48.3", then "13" and "19"

#### Scenario: A switch keeps a near-standard answer

- **WHEN** the visitor types 16⅜ × 20 in without a mat, which reads "Use a 16x20 frame.", then switches to cm
- **THEN** the width field reads "41.6" and the answer still reads "Use a 16x20 frame."

### Requirement: With a mat the answer lists the standard frames that hold the poster

With a mat, the answer SHALL list every standard frame the engine gives, smallest first, each in a card with its borders at the sides and at the top and bottom, a "Pre-cut mat included" or "Mat cut to order" badge, and a note saying so. With more than one, the cards SHALL be buttons: the first is drawn, and pressing another draws that one. When a pre-cut mat is cut for a standard print other than the poster, its note SHALL name that print and how far the mat overlaps the poster at the sides and at the top and bottom, and the answer's help line SHALL give the ¼ in overlap only for a mat cut to order.

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

#### Scenario: A pre-cut mat cut for a nearby print

- **WHEN** the visitor types 40 × 50 cm with a mat
- **THEN** the 18x24 card reads "Sold with a mat cut for a 16x20 print. It overlaps your poster by ⅛ / ⅛ in." (in cm, "0.3 / 0.2 cm"), and the answer does not say the mat overlaps the poster by ¼ in on each side

### Requirement: The answer is announced and drawn to one scale

The answer area SHALL be a polite live region. A drawing SHALL show the frame and the poster, and with a mat the mat and the poster seen in it, as one image whose label gives every size in both units, with a legend. Every size SHALL be drawn at one scale, set by the largest frame the page names, so a bigger poster looks bigger; a typed frame bigger than that SHALL be drawn smaller, to fit. The poster's name SHALL show inside the poster only where it fits across and down.

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

#### Scenario: A poster name that does not fit

- **WHEN** the visitor types 3 × 5 in without a mat
- **THEN** the drawing shows no "Poster" text inside the poster, and no text spills outside it

# Spec Delta

## ADDED Requirements

### Requirement: A mockup offers the catalog sizes and three A-series sizes in the artwork's orientation

For an artwork given in pixels the engine SHALL list the sizes a mockup offers: the catalog frame sizes and A3, A2 and A1 from the poster sizes, turned to the artwork's orientation, catalog sizes first in catalog order. An artwork whose shorter side is within 5% of its longer side SHALL count as square and get the square catalog sizes only.

#### Scenario: A portrait artwork

- **WHEN** the sizes are listed for a 2000 by 3000 pixel artwork
- **THEN** they are 4x6, 5x7, 8x10, 8.5x11, 11x14, 11x17, 12x16, 12x18, 16x20, 18x24, 20x24, 20x30, 24x36, 27x40, A3, A2 and A1, in that order, all portrait

#### Scenario: A landscape artwork

- **WHEN** the sizes are listed for a 3000 by 2000 pixel artwork
- **THEN** they are the same seventeen sizes turned, starting 6x4, 7x5, 10x8, and ending with A1 at 33.1 by 23.4 inches

#### Scenario: A square artwork

- **WHEN** the sizes are listed for a 2000 by 2000 pixel artwork
- **THEN** they are 8x8, 10x10, 12x12, 16x16 and 20x20

#### Scenario: A nearly square artwork counts as square

- **WHEN** the sizes are listed for a 1000 by 1050 pixel artwork
- **THEN** they are the five square sizes, because 1000 is within 5% of 1050

### Requirement: Each mockup size says how much of the artwork it cuts

The artwork SHALL fill the opening edge to edge without stretching, so an opening of another shape cuts part of it. For each offered size the engine SHALL give the share of the artwork that is cut, from 0 to 1, as 1 minus the smaller of the two width-to-height ratios divided by the larger, for the opening without a mat and for the opening with a mat.

#### Scenario: A 2:3 artwork without a mat

- **WHEN** the cut is asked for a 2000 by 3000 pixel artwork without a mat
- **THEN** 4x6, 12x18, 20x30 and 24x36 cut nothing, 27x40 cuts 1.2%, 11x17 2.9%, A3 and A2 5.7%, A1 5.6%, 16x20 16.7% and 20x24 20%, each to one decimal

#### Scenario: A 3:4 artwork with a mat

- **WHEN** the cut is asked for a 3000 by 4000 pixel artwork with a mat
- **THEN** 12x16 cuts 1.6%, 16x20 3.6% and 18x24 5.6%, each to one decimal

### Requirement: A mockup opens on the size that cuts least

For an artwork and a mat choice the engine SHALL name the size the mockup opens on: the offered size that cuts least. Sizes whose cut is within 1 percentage point of the least SHALL count as tied, and the tied size with the largest area SHALL win.

#### Scenario: A 2:3 artwork opens on 24x36

- **WHEN** the opening size is asked for a 2000 by 3000 pixel artwork without a mat
- **THEN** it is 24x36, the largest of 4x6, 12x18, 20x30 and 24x36, which cut nothing; 27x40 at 1.2% is not tied

#### Scenario: A 3:4 artwork opens on 18x24

- **WHEN** the opening size is asked for a 3000 by 4000 pixel artwork without a mat
- **THEN** it is 18x24

#### Scenario: An A-series artwork opens on A1

- **WHEN** the opening size is asked for a 2480 by 3508 pixel artwork without a mat
- **THEN** it is A1, the largest of A3, A2 and A1, which all cut less than 1%

#### Scenario: A 2:3 artwork with a mat opens on 24x36

- **WHEN** the opening size is asked for a 2000 by 3000 pixel artwork with a mat
- **THEN** it is 24x36, which cuts 0.8%, larger than A1 at 0.1%, both within 1 point of the least

#### Scenario: A 3:4 artwork with a mat opens on 12x16

- **WHEN** the opening size is asked for a 3000 by 4000 pixel artwork with a mat
- **THEN** it is 12x16, which cuts 1.6%; 16x20 at 3.6% is not tied

#### Scenario: A square artwork opens on 20x20

- **WHEN** the opening size is asked for a 2000 by 2000 pixel artwork without a mat
- **THEN** it is 20x20

### Requirement: The opening a mockup artwork fills is the frame or its mat opening

Without a mat the opening SHALL be the frame size. With a mat, a frame sold with a pre-cut mat SHALL use that mat: the opening is the mat's print size less the ¼ inch overlap on each side. A frame with no pre-cut mat SHALL get a 2 inch mat on every side. A size with no room for a 2 inch mat SHALL stay in the sizes offered with a mat, with no opening and no cut, and a mockup SHALL never open on it.

#### Scenario: A pre-cut 16x20

- **WHEN** the opening is asked for a 16x20 frame with a mat
- **THEN** it is 10½ by 13½ inches, from the 11x14 pre-cut mat

#### Scenario: A 20x30 with no pre-cut mat

- **WHEN** the opening is asked for a 20x30 frame with a mat
- **THEN** it is 16 by 26 inches

#### Scenario: An A2 with a mat

- **WHEN** the opening is asked for an A2 frame with a mat
- **THEN** it is 4 inches less than 420 by 594 mm on each axis, 12.5 by 19.4 inches to one decimal

#### Scenario: A 4x6 with a mat has no opening

- **WHEN** the sizes are listed for a 2000 by 3000 pixel artwork with a mat
- **THEN** 4x6 is listed first with no opening and no cut, and the other sixteen each have an opening and a cut

#### Scenario: Without a mat the opening is the frame

- **WHEN** the opening is asked for a 24x36 frame without a mat
- **THEN** it is 24 by 36 inches

### Requirement: The visible part of a mockup artwork is centred and follows a focus point

For an artwork and an opening the engine SHALL give the part of the artwork that shows, in pixels, with the opening's shape and as large as the artwork allows. It SHALL be centred by default. A focus point from 0 to 1 SHALL slide it along the side that is cut, 0 at the left or top edge and 1 at the right or bottom edge, and the part SHALL never leave the artwork.

#### Scenario: A 2:3 artwork in a 16x20, centred

- **WHEN** the visible part is asked for a 2000 by 3000 pixel artwork in a 16 by 20 inch opening
- **THEN** it is 2000 by 2500 pixels with its top edge at 250

#### Scenario: The focus point moves it

- **WHEN** the same part is asked with the focus at 0, and then at 1
- **THEN** its top edge is at 0, and then at 500

#### Scenario: A 3:4 artwork in a 16x20

- **WHEN** the visible part is asked for a 3000 by 4000 pixel artwork in a 16 by 20 inch opening
- **THEN** it is 3000 by 3750 pixels with its top edge at 125

#### Scenario: A focus point outside 0 to 1 is held at the edge

- **WHEN** the visible part of the 2000 by 3000 pixel artwork in a 16 by 20 inch opening is asked with the focus at 1.5
- **THEN** its top edge is at 500, as at 1

#### Scenario: An artwork of the opening's shape is not cut

- **WHEN** the visible part is asked for a 2000 by 3000 pixel artwork in a 24 by 36 inch opening
- **THEN** it is the whole artwork, 2000 by 3000 pixels from 0, 0, whatever the focus

### Requirement: A mockup frame hangs at true scale on the sample wall

The engine SHALL place a mockup frame, with its moulding, on the sample wall 144 inches wide and 96 high, centred across it, by one of two rules: above the sofa, its outside bottom edge 8 inches over the 34 inch sofa back, as on the frame size chart; or on a plain wall, its centre 57 inches above the floor.

#### Scenario: A 24x36 above the sofa

- **WHEN** a 24x36 frame is placed above the sofa
- **THEN** its outside is 26 by 38 inches, its left edge at 59, its bottom edge at 42 and its top edge at 80 inches

#### Scenario: A 24x36 on a plain wall

- **WHEN** a 24x36 frame is placed on the plain wall
- **THEN** its outside bottom edge is at 38 and its top edge at 76 inches, its left edge at 59

#### Scenario: The largest frame fits the wall

- **WHEN** a 27x40 frame, portrait and then landscape, is placed by either rule
- **THEN** its outside lies inside the 144 by 96 inch wall

### Requirement: A mockup has a whole-wall view and a close-up

The engine SHALL give two views of the wall in inches: the whole wall, and a close-up of the frame whose outside is widened on every side by a quarter of the outside's longer side. The close-up SHALL lie inside the wall for every offered size, either rule and either orientation.

#### Scenario: The whole wall

- **WHEN** the whole-wall view is asked
- **THEN** it is 144 by 96 inches from the wall's bottom left corner

#### Scenario: A 24x36 close-up above the sofa

- **WHEN** the close-up is asked for a 24x36 frame above the sofa
- **THEN** it is 45 by 57 inches, its left edge at 49.5 and its bottom edge at 32.5 inches

### Requirement: A saved mockup is 2400 pixels on its longer side

The engine SHALL give the pixel size of a saved mockup from its view: the view's longer side becomes 2400 pixels and the other side is scaled to match, rounded to a whole pixel.

#### Scenario: The whole wall saved

- **WHEN** the pixel size is asked for the whole-wall view
- **THEN** it is 2400 by 1600 pixels

#### Scenario: A 24x36 close-up saved

- **WHEN** the pixel size is asked for the 45 by 57 inch close-up
- **THEN** it is 1895 by 2400 pixels

### Requirement: A key press moves a mockup artwork by a fixed step

The engine SHALL hold two key steps, ¼ inch for an arrow key and 1 inch with Shift. For an artwork, an opening and a step in inches it SHALL give the change in focus point that moves the artwork by that step along the cut side: the step divided by how far the artwork, scaled to fill the opening, reaches past the opening on that side. An artwork that is not cut SHALL get no change.

#### Scenario: Arrow and Shift + arrow on a 2:3 artwork in a 16x20

- **WHEN** the focus change is asked for a 2000 by 3000 pixel artwork in a 16 by 20 inch opening, for ¼ inch and then for 1 inch
- **THEN** it is 0.0625 and then 0.25, because the filled artwork is 16 by 24 inches and reaches 4 inches past the opening

#### Scenario: An artwork that is not cut does not move

- **WHEN** the focus change is asked for a 2000 by 3000 pixel artwork in a 24 by 36 inch opening
- **THEN** it is 0

### Requirement: An artwork size that is not a positive number gets no mockup answer

An artwork whose width or height in pixels is not a positive finite number SHALL get no sizes, no opening size, no visible part and no focus change.

#### Scenario: A zero width

- **WHEN** the sizes are asked for a 0 by 3000 pixel artwork
- **THEN** there is no answer

#### Scenario: A negative side, NaN and Infinity

- **WHEN** the sizes are asked for a -2000 by 3000, a 2000 by NaN and a 2000 by Infinity pixel artwork
- **THEN** there is no answer for any of them

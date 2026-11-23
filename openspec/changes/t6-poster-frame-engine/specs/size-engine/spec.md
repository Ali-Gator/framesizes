# Spec Delta

## ADDED Requirements

### Requirement: The poster frame picker offers ten poster sizes

The engine SHALL list the poster sizes the poster frame picker offers, in this order, each upright and with a short use: the US sizes 11x17, 12x18, 16x20, 18x24, 20x30, 24x36 and 27x40, then A3 (297 × 420 mm), A2 (420 × 594 mm) and A1 (594 × 841 mm) from their millimetre sizes. Every US poster size SHALL be a catalog frame size.

#### Scenario: The poster list

- **WHEN** the poster sizes are read
- **THEN** they are 11x17, 12x18, 16x20, 18x24, 20x30, 24x36, 27x40, A3, A2 and A1 in that order, each with a use

#### Scenario: The poster use lines

- **WHEN** the poster sizes' uses are read
- **THEN** they are, in order: "Small posters and flyers", "Posters and photo enlargements", "Art prints and small posters", "Medium posters and art prints", "Large photo prints and posters", "Large posters", "Movie posters", "Small metric posters", "Medium metric posters" and "Large metric posters"

#### Scenario: The US poster sizes are catalog sizes

- **WHEN** each US poster size is looked up in the frame catalog
- **THEN** it is found, at the same width and height

#### Scenario: The A-series posters from their millimetre sizes

- **WHEN** A3, A2 and A1 are written in centimetres as the actual size viewer writes them
- **THEN** they are 29.7 × 42.0 cm, 42.0 × 59.4 cm and 59.4 × 84.1 cm, from 297 × 420 mm, 420 × 594 mm and 594 × 841 mm

### Requirement: A poster without a mat takes a frame of its own size

For a poster size in inches the engine SHALL give the frame it takes without a mat as the poster's own size, matched exactly as a frame measured inside: a standard or metric size within ⅜ inch, else a custom size with the nearest standard sizes below and above, in the poster's orientation.

#### Scenario: A 24x36 poster without a mat

- **WHEN** the frame without a mat is asked for a 24 by 36 inch poster
- **THEN** it is the standard 24x36 frame

#### Scenario: An A3 poster without a mat

- **WHEN** the frame without a mat is asked for an A3 poster
- **THEN** it is the metric A3 frame

#### Scenario: An A2 poster without a mat

- **WHEN** the frame without a mat is asked for an A2 poster
- **THEN** it is a custom size with the 16x20 below and the 18x24 above

#### Scenario: A landscape poster without a mat

- **WHEN** the frame without a mat is asked for a 17 by 11 inch poster
- **THEN** it is the standard landscape 17x11 frame

#### Scenario: A typed poster size between standard sizes

- **WHEN** the frame without a mat is asked for a 13 by 19 inch poster
- **THEN** it is a custom size with the 12x18 below and the 16x20 above

### Requirement: A poster near A2 or A1 is named that A-series frame

When a poster's own size matches no standard or metric frame and is within ⅜ inch of A2 (420 × 594 mm) or A1 (594 × 841 mm) on each side, the engine SHALL also name that A-series frame, in the poster's orientation, beside the custom answer. This SHALL NOT change what a measured frame or a mat question matches.

#### Scenario: An A2 poster names the A2 frame

- **WHEN** the frame without a mat is asked for an A2 poster
- **THEN** the A2 frame is named, and the answer stays custom with the 16x20 below and the 18x24 above

#### Scenario: An A1 poster names the A1 frame

- **WHEN** the frame without a mat is asked for an A1 poster
- **THEN** the A1 frame is named, and the answer stays custom with the 20x30 below and the 24x36 above

#### Scenario: A typed poster size near A2

- **WHEN** the frame without a mat is asked for a 16.4 by 23.3 inch poster
- **THEN** the A2 frame is named

#### Scenario: A standard or metric poster names no A-series frame

- **WHEN** the frame without a mat is asked for a 24 by 36 inch poster or an A3 poster
- **THEN** no A2 or A1 frame is named

#### Scenario: Measuring near A2 is unchanged

- **WHEN** an inside measurement of 16½ by 23⅜ inches is matched
- **THEN** it is a custom size, as before

### Requirement: A poster with a mat names the standard frames that hold it

For a poster size the engine SHALL list, smallest area first (catalog order on a tie) and in the poster's orientation, every catalog frame sold with a pre-cut mat for it, the diploma pairing included, and every catalog frame whose mat border is within the border range on every side. A square frame not sold pre-cut for it SHALL be considered only for a square poster (sides within ⅜ inch). Each frame SHALL come with its two borders and whether its mat is sold pre-cut.

#### Scenario: An 11x17 poster with a mat

- **WHEN** the frames with a mat are asked for an 11 by 17 inch poster
- **THEN** they are the 12x18 with a pre-cut mat and borders of ¾ and ¾ inch, the 16x20 with 2¾ and 1¾ inches, and the 18x24 with 3¾ and 3¾ inches

#### Scenario: A 16x20 poster with a mat

- **WHEN** the frames with a mat are asked for a 16 by 20 inch poster
- **THEN** they are the 18x24 with a pre-cut mat and borders of 1¼ and 2¼ inches, and the 20x24 with a pre-cut mat and borders of 2¼ and 2¼ inches

#### Scenario: An 18x24 poster with a mat

- **WHEN** the frames with a mat are asked for an 18 by 24 inch poster
- **THEN** the only frame is the 20x30, not pre-cut, with borders of 1¼ and 3¼ inches

#### Scenario: A 24x36 poster with a mat

- **WHEN** the frames with a mat are asked for a 24 by 36 inch poster
- **THEN** the only frame is the 27x40, not pre-cut, with borders of 1¾ and 2¼ inches

#### Scenario: A 27x40 poster with a mat

- **WHEN** the frames with a mat are asked for a 27 by 40 inch poster
- **THEN** no frame is listed

#### Scenario: An A2 poster with a mat

- **WHEN** the frames with a mat are asked for an A2 poster
- **THEN** the only frame is the 20x30, with borders that write as 2 and 3½ inches to the nearest eighth

#### Scenario: A landscape poster with a mat

- **WHEN** the frames with a mat are asked for a 17 by 11 inch poster
- **THEN** they are the landscape 18x12, 20x16 and 24x18, with the borders of the upright case turned

#### Scenario: A non-square poster leaves out square frames

- **WHEN** the frames with a mat are asked for a 13 by 14 inch poster
- **THEN** the only frame is the 16x20, with borders of 1¾ and 3¼ inches, and the 16x16 is not listed

#### Scenario: A square poster with a mat

- **WHEN** the frames with a mat are asked for a 12 by 12 inch poster
- **THEN** the only frame is the 16x16, with a pre-cut mat and borders of 2¼ and 2¼ inches

#### Scenario: Poster frames smallest first

- **WHEN** the frames with a mat are asked for a 10 by 10 inch poster
- **THEN** they are the 12x12 (1¼ and 1¼ inches), the 12x16 (1¼ and 3¼ inches) and the 16x16 (3¼ and 3¼ inches), in that order

#### Scenario: A near-square poster keeps its pre-cut square frames

- **WHEN** the frames with a mat are asked for a 7.7 by 8.3 inch poster
- **THEN** they are the 10x10 and the 12x12, both sold with a pre-cut mat, then the 11x14

#### Scenario: A diploma-size poster

- **WHEN** the frames with a mat are asked for an 8½ by 11 inch poster
- **THEN** the 11x14 and the 12x16 are both marked as sold with a pre-cut mat, as the frame and mat calculator names them

### Requirement: A pre-cut frame's borders are those of the mat as sold

For a frame sold with a pre-cut mat for a poster, the engine SHALL give the borders of that mat as sold: the frame with the print the mat is cut for (its catalog pairing, or the diploma for the diploma frame), not the poster's own size, which may differ by up to ⅜ inch.

#### Scenario: A poster a little larger than its pre-cut mat

- **WHEN** the frames with a mat are asked for an 11.3 by 17.3 inch poster
- **THEN** the 12x18 is listed as pre-cut with borders of ¾ and ¾ inch, the borders of its 11x17 mat

### Requirement: A poster with no standard frame for a mat gets the frame for a 2 inch mat

When no catalog frame holds a poster with a mat, the engine SHALL give the frame size a 2 inch mat needs, as the frame and mat calculator gives it from the print: the poster less the overlap on every side, plus 2 inches on every side, in the poster's orientation. A poster that has a standard frame with a mat SHALL get no such size.

#### Scenario: A 27x40 poster's custom frame

- **WHEN** the frames with a mat are asked for a 27 by 40 inch poster
- **THEN** the frame for a 2 inch mat is 30½ by 43½ inches

#### Scenario: A landscape 40x27 poster's custom frame

- **WHEN** the frames with a mat are asked for a 40 by 27 inch poster
- **THEN** the frame for a 2 inch mat is 43½ by 30½ inches

#### Scenario: A poster with a standard frame gets no custom frame

- **WHEN** the frames with a mat are asked for a 24 by 36 inch poster
- **THEN** no custom frame size is given

### Requirement: A mat border on a poster frame is 1 to 4 inches

The engine SHALL give the border range the poster frame picker accepts for a frame that is not sold with a pre-cut mat: at least 1 inch and at most 4 inches on every side, ends included. A frame sold with a pre-cut mat for the poster SHALL be listed whatever its borders.

#### Scenario: The poster border range

- **WHEN** the border range is read
- **THEN** it is 1 inch to 4 inches

#### Scenario: A poster border just outside the range

- **WHEN** the frames with a mat are asked for a 12 by 18 inch poster
- **THEN** the 20x24, with borders of 4¼ and 3¼ inches, is not listed, and the 16x20 and 18x24 are

#### Scenario: A pre-cut poster frame with a narrow border

- **WHEN** the frames with a mat are asked for an 11 by 17 inch poster
- **THEN** the 12x18 is listed, with borders of ¾ inch, because its mat is sold pre-cut

### Requirement: A poster size that is not a positive number gets no answer

The engine SHALL give no frame, with or without a mat, for a poster size whose width or height is zero, negative or not a finite number.

#### Scenario: A poster with a zero width

- **WHEN** the frames are asked for a 0 by 17 inch poster
- **THEN** there is no answer

#### Scenario: A poster height that is not a number

- **WHEN** the frames are asked for a poster whose height is not a number
- **THEN** there is no answer

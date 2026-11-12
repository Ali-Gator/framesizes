# Spec Delta

## Purpose

The single source of every size the site shows. It holds the frame size catalog and derives from it everything a page prints or draws: centimetres, the written form of a size, orientation, the next size up, mat pairings, frame anatomy and the true-scale wall scene. Pages never type a size by hand.

## ADDED Requirements

### Requirement: The catalog lists the US ready-made frame sizes

The engine SHALL hold one catalog of frame sizes in inches, each stored upright (width not larger than height) with an id of the form `<width>x<height>`. Rectangular sizes come first, then square sizes, each group ordered by width and then height. The catalog SHALL mark the six most common sizes and the sizes to label first in a comparison drawing.

#### Scenario: The rectangular sizes

- **WHEN** the rectangular sizes are listed
- **THEN** they are 4x6, 5x7, 8x10, 8.5x11, 11x14, 11x17, 12x16, 12x18, 16x20, 18x24, 20x24, 20x30, 24x36, 27x40, in that order

#### Scenario: The square sizes

- **WHEN** the square sizes are listed
- **THEN** they are 8x8, 10x10, 12x12, 16x16, 20x20, in that order

#### Scenario: The six most common sizes

- **WHEN** the most common sizes are listed
- **THEN** they are 4x6, 5x7, 8x10, 11x14, 16x20, 24x36

#### Scenario: Every entry is well formed

- **WHEN** the catalog is checked
- **THEN** ids are unique, every id equals its width and height joined by a letter x, no width is larger than its height, and every entry has a non-empty common-use text

### Requirement: A size can be listed and found in any orientation

The engine SHALL list sizes for an orientation: portrait gives the rectangular sizes as stored, landscape gives the same sizes with width and height swapped and the id swapped to match, square gives the square sizes. It SHALL find a size from an oriented id and report its orientation, and SHALL report an unknown id as not found.

#### Scenario: Landscape turns the size

- **WHEN** the landscape list is read
- **THEN** its third entry has the id 10x8, a width of 10 and a height of 8

#### Scenario: An oriented id is looked up

- **WHEN** the ids 10x8, 8x10 and 12x12 are looked up
- **THEN** they are found as landscape, portrait and square

#### Scenario: An unknown id

- **WHEN** the id 9x9 or the text "banana" is looked up
- **THEN** nothing is found

### Requirement: The next size up follows the list

For a size in an orientation, the engine SHALL give the next size up as the first later entry in that orientation's list that is at least as wide and at least as tall, and none when there is no such entry.

#### Scenario: A size in the middle of the list

- **WHEN** the next size up from 16x20 is asked for
- **THEN** it is 18x24

#### Scenario: A later size that is not larger

- **WHEN** the next size up from 11x17 is asked for
- **THEN** it is 12x18, not the shorter 12x16 that follows it in the list

#### Scenario: Every next size up holds the size

- **WHEN** the next size up is asked for every size in every orientation
- **THEN** it is never narrower or shorter than the size asked about

#### Scenario: The largest size

- **WHEN** the next size up from 27x40, or from 20x20, is asked for
- **THEN** there is none

### Requirement: Inches convert to centimetres at one decimal

The engine SHALL convert inches to centimetres at 2.54 cm per inch, rounded to one decimal, and SHALL write a whole number without a trailing zero.

#### Scenario: Common sizes in centimetres

- **WHEN** 8, 10, 8.5, 24 and 36 inches are converted
- **THEN** the results are 20.3, 25.4, 21.6, 61 and 91.4

### Requirement: A size is written in one of three fixed forms

The engine SHALL write a size, width first, in exactly these forms: the search form with a letter x for headings and sentences, the inch form and the centimetre form with a multiplication sign and spaces for tables and drawings.

#### Scenario: The three forms of one size

- **WHEN** the size 8 by 10 inches is written in each form
- **THEN** the results are `8x10`, `8 × 10 in` and `20.3 × 25.4 cm`

#### Scenario: A turned size

- **WHEN** the landscape size 10x8 is written in the inch form
- **THEN** the result is `10 × 8 in`

### Requirement: A frame size names the image usually framed in it with a mat

For each catalog size the engine SHALL give either the image size of the pre-cut mat most often sold for that frame, or none when no mat pairing is common for that size. A mat image SHALL be smaller than its frame in both dimensions and SHALL turn with the frame.

#### Scenario: Frames with a common mat

- **WHEN** the mat image is asked for 5x7, 8x10, 11x14, 11x17, 12x16, 12x18, 16x20, 18x24, 20x24 and 24x36
- **THEN** it is 4x6, 5x7, 8x10, 8x12, 8.5x11, 11x17, 11x14, 16x20, 16x20 and 20x30

#### Scenario: Square frames with a common mat

- **WHEN** the mat image is asked for 8x8, 10x10, 12x12, 16x16 and 20x20
- **THEN** it is 4x4, 8x8, 8x8, 12x12 and 16x16

#### Scenario: Frames usually sold without a mat

- **WHEN** the mat image is asked for 4x6, 8.5x11, 20x30 and 27x40
- **THEN** there is none

#### Scenario: A turned frame

- **WHEN** the mat image is asked for the landscape size 14x11
- **THEN** it is 10 wide and 8 high

### Requirement: Frame anatomy is computed from the frame and the image

The engine SHALL compute a frame's outside size as its size plus the moulding width on every side (1 inch unless given), and a mat's opening as the image size less the overlap on every side (¼ inch unless given).

#### Scenario: An 8x10 photo with a mat in an 11x14 frame

- **WHEN** the anatomy is computed for an 11x14 frame holding an 8x10 image
- **THEN** the outside size is 13 by 16 inches and the mat opening is 7.5 by 9.5 inches

### Requirement: The wall scene places a frame at true scale beside a reference

The engine SHALL describe a wall scene in inches for a frame, an optional second frame and one reference: a sofa 84 wide with its back 34 high, a person 69 tall, or a door 80 high and 30 wide, on a wall 96 high. Above the sofa a frame SHALL hang centred on it with its outside bottom edge 8 inches above the back. Beside a person or a door a frame SHALL hang with its centre 57 inches above the floor. The second frame SHALL hang by the same rule, centred on the first.

#### Scenario: A 16x20 frame above the sofa

- **WHEN** the scene is built for a 16x20 frame and the sofa
- **THEN** the frame's outside bottom edge is 42 inches above the floor, its outside top edge 64 inches, and its centre line is the sofa's centre line

#### Scenario: A 16x20 frame beside a person

- **WHEN** the scene is built for a 16x20 frame and the person
- **THEN** the frame's outside edges are 46 and 68 inches above the floor

#### Scenario: Every size fits the scene

- **WHEN** the scene is built for every catalog size in every orientation, with its next size up as the second frame, beside each reference
- **THEN** both frames stay between the floor and the top of the wall, and beside a person or a door neither frame overlaps the reference

### Requirement: The reference is described in the visitor's unit

The engine SHALL give one sentence per reference that names each measure it uses, in inches or in whole centimetres computed from the same constants.

#### Scenario: The sofa sentence

- **WHEN** the sofa's sentence is asked for in inches and in centimetres
- **THEN** it is "Hung 8 in above a sofa 84 in wide" and "Hung 20 cm above a sofa 213 cm wide"

#### Scenario: The person and door sentences in centimetres

- **WHEN** the person's and the door's sentences are asked for in centimetres
- **THEN** they are "Centred 145 cm from the floor, next to a person 175 cm tall" and "Centred 145 cm from the floor, next to a door 203 cm tall"

### Requirement: The catalog says when and against what it was checked

The engine SHALL expose the date the size data was last checked and the sources it was checked against, so a page can show both.

#### Scenario: The check record

- **WHEN** the check record is read
- **THEN** it holds a calendar date that is not in the future and at least one named source with a URL

# Spec Delta

## ADDED Requirements

### Requirement: An inch length is written to the nearest eighth

The engine SHALL write a length in inches rounded to the nearest eighth, as a whole number followed by a fraction glyph (⅛, ¼, ⅜, ½, ⅝, ¾, ⅞), the glyph alone under one inch, and a whole number with no glyph when the eighths are 0. A size SHALL be written as its two lengths joined by " × " with " in" after them; its centimetre form stays the one-decimal form.

#### Scenario: Lengths in eighths

- **WHEN** 7.5, 0.25, 8.125, 1.25, 10 and 8.04 inches are written
- **THEN** they read "7½", "¼", "8⅛", "1¼", "10" and "8"

#### Scenario: A size in eighths

- **WHEN** the size 7.5 by 9.5 inches is written in eighths
- **THEN** it reads "7½ × 9½ in", and its centimetre form reads "19.1 × 24.1 cm"

### Requirement: A typed length is read with fractions

The engine SHALL read a typed length as a whole number, a decimal with a point or a comma, a fraction, a whole number and a fraction separated by a space or a hyphen, or a whole number followed by a fraction glyph. Text that is empty, holds anything else, starts with a minus sign or divides by 0 SHALL give no number.

#### Scenario: Forms of eight and an eighth

- **WHEN** "8 1/8", "8-1/8", "8⅛", "8.125" and " 8.125 " are read
- **THEN** each gives 8.125

#### Scenario: Other forms

- **WHEN** "8,5", "½", "3/4" and "12" are read
- **THEN** they give 8.5, 0.5, 0.75 and 12

#### Scenario: Text that is not a length

- **WHEN** "", "abc", "8 1/0", "-2" and "8 in" are read
- **THEN** each gives no number

### Requirement: A standard frame's measurements are listed

For a catalog frame the engine SHALL give its inside (the frame size), its front opening (the inside less two lips), its outside with the example moulding, the example moulding's width seen from the front (the moulding plus the lip), and, when a pre-cut mat is sold for it, the mat's opening and the print it holds.

#### Scenario: The 8x10

- **WHEN** the measurements of the 8x10 are listed
- **THEN** the inside is 8 × 10 in, the front opening 7½ × 9½ in, the outside 10 × 12 in with a moulding 1¼ in wide from the front, and the mat opening 4½ × 6½ in for a 5x7 print

#### Scenario: A frame with no pre-cut mat

- **WHEN** the measurements of the 4x6 are listed
- **THEN** the inside is 4 × 6 in, the front opening 3½ × 5½ in, the outside 6 × 8 in, and there is no mat

### Requirement: A measurement with no answer says why

For a measurement that gets no answer the engine SHALL say which rule refused it: a number that is not a positive finite number, a moulding no wider than its lip, or mouldings that leave no room for a picture. A measurement that gets an answer SHALL have no reason.

#### Scenario: Mouldings that leave no room

- **WHEN** a frame is 10 by 12 inches outside with a moulding 6 inches wide
- **THEN** the reason is that the mouldings leave no room

#### Scenario: A moulding no wider than the lip

- **WHEN** a frame is 13 by 16 inches outside with a moulding ¼ inch wide and the ¼ inch lip
- **THEN** the reason is that the moulding is no wider than the lip

#### Scenario: A side of 0

- **WHEN** a side measured inside is 0
- **THEN** the reason is a number that is not positive

#### Scenario: A measurement with an answer

- **WHEN** a frame measured inside is 8 by 10 inches
- **THEN** there is no reason

## MODIFIED Requirements

### Requirement: A custom size names the nearest standard sizes below and above

For a frame size that matches no standard or metric size, the engine SHALL name the catalog size of largest area that is no bigger on either side, and the catalog size of smallest area that is at least as big on both sides, in the measured orientation. A square size, its sides within ⅜ inch, SHALL be compared only with square catalog sizes, and any other only with rectangular ones. A size whose long side is under 1.2 times its short side, but that is not square, SHALL also name the nearest square sizes below and above in the same way. Any of these may be absent.

#### Scenario: A 9 × 12 frame

- **WHEN** a frame measured inside is 9 by 12 inches
- **THEN** the size below is the 8.5x11 and the size above is the 11x14

#### Scenario: A landscape custom frame

- **WHEN** a frame measured inside is 12 by 9 inches
- **THEN** the size below is the landscape 11x8.5 and the size above is the landscape 14x11

#### Scenario: A square custom frame

- **WHEN** a frame measured inside is 13 by 13 inches
- **THEN** the size below is the 12x12 and the size above is the 16x16

#### Scenario: Larger than every size

- **WHEN** a frame measured inside is 30 by 44 inches
- **THEN** the size below is the 27x40 and there is no size above

#### Scenario: Smaller than every size

- **WHEN** a frame measured inside is 3 by 5 inches
- **THEN** there is no size below and the size above is the 4x6

#### Scenario: A near-square custom frame

- **WHEN** a frame measured inside is 9 by 9½ inches
- **THEN** the size below is the 5x7 and the size above is the 11x14, and the square below is the 8x8 and the square above is the 10x10

#### Scenario: A landscape near-square custom frame

- **WHEN** a frame measured inside is 9½ by 9 inches
- **THEN** the size below is the landscape 7x5 and the size above is the landscape 14x11, and the squares are the 8x8 and the 10x10

#### Scenario: Exactly 1.2 times as long

- **WHEN** a frame measured inside is 10 by 12 inches
- **THEN** the size below is the 8.5x11 and the size above is the 11x14, and no square size is named

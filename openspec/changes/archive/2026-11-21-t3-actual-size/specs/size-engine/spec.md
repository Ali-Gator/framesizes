# Spec Delta

## ADDED Requirements

### Requirement: The actual size viewer has seven sizes

The engine SHALL list the sizes the actual size viewer offers, in this order, each upright: 4x6, 5x7, 8x10, 11x14 and 16x20 from the catalog, then A4 (210 × 297 mm) and A3 (297 × 420 mm) from their millimetre sizes.

#### Scenario: The list

- **WHEN** the actual-size list is read
- **THEN** it holds 4x6, 5x7, 8x10, 11x14, 16x20, A4 and A3 in that order, and the five inch sizes are the catalog's

#### Scenario: The A-series sizes in both units

- **WHEN** A4 and A3 are written
- **THEN** A4 is 21.0 × 29.7 cm and 8.3 × 11.7 in, and A3 is 29.7 × 42.0 cm and 11.7 × 16.5 in

### Requirement: The things that check a scale have both edges

The engine SHALL hold one record of the credit card (85.6 × 53.98 mm), the Letter sheet (8.5 × 11 in) and the A4 sheet (210 × 297 mm), each with its short and long edge, and the wall tool's fixed lengths for those three SHALL be their long edges from this record.

#### Scenario: The card's edges

- **WHEN** the credit card's edges are read
- **THEN** the short edge is 53.98 mm and the long edge is 85.6 mm

#### Scenario: The wall tool still marks long edges

- **WHEN** the wall tool's lengths for the Letter sheet, the A4 sheet and the credit card are read
- **THEN** they are 11 inches, 297 mm and 85.6 mm, the long edges of the record

### Requirement: A screen's diagonal gives its scale

The engine SHALL compute a screen's scale in CSS pixels per inch as the straight-line length of its CSS width and height divided by its diagonal in inches, and SHALL give no scale when the diagonal or either side is not a positive finite number.

#### Scenario: A 6.1 in phone

- **WHEN** a screen of 393 × 852 CSS px has a 6.1 in diagonal
- **THEN** its scale is about 153.8 px per inch

#### Scenario: No diagonal

- **WHEN** the diagonal is 0, negative or not a number
- **THEN** there is no scale

### Requirement: A screen's scale has a first guess

Before any check, the engine SHALL guess a diagonal from the screen's CSS size and pointer: 6.1 in when the shorter side is at most 500 px; 11 in when the pointer is coarse and the shorter side is at most 1,100 px; 14 in when the straight-line length is under 2,200 px; otherwise 23 in. The guess SHALL be that diagonal's scale.

#### Scenario: A phone

- **WHEN** the screen is 393 × 852 CSS px with a coarse pointer
- **THEN** the guessed diagonal is 6.1 in and the scale about 153.8 px per inch

#### Scenario: A 13 in laptop

- **WHEN** the screen is 1,470 × 956 CSS px with a fine pointer
- **THEN** the guessed diagonal is 14 in and the scale about 125.2 px per inch

#### Scenario: A monitor

- **WHEN** the screen is 1,920 × 1,080 CSS px with a fine pointer
- **THEN** the guessed diagonal is 23 in and the scale about 95.8 px per inch

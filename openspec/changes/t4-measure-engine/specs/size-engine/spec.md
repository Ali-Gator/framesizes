# Spec Delta

## ADDED Requirements

### Requirement: A measured frame size is matched to a standard size

The engine SHALL match a frame size in inches to the catalog size whose width and height are each within ⅜ inch of it, in the orientation measured. It SHALL give the frame size itself with the match, and SHALL say the size is custom, with no match, when no catalog size is that close.

#### Scenario: An 8x10 measured inside

- **WHEN** a frame measured inside at the back is 8 by 10 inches, or 8⅛ by 10⅛ inches
- **THEN** it is the standard 8x10

#### Scenario: The edge of the tolerance

- **WHEN** a frame measured inside is 8⅜ by 10 inches, and another 8.4 by 10 inches
- **THEN** the first is the standard 8x10 and the second is a custom size

#### Scenario: A landscape frame

- **WHEN** a frame measured inside is 10 by 8 inches
- **THEN** it is the landscape 10x8

#### Scenario: A square frame measured slightly off

- **WHEN** a frame measured inside is 10.1 by 9.9 inches
- **THEN** it is the square 10x10

#### Scenario: A custom size

- **WHEN** a frame measured inside is 9 by 12 inches
- **THEN** it matches no standard size, and the frame size given is 9 by 12 inches

#### Scenario: A measurement matches at most one size

- **WHEN** every pair of catalog sizes is compared, upright
- **THEN** each pair differs by at least 1 inch in width or height, so no measurement is within ⅜ inch of two sizes

### Requirement: A front opening gives the frame size

The engine SHALL take the window seen from the front of a frame with no mat as the frame size less the frame's lip on every side, ¼ inch unless given, and SHALL match the frame size that gives.

#### Scenario: The front opening of an 8x10

- **WHEN** a frame's front opening is 7½ by 9½ inches
- **THEN** its frame size is 8 by 10 inches, the standard 8x10

### Requirement: An outside measurement and the moulding width give the frame size

The engine SHALL take a frame's outside size, edge to edge, and the width of its moulding seen from the front, and SHALL give the frame size as the outside less two moulding widths plus two lips, ¼ inch each unless given. It SHALL match the frame size that gives.

#### Scenario: An 11x14 measured outside

- **WHEN** a frame is 13 by 16 inches outside and its moulding is 1¼ inches wide from the front
- **THEN** its frame size is 11 by 14 inches, the standard 11x14

#### Scenario: An 8x10 measured outside

- **WHEN** a frame is 10 by 12 inches outside and its moulding is 1¼ inches wide from the front
- **THEN** its frame size is 8 by 10 inches, the standard 8x10

### Requirement: A mat opening names the print and the frames sold with that mat

The engine SHALL take a mat's opening as the print size less the mat's overlap on every side, ¼ inch unless given, and SHALL give that print size. It SHALL list, in catalog order and in the measured orientation, every catalog frame whose common pre-cut mat holds a print within ⅜ inch of it, or none.

#### Scenario: An 8x10 print in a mat

- **WHEN** a mat's opening is 7½ by 9½ inches
- **THEN** the print is 8 by 10 inches and the frame is the 11x14

#### Scenario: A print sold in two frame sizes

- **WHEN** a mat's opening is 15½ by 19½ inches
- **THEN** the print is 16 by 20 inches and the frames are the 18x24 and the 20x24

#### Scenario: A landscape mat

- **WHEN** a mat's opening is 9½ by 7½ inches
- **THEN** the print is 10 by 8 inches and the frame is the landscape 14x11

#### Scenario: A print no pre-cut mat is sold for

- **WHEN** a mat's opening is 11½ by 15½ inches
- **THEN** the print is 12 by 16 inches and no frame is listed

#### Scenario: A mat print matches at most one pairing

- **WHEN** every pair of print sizes the catalog's mats hold is compared, upright
- **THEN** each pair differs by at least 1 inch in width or height

### Requirement: A measurement that gives no size gets no answer

The engine SHALL give no answer when a side, a moulding width, a lip or an overlap is not a positive finite number, or when the frame size an outside measurement gives is not positive.

#### Scenario: A side that is not a positive number

- **WHEN** a side measured inside is 0, negative or not a number
- **THEN** there is no answer

#### Scenario: Mouldings wider than the frame

- **WHEN** a frame is 4 by 6 inches outside and its moulding is 3 inches wide from the front
- **THEN** there is no answer

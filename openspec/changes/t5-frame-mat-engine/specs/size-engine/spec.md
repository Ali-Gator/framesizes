# Spec Delta

## ADDED Requirements

### Requirement: A print and a mat width give the mat opening and the frame size

Given a print size and a mat width in inches, the engine SHALL give the mat opening as the print less the mat's overlap on every side, ¼ inch unless given, and the frame size as that opening plus the mat width on every side. The mat width is the board cut on each side, from the mat's outer edge to its opening. Both sizes SHALL keep the print's orientation.

#### Scenario: An 8x10 print with a 2 inch mat

- **WHEN** an 8 by 10 inch print gets a mat 2 inches wide
- **THEN** the mat opening is 7½ by 9½ inches and the frame size is 11½ by 13½ inches

#### Scenario: A landscape print

- **WHEN** a 10 by 8 inch print gets a mat 2 inches wide
- **THEN** the mat opening is 9½ by 7½ inches and the frame size is 13½ by 11½ inches

#### Scenario: A different overlap

- **WHEN** an 8 by 10 inch print gets a mat 2 inches wide that overlaps it by ⅛ inch on each side
- **THEN** the mat opening is 7¾ by 9¾ inches and the frame size is 11¾ by 13¾ inches

### Requirement: The frame size from a print is matched to a standard size

The engine SHALL match the frame size a print and a mat width give exactly as it matches a frame measured inside: a standard or metric size within ⅜ inch, else a custom size with the nearest standard sizes below and above.

#### Scenario: A frame size that is standard

- **WHEN** a 5 by 7 inch print gets a mat 1¾ inches wide
- **THEN** the frame size is 8 by 10 inches, the standard 8x10

#### Scenario: An 11x14 print with a 2 inch mat

- **WHEN** an 11 by 14 inch print gets a mat 2 inches wide
- **THEN** the frame size is 14½ by 17½ inches, a custom size with the 12x16 below and the 16x20 above

#### Scenario: An 8x10 print with a 2 inch mat is near-square

- **WHEN** an 8 by 10 inch print gets a mat 2 inches wide
- **THEN** the frame size 11½ by 13½ inches is a custom size with the 8.5x11 below and the 12x16 above, and the squares 10x10 below and 16x16 above

#### Scenario: A landscape frame size

- **WHEN** a 10 by 8 inch print gets a mat 2 inches wide
- **THEN** the frame size is a custom size with the landscape 11x8.5 below and the landscape 16x12 above

#### Scenario: A frame size that is metric

- **WHEN** an 8 by 12 inch print gets a mat 2 inches wide
- **THEN** the frame size is 11½ by 15½ inches, the metric 30 × 40 cm, and no US size is close

### Requirement: A print names the frames sold with a pre-cut mat for it

For a print size the engine SHALL list, in catalog order and in the print's orientation, every catalog frame whose common pre-cut mat holds a print within ⅜ inch of it, or none. This SHALL be the same list a measured mat opening gives for the print it points to.

#### Scenario: An 8x10 print

- **WHEN** the frames sold with a pre-cut mat are asked for an 8 by 10 inch print
- **THEN** the frame is the 11x14

#### Scenario: An 11x14 print

- **WHEN** the frames sold with a pre-cut mat are asked for an 11 by 14 inch print
- **THEN** the frame is the 16x20

#### Scenario: A 16x20 print

- **WHEN** the frames sold with a pre-cut mat are asked for a 16 by 20 inch print
- **THEN** the frames are the 18x24 and the 20x24

#### Scenario: A landscape print

- **WHEN** the frames sold with a pre-cut mat are asked for a 10 by 8 inch print
- **THEN** the frame is the landscape 14x11

#### Scenario: A print no pre-cut mat is sold for

- **WHEN** the frames sold with a pre-cut mat are asked for a 12 by 16 inch print
- **THEN** no frame is listed

### Requirement: A frame and a mat width give the mat opening and the largest print

Given a frame size and a mat width in inches, the engine SHALL give the mat opening as the frame less the mat width on every side, and the largest print the mat holds as that opening plus the mat's overlap on every side, ¼ inch unless given. Both sizes SHALL keep the frame's orientation.

#### Scenario: An 11x14 frame with a 2 inch mat

- **WHEN** an 11 by 14 inch frame gets a mat 2 inches wide
- **THEN** the mat opening is 7 by 10 inches and the largest print is 7½ by 10½ inches

#### Scenario: A landscape frame

- **WHEN** a 14 by 11 inch frame gets a mat 2 inches wide
- **THEN** the mat opening is 10 by 7 inches and the largest print is 10½ by 7½ inches

### Requirement: The largest print for a frame is matched to a standard size

The engine SHALL match the largest print a frame and a mat width give exactly as it matches a frame measured inside: a standard or metric size within ⅜ inch, else a custom size with the nearest standard sizes below and above.

#### Scenario: A print that is standard

- **WHEN** an 8 by 10 inch frame gets a mat 1¾ inches wide
- **THEN** the largest print is 5 by 7 inches, the standard 5x7

#### Scenario: A print between two sizes

- **WHEN** an 11 by 14 inch frame gets a mat 2 inches wide
- **THEN** the largest print, 7½ by 10½ inches, is a custom size with the 5x7 below and the 8.5x11 above

#### Scenario: A landscape print between two sizes

- **WHEN** a 14 by 11 inch frame gets a mat 2 inches wide
- **THEN** the largest print is a custom size with the landscape 7x5 below and the landscape 11x8.5 above

### Requirement: A mat question that gives no size says why

The engine SHALL give no answer, and SHALL say which rule refused it, when a print or frame side, a mat width or an overlap is not a positive finite number, or when the mat or the overlap leaves no opening. A question that gets an answer SHALL have no reason.

#### Scenario: A number that is not positive

- **WHEN** a print side, a frame side, a mat width or an overlap is 0, negative or not a number
- **THEN** there is no answer, and the reason is a number that is not positive

#### Scenario: A mat as wide as the frame

- **WHEN** a 4 by 6 inch frame gets a mat 2 inches wide, or 3 inches wide
- **THEN** there is no answer, and the reason is that the mat leaves no room

#### Scenario: An overlap as wide as the print

- **WHEN** a ½ by 6 inch print gets a mat 2 inches wide with the ¼ inch overlap
- **THEN** there is no answer, and the reason is that the mat leaves no room

#### Scenario: A question with an answer

- **WHEN** an 8 by 10 inch print gets a mat 2 inches wide
- **THEN** there is no reason

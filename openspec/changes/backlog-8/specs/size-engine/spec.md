## MODIFIED Requirements

### Requirement: The largest print for a frame is matched to a standard size

The engine SHALL match the largest print a frame and a mat width give to a standard or metric size that is at most ⅟₁₆ inch bigger and at most ⅜ inch smaller on each side, else a custom size with the nearest standard sizes below and above. A size more than ⅟₁₆ inch bigger than the largest print SHALL never be its match.

#### Scenario: A print that is standard

- **WHEN** an 8 by 10 inch frame gets a mat 1¾ inches wide
- **THEN** the largest print is 5 by 7 inches, the standard 5x7

#### Scenario: A print between two sizes

- **WHEN** an 11 by 14 inch frame gets a mat 2 inches wide
- **THEN** the largest print, 7½ by 10½ inches, is a custom size with the 5x7 below and the 8.5x11 above

#### Scenario: A landscape print between two sizes

- **WHEN** a 14 by 11 inch frame gets a mat 2 inches wide
- **THEN** the largest print is a custom size with the landscape 7x5 below and the landscape 11x8.5 above

#### Scenario: A standard print a little bigger than the largest print

- **WHEN** an 8 by 10 inch frame gets a mat 1⅞ inches wide
- **THEN** the largest print, 4¾ by 6¾ inches, is a custom size with the 4x6 below and the 5x7 above

#### Scenario: A standard print bigger than a metric frame allows

- **WHEN** a 10 by 15 cm frame gets a mat 0.7 cm wide
- **THEN** the largest print, about 9.9 by 14.9 cm, is a custom size and not the 4x6

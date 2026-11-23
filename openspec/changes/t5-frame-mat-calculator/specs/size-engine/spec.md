# Spec Delta

## MODIFIED Requirements

### Requirement: A mat question that gives no size says why

The engine SHALL give no answer, and SHALL say which rule refused it, when a print or frame side, a mat width or an overlap is not a positive finite number, when the mat width is no wider than the overlap, or when the mat or the overlap leaves no opening. A question that gets an answer SHALL have no reason.

#### Scenario: A number that is not positive

- **WHEN** a print side, a frame side, a mat width or an overlap is 0, negative or not a number
- **THEN** there is no answer, and the reason is a number that is not positive

#### Scenario: A mat as wide as the frame

- **WHEN** a 4 by 6 inch frame gets a mat 2 inches wide, or 3 inches wide
- **THEN** there is no answer, and the reason is that the mat leaves no room

#### Scenario: An overlap as wide as the print

- **WHEN** a ½ by 6 inch print gets a mat 2 inches wide with the ¼ inch overlap
- **THEN** there is no answer, and the reason is that the mat leaves no room

#### Scenario: A mat no wider than its overlap

- **WHEN** an 8 by 10 inch print gets a mat 0.1 inch or ¼ inch wide, or an 11 by 14 inch frame gets a mat 0.2 inch wide, each with the ¼ inch overlap
- **THEN** there is no answer, and the reason is that the mat is too narrow

#### Scenario: A mat just wider than its overlap

- **WHEN** an 8 by 10 inch print gets a mat ⅜ inch wide with the ¼ inch overlap
- **THEN** there is no reason, and the frame is 8¼ by 10¼ inches

#### Scenario: A question with an answer

- **WHEN** an 8 by 10 inch print gets a mat 2 inches wide
- **THEN** there is no reason

## ADDED Requirements

### Requirement: The engine names the frame sold for a diploma

The engine SHALL give the usual US diploma size, 8½ by 11 inches, and the frame sold for it with a mat cut for that size, 11 by 14 inches, as checked against retail listings. A mat question whose print is the diploma size SHALL list that frame among the frames sold with a pre-cut mat for it, in catalog order; the pre-cut lookup that F4 uses SHALL NOT change.

#### Scenario: The diploma and its frame

- **WHEN** the diploma size and its frame are asked for
- **THEN** the diploma is 8½ by 11 inches and the frame is 11 by 14 inches, a catalog frame

#### Scenario: The border a diploma frame gives

- **WHEN** the mat borders are asked for the diploma in its frame
- **THEN** they are 1½ inches at the sides and 1¾ inches at the top and bottom, and the mat opening is 8 by 10½ inches

#### Scenario: A diploma-size print in the mat calculator

- **WHEN** an 8½ by 11 inch print gets a mat 1½ inches wide, or 2 inches wide
- **THEN** the frames sold with a pre-cut mat for it are the 11x14 and the 12x16, in that order; with 1½ inches the frame is 11 by 13½ inches, a custom size

#### Scenario: A diploma-size print that gets the diploma frame

- **WHEN** an 8½ by 11 inch print gets a mat 1⅝ inches wide
- **THEN** the frame is 11¼ by 13¾ inches, matched to the standard 11x14, and the frames sold with a pre-cut mat for it are the 11x14 and the 12x16

#### Scenario: F4's mat answer is unchanged

- **WHEN** F4 is given an 8 by 10½ inch mat opening
- **THEN** the frames sold with that mat are the 12x16 only, as before

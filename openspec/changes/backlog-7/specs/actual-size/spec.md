## MODIFIED Requirements

### Requirement: A check is kept on the device for the same screen

A check SHALL be saved in the browser with the screen's CSS width and height and its device pixel ratio, and SHALL be used on a later visit only while the screen's shorter side, longer side and pixel ratio are the same, so turning a phone keeps it. Nothing about the check SHALL leave the device. When the browser refuses to store it, the check SHALL still hold for the rest of the page view, and the desktop status SHALL say it is kept for this visit, never that it is saved.

#### Scenario: The same phone tomorrow

- **WHEN** the visitor returns on the same screen
- **THEN** the viewer opens with the saved scale and "Checked with a card"

#### Scenario: A turned phone

- **WHEN** the check was made at 393 × 852 CSS px and the screen now reports 852 × 393 at the same pixel ratio
- **THEN** the viewer opens with the saved scale

#### Scenario: A new pixel ratio

- **WHEN** the saved check was made at a pixel ratio of 2 and the page now runs at 3
- **THEN** the viewer ignores it and shows "Scale is a guess"

#### Scenario: A desktop check is saved

- **WHEN** a desktop visitor finishes a check and the browser stores it
- **THEN** the status reads "Saved on this device."

#### Scenario: Storage is blocked

- **GIVEN** the browser's `localStorage` throws on every write
- **WHEN** a desktop visitor finishes a check
- **THEN** the viewer uses the checked scale, the status reads "Kept for this visit." and not "Saved on this device.", and a new page load opens on the guess

### Requirement: The screen size can set the scale

The check SHALL let the visitor pick the screen's diagonal from a list or type it, and SHALL set the scale to the screen's diagonal in CSS pixels divided by that length. The list SHALL be 5.4, 6.1, 6.3, 6.7 and 6.9 in on a phone; 8.3, 10.2, 10.9, 11, 12.4, 12.9 and 13 in on a tablet (a screen the size engine counts as a tablet, the one it guesses at 11 in); and 13.3, 14, 15.6, 21.5, 23, 24, 27 and 32 in on a desktop.

#### Scenario: A 6.1 in phone

- **WHEN** a phone whose screen is 393 × 852 CSS px picks 6.1 in
- **THEN** the scale is √(393² + 852²) ÷ 6.1 ≈ 153.8 px per inch

#### Scenario: A length that is not a number

- **WHEN** the visitor types "abc" or 0 as the screen size
- **THEN** the scale stays as it was

#### Scenario: A size the screen cannot have

- **WHEN** the typed size gives a scale outside 60 to 240 px per inch (100 to 200 on a touch screen), such as 50 in on a 1920 × 1080 screen
- **THEN** the scale and the picked size stay as they were, and the button that finishes the check names the size it uses ("Use 27 in")

#### Scenario: An 11 in tablet

- **GIVEN** a screen of 820 × 1180 CSS px with a coarse pointer, shown in the desktop layout
- **WHEN** the visitor opens the screen-size step
- **THEN** it offers 8.3, 10.2, 10.9, 11, 12.4, 12.9 and 13 in, and picking 10.9 in sets the scale to √(820² + 1180²) ÷ 10.9 ≈ 131.8 px per inch

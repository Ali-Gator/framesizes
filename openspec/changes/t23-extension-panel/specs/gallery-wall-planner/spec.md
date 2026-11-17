# Spec Delta

## MODIFIED Requirements

### Requirement: A frame's size is changed in place

Selecting a frame SHALL offer "Change size" with F2's size picker. The option to change every other frame of the same size SHALL be on by default. Frames SHALL be lettered A, B, C in the template's order. With the whole group selected, the selection block SHALL list the layout's sizes, largest first, each with its frames' letters and a "Change" button that opens the picker for every frame of that size.

#### Scenario: Changing every 8x10 at once

- **GIVEN** the default state
- **WHEN** frame A is changed to 5x7 with the option left on
- **THEN** frames A, B, D and E are 5x7 and the group is laid out again

#### Scenario: Changing a size with All frames selected

- **GIVEN** the default state, with the whole group selected
- **WHEN** the selection block is shown
- **THEN** it lists "18 × 24 in" for frame C, then "8 × 10 in" for frames A, B, D and E, each with "Change"
- **AND** picking 11x14 from the 8 × 10 in row's "Change" makes frames A, B, D and E 11x14, keeps frame C 18x24, and lays the group out again

## ADDED Requirements

### Requirement: The widget fits a 360 px column

In a 360 px wide column, each template picture SHALL sit inside its button with clear space on every side, and the nail table SHALL fit without scrolling sideways. On the desktop layout, the nail table SHALL fit its side column.

#### Scenario: Template pictures and the nail table at 360

- **GIVEN** `/gallery-wall-planner` at 360 × 740, in the Nail marks view with All frames on one nail with a 2 in drop
- **WHEN** the template pictures and the nail table are measured
- **THEN** every template picture's box lies inside its button's padding box, and the nail table is no wider than its container

#### Scenario: The nail table on the desktop

- **GIVEN** `/gallery-wall-planner` at 1280 × 800, in the Nail marks view with All frames on one nail with a 2 in drop
- **WHEN** the nail table is measured
- **THEN** it is no wider than its container

### Requirement: Backing out of the upload keeps the layout

Leaving the upload step with no photo picked SHALL return to the wall the visitor came from with the layout as it was: hand moves, added and removed frames, sizes and the group's move kept, and no question asked.

#### Scenario: Back to the sample room before picking a photo

- **GIVEN** the default state with frame A moved and a frame added
- **WHEN** "Use my wall photo" is pressed and then "Back to the sample room", with no photo picked
- **THEN** the six frames are where they were and no dialog is shown

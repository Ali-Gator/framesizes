## ADDED Requirements

### Requirement: Frame letters read on any frame

On the Layout drawing and the nail map, each frame's letter SHALL sit on a paper chip with a 1 px border, centred on the frame, between 12 px and 20 px tall and growing with the frame. On the drawing, the selected frame's chip SHALL be ink.

#### Scenario: Letters on the sample wall at 1280

- **GIVEN** `/gallery-wall-planner` at 1280 × 800 on the default template
- **WHEN** frame A's letter is measured
- **THEN** its font size is at least 12 px, its chip's centre is within 1 px of its frame's centre, and its chip's computed background is the paper colour

#### Scenario: A small frame on a phone

- **GIVEN** `/gallery-wall-planner` at 360 × 740, with frame B changed to 4x6
- **WHEN** frame B's letter is measured
- **THEN** its font size is 12 px and its chip is centred on frame B

#### Scenario: The selected frame's letter

- **GIVEN** `/gallery-wall-planner` at 1280 × 800
- **WHEN** frame A is selected
- **THEN** frame A's chip background is the ink colour, and frame B's is the paper colour

#### Scenario: Letters on the nail map

- **GIVEN** `/gallery-wall-planner` at 1280 × 800 in the Nail marks view
- **WHEN** frame A's letter on the map is measured
- **THEN** its font size is at least 12 px and its chip is centred on frame A's map outline

### Requirement: The Layout view's settings sit under the drawing

In the Layout view, the template pictures, the gap row (with its note) and the actions (the photo button, "Add a frame", "Start over" and the 12-frame note) SHALL sit in the main column, under the summary. The side column SHALL hold only the Select chips and the selection block. No control SHALL be removed or renamed. While the size picker is open it SHALL take the side column, and the main column's settings SHALL hide. The Nail marks view SHALL keep its layout.

#### Scenario: The columns at 1280

- **GIVEN** `/gallery-wall-planner` at 1280 × 800 on the default template, the whole group selected
- **WHEN** the Layout view is measured
- **THEN** the template pictures, the gap field and "Use my wall photo" are inside `.g-main`, the Select chips and the selection block are inside `.g-side`, and the two columns' bottoms differ by less than 160 px

#### Scenario: The stacked order on a phone

- **GIVEN** `/gallery-wall-planner` at 360 × 740
- **WHEN** the controls' top edges are compared
- **THEN** they run in this order: the drawing, "Get nail marks", the template pictures, the gap field, "Use my wall photo", the "All 5" chip, the selection's first distance field

#### Scenario: The picker takes the side column

- **GIVEN** `/gallery-wall-planner` at 1280 × 800 with frame A selected
- **WHEN** "Change size" is pressed
- **THEN** the size picker shows in `.g-side`, and the template pictures and the gap field are not shown

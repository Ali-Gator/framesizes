# Spec Delta

## MODIFIED Requirements

### Requirement: A new frame is placed beside the selected one

The engine SHALL place a new frame 3 inches to the right of the selected frame with their centres level. When it would leave the wall's bounds, cross a wall edge the visitor marked, or overlap another frame or furniture there, it SHALL go 3 inches to the left instead. When neither side fits, or no frame is selected, it SHALL be centred between the marked side edges, else across the bounds, with its centre 57 inches above the floor, or in the middle of the bounds when the floor is unknown.

#### Scenario: A frame added beside the demo frame

- **GIVEN** the demo room with its 16x20 selected
- **WHEN** an 11x14 frame, its outside 13 by 16 inches, is added
- **THEN** it sits with its left edge at 84 inches and its bottom edge at 45 inches

#### Scenario: No room on the right

- **GIVEN** a wall 144 by 96 inches and the selected frame, outside 18 by 22 inches, at (120, 42)
- **WHEN** a frame of the same size is added
- **THEN** it sits with its left edge at 99 inches and its bottom edge at 42 inches

#### Scenario: A marked wall edge on the right

- **GIVEN** a photo 200 by 100 inches with the wall's right edge marked at 130 inches and no other edge, and the selected frame, outside 18 by 22 inches, at (105, 42)
- **WHEN** a frame of the same size is added
- **THEN** it sits with its left edge at 84 inches and its bottom edge at 42 inches, because on the right it would cross the marked edge

#### Scenario: Centred between the marked side edges

- **GIVEN** a photo 200 by 100 inches with the wall's edges marked at 20 and 130 inches, no floor, and no frame selected
- **WHEN** a frame with its outside 18 by 22 inches is added
- **THEN** it sits with its left edge at 66 inches and its bottom edge at 39 inches

## ADDED Requirements

### Requirement: A snap never takes a frame past the wall's bounds

When the engine is given the wall a frame is dragged on, it SHALL NOT make a snap that would put any part of the frame outside the wall's bounds. On that axis the nearest pair that keeps the frame inside SHALL win, and with none the frame SHALL stay where it was moved.

#### Scenario: A snap that would leave the wall

- **GIVEN** a wall 144 by 96 inches and frame A with its outside 18 by 22 inches at (117.4, 42)
- **WHEN** frame B, the same size, is moved to (125.5, 10) on that wall
- **THEN** B stays at (125.5, 10) and no line is returned, because lining up with A would put B's right edge at 144.4 inches

### Requirement: An exact snap tie goes to the first pair

When two pairs on one axis are exactly as close, the engine SHALL prefer the dragged frame's left or bottom edge over its centre, and its centre over its right or top edge. For the same edge of the dragged frame, the target listed first SHALL win.

#### Scenario: A tie between two frames

- **GIVEN** a wall 144 by 96 inches, frame A with its outside 18 by 22 inches at (40, 42) and frame C the same size at (77, 42)
- **WHEN** frame B, the same size, is moved to (58.5, 70), its left edge half an inch from A's right edge and its right edge half an inch from C's left edge
- **THEN** B snaps to (58, 70), with one vertical line at 58 inches and no horizontal line

### Requirement: The gallery wall planner offers five templates

The engine SHALL offer five gallery wall templates, each a name and catalog frame sizes arranged in nested rows and columns. A laid-out template SHALL list its frames in the order its rows and columns name them: a row from left to right, a column from top to bottom.

#### Scenario: The five templates

- **WHEN** the templates are listed
- **THEN** they are, in this order:
  - "Row of three": three 11x14 in a row
  - "Grid of four": two rows of two 11x14
  - "Grid of nine": three rows of three 8x10
  - "One big, two on each side": two 8x10 stacked, an 18x24, two 8x10 stacked
  - "Two rows": 11x14, 16x20 and 11x14 over three landscape 8x10

#### Scenario: Every template frame is in the catalog

- **WHEN** every template's frames are looked up
- **THEN** each one is a catalog size in the orientation the template names

### Requirement: A template is laid out with one gap between neighbours

The engine SHALL lay out a template with one gap, 3 inches unless the visitor sets another, between neighbours. A row SHALL run left to right with centres level. A column SHALL run top to bottom with centres aligned. Each frame SHALL take its outside size, the catalog size plus 1 inch on each side. A negative or non-numeric gap, an unknown size or an empty row or column SHALL give no layout.

#### Scenario: The row of three above the demo sofa

- **GIVEN** the demo room
- **WHEN** "Row of three" is laid out above the sofa with the 3 inch gap
- **THEN** the frames, each 13 by 16 inches, sit at (49.5, 42), (65.5, 42) and (81.5, 42)

#### Scenario: A narrower gap

- **GIVEN** the demo room
- **WHEN** "Row of three" is laid out above the sofa with a 2 inch gap
- **THEN** the frames sit at (50.5, 42), (65.5, 42) and (80.5, 42)

#### Scenario: A big frame centred between two stacks

- **GIVEN** the demo room
- **WHEN** "One big, two on each side" is laid out above the sofa with the 3 inch gap
- **THEN** the group is 46 by 27 inches with its left edge at 49 inches
- **AND** the left stack's frames sit at (49, 57) and (49, 42), the 18x24 at (62, 42.5), and the right stack's at (85, 57) and (85, 42)

#### Scenario: A layout that cannot be made

- **WHEN** a template is laid out with a gap of -1 inch, or a gap that is not a number, or with a size outside the catalog, or with an empty row
- **THEN** no layout is returned

### Requirement: A gallery group hangs above furniture or on the centre line

The engine SHALL place a laid-out group above a piece of furniture when one is given: centred on it, with the group's bottom edge 8 inches above its top. With no furniture, the group SHALL be centred between the wall's known side edges, else across the bounds, with its centre 57 inches above a known floor, or in the middle of the bounds when the floor is unknown.

#### Scenario: Centred on the 57 inch line

- **GIVEN** a wall 144 by 96 inches with its floor known and no furniture
- **WHEN** "Grid of nine" is laid out with the 3 inch gap
- **THEN** the group is 36 by 42 inches, from 54 to 90 inches across and 36 to 78 inches up
- **AND** its first frame sits at (54, 66) and its last at (80, 36)

#### Scenario: A photo with no floor

- **GIVEN** a photo 120 by 80 inches with no edge marked
- **WHEN** "Grid of four" is laid out with the 3 inch gap
- **THEN** the frames sit at (45.5, 41.5), (61.5, 41.5), (45.5, 22.5) and (61.5, 22.5)

### Requirement: Nail marks come from the frame's hanger

The engine SHALL give a frame's nail marks on the wall from its hanger. One hanger, a wire or a sawtooth, SHALL give one nail at the frame's centre, its drop below the top edge. Two D-rings SHALL give two nails, each its inset in from a side and its drop below the top edge. The engine SHALL hold no default drop or inset. A drop that is negative or not less than the frame's height, or an inset that is not more than 0 and less than half its width, SHALL give no nail.

#### Scenario: One nail

- **GIVEN** a frame with its outside 13 by 16 inches at (49.5, 42)
- **WHEN** it hangs on one hanger with a 2 inch drop
- **THEN** its nail is at (56, 56)

#### Scenario: Two D-rings

- **GIVEN** a frame with its outside 20 by 26 inches at (62, 42.5)
- **WHEN** it hangs on two D-rings with a 3 inch drop and a 4 inch inset
- **THEN** its nails are at (66, 65.5) and (78, 65.5)

#### Scenario: A hanger that gives no nail

- **GIVEN** a frame with its outside 20 by 26 inches
- **WHEN** its drop is -1 or 26 inches, or its D-rings' inset is 0 or 10 inches
- **THEN** no nail is returned

### Requirement: A gallery group is measured for hanging

The engine SHALL measure a group of frames for hanging: its width and height; its top edge's height above the floor when the floor is known; and its gap to each known side edge of the wall, negative when it runs past. For every nail it SHALL give the distance right of the group's left edge, down from its top edge, and above the floor when the floor is known. Nails SHALL be listed top to bottom, then left to right.

#### Scenario: The row of three in the demo room

- **GIVEN** "Row of three" laid out above the demo sofa, each frame on one hanger with a 2 inch drop
- **WHEN** the group is measured
- **THEN** it is 45 by 16 inches, its top edge 58 inches above the floor, 49.5 inches from the wall's left edge and 49.5 inches from its right edge
- **AND** its nails are 6.5, 22.5 and 38.5 inches right of the group's left edge, each 2 inches down from its top edge and 56 inches above the floor

#### Scenario: A group on a photo with no edge marked

- **GIVEN** "Grid of four" laid out on a photo 120 by 80 inches with no edge marked, each frame on one hanger with a 2 inch drop
- **WHEN** the group is measured
- **THEN** it is 29 by 35 inches, with no height above the floor and no gap to a side edge
- **AND** its nails, in order, are 6.5 and 22.5 inches across at 2 inches down, then 6.5 and 22.5 inches across at 21 inches down, with no height above the floor

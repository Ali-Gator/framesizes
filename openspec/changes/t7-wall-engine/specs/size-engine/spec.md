# Spec Delta

## ADDED Requirements

### Requirement: The wall tool offers seven known things to set the scale

The engine SHALL offer seven things a visitor can mark on a wall photo to set its scale, in this order, each naming the edge to mark: the wall's width from corner to corner, a door's height from the floor to its top edge, a sofa's width along the top of its back, a bed's width along the top of its mattress, the long edge of a Letter sheet, the long edge of an A4 sheet and the long edge of a credit card.

#### Scenario: The list of known things

- **WHEN** the list of known things is read
- **THEN** it holds the wall, a door, a sofa, a bed, a Letter sheet, an A4 sheet and a credit card, in that order, and each names the edge the visitor marks

#### Scenario: The sofa and the bed are marked along their top

- **WHEN** the edges of the sofa and the bed are read
- **THEN** the sofa's edge runs along the top of its back and the bed's along the top of its mattress

#### Scenario: Standard objects have fixed lengths

- **WHEN** the lengths of the Letter sheet, the A4 sheet and the credit card are read
- **THEN** they are 11 inches, 297 mm and 85.6 mm, and none of them can be changed by the visitor

### Requirement: A known thing's default length follows the visitor's unit

The engine SHALL give the door, the sofa and the bed a default length that the visitor can change, chosen for the visitor's unit: a US default in inches and a European default in centimetres. The wall SHALL have no default length.

#### Scenario: Defaults in inches

- **WHEN** the default lengths are asked for in inches
- **THEN** the door is 80 in, the sofa 84 in, the bed 60 in, and the wall has none

#### Scenario: Defaults in centimetres

- **WHEN** the default lengths are asked for in centimetres
- **THEN** the door is 200 cm, the sofa 213 cm, the bed 160 cm, and the wall has none

### Requirement: Two marked points and a real length give the photo's scale

The engine SHALL compute a photo's scale in pixels per inch as the straight-line distance in pixels between two marked points divided by the real length between them. It SHALL give no scale when the two points are the same point or the length is not a positive finite number.

#### Scenario: A door marked on a photo

- **WHEN** a door is marked from pixel (600, 100) to pixel (600, 500) with its height of 80 inches
- **THEN** the scale is 5 pixels per inch

#### Scenario: A slanted mark

- **WHEN** a known thing is marked from pixel (0, 0) to pixel (300, 400) with a length of 100 inches
- **THEN** the scale is 5 pixels per inch

#### Scenario: A mark that gives no scale

- **WHEN** both marked points are the same pixel, or the length is 0, negative or not a number
- **THEN** no scale is given

### Requirement: A photo's size and a frame's place convert between inches and pixels

The engine SHALL give a photo's width and height in inches from its size in pixels and its scale. It SHALL map a rectangle given in inches, measured from the photo's bottom-left corner, to pixels measured from the photo's top-left corner.

#### Scenario: The photo's size in inches

- **WHEN** a photo 1200 by 900 pixels has a scale of 5 pixels per inch
- **THEN** it shows a wall area 240 inches wide and 180 inches high

#### Scenario: A frame's place in pixels

- **WHEN** a frame whose outside is 18 by 22 inches sits with its left edge 20 inches and its bottom edge 50 inches from the bottom-left corner of that photo
- **THEN** in pixels its left edge is at 100, its top edge at 540, and it is 90 wide and 110 high

### Requirement: The demo room needs no marking

The engine SHALL describe a demo room in inches, so a visitor without a photo starts at a known scale: a wall 144 wide and 96 high, the F1 sofa (84 wide, its back 34 high) centred on it, and a 16x20 frame hung above the sofa by the F1 rule.

#### Scenario: The demo room opens with a 16x20 above the sofa

- **WHEN** the demo room is read
- **THEN** the sofa spans 30 to 114 inches from the wall's left edge, and the frame's outside is 18 by 22 inches with its left edge at 63, its bottom edge at 42 and its top edge at 64 inches

### Requirement: A frame's distances run to the nearest thing in line with it

The engine SHALL give a frame's four distances, left, right, above and below. Each runs to the nearest frame or piece of furniture that lies wholly on that side and is in line with the frame, meaning their spans on the other axis share more than an edge. When nothing on that side is in line with the frame, the distance runs to the wall's edge on that side if that edge is known, and otherwise that side has no distance. All four edges of the demo room are known.

#### Scenario: A photo with no edge marked

- **GIVEN** a photo 1200 by 900 pixels at 5 pixels per inch with no floor line and no wall width marked, frame A with its outside 18 by 22 inches at (100, 40), and frame B the same size at (130, 40)
- **WHEN** A's distances are read
- **THEN** A's right distance is 12 inches to frame B, and A has no left, above or below distance

#### Scenario: Two frames side by side

- **GIVEN** a wall 144 by 96 inches, frame A with its outside 18 by 22 inches and its bottom-left corner at (40, 42), and frame B the same size at (60, 42)
- **WHEN** their distances are read
- **THEN** A's right distance and B's left distance are 2 inches, A's left distance is 40 and B's right distance is 66

#### Scenario: A frame that is not in line

- **GIVEN** the same wall and frame A, and frame B the same size with its bottom-left corner at (60, 70)
- **WHEN** A's distances are read
- **THEN** A's right distance runs to the wall's edge and is 86 inches

#### Scenario: The frame in the demo room

- **WHEN** the distances of the demo room's frame are read
- **THEN** below it is 8 inches to the sofa's back, above it 32 inches, and left and right 63 inches each

### Requirement: Setting a distance moves only that frame

The engine SHALL set one of a frame's distances by moving only that frame along that axis. A negative value SHALL count as zero. The frame SHALL stop at the wall's edge (the photo's border where that edge is unknown) or at the first frame or furniture in line with it on the side it moves toward. A side with no distance SHALL leave the frame in place.

#### Scenario: A gap on a photo with no edge marked

- **GIVEN** the photo with no edge marked: frame A 18 by 22 inches at (100, 40), frame B the same size at (130, 40)
- **WHEN** A's right distance (12 inches) is set to 200
- **THEN** A's left edge stops at the photo's left border, 0, and B does not move

#### Scenario: A side with no distance

- **GIVEN** the photo with no edge marked and frame A at (100, 40)
- **WHEN** A's distance above is set to 5 inches
- **THEN** A stays at (100, 40)

#### Scenario: A gap is widened

- **GIVEN** the side-by-side wall: 144 by 96 inches, frame A 18 by 22 at (40, 42), frame B the same size at (60, 42)
- **WHEN** A's right distance (2 inches) is set to 3
- **THEN** A's left edge moves from 40 to 39 inches and B does not move

#### Scenario: A distance that would push the frame off the wall

- **GIVEN** the side-by-side wall
- **WHEN** A's right distance is set to 100 inches
- **THEN** A's left edge stops at the wall's left edge, 0

#### Scenario: A distance that would push the frame through another

- **GIVEN** the side-by-side wall
- **WHEN** A's left distance is set to 50 inches
- **THEN** A stops against B: its left edge is at 42 and its right distance is 0, and B does not move

#### Scenario: A negative distance

- **GIVEN** the side-by-side wall
- **WHEN** A's left distance is set to -5
- **THEN** A's left edge is at the wall's left edge, 0

#### Scenario: The demo frame is raised above the sofa

- **WHEN** the demo room frame's distance below is set to 10 inches
- **THEN** its bottom edge moves from 42 to 44 inches

### Requirement: A photo's known edges come from what the visitor marks

The engine SHALL take a photo's wall edges from the visitor's marks, converting each marked point from photo pixels (measured from the top-left corner) to wall inches (measured from the bottom-left corner). A floor line SHALL give the bottom edge. When the wall is the known thing, the two ends of its mark SHALL give the left and right edges. The top edge of a photo's wall SHALL stay unknown.

#### Scenario: The floor line

- **GIVEN** a photo 1200 by 900 pixels at 5 pixels per inch and frame A with its outside 18 by 22 inches at (100, 40)
- **WHEN** the floor line is marked at pixel row 850
- **THEN** the bottom edge is at 10 inches, and A's distance below is 30 inches to the floor

#### Scenario: The wall's width gives its side edges

- **GIVEN** a photo 1200 by 900 pixels and frame A with its outside 18 by 22 inches at (100, 40)
- **WHEN** the wall is marked from pixel (100, 400) to pixel (1100, 400) with its width of 200 inches
- **THEN** the scale is 5 pixels per inch, the left edge is at 20 inches and the right edge at 220 inches, and A's left distance is 80 inches and its right distance 102 inches

### Requirement: A marked sofa or bed becomes furniture on the photo

The engine SHALL turn a sofa or a bed marked as the known thing into a piece of furniture on the photo: as wide as the mark, and reaching from the floor line, or from the photo's bottom edge when no floor line is marked, up to the height of the mark's middle.

#### Scenario: A frame above a marked sofa

- **GIVEN** a photo 1200 by 900 pixels with no floor line
- **WHEN** the sofa is marked from pixel (300, 600) to pixel (720, 600) with its width of 84 inches, and frame A with its outside 18 by 22 inches sits at (80, 68)
- **THEN** the scale is 5 pixels per inch, the sofa spans 60 to 144 inches with its top at 60 inches, and A's distance below is 8 inches to the sofa

### Requirement: A dragged frame snaps to the edges and centres around it

The engine SHALL snap a frame being moved: on each axis, when one of its edges or its centre lies within 1 inch of an edge or the centre of another frame, or of a piece of furniture's centre on the horizontal axis, the frame SHALL move so the two line up. The nearest pair SHALL win on each axis. The engine SHALL return every line the moved frame lines up on after the snap, so the page can draw them, and SHALL leave the frame where it is on an axis with nothing within 1 inch.

#### Scenario: A frame snaps beside another

- **GIVEN** a wall 144 by 96 inches and frame A with its outside 18 by 22 inches at (40, 42)
- **WHEN** frame B, the same size, is moved to (58.6, 42.6)
- **THEN** B snaps to (58, 42), with a vertical line at 58 inches and horizontal lines at 42, 53 and 64 inches, every line where B lines up with A

#### Scenario: A frame snaps to the sofa's centre

- **GIVEN** the demo room
- **WHEN** its frame is moved to a left edge of 63.7 inches, its bottom edge unchanged
- **THEN** its left edge snaps to 63, so its centre lines up with the sofa's centre at 72 inches

#### Scenario: Nothing within an inch

- **GIVEN** the wall with frame A at (40, 42)
- **WHEN** frame B is moved to (80, 70)
- **THEN** B stays at (80, 70) and no line is returned

### Requirement: A new frame is placed beside the selected one

The engine SHALL place a new frame 3 inches to the right of the selected frame with their centres level. When it would leave the wall's bounds or overlap another frame or furniture there, it SHALL go 3 inches to the left instead. When neither side fits, or no frame is selected, it SHALL be centred across the bounds with its centre 57 inches above the floor, or in the middle of the bounds when the floor is unknown.

#### Scenario: A frame added beside the demo frame

- **GIVEN** the demo room with its 16x20 selected
- **WHEN** an 11x14 frame, its outside 13 by 16 inches, is added
- **THEN** it sits with its left edge at 84 inches and its bottom edge at 45 inches

#### Scenario: No room on the right

- **GIVEN** a wall 144 by 96 inches and the selected frame, outside 18 by 22 inches, at (120, 42)
- **WHEN** a frame of the same size is added
- **THEN** it sits with its left edge at 99 inches and its bottom edge at 42 inches

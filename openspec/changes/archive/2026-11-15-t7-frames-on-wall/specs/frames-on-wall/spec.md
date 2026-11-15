# Spec Delta

## ADDED Requirements

### Requirement: The page follows the approved outline

The HTML the server returns for `/frame-sizes-on-wall` SHALL hold, in this order: the breadcrumbs, the single `h1`, the answer paragraph, the widget titled "Frame visualizer", the canvas's four content sections under their `h2` headings, and "Related tools" (`h2`) while a related page is live.

#### Scenario: The heading outline of the server HTML

- **WHEN** `/frame-sizes-on-wall` is requested
- **THEN** the response HTML holds the `h1` "Frame Sizes on Your Wall", then the widget title "Frame visualizer", then the `h2` headings "How to see frame sizes on your wall", "Picture frame sizes on a wall: how big to go", "Wall photo frame sizes" and "Questions about frames on a wall" in that order
- **AND** a four-item ordered list of steps under the first of them, and one `h3` per question, five in all

### Requirement: The first paragraph answers how big a frame should be

The paragraph under the `h1` SHALL give the hanging rule:

- art about two-thirds as wide as the furniture below it;
- 8 to 10 in (20 to 25 cm) above the furniture.

It SHALL name the "frame visualizer". At 360 × 740 the `h1`, this paragraph and the top of the widget SHALL be visible without scrolling.

#### Scenario: The answer in the server HTML

- **WHEN** `/frame-sizes-on-wall` is requested
- **THEN** the first paragraph after the `h1` contains "two-thirds", "8 to 10 in", "20 to 25 cm" and "frame visualizer"

#### Scenario: The first screen on a small phone

- **WHEN** the page is opened at 360 × 740
- **THEN** the `h1`, the answer paragraph and the widget's title are inside the viewport without scrolling

### Requirement: The wall table lists the space six sizes take

The "Wall photo frame sizes" section SHALL hold one table captioned "Wall art frame sizes and the space they take". It SHALL have a row for each of 5x7, 8x10, 11x14, 16x20, 18x24 and 24x36. Each row SHALL give:

- the frame size;
- the wall area it covers with a 1 in (2.5 cm) moulding, computed by the size engine;
- where it works.

The table's rows SHALL NOT be selectable.

#### Scenario: The table in the server HTML

- **WHEN** `/frame-sizes-on-wall` is requested
- **THEN** the table holds six body rows, and the 16x20 row reads "16 × 20 in", "18 × 22 in" and "Above a small table, or in a pair", with "40.6 × 50.8 cm" and "45.7 × 55.9 cm" also in the HTML
- **AND** no row holds a radio or a checkbox

### Requirement: The widget opens in the sample room with the 16x20 selected

Without a photo, the widget SHALL show the sample room: a 12 × 8 ft (366 × 244 cm) wall with the sofa, and the 16x20 hung above it. The 16x20 SHALL start selected. Its four distances SHALL be shown: below 8 in to the sofa, above 32 in, and left and right 63 in each. All of this SHALL be in the server HTML as well as after loading. The drawing's accessible name SHALL describe the room and the frames on the wall, and SHALL follow every change.

#### Scenario: The default state in the server HTML

- **WHEN** `/frame-sizes-on-wall` is requested
- **THEN** the response HTML holds the sample room drawing named starting "Sample room: a wall 144 by 96 in with a sofa", one frame button for the 16x20 marked as pressed, and the distances 8, 32, 63 and 63 in

### Requirement: Every number shows in the visitor's unit

Every length on the page SHALL be in the server HTML in both inches and centimetres, and only the unit the visitor chose SHALL be visible. This covers the copy, the table, the questions and the widget. Frame sizes SHALL keep the size engine's one-decimal centimetres. The widget's distances SHALL round to the nearest ¼ in, or to whole centimetres.

#### Scenario: The sample room in centimetres

- **WHEN** the visitor has chosen "cm" and opens the page
- **THEN** the selected 16x20's distances read 20 cm below, 81 cm above and 160 cm left and right, and no "in" length is visible on the page

#### Scenario: Both units in the HTML

- **WHEN** `/frame-sizes-on-wall` is requested
- **THEN** the response HTML holds "8 to 10 in" and "20 to 25 cm", and "18 × 22 in" and "45.7 × 55.9 cm"

### Requirement: Setting a distance moves the selected frame

Each of the selected frame's four distances SHALL have a less button and a more button, which step by ¼ in (1 cm), and a field that takes a decimal or a fraction and applies it on Enter or when the field is left. Only the selected frame SHALL move, by the size engine's rule. Text that is not a length SHALL leave the frame in place. A side with no distance SHALL show "—" and no buttons.

#### Scenario: Raising the sample frame

- **WHEN** the visitor types "10" in the selected 16x20's "Below" field and presses Enter
- **THEN** the frame's bottom edge moves up 2 in, "Below" reads 10 in and "Above" reads 30 in

#### Scenario: A fraction is typed

- **WHEN** the visitor types "8 1/4", or "8¼", in the "Below" field and leaves it
- **THEN** "Below" reads 8¼ in

#### Scenario: The more button

- **WHEN** the visitor presses "Below: ¼ in more" once
- **THEN** "Below" reads 8¼ in

#### Scenario: Text that is not a length

- **WHEN** the visitor types "abc" in the "Below" field and presses Enter
- **THEN** the frame does not move and "Below" reads 8 in again

### Requirement: Each change to a frame is announced

After a frame is moved, added, removed or has a distance set, a polite live region SHALL read the selected frame's size and its four distances.

#### Scenario: The live region after setting a distance

- **WHEN** the selected 16x20's "Below" is set to 10 in
- **THEN** the live region's text names 16x20 and reads 10 in below and 30 in above

### Requirement: Frames are added from the catalog, six at most

"Add a frame" SHALL open a size picker with every catalog size, in Portrait, Landscape and Square, showing each size and its outside size. The picked size SHALL show as a dashed outline where it will go, by the size engine's placement rule, before it is added. Adding SHALL select the new frame. The widget SHALL hold at most 6 frames. At 6, adding SHALL be replaced by a note that six is the most this page holds; the note SHALL link to the gallery wall layout planner only while that page is live.

#### Scenario: Adding an 11x14 in the sample room

- **WHEN** the visitor adds an 11x14 with the 16x20 selected
- **THEN** a second frame stands 3 in to the right of the 16x20 with its centre level, and it is selected

#### Scenario: The seventh frame

- **WHEN** six frames are on the wall
- **THEN** there is no control to add a frame, the widget says six is the most it holds, and there is no link to a page that is not live

### Requirement: Frames are dragged and snap

Pressing a frame and moving it SHALL drag it, never off the wall. Within 1 in it SHALL snap by the size engine's rule, and a line SHALL show what lines up while dragging. A tap that does not move SHALL select the frame.

#### Scenario: A drag snaps to the sofa's centre

- **WHEN** the 16x20 is dragged so its centre ends within 1 in of the sofa's centre
- **THEN** its centre lines up with the sofa's centre and a line shows it while dragging

#### Scenario: A tap selects

- **WHEN** a second frame is tapped without moving
- **THEN** it is selected and its distances are shown

### Requirement: Frames move by keyboard

Each frame on the wall SHALL be a button named by its size. With a frame focused, the arrow keys SHALL move it ¼ in (1 cm), Shift with an arrow 1 in (5 cm), and Delete SHALL remove it.

#### Scenario: Nudging with the keyboard

- **WHEN** the 16x20 is focused and the visitor presses the up arrow twice
- **THEN** its "Below" distance reads 8½ in and the frame is still selected

#### Scenario: Removing a frame

- **WHEN** a second frame is focused and the visitor presses Delete
- **THEN** that frame is gone and one frame is left

### Requirement: Small frames stay easy to pick

Every frame's hit area SHALL be at least 44 px on each side, whatever its drawn size. A list of the frames on the wall, "On the wall", SHALL select a frame without touching the drawing.

#### Scenario: A 4x6 on the sample room at 360 px

- **WHEN** a 4x6 is added at 360 px wide
- **THEN** its button's box is at least 44 × 44 px, and choosing "4x6" in "On the wall" selects it

### Requirement: A wall photo is used on the device only

"Use my wall photo" SHALL open a file input that accepts images, and on a phone it SHALL offer the camera or the gallery. The photo SHALL be read in the browser. The page SHALL NOT send the photo, or anything derived from it, over the network, SHALL NOT store it, and SHALL NOT name the file in an analytics event. The photo's accessible name SHALL be "Your wall photo". The upload step SHALL say how to take a straight-on photo.

#### Scenario: No request carries the photo

- **WHEN** the visitor picks a photo and goes through setting the scale
- **THEN** no network request carries image data (an `image/*` or multipart body, or a body over 10 KB), no request URL contains a `blob:` or `data:` URL, and no request names the file

### Requirement: Step 1 of the scale picks a known thing

After a photo is picked, the widget SHALL show "Set the scale · 1 of 3" with the size engine's seven known things in its order, each naming the edge to mark, the door selected by default.

#### Scenario: The door by default

- **WHEN** a photo is picked
- **THEN** step 1 of 3 lists the wall, a door, a sofa, a bed, a Letter sheet, an A4 sheet and a credit card, with the door selected

### Requirement: Step 2 of the scale places the two ends

Step 2 SHALL show two handles, each at least 44 px, to drag to the ends of the known thing. While a handle moves, a loupe SHALL show the point at 3×. A focused handle SHALL move 1 px with an arrow key and 10 px with Shift and an arrow. Back SHALL return to step 1.

#### Scenario: Moving a handle by keyboard

- **WHEN** a handle is focused and the visitor presses Shift and the right arrow
- **THEN** the handle's end moves 10 px right in the full-size photo

### Requirement: Step 3 of the scale confirms the length

Step 3 SHALL ask for the known thing's length. The door, sofa and bed SHALL start at the size engine's default in the visitor's unit, and the visitor's value SHALL win. The wall SHALL start empty and the scale SHALL NOT be set until a length is entered. The Letter sheet, the A4 sheet and the card SHALL show their fixed length with no field.

#### Scenario: The wall has no default

- **WHEN** the visitor picks the wall and presses "Set the scale" with the field empty
- **THEN** the scale is not set and the widget says "Enter the wall's width to set the scale."

#### Scenario: The door's default in centimetres

- **WHEN** the visitor's unit is cm and the door reaches step 3
- **THEN** the field holds 200

#### Scenario: A fixed length

- **WHEN** the A4 sheet reaches step 3
- **THEN** it shows 297 mm and has no field

### Requirement: A mark too short to trust is flagged

When the marked line is shorter than 134 px in the full-size photo, the widget SHALL warn before setting the scale. At that length a 2 px slip at each end could change every size by more than 3%. The warning SHALL give the mark's length in pixels and the worst-case error in percent. It SHALL offer "Mark something longer" and "Use it anyway".

#### Scenario: A credit card on a wide photo

- **WHEN** a credit card is marked 27 px long
- **THEN** the widget shows "This mark is too short to trust", names 27 px and up to 15%, and offers both choices

### Requirement: The floor line is optional

Once the scale is set, the widget SHALL offer "Mark the floor". Without a floor line, distances on a photo SHALL run only between frames and marked furniture, and other sides SHALL show "—". With a floor line, "Below" SHALL run to the floor when nothing else is in line. The selected frame SHALL also show its centre's height from the floor.

#### Scenario: Distances before and after the floor

- **WHEN** one frame is on a photo with the scale set and no floor line, and the visitor then marks the floor
- **THEN** its "Below" reads "—" before the floor is marked, and afterwards a length to the floor and a "Centre" height

### Requirement: Start over asks first

"Start over" SHALL open a confirmation saying it takes the frames off the wall and clears the scale. It SHALL offer:

- "Start over with this photo", which keeps the photo and returns to step 1;
- "Back to the sample room";
- "Cancel", which changes nothing.

#### Scenario: Cancel keeps everything

- **WHEN** the visitor opens "Start over" and chooses "Cancel"
- **THEN** the frames, the scale and the photo are as they were

### Requirement: The widget is accessible

The drawing SHALL be one element with `role="img"` and an accessible name that follows the state. The frame buttons, handles and distance controls SHALL sit outside it, so they stay reachable. Every control SHALL be a native button, input or link with a name. With every state of the canvas reached (sample room, adding, photo, each scale step, the short-mark warning, start over), axe SHALL report no violations.

#### Scenario: No violations in the sample room and the photo flow

- **WHEN** axe runs on the page in the sample room, with the size picker open, and at each scale step
- **THEN** it reports no violations

### Requirement: The page fits a phone

At 320 px wide the page SHALL NOT scroll sideways, except inside the wall table's own box. Every widget control SHALL be at least 44 × 44 px. Loading the page SHALL shift nothing: the server HTML already holds the sample room at its final size.

#### Scenario: 320 px wide

- **WHEN** the page is opened 320 px wide
- **THEN** the document is no wider than the viewport, and every widget button, field and handle is at least 44 px in both directions

#### Scenario: No layout shift

- **WHEN** the page loads and the widget becomes interactive with no input
- **THEN** the cumulative layout shift is 0

### Requirement: The page links only to live pages

Related tools SHALL list the live Frames pages other than F2, then C1 and G1 when live, and SHALL be left out, heading included, while none is live. Text whose only purpose is to send the visitor to another page SHALL appear only when that page is live: the hanging height calculator (G3) in the rules and a question, and the gallery wall planner (G1) at six frames. Links to the frame size chart (`/`) SHALL always appear.

#### Scenario: Only the home page and F2 are live

- **WHEN** `/frame-sizes-on-wall` is requested while only F1 and F2 are live
- **THEN** Related tools holds one card, linking to `/`; no link points to `/how-high-to-hang-pictures` or `/gallery-wall-planner`; and no `href` starts with `#`

### Requirement: The description's sizes are the catalog's

The page's meta description SHALL give the number of catalog sizes, and the range it states SHALL run from the smallest to the largest rectangular size.

#### Scenario: The description against the catalog

- **WHEN** F2's description is compared with the catalog
- **THEN** it says "19 standard frame sizes", names 4x6 and 27x40, and names no size outside the catalog

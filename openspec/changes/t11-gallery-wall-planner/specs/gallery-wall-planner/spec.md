# Spec Delta

## ADDED Requirements

### Requirement: The planner page follows the approved outline

The HTML the server returns for `/gallery-wall-planner` SHALL hold, in this order: the breadcrumbs, the single `h1`, the answer paragraph, the widget titled "Gallery wall layout generator", the canvas's four content sections under their `h2` headings, and "Related tools" (`h2`) while a related page is live. It SHALL hold no shop section until the shops are chosen (T21).

#### Scenario: The planner's heading outline

- **WHEN** `/gallery-wall-planner` is requested
- **THEN** the response HTML holds the `h1` "Gallery Wall Layout Planner", then the widget title "Gallery wall layout generator", then the `h2` headings "How to use the gallery wall planner", "Gallery wall templates", "Spacing and height" and "Questions about gallery wall layouts" in that order
- **AND** a five-item ordered list of steps under the first of them, one `h3` per question, five in all, and no `h2` "Where to buy gallery wall frames"

### Requirement: The first paragraph answers how to space and hang a gallery wall

The paragraph after the `h1` SHALL give the gap between frames, the height above a sofa and the centre line on an open wall, in the visitor's unit, and say that the planner gives the group's size and every nail.

#### Scenario: The planner's answer in the server HTML

- **WHEN** `/gallery-wall-planner` is requested
- **THEN** the paragraph after the `h1` holds "2 to 3 in", "8 in" and "57 in", and "5 to 8 cm", "20 cm" and "145 cm" in the other unit's spans

### Requirement: The template table lists each template's size on the wall

The table captioned "Gallery wall layout with sizes" SHALL list the five templates in the engine's order, each with its frames, its size on the wall at the 3 inch gap with the 1 inch example moulding, and the furniture width it suits, 1.5 times the group's width. Every size SHALL come from the size engine's layout.

#### Scenario: The template table in the server HTML

- **WHEN** `/gallery-wall-planner` is requested
- **THEN** the table's rows are "Row of three" 45 × 16 in, "Grid of four" 29 × 35 in, "Grid of nine" 36 × 42 in, "One big, two on each side" 46 × 27 in and "Two rows" 50 × 35 in
- **AND** the furniture each suits is about 68, 44, 54, 69 and 75 in wide

### Requirement: The planner opens on the default template above the sofa

The widget SHALL open in the Layout view, in the sample room, with "One big, two on each side" laid out 8 inches above the sofa and the whole group selected. The server HTML SHALL hold this state: the room, the five frames, the group's distances and the summary line.

#### Scenario: The planner's default state in the server HTML

- **WHEN** `/gallery-wall-planner` is requested
- **THEN** the drawing is named "Gallery wall layout: five frames above a sofa", the picture for "One big, two on each side" is checked, and five frame buttons A to E are present
- **AND** the summary reads a group of 46 × 27 in with its top edge 69 in up, 49 in from the left and 49 in from the right, and the group's distances read 27 in to the ceiling and 8 in to the sofa

### Requirement: A template is picked from its picture

The widget SHALL show the five templates as to-scale pictures, one radio each, named by the template. Picking one SHALL lay it out with the current gap and hangers. When frames were moved or sizes changed, it SHALL ask before replacing them; otherwise it SHALL switch at once.

#### Scenario: Switching with nothing changed

- **GIVEN** the default state
- **WHEN** "Grid of nine" is picked
- **THEN** nine frames, A to I, are laid out 8 in above the sofa with no question asked

#### Scenario: Switching after a change asks first

- **GIVEN** the default state with frame A moved
- **WHEN** "Row of three" is picked
- **THEN** a dialog asks before replacing the frames, and Cancel keeps the five frames where they were

### Requirement: One gap spaces every frame

The widget SHALL hold one gap between all frames, 3 inches by default, in steps of ¼ inch or 1 cm, from 0 to 12 inches. Changing the gap or a frame's size SHALL lay the template out again and drop hand moves; when anything had been moved, a one-line note SHALL say so.

#### Scenario: A 2 inch gap in the planner

- **GIVEN** "Row of three" above the sample sofa
- **WHEN** the gap is set to 2 in
- **THEN** the frames sit at 50.5, 65.5 and 80.5 in from the wall's left edge

#### Scenario: A gap out of range

- **WHEN** the gap field gets 13 in, or -1, or text that is not a length
- **THEN** the gap stays as it was and the field says the range, 0 to 12 in

### Requirement: A frame's size is changed in place

Selecting a frame SHALL offer "Change size" with F2's size picker. The option to change every other frame of the same size SHALL be on by default. Frames SHALL be lettered A, B, C in the template's order.

#### Scenario: Changing every 8x10 at once

- **GIVEN** the default state
- **WHEN** frame A is changed to 5x7 with the option left on
- **THEN** frames A, B, D and E are 5x7 and the group is laid out again

### Requirement: The group and its frames move like F2's frames

A frame SHALL drag with snapping inside the wall, move by arrow keys, and show and set its four distances as on F2. Selecting the whole group SHALL show the group's four distances, and setting one SHALL move every frame.

#### Scenario: Hanging the group higher

- **GIVEN** the default state
- **WHEN** the group's distance to the sofa is set to 10 in
- **THEN** every frame moves up 2 in and the summary's top edge reads 71 in

### Requirement: Frames are added up to twelve

"Add a frame" SHALL add a frame beside the selected one, up to 12 frames. At 12 the button SHALL give way to the note "That's 12 frames, the most the planner holds."

#### Scenario: The twelfth frame

- **GIVEN** "Grid of nine" with three frames added
- **WHEN** the widget is shown
- **THEN** there is no "Add a frame" button and the note is shown

### Requirement: A group past the wall's edge is flagged

When the group runs past a known wall edge, the widget SHALL name the side and the amount under the drawing, show the margin as negative, and offer "Centre it on the wall" when the group fits. A group wider than the wall SHALL say by how much. On a photo with no marked edge, a group past the photo's border SHALL be flagged the same way.

#### Scenario: Past the right edge

- **GIVEN** the default group moved so its right edge is 3 in past the sample wall's
- **WHEN** the widget is shown
- **THEN** the warning names the right edge and 3 in, the summary's right margin reads −3 in, and "Centre it on the wall" puts the group 49 in from each side

#### Scenario: Wider than the wall

- **GIVEN** a photo whose marked wall edges are 38 in apart
- **WHEN** "One big, two on each side" is laid out
- **THEN** the warning reads "It is 8 in too wide. Pick smaller frames or a narrower gap." and offers no centring

### Requirement: Nail marks are numbered once a drop is typed

The Nail marks view SHALL hold "Hanger for" (All frames, or one frame), the type (One nail or Two D-rings), the drop, and for D-rings the inset. The drop and inset SHALL start empty. Without a drop it SHALL show the frames, Start and "Type the drop to number the nails." With one, numbered badges on the map SHALL match a table of Nail, Frame, Right, Down and Up from floor, in the engine's order.

#### Scenario: One nail with a 2 inch drop

- **GIVEN** the default state in the Nail marks view
- **WHEN** All frames get one nail with a 2 in drop
- **THEN** the table's rows are 1 A, 2 C, 3 D, 4 B, 5 E, and nail 2 reads 23 in right, 2½ in down and 66½ in up from the floor

#### Scenario: No drop yet

- **WHEN** the Nail marks view opens with no drop typed
- **THEN** it shows "Type the drop to number the nails." and no table

### Requirement: A frame without a nail says why

A frame whose own hanger gives no nail SHALL show the reason on its field and as one line under the table. The other frames SHALL keep their nails.

#### Scenario: A drop longer than the frame

- **GIVEN** the default state, All frames on one nail with a 2 in drop
- **WHEN** frame B is given its own 13 in drop
- **THEN** the table has four nails, for A, C, D and E, and one line says frame B's drop is longer than the frame, which is 12 in tall on the wall

### Requirement: The hanger type carries over to the next frame

Once the visitor picks One nail or Two D-rings for a frame, every frame the visitor has not given a hanger of its own SHALL start on that type when it is opened in "Hanger for", and so SHALL frames added later. The drop and the inset SHALL NOT carry over.

#### Scenario: The next frame starts on D-rings

- **GIVEN** frame C set to Two D-rings with a 3 in drop and a 4 in inset
- **WHEN** frame D is picked in "Hanger for"
- **THEN** its type reads Two D-rings and its drop and inset are empty

### Requirement: The planner shows every number in the visitor's unit

The site's in/cm toggle SHALL switch every number in the widget, typed drops and insets included. Group sizes and distances SHALL round to ¼ inch or whole centimetres, the gap SHALL show in its own step, and drops and insets SHALL keep one decimal in centimetres.

#### Scenario: The default group in centimetres

- **GIVEN** the unit is cm
- **WHEN** the default state is shown
- **THEN** the summary reads 117 × 69 cm and the gap reads 8 cm

### Requirement: The planner uses a wall photo on the device only

The widget SHALL offer "Use my wall photo" with F2's upload and three-step scale flow, unchanged. On the photo, the template SHALL hang above a marked sofa or bed, else centred between the marked wall edges, else in the middle of the photo. The photo SHALL stay on the device: no request SHALL carry its data or its name.

#### Scenario: A photo scaled from the sofa

- **GIVEN** a wall photo scaled from a marked sofa
- **WHEN** the scale is confirmed
- **THEN** "One big, two on each side" sits 8 in above the sofa, and no request made since the photo was picked carries image data or the file's name

### Requirement: The planner is accessible

The room drawing and the nail map SHALL be `role="img"` with names that follow the state, with the frame buttons in a sibling layer. The template pictures, the view switch and the hanger type SHALL be radio groups, "Hanger for" a native select, and the nail list a table. A polite live region SHALL read the selection's distances after each change. Controls SHALL be at least 44 px.

#### Scenario: No detectable violations

- **WHEN** axe runs on the default state, the Nail marks view with nails, and the warning state
- **THEN** it reports no violations

### Requirement: The planner fits a phone

On a 360 × 740 screen the `h1`, the answer and the top of the widget SHALL show without scrolling. At 320 px wide the page SHALL NOT scroll sideways.

#### Scenario: The first screen at 360

- **WHEN** `/gallery-wall-planner` is opened at 360 × 740
- **THEN** the `h1`, the answer paragraph and the widget's title and room drawing are in the first screen

### Requirement: The planner links only to live pages

Related tools SHALL list the live Gallery wall pages other than G1, then F1 and F2, and SHALL be left out, heading included, while none is live. Links to the hanging height calculator (G3) in the rules and a question SHALL appear only when G3 is live.

#### Scenario: The planner with F1, F2 and G1 live

- **WHEN** `/gallery-wall-planner` is requested while only F1, F2 and G1 are live
- **THEN** Related tools holds two cards, linking to `/` and `/frame-sizes-on-wall`; no link points to `/how-high-to-hang-pictures`, `/gallery-wall-ideas` or `/guides/how-to-make-a-gallery-wall`; and no `href` starts with `#`

### Requirement: The planner's description matches the widget

Every verb in the page's meta description (pick a template, set the spacing, nail positions) SHALL name a control or an output the widget has.

#### Scenario: The description against the widget

- **WHEN** the description is checked against the widget
- **THEN** the widget has a template picker, a gap field and a numbered nail list

# gallery-wall-planner Specification

## Purpose

The G1 page, `/gallery-wall-planner`: the gallery wall layout generator lays out one of five templates of standard frames with one gap, on the sample wall or the visitor's wall photo, and gives the group's size, its distances and a numbered spot for every nail. Every length comes from the size engine.

## Public Interface

```typescript
// apps/web/src/components/gallery-wall/state.ts (pure reducer over the gallery engine)
const DEFAULT_TEMPLATE = "one-big-two-each-side";
const MAX_FRAMES = 12;
const GAP_MAX = 12; // inches
interface PlannerState extends PhotoSlice {
  view: "layout" | "nails";
  template;
  sizes;
  gap;
  gapError;
  moved;
  group;
  added;
  removed;
  selected;
  picker;
  hangers: { all: Hanger; byFrame: Record<string, Hanger> };
  lastType;
  hangerFor;
  draft;
  confirmSwitch;
  confirmReset;
  nextId;
  revision;
}
function initialState(): PlannerState;
function reducer(state: PlannerState, action: Action): PlannerState;
function framesOf(state): PlannerFrame[]; // derived: layout, hand moves, added frames, group move
function measureOf(state): GroupMeasure | null; // each frame on its own hanger, else All frames'
function distancesOf(state): Record<Side, { value: number; to: Target } | null>; // frame or group
function warningOf(state): Warning | null; // wide | right | left | ceiling | floor | photo
function formHanger(state): Hanger; // what "Hanger for" shows, with the type carry-over
function templateTable(): { id; name; w; h; fits }[]; // at GALLERY_GAP, fits = 1.5 × w
function sizesOf(frames): { size; frames }[]; // the whole group's sizes, largest first
// Action also holds { type: "openGroupSize"; size } (picker mode "group-size") and
// RestorePhoto { type: "restorePhoto"; photo; known; marks; floor; scale } (the extension only)

// apps/web/src/components/gallery-wall/gallery-wall.tsx — the client island:
function GalleryWall(props?: {
  variant?: "page" | "panel" | "tab"; // default "page"; panel: no title, no card edges; tab: no title
  state?: PlannerState; // controlled, with dispatch; both or neither
  dispatch?: (action: Action) => void;
}): JSX.Element;
// apps/web/src/components/gallery-wall/nail-marks.tsx — the Nail marks view (next/dynamic)
// apps/web/src/components/gallery-wall/copy.ts — warnings, no-nail lines, template frame lists
// apps/web/src/app/gallery-wall-planner/ — page.tsx, opengraph-image.tsx, gallery.css
```

## Behavior

- Rectangles are never stored: the template is laid out by `layoutTemplate` with the size overrides and the gap, then hand moves, then added frames, all shifted by the group's move.
- A gap or size change lays the template out again and drops hand moves; the group's move and added frames stay. A gap that does not change drops nothing.
- A frame drags with the engine's snap inside the wall and is kept on it. The group moves by keyboard or drag without being kept on the wall, so the warning can say by how much it is past an edge.
- F2's photo flow, size picker and dialog are reused from `components/frames-on-wall/photo-flow.tsx`; a new photo, a new scale or the sample room lays the template out again on that wall and drops the hangers of added frames.
- A frame with no hanger of its own opens on the last type picked, with empty fields; it gets its own hanger once a drop is typed.
- "Back to the sample room" from the upload step with no photo picked changes only the mode; from a photo it lays the template out again.
- A size from the whole group's list opens the picker in `group-size` mode, and applying it changes the first frame of that size with "also the others" on.
- With no props `GalleryWall` keeps its own reducer; given `state` and `dispatch` it uses them, its own reducer still running so the hook order never changes.

## Edge Cases

- At 12 frames "Add a frame" gives way to a note.
- A typed gap over 12 in, negative or not a length leaves the gap as it was and flags the field.
- On a photo, sides with no marked edge end at the photo's border.
- Below 360 px the site header tightens so the lockup, the unit toggle and the menu button share one row.

## Requirements

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

Once the visitor picks One nail or Two D-rings, a frame with no hanger of its own SHALL open in "Hanger for" on that type, and so SHALL frames added later. The drop and the inset SHALL NOT carry over, and the frame SHALL keep All frames' hanger until its own drop is typed.

#### Scenario: The next frame starts on D-rings

- **GIVEN** All frames on one nail with a 2 in drop, and frame C set to Two D-rings with a 3 in drop and a 4 in inset
- **WHEN** frame D is picked in "Hanger for"
- **THEN** its type reads Two D-rings and its drop and inset are empty
- **AND** frame D's nail in the table is unchanged

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

### Requirement: The planner's fields show no inch digits to a centimetre visitor

A visitor whose stored unit is centimetres SHALL NOT see inch digits in the planner's gap field or the selection's distance fields at any point of the page load. Until the planner has rendered in centimetres the fields MAY show no digits. They SHALL keep their size and position.

#### Scenario: The planner's fields before the scripts run

- **WHEN** a visitor whose stored unit is centimetres opens `/gallery-wall-planner` and its script bundles have not run yet
- **THEN** neither the gap field nor any distance field shows a digit

#### Scenario: The planner's fields after hydration

- **WHEN** a visitor whose stored unit is centimetres opens `/gallery-wall-planner` and the page has hydrated
- **THEN** the gap field shows 8

### Requirement: The template table fits its column

The table captioned "Gallery wall layout with sizes" SHALL fit its column without sideways scrolling on a desktop screen, and the furniture widths SHALL keep the monospace look of the other lengths.

#### Scenario: The template table on a desktop screen

- **WHEN** `/gallery-wall-planner` is opened at 1280 × 800, in inches and then in centimetres
- **THEN** the template table's scroll box is no wider than its visible width, and the "Furniture it suits" cells are set in the monospace font

### Requirement: A print from a shop is a frame of its own size

A print added from a shop SHALL be a lettered frame at its own size, with a 1 in moulding only when framed, drawn with its picture. It SHALL be named by its size as found, "<size> print", in its label, the size list and the nail table. It SHALL drag, set distances, take hangers and get nail marks like any frame, and SHALL offer no "Change size". The page itself SHALL never add one.

#### Scenario: A centimetre print in the layout

- **GIVEN** the default layout and a 60 × 90 cm print added unframed as frame F
- **WHEN** frame F is selected
- **THEN** its outside size is 23.6 × 35.4 in (60 × 90 cm), its label reads "F · 60 × 90 cm print", and the selection block offers no "Change size"

#### Scenario: The size list with a print

- **GIVEN** the default layout and a 24 × 36 in print added framed as frame F
- **WHEN** the whole group is selected
- **THEN** the size list holds a row "24 × 36 in print" for frame F with no "Change", and frames A to E keep their rows with "Change"

#### Scenario: Nail marks for a print

- **GIVEN** a 24 × 36 in unframed print added as frame F and one nail with a 2 in drop for all frames
- **WHEN** the Nail marks view is shown
- **THEN** the table has a row "Frame F · 24 × 36 in print" with its nail 2 in below the print's top edge

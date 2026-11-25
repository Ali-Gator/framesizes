# Spec Delta

## Purpose

The F7 page, "Poster and frame mockup" (`/frame-mockup`), and its widget. A visitor uploads a design or a print file, sees it in a frame on a sample wall at true scale, picks the frame size, style, mat, wall and view, and downloads the picture as a PNG, all on their own device.

## ADDED Requirements

### Requirement: The page follows the tool outline

The page SHALL hold, in order: breadcrumbs, the `h1`, the answer paragraph, the widget, "How to use the mockup generator", "Frame sizes by artwork shape", the three keyword sections, "Questions" and "Related tools", all in the server HTML.

#### Scenario: The heading outline of the server HTML

- **WHEN** `/frame-mockup` is requested
- **THEN** the HTML has one `h1`, "Poster and Frame Mockup Generator", and its `h2`s in order are "How to use the mockup generator", "Frame sizes by artwork shape", "Frame mockup: a close-up of the frame", "Picture frame mockup for a photo", "Wall art mockup in a room", "Questions" and "Related tools"; the how-to holds five numbered steps with the `h3`s "Upload your artwork", "Pick a frame size", "Pick a style and a mat", "Pick a wall" and "Download the PNG"

### Requirement: The answer paragraph names the head keyword

The paragraph under the `h1` SHALL say "poster mockup" word for word, say what the tool does and that the file stays on the device. On a phone the `h1`, that paragraph, the mockup picture and the upload button SHALL show without scrolling.

#### Scenario: The answer in the server HTML

- **WHEN** `/frame-mockup` is requested
- **THEN** the paragraph after the `h1` reads "Make a poster mockup: upload a JPEG or PNG, see it framed on a wall at true size, and download a PNG. For designers, print sellers and anyone with a print to hang. Your file stays on your device."

#### Scenario: The first screen on a phone

- **WHEN** the page is opened at 390 × 664 (a 390 × 844 phone with its browser bars)
- **THEN** the `h1`, the answer paragraph, the mockup picture and the "Choose a JPEG or PNG" button are inside the first screen

### Requirement: The widget opens on the sample artwork in a 24x36

Before any upload, the server HTML SHALL show the site's own 2:3 sample artwork in a 24x36 black frame, no mat, above the sofa, as the whole wall, with its answer and its size chips.

#### Scenario: The widget in the server HTML

- **WHEN** `/frame-mockup` is requested
- **THEN** the widget shows the picture labelled "Poster mockup: the sample in a 24x36 black frame, no mat, above a sofa, the whole 12 by 8 ft wall, drawn to true scale.", "Sample artwork" with "2:3, drawn for this site", the 17 chips "4×6" to "27×40", "A3", "A2" and "A1" with only "24×36" pressed, "Black", "No mat", "Above the sofa" and "Whole wall" chosen, the frame size "24 × 36 in", and no "Use the sample again" button

### Requirement: Each size chip shows how much of the artwork it cuts

The widget SHALL offer the engine's sizes for the artwork, turned to its shape, each chip naming the size and its cut as a whole percent. "0% cut" SHALL mean the artwork fits the opening exactly, with nothing to move; any other cut that rounds to 0 SHALL read "<1% cut". With the mat on, a size with no room for a mat SHALL be disabled and read "No room".

#### Scenario: The sample without a mat

- **WHEN** the sample is shown without a mat
- **THEN** "4×6", "12×18", "20×30" and "24×36" read "0% cut", "27×40" reads "1% cut", "11×17" "3% cut", "A3", "A2" and "A1" "6% cut", "16×20" "17% cut" and "20×24" "20% cut"

#### Scenario: The sample with a mat

- **WHEN** the mat is turned on with the sample
- **THEN** "4×6" is disabled and reads "No room", "24×36" reads "1% cut", "16×20" "14% cut", "20×30" "8% cut" and "A1" "<1% cut"

#### Scenario: An A-series file

- **WHEN** the visitor uploads a 2480 × 3508 px artwork
- **THEN** "A3", "A2" and "A1" read "<1% cut" and "5×7" reads "1% cut"

#### Scenario: A landscape artwork

- **WHEN** the visitor uploads a 3000 × 2000 px artwork
- **THEN** the chips read "6×4" to "40×27", then "A3", "A2" and "A1", 17 in all

#### Scenario: A square artwork

- **WHEN** the visitor uploads a 2000 × 2000 px artwork
- **THEN** the only chips are "8×8", "10×10", "12×12", "16×16" and "20×20", each "0% cut"

### Requirement: An upload opens on the size that cuts least

An upload SHALL open on the engine's default size for that artwork with the mat setting in force, keep the style, mat, wall and view, centre the artwork, and say in a polite live region which size it opened on and why.

#### Scenario: A first upload

- **WHEN** the visitor uploads a 2000 × 3000 px artwork
- **THEN** "24×36" is pressed, "Your artwork" with "2000 × 3000 px" replaces "Sample artwork", "Use the sample again" shows, and the note reads "24x36 cuts your artwork least, so the mockup opened on 24x36."

#### Scenario: A second upload replaces the first

- **WHEN** the visitor has a 2000 × 3000 px artwork on 24x36 in light oak and uploads a 3000 × 4000 px artwork
- **THEN** "18×24" is pressed, "Light oak" stays chosen, and the note reads "New artwork. 18x24 cuts it least, so the frame changed to 18x24."

#### Scenario: An upload with the mat on

- **WHEN** the mat is on and the visitor uploads a 3000 × 4000 px artwork
- **THEN** "12×16" is pressed and the mat stays on

### Requirement: The sample can come back

After an upload, "Use the sample again" SHALL remove the visitor's artwork, put the sample back on 24x36, and keep the style, mat, wall and view.

#### Scenario: Back to the sample

- **WHEN** the visitor, with an upload in light oak, with a mat, on the plain wall, in close-up, presses "Use the sample again"
- **THEN** "Sample artwork" and "24×36" show, light oak, the mat, the plain wall and the close-up stay chosen, "Use the sample again" is gone, and the note reads "The sample is back on 24x36. Your style, mat, wall and view stay as they were."

### Requirement: A file that cannot be used leaves the artwork as it was

A file that is not an image, or that the browser cannot open, SHALL leave the last artwork, its size and every setting unchanged and say why in the live region. While a file is being read, the widget SHALL say "Opening your artwork…" and disable the upload button.

#### Scenario: Not an image

- **WHEN** the visitor picks a PDF
- **THEN** the message reads "This file is not an image. Choose a JPEG or a PNG." with "The last artwork stays in the frame.", and the picture is unchanged

#### Scenario: An image the browser cannot open

- **WHEN** the visitor picks a file with an image type that does not decode
- **THEN** the message reads "Your browser cannot open this file. Try a JPEG or a PNG." with "The last artwork stays in the frame.", and the picture is unchanged

### Requirement: A file can be dropped on a desktop

At 768 px and wider the widget SHALL show a drop area with "Drop your artwork here" and "JPEG or PNG. It stays on your device.", which reads "Drop to use this file" while a file is dragged over it. A dropped file SHALL be used as a picked one. Below 768 px there SHALL be no drop area.

#### Scenario: Dragging over

- **WHEN** a file is dragged over the drop area at 1280 wide
- **THEN** the drop area reads "Drop to use this file", and dropping a 3000 × 2000 px image opens it on 36x24

### Requirement: The uploaded artwork stays on the device

The artwork SHALL be read and drawn in the browser, and the PNG made there. The page SHALL NOT send the artwork, or anything made from it, over the network, SHALL NOT store it, and SHALL NOT name the file in an analytics event. The page SHALL name it "Your artwork", never by its file name.

#### Scenario: No request carries the artwork

- **WHEN** the visitor uploads an artwork, changes its size, style, mat, wall and view, and downloads the PNG
- **THEN** no network request carries image data (an `image/*` or multipart body, or a body over 10 KB), no request URL contains a `blob:` or `data:` URL, and no request or page text names the file

### Requirement: The frame comes in four styles

The widget SHALL offer "Black", "White", "Light oak" and "Walnut" as pressed buttons, each with a colour dot, all drawn with the same 1 inch moulding. A style SHALL change only the frame's colour.

#### Scenario: Walnut

- **WHEN** the visitor presses "Walnut"
- **THEN** "Walnut" is pressed, the frame is drawn in walnut, the picture's label says "walnut frame", and the frame's outside size in the answer is unchanged

### Requirement: The mat switch keeps the size

"No mat" and "Mat" SHALL switch the mat: a frame sold with a pre-cut mat uses it, any other frame a 2 inch mat, white. Switching SHALL keep the size picked and centre the artwork. With 4x6 picked, "Mat" SHALL be disabled with "A 4x6 has no room for a mat."

#### Scenario: 24x36 with its pre-cut mat

- **WHEN** the sample is on 24x36 and the visitor chooses "Mat"
- **THEN** "24×36" stays pressed and the answer reads "Cuts 1% of the sample." and "Mat opening 19½ × 29½ in. Border 2¼ in at the sides, 3¼ in at the top and bottom. The frame is sold with this mat, cut for a 20x30 print."

#### Scenario: 20x30 with a 2 inch mat

- **WHEN** the sample is on 20x30 with the mat on
- **THEN** the answer reads "Cuts 8% of the sample." and "This frame is not sold with a mat, so it gets a 2 in mat. Opening 16 × 26 in."

#### Scenario: 4x6 picked

- **WHEN** the visitor picks "4×6" with no mat
- **THEN** "Mat" is disabled and described by "A 4x6 has no room for a mat."

### Requirement: The frame hangs on one of two walls, seen whole or close up

The widget SHALL hang the frame at true scale on the 144 × 96 inch sample room wall, "Above the sofa" or on a "Plain wall" (the same room with no sofa), and show "Whole wall" or "Close-up", as the engine places them. The answer SHALL give the frame's outside size and where it hangs.

#### Scenario: Above the sofa

- **WHEN** the sample is on 24x36, no mat, above the sofa, whole wall
- **THEN** the answer reads "Nothing is cut: the sample has this shape." and "Outside 26 × 38 in, with a 1 in moulding. Bottom edge 42 in, top edge 80 in above the floor, 8 in over the sofa."

#### Scenario: A plain wall in close-up

- **WHEN** the visitor chooses "Plain wall" and "Close-up" with the sample on 24x36
- **THEN** the sofa is not drawn, the answer reads "Outside 26 × 38 in, with a 1 in moulding. Centred 57 in above the floor, from 38 in to 76 in." and "Close-up: 45 × 57 in of wall.", and the picture shows 45 × 57 inches of wall around the frame

### Requirement: The artwork fills the opening and can be moved

The artwork SHALL fill the opening edge to edge, centred, never stretched, showing the part the engine gives. Where it is cut, the visitor SHALL move it along the cut side by dragging or with the arrow keys (¼ inch, Shift 1 inch) on a focusable control over the opening; it SHALL never leave the opening uncovered. While dragging, the cut parts SHALL show dimmed outside the opening.

#### Scenario: Keys move the artwork

- **WHEN** the sample is on 16x20 in close-up and the visitor focuses the artwork and presses Shift + ArrowUp
- **THEN** the artwork moves 1 inch up in the frame, a lower part of it shows, and the hint reads "Drag the artwork to choose what is cut. Arrow keys move it ¼ in, Shift + arrow 1 in."

#### Scenario: Nothing to move

- **WHEN** the sample is on 24x36 with no mat
- **THEN** the move control is disabled and the hint reads "Nothing to move: the artwork fills this frame as it is."

#### Scenario: At the edge

- **WHEN** the visitor keeps pressing ArrowUp on 16x20
- **THEN** the artwork stops with its bottom edge at the opening's bottom edge, and one ArrowDown moves it back at once

### Requirement: The answer names the frame in both units

Under the picture the widget SHALL give the frame size, the cut, the mat opening and borders when there is a mat, the outside size and its heights, and the close-up's wall size, every length in both units, in a polite live region, with a link "Your own wall? Try it on a photo in Frames on your wall." to F2. An A-series size SHALL lead with millimetres.

#### Scenario: Centimetres

- **WHEN** the visitor switches the header to cm with the sample on 24x36, mat on, close-up
- **THEN** the frame size reads "61 × 91.4 cm", the mat opening "49.5 × 74.9 cm", the outside "66 × 96.5 cm", and the chips still read "24×36"

#### Scenario: An A-series size

- **WHEN** the sample is on A2 without a mat
- **THEN** the frame size reads "420 × 594 mm" with "16.5 × 23.4 in" under it, or "42 × 59.4 cm" in cm, and the answer reads "Cuts 6% of the sample."

#### Scenario: A cut under one percent

- **WHEN** the sample is on A1 with the mat on
- **THEN** the answer reads "Cuts under 1% of the sample.", and the move control is enabled

### Requirement: The picture's label follows the state

The picture SHALL be one image whose accessible label names the artwork ("the sample" or "your artwork"), the size, the style, the mat, the wall and the view, and says it is drawn to true scale.

#### Scenario: An upload in walnut on a plain wall

- **WHEN** an upload is on 18x24, walnut, with a mat, on a plain wall, in close-up
- **THEN** the picture's label reads "Poster mockup: your artwork in an 18x24 walnut frame, with a white mat, on a plain wall, close-up, drawn to true scale."

### Requirement: The PNG saves the view on screen

"Download PNG" SHALL save the view on screen, drawn as on screen, at the engine's export size, named `frame-mockup-<size>.png` with the size in lower case. While it is made the button SHALL be disabled and read "Making your PNG…"; then "Saved <file name>" SHALL show as a status. The line under it SHALL give the PNG's size and say there is no watermark.

#### Scenario: The whole wall

- **WHEN** the visitor downloads with the sample on 24x36, black, above the sofa, whole wall
- **THEN** the file is `frame-mockup-24x36.png`, a PNG of 2400 × 1600 px whose pixels at the frame's moulding are the black style's colour, "Saved frame-mockup-24x36.png" shows, and the line reads "2,400 × 1,600 px PNG of the view above. No watermark."

#### Scenario: A close-up of an A-series size

- **WHEN** the visitor downloads with the sample on A2 in close-up
- **THEN** the file is `frame-mockup-a2.png` and its size is the engine's export size for that close-up

#### Scenario: The browser cannot make the PNG

- **WHEN** the browser gives no PNG
- **THEN** the button is ready again and the message reads "Your browser could not make the PNG. Try again, or try the close-up."

### Requirement: A desktop shows the picture beside the controls, a phone one column with tabs

At 768 px and wider the picture column SHALL hold the picture, then Mat, Wall and View, then the hint, the answer and Download, and stay in view while the page scrolls; the right column SHALL hold the upload, the size chips and the styles. Below 768 px the widget SHALL be one column: the picture, the upload button, four buttons "Size", "Style", "Mat" and "Wall" that each show their group and its current value, then the hint, the answer and Download. Nothing SHALL be wider than the screen.

#### Scenario: Desktop

- **WHEN** the page is opened at 1280 wide
- **THEN** the size chips' left edge is right of the picture's right edge, the Mat control is below the picture, and no "Size" / "Style" / "Mat" / "Wall" buttons show

#### Scenario: Phone

- **WHEN** the page is opened at 390 × 844 and the visitor presses "Style"
- **THEN** the frame styles show and the size chips do not, the "Style" button reads its current value "Black", the answer is below the buttons, and no element is wider than 390 px

### Requirement: The shape table groups frame sizes by artwork shape

"Frame sizes by artwork shape" SHALL hold a table of the shapes that two or more standard frame sizes share, built from the size engine, with the A-series and square rows, in the server HTML. No cell SHALL spill into the next column.

#### Scenario: The table

- **WHEN** `/frame-mockup` is requested
- **THEN** the table's rows are "2:3" with "4x6, 12x18, 20x30, 24x36", "3:4" with "12x16, 18x24", "4:5" with "8x10, 16x20", "A-series, 1:1.41" with "A3, A2, A1" and "Square, 1:1" with "8x8, 10x10, 12x12, 16x16, 20x20"

#### Scenario: No cell spills

- **WHEN** the page is opened at 1280 and at 390 wide
- **THEN** every cell of the table has a `scrollWidth` no larger than its `clientWidth`

### Requirement: The reference section links only to live print pages

The sentence sending the visitor to Art print sizes and the DPI checker SHALL appear only when those pages are live.

#### Scenario: PH2 and Q2 not live

- **WHEN** `/frame-mockup` is requested while PH2 and Q2 are not live
- **THEN** no link points to `/art-print-sizes` or `/dpi-checker`

### Requirement: Each secondary keyword has its own section with a drawing

"Frame mockup: a close-up of the frame", "Picture frame mockup for a photo" and "Wall art mockup in a room" SHALL each show a static true-scale mockup drawing and a short text with its numbers from the size engine. The wall art section SHALL link to F2 and G1.

#### Scenario: The three sections

- **WHEN** `/frame-mockup` is requested
- **THEN** the close-up section says a 24x36 close-up covers 45 × 57 in (114.3 × 144.8 cm) of wall; the photo section says a 5x7 frame is sold with a mat cut for a 4x6 photo and an 8x10 with one for a 5x7; the wall art section gives the 12 × 8 ft (366 × 244 cm) wall, 8 in over a sofa and 57 in above the floor, and links to `/frame-sizes-on-wall` and `/gallery-wall-planner`

### Requirement: The questions answer in the server HTML

The page SHALL answer six questions in its server HTML, the first open, with every size and number from the size engine.

#### Scenario: The six questions

- **WHEN** `/frame-mockup` is requested
- **THEN** the questions are "Is my artwork uploaded?", "Why is part of my artwork cut off?", "What size is the PNG?", "Can I use the mockup in my shop listing?", "Which frame sizes can I try?" and "Can I see it on my own wall?", the first answer is visible without a click, and the PNG answer gives 2,400 × 1,600 px for the whole wall and 1,895 × 2,400 px for a 24x36 close-up

### Requirement: The page links only to live pages

Related tools SHALL list the live Frames pages other than F7, then P1 and G1 when live, and SHALL be left out, heading included, while none is live.

#### Scenario: F1, F2, F3, F4, F5, F6, F7 and G1 are live

- **WHEN** `/frame-mockup` is requested while only F1, F2, F3, F4, F5, F6, F7, G1 and the company pages are live
- **THEN** Related tools holds seven cards, linking to `/`, `/frame-sizes-on-wall`, `/how-big-is-8x10`, `/measure-picture-frame`, `/frame-mat-calculator`, `/poster-frame-sizes` and `/gallery-wall-planner` in that order; no link points to `/poster-sizes`; and no `href` starts with `#`

### Requirement: The page carries its head values and breadcrumbs

The page SHALL take its title, `h1`, description and content date from its site map entry, carry breadcrumbs Home › Poster and frame mockup with a matching `BreadcrumbList`, and send its own 1200 × 630 social image with the alt "The sample artwork in a 24x36 black frame above a sofa".

#### Scenario: The head of the page

- **WHEN** `/frame-mockup` is requested
- **THEN** the title is "Poster & Frame Mockup Generator | Frame Sizes", the canonical is `https://framesizes.app/frame-mockup`, and `og:image:alt` is the alt above

#### Scenario: F7's breadcrumbs

- **WHEN** `/frame-mockup` is requested
- **THEN** the breadcrumb `nav` holds "Home" linking to `/` and "Poster and frame mockup" as the current page, and the HTML holds one `BreadcrumbList` with the same two items and no `FAQPage`, `HowTo` or `WebApplication`

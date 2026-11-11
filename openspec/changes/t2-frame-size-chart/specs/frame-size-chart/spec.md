# Spec Delta

## Purpose

The home page (F1, `/`): the standard frame size chart. It answers "what are the standard frame sizes" in static HTML, and lets the visitor pick a size and see it at true scale on a wall. Every number on the page comes from the size engine.

## ADDED Requirements

### Requirement: The page follows the approved outline

The HTML the server returns for `/` SHALL hold the page's sections in this order, under these headings: the `h1`, the answer paragraph, the widget titled "Frame size chart" (`h2`), "The six most common frame sizes" (`h2`), "Frame size by image size" (`h2`), "Large, square and horizontal frame sizes" (`h2`, with one `h3` per group), "How to choose a frame size" (`h2`, three `h3`), "Frame size questions" (`h2`, one `h3` per question).

#### Scenario: The heading outline of the server HTML

- **WHEN** `/` is requested
- **THEN** the response HTML holds those six `h2` headings in that order after the single `h1`, the `h3` headings "Large frame sizes", "Square frame sizes" and "Horizontal frame sizes", and one `h3` per question

### Requirement: The first paragraph answers with the six common sizes

The paragraph under the `h1` SHALL name the six most common sizes from the size engine, in inches, in the search form. On a phone the `h1`, this paragraph and the top of the widget SHALL be visible without scrolling.

#### Scenario: The answer in the server HTML

- **WHEN** `/` is requested
- **THEN** the first paragraph after the `h1` contains 4x6, 5x7, 8x10, 11x14, 16x20 and 24x36

#### Scenario: The first screen on a phone

- **WHEN** `/` is opened at 390 × 664 (a phone with the browser bars showing)
- **THEN** the `h1`, the answer paragraph and the widget's title are inside the viewport without scrolling

### Requirement: The whole chart is in the server HTML

The HTML the server returns SHALL hold one table, captioned "Standard picture frame sizes in inches and centimetres", with a row for every size in the catalog. Each row SHALL give the frame size in inches and in centimetres, the image usually framed in it with a mat (or "No mat"), and the common use. Rows outside the selected orientation SHALL be hidden, not removed.

#### Scenario: The table in the server HTML

- **WHEN** `/` is requested
- **THEN** the response HTML holds a table with 17 body rows, the row for 8x10 reads "8 × 10 in", "20.3 × 25.4 cm", "5 × 7 in" and its common use, the row for 4x6 reads "No mat", and the five square rows carry the `hidden` attribute

### Requirement: The widget opens on 16x20 above a sofa

Without state in the URL the widget SHALL show the portrait sizes with 16x20 selected, the "On a wall" preview and the sofa as the reference, in the server HTML as well as after loading. The preview's accessible name SHALL follow the state in the form "<size> picture frame at true scale next to <reference>".

#### Scenario: The default state in the server HTML

- **WHEN** `/` is requested
- **THEN** the response HTML holds the 16x20 row's radio checked and a drawing named "16x20 picture frame at true scale next to a three-seat sofa"

### Requirement: The table is the size chooser

Each visible row SHALL hold a radio button named by its size, all in one group, so that the group is one tab stop and the arrow keys move the selection. Selecting a row, by pointer anywhere on the row or by keyboard, SHALL update the preview at once.

#### Scenario: A row is clicked

- **WHEN** the visitor clicks the common-use cell of the 11x14 row
- **THEN** the 11x14 radio is checked and the drawing is named "11x14 picture frame at true scale next to a three-seat sofa"

#### Scenario: The selection is moved with the keyboard

- **WHEN** the selected radio has focus and the visitor presses the down arrow
- **THEN** the next row's radio is checked and focused, and the drawing shows that size

### Requirement: Orientation turns or swaps the list

The widget SHALL offer Portrait, Landscape and Square. Landscape SHALL show the rectangular sizes turned on their side and keep the selected size, turned. Square SHALL show the square sizes and select 12x12. Leaving Square SHALL select 16x20 in the chosen orientation.

#### Scenario: Portrait to landscape

- **WHEN** 16x20 is selected and the visitor chooses Landscape
- **THEN** the selected row reads "20 × 16 in" and the drawing is named "20x16 picture frame at true scale next to a three-seat sofa"

#### Scenario: Into and out of square

- **WHEN** the visitor chooses Square, and then Landscape
- **THEN** 12x12 is selected with five rows visible, and afterwards 20x16 is selected with twelve rows visible

### Requirement: The wall view shows the size beside a reference with the next size up

In the "On a wall" view the widget SHALL draw the selected size at true scale beside the chosen reference (Sofa, Person or Door), draw the next size up as a dashed outline and name it under the drawing, and state the reference in a sentence. The largest size SHALL have no outline.

#### Scenario: The reference is changed

- **WHEN** the visitor chooses Door
- **THEN** the drawing is named "16x20 picture frame at true scale next to a door" and the sentence under it says the frame is centred 57 in from the floor next to a door

#### Scenario: The next size up is named

- **WHEN** 16x20 is selected in the wall view
- **THEN** the text under the drawing includes "Next size up: 18 × 24 in"

#### Scenario: The largest size is selected

- **WHEN** 27x40 is selected in the wall view
- **THEN** no next size is named

### Requirement: The all-sizes view compares every listed size

In the "All sizes" view the widget SHALL draw every size of the current list as nested outlines from one corner at one scale, highlight the selected size, hide the reference choice, and select a size when its outline is clicked. The drawing SHALL be named "Standard frame sizes chart from <smallest> to <largest> inches, <selected> highlighted".

#### Scenario: The view is switched

- **WHEN** the visitor chooses "All sizes"
- **THEN** the drawing is named "Standard frame sizes chart from 4x6 to 27x40 inches, 16x20 highlighted" and the "Next to" control is not shown

#### Scenario: An outline is clicked

- **WHEN** the visitor clicks the 24x36 outline
- **THEN** the 24x36 radio in the table is checked

### Requirement: The widget follows the site's unit

When the visitor's unit is centimetres, the table's first column SHALL give centimetres and its second column, headed "Inches", the inch form; the mat column, the drawing's labels and the reference sentence SHALL be in centimetres. With inches selected the second column is headed "Centimetres".

#### Scenario: The visitor switches to centimetres

- **WHEN** the visitor selects "cm" in the header
- **THEN** the selected row's first cell reads "40.6 × 50.8 cm", the second column is headed "Inches", and the sentence under the drawing reads "Hung 20 cm above a sofa 213 cm wide"

### Requirement: The widget's state lives in the URL

The widget SHALL write the selected size (as its oriented id), the view and the reference to the query string as `size`, `view` and `ref`, leaving out any that equal the default, without adding a browser history entry. Opening a URL that carries them SHALL restore that state. A value the widget does not know SHALL be ignored.

#### Scenario: A choice is written to the URL

- **WHEN** the visitor selects 11x14 and then chooses Door
- **THEN** the URL's query string is `size=11x14&ref=door` and the length of the browser's history is the same as before the two choices

#### Scenario: A shared URL is opened

- **WHEN** `/?size=10x8&view=all` is opened
- **THEN** Landscape is the chosen orientation, the 10x8 row is checked and the "All sizes" view is shown

#### Scenario: Unknown values

- **WHEN** `/?size=banana&ref=moon&view=3d` is opened
- **THEN** the widget shows its default state

#### Scenario: Back to the defaults

- **WHEN** the visitor returns every choice to its default
- **THEN** the URL has no query string

### Requirement: The preview stays in view while the table scrolls

In the two-column layout the preview and the filter row SHALL stay pinned while the visitor scrolls the table. In the one-column layout the preview SHALL stay pinned only when the table keeps at least half of the viewport's height beside it; on a shorter screen it SHALL scroll away with the page. A pinned preview SHALL NOT cover the row that has keyboard focus.

#### Scenario: A desktop screen

- **WHEN** `/` is opened at 1280 × 800 and the last table row is scrolled into view
- **THEN** the whole preview and the filter row are inside the viewport

#### Scenario: A phone

- **WHEN** `/` is opened at 390 × 664 and the last table row is scrolled into view
- **THEN** the preview is inside the viewport and its bottom edge is in the upper half

#### Scenario: A short phone

- **WHEN** `/` is opened at 375 × 548 and the last table row is scrolled into view
- **THEN** the preview is outside the viewport

#### Scenario: Keyboard focus under a pinned preview

- **WHEN** at 390 × 664 the visitor moves the selection down the table with the arrow keys to the last row
- **THEN** each focused row is fully visible below the preview

### Requirement: Loading the page shifts nothing

The page's cumulative layout shift from first paint until it is interactive SHALL stay at or under 0.1, including when a stored unit or state in the URL changes the widget after it loads.

#### Scenario: A plain load

- **WHEN** `/` is loaded at 390 × 664 and at 1280 × 800
- **THEN** the cumulative layout shift is at most 0.1

#### Scenario: A load that restores state

- **WHEN** `/?size=24x36&view=all` is loaded by a visitor whose stored unit is centimetres
- **THEN** the cumulative layout shift is at most 0.1

### Requirement: The six most common sizes are drawn at one scale

The page SHALL show the six most common sizes as six frames standing on one baseline, drawn at one scale from the size engine, each labelled with its size in inches, in centimetres and its common use. The drawing's accessible name SHALL be "Six common picture frame sizes from 4x6 to 24x36 inches compared at the same scale".

#### Scenario: The frames are in proportion

- **WHEN** the six frames are measured on the page
- **THEN** the 24x36 frame is six times as wide and six times as tall as the 4x6 frame, within one pixel

#### Scenario: The labels come from the engine

- **WHEN** `/` is requested
- **THEN** the response HTML labels the fourth frame "11×14" and "27.9 × 35.6 cm"

### Requirement: The frame anatomy example is computed

The page SHALL explain the four measurements of a framed photo with an 8x10 image in an 11x14 frame, taking the outside size and the mat opening from the size engine, beside a drawing named "8x10 photo with a mat in an 11x14 frame: moulding, mat, mat opening and photo".

#### Scenario: The four measurements

- **WHEN** `/` is requested
- **THEN** the response HTML lists Outside size "13 × 16 in", Frame size "11 × 14 in", Mat opening "7.5 × 9.5 in" and Image size "8 × 10 in"

### Requirement: No two drawings share a name

Every drawing on the page SHALL have an accessible name, and no two SHALL have the same one in any widget state.

#### Scenario: The drawings in the default state

- **WHEN** `/` is opened
- **THEN** the page has three named drawings (the preview, the six sizes, the frame anatomy) and their names differ

### Requirement: The questions are answered in the server HTML

The page SHALL show five questions, each an `h3` inside a disclosure whose answer is in the server HTML, with the first one open. An answer SHALL lead with its number, and sizes in centimetres SHALL come from the size engine.

#### Scenario: The questions in the server HTML

- **WHEN** `/` is requested
- **THEN** the response HTML holds five `details` elements, only the first with the `open` attribute, each with an `h3` in its `summary`, and the answer to "What are the standard frame sizes in cm?" contains "20.3 × 25.4"

### Requirement: The page says where its sizes come from

Under the widget the page SHALL state the height of the drawn wall, name the source of the sizes, and show the month and year the size data was last checked, taken from the size engine's check record.

#### Scenario: The proof line

- **WHEN** `/` is requested
- **THEN** the widget's footer in the response HTML contains "8 ft (244 cm)" and "last checked" followed by the month and year of the engine's check date

### Requirement: The page links only to live pages

The related tools section SHALL list the live pages of the page's own hub and the live pages it must link to in other hubs (P1, PH1, C1, G1), and SHALL be left out entirely, heading included, while none of them is live. The "See it on my wall" button and a sentence whose only purpose is to send the visitor to another page SHALL appear only when that page is live.

#### Scenario: No other page is live

- **WHEN** `/` is requested while only the home page is live
- **THEN** the response HTML has no "Related tools" heading, no "See it on my wall" link, and no `href` that starts with `#`

#### Scenario: A related page goes live

- **WHEN** the related tools section is rendered with the poster sizes page live
- **THEN** it holds the heading "Related tools", the group "Posters" and one card linking to `/poster-sizes`

### Requirement: The description's sizes are the catalog's

Every size named in the page's meta description SHALL be a catalog size, and the range it states SHALL run from the smallest to the largest rectangular size.

#### Scenario: The description against the catalog

- **WHEN** the home page's description is compared with the catalog
- **THEN** it names 4x6 and 27x40 and no size outside the catalog

### Requirement: The widget has no detectable accessibility violations

The page SHALL pass an automated WCAG 2.2 A and AA check with no violations in the widget's default state, in the all-sizes view and with centimetres selected.

#### Scenario: The widget states are checked

- **WHEN** an automated accessibility check runs on `/` in those three states at 390 × 664 and at 1280 × 800
- **THEN** it reports no violations

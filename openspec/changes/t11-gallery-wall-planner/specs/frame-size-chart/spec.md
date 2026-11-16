# Spec Delta

## MODIFIED Requirements

### Requirement: The page follows the approved outline

The HTML the server returns for `/` SHALL hold the page's sections in this order, under these headings: the `h1`, the answer paragraph, the widget titled "Frame size chart" (`h2`), "The six most common frame sizes" (`h2`), "Frame size by image size" (`h2`), "Large, square and horizontal frame sizes" (`h2`, with one `h3` per group), "How to choose a frame size" (`h2`, three `h3`), "Frame size questions" (`h2`, one `h3` per question), then "Related tools" (`h2`, one `h3` per hub group) while a related page is live.

#### Scenario: The heading outline of the server HTML

- **WHEN** `/` is requested
- **THEN** the response HTML holds those six `h2` headings in that order after the single `h1`, the `h3` headings "Large frame sizes", "Square frame sizes" and "Horizontal frame sizes", and one `h3` per question

#### Scenario: The outline with F2 live

- **WHEN** `/` is requested while only the home page and F2 are live
- **THEN** the six `h2` headings are followed by "Related tools", whose one `h3` is "Frames"

#### Scenario: The outline with F2 and G1 live

- **WHEN** `/` is requested while only the home page, F2 and G1 are live
- **THEN** the six `h2` headings are followed by "Related tools", whose `h3` headings are "Frames" and "Gallery wall", in that order

### Requirement: The page links only to live pages

The related tools section SHALL list the live pages of the page's own hub and the live pages it must link to in other hubs (P1, PH1, C1, G1), and SHALL be left out entirely, heading included, while none of them is live. The "See it on my wall" button and a sentence whose only purpose is to send the visitor to another page SHALL appear only when that page is live.

#### Scenario: No other page is live

- **WHEN** `/` is requested while only the home page is live
- **THEN** the response HTML has no "Related tools" heading, no "See it on my wall" link, and no `href` that starts with `#`

#### Scenario: Only F2 is live besides the home page

- **WHEN** `/` is requested while only the home page and F2 are live
- **THEN** the response HTML has a "See it on my wall" link and a "frame sizes on your wall" link to `/frame-sizes-on-wall`, a "Related tools" heading with one card linking there, and no `href` that starts with `#`

#### Scenario: A related page goes live

- **WHEN** the related tools section is rendered with the poster sizes page live
- **THEN** it holds the heading "Related tools", the group "Posters" and one card linking to `/poster-sizes`

#### Scenario: F2 and G1 are live besides the home page

- **WHEN** `/` is requested while only the home page, F2 and G1 are live
- **THEN** the response HTML has a "See it on my wall" link, a "Related tools" heading with two cards, linking to `/frame-sizes-on-wall` and `/gallery-wall-planner`, and no `href` that starts with `#`

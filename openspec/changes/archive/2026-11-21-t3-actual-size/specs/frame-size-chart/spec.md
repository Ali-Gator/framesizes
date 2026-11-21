# Spec Delta

## MODIFIED Requirements

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

#### Scenario: F2, F3 and G1 are live besides the home page

- **WHEN** `/` is requested while only the home page, F2, F3, G1 and the company pages are live
- **THEN** the response HTML has a "See it on my wall" link, a "Related tools" heading with three cards, linking to `/frame-sizes-on-wall`, `/how-big-is-8x10` and `/gallery-wall-planner` in that order, and no `href` that starts with `#`

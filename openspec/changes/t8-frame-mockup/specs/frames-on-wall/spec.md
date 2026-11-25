# Spec Delta

## MODIFIED Requirements

### Requirement: The page links only to live pages

Related tools SHALL list the live Frames pages other than F2, then C1 and G1 when live, and SHALL be left out, heading included, while none is live. Text whose only purpose is to send the visitor to another page SHALL appear only when that page is live: the hanging height calculator (G3) in the rules and a question, and the gallery wall planner (G1) at six frames. Links to the frame size chart (`/`) SHALL always appear.

#### Scenario: Only the home page and F2 are live

- **WHEN** `/frame-sizes-on-wall` is requested while only F1 and F2 are live
- **THEN** Related tools holds one card, linking to `/`; no link points to `/how-high-to-hang-pictures` or `/gallery-wall-planner`; and no `href` starts with `#`

#### Scenario: F1, F2 and G1 are live

- **WHEN** `/frame-sizes-on-wall` is requested while only F1, F2 and G1 are live
- **THEN** Related tools holds two cards, linking to `/` and `/gallery-wall-planner`; no link points to `/how-high-to-hang-pictures`; and no `href` starts with `#`

#### Scenario: F1, F2, F3 and G1 are live

- **WHEN** `/frame-sizes-on-wall` is requested while only F1, F2, F3, G1 and the company pages are live
- **THEN** Related tools holds three cards, linking to `/`, `/how-big-is-8x10` and `/gallery-wall-planner` in that order; no link points to `/how-high-to-hang-pictures`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4 and G1 are live

- **WHEN** `/frame-sizes-on-wall` is requested while only F1, F2, F3, F4, G1 and the company pages are live
- **THEN** Related tools holds four cards, linking to `/`, `/how-big-is-8x10`, `/measure-picture-frame` and `/gallery-wall-planner` in that order; no link points to `/how-high-to-hang-pictures`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4, F5 and G1 are live

- **WHEN** `/frame-sizes-on-wall` is requested while only F1, F2, F3, F4, F5, G1 and the company pages are live
- **THEN** Related tools holds five cards, linking to `/`, `/how-big-is-8x10`, `/measure-picture-frame`, `/frame-mat-calculator` and `/gallery-wall-planner` in that order; no link points to `/how-high-to-hang-pictures`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4, F5, F6 and G1 are live

- **WHEN** `/frame-sizes-on-wall` is requested while only F1, F2, F3, F4, F5, F6, G1 and the company pages are live
- **THEN** Related tools holds six cards, linking to `/`, `/how-big-is-8x10`, `/measure-picture-frame`, `/frame-mat-calculator`, `/poster-frame-sizes` and `/gallery-wall-planner` in that order; no link points to `/how-high-to-hang-pictures`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4, F5, F6, F7 and G1 are live

- **WHEN** `/frame-sizes-on-wall` is requested while only F1, F2, F3, F4, F5, F6, F7, G1 and the company pages are live
- **THEN** Related tools holds seven cards, linking to `/`, `/how-big-is-8x10`, `/measure-picture-frame`, `/frame-mat-calculator`, `/poster-frame-sizes`, `/frame-mockup` and `/gallery-wall-planner` in that order; no link points to `/how-high-to-hang-pictures`; and no `href` starts with `#`

# Spec Delta

## MODIFIED Requirements

### Requirement: The page links only to live pages

Related tools SHALL list the live Frames pages other than F3, then PH1, Q2 and G1 when live, and SHALL be left out, heading included, while none is live. Links to the frame size chart (`/`) SHALL always appear.

#### Scenario: F1, F2, F3 and G1 are live

- **WHEN** `/how-big-is-8x10` is requested while only F1, F2, F3, G1 and the company pages are live
- **THEN** Related tools holds three cards, linking to `/`, `/frame-sizes-on-wall` and `/gallery-wall-planner`; no link points to `/photo-print-sizes` or `/dpi-checker`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4 and G1 are live

- **WHEN** `/how-big-is-8x10` is requested while only F1, F2, F3, F4, G1 and the company pages are live
- **THEN** Related tools holds four cards, linking to `/`, `/frame-sizes-on-wall`, `/measure-picture-frame` and `/gallery-wall-planner` in that order; no link points to `/photo-print-sizes` or `/dpi-checker`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4, F5 and G1 are live

- **WHEN** `/how-big-is-8x10` is requested while only F1, F2, F3, F4, F5, G1 and the company pages are live
- **THEN** Related tools holds five cards, linking to `/`, `/frame-sizes-on-wall`, `/measure-picture-frame`, `/frame-mat-calculator` and `/gallery-wall-planner` in that order; no link points to `/photo-print-sizes` or `/dpi-checker`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4, F5, F6 and G1 are live

- **WHEN** `/how-big-is-8x10` is requested while only F1, F2, F3, F4, F5, F6, G1 and the company pages are live
- **THEN** Related tools holds six cards, linking to `/`, `/frame-sizes-on-wall`, `/measure-picture-frame`, `/frame-mat-calculator`, `/poster-frame-sizes` and `/gallery-wall-planner` in that order; no link points to `/photo-print-sizes` or `/dpi-checker`; and no `href` starts with `#`

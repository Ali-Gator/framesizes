# Spec Delta

## MODIFIED Requirements

### Requirement: The page links only to live pages

Related tools SHALL list the live Frames pages other than F4, then PH1 when live, and SHALL be left out, heading included, while none is live. A link from the answer SHALL point only to a live page.

#### Scenario: F1, F2, F3, F4 and G1 are live

- **WHEN** `/measure-picture-frame` is requested while only F1, F2, F3, F4, G1 and the company pages are live
- **THEN** Related tools holds three cards, linking to `/`, `/frame-sizes-on-wall` and `/how-big-is-8x10` in that order; no link points to `/photo-print-sizes`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4, F5 and G1 are live

- **WHEN** `/measure-picture-frame` is requested while only F1, F2, F3, F4, F5, G1 and the company pages are live
- **THEN** Related tools holds four cards, linking to `/`, `/frame-sizes-on-wall`, `/how-big-is-8x10` and `/frame-mat-calculator` in that order; no link points to `/photo-print-sizes`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4, F5, F6 and G1 are live

- **WHEN** `/measure-picture-frame` is requested while only F1, F2, F3, F4, F5, F6, G1 and the company pages are live
- **THEN** Related tools holds five cards, linking to `/`, `/frame-sizes-on-wall`, `/how-big-is-8x10`, `/frame-mat-calculator` and `/poster-frame-sizes` in that order; no link points to `/photo-print-sizes`; and no `href` starts with `#`

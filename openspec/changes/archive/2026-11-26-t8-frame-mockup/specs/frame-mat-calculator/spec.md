# Spec Delta

## MODIFIED Requirements

### Requirement: The page links only to live pages

Related tools SHALL list the live Frames pages other than F5, then PH2 when live, and SHALL be left out, heading included, while none is live.

#### Scenario: F1, F2, F3, F4, F5 and G1 are live

- **WHEN** `/frame-mat-calculator` is requested while only F1, F2, F3, F4, F5, G1 and the company pages are live
- **THEN** Related tools holds four cards, linking to `/`, `/frame-sizes-on-wall`, `/how-big-is-8x10` and `/measure-picture-frame` in that order; no link points to `/art-print-sizes`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4, F5, F6 and G1 are live

- **WHEN** `/frame-mat-calculator` is requested while only F1, F2, F3, F4, F5, F6, G1 and the company pages are live
- **THEN** Related tools holds five cards, linking to `/`, `/frame-sizes-on-wall`, `/how-big-is-8x10`, `/measure-picture-frame` and `/poster-frame-sizes` in that order; no link points to `/art-print-sizes`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4, F5, F6, F7 and G1 are live

- **WHEN** `/frame-mat-calculator` is requested while only F1, F2, F3, F4, F5, F6, F7, G1 and the company pages are live
- **THEN** Related tools holds six cards, linking to `/`, `/frame-sizes-on-wall`, `/how-big-is-8x10`, `/measure-picture-frame`, `/poster-frame-sizes` and `/frame-mockup` in that order; no link points to `/art-print-sizes`; and no `href` starts with `#`

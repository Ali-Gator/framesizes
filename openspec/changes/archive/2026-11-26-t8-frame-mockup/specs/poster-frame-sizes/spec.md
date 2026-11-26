# Spec Delta

## MODIFIED Requirements

### Requirement: The page links only to live pages

Related tools SHALL list the live Frames pages other than F6, then P1 when live, and SHALL be left out, heading included, while none is live.

#### Scenario: F1, F2, F3, F4, F5, F6 and G1 are live

- **WHEN** `/poster-frame-sizes` is requested while only F1, F2, F3, F4, F5, F6, G1 and the company pages are live
- **THEN** Related tools holds five cards, linking to `/`, `/frame-sizes-on-wall`, `/how-big-is-8x10`, `/measure-picture-frame` and `/frame-mat-calculator` in that order; no link points to `/poster-sizes`; and no `href` starts with `#`

#### Scenario: F1, F2, F3, F4, F5, F6, F7 and G1 are live

- **WHEN** `/poster-frame-sizes` is requested while only F1, F2, F3, F4, F5, F6, F7, G1 and the company pages are live
- **THEN** Related tools holds six cards, linking to `/`, `/frame-sizes-on-wall`, `/how-big-is-8x10`, `/measure-picture-frame`, `/frame-mat-calculator` and `/frame-mockup` in that order; no link points to `/poster-sizes`; and no `href` starts with `#`

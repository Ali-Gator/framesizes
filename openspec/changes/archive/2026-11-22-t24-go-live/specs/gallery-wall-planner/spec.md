## MODIFIED Requirements

### Requirement: The planner links only to live pages

Related tools SHALL list F1 and F2 under Frames, then the live Gallery wall pages other than G1 under Gallery wall, groups in the site's hub order, and SHALL be left out, heading included, while none is live. Links to the hanging height calculator (G3) in the rules and a question SHALL appear only when G3 is live.

#### Scenario: The planner with F1, F2 and G1 live

- **WHEN** `/gallery-wall-planner` is requested while F1, F2, G1 and the extension page X1 are live, and no other Gallery wall page is
- **THEN** Related tools holds a "Frames" group with two cards linking to `/` and `/frame-sizes-on-wall`, then a "Gallery wall" group with one card linking to `/extensions/gallery-wall-layout-generator`; no link points to `/how-high-to-hang-pictures`, `/gallery-wall-ideas` or `/guides/how-to-make-a-gallery-wall`; and no `href` starts with `#`

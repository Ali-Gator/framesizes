## MODIFIED Requirements

### Requirement: The page follows the approved outline

The HTML the server returns for `/frame-sizes-on-wall` SHALL hold, in this order: the breadcrumbs, the single `h1`, the answer paragraph, the widget titled "Frame visualizer", the extension section (`h2`) while the extension page is live, the canvas's four content sections under their `h2` headings, and "Related tools" (`h2`) while a related page is live.

#### Scenario: The heading outline of the server HTML

- **WHEN** `/frame-sizes-on-wall` is requested
- **THEN** the response HTML holds the `h1` "Frame Sizes on Your Wall", then the widget title "Frame visualizer", then the `h2` headings "How to see frame sizes on your wall", "Picture frame sizes on a wall: how big to go", "Wall photo frame sizes" and "Questions about frames on a wall" in that order
- **AND** a four-item ordered list of steps under the first of them, and one `h3` per question, five in all

#### Scenario: F2's outline once the extension page is live

- **GIVEN** the extension page is live
- **WHEN** `/frame-sizes-on-wall` is requested
- **THEN** the `h2` "Plan on any shop's page" comes right after the widget title "Frame visualizer" and before "How to see frame sizes on your wall"

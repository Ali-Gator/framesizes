## MODIFIED Requirements

### Requirement: The planner page follows the approved outline

The HTML the server returns for `/gallery-wall-planner` SHALL hold, in this order: the breadcrumbs, the single `h1`, the answer paragraph, the widget titled "Gallery wall layout generator", the extension section (`h2`) while the extension page is live, the canvas's four content sections under their `h2` headings, and "Related tools" (`h2`) while a related page is live. It SHALL hold no shop section until the shops are chosen (T21).

#### Scenario: The planner's heading outline

- **WHEN** `/gallery-wall-planner` is requested
- **THEN** the response HTML holds the `h1` "Gallery Wall Layout Planner", then the widget title "Gallery wall layout generator", then the `h2` headings "How to use the gallery wall planner", "Gallery wall templates", "Spacing and height" and "Questions about gallery wall layouts" in that order
- **AND** a five-item ordered list of steps under the first of them, one `h3` per question, five in all, and no `h2` "Where to buy gallery wall frames"

#### Scenario: The planner's outline once the extension page is live

- **GIVEN** the extension page is live
- **WHEN** `/gallery-wall-planner` is requested
- **THEN** the `h2` "Plan on any shop's page" comes right after the widget title "Gallery wall layout generator" and before "How to use the gallery wall planner"

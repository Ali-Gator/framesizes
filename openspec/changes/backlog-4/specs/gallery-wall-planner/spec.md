## ADDED Requirements

### Requirement: The planner's fields show no inch digits to a centimetre visitor

A visitor whose stored unit is centimetres SHALL NOT see inch digits in the planner's gap field or the selection's distance fields at any point of the page load. Until the planner has rendered in centimetres the fields MAY show no digits. They SHALL keep their size and position.

#### Scenario: The planner's fields before the scripts run

- **WHEN** a visitor whose stored unit is centimetres opens `/gallery-wall-planner` and its script bundles have not run yet
- **THEN** neither the gap field nor any distance field shows a digit

#### Scenario: The planner's fields after hydration

- **WHEN** a visitor whose stored unit is centimetres opens `/gallery-wall-planner` and the page has hydrated
- **THEN** the gap field shows 8

### Requirement: The template table fits its column

The table captioned "Gallery wall layout with sizes" SHALL fit its column without sideways scrolling on a desktop screen, and the furniture widths SHALL keep the monospace look of the other lengths.

#### Scenario: The template table on a desktop screen

- **WHEN** `/gallery-wall-planner` is opened at 1280 × 800, in inches and then in centimetres
- **THEN** the template table's scroll box is no wider than its visible width, and the "Furniture it suits" cells are set in the monospace font

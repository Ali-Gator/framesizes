## ADDED Requirements

### Requirement: The distance fields show no inch digits to a centimetre visitor

A visitor whose stored unit is centimetres SHALL NOT see inch digits in the widget's distance fields at any point of the page load. Until the widget has rendered in centimetres the fields MAY show no digits. They SHALL keep their size and position, so nothing moves when the digits appear.

#### Scenario: The fields before the scripts run

- **WHEN** a visitor whose stored unit is centimetres opens `/frame-sizes-on-wall` and its script bundles have not run yet
- **THEN** none of the four distance fields shows a digit, and each field has the same size and position it has after hydration

#### Scenario: The fields after hydration

- **WHEN** a visitor whose stored unit is centimetres opens `/frame-sizes-on-wall` and the page has hydrated
- **THEN** the 16x20's distance fields read 81 above, 20 below and 160 left and right

## ADDED Requirements

### Requirement: The table shows the stored unit from first paint

The chart table's size, other-unit and mat cells and its second column header SHALL show the visitor's stored unit from the first paint, before any of the page's script bundles have run. The server HTML SHALL hold both units for each of them, and only the stored unit SHALL be visible.

#### Scenario: The table with centimetres stored before the scripts run

- **WHEN** a visitor whose stored unit is centimetres opens `/` and its script bundles have not run yet
- **THEN** the 8x10 row's first cell shows "20.3 × 25.4 cm" and its second "8 × 10 in", the second column header shows "Inches", and no inch size is visible in the first column

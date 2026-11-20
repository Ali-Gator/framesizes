## ADDED Requirements

### Requirement: The scale preview shows the stored unit from first paint

The wall view's two dimension labels, its size legend's main size, its reference sentence and its "Next size up" line SHALL show the visitor's stored unit from the first paint, before any of the page's script bundles have run. The server HTML SHALL hold both units for each of them, and only the stored unit SHALL be visible. The labels' positions SHALL NOT depend on the unit.

#### Scenario: The preview with centimetres stored before the scripts run

- **WHEN** a visitor whose stored unit is centimetres opens `/` and its script bundles have not run yet
- **THEN** the wall view's dimension labels read "40.6 cm" and "50.8 cm", the legend's main size reads "40.6 × 50.8 cm" (inches stay its secondary size), and no inch length is visible in the dimension labels, the reference sentence or the "Next size up" line

#### Scenario: The preview with inches stored before the scripts run

- **WHEN** a visitor with no stored unit opens `/` and its script bundles have not run yet
- **THEN** the wall view's dimension labels read "16 in" and "20 in", and no centimetre length is visible in the preview's labels, sentence or "Next size up" line

### Requirement: The forced-colors mark on the selected row takes no space

When the browser forces its own colours, the mark on the selected row SHALL take no layout space: moving the selection SHALL NOT move or resize any row, and the focus ring SHALL stay clear of the mark.

#### Scenario: Rows keep their places on the desktop

- **GIVEN** `/` with forced colors active at 1280 × 800, focus on the selected row
- **WHEN** ArrowDown moves the selection to the next row
- **THEN** every row's top and height are the same as before, to within 0.5 px

#### Scenario: Rows keep their places on a phone

- **GIVEN** `/` with forced colors active at 390 × 664, focus on the selected row
- **WHEN** ArrowDown moves the selection to the next row
- **THEN** every row's top and height are the same as before, to within 0.5 px, and the checked radio's left edge is where an unchecked radio's is

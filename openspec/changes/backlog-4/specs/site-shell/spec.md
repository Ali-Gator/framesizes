## ADDED Requirements

### Requirement: The Units toggle shows the stored unit from first paint

The header's Units toggle SHALL look checked on the visitor's stored unit from the first paint, before any of the page's script bundles have run, and only on that option. Once the page's scripts have run, the checked look, `aria-checked` and keyboard focus SHALL all name the same option.

#### Scenario: A stored centimetre choice before the scripts run

- **WHEN** a visitor whose stored unit is centimetres opens a page and its script bundles have not run yet
- **THEN** the Units toggle's "cm" option has the checked look and its "in" option does not

#### Scenario: The toggle after the scripts run

- **WHEN** a visitor whose stored unit is centimetres opens a page and its scripts have run
- **THEN** the "cm" option has the checked look and `aria-checked="true"`, and the "in" option has neither

### Requirement: A stored centimetre choice waits for the widgets

When the stored unit is centimetres, the root element SHALL carry a pending marker from before the first paint until the page's widgets have rendered in centimetres. It SHALL NOT carry the marker when the unit is inches, when nothing is stored or when storage is unavailable.

#### Scenario: The marker with centimetres stored

- **WHEN** a visitor whose stored unit is centimetres opens `/frame-sizes-on-wall`
- **THEN** the root element carries the pending marker before any of the page's script bundles have run, and does not carry it once the widget shows centimetres

#### Scenario: No marker with inches

- **WHEN** a visitor with no stored preference opens a page
- **THEN** the root element never carries the pending marker

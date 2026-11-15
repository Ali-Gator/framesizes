## ADDED Requirements

### Requirement: The page knows the unit before it paints

The root element of every page SHALL carry the visitor's unit as `data-unit`, set from the stored choice before the first paint, "in" when nothing is stored or storage is unavailable. Each change of unit, by the toggle, by another tab or while storage is blocked, SHALL update the attribute.

#### Scenario: A stored choice at load

- **WHEN** a visitor whose stored unit is centimetres opens a page
- **THEN** the root element has `data-unit="cm"` before any of the page's script bundles have run

#### Scenario: Nothing is stored

- **WHEN** a visitor with no stored preference opens a page
- **THEN** the root element has `data-unit="in"`

#### Scenario: The toggle with storage blocked

- **WHEN** the browser blocks storage and the visitor selects "cm"
- **THEN** the root element has `data-unit="cm"`

### Requirement: The selected option of a toggle stays marked in forced colors

When the browser forces its own colours, the checked option of every segmented control, the header's Units toggle included, SHALL carry a visible outline or border that its other options do not.

#### Scenario: The Units toggle in forced colors

- **WHEN** a page is opened with forced colors active
- **THEN** the checked option of the Units group has an outline or border and the other option has none

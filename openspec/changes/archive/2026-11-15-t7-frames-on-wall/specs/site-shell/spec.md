# Spec Delta

## MODIFIED Requirements

### Requirement: The unit choice is one site-wide preference

The site SHALL offer a choice between inches and centimetres in the header, as a group of two options named "Units" of which exactly one is selected. Inches SHALL be selected for a first-time visitor and in the HTML the server returns. A choice SHALL stay in effect after a reload and on every other page in the same browser. The unit SHALL NOT be written to the URL.

Text a page writes in both units SHALL show only the chosen unit. The choice SHALL be applied before the page is first painted, so a visitor who chose centimetres never sees the inch text, and switching SHALL change it at once without a reload.

#### Scenario: A first visit

- **WHEN** a visitor with no stored preference opens a page
- **THEN** "in" is the selected unit

#### Scenario: The visitor switches to centimetres and reloads

- **WHEN** the visitor selects "cm" and reloads the page
- **THEN** "cm" is the selected unit and the URL has no unit in it

#### Scenario: Storage is unavailable

- **WHEN** the browser blocks storage and the visitor selects "cm"
- **THEN** "cm" is selected for the rest of that page view and no error is thrown

#### Scenario: Dual-unit text follows the choice

- **WHEN** a page holds a length written in both units and the visitor selects "cm"
- **THEN** the centimetre text is visible, the inch text is hidden, and both are still in the HTML

#### Scenario: A stored centimetre choice is applied before paint

- **WHEN** a visitor who chose "cm" opens a page
- **THEN** the document's root carries the cm unit before the first paint, and the inch text is never visible

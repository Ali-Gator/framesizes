## MODIFIED Requirements

### Requirement: Switching the unit converts the numbers already typed

The wizard SHALL have an in/cm toggle that sets the same unit as the site header's toggle. Switching SHALL convert every field: inches to centimetres at one decimal, centimetres to inches at the nearest eighth. Until the visitor edits a converted field, the answer SHALL use the length the field held before the switch, so a switch alone never changes the answer.

#### Scenario: Inches to centimetres and back

- **WHEN** Width reads 8⅛ in and the visitor switches to cm, then back to in
- **THEN** Width reads 20.6 cm, then 8⅛ in

#### Scenario: One unit for the page

- **WHEN** the visitor switches the wizard to cm
- **THEN** the site header's toggle shows cm and the page's other sizes show centimetres

#### Scenario: A switch keeps a near-standard frame standard

- **WHEN** the inside measurement is 16⅜ × 20 in, which names the 16x20 frame, and the visitor switches to cm
- **THEN** Width reads 41.6 cm and the answer still names the 16x20 frame

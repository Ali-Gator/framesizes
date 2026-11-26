## ADDED Requirements

### Requirement: The current hub stays marked in forced colors

In forced colors the header's current hub link SHALL keep a mark drawn in a system colour, an underline, besides its bold text, since forced colors drop the shadow that marks it otherwise.

#### Scenario: The current hub in forced colors

- **WHEN** a page in the Frames hub is opened with forced colors active and two hubs live
- **THEN** the "Frames" link is underlined and the other hub links are not

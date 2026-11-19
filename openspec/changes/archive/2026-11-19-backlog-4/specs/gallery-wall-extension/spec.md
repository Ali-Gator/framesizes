## ADDED Requirements

### Requirement: The 128 px icon has a clear border

The 128 px icon that the manifest names SHALL be the canvas's icon drawn 96 px wide and 96 px high, centred, with a fully transparent 16 px border on every side, as Chrome's install dialog and extensions page expect. The 16, 32 and 48 px icons keep the art edge to edge.

#### Scenario: The 128 px icon in the build

- **WHEN** the manifest's 128 px icon is read
- **THEN** every pixel within 16 px of an edge is fully transparent, and the art reaches the 96 px square inside that border

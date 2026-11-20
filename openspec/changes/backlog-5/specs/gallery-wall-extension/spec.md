## ADDED Requirements

### Requirement: Two pages never share a print

Each print added from a try SHALL get a frame id that no other page of the extension can give, even one that has not yet reloaded the saved wall. A print's picture SHALL be stored and shown under its own id only, so one page's print never shows or overwrites another page's picture. Walls saved with earlier ids SHALL keep loading with their pictures.

#### Scenario: A stale page adds a print

- **GIVEN** two extension pages on one wall, both before any print, and the second page in the upload step
- **WHEN** the first page adds print P1, the second page goes back to the sample room without saving and adds print P2 from a try
- **THEN** P1 and P2 have different frame ids and two different `art:` keys, and after both pages reload, each shows P1 with P1's picture and P2 with P2's picture

#### Scenario: An older saved print

- **GIVEN** a wall saved with a print under the id `a1` and its picture under `art:a1`
- **WHEN** the panel opens
- **THEN** the print shows with its picture

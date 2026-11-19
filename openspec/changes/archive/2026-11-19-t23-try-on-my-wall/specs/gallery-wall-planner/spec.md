# Spec Delta

## ADDED Requirements

### Requirement: A print from a shop is a frame of its own size

A print added from a shop SHALL be a lettered frame at its own size, with a 1 in moulding only when framed, drawn with its picture. It SHALL be named by its size as found, "<size> print", in its label, the size list and the nail table. It SHALL drag, set distances, take hangers and get nail marks like any frame, and SHALL offer no "Change size". The page itself SHALL never add one.

#### Scenario: A centimetre print in the layout

- **GIVEN** the default layout and a 60 × 90 cm print added unframed as frame F
- **WHEN** frame F is selected
- **THEN** its outside size is 23.6 × 35.4 in (60 × 90 cm), its label reads "F · 60 × 90 cm print", and the selection block offers no "Change size"

#### Scenario: The size list with a print

- **GIVEN** the default layout and a 24 × 36 in print added framed as frame F
- **WHEN** the whole group is selected
- **THEN** the size list holds a row "24 × 36 in print" for frame F with no "Change", and frames A to E keep their rows with "Change"

#### Scenario: Nail marks for a print

- **GIVEN** a 24 × 36 in unframed print added as frame F and one nail with a 2 in drop for all frames
- **WHEN** the Nail marks view is shown
- **THEN** the table has a row "Frame F · 24 × 36 in print" with its nail 2 in below the print's top edge

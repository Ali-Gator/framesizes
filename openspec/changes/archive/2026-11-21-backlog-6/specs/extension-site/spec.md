## ADDED Requirements

### Requirement: The Arabic pin picture shows right-to-left Chrome

On a right-to-left version, the pin picture SHALL show Chrome as it looks in that language, with the puzzle-piece button and the Extensions menu at the top left, as the text above it says. Text, the extension's mark, the puzzle-piece icon and the numbers 1 and 2 SHALL NOT be mirrored. Left-to-right versions SHALL keep today's drawing. A page SHALL hold one pin picture.

#### Scenario: The Arabic pin picture

- **WHEN** `/ar/extensions/gallery-wall-layout-generator?pinned=0` is opened
- **THEN** the page holds one pin picture, its puzzle-piece button marked 1 and its Extensions menu sit in the drawing's left half, its menu title is Chrome's Arabic "الإضافات", it still names "Gallery Wall Layout Generator", and its accessible name is in Arabic

#### Scenario: A left-to-right version keeps its drawing

- **WHEN** `/de/extensions/gallery-wall-layout-generator?pinned=0` is opened
- **THEN** the page holds one pin picture, and its puzzle-piece button marked 1 sits in the drawing's right half

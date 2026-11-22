## MODIFIED Requirements

### Requirement: A screen's scale has a first guess

Before any check, the engine SHALL guess a diagonal from the screen's CSS size and pointer: 6.1 in when the shorter side is at most 500 px; 11 in when the pointer is coarse and the shorter side is at most 1,100 px; 14 in when the straight-line length is under 2,200 px; otherwise 23 in. The guess SHALL be that diagonal's scale. The engine SHALL export the 11 in rule as `isTabletScreen`, true exactly for a screen that is not a phone, has a coarse pointer and a shorter side of at most 1,100 px, and the guess SHALL use it.

#### Scenario: A phone

- **WHEN** the screen is 393 × 852 CSS px with a coarse pointer
- **THEN** the guessed diagonal is 6.1 in and the scale about 153.8 px per inch

#### Scenario: A 13 in laptop

- **WHEN** the screen is 1,470 × 956 CSS px with a fine pointer
- **THEN** the guessed diagonal is 14 in and the scale about 125.2 px per inch

#### Scenario: A monitor

- **WHEN** the screen is 1,920 × 1,080 CSS px with a fine pointer
- **THEN** the guessed diagonal is 23 in and the scale about 95.8 px per inch

#### Scenario: A tablet

- **WHEN** the screen is 820 × 1,180 CSS px with a coarse pointer
- **THEN** `isTabletScreen` is true, the guessed diagonal is 11 in and the scale about 130.6 px per inch; with a fine pointer, or at 393 × 852, `isTabletScreen` is false

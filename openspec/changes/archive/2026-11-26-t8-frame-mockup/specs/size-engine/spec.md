# Spec Delta

## MODIFIED Requirements

### Requirement: A saved mockup is 2400 pixels on its longer side

The engine SHALL give the pixel size of a saved mockup from its view: the view's longer side becomes 2400 pixels and the other side is scaled to match, rounded to a whole pixel. A view whose width or height is not a positive finite number SHALL get no size.

#### Scenario: The whole wall saved

- **WHEN** the pixel size is asked for the whole-wall view
- **THEN** it is 2400 by 1600 pixels

#### Scenario: A 24x36 close-up saved

- **WHEN** the pixel size is asked for the 45 by 57 inch close-up
- **THEN** it is 1895 by 2400 pixels

#### Scenario: A view that is not a positive size

- **WHEN** the pixel size is asked for a view whose width is 0, or whose height is negative, NaN or Infinity
- **THEN** there is no answer

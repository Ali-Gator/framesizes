# Spec Delta

## ADDED Requirements

### Requirement: The header offers the language picker on translated pages

The header SHALL show the language picker's button, beside the Units toggle, on every version of a page that has translations, in both of the extension page's modes. It SHALL NOT show the button on a page without translations. The button SHALL add no heading to the page. Its accessible name SHALL hold the current language's name in that language. From 600px wide the button SHALL show that name; below 600px it SHALL show a globe icon and no visible text.

#### Scenario: The extension page's header

- **WHEN** `/extensions/gallery-wall-layout-generator` is requested
- **THEN** the header holds the language button, whose accessible name contains "English", and the page's `h2` headings are still exactly those listed in "The extension page's server HTML is the how-to"

#### Scenario: A page without translations

- **WHEN** `/` is requested
- **THEN** the header holds no language button

#### Scenario: The language button on a phone

- **GIVEN** `/ru/extensions/gallery-wall-layout-generator` is open 375px wide
- **THEN** the language button shows a globe and no visible text, its accessible name contains "Русский", and the document is no wider than the viewport

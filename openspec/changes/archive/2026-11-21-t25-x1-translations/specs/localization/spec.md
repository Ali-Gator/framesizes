# Spec Delta

## Purpose

The languages framesizes.app is offered in, how a translated page is addressed, and the language picker that moves a visitor between the language versions of a page.

## ADDED Requirements

### Requirement: The site knows 28 languages

The site SHALL declare 28 languages: English first, then the others in the order of the approved picker design (the reference picker's order). Each language SHALL have a lowercase URL code, an hreflang value, its name in its own language, its English name, and a text direction. Arabic SHALL be right-to-left, and every other language left-to-right. The two Portuguese entries SHALL also carry their region: Portugal and Brasil.

#### Scenario: The language list

- **WHEN** the language list is read
- **THEN** it holds 28 entries with unique URL codes and unique hreflang values, the first one is English, and every URL code is lowercase
- **AND** it holds an entry for each of: `ar`, `de`, `el`, `es`, `et`, `fi`, `fr`, `hi`, `hr`, `hu`, `id`, `it`, `ja`, `ko`, `nl`, Norwegian, `pl`, `pt-pt`, `ru`, `sv`, `th`, `pt-br`, Filipino, Chinese (Simplified), `tr`, `uk` and `vi`

#### Scenario: Arabic reads right to left

- **WHEN** the Arabic entry is read
- **THEN** its direction is right-to-left, and no other entry is right-to-left

### Requirement: A translated page lives under its language code

A translated version of a page SHALL be served at `/<code>` followed by the English page's path. The English version SHALL stay at the unprefixed path. A path whose first segment names English, or names no declared language, SHALL answer 404.

#### Scenario: The Russian version's address

- **WHEN** `/ru/extensions/gallery-wall-layout-generator` is requested
- **THEN** it answers 200

#### Scenario: English has no prefix

- **WHEN** `/en/extensions/gallery-wall-layout-generator` or `/xx/extensions/gallery-wall-layout-generator` is requested
- **THEN** it answers 404

### Requirement: A language version marks its own language

The content of a translated version SHALL sit in an element whose `lang` attribute is that language's hreflang value. The element SHALL carry `dir="rtl"` for a right-to-left language. Text left in English inside that content, such as the extension's name, SHALL be marked `lang="en"`.

#### Scenario: The Arabic version's content

- **WHEN** `/ar/extensions/gallery-wall-layout-generator` is requested
- **THEN** the `h1` sits inside an element with `lang="ar"` and `dir="rtl"`

### Requirement: The language picker lists every version of the page

A page that has translations SHALL show a button that opens a modal list of all 28 languages. Each entry SHALL be a link to that language's version of the current page. The link SHALL carry `hreflang`, and the entry SHALL show the language's name in its own language with `lang` set to that language. The entry for the current language SHALL be marked `aria-current="page"`, and SHALL also differ from the others by more than colour.

#### Scenario: Opening the picker on the Russian version

- **GIVEN** `/ru/extensions/gallery-wall-layout-generator` is open
- **WHEN** the visitor activates the language button
- **THEN** a modal dialog shows 28 links, the "Русский" link is marked `aria-current="page"`, and the "Deutsch" link points to `/de/extensions/gallery-wall-layout-generator`

#### Scenario: Closing the picker

- **GIVEN** the language picker is open
- **WHEN** the visitor presses Escape or activates the close button
- **THEN** the dialog closes and focus returns to the language button

### Requirement: Switching language keeps the page's state

Following a link in the picker SHALL keep the current URL's query string and hash.

#### Scenario: Switching from the pin steps

- **GIVEN** `/extensions/gallery-wall-layout-generator?pinned=0#pin` is open
- **WHEN** the visitor picks "Deutsch" in the language picker
- **THEN** the browser opens `/de/extensions/gallery-wall-layout-generator?pinned=0#pin`

### Requirement: The picker's search matches English and native names

The picker SHALL hold a search field. Typing in it SHALL leave visible only the languages whose native name, English name or URL code contains the typed text. Case, diacritics and surrounding spaces SHALL be ignored, and an empty field SHALL show every language. When nothing matches, the picker SHALL show a line saying no language was found.

#### Scenario: Searching in English and in Russian

- **WHEN** the visitor types "russian", and then, separately, "РУССКИЙ"
- **THEN** each time the only visible entry is "Русский"

#### Scenario: Diacritics are ignored

- **WHEN** the visitor types "espanol"
- **THEN** "Español" is visible

#### Scenario: Both Portuguese entries match

- **WHEN** the visitor types "port"
- **THEN** exactly the two Portuguese entries are visible

#### Scenario: No match

- **WHEN** the visitor types "klingon"
- **THEN** no language entry is visible and the no-match line is shown

### Requirement: Nothing redirects by browser language

The site SHALL NOT redirect a request to a language version by `Accept-Language`, by browser settings or by a stored choice. The address the visitor opens SHALL be the version they get.

#### Scenario: A Russian browser opens the English page

- **WHEN** `/extensions/gallery-wall-layout-generator` is requested with `Accept-Language: ru`
- **THEN** it answers 200 with the English page and no redirect

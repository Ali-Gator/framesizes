# Spec Delta

## ADDED Requirements

### Requirement: The extension page exists in every site language

The extension page SHALL have one version for each of the site's 28 languages. Each translated version SHALL hold the English page's content in its own language, in the same order. That covers the same headings, steps, list rows and questions, both modes, the links between the modes, the pin poll and, once live, the store link.

#### Scenario: The Russian version's heading outline

- **WHEN** `/ru/extensions/gallery-wall-layout-generator` is requested
- **THEN** the response HTML holds one `h1`, then five `h2` headings, three `h3` steps under the second `h2`, and three `h3` questions, in the English page's order, all in Russian

#### Scenario: Pin mode on a translated version

- **WHEN** `/ja/extensions/gallery-wall-layout-generator?pinned=0` is opened
- **THEN** the pin section is visible and the usage sections are not

### Requirement: The extension's own words stay in English

Every version SHALL keep the extension's name "Gallery Wall Layout Generator" in English, and the right-click label "Try on my wall" quoted in English, because the extension itself is shown in English.

#### Scenario: The French answer paragraph

- **WHEN** `/fr/extensions/gallery-wall-layout-generator` is requested
- **THEN** the paragraph after the `h1` holds the text "Try on my wall" in English

### Requirement: The drawings use Chrome's own labels in the page's language

On a translated version, the labels in the pin picture and the right-click figure that belong to Chrome itself SHALL be Chrome's own wording in that language. These are the Extensions menu's title and its access lines, "Manage extensions", "Copy image" and "Inspect". The extension's name and "Try on my wall" SHALL stay English. Every drawing's accessible name SHALL be in the page's language.

#### Scenario: The German pin picture

- **WHEN** `/de/extensions/gallery-wall-layout-generator?pinned=0` is opened
- **THEN** the pin picture's menu title is Chrome's German "Erweiterungen", it still names "Gallery Wall Layout Generator", and its accessible name is in German

### Requirement: A translated version's breadcrumbs are translated

A translated version SHALL show the same breadcrumb trail as the English page, with every crumb name in its language. The crumb links SHALL point to the English pages, and its `BreadcrumbList` SHALL carry the same translated names.

#### Scenario: The Spanish breadcrumbs

- **WHEN** `/es/extensions/gallery-wall-layout-generator` is requested
- **THEN** its breadcrumb `nav` has three crumbs in Spanish, the first linking to `/` and the second to `/gallery-wall-planner`, and the last is marked `aria-current="page"`

### Requirement: A translated version leaves out Related tools

A translated version SHALL NOT show the Related tools block, because every page it would link to is English only.

#### Scenario: No Related tools in Italian

- **WHEN** `/it/extensions/gallery-wall-layout-generator` is requested while G1 is live
- **THEN** the response HTML holds no "Related tools" section

### Requirement: Translated head values stay within limits

Each translated version SHALL declare its own title, `h1` and description. Its title SHALL be 60 characters or fewer including the " | Frame Sizes" suffix. Its description SHALL be 160 characters or fewer and not empty. No two versions SHALL share a title or a description. Unlike English descriptions, translated ones have no 130-character floor, because CJK and Thai text is much shorter.

#### Scenario: A translation breaks a head limit

- **WHEN** a translated version's full title is longer than 60 characters, or its description is empty, longer than 160 characters, or equal to another version's
- **THEN** the unit suite fails, naming the language

### Requirement: Translated versions go live with the English page

Every translated version SHALL be built while X1 is built. It SHALL carry `noindex` exactly while X1's entry is not live. Setting X1 live SHALL remove it from every version with no other edit.

#### Scenario: A translated version before go-live

- **GIVEN** X1 is not live
- **WHEN** `/pl/extensions/gallery-wall-layout-generator` is requested
- **THEN** it answers 200 with a robots meta tag holding `noindex`

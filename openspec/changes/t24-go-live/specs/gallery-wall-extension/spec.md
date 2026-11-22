## MODIFIED Requirements

### Requirement: The first install opens the how-to page

On a first install, and only then, the extension SHALL open one tab on the how-to page in Chrome's interface language, with `?pinned=1` when its toolbar button is pinned and `?pinned=0` when it is not. The English page is `https://framesizes.app/extensions/gallery-wall-layout-generator`; a translated one sits under its site language code, such as `/ru/extensions/gallery-wall-layout-generator`. A language the site lacks, or one Chrome does not report, SHALL open the English page.

#### Scenario: A fresh install with the button not pinned

- **GIVEN** the toolbar button is not pinned and Chrome's interface language is English
- **WHEN** the extension is installed
- **THEN** one tab opens on `https://framesizes.app/extensions/gallery-wall-layout-generator?pinned=0`

#### Scenario: An update opens nothing

- **WHEN** the extension is updated or Chrome is updated
- **THEN** no tab opens

#### Scenario: A fresh install in another language

- **GIVEN** the toolbar button is pinned
- **WHEN** the extension is installed in Chrome whose interface language is `ru`, `de-AT`, `fil`, `zh-CN`, `pt-BR`, `pt-PT` or `nb`
- **THEN** one tab opens on `https://framesizes.app/<code>/extensions/gallery-wall-layout-generator?pinned=1`, where `<code>` is `ru`, `de`, `tl`, `zh-hans`, `pt-br`, `pt-pt` or `no` in that order

#### Scenario: A fresh install in a language the site lacks

- **WHEN** the extension is installed in Chrome whose interface language is `zh-TW`, `ca` or `en-GB`, or Chrome reports no language
- **THEN** the tab opens on the English page, `https://framesizes.app/extensions/gallery-wall-layout-generator`, with its `pinned` query

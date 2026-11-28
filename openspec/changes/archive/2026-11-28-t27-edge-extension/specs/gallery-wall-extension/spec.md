# Spec Delta

## ADDED Requirements

### Requirement: Each store gets its own package

The extension SHALL build one package per store from the same code and manifest. The Chrome Web Store package SHALL stay as it was. The Microsoft Edge Add-ons package SHALL declare English only. Its name and short description SHALL be what the Edge store shows, and SHALL name no other browser. The Edge short description SHALL differ from the Chrome one.

#### Scenario: The Chrome package is unchanged

- **WHEN** the Chrome package is built
- **THEN** its manifest and its 28 `_locales` folders are the ones in `apps/extension/public`, and every `messages.json` keeps its `appName`, `shortDesc` and `storeDesc`

#### Scenario: The Edge package is English only

- **WHEN** the Edge package is built
- **THEN** its manifest equals the Chrome package's, `_locales` holds only `en`, and that `messages.json` holds exactly `appName` and `shortDesc`
- **AND** `appName` is "Gallery Wall Layout Generator"

#### Scenario: The Edge short description

- **WHEN** the Edge package's `shortDesc` is read
- **THEN** it is 132 characters or fewer, differs from the Chrome package's English `shortDesc`, and contains neither "Chrome" nor "Google"

## MODIFIED Requirements

### Requirement: The first install opens the how-to page

On a first install, and only then, the extension SHALL open one tab on the how-to page in the browser's interface language, with `?pinned=1` when its toolbar button is pinned and `?pinned=0` when it is not. The English page is `https://framesizes.app/extensions/gallery-wall-layout-generator`; a translated one sits under its site language code, such as `/ru/extensions/gallery-wall-layout-generator`. A language the site lacks, or one the browser does not report, SHALL open the English page. The Edge package SHALL add `&store=edge` after `pinned`; the Chrome package SHALL add nothing.

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

#### Scenario: A fresh install from Microsoft Edge Add-ons

- **GIVEN** the Edge package, its toolbar button not pinned
- **WHEN** it is installed in Edge whose interface language is `de`
- **THEN** one tab opens on `https://framesizes.app/de/extensions/gallery-wall-layout-generator?pinned=0&store=edge`

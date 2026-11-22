## MODIFIED Requirements

### Requirement: The header offers the language picker on translated pages

The header SHALL show the language picker's button, beside the Units toggle, on every version of a page that has translations, in both of the extension page's modes, and the button SHALL be in that page's server HTML. It SHALL NOT show the button on a page without translations, and such a page SHALL load none of the picker's script or styles. The button SHALL add no heading to the page. Its accessible name SHALL hold the current language's name in that language. From 600px wide the button SHALL show that name; below 600px it SHALL show a globe icon and no visible text. After an in-app move to a translated page, the header SHALL keep the button's space while the picker's code loads, so the Units toggle and the hub links do not move when the button appears.

#### Scenario: The extension page's header

- **WHEN** `/extensions/gallery-wall-layout-generator` is requested
- **THEN** the header holds the language button, whose accessible name contains "English", and the page's `h2` headings are still exactly those listed in "The extension page's server HTML is the how-to"

#### Scenario: A page without translations

- **WHEN** `/` is requested
- **THEN** the header holds no language button

#### Scenario: The language button on a phone

- **GIVEN** `/ru/extensions/gallery-wall-layout-generator` is open 375px wide
- **THEN** the language button shows a globe and no visible text, its accessible name contains "Русский", and the document is no wider than the viewport

#### Scenario: A page without translations loads no picker code

- **WHEN** `/` is loaded in a browser
- **THEN** none of the styles it loads define the language button or dialog, and none of the scripts it loads hold the picker's own words, such as "Choose a language"

#### Scenario: An in-app move to a translated page keeps the header still

- **GIVEN** `/` is open 375px and 1280px wide
- **WHEN** the visitor moves in the app to `/extensions/gallery-wall-layout-generator` and the picker's code arrives late
- **THEN** the Units toggle sits at the same place while the code loads and after the language button appears

### Requirement: Visits are measured without cookies

Page views and Core Web Vitals field data SHALL be reported to the site's analytics without setting a cookie or writing to browser storage, so that the site needs no consent banner for measurement. Analytics requests SHALL go to the site's own origin. Analytics SHALL run in cookieless mode and every event it sends SHALL ask for no location lookup.

#### Scenario: A visit sets no cookie

- **WHEN** a visitor opens `/` and the page finishes loading
- **THEN** the browser holds no cookie for the site

#### Scenario: Analytics stays first-party

- **WHEN** a visitor opens `/` with analytics configured and the page finishes loading
- **THEN** no request went to a host other than the site's own, and `localStorage` holds no analytics key

#### Scenario: Analytics is not configured

- **WHEN** the site is built without an analytics token and a visitor opens `/`
- **THEN** the page works, no analytics request is sent and no error is logged to the console

#### Scenario: Analytics events ask for no location

- **WHEN** analytics starts with a token
- **THEN** it is set up with `cookieless_mode: "always"`, and every event it sends carries `$geoip_disable: true`

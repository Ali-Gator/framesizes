# Spec Delta

## Purpose

The frame every page renders in: header, hub navigation, footer and the 404 page, plus the things a visitor carries from page to page (the in/cm preference, the theme, the fonts) and how visits are measured.

## ADDED Requirements

### Requirement: Every page renders inside one shell

Every page, including the 404 page, SHALL render a header with a link to the home page, exactly one `main` region and a footer. The header's home link SHALL have the accessible name "Frame Sizes home".

#### Scenario: The home page is opened

- **WHEN** a visitor opens `/`
- **THEN** the page has one banner containing a link named "Frame Sizes home" that points to `/`, one `main` region and one footer

### Requirement: The header lists the live hubs

The header SHALL show one link per hub whose head page is live, in the order Frames, Posters, Photo prints, Canvas, Print quality, Gallery wall, and SHALL mark the hub of the current page with `aria-current="page"`. When fewer than two hubs are live, the header SHALL show no hub links and no menu button.

#### Scenario: Several hubs are live

- **WHEN** the header is rendered for a page in the Frames hub while the Frames and Posters hubs are live
- **THEN** it holds the links "Frames" and "Posters" in that order, and only "Frames" carries `aria-current="page"`

#### Scenario: Only one hub is live

- **WHEN** the header is rendered while only the Frames hub is live
- **THEN** it holds no hub links and no menu button

### Requirement: Hub links collapse behind a menu button on narrow screens

Below 600px of viewport width the hub links SHALL be hidden until the visitor presses a menu button. The button SHALL expose its state with `aria-expanded` and name the link list with `aria-controls`. The links SHALL be part of the HTML the server returns whether the menu is open or closed, and opening the menu SHALL push the page down instead of covering it.

#### Scenario: The menu is closed on first render

- **WHEN** the header is rendered on the server with two live hubs
- **THEN** the HTML contains both hub links and a button named "Menu" with `aria-expanded="false"` and an `aria-controls` that matches the link list's id

#### Scenario: The visitor opens and closes the menu

- **WHEN** the visitor presses the menu button, and presses it again
- **THEN** `aria-expanded` is "true" after the first press and "false" after the second

### Requirement: The footer lists the live pages by hub

The footer SHALL list every live page as a link, grouped under its hub's name, and SHALL leave out pages that are not live and hubs with no live page. It SHALL carry the note that sizes are nominal and that the visitor should measure the frame's opening before ordering a print.

#### Scenario: One page is live

- **WHEN** the footer is rendered while only the home page is live
- **THEN** it shows the group "Frames" with one link, "Frame size chart", pointing to `/`, no other group, and the nominal-size note

### Requirement: The unit choice is one site-wide preference

The site SHALL offer a choice between inches and centimetres in the header, as a group of two options named "Units" of which exactly one is selected. Inches SHALL be selected for a first-time visitor and in the HTML the server returns. A choice SHALL stay in effect after a reload and on every other page in the same browser. The unit SHALL NOT be written to the URL.

#### Scenario: A first visit

- **WHEN** a visitor with no stored preference opens a page
- **THEN** "in" is the selected unit

#### Scenario: The visitor switches to centimetres and reloads

- **WHEN** the visitor selects "cm" and reloads the page
- **THEN** "cm" is the selected unit and the URL has no unit in it

#### Scenario: Storage is unavailable

- **WHEN** the browser blocks storage and the visitor selects "cm"
- **THEN** "cm" is selected for the rest of that page view and no error is thrown

### Requirement: Unknown paths answer with a real 404

A path that matches no page SHALL answer with HTTP status 404 and a page, inside the shell, that says the page was not found and links to every live hub head.

#### Scenario: A visitor opens a path that does not exist

- **WHEN** `/no-such-page` is requested
- **THEN** the response status is 404 and the page shows a "Page not found" heading and a link to `/`

### Requirement: The site ships in the light theme only

Every page SHALL render in the light theme whatever colour scheme the visitor's system asks for.

#### Scenario: The system prefers dark

- **WHEN** a visitor whose system colour scheme is dark opens `/`
- **THEN** the page background is the light theme's wall colour, `#f3f4ef`

### Requirement: Fonts are served from the site's own origin

The two font families (Schibsted Grotesk for text, IBM Plex Mono for measurements) SHALL be served by the site itself. Rendering a page SHALL NOT request anything from a third-party font host.

#### Scenario: A page loads

- **WHEN** a visitor opens `/` and the page finishes loading
- **THEN** the body text is set in Schibsted Grotesk and no request went to `fonts.googleapis.com` or `fonts.gstatic.com`

### Requirement: The shell fits a 320px screen

At a viewport 320px wide the shell SHALL show all of its content without a horizontal scrollbar on the page.

#### Scenario: A narrow phone

- **WHEN** `/` is opened at 320 × 568
- **THEN** the document is no wider than the viewport

### Requirement: The shell has no detectable accessibility violations

The shell SHALL pass an automated WCAG 2.2 A and AA check with no violations, on a phone-sized and a desktop-sized viewport.

#### Scenario: The home page and the 404 page are checked

- **WHEN** an automated accessibility check runs on `/` and on a 404 page at 390 × 844 and at 1280 × 800
- **THEN** it reports no violations

### Requirement: Visits are measured without cookies

Page views and Core Web Vitals field data SHALL be reported to the site's analytics without setting a cookie or writing to browser storage, so that the site needs no consent banner for measurement. Analytics requests SHALL go to the site's own origin.

#### Scenario: A visit sets no cookie

- **WHEN** a visitor opens `/` and the page finishes loading
- **THEN** the browser holds no cookie for the site

#### Scenario: Analytics stays first-party

- **WHEN** a visitor opens `/` with analytics configured and the page finishes loading
- **THEN** no request went to a host other than the site's own, and `localStorage` holds no analytics key

#### Scenario: Analytics is not configured

- **WHEN** the site is built without an analytics token and a visitor opens `/`
- **THEN** the page works, no analytics request is sent and no error is logged to the console

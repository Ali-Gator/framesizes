# site-shell Specification

## Purpose

The frame every page renders in: header, hub navigation, footer and the 404 page, plus the things a visitor carries from page to page (the in/cm preference, the theme, the fonts) and how visits are measured.

## Public Interface

```typescript
// apps/web/src/components/site/
function SiteHeader(props: { hubs: HubLink[] }): JSX.Element; // server component
function HubNav(props: { links: HubLink[] }): JSX.Element; // client: menu button + hub links
function SiteFooter(props: { groups: FooterGroup[] }): JSX.Element;
function UnitToggle(): JSX.Element; // client: in/cm SegmentedControl
const HOME_LINK_NAME = "framesizes.app home";

// apps/web/src/lib/unit.ts
type Unit = "in" | "cm";
function useUnit(): Unit; // "in" on the server and for a first visit
function setUnit(unit: Unit): void; // also sets <html data-unit>

// apps/web/src/components/ui/u.tsx
function U(props: { in: ReactNode; cm: ReactNode }): JSX.Element; // <span.u-in/><span.u-cm/>; globals.css shows one by [data-unit]

// apps/web/src/app/layout.tsx
// <html data-unit="in" suppressHydrationWarning>, plus a blocking inline <head> script
// that sets data-unit="cm" when localStorage.unit is "cm"

// apps/web/src/components/ui/segmented-control.tsx
function SegmentedControl<T extends string>(props: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: "md" | "sm";
}): JSX.Element;
```

`apps/web/src/instrumentation-client.ts` starts PostHog when `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` is set; `apps/web/next.config.ts` proxies `/ingest/*` to PostHog EU Cloud.

## Behavior

The root layout renders `SiteHeader`, `main` and `SiteFooter` around every page, the 404 page included. Header hub links and footer groups come from the site map (`seo-base`): `navHubs()` and `footerGroups()`. `HubNav` marks the hub whose live pages include the current path. Below 600px the link list is hidden until the menu button opens it; choosing a hub or pressing Escape closes it.

The unit is kept in `localStorage` under the key `unit` and read through `useSyncExternalStore`, so the server HTML and hydration use "in" and the stored choice follows. A choice made while storage throws lives in memory for the page view. A `storage` event from another tab replaces it.

The unit is also on `<html data-unit>`, for CSS. The server renders "in"; a blocking inline script in the layout's `<head>` sets "cm" from storage before first paint, and `setUnit` and the `storage` listener (including a cleared storage) keep it current. `globals.css` hides `.u-cm` under `[data-unit="in"]` and `.u-in` under `[data-unit="cm"]`. In forced colors every `SegmentedControl` option has a 2px border, `Highlight` on the checked one and `Canvas` on the rest, so the choice stays visible and toggling shifts nothing.

Colours, radii, shadows and type styles come from the design system's light tokens in `globals.css`; fonts load through `next/font/google` and are served from the site's origin.

PostHog runs with `cookieless_mode: "always"`, autocapture and session replay off, `api_host: "/ingest"`, and a `before_send` that sets `$geoip_disable: true` on every event. Web Vitals capture is a PostHog project setting.

## Edge Cases

- One live hub: no hub links and no menu button in the header; the footer still links every live page.
- Storage blocked or throwing: the toggle still switches and nothing is logged.
- No analytics token (CI, tests): PostHog never starts and no `/ingest` request is made.
- System colour scheme dark: the page stays light (`color-scheme: light`).

## Requirements

### Requirement: Every page renders inside one shell

Every page, including the 404 page, SHALL render a header with a link to the home page, exactly one `main` region and a footer. The header's home link SHALL have the accessible name "framesizes.app home", which contains the wordmark the link shows, so a voice user can name it by what they see (WCAG 2.5.3).

#### Scenario: The home page is opened

- **WHEN** a visitor opens `/`
- **THEN** the page has one banner containing a link named "framesizes.app home" that points to `/`, one `main` region and one footer

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

The footer SHALL list every live page as a link, grouped under its hub's name, and SHALL leave out pages that are not live and hubs with no live page. It SHALL carry the note that sizes are nominal and that the visitor should measure the frame's opening before ordering a print. Below the groups, a company row SHALL show "©", the year the site was built and the operator's legal name, its postal address, and a `nav` named "Company" linking each live page that has no hub, in site map order.

#### Scenario: One page is live

- **WHEN** the footer is rendered while only the home page is live
- **THEN** it shows the group "Frames" with one link, "Frame size chart", pointing to `/`, no other group, and the nominal-size note

#### Scenario: The company row

- **WHEN** the footer is rendered while the five company pages are live
- **THEN** the hub groups hold none of them, and the company row shows "Soft Divisions Limited", the postal address "B, G/F, 322 Shanghai Street, Yau Ma Tei, Kowloon, Hong Kong" and a `nav` named "Company" with the links About, Contact, Privacy policy, Terms of use and Refund policy, pointing to `/about`, `/contact`, `/privacy-policy`, `/terms-of-use` and `/refund-policy`

### Requirement: The unit choice is one site-wide preference

The site SHALL offer a choice between inches and centimetres in the header, as a group of two options named "Units" of which exactly one is selected. Inches SHALL be selected for a first-time visitor and in the HTML the server returns. A choice SHALL stay in effect after a reload and on every other page in the same browser. The unit SHALL NOT be written to the URL.

Text a page writes in both units SHALL show only the chosen unit. The choice SHALL be applied before the page is first painted, so a visitor who chose centimetres never sees the inch text, and switching SHALL change it at once without a reload.

#### Scenario: A first visit

- **WHEN** a visitor with no stored preference opens a page
- **THEN** "in" is the selected unit

#### Scenario: The visitor switches to centimetres and reloads

- **WHEN** the visitor selects "cm" and reloads the page
- **THEN** "cm" is the selected unit and the URL has no unit in it

#### Scenario: Storage is unavailable

- **WHEN** the browser blocks storage and the visitor selects "cm"
- **THEN** "cm" is selected for the rest of that page view and no error is thrown

#### Scenario: Dual-unit text follows the choice

- **WHEN** a page holds a length written in both units and the visitor selects "cm"
- **THEN** the centimetre text is visible, the inch text is hidden, and both are still in the HTML

#### Scenario: A stored centimetre choice is applied before paint

- **WHEN** a visitor who chose "cm" opens a page
- **THEN** the document's root carries the cm unit before the first paint, and the inch text is never visible

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

### Requirement: The page knows the unit before it paints

The root element of every page SHALL carry the visitor's unit as `data-unit`, set from the stored choice before the first paint, "in" when nothing is stored or storage is unavailable. Each change of unit, by the toggle, by another tab or while storage is blocked, SHALL update the attribute.

#### Scenario: A stored choice at load

- **WHEN** a visitor whose stored unit is centimetres opens a page
- **THEN** the root element has `data-unit="cm"` before any of the page's script bundles have run

#### Scenario: Nothing is stored

- **WHEN** a visitor with no stored preference opens a page
- **THEN** the root element has `data-unit="in"`

#### Scenario: The toggle with storage blocked

- **WHEN** the browser blocks storage and the visitor selects "cm"
- **THEN** the root element has `data-unit="cm"`

### Requirement: The selected option of a toggle stays marked in forced colors

When the browser forces its own colours, the checked option of every segmented control, the header's Units toggle included, SHALL carry a visible outline or border that its other options do not.

#### Scenario: The Units toggle in forced colors

- **WHEN** a page is opened with forced colors active
- **THEN** the checked option of the Units group has an outline or border and the other option has none

### Requirement: The Units toggle shows the stored unit from first paint

The header's Units toggle SHALL look checked on the visitor's stored unit from the first paint, before any of the page's script bundles have run, and only on that option. Once the page's scripts have run, the checked look, `aria-checked` and keyboard focus SHALL all name the same option.

#### Scenario: A stored centimetre choice before the scripts run

- **WHEN** a visitor whose stored unit is centimetres opens a page and its script bundles have not run yet
- **THEN** the Units toggle's "cm" option has the checked look and its "in" option does not

#### Scenario: The toggle after the scripts run

- **WHEN** a visitor whose stored unit is centimetres opens a page and its scripts have run
- **THEN** the "cm" option has the checked look and `aria-checked="true"`, and the "in" option has neither

### Requirement: A stored centimetre choice waits for the widgets

When the stored unit is centimetres, the root element SHALL carry a pending marker from before the first paint until the page's distance fields have rendered in centimetres or the visitor changes the unit. The marker SHALL be set only then: never when nothing is stored, when inches are stored or when storage is unavailable.

#### Scenario: The marker with centimetres stored

- **WHEN** a visitor whose stored unit is centimetres opens `/frame-sizes-on-wall`
- **THEN** the root element carries the pending marker before any of the page's script bundles have run, and does not carry it once the widget shows centimetres

#### Scenario: No marker with inches

- **WHEN** a visitor with no stored preference opens a page
- **THEN** the root element never carries the pending marker

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

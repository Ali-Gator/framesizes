# extension-site Specification

## Purpose

What framesizes.app shows about the Chrome extension "Gallery Wall Layout Generator": the page the extension opens after install, with its pin and usage modes, and the extension section on G1 and F2, both able to ask the installed extension whether it is there and pinned.

## Public Interface

```typescript
// apps/web/src/lib/extension.ts
const EXTENSION_ID: string; // the published listing's id, "khapjkonaofjfljdakdcmodaclkmffgn"
function storeUrl(id: string): string; // https://chromewebstore.google.com/detail/<id>
const STORE_URL: string; // storeUrl(EXTENSION_ID)
type ExtensionStatus = { installed: false } | { installed: true; pinned: boolean };
function askExtension(id: string, timeout = 1000): Promise<ExtensionStatus>; // never rejects
const EDGE_EXTENSION_ID: string; // Microsoft Edge Add-ons (CRX) id; "" until the Edge listing is published
const STORES: Record<"chrome" | "edge", { pageUrl(id: string): string; section: { label; sidePanel; add; opens; phone; have } }>;
function knownIds(chrome = EXTENSION_ID, edge = EDGE_EXTENSION_ID): string[]; // the set ids, Chrome's first
function askExtensions(ids: readonly string[]): Promise<ExtensionStatus>; // any installed reply; pinned if any says so

// apps/web/src/components/extension/
function modeOf(hash: string, search: string): { mode: "pin" | "usage"; from: "hash" | "query" };
const MODE_SCRIPT: string; // the same rule as an inline pre-paint script
type SiteStore = "chrome" | "edge"; // store.ts
function pickStore(input: { search: string; brands?: { brand: string }[]; ua: string }, fromQuery = true): SiteStore;
function storeScript(fromQuery: boolean): string; // pickStore as an inline pre-paint script
function applyStore(fromQuery: boolean): SiteStore; // the same on a client-side visit; Chrome if navigator throws
function ByStore(props: { chrome: ReactNode; edge?: ReactNode | null; stores: readonly SiteStore[]; as?: "span" | "div" }): JSX.Element;
function ModeSwitch(props: { extensionId: string; edgeId? }): null; // client island
function StoreLink(props: { pages?; extensionId?; edgeId?; label?; edgeLabel? }): JSX.Element | null;
function ExtensionSection(props: { pages?; extensionId?; edgeId? }): JSX.Element | null;
function ExtensionStatus(props: { extensionId: string; edgeId? }): JSX.Element; // client island, the CTA cell
function PinPicture(props: { label?: string; chrome?: ChromeLabels; dir?: "ltr" | "rtl"; store?: SiteStore }): JSX.Element;
function EdgePinPicture(props: { label: string; dir?: "ltr" | "rtl" }): JSX.Element; // edge-pin-picture.tsx
const EDGE_LABELS: { extensions; manage; get; copyImage; inspect }; // Edge's English labels, every language
function PrintFigure / LayoutFigure / NailFigure(props: { label: string }): JSX.Element;
function MenuFigure(props: { label: string; menu?: { copyImage: string; inspect: string }; store?: SiteStore; dir?: "ltr" | "rtl" }): JSX.Element;
function ExtensionHowTo(props: { copy: ExtensionCopy; locale: string }): JSX.Element; // the page body, every language

// apps/web/src/components/extension/copy/
const en: { seo; crumbs; answer; store; noButton; showPin; pin; usage; steps; wall; perm; faq; edge; chrome };
// edge: { answer; store; pin: { text; picture }; faqButton }, the lines that differ for Edge
type ExtensionCopy = typeof en; // every other copy/<code>.ts `satisfies ExtensionCopy`
type ChromeLabels = ExtensionCopy["chrome"]; // Chrome's own labels, from Chromium's xtb files
const COPY: Readonly<Record<string, ExtensionCopy>>; // copy/index.ts, by URL code, all 28
```

Routes: `apps/web/src/app/extensions/gallery-wall-layout-generator/` (`page.tsx`, `opengraph-image.tsx`, `extension.css`) and `apps/web/src/app/[locale]/extensions/gallery-wall-layout-generator/` (`page.tsx` with `generateStaticParams` over the 27 translated codes and `dynamicParams = false`, `opengraph-image.tsx` re-exporting the English image). Section and figure styles live in `apps/web/src/app/widgets.css` (`ext-sec-*`, `ext-fig-*`, `pp-*`, and the global `.st-chrome`/`.st-edge` hide rule).

## Behavior

The extension (`apps/extension` `background.ts`) opens the page with `?pinned=0|1` on install and answers `{ type: "status" }` from `https://framesizes.app/*`. The site asks through `askExtension`, which resolves to not installed on a missing `chrome.runtime.sendMessage`, a throw, `lastError`, a malformed reply or a 1 s timeout.

The mode lives on `<html data-ext-mode>`. `MODE_SCRIPT` sets it before paint; `ModeSwitch` sets it again on mount (a client-side visit runs no inline script) and on every `hashchange`, moving focus to the shown section's `h2` only when the hash names a mode. CSS hides `.ext-pin` unless the mode is pin (or, with no JS, it is the `:target`) and hides `.ext-usage` in pin mode. In pin mode from the query, `ModeSwitch` asks every 2 s with a chained `setTimeout` while the tab is visible, restarts after a hash change that lands back on the query mode, and on a pinned reply switches to usage, carrying focus from the pin section to the usage heading.

Go-live happened on 2026-11-22 (t24-go-live) in one edit: `EXTENSION_ID` set and X1 `live: true` with its `lastModified`. A unit test fails when only one is done, so a rollback is both lines: `EXTENSION_ID = ""` and X1 `live: false`. `StoreLink` and `ExtensionSection` render nothing unless X1 is live and the id is set. The not-live tests use fixtures or skip once X1 is live.

The section's call to action and the "You have it" line share one grid cell; `ExtensionStatus` asks once after hydration and hides the other line with `visibility: hidden`, so the cell keeps its height. `@media (hover: none) and (pointer: coarse)` shows the phone line instead of "Add to Chrome".

Every language renders through `ExtensionHowTo`. Its wrapper carries the language's `lang`, `dir` and, for scripts Schibsted lacks, the system font stack. `rich()` marks each "Gallery Wall Layout Generator" and "Try on my wall" in a sentence with `lang="en"` and fills `{door}` with the door height in both units. Breadcrumb names come from the dictionary by position (Home, hub, page); English reads them from the site map. Only English shows Related tools. Each drawing places its own text (`direction: ltr` in `extension.css`): the pin picture follows the page's direction (`PinPicture dir`; Arabic gets the right-to-left drawing), the right-click figure mirrors on a right-to-left page (`MenuFigure dir`), its text left to right; the pin picture's grey lines shrink below 11.5 px when a translation is wider than about 46 Latin characters.

The store lives on `<html data-ext-store>`. X1 renders `storeScript(true)` (`?store=edge`, then the browser's brands or user agent, else Chrome); `ExtensionSection` renders `storeScript(false)` (the browser alone). On a client-side visit `ModeSwitch` and `ExtensionStatus` call `applyStore` in a layout effect, before paint, and clear the attribute on unmount. `ByStore` puts each built store's variant side by side (`.st-chrome`, `.st-edge`); the global rule in `widgets.css` hides the one the attribute does not name, so crawlers and no-JS visitors get Chrome. X1 builds Chrome and Edge always; the section, the store link and Edge's id ask build Edge only once `EDGE_EXTENSION_ID` is set. Edge's how-to shares Chrome's pin heading and links: Edge 158 pins from the Extensions menu like Chrome (checked 2026-11-28).

## Edge Cases

- No JS with `#pin`: the pin steps show through `:target`, with the usage sections still below them.
- A click on a switch link before hydration: the mode follows the hash on mount, without moving focus.
- A hidden tab: the poll timer keeps running but sends nothing (BL-69).
- Figures draw the current flat sample room; BL-51 swaps it with F2 and G1.
- Translated versions share the English social image and its English alt (BL-77).
- Opera, and `?store=opera`, pick Chrome until Opera is built (T28).
- Before `EDGE_EXTENSION_ID` is set, an Edge visitor gets Edge's how-to with no store link, the Chrome section on G1/F2, and a pin poll that asks Chrome's id only; "Already pinned? See how to use it" leaves pin mode.
- A soft navigation from X1 `?store=edge` to G1 picks the store from the browser again.
- Edge's FAQ answer replaces the second FAQ item by position (BL-142).

## Requirements

### Requirement: The extension page's server HTML is the how-to

The HTML the server returns for `/extensions/gallery-wall-layout-generator` SHALL hold, in this order: the breadcrumbs, the single `h1` "How to Use the Gallery Wall Layout Generator", the answer paragraph, the pin section under its `h2`, the `h2` sections "What you can do in the side panel", "Use your own wall", "What the extension can see" and "Questions", and "Related tools" while a related page is live. The store link comes only from the requirement below.

#### Scenario: The extension page's heading outline

- **WHEN** `/extensions/gallery-wall-layout-generator` is requested
- **THEN** the response HTML holds the `h1` "How to Use the Gallery Wall Layout Generator", then the `h2` headings "Pin it to your toolbar", "What you can do in the side panel", "Use your own wall", "What the extension can see" and "Questions" in that order
- **AND** three `h3` steps under "What you can do in the side panel" ("Plan a gallery wall", "Try a print from a shop", "Get the nail marks"), and one `h3` per question, three in all

#### Scenario: The answer paragraph

- **WHEN** `/extensions/gallery-wall-layout-generator` is requested
- **THEN** the paragraph after the `h1` says that the toolbar button opens the side panel to plan a gallery wall, and that right-clicking a print on a shop and picking "Try on my wall" hangs it at true size

### Requirement: The page links to the store in plain text

While the extension page is live, one plain text link to the picked store's page SHALL follow the answer paragraph, in both modes. It opens in a new tab with `rel="noopener"`. Chrome's reads "Get it from the Chrome Web Store". Edge's reads "Get it from Microsoft Edge Add-ons", and only once Edge's store id is set. It SHALL be a text link, not a button. While the page is not live, the page SHALL hold no link to any store.

#### Scenario: The store link once live

- **GIVEN** the extension page is live with a store id
- **WHEN** the page is rendered
- **THEN** one `a` element reading "Get it from the Chrome Web Store" follows the answer paragraph, its `href` is the store page, with `target="_blank"` and `rel="noopener"`, and it carries no button styling

#### Scenario: No store link before go-live

- **WHEN** `/extensions/gallery-wall-layout-generator` is requested while the extension page is not live
- **THEN** the response HTML holds no `a` element whose `href` starts with `https://chromewebstore.google.com` or `https://microsoftedge.microsoft.com`

### Requirement: The page shows one mode at a time

The page SHALL show either pin mode (the pin section, with the usage sections hidden) or usage mode (the usage sections, with the pin section hidden). `#pin` or `#usage` in the URL SHALL pick the mode; with neither, `?pinned=0` SHALL pick pin mode and anything else usage mode. The mode SHALL be set before the first paint, and the `h1`, breadcrumbs and answer paragraph SHALL show in both modes.

#### Scenario: Opened after install with the button not pinned

- **WHEN** `/extensions/gallery-wall-layout-generator?pinned=0` is opened
- **THEN** "Pin it to your toolbar" is visible and "What you can do in the side panel" is not

#### Scenario: Opened after install with the button pinned

- **WHEN** `/extensions/gallery-wall-layout-generator?pinned=1` is opened
- **THEN** "What you can do in the side panel" is visible and "Pin it to your toolbar" is not

#### Scenario: A hash beats the query

- **WHEN** `/extensions/gallery-wall-layout-generator?pinned=0#usage` is opened
- **THEN** the page is in usage mode

### Requirement: Each mode links to the other

Pin mode SHALL end with "Already pinned? See how to use it", linking to `#usage`. Usage mode SHALL show "Don't see the button? Show how to pin it" under the answer paragraph, linking to `#pin`. Following either link SHALL switch the mode without a reload and move focus to the shown section's heading.

#### Scenario: From usage mode to the pin steps

- **GIVEN** the page is in usage mode
- **WHEN** the visitor follows "Show how to pin it"
- **THEN** the page is in pin mode, the URL ends with `#pin`, and focus is on the heading "Pin it to your toolbar"

### Requirement: Pin mode switches itself once the button is pinned

While the page is in pin mode because of `?pinned=0`, has no hash, and knows at least one store id, it SHALL ask the extension for its status every 2 seconds while the tab is visible. It asks each set store id, Chrome's first. When any reply says pinned, it SHALL do three things: switch to usage mode, stop asking, and drop `pinned` from the address without adding a history entry. Every other parameter and any hash stay, so a reload opens in usage mode. A mode picked by a hash SHALL never switch by itself.

#### Scenario: The visitor pins the button

- **GIVEN** the page is open at `?pinned=0` and the extension replies not pinned
- **WHEN** the extension's next reply says pinned
- **THEN** within 2 seconds the page is in usage mode and it sends no further status message

#### Scenario: The visitor asked for the pin steps

- **GIVEN** the page is open at `#pin` and the extension replies pinned
- **WHEN** 4 seconds pass
- **THEN** the page is still in pin mode

#### Scenario: The address after the self-switch

- **GIVEN** the page is open at `?pinned=0&utm_source=store` and the extension replies not pinned
- **WHEN** the extension's next reply says pinned
- **THEN** the address's query is `?utm_source=store`, the history length is unchanged, and the page is in usage mode

#### Scenario: The Edge package pins its button

- **GIVEN** a fixture Edge store id, the page open at `?pinned=0&store=edge`, and only the Edge id replying, not pinned
- **WHEN** the Edge id's next reply says pinned
- **THEN** within 2 seconds the page is in usage mode and the address's query is `?store=edge`

### Requirement: The pin picture shows the two clicks

The pin section SHALL hold one drawing per built store of that browser's toolbar with the Extensions menu open. Chrome's is marked 1 on the puzzle-piece button and 2 on the pin next to "Gallery Wall Layout Generator". Edge's is marked the same way, in Edge's style. Only the picked store's drawing SHALL show. Each drawing SHALL be `role="img"`, with an `aria-label` that names both clicks, and the text above it SHALL name the same two clicks.

#### Scenario: The pin picture's name

- **WHEN** the pin section is read by assistive technology
- **THEN** the drawing's accessible name mentions the puzzle piece marked 1 and the pin marked 2 next to Gallery Wall Layout Generator

#### Scenario: Edge's pin picture's name

- **WHEN** the pin section of `?pinned=0&store=edge` is read by assistive technology
- **THEN** exactly one pin picture is exposed, and its accessible name mentions the puzzle piece marked 1 and the pin marked 2 next to Gallery Wall Layout Generator

### Requirement: The page says what the extension can see

"What the extension can see" SHALL list three rows: the right-click menu (adds "Try on my wall" on images), the tab you click in (read once on that click: the image and any sizes in its text), and framesizes.app (can ask whether the extension is installed and pinned; nothing else is shared). It SHALL say the wall photo stays on the computer.

#### Scenario: The framesizes.app row

- **WHEN** `/extensions/gallery-wall-layout-generator` is requested
- **THEN** the "What the extension can see" list holds a row for framesizes.app that says the site can ask whether the extension is installed and pinned and that nothing else is shared

### Requirement: The extension page is accessible and fits a phone

The page SHALL show no detectable accessibility violations in either mode, and at 320 px wide it SHALL have no horizontal scroll.

#### Scenario: No detectable violations in either mode

- **WHEN** axe runs on the page at `?pinned=0` and at `?pinned=1`
- **THEN** it reports no violations

#### Scenario: The page at 320 px

- **WHEN** the page is opened 320 px wide in either mode
- **THEN** the document is no wider than the viewport

### Requirement: The status client asks the extension and never throws

Asking the extension SHALL send `{ "type": "status" }` to its store id and resolve to installed with its `pinned` value when it replies. It SHALL resolve to not installed when the id is empty, when Chrome gives the page no `chrome.runtime.sendMessage`, when the call throws or sets `chrome.runtime.lastError`, or when no reply comes within 1 second. It SHALL send nothing when the id is empty.

#### Scenario: The extension replies

- **GIVEN** a store id and an extension that replies `{ "installed": true, "pinned": false, "version": "0.1.0" }`
- **WHEN** the site asks
- **THEN** the answer is installed and not pinned

#### Scenario: No extension

- **WHEN** the site asks on a browser with no `chrome.runtime`, or the call sets `lastError`, or the id is empty
- **THEN** the answer is not installed, and with an empty id no message is sent

### Requirement: The extension section sits under the widget on G1 and F2

While the extension page is live, G1 and F2 SHALL show one extension section directly after the widget. It holds the extension icon, the store's label, the `h2` "Plan on any shop's page", one sentence naming the store's side panel, an add link to the store's page that opens in a new tab, and a picture of the side panel. Chrome's label is "Chrome extension" and its link "Add to Chrome", "Opens the Chrome Web Store". Edge's, once Edge's store id is set, are "Edge extension", "Add to Edge", "Opens Microsoft Edge Add-ons". While the page is not live, neither page SHALL hold the section.

#### Scenario: The section while the extension page is live

- **GIVEN** the extension page is live with a store id
- **WHEN** G1 is rendered
- **THEN** the section follows the widget, holds the `h2` "Plan on any shop's page", and its "Add to Chrome" link has the store page as `href`, `target="_blank"` and `rel="noopener"`

#### Scenario: No section before go-live

- **WHEN** `/gallery-wall-planner` or `/frame-sizes-on-wall` is requested while the extension page is not live
- **THEN** the response HTML holds no `h2` "Plan on any shop's page"

#### Scenario: The section in Edge

- **GIVEN** a live extension page and a fixture Edge store id
- **WHEN** G1 is opened in a browser whose user agent holds `Edg/131`
- **THEN** the section reads "Edge extension" and "…in Edge's side panel…", and its visible "Add to Edge" link points to Edge's store page in a new tab

### Requirement: The section tells phone visitors to use a computer

On a device whose main pointer is coarse and cannot hover, the section SHALL show a computer line in place of the add link. Chrome's is "Chrome on phones doesn't run extensions. Open this page on a computer to add it." Edge's is "This extension runs in Edge on a computer. Open this page on a computer to add it." The lines are in the server HTML, and the device and the store decide which one shows, so the section keeps one height per layout.

#### Scenario: The section on a phone

- **GIVEN** the extension page is live
- **WHEN** G1 is opened on a touch phone 390 px wide
- **THEN** the section shows the computer line and no visible "Add to Chrome" link

### Requirement: The section knows when the extension is installed

The section SHALL ask each set store id. When any of them answers that it is installed, the section SHALL replace its call to action with the store's "You have it" line, and its height SHALL not change. Chrome's line is "You have it. Click its button in Chrome's toolbar to open the side panel." Edge's is "You have it. Click its button in Edge's toolbar to open the side panel."

#### Scenario: A visitor who has the extension

- **GIVEN** the extension page is live and the extension replies installed
- **WHEN** G1 has loaded
- **THEN** the section reads "You have it. Click its button in Chrome's toolbar to open the side panel.", shows no "Add to Chrome" link, and its height equals its height before the reply

### Requirement: The extension page goes live only with a store id

The extension page SHALL be live only when the extension's Chrome Web Store id is set, and the store id SHALL be 32 letters from a to p. The published listing's id is `khapjkonaofjfljdakdcmodaclkmffgn`. Its store page SHALL be addressed as `https://chromewebstore.google.com/detail/<id>`, which the store redirects to the listing.

#### Scenario: The go-live gate

- **WHEN** the unit suite reads the site map and the store id
- **THEN** the extension page is live exactly when the store id is set, and a set store id matches `^[a-p]{32}$`

#### Scenario: The published listing

- **WHEN** the unit suite reads the store id and the site map
- **THEN** the store id is `khapjkonaofjfljdakdcmodaclkmffgn`, the extension page is live, and the store page is `https://chromewebstore.google.com/detail/khapjkonaofjfljdakdcmodaclkmffgn`

#### Scenario: The extension page once live

- **GIVEN** the extension page is live
- **WHEN** `/extensions/gallery-wall-layout-generator` is requested
- **THEN** it answers 200 with no robots meta tag holding `noindex`, the footer links to it, and one "Get it from the Chrome Web Store" link points to the store page
- **AND** `/gallery-wall-planner` links to it from Related tools and holds the `h2` "Plan on any shop's page"

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

A translated version SHALL show the same breadcrumb trail as the English page, with every crumb name in its language. The links in its breadcrumb `nav` SHALL point to the English pages. Its `BreadcrumbList` SHALL carry the same translated names, and its last `item` SHALL be the version's own canonical URL.

#### Scenario: The Spanish breadcrumbs

- **WHEN** `/es/extensions/gallery-wall-layout-generator` is requested
- **THEN** its breadcrumb `nav` has three crumbs in Spanish, the first linking to `/` and the second to `/gallery-wall-planner`, and the last is marked `aria-current="page"`

#### Scenario: The last crumb in the Spanish BreadcrumbList

- **WHEN** `/es/extensions/gallery-wall-layout-generator` is requested
- **THEN** its `BreadcrumbList`'s third `item` is `https://framesizes.app/es/extensions/gallery-wall-layout-generator`, the page's canonical URL

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

### Requirement: The Arabic pin picture shows right-to-left Chrome

On a right-to-left version, the pin picture SHALL show each store's browser as it looks in that language. The puzzle-piece button and the Extensions menu sit at the top left, as the text above it says. Text, the extension's mark, the puzzle-piece icon and the numbers 1 and 2 SHALL NOT be mirrored. Left-to-right versions SHALL keep today's drawing. A page SHALL show one pin picture, and assistive technology SHALL see only that one.

#### Scenario: The Arabic pin picture

- **WHEN** `/ar/extensions/gallery-wall-layout-generator?pinned=0` is opened
- **THEN** the page shows one pin picture, its puzzle-piece button marked 1 and its Extensions menu sit in the drawing's left half, its menu title is Chrome's Arabic "الإضافات", it still names "Gallery Wall Layout Generator", and its accessible name is in Arabic

#### Scenario: A left-to-right version keeps its drawing

- **WHEN** `/de/extensions/gallery-wall-layout-generator?pinned=0` is opened
- **THEN** the page shows one pin picture, and its puzzle-piece button marked 1 sits in the drawing's right half

#### Scenario: The Arabic Edge pin picture

- **WHEN** `/ar/extensions/gallery-wall-layout-generator?pinned=0&store=edge` is opened
- **THEN** the page shows one pin picture, Edge's, with its puzzle-piece button marked 1 and its Extensions menu in the drawing's left half, its labels in English and its accessible name in Arabic

### Requirement: The page picks the visitor's store

The extension page SHALL pick one store before the first paint. `?store=edge` picks Edge. Otherwise the browser decides: Edge when its brands hold "Microsoft Edge" or its user agent holds `Edg/`, `EdgA/` or `EdgiOS/`. Anything else is Chrome. G1 and F2 SHALL pick by the browser alone. With no script, every page shows Chrome. Opera, and any `store` value other than `edge`, are Chrome until Opera is built.

#### Scenario: The Edge install tab

- **WHEN** `/extensions/gallery-wall-layout-generator?pinned=0&store=edge` is opened in Chrome
- **THEN** the page shows the Edge lines and the Edge pin picture, and no Chrome line

#### Scenario: A Chrome Web Store install opened in Edge

- **GIVEN** a browser whose user agent holds `Edg/131`
- **WHEN** `/extensions/gallery-wall-layout-generator?pinned=0` is opened
- **THEN** the page shows the Edge lines

#### Scenario: Chrome and every other browser

- **WHEN** the page is opened in Chrome with no `store`, or with `?store=opera`, or in a browser whose user agent holds `OPR/`
- **THEN** the page shows the Chrome lines

#### Scenario: Edge on a phone

- **GIVEN** the user agent holds `EdgA/131`, Edge's id is set, and the extension page is live
- **WHEN** `/gallery-wall-planner` is opened
- **THEN** the extension section shows Edge's phone line

#### Scenario: No script

- **WHEN** the page is opened with JavaScript off and `?store=edge`
- **THEN** the page shows the Chrome lines

### Requirement: Each store's lines sit in the HTML once

Every line, link and drawing that differs by store SHALL sit in the server HTML once for each built store, inside the same parent element, with only the picked store's shown. A line shared by every store SHALL sit once. The page's outline SHALL not change by store: the same headings, sections and order. Picking a store SHALL not move any block after the first paint. Where another requirement quotes a line, it quotes the Chrome line.

#### Scenario: One heading, two texts

- **WHEN** `/extensions/gallery-wall-layout-generator` is requested
- **THEN** the pin section holds one `h2` "Pin it to your toolbar", shared by both stores, and one text paragraph under it, which holds Chrome's text and Edge's text; only the Chrome text is visible in Chrome

#### Scenario: No shift on pick

- **WHEN** `/extensions/gallery-wall-layout-generator?store=edge` loads
- **THEN** the page's cumulative layout shift is 0

### Requirement: Edge visitors get Edge's how-to

For Edge, the page SHALL name Edge where it names Chrome. Edge, like Chrome, pins an extension from the Extensions menu (checked in Edge 158 on 2026-11-28). The answer names Edge's toolbar, the pin text names the puzzle piece (1) at the top right of Edge and then the pin (2), and the FAQ "Why isn't the button in my toolbar?" answer names Edge. The pin `h2`, the links between modes and "Already pinned?" are shared with Chrome. Every language SHALL say the same in its own words.

#### Scenario: Edge's FAQ answer

- **WHEN** `/extensions/gallery-wall-layout-generator?store=edge` is opened
- **THEN** the visible answer to "Why isn't the button in my toolbar?" is "Edge puts new extensions behind the puzzle-piece button. Pin it once and it stays in the toolbar."

#### Scenario: Edge's pin mode

- **WHEN** `/extensions/gallery-wall-layout-generator?pinned=0&store=edge` is opened
- **THEN** the heading "Pin it to your toolbar" is visible, the text above the pin picture reads "Edge keeps new extensions behind the puzzle-piece button. Click the puzzle piece (1) at the top right of Edge, then the pin (2) next to Gallery Wall Layout Generator. Its button then stays in the toolbar.", and the section ends with "Already pinned? See how to use it", linking to `#usage`

#### Scenario: Edge's usage mode

- **WHEN** `/extensions/gallery-wall-layout-generator?pinned=1&store=edge` is opened
- **THEN** the answer paragraph reads "Click the extension's button in Edge's toolbar to open the side panel and plan a gallery wall. On any shop, right-click a print and pick “Try on my wall” to hang it on your wall at true size.", and the link under it reads "Show how to pin it" and points to `#pin`

#### Scenario: Edge's pin mode in German

- **WHEN** `/de/extensions/gallery-wall-layout-generator?pinned=0&store=edge` is opened
- **THEN** the pin section's visible heading and text are German, and the visible text names Edge

### Requirement: Edge's drawings keep Edge's English labels

The Edge pin picture and the Edge right-click figure SHALL draw Edge's own labels in English in every language, each marked `lang="en"`, because Edge publishes no translations of its menus. The extension's name and "Try on my wall" stay English as everywhere. Each drawing's accessible name SHALL be in the page's language.

#### Scenario: The Edge pin picture's labels

- **WHEN** `/extensions/gallery-wall-layout-generator?pinned=0&store=edge` is opened
- **THEN** the visible pin picture is marked 1 on the puzzle-piece button and 2 on the pin next to "Gallery Wall Layout Generator", and its menu reads "Extensions", "Manage Extensions" and "Get extensions for Microsoft Edge"

#### Scenario: The Edge right-click figure's labels

- **WHEN** `/extensions/gallery-wall-layout-generator?pinned=1&store=edge` is opened
- **THEN** the visible right-click figure reads "Copy image", "Try on my wall" and "Inspect"

#### Scenario: The Edge pin picture in French

- **WHEN** `/fr/extensions/gallery-wall-layout-generator?pinned=0&store=edge` is opened
- **THEN** the visible pin picture's menu title is "Extensions" and holds "Manage Extensions", both marked `lang="en"`, and its accessible name is in French and names the puzzle piece marked 1 and the pin marked 2

### Requirement: The right-click figure follows the page's direction

On a right-to-left version, every store's right-click figure SHALL be mirrored. The print sits on the right, and the menu opens to its left with each row's icon on the right. Text and the extension's mark SHALL not be mirrored. Left-to-right versions SHALL keep today's figure.

#### Scenario: The Arabic right-click figure

- **WHEN** `/ar/extensions/gallery-wall-layout-generator?pinned=1` is opened
- **THEN** the visible right-click figure's print sits in the figure's right half, the menu's right edge is left of the print's right edge, and "Try on my wall" reads left to right

#### Scenario: A left-to-right version keeps its figure

- **WHEN** `/de/extensions/gallery-wall-layout-generator?pinned=1` is opened
- **THEN** the visible right-click figure's print sits in its left half

### Requirement: The browsers question names Chrome and Edge

For every store, the FAQ "Which browsers does it run on?" SHALL answer "Chrome 116 or newer, or Microsoft Edge 116 or newer, on a computer. It opens in the browser's side panel." Every language SHALL say the same in its own words.

#### Scenario: The browsers answer in Chrome

- **WHEN** `/extensions/gallery-wall-layout-generator` is opened in Chrome
- **THEN** the answer to "Which browsers does it run on?" names Chrome 116 and Microsoft Edge 116 and "the browser's side panel"

### Requirement: The extension page's head and name name no browser

The extension page's title, meta description, breadcrumb name and card question SHALL hold none of the whole words "Chrome", "Edge" or "Opera" (case-sensitive), in English and in every translation. The English title SHALL be "Gallery Wall Layout Generator Extension". The description SHALL be "How to use the Gallery Wall Layout Generator browser extension: plan a wall in the side panel, or right-click a shop print to hang it at true size." The page's short name SHALL be "Browser extension".

#### Scenario: The English head

- **WHEN** `/extensions/gallery-wall-layout-generator` is requested
- **THEN** its title is "Gallery Wall Layout Generator Extension | Frame Sizes", its last breadcrumb reads "Browser extension", and its `h1` is still "How to Use the Gallery Wall Layout Generator"

#### Scenario: Every language's head

- **WHEN** the unit suite reads the site map entry and all 28 dictionaries
- **THEN** no title, description, last crumb name or card question holds "Chrome", "Edge" or "Opera" as a whole word, naming the language that does

### Requirement: Edge appears only with its store id

Edge's store id SHALL be empty or 32 letters from a to p. While it is empty, no page SHALL link to Microsoft Edge Add-ons. The extension page SHALL still show Edge's how-to to Edge visitors, but with no store link. G1 and F2 SHALL show the Chrome section in Edge, and no page SHALL ask an Edge id. Once it is set, Edge's store page SHALL be addressed as `https://microsoftedge.microsoft.com/addons/detail/<id>`.

#### Scenario: The Edge gate

- **WHEN** the unit suite reads Edge's store id
- **THEN** it is empty or matches `^[a-p]{32}$`

#### Scenario: Edge before its id

- **GIVEN** Edge's store id is empty
- **WHEN** `/extensions/gallery-wall-layout-generator?store=edge` is opened
- **THEN** the page shows the Edge lines, holds no `a` element whose `href` starts with `https://microsoftedge.microsoft.com`, and shows no store link

#### Scenario: Edge with its id

- **GIVEN** a fixture Edge store id and a live extension page
- **WHEN** the page's store link and the section are rendered for Edge
- **THEN** the link reads "Get it from Microsoft Edge Add-ons" and the section's button reads "Add to Edge", both pointing to `https://microsoftedge.microsoft.com/addons/detail/<the fixture id>`

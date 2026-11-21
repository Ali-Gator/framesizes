# extension-site Specification

## Purpose

What framesizes.app shows about the Chrome extension "Gallery Wall Layout Generator": the page the extension opens after install, with its pin and usage modes, and the extension section on G1 and F2, both able to ask the installed extension whether it is there and pinned.

## Public Interface

```typescript
// apps/web/src/lib/extension.ts
const EXTENSION_ID: string; // the Chrome Web Store id; "" until go-live
function storeUrl(id: string): string; // https://chromewebstore.google.com/detail/<id>
const STORE_URL: string; // storeUrl(EXTENSION_ID)
type ExtensionStatus = { installed: false } | { installed: true; pinned: boolean };
function askExtension(id: string, timeout = 1000): Promise<ExtensionStatus>; // never rejects

// apps/web/src/components/extension/
function modeOf(hash: string, search: string): { mode: "pin" | "usage"; from: "hash" | "query" };
const MODE_SCRIPT: string; // the same rule as an inline pre-paint script
function ModeSwitch(props: { extensionId: string }): null; // client island
function StoreLink(props: { pages?; extensionId?; label? }): JSX.Element | null;
function ExtensionSection(props: { pages?; extensionId? }): JSX.Element | null;
function ExtensionStatus(props: { extensionId: string }): JSX.Element; // client island, the CTA cell
function PinPicture(props: { label?: string; chrome?: ChromeLabels }): JSX.Element; // English defaults
function PrintFigure / LayoutFigure / NailFigure(props: { label: string }): JSX.Element;
function MenuFigure(props: { label: string; menu?: { copyImage: string; inspect: string } }): JSX.Element;
function ExtensionHowTo(props: { copy: ExtensionCopy; locale: string }): JSX.Element; // the page body, every language

// apps/web/src/components/extension/copy/
const en: { seo; crumbs; answer; store; noButton; showPin; pin; usage; steps; wall; perm; faq; chrome };
type ExtensionCopy = typeof en; // every other copy/<code>.ts `satisfies ExtensionCopy`
type ChromeLabels = ExtensionCopy["chrome"]; // Chrome's own labels, from Chromium's xtb files
const COPY: Readonly<Record<string, ExtensionCopy>>; // copy/index.ts, by URL code, all 28
```

Routes: `apps/web/src/app/extensions/gallery-wall-layout-generator/` (`page.tsx`, `opengraph-image.tsx`, `extension.css`) and `apps/web/src/app/[locale]/extensions/gallery-wall-layout-generator/` (`page.tsx` with `generateStaticParams` over the 27 translated codes and `dynamicParams = false`, `opengraph-image.tsx` re-exporting the English image). Section and figure styles live in `apps/web/src/app/widgets.css` (`ext-sec-*`, `ext-fig-*`, `pp-*`).

## Behavior

The extension (`apps/extension` `background.ts`) opens the page with `?pinned=0|1` on install and answers `{ type: "status" }` from `https://framesizes.app/*`. The site asks through `askExtension`, which resolves to not installed on a missing `chrome.runtime.sendMessage`, a throw, `lastError`, a malformed reply or a 1 s timeout.

The mode lives on `<html data-ext-mode>`. `MODE_SCRIPT` sets it before paint; `ModeSwitch` sets it again on mount (a client-side visit runs no inline script) and on every `hashchange`, moving focus to the shown section's `h2` only when the hash names a mode. CSS hides `.ext-pin` unless the mode is pin (or, with no JS, it is the `:target`) and hides `.ext-usage` in pin mode. In pin mode from the query, `ModeSwitch` asks every 2 s with a chained `setTimeout` while the tab is visible, restarts after a hash change that lands back on the query mode, and on a pinned reply switches to usage, carrying focus from the pin section to the usage heading.

Go-live is one edit: `EXTENSION_ID` set and X1 `live: true` with its `lastModified`. A unit test fails when only one is done. `StoreLink` and `ExtensionSection` render nothing unless X1 is live and the id is set. The not-live tests use fixtures or skip once X1 is live.

The section's call to action and the "You have it" line share one grid cell; `ExtensionStatus` asks once after hydration and hides the other line with `visibility: hidden`, so the cell keeps its height. `@media (hover: none) and (pointer: coarse)` shows the phone line instead of "Add to Chrome".

Every language renders through `ExtensionHowTo`. Its wrapper carries the language's `lang`, `dir` and, for scripts Schibsted lacks, the system font stack. `rich()` marks each "Gallery Wall Layout Generator" and "Try on my wall" in a sentence with `lang="en"` and fills `{door}` with the door height in both units. Breadcrumb names come from the dictionary by position (Home, hub, page); English reads them from the site map. Only English shows Related tools. Each drawing places its own text (`direction: ltr` in `extension.css`): the pin picture follows the page's direction (`PinPicture dir`; Arabic gets the right-to-left drawing), the right-click figure stays left to right (BL-80); the pin picture's grey lines shrink below 11.5 px when a translation is wider than about 46 Latin characters.

## Edge Cases

- No JS with `#pin`: the pin steps show through `:target`, with the usage sections still below them.
- A click on a switch link before hydration: the mode follows the hash on mount, without moving focus.
- After the self-switch the URL keeps `?pinned=0`, so a reload opens pin mode until the first reply (BL-68).
- A hidden tab: the poll timer keeps running but sends nothing (BL-69).
- Figures draw the current flat sample room; BL-51 swaps it with F2 and G1.
- Translated versions share the English social image and its English alt (BL-77).

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

While the extension page is live, the answer paragraph SHALL be followed, in both modes, by one plain text link "Get it from the Chrome Web Store" to the extension's store page, opening in a new tab with `rel="noopener"`. It SHALL be a text link, not a button. While the page is not live, the page SHALL hold no link to the Chrome Web Store.

#### Scenario: The store link once live

- **GIVEN** the extension page is live with a store id
- **WHEN** the page is rendered
- **THEN** one `a` element reading "Get it from the Chrome Web Store" follows the answer paragraph, its `href` is the store page, with `target="_blank"` and `rel="noopener"`, and it carries no button styling

#### Scenario: No store link before go-live

- **WHEN** `/extensions/gallery-wall-layout-generator` is requested while the extension page is not live
- **THEN** the response HTML holds no `a` element whose `href` starts with `https://chromewebstore.google.com`

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

While the page is in pin mode because of `?pinned=0`, has no hash, and knows the extension's store id, it SHALL ask the extension for its status every 2 seconds while the tab is visible. When the reply says pinned, it SHALL switch to usage mode and stop asking. A mode picked by a hash SHALL never switch by itself.

#### Scenario: The visitor pins the button

- **GIVEN** the page is open at `?pinned=0` and the extension replies not pinned
- **WHEN** the extension's next reply says pinned
- **THEN** within 2 seconds the page is in usage mode and it sends no further status message

#### Scenario: The visitor asked for the pin steps

- **GIVEN** the page is open at `#pin` and the extension replies pinned
- **WHEN** 4 seconds pass
- **THEN** the page is still in pin mode

### Requirement: The pin picture shows the two clicks

The pin section SHALL hold one drawing of Chrome's toolbar with the Extensions menu open, marked 1 on the puzzle-piece button and 2 on the pin next to "Gallery Wall Layout Generator". The drawing SHALL be `role="img"` with an `aria-label` that names both clicks, and the text above it SHALL name the same two clicks.

#### Scenario: The pin picture's name

- **WHEN** the pin section is read by assistive technology
- **THEN** the drawing's accessible name mentions the puzzle piece marked 1 and the pin marked 2 next to Gallery Wall Layout Generator

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

While the extension page is live, G1 and F2 SHALL show one extension section directly after the widget: the extension icon, the label "Chrome extension", the `h2` "Plan on any shop's page", one sentence, an "Add to Chrome" link to the extension's Chrome Web Store page that opens in a new tab, and a picture of the side panel. While the page is not live, neither page SHALL hold the section.

#### Scenario: The section while the extension page is live

- **GIVEN** the extension page is live with a store id
- **WHEN** G1 is rendered
- **THEN** the section follows the widget, holds the `h2` "Plan on any shop's page", and its "Add to Chrome" link has the store page as `href`, `target="_blank"` and `rel="noopener"`

#### Scenario: No section before go-live

- **WHEN** `/gallery-wall-planner` or `/frame-sizes-on-wall` is requested while the extension page is not live
- **THEN** the response HTML holds no `h2` "Plan on any shop's page"

### Requirement: The section tells phone visitors to use a computer

On a device whose main pointer is coarse and cannot hover, the section SHALL show "Chrome on phones doesn't run extensions. Open this page on a computer to add it." in place of the "Add to Chrome" link. Both are in the server HTML; the device decides which shows, so the section keeps one height per layout.

#### Scenario: The section on a phone

- **GIVEN** the extension page is live
- **WHEN** G1 is opened on a touch phone 390 px wide
- **THEN** the section shows the computer line and no visible "Add to Chrome" link

### Requirement: The section knows when the extension is installed

When the extension answers that it is installed, the section SHALL replace its sentence's call to action and the "Add to Chrome" link with "You have it. Click its button in Chrome's toolbar to open the side panel." The section's height SHALL not change.

#### Scenario: A visitor who has the extension

- **GIVEN** the extension page is live and the extension replies installed
- **WHEN** G1 has loaded
- **THEN** the section reads "You have it. Click its button in Chrome's toolbar to open the side panel.", shows no "Add to Chrome" link, and its height equals its height before the reply

### Requirement: The extension page goes live only with a store id

The extension page SHALL be live only when the extension's Chrome Web Store id is set, and the store id SHALL be 32 letters from a to p.

#### Scenario: The go-live gate

- **WHEN** the unit suite reads the site map and the store id
- **THEN** the extension page is live exactly when the store id is set, and a set store id matches `^[a-p]{32}$`

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

### Requirement: The Arabic pin picture shows right-to-left Chrome

On a right-to-left version, the pin picture SHALL show Chrome as it looks in that language, with the puzzle-piece button and the Extensions menu at the top left, as the text above it says. Text, the extension's mark, the puzzle-piece icon and the numbers 1 and 2 SHALL NOT be mirrored. Left-to-right versions SHALL keep today's drawing. A page SHALL hold one pin picture.

#### Scenario: The Arabic pin picture

- **WHEN** `/ar/extensions/gallery-wall-layout-generator?pinned=0` is opened
- **THEN** the page holds one pin picture, its puzzle-piece button marked 1 and its Extensions menu sit in the drawing's left half, its menu title is Chrome's Arabic "الإضافات", it still names "Gallery Wall Layout Generator", and its accessible name is in Arabic

#### Scenario: A left-to-right version keeps its drawing

- **WHEN** `/de/extensions/gallery-wall-layout-generator?pinned=0` is opened
- **THEN** the page holds one pin picture, and its puzzle-piece button marked 1 sits in the drawing's right half

# Spec Delta

## ADDED Requirements

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
- **THEN** the pin section holds one `h2`, which holds "Pin it to your toolbar" for Chrome and "Show it in your toolbar" for Edge, and only the Chrome text is visible in Chrome

#### Scenario: No shift on pick

- **WHEN** `/extensions/gallery-wall-layout-generator?store=edge` loads
- **THEN** the page's cumulative layout shift is 0

### Requirement: Edge visitors get Edge's how-to

For Edge, the page SHALL tell the visitor to show the button in the toolbar, not to pin it. The answer names Edge's toolbar, the pin `h2` is "Show it in your toolbar", the pin text names the puzzle piece (1) and then the eye (2), "Show in toolbar", and the links between modes and the FAQ "Why isn't the button in my toolbar?" answer say the same. Every language SHALL say the same in its own words.

#### Scenario: Edge's FAQ answer

- **WHEN** `/extensions/gallery-wall-layout-generator?store=edge` is opened
- **THEN** the visible answer to "Why isn't the button in my toolbar?" is "Edge puts new extensions behind the puzzle-piece button. Click its eye once and it stays in the toolbar."

#### Scenario: Edge's pin mode

- **WHEN** `/extensions/gallery-wall-layout-generator?pinned=0&store=edge` is opened
- **THEN** the heading "Show it in your toolbar" is visible, the text above the pin picture names "the puzzle piece (1)", "the eye (2)" and "Show in toolbar", and the section ends with "Already in the toolbar? See how to use it", linking to `#usage`

#### Scenario: Edge's usage mode

- **WHEN** `/extensions/gallery-wall-layout-generator?pinned=1&store=edge` is opened
- **THEN** the answer paragraph reads "Click the extension's button in Edge's toolbar to open the side panel and plan a gallery wall. On any shop, right-click a print and pick “Try on my wall” to hang it on your wall at true size.", and the link under it reads "Show how to add it to the toolbar" and points to `#pin`

#### Scenario: Edge's pin mode in German

- **WHEN** `/de/extensions/gallery-wall-layout-generator?pinned=0&store=edge` is opened
- **THEN** the pin section's visible heading and text are German, and "Show in toolbar" in the text is English, marked `lang="en"`

### Requirement: Edge's drawings keep Edge's English labels

The Edge pin picture and the Edge right-click figure SHALL draw Edge's own labels in English in every language, each marked `lang="en"`, because Edge publishes no translations of its menus. The extension's name and "Try on my wall" stay English as everywhere. Each drawing's accessible name SHALL be in the page's language.

#### Scenario: The Edge pin picture's labels

- **WHEN** `/extensions/gallery-wall-layout-generator?pinned=0&store=edge` is opened
- **THEN** the visible pin picture is marked 1 on the puzzle-piece button and 2 on the eye next to "Gallery Wall Layout Generator", and its menu reads "Extensions", "Show in toolbar", "Open Microsoft Edge Add-ons" and "Manage extensions"

#### Scenario: The Edge right-click figure's labels

- **WHEN** `/extensions/gallery-wall-layout-generator?pinned=1&store=edge` is opened
- **THEN** the visible right-click figure reads "Copy image", "Try on my wall" and "Inspect"

#### Scenario: The Edge pin picture in French

- **WHEN** `/fr/extensions/gallery-wall-layout-generator?pinned=0&store=edge` is opened
- **THEN** the visible pin picture's menu title is "Extensions" and holds "Show in toolbar", both marked `lang="en"`, and its accessible name is in French and names the puzzle piece marked 1 and the eye marked 2

### Requirement: The right-click figure follows the page's direction

On a right-to-left version, every store's right-click figure SHALL be mirrored. The print sits on the right, and the menu opens to its left with each row's icon on the right. Text and the extension's mark SHALL not be mirrored. Left-to-right versions SHALL keep today's figure.

#### Scenario: The Arabic right-click figure

- **WHEN** `/ar/extensions/gallery-wall-layout-generator?pinned=1` is opened
- **THEN** the visible right-click figure's print and menu both sit in the figure's right half, the menu left of the print's right edge, and "Try on my wall" reads left to right

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

## MODIFIED Requirements

### Requirement: The page links to the store in plain text

While the extension page is live, one plain text link to the picked store's page SHALL follow the answer paragraph, in both modes. It opens in a new tab with `rel="noopener"`. Chrome's reads "Get it from the Chrome Web Store". Edge's reads "Get it from Microsoft Edge Add-ons", and only once Edge's store id is set. It SHALL be a text link, not a button. While the page is not live, the page SHALL hold no link to any store.

#### Scenario: The store link once live

- **GIVEN** the extension page is live with a store id
- **WHEN** the page is rendered
- **THEN** one `a` element reading "Get it from the Chrome Web Store" follows the answer paragraph, its `href` is the store page, with `target="_blank"` and `rel="noopener"`, and it carries no button styling

#### Scenario: No store link before go-live

- **WHEN** `/extensions/gallery-wall-layout-generator` is requested while the extension page is not live
- **THEN** the response HTML holds no `a` element whose `href` starts with `https://chromewebstore.google.com` or `https://microsoftedge.microsoft.com`

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

The pin section SHALL hold one drawing per built store of that browser's toolbar with the Extensions menu open. Chrome's is marked 1 on the puzzle-piece button and 2 on the pin next to "Gallery Wall Layout Generator". Edge's is marked 1 on the puzzle-piece button and 2 on the eye, "Show in toolbar". Only the picked store's drawing SHALL show. Each drawing SHALL be `role="img"`, with an `aria-label` that names both clicks, and the text above it SHALL name the same two clicks.

#### Scenario: The pin picture's name

- **WHEN** the pin section is read by assistive technology
- **THEN** the drawing's accessible name mentions the puzzle piece marked 1 and the pin marked 2 next to Gallery Wall Layout Generator

#### Scenario: Edge's pin picture's name

- **WHEN** the pin section of `?pinned=0&store=edge` is read by assistive technology
- **THEN** exactly one pin picture is exposed, and its accessible name mentions the puzzle piece marked 1 and the eye next to Gallery Wall Layout Generator, Show in toolbar, marked 2

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

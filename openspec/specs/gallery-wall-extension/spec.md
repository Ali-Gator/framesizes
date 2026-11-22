# gallery-wall-extension Specification

## Purpose

The Chrome extension "Gallery Wall Layout Generator": G1's gallery wall planner in Chrome's side panel and in a full-size tab, on a wall saved on the visitor's device, usable with no trip to the site.

## Public Interface

```typescript
// apps/extension/public/manifest.json — MV3, minimum_chrome_version "116",
//   permissions ["sidePanel", "contextMenus", "activeTab", "scripting"],
//   side_panel.default_path "sidepanel.html", background.js (module), externally_connectable framesizes.app
// apps/extension/src/background.ts — pure handlers over chrome-shaped Api / MenuApi, wired at the bottom
const HOW_TO = "https://framesizes.app/extensions/gallery-wall-layout-generator";
function howToUrl(uiLanguage: string | undefined, pinned: boolean): string; // the how-to in Chrome's language, English when the site lacks it
function onInstalled(api, details: { reason: string }): Promise<void>; // panel behaviour; install: howToUrl(api.i18n?.getUILanguage(), pinned)
// Api.i18n?: { getUILanguage(): string } — optional; a Chrome that reports none reads as English
function onStartup(api): Promise<void>;
function onMessageExternal(api, message, sender: { origin? }, reply): boolean; // { type: "status" } only
// reply: { installed: true; pinned: boolean; version: string }
const MENU_ID = "try-on-my-wall";
function registerMenu(menu: MenuApi): Promise<void>; // removeAll, then one item on images and links on http(s) pages
function onMenuClick(menu: MenuApi, io: TryIo, info, tab): Promise<void>;
interface TryIo {
  fetchImage(url): Promise<Blob | null>;
  crop(shot, rect): Promise<Blob | null>;
  saveTry(record: TryRecord): Promise<void>;
  clearTry(): Promise<void>;
  ping(): void;
}

// apps/extension/src/read-page.ts — readPage(srcUrl, linkUrl) injected by scripting.executeScript (self-contained)
interface PageRead {
  text: string; // body innerText, ≤ 100,000 chars, never stored
  title: string; // first h1, else og:title, else document.title, ≤ 80 chars
  url: string | null; // the picture: the clicked img, or the largest img / background-image in the largest link to linkUrl
  rect: { x; y; w; h; dpr } | null; // that picture's box
  shape: { w; h } | null; // its natural size
}
function fetchImage(url): Promise<Blob | null>; // http, https, data: only; image content-type only
function cropShot(shot: string, rect): Promise<Blob | null>; // OffscreenCanvas PNG

// apps/extension/src/find-sizes.ts — pure
interface FoundSize {
  w: number;
  h: number;
  unit: "in" | "cm" | "mm";
  label: string;
} // inches, as written
function findSizes(text: string): FoundSize[]; // ≤ 8, deduped either way round, 3–120 in sides

// apps/extension/src/store.ts — IndexedDB "gallery-wall", store "wall", one connection kept per page
// keys: "current" (StoredRecord), "photo" (Blob), "art:<frame id>" (Blob), "try" (TryRecord)
interface TryRecord {
  v: 1;
  id;
  at: number;
  image: Blob | null;
  shape: { w; h } | null;
  title;
  host;
  sizes: FoundSize[];
}
const CHANNEL = "gallery-wall"; // { from: <page id> } after a write; { from: "worker", try: true } after a try

// apps/extension/src/saved-wall.ts
interface StoredRecord {
  v: 2;
  planner: SavedPlanner;
  photo: PhotoMeta | null;
  at?: number;
}
type PhotoMeta = Omit<SavedPhoto, "blob" | "stamp"> & { stamp: string }; // stamp changes with the bytes
type SavedPlanner = Pick<
  PlannerState,
  | "view"
  | "template"
  | "sizes"
  | "gap"
  | "moved"
  | "group"
  | "added" // a print's picture URL stripped
  | "removed"
  | "hangers"
  | "lastType"
  | "nextId"
> & { wall: "sample" | "photo" };
function toSaved(state): SavedPlanner;
function savedPhoto(state, kept, blob, fromStore?): SavedPhoto | null;
function fromSaved(record: unknown, makeUrl, blobs?: StoredBlobs, artUrl?): PlannerState | null; // v1 or v2
function toStored(
  next: WallRecord,
  before: WallRecord | null,
): { current; photo; putPhoto: Blob | null };
function artChanges(keys, planner, pending): { put: [id, Blob][]; remove: string[] };
function readWall(): Promise<{ record: unknown; blobs: StoredBlobs }>;
function writeWall(current: StoredRecord, putPhoto: Blob | null, pending): Promise<string[]>;
function writeArt(frameId: string, picture: Blob): Promise<void>;
const JOURNAL = "gallery-wall-closing"; // localStorage: a closing page's last StoredRecord

// apps/extension/src/use-wall.ts — useWall(): { planner, ready, hasPhoto, wall: "sample" | "photo" | "new",
//   dispatch, chooseWall, addPrint(print, picture) }
// apps/extension/src/try/ — useTry(), tryReducer, hang.ts (turnSize, turnLabel, hangPrint, distancesOf,
//   withDistance, dragPrint, tipOf), SizeStep, HangView
// apps/extension/src/panel.tsx, tab.tsx — the two pages; toolbar.tsx — WallSelect, OpenFull, SavedLine
// apps/extension/src/shims/ — next/dynamic (React.lazy in Suspense) and next/link (a plain <a>)
```

## Behavior

- The extension renders G1's own `GalleryWall` and reducer, imported from `apps/web/src` through the `@/` alias; Vite builds the two pages and the worker into `apps/extension/dist`. The worker bundle imports nothing from G1.
- A page reads the wall on start and renders the planner once it has. A visitor's change is written 300 ms after the last one, or at once when the page is hidden; a write that changes nothing saved is skipped.
- A write puts `current`, the photo's bytes only when their `stamp` changes, each new print's picture, and deletes `art:` keys whose print is gone, in one transaction. A v1 record is read as it is and split into keys on the next write.
- After a write the page posts on the channel; the other page reads the wall again and keeps its selection, unless it has a change of its own waiting or a photo flow open. A write started before the other page's write landed is dropped. The last write wins.
- Chrome drops an IndexedDB write started while a page closes, so the hide flush also journals `current` in `localStorage` with its time. The next page to read the wall, or an open page on the `storage` event, writes it when the stored `current` is older, then drops it. A write with new photo bytes is not journaled. A print's picture is written as soon as the print is added.
- "Sample room" dispatches `toSample`; "My wall photo" dispatches `restorePhoto` on a fresh object URL of the stored photo, or `upload` with none saved. In the upload and scale steps the select reads a disabled "New wall photo".
- "Try on my wall": the worker injects `readPage`, captures the tab (main frame only) and opens the panel in the click's own tick, and clears the last try. It then keeps the picture (fetch, else the screenshot cropped to the image's box, else none), the title, the host, the image's natural size and `findSizes` of the text as the `try` record, unless a newer click's try is stored, and pings the channel.
- The panel shows the try while one is stored and the planner is not in a photo flow step. The try's own state is in memory: a reload returns to the size step. The print hangs by `hangPrint` on `placeOf(planner)`'s wall, turned to the picture's shape, with the visitor's move on top; "Add to my layout" dispatches G1's `addPrint` and deletes the try, "Back to my layout" deletes it. The tab ignores the try.
- Units reuse the site's `localStorage["unit"]`; each page sets `<html data-unit>` before its first render. A typed print size keeps the unit it was typed in.

## Edge Cases

- A record of another version, or none, starts the planner fresh. Storage that throws starts it fresh and keeps nothing.
- A page closed in the upload or a scale step comes back on the wall it came from: the scaled photo after "Change photo", else the sample room.
- A stored photo with no bytes, size or scale lays the template out again in the sample room. A print whose picture is missing hangs as a plain frame.
- If Chrome's settings call fails, the worker treats the button as not pinned and still opens the how-to tab and answers the site.
- A page Chrome will not let the extension read (Web Store, PDF viewer) gives a try with no sizes, the tab's title and no crop. An image in a subframe is never cropped. A `blob:` image falls back to the crop.
- With no shape known (no image found on the page and no picture), the size hangs as written.

## Requirements

### Requirement: The extension asks only for what it uses

The extension SHALL be a Manifest V3 extension for Chrome 116 or later. Its permissions SHALL be exactly `sidePanel`, `contextMenus`, `activeTab` and `scripting`. It SHALL declare no host permissions, no optional permissions and no content scripts. Only pages on `https://framesizes.app` SHALL be able to message it.

#### Scenario: The built manifest

- **WHEN** the built `manifest.json` is read
- **THEN** `manifest_version` is 3, `minimum_chrome_version` is "116", `permissions` is `["sidePanel", "contextMenus", "activeTab", "scripting"]`, there is no `host_permissions`, `optional_permissions` or `content_scripts` key, and `externally_connectable.matches` is `["https://framesizes.app/*"]`

### Requirement: The extension carries its name and icons

The extension SHALL be named "Gallery Wall Layout Generator" in English and by its translated name in every language it ships, in the manifest and on the toolbar button's tooltip. It SHALL ship the canvas's icon as PNG files at 16, 32, 48 and 128 px, for the toolbar and the store.

#### Scenario: Name and icons in the build

- **WHEN** the build is read
- **THEN** the manifest's `name` and `action.default_title` are both `__MSG_appName__`, the English `appName` message is "Gallery Wall Layout Generator", and `icons` and `action.default_icon` name PNG files at 16, 32, 48 and 128 px that exist with those pixel sizes

#### Scenario: Every language names the extension

- **WHEN** the build's `_locales` folders are read
- **THEN** every one defines a non-empty `appName` message

### Requirement: The toolbar button opens the side panel

Clicking the extension's toolbar button SHALL open Chrome's side panel on the extension's panel page. It SHALL open no popup.

#### Scenario: Install and browser start set the panel behaviour

- **WHEN** the extension is installed, updated, or Chrome starts with it installed
- **THEN** the side panel is set to open when the toolbar button is clicked, and the manifest declares no `action.default_popup`

### Requirement: The side panel holds the gallery wall planner

The panel SHALL hold G1's gallery wall layout generator, with its views, templates, gap, sizes, moves, warnings, nail marks and photo flow, laid out as at 360 px. It SHALL show no card edges and no widget title.

#### Scenario: The panel's first state

- **GIVEN** no saved wall
- **WHEN** the panel page opens at 360 × 800
- **THEN** it shows "One big, two on each side" in the sample room with the summary reading a group of 46 × 27 in, its top edge 69 in up, and no heading "Gallery wall layout generator"
- **AND** the page does not scroll sideways

### Requirement: The panel toolbar holds the wall, the units and "Open full size"

Above the planner the panel SHALL show a native select labelled "Wall" with "Sample room" and "My wall photo", an in | cm control labelled "Units", and an icon button named "Open full size". While a wall photo is saved, a line SHALL read "Your wall is saved on this device".

#### Scenario: The toolbar on a first open

- **GIVEN** no saved wall
- **WHEN** the panel page opens
- **THEN** the "Wall" select reads "Sample room", "Units" reads "in", the "Open full size" button is present, each control is at least 44 px tall, and the saved line is not shown

### Requirement: The wall is saved on this device

The extension SHALL keep the planner's wall on the device: the template, the gap, the sizes, hand moves, added and removed frames, prints added from shops with their pictures, the group's move, the hangers, the view, and the wall photo with its scale, marks and floor line. Reopening the panel or the tab, or restarting Chrome, SHALL bring back the same wall. Open dialogs and pickers SHALL NOT be kept.

#### Scenario: A changed layout survives a reload

- **GIVEN** the panel with the gap set to 2 in and frame A moved 4 in left
- **WHEN** the panel page is reloaded
- **THEN** the gap reads 2 in and frame A sits 4 in left of where the template puts it

#### Scenario: A wall photo survives a reload

- **GIVEN** the panel on a wall photo scaled from a marked sofa
- **WHEN** the panel page is reloaded
- **THEN** the photo is shown with the same scale and layout, the "Wall" select reads "My wall photo", and the saved line reads "Your wall is saved on this device"

#### Scenario: An added print survives a reload

- **GIVEN** the default layout with a 24 × 36 in unframed print added as frame F
- **WHEN** the panel page is reloaded
- **THEN** frame F is there at 24 × 36 in, drawn with the print's picture

### Requirement: The extension works offline and sends nothing

The panel and the full-size tab SHALL load their code, styles and fonts from the extension itself and SHALL make no network request. The only request the extension SHALL make is reading the right-clicked image once, on the "Try on my wall" click. The wall photo, the layout, the print pictures and the page text SHALL never leave the device, and the page text SHALL NOT be stored.

#### Scenario: No request leaves the extension

- **GIVEN** the panel page opened, a wall photo picked and scaled, and the full-size tab opened
- **WHEN** every request the two pages made is listed
- **THEN** each one is a `chrome-extension:` or `blob:` URL

#### Scenario: A try keeps only what the panel shows

- **GIVEN** a right-click on a print on a page whose text holds "24 x 36 in"
- **WHEN** the try is stored on the device
- **THEN** it holds the print's picture, the title, the host name and the sizes found, and no page text

### Requirement: "Open full size" opens the planner in its own tab

"Open full size" SHALL open the extension's tab page with G1's desktop widget on the same saved wall. The tab's top bar SHALL hold the icon, the `h1` "Gallery Wall Layout Generator", "Saved on this device", the "Wall" select and "Units".

#### Scenario: Opening the full-size tab

- **GIVEN** the panel with "Grid of nine" picked
- **WHEN** "Open full size" is pressed
- **THEN** a new tab opens on the extension's tab page, its `h1` reads "Gallery Wall Layout Generator", and its widget shows nine frames, A to I, in the desktop layout

### Requirement: The panel and the tab show one wall

A change made in the panel SHALL show in an open full-size tab without a reload, and a change in the tab SHALL show in the panel.

#### Scenario: A gap set in the tab reaches the panel

- **GIVEN** the panel and the full-size tab open on the same wall
- **WHEN** the gap is set to 1 in in the tab
- **THEN** the panel's gap reads 1 in and its frames are laid out again

### Requirement: The wall select switches walls without losing the photo

"Sample room" SHALL lay the template out in the sample room and keep any saved wall photo with its scale. "My wall photo" SHALL return to the saved photo and lay the template out on it, or open the upload step when no photo is saved.

#### Scenario: To the sample room and back

- **GIVEN** a wall photo scaled from a marked sofa
- **WHEN** the "Wall" select is set to "Sample room" and then to "My wall photo"
- **THEN** the photo is back with the same scale, and "One big, two on each side" sits 8 in above the sofa

#### Scenario: No photo saved yet

- **GIVEN** no saved wall photo
- **WHEN** the "Wall" select is set to "My wall photo"
- **THEN** the planner shows its upload step

### Requirement: Units are shared and kept

"Units" SHALL switch every number in the planner between inches and centimetres, by G1's rounding. The choice SHALL apply to the panel and the tab together and SHALL be kept between visits.

#### Scenario: Centimetres in both pages

- **GIVEN** the panel and the full-size tab open on the default wall
- **WHEN** "cm" is picked in the panel
- **THEN** both summaries read 117 × 69 cm, and after the panel page is reloaded "Units" still reads "cm"

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

### Requirement: The site can ask whether the extension is installed and pinned

A message `{ "type": "status" }` from a page on `https://framesizes.app` SHALL get the reply `{ "installed": true, "pinned": <boolean>, "version": "<manifest version>" }`, with `pinned` read when the message arrives. Any other message SHALL get no reply.

#### Scenario: The how-to page asks after the visitor pins the button

- **GIVEN** the toolbar button was pinned after install
- **WHEN** the site sends `{ "type": "status" }`
- **THEN** the reply is `{ "installed": true, "pinned": true, "version": "<manifest version>" }`

#### Scenario: An unknown message

- **WHEN** the site sends `{ "type": "hello" }`
- **THEN** the extension sends no reply

### Requirement: The panel and the tab are accessible

The panel and the tab SHALL keep G1's accessibility: named drawings, radio groups, a native "Hanger for" select, a live region, and controls at least 44 px. The toolbar's "Wall" control SHALL be a native select and "Open full size" an icon button with that accessible name.

#### Scenario: No detectable violations

- **WHEN** axe runs on the panel's first state, the panel's Nail marks view, and the full-size tab
- **THEN** it reports no violations

### Requirement: The 128 px icon has a clear border

The 128 px icon that the manifest names SHALL be the canvas's icon drawn 96 px wide and 96 px high, centred, with a fully transparent 16 px border on every side, as Chrome's install dialog and extensions page expect. The 16, 32 and 48 px icons keep the art edge to edge.

#### Scenario: The 128 px icon in the build

- **WHEN** the manifest's 128 px icon is read
- **THEN** every pixel within 16 px of an edge is fully transparent, and the art reaches the 96 px square inside that border

### Requirement: Right-clicking an image offers "Try on my wall"

The extension SHALL add one context-menu item, "Try on my wall", shown for images and for links on `http` and `https` pages only, so a print drawn as a CSS background inside a link is offered too. Choosing it SHALL open the side panel in that window on the try for that image. Chosen on a link, the try SHALL take the picture inside the link: an image, or a CSS background image of the link or of an element inside it. A link with no picture SHALL still open the try, with no picture.

#### Scenario: The menu item on an image

- **WHEN** the extension is installed or updated
- **THEN** one menu item titled "Try on my wall" exists, for the `image` and `link` contexts, on `http://*/*` and `https://*/*` pages

#### Scenario: Choosing it opens the panel on the print

- **GIVEN** a shop page with a print image and the panel closed
- **WHEN** "Try on my wall" is chosen on the image
- **THEN** the side panel opens in that window and shows "What size is it?" with the print's picture, "From <the page's host>" and the page's title

#### Scenario: A print drawn as a link's background

- **GIVEN** a shop page whose print is a CSS background image on an element inside a link, and the panel closed
- **WHEN** "Try on my wall" is chosen on the link
- **THEN** the side panel opens on the try with that background image as the print's picture, "From <the page's host>" and the page's title

#### Scenario: A link with no picture

- **GIVEN** a page with a text link that holds no image and no background image
- **WHEN** "Try on my wall" is chosen on the link
- **THEN** the side panel opens on the try with no picture, and the sizes come from the page text

### Requirement: The page is read only on the click

The extension SHALL read a page only when "Try on my wall" is chosen on it, and only that page's frame. It SHALL take the image, the product title, the host name and the print sizes in the page text, and nothing else. When the page cannot be read, the try SHALL still open with no size found.

#### Scenario: A page that cannot be read

- **GIVEN** an image on a page where Chrome blocks extensions from reading it
- **WHEN** "Try on my wall" is chosen
- **THEN** the panel opens on the try with no size found and the width and height fields open

### Requirement: The sizes come from the page text

The try SHALL list each print size in the page text once, in page order, up to eight. It SHALL read W × H in inches, centimetres or millimetres, written with "x", "×" or "by", with or without unit marks; a size with no unit SHALL count as inches. Sides under 3 in or over 120 in, and sizes in pixels, SHALL be left out.

#### Scenario: The forms the canvas names

- **WHEN** the page text holds "24 x 36 in", "60 × 90 cm" and "24x36"
- **THEN** the chips read "24 × 36 in" and "60 × 90 cm", and "24x36" is the same size as the first

#### Scenario: Numbers that are not print sizes

- **WHEN** the page text holds "1920x1080", "1920 x 1080 px" and "2 x 2 in"
- **THEN** no size is found

### Requirement: The size step asks for the size the visitor would buy

"What size is it?" SHALL show the sizes found as chips, then "Other size", a Frame choice of Unframed or a 1 in frame (Unframed first), and "Hang it on my wall". One size found SHALL be picked. With several, none SHALL be picked and the button SHALL wait, saying why. With none, or with "Other size", width and height fields SHALL open.

#### Scenario: Several sizes found

- **GIVEN** a page listing 12 × 16 in, 18 × 24 in and 24 × 36 in
- **WHEN** the try opens
- **THEN** no chip is pressed, "Hang it on my wall" is disabled, and the line beside it reads "Pick a size first: this page lists three."
- **AND** pressing "24 × 36 in" enables the button

#### Scenario: One size found

- **GIVEN** a page listing only 24 × 36 in
- **WHEN** the try opens
- **THEN** "24 × 36 in" is pressed and "Hang it on my wall" is enabled

#### Scenario: No size found

- **GIVEN** a page with no size in its text
- **WHEN** the try opens
- **THEN** the width and height fields are open and "Hang it on my wall" waits until both hold a length

### Requirement: The print hangs at true size on the saved wall

"Hang it on my wall" SHALL show the print alone, at the picked size, on the saved wall photo, or in the sample room with no photo saved. The layout's frames SHALL be hidden. A landscape picture SHALL hang its longer side across. The print SHALL hang 8 in above a sofa or bed when one is marked, else centred at 57 in, centred between the known wall edges.

#### Scenario: Unframed in the sample room

- **GIVEN** no saved wall photo and a 24 × 36 in portrait print picked, Unframed
- **WHEN** "Hang it on my wall" is pressed
- **THEN** the print hangs 18 in from the ceiling, 8 in above the sofa, and 60 in from each side of the wall, and no layout frame is drawn

#### Scenario: With a 1 in frame

- **GIVEN** the same print hanging
- **WHEN** Frame is set to "1 in frame"
- **THEN** the size line reads "24 × 36 in · 26 × 38 framed" and the print hangs 16 in from the ceiling, 8 in above the sofa, and 59 in from each side

#### Scenario: A landscape picture

- **GIVEN** a picture wider than it is tall and "24 × 36 in" picked
- **WHEN** it hangs
- **THEN** it is 36 in wide and 24 in tall

### Requirement: The print's distances and tip follow F2

The print SHALL show and set its four distances as a frame does on F2, in the visitor's unit, and SHALL drag inside the wall. When a sofa or bed is on the wall, a tip SHALL name the art width that fills it: two-thirds of the furniture's width.

#### Scenario: The tip over the sample sofa

- **GIVEN** the print hanging in the sample room
- **WHEN** the try view is shown
- **THEN** a line reads "Art about two-thirds of the sofa's width fills this wall: 56 in over the 84 in sofa."

#### Scenario: Setting a distance

- **GIVEN** the 24 × 36 in print hanging unframed in the sample room
- **WHEN** "To the sofa" is set to 10 in
- **THEN** the print's bottom edge sits 10 in above the sofa and "To the ceiling" reads 16 in

### Requirement: The try ends by adding the print or going back

The try view SHALL offer "Add to my layout", which adds the print to the planner as the next lettered frame with its picture, size and frame, placed beside the layout; "Back to my layout", which leaves the print out; and "Change size", which returns to the size step. Both of the first two SHALL return to the planner as it was, with the print added or not.

#### Scenario: Adding the print

- **GIVEN** the default layout of five frames and a 24 × 36 in print hanging unframed
- **WHEN** "Add to my layout" is pressed
- **THEN** the planner shows six frames, frame F is the print at 24 × 36 in with its picture and is selected, and frames A to E are where they were

#### Scenario: Going back

- **GIVEN** the print hanging
- **WHEN** "Back to my layout" is pressed
- **THEN** the planner shows the layout as it was and the print is gone

#### Scenario: A full layout

- **GIVEN** a layout of 12 frames
- **WHEN** the try view is shown
- **THEN** "Add to my layout" is disabled and reads beside it "That's 12 frames, the most the planner holds."

### Requirement: The try uses the wall select and a new wall photo

The panel's "Wall" select and in | cm SHALL apply to the hanging print. With no wall photo saved, the try view SHALL offer "Use my wall photo", which runs G1's upload and scale steps and then shows the print on the new photo. Leaving the upload with no photo picked SHALL return to the print in the sample room.

#### Scenario: Trying on a new wall photo

- **GIVEN** no saved wall photo and the print hanging in the sample room
- **WHEN** "Use my wall photo" is pressed and a photo is picked and scaled from a marked sofa
- **THEN** the print hangs 8 in above the marked sofa on the photo, and the "Wall" select reads "My wall photo"

### Requirement: A try waits for the visitor

A try SHALL stay until the visitor adds the print or goes back. Closing and reopening the panel SHALL return to its size step. A new "Try on my wall" SHALL replace it. The full-size tab SHALL show the planner, not the try.

#### Scenario: The panel closed during a try

- **GIVEN** a try at its size step with "24 × 36 in" pressed
- **WHEN** the panel page is reloaded
- **THEN** it shows "What size is it?" for the same print

### Requirement: The wall select names the upload step

While the planner is in the upload or a scale step, the "Wall" select SHALL read a disabled "New wall photo", so that picking "My wall photo" or "Sample room" acts from there.

#### Scenario: Back to the saved photo from the upload step

- **GIVEN** a saved wall photo, and the planner in the upload step after "Change photo"
- **WHEN** the "Wall" select is set to "My wall photo"
- **THEN** the saved photo is back with its scale

### Requirement: The try's new parts are accessible

The size chips SHALL be buttons with `aria-pressed` in a group labelled "Print size". A waiting "Hang it on my wall" or "Add to my layout" SHALL be described by the line that says why, SHALL be exposed as disabled to assistive technology, SHALL stay in the Tab order, and SHALL do nothing when pressed. The print's drawing SHALL be `role="img"` named by the print, its size and where it hangs. Every new control SHALL be at least 44 px tall.

#### Scenario: No detectable violations in the try

- **WHEN** axe runs on the size step with several sizes found and on the try view in the sample room
- **THEN** it reports no violations

#### Scenario: A waiting button keeps focus and says why

- **GIVEN** the size step with several sizes found and none picked
- **WHEN** the keyboard moves focus to "Hang it on my wall" and Enter is pressed
- **THEN** the button has focus, is reported disabled, is described by "Pick a size first: this page lists three.", and the size step is still shown

#### Scenario: A full layout's button does nothing

- **GIVEN** the try view on a layout that already holds 12 frames
- **WHEN** focus moves to "Add to my layout" and Enter is pressed
- **THEN** the button has focus, is reported disabled, is described by "That's 12 frames, the most the planner holds.", the try is still shown, and the layout still holds 12 frames

### Requirement: Two pages never share a print

Each print added from a try SHALL get a frame id that no other page of the extension can give, even one that has not yet reloaded the saved wall. A print's picture SHALL be stored and shown under its own id only, so one page's print never shows or overwrites another page's picture. Walls saved with earlier ids SHALL keep loading with their pictures.

#### Scenario: A stale page adds a print

- **GIVEN** two extension pages on one wall, both before any print, and the second page in the upload step
- **WHEN** the first page adds print P1, the second page goes back to the sample room without saving and adds print P2 from a try
- **THEN** P1 and P2 have different frame ids; the second page's write wins, so the store holds P2's picture under `art:<P2's id>` only, and after both pages reload, each shows P2 with P2's picture, never P1's

#### Scenario: An older saved print

- **GIVEN** a wall saved with a print under the id `a1` and its picture under `art:a1`
- **WHEN** the panel opens
- **THEN** the print shows with its picture

### Requirement: Two pages never share an added frame

Each frame added with "Add a frame" in the panel or the tab SHALL get a frame id that no other page of the extension can give, even one that has not yet reloaded the saved wall, so a kept selection or a hanger never lands on another page's frame. Walls saved with earlier ids SHALL keep loading.

#### Scenario: A stale page adds a frame

- **GIVEN** two extension pages on one wall with the same frames, and the second page in the upload step
- **WHEN** the first page adds a frame with "Add a frame", and the second page goes back to the sample room without saving and adds a frame with "Add a frame"
- **THEN** the two added frames have different frame ids

#### Scenario: An older saved frame

- **GIVEN** a wall saved with a frame added under the id `a1`
- **WHEN** the panel opens
- **THEN** the frame shows, and selecting it selects that frame

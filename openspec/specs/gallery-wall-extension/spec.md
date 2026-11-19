# gallery-wall-extension Specification

## Purpose

The Chrome extension "Gallery Wall Layout Generator": G1's gallery wall planner in Chrome's side panel and in a full-size tab, on a wall saved on the visitor's device, usable with no trip to the site.

## Public Interface

```typescript
// apps/extension/public/manifest.json — MV3, minimum_chrome_version "116", permissions ["sidePanel"],
//   side_panel.default_path "sidepanel.html", background.js (module), externally_connectable framesizes.app
// apps/extension/src/background.ts — pure handlers over a chrome-shaped Api, wired at the bottom
const HOW_TO = "https://framesizes.app/extensions/gallery-wall-layout-generator";
function onInstalled(api, details: { reason: string }): Promise<void>; // panel behaviour; install: HOW_TO?pinned=0|1
function onStartup(api): Promise<void>;
function onMessageExternal(api, message, sender: { origin? }, reply): boolean; // { type: "status" } only
// reply: { installed: true; pinned: boolean; version: string }

// apps/extension/src/saved-wall.ts — one IndexedDB record "current" in database "gallery-wall"
interface SavedRecord {
  v: 1;
  planner: SavedPlanner;
  photo: SavedPhoto | null;
}
type SavedPlanner = Pick<
  PlannerState,
  | "view"
  | "template"
  | "sizes"
  | "gap"
  | "moved"
  | "group"
  | "added"
  | "removed"
  | "hangers"
  | "lastType"
  | "nextId"
> & { wall: "sample" | "photo" };
interface SavedPhoto {
  blob: Blob;
  width;
  height;
  known;
  marks;
  floor;
  scale;
}
function toSaved(state): SavedPlanner;
function savedPhoto(state, kept, blob, fromStore?): SavedPhoto | null;
function fromSaved(record: unknown, makeUrl: (blob: Blob) => string): PlannerState | null;
const CHANNEL = "gallery-wall"; // BroadcastChannel: { from: <page id> } after each write

// apps/extension/src/use-wall.ts — useWall(): { planner, ready, hasPhoto, wall, dispatch, chooseWall }
// apps/extension/src/panel.tsx, tab.tsx — the two pages; toolbar.tsx — WallSelect, OpenFull, SavedLine
// apps/extension/src/shims/ — next/dynamic (React.lazy in Suspense) and next/link (a plain <a>)
```

## Behavior

- The extension renders G1's own `GalleryWall` and reducer, imported from `apps/web/src` through the `@/` alias; Vite builds the two pages and the worker into `apps/extension/dist`.
- A page reads the record on start and renders the planner once it has. A visitor's change is written 300 ms after the last one, or at once when the page is hidden; a write that changes nothing saved is skipped.
- After a write the page posts on the channel; the other page reads the record again and keeps its selection, unless it has a change of its own waiting or a photo flow open. A write started before the other page's write landed is dropped. The last write wins.
- The record keeps the last scaled photo. A write with no scaled photo in the planner keeps it; a newly scaled photo replaces it once its bytes are read.
- "Sample room" dispatches `toSample`; "My wall photo" dispatches `restorePhoto` on a fresh object URL of the stored photo, or `upload` with none saved.
- Units reuse the site's `localStorage["unit"]`; each page sets `<html data-unit>` before its first render.

## Edge Cases

- A record of another version, or none, starts the planner fresh. Storage that throws starts it fresh and keeps nothing.
- A page closed in the upload or a scale step comes back on the wall it came from: the scaled photo after "Change photo", else the sample room.
- A stored photo with no bytes, size or scale lays the template out again in the sample room.
- If Chrome's settings call fails, the worker treats the button as not pinned and still opens the how-to tab and answers the site.

## Requirements

### Requirement: The extension asks only for what it uses

The extension SHALL be a Manifest V3 extension for Chrome 116 or later. Its permissions SHALL be exactly `sidePanel`. It SHALL declare no host permissions, no optional permissions and no content scripts. Only pages on `https://framesizes.app` SHALL be able to message it.

#### Scenario: The built manifest

- **WHEN** the built `manifest.json` is read
- **THEN** `manifest_version` is 3, `minimum_chrome_version` is "116", `permissions` is `["sidePanel"]`, there is no `host_permissions`, `optional_permissions` or `content_scripts` key, and `externally_connectable.matches` is `["https://framesizes.app/*"]`

### Requirement: The extension carries its name and icons

The extension SHALL be named "Gallery Wall Layout Generator", in the manifest and on the toolbar button's tooltip. It SHALL ship the canvas's icon as PNG files at 16, 32, 48 and 128 px, for the toolbar and the store.

#### Scenario: Name and icons in the build

- **WHEN** the build is read
- **THEN** the manifest's `name` and `action.default_title` are "Gallery Wall Layout Generator", and `icons` and `action.default_icon` name PNG files at 16, 32, 48 and 128 px that exist with those pixel sizes

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

The extension SHALL keep the planner's wall on the device: the template, the gap, the sizes, hand moves, added and removed frames, the group's move, the hangers, the view, and the wall photo with its scale, marks and floor line. Reopening the panel or the tab, or restarting Chrome, SHALL bring back the same wall. Open dialogs and pickers SHALL NOT be kept.

#### Scenario: A changed layout survives a reload

- **GIVEN** the panel with the gap set to 2 in and frame A moved 4 in left
- **WHEN** the panel page is reloaded
- **THEN** the gap reads 2 in and frame A sits 4 in left of where the template puts it

#### Scenario: A wall photo survives a reload

- **GIVEN** the panel on a wall photo scaled from a marked sofa
- **WHEN** the panel page is reloaded
- **THEN** the photo is shown with the same scale and layout, the "Wall" select reads "My wall photo", and the saved line reads "Your wall is saved on this device"

### Requirement: The extension works offline and sends nothing

The panel and the full-size tab SHALL load their code, styles and fonts from the extension itself and SHALL make no network request. The wall photo and the layout SHALL never leave the device.

#### Scenario: No request leaves the extension

- **GIVEN** the panel page opened, a wall photo picked and scaled, and the full-size tab opened
- **WHEN** every request the two pages made is listed
- **THEN** each one is a `chrome-extension:` or `blob:` URL

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

On a first install, and only then, the extension SHALL open one tab on `https://framesizes.app/extensions/gallery-wall-layout-generator` with `?pinned=1` when its toolbar button is pinned and `?pinned=0` when it is not.

#### Scenario: A fresh install with the button not pinned

- **GIVEN** the toolbar button is not pinned
- **WHEN** the extension is installed
- **THEN** one tab opens on `https://framesizes.app/extensions/gallery-wall-layout-generator?pinned=0`

#### Scenario: An update opens nothing

- **WHEN** the extension is updated or Chrome is updated
- **THEN** no tab opens

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

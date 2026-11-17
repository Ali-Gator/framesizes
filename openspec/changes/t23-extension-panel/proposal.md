# Proposal

## Why

Tracker row T23 is the Chrome extension "Gallery Wall Layout Generator". It has to work on its own as a full gallery wall planner in Chrome's side panel, with no trip to the site, and on shop pages it adds a right-click "Try on my wall". The user approved the design canvas on 2026-11-17 (https://claude.ai/artifact/WUq26q5aNBxfiKUTYcaCwv, recorded in CLAUDE.md "Design source").

T23 ships as two changes, as T7 and T11 did:

1. **`t23-extension-panel` (this change)** builds the extension itself. It holds the side panel with G1's planner at 360, the full-size tab, the saved wall, units and icons, plus the two hooks the T24 page needs.
2. **`t23-try-on-my-wall` (next)** adds the shop flow. That is the context-menu item, the "What size is it?" step that reads sizes from the page text, and the print hanging alone on the saved wall with "Add to my layout" (boards b, c, d, and a as the whole picture).

The split keeps each review a reasonable size. It also lets the planner, which is most of the extension, settle before the shop flow builds on it.

## What Changes

- **A new workspace app, `apps/extension`**: a Manifest V3 extension built with Vite into `apps/extension/dist`, plus a zip for the Chrome Web Store.
  - **Manifest:**
    - Name "Gallery Wall Layout Generator".
    - The short description from the store listing doc.
    - Chrome 116 or later.
    - Icons at 16, 32, 48 and 128 px (board k).
    - One side panel page.
    - A background service worker.
    - `externally_connectable` for `https://framesizes.app/*`.
  - **Permissions:** only `sidePanel` in this change. `contextMenus`, `activeTab` and `scripting` come with the shop flow. There is no host permission and no content script.
- **Side panel (boards e, f, g, PanelHead):**
  - The toolbar button opens Chrome's side panel. It holds G1's gallery wall layout generator at 360, with no card edges and no widget title, since Chrome's own bar names the extension.
  - Above the widget sits the panel toolbar from the canvas:
    - **Wall:** a native select with Sample room and My wall photo.
    - **Units:** in and cm.
    - **"Open full size":** an icon button.
  - "Your wall is saved on this device" shows while a wall photo is saved.
- **Full-size tab (board h):** "Open full size" opens the extension's own page with G1's desktop widget on the same saved wall. Its top bar holds the icon, the name, "Saved on this device", the wall select and in | cm. A change made in the panel or in the tab shows in the other one.
- **The saved wall:** the layout, the gap, sizes, moves, hangers, the wall photo and its scale are kept on this device, in the extension's own storage. Closing and reopening the panel, or restarting Chrome, brings the same wall back. Nothing is sent anywhere, and sync stays open (canvas note "dSaved").
- **The wall select keeps the photo:** switching to Sample room keeps the saved photo and its scale. Switching back to My wall photo returns to it. With no photo saved, My wall photo opens the upload step.
- **Units:** in | cm in the panel and the tab, shared between them and kept between visits.
- **Hooks for T24:**
  - On first install, the extension opens `https://framesizes.app/extensions/gallery-wall-layout-generator?pinned=0|1`, from `chrome.action.getUserSettings()`. Updates open nothing.
  - The site can ask the extension, through `externally_connectable`, whether it is installed and whether it is pinned. The after-install page and the extension section use this answer.
- **G1 changes** that the panel needs and the site shares (no change to G1's existing behaviour):
  - `GalleryWall` takes optional props: a `panel` or `tab` variant, and a controlled state with its dispatch. Without them it renders exactly as today.
  - **BL-52**, folded in: with All frames selected, the selection block lists the layout's sizes, one row each with its frames and "Change". Change opens F2's picker for every frame of that size. This lands on G1 and in the panel together (canvas board e2).
  - **BL-53**, folded in: the template thumbs fit inside their buttons at 360.
  - **BL-54**, folded in: the nail table fits a 360 column and G1's desktop side column without scrolling sideways.
  - **BL-48**, folded in: backing out of the upload with no photo picked keeps the layout, moves and added frames.
- **Left out:**
  - The shop flow (the next change).
  - The extension page and the extension section on G1 and F2 (T24).
  - Sync to framesizes.app (open).
  - The richer v2 sample room (BL-51, a backlog change for F2, G1 and the extension together).
  - Dark theme (BL-2).
  - Analytics.
  - Publishing to the Web Store, which the user does with the zip this change builds.

## Capabilities

### New Capabilities

- `gallery-wall-extension`: the Chrome extension. It covers its manifest and permissions, the side panel, the full-size tab, the saved wall, the wall select, units, offline use, accessibility, and the install and status hooks the site reads. The next change adds the shop flow to this capability.

### Modified Capabilities

- `gallery-wall-planner`:
  - "A frame's size is changed in place" gains the All frames size list (BL-52).
  - New requirements: the widget fits a 360 px column (BL-53, BL-54), and backing out of the upload keeps the layout (BL-48).

## Impact

- **Code:**
  - New: `apps/extension/` holds `package.json`, `vite.config.ts`, `tsconfig.json`, `public/manifest.json`, `public/icons/`, `sidepanel.html`, `tab.html`, and `src/` (background, the panel and tab entries, the saved-wall store, the toolbar, and a `next/dynamic` shim).
  - Edits in `apps/web/src/components/gallery-wall/`: the additive props, BL-52, BL-48, and the BL-53 and BL-54 CSS in `apps/web/src/app/gallery-wall-planner/gallery.css`.
- **Dependencies:** `vite` is added to `apps/extension`, at the version vitest already installs. `@tailwindcss/postcss` and `tailwindcss` are added at the versions `apps/web` uses. Three packages are new:
  - `@types/chrome`;
  - `@fontsource/schibsted-grotesk` and `@fontsource/ibm-plex-mono`, because extension pages cannot use `next/font`.
- **CI:** `e2e.yml` builds the extension before Playwright. A new e2e spec loads the unpacked build in Chromium.
- **Existing tests:** none are edited. The G1 tests guard that the default `GalleryWall` is unchanged.
- **Specs:**
  - The new `gallery-wall-extension` spec gets its README row at archive: `apps/extension/src/**`.
  - Files outside `src/` (the HTML entries, `public/`, configs) match no row, and `public/` is spec-exempt anyway.
- **Sequencing:** the after-install URL returns 404 until T24 ships. So T24 has to be live before the listing goes public, and the Tracker already gates T24 on the listing. This change ends with a built zip; the user uploads it.
- **Tracker:**
  - T23 becomes `In progress` at archive. The log line names the next change.
  - The Tracker's T23 permissions line gets corrected. It lists `contextMenus` + `activeTab` + a framesizes.app host permission; the real set is `sidePanel`, then `contextMenus`, `activeTab` and `scripting` with the shop flow, and no host permission while sync is open.
- **Backlog:** BL-48, BL-52, BL-53 and BL-54 are deleted when this ships.

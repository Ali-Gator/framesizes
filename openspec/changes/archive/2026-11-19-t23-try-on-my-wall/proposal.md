# Proposal

## Why

Tracker row T23 is the Chrome extension "Gallery Wall Layout Generator". Its first change, `t23-extension-panel`, shipped the side panel, the full-size tab and the saved wall. This second change adds what makes the extension worth having on shop pages: right-click a print, "Try on my wall", and see it at true size on the wall you saved. The design is the approved canvas (https://claude.ai/artifact/WUq26q5aNBxfiKUTYcaCwv, 2026-11-17), boards a, b, c and d with notes dMenu, dSize, dArt, dTip and nA11y.

## What Changes

- **Context menu (board b):**
  - One item, "Try on my wall", on images only, on `http` and `https` pages.
  - Clicking it opens the side panel on that tab's window.
  - The click is the only time the extension reads the page. It reads that page once: the image, the page text for sizes, the product title and the shop's host name.
- **Permissions:** `contextMenus`, `activeTab` and `scripting` join `sidePanel`. There is still no host permission, no optional permission and no content script. **BREAKING** for the spec's permission list only. Nothing visitor-facing breaks.
- **"What size is it?" (board c):**
  - The panel shows the print's picture, "From <host>", and the title.
  - Every print size found in the page text shows as a chip ("24 × 36 in", "60 × 90 cm", "24x36"):
    - One size found: it is picked.
    - Several found: none is picked. "Hang it on my wall" waits and says why ("Pick a size first: this page lists three.").
    - None found: width and height fields open.
  - "Other size" opens the same fields.
  - "Frame" defaults to Unframed. "1 in frame" adds F2's 1 inch moulding.
  - The size turns to match the picture: a landscape picture hangs its longer side across.
- **The print on your wall (board d):**
  - The print hangs alone, at true size, on the saved wall, with the layout's frames hidden. If no wall photo is saved, it hangs in the sample room.
  - Placement: 8 in above a sofa or bed when one is marked. Otherwise its centre sits at 57 in, centred between the known wall edges.
  - It shows its four distances as on F2, editable, plus the Frame switch, "Change size" and a tip line when there is furniture ("Art about two-thirds of the sofa's width fills this wall: 56 in over the 84 in sofa.").
  - **Buttons:**
    - "Add to my layout" adds it to the planner as the next lettered frame, with its picture.
    - "Use my wall photo" (only while no photo is saved) runs G1's upload and scale steps, then returns to the print on the new photo.
    - "Back to my layout" leaves the print out.
  - The panel's "Wall" select and in | cm work on the print too.
- **The print in the layout (G1, additive):**
  - A print is a frame of its own size, framed or not, with its picture.
  - It is labelled by its size as found ("60 × 90 cm print").
  - It drags, gets distances, hangers and nail marks like any frame.
  - It offers no "Change size", since its size is the product's.
  - The site's G1 never adds one, so nothing changes on framesizes.app.
- **The saved wall** keeps added prints and their pictures on the device. A try in progress also survives the panel closing: it comes back at the size step.
- **Backlog folded in:**
  - **BL-56:** in the upload and scale steps, the "Wall" select reads a third, disabled "New wall photo". So "My wall photo" and "Sample room" both act from there.
  - **BL-58:** the wall photo and each print picture are kept under their own keys, written only when they change. They are no longer copied into every layout write.
  - **BL-59:** an e2e for the saved wall's write races.
- **Left out:**
  - The try view in the full-size tab. The tab keeps the planner, and a print added in the panel shows there.
  - Prints shown as CSS backgrounds or on `canvas` (not images to Chrome's menu).
  - Sizes from structured data or size selectors. The canvas reads page text only.
  - Sync, analytics and affiliate links.
  - BL-57 (stays deferred).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `gallery-wall-extension`:
  - **Modified requirements:** "The extension asks only for what it uses" (four permissions), "The extension works offline and sends nothing" (one image read on the click) and "The wall is saved on this device" (prints and their pictures).
  - **New requirements:** the menu item, reading the page on the click, the size step, the print on the wall, the three buttons, and the new parts' accessibility.
- `gallery-wall-planner`:
  - **New requirement:** a print in the layout, of its own size, framed or not, with its picture, labelled by its size and with no "Change size".

## Impact

- **Code:**
  - `apps/extension`:
    - `public/manifest.json` (permissions).
    - `src/background.ts`: the menu and the click.
    - New `src/read-page.ts`: the page reader injected on the click, and the image capture.
    - New `src/find-sizes.ts`: the pure size parser.
    - New `src/try/`: the size step and the print view.
    - `src/saved-wall.ts` and `src/use-wall.ts`: prints, separate blob keys, and the try record.
    - `src/panel.tsx` and `src/toolbar.tsx` (BL-56).
  - `apps/web/src/components/gallery-wall/`:
    - `state.ts`: the print on an added frame and an `addPrint` action.
    - The labels in `gallery-wall.tsx` and `nail-marks.tsx`.
  - `apps/web/src/components/frames-on-wall/stage.tsx`: an optional picture and moulding per drawn frame, with defaults unchanged.
- **Dependencies:** none new.
- **Existing tests:** one edit, approved by the user on 2026-11-18. `apps/extension/src/__tests__/manifest.test.ts` asserts the four permissions. Its scenario name stays the same. Every other existing test runs unedited.
- **Chrome Web Store:** the upload needs a justification for each new permission and the "Website content" data disclosure (page text read on the click, kept on the device). T24's plain-words permission list follows this change. The listing doc may want a line on "Try on my wall".
- **Copy:** the new panel text goes through the `humanizer:humanizer` skill before commit.
- **Tracker:**
  - T23 becomes `Done` at archive, because this completes it.
  - The log line names the shop flow.
- **Backlog:** BL-56, BL-58 and BL-59 are deleted when this ships.

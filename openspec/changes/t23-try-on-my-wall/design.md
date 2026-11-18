# Design

## Context

See `proposal.md` for the scope. This change builds on `t23-extension-panel` (archived 2026-11-18):

- **The worker** (`apps/extension/src/background.ts`) holds pure handlers over a `chrome`-shaped `Api`, wired at the bottom. `background.test.ts` builds a fake `Api` with exactly four members. A new required member would break that test's types, and editing it needs approval.
- **The saved wall** (`saved-wall.ts`, `use-wall.ts`) is one IndexedDB record `current` in database `gallery-wall`, store `wall`. The photo Blob sits inline in the record (BL-58). Pages tell each other about writes on `BroadcastChannel("gallery-wall")`.
- **G1's frames are catalog ids.**
  - `framesOf` sizes an added frame by `findFrame(size)`, which gives 0 × 0 for anything off the catalog.
  - `sizesOf`, `openPicker`, `chipSize`, `frameName` and the nail table all assume a catalog id.
  - Every frame gets the 1 in moulding, and `WallStage` insets a blank `wf-art` by `MOULDING`.
- **F2's pieces the try view needs:**
  - `WallStage` (stage.tsx);
  - `wallOf`, `namedDistances` and `sampleSlice` (state.ts);
  - `writeDistance`, `parseLength` and `stepDistance` (display.ts).
  - The engine exports `frameDistances`, `setDistance`, `snapFrame`, `centreGroup`, `ABOVE_SOFA` (8) and `CENTRE_LINE` (57).
- **MV3 rules:**
  - `sidePanel.open` must run inside the user gesture, so nothing is awaited before it.
  - `activeTab` grants the clicked tab's origin, and `captureVisibleTab`, until that tab navigates.
  - `scripting.executeScript` needs `scripting` plus that grant.
  - An extension `fetch` to another origin is a normal CORS request unless the extension holds host permission there. `activeTab` gives it only for the tab's own origin.

## Goals / Non-Goals

**Goals:**

- The shop flow reuses F2's stage and distances and G1's photo flow. There is no second wall drawing and no second photo flow.
- G1 on framesizes.app renders and behaves exactly as today. Every G1 change is additive, and the site never dispatches it.
- The page is read once, on the click, and only what the panel shows is kept.

**Non-Goals:**

- The try view in the full-size tab.
- Prints that are not `<img>` elements.
- Structured data (JSON-LD, size selects).
- Several tries at once.
- BL-57.

## Decisions

### 1. The click: open first, then read, then hand over through IndexedDB

- **On install and update**, `registerMenu(menuApi)` calls `contextMenus.removeAll()`, then `create`:
  - `id` `try-on-my-wall`, title "Try on my wall";
  - `contexts: ["image"]`;
  - `documentUrlPatterns: ["http://*/*", "https://*/*"]`.
- **Where the menu wiring lives:** `registerMenu` and `onMenuClick` take a separate `MenuApi` interface. The existing `Api` and `onInstalled` stay as they are, so `background.test.ts` runs unedited. The wiring at the bottom calls `registerMenu` beside `onInstalled`, and adds a top-level `contextMenus.onClicked` listener.
- **`onMenuClick(api, info, tab)`** does three things in the same tick, with no `await` before the last:
  1. `executeScript({ target: { tabId, frameIds: [info.frameId] }, func: readPage, args: [info.srcUrl] })`;
  2. `tabs.captureVisibleTab(tab.windowId, { format: "png" })`, only when `info.frameId === 0`;
  3. `sidePanel.open({ windowId: tab.windowId })`.
- **Why this order:** the capture starts before the panel narrows the page. The panel opens inside the gesture.
- **Then it awaits the results:**
  - It finds the sizes with `findSizes(text)`.
  - It takes the host from `new URL(info.pageUrl).hostname`.
  - It gets the image (decision 2).
  - It writes the try record (decision 4) and posts `{ from: "worker", try: true }` on the channel.
- **The page text is never written anywhere.** Only `sizes`, `title`, `host` and the image Blob are kept.
- **`readPage(srcUrl)`** is a self-contained function injected into the page. It returns:
  - `text`: `document.body.innerText`, cut at 100,000 characters;
  - `title`: the first `h1`'s text, else `og:title`, else `document.title`, trimmed and cut at 80 characters;
  - `rect`: the rect of the first `img` whose `currentSrc` or `src` equals `srcUrl`, with `devicePixelRatio`, or `null`.
- **If injection fails** (Web Store, PDF viewer, a blocked page), the try opens with no text, `title` from `tab.title` and no rect.
- **Alternatives:**
  - `chrome.storage.session` for the hand-over: rejected, because it needs the `storage` permission.
  - A message to the panel: rejected, because the panel may not have loaded yet. A record it reads on start and on the ping covers both cases.
  - A content script on every site: rejected (canvas note dMenu).

### 2. The image: fetch, else crop the screenshot, else none

- **Order:**
  1. `fetch(info.srcUrl)` from the worker, for `http`, `https` and `data:` URLs. It works for the tab's own origin (the `activeTab` grant) and for CDNs that send `Access-Control-Allow-Origin`. A non-image `content-type` counts as a failure.
  2. Otherwise, the screenshot from decision 1, cropped to `rect × devicePixelRatio` through `createImageBitmap` and `OffscreenCanvas.convertToBlob` (PNG). The worker has both.
  3. Otherwise `null`. The print draws as a plain tinted rectangle (`wf-art` as today), named by its title.
- **`blob:` source URLs** belong to the page, so the fetch fails and the crop is used.
- **Ceilings:**
  - The crop is screen resolution and only the visible part of the image. That is enough for a 360-wide drawing.
  - An image in a subframe skips the crop, since its rect is not in tab coordinates.
- **Alternatives:**
  - Hotlink the shop's URL in the panel: rejected. The pages would then make a network request (spec: works offline), and the print would be lost offline.
  - A host permission for `<all_urls>`: rejected. It is the scary install prompt the canvas avoids.

### 3. `findSizes(text)`: one pure parser

- **The pattern:** `number [unit-mark] (x | × | X | by) number [unit-mark] [unit]`.
  - Units: `in`, `inch`, `inches`, `"`, `″`, `cm`, `mm`.
  - Decimals use a point or a comma.
  - A size followed by `px` or `pixels` is skipped.
- **Units:** a unit after either number applies to both, and no unit means inches. Lengths are converted to exact inches (÷ 2.54, ÷ 25.4).
- **Kept:** each side from 3 to 120 in, deduplicated by the unordered pair of inches rounded to 0.01. The first eight are kept in page order.
- **Each chip** keeps `{ w, h, unit, label }`. The label is "24 × 36 in" or "60 × 90 cm", with numbers as written.
- **Orientation** is set when the visitor hangs it, not here (decision 5).

### 4. Storage: blobs under their own keys (BL-58), and one try record

The same database and store, with no version bump: there are new keys, not a new store.

- **`current`:** `{ v: 2, planner, photo: PhotoMeta | null }`.
  - `PhotoMeta` is `SavedPhoto` without `blob`, plus `stamp`, an id that changes with the bytes.
  - `planner.added[].print` holds `{ w, h, label, framed }`. Its picture is not inside it.
- **`photo`:** the photo Blob. It is written only when `stamp` changes.
- **`art:<frame id>`:** each added print's picture. It is written once, on "Add to my layout". When a write finds an `art:` key whose frame is gone (removed, a template switch, a reset), it deletes that key.
- **`try`:** `{ v: 1, id, image: Blob | null, title, host, sizes }`. The worker writes it, and the panel deletes it on "Add" or "Back".
- **Reading a v1 record** still works: its inline photo Blob is used as it stands. The next write splits it into keys. Any other version starts fresh, as today.
- **`fromSaved`** gains a `blobs` argument with the photo and art Blobs, read in the same transaction. It makes object URLs for the shown photo and for each print's picture. `madeFromStore` covers both, so neither is read back or written again.
- **Alternative:** a second object store for blobs. Rejected, because it needs `onupgradeneeded` version handling for no gain.

### 5. The try view: extension components over F2's stage

- **Files:**
  - `src/try/use-try.ts`: the try record, read on start and on the worker's ping.
  - `src/try/try-reducer.ts`: pure.
  - `src/try/size-step.tsx` and `src/try/hang-view.tsx`.
- **State:**

  ```ts
  {
    step: "size" | "hang";
    picked: number | "other" | null;
    wText: string;
    hText: string;
    framed: boolean;
    at: {
      dx: number;
      dy: number;
    }
  }
  ```

  It lives in memory, so a reload returns to the size step (spec: "A try waits for the visitor"). `picked` starts at `0` when exactly one size was found.

- **The print's size:** the picked `{ w, h }`, turned so that its longer side runs the same way as the image's. Framed adds `2 × MOULDING` to each side.
- **Where it hangs:** `hangPrint(outside, wall, furniture)`, in `src/try/hang.ts`.
  - With furniture: bottom at `furniture.y + furniture.h + ABOVE_SOFA`, centred on the furniture.
  - Otherwise: centre at `floor + CENTRE_LINE` (or mid-wall when the floor is unknown), centred by `centreGroup`.
  - This copies `layoutTemplate`'s six lines of placement, because `layoutTemplate` only takes catalog stacks. `ponytail:` duplicated placement; export it from the engine if a third caller appears.
  - `at` is added on top. Drags go through `snapFrame`, and the distance fields through `setDistance` on `frameDistances`.
- **The wall** is the planner's own photo slice: `wallOf(planner)` and `placeOf`. So the "Wall" select, the saved photo and in | cm need no new code.
- **Drawing:** `WallStage` with one `StageFrame`, carrying `art` (the try image's object URL) and `moulding` (0 or 1). The four distance rows reuse F2's `namedDistances`, `writeDistance`, `parseLength` and `stepDistance`, and the `wf-row` / `wf-num` CSS. F2 keeps its rows inline, so the extension writes its own 30-line row list.
- **"Use my wall photo":**
  - It dispatches G1's `upload` on the planner.
  - While the try is at `hang` and the planner is in a flow step, the panel renders `GalleryWall`, which shows its own upload and scale steps.
  - When the planner reaches `photo`, the try view comes back. Backing out reaches `sample` (BL-48's rule), which shows the try in the sample room.
- **"Add to my layout":** dispatches G1's `addPrint` (decision 6). It writes `art:<id>`, deletes `try`, and shows the planner.
- **"Back to my layout":** deletes `try`.
- **The full layout:** "Add to my layout" is disabled at `MAX_FRAMES`, with G1's 12-frame note beside it.
- **The panel** (`panel.tsx`) renders the try when a try record exists and the planner is not in a flow step. Otherwise it renders the planner. The tab ignores `try`.

### 6. G1: a print on an added frame

- **State:** `added[]` gains an optional `print?: { w: number; h: number; label: string; framed: boolean; art?: string }`. `art` is an object URL, and the extension revokes it with the frame.
- **`outside()`** gives `{ w: w + 2m, h: h + 2m }` for a print, where `m` is `MOULDING` when framed and 0 when not. `PlannerFrame` carries `print` through.
- **A new action**, `{ type: "addPrint", print }`. It uses the same placement as `applyPicker`'s add mode: `previewRect` with the print's outside size, beside the selected frame or the group. It assigns the next id and letter, selects the print, and returns the state unchanged at `MAX_FRAMES`. The site never dispatches it.
- **Labels:** `frameSize(f)` returns `"<label> print"` for a print and `chipSize(f.size)` otherwise. `frameName`, the selection block, `nail-marks.tsx` and `GroupSizes` use it.
- **No "Change size" for a print:**
  - `sizesOf` keys a print by its own frame id, so it gets its own row with no "Change".
  - `openPicker` in size mode returns the state unchanged for a print.
  - The selection block hides "Change size".
  - The "also the other N" count leaves prints out.
- **`WallStage`:** `StageFrame` gains optional `art?: string` and `moulding?: number`, defaulting to no picture and `MOULDING`. `wf-art` gets the picture as an `<img alt="">` (`object-fit: cover`), because the frame button already carries the name.

### 7. BL-56: a third state on the "Wall" select

- `useWall().wall` becomes `"sample" | "photo" | "new"`. It is `"new"` in the `upload`, `pick`, `place`, `short` and `confirm` modes.
- `WallSelect` renders a third option, "New wall photo", which is `disabled` and shown only while it is the value. Picking either real option then fires `onChange`.

### 8. Tests

- **Unit tests (Vitest)**, each new file citing its scenario:
  - **`find-sizes.test.ts`:**
    - the canvas's three forms;
    - mm and cm;
    - commas in decimals;
    - unitless values as inches;
    - deduplication across orientation;
    - eight at most;
    - `1920x1080`, `px` and `2 x 2 in` rejected.
  - **`menu.test.ts`:**
    - a fake `MenuApi` records calls;
    - `registerMenu`'s `create` arguments;
    - that `open` is called before the first await resolves (record the call order synchronously);
    - fetch success;
    - fetch failure falling back to the crop;
    - both failing giving `image: null`;
    - injection failure giving `sizes: []` and `tab.title`;
    - the stored try having no `text` key.
  - **`try.test.ts`:**
    - `hangPrint` in the sample room: 24 × 36 unframed gives 18 / 8 / 60 / 60, and framed gives 16 / 8 / 59 / 59;
    - turning the size for a landscape picture;
    - the try reducer's waiting rules;
    - the tip numbers.
  - **`saved-wall.test.ts`** gains cases in a new `saved-wall-keys.test.ts`, so the existing file stays unedited:
    - v1 inline photo read;
    - v2 split into keys;
    - an orphan `art:` key deleted;
    - a print round trip.
  - **`gallery-wall/__tests__/state-print.test.ts`:**
    - `addPrint` placement and letter;
    - `outside` framed and unframed;
    - `sizesOf` with a print;
    - `openPicker` refusing a print;
    - the cm label.
- **E2E (`e2e/extension-try.spec.ts`):** Playwright cannot click a native menu or get an `activeTab` grant. So the spec seeds the `try` record on the panel page with `page.evaluate`, through IndexedDB plus a channel post, and drives the panel:
  - several sizes;
  - one size;
  - none;
  - hang;
  - framed;
  - set a distance;
  - Add, then reload (the print and its picture are there);
  - Back;
  - "Use my wall photo" with the fixture photo;
  - axe on the size step and the hang view;
  - the request list still only `chrome-extension:` and `blob:`.
- **The manifest assertion** in `manifest.test.ts` gets the four permissions (approved 2026-11-18).
- **BL-59** goes in `e2e/extension-races.spec.ts`: close the panel inside 300 ms and check the change is kept; edit the panel and the tab at once and check that the last write wins on both.
- **BL-56** gets one case in the same spec.

## Risks / Trade-offs

- **Sizes come from page text, so a page can list sizes that are not the print's** (a frame upsell, "ships in a 3 x 3 in tube"). → The visitor picks. With several sizes nothing is pre-picked, and the note says "Check yours before you buy."
- **The crop can catch an overlay** (a zoom lens, a badge) when the fetch fails. → Accepted. The print is still true size, and only the picture is off.
- **The panel may load before the worker has written the try.** → The panel shows the planner, then switches on the ping, often within a frame or two. A stale try left from a closed panel shows until the new one lands, then is replaced.
- **A print taller than the wall** (a 40 in print in a photo with a 30 in usable height). → It hangs by the rule and shows its negative distance, as G1's group does past an edge. The tip and the buttons still work.
- **A try that arrives while the planner is in a flow step or in Nail marks.** → A flow step finishes first (decision 5). From Nail marks, the try view simply shows, and "Back" returns to Nail marks.
- **`activeTab` expires when the tab navigates.** → Everything is read in the click's own tick, and nothing is read later.
- **Off-catalog prints are a new kind of G1 frame.** → It is only reachable from the extension, and G1's site tests guard that the default `GalleryWall` is unchanged.

## Migration Plan

- A v1 saved record is read as it is and rewritten as v2 on the next change. There is no data loss and no prompt.
- The new permissions show to existing users only when a version with them is installed. There is no store version yet (0.1.0 was never uploaded), so no one sees a permission warning.
- Rollback is reverting the merge. A v2 record read by the old build counts as another version and starts fresh. This is acceptable, because nothing is published yet.

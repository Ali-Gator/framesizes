# Proposal

## Why

Tracker row T8 is the F7 page, "Frame & poster mockup: artwork upload, frame style, PNG export" (`/frame-mockup`). A visitor has a design or a print file and wants to see it framed on a wall, then save that picture. Phase 1, `t8-frame-mockup-engine` (archived and merged 2026-11-25, with the BL-129 square cut-over fix after it), put the mockup math in the size engine. This is phase 2: the widget, the copy, the head values and F7 going live. The owner approved the F7 canvas on 2026-11-24 (https://claude.ai/artifact/8YexFJ28z3TrXTGLJteFSf, recorded in CLAUDE.md "Design source"), option A on all ten questions; Q8 (money) is a free 2,400 px PNG with no watermark.

## What Changes

- **New page `/frame-mockup`**, statically rendered and laid out as the canvas's "F7 page" boards (desktop 1280, phone 390). It is a Tool page in the SEO guide's outline. Head values from the guide's F7 rows (read 2026-11-25):

  | Field                | Value                                                                                                                                                                                  |
  | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | URL / canonical      | `/frame-mockup`                                                                                                                                                                        |
  | Head keyword         | poster mockup (1,900 / KD 27): the first sentence says it word for word. The `h1` is verbatim from the guide and holds "Poster … Mockup" but not the exact phrase; it is not reworded. |
  | Title                | Poster & Frame Mockup Generator (31 characters; the layout's template adds ` \| Frame Sizes`, 45 in all)                                                                               |
  | h1                   | Poster and Frame Mockup Generator                                                                                                                                                      |
  | Description          | Upload your artwork, pick a frame style and a wall, and download a framed poster mockup as a PNG. It runs in your browser, with no account. (138 characters)                           |
  | Secondary keywords   | frame mockup (320: an `h2`) · picture frame mockup (320: an `h2`) · wall art mockup (210 / KD 23, from the research: an `h2`)                                                          |
  | Affiliate keys       | none in the guide                                                                                                                                                                      |
  | Open Graph image     | the page's own 1200 × 630 PNG: the `h1` and the sample artwork in a 24x36 black frame above the sofa; alt "The sample artwork in a 24x36 black frame above a sofa"                     |
  | Structured data      | `BreadcrumbList` (Home › Poster and frame mockup). No `FAQPage`, `HowTo` or `WebApplication` (the guide's "Not used" table).                                                           |
  | Must link out of hub | P1 Poster sizes (Related tools, only when live) and G1 Gallery wall planner. The anchor "poster sizes" always means `/poster-sizes`.                                                   |

  The description is a promise: the widget offers four frame styles and two walls, saves a PNG, and runs on the device with no account and no upload.

- **The page's sections**, in the canvas's order: breadcrumbs, `h1`, the answer paragraph, the widget, then:
  - "How to use the mockup generator": five numbered steps.
  - "Frame sizes by artwork shape": one table of frame shapes (2:3, 3:4, 4:5, A-series, square), built from the catalog.
  - "Frame mockup: a close-up of the frame", "Picture frame mockup for a photo", "Wall art mockup in a room": one card each with a static mockup drawing.
  - "Questions": six questions, the first open.
  - "Related tools".
- **The widget** (`apps/web/src/components/frame-mockup/`), as the canvas's Mockup and Scene components draw it:
  - A true-scale picture of the frame on the v2 sample room's 144 × 96 in wall: above the sofa or a plain wall, the whole wall or a close-up. Before any upload the site's own sample artwork (2:3) hangs in a 24x36 black frame, no mat, above the sofa, whole wall; this state is in the server HTML.
  - Upload: "Choose a JPEG or PNG" on both layouts, and a drop area on desktop. The file is read in the browser and never sent. States: dragging over, "Opening your artwork…", a file the browser cannot open, a file that is not an image (the last artwork stays), and a note naming the size it opened on and why. "Use the sample again" shows after an upload.
  - Size chips from the engine (`mockupOptions`), each with its cut ("0% cut", "17% cut"); with a mat, 4x6 is disabled ("No room"). An upload opens on `mockupDefault` with the mat setting in force.
  - Frame style: black, white, light oak, walnut, all with the 1 in moulding.
  - Mat: "No mat" / "Mat". Switching keeps the size; with 4x6 picked, "Mat" is disabled with "A 4x6 has no room for a mat."
  - Drag the artwork, or move it with the arrow keys (¼ in, Shift 1 in), along the side that is cut.
  - The answer under the picture: the frame size (A-series leads with mm), the cut, the mat opening and borders, the outside size and its heights on the wall, and the close-up's wall size, in both units; a link to F2 for the visitor's own wall.
  - "Download PNG" saves the view on screen at `exportSize` (2,400 px on the longer side) as `frame-mockup-<size>.png`, with "Making your PNG…" and "Saved …" states. No watermark.
  - Desktop: the picture column (sticky) with Mat, Wall and View under it, then the answer and Download; the right column holds the upload, the size chips and the styles. Phone: the picture, the upload button, then four tabs (Size · Style · Mat · Wall) right under it, then the answer and Download. One DOM, laid out by CSS.
- **F7 goes live** in the site map with its head values. The sitemap gains `/frame-mockup` (41 URLs). Every live Frames page's Related tools gains the F7 card (F1 to F6); the footer lists F7 under Frames.
- **Engine housekeeping folded in** (backlog items in the engine's F7 area, done before the page uses the API):
  - BL-130: `exportSize` gives no answer for a view whose width or height is not a positive number.
  - BL-131: `visiblePart` returns a `PixelRect` (pixels, y down from the artwork's top) instead of the inch `Rect`; the barrel exports `Placement`, `View` and `TIE` as `MockupPlacement`, `MockupView` and `MOCKUP_TIE` instead, so they no longer clash with F1's local `View`.

Copy that is not on the approved canvas, for the owner before commit:

- **Related tools** follow the site map, not the canvas's five hand-picked cards: every live Frames page (F1 to F6) and G1, then P1 when live, with the site map's names and questions (as on F4, F5 and F6).
- **The reference section's last sentence** ("To pick a print size for your file, see Art print sizes. To check how sharp it will print, use the DPI checker.") shows only once those pages are live; until then the section ends with the table.
- **A cut under half a percent that is not zero** (A1 with a mat cuts 0.11% of a 2:3 artwork) reads "<1% cut" on its chip and "Cuts under 1% of …" in the answer, so "0% cut", "Nothing is cut" and the disabled move control always agree: all three mean the engine finds nothing to move. An A-series file (2480 × 3508 px) therefore reads "<1% cut" in A3, A2 and A1, where the designer prompt's table rounded to 0%.
- **A PNG the browser cannot make** (`toBlob` gives nothing): "Your browser could not make the PNG. Try again, or try the close-up." The picture stays as it was.
- The social image and its alt (table above).

## Capabilities

### New Capabilities

- `frame-mockup`: the F7 page and its widget. Covers the sample first screen, the upload and its states, the size chips and the default size, the frame styles, the mat, the walls and views, moving the artwork, the answer, the PNG download, the units, the desktop and phone layouts, keeping the file on the device, and the page's how-to, shape table, keyword sections, questions, links and head values.

### Modified Capabilities

- `size-engine`: "A saved mockup is 2400 pixels on its longer side" gains a scenario: a view whose side is not a positive number gets no size (BL-130).
- `seo-base`: the sitemap requirement gains a scenario with F7 live (41 URLs).
- `frame-size-chart`: the live-links requirement gains a scenario with F2 to F7 and G1 live.
- `frames-on-wall`: the live-links requirement gains a scenario with F1 to F7 and G1 live.
- `actual-size`: the live-links requirement gains a scenario with F1 to F7 and G1 live.
- `measure-frame`: the live-links requirement gains a scenario with F1 to F7 and G1 live.
- `frame-mat-calculator`: the live-links requirement gains a scenario with F1 to F7 and G1 live.
- `poster-frame-sizes`: the live-links requirement gains a scenario with F1 to F7 and G1 live.

## Impact

- New:
  - `apps/web/src/app/frame-mockup/` (page, Open Graph image, CSS);
  - `apps/web/src/components/frame-mockup/`;
  - `apps/web/src/components/ui/sample-room.tsx` (the v2 room, shared so BL-51 can reuse it on F2 and G1);
  - `apps/web/public/frame-mockup/` (the sample artwork and the two stand-in artworks the keyword cards show, all the site's own vector drawings from the canvas);
  - `e2e/frame-mockup.spec.ts` and `e2e/frame-mockup-content.spec.ts`.
- Changed:
  - `apps/web/src/lib/site-map.ts` (F7 live);
  - `packages/sizes/src/mockup.ts` and `index.ts` (BL-130, BL-131; the barrel's generic names are replaced).
- **Existing tests to edit (needs the owner's approval).** Each is re-pointed to its new scenario and only adds the F7 card or URL:
  - `e2e/frame-chart-content.spec.ts` (Related tools);
  - `e2e/frames-on-wall-content.spec.ts` "links only to live pages";
  - `e2e/actual-size-content.spec.ts` "links only to live pages";
  - `e2e/measure-frame-content.spec.ts` "links only to live pages";
  - `e2e/frame-mat-content.spec.ts` (Related tools);
  - `e2e/poster-frames-content.spec.ts` (Related tools);
  - `e2e/seo-home.spec.ts`: the sitemap test expects 41 URLs, F7 among them.

  `packages/sizes/src/__tests__/mockup.test.ts` is not edited: BL-130 gets a new test, and BL-131 renames only the barrel's exports (the test imports from `../mockup`).

- No new dependency. No paid API. Session recording and autocapture are already off (`instrumentation-client.ts`), so no PostHog change is needed for the artwork.
- Not here: a larger "HD" export or anything about Pro (Q8 A); the visitor's own wall photo (F2 owns it, Q5 A); a "fits without cropping" list (PH2) or print sharpness (Q2); affiliate links (none in the guide); analytics events (BL-15); a dark theme (BL-2).
- Backlog, read 2026-11-25:
  - BL-130 and BL-131 are folded in (above) and deleted when this ships.
  - BL-51 (the v2 room on F2 and G1) stays open: F7 draws the v2 room through the new shared `SampleRoom`, so BL-51 becomes swapping F2 and G1 onto it.
  - BL-128 (a table cell that spills into the next column) is not done site-wide here, but F7's shape table keeps its size lists in a wrapping text column, and F7's content test checks that no cell of it overflows at 1280 and 390.
  - BL-118 (a scroll hint on wide tables) is not touched: F7's table has two columns and does not scroll.
  - BL-15 stays deferred (a metrics plan). BL-16 (Related tools on a phone) stays deferred: seven cards on F1, F2, F3 and F7.
- Tracker: T8 becomes `Done` at archive.

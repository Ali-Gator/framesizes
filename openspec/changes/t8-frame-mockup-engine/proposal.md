# Proposal

## Why

Tracker row T8 is the F7 page, "Frame & poster mockup: artwork upload, frame style, PNG export" (`/frame-mockup`). A visitor has a design or a print file and wants to see it framed on a wall, then save that picture. The research names the widget: "Upload artwork → framed mockup on a wall → download PNG", unique by "artwork upload, frame style, export (designer hook)".

F7 had no approved design when T8 started, so it ships in two phases, as CLAUDE.md's "A page with no approved design yet" sets out (T4, T5 and T6 ran the same way):

1. This one, `t8-frame-mockup-engine`: the mockup math in the size engine, with no UI and no page.
2. A page change, `t8-frame-mockup`, proposed once this change is applied. It covers the widget (file reading, drawing, PNG export), the copy, the SEO head values and F7 going live.

The F7 canvas (https://claude.ai/artifact/8YexFJ28z3TrXTGLJteFSf) was approved on 2026-11-24, before this change was applied, with option A on all ten questions; Q8 is a free 2,400 px PNG with no watermark. Its engine answers are folded in here (design.md, "Canvas answers").

Most of the parts already exist: the frame catalog and its pre-cut mats (`CATALOG`, `framesFor`, `MAT_OVERLAP`), the 2 in default mat (`MAT_WIDTH`), the A-series poster sizes (`POSTERS`) and the true-scale wall (`wallScene`, `DEMO_ROOM`, `CENTRE_LINE`). What is missing is the step from an artwork's pixels to a framed picture: which sizes to offer, how much of the art each one cuts, the opening the art fills, where the frame hangs, and how big the saved PNG is. The screen and the PNG must draw the same picture, so these numbers belong in one pure module.

## What Changes

- New module `packages/sizes/src/mockup.ts` in the size engine. Lengths are in inches, artwork sizes in pixels.
- **The sizes offered.** The 19 catalog frame sizes and A3, A2 and A1 (from `POSTERS`), turned to the artwork's orientation. An artwork whose sides differ by less than 5% counts as square and gets the five square frames. For a portrait 2000 × 3000 px artwork that is 4x6 … 27x40, A3, A2, A1 (17 sizes).
- **How much each size cuts.** The art fills the opening edge to edge, centred, so a size of another shape cuts part of it. Each size carries that share, with and without a mat. 2000 × 3000 px (2:3), no mat: 4x6, 12x18, 20x30 and 24x36 cut 0%; 27x40 1.2%; 11x17 2.9%; A3 and A2 5.7%; A1 5.6%; 16x20 16.7%; 20x24 20%.
- **The size it opens on.** The size that cuts least; sizes within 1 percentage point of it count as tied, and the largest tied size wins. 2:3 art opens on 24x36, 3:4 art (3000 × 4000 px) on 18x24, an A-series file (2480 × 3508 px) on A1, square art on 20x20.
- **The opening with a mat.** A frame sold with a pre-cut mat uses that mat: the opening is the mat's print size less the ¼ in overlap on each side (16x20 → 10½ × 13½ in). A frame with no pre-cut mat gets a 2 in mat (20x30 → 16 × 26 in; A2 → 12.5 × 19.4 in). A 4x6 has no room for a 2 in mat: with a mat it stays in the list with no opening and no cut, so the page shows it disabled, and the mockup never opens on it. Without a mat the opening is the frame size.
- **The crop.** For an artwork and an opening, the part of the artwork that shows, in pixels, centred by default. A focus point from 0 to 1 slides it along the side that is cut, so a visitor can drag the art; it never leaves the artwork.
- **The wall.** The frame hangs at true scale on the 144 × 96 in sample wall, by F1's rules: above the sofa (8 in over its 34 in back), or centred at 57 in on a plain wall. Two views: the whole wall, and a close-up of the frame with a margin of a quarter of its longer outside side (24x36: 45 × 57 in).
- **The PNG size.** The view's longer side becomes 2,400 px, the other in proportion: the whole wall 2,400 × 1,600 px, the 24x36 close-up 1,895 × 2,400 px. That stays far under the ~16.7-megapixel canvas limit of iOS Safari. The export is free, with no watermark (canvas Q8 A).
- **The opening size follows the mat.** An upload opens on the size that cuts least with the mat setting in force: 3:4 art opens on 18x24 without a mat and on 12x16 with one.
- **A key press.** Arrow keys move the artwork ¼ in and Shift + arrow 1 in along the cut side. The engine turns that step into a change of the focus point: the step divided by how far the filled artwork reaches past the opening on that side. 2000 × 3000 px art in a 16x20 reaches 4 in past it, so ¼ in is 0.0625 and 1 in is 0.25. An artwork that is not cut does not move.
- **No answer.** An artwork whose width or height is not a positive number gets no answer.
- **Reuse.** `framesFor`, `findFrame`, `POSTERS`, `MAT_OVERLAP`, `MAT_WIDTH`, `MOULDING`, `wallScene`, `DEMO_ROOM`, `CENTRE_LINE` and `SOFA` are reused, not retyped. `CATALOG`, `POSTERS` and the wall do not change.
- **Out of this change, by design.** File reading, decoding, drawing, `toBlob` and the download are browser code for the page change. Frame style colours and names are visitor-facing, so they come from the canvas. Two neighbours keep their jobs:
  - a list of sizes that fit an artwork without cropping is PH2 (Art print sizes);
  - a "prints sharp up to" readout is Q2 (DPI checker).

  F7 shows how much a size cuts and nothing more. If the canvas wants either feature, it links to those pages.

Backlog: read 2026-11-24.

- **BL-51** (richer sample room v2 on F2 and G1): F7's wall is that same 144 × 96 in sample room. The designer prompt points at the approved v2 room boards. Drawing it on F7 belongs to the page change, so the item stays open for F2 and G1; the page change says whether F7 draws v1 or v2.
- **BL-15** (widget analytics) stays deferred: it waits for a metrics plan.
- No other item is in the engine's area.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `size-engine`: adds requirements for the frame mockup:
  - the sizes a mockup offers for an artwork, turned to its orientation;
  - how much of the artwork each size cuts, with and without a mat;
  - the size a mockup opens on;
  - the opening the artwork fills, with and without a mat;
  - the part of the artwork that shows, and the focus point that moves it;
  - where the frame hangs on the sample wall, and the two views;
  - the pixel size of the saved PNG;
  - the focus step a key press moves the artwork;
  - an artwork size that is not a positive number gets no answer.

  The existing requirements do not change.

## Impact

- Code:
  - new `packages/sizes/src/mockup.ts` and `packages/sizes/src/__tests__/mockup.test.ts`;
  - new exports in `packages/sizes/src/index.ts`.
  - No change in `apps/web`. Nothing on the site changes; F7 stays `live: false`. Its `site-map.ts` entry already exists.
- Dependencies: none added. No paid API.
- Tests: new unit tests only. No existing test is edited.
- Specs: `size-engine` gains requirements. After archive, its Public Interface, Behavior and Edge Cases sections are updated by hand. The README row is unchanged, since `packages/sizes/src/**` already maps to `size-engine`.
- Tracker: T8 becomes `In progress` at archive (the page change completes it).
- For the canvas and the page change, noted here so it is not lost:
  - The SEO guide's F7 rows: URL `/frame-mockup`; head keyword "poster mockup" (1,900 / KD 27); title "Poster & Frame Mockup Generator", which gets the ` | Frame Sizes` suffix (only F1, F2 and F6 skip it); h1 "Poster and Frame Mockup Generator"; description "Upload your artwork, pick a frame style and a wall, and download a framed poster mockup as a PNG. It runs in your browser, with no account."; secondary keywords "frame mockup" (320) and "picture frame mockup" (320). The research adds "wall art mockup" (210 / KD 23).
  - The description is a promise. The widget must offer more than one frame style and more than one wall, must export a PNG, and must run on the device with no upload and no account. The guide's pre-publish rule says every verb in it must exist in the shipped widget.
  - F7 is a Tool page in the guide's heading outline: h1 → one sentence → widget → h2 "How to use …" (numbered steps) → h2 the reference answer → h2 common cases from the secondary keywords → h2 Questions → h2 Related tools.
  - Links: F7 must link to P1 (Poster sizes) and G1 (Gallery wall planner). P1 is not live; show it only once it is, as F6 does.
  - Images: the visitor's upload gets a fixed label and is never indexed ("Your artwork", as F2's "Your wall photo"). Uploads and exports have no public URLs. The widget canvas follows the guide's `role="img"` rule, with an `aria-label` that follows the state.
  - The research earmarks "HD mockups (F7)" for a later Pro tier. The owner chose (Q8 A, 2026-11-24): everything free for now, a 2,400 px PNG with no watermark, and nothing on the page mentions Pro.
  - The page passes the title without the suffix; the layout's `%s | Frame Sizes` template adds it.
  - The canvas answered every question in `designer-prompt.md` with option A. Its notes for the page change, approved with it:
    - switching the mat keeps the size picked; only the cut changes;
    - "Use the sample again" (shown only after an upload) returns the sample on 24x36 and keeps style, mat, wall and view;
    - the PNG is named `frame-mockup-<size>.png` (`frame-mockup-24x36.png`, `frame-mockup-a2.png`);
    - the answer under the mockup lists the frame's size, its bottom and top edge heights (above the sofa) or its span (plain wall), and the close-up's wall size;
    - an upload says which size it opened on and why, in a polite live region;
    - on a phone there is no drop area, and the settings sit in four tabs (Size · Style · Mat · Wall) under the mockup; on desktop the picture column is sticky;
    - design system gaps the page builds as markup: a disabled segmented option, drop-area states, a frame style swatch picker, tabs;
    - the FAQ "Can I use the mockup in my shop listing?" states facts only (no watermark, the room and frames are the site's own drawings, the visitor needs the rights to their artwork) and grants no licence.

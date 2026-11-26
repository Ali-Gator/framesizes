# Tasks

Branch `t8-frame-mockup`, cut from `main` after the engine PR and the BL-129 fix merged. In every group, tests come first and cite their scenario as `{@link openspec/specs/<capability>/spec.md#<anchor>}`, then the code. The approved F7 canvas (CLAUDE.md "Design source") is the reference for layout and copy: its Mockup component shows every state, Scene is the drawing, boards a–z2 are the states, Main and Phone390 are the page. Read the bundled Next.js docs named in a task before writing that code.

## 1. Set-up

- [x] 1.1 Get the owner's approval for, and record the date here (approved 2026-11-25, both items):
  - editing the seven e2e tests named in the proposal's Impact (only those seven may change);
  - the off-canvas copy: Related tools from the site map, the reference sentence hidden until PH2 and Q2 are live, "<1% cut" and "Cuts under 1% of …" (also A3, A2 and A1 for an A-series file, which the designer prompt rounded to 0%), the PNG failure message, the social image and its alt.

  Before any edit, verify `pnpm test` is green on the branch (green 2026-11-25: 365 passed, 6 skipped).

## 2. Engine housekeeping (`packages/sizes`, BL-130, BL-131)

- [x] 2.1 Add a test for `size-engine` "A view that is not a positive size" (a new `it` in `mockup.test.ts`; no existing test changes). Make `exportSize` return `undefined` for such a view. Verify the tests pass.
- [x] 2.2 Give `visiblePart` the return type `PixelRect` (px, `y` down from the artwork's top), and export `Placement`, `View` and `TIE` from `index.ts` only as `MockupPlacement`, `MockupView` and `MOCKUP_TIE`, each with its requirement citation. Verify `pnpm typecheck` and the engine tests pass. Delete BL-130 and BL-131 from `docs/backlog.md`.

## 3. Widget logic (`components/frame-mockup/`)

- [x] 3.1 Write `state.test.ts` for the reducer and selectors (design decision 1):
  - the initial state (sample 2000 × 3000, 24x36, no mat, black, sofa, wall, focus 0.5, panel size);
  - `uploaded` on 2000 × 3000, 3000 × 2000, 2000 × 2000 and 3000 × 4000 with and without the mat (24x36, 36x24, 20x20, 18x24 / 12x16), the "opened" then "replaced" note, and settings kept;
  - `sample` back on 24x36 with the settings kept;
  - `mat` keeping the size; `mat(true)` refused on 4x6; `size("4x6")` refused with the mat on;
  - `focus` clamped to 0..1, and a reverse step moving at once from an edge;
  - the cut axis and "nothing to move" from `focusStep` (24x36 for 2:3 art: nothing; A3 for a 2480 × 3508 px file: something);
  - `failed` and `reading` leaving the artwork and size as they were.

  Implement `state.ts`. Verify the tests pass.

- [x] 3.2 Write `copy.test.ts`, pinning every sentence and label in the spec: the chips and their subs (the sample with and without a mat, "<1% cut" on A1 with a mat and on A3, A2 and A1 for a 2480 × 3508 px file, "No room"), the answer's value and sub (24x36 in both units, A2 in mm, in and cm), every fact line (no mat, pre-cut 24x36, 2 in on 20x30, above the sofa, plain wall, close-up, cm), the hint and "Nothing to move", the notes, the two errors, the art line, the picture's labels, the PNG line and the file names (`frame-mockup-24x36.png`, `frame-mockup-a2.png`). Implement `copy.ts` (design decision 2). Verify the tests pass.
- [x] 3.3 Write `scene.test.ts`: for 24x36 above the sofa the outside's top is 16 in from the wall's top and the close-up's view starts 6.5 in from it; the plain wall drops the sofa; the mat and opening for 24x36 with its pre-cut mat; the artwork's drawn rect for 2:3 in 16x20 at focus 0, 0.5 and 1. Implement `scene.ts` (design decision 3). Verify the tests pass.

## 4. Widget UI

- [x] 4.1 Add `--leaf` to `globals.css` and build `components/ui/sample-room.tsx` from the canvas's Scene SVG (design decision 5), with a markup test that the sofa shows only when asked.
- [x] 4.2 Give `SegmentedControl` an optional `disabled` per option, skipped by the arrow keys, and an `aria-describedby` hook. Add a test for it (no existing test changes).
- [x] 4.3 Write a markup test (`renderToStaticMarkup`) of the widget's server render, pinning the spec's "The widget in the server HTML" scenario. Build `frame-mockup.tsx`, `mockup-picture.tsx`, the chips, the styles, the Mat, Wall and View controls, the phone buttons and the answer (design decisions 4, 9 and 10), and `public/frame-mockup/` with the canvas's three SVGs (decision 12). Verify the test passes.
- [x] 4.4 Build `use-artwork.ts` (decision 8), the drop area and the move control (decision 6). Verify with DOM tests:
  - the note and the errors are in one polite live region and the answer in another;
  - a non-image file and a file that does not decode keep the artwork, with their messages;
  - a stale pick is dropped and its URL revoked;
  - "Use the sample again" shows only after an upload;
  - Shift + ArrowUp on 16x20 moves the focus by `focusStep(1 in)`; the move control is disabled on 24x36;
  - "Mat" is disabled and described on 4x6; the 4x6 chip is disabled with the mat on;
  - the phone buttons carry `aria-expanded` and their current values.
- [x] 4.5 Build `export.ts` (decision 7). Add `e2e/frame-mockup.spec.ts`:
  - at 1280: the chips right of the picture, Mat below it, no phone buttons; a 3000 × 2000 px fixture dropped on the drop area opens on 36x24; dragging the artwork on 16x20 moves it;
  - at 390 × 844: "Style" shows the styles and hides the chips, nothing wider than the screen; at 390 × 664 the `h1`, the paragraph, the picture and "Choose a JPEG or PNG" are in the first screen;
  - uploads of 2000 × 3000 and then 3000 × 4000 px fixtures, a PDF and a broken image;
  - downloads: the whole wall (`frame-mockup-24x36.png`, IHDR 2400 × 1600, black at the moulding's engine position) and an A2 close-up (`frame-mockup-a2.png`, IHDR equal to `exportSize`);
  - no request carries the artwork through upload, changes and download (F2's check).

  Add the fixtures to `e2e/fixtures/`. Verify the tests pass.

## 5. The page (`app/frame-mockup/`)

- [x] 5.1 Set F7 live in `site-map.ts` with the SEO guide's title, `h1` and description, and `lastModified` set to the merge date. Verify `checkSiteMap` passes (title 45 characters with the suffix, description 138).
- [x] 5.2 Add `e2e/frame-mockup-content.spec.ts`:
  - the outline and the answer paragraph;
  - the widget's server render;
  - the shape table's five rows, and no cell overflowing at 1280 and 390;
  - no link to `/art-print-sizes` or `/dpi-checker`;
  - the three keyword sections, their numbers and the F2 and G1 links;
  - the six questions, the first open, and the PNG answer's sizes;
  - Related tools (seven cards in order) and no `#` href;
  - title, canonical and `og:image:alt`;
  - the breadcrumbs with one `BreadcrumbList` and no `FAQPage`, `HowTo` or `WebApplication`.

  Build `page.tsx` and `frame-mockup.css` with the how-to, the shape table, the keyword sections and the questions (design decision 11). Verify the tests pass.

- [ ] 5.3 Build `opengraph-image.tsx` (read `01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md`) with `ogFonts`, its geometry from `scene` and literal colours. Verify `pnpm build` prerenders it at 1200 × 630, under 300 KB.
- [x] 5.4 Run `humanizer:humanizer` over all new visitor-facing text: copy, headings, FAQ, labels, notes, messages, alts and `aria-label`s. Keep every size, fact and SEO-guide keyword; leave the title, `h1` and description verbatim, and keep "poster mockup" in the first sentence and the three keyword headings. A rewording that changes what the canvas says goes to the owner, and the spec scenarios it touches are updated with it. Verify the unit, DOM and content tests still pass.

## 6. Live-page counts elsewhere (approved test edits only)

- [x] 6.1 Re-point seven tests to their new scenarios, each adding only F7:
  - `e2e/frame-chart-content.spec.ts` → `frame-size-chart` "F2, F3, F4, F5, F6, F7 and G1 are live besides the home page" (seven cards);
  - `e2e/frames-on-wall-content.spec.ts` → `frames-on-wall` "F1, F2, F3, F4, F5, F6, F7 and G1 are live";
  - `e2e/actual-size-content.spec.ts` → `actual-size` "F1, F2, F3, F4, F5, F6, F7 and G1 are live";
  - `e2e/measure-frame-content.spec.ts` → `measure-frame` "F1, F2, F3, F4, F5, F6, F7 and G1 are live";
  - `e2e/frame-mat-content.spec.ts` → `frame-mat-calculator` "F1, F2, F3, F4, F5, F6, F7 and G1 are live";
  - `e2e/poster-frames-content.spec.ts` → `poster-frame-sizes` "F1, F2, F3, F4, F5, F6, F7 and G1 are live";
  - `e2e/seo-home.spec.ts` → `seo-base` "The live tools with F3, F4, F5, F6, F7 and the company pages" (41 URLs).

  Verify the seven pass, and that the site-wide e2e that walk every live page (unit display, forced colours, trailing slash, analytics, shell a11y) pass with F7 among them.

## 7. Gate

- [ ] 7.1 Run `pnpm fix`, `pnpm test`, `pnpm build` and `openspec validate --all --no-interactive`. Verify each is green.
- [ ] 7.2 Run the SEO guide's pre-publish checklist for F7 on the checks that can run before go-live (1–14 on the built HTML), including that every verb in the description exists in the widget (upload, pick a style, pick a wall, download a PNG, no account). Log the ones that need the live URL (preview card, Rich Results Test, URL Inspection) and a PNG download on an iPhone as backlog items gated on go-live, from BL-132.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review`). Fix its findings, and log what stays unfixed in `docs/backlog.md`.
- `/opsx:archive`. Re-add Public Interface, Behavior and Edge Cases to `openspec/specs/frame-mockup/spec.md`, and update `size-engine`'s Public Interface (`exportSize`, `PixelRect`, the renamed exports). Add the `frame-mockup` row to `openspec/specs/README.md`: `apps/web/src/app/frame-mockup/**, apps/web/src/components/frame-mockup/**`.
- Update the Tracker: set T8 to Done and add a Log line.
- Push, open a PR to `main` naming any backlog ids added, and turn on auto-merge with a merge commit.

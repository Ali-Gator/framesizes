# Tasks

Branch `t11-gallery-wall-planner`, cut from `main` after `t11-gallery-wall-engine` is merged. Order inside every group: tests first, each citing its scenario as `{@link openspec/specs/<capability>/spec.md#<anchor>}`, then code. Read the bundled Next.js docs named in a task before writing the code it covers.

## 1. Set-up

- [x] 1.1 Verify `t11-gallery-wall-engine` is merged: `TEMPLATES`, `layoutTemplate`, `measureGroup`, `groupDistances`, `setGroupDistance` and `centreGroup` are exported from `@framesizes/sizes`. Verify `pnpm test` is green.
- [x] 1.2 The user approved rewriting the three existing e2e tests named in the proposal's Impact on 2026-11-16 ("Yes, rewrite them"), and the fourth, F1's outline test, the same day ("Yes, rewrite it"). Only those four may change.

## 2. F2's shared pieces and the backlog (`frames-on-wall`, `site-shell`)

- [x] 2.1 Move `PhotoFlow`, `Picker`, `BackBar`, `ConfirmStep` and `ResetDialog` out of `frames-on-wall.tsx` into exported components, and the photo modes into an exported slice of `state.ts` (design decision 2). Change no behaviour. Verify the F2 unit tests and `e2e/frames-on-wall*.spec.ts` pass unedited.
- [x] 2.2 BL-42, BL-43, BL-44. Read the photo's size from an `<img>` and `decode()` instead of `createImageBitmap`; add `margin: auto` to `.wf-dialog`; centre `.wf-flow` on desktop after checking the F2 canvas. Verify the F2 tests pass unedited and check both dialogs and the flow at 360 and 1280 by hand.
- [x] 2.3 BL-4. With G1 live (task 5.1 on a scratch commit, or `withLive` in a header markup test), add an e2e check that the header fits one row at 320 px with the menu button. Fix the header CSS if it wraps. Verify the existing header tests pass unedited.

## 3. Planner state (`components/gallery-wall/`)

- [x] 3.1 Write `state.test.ts` for the reducer:
  - opening on "One big, two on each side" with the group selected;
  - switching templates, with and without the "replace?" dialog;
  - gap: 2 in, out of range, and the re-layout that clears hand moves;
  - change size with "every other frame of that size" on and off;
  - drag (with the wall), keyboard, the frame's and the group's distances, centring;
  - add up to 12;
  - hangers: All frames, one frame's own, and the carry-over of the type with an empty drop and inset;
  - the photo slice wired in.

  Implement `state.ts` (design decision 3). Verify the tests pass.

- [x] 3.2 Write a unit test pinning the template table's five rows (design decision 7) in both units. Implement the table rows. Verify the test passes.

## 4. The widget

- [x] 4.1 Write a markup test (`renderToStaticMarkup`) for the default state: the drawing's name, the checked template picture, frame buttons A–E, the summary in both units, the group's distances, and no control inside the `role="img"` element. Build the Layout view from boards a–d and "Planner". Verify the test passes.
- [x] 4.2 Build the size change, dragging, keyboard moves, "Add a frame" and the 12-frame note, the warnings and "Centre it on the wall" (boards c, m). Verify against the reducer tests and by hand in `pnpm dev` at 360 and 1280.
- [x] 4.3 Build the Nail marks view (boards e–i): "Hanger for", the type, drop and inset fields, the map with Start and badges, the table and the no-nail lines (design decision 5). Load it with `next/dynamic`. Write a markup test for the hero's table order (1 A, 2 C, 3 D, 4 B, 5 E). Verify it passes.
- [x] 4.4 Wire "Use my wall photo" to F2's photo flow (boards j–l), with the placement on the photo from the engine. Verify by hand with `e2e/fixtures/wall-1200x900.png`.

## 5. The page

- [x] 5.1 Copy the G1 row from the On-page SEO guide into `site-map.ts`: title, h1, description and `lastModified`. Set `live: true`. Move F1's and F2's `lastModified` to today. Write `site-map.test.ts` cases for G1's head values in a new test case. Verify `checkSiteMap` passes.
- [x] 5.2 Build `app/gallery-wall-planner/page.tsx` in the canvas's order:
  - the breadcrumbs and JSON-LD;
  - the `h1` and answer;
  - the widget;
  - steps, the template table, the rules and the questions (using `FAQ`);
  - Related tools through `RelatedTools current="G1" outside={["F1", "F2"]}`.

  Wrap every link to G2, G3 or G4 in `IfLive`. Leave out the shop section and the T24 slot. Verify `pnpm build` prerenders the page statically.

- [x] 5.3 Build `opengraph-image.tsx` for G1 (design decision 9). Verify `pnpm build` writes a 1200 × 630 PNG under 300 KB.
- [x] 5.4 Run the `humanizer:humanizer` skill over all new visitor-facing text (design decision 10). Verify the diff changes wording only.

## 6. End-to-end

- [x] 6.1 Write `e2e/gallery-wall-content.spec.ts`: outline, answer, template table, both units in the HTML, default state, links only to live pages, breadcrumbs and `BreadcrumbList`, the nine social tags and the image, the description against the widget.
- [x] 6.2 Write `e2e/gallery-wall.spec.ts`: template switch with and without the dialog; gap 2 in and out of range; change size; the group 10 in above the sofa; add to 12; the right-edge warning and centring; Nail marks with no drop, then a 2 in drop, then B at 13 in; the type carry-over; cm; the photo flow with the fixture, and no request carrying image data or the file name.
- [x] 6.3 Write `e2e/gallery-wall-phone.spec.ts`: the 360 × 740 first screen; 320 px with no sideways scroll and 44 px controls; CLS 0; axe in the default, nails and warning states.
- [x] 6.4 Rewrite (approved, task 1.2) the four existing e2e tests: `e2e/seo-home.spec.ts` "sitemap.xml lists the home page and F2" to "The home page, F2 and G1 are live"; `e2e/frame-chart-content.spec.ts` "links to F2 and to no page that is not live" to "F2 and G1 are live besides the home page"; `e2e/frames-on-wall-content.spec.ts` "links only to live pages" to "F1, F2 and G1 are live"; `e2e/frame-chart-content.spec.ts` "the server HTML follows the approved outline" to "The outline with F2 and G1 live". Add `withLive` unit tests citing the four replaced scenarios, if none cites them yet. Verify all pass.

## 7. Gate

- [x] 7.1 Run `pnpm fix`, then `pnpm test`, then `openspec validate --all --no-interactive`. Verify all three are green.
- [x] 7.2 Run the On-page SEO guide's pre-publish checklist against `pnpm build && pnpm start` for `/gallery-wall-planner`, with the `seo-audit:seo-page-audit` skill loaded. The affiliate item is not applicable until T21. Verify every other item passes.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review` skill). Fix its findings and log the rest in `docs/backlog.md`. Delete BL-4, BL-42, BL-43 and BL-44 in the PR.
- `/opsx:archive`. Then:
  - re-add Public Interface, Behavior and Edge Cases to `openspec/specs/gallery-wall-planner/spec.md`;
  - add its README row: `apps/web/src/app/gallery-wall-planner/**, apps/web/src/components/gallery-wall/**`.
- Tracker:
  - set T11 to `Done`;
  - add the Log line "G1 Gallery wall planner live: five templates, one gap, group distances, nail marks with per-frame hangers, wall photo; Gallery wall hub live";
  - add to T21: "G1's shop section and the `AffiliateCallout` port with `rel="sponsored nofollow noopener"`".
- Push, open the PR to `main`, name any added `BL-nn`, and turn on auto-merge with a merge commit.

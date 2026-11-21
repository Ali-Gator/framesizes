# Tasks

Branch `t3-actual-size`, cut from `main`. Inside every group the order is tests first, each citing its scenario as `{@link openspec/specs/<capability>/spec.md#<anchor>}`, then code. The approved F3 canvas (CLAUDE.md "Design source", version 18) is the reference for layout and copy. Its Viewer board shows every step. Read the bundled Next.js docs named in a task before writing that code.

## 1. Set-up

- [x] 1.1 The owner approved editing the three existing e2e tests named in the proposal's Impact on 2026-11-21 ("Yes, approve them"). Only those three may change. Verify `pnpm test` is green on the branch before any edit.

## 2. Size engine (`size-engine`)

- [x] 2.1 Write `packages/sizes/src/__tests__/screen.test.ts`:
  - `ACTUAL_SIZES` order and values, including A4 21.0 × 29.7 cm / 8.3 × 11.7 in and A3 29.7 × 42.0 cm / 11.7 × 16.5 in;
  - `CHECK_OBJECTS` edges (card 53.98 / 85.6 mm, Letter 8.5 / 11 in, A4 210 / 297 mm);
  - `scaleFromDiagonal(393, 852, 6.1)` ≈ 153.8, and `null` for 0, a negative or NaN;
  - `guessDiagonal` for 393 × 852 coarse (6.1), 1470 × 956 fine (14, scale ≈ 125.2), 1920 × 1080 fine (23, ≈ 95.8), and a coarse 820 × 1180 tablet (11).

  Implement `screen.ts` and export it from `index.ts` with spec links. Verify the tests pass.

- [x] 2.2 Make `KNOWN_THINGS` read the Letter, A4 and card lengths from `CHECK_OBJECTS[...].long`. Add one test citing "The wall tool still marks long edges". Verify the existing wall tests pass unedited.

## 3. Viewer state (`components/actual-size/state.ts`)

- [x] 3.1 Write `state.test.ts` for the reducer:
  - opens on 8x10 in `view`;
  - `pick`;
  - `see` unchecked goes to the card with `next: "full"`; `see` checked goes to `full`;
  - `done` saves the method and goes to `next`;
  - `skip` keeps the check unset;
  - `cancel` restores the scale;
  - `slide` and `nudge`;
  - `typeDiagonal("abc")` and `0` are ignored;
  - the card example (332.0 px → ≈ 156.2 px per inch);
  - the phone-screens line for 8x10 on 393 × 852 at 153.8 ("About 3.1 phone screens wide and 1.8 tall") and the "fits" line;
  - the visible part on a 1038 × 560 box at 95.8 ("8 × 5.6 in");
  - the sheet offered at 95.8 and not at 125.2 for a 1038 px box.

  Implement `state.ts` (design decision 2). Verify the tests pass.

- [x] 3.2 Write tests for `loadCheck`/`saveCheck`:
  - a round trip;
  - a mismatched `w`, `h` or `dpr` returns nothing;
  - a throwing `localStorage` keeps the check for the page view.

  Implement them (design decision 3). Verify the tests pass.

## 4. The viewer (`components/actual-size/`)

- [ ] 4.1 Write a markup test (`renderToStaticMarkup`) of the server render:
  - the title "8x10 at actual size";
  - seven size buttons with only "8×10" pressed, and no Turn;
  - "8 × 10 in" and "20.3 × 25.4 cm";
  - "Scale is a guess";
  - every control named.

  Build the shared shell, the size grid (4 columns below 640 px), the readout and the status from the canvas. Verify the test passes.

- [ ] 4.2 Build the desktop box, rulers, `SizeMap`, the inline check panel and its four tabs. The sheet tab follows the box's measured width (design decisions 6 and 7). Verify with a DOM test that the box's frame is `8 × scale` wide and that the ruler counts in the picked unit. Check by hand in `pnpm dev` at 1280.
- [ ] 4.3 Build the phone steps:
  - the answer step with the phone-outline map;
  - the card step with its picture and three steps;
  - the ruler step (2 in / 5 cm);
  - the screen-size step;
  - the `<dialog>` actual-size view with mini map, "Drag to see the rest", pinch blocking and the zoom warning (design decision 5).

  Verify with DOM tests: Close and Escape return focus to the "See" button, and a `visualViewport.scale` of 2 shows "Zoomed in, the size is off".

- [ ] 4.4 Add `e2e/actual-size.spec.ts`:
  - at 360 × 740, no size button overflows; the card step's picture, lines and "Done, it matches" are inside the screen; the first "See 8x10 at actual size" opens the card step, then the full view after "Done, it matches"; a reload keeps "Checked with a card";
  - at 1280, the box draws 8x10 at the saved scale, and the sheet tab follows the scale.

  Verify they pass.

## 5. The page (`app/how-big-is-8x10/`)

- [ ] 5.1 Set F3 live in `site-map.ts` with the SEO guide's values:
  - title "How Big Is 8x10? See It at Actual Size";
  - `h1` "How Big Is 8x10?";
  - the guide's description;
  - `lastModified` = the merge date.

  Verify `checkSiteMap` passes.

- [ ] 5.2 Add `e2e/actual-size-content.spec.ts`:
  - the outline;
  - the answer paragraph;
  - the comparison table rows and multiples;
  - no `rel` containing "sponsored";
  - Related tools (`/`, `/frame-sizes-on-wall`, `/gallery-wall-planner`; none to PH1 or Q2);
  - the head: title, canonical and `og:image:alt`;
  - the breadcrumbs with one `BreadcrumbList`;
  - the first screen at 360 × 740.

  Build `page.tsx`, the comparison drawing and table from `ACTUAL_SIZES`, and the six questions (design decision 8). Verify the tests pass.

- [ ] 5.3 Build `opengraph-image.tsx` (read `01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md`) with `ogFonts` and the alt from the proposal. Verify `pnpm build` prerenders it at 1200 × 630.
- [ ] 5.4 Run `humanizer:humanizer` over all new visitor-facing text: copy, headings, FAQ, labels, alts, `aria-label`s, title and description. Keep every size, fact and SEO-guide keyword. Verify the content e2e still passes.

## 6. Live-page counts elsewhere (approved test edits only)

- [ ] 6.1 Re-point three tests to their new scenarios, each adding only the F3 card or URL:
  - `e2e/frame-chart-content.spec.ts` "links to F2 and G1…" → `frame-size-chart` "F2, F3 and G1 are live besides the home page";
  - `e2e/frames-on-wall-content.spec.ts` "links only to live pages" → `frames-on-wall` "F1, F2, F3 and G1 are live";
  - `e2e/seo-home.spec.ts` sitemap test → `seo-base` "The live tools with F3 and the company pages" (nine URLs).

  Verify the three pass.

## 7. Gate

- [ ] 7.1 Run `pnpm fix`, `pnpm test`, `pnpm build` and `openspec validate --all --no-interactive`. Verify each is green.
- [ ] 7.2 Run the SEO guide's pre-publish checklist for F3: items 1–17 that can run before go-live. Log the ones that need the live URL (preview card, Rich Results Test) as backlog items gated on deploy.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review`). Fix its findings, and log what stays unfixed in `docs/backlog.md`.
- `/opsx:archive`. Re-add Public Interface, Behavior and Edge Cases to `openspec/specs/actual-size/spec.md`. Add the `actual-size` row to `openspec/specs/README.md`: `apps/web/src/app/how-big-is-8x10/**, apps/web/src/components/actual-size/**`.
- Update the Tracker: set T3 to Done with the change name, and add a Log line.
- Push, open a PR to `main` naming any backlog ids added, and turn on auto-merge with a merge commit.

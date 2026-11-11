# Tasks

Starts after `t1-site-shell` is merged. Order inside every group: tests first (each citing its scenario as `{@link openspec/specs/<capability>/spec.md#<anchor>}`), then code. Read the bundled Next.js docs named in a task before writing that code. The design system's `bundle.js` / `bundle.css` (artifact linked in CLAUDE.md, "Design source") are the reference for the ported components.

## 1. Set-up

- [x] 1.1 Create branch `t2-frame-size-chart` from an up-to-date `main`; verify T1's rows are in `openspec/specs/README.md` and `pnpm test` is green.
- [ ] 1.2 Read the backlog and fold in any item in this change's area; verify each folded item is named in the PR description.
- [ ] 1.3 Scaffold `packages/sizes` (`package.json` named `@framesizes/sizes` with `exports` to `./src/index.ts` and a `typecheck` script, `tsconfig.json`, an `index.ts` exporting one constant); add it to `apps/web` as `workspace:*` and to `transpilePackages` (read `03-api-reference/05-config/01-next-config-js/transpilePackages.md`); verify `pnpm build` succeeds with `page.tsx` importing the constant, then remove the import.

## 2. Verify the data before pinning it

- [x] 2.1 Check the 12 rectangular and 5 square sizes against the ready-made frame ranges of three US retailers; record each source URL. Verify the result is a table (size × retailer) in the PR description. If a draft size is missing from two of the three, or a size all three sell is missing from the draft, ask the user before changing the list, then correct the delta spec.
- [x] 2.2 Check the mat pairings against pre-cut mat listings for each frame size, and the anatomy constants (1 in moulding as the example, ¼ in overlap); verify every pairing in the delta spec has a source or is corrected the same way as 2.1.
- [x] 2.3 Check the scene constants (8 ft wall, sofa 84 × 34 in, 8 in above the back, person 5 ft 9 in, door 80 × 30 in, 57 in centre line) and the prose facts (large and square size lists, A4 / A3 / 30 × 40 / 50 × 70 / 70 × 100 cm, "two-thirds as wide as the furniture", "a custom frame costs more", "the lip covers the print's edge"); verify each has a source URL or its sentence is reworded to what the source supports.
- [x] 2.4 Correct the F1 description in the On-page SEO guide (docs tools) to the catalog's range, and the "Assumptions to confirm" note beside it; verify the guide and this change's proposal row read the same.

## 3. Size engine

- [ ] 3.1 Write `packages/sizes/src/__tests__/units.test.ts` (cm conversion, the three written forms, a turned size); implement `units.ts`; verify the tests pass.
- [ ] 3.2 Write `frames.test.ts` for the catalog, orientation listing and lookup, next size up, mat image, anatomy and the check record; implement `frames.ts` with the verified data and today's check date; verify the tests pass.
- [ ] 3.3 Write `scene.test.ts` (16x20 above the sofa and beside a person, every size / orientation / reference inside the wall and clear of the reference, the reference sentences in both units); implement `scene.ts`; verify the tests pass.
- [ ] 3.4 Export the public API from `index.ts` with a JSDoc citation on each export; verify `pnpm typecheck` and `pnpm test:unit` (the citation gate) pass.

## 4. Widgets (`apps/web/src/components/ui/`)

- [ ] 4.1 Port `WidgetCard`, `Button` and `ToolCard`; verify with a markup test that the card title is an `h2` and a `Button` with `href` renders an `a`.
- [ ] 4.2 Write the markup test for `SizeTable` (caption, `th scope="row"`, one radio per row in one group, the checked row, `hidden` rows), then implement it with the row styling of design decision 8; verify the test passes.
- [ ] 4.3 Write the markup test for `ScalePreview` (accessible name for sofa / person / door, dimension labels in both units, the ghost and its legend, no ghost when none is passed), then port it on top of `wallScene`; verify the test passes and compare the default drawing with the design system's preview by eye.
- [ ] 4.4 Write the markup test for `SizeCompare` (accessible name, the selected outline, one label per `major` size, no overlapping labels for the catalog's lists), then port it; verify the test passes.
- [ ] 4.5 Port `FAQ` with the question as an `h3` inside `summary`; verify with a markup test that only the first `details` is open.

## 5. The chart widget

- [ ] 5.1 Write `state.test.ts` for `parseChartState` / `chartSearch` (defaults, `size=10x8&view=all`, unknown values, default values left out, fixed parameter order), then implement `components/frame-chart/state.ts`; verify the tests pass.
- [ ] 5.2 Implement `apps/web/src/lib/url-state.ts` (design decision 7); verify with a jsdom test that a `replaceState` write reaches a subscriber and that the server snapshot is the empty string.
- [ ] 5.3 Write `e2e/frame-chart.spec.ts`: default state in the raw HTML, click and keyboard selection, orientation rules, wall view (reference, next size up, largest size), all-sizes view (name, outline click, hidden "Next to"), unit switch, the four URL scenarios; verify they fail.
- [ ] 5.4 Implement `components/frame-chart/frame-chart.tsx` and render it in `page.tsx` in place of the placeholder line; verify 5.3 passes against the production build.

## 6. Page content

- [ ] 6.1 Write `e2e/frame-chart-content.spec.ts` on the raw response: heading outline, the answer paragraph's six sizes, the 19-row table, the six-sizes labels, the four anatomy measurements, five questions with one open, the proof line, no "Related tools" heading and no `href="#…"`; and the unit test that the description's sizes are catalog sizes; verify they fail.
- [ ] 6.2 Implement the answer paragraph, `common-sizes.tsx`, `frame-anatomy.tsx` and the three prose sections from the approved canvas's copy as corrected in group 2, sizes in the search form in sentences; add `IfLive` beside `PageLink` with its markup test; verify the matching 6.1 tests pass.
- [ ] 6.3 Implement `questions.tsx` and the widget footer (wall height, source line, "last checked" from the engine); verify the matching 6.1 tests pass.
- [ ] 6.4 Write the markup test for `related-tools.tsx` with a fixture where P1 is live, then implement it and render it last in `page.tsx`; verify the test and the "no other page is live" test pass.
- [ ] 6.5 Update F1's description and `lastModified` in `apps/web/src/lib/site-map.ts`; verify T1's head tests still pass unedited.
- [ ] 6.6 Add the nested size diagram to `apps/web/src/app/opengraph-image.tsx`; verify T1's image test still passes and check the PNG by eye.

## 7. Layout behaviour

- [ ] 7.1 Write `e2e/frame-chart-layout.spec.ts`: first screen at 390 × 664, pinning at 1280 × 800, 390 × 664 and 375 × 548, keyboard focus under the pinned preview, the two layout-shift scenarios, the six frames' proportions, three differently named drawings; verify they fail or pass for the right reason.
- [ ] 7.2 Implement the pinning and reserved-space CSS (design decisions 9 and 10); verify 7.1 passes and the drawing's labels are at least 12px on screen at 390 × 664.
- [ ] 7.3 Check the page in the iOS Simulator's Safari (portrait, bars showing): first screen, pinned preview while scrolling the table, table scrolling sideways inside its box at this width; verify with screenshots in the PR, or state in the PR that only emulation was available.

## 8. Whole-page checks and hand-over

- [ ] 8.1 Extend the axe test to the three widget states at both viewports; verify no violations, fixing the page (not the test) on any.
- [ ] 8.2 Run `pnpm fix`, then `pnpm test`; verify both are green and `pnpm build` still reports `/` as static.
- [ ] 8.3 Walk all 16 checks of the guide's pre-publish checklist on the built HTML of `/`; record the result per check in the PR description and log anything open as a `BL-nn` item.
- [ ] 8.4 Delete the closed items from `docs/home-page-design.md`; delete the file and its mention in CLAUDE.md's "Design source" when nothing is left; verify no open item is dropped silently (each is closed, in the backlog, or named in the PR).
- [ ] 8.5 Log deliberate gaps as backlog items (for example: the table on a 360px phone, widget analytics events, the 18-card related block on a phone once pages go live); verify `_Next id:_` is bumped.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review` skill), fix findings, log the rest in `docs/backlog.md`.
- `/opsx:archive`; then re-add Public Interface, Behavior and Edge Cases to `openspec/specs/size-engine/spec.md` and `openspec/specs/frame-size-chart/spec.md`, and add the two rows from `design.md` to `openspec/specs/README.md`.
- Tracker: set T2 to Done and add the Log line.
- Push, open the PR to `main`, name the added `BL-nn` ids, turn on auto-merge with a merge commit.

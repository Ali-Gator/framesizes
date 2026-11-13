# Tasks

## 1. Spec deltas

- [x] 1.1 frame-size-chart delta, written in triage: chooser phone rows, nearest-corner clicks, six sizes in two rows, thumb-sized controls

## 2. Fixes, one subagent at a time, serially

Every task below adds new tests only. No existing test is edited (design.md, Decisions 4 and 5).

- [x] 2.1 BL-18: unit tests for a pure `nearestSize` in `apps/web/src/components/ui/__tests__/scale-preview.test.tsx`, as new `it` blocks in a new `describe`:
  - a point 0.2 in up and right of the 8.5x11 corner returns 8.5x11;
  - a point 3 px inside the 24x36 corner returns 24x36;
  - a point more than 3 in from every corner returns `undefined`.
    Cite {@link openspec/specs/frame-size-chart/spec.md#scenario-a-click-near-a-small-outlines-corner} and {@link openspec/specs/frame-size-chart/spec.md#scenario-a-click-far-from-every-corner}.
- [x] 2.2 BL-18: new e2e test in a new file `e2e/frame-chart-phone.spec.ts`. At 390 × 664, with `?view=all`, click 0.2 in (drawn scale, from `getScreenCTM`) up and right of the 8.5x11 rect's top-right corner, then expect the 8.5x11 radio checked ({@link openspec/specs/frame-size-chart/spec.md#scenario-a-click-near-a-small-outlines-corner}).
- [x] 2.3 BL-18: `nearestSize` next to `compareLayout`, one svg `onClick` through `getScreenCTM().inverse()`, and remove the per-rect `onClick`. In `widgets.css`, move `cursor: pointer` from `.cmp` to the svg and drop `.cmp:hover`. Files: `apps/web/src/components/ui/size-compare.tsx`, `apps/web/src/app/widgets.css`. Done when 2.1, 2.2 and the existing `e2e/frame-chart.spec.ts` outline-click test pass.
- [x] 2.4 BL-19, BL-11: new e2e tests in `e2e/frame-chart-phone.spec.ts`:
  - at 390 × 664, 14 visible rows in the portrait list and 5 after choosing Square; every visible `tbody tr` is at least 44 px tall and as wide as `.fs-table-wrap` within 1 px, and `.fs-table-wrap` has `scrollWidth <= clientWidth`; the 27x40 row's height matches with cm stored ({@link openspec/specs/frame-size-chart/spec.md#scenario-the-rows-on-a-phone});
  - a tap (`hasTouch`, `locator.tap()`) on the 11x14 mat cell checks 11x14 ({@link openspec/specs/frame-size-chart/spec.md#scenario-a-row-is-tapped-on-a-phone});
  - the Orientation, Preview and Next to radiogroups are at least 44 px tall, and the Orientation and Preview groups and the Next to row are as wide as the widget's content ({@link openspec/specs/frame-size-chart/spec.md#scenario-the-filters-on-a-phone});
  - at 360 × 640, in inches and again with cm stored, `document.documentElement.scrollWidth <= innerWidth`, and no element inside `.fc` has `scrollWidth > clientWidth` with an overflow of `auto` or `scroll` ({@link openspec/specs/frame-size-chart/spec.md#scenario-the-narrowest-phone}).
    New unit tests in `apps/web/src/components/ui/__tests__/size-table.test.tsx`, as new `it` blocks: explicit `role` on table, row, rowheader, cell and columnheader, and the mat marker present only on cells that hold a mat.
- [x] 2.5 BL-19, BL-11: build the phone picker to boards a–f and design.md "Members". Steps:
  - add the `role` attributes and the mat marker in `size-table.tsx`, with the marker passed from `frame-chart.tsx`;
  - add the `@container (max-width: 599.98px)` block in `widgets.css`, plus a `@media (max-width: 599.98px)` rule `.fs-widget-body:has(> .fc)` that zeroes the body's side padding (full-bleed rows; design.md "Members"): the rows scoped to `tr:not([hidden])` with each line clipped, the radio positioned absolutely against the `tr` (no `display: contents` anywhere), the visible radio and its states, the 44 px full-width filters with "Next to" on one row, the 184 px stage, the two-line 52 px legend, the reference sentence visually hidden, `scroll-margin-top: 287px` (row top at 264px), and the 1px pinned bottom border.
    Files: `apps/web/src/app/widgets.css`, `apps/web/src/components/ui/size-table.tsx`, `apps/web/src/components/frame-chart/frame-chart.tsx`. Done when 2.4 passes and every existing test passes unchanged, in particular in `e2e/frame-chart-layout.spec.ts` (a phone, a short phone, keyboard focus under a pinned preview, layout shift) and in `e2e/frame-chart-a11y.spec.ts` at 390.
- [x] 2.6 BL-12: new e2e test in `e2e/frame-chart-phone.spec.ts`. At 390 × 664:
  - the bottoms of `[data-frame=4x6]`, `[data-frame=5x7]` and `[data-frame=8x10]` are equal within 1 px;
  - the bottoms of 11x14, 16x20 and 24x36 are equal within 1 px and lower;
  - 24x36 is six times as wide as 4x6 within 1 px;
  - the figure has `scrollWidth <= clientWidth`.
    Cite {@link openspec/specs/frame-size-chart/spec.md#scenario-the-six-sizes-on-a-phone}.
- [x] 2.7 BL-12: two row SVGs in one figure: the same `SCALE`, viewBox width `3 × COLUMN`, each trimmed to its tallest frame with its own baseline, each followed by an `ol` of its three labels. The first SVG is named; the second is `aria-hidden`. Rows stack below 640 px and sit side by side on one baseline from 640 px, using `subgrid`. Remove the scroll box, its `tabIndex` and the 720 px minimum. The cm label may wrap (Decision 8), so `e2e/shell-a11y.spec.ts`'s 320 px check passes unchanged. File: `apps/web/src/components/frame-chart/common-sizes.tsx`. Done when 2.6 passes and these pass unchanged: "six frames are drawn at one scale", "three drawings, each with its own name", and the content test's six `li` items and 11×14 label.
- [x] 2.8 BL-10: iOS Safari check.
  - Start the dev server (`.claude/launch.json` "web").
  - Boot an iPhone simulator by name (`xcrun simctl list devices`, then pick an iPhone, not the iPad), open `http://localhost:3000/` in Safari, and check:
    - a tap on each of the three lines of a row selects that row;
    - the pinned block stays at the top while the list scrolls;
    - nothing pans sideways;
    - "All sizes": a tap near the 8.5x11 corner selects 8.5x11;
    - centimetres via the header toggle.
  - Save screenshots for the PR.
  - If the simulator cannot open the page, say so in the PR and leave BL-10 in the backlog with its status corrected. Do not add a WebKit project (Decision 3).

## 3. Verify, delete, review, archive, ship

- [x] 3.1 `pnpm fix`, `pnpm test`, and `pnpm test:e2e` (the full e2e suite, so the unchanged layout and a11y tests run against the phone block)
- [x] 3.2 Delete the shipped bullets BL-10, BL-11, BL-12, BL-18 and BL-19 from `docs/backlog.md` (BL-10 only if 2.8 ran)
- [ ] 3.3 `/code-review high` in a fresh subagent; fix the findings, and log the rest as new BL items
- [ ] 3.4 Before archiving, update the permanent spec's prose that the requirements do not carry (`openspec/specs/frame-size-chart/spec.md`):
  - Behavior: fixed column widths apply from a widget width of 600px; below it the rows are stacked; the label overlay; the `50svh − 112px` stage cap applies only from 600px, with a 184px stage below it.
  - Public Interface: add `nearestSize`.
- [ ] 3.5 Archive (`/opsx:archive` flow, no Tracker), preflight, push, PR to `main` (state in the PR: finger precision on a real iPhone not checked; the owner checks it on their phone), auto-merge with a merge commit

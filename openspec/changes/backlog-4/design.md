# Design

## Lanes

| Id    | Lane | Why                                                                                                                                              |
| ----- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| BL-33 | B    | Scope and approach were the owner's call, and the `<U>` table changes two existing e2e assertions                                                |
| BL-41 | B    | Every option trades something visible (blank digits, duplicate inputs or wrong digits), so the owner chose                                       |
| BL-55 | A    | The approved G1 canvas (Main board) draws "Furniture it suits" as a `num` (monospace) column, so the look is decided; only the width is a defect |
| BL-60 | A    | The approved store graphics canvas already holds the padded 128 icon (`apps/extension/store/store-icon-128.png`)                                 |
| BL-34 | A    | Pure CSS refactor. The bullet names the technique, and the existing focus tests cover all three stage branches                                   |

Skipped for size: BL-50 (lane A). See proposal.md.

Order: BL-34 and BL-33 both edit CSS for `/`, and BL-33 and BL-41 both edit `layout.tsx` and `globals.css`. Running them one after another avoids conflicts: BL-60, BL-55, BL-34, BL-33, BL-41.

## Corrections to the bullets

- **BL-55** says "five columns". The table has four columns (Template, Frames, On the wall, Furniture it suits) and five rows. It also isn't in the 680 px prose column: its wrapper is `max-w-[760px]` (`page.tsx:209`), the same as the canvas.
- **BL-41** says the fields show inch digits with the cm suffix. That's true, and it's worse than a unit flip: a cm visitor reads "8 cm", "32 cm" and "63 cm", which are wrong lengths. G1's gap field and selection fields (`gallery-wall.tsx:676`, `:832`) have the same defect, and it wasn't logged. The fix covers them.
- **BL-33** names the toggle and the table. The F1 preview's legend, sentence, "Next size up" and SVG labels flip the same way. That's logged as BL-61, out of scope.

## BL-60: padded 128 icon

`scripts/extension-icons.mjs` renders `apps/extension/icon.svg` at each size with `.resize(px, px)`, edge to edge. For 128 it renders the art at 96 px, keeping stroke 4.5 from the existing `STROKE` map, and extends it by a 16 px transparent border on each side (sharp `extend` with a transparent background). Rendered in memory this way, the result matches `store-icon-128.png` to a mean absolute difference of 0.41/255. The icons at 16, 32 and 48 stay as they are. The manifest's `action.default_icon.128` points to the same file. Chrome draws the toolbar from 16/32 (48 at most), so padding that entry costs nothing, and no separate unpadded file is kept. Run the script by hand (`node scripts/extension-icons.mjs`) and commit the regenerated PNG.

The test is a new `it` in `apps/extension/src/__tests__/manifest.test.ts`. It loads sharp the way the script does (through `apps/web` and then `next`), reads the 128 PNG's raw RGBA, and asserts:

- alpha is 0 on every pixel in the outer 16 px ring;
- some pixel on the 16 px inset edge is opaque.

Files: `scripts/extension-icons.mjs`, `apps/extension/public/icons/icon-128.png`, `apps/extension/src/__tests__/manifest.test.ts`.

## BL-55: template table fits

The shared `.fs-table` uses `table-layout: fixed` with `col.fs-col-num { width: 146px }`, and `.fs-num` cells and the header don't wrap. "FURNITURE IT SUITS" (about 170 px) and "about 191 cm wide" (about 160 px) overflow 146 px, so `.fs-table-wrap` scrolls by 10–35 px.

The fix is scoped to G1, and the column stays `num` as the canvas draws it:

- Add a hook class on the template table's wrapper in `page.tsx:209`.
- In the G1 route's CSS, let that table's `num` columns size to their content (or widen the last column) and let its header wrap.

The shared rules in `widgets.css` don't change, so F1, F2 and G1's nail table keep their layout.

The new e2e test opens 1280 × 800 in inches and in cm. It asserts `scrollWidth <= clientWidth` on the template table's `.fs-table-wrap`, and that a "Furniture it suits" cell's computed `font-family` is the mono stack. It's modelled on `e2e/frame-chart-phone.spec.ts:44-51`.

Files: `apps/web/src/app/gallery-wall-planner/page.tsx`, the G1 CSS file it imports, a new e2e spec (or a new test in `e2e/gallery-wall-content.spec.ts`).

## BL-34: one phone stage height

A plain custom property won't work. `100cqi` would resolve against a different container at each use: `.fc` for the radio, `.fs-scale` for the stage, which is 32 px narrower. So the steps are:

- Register `--fc-stage-h` with a top-level `@property` (`syntax: "<length>"`, `inherits: true`, `initial-value: 0px`). This is the repo's first `@property`.
- Declare it on `.fc-grid`, a direct child of `.fc`, inside the phone `@container card (max-width: 639.98px)` block. There it computes once against `.fc` as `max(184px, (100cqi - 32px) * 384 / 720)`. Under `@media (min-height: 600px)`, a second declaration wraps that in `min(…, 50svh - 73px)`, keeping the cap conditional.
- The stage switches from `aspect-ratio` plus `max-height` to an explicit `height: var(--fc-stage-h)` and a width derived from it (`min(100%, var(--fc-stage-h) * 720 / 384)` above the 345 px floor branch, centred). Drop `aspect-ratio` here. Keeping it with a definite height sizes `width: auto` from the ratio, which overflows a 328 px stage at the 184 px floor.
- The radio's `scroll-margin-top` becomes `calc(103px + var(--fc-stage-h))`.
- The `@container (max-width: 345px)` query stays, for the svg's `slice` and `overflow: hidden`. It can't read `var()`, so its 345 literal stays.

Rendered sizes don't change, apart from sub-pixel rounding. No test is added or edited. The focus tests at 390 × 664 (`frame-chart-phone.spec.ts:153`), 620 × 800 and 620 × 600 (`frame-chart-wide-phone.spec.ts:92`) and the geometry tests at `:123` and `:131` are the guard, and they must pass unedited. Update the comment at `frame-chart-wide-phone.spec.ts:86` ("the clamp's cap term") only if its wording becomes false. That's a comment, not an assertion.

Files: `apps/web/src/app/widgets.css` (phone block, lines about 617–823).

## BL-33: Units toggle and F1 table from first paint

The toggle:

- `UnitToggle` passes a hook class to `SegmentedControl` (a new optional `className` on its root). `SegmentedControl` stays as it is for every other caller.
- In `globals.css`, `[data-unit="cm"] .fs-units` and `[data-unit="in"] .fs-units` draw the checked look on the matching option, keyed by an attribute each option already carries or a new `data-value`. They override the React `checked` class, so the look follows the head script before hydration.
- `aria-checked`, `tabIndex` and the click handling stay on `useUnit`. After hydration both agree, because `useUnit` and `data-unit` are written together.
- The forced-colors `Highlight` border moves to the same selector, so `e2e/forced-colors.spec.ts:65` keeps passing.
- The extension sets `data-unit` before its first render (`boot.tsx:20`) and imports `globals.css`, so it works there too.

The table:

- `frame-chart.tsx` writes each row's size, other-unit and mat cell with `<U in={…} cm={…} />`, and the second column header as `<U in="Centimetres" cm="Inches" />`. Values come from the size engine's writers, as now.
- `SizeTable`'s `columns[].label` widens from `string` to `ReactNode` and is keyed by index.
- Accessible names drop the `display: none` span, so role-and-name locators keep working.

Before hydration, the toggle looks like cm while `aria-checked` says "in". The site-shell requirement on the server HTML ("Inches SHALL be selected in the HTML the server returns") stays true. The buttons do nothing until hydration anyway.

The test is a new e2e test in the style of `e2e/unit-display.spec.ts`: block `/_next/static/**.js`, store cm, open `/`, and assert the toggle's checked look and the table text from the scenarios. It also edits the two approved tests (Decision 1).

Files: `apps/web/src/components/site/unit-toggle.tsx`, `apps/web/src/components/ui/segmented-control.tsx`, `apps/web/src/components/ui/size-table.tsx`, `apps/web/src/components/frame-chart/frame-chart.tsx`, `apps/web/src/app/globals.css`, `e2e/frame-chart-content.spec.ts`, `e2e/frame-chart.spec.ts`, a new e2e spec.

## BL-41: no inch digits in cm fields

- **Marker.** The head script in `layout.tsx` sets `data-unit-pending` on `<html>` when, and only when, it applies a stored "cm".
- **Hiding.** `globals.css` gets `[data-unit-pending] .wf-num input { color: transparent; }`, or an equivalent that keeps the box and the caret position. Layout is unchanged, so the CLS tests keep passing.
- **Clearing.** A small hook in `lib/unit.ts` runs a `useLayoutEffect` keyed on the rendered unit, and removes the marker once the rendered unit equals `document.documentElement.dataset.unit`. `FramesOnWall` and `GalleryWall` call it. `setUnit` also removes the marker, so any unit change by the visitor clears it in the one place every change passes through.
  - A layout effect runs before the browser paints that commit, so no frame shows inch digits.
  - Clearing on the first `subscribe` is a passive effect and could let one inch frame paint, so it isn't used.
  - Clearing from the header toggle could fire before the widget's own cm render, so it isn't used either.
- **Pages without fields.** The marker stays there until the visitor changes the unit. It only reaches `.wf-num` inputs, so it does no harm. A soft navigation to F2 or G1 mounts the widget, which clears it.
- **Extension.** It never sets the marker: `boot.tsx` sets only `data-unit`. t23's try rows, which reuse `.wf-num`, stay visible.
- **Scope.** G1's gap and selection fields use `.wf-num`, so the same rule covers them with no markup change.
- **Specs.** `frames-on-wall`'s Behavior text ("they render in inches and switch after hydration") and t7 decision 2's "nothing visible moves" get corrected at archive.

The tests are new e2e tests, again with `/_next/static/**.js` blocked and cm stored:

- F2's four fields and G1's gap field show no digit: computed `color` is transparent, or the marker is present and the rule applies.
- After an unblocked load, the marker is gone and the fields read 81/20/160/160 (F2) and 8 (G1).
- No existing test changes.

Files: `apps/web/src/app/layout.tsx`, `apps/web/src/lib/unit.ts`, `apps/web/src/app/globals.css`, `apps/web/src/components/frames-on-wall/frames-on-wall.tsx`, `apps/web/src/components/gallery-wall/gallery-wall.tsx` (one hook call each), a new e2e spec.

The `gallery-wall.tsx` call is one line next to t23's edits. Whichever change merges second resolves that textual conflict.

## Decisions

### 1. BL-33: how the Units toggle and the F1 table show the stored unit before hydration

- (a) The toggle's checked look comes from `[data-unit]` in CSS, for the Units control only. The F1 table's cells and second header use `<U>`. Two existing e2e tests change:
  - `e2e/frame-chart-content.spec.ts:95-100` (and the `row` helper at lines 17–20 that only this test uses): the server-HTML row text now holds both units in `textContent`, so it reads the inch span or the visible text instead. The expected strings are unchanged.
  - `e2e/frame-chart.spec.ts:145`: `toHaveText("Inches")` reads both spans, so it reads the visible header text instead.

  Before hydration, the toggle looks like cm while `aria-checked` says "in". The preview's text still flips (BL-61).

- (b) As (a), plus the preview's HTML text via `<U>`. Same two edits, possibly also `scale-preview.test.tsx`. The SVG labels still flip.
- (c) A pre-hydration marker blanks the toggle look, the table numbers and the preview for cm visitors. No test edits, but the main content goes blank.
- (d) Accept the flip and fix the spec wording only.

Trade-off: (a) reuses the site's `<U>` pattern at the cost of two literal test edits. (c) costs no test edits but blanks content. (d) leaves the units mixed.
Recommendation: (a).
**Answer:** (a), CSS toggle look plus `<U>` table, with the two e2e edits approved (user, 2026-11-19).

### 2. BL-41: how cm visitors see the F2 (and G1) distance fields before hydration

- (a) The head script sets a pending marker only for cm. CSS makes the `.wf-num` input digits transparent under it, keeping layout. The marker clears once the widget has rendered in cm. This covers G1's fields for free, needs no test edits, and the extension never sets the marker. The fields look blank for a moment.
- (b) Two inputs per field, one hidden by `[data-unit]`. No blank moment, but 3–4 test edits, duplicated label and focus logic, and conflicts with t23.
- (c) Accept, and fix the spec wording that contradicts it. Visitors keep seeing "8 cm" briefly.

Recommendation: (a).
**Answer:** (a), hide the field digits until the widget renders in cm, on F2 and G1 (user, 2026-11-19).

## Risks / Trade-offs

- [BL-41's marker never clears if the widget throws before its layout effect] The fields stay blank. The error boundary already replaces the widget in that case, so nothing hides useful digits.
- [BL-34's `@property` support] It's Baseline since 2024 (Chrome 85, Safari 16.4, Firefox 128). The site targets evergreen browsers. If a browser doesn't support it, the property is unregistered: `100cqi` then resolves at each use, and the radio margin is about 32 px too large. That's harmless.
- [BL-33's `ReactNode` labels in `SizeTable`] Typecheck catches the other callers, and they pass strings, which still work.

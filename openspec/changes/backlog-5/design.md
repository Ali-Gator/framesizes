# Design

## Lanes

| Id    | Lane  | Why                                                                                                                                       |
| ----- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| BL-71 | C     | The approved G1 canvas drew the letter exactly as shipped (11 px, top-left corner), so the code didn't drift: the design needed redrawing |
| BL-72 | B + C | Open-ended "rethink and simplify": the direction was the owner's call (Decision 4), then the boards had to be drawn                       |
| BL-61 | B     | Three approaches with visible trade-offs; the chosen one edits an existing unit test                                                      |
| BL-32 | B     | The fix is mechanical, but both forced-colors row tests read the `<tr>` and must read the overlay instead                                 |
| BL-64 | B     | The bullet's own fix is wrong; the chosen fix edits one existing e2e assertion                                                            |
| BL-35 | —     | Investigated, lane B, left out: six fixes exceed the ceiling of five and it ranks last (time cost only). Stays open, untouched            |

Order: BL-32 and BL-61 touch `/` only; BL-71 and BL-72 both edit `gallery.css` and G1, and BL-64 touches G1's reducer. Serial order: BL-32, BL-61, BL-64, BL-71, BL-72. BL-72 goes last so the layout tests measure the final letters and markup.

## Corrections to the bullets

- **BL-61** names `size-compare.tsx`. It needs no change: `SizeCompare` never appears in the server HTML (`useSearch`'s server snapshot is `""` and the default view is `wall`), and the one post-hydration render applies the query and the stored unit together. Its claim that "the SVG labels' layout depends on the unit" is also wrong for `ScalePreview`: the labels' `x`, `y` and `textAnchor` come from geometry. Only `compareLayout` is unit-dependent, and it's moot here.
- **BL-64** says "key the cache by the Blob, not the id". That fails: `readWall` returns new Blob objects on every read, so the cache never hits, every ping makes a new URL (flicker), old URLs can't be revoked (a `WeakMap` can't be listed), and it conflicts with BL-65. The real cause is colliding ids: `addPrint` takes `a${nextId}` from the page's own, possibly stale, copy of the planner (`use-wall.ts:304`, `state.ts:731`). A stale page reuses an id, overwrites `art:<id>` and keeps showing its own cached picture for the other page's print.
- **BL-71** came from the owner as a note, not a bullet; triage gave it an id. The 11 px letter at desktop scale straddles the about 5 px oak moulding (ink on oak is about 3.8:1, below 4.5:1), on a 4x6 at 375 it fills most of a 13 × 17 px frame, and on an unframed print it sits on the photo with nothing behind it.
- **BL-72** came from the owner as a note too. The empty space has no CSS cause: v2 put every editing control in `.g-side` (about 950 px tall with the whole group selected) while `.g-main` holds only the stage and the summary (about 530 px).

## BL-32: forced-colors mark on the overlay

`widgets.css:860-862` gives `tr:has(input:checked)` a `2px solid Highlight` border in the forced-colors block. With `border-collapse: collapse` it beats the cells' 1 px lines and the row grows; on a phone it squeezes the fixed 68 px row and pushes the absolutely placed radio 2 px left. The row's outline can't carry the mark: the focus ring uses it (`-4px` offset in forced colors). Inset `box-shadow` is dropped in forced colors.

The row already has a full-size overlay: `.fs-table tbody label::after` is `position: absolute; inset: 0` against the `position: relative` `<tr>`. The fix moves the `2px solid Highlight` border onto `tr:has(input:checked) label::after` inside the forced-colors block. It takes no layout space, keeps the 0–2 px band, and the existing −4 px focus ring (2–4 px band) still clears it, so the look is unchanged. The radio's `Highlight` fill on a phone stays. Only the selectable `SizeTable` on `/` has radios; F2's, G1's and the nail tables never match `:has(input:checked)`.

Files: `apps/web/src/app/widgets.css` (forced-colors block and its comment), `e2e/forced-colors.spec.ts` (approved edit, Decision 2, plus a new no-shift test modelled on `e2e/frame-chart-phone.spec.ts:45`).

## BL-61: preview in both units

Same mechanism as BL-33: `<html data-unit>` from the head script and `[data-unit="in"] .u-cm, [data-unit="cm"] .u-in { display: none }` in `globals.css`, which also applies to SVG classes.

- Each `<text class="dim-text">` holds two `<tspan class="u-in">` / `<tspan class="u-cm">`. One `<text>` per dimension stays, so `e2e/frame-chart-wide-phone.spec.ts:57` (`toHaveLength(2)`) and the px ≥ 12 loops pass unedited, and hidden tspans don't count in bounding boxes.
- The legend: two `SizeLegend`s, one per unit, each `.fs-scale-size` carrying `u-in` or `u-cm`. Do **not** put `<U>` inside `.fs-scale-size`: the descendant rules `.fs-scale-size span` (`widgets.css:276`, `:595`, `:698`) would style `<U>`'s wrapper spans as the muted other-unit, and the phone rules expect `.fs-scale-size` to be the flex item.
- The reference sentence and the "Next size up" value use `<U>`.
- The `unit` prop stays (keeps the unit test's call sites), even if it ends up unused for text.

Files: `apps/web/src/components/ui/scale-preview.tsx`, possibly `apps/web/src/app/widgets.css`, `apps/web/src/components/ui/__tests__/scale-preview.test.tsx` (approved edit, Decision 1), and a new before-the-scripts e2e in `e2e/unit-display.spec.ts` (or wherever backlog-4's blocked-bundle test lives).

## BL-64: unique print ids

`addPrint` in `apps/extension/src/use-wall.ts` makes the id `a${nextId}-<random>` (8 characters from `crypto.randomUUID()`) and passes it in the action: `{ type: "addPrint", print, id }`. The reducer's `addPrint` case in `apps/web/src/components/gallery-wall/state.ts` uses `action.id ?? \`a${state.nextId}\``and still bumps`nextId`. The same id keys `artUrls`, `pendingArt`and`writeArt`, so the cache and storage stay id-keyed and become correct once ids are unique. Frame letters come from position, and only template ids (`t…`) are parsed, so the new shape is opaque everywhere else. Saved walls with `aN` ids keep loading.

Frames added from the page's own picker (`state.ts:694`) also use `a${nextId}`; they carry no picture, so no URL or `art:` key can collide. Left as is.

The new test needs two extension pages on one wall with the second in the upload step: the e2e scenario in the spec. Unit tests in `apps/extension/src/__tests__/saved-wall-keys.test.ts` and `apps/web/src/components/gallery-wall/__tests__/state-print.test.ts` stay green because `id` is optional.

Files: `apps/extension/src/use-wall.ts`, `apps/web/src/components/gallery-wall/state.ts`, `e2e/extension-try.spec.ts` (approved edit at :260, Decision 3, plus the new two-page test).

## BL-71: letter chips

Approved design: G1 canvas v13 (version id `1795179636-6d31`), board u "Frame letters: today and proposed", and the chips on boards n–t. The stage's `.g-letter` span (`stage.tsx:234-238`) and the nail map's (`nail-marks.tsx:109`) stay; only CSS changes, in `gallery.css`:

- `.wf-frame` and `.g-mframe` get `container-type: size` (scoped to G1: `.g-app .wf-frame`, so F2 and the extension's hang view are untouched; neither renders `.g-letter`).
- `.g-letter` centred (`left: 50%; top: 50%; transform: translate(-50%, -50%)`), mono 600, `font-size: clamp(12px, 28cqmin, 20px)`, `line-height: 1`, padding 2 px 4 px, `min-width: 1.5em`, 1 px `--line-strong` border, radius 4 px, `--paper` background, `--ink` text, `pointer-events: none`.
- Selected: `.wf-frame.is-sel .g-letter` ink background, paper text, ink border.
- Nail map: the same chip; `.g-mframe.is-scope .g-letter` gets an ink border.

The extension imports `gallery.css`, so its panel and tab get the chips too. A frame smaller than the chip (a 4x6 on a phone) is covered by it; the canvas accepts that.

## BL-72: balanced columns

Approved design: G1 canvas v13, boards n "v3 desktop 1088: whole group", o "frame A selected", p "wall photo, group past the edge", q "picker open", r "Nail marks", s "phone 360: whole group", t "phone 360: frame B changed to 4x6", and the note "DECISION (v3, BL-72)".

In `LayoutView` (`gallery-wall.tsx`), the template fieldset, the gap row and its note, and the `.wf-actions` row move out of `.g-side` into a new `.g-set` block in `.g-main`, right after the summary. `.g-set` is a column with 16 px gaps, 16 px top padding and a 1 px `--line` top border. `.g-side` keeps the Select chips and the selection block (with its "Sizes in this layout" list and distances). While the picker is open it replaces the side column as now, and `.g-set` hides. Class names, labels, props and exports stay, so the extension's imports, `e2e/extension.spec.ts:215-219` (side right of main) and every label-based test pass unedited. The Nail marks view (`nail-marks.tsx`) keeps its split.

## Decisions

### 1. BL-61 — how the scale preview shows the stored unit before hydration

Options:

- (a) Both units in the HTML: dimension labels as `<tspan class="u-in|u-cm">` inside each `.dim-text`, `<U>` for the reference sentence and "Next size up", two `.fs-scale-size` legends carrying `u-in` / `u-cm`. Reuses the BL-33 `data-unit` CSS. Edits the existing unit test `apps/web/src/components/ui/__tests__/scale-preview.test.tsx:39-50` ("labels the dimensions in the visitor's unit") to read the `.u-in` / `.u-cm` tspan instead of the whole `<text>`; same expected strings.
- (b) Hide the preview labels while `data-unit-pending` is set. No test edits, but blanks main content — the owner rejected this in backlog-4 Decision 1(c).
- (c) Accept the flip and write it into the spec.

Trade-off: (a) costs one approved unit-test edit and a slightly larger DOM; (b) and (c) leave a visible defect.
Recommendation: (a) — same mechanism as BL-33, no blank moment, crawlable.
**Answer:** (a) both units in the HTML; the edit to `scale-preview.test.tsx:39-50` is approved (user, 2026-11-20)

### 2. BL-32 — approve the forced-colors e2e edit

The fix moves the selected row's forced-colors `Highlight` border from the `<tr>` to the existing `label::after` overlay (`widgets.css:860-862`), so it takes no layout space. The two row tests in `e2e/forced-colors.spec.ts` (desktop :31-50, phone :53-62) read `getComputedStyle(tr)` and must read the selected row's `label::after` instead, keeping the same checks (mark present, absent on other rows, focus ring inset ≥ mark width). A new no-shift test is added.

Options: approve the edit / leave BL-32 for later.
Recommendation: approve — the tests keep the same intent; only where the mark lives changes.
**Answer:** approve — the edit to the two row tests in `e2e/forced-colors.spec.ts` is approved (user, 2026-11-20)

### 3. BL-64 — how to stop two extension pages sharing a print's picture

The bullet's own fix (key the URL cache by Blob) is wrong: Blobs read from IndexedDB are new objects each load, so the cache never hits, URLs leak and pictures flicker. The real cause is colliding print ids (`a${nextId}` from a stale page), which also lets one page overwrite the other's stored `art:<id>`.

Options:

- (a) Each added print gets an id unique to the page that adds it (`a${nextId}-<random>`), passed into the reducer's new optional `action.id`. Fixes the screen and the storage overwrite. Edits the existing assertion `e2e/extension-try.spec.ts:260` (`storedKeys` equals `["art:a1","current"]`) to match `art:` + the print's id.
- (b) Key the cache by id plus a content stamp. Fixes only the screen; the stored picture can still be overwritten.
- (c) Key by Blob, as the bullet says. Rejected (above).

Recommendation: (a).
**Answer:** (a) unique print ids; the edit to `e2e/extension-try.spec.ts:260` is approved (user, 2026-11-20)

### 4. BL-72 — direction for the G1 layout redesign

Today every control sits in the right column (`.g-side`, ~900–950 px tall at 1280) while the left column ends at "Get nail marks" (~530 px), leaving ~400 px of empty space on the first screen.

Options:

- (a) Balanced two columns, no control removed: templates, gap and the actions row (photo, Add a frame, Start over) move under the wall in the left column; the right column keeps only Select chips and the selection block. Both columns end near ~720 px. Phone order barely changes ("Use my wall photo" moves up). No existing test edits.
- (b) Toolbar over the wall: templates as a compact picker, gap stepper and Photo / Add / Start over in a toolbar above the stage; per-frame chips dropped ("All N" kept by the stage); "Get nail marks" folded into the header switch. Simpler-looking, but changes spec text and several e2e tests, and risks the 360 first-screen test.

Recommendation: (a) — removes the empty space and shortens the side column without dropping features or touching tests; (b) can follow later if (a) still feels busy.
**Answer:** (a) balanced two columns (user, 2026-11-20)

## Approved designs (lane C)

- **BL-71:** G1 canvas https://claude.ai/artifact/HGW1ti5mv6Mc8BqPRepXGd, version 13 (`1795179636-6d31`), board u "Frame letters: today and proposed", note "DECISION (v3, BL-71)". **Approved:** user, 2026-11-20.
- **BL-72:** same canvas and version, boards n–t (`Planner2`, `V3-Frame`, `V3-Warn`, `V3-Picker`, `V3-Nails`, `V3-Phone`, `V3-PhoneSmall`), note "DECISION (v3, BL-72)". **Approved:** user, 2026-11-20.

The v2 boards (a–m, the 1088 Planner board and the page boards) stay on the canvas unchanged as the record of what shipped before.

# Design

## Context

The frame chart widget (`frame-size-chart`, route `/`) was designed and tested at desktop width and checked on phones only in Chromium emulation. On a 390px phone the widget's content is about 324px wide. The size table keeps `min-width: 600px` (`widgets.css` `.fs-table`), so it pans sideways inside its box. The filters use the 36px `md` segmented size. In the all-sizes drawing a size can be clicked only on the strip outside every smaller transparent outline, which is 2–4px for 8.5x11, 5x7, 12x16 and 12x18. The six common sizes block keeps a 720px minimum and scrolls sideways. The phone board on the home canvas (`Phone.dc.html`) only reflows the desktop page, so no phone picker was ever drawn before this batch.

## Goals / Non-Goals

**Goals:** every size is an easy thumb tap on a phone; nothing in the widget or the six-sizes block scrolls sideways at 360px; the all-sizes drawing picks the size the visitor aimed at; the phone layout is checked in Safari.

**Non-Goals:** any change at 600px and wider for the picker, or at 640px and wider for the six sizes; dark theme (BL-2); changing the design-system bundle itself (logged as a new item); a WebKit project in CI (Decision 3).

## Lanes

| Id    | Lane | Why                                                                                                                                                                    |
| ----- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BL-19 | C    | No phone picker existed in the design source. The owner drew boards a–f and the short-phone board, approved 2026-11-13.                                                |
| BL-11 | C    | Its trigger (phone usage evidence) fired with the owner's iPhone report. The BL-19 boards replace the sideways table, so the same design fixes it.                     |
| BL-12 | C    | "One baseline" in the spec allowed no two-row layout. Board "Phone 375 — six common sizes" was approved 2026-11-13.                                                    |
| BL-18 | B    | Picking the nearest corner still leaves the smallest target at about 9px, so the alternative of dropping taps on phones was the owner's call. Decided: nearest corner. |
| BL-10 | B    | The tool for the Safari check was the owner's call (a WebKit CI project or the simulator). Decided: iPhone simulator.                                                  |

## Members

**BL-19 + BL-11: phone size picker.** Under `@container (max-width: 599.98px)` on `.fc`, `widgets.css` restyles the existing table into the board's rows. The rows are full-bleed, as on the boards: the widget body's side padding goes to 0 for the chart's card, and the pinned block, the filters and the hint line carry their own 16px. The body is an ancestor of `.fc`, so the container query cannot reach it; use a `.fs-widget-body:has(> .fc)` rule under `@media (max-width: 599.98px)`. Without this, the widget is about 294px wide at 360 and "68.6 × 101.6 cm" next to "27 × 40 in" does not fit on line 1. The table loses its `min-width` and border, and the `thead` is visually hidden. Each visible `tr` (the rule is scoped to `tr:not([hidden])`) becomes a grid of three lines, `68px` tall, with padding `0 16px 0 20px` and a top border. Inside it:

- the `th` label shows the size at 17px mono;
- the other-unit cell sits beside it at 13px muted;
- the mat cell is line 2 at 13px muted, prefixed "With a mat: " by CSS `::before` on cells that hold a mat;
- the use cell is line 3 at 13px.

Lines do not wrap; they clip with an ellipsis (`overflow: hidden` on each line), so no width under 600px can make the table's box scroll. The `th` stays the line-1 grid item; never `display: contents` on it or on any cell, because WebKit drops such cells from the accessibility tree whatever their `role`. The radio, which lives inside the `th`, becomes visible and is positioned absolutely against the `tr` (already `position: relative`), vertically centred, 16px from the right edge, with the text lines leaving room for it: `appearance: none`, a 22px circle, and a 5px ink dot when checked. A selected row gets the tape fill and a 4px ink bar; a pressed row (`:active`) gets the stage fill; keyboard focus gets a 2px focus outline inset 4px. The filters stack with an 8px gap, and each segmented track is 44px tall and full width with equal options. Orientation and Preview keep only their accessible names. "Next to" keeps its visible label beside the control on one row, hidden with `visibility` in the all-sizes view.

The pinned block (preview stage plus legend) uses padding `12px 16px 8px`, a fixed `184px` stage height and a 52px legend of two lines. Line 1 is the size and the other unit. Line 2 is the next-size line, or the "N sizes from one corner" line in the all-sizes view. The reference sentence is kept for screen readers only (Decision 6). Radios get `scroll-margin-top: 287px`: the row's top stops at 264px, below the 257px pinned block, and the radio is centred 23px below the row's top. The radio draws no focus ring of its own; the row's inset outline is the ring. The short-phone rule (pinned only from 600px of viewport height) is unchanged.

In `size-table.tsx`, the `table`, `tr`, `th` and `td` elements get explicit `role` attributes (`table`, `row`, `rowheader`, `cell`, `columnheader`), because WebKit drops table semantics once `display` changes. The mat cell is marked (for example `data-mat`) so CSS can tell a mat size from "No mat". Files: `apps/web/src/app/widgets.css`, `apps/web/src/components/ui/size-table.tsx`, `apps/web/src/components/frame-chart/frame-chart.tsx` (mat cell marker, if passed per cell).

**BL-12: six common sizes in two rows.** `common-sizes.tsx` draws two SVGs: 4x6, 5x7 and 8x10 in one, and 11x14, 16x20 and 24x36 in the other. Both use `SCALE` and a viewBox `3 × COLUMN` wide, so the two rows share one scale by construction. Each viewBox is trimmed to its own tallest frame, and each SVG draws its own baseline. Each SVG sits in a row element followed by an `ol` of its three labels, so labels sit under their frames, which also fixes today's 10px label drift. Both rows are inside one `figure`. Below 640px the rows stack. Below 640px the cm label is 12px, as on the board, so it stays on one line at 390. The cm label may wrap below about 360px (Decision 8); at 320 three columns are about 88px wide and "27.9 × 35.6 cm" is about 101px on one line. From 640px they sit side by side on one baseline (a two-row grid with `subgrid`, SVGs aligned to the end of the first track). The sideways scroll box, its `tabIndex` and the 720px minimum go. Files: `apps/web/src/components/frame-chart/common-sizes.tsx`.

**BL-18: nearest corner.** A pure `nearestSize(layout, x, y)` next to `compareLayout` in `size-compare.tsx` returns the id of the size whose top-right corner `(x0 + w·scale, base − h·scale)` is nearest to a point in stage units. It returns `undefined` when that distance is more than `3 · scale`. One `onClick` on the svg converts the client point with `getScreenCTM().inverse()`; the per-rect `onClick` goes. `cursor: pointer` moves from `.cmp` to the svg, and `.cmp:hover` is dropped, because it would light the topmost rect while the click picks another. The rects keep `data-size`. Files: `apps/web/src/components/ui/size-compare.tsx`, `apps/web/src/app/widgets.css`.

**BL-10: Safari check.** After the fixes pass the gates, run the dev server and open `/` in Safari on an iPhone simulator (`xcrun simctl`, an iPhone device by name; the default booted device on this Mac was an iPad Air, whose `open_url` timed out). Check four things: a tap on each line of a row selects that row, the pinned block stays at the top while the list scrolls, nothing pans sideways, and a tap near the 8.5x11 corner in "All sizes" selects it. Record the screenshots in the PR. Neither the simulator nor emulation proves finger precision; the owner's own iPhone is the final check, and the PR says so.

## Decisions

1. **Who draws the phone boards (BL-19, BL-11, BL-12).** Options: the agent draws them on the home canvas, or the owner draws them. Trade-off: speed against the owner's own hand on the look. Recommended: the agent.
   **Answer:** the owner draws them (user, 2026-11-13). Boards drawn and approved; see "Approved boards".

2. **All-sizes taps on phones (BL-18).** Options:
   (a) the nearest top-right corner; the smallest target grows from about 2px to about 9px; no existing test changes.
   (b) no taps in the drawing on phones; the list is the only chooser there; this removes a specified behavior and one e2e test.
   The nearest edge was rejected: it drops 11x17 to 4.4px. Recommended: (a).
   **Answer:** nearest corner (user, 2026-11-13).

3. **How to check Safari (BL-10).** Options: a Playwright WebKit project for one new phone spec in CI (a browser download, extra CI minutes per push), or a manual check in the iPhone simulator. Recommended: WebKit in CI.
   **Answer:** "I installed xcode and add simulator in you" (user, 2026-11-13). Read as the simulator check, with no WebKit project in CI.

4. **One chooser on phones: restyle the table, not a second list (agent, technical).** The board draws the rows as a `fieldset` of labels. Rendering that next to the table would put two radio groups for one choice in the page, against the one-group rule. Hiding one of them per width would duplicate the server HTML. Restyling the table keeps one radio group and the server HTML, so `frame-chart-content.spec.ts`, `size-table.test.tsx` and every e2e helper on `tbody` keep working. The cost is ARIA roles on the table elements. The board's "Pick a size" legend is covered by the existing hint line, which stays.

5. **Six sizes: one accessible name for two row drawings (agent, technical).** The board names the whole comparison once ("Six common picture frame sizes from 4x6 to 24x36 inches compared at the same scale") and hides the frames from assistive tech. So the first row SVG carries that name with `role="img"`, and the second is `aria-hidden="true"`. The labels list all six sizes in text. This keeps "three named drawings" (`e2e/frame-chart-layout.spec.ts` "three drawings, each with its own name"), the name-prefix lookup and the six `li` items in one `figure` (`e2e/frame-chart-content.spec.ts`), and the `[data-frame]` proportion test, all unchanged. No existing test edit is needed, so none was asked for.

6. **Phone legend copy (agent, technical).** The board's legend line 2 reads "Dashed: next size up, 18 × 24 in" and "The largest size in the chart". The widget keeps its existing "Next size up: 18 × 24 in" with the dashed-box icon, which says "dashed" already, so one string serves every width and the existing scenario. No text replaces it for the largest size. The reference sentence ("Hung 8 in above a sofa…"), which the board leaves out on phones, stays in the DOM but is visually hidden, so the requirement that the reference is stated in a sentence still holds for screen readers.

7. **Pinned shadow (agent, technical).** The board shows a bottom border and a shadow on the pinned block only while it is stuck. CSS cannot tell "stuck" in every browser without script. The phone block always draws the 1px bottom border and no shadow.

8. **Six sizes: the cm label wraps on the narrowest phones (agent, technical).** The board sets the cm label to `nowrap`. Without the scroll box, that overflows the page at 320px, which the existing `e2e/shell-a11y.spec.ts` check of the document's `scrollWidth` at 320 forbids. The cm label wraps instead.

## Approved boards

Canvas: Frame Sizes — Main Page, https://claude.ai/artifact/FA2okr9myNhQiZsaGdeuMD, version `1794568306-f1d0`. Boards:

- `Picker.dc.html` "a · Default — wall, 16 × 20 in"
- `PickerScrolled.dc.html` "b · Scrolled — preview pinned"
- `PickerCm.dc.html` "c · Centimetres — 27x40"
- `PickerSquare.dc.html` "d · Square"
- `PickerAll.dc.html` "e · All sizes view"
- `PickerRows.dc.html` "f · Row states"
- `CommonSizes.dc.html` "Phone 375 — six common sizes"
- `PickerShort.dc.html` "Phone 375×548 — short phone, preview scrolls away"

**Approved:** the owner (user), 2026-11-13, recorded by the designer in CLAUDE.md "Design source". Decisions 4–8 are where the build deliberately differs from the boards. **Departures approved:** the owner accepted Decisions 4–8 as documented (user, 2026-11-13).

## Corrections to the bullets

- BL-10 says "this Mac has no full Xcode". As of 2026-11-13 Xcode is installed (`xcode-select -p` is `/Applications/Xcode.app/...`) and iOS 27.2 simulators exist.
- BL-11 suggests dropping only the second unit column under 480px. That still overflows: two fixed 146px columns are 292px before "Common use" gets any room. The stacked rows replace the idea.
- BL-18 suggests the nearest edge. Measured on the portrait list, the nearest edge drops 11x17 to a 4.4px target, because outlines share edges. The nearest top-right corner keeps every size at 8.9px or more.
- Two investigators reported `components/ui/**` and `widgets.css` as unmapped in `openspec/specs/README.md`. That is by design: CLAUDE.md exempts both from the spec hook.

## Risks / Trade-offs

- **WebKit table semantics.** `display: grid` on `tr` strips the table role in WebKit. The explicit ARIA roles restore it; VoiceOver was not checked.
- **Fixed 68px rows** truncate text that does not fit with an ellipsis. The longest use string, "Letter-size documents and diplomas", fits at 13px in about 280px; the full text stays in the DOM.
- **Design-system drift.** `widgets.css` is a diffable port of the design-system bundle. The phone block exists only in the port until the design system gains it (new backlog item).
- **Finger precision is unproven** by any automated or simulated check.

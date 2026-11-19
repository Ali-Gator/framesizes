# Proposal

## Why

A visitor who chose centimetres still sees inches before React loads. The Units toggle and the home page table say "in", and the F2 and G1 distance fields show inch digits next to a "cm" label ("8 cm" where 20 cm is meant). G1's template table scrolls sideways on every desktop width. The extension's 128 px icon fills its whole square, and Chrome shows it in the install dialog, where it needs a clear border. And the phone `scroll-margin-top` on `/` rebuilds the stage height by hand, so it drifts the moment either one changes.

## What Changes

- **Units toggle and F1 table from first paint (BL-33).**
  - The header's Units toggle takes its checked look from `<html data-unit>` in CSS. `aria-checked` and focus still follow React.
  - The F1 table's size, other-unit and mat cells and its second column header ("Inches" / "Centimetres") write both units with `<U>`, so the head script's unit shows before paint.
  - The preview's text is out of scope and logged as BL-61.
- **No inch digits in cm fields (BL-41).** When the head script applies a stored "cm", it also sets a pending marker on `<html>`. CSS hides the digits in `.wf-num` fields while that marker is set, without changing layout. The widget clears the marker once it has rendered in the stored unit. This covers F2's four distance fields and G1's gap and selection fields, which share the class. The extension never sets the marker.
- **G1 template table fits its column (BL-55).** The five-row, four-column table "Gallery wall layout with sizes" no longer scrolls sideways at desktop widths. "Furniture it suits" keeps the monospace look the approved canvas draws.
- **Padded 128 icon (BL-60).** `scripts/extension-icons.mjs` renders the 128 px icon as 96 px of art inside a 16 px transparent border, matching `apps/extension/store/store-icon-128.png`. `icon-128.png` is regenerated.
- **One stage height on the phone (BL-34).** A registered custom property holds the phone stage height. The stage and the focused row's `scroll-margin-top` both read it. Nothing rendered changes.

## Members

| Id    | Title                                               | Lane                                                                                     |
| ----- | --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| BL-33 | Units toggle and table say inches until hydration   | B, decided: CSS toggle look plus `<U>` table; two e2e edits approved (Decision 1)        |
| BL-41 | F2 distance fields show inch digits until hydration | B, decided: hide field digits behind a head-script marker; F2 and G1 fields (Decision 2) |
| BL-55 | G1 template table scrolls sideways                  | A, the approved G1 canvas keeps the column monospace                                     |
| BL-60 | Pad the manifest's 128 icon before publishing       | A, the approved store icon is the target                                                 |
| BL-34 | Phone `scroll-margin-top` rebuilds the stage height | A                                                                                        |

**Parked:** none.

**Skipped for size:** BL-50 (G1 copies small helpers from F2). It's fixable now (lane A), but the batch was already at its ceiling of five. It touches the same G1 files as t23-try-on-my-wall task group 4, so it should land before that group starts. Its bullet is unchanged.

**Base branch:** `22bca20` on `t23-try-on-my-wall`, which is `origin/main` (`4d2446a`) plus the commit that logged BL-60. `main` doesn't have BL-60 yet. The batch branch is `backlog-4`.

**Backlog ids:** this triage logged BL-61 and moved `_Next id:_` to BL-62. t23-try-on-my-wall branches from the same counter (its tasks.md says "BL-60 and on", which is now out of date). Whichever change merges second renumbers its new items from the counter it finds, rather than reusing an id.

**Overlap with t23-try-on-my-wall:**

- Source: none. BL-41's CSS rule reaches G1's fields without editing `gallery-wall.tsx`.
- Specs: none. Every delta here is `ADDED`, and t23 modifies no requirement this batch touches.
- t23's try view reuses `.wf-num`. The extension never sets the pending marker, so the rule can't hide those fields.

**Approved test edits:** two, both from Decision 1 (user, 2026-11-19).

- `e2e/frame-chart-content.spec.ts`, "the whole table is in the server HTML" (lines 95–100). It reads `textContent`, which will hold both units. It changes to read the inch span or visible text, and its expected strings stay the same.
- `e2e/frame-chart.spec.ts:145`. `toHaveText("Inches")` reads both header spans. It changes to read the visible header text.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `site-shell`: the Units toggle shows the stored unit from first paint, and a stored cm choice sets a pending marker until the widgets render in cm.
- `frame-size-chart`: the table shows the stored unit from first paint.
- `frames-on-wall`: the distance fields show no inch digits to a cm visitor.
- `gallery-wall-planner`: the gap and selection fields show no inch digits to a cm visitor, and the template table fits its column without sideways scrolling.
- `gallery-wall-extension`: the 128 px icon has a 16 px clear border.

## Impact

- `apps/web/src/app/layout.tsx` (head script marker), `apps/web/src/lib/unit.ts` or the field components (clearing the marker), `apps/web/src/app/globals.css` (toggle look, field digits).
- `apps/web/src/components/site/unit-toggle.tsx` and `apps/web/src/components/ui/segmented-control.tsx` (a hook class for the Units control only).
- `apps/web/src/components/frame-chart/frame-chart.tsx`, plus `apps/web/src/components/ui/size-table.tsx` (column labels take a ReactNode).
- `apps/web/src/components/frames-on-wall/frames-on-wall.tsx`, `apps/web/src/components/gallery-wall/gallery-wall.tsx`: only if the marker is cleared from the widget (see design.md).
- `apps/web/src/app/gallery-wall-planner/page.tsx` and a G1 CSS file (template table).
- `scripts/extension-icons.mjs`, `apps/extension/public/icons/icon-128.png`.
- `apps/web/src/app/widgets.css` (phone stage height).
- Specs: the behaviour text in `frame-size-chart` and `frames-on-wall` ("re-render once with the stored unit" / "render in inches and switch after hydration") gets fixed at archive.
- Backlog: BL-33, BL-34, BL-41, BL-55 and BL-60 are deleted when this ships.

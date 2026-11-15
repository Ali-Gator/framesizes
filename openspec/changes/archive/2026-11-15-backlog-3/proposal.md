# Proposal

## Why

The in/cm toggle changes only the widget. Every other number on `/` shows both units or inches only, so a visitor in centimetres still reads "8 ft (244 cm)", inch-only anatomy measurements and a cm line under every card. Three widget defects showed up in the backlog-1 and backlog-2 reviews:

- The phone preview crops tall frames once the phone is wider than about 411px.
- Labels on a height-capped one-column stage drop to about 7px.
- In Windows High Contrast the selected size and the selected toggle option have no visible mark.

Running `pnpm test:e2e` while `pnpm dev` is up also fails on Next's dev lock.

## What Changes

- **One unit at a time on `/` (BL-30).** `<html>` carries `data-unit`. An inline head script sets it from storage before first paint, and `setUnit` and the cross-tab `storage` path keep it current. The server HTML holds both units. CSS shows the visitor's unit and hides the other, so cm stays crawlable. Inches show when nothing is stored.
  - The six common-size cards drop their cm line in inches and show it in cm.
  - The frame-anatomy example gains cm values (33 × 40.6, 27.9 × 35.6, 19.1 × 24.1, 20.3 × 25.4 cm), and "¼ in smaller" becomes "0.6 cm smaller".
  - The wall note reads "8 ft" or "244 cm".
  - The chart table and the questions' cm answer are unchanged.
  - Every value comes from the size engine.
- **Phone stage shows the whole drawing (BL-28).** Once the phone stage is wider than 345px, it grows to the drawing's own ratio (720:384), capped so the pinned block stays in the upper half. The focused-row `scroll-margin-top` follows the stage's height. At 360, 375 and 390 nothing changes.
- **Legible labels on a capped stage (BL-29).** `.fs-scale-stage` becomes its own inline-size container. A capped one-column stage 520px wide or less draws its labels at 26 stage units, about 12.7px at 800 × 600.
- **Selection survives forced colors (BL-24).** A `forced-colors: active` rule outlines the selected table row in a system colour and gives the phone radio's checked dot a system-colour fill. The shared `SegmentedControl` marks its checked option the same way, which covers Orientation, Preview, Next to and the header Units toggle.
- **e2e gets its own build folder (BL-6).** The port-3100 Playwright server sets `NEXT_DIST_DIR=.next-e2e`, and the ignore and tsconfig lists learn the folder, so e2e runs beside `pnpm dev`.

## Members

| Id    | Title                                        | Lane                                                                          |
| ----- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| BL-30 | Home page shows one unit at a time           | B, decided: F1 UNITS boards approved; one footer assertion edit approved      |
| BL-28 | Phone stage crops tall frames on wide phones | B, decided: grow to full ratio above a 345px stage, capped to the upper half  |
| BL-29 | Small labels on a capped one-column stage    | B, decided: stage is a container; 26-unit labels on capped stages up to 520px |
| BL-24 | Selected size in forced-colors mode          | B, decided: size table plus `SegmentedControl`; hub-nav logged as BL-31       |
| BL-6  | Local e2e fails while a dev server runs      | A                                                                             |

**Parked:** none.

**Base branch:** `origin/main` at `17ab093`. The batch branch is `backlog-3`. BL-30 was logged in the t7-wall-engine checkout and has not been committed there yet. This branch carries the same bullet and the same `_Next id:_` bump. BL-31 was logged on this branch at triage.

**Overlap with t7-wall-engine:** none in source. Its uncommitted `docs/backlog.md` hunk adds BL-30. Once this batch deletes BL-30, merging t7 with that hunk would add it back without a conflict, so t7 should drop the hunk before it commits.

**Approved test edits:** one. In `e2e/frame-chart-content.spec.ts`, the test "the widget footer says where the sizes come from" changes `expect(widgetFooter).toContain("8 ft (244 cm)")`. It now checks that the footer holds "8 ft" and "244 cm" (design.md, Decision 1). Its other assertions stay unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frame-size-chart`:
  - the six common sizes, the anatomy example and the proof line follow the site's unit;
  - the phone preview shows the whole drawing;
  - labels on a capped one-column stage are legible;
  - the selected size stays marked in forced colors.
- `site-shell`:
  - the unit is on `<html>` before first paint;
  - the segmented control's selected option stays marked in forced colors.

## Impact

- `apps/web/src/app/layout.tsx`: an inline head script and `suppressHydrationWarning` on `<html>`.
- `apps/web/src/lib/unit.ts`: `setUnit` and `onStorage` mirror the unit onto `document.documentElement.dataset.unit`.
- `apps/web/src/app/globals.css`: the `data-unit` show and hide rules.
- `apps/web/src/components/frame-chart/common-sizes.tsx`, `frame-anatomy.tsx` and `chart-footer.tsx`: in and cm pairs.
- `apps/web/src/app/widgets.css`:
  - the phone stage height and `scroll-margin-top`;
  - the stage as a container and the capped-stage label size;
  - the forced-colors rules.
- `apps/web/src/components/ui/segmented-control.tsx`: a forced-colors mark on the checked option.
- `playwright.config.ts`, `apps/web/next.config.ts` (comment only), `.gitignore`, `.prettierignore`, `eslint.config.mjs`, `vitest.config.ts`, `apps/web/tsconfig.json`: the `.next-e2e` folder.
- Tests: new unit and e2e tests, plus the one approved edit above.
- Routes: `/`, plus the `<html>` attribute and the Units toggle on every page.

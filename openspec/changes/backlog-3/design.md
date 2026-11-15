# Design

## Lanes

| Id    | Lane | Why                                                                                                            |
| ----- | ---- | -------------------------------------------------------------------------------------------------------------- |
| BL-30 | B    | The design was drawn in another session and needed the owner's approval here; one existing e2e literal changes |
| BL-28 | B    | backlog-1's approved boards fix the phone stage at 184px, so growing it was the owner's call                   |
| BL-29 | B    | The bullet's own fix gives about 10.8px, under the 12px phone floor, so the target size was the owner's call   |
| BL-24 | B    | Scope: the shared segmented control has the same defect, worse, so the owner chose how wide the fix goes       |
| BL-6  | A    | Config only; the analytics server already shows the pattern                                                    |

Order: BL-28 and BL-29 both edit `.fs-scale-stage` and the label cascade in `widgets.css`, so they run one after the other, BL-28 first. BL-24 also edits `widgets.css` and runs after them. All fixes run serially anyway.

## BL-30 — one unit at a time on `/`

The unit lives in React state only, so the server sections (`CommonSizes`, `FrameAnatomy`, `ChartFooter`) cannot follow it. Expose it to CSS instead:

- `layout.tsx` gets a small blocking inline `<head>` script. It reads `localStorage.unit` inside try/catch and sets `document.documentElement.dataset.unit` to "cm" or "in". `<html>` gets `suppressHydrationWarning`.
- The server renders `data-unit="in"` on `<html>`, so crawlers and a no-JS load see inches.
- `lib/unit.ts` mirrors every change onto the attribute in the one place all changes pass through: `setUnit` (including the blocked-storage in-memory path) and the `storage` listener.
- `globals.css` gets one pair of rules: `[data-unit="in"] .u-cm, [data-unit="cm"] .u-in { display: none }`, or an equivalent.
- Both forms are always in the server HTML, so cm stays crawlable.

An effect-based attribute would flash inches and then grow the page under the cards. That breaks "Loading the page shifts nothing", and the CLS test (500 ms, first screen) would not catch it. So the script is required, not optional, and a new e2e test proves it: block the `/_next/static/**.js` requests, store cm, and the first paint already shows cm.

Markup constraints, so the existing tests keep passing:

- `common-sizes.tsx`: the cm span stays the `li`'s second child. The test reads `textContent`, which includes hidden spans.
- `frame-anatomy.tsx`: `data-value` wraps only the inch text, and the cm text sits in a sibling span.
- `chart-footer.tsx`: "8 ft" and "244 cm" become an in/cm pair, which needs the approved edit (Decision 1).

Values: `writeSize(..., "cm")` gives 33 × 40.6, 27.9 × 35.6, 19.1 × 24.1 and 20.3 × 25.4. `toCm(MAT_OVERLAP)` gives 0.6, and `toWholeCm(WALL_HEIGHT)` gives 244. Nothing is hardcoded.

Out of scope, as the approved design says: the chart table, the questions' cm answer, the `ScalePreview` legend's secondary unit and size-name sentences ("8x10").

Files: `apps/web/src/app/layout.tsx`, `apps/web/src/lib/unit.ts`, `apps/web/src/app/globals.css`, `apps/web/src/components/frame-chart/{common-sizes,frame-anatomy,chart-footer}.tsx`.

**Design:** F1 canvas https://claude.ai/artifact/FA2okr9myNhQiZsaGdeuMD, both page boards, note "UNITS" (2026-11-15), and the six-common-sizes board in the inches view. **Approved:** owner, 2026-11-15.

## BL-28 — phone stage shows the whole drawing

The phone block (`@container card (max-width: 639.98px)`) fixes the stage at 184px while its width grows with the card. Both svgs use `slice`, so once the stage is wider than 184 · 720/384 = 345px, the drawing scales to the width and its top is cut. The wall view (`xMidYMax`) loses its top. The all-sizes view (`xMidYMid`) loses top and bottom.

The fix: above a 345px stage width, the stage height is `width × 384/720`, with a 184px minimum. While pinned (viewport height ≥ 600), it is capped so the pinned block's bottom stays in the upper half. At the cap the stage narrows and centres, as in the one-column rule. The radio `scroll-margin-top` becomes 103px plus the stage height, so it is CSS-only through the `.fc` container. The `overflow: hidden` on the phone svg and its comment are revisited, since the crop was their reason. `slice` stays in both TSX files, because it does the side crop at 375 and 390.

Keep the `@container card (max-width: 639.98px)` header as written. The unit test "lays labels out for the phone rule's label size" slices the CSS at that literal.

Correction to the bullet: the crop starts at a viewport of about 411px (a card of about 390), not at a 560px card. At 430 the "27 in" digits lose about 1.5px. At 620 the frame top loses about 67px, and in the all-sizes view the 4x6 outline (y 314–360) is entirely off-stage, so it cannot be clicked.

Files: `apps/web/src/app/widgets.css` (phone block, stage rule, `scroll-margin-top`).

## BL-29 — legible labels on a capped stage

`.fs-scale-stage` is not a container, so the unnamed `@container (max-width: 520px)` label rule queries the figure (694px at 800 × 600). The one-column cap narrows only the stage, to 352.5px, which leaves `.cmp-label` at 6.85px and `.dim-text` at 8.32px.

The fix:

- Add `container-type: inline-size` to `.fs-scale-stage`. The stage's width never depends on its content, so containment cannot collapse it. The aspect rule stays on the figure, so there is no loop.
- Capped stages up to 520px wide draw both label classes at 26 stage units, about 12.7px at 800 × 600. This equals `LABEL_FONT`, so `compareLayout` and its tests are untouched.
- Correct the 520px rule's comment ("width / 512, 14–22px" holds only for the 4:3 stage) and the `LABEL_FONT` doc comment in `size-compare.tsx`.

The phone block's 26-unit rule comes later in the file and still wins there.

Files: `apps/web/src/app/widgets.css`, `apps/web/src/components/ui/size-compare.tsx` (comment only).

## BL-24 — selection in forced colors

The selection is drawn only with background colour, gradient and box-shadow, and forced colors reset all three. A `@media (forced-colors: active)` block:

- **Desktop row:** a border or outline in `Highlight` on the selected row. It must not reuse the focus outline, because the selected row is usually the focused one, so use a different offset or a border.
- **Phone radio:** the checked dot gets a system-colour fill (`Highlight` background, or `forced-color-adjust: none` on the input with system colours). The row gets the same outline as on desktop.
- **`SegmentedControl`:** the checked option gets an outline or border in `Highlight`. Today checked and unchecked options both become ButtonText and cannot be told apart. This covers Orientation, Preview, Next to and the header Units toggle.

Tests use Playwright's `forcedColors: "active"` emulation on Chromium. Each test first asserts `matchMedia("(forced-colors: active)").matches`, then compares computed outline or border styles. That stands in for a manual Windows High Contrast check. A one-off manual look stays optional.

The `SegmentedControl` change widens the port's drift from the design system bundle. Note it beside BL-20 when that item is planned.

Files: `apps/web/src/app/widgets.css`, `apps/web/src/components/ui/segmented-control.tsx`.

## BL-6 — e2e build folder

`playwright.config.ts`'s port-3100 server uses the default `.next`, where `pnpm dev` holds Next 16's dev lock (`<distDir>/lock`). The analytics server already sets `NEXT_DIST_DIR: ".next-analytics"`, which `next.config.ts` reads. Do the same with `.next-e2e`, and add the folder wherever `.next-analytics` is listed:

- `.gitignore`
- `.prettierignore`
- `eslint.config.mjs` ignores
- `vitest.config.ts` exclude
- `apps/web/tsconfig.json`: `include` for `.next-e2e/types/**/*.ts` and `.next-e2e/dev/types/**/*.ts`, `exclude` for `.next-e2e/dev`

Fix the comments at `playwright.config.ts:5-7` and `next.config.ts:11`. CI runs `build && start` per server, which reads the same `distDir`, so it is unaffected.

## Decisions

1. **BL-30: design and test edit.** The other session redrew the F1 canvas (note "UNITS"). The footer literal "8 ft (244 cm)" cannot survive the toggle.
   - Options:
     - (a) Approve the boards, and edit `e2e/frame-chart-content.spec.ts` "the widget footer says where the sizes come from" from `toContain("8 ft (244 cm)")` to `toContain("8 ft")` and `toContain("244 cm")`.
     - (b) Hold BL-30.
   - Trade-off: (b) leaves cm visitors with mixed units.
   - Recommendation: (a).
   - **Answer:** (a), approve both (owner, 2026-11-15).
2. **BL-24: scope.**
   - Options:
     - (a) The size table only.
     - (b) The table plus `SegmentedControl`.
     - (c) (b) plus the hub-nav `aria-current` mark.
   - Trade-off: the segmented control is fully invisible in forced colors and is one shared component. Hub-nav already keeps its bold text.
   - Recommendation: (b).
   - **Answer:** (b), table plus toggles. Hub-nav is logged as BL-31 (owner, 2026-11-15).
3. **BL-28: phone stage.**
   - Options:
     - (a) Grow to full ratio above a 345px stage width, capped to the upper half.
     - (b) Keep 184px and letterbox with `meet`.
   - Trade-off: (b) cannot switch per width in CSS and drops labels at 390 to about 11.7px, which fails "Labels at 390px". (a) leaves 360, 375 and 390 exactly as approved.
   - Recommendation: (a).
   - **Answer:** (a), grow to full ratio (owner, 2026-11-15).
4. **BL-29: label size on a capped stage.**
   - Options:
     - (a) Make the stage a container only, about 10.8px.
     - (b) Make the stage a container and use 26 units on capped stages up to 520px, about 12.7px.
     - (c) Raise `LABEL_FONT`.
   - Trade-off: (a) stays under the 12px floor. (c) risks dropping major labels and would mean an existing-test edit.
   - Recommendation: (b).
   - **Answer:** (b), match the phone floor (owner, 2026-11-15).

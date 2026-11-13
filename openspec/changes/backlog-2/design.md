# Design

## Context

The widget's two drawings share one stage: `STAGE` is 720 × 384 units (in `scale-preview.tsx`). Each is drawn into an svg with `preserveAspectRatio` set to slice. Three containers are involved:

| Container | Where        | Note                                                 |
| --------- | ------------ | ---------------------------------------------------- |
| unnamed   | `.fs-scale`  | inline-size container                                |
| `fc`      | `.fc`        | named, but no query used the name before this change |
| `card`    | `.fs-widget` | turns the phone layout on                            |

Label size is set in CSS: 14 units by default, 22 units under `@container (max-width: 520px)`. `compareLayout` runs during the server render, so it cannot read CSS. Today it spaces labels by anchor distance (`LABEL_GAP` 70 × 18) and anchors each label to the end of its outline's top-right corner.

## Lanes

| Id    | Lane | Why                                                                                              |
| ----- | ---- | ------------------------------------------------------------------------------------------------ |
| BL-21 | A    | The fix is in the code; the spec already scopes the cap to the one-column layout (Behavior).     |
| BL-26 | A    | Centring plus a wider floor. The stage keeps its size and its slice, so no new design is needed. |
| BL-22 | B    | Where an oversized label goes, and an edit to an existing test.                                  |
| BL-23 | B    | The target label size. backlog-1's approved boards fix the stage height, not the label size.     |
| BL-27 | B    | The label format (whole cm, owner-approved in chat) and the accessible name in cm mode.          |

## Members

**BL-21: query `fc` by name.**

- Change: in `widgets.css`, the one-column block `@container (max-width: 843.98px)` becomes `@container fc (max-width: 843.98px)`. The rules for the sticky preview and for `scroll-margin` already resolved to `.fc` and are unchanged. The rules for the stage cap and the compact legend now stop applying in two columns.
- The spec's Behavior paragraph already says this ("Below that, …"), so it needs no change.
- Files: `apps/web/src/app/widgets.css`.

**BL-26: centre the capped stage and widen the floor.**

- Inside the capped rule, the stage gets `margin-inline: auto` and its svg gets `overflow: visible`.
- In `ScalePreview`, the floor `rect` and the `.wall-line` run from `x = −STAGE.width` to `2 · STAGE.width`.
- Where the cap applies, the stage box has exactly the viewBox's ratio, so the slice crops nothing. The figure's own `overflow: hidden` and border radius clip the wider floor at the card's edge.
- Every other layout keeps the svg's default clipping, so the wider floor stays hidden there.
- Triage checked the leak: no other shape in either drawing leaves the viewBox.
  - The largest frame's right edge is at about 482.
  - The bracket text ends before about 570.
  - The door's left edge is at about 134.
- `SizeCompare` draws no floor, so centring is enough there.
- The capped block also matches the phone layout, where the 184px stage is not the viewBox's ratio and the slice does crop. The phone block puts `overflow: hidden` back on the svg (and `margin-inline: 0` on the stage), so a cropped frame top never paints over the caption.
- Files: `apps/web/src/app/widgets.css`, `apps/web/src/components/ui/scale-preview.tsx`.

**BL-22, BL-23, BL-27: labels.**

- `compareLayout(sizes, value, unit = "in")`.
  - The default keeps the existing two-argument calls compiling.
- Each label's text is `${w}×${h}` in inches, or `${toWholeCm(w)}×${toWholeCm(h)}` in centimetres.
  - The compact form stays chart-local, as in `common-sizes.tsx`. No fourth `writeSize` form is added.
- One exported constant replaces `LABEL_GAP`: `LABEL_FONT = 26`, the label size in stage units at its largest.
  - A label's box is `length × 0.6 × LABEL_FONT` wide and `0.72 × LABEL_FONT` tall (the cap height of mono digits, which have no descenders).
- Vertical placement: the baseline sits `INSET + cap` below the outline's top edge (`INSET` = 6).
- Horizontal placement: the box ends `INSET` left of the corner, unless it would then start left of `x0 + INSET`. In that case it starts at `x0 + INSET` and runs right.
  - Each label carries its box (`x` = left edge, `y` = baseline, `width`, `height`) and a text anchor. A normally placed label renders `textAnchor="end"` at the box's right edge, so its text ends at the corner whatever size CSS draws it at (14, 22 or 26 units). A shifted label renders `textAnchor="start"` at `x0 + INSET`. The box, sized for 26 units, is what overlap and the tests check.
- The placement order is unchanged: the selected size, then major sizes from small to large, then the rest.
- A label whose box comes within 6 units horizontally and 3 units vertically of an earlier label's box is dropped.
- `inside` is true when the label's box touches the selected fill. `--on-tape` reads on both the fill and the stage, and a shifted selected label must keep the on-fill colour (the review found the fully-inside rule dropped it to the muted colour, about 4.1:1 on the fill).
- CSS: the phone block (`@container card (max-width: 639.98px)`) sets `.cmp-label` and `.dim-text` to 26 units.
  - This also covers the 587–674px viewport band, where the 520px rule is off.
- Triage simulated this on the real catalog, with every selection plus none, in all three orientations and both units:
  - the selected label is always first;
  - with none selected, every major size is labelled;
  - every label starts inside the drawing;
  - 133 / 120 / 30 labels across selections (portrait / landscape / square). Today's anchor rule gives 261 in all, at a size that spills.
- Files: `apps/web/src/components/ui/size-compare.tsx`, `apps/web/src/app/widgets.css`.

## Decisions

### 1. BL-23: the phone label size

- **Options:** (a) 26 units, about 12.5px at 390px; (b) 29 units, about 13.9px, the design system's 14px.
- **Trade-off:** (b) is closer to the design system. With today's spacing, though, it drops the portrait 8x10 major label, and the gap between labels gets tight.
- **Recommendation:** (a). It restores the size labels had before backlog-1 and keeps every major label.
- **Answer:** (a) 26 units (user, 2026-11-13).

### 2. BL-22: where a label wider than its outline goes

- **Options:**
  - (a) Shift it right so it starts at the outline's left edge. It overhangs the outline's right edge.
  - (b) Drop it, except the selected one.
  - (c) Start it just right of the corner, outside the outline.
- **Trade-off:**
  - (a) keeps small sizes named, with the text crossing the next outline's line.
  - (b) loses 4×6, 5×7 and 8.5×11 names on phones.
  - (c) lands on the larger outlines' lines and labels.
- **Recommendation:** (a).
- **Answer:** (a) shift right (user, 2026-11-13).

### 3. BL-22: edit the existing overlap test

- **What it covers:** `apps/web/src/components/ui/__tests__/scale-preview.test.tsx`, test "labels the selected size and every major size without overlap".
  - Today it asserts each label pair's anchors are `LABEL_GAP.x` or `LABEL_GAP.y` apart.
  - Shifted labels make anchor distance meaningless, and `LABEL_GAP` goes away.
- **The edit:**
  - The pair check becomes a box-overlap check, using the label boxes `compareLayout` returns (x, y, width, height).
  - A new loop also runs the same assertions in centimetres and checks every label's left edge is at or right of `x0`.
  - Kept unchanged: the selected label first, no duplicate ids, every major size labelled with nothing selected.
- **Options:** (a) edit the test as above; (b) keep anchor spacing.
- **Trade-off:** (b) drops more labels once they are wider, and does not test overlap.
- **Recommendation:** (a).
- **Answer:** (a) edit it (user, 2026-11-13).

### 4. BL-27: the drawing's accessible name in centimetres

- **Options:** (a) keep "Standard frame sizes chart from 4x6 to 27x40 inches, …"; (b) a cm name.
- **Trade-off:**
  - The ids are inch product names, and the labels are presentational inside `role="img"`.
  - (b) changes spec wording and needs new cm-mode name checks.
- **Recommendation:** (a).
- **Answer:** (a) keep the inch name (user, 2026-11-13).

### 5. BL-27: whole centimetres

- **Answer:** the owner chose this in chat when approving the change (2026-11-13). It uses `toWholeCm`, which already exists.
- No list has a duplicate label, and no size lands on .5, so the rounding mode cannot flip a label.

### 6. One label size for every layout (technical)

`compareLayout` lays out for 26 units even where CSS draws labels at 14 or 22 units. This keeps the server and client renders identical and needs no layout probe. The cost is extra spacing at the smaller desktop sizes.

The alternative was two label sets switched by container query: double the DOM, and two layouts to test. Rejected.

## Corrections to the bullets

- **BL-22:** "over the 5x7 label" did not reproduce. The 8.5×11 box sits about 14 units above 5×7's. The real defect is wider: at 22 units, 5×7 and 4×6 also start left of the drawing, and in cm 13×18 and 20×25 do too.
- **BL-21:** the sticky and `scroll-margin` rules in the one-column block already resolve to `.fc`. Only the stage and legend rules leak to desktop.
- **BL-23:**
  - The 375px stage is 309px wide, not 343: the 343 figure is the page column.
  - The 587–674px band was worse than reported, at about 10–11.8px.

## Risks / Trade-offs

- **The label font constant and the CSS can drift apart.**
  - Mitigation: the comment on `LABEL_FONT` names the CSS rules, and the phone CSS rule names `LABEL_FONT`.
  - The new e2e label-size test fails if the phone size drops below 12px.
- **On desktop, labels are drawn at 14 or 22 units but spaced for 26, so a few more are dropped than strictly needed.** Accepted (Decision 6).
- **Shifted labels cross larger outlines' lines.** This is the chosen trade-off (Decision 2).
- **Layout around 620px:** the phone layout at 620px has a stage about 554px wide, where 26 units render about 20px. That is large but readable.

# Proposal

## Why

The owner checked the frame size chart at a tablet width (768px) and found two problems. The preview drawing sits against the left edge of its card with a bare band on the right. The "All sizes" outlines are labelled in inches even when centimetres are selected. Triage found three related defects in the same two files:

- The one-column height cap on the preview also reaches the desktop column.
- On a phone, labels that are wider than their outline spill out of the drawing to the left.
- The phone stage draws its labels at about 10.5px.

## What Changes

- **Desktop preview uncapped (BL-21).** The one-column rules that cap the preview's stage at `50svh − 112px` and shrink its legend query the chart's named `fc` container, not the preview figure's own width. The two-column preview keeps its full aspect height and its base legend.
- **Capped preview centred (BL-26).** Where the cap applies, the narrowed stage is centred in its card. The wall drawing's floor and wall line extend across the card's full width, so the drawing does not end in a stub.
- **Labels inside the drawing (BL-22).** `compareLayout` measures each label from its text: monospace characters at 0.6 em, at the largest label size the CSS uses. A label that has no room left of its outline's corner is shifted right so it starts at the outline's left edge. A label that would overlap an earlier one, box against box, is dropped. The selected size's label is never dropped, and with nothing selected every major size keeps its label. The light "inside" colour is used only when the label's box lies inside the selected fill.
- **Legible phone labels (BL-23).** In the phone layout the all-sizes labels and the wall drawing's dimension labels are 26 stage units, at least 12px on screen at 390px. `compareLayout` lays labels out for that size in every layout.
- **Labels follow the unit (BL-27).** With centimetres selected, outlines are labelled in whole centimetres (`41×51`, via the engine's `toWholeCm`). The drawing's accessible name stays in inches.

## Members

| Id    | Title                                        | Lane                                                      |
| ----- | -------------------------------------------- | --------------------------------------------------------- |
| BL-21 | Preview stage cap reaches desktop            | A                                                         |
| BL-22 | All-sizes label spills past a narrow outline | B, decided: shift right; the overlap test checks boxes    |
| BL-23 | Preview labels shrink on phones              | B, decided: 26 stage units (about 12.5px)                 |
| BL-26 | Centre the capped preview stage              | A                                                         |
| BL-27 | All-sizes labels follow the unit             | B, decided: whole cm; the accessible name stays in inches |

**Parked:** none.

**Base branch:** `origin/main` at `8582841` (backlog-1 merged). The batch branch is `backlog-2`. BL-26 and BL-27 were logged on this branch at triage.

**Approved test edits:** one. In `apps/web/src/components/ui/__tests__/scale-preview.test.tsx`, the test "labels the selected size and every major size without overlap" changes its anchor-distance check (`LABEL_GAP`) into a text-box overlap check, and adds a check that every label starts inside the drawing (design.md, Decision 3). Its other assertions stay unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frame-size-chart`:
  - all-sizes labels stay inside the drawing and clear of each other;
  - labels follow the unit;
  - the pinned preview is centred where it is capped, and is not capped in two columns;
  - drawing labels are legible on a phone.

## Impact

- `apps/web/src/app/widgets.css`:
  - the one-column block queries `fc` by name;
  - the capped stage is centred and its svg overflow is visible;
  - the phone block sets 26-unit labels;
  - the 520px label rule's comment is corrected.
- `apps/web/src/components/ui/scale-preview.tsx`: the floor rect and wall line extend beyond the viewBox.
- `apps/web/src/components/ui/size-compare.tsx`:
  - `compareLayout(sizes, value, unit = "in")` gets width-aware placement and a unit-aware label text;
  - `LABEL_GAP` is replaced by a label font constant.
- Tests: new unit and e2e tests, plus the one approved edit above. Route `/` only.

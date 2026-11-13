# Proposal

## Why

The owner tried the frame size chart on an iPhone and found picking a size awkward: the targets are too small. Triage found the cause is the desktop layout squeezed onto a phone. The size table keeps a 600px minimum and pans sideways inside a box about 320px wide, so the mat and use columns are off screen and a slightly diagonal swipe pans the table instead of the page. The filter pills are 36px tall. In the "All sizes" drawing, the smaller outlines can be tapped only on a 2–4px strip. The six common sizes block also scrolls sideways on phones. None of it has been checked in Safari.

## What Changes

- **Phone size picker (BL-19, BL-11).** Below a widget width of 600px, the size table is restyled into the approved stacked rows. Each row is 68px tall and as wide as the card, shows three lines (size, then mat, then common use) and has a visible radio dot. Nothing scrolls sideways. The filters become full-width 44px segmented controls. The pinned preview becomes a fixed 184px stage with a compact legend. The DOM stays the same, so it is still one table, one radio group and the same server HTML.
- **Nearest-corner taps in "All sizes" (BL-18).** A tap in the drawing selects the size whose top-right corner is nearest, instead of whichever transparent outline sits on top.
- **Six common sizes on a phone (BL-12).** Below 640px the block draws the frames as two rows of three, at one scale, each row on its own baseline, with no sideways scroll. Desktop keeps the single baseline.
- **iOS Safari check (BL-10).** The redesigned picker, the pinned preview and the all-sizes taps are checked in Safari on an iPhone simulator.

## Members

| Id    | Title                                                  | Lane                                             |
| ----- | ------------------------------------------------------ | ------------------------------------------------ |
| BL-19 | Size picks are too small to tap on a phone             | C (design approved 2026-11-13)                   |
| BL-11 | The size table on a 360px phone                        | C, same design as BL-19 (trigger met, reopened)  |
| BL-12 | Six common sizes scroll sideways on phones             | C (design approved 2026-11-13)                   |
| BL-18 | Small outlines are hard to click in the all-sizes view | B, decided: nearest corner                       |
| BL-10 | Check the chart in iOS Safari                          | B, decided: iPhone simulator check, no WebKit CI |

**Parked:** none. The two other mobile items stay gated and were not taken into the batch: BL-4 (waits for a second live hub) and BL-16 (waits for most related pages to be live).

**Base branch:** `origin/main` at `e347e1c` (t2 merged); the batch branch is `backlog-1`.

**Approved test edits:** none. The chosen designs keep every existing test as it is (design.md, Decisions 4 and 5).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `frame-size-chart`: the size chooser gets a phone layout, every widget control on a phone is 44px tall, an all-sizes tap picks the nearest corner, and the six common sizes stack in two rows on a phone.

## Impact

- `apps/web/src/app/widgets.css`: a phone block under the widget's container query (table rows, filters, pinned preview, legend, all-sizes cursor).
- `apps/web/src/components/ui/size-table.tsx`: explicit table ARIA roles, which survive the `display` change, and a marker on the "No mat" cell.
- `apps/web/src/components/ui/size-compare.tsx`: a pure `nearestSize` and one pointer handler on the svg.
- `apps/web/src/components/frame-chart/common-sizes.tsx`: two row drawings in one figure.
- Tests: new unit tests and new e2e specs only. Route `/` only.
- The design-system bundle (`widgets.css` is a port of it) gains no phone variant in this batch. That drift is logged as a new backlog item.

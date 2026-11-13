# Tasks

## 1. Spec deltas

- [x] 1.1 frame-size-chart delta, written in triage. It covers:
  - all-sizes label placement and its scenarios;
  - labels in the visitor's unit;
  - the preview centred where capped and uncapped in two columns;
  - legible phone labels.

## 2. Fixes, one subagent at a time, serially

Only task 2.4 edits an existing test, as approved in design.md Decision 3. Every other task adds new tests only.

- [x] 2.1 BL-21: new e2e test in `e2e/frame-chart-layout.spec.ts`. At 1280 × 640, the `.fc-preview .fs-scale-stage` height equals its width divided by its computed `aspect-ratio`, within 1 px. Cite {@link openspec/specs/frame-size-chart/spec.md#scenario-a-short-desktop-screen}.
- [x] 2.2 BL-21: in `apps/web/src/app/widgets.css`, change the one-column block to `@container fc (max-width: 843.98px)`. Done when:
  - 2.1 passes;
  - every existing test in `e2e/frame-chart-layout.spec.ts` passes unchanged.
- [x] 2.3 BL-26: new e2e test in `e2e/frame-chart-layout.spec.ts`. At 768 × 900 and at 900 × 800, in the wall view:
  - the stage's left and right gaps inside `.fc-preview figure` are equal within 1 px;
  - `document.elementFromPoint` 2 px inside the figure's left edge and 2 px inside its right edge, at the floor's vertical middle, returns the `.floor` rect (hit-testing respects the svg's clipping, so this fails if `overflow: visible` is missing);
  - repeat the gap check with `?view=all`.

  Cite {@link openspec/specs/frame-size-chart/spec.md#scenario-a-one-column-screen}.

- [x] 2.4 BL-22, BL-27: unit tests in `apps/web/src/components/ui/__tests__/scale-preview.test.tsx`.
  - Edit "labels the selected size and every major size without overlap" (approved, Decision 3). The pair check uses label boxes instead of `LABEL_GAP`. Every label box's left edge (`x`) is at or right of the layout's `x0`, and a label anchored at `end` has its box's right edge `INSET` left of its outline's corner. The orientation × selection loop runs for `"in"` and `"cm"`. All other assertions are unchanged.
  - New `it`: with `compareLayout(framesFor("portrait"), "16x20", "cm")`, 16x20's label text is `41×51` and 5x7's is `13×18`. Cite {@link openspec/specs/frame-size-chart/spec.md#scenario-all-sizes-in-centimetres}.
  - New `it`: render `SizeCompare` with `unit="cm"`. Its `aria-label` is still "Standard frame sizes chart from 4x6 to 27x40 inches, 16x20 highlighted", and a `text.cmp-label` reads `41×51`.
  - The edited test cites {@link openspec/specs/frame-size-chart/spec.md#scenario-labels-stay-inside-the-drawing-and-apart}.
- [x] 2.5 BL-22, BL-23: new e2e tests in `e2e/frame-chart-phone.spec.ts`. At 390 × 664:
  - With `/?view=all&size=8.5x11`, the bounding box of the text reading `8.5×11` starts at or right of `rect[data-size="4x6"]`'s left edge ({@link openspec/specs/frame-size-chart/spec.md#scenario-a-label-wider-than-its-outline-on-a-phone}).
  - In the wall view and then the all-sizes view, each `.dim-text` and `.cmp-label` has a rendered font size of at least 12 px: computed `font-size` × the svg's `getScreenCTM().a` ({@link openspec/specs/frame-size-chart/spec.md#scenario-labels-at-390px}).
- [x] 2.6 BL-22, BL-23, BL-27, BL-26: the code.
  - In `size-compare.tsx`:
    - `compareLayout(sizes, value, unit = "in")` with the unit-aware text through `toWholeCm`;
    - `LABEL_FONT = 26` replaces `LABEL_GAP`;
    - box placement per design.md "Members" (inset 6, shift to `x0 + 6`, drop within 6 × 3, `inside` by box);
    - labels carry a box (`x` left edge, `y` baseline, `width`, `height`) and an `anchor` (`"end"` normally, `"start"` when shifted), and render at the box's right edge with `textAnchor="end"` or at its left edge with `textAnchor="start"` (design.md "Members");
    - pass `unit` from `SizeCompare`.
  - In `widgets.css`:
    - the phone block sets `.fs-scale .cmp-label` and `.fs-scale .dim-text` to 26px (stage units), with a comment naming `LABEL_FONT`;
    - inside the capped rule, add `margin-inline: auto` on the stage and `overflow: visible` on its svg;
    - fix the 520px rule's comment.
  - In `scale-preview.tsx`, the floor rect and wall line run from `-STAGE.width` to `2 * STAGE.width`.
  - Done when 2.3, 2.4 and 2.5 pass and every other existing test passes unchanged.

## 3. Verify, delete, review, archive, ship

- [x] 3.1 Run `pnpm fix`, then `pnpm test`, which includes the full e2e suite. Screenshot 768 × 900 (wall and all sizes, inches and cm) and 390 × 664 (all sizes, cm) for the PR.
- [x] 3.2 Delete the shipped bullets BL-21, BL-22, BL-23, BL-26 and BL-27 from `docs/backlog.md`.
- [x] 3.3 Run `/code-review high` in a fresh subagent. Fix the findings, and log the rest as new BL items.
- [x] 3.4 Archive with the `/opsx:archive` flow (no Tracker). Then:
  - in `openspec/specs/frame-size-chart/spec.md`'s Public Interface, update the `compareLayout` signature (`unit`, `LABEL_FONT`);
  - run the preflight;
  - push, open a PR to `main`, and turn on auto-merge with a merge commit.

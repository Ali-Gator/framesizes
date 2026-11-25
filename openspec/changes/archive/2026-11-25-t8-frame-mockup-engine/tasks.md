# Tasks

Branch `t8-frame-mockup-engine`, cut from `main` after PR 43. Order inside every group: tests first, then code. Each test cites its scenario as `{@link openspec/specs/size-engine/spec.md#<anchor>}`. Until archive, the anchors resolve against this change's delta: the citation gate reads the ADDED headings of unarchived changes.

The F7 canvas (https://claude.ai/artifact/8YexFJ28z3TrXTGLJteFSf) was approved 2026-11-24 with option A on all ten questions (Q8: a free 2,400 px PNG, no watermark); its engine answers are folded in (design.md, "Canvas answers") and the link is under "Design source" in CLAUDE.md.

## 1. Set-up

- [x] 1.1 Run `pnpm test` on the branch and verify it is green before any edit.

## 2. Mockup engine (`packages/sizes/src/mockup.ts`)

- [x] 2.1 Write `packages/sizes/src/__tests__/mockup.test.ts` for the size list: the portrait, landscape, square and nearly square scenarios, with ids, sizes and the pre-cut mat carried (16x20 → 11x14, 36x24 → 30x20, A2 → none). Implement `Art`, `MockupSize`, `SQUARE_TOLERANCE` and `mockupSizes` (design decisions 2 and 3), reusing `framesFor` and `POSTERS`. Verify the tests pass.
- [x] 2.2 Add tests for the opening: pre-cut 16x20 (10½ × 13½), 20x30 with no pre-cut mat (16 × 26), A2 with a mat (12.5 × 19.4 to one decimal), 24x36 without a mat, and 4x6 with a mat giving no opening. Implement `mockupOpening` (decision 6), reusing `MAT_OVERLAP` and `MAT_WIDTH`. Verify the tests pass.
- [x] 2.3 Add tests for the cut and the options: the 2:3 artwork without a mat (all seventeen, to one decimal), the 3:4 artwork with a mat (12x16, 16x20, 18x24), and the 2:3 list with a mat that keeps 4x6 first with no opening and no cut. Implement `MockupOption`, `mockupOptions` and the cut (decision 4). Verify the tests pass.
- [x] 2.4 Add tests for the default: 2:3 → 24x36 (27x40 at 1.2% not tied), 3:4 → 18x24, 2480 × 3508 px → A1, 2:3 with a mat → 24x36, 3:4 with a mat → 12x16, square → 20x20, and no default is ever a size with no opening. Implement `TIE` and `mockupDefault` (decision 5). Verify the tests pass.
- [x] 2.5 Add tests for the visible part: 2000 × 3000 px in 16 × 20 (2000 × 2500 at 250; focus 0 → 0, 1 → 500, 1.5 → 500), 3000 × 4000 px in 16 × 20 (3000 × 3750 at 125), and the uncut 24 × 36. Implement `visiblePart` (decision 6). Verify the tests pass.
- [x] 2.5a Add tests for the key step: 2000 × 3000 px in 16 × 20 gives 0.0625 for ¼ in and 0.25 for 1 in; the uncut 24 × 36 gives 0. Implement `KEY_STEP` and `focusStep` (decision 6). Verify the tests pass.
- [x] 2.6 Add tests for the wall and the views: the 24x36 above the sofa (left 59, bottom 42, top 80) and on the plain wall (bottom 38, top 76), the whole-wall view, the 24x36 close-up (45 × 57 at 49.5, 32.5), and a sweep that places every offered size, portrait and landscape, by both rules and checks that the outside and the close-up lie inside the 144 × 96 wall. Implement `Placement`, `View`, `hangMockup` and `mockupView` (decision 7), reusing `wallScene` and the `DEMO_ROOM` shift for the sofa and `CENTRE_LINE` for the plain wall. Verify the tests pass and `scene.test.ts` and `wall.test.ts` pass unedited.
- [x] 2.7 Add tests for the PNG size: the whole wall → 2400 × 1600, the 24x36 close-up → 1895 × 2400. Implement `EXPORT_LONG_SIDE` and `exportSize`. Verify the tests pass.
- [x] 2.8 Add tests for no answer: a 0 × 3000, a −2000 × 3000, a 2000 × NaN and a 2000 × Infinity artwork give `undefined` from `mockupSizes`, `mockupOptions`, `mockupDefault`, `visiblePart` and `focusStep`. Implement the refusal. Verify the tests pass.
- [x] 2.9 Export the new functions, constants and types from `packages/sizes/src/index.ts`, with a requirement citation on each export. Verify `pnpm typecheck` and `pnpm test:unit` (including the citation gate) pass, and that every new requirement is cited by at least one test.

## 3. Gate

- [x] 3.1 Run `pnpm fix`, then `pnpm test`, then `openspec validate --all --no-interactive`. Verify all three are green, and that `git diff --stat main` touches nothing under `apps/web` and no existing test file.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review` skill). Fix its findings and log the rest in `docs/backlog.md` as `BL-nn` items.
- `/opsx:archive`. Then update the Public Interface, Behavior and Edge Cases sections of `openspec/specs/size-engine/spec.md` by hand for the new exports. The README row stays as it is.
- Tracker: set T8 to `In progress`, put `t8-frame-mockup-engine` in its Change cell, and add the Log line "T8 phase 1 (t8-frame-mockup-engine): frame mockup engine shipped (sizes for an artwork in its orientation with A3/A2/A1, the cut per size with and without a mat, the least-cut default, mat openings, the visible part with a focus point, true-scale placement above the sofa or on a plain wall, whole-wall and close-up views, 2400 px PNG size, key steps); F7 page change next".
- Push, open the PR to `main`, name any added `BL-nn` ids, and turn on auto-merge with a merge commit.
- Next: `/opsx:propose` the F7 page change (`t8-frame-mockup`) from the approved canvas, with the humanizer step.

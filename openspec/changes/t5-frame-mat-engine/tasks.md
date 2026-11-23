# Tasks

Branch `t5-frame-mat-engine`, cut from `main` after PR 37. Order inside every group: tests first, then code. Each test cites its scenario as `{@link openspec/specs/size-engine/spec.md#<anchor>}`. Until archive, the anchors resolve against this change's delta: the citation gate reads the ADDED headings of unarchived changes.

The F5 canvas (https://claude.ai/artifact/PjZ5GizsgyTKMvx6nAfdRp) was approved 2026-11-23 and its answers are folded in (design.md, "Canvas answers"). Its `Calc` board's numbers are the expected values below.

## 1. Set-up

- [ ] 1.1 Run `pnpm test` on the branch and verify it is green before any edit.

## 2. Pre-cut helper (`packages/sizes/src/measure.ts`)

- [ ] 2.1 Write the pre-cut tests in a new `packages/sizes/src/__tests__/mat.test.ts`: the 8x10, 11x14 and 16x20 prints, the landscape 10x8 and the 12x16 with none. Move the filter out of `identifyFrame`'s mat branch into an exported `preCutFrames(print)` and call it from there (design decision 5). Verify the new tests pass and `measure.test.ts` passes unedited.

## 3. Mat engine (`packages/sizes/src/mat.ts`)

- [ ] 3.1 Add tests for the print direction: the 8x10 with a 2 in mat, the landscape 10x8, the ⅛ in overlap; the frame size matched as standard (5x7 with 1¾ in), as custom (11x14 and 8x10 with 2 in, and the landscape 10x8) and as metric (8x12 with 2 in); the print matched (8x10); `preCut` on the answer. Implement `MatQuestion`, `MatAnswer` (with `printMatch` and `frameMatch`) and `matSizes` for `from: "print"` (design decisions 2–4). Verify the tests pass.
- [ ] 3.2 Add tests for the frame direction: the 11x14 and the landscape 14x11 with a 2 in mat, and the 8x10 with 1¾ in giving the standard 5x7; the frame matched as the standard 11x14 with its 8x10 mat, the standard 8.5x11 with no mat, and the custom 9 × 12. Implement `from: "frame"`. Verify the tests pass.
- [ ] 3.2a Add tests for the borders: the 8x10 in the 11x14, the 8x10 in the 16x16, the 5x7 in the 11x14, the landscape 10x8 in the 14x11, and the 8x10 in the 5x7 (negative). Add a test for `MAT_WIDTH` and `MAT_WIDTHS`. Implement `matBorders` and the two constants (design decisions 2 and 3). Verify the tests pass.
- [ ] 3.3 Add tests for no answer and its reason: a print side, frame side, width or overlap of 0, negative or `NaN`; the 4x6 frame with a 2 in and a 3 in mat; the ½ × 6 in print; and no reason for the 8x10 print with a 2 in mat. Implement `whyNoMat` and the refusals in `matSizes` (design decision 6). Verify the tests pass.
- [ ] 3.4 Export `matSizes`, `whyNoMat`, `matBorders`, `MAT_WIDTH`, `MAT_WIDTHS`, `preCutFrames` and the `MatQuestion` and `MatAnswer` types from `packages/sizes/src/index.ts`, with a requirement citation on each export. Verify `pnpm typecheck` and `pnpm test:unit` (including the citation gate) pass, and that every new requirement is cited by at least one test.

## 4. Gate

- [ ] 4.1 Run `pnpm fix`, then `pnpm test`, then `openspec validate --all --no-interactive`. Verify all three are green, and that `git diff --stat main` touches nothing under `apps/web`.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review` skill). Fix its findings and log the rest in `docs/backlog.md` as `BL-nn` items.
- `/opsx:archive`. Then update the Public Interface, Behavior and Edge Cases sections of `openspec/specs/size-engine/spec.md` by hand for the new exports. The README row stays as it is.
- Tracker: set T5 to `In progress`, put `t5-frame-mat-engine` in its Change cell, and add the Log line "frame and mat engine shipped (print + mat width → opening and frame size, frame + mat width → opening and largest print, each matched as on F4, frames sold with a pre-cut mat, mat borders, 2 in default and presets); F5 page change next".
- Push, open the PR to `main`, name any added `BL-nn` ids, and turn on auto-merge with a merge commit.
- Next: `/opsx:propose` the F5 page change (`t5-frame-mat-calculator`) from the approved canvas (https://claude.ai/artifact/PjZ5GizsgyTKMvx6nAfdRp). Its tasks check the diploma frame sizes against sources before the copy names a frame.

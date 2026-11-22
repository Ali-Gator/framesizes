# Tasks

Branch `t4-measure-engine`, cut from `main` after PR 34. Order inside every group: tests first, then code. Each test cites its scenario as `{@link openspec/specs/size-engine/spec.md#<anchor>}`. Until archive, the anchors resolve against this change's delta: the citation gate reads the ADDED headings of unarchived changes.

## 1. Set-up

- [x] 1.1 Run `pnpm test` on the branch and verify it is green before any edit.

## 2. Verify the allowances before pinning them

- [x] 2.1 Check against named sources: a ready-made frame's lip covers about ¼ in of the picture on each side; a frame's recess (rabbet) is cut up to about ⅛ in larger than its nominal size; a pre-cut mat's opening is ½ in smaller than the print (8x10 print → 7½ × 9½ in opening); 30 × 40, 40 × 50 and 50 × 70 cm are common ready-made frame sizes (A4 and A3 were checked in t7 `verification.md`). Write each with its source URL in `openspec/changes/t4-measure-engine/verification.md`. If a source gives a different number, ask the user before changing the delta spec or the tolerance.

## 3. Measure engine (`packages/sizes/src/measure.ts`)

- [x] 3.1 Write `packages/sizes/src/__tests__/measure.test.ts` for the inside match: the 8x10 (exact and ⅛ in large), the edge of the tolerance, the landscape frame, the square measured slightly off, the custom size, and the pairwise 1 in gap over the upright catalog. Implement `MEASURE_TOLERANCE`, the upright match and `identifyFrame` for `kind: "inside"`, returning `standard` or a bare `custom` (design decisions 2 and 4), reusing `CATALOG` and `findFrame`. Verify the tests pass.
- [x] 3.2 Add tests for the front opening of an 8x10, and for the 11x14 and 8x10 measured outside. Implement `LIP` and the `front` and `outside` kinds (design decision 3). Verify the tests pass and `frames.test.ts` still passes unedited.
- [x] 3.3 Add tests for the mat: the 8x10 print, the print sold in two frame sizes, the landscape mat, the print no mat is sold for, and the pairwise 1 in gap over the mat print sizes. Implement the `mat` kind through the catalog's mat pairings and `MAT_OVERLAP` (design decision 5). Verify the tests pass.
- [x] 3.3a Add tests for the metric sizes: the A4 frame, the 30 × 40 cm frame with 12x16 close too, the 12x16 frame with no metric named, the landscape A4, and the pairwise ¾ in gap over the metric list. Implement `METRIC_FRAMES` from the A4 and A3 entries of `ACTUAL_SIZES` plus the three centimetre sizes, and the `metric` answer (design decision 6). Verify the tests pass and `screen.test.ts` still passes unedited.
- [x] 3.3b Add tests for the nearest sizes: 9 × 12, its landscape 12 × 9, the square 13 × 13, 30 × 44 with nothing above and 3 × 5 with nothing below. Implement `below` and `above` on the `custom` answer (design decision 7). Verify the tests pass.
- [x] 3.4 Add tests for no answer: a side of 0, a negative side, `NaN`, a lip, overlap or face width of 0, and mouldings wider than the frame. Implement the validation (design decision 8). Verify the tests pass.
- [x] 3.5 Export `identifyFrame`, `MEASURE_TOLERANCE`, `LIP`, `METRIC_FRAMES` and the `Measurement` and `Identified` types from `packages/sizes/src/index.ts`, with a requirement citation on each export. Verify `pnpm typecheck` and `pnpm test:unit` (including the citation gate) pass, and that every new requirement is cited by at least one test.

## 4. Gate

- [x] 4.1 Run `pnpm fix`, then `pnpm test`, then `openspec validate --all --no-interactive`. Verify all three are green, and that `git diff --stat main` touches nothing under `apps/web`.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review` skill). Fix its findings and log the rest in `docs/backlog.md` as `BL-nn` items.
- `/opsx:archive`. Then update the Public Interface, Behavior and Edge Cases sections of `openspec/specs/size-engine/spec.md` by hand for the new exports. The README row stays as it is.
- Tracker: set T4 to `In progress`, put `t4-measure-engine` in its Change cell, and add the Log line "measure engine shipped (inside, front opening, outside and mat opening → standard, metric or custom size with the nearest sizes, ⅜ in tolerance); F4 page change next".
- Push, open the PR to `main`, name any added `BL-nn` ids, and turn on auto-merge with a merge commit.
- Next: `/opsx:propose` the F4 page change from the approved canvas (https://claude.ai/artifact/SqK52EoyyoLLXzRPPKSUkB).

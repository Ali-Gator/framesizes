# Tasks

Branch `t4-measure-engine`, cut from `main` after PR 34. Order inside every group: tests first, then code. Each test cites its scenario as `{@link openspec/specs/size-engine/spec.md#<anchor>}`. Until archive, the anchors resolve against this change's delta: the citation gate reads the ADDED headings of unarchived changes.

## 1. Set-up

- [ ] 1.1 Run `pnpm test` on the branch and verify it is green before any edit.

## 2. Verify the allowances before pinning them

- [ ] 2.1 Check against named sources: a ready-made frame's lip covers about ¼ in of the picture on each side; a frame's recess (rabbet) is cut up to about ⅛ in larger than its nominal size; a pre-cut mat's opening is ½ in smaller than the print (8x10 print → 7½ × 9½ in opening). Write each with its source URL in `openspec/changes/t4-measure-engine/verification.md`. If a source gives a different number, ask the user before changing the delta spec or the tolerance.

## 3. Measure engine (`packages/sizes/src/measure.ts`)

- [ ] 3.1 Write `packages/sizes/src/__tests__/measure.test.ts` for the inside match: the 8x10 (exact and ⅛ in large), the edge of the tolerance, the landscape frame, the square measured slightly off, the custom size, and the pairwise 1 in gap over the upright catalog. Implement `MEASURE_TOLERANCE`, the upright match and `identifyFrame` for `kind: "inside"` (design decisions 2 and 4), reusing `CATALOG` and `findFrame`. Verify the tests pass.
- [ ] 3.2 Add tests for the front opening of an 8x10, and for the 11x14 and 8x10 measured outside. Implement `LIP` and the `front` and `outside` kinds (design decision 3). Verify the tests pass and `frames.test.ts` still passes unedited.
- [ ] 3.3 Add tests for the mat: the 8x10 print, the print sold in two frame sizes, the landscape mat, the print no mat is sold for, and the pairwise 1 in gap over the mat print sizes. Implement the `mat` kind through the catalog's mat pairings and `MAT_OVERLAP` (design decision 5). Verify the tests pass.
- [ ] 3.4 Add tests for no answer: a side of 0, a negative side, `NaN`, a lip, overlap or face width of 0, and mouldings wider than the frame. Implement the validation (design decision 6). Verify the tests pass.
- [ ] 3.5 Export `identifyFrame`, `MEASURE_TOLERANCE`, `LIP` and the `Measurement` and `Identified` types from `packages/sizes/src/index.ts`, with a requirement citation on each export. Verify `pnpm typecheck` and `pnpm test:unit` (including the citation gate) pass, and that every new requirement is cited by at least one test.

## 4. Gate

- [ ] 4.1 Run `pnpm fix`, then `pnpm test`, then `openspec validate --all --no-interactive`. Verify all three are green, and that `git diff --stat main` touches nothing under `apps/web`.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review` skill). Fix its findings and log the rest in `docs/backlog.md` as `BL-nn` items.
- `/opsx:archive`. Then update the Public Interface, Behavior and Edge Cases sections of `openspec/specs/size-engine/spec.md` by hand for the new exports. The README row stays as it is.
- Tracker: set T4 to `In progress`, put `t4-measure-engine` in its Change cell, and add the Log line "measure engine shipped (inside, front opening, outside and mat opening → standard size, ⅜ in tolerance); F4 canvas and page change next".
- Push, open the PR to `main`, name any added `BL-nn` ids, and turn on auto-merge with a merge commit.
- Next: draw the F4 canvas for approval, then `/opsx:propose` the page change.

# Tasks

Branch `t6-poster-frame-engine`, cut from `main` after PR 39. Order inside every group: tests first, then code. Each test cites its scenario as `{@link openspec/specs/size-engine/spec.md#<anchor>}`. Until archive, the anchors resolve against this change's delta: the citation gate reads the ADDED headings of unarchived changes.

The F6 canvas (https://claude.ai/artifact/43JSmmnTJHtj55WBpR84qT) was approved 2026-11-23 with option A on all ten questions; its engine answers are folded in (design.md, "Canvas answers") and the link is under "Design source" in CLAUDE.md.

## 1. Set-up and data check

- [x] 1.1 Run `pnpm test` on the branch and verify it is green before any edit.
- [x] 1.2 Check the poster sizes against sources and write `verification.md` in this change: each US size (11x17, 12x18, 16x20, 18x24, 20x30, 24x36, 27x40) sold as a poster size at two or more US print or poster retailers, and A3, A2 and A1 from ISO 216, with the URLs and today's date. Canvas Q6 A names an "A2 frame": also record US listings that sell A2 and A1 frames under those names; if they do not hold, note it for the page change (Q6 B). Verify every size in the spec's list has a line, and drop (with an `/opsx:update`) any size that fails.
- [x] 1.3 BL-17: in the same check, look at how 20x30 and 27x40 frames are sold with a mat (16x24 / 24x36 openings) and record the count in `verification.md`. Verify the outcome: if the evidence says to pair them, stop and ask the user before any data or test edit; otherwise update BL-17's note in `docs/backlog.md` with the check's date and keep it deferred.

## 2. Poster engine (`packages/sizes/src/poster.ts`)

- [x] 2.1 Write `packages/sizes/src/__tests__/poster.test.ts` for the list: the ten sizes in order with a use each, the US sizes found in the catalog at the same size, and A3, A2 and A1 written with `writeActual`. Implement `Poster`, `PosterGroup` and `POSTERS` (design decision 2; A3 from the `ACTUAL_SIZES` record). The `use` lines are visitor-facing: take them verbatim from the spec (the canvas's lines) and run `humanizer:humanizer` over them before the commit that adds them; a rewording goes to the user first. Verify the tests pass.
- [x] 2.2 Add tests for the frame without a mat: 24x36 standard, A3 metric, A2 custom (16x20 below, 18x24 above), the landscape 17x11, and the typed 13x19 (12x18 below, 16x20 above). Implement `posterFrames` with `bare` from `identifyFrame`. Verify the tests pass.
- [x] 2.2a Add tests for the A-series frame: A2 and A1 named with their custom answers kept, the typed 16.4 × 23.3 named A2, none for 24x36 or A3, and `identifyFrame` on an inside 16½ × 23⅜ still custom. Implement `A_FRAMES` and `aFrame` (design decision 2). Verify the tests pass and `measure.test.ts` passes unedited.
- [x] 2.3 Add tests for the frames with a mat: the 11x17, 16x20, 18x24, 24x36, 27x40 (empty), A2 and the landscape 17x11 scenarios, with borders and the pre-cut flag; `POSTER_BORDER`; the 12x18 that leaves out the 20x24 (4¼ in) and the 11x17 that keeps the pre-cut 12x18 (¾ in); the non-square 13x14 without the 16x16, the square 12x12 with its pre-cut 16x16, and the 10x10 sorted 12x12, 12x16, 16x16. Implement `MattedFrame`, `POSTER_BORDER` and `matted` (design decisions 2 and 3), reusing `preCutFrames`, `matBorders` and `findFrame`. Verify the tests pass.
- [x] 2.3a Add tests for the custom frame: 27x40 → 30½ × 43½ in, landscape 40x27 → 43½ × 30½ in, none for 24x36. Implement `customFrame` from `matSizes` and `MAT_WIDTH`. Verify the tests pass.
- [x] 2.4 Add tests for no answer: a 0 by 17 poster, a negative side and a `NaN` height give `undefined`. Implement the refusal. Verify the tests pass.
- [x] 2.5 Export `POSTERS`, `POSTER_BORDER`, `A_FRAMES`, `posterFrames` and the `Poster`, `PosterGroup`, `MattedFrame` and `PosterFrames` types from `packages/sizes/src/index.ts`, with a requirement citation on each export. Verify `pnpm typecheck` and `pnpm test:unit` (including the citation gate) pass, and that every new requirement is cited by at least one test.

## 3. Gate

- [x] 3.1 Run `pnpm fix`, then `pnpm test`, then `openspec validate --all --no-interactive`. Verify all three are green, and that `git diff --stat main` touches nothing under `apps/web` and no existing test file.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review` skill). Fix its findings and log the rest in `docs/backlog.md` as `BL-nn` items; log the 24x30 / 30x40 retail check there too (canvas Q5 A).
- `/opsx:archive`. Then update the Public Interface, Behavior and Edge Cases sections of `openspec/specs/size-engine/spec.md` by hand for the new exports. The README row stays as it is.
- Tracker: set T6 to `In progress`, put `t6-poster-frame-engine` in its Change cell, and add the Log line "T6 phase 1 (t6-poster-frame-engine): poster frame engine shipped (ten poster sizes with use lines, frame without a mat matched as on F4 with A2/A1 named, standard frames with a mat at a 1–4 in border or pre-cut, smallest first, with borders; the 2 in custom frame when none); F6 page change next".
- Push, open the PR to `main`, name any added `BL-nn` ids, and turn on auto-merge with a merge commit.
- Next: `/opsx:propose` the F6 page change (`t6-poster-frame-sizes`) from the approved canvas (https://claude.ai/artifact/43JSmmnTJHtj55WBpR84qT), with the humanizer step.

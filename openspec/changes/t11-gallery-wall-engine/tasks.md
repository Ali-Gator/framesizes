# Tasks

Branch `t11-gallery-wall-engine`, cut from `main` after PR 16. Order inside every group: tests first, then code. Each test cites its scenario as `{@link openspec/specs/size-engine/spec.md#<anchor>}`. Until archive, the anchors resolve against this change's delta, because the citation gate reads the ADDED and MODIFIED headings of unarchived changes.

## 1. Set-up

- [ ] 1.1 Run `pnpm test` on the branch and verify it is green before any edit.

## 2. Backlog fixes in `wall.ts`

- [ ] 2.1 BL-36. Add two tests to `wall.test.ts`: "A marked wall edge on the right" and "Centred between the marked side edges". Add the internal `usableArea(wall)` and use it in `placeBeside`'s side check and fallback (design decision 5). Verify that the new tests pass and that `wall.test.ts` and `apps/web/src/components/frames-on-wall/__tests__/` pass unedited. If an existing test fails, stop and ask the user before editing it.
- [ ] 2.2 BL-37 and BL-38. Add tests for "A snap that would leave the wall" (`toBeCloseTo`) and "A tie between two frames". Give `snapFrame` the optional `wall` argument and skip candidate starts outside its bounds (design decision 6). Verify that the new tests pass and that the existing snap tests pass unedited.

## 3. Gallery engine (`packages/sizes/src/gallery.ts`)

- [ ] 3.1 Write `packages/sizes/src/__tests__/gallery.test.ts` for "The five templates" and "Every template frame is in the catalog". Add the `Stack` and `Template` types and the `TEMPLATES` array (design decision 2). The names are visitor-facing text, so run the `humanizer:humanizer` skill over them before commit. Verify the tests pass.
- [ ] 3.2 Add tests for every scenario of "A template is laid out with one gap between neighbours" and "A gallery group hangs above furniture or on the centre line". Implement `GALLERY_GAP` and `layoutTemplate`, using measure then place, with the group placed by furniture, the centre line or the middle (design decision 3). Verify the tests pass.
- [ ] 3.3 Add tests for "Nail marks come from the frame's hanger" and "A frame with no nail says why" (every scenario, one assertion per reason). Implement the `Hanger` and `NoNail` types, `hangerProblem` and `nailMarks` (design decision 4). Verify the tests pass.
- [ ] 3.4 Add tests for every scenario of "A gallery group is measured for hanging", "Each nail names its frame and is measured from the group's corner" and "Nails are listed in rows". Implement `measureGroup` with `toCeiling`, `missing` and the 4 in row band (design decision 4). Verify the tests pass.
- [ ] 3.5 Add tests for every scenario of "A whole group moves as one" and "A group is centred on the wall". Implement `groupDistances`, `setGroupDistance` and `centreGroup` on top of `frameDistances`, `setDistance` and `usableArea` (design decision 8). Verify the tests pass.
- [ ] 3.6 Export the new API from `packages/sizes/src/index.ts` with a requirement citation on each export. Keep `usableArea` internal. Verify that `pnpm typecheck` and `pnpm test:unit` (including the citation gate) pass, and that every new requirement is cited by at least one test.

## 4. Backlog and gate

- [ ] 4.1 Delete BL-36, BL-37 and BL-38 from `docs/backlog.md`. Leave the `_Next id:_` line as it is. Verify with `grep -c "BL-3[678]" docs/backlog.md`, which should print 0.
- [ ] 4.2 Run `pnpm fix`, then `pnpm test`, then `openspec validate --all --no-interactive`. Verify all three are green, and that `git diff --stat main` touches nothing under `apps/web`.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review` skill). Fix its findings and log the rest in `docs/backlog.md` as `BL-nn` items.
- `/opsx:archive`. Then update the Public Interface, Behavior and Edge Cases sections of `openspec/specs/size-engine/spec.md` by hand for `gallery.ts`, the optional `wall` argument of `snapFrame`, and the new placement rule. The README row stays as it is.
- Tracker:
  - set T11 to `In progress`;
  - add the Log line "gallery wall engine shipped (five templates, layout with one gap, group above furniture or on the 57 in line, nail marks, hanging measurements; BL-36..38 fixed); page change t11-gallery-wall-planner is next".
- Push, open the PR to `main` naming the deleted `BL-36`..`BL-38` and any added `BL-nn`, and turn on auto-merge with a merge commit.
- Next: `/opsx:apply t11-gallery-wall-planner`, which starts after this change is merged.

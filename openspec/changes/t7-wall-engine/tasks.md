# Tasks

Branch `t7-wall-engine`, cut from `main` after PR 11. Order inside every group: tests first, then code. Each test cites its scenario as `{@link openspec/specs/size-engine/spec.md#<anchor>}`. Until archive, the anchors resolve against this change's delta: the citation gate reads the ADDED headings of unarchived changes.

## 1. Set-up

- [ ] 1.1 Run `pnpm test` on the branch and verify it is green before any edit.

## 2. Verify the reference lengths before pinning them

- [ ] 2.1 Check Letter 8.5 × 11 in (ANSI), A4 210 × 297 mm (ISO 216) and the ID-1 card 85.60 × 53.98 mm (ISO/IEC 7810) against named sources. Check a common EU interior door height (200 cm), and the US queen (60 in) and EU double (160 cm) bed widths. Verify each has a source URL in `openspec/changes/t7-wall-engine/verification.md`. If a source gives a different number, ask the user before changing the delta spec.

## 3. Wall engine (`packages/sizes/src/wall.ts`)

- [ ] 3.1 Write `packages/sizes/src/__tests__/wall.test.ts` for the known things: the list, the fixed lengths, and the defaults in both units (design decision 4). Implement those parts of `wall.ts`, reusing `DOOR`, `SOFA` and `toWholeCm`. The names and edge labels are visitor-facing text, so run the `humanizer:humanizer` skill over them before commit; the page change may still reword them against the F2 design. Verify the tests pass.
- [ ] 3.2 Add tests for the scale from a mark: the door, the slanted mark, and every input that gives no scale. Then add tests for the photo's size and a frame's place in pixels. Implement `scaleFromMark` and the two mappings (design decisions 2 and 3). Verify the tests pass.
- [ ] 3.3 Add the demo room test. Implement `DEMO_ROOM` from `wallScene` shifted by half the wall's width (design decision 5). Verify the test passes and that `scene.test.ts` still passes unedited.
- [ ] 3.4 Add tests for the distance scenarios: side by side, not in line, and the demo frame. Add tests for the setting scenarios: widened gap, pushed off the wall, pushed through another frame, negative value, and the demo frame raised. Implement `frameDistances` and `setDistance` (design decision 6). Verify the tests pass.
- [ ] 3.4a Add tests for a photo's edges and furniture: the photo with no edge marked (distances and the two setting scenarios), the floor line, the wall's width giving its side edges, a frame above a marked sofa, and the sofa and bed edge names. Implement `photoPointToWall`, `photoEdges`, `markedFurniture` and the optional edges in `frameDistances` and `setDistance` (design decision 7). Verify the tests pass and the demo room scenarios still pass.
- [ ] 3.4b Add tests for snapping (beside another frame, to the sofa's centre, nothing within an inch) and for placing a new frame (beside the demo frame, no room on the right). Implement `snapFrame` and `placeBeside` (design decision 6a). Verify the tests pass.
- [ ] 3.5 Export the new API from `packages/sizes/src/index.ts` with a requirement citation on each export. Verify `pnpm typecheck` and `pnpm test:unit` (including the citation gate) pass, and that every new requirement is cited by at least one test.

## 4. Gate

- [ ] 4.1 Run `pnpm fix`, then `pnpm test`, then `openspec validate --all --no-interactive`. Verify all three are green, and that `git diff --stat main` touches nothing under `apps/web`.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review` skill). Fix its findings and log the rest in `docs/backlog.md` as `BL-nn` items.
- `/opsx:archive`. Then update the Public Interface, Behavior and Edge Cases sections of `openspec/specs/size-engine/spec.md` by hand for the new exports. The README row stays as it is.
- Tracker: set T7 to `In progress`, and add the Log line "wall engine shipped (scale from a mark, photo mapping, demo room, distances, snapping, placement); page change t7-frames-on-wall planned".
- Push, open the PR to `main`, name any added `BL-nn` ids, and turn on auto-merge with a merge commit.
- Next: `/opsx:apply t7-frames-on-wall` (planned 2026-11-15, after the F2 canvas was approved).

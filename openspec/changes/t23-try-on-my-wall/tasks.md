# Tasks

## 1. Permissions

- [x] 1.1 Set `permissions` in `apps/extension/public/manifest.json` to `["sidePanel", "contextMenus", "activeTab", "scripting"]` and change only the permissions assertion in `manifest.test.ts` (approved 2026-11-18); verify `pnpm test:unit` passes and `manifest.test.ts` still cites `#scenario-the-built-manifest`

## 2. Sizes from page text

- [x] 2.1 Write `apps/extension/src/__tests__/find-sizes.test.ts` from the spec's "The sizes come from the page text" scenarios plus mm, comma decimals, unitless inches, orientation dedupe and the eight cap; verify it fails
- [x] 2.2 Implement `apps/extension/src/find-sizes.ts` (design decision 3); verify the test passes

## 3. The click in the worker

- [x] 3.1 Write `apps/extension/src/__tests__/menu.test.ts` with a fake `MenuApi`: `registerMenu`'s `removeAll` then `create` arguments, `sidePanel.open` called before any await, fetch → crop → `null` image fallbacks, a failed injection giving no sizes and `tab.title`, and a stored try with no page text; verify it fails and `background.test.ts` is untouched
- [x] 3.2 Implement `registerMenu` and `onMenuClick` in `background.ts`, `readPage` and the crop in `src/read-page.ts`, and the try record write plus channel ping (design decisions 1, 2 and 4); verify `menu.test.ts` and `background.test.ts` pass and `pnpm --filter extension build` emits `background.js`

## 4. G1: a print on an added frame

- [x] 4.1 Write `apps/web/src/components/gallery-wall/__tests__/state-print.test.ts` from the planner delta's scenarios: `addPrint` placement and letter F, outside size framed and unframed, the cm label "60 × 90 cm print", `sizesOf` giving the print its own row, `openPicker` refusing a print, and the 12-frame cap; verify it fails
- [x] 4.2 Add `print` to added frames, `addPrint`, the print-aware `outside()`, `frameSize()` and the "Change size" rules in `state.ts`, `gallery-wall.tsx` and `nail-marks.tsx` (design decision 6); verify the new test and every existing G1 unit test pass unedited
- [x] 4.3 Give `StageFrame` optional `art` and `moulding` in `frames-on-wall/stage.tsx`, with defaults unchanged; verify the F2 and G1 unit and e2e specs pass unedited

## 5. Storage keys and the try record

- [x] 5.1 Write `apps/extension/src/__tests__/saved-wall-keys.test.ts`: a v1 inline photo read, a v2 write split into `current`, `photo` and `art:<id>`, the photo Blob not rewritten when only the layout changes (BL-58), an orphan `art:` key deleted, a print round trip with its picture, and the `try` record read and deleted; verify it fails and `saved-wall.test.ts` is untouched
- [x] 5.2 Implement record v2 and the blob keys in `saved-wall.ts` and `use-wall.ts` (design decision 4); verify both saved-wall test files pass and the existing `e2e/extension.spec.ts` passes unedited

## 6. The try view

- [x] 6.1 Write `apps/extension/src/__tests__/try.test.ts`: `hangPrint` at 18/8/60/60 unframed and 16/8/59/59 framed in the sample room, the landscape turn, a set distance of 10 in to the sofa giving 16 in to the ceiling, the reducer's pick/wait rules for one, several and no sizes, and the tip's 56 in over 84 in; verify it fails
- [x] 6.2 Implement `src/try/` (`use-try.ts`, `try-reducer.ts`, `hang.ts`, `size-step.tsx`, `hang-view.tsx`) and the panel switch in `panel.tsx`, including "Use my wall photo" through G1's flow and "Add to my layout" writing `art:<id>` (design decision 5), with the canvas's `x-chip`, `x-art-head`, `x-tip` and `x-why` styles in `extension.css`; verify `try.test.ts` passes and `pnpm --filter extension build` succeeds
- [x] 6.3 Run the `humanizer:humanizer` skill over the new panel copy (size step, try view, tip, waiting reasons, aria names), keeping every size and number; verify the strings in the spec scenarios still match

## 7. BL-56: the wall select in the upload step

- [x] 7.1 Make `useWall().wall` return `"new"` in the upload and scale steps and render the disabled "New wall photo" option in `toolbar.tsx` (design decision 7); verify by the e2e case in 8.2

## 8. End to end

- [x] 8.1 Write `e2e/extension-try.spec.ts`, which seeds the `try` record and drives the panel through every extension-delta scenario that a page can reach: several, one and no sizes, hang, framed, set distance, Add then reload, Back, a full layout, "Use my wall photo", reload during a try, axe on the size step and the hang view, and the request list; verify it passes locally with `pnpm test:e2e`
- [x] 8.2 Write `e2e/extension-races.spec.ts` for BL-59 (a panel closed inside 300 ms keeps its change; panel and tab edited at once end on the last write) and the BL-56 case; verify it passes locally
- [x] 8.3 Delete BL-56, BL-58 and BL-59 from `docs/backlog.md`; verify `grep -c "BL-5[689]" docs/backlog.md` prints 0

## 9. Gate

- [x] 9.1 Run `pnpm fix`, then `pnpm test`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck` and `openspec validate --all --no-interactive`; verify all pass
- [ ] 9.2 Load `apps/extension/dist` unpacked in Chrome and right-click a print on a real shop page; verify the panel opens on the print with its sizes and picture, and note in the PR which shop and whether the picture came from the fetch or the crop

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review`, `/code-review high`); fix its findings and log what stays unfixed in `docs/backlog.md` as `BL-60` and on.
- `/opsx:archive`, then bring the main spec's Public Interface, Behavior and Edge Cases up to date in `openspec/specs/gallery-wall-extension/spec.md`: the menu, the try record, the blob keys, record v2, and the image fallbacks.
- Tracker: T23 becomes `Done`, and a Log line for today reads "T23 part 2 (t23-try-on-my-wall): right-click Try on my wall, sizes from page text, the print at true size on the saved wall, added to the layout with its picture; BL-56, BL-58, BL-59 fixed."
- Push, open the PR to `main`, and turn on auto-merge with a merge commit. The PR names the backlog ids added and removed, and lists the store's permission justifications and the "Website content" disclosure for the user's upload.

# Tasks

## 1. Scaffold `apps/extension`

- [x] 1.1 Create the `apps/extension` workspace app (design decision 1):
  - `package.json` (`build`, `zip`, `typecheck`), `vite.config.ts`, `postcss.config.mjs` and `tsconfig.json` with the `@/` path to `../web/src`;
  - empty `sidepanel.html` and `tab.html`, and `src/background.ts`;
  - `src/shims/next-dynamic.tsx` and `src/shims/next-link.tsx` (design decision 2).

  Add `vite`, `tailwindcss`, `@tailwindcss/postcss`, `@types/chrome`, `@fontsource/schibsted-grotesk` and `@fontsource/ibm-plex-mono`. Gitignore `apps/extension/dist` and the zip. Verify `pnpm install`, `pnpm --filter extension build` and `pnpm typecheck` succeed.

- [x] 1.2 Widen ESLint's react-hooks block to `apps/{web,extension}/**` (design decision 10). Change the root `test:e2e` to build the extension first. Verify `pnpm lint` passes and `pnpm test:unit` still picks up `apps/*/src` tests.

## 2. Manifest, icons and the service worker

- [x] 2.1 Write `src/__tests__/manifest.test.ts` citing "The built manifest" and "Name and icons in the build". It reads `public/manifest.json` and each icon's IHDR size. Write `public/manifest.json` (design decision 8) with the short description copied from the store listing doc. Verify the test passes.
- [x] 2.2 Draw `apps/extension/icon.svg` from board k. Write `scripts/extension-icons.mjs` with `sharp` resolved from `apps/web`. Render and commit the four PNGs. Verify the manifest test's size checks pass and the 16 px icon reads on Chrome's light toolbar when the unpacked build is loaded.
- [x] 2.3 Write `src/__tests__/background.test.ts` with a fake `chrome`, citing:
  - "Install and browser start set the panel behaviour";
  - "A fresh install with the button not pinned";
  - "An update opens nothing";
  - "The how-to page asks after the visitor pins the button";
  - "An unknown message".

  Include the `sender.origin` check. Implement `src/background.ts` (design decision 7). Verify the tests pass.

## 3. G1: the additive props and the backlog items

- [ ] 3.1 Write `apps/web/src/components/gallery-wall/__tests__/state-extension.test.ts`, a new file, citing:
  - "Changing a size with All frames selected" (the size list, largest first, and the group-size change);
  - "Back to the sample room before picking a photo" (BL-48);
  - for `restorePhoto`, the extension's "To the sample room and back".

  Implement the BL-52 size list, the `group-size` picker mode, BL-48's `toSample` and the `restorePhoto` action (design decisions 5 and 9). Verify the new tests and every existing G1 test pass unedited.

- [ ] 3.2 Add `variant`, `state` and `dispatch` to `GalleryWall`, and make `WidgetCard`'s `title` optional (design decision 3). Add the `wf-panel` CSS. Render BL-52's selection block from board e2. G1 opens with the whole group selected, so its default server HTML gains the "Sizes in this layout" list; nothing else in it changes. Verify the existing G1 markup, content and e2e tests pass unedited.
- [ ] 3.3 Fix BL-53 (template thumbs) and BL-54 (the nail table) in `gallery.css` (design decision 9). Write `e2e/gallery-wall-panel-fit.spec.ts` citing:
  - "Template pictures and the nail table at 360";
  - "The nail table on the desktop";
  - "Back to the sample room before picking a photo";
  - "Changing a size with All frames selected".

  Verify it passes.

## 4. The saved wall

- [ ] 4.1 Write `src/__tests__/saved-wall.test.ts` citing "A changed layout survives a reload". It covers:
  - the `toSaved` / `fromSaved` round trip of every listed field;
  - that dialogs, pickers, drafts and `photo.url` are dropped;
  - that a record with another `v` is ignored;
  - that a write with no planner photo keeps the record's `SavedPhoto`;
  - that a state applied by `load` or by the first restore schedules no write, and a URL made from the stored Blob is not saved again (no echo between the panel and the tab).

  Implement `src/saved-wall.ts` (design decision 4): IndexedDB, the Blob read from the object URL, the 300 ms debounce, `BroadcastChannel`, and `navigator.storage.persist()`. Verify the tests pass.

- [ ] 4.2 Implement `src/use-wall.ts` (design decision 5): load on start, the `ready` flag, `load` from the channel, and the wall select's two choices. Verify through the e2e group below.

## 5. The panel and the tab

- [ ] 5.1 Build `src/extension.css`:
  - import `@/app/globals.css`, the wall and gallery CSS, and the two fontsource faces;
  - set `--font-schibsted` and `--font-plex-mono`;
  - add `@source "../../web/src"`;
  - port the canvas's `x-ptool`, `x-wallsel`, `x-saved` and `x-ibtn` rules.

  Verify the built `dist/` holds the font files, and that no CSS or HTML file in it references an `http` URL.

- [ ] 5.2 Build the panel entry (`sidepanel.html` and `src/panel.tsx`):
  - set `data-unit` before the first render (design decision 6);
  - the toolbar from PanelHead: the "Wall" select, `UnitToggle`, "Open full size" through `chrome.tabs.create`, and the saved line while a photo is saved;
  - `GalleryWall variant="panel"`, controlled by `use-wall`.

  Verify by loading the unpacked build in Chrome and opening the side panel from the toolbar button.

- [ ] 5.3 Build the tab entry (`tab.html` and `src/tab.tsx`) from board h. The top bar holds the icon, the `h1`, "Saved on this device", the "Wall" select and `UnitToggle`, above `GalleryWall variant="tab"`. Verify the desktop layout shows at 1280 in the unpacked build.
- [ ] 5.4 Run the `humanizer:humanizer` skill over the new visitor-facing text:
  - the extension's toolbar, tab bar, saved lines, aria labels and manifest description;
  - G1's "Sizes in this layout" label, its explanatory line and the "Change …" aria labels (BL-52). Keep the name and the store doc's keywords as they are. Verify the diff changes wording only.

## 6. End-to-end

- [ ] 6.1 Write `e2e/extension.spec.ts` (design decision 10). It loads the unpacked build in a persistent Chromium context and routes `https://framesizes.app/**` locally. It covers:
  - the install tab with `?pinned=0`;
  - "The panel's first state" at 360 × 800;
  - "The toolbar on a first open";
  - both saved-wall reloads, with `e2e/fixtures/wall-1200x900.png` scaled from the sofa;
  - "No request leaves the extension";
  - "Opening the full-size tab";
  - "A gap set in the tab reaches the panel";
  - "To the sample room and back";
  - "No photo saved yet";
  - "Centimetres in both pages";
  - axe on the panel's first state, the panel's Nail marks view and the tab.

  Verify it passes locally and in CI.

## 7. Gate

- [ ] 7.1 Run `pnpm fix`, then `pnpm test`, then `openspec validate --all --no-interactive`. Verify all three are green.
- [ ] 7.2 Run the On-page SEO guide's pre-publish checklist for `/gallery-wall-planner` against `pnpm build && pnpm start`, with the `seo-audit:seo-page-audit` skill loaded, since BL-52 adds copy to the live page. Verify every applicable item passes.
- [ ] 7.3 Run `pnpm --filter extension zip`. Load the zip's contents unpacked in Chrome and check the panel, the tab and the install tab by hand. Verify the zip holds `manifest.json` at its root and that no file in it is a source map.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review` skill). Fix its findings and log the rest in `docs/backlog.md`. Delete BL-48, BL-52, BL-53 and BL-54 in the PR.
- `/opsx:archive`. Then:
  - re-add Public Interface, Behavior and Edge Cases to `openspec/specs/gallery-wall-extension/spec.md`;
  - add the `GalleryWall` props to the Public Interface of `openspec/specs/gallery-wall-planner/spec.md`;
  - add the README row `gallery-wall-extension`: `apps/extension/src/**`.
- Tracker:
  - set T23 to `In progress`;
  - add the Log line "T23 part 1: extension side panel and full-size tab with G1's planner, wall saved on the device, install and status hooks for T24; next `t23-try-on-my-wall`";
  - correct the T23 permissions line: `sidePanel` now; `contextMenus`, `activeTab` and `scripting` with the shop flow; no host permission while sync is open.
- Push, open the PR to `main`, name any added `BL-nn`, and turn on auto-merge with a merge commit.
- Not in this change: uploading the zip to the Chrome Web Store. The user does that after `t23-try-on-my-wall` and T24 are live.

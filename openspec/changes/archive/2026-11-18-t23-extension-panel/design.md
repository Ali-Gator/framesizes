# Design

## Context

See `proposal.md` for the scope and the split. What this change builds on:

- **G1** (`apps/web/src/components/gallery-wall/`):
  - `GalleryWall` is a client island with its own `useReducer` over `state.ts`, wrapped in `WidgetCard`.
  - It lays itself out by container queries (`gallery.css`, `@container (min-width: 860px)`), so the same component is the 360 panel and the wide tab.
  - Its Next-only imports are `next/dynamic` (the Nail marks view) and, through `components/ui/button.tsx`, `next/link`.
- **F2's photo flow** (`frames-on-wall/photo-flow.tsx`, `state.ts`):
  - The photo is an object URL in `PhotoSlice.photo.url`, revoked by `usePhotoFile` when the URL changes.
  - Scale, marks and floor are plain numbers.
- **Units** (`apps/web/src/lib/unit.ts`):
  - `useUnit` and `setUnit` keep the choice in `localStorage["unit"]` and follow other tabs through the `storage` event.
  - `<html data-unit>` drives `<U>`. On the site, an inline head script sets it.
- **Tooling:**
  - `vitest.config.ts` already aliases `@/` to `apps/web/src`, pins the automatic JSX runtime, and includes `apps/*/src/**/*.test.{ts,tsx}`.
  - Vitest installs Vite.
  - `pnpm -r typecheck` runs every package's `typecheck` script.
- **The canvas** (https://claude.ai/artifact/WUq26q5aNBxfiKUTYcaCwv):
  - Boards e, f, g, e2, PanelHead, h and k belong to this change.
  - The `ext.css` classes `x-ptool`, `x-wallsel`, `x-saved` and `x-ibtn` are the toolbar.
- **MV3 constraints:**
  - Extension pages run under `script-src 'self'`, so they can have no inline scripts and no remote code.
  - The service worker can be an ES module.
  - `chrome.sidePanel` needs Chrome 114+, and `sidePanel.open` (used by the shop flow) needs 116.

## Goals / Non-Goals

**Goals:**

- One planner. The extension renders G1's own component and reducer, so a G1 fix lands in the panel with no copy to update.
- G1 stays as it is on the site. The new props default to today's behaviour, and the existing G1 unit and e2e tests run unedited.
- Nothing leaves the device. The extension needs no permissions beyond the side panel.

**Non-Goals:**

- The shop flow (`t23-try-on-my-wall`), the T24 page and section, sync, the v2 room (BL-51), and dark theme.
- Several saved walls. There is one wall per Chrome profile.

## Decisions

### 1. `apps/extension`, built by Vite

- **Layout:** a new workspace app.
  - `package.json`, `vite.config.ts` and `tsconfig.json`.
  - The two HTML entries, `sidepanel.html` and `tab.html`.
  - `public/manifest.json` and `public/icons/`, copied as they are.
  - `src/`, with the README row `apps/extension/src/**` added at archive.
- **Build:** `vite build` with three inputs: the two pages and `src/background.ts`. The background entry is emitted as `background.js` (a fixed `entryFileNames` for it) and declared `"type": "module"`.
- **JSX:** Vite's own `oxc` transform with `jsx.runtime: "automatic"`, as `vitest.config.ts` does, so there is no React plugin.
- **Tailwind:** `@tailwindcss/postcss` through a `postcss.config.mjs`, as in `apps/web`.
- **Scripts:** `build` and `zip`. `zip` packs `dist/` into `gallery-wall-layout-generator.zip`, which is gitignored.
- **Alternatives:**
  - Next static export: rejected. It inlines bootstrap scripts that MV3's CSP blocks, and it has no service worker entry.
  - An extension framework (WXT, CRXJS): rejected. It is a new framework for three entries.
  - Plain esbuild: rejected. It is not installed, and it has no HTML or PostCSS pipeline.
  - Vite is already in the lockfile through Vitest, so it adds no new package.

### 2. G1's code is imported in place, with two Next shims

- **Imports:** the extension imports `@/components/gallery-wall/gallery-wall`, `@/components/site/unit-toggle`, `@/lib/unit` and the CSS straight from `apps/web/src`. The `@/` alias is the same in `vite.config.ts` and in the extension's `tsconfig.json` paths.
- **Shims:** `next/dynamic` and `next/link` are aliased to two small files in `apps/extension/src/shims/`:
  - `next/dynamic` becomes `React.lazy` inside `Suspense`;
  - `next/link` becomes a plain `<a>`.
  - The extension never renders a link to a site page in this change.
- **Tailwind:** v4 detects sources from the CSS file's location. So the extension's stylesheet adds `@source "../../web/src";` beside its own `src`.
- **Alternatives:**
  - Move G1 and F2 into a `packages/wall-ui`. Rejected for now. It rewrites imports in existing tests, which needs the user's approval for every file, and it moves two README rows. Revisit when a third consumer appears.
  - Replace `next/dynamic` in G1 with `React.lazy`. Rejected. It changes G1's code splitting on the site for the extension's sake.
- **Risk:** a Next-only import added to G1 later breaks the extension build. The e2e run builds the extension on every push (decision 8), so it fails in CI, not in the store.

### 3. `GalleryWall` gains optional props, defaults unchanged

```ts
interface GalleryWallProps {
  variant?: "page" | "panel" | "tab"; // default "page"
  state?: PlannerState; // controlled, with dispatch
  dispatch?: Dispatch;
}
```

- **`panel`:**
  - `WidgetCard` renders with no title.
  - It gets a `wf-panel` class that removes the card's border, radius and outer padding, per canvas note "dPanel".
- **`tab`:** drops the title only. The container query gives the desktop layout.
- **Controlled mode:** when `state` and `dispatch` are both given, the component uses them. Its own `useReducer` still runs, so hook order never changes, but it is ignored.
- `WidgetCard`'s `title` becomes optional. It lives in `components/ui`, which is exempt.
- **Alternative:** a separate panel component. Rejected. It would copy the island's 900 lines.

### 4. The saved wall: one IndexedDB record plus a BroadcastChannel

- **Store:** `src/saved-wall.ts` keeps one record, `{ v: 1, planner: SavedPlanner, photo: SavedPhoto | null }`, in an IndexedDB database `gallery-wall` on the extension's origin. `SavedPhoto` is `{ blob, width, height, known, marks, floor, scale }`.
- **A write with no photo in the planner** (the sample room, or the upload step) keeps the record's `photo` as it is. Only a newly scaled photo replaces it. So "Sample room" never deletes the saved photo (decision 5).
- **Pure helpers**, unit-tested:
  - `toSaved(state)` keeps the planner fields the spec lists. It drops the open picker, dialogs, drafts and `photo.url`.
  - `fromSaved(record, photoUrl)` rebuilds a `PlannerState` and closes every dialog.
  - A record with another `v` is ignored, and the planner starts fresh.
- **The photo Blob** is read once with `fetch(photo.url)` whenever the URL changes. That is a `blob:` URL, a local read, and it is written with the record.
  - On load, `URL.createObjectURL(blob)` makes a fresh URL, because the old one died with its page.
  - `usePhotoFile` revokes that URL as it does on the site.
- **Writes** run 300 ms after the last change. After each write, the page posts `{ from: <page id> }` on `BroadcastChannel("gallery-wall")`. The other open page re-reads the record and dispatches `load`. A page ignores its own posts. This is how the panel and the tab share one wall (spec: "The panel and the tab show one wall"). The last write wins.
- **No echo:** a state change that comes from `load` or from the first restore schedules no write. An object URL the page made from the stored Blob counts as already saved, so its Blob is not read or written again. Without this rule the two pages would write back and forth forever.
- On the first write the page calls `navigator.storage.persist()`.
- **Alternative:** `chrome.storage.local` with `onChanged`. Rejected:
  - It needs the `storage` permission.
  - It stores the photo as base64, about 1.33 times the bytes.
  - It has a 10 MB quota without `unlimitedStorage`, and one phone photo can come near that.
- **Alternative:** `localStorage`. Rejected for the same quota and for being synchronous.

### 5. The wall select: an extension wrapper and one new G1 action

- **Wrapper state:** `src/use-wall.ts` holds `{ planner: PlannerState; ready: boolean }` around G1's `reducer`. Its own actions are `load` and the select's two choices.
- **The select reads** "Sample room" when `planner.mode === "sample"`, and "My wall photo" otherwise. The upload and scale steps count as "My wall photo".
- **"Sample room"** dispatches G1's `toSample`. The saved record keeps its `SavedPhoto` (decision 4), so leaving the photo never deletes it.
- **"My wall photo":**
  - With a saved photo, the wrapper makes a fresh object URL from the Blob. It then dispatches a new G1 action, `restorePhoto`, which carries `{ photo, known, marks, floor, scale }`. That action sets the photo slice in `photo` mode and lays the template out again, by the same path `setScale` takes.
  - With no saved photo, it dispatches G1's `upload`.
- `restorePhoto` is additive. G1's page never dispatches it.
- **Alternative:** make G1's `toSample` keep the photo in its state. Rejected:
  - `usePhotoFile` revokes the URL anyway.
  - The site's upload step would start offering the old photo, which is a G1 behaviour change no one asked for.

### 6. Units reuse the site's mechanism

- **Toolbar control:** `UnitToggle` from `components/site/unit-toggle.tsx`, as it is.
- **Sharing:** `localStorage["unit"]` and the `storage` event already work across extension pages of one origin. That covers the spec's panel-and-tab sharing and persistence with no new code.
- **First paint:** each page entry sets `document.documentElement.dataset.unit` from `localStorage` before the first `createRoot().render`. This replaces the site's inline head script, which MV3's CSP forbids.
- This is the site's mechanism reused, not a second one (constitution: one mechanism per concern).

### 7. The background service worker

`src/background.ts` holds pure handlers, exported for tests, and wires them to `chrome.*` at the bottom.

- **`onInstalled` (every reason) and `onStartup`:**
  - `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })`.
- **`onInstalled` with `reason === "install"`:**
  - `chrome.action.getUserSettings()`, then `chrome.tabs.create` on the how-to URL with `?pinned=1|0`.
  - `tabs.create` needs no permission.
- **`onMessageExternal`:**
  - Check that `sender.origin === "https://framesizes.app"`. `externally_connectable` already limits who can send, and this is a second check.
  - For `{ type: "status" }`, reply `{ installed: true, pinned, version }`, with `version` from `chrome.runtime.getManifest().version`. Return `true` to keep the channel open for the async `getUserSettings`.
  - Anything else gets no reply.
- **"Open full size"** (in the panel): `chrome.tabs.create({ url: chrome.runtime.getURL("tab.html") })`.

### 8. Manifest and icons

- **Manifest (`public/manifest.json`):**
  - `name`, `description` (the short description, copied from the store listing doc), `version` `0.1.0` and `minimum_chrome_version` `116`.
  - `action`: `default_title` and `default_icon`, with no popup.
  - `side_panel.default_path`: `sidepanel.html`.
  - `background`, `icons`, `permissions: ["sidePanel"]`, and `externally_connectable`.
- **Icons:** `apps/extension/icon.svg` is board k's mark. `scripts/extension-icons.mjs` renders it to `public/icons/icon-{16,32,48,128}.png` with `sharp`, resolved from `apps/web`, where Next already installs it. The stroke widths follow board k: 4.5, 4.5, 5 and 6 units for 128, 48, 32 and 16 px. The script is run once and the PNGs are committed.

### 9. G1 backlog items

- **BL-52:** with the group selected, the selection block lists `sizesOf(frames)`, largest first. "Change" opens the picker in a new `group-size` mode. Picking dispatches `changeSize` for the first frame of that size with the "also the others" option on, so it reuses the existing rule.
- **BL-53:** `.g-tpl` gets 6 px padding. The thumb's SVG is sized by `max-width` and `max-height: 100%` with its aspect ratio kept.
- **BL-54:** the nail table drops the `.fs-table` 600 px floor inside `.g`. Columns shrink, and the mono numbers keep `white-space: nowrap`.
- **BL-48:** `toSample` with no photo held, which means the visitor is still in the upload step, changes only `mode`. It skips `relaid`.

### 10. Tests

- **Unit tests (Vitest)**, each new file citing its scenario:
  - `apps/extension/src/__tests__/manifest.test.ts`: reads `public/manifest.json`, and the PNG sizes from each file's IHDR bytes.
  - `background.test.ts`: a fake `chrome` object records the calls.
  - `saved-wall.test.ts`: the `toSaved` / `fromSaved` round trip, and that dialogs are dropped.
  - G1's `restorePhoto`, BL-48 and BL-52 reducer cases go in a new `gallery-wall/__tests__/state-extension.test.ts`, so no existing test file is edited.
- **E2E:**
  - `e2e/extension.spec.ts` uses `chromium.launchPersistentContext` with `channel: "chromium"` and `--load-extension=apps/extension/dist`. The default headless shell does not load extensions; check this against Playwright's docs at apply, and check that `playwright install chromium` in `e2e.yml` installs that build. It takes the extension id from the service worker's URL and opens `chrome-extension://<id>/sidepanel.html` at 360 × 800 and `tab.html`.
  - `context.route("https://framesizes.app/**")` answers the install tab locally. So CI never hits the live site, and the spec can assert `?pinned=0`.
  - BL-52, BL-53, BL-54 and BL-48 on the site go in a new `e2e/gallery-wall-panel-fit.spec.ts`.
- **Build:** the root `test:e2e` becomes `pnpm --filter extension build && playwright test`, so CI and local runs always test a fresh build. `e2e.yml` needs no edit.
- **Lint:** ESLint's react-hooks block widens from `apps/web/**` to `apps/{web,extension}/**`. The Next plugin stays on `apps/web`.

## Risks / Trade-offs

- **The side panel can be narrower than 360**, since the user can drag it down to about 320. → G1 already holds "no sideways scroll at 320" on the site, and the same CSS applies. The e2e test checks 360, the designed width.
- **The panel and the tab edit at once.** → The last write wins, and the other page reloads its state. A drag in progress in the other page can jump. That is acceptable for one person with two views.
- **IndexedDB data is lost on uninstall.** → Accepted, and the saved line says "on this device". Sync is the later answer.
- **One icon set for light and dark toolbars.** → The ink square is low-contrast on a dark toolbar, though the white mark stays visible. Board k's grey edge for dark toolbars needs `setIcon` per theme, which is left out until it looks wrong in practice.
- **Cross-app imports** couple the extension to `apps/web` internals. → The CI build catches breakage. Decision 2 says when to extract a package.
- **The how-to URL returns 404 until T24.** → The extension is not uploaded until T24 is live (proposal, Sequencing).

## Migration Plan

Nothing is deployed to visitors by this change except G1's four backlog fixes, which ship with the site as usual. The extension is built and zipped. Uploading it to the Web Store is the user's step, after `t23-try-on-my-wall` and T24. Rollback is reverting the merge. No data is migrated.

## Open Questions

- **The `version` for the first store upload.** It stays `0.1.0` until the user uploads, and they may bump it then.

# Design

## Context

Triage of five open backlog items in the extension and its page, investigated read-only on `origin/main` at `2fc26d8`. Two more (BL-68, BL-69) were investigated and left for the next batch; see proposal.md.

| Id    | Lane     | Why                                                                                                          |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------ |
| BL-73 | A        | Same shape as BL-64's print fix; no existing test asserts a literal added-frame id                           |
| BL-79 | A        | A client gate plus `next/dynamic` keeps the server HTML; no existing test changes                            |
| BL-63 | A        | Playwright 1.65 treats `aria-disabled="true"` on a button as disabled, so every existing assertion holds     |
| BL-67 | B        | Whether the menu item shows on links is a product call; one existing unit test pins `["image"]`              |
| BL-76 | C        | No approved right-to-left pin picture existed; an exact mirror is wrong (text, mark, numbers)                |
| BL-68 | left out | Fixable (A), dormant until go-live; ships with BL-69 next batch                                              |
| BL-69 | left out | Fixable (B: `mode-switch.test.tsx` "asks nothing while the tab is hidden" needs an edit); same code as BL-68 |

## Goals / Non-Goals

**Goals:** the five fixes below, each test-first, with no new extension permission and no change to the web planner's behaviour.

**Non-Goals:** the right-click figure on `/ar/` (BL-80, logged in triage); measuring the screen crop on real shops (BL-62); the pin-mode URL and the hidden-tab poll (BL-68, BL-69).

## Members

### BL-73 — unique ids for added frames

`applyPicker` in add mode makes `a${state.nextId}` (`apps/web/src/components/gallery-wall/state.ts:694`), and the extension dispatches it as is (`apps/extension/src/use-wall.ts:287`). A page that skipped a reload (a pending change, or the upload/scale flow, `use-wall.ts:235-249`) shares `nextId` with another page, so both make the same `aN`. Fix as BL-64 did for prints (commit 4c5f0d1): the `applyPicker` action gains an optional `id`; the reducer uses `action.id ?? \`a${state.nextId}\``and still bumps`nextId`; the extension's `dispatch`adds`a${nextId}-<8 chars of crypto.randomUUID()>`to`applyPicker`in add mode, through one helper shared with`addPrint` (`use-wall.ts:305`). G1 on the web (`gallery-wall.tsx:984`) sends no id and keeps `a1, a2…`. `saved-wall.ts`stores ids as opaque strings, so old walls load. Picker frames have no picture, so no`art:` key changes.

Files: `state.ts`, `use-wall.ts`.

### BL-79 — load the picker only where it shows

`SiteHeader` (`apps/web/src/components/site/site-header.tsx:3,48`) imports `LanguagePicker` statically; the root layout is its only caller, so every route loads the picker module (~2.4 KB gz), `picker-copy.ts` (~3.6 KB gz) and its global CSS (~1.6 KB gz), and decides only after hydration to render nothing. Fix: a new `"use client"` `apps/web/src/components/i18n/language-picker-gate.tsx` reads `usePathname`, runs `localeOf` and `translatedPage`, and only then renders the picker through `next/dynamic(() => import("./language-picker"))` with SSR left on. **Never `ssr: false`**: translated pages must keep the button in their static HTML, or the phone header row (tightened by `has-[.lp-trig]`) jumps at hydration. `language-picker.tsx` keeps its own null guard (`:48`, `:52`), so `language-picker.test.tsx` holds unedited. `lib/locales.ts` stays loaded on every page (the gate needs it); that is accepted. In-repo precedent for `next/dynamic` inside a client component: `components/gallery-wall/gallery-wall.tsx:63`. Whether Turbopack splits a dynamic module's CSS out of the shared stylesheet is unverified; the new e2e proves it, and if the CSS stays shared, move the picker's CSS import so it is only reached through the dynamic module.

Files: `site-header.tsx`, new `language-picker-gate.tsx`.

### BL-63 — waiting buttons keep focus

"Hang it on my wall" (`apps/extension/src/try/size-step.tsx:135`, `disabled={reason !== null}`) and "Add to my layout" (`apps/extension/src/try/hang-view.tsx:293`, `disabled={full}`) switch to `aria-disabled={… || undefined}`. Both already carry `aria-describedby` to their `role="status"` reason line. **Both click guards are required:** the reducer's `"hang"` case (`try-reducer.ts:66-67`) sets `step: "hang"` with no size check, and `panel.tsx:54-57` calls `trial.clear()` after `wall.addPrint`, which quietly refuses at 12 frames, so an unguarded press reaches the hang step with no size or loses the print. Each `onClick` returns early while waiting. CSS: `apps/extension/src/extension.css:303-307` gets an `[aria-disabled="true"]` twin of `.x-pbody .fs-btn:disabled`, plus an override cancelling `.fs-btn:active { transform }` (`widgets.css:27`) for it. The shared `button.tsx` and `widgets.css` stay untouched (the web app uses them).

Files: `size-step.tsx`, `hang-view.tsx`, `extension.css`.

### BL-67 — "Try on my wall" on links

`registerMenu` (`apps/extension/src/background.ts:75,107-112`) registers `contexts: ["image"]`; `readPage` (`read-page.ts:37-39`) matches `srcUrl` against `document.images`. Desenio's print is a `background-image` on a `div` inside an `<a>`, so Chrome offers the link menu and no `srcUrl`. Fix per Decision 1: one item on `["image", "link"]` (two items would collapse into a submenu, and the spec says one item). `onMenuClick` passes `info.srcUrl` and `info.linkUrl` to `readPage`. With a `srcUrl`, today's path. With only a `linkUrl`, `readPage` finds the `a` elements whose `href` equals it, takes the largest visible one, and looks inside it (itself first, then descendants) for an `<img>` (its `currentSrc`) or a computed `background-image: url(…)`; it returns the found URL and that element's box in `PageRead`. `onMenuClick` fetches the returned URL instead of a blind `srcUrl`, falling back to the crop as today. No picture found → the try opens with `image: null` (the size step already handles it). `naturalWidth` is unknown for a background, so `shape` is null; `panel.tsx:38` already falls back to the loaded picture. The background element's box can differ from the image under `cover`/`contain`; accepted, and BL-62 stays open for the crop. `manifest.test.ts` is unchanged and still proves no permission was added.

Files: `background.ts`, `read-page.ts`; after archive, the code-map comment "one image item" in `openspec/specs/gallery-wall-extension/spec.md:20`.

### BL-76 — right-to-left pin picture

`PinPicture` (`apps/web/src/components/extension/pin-picture.tsx:55-245`) is one hand-placed 880 × 400 SVG; `how-to.tsx:116` passes no direction although `lang.dir` is in scope at `:94`; `extension.css:28-32` forces `direction: ltr` with a "never mirror" comment. Fix: `PinPicture` takes `dir`; `"rtl"` renders the m-rtl geometry from the approved canvas, `"ltr"` today's drawing unchanged. Render one SVG per page (the `pp-win`, `pp-arrow`, `pp-shadow` ids are document-global), so never both variants toggled by CSS. `MarkIcon` and `Marker` are drawn unflipped; text is placed explicitly (`text-anchor`) so the `direction: ltr` rule can stay, with its comment reworded. `copy/ar.ts:3` comment only. Arabic is the only right-to-left locale (`locales.test.ts:40`).

Design (Decision 3): canvas https://claude.ai/artifact/XHTeX8iuNAKsHAZY7XqzoZ, version 1795252334-f2f2, boards "m-rtl — Pin picture, Arabic Chrome" (`Main.dc.html`, 880 × 400), "m-rtl at 375 page width (RTL page)" and "m-rtl at 1280 page width (RTL page)". Its note, from Chromium source: back, forward, reload and side-panel icons flip (back rightmost, pointing right); the puzzle piece does not flip; board m's window dots move with the mirror. Text, the brand mark and the numbers 1 and 2 are not mirrored. **Approved:** the user, 2026-11-21 (recorded in CLAUDE.md "Design source").

Files: `pin-picture.tsx`, `how-to.tsx`, `extension.css` (comment), `copy/ar.ts` (comment); after archive, `openspec/specs/extension-site/spec.md` Behavior paragraph (":48", "The drawings stay left to right…") and the BL-76 Edge Case bullet (":57").

## Decisions

### 1. BL-67 — which contexts show "Try on my wall"

- **Options:** (a) one item on `["image", "link"]`, and `readPage` finds the anchor by `linkUrl`, then an `<img>` or a computed `background-image` inside it; (b) keep `["image"]` only and record the limitation.
- **Trade-off:** (a) fixes Desenio-style shops with no new permission, but the item shows on every link on the web; on a non-print link the try opens with no picture; background-image prints mostly come from the screen crop (BL-62's unmeasured race), which can be cut off or letterboxed with `cover`/`contain`. (b) keeps the menu quiet but those shops stay unsupported. A content script was rejected: it needs all-sites access.
- **Recommendation:** (a) — the promise is "right-click a print on any shop".
- **Answer:** (a) images + links (user, 2026-11-21)

### 2. BL-67 — edit to an existing test

- `apps/extension/src/__tests__/menu.test.ts` "is one item on images on http and https pages…" (lines 75-87) pins `contexts: ["image"]`; it changes to `["image", "link"]`, and the `INFO` fixture gains a `link` variant (no `srcUrl`, a `linkUrl`).
- **Recommendation:** approve (only if decision 1 is (a)).
- **Answer:** approved (user, 2026-11-21)

### 3. BL-76 — who draws the right-to-left pin picture

- **Options:** agent draws an RTL board beside board m on the T24 canvas; the user draws it.
- **Rule for the draw:** geometry flips (toolbar order, puzzle button and Extensions menu on the left, tab strip, arrows, markers); text, the brand mark and the numerals 1 and 2 do not flip.
- **Recommendation:** agent draws it.
- **Answer:** the user draws it (user, 2026-11-21). Drawn as its own canvas, m-rtl (link above), approved 2026-11-21.

### 4. Edit to `manifest.test.ts` after the "Add locales" commit

- Commit a4cbd65 (the user's Chrome Web Store translations) moved the manifest's name and description to `__MSG_appName__` / `__MSG_shortDesc__`, breaking "carries the name and the icons…" (`apps/extension/src/__tests__/manifest.test.ts:45-46`) and leaving the 132-character check measuring a placeholder.
- Edit: the test expects the `__MSG_` keys and `default_locale: "en"`, and checks `_locales/en`'s `appName` and the 132-character limit on its `shortDesc`. Other locales exceed the limit; logged as BL-81, not fixed here.
- **Answer:** approved (user, 2026-11-21)

## Risks / Trade-offs

- BL-67 shows "Try on my wall" on every link on the web; a non-print link opens an empty try. Accepted in Decision 1.
- BL-67 background pictures from a cross-origin CDN without CORS go down the crop path, whose timing is unmeasured (BL-62, still open).
- BL-79 keeps `lib/locales.ts` (~2.7 KB gz) on every page; only the picker, its copy and CSS go.
- BL-79 CSS splitting by `next/dynamic` is unverified until the new e2e runs on a build.
- **Bullet correction (BL-76):** the bullet says "draw a mirrored variant"; an exact mirror is wrong, because text, the brand mark, the numbers and the puzzle-piece icon must not flip (Chromium source, per the canvas note).

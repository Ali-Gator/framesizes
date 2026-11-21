# Proposal

## Why

Five gaps in the extension and its page. Two extension pages that have not reloaded can give two frames from "Add a frame" the same id, so the selection or a hanger lands on the wrong frame. On Desenio and other shops that draw the print as a CSS background inside a link, "Try on my wall" never appears. The two waiting buttons of the try ("Hang it on my wall", "Add to my layout") use native `disabled`, so a keyboard user never reaches them to hear why they wait. On `/ar/`, the pin picture shows left-to-right Chrome while the Arabic text says the puzzle piece is at the top left. And every page of the site loads and hydrates the language picker, its 28-language strings and its CSS, only to render nothing on pages without translations.

## What Changes

- **Unique ids for added frames (BL-73).** A frame added with "Add a frame" in the extension gets an id unique to the page that adds it, as prints already do since BL-64. The web planner keeps `a<n>`. Walls saved with earlier ids keep loading.
- **"Try on my wall" on links too (BL-67).** The one menu item shows on images and on links. On a link, the page read finds the link by its address and takes the picture inside it: an `<img>`, or a CSS `background-image` on the link or an element inside it. No new permission. A link with no picture opens the try with no picture and the sizes from the page text.
- **Waiting buttons stay in the Tab order (BL-63).** "Hang it on my wall" and "Add to my layout" wait with `aria-disabled="true"` instead of `disabled`: they keep focus, are still described by the line that says why, look as they do today, and do nothing when pressed.
- **Right-to-left pin picture for Arabic (BL-76).** `/ar/` draws the pin picture as Arabic Chrome looks: toolbar, tab strip, Extensions menu, arrows and markers mirrored; the puzzle piece, text, brand mark and the numbers 1 and 2 not mirrored. Design: m-rtl canvas, approved. Every other language keeps the left-to-right drawing.
- **The picker loads only where it shows (BL-79).** The header mounts a small gate that loads the picker only on pages with translations. Translated pages keep the button in their static HTML; other pages load none of the picker's code or CSS.

## Members

| Id    | Title                                                  | Lane                                                                                |
| ----- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| BL-73 | Frames from "Add a frame" can share an id across pages | A                                                                                   |
| BL-79 | The language picker ships on every page                | A                                                                                   |
| BL-63 | A waiting button leaves the Tab order                  | A                                                                                   |
| BL-67 | No "Try on my wall" where the print is not an `<img>`  | B, decided: images and links (Decision 1); one unit-test edit approved (Decision 2) |
| BL-76 | Mirrored pin picture for Arabic Chrome                 | C, design approved: m-rtl canvas, version 1795252334-f2f2 (Decision 3)              |

**Parked:** none. Every member investigated is planned or left out below.

**Left out (stay open, untouched):** BL-68 (a reload after the self-switch shows the pin steps again) and BL-69 (the pin poll wakes every 2 s in a hidden tab). Both are fixable (BL-68 lane A; BL-69 lane B, one existing unit test to edit), but neither can happen until go-live sets `EXTENSION_ID`, and both edit the same `useEffect` and test file in `mode-switch.tsx`, so they ship together in the next batch. Seven fixes exceed the ceiling of five.

**Base branch:** `origin/main` at `2fc26d8` (PR #28 merged, t25). The batch branch is `backlog-6`. This triage logged BL-80 (the right-click figure has the same left-to-right issue on `/ar/`) and moved `_Next id:_` to BL-81.

**Approved test edits:** one, approved by the user on 2026-11-21.

- `apps/extension/src/__tests__/menu.test.ts:75-87`, "is one item on images on http and https pages…" (Decision 2). It pins `contexts: ["image"]`; it changes to `["image", "link"]`, and the `INFO` click fixture gains a link variant (a `linkUrl`, no `srcUrl`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `gallery-wall-extension`: added frames get page-unique ids; "Try on my wall" shows on links and finds the picture inside them; waiting try buttons stay focusable.
- `extension-site`: the Arabic version draws the pin picture for right-to-left Chrome.
- `site-shell`: a page without translations loads no language-picker code.

## Impact

- BL-73: `apps/web/src/components/gallery-wall/state.ts` (`applyPicker` action takes an optional `id`), `apps/extension/src/use-wall.ts` (`dispatch` adds the id; share the id helper with `addPrint`). G1 on the web sends no id and is unchanged.
- BL-67: `apps/extension/src/background.ts` (`registerMenu` contexts, `onMenuClick` passes `linkUrl`, fetches the URL `readPage` returns), `apps/extension/src/read-page.ts` (link lookup, `background-image`, the found URL in `PageRead`). `manifest.test.ts` stays as it is and proves no permission was added.
- BL-63: `apps/extension/src/try/size-step.tsx`, `apps/extension/src/try/hang-view.tsx`, `apps/extension/src/extension.css`. The shared `button.tsx` and `widgets.css` stay untouched.
- BL-76: `apps/web/src/components/extension/pin-picture.tsx` (a `dir` input and the RTL geometry), `how-to.tsx` (passes `lang.dir`), `extension.css` comment; the permanent `extension-site` spec's Behavior paragraph and Edge Case bullet.
- BL-79: `apps/web/src/components/site/site-header.tsx`, a new `apps/web/src/components/i18n/language-picker-gate.tsx`. `language-picker.tsx` keeps its own null guard.
- Backlog: BL-63, BL-67, BL-73, BL-76 and BL-79 are deleted when this ships.

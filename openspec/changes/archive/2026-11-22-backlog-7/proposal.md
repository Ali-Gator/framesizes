# Proposal

## Why

Seven small gaps across F3, the header, analytics, the extension and its page. On F3 a desktop visitor whose browser blocks storage reads "Saved on this device." though the check is gone on the next visit, and a tablet is offered monitor sizes (13.3 to 32 in) while its own guess is 11 in. The F3 edge hint's re-measure has no test. Moving in the app from `/` to the extension page makes the language button pop in and shift the Units toggle (CLS). The Privacy Policy's "no location" rests only on a dashboard setting that does not remove location. A reload after the extension page switches itself to usage mode shows the pin steps again. The extension's toolbar tooltip stays English in all 28 languages.

## What Changes

- **F3 says when a check is only kept for this visit (BL-91).** `saveCheck` reports whether storage took the check; the desktop status reads "Kept for this visit." when it did not, and "Saved on this device." only when it did.
- **F3 offers tablet screen sizes (BL-92).** A tablet (coarse pointer, not a phone, shorter side at most 1,100 CSS px: the same rule that guesses 11 in) gets 8.3, 10.2, 10.9, 11, 12.4, 12.9 and 13 in. The size engine exports that rule as `isTabletScreen`.
- **F3's edge hint re-measure is tested (BL-95).** A new DOM test stubs `ResizeObserver`, narrows the strip and expects the hint. Test only.
- **The language button keeps its place on an in-app move (BL-84).** The gate's `next/dynamic` gets an invisible, same-size placeholder, so the header does not reflow when the picker's code arrives.
- **Analytics events ask for no location (BL-86).** `before_send` adds `$geoip_disable: true` to every event, and a unit test pins it with `cookieless_mode: "always"`. The bullet's own fix (drop `$ip` in `before_send`) does nothing, because PostHog takes the IP from the request; whether PostHog keeps no IP stays a server-side matter, now BL-97.
- **The self-switch drops `pinned` from the address (BL-68).** When the poll sees the button pinned, `history.replaceState` removes `pinned`, keeping the hash and every other parameter, so a reload opens in usage mode.
- **The toolbar tooltip is translated (BL-83).** `action.default_title` becomes `__MSG_appName__`, like `name`.

## Members

| Id    | Title                                                    | Lane                                                                  |
| ----- | -------------------------------------------------------- | --------------------------------------------------------------------- |
| BL-91 | F3 says "Saved on this device." when storage is blocked  | A                                                                     |
| BL-95 | F3 edge hint's re-measure is untested                    | A                                                                     |
| BL-84 | The language button pops in on a client-side move        | A                                                                     |
| BL-86 | Guard the "no IP address, no location" claim in code     | A (location half; the IP half is BL-97, gated)                        |
| BL-68 | A reload after the self-switch shows the pin steps again | A                                                                     |
| BL-92 | F3 screen sizes for tablets                              | B, decided: 8.3–13 in, 7 chips (Decision 1)                           |
| BL-83 | The toolbar tooltip stays English                        | B, decided: one existing assertion in `manifest.test.ts` (Decision 2) |

**Batch size:** seven fixes. The user raised the ceiling from five to seven for this batch ("you can pick up to 7 if they are small enough", 2026-11-21).

**Parked:** none.

**Investigated, not taken (stay open, untouched):** both are lane C and fall outside the cap of seven.

- BL-80 (mirrored right-click figure for Arabic): the approved m-rtl canvas holds only the pin picture (boards Main, Phone375, Desktop1280, each the pin picture), so the right-to-left right-click figure is undrawn. Once drawn, the fix is CSS only: drop `direction: ltr` on `.ext-fig-shop` (`extension.css:103`) and turn the `left:` offsets (`:110`, `:117`) into `inset-inline-start`; `MenuFigure` inherits `dir` from the X1 wrapper. Only `ar` is right to left.
- BL-94 (F3 says nothing when a typed size is ignored): the note's copy, place and colour are undrawn on the F3 canvas (v18 approved with "no other feedback"), and the timing needs a call: on a desktop the first digit of most sizes is already out of range (1920 × 1080 accepts about 9.2 to 36.7 in), so a note driven by the raw value would flash and be announced on most keystrokes. `.as-edge` (polite, kept space) is the pattern to reuse.

**Base branch:** `origin/main` at `78c62b6` (PR #32 merged, t3). The batch branch is `backlog-7`. This triage logged BL-96 (the owner's note on translated store listings, gated on Chrome Web Store approval, rewritten in English) and BL-97 (the IP half of BL-86, gated on DNS live), and moved `_Next id:_` to BL-98.

**Approved test edits:** one, approved by the user on 2026-11-21.

- `apps/extension/src/__tests__/manifest.test.ts:54`, in "carries the name and the icons at 16, 32, 48 and 128 px": `expect(manifest.action.default_title).toBe(NAME)` becomes `.toBe("__MSG_appName__")` (Decision 2).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `actual-size`: the desktop status says whether a check was saved; the screen-size step has a tablet list.
- `size-engine`: the tablet rule behind the 11 in guess is exported as `isTabletScreen`.
- `site-shell`: the header keeps the language button's space on an in-app move; analytics events ask for no location.
- `extension-site`: the self-switch drops `pinned` from the address.
- `gallery-wall-extension`: the toolbar tooltip is the translated name.

## Impact

- BL-91: `apps/web/src/components/actual-size/saved.ts` (`saveCheck` returns a boolean; new `checkStored()`; `loadCheck` unchanged), `actual-size.tsx` (init effect, `done`, `Desk` status).
- BL-92: `packages/sizes/src/screen.ts` (`isTabletScreen`, used by `guessDiagonal`), `packages/sizes/src/index.ts`, `apps/web/src/components/actual-size/check.tsx` (`TABLET_DIAGONALS`, `Diagonals` takes a tablet flag), `actual-size.tsx:296-302, 498-504`.
- BL-95: `apps/web/src/components/actual-size/__tests__/actual-size.test.tsx` (new test only).
- BL-84: `apps/web/src/components/i18n/language-picker-gate.tsx`; `e2e/extension-page-locales.spec.ts` (new test).
- BL-86: `apps/web/src/instrumentation-client.ts`; new `apps/web/src/__tests__/instrumentation-client.test.ts`.
- BL-68: `apps/web/src/components/extension/mode-switch.tsx`; `__tests__/mode-switch.test.tsx` (new test).
- BL-83: `apps/extension/public/manifest.json`, `apps/extension/src/__tests__/manifest.test.ts`. The committed `gallery-wall-layout-generator.zip` is not rebuilt here: the tooltip reaches users with the next store upload.

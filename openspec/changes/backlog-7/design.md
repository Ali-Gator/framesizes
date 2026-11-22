# Design

## Context

Seven independent fixes in five capabilities; see proposal.md for why. Lanes:

| Id    | Lane   | Why                                                                              |
| ----- | ------ | -------------------------------------------------------------------------------- |
| BL-91 | A      | Copy given by the bullet; same status slot, nothing to draw                      |
| BL-95 | A      | Test only; cites an existing scenario                                            |
| BL-84 | A      | Invisible placeholder, nothing to draw                                           |
| BL-86 | A      | Location half only; the bullet's `$ip` fix is a no-op (correction below)         |
| BL-68 | A      | Three lines and a new test; no existing assertion changes                        |
| BL-92 | B      | The tablet list is a product call (Decision 1); the chips reuse the existing row |
| BL-83 | B      | Changes an existing assertion (Decision 2)                                       |
| BL-80 | C, out | Right-to-left right-click figure is undrawn; over the cap of seven (proposal.md) |
| BL-94 | C, out | Note copy, place and timing are undrawn; over the cap of seven (proposal.md)     |

## Per member

**BL-91.** `saveCheck` (`apps/web/src/components/actual-size/saved.ts:59-66`) returns `true` when `setItem` succeeded and `false` when it threw (the check still goes to the module-level `memory`). `loadCheck` keeps its signature and return value (`saved.test.ts` asserts them); a new export, `checkStored()`, says whether the check `loadCheck` or `saveCheck` last handled came from storage (false when it lives only in `memory`), so a viewer that re-inits from `memory` (a client-side move away and back, or a pixel-ratio change and back) still knows it was not stored. `ActualSizeViewer` keeps a `stored` flag in `useState` (init effect `actual-size.tsx:436-445`, `done` at `:471`) and passes it to `Desk` (`:218-230`, rendered at `:532`), whose status (`:322-324`) reads "Saved on this device." when stored and "Kept for this visit." when not. The phone flow has no saved status and is unchanged. `state.ts` is unchanged. The new string goes through `humanizer:humanizer` before commit (CLAUDE.md); keep it short and in the same voice as "Saved on this device.".

**BL-92.** Lift the 11 in condition out of `guessDiagonal` (`packages/sizes/src/screen.ts:97-101`) into an exported `isTabletScreen(screen: ScreenInfo)`: not `isPhoneScreen`, `coarse`, shorter side at most 1,100. `guessDiagonal` calls it, so the list and the guess can never disagree. Export from `packages/sizes/src/index.ts`. In `check.tsx:14-15` add `TABLET_DIAGONALS = [8.3, 10.2, 10.9, 11, 12.4, 12.9, 13]`; `Diagonals` (`:66-83`) takes an optional `tablet` flag (default false, so no existing render breaks) and picks phone, tablet or desktop. Both call sites pass it: the desktop box (`actual-size.tsx:296-302`) keeps `coarse={false}` for the slider range, so `tablet` is a separate prop computed from the real `ScreenInfo`; the phone check (`:498-504`) passes it too (a 744 px iPad mini in portrait uses the phone layout but is not a phone screen). The slider ranges cover every chip on real tablets (about 104 to 165 px per inch). The new DOM test uses its own local screen stub with `coarse: true, phone layout false`; it does not add a parameter to the shared `stubScreen` helper (`actual-size.test.tsx:74-83`), which would be an unapproved edit.

**BL-95.** One new `it` in `describe("beyond phones and monitors")` of `apps/web/src/components/actual-size/__tests__/actual-size.test.tsx`, next to "says when the right line is past the screen's edge" (`:287-305`), citing {@link openspec/specs/actual-size/spec.md#scenario-a-phone-too-narrow-for-the-line}. `vi.stubGlobal("ResizeObserver", …)` with a class that keeps its callback; mount wide (hint empty), narrow the `clientWidth` mock, fire every kept callback in `act` (`useScroll` also makes one; firing it is harmless), expect the hint; widen and expect it cleared. The file's `afterEach` already unstubs globals. No change to `check.tsx`.

**BL-84.** `language-picker-gate.tsx:9`: give `dynamic()` a `loading` component. It reads the locale the gate already derives from the pathname and renders an `aria-hidden` span (not a button, so it can never satisfy the server-HTML test) holding the current language's `fullNative` name invisibly, with Tailwind utilities copying the trigger's box (`language-picker.css:5-41`: padding, gap, 18px globe slot, 15px/600 text, 16px chevron slot, 1.5px border; below 600px a fixed 44 × 44). It carries the bare class `lp-trig` so the header's `has-[.lp-trig]` rules (`site-header.tsx:18, 38, 47`) apply while it shows; it must not import `language-picker.css` (the "no picker styles on `/`" test). SSR and hard loads are unchanged: the real button stays in the server HTML. Today X1 is linked from nowhere (`site-map.ts:219-221`), so the e2e test makes the in-app move with the App Router (`window.next.router.push`; Next 16.4.5 sets it in production builds too, `app-router-instance.js:253-255`, no `NODE_ENV` guard), delays the picker chunk with `page.route`, and compares the Units toggle's box at 375 and 1280 before and after the button appears.

_Found in apply:_ a `loading` option makes `next/dynamic` wrap the picker in `<Suspense>`, and React's server render then streams the placeholder into the header and the real button into a hidden `<div hidden id="S:0">` at the end of the body, even in the prerendered HTML. That breaks "the button is in the server HTML". The bullet also misread the bug: without a boundary, a late picker chunk stalls the whole move, then the new page and the button commit together and the header shifts. So the gate keeps two `dynamic()` wrappers of the same module: the plain one (no boundary) for a picker shown from the first render, server and hydration included, and one with `loading` for a picker that first appears after an in-app move. `useState(shown)` picks once per visit (the header lives in the root layout), so nothing remounts and the server HTML is unchanged. Technical, decided in apply without asking.

**BL-86.** `apps/web/src/instrumentation-client.ts:11-25`: add `before_send: (e) => e && { ...e, properties: { ...e.properties, $geoip_disable: true } }` (null passes through) and a comment by the existing "Pinned here" note. New `apps/web/src/__tests__/instrumentation-client.test.ts` (node): `vi.mock("posthog-js")`, `vi.stubEnv` the token, `vi.resetModules()`, dynamic import; assert `init` got `cookieless_mode: "always"` and that `before_send` returns the event with `$geoip_disable: true`. `e2e/analytics.spec.ts` is unaffected.

_Correction to the bullet:_ dropping `$ip` in `before_send` does nothing. posthog-js 1.447.7 never sets `$ip`; PostHog's server reads the IP from the request (through the `/ingest` rewrite, `next.config.ts:30-32`), and the `ip` init option is documented as having no effect. PostHog's docs say discarding IP data does not remove location; `$geoip_disable` and cookieless mode do. So this batch guards location in code, and the "no IP address" half keeps resting on cookieless mode plus the project's "Discard client IP data". BL-97 (gated on DNS live) checks stored events for `$ip`. Neither the spec nor the PR may claim the IP half is guarded in code.

**BL-68.** `apps/web/src/components/extension/mode-switch.tsx:41`, right after the switch to usage: build a `URL` from `location.href`, `searchParams.delete("pinned")`, `history.replaceState(null, "", url)`. Pass `null`, not `history.state` (found in review: a state carrying Next's `__NA` flag makes Next's patched `replaceState` skip the router, so a later refresh would put `pinned` back; with `null` Next copies its own state in and updates the router, as `lib/url-state.ts` does). Next 16.4 syncs a raw `replaceState`, nothing reads `useSearchParams`, and PostHog counts no pageview for a query-only change. One fix covers the English and the 27 translated routes (one `ModeSwitch` in `how-to.tsx`). New test in `__tests__/mode-switch.test.tsx` starting at `?pinned=0&utm_source=store`. Dormant until go-live sets `EXTENSION_ID`. BL-69 (pause the poll in a hidden tab) edits the same effect but needs an existing-test edit, so it stays for a later batch.

**BL-83.** `apps/extension/public/manifest.json:15`: `"default_title": "__MSG_appName__"`. All 28 `_locales` define `appName`. The approved edit flips `manifest.test.ts:54` (Decision 2); a new `it` checks every `_locales/*/messages.json` has a non-empty `appName`. The committed `gallery-wall-layout-generator.zip` is not rebuilt in this batch.

## Decisions

1. **BL-92: the tablet list.**
   - Options: (a) 8.3, 10.2, 10.9, 11, 12.4, 12.9, 13 in (iPad mini to iPad Pro 13, Galaxy Tab S+, Surface Pro); (b) (a) plus 10.1 (Fire HD 10, Galaxy Tab A); (c) iPad only: 8.3, 10.9, 11, 13.
   - Trade-off: (b) covers budget Android tablets at the cost of an eighth chip; (c) is shortest but makes Android and Surface owners type.
   - Recommendation: (a), the common sizes in seven chips, the same row as the desktop list.
   - What counts as a tablet is technical and decided here, not asked: the `guessDiagonal` rule shared as `isTabletScreen`, so the chips and the 11 in guess always agree.
   - **Answer:** (a) 8.3, 10.2, 10.9, 11, 12.4, 12.9, 13 in (user, 2026-11-21).

2. **BL-83: edit an existing test.**
   - File and test: `apps/extension/src/__tests__/manifest.test.ts`, "carries the name and the icons at 16, 32, 48 and 128 px". Line 54, `expect(manifest.action.default_title).toBe(NAME)`, becomes `.toBe("__MSG_appName__")`, the same form as the `name` assertion at `:51`. Line 53 already checks the English `appName` text.
   - Why: the old assertion pins the English literal, which is the bug.
   - Options: edit it and ship the translated tooltip; or skip BL-83.
   - Recommendation: edit it.
   - **Answer:** yes, edit it (user, 2026-11-21).

Technical choices made without asking: BL-84 placeholder invisible, not an outlined pill; BL-68 removes `pinned` instead of setting it to 1; BL-91 keeps the stored flag in the viewer, not in `state.ts`.

## Risks / Trade-offs

- [BL-84 placeholder width drifts from the real trigger if `language-picker.css` changes] → the e2e compares the Units toggle's position before and after, so drift fails a test.
- [BL-86 an event already holding `$geoip_disable` or a null event from another hook] → spread keeps existing properties; null passes through.
- [BL-68 a raw `replaceState` that bypasses the App Router] → pass `null`, so Next's patch merges its own state and syncs the router.

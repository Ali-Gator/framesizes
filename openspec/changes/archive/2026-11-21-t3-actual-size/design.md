# Design

## Context

See proposal.md for why. The approved F3 canvas (https://claude.ai/artifact/274YEEAkh69NAuaRf4vk6C, version 18) is the reference for layout and copy. Its "Viewer" board works, so the steps can be clicked through there. The behaviour is in `specs/actual-size/spec.md`.

What exists:

- `@framesizes/sizes` holds the catalog and `KNOWN_THINGS`. The card, Letter and A4 lengths are inlined there as long edges only. A4 and A3 are not in the catalog, which lists US ready-made sizes.
- `lib/unit.ts` gives the visitor's unit through `useSyncExternalStore`, and `<U>` writes both units with CSS showing one.
- `RelatedTools`, `Breadcrumbs`, `FAQ`, `pageMetadata`, `breadcrumbJsonLd` and `lib/og-font.ts` are shared and used the way F2 uses them.
- The page is statically rendered, but the screen's scale is known only in the browser.

## Goals / Non-Goals

**Goals:**

- Answer "8 by 10 inches (20.3 × 25.4 cm)" in the server HTML.
- Draw sizes at 1:1 only on the client, with no layout shift.
- Keep one viewer component, laid out for a phone or a desktop.

**Non-Goals:**

- Affiliate links (T21).
- `?size=` in the URL.
- Landscape sizes.
- Analytics events (BL-15).
- A dark theme (BL-2).

## Decisions

1. **The engine owns sizes and scale math; the app owns state.**
   - New `packages/sizes/src/screen.ts` holds:
     - `ACTUAL_SIZES`: the five catalog sizes by `findFrame`, then A4 and A3 from millimetres.
     - `CHECK_OBJECTS`: card, Letter and A4, each with `short` and `long` in inches.
     - `scaleFromDiagonal(w, h, diagonal): number | null`.
     - `guessDiagonal({ w, h, coarse })` and `guessScale(...)`.
   - `wall.ts` builds the three fixed `KNOWN_THINGS` lengths from `CHECK_OBJECTS[...].long`. That keeps one record of each object (constitution: one mechanism per concern). F2's tests stay unchanged and guard the move.
   - Matching two lines needs no engine function. The slider holds the scale itself, and the lines are drawn `edge × scale` apart.
   - Alternative: add A4/A3 to `CATALOG`. Rejected: the catalog is the checked list of US ready-made frames, and F1 and F2 list every entry.

2. **One pure reducer: `components/actual-size/state.ts`.**
   - State: `{ size, mode: "view" | "card" | "ruler" | "sheet" | "screen" | "full", next, scale, prevScale, check: null | Method, diagonal, sheet: "letter" | "a4" }`.
   - Actions:
     - `pick`
     - `open(method)`
     - `see`: card first when unchecked, then `full`
     - `slide`
     - `nudge(±0.2)`
     - `pickDiagonal` / `typeDiagonal`: ignored unless it parses to a positive number
     - `done`: saves, goes to `next`
     - `skip`
     - `cancel`: restores `prevScale`
     - `close`
   - Pure, so every spec scenario about steps is a unit test.

3. **The saved check: one `localStorage` key, `screen-scale`.**
   - It holds `{ scale, method, w, h, dpr }`. `loadCheck(screen)` returns it only when `w`, `h` and `dpr` match `screen.width`, `screen.height` and `devicePixelRatio`.
   - Reads and writes sit in `try`/`catch`, as `lib/unit.ts` does. When storage throws, the check lasts the page view.
   - Desktop browser zoom changes `devicePixelRatio` in Chrome and Firefox, so a zoomed page drops a saved check rather than drawing a wrong size.

4. **Server HTML versus client drawing.**
   - The server renders everything that does not depend on the screen:
     - the title
     - the size buttons, 8x10 pressed
     - the readout in both units through `<U>`
     - "Scale is a guess"
     - the comparison section
   - The box, the maps and the phone-screens line need the screen. They mount after `useSyncExternalStore` reads `screen` and `matchMedia` (server snapshot: `null`). Until then they sit in boxes of fixed height, so nothing shifts.
   - Phone or desktop layout is `matchMedia("(max-width: 767px)")`, the site's `md` breakpoint. CSS hides the desktop box below it and the "See … at actual size" button above it, so the first paint is right before hydration.

5. **The phone's actual-size view is a native `<dialog>` opened with `showModal()`.**
   - It gives the modal semantics, focus on open, Escape to close and focus return for free.
   - CSS makes it `position: fixed; inset: 0; height: 100dvh`. iOS Safari has no element Fullscreen API, so `dvh` is the honest maximum.
   - The scroll box has `touch-action: pan-x pan-y`, which blocks pinch.
   - A `visualViewport` `resize` listener shows "Zoomed in, the size is off" while `visualViewport.scale !== 1`.

6. **Drawing.**
   - The frame is a `div` sized `w × scale` by `h × scale`, oak border, tape-soft fill, from the box's corner after 24 px rulers.
   - Each ruler is one `aria-hidden` inline SVG per axis: half-unit ticks, labels on whole units. In centimetres it labels every 2 cm when a centimetre is under 30 px.
   - The maps (answer-step map, desktop map, phone mini map) are one `SizeMap` component. It takes the size, the outline to draw (phone glass or the part on screen) and the scroll offset in inches.
   - The scroll offset comes from the box's `scroll` event and is throttled to one update per animation frame.

7. **The check UI.**
   - The phone steps follow the canvas boards b, b2 and c: a picture with three steps, a strip 1 in tall, the left line 16 px in, a slider, "Done, it matches", then links.
   - The desktop check is an inline panel with four tabs. The card draws a full outline in the box corner, the ruler and the sheet a moving edge. The sheet tab shows only when `24 + 8.5 × guessScale ≤ boxWidth`, measured with a `ResizeObserver`, so it never flips while the slider moves.
   - The slider range is 60–240 px per inch on a desktop and 100–200 on a phone.

8. **The page.**
   - `app/how-big-is-8x10/page.tsx` follows F2's pattern: `livePage("F3")`, `pageMetadata`, `Breadcrumbs`, `breadcrumbJsonLd`, `FAQ`, and `RelatedTools current="F3" outside={["PH1", "Q2", "G1"]}`.
   - The comparison drawing and table read `ACTUAL_SIZES`, sorted by area. The multiples are `area / 80` to one decimal, with "1×" for 8x10.
   - `opengraph-image.tsx` draws the same nested comparison with `ogFonts`.
   - The shop section renders nothing. T21 adds it from the canvas's board.

9. **Copy** comes from the canvas, with the size names and numbers from the engine. It runs through `humanizer:humanizer` before commit, keeping every size and the SEO guide's keywords.

## Risks / Trade-offs

- [The guess can be about 30% off on an unusual screen] → it is labelled "Scale is a guess" in the status, on the drawing and in the full view's bar, and the first "See it" on a phone asks for a check.
- [Safari's page zoom keeps `devicePixelRatio`, so a saved check survives a zoom] → the desktop box's sizes would be off. Mitigation: the "How exact" answer tells visitors to keep the zoom at 100%. Not tested automatically.
- [A phone narrower than 16 px + one card edge at its scale (under about 356 CSS px at 160 px per inch)] → the right line could leave the screen. Mitigation: the strip's start moves to 8 px below 380 px of width, and the ruler (2 in) is shorter still.
- [Fixed-height placeholders before hydration] → they are sized from the canvas (desktop box 560 px; phone map 170 px), so the client drawing replaces them without a shift.
- [Three existing e2e tests change] → the owner approves them first (proposal, Impact). Each is re-pointed to its new scenario and keeps its old assertions apart from the new card or URL.

## Migration Plan

None: a new page and additive engine exports. Rollback is setting F3 back to `live: false`, which removes it from the sitemap and Related tools.

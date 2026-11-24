# Design

## Context

See proposal.md for why. The approved F6 canvas (https://claude.ai/artifact/43JSmmnTJHtj55WBpR84qT) is the reference for layout and copy. Its Poster component works, so every state can be clicked through there; its NoMat, WithMat, Custom, Back, Units and Table boards are the states; Main and Phone390 are the page; Draw is the drawing. The behaviour is in `specs/poster-frame-sizes/spec.md`.

What exists:

- `@framesizes/sizes` has the phase 1 poster API: `POSTERS` (ten posters with `id`, `group`, `use`), `posterFrames(size)` → `{ bare, aFrame?, matted, customFrame? }`, `A_FRAMES`, `POSTER_BORDER`, `MattedFrame`. `bare` is `identifyFrame` on the poster's own size: `standard` (`frame`), `metric` (`metric`, `close?`) or `custom` (`below?`, `above?`). Plus `MAT_OVERLAP`, `MAT_WIDTH`, `MEASURE_TOLERANCE`, `CATALOG`, `findFrame`, `inEighths`, `toCm`, `toWholeCm`, `writeSize`, `readLength`.
- Engine answers today (probed 2026-11-23) equal the canvas's numbers for all ten posters, 13x19 and 17x11.
- F5's pieces: `inches(text, unit)` (`components/frame-mat/state.ts`) reads a field; `frame-mat.css` holds the calculator card (`mc-*`), the drawing (`mt-*`) and the chip and badge styles the canvas reuses (its `f5.css`). F4's `article` (`components/measure-frame/answer.ts`).
- Page pattern from F4 and F5: `livePage`, `pageMetadata`, `Breadcrumbs`, `breadcrumbJsonLd`, `FAQ` (first open), `SizeTable` (static), `RelatedTools`, `<U>`, `ogFonts`, `IfLive`, `PageLink`.
- `lib/unit.ts` holds the visitor's unit (`useUnit`); `<U>` writes both units and CSS on the root shows one, so the server HTML is right before hydration.
- F6's site map entry and card exist with `live: false`; `RelatedTools`, the footer and the sitemap pick it up once live.
- The canvas's Poster script is a prototype with its own catalog copy and matcher: it puts A2 and A1 in its metric list, finds pre-cut frames by catalog pairing only, and gives a metric answer sizes below and above. Its copy and layout are reused; its matching is not. The engine wins wherever they differ.

## Goals / Non-Goals

**Goals:**

- Every number on the page, copy included, comes from the engine.
- One widget component; phone and desktop differ in CSS only, so the server HTML is right on both and nothing shifts at hydration.
- Every widget state is testable without a browser.

**Non-Goals:**

- Engine changes, 24x30 or 30x40 frames (BL-119), A2 or A1 in `METRIC_FRAMES`.
- Keeping the widget's choice in the URL or across visits.
- Affiliate links, analytics events (BL-15), a dark theme (BL-2), the table scroll hint (BL-118).

## Decisions

1. **One pure reducer: `components/poster-frames/state.ts`.**
   - State: `{ mode: "chips" | "custom", poster: string, mat: boolean, landscape: boolean, fields: { w, h }: string, pick: number }`. Initial: chips, `"24x36"`, no mat, portrait, empty fields, pick 0.
   - Actions: `poster(id)`, `mat(on)`, `landscape(on)`, `custom`, `chips`, `type(field, text)`, `pick(i)`, `unit(from, to)`. Every action but `pick` and `unit` sets `pick` back to 0.
   - `chips` keeps `fields`, so reopening "Custom size" shows the typed size; `custom` keeps `poster`, so Back finds the chip.
   - `unit` rewrites each field F5's `inches` reads: cm to `String(toCm(n))`, inches to `inEighths(n)`; other text stays. Same rule as F5, so a value round-trips (13, 19 ↔ 33, 48.3).
   - Selector `poster(state, unit)` → `{ size, name?, use?, isA }` for a chip (from `POSTERS`, turned when landscape), or for custom `{ size }` | `{ empty }` | `{ error: { w, h } }`. A field that is empty is not an error; a field whose `inches` is `undefined` or ≤ 0 is.
   - The unit is not reducer state. `useUnit()` drives it; a `useEffect` on it dispatches `unit(prev, next)` (F4's and F5's pattern).

2. **Copy as a pure function: `components/poster-frames/answer.ts`.**
   - `describe(poster, frames, mat, pick)` returns, in both units: head, label, value, sub, use, how, cards (`{ key, button, rows: { chip, badge?, border?, note? }[] }`), the box (`{ text, button, mat }`), and the calculator link flag, following the canvas's option A.
   - Branches on the engine: without a mat, `bare.kind === "standard"` → "Ready-made frame"; `aFrame` or `bare.kind === "metric"` → "Metric frame" + "US frames, with a mat"; else custom → "Order this size" + "Closest standard sizes" from `bare.below` and `bare.above`. With a mat, `matted` non-empty → the frame cards; empty → `customFrame`.
   - Metric how-lines (proposal, off-canvas): an A-series frame says it is sold under the paper's name; sizes below and above come only from a custom `bare` (A2, A1); a non-A metric with `bare.close` names that US frame as within ⅜ in too.
   - The poster is named for a chip ("an 11x17 poster", F4's `article`), "your poster" for a typed size.
   - Writers, all from the true length: `len(in)` = `inEighths` + " in" | `toCm` + " cm" (a number, so no trailing ".0"); `size(s)` the same per side; `aSize(s)` = one-decimal inches for A-series sizes; millimetres from the `ActualSize` record. F4's `writeIn`/`writeLength` are not used: they keep ".0" (`toFixed(1)`), which the canvas drops.
   - `drawing(poster, frames, mat, pick)` returns the boxes, legend, label (both units, inline: "a 24 × 36 in (61 × 91.4 cm) poster"), caption and the dashed flag.
   - With a mat, the drawing takes its borders from the drawn `MattedFrame`'s `side` and `top` and its opening as the frame less twice the border, never from the poster less ½ in: a pre-cut frame's borders are the mat's as sold (phase 1 review), so a typed 40 × 50 cm in the 18x24 draws 1¼ / 2¼ in, as its card says. The canvas recomputed them from the poster.
   - Unit tests pin every sentence in the spec's answer scenarios, in both units where the spec gives both.

3. **One scale, from the engine.** The drawing's scale fits the largest frame the page names, the 27x40's `customFrame` (30½ × 43½ in) plus the 1½ in moulding each side, computed once from `posterFrames` at module load, not hard-coded as the canvas's 46.5. A typed frame bigger than that scales to fit and swaps the caption (proposal, off-canvas). Boxes are percentages of the stage, as F5's are.

4. **Layout by CSS, one DOM.**
   - The widget is F5's `mc` card: at `md` (768 px) and up, areas `main side` with the drawing in `main` under the controls; below `md` one column in the order chips, controls, answer, drawing (grid `order`, not a second drawing).
   - "Your answer" is an `h3` in the DOM on both, visually hidden below `md`.
   - The page imports F5's `frame-mat.css` for the shared `mc-*`, `mt-*` and chip styles, and its own `poster-frames.css` for the `pf-*` classes (the canvas's `f6.css`). Nothing in F5's file changes.
   - The server renders the default 24x36 state with its answer and drawing.

5. **Controls.**
   - Chips: a `role="group"` named "Poster size" of `aria-pressed` buttons, as F5's border chips; each shows the name ("24×36", turned when landscape) and the size under it in `toWholeCm` cm or mm. "Custom size" is the last button in the group.
   - Mat and orientation: the existing `SegmentedControl`.
   - The mat cards with a choice are `aria-pressed` buttons; a single card is a plain box.
   - Custom fields: `type="text" inputmode="decimal"` (a numeric input refuses "13 1/2"), the unit as a suffix; errors with `aria-invalid` and a shared `aria-describedby` message.
   - The answer area is `aria-live="polite"`.

6. **The drawing: `components/poster-frames/poster-drawing.tsx`.** Positioned boxes inside one `role="img"` stage, reusing F5's `mt-*` classes: the moulding (dashed for a custom frame), then either the poster filling the frame or the mat, the opening and the poster's edge under it, with the borders written on the mat. Legend and caption as the canvas's Draw board.

7. **The page: `app/poster-frame-sizes/page.tsx`.**
   - F5's pattern: `livePage("F6")`, `pageMetadata`, `Breadcrumbs`, `breadcrumbJsonLd`, `FAQ` (first open), `RelatedTools current="F6" outside={["P1"]}`.
   - The chart table is `POSTERS.map(posterFrames)` in a static `SizeTable` with three columns; cells write both units through `<U>`.
   - The group cards read `posterFrames` for each poster; group sentences that depend on the data ("only one standard frame fits each, and 27x40 has none") throw at build time if the engine stops giving that, so the copy cannot drift silently.
   - The painting list is `findFrame` of 11x14, 16x20, 18x24 and 24x36.
   - Step 2's range is `POSTER_BORDER` written in both units; step 1's link sentence is `<IfLive page="P1">` with `<PageLink id="P1">`, as F1's poster sentence is. `IfLive` reads the real site map, so only the not-live state is tested, as on F1; `IfLive` itself is covered by `frame-size-chart`.
   - The questions read their sizes from `POSTERS`, `posterFrames` and `CATALOG` (the 4x6 to 27x40 range is the catalog's first and last rectangle).
   - `opengraph-image.tsx` draws the `h1` and the 24x36 poster in its frame and in the 27x40 with its mat, with `ogFonts`.

8. **Related tools follow the guide.** Live Frames siblings, then P1 when live; card titles and questions come from the site map, not the canvas (F4 decision 9, F5 decision 8).

9. **Copy** comes from the canvas, with sizes from the engine. It runs through `humanizer:humanizer` before commit, keeping every size and the SEO guide's keywords; the title, `h1` and description stay verbatim, and the two keyword questions stay verbatim. The off-canvas lines (proposal) go to the owner first.

## Risks / Trade-offs

- [The A3 answer loses the canvas's "11x14 is smaller, 12x18 is bigger"] → The engine gives below and above only for a custom match; adding them for a metric match would change F4's and F5's answers. The owner approves the shorter line with the other off-canvas copy.
- [A typed metric size can be named a metric frame while a US frame is also within ⅜ in (40 × 50 cm and 16x20)] → The answer names both, as the engine's `close` says.
- [The page imports another route's CSS file] → It reads F5's classes and changes nothing there; if F5's card changes, F6 changes with it, which is what the canvas intends (one card style).
- [The answer follows every keystroke in a polite live region] → Screen readers announce politely, after the visitor pauses; the head line comes first, so it is what they hear.
- [Six existing e2e tests change] → The owner approves them first (proposal, Impact); each only adds F6.

## Migration Plan

None. A new page and a site map flag. Rollback is setting F6 back to `live: false`.

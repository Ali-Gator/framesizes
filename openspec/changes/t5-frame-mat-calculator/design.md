# Design

## Context

See proposal.md for why. The approved F5 canvas (https://claude.ai/artifact/PjZ5GizsgyTKMvx6nAfdRp) is the reference for layout and copy. Its Calc board works, so every state can be clicked through there; its Mat board is the drawing; Main and Phone390 are the page. The behaviour is in `specs/frame-mat-calculator/spec.md`.

What exists:

- `@framesizes/sizes` has the phase 1 mat API: `matSizes`, `whyNoMat`, `matBorders`, `MAT_WIDTH`, `MAT_WIDTHS`, `MatQuestion`, `MatAnswer`, `NoMat`. Each answer carries `printMatch` and `frameMatch` (`identifyFrame` on an inside size: standard, metric or custom with `below`, `above`, `squareBelow`, `squareAbove`) and `preCut`. Plus `MAT_OVERLAP`, `MEASURE_TOLERANCE`, `CATALOG` with each frame's `mat`, `readLength`, `inEighths`, `writeEighths`, `toCm`.
- F4's pure helpers: `writeLength` (`components/measure-frame/state.ts`), `writeIn` and `article` (`answer.ts`). F4's page pattern: `livePage`, `pageMetadata`, `Breadcrumbs`, `breadcrumbJsonLd`, `FAQ`, `SizeTable`, `RelatedTools`, `<U>`, `ogFonts`, `PageLink`.
- `lib/unit.ts` holds the visitor's unit (`useUnit`, `setUnit`); `<U>` writes both units and CSS on the root shows one, so the server HTML is right before hydration.
- F1 already renders `<IfLive page="F5">` with a link to F5, and F5's site map entry and card exist with `live: false`.
- The canvas's Calc script is a prototype. It matches with its own copy of the catalog, has no BL-111 guard and names the print only when it is a US size. Its copy is reused; its matching code is not.

## Goals / Non-Goals

**Goals:**

- Every number on the page, copy included, comes from the engine.
- One calculator component. Phone and desktop differ in CSS only, so the server HTML is right on both and nothing shifts at hydration.
- Every calculator state is testable without a browser.

**Non-Goals:**

- Affiliate links (T21), analytics events (BL-15), a dark theme (BL-2).
- Bottom-weighted and double mats (canvas Q4, Q5).
- Keeping the calculator's numbers in the URL or across visits.

## Decisions

1. **Engine changes, `packages/sizes/src/mat.ts`:**
   - BL-111: `sizesOf` refuses `width <= overlap` with `"narrow"` before any arithmetic; `NoMat` becomes `NoAnswer` (the `Exclude` goes). A mat that is not wider than the print's hidden edge would give a frame no bigger than the print, or a print no smaller than the frame.
   - Diploma: `export const DIPLOMA = { print: { w: 8.5, h: 11 }, frame: <the 11x14 catalog frame> }`, read from `CATALOG` by id so no size is retyped, with a comment pointing at this change's `verification.md`. Borders come from `matBorders`.
   - Alternative: write the diploma frame in the page copy. Rejected: the constitution keeps every size in the engine.

2. **One pure reducer: `components/frame-mat/state.ts`.**
   - State: `{ from: "print" | "frame", fields: { w, h, m }: string, submitted: boolean }`. Initial: from print, `w` and `h` empty, `m` = `inEighths(MAT_WIDTH)`.
   - Actions: `type(field, text)`, `preset(inches, unit)`, `swap(carry?: Size, unit)`, `find`, `reset(unit)`, `unit(from, to)`.
   - `swap` with an answer writes the carried size into `w` and `h` (inches with `inEighths`, cm with `toCm(…).toFixed(1)`); without one it only flips `from`. The component passes the answer's `frame` (from a print) or `print` (from a frame).
   - `unit` rewrites each field `readLength` reads: cm to `toCm(n).toFixed(1)`, inches to `inEighths(n / 2.54)`. Other text stays.
   - Selector `outcome(state, unit)` → `{ errors }` or `{ answer: MatAnswer, width }`:
     - each field: empty → "Enter the …"; `readLength` refuses → if the text after a leading minus reads, "… above 0 …", else "Use a number, like 8 or 8 1/2." (cm: "like 20.3"); 0 → "… above 0 …", the border adding "With no mat, the frame is the print size.";
     - then `whyNoMat`: `"narrow"` marks the border (BL-111 message); `"room"` from a print marks the side whose print length is ≤ 2 × `MAT_OVERLAP`, from a frame marks the border, naming the first side the border closes;
     - then `matSizes`.
   - The side for `"room"` is one comparison in the page, not an engine change: the engine says why, the page says where.
   - The unit is not reducer state. `useUnit()` drives it, and a `useEffect` on it dispatches `unit(prev, next)`, so the header toggle converts the fields too (F4's pattern).

3. **Copy as a pure function: `components/frame-mat/answer.ts`.**
   - `describe(answer, width, from)` returns, in both units: head, label ("Frame size" or "Largest print"), value, opening, how, and the cards (`{ key, rows: { chip, border?, note? }[], text? }`), following the canvas's option A.
   - The print is named only when `printMatch` is a US standard size ("for an 8x10 print"), else "your print", as the canvas does; a metric print match does not rename the print (an 8x12 print stays "your print").
   - From a print: standard → "Ready-made frame" (+ "Also sold with a pre-cut mat" when other pre-cut frames exist); metric → "Metric frame" + pre-cut; custom → "Order this size", pre-cut, "Next size up" when `frameMatch.above` is not pre-cut, "Square frames" when `squareAbove` exists.
   - From a frame: standard or metric print → its card; custom → `printMatch.below` with `above` as too big; "Sold with this frame" from `frameMatch` (standard with `frame.mat`, standard without, or not standard). When the frame's own mat is the standard print, it folds into the print card.
   - Borders via `matBorders`, written "Mat border 1¾ in all round." when both sides write the same, else "… at the sides, … at the top and bottom.".
   - `drawing(answer | undefined)` returns the boxes, legend, label and caption; the empty state is the canvas's 8x10-in-11x14 example from the catalog's 11x14 entry.
   - Lengths and sizes go through F4's `writeLength`, `writeIn` and `article`, imported, not copied.
   - Unit tests pin every sentence in the spec's answer scenarios.

4. **Layout by CSS, one DOM.**
   - The calculator is a CSS grid: at `md` (768 px) and up, areas `main side` with the drawing in `main` under the button; below `md`, one column in the order fields, button, answer, drawing (grid `order`, not a second drawing).
   - "Your answer" is an `h3` in the DOM on both, shown at `md` and up only (`max-md:sr-only`), so the outline is the same everywhere.
   - On find with errors, focus moves to the first marked field in an effect after the render that marks it.
   - The server renders the empty state on both layouts (the canvas's Calc and phone boards). The desktop board's filled 8x10 is a demo state.

5. **Fields and chips.**
   - Each field is `type="text" inputmode="decimal"` (a numeric input refuses "8 1/2"), with the unit as a suffix.
   - Errors use `aria-invalid` and `aria-describedby`; the border's hint shares the described-by slot when there is no error.
   - Chips are a `role="group"` named "Common mat borders" of `aria-pressed` buttons from `MAT_WIDTHS`; a chip is pressed when the border reads within 0.02 in of it.
   - Reverse is a round icon button with `aria-label` "Reverse: start from a frame" / "…from a print" and `title` "Reverse".

6. **The drawing: `components/frame-mat/mat-drawing.tsx`.**
   - Positioned boxes inside one `role="img"` stage, as the canvas's Mat board: the frame face, the mat, the opening (tape yellow, "Print"), the print's edge dashed, and the side and top borders written on the mat. Its `aria-label` is the canvas's sentence from `describe`.
   - The same component draws the formula section's figure (8x10 + 2 in, from `matSizes`), server-rendered.

7. **The page: `app/frame-mat-calculator/page.tsx`.**
   - F4's pattern: `livePage("F5")`, `pageMetadata`, `Breadcrumbs`, `breadcrumbJsonLd`, `FAQ` (first open), `RelatedTools current="F5" outside={["PH2"]}`.
   - Every number in the formula examples, table, cases and questions comes from `matSizes`, `matBorders`, `CATALOG` and `DIPLOMA`: the table is `CATALOG.filter(f => f.mat)`, the "sold without a mat" list is the rest, the narrowest and widest pre-cut borders in "How wide is a pre-cut mat?" are the catalog's minimum and maximum.
   - The cm formula uses `toCm(2 × MAT_OVERLAP)` (1.3 cm) and the cm example is `toCm` of the inch answer (29.2 × 34.3 cm), so cm never drifts from inches.
   - The shop slot renders nothing.
   - `opengraph-image.tsx` draws the `h1` and the 8x10 + 2 in mat drawing with `ogFonts`.

8. **Related tools follow the guide, not the canvas.** The canvas lists Art print sizes, Measure, Chart and How big is 8x10. The guide's checklist asks for every live hub sibling, so F2 is in too, and PH2 joins when live. Card titles and questions come from the site map, not the canvas (F4 decision 9).

9. **Copy** comes from the canvas, with sizes and allowances from the engine. It runs through `humanizer:humanizer` before commit, keeping every size and the SEO guide's keywords; the title, `h1` and description stay verbatim, and the two keyword questions stay verbatim. The off-canvas lines (proposal) go to the owner first.

## Risks / Trade-offs

- [The diploma rests on retail listings found by search] → Task 2.2 opens them in a browser and records what each shows in `verification.md`; under three confirmations it goes back to the owner.
- [Converting cm to in rounds to the nearest eighth, so a round trip can move a value by up to 1⁄16 in] → Well inside the ⅜ in allowance. The spec pins 8, 10, 2 in ↔ 20.3, 25.4, 5.1 cm.
- [Reverse carries the exact size, not the matched standard, so 11½ × 13½ comes back as "11½" and "13½"] → That is what makes Reverse twice return the starting numbers; the spec pins the round trip.
- [The answer changes with every keystroke after the first find, inside a polite live region] → The region holds the head line and the value only.
- [Five existing e2e tests change] → The owner approves them first (proposal, Impact); each only adds F5.

## Migration Plan

None. A new page, an additive engine constant, and one more refusal in `whyNoMat` for widths that today give a frame smaller than the print (no caller passes one: F5 is not live). Rollback is setting F5 back to `live: false`.

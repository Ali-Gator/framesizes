# Design

## Context

See proposal.md for why. The approved F4 canvas (https://claude.ai/artifact/SqK52EoyyoLLXzRPPKSUkB) is the reference for layout and copy. Its Wizard board works, so every state can be clicked through there, and its Dia board holds the measuring drawings as SVG. The behaviour is in `specs/measure-frame/spec.md`.

What exists:

- `@framesizes/sizes` has `identifyFrame`, `LIP`, `MEASURE_TOLERANCE`, `METRIC_FRAMES` (phase 1), plus `frameAnatomy`, `MOULDING` (1 in), `MAT_OVERLAP` and the catalog's mat pairings. `identifyFrame` returns `undefined` for every refusal, with no reason.
- The engine writes inches as decimals (`8.5 × 11 in`). It has no eighths writer and no parser.
- `lib/unit.ts` holds the visitor's unit (`useUnit`, `setUnit`). `<U>` writes both units, and CSS on the root shows one, so the server HTML has both and nothing shifts.
- These are shared, and F3 uses them the same way: `RelatedTools`, `Breadcrumbs`, `FAQ`, `PageLink`, `pageMetadata`, `breadcrumbJsonLd`, `lib/og-font.ts` and the design system's `SizeTable` and `SegmentedControl`.
- F1 accepts `/?size=<id>`, landscape ids included.
- The canvas's Wizard script is a prototype. It takes the first US match, puts metric behind a prop, has no lip guard and predates BL-106. Its copy is reused; its matching code is not.

## Goals / Non-Goals

**Goals:**

- Every number on the page, the copy included, comes from the engine.
- One wizard component. Phone and desktop differ in CSS, so the server HTML is right on both and nothing shifts at hydration.
- Every wizard state is testable without a browser.

**Non-Goals:**

- Affiliate links (T21).
- Analytics events (BL-15).
- A dark theme (BL-2).
- Keeping the wizard's numbers in the URL or across visits.

## Decisions

1. **Engine additions, all in `packages/sizes`:**
   - `units.ts`:
     - `inEighths(inches)`: "7½", "¼", "10".
     - `writeEighths(size)`: "7½ × 9½ in".
     - `readLength(text): number | undefined`. It handles whole numbers, `.` or `,` decimals, `a/b`, `n a/b`, `n-a/b` and glyphs, and refuses a leading minus.
   - `measure.ts`:
     - `frameMeasurements(frame)` → `{ inside, front, outside, face, mat?: { opening, print } }`. It reuses `frameAnatomy` with `MOULDING`, `LIP` and the catalog's mat pairing.
     - `whyNoAnswer(m)` → `"number" | "narrow" | "room" | undefined`. `identifyFrame` calls the same private check, so each rule lives in one place.
   - BL-106 lives in `nearest`. `custom` gains `squareBelow?` and `squareAbove?`. A size counts as near-square when `h < 1.2 × w` (strict) and it is not a ⅜ in square.
   - Alternative: parse and format inside the app. Rejected, because the engine is the single source of every size the site writes (constitution).

2. **The moulding means the same thing on F1 and F4.**
   - F1's `MOULDING` (1 in) is the moulding beyond the frame size.
   - F4 always says "seen from the front", which is that plus the ¼ in lip: `face = MOULDING + LIP` = 1¼ in.
   - The outside comes from `frameAnatomy`, so both pages give an 8x10 as 10 × 12 in outside.
   - F1's copy is not edited.

3. **One pure reducer: `components/measure-frame/state.ts`.**
   - State: `{ step: "pick" | "enter" | "result", kind, fields: { w, h, f }: { text, eighths }, active, submitted, kept }`.
   - Actions:
     - `pick(kind)`
     - `enter`
     - `back`
     - `type(field, text)`
     - `eighth(n)`: sets the fraction of `active`
     - `focus(field)`
     - `blur(field)`: moves a typed fraction into `eighths`, inches only
     - `unit(from, to)`: converts every field
     - `find`
     - `change`: back to the fields with `kept`
     - `checkSpot`: back to step 1 with `kept`
     - `reset`
   - Selector `outcome(state, unit)` → `{ errors }` or `{ answer, measured, face }`. It goes through `readLength`, then `whyNoAnswer`, then `identifyFrame`.
   - The unit is not reducer state. It comes from `useUnit()`, and a `useEffect` on it dispatches `unit(prev, next)`, so the header toggle converts the fields too.

4. **Copy as a pure function: `components/measure-frame/answer.ts`.**
   - `describe(outcome)` returns the canvas's strings in both units: head, value, how, holds, link, nearest rows (squares included) and mat frames.
   - It also returns the drawing's boxes, legend, label and caption.
   - Unit tests pin every sentence in the spec's scenarios.
   - Articles ("a"/"an") follow the canvas rule: "an" before 8, 11, 18 and A.

5. **Phone or desktop by CSS, not `matchMedia`.**
   - The wizard root carries `data-step`.
   - Below `md` (768 px), CSS shows only the current step's section and the phone controls: "Step N of 3", Back, "Enter the sizes", "Change measurement".
   - At `md` and up it shows the choice, the fields and the answer together, and hides the phone controls.
   - On a phone `find` sets `step: "result"`. On a desktop the same action only matters for `submitted`.
   - On a step change, focus moves to that step's heading (`tabIndex={-1}`), but only when `matchMedia("(max-width: 767px)")` matches at the time of the event. Render never reads it.
   - The server renders step 1, the empty fields, "Enter both sides and press Find my frame size." and the example drawing.

6. **Fields and eighths.**
   - Each field is `type="text" inputmode="decimal"` (a numeric input refuses "8 1/8").
   - Field errors use `aria-invalid` and `aria-describedby`.
   - The eighths row is a `role="group"` of eight `aria-pressed` buttons. It is hidden in cm by the same root CSS that `<U>` uses, so there is no flash.
   - "Rounded edge?" is a native `<details>` under the moulding field, holding the round drawing and its text.

7. **Drawings.**
   - The measuring diagrams (back, inside, front, mat, outside, cross-section, round, result) are one `Diagram` component of inline SVG ported from the canvas's Dia board.
   - On the choices they are `aria-hidden`. In the steps section and the cross-section they are `role="img"`, with the aria-labels the Diagrams board gives.
   - The live drawing beside the answer is positioned boxes inside one `role="img"` stage, as the canvas draws it. Its boxes come from `describe`.

8. **The page.**
   - `app/measure-picture-frame/page.tsx` follows F3's pattern: `livePage("F4")`, `pageMetadata`, `Breadcrumbs`, `breadcrumbJsonLd`, `FAQ` (first open), and `RelatedTools current="F4" outside={["PH1"]}`.
   - The table rows come from `frameMeasurements` over 4x6, 5x7, 8x10, 11x14, 16x20 and 24x36, rendered with the design system's `SizeTable`.
   - The answer's links go through `PageLink`, so a link to a page that is not live never renders.
   - The shop slot renders nothing.
   - `opengraph-image.tsx` draws the `h1` and an 8x10 frame with its three measurements, using `ogFonts`.

9. **Related tools follow the guide, not the canvas note.**
   - The canvas says "F1, F3, PH1; until PH1 is live, F2 takes its place".
   - The SEO guide's checklist asks for all hub siblings.
   - With `outside={["PH1"]}` the cards today are F1, F2 and F3, which is what the canvas shows. Once PH1 is live, F2 stays.

10. **Copy** comes from the canvas, with sizes and allowances from the engine (`LIP`, `MAT_OVERLAP`, `MEASURE_TOLERANCE`, `frameMeasurements`). It runs through `humanizer:humanizer` before commit, keeping every size and the SEO guide's keywords. The three lines that are not on the canvas (proposal) go to the owner first.

## Risks / Trade-offs

- [On a desktop the answer changes with every keystroke inside a polite live region, so it may be announced a lot] → Screen readers drop stale polite updates. The region holds only the head sentence and the value, not the explanation.
- [The answer paragraph is long for a 360 px first screen] → The e2e test pins the `h1`, the paragraph and "What are you measuring?" at 360 × 740. If it fails, the owner approves a shorter paragraph before the humanizer step.
- [Converting cm to in rounds to the nearest eighth, so a round trip can move a value by up to 1⁄16 in] → It stays well inside the ⅜ in allowance. The spec pins one round trip.
- [A landscape metric answer keeps the upright `label`] → The answer writes cm from `w` and `h`, never from `label` (phase 1 review).
- [Four existing e2e tests change] → The owner approves them first (proposal, Impact). Each only adds the F4 card or URL.

## Migration Plan

None. This is a new page plus additive engine exports, and the `custom` answer only gains optional fields. Rollback is setting F4 back to `live: false`, which takes it out of the sitemap, the footer and Related tools.

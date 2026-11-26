# Design

## Context

See proposal.md for why. The approved F7 canvas (https://claude.ai/artifact/8YexFJ28z3TrXTGLJteFSf) is the reference for layout and copy. Its Mockup component works, so every state can be clicked through there; boards a–z2 are the states, Main and Phone390 the page, Scene the drawing (the v2 room, the frame, the mat, the artwork and the drag bands). The behaviour is in `specs/frame-mockup/spec.md`.

What exists:

- `@framesizes/sizes` has the phase 1 mockup API (`packages/sizes/src/mockup.ts`): `mockupSizes`, `mockupOptions(art, mat)` → `{ size, opening, cut }[]` in offered order, `mockupDefault`, `mockupOpening`, `visiblePart(art, opening, focus)` → the crop in px, `focusStep(art, opening, inches)`, `hangMockup(size, placement)` → the outside rect on the 144 × 96 in wall (inches, `y` up from the floor), `mockupView(outside, view)`, `exportSize(view)`, `KEY_STEP`, `EXPORT_LONG_SIDE`, `SQUARE_TOLERANCE` (≈ 8.7% since BL-129). Also `CATALOG`, `framesFor`, `POSTERS`, `MOULDING`, `MAT_WIDTH`, `toCm`, `toWholeCm`, `inEighths`, `oneDecimal`, `SOFA`, `ABOVE_SOFA`, `CENTRE_LINE`, `DEMO_ROOM`.
- Engine answers today (probed 2026-11-25) equal the canvas's numbers: the sample's cuts with and without a mat, 24x36 by default (12x16 for 3:4 art with a mat), 26 × 38 in at 42–80 in above the sofa and 38–76 in on a plain wall, the 45 × 57 in close-up, 2400 × 1600 and 1895 × 2400 px.
- F2's photo pieces: `usePhotoFile` (`components/frames-on-wall/photo-flow.tsx`) reads a file into an object URL and an `<img>` (`decode()` gives the size with EXIF applied), and F2's e2e checks that no request carries the photo. F2 draws the v1 flat room (`stage.tsx`); BL-51 is the v2 room for F2 and G1.
- Page pattern from F4 to F6: `livePage`, `pageMetadata`, `Breadcrumbs`, `breadcrumbJsonLd`, `FAQ` (first open), `SizeTable`, `RelatedTools`, `<U>` (both units in the HTML, CSS shows one), `ogFonts`, `IfLive`, `PageLink`, F4's `article`. `SegmentedControl` has no disabled option.
- F7's site map entry and card exist with `live: false`; `RelatedTools`, the footer and the sitemap pick it up once live.
- PostHog runs with autocapture and session recording off (`instrumentation-client.ts`).
- The canvas's Mockup script is a prototype with its own size list, cut and default code, and a 5% square rule. Its copy and layout are reused; its maths is not. The engine wins wherever they differ.

## Goals / Non-Goals

**Goals:**

- Every number on the page, copy included, comes from the engine.
- The screen and the PNG draw the same picture from the same geometry.
- One widget DOM; phone and desktop differ in CSS only, so the server HTML is right on both.
- Every widget state is testable without a browser; the drawing geometry is testable in Node.

**Non-Goals:**

- Engine behaviour changes beyond BL-130; a larger export; the visitor's wall photo; a watermark.
- Keeping the artwork or the settings across visits or in the URL.
- Moving F2 and G1 onto the v2 room (BL-51).

## Decisions

1. **State: `components/frame-mockup/state.ts`, one pure reducer.**
   - State: `{ art: Art & { url: string; sample: boolean }, size: string, mat: boolean, finish: "black" | "white" | "oak" | "walnut", placement: MockupPlacement, view: MockupView, focus: number, panel: "size" | "style" | "mat" | "wall", note: Note | null, download: "idle" | "making" | "done" | "failed" }`. Initial: the sample (`/frame-mockup/sample.svg`, 2000 × 3000), `"24x36"`, no mat, black, sofa, wall, focus 0.5, panel size.
   - Actions: `size(id)`, `mat(on)`, `finish`, `placement`, `view`, `panel`, `uploaded(art)`, `sample`, `failed(kind)`, `reading`, `focus(delta)`, `drag(focus)`, `download(state)`.
   - `uploaded` sets `size` to `mockupDefault(art, mat).size.id`, focus 0.5, and the note "opened" (first upload) or "replaced". `sample` sets `"24x36"`, focus 0.5, the note "back", and keeps finish, mat, placement and view. `mat` keeps `size` and resets focus; `mat(true)` is a no-op when the size has no opening with a mat. `size` resets focus; a size with no opening under the current mat is refused. `focus` clamps the stored value to 0..1.
   - Selectors: `options(state)` (`mockupOptions`), `current(state)` → the option, its opening, `visiblePart`, the cut axis (from the crop: `x` when the crop is narrower than the artwork) and `focusStep` for ¼ and 1 in. "Nothing to move" is `focusStep(…, 1) === 0` (the engine's half-pixel rule), not a cut threshold; "0% cut", "Nothing is cut" and the disabled move control all key on it.
   - Object URLs: the hook that owns the upload revokes the previous URL when the artwork changes or the page goes (F2's pattern). The sample is a static URL and is never revoked.

2. **Copy as pure functions: `components/frame-mockup/copy.ts`.** Chip labels ("24×36", "A2") and subs ("0% cut", "<1% cut" when the cut rounds to 0 but `focusStep` is not 0, as for an A-series file in A3, A2 and A1, "No room"); the answer's value and sub (A-series: mm from the `POSTERS` record, inches with `oneDecimal`, cm), facts (cut, mat, outside and heights, close-up), the hint, the notes, the errors, the art line, the picture's label (F4's `article`), the PNG line (`exportSize` with `toLocaleString("en-US")`) and the file name. Every length is written through one `len(inches, unit)` (`inEighths` + " in" | `toCm` + " cm") and `size(s, unit)`; both units come back so the markup wraps them in `<U>`. Heights read the engine's rect: bottom `y`, top `y + h`, over the sofa `y − (SOFA top)`, plain-wall centre `CENTRE_LINE`. Unit tests pin every sentence in the spec.

3. **One geometry for screen and PNG: `components/frame-mockup/scene.ts`.** `scene(state)` → in inches, in the view's frame with `y` down from the view's top: the view rect, the outside, the mat (when on), the opening, the artwork's drawn rect (the opening extended by the crop's overhang, from `visiblePart`), and whether the sofa shows. It converts the engine's `y`-up wall rects once (`top = WALL.h − (y + h)`), tested on 24x36 above the sofa: the outside's top is 16 in from the wall's top, and its close-up view's top 6.5 in. Screen and export both read it; nothing else does geometry.
   - Alternative: draw the PNG by rasterising the on-screen DOM (html-to-image style). Rejected: a new dependency, fragile with CSS variables and fonts, and slow on phones.

4. **The screen: `mockup-picture.tsx`, positioned boxes over the room.** The stage keeps the view's aspect ratio. Inside, a world box sized to the 144 × 96 in wall is offset by the view, so the close-up is the same drawing scaled (the canvas's Scene). Children, all positioned in % of the world from `scene`: `<SampleRoom sofa>`, the frame box (`fin-*` colour, the frame's shadow), the mat box, the artwork `<img alt="">` at its drawn rect clipped to the opening (`clip-path: inset(…)`), the drag bands, and a bevel line on the mat opening. The drawing is one `role="img"` with the state's label. The move control (decision 6) is a `<button>` positioned over the opening as a sibling of that image inside the stage, never inside it: a focusable child of `role="img"` would be hidden from assistive tech.

5. **The room: `components/ui/sample-room.tsx`, shared.** The canvas's v2 room as one inline SVG on the 0..144 × 0..96 viewBox, `preserveAspectRatio="none"`, colours from the site tokens (`--stage`, `--paper`, `--line-strong`, `--oak`, `--furniture`, `--tape`, `--ink`) plus a `--leaf` token added to `globals.css` for the plant. A `sofa` prop draws or drops the sofa. Its gradient ids come from `useId`, since one page draws four rooms (the widget and three keyword cards). It sits under `components/ui/` so BL-51 can move F2 and G1 onto it; F7 is its only user in this change.

6. **Moving the artwork.** A `<button aria-label="Move the artwork in the frame. Arrow keys move it; Shift moves it further.">` covers the opening; it is disabled when nothing can move, and only then is `touch-action: none` dropped. Keys on the cut axis (Left/Right for `x`, Up/Down for `y`) dispatch `focus(±focusStep(¼ or 1 in))`: the arrow's direction is the artwork's. Drag uses pointer capture: the pointer's movement in px over the stage's px-per-inch gives inches, and `focusStep` turns that into a focus change from the focus at pointer-down, so keys and drag share one formula. While the pointer is down the frame fades and the cut parts show dimmed (the canvas's `sc-drag`).

7. **The PNG: `components/frame-mockup/export.ts`.** On "Download PNG":
   - a `<canvas>` of `exportSize(view)` px; the scale is px per inch of the view;
   - the room: the on-screen `SampleRoom` SVG node is cloned, each shape's computed `fill`, `stroke` and `opacity`, and each gradient `<stop>`'s computed `stop-color` and `stop-opacity`, written inline (CSS variables do not resolve in an SVG loaded as an image), serialised to a Blob URL, loaded into an `Image` and drawn at the world rect;
   - the frame, the mat and the bevel as `fillRect`/`strokeRect` in the computed colours of their on-screen boxes; the frame's shadow as a canvas shadow;
   - the artwork: the same `<img>` (sample SVG or upload) drawn with `drawImage(img, crop…, opening…)` from `visiblePart`;
   - `canvas.toBlob("image/png")` → object URL → a temporary `<a download="frame-mockup-<id>.png">` click → URL revoked. `null` from `toBlob` sets `download: "failed"`.
   - Nothing leaves the page. A test in the browser (e2e) checks the file name, the PNG's IHDR size against `exportSize`, and the moulding's colour at the engine's position; the geometry is unit-tested through `scene`.
   - Alternative: one SVG of the whole mockup drawn into the canvas. Rejected: an SVG loaded as an image cannot load the visitor's `blob:` artwork.

8. **Upload: `use-artwork.ts`.** A hidden `<input type="file" accept="image/*">` behind "Choose a JPEG or PNG" (F2 accepts the same; a phone's picker converts HEIC). A file whose `type` does not start with `image/` → `failed("notimg")`; otherwise `reading`, then F2's object URL + `img.decode()`; a decode error or a zero size → `failed("decode")` and the URL is revoked; success → `uploaded({ url, width: naturalWidth, height: naturalHeight })`. A second pick while one is read wins (the stale one is revoked). The desktop drop area handles `dragenter`/`dragover`/`dragleave`/`drop` and passes the first file to the same function.

9. **Layout by CSS, one DOM.**
   - Two wrappers, `.mk-left` (picture, Mat, Wall and View, hint, answer, Download) and `.mk-right` (upload, note, art line, the phone buttons, size chips, styles). At `md` (768 px) and up they are the two columns, the left one `position: sticky`; the phone buttons are `display: none` and every group shows.
   - Below `md` both wrappers are `display: contents` and the children take a grid `order`: picture, upload, note, art line, buttons, the open group, hint, answer, Download.
   - The phone buttons ("Size · 24×36", …) are disclosure buttons (`aria-expanded`, `aria-controls` the group), not ARIA tabs: on desktop the same groups are all visible and labelled, and a `tabpanel` with no visible tab would be a false role. Only the group named by `panel` shows below `md` (a class, so the server HTML is the same).
   - Mat, Wall and View sit in the left column on desktop and as the Mat and Wall groups on a phone: one control each, moved by `order`, never rendered twice.

10. **Controls.**
    - Size chips: a `role="group"` named "Frame size" of `aria-pressed` buttons (F6's chip styles), disabled with "No room" under a mat.
    - Styles: `aria-pressed` pill buttons with a colour dot.
    - Mat, Wall, View: the existing `SegmentedControl`, given an optional `disabled` per option (skipped by the arrow keys, `disabled` on the button) and an `aria-describedby` hook for "A 4x6 has no room for a mat." This closes the canvas's first design-system gap.
    - The note and the errors share one `aria-live="polite"` region; the answer is its own polite region; "Saved …" is `role="status"`.

11. **The page: `app/frame-mockup/page.tsx`.**
    - F6's pattern: `livePage("F7")`, `pageMetadata`, `Breadcrumbs`, `breadcrumbJsonLd`, `FAQ` (first open), `RelatedTools current="F7" outside={["P1", "G1"]}`.
    - The shape table groups `CATALOG` by reduced ratio, keeps groups of two or more (2:3, 3:4, 4:5, 1:1), adds the A-series row from `POSTERS`, and orders them as the canvas (2:3, 3:4, 4:5, A-series, square). A build-time check throws if the groups stop matching the copy. The size list is a wrapping text cell (BL-128).
    - The reference sentence is `<IfLive page="PH2">` / `<IfLive page="Q2">` with `PageLink`s.
    - The keyword sections draw a static `MockupPicture` each (no controls): the sample on 24x36 black, close-up; the leaf stand-in on 8x10 light oak with its pre-cut mat, plain wall, close-up; the landscape stand-in on 36x24 walnut, sofa, whole wall. Their numbers (45 × 57 in, the 5x7 and 8x10 mats, 12 × 8 ft, 8 in, 57 in) come from the engine.
    - The questions read their numbers from the engine (`exportSize`, `CATALOG`'s first and last rectangle, the square sizes).
    - `opengraph-image.tsx`: the `h1` and the sample in a 24x36 black frame above a sofa, with `ogFonts`; its geometry comes from `scene` so it matches the widget, its colours are literal (the image renderer resolves no CSS variables), and the room is a plain wall-and-sofa outline, not `SampleRoom`.

12. **Assets: `public/frame-mockup/`.** `sample.svg` (2:3, `width="2000" height="3000"` so `naturalWidth` is 2000), `photo.svg` (2:3) and `landscape.svg` (3:2), the canvas's own vector drawings, copied as they are.

13. **Engine housekeeping (BL-130, BL-131), first, in `packages/sizes`.** `exportSize` returns `undefined` for a view whose side is not a positive finite number. `visiblePart` returns `PixelRect` (`{ x, y, w, h }` in px, `y` down from the artwork's top; structurally the old shape, so no existing test changes). The barrel exports `Placement`, `View` and `TIE` only as `MockupPlacement`, `MockupView` and `MOCKUP_TIE`; `mockup.test.ts` imports from `../mockup`, so no existing test changes.

14. **Copy** comes from the canvas, with numbers from the engine, then `humanizer:humanizer` before commit. The title, `h1` and description stay verbatim. The off-canvas lines (proposal) go to the owner first.

## Risks / Trade-offs

- [The exported room differs from the screen if a computed style is missed] → The export reads computed styles from the same nodes the screen draws; the e2e checks pixels at the moulding and the wall.
- [A very large photo is slow to decode or draw on a phone] → The export canvas is at most 2400 × 1600 px (3.84 MP), well under iOS Safari's ~16.7 MP limit; the source is drawn once with its crop. "Opening your artwork…" covers the decode.
- [Safari shows an SVG drawn into a canvas with the canvas tainted] → Same-origin SVG and `blob:` images do not taint a canvas; CI's Playwright runs Chromium only, so the e2e covers the PNG there, and a download check on an iPhone (Safari) is logged as a backlog item with the go-live checks.
- [The disclosure buttons look like tabs but are not ARIA tabs] → They announce as expandable buttons with their current value; the canvas's visual is kept. A screen reader user on desktop sees all groups.
- [The polite live regions talk while dragging] → The answer changes only on size, mat, wall and view; the focus point changes no text.
- [Seven existing e2e tests change] → The owner approves them first; each only adds F7.

## Migration Plan

None. A new page, a shared room component, a site map flag and two additive engine exports. Rollback is setting F7 back to `live: false`.

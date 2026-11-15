# Design

## Context

See `proposal.md`. What this builds on:

- **The F1 pattern** (`apps/web/src/app/page.tsx`, `components/frame-chart/`): a server-component page with one `"use client"` island that Next prerenders in its default state, static sections around it, `IfLive` / `PageLink` for every link to another page, and `pageMetadata(livePage(id))` for the head.
- **The wall engine** (`t7-wall-engine`, merged first) gives every number:
  - known things and their defaults; `scaleFromMark`; the photo ↔ wall mappings;
  - `DEMO_ROOM`; `frameDistances`, `setDistance`, `snapFrame`, `placeBeside`;
  - `photoEdges`, `markedFurniture`.
- **The approved canvas** (https://claude.ai/artifact/AzNYiLnMFAN8rg8eeMaXZX) holds the layout, the copy and the decisions. Boards a–n cover the widget states. "F2 page — phone 390" and "desktop 1280" cover the page. The design system (https://claude.ai/artifact/SFXVU5PvBaHDquyEefVDd5) holds `Breadcrumbs` and the new `SizeTable` props.
- **`useUnit`** gives the unit on the client only, and `"in"` on the server. F1 re-renders once after hydration. That works for a widget with fixed boxes, but not for page copy that should show one unit.

## Goals / Non-Goals

**Goals:**

- The page and its sample room are complete in the server HTML, so they are indexable, show no layout shift, and work before the script loads.
- Every number comes from the engine; the page adds only display rules.
- The widget works with a mouse, a finger and a keyboard, and the photo never leaves the device.

**Non-Goals:**

- Perspective correction, saving a wall, URL state, analytics events (BL-15).
- "Open full size" (T23) and the reserved extension section (T24).
- Applying one-unit text to F1 (BL-30).

## Decisions

### 1. A new `frames-on-wall` capability, two folders

The capability owns two folders:

- `apps/web/src/app/frame-sizes-on-wall/`: `page.tsx` and `opengraph-image.tsx`;
- `apps/web/src/components/frames-on-wall/`: the widget, its pure state, and the static sections.

Its README row is added at archive. Until then the folders match no row, so the hook does not gate them. Writing tests first is still the rule.

- Alternative: put F2 under `frame-size-chart`. Rejected. That capability is F1's page; one page per capability keeps each spec readable.

### 2. Both units in the HTML, a root attribute picks one

- **Markup.** A small server-safe component, `<U in="8 in" cm="20 cm" />`, renders `<span class="u-in">…</span><span class="u-cm">…</span>`. `globals.css` hides `.u-cm` by default and, under `:root[data-unit="cm"]`, hides `.u-in` and shows `.u-cm`.
- **Before paint.** `layout.tsx` adds an inline script to `<head>` that reads the stored unit (in a `try`) and sets `document.documentElement.dataset.unit`. `<html>` gets `suppressHydrationWarning` for that one attribute.
- **Switching.** `setUnit` also sets the attribute.

The widget's visible numbers use `<U>` too. Its state changes the numbers, not the unit, so the server HTML and the hydrated HTML match.

CSS cannot switch attribute values or input contents, so the widget also reads `useUnit` for:

- the distance fields' values and `parseLength`'s unit;
- the step of − and +, and of keyboard nudges (¼ in or 1 cm);
- the less and more buttons' `aria-label`s;
- the drawing's name and the live-region text;
- the door, sofa and bed defaults in step 3.

The server renders these in inches. A cm visitor gets an attribute-only update after hydration: nothing visible moves.

- Alternative: render one unit from `useUnit`. Rejected. Server HTML would always be inches, and a cm visitor would see the text change after hydration.
- Alternative: a cookie and dynamic rendering. Rejected. The site is static.

### 3. One client island, state in a reducer, no URL state

`FramesOnWall` is the island. Its state is held in a `useReducer` and contains:

- the mode: sample, or a photo with its scale step;
- the frames, the selected id and the frame being added;
- the photo's object URL and its pixel size;
- the known thing, the mark, the length, the floor line;
- the start-over dialog.

The reducer is pure and unit-tested. Every geometric step calls the engine. Nothing goes in the URL: a photo cannot, and the canvas asks for no shareable state.

- Alternative: URL state as on F1. Rejected for v1. The sample-room-only state is not worth a second parser.

### 4. Page-only display rules live in one module

`components/frames-on-wall/display.ts` holds the rules that the canvas made page-only:

- **Rounding.** `roundDistance(inches, unit)` rounds to ¼ in, or to whole cm.
- **Writing a distance.** `writeDistance` gives "8¼ in" or "20 cm".
- **Reading what the visitor types.** `parseLength(text, unit)` accepts "8.25", "8 1/4" and "8¼". A typed number is in the visitor's unit. Anything else gives `null`.
- **The short-mark rule.** `SHORT_MARK_PX = 134` and `markError(px) = 4 / px`.
- **The frame cap.** `MAX_FRAMES = 6`.

Each is a constant or a pure function with a test.

### 5. The drawing is DOM in percentages, with two layers

The stage keeps the wall's (or photo's) aspect ratio. Rectangles are positioned in percentages of the wall from the engine's inches, so the stage scales without measuring the screen.

It has two layers:

- **The drawing,** with `role="img"` and a name built from the state. It holds the wall or photo, the sofa, the frames, the dimension lines and the tape.
- **A sibling control layer, at the same size.** It holds the frame buttons (with a 44 px minimum hit box centred on each frame), the mark handles and the floor handle.

A `role="img"` element hides its children from assistive technology, which is why the controls cannot sit inside the drawing.

- Alternative: SVG, as in F1's `ScalePreview`. Rejected for the stage. Buttons, handles and the loupe are easier to make accessible and 44 px in HTML, and the drawing is all rectangles.

### 6. Pointer, keyboard and loupe

- **Dragging.** Frames and handles use pointer events with `setPointerCapture` and `touch-action: none`.
- **Moving and snapping.** A pointer move converts the pixel delta to inches with the stage's width and calls `snapFrame`. The snap lines it returns are drawn as tape. A press that moves less than 4 px is a tap.
- **Keyboard.** Arrow keys call a plain move, with no snap. The step depends on the unit: ¼ in or 1 cm, and with Shift, 1 in or 5 cm. Delete removes the frame.
- **The loupe.** It is a 96 px circle whose background is the same object URL, scaled 3× and offset to the handle's point.

### 7. The photo stays in the page

- The file input uses `accept="image/*"` and no `capture` attribute, so a phone offers both the camera and the gallery.
- The page makes an object URL for the file and gets its pixel size from `createImageBitmap`. That call applies EXIF orientation by default, as `<img>` does.
- The object URL is revoked on "Change photo", on start over and on unmount.
- No upload code exists. An e2e test checks that no request made after picking the photo carries a body.
- The `<img>` has `alt="Your wall photo"`.

### 8. Breadcrumbs and the social image

- **Breadcrumbs.** `Breadcrumbs` (ported) renders the trail. `seo.ts` gains `breadcrumbJsonLd(page)`, which builds Home › the page's short name with `absoluteUrl`. The page writes it in one `<script type="application/ld+json">`, escaped like `siteJsonLd`.
- **The social image.** F2's `opengraph-image.tsx` draws a 16x20 at true scale above a three-seat sofa, built from `wallScene`. Its alt comes from the guide's formula.
- **The font.** F2's image loads the same TTF as the home image. The loading moves into a shared `lib/og-font.ts`, still from `process.cwd()` as the Next docs show (BL-9 stays deferred). That file joins the `seo-base` README row at archive.

### 9. Related tools takes the current page

`RelatedTools` (in `components/frame-chart/`) gains two optional props: `current` (default `"F1"`) and `outside`, the out-of-hub page ids it must link to (default F1's P1, PH1, C1 and G1). It lists the live pages of the current page's hub, except the current page, then the live `outside` pages. F2 passes `current="F2"` and `outside={["C1", "G1"]}`. F1's call and the existing tests stay as they are.

- Alternative: a sibling component for F2. Rejected. It would copy the grouping and the empty-section rule.

### 10. Copy is ported from the canvas, then humanized

The page's text comes from the canvas's `Main.dc.html` and `Wall.dc.html`: the answer, steps, rules, table rows, questions and the widget's labels and messages. It is written into the components as text with `<U>` for lengths. Each length is computed from the engine where the engine has it (outside sizes, the 57 in centre line, 8 in above the sofa).

The humanizer runs over the new text before commit. It must not change a size, a keyword or the h1.

## Risks / Trade-offs

- **A pre-paint script.**
  - Risk: a CSP added later must allow it.
  - Mitigation: the script is inline and tiny, and it sits in the layout beside the theme rules. The site has no CSP today.
- **The canvas shows the 6-frame note linking to G1, which is not live.**
  - Mitigation: the link is wrapped in `IfLive`, and the note stands without it.
- **Existing e2e tests change.**
  - The two F1 tests that assumed F1 is the only live page are rewritten to the new scenarios. This needs the user's approval, which the proposal asks for.
  - The old scenarios stay, proven by fixture unit tests.
- **Small frames on a 360 px phone.**
  - Mitigation: the 44 px hit boxes may overlap. The selected frame is drawn on top, and "On the wall" always works.
- **Large photos.** Object URLs avoid decoding into `data:` strings. A 12 MP photo shows scaled down by CSS. The pixel maths uses the natural size.

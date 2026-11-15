# Proposal

## Why

Tracker row T7 is the F2 page, "Frame sizes on your wall" (`/frame-sizes-on-wall`). It is the second Frames page, and the first with a photo tool: a visitor sees standard frames on their own wall at true size. The geometry ships in `t7-wall-engine`. This change ships the page. It was planned once the user approved the F2 canvas on 2026-11-15 (https://claude.ai/artifact/AzNYiLnMFAN8rg8eeMaXZX, recorded in CLAUDE.md "Design source").

It starts after `t7-wall-engine` is merged.

## What Changes

- **New page `/frame-sizes-on-wall`**, statically rendered, laid out as the canvas's "F2 page" boards (phone 390, desktop 1280). Its head values come from the On-page SEO guide's F2 rows:

  | Field                | Value                                                                                                                                                                                      |
  | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | URL / canonical      | `/frame-sizes-on-wall`                                                                                                                                                                     |
  | Head keyword         | frame sizes on wall (1,300 / KD 16)                                                                                                                                                        |
  | Title                | Frame Sizes on Your Wall: Photo Visualizer (no brand suffix: it already holds "Frame Sizes")                                                                                               |
  | h1                   | Frame Sizes on Your Wall                                                                                                                                                                   |
  | Description          | See all 19 standard frame sizes, 4x6 to 27x40, on your wall at true size: upload a photo and set the scale with a door, a sofa, a bed or a sheet of paper.                                 |
  | Secondary keywords   | wall photo frame sizes (h2) · wall art frame sizes (table caption) · wall frame sizes (question) · picture frame sizes on wall (h2) · frame visualizer (answer paragraph and widget title) |
  | Open Graph image     | the page's own 1200 × 630 PNG, alt "16x20 picture frame at true scale next to a three-seat sofa"                                                                                           |
  | Structured data      | `BreadcrumbList` (Home › Frame sizes on your wall). No `FAQPage`, no `WebApplication`.                                                                                                     |
  | Visitor's upload alt | "Your wall photo", not indexed                                                                                                                                                             |
  | Must link out of hub | G1, C1 (Related tools); G3 in a question                                                                                                                                                   |

- **The page's sections**, in order: the breadcrumbs, the `h1` and answer paragraph, the frame visualizer widget, then four `h2` sections and Related tools:
  - "How to see frame sizes on your wall": four steps.
  - "Picture frame sizes on a wall: how big to go": width, gap and height rules.
  - "Wall photo frame sizes": a table of six sizes and the space each one takes on the wall.
  - "Questions about frames on a wall": five questions.
  - "Related tools".

  The copy is the canvas's. It ran through the humanizer there, and it runs again before commit.

- **The frame visualizer widget** (`apps/web/src/components/frames-on-wall/`):
  - It opens in the sample room with the 16x20 selected and its four distances shown, in the server HTML.
  - Frames can be added from all 19 sizes, up to 6. A dashed preview shows where a new frame will go before it is added.
  - Frames can be dragged with snapping, and moved by keyboard.
  - The selected frame's distances can be edited with − and + or typed.
  - **Your wall photo:** upload; set the scale in three steps (pick the known thing, with the door as the default; place the two ends with a loupe; confirm the length); a warning for a mark too short to trust; an optional floor line; start over.
  - The photo is read in the browser and never sent.
- **One unit at a time.** The canvas decided that the in/cm toggle drives every number on the page. Both units go into the server HTML and CSS shows the chosen one. A root `data-unit` attribute, set before first paint from the stored choice, decides which unit shows, so a cm visitor sees no flash. This is a site-wide mechanism in `site-shell`; F2 is its first user.
- **Breadcrumbs** shown above the `h1`, and `BreadcrumbList` JSON-LD, on every live page below the home page.
- **Ported widgets:**
  - `Breadcrumbs` is new in `components/ui`, from the design system.
  - `SizeTable` gains the design system's `title`, `meta` and `selectable={false}` (decision "Option C").
- **F2 goes live** (`live: true` with its head values). F1 gets a related-tools card ("What standard frame sizes exist?", 4:5, from the canvas) and a new `lastModified`, since its HTML changes. With F2 live, the site gains:
  - F2 in the footer and the sitemap;
  - F1's "See it on my wall" button and its "Try frame sizes on your wall" sentence;
  - F1's Related tools section, which appears with F2 as its one card.
- **Backlog:** read 2026-11-15. None is folded in.
  - BL-9 (the social-image font path) stays deferred: F2's image is prerendered too, so its trigger has not fired.
  - BL-30 (F1 shows one unit at a time). It uses the mechanism this change adds, but it changes F1's approved copy and its existing tests, so it stays its own item, now smaller.

## Capabilities

### New Capabilities

- `frames-on-wall`: the F2 page and its frame visualizer widget. It covers the outline, the answer, the sample room, frames and distances, the photo flow, privacy, accessibility, phone fit and links.

### Modified Capabilities

- `site-shell`: the unit preference also decides, before first paint, which unit a page's dual-unit text shows.
- `seo-base`:
  - pages below the home page carry visible breadcrumbs and `BreadcrumbList` JSON-LD;
  - the sitemap scenario "only the home page is live" becomes "the home page and F2 are live".
- `frame-size-chart`: the outline gains "Related tools" at the end while a related page is live, and a scenario for F2 being live joins "no other page is live". F1 then shows "See it on my wall", the Related tools section with F2's card, and no `#` link.
- `size-engine` is not modified here. Snapping and placement were added to `t7-wall-engine`'s delta, so G1 and the extension get them too.

## Impact

- **Approved by the user on 2026-11-15: existing tests change.** F2 going live breaks three existing e2e tests, by design. Each is rewritten to a new scenario in this change's deltas; the old scenarios stay, proven by fixture unit tests.
  - `e2e/seo-home.spec.ts`, "sitemap.xml lists the home page only": becomes two entries, F1 and F2.
  - `e2e/frame-chart-content.spec.ts`, "no link to a page that is not live": expects F1's "See it on my wall" link and the Related tools heading, and still no `#` link.
  - `e2e/frame-chart-content.spec.ts`, "the server HTML follows the approved outline": allows "Related tools" after the six `h2` headings, and its "Frames" `h3`.

  Unit tests use fixture page lists (`withLive`) or assertions F2 does not change (`liveHubHeads`, `livePage("P1")` throwing), and are unaffected. No other existing test is edited.

- **Code:**
  - new: `apps/web/src/app/frame-sizes-on-wall/` (`page.tsx`, `opengraph-image.tsx`) and `apps/web/src/components/frames-on-wall/`;
  - edits: `lib/site-map.ts` (F2 live), `lib/seo.ts` (breadcrumb JSON-LD), `lib/unit.ts` and `app/layout.tsx` (the `data-unit` attribute and its pre-paint script), `app/globals.css` (the unit rule), `components/ui/size-table.tsx`, a new `components/ui/breadcrumbs.tsx`, and `components/frame-chart/related-tools.tsx` (props for the current page and its out-of-hub links).
- **Dependencies:** none added. Pointer events, `<input type="file" accept="image/*">`, `createImageBitmap` and `URL.createObjectURL` are native.
- **Specs:** the new `frames-on-wall` spec gets its README row at archive: `apps/web/src/app/frame-sizes-on-wall/**, apps/web/src/components/frames-on-wall/**`.
- **SEO guide:** the F2 row's head keyword KD (6 → 16, as in the research) and its description were corrected on 2026-11-15, as direct edits.
  - Still to fix at apply: the "Widget canvas" alt row needs the canvas's note. The frame buttons sit in a sibling layer, because `role="img"` hides its children.
  - The pre-publish checklist runs before archive.
- **Tracker:** T7 becomes `Done` at archive.
- **Left out:**
  - "Open full size" (the extension's tab, T23);
  - the reserved extension section (T24): not rendered, since an empty box on a live page reads as broken;
  - perspective correction;
  - saving a wall;
  - analytics events (BL-15).

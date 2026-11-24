# Proposal

## Why

Tracker row T6 is the F6 page, "Poster & art frames picker, with/without mat" (`/poster-frame-sizes`). A visitor has a poster or an art print and wants the frame that fits it, with or without a mat. Phase 1, `t6-poster-frame-engine` (archived and merged 2026-11-23), put the poster sizes and the poster-to-frame lookup in the size engine (`POSTERS`, `posterFrames`, `A_FRAMES`, `POSTER_BORDER`). This is phase 2: the widget, the copy, the head values and F6 going live. The owner approved the F6 canvas on 2026-11-23 (https://claude.ai/artifact/43JSmmnTJHtj55WBpR84qT, recorded in CLAUDE.md "Design source"), option A on all ten questions; the archived engine change lists the answers under "Canvas answers".

## What Changes

- **New page `/poster-frame-sizes`**, statically rendered and laid out as the canvas's "F6 page" boards (desktop 1280, phone 390). It is a Chart page in the SEO guide's outline. Head values from the guide's F6 rows:

  | Field                | Value                                                                                                                                                                                                                                               |
  | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | URL / canonical      | `/poster-frame-sizes`                                                                                                                                                                                                                               |
  | Head keyword         | poster frame sizes (1,900 / KD 10): the `h1` and the first sentence                                                                                                                                                                                 |
  | Title                | Poster Frame Sizes Chart: With or Without a Mat (47 characters, no suffix: it already holds "Frame Sizes")                                                                                                                                          |
  | h1                   | Poster Frame Sizes                                                                                                                                                                                                                                  |
  | Description          | Find the frame that fits your poster or painting: standard poster frame sizes from 11x17 to 27x40, with or without a mat, in inches and cm.                                                                                                         |
  | Secondary keywords   | poster frame sizes chart (480: an `h2`) · standard poster frame sizes (720: the table title) · painting frame sizes (720: an `h2`) · standard print frame sizes (390: a question) · typical poster frame sizes (320, from the research: a question) |
  | Affiliate keys       | none in the guide                                                                                                                                                                                                                                   |
  | Open Graph image     | the page's own 1200 × 630 PNG: the `h1` and a 24x36 poster drawn in its 24x36 frame and in a 27x40 frame with a mat; alt "A 24x36 poster in a 24x36 frame, and in a 27x40 frame with a mat"                                                         |
  | Structured data      | `BreadcrumbList` (Home › Poster frame sizes). No `FAQPage`, no `HowTo`.                                                                                                                                                                             |
  | Must link out of hub | P1 Poster sizes (Related tools and step 1 of the how-to, only when live). The anchor "poster sizes" always means `/poster-sizes`.                                                                                                                   |

- **The page's sections**, in the canvas's order: breadcrumbs, `h1`, the answer paragraph, the widget, then:
  - "Poster frame sizes chart": one table, one row per poster (poster with its use line, frame without a mat, frames with a mat with "pre-cut" and their borders), titled "Standard poster frame sizes".
  - "Frames for small posters: 11x17, 12x18 and 16x20", "Frames for large posters: 18x24 to 27x40", "Frames for A-series posters: A3, A2 and A1": one case card per poster.
  - "Painting frame sizes": canvas takes a frame of its own size, with four examples (11x14, 16x20, 18x24, 24x36).
  - "How to choose a poster frame": three numbered steps.
  - "Questions about poster frames": six questions, the first open.
  - "Related tools".
- **The widget** (`apps/web/src/components/poster-frames/`), as the canvas's Poster component draws it:
  - Ten poster chips (name, with whole cm or mm under it) and a "Custom size" chip that opens width × height fields, with "Back to standard sizes" above them. The typed size is kept when the visitor goes back.
  - "Without a mat" / "With a mat" and "Portrait" / "Landscape" segmented controls. Landscape turns the chip labels and every frame. A typed size sets its own orientation.
  - Opens on 24x36, without a mat, portrait, with its answer and drawing in the server HTML (Q9).
  - Without a mat: a standard frame ("Use a 24x36 frame."), a metric or A-series frame ("Use an A2 frame (420 × 594 mm)."), or a custom size with "Order this size" and the closest standard sizes. A standard answer, and a custom one that some standard frame takes with a mat, offers the with-a-mat answer in a box under the cards; a metric answer lists those frames in a card instead.
  - With a mat: one card per standard frame, smallest first, with its borders (sides / top and bottom) and a "Pre-cut mat included" or "Mat cut to order" badge. With more than one, tapping a card draws it. With none (27x40): the custom frame for a 2 in mat and a link to the frame and mat calculator.
  - A drawing of the poster in its frame, one scale for every size, with a legend and a caption.
  - Typed sizes take fractions (inches) or one decimal (cm); bad input says "Enter a width and a height above 0." and shows no answer. The site header's in/cm switch converts the typed numbers.
  - Desktop: chips, controls and drawing on the left, the answer on the right. Phone: one column, the answer, then the drawing. One DOM, laid out by CSS.
- **F6 goes live** in the site map with its head values. The sitemap gains `/poster-frame-sizes` (40 URLs). Every live Frames page's Related tools gains the F6 card (F1, F2, F3, F4, F5); the footer lists F6 under Frames. No engine change.

Copy that is not on the approved canvas, for the owner before commit:

- **Metric answers.** The canvas's own matcher printed "11x14 is smaller, 12x18 is bigger" under A3; the engine gives sizes below and above only for a custom size (A2, A1, typed). A3 reads "A3 frames are sold under the paper's name. No US frame size is within ⅜ in of it." A typed metric size with a US frame just as close (40 × 50 cm and 16x20) reads "A metric frame size. A 16x20 frame is within ⅜ in of it too."
- **An oversized typed poster.** The drawing keeps one scale up to the largest frame the page names (the 30½ × 43½ in custom frame for a 27x40). A bigger typed size is drawn smaller to fit, captioned "Drawn smaller than the other sizes, to fit."
- **Step 1 of the how-to while P1 is not live:** "Width first, edge to edge. Most posters come in a standard size." The canvas's "the poster sizes page lists them" link appears when P1 goes live.
- **The drawing's label** gives every size in both units ("Drawn to scale: a 24 × 36 in (61 × 91.4 cm) poster in a 24 × 36 in (61 × 91.4 cm) frame, no mat."), where the canvas wrote one unit; a server-rendered label cannot follow the switch (BL-117 on F5).
- The social image and its alt (table above).

## Capabilities

### New Capabilities

- `poster-frame-sizes`: the F6 page and its widget. Covers the chips, the custom size, the mat and orientation switches, the answers and their cards, the drawing, bad input, the unit, the desktop and phone layouts, and the page's chart table, size groups, painting section, how-to, questions, links and head values.

### Modified Capabilities

- `seo-base`: the sitemap requirement gains a scenario with F6 live (40 URLs).
- `frame-size-chart`: the live-links requirement gains a scenario with F2 to F6 and G1 live.
- `frames-on-wall`: the live-links requirement gains a scenario with F1 to F6 and G1 live.
- `actual-size`: the live-links requirement gains a scenario with F1 to F6 and G1 live.
- `measure-frame`: the live-links requirement gains a scenario with F1 to F6 and G1 live.
- `frame-mat-calculator`: the live-links requirement gains a scenario with F1 to F6 and G1 live.

## Impact

- New:
  - `apps/web/src/app/poster-frame-sizes/` (page, Open Graph image, CSS);
  - `apps/web/src/components/poster-frames/`;
  - `e2e/poster-frames.spec.ts` and `e2e/poster-frames-content.spec.ts`.
- Changed: `apps/web/src/lib/site-map.ts` (F6 live). Nothing in `packages/sizes`.
- **Existing tests to edit (needs the owner's approval).** Each is re-pointed to its new scenario and only adds the F6 card or URL:
  - `e2e/frame-chart-content.spec.ts` (Related tools);
  - `e2e/frames-on-wall-content.spec.ts` "links only to live pages";
  - `e2e/actual-size-content.spec.ts` "links only to live pages";
  - `e2e/measure-frame-content.spec.ts` "links only to live pages";
  - `e2e/frame-mat-content.spec.ts` (Related tools);
  - `e2e/seo-home.spec.ts`: the sitemap test expects 40 URLs, F6 among them.

  The Related tools and footer unit tests build their own site maps and stay as they are.

- No new dependency. No paid API.
- Not here: affiliate links (none in the guide; T21); analytics events (BL-15); a dark theme (BL-2); the canvas's options B and C; 24x30 and 30x40 frames (BL-119).
- Backlog, read 2026-11-23:
  - BL-118 (a scroll hint on wide tables on a phone) names F6's chart. Left open: it is site-wide CSS in `widgets.css` for the tables on F1, F4, F5 and F6, and fits a backlog batch better than one page. F6's table scrolls in its own box like the others.
  - BL-117 (F5's figure label in inches only) is not repeated: F6's drawing label gives both units.
  - BL-110 (one eighths split) is not touched: F6 writes lengths with the engine's `inEighths` and reads fields with F5's `inches`.
  - BL-98 (F3's chips on a small screen) is F3's slider and does not apply to F6's chips.
  - BL-17 and BL-119 stay deferred (the next size data check).
- Tracker: T6 becomes `Done` at archive.

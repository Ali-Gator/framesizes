# Proposal

## Why

Tracker row T11 is the G1 page, "Gallery wall planner" (`/gallery-wall-planner`), the head of the Gallery wall hub. A visitor picks a template of standard frames, sets one gap, sees the group on a sample wall or their own wall photo, and gets the group's size and a numbered spot for every nail. The geometry ships in `t11-gallery-wall-engine`. This change ships the page. The user approved the G1 canvas on 2026-11-16 (https://claude.ai/artifact/HGW1ti5mv6Mc8BqPRepXGd, recorded in CLAUDE.md "Design source").

It starts after `t11-gallery-wall-engine` is merged.

## What Changes

- **New page `/gallery-wall-planner`**, statically rendered, laid out as the canvas's "G1 page" boards (phone 390, desktop 1280) and the widget boards a–m. Its head values come from the On-page SEO guide's G1 rows:

  | Field                | Value                                                                                                                                                                                                                |
  | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | URL / canonical      | `/gallery-wall-planner`                                                                                                                                                                                              |
  | Head keyword         | gallery wall layout (6,600 / KD 31)                                                                                                                                                                                  |
  | Title                | Gallery Wall Layout Planner & Generator (the layout's template appends "\| Frame Sizes": 53 characters in all)                                                                                                       |
  | h1                   | Gallery Wall Layout Planner                                                                                                                                                                                          |
  | Description          | Plan a gallery wall layout with real frame sizes: pick a template, set the spacing, and get exact measurements and nail positions for your wall.                                                                     |
  | Secondary keywords   | gallery wall layout generator (widget title) · gallery wall planner (h2) · gallery wall template (h2) · gallery wall layout with sizes (table caption) · gallery wall (question "How big should a gallery wall be?") |
  | Affiliate keys       | gallery wall frames · gallery wall frame set · gallery wall art: left out until T21 (below)                                                                                                                          |
  | Open Graph image     | the page's own 1200 × 630 PNG, alt "Gallery wall layout with an 18x24 frame and four 8x10 frames above a sofa"                                                                                                       |
  | Structured data      | `BreadcrumbList` (Home › Gallery wall layout planner). No `FAQPage`, no `WebApplication`.                                                                                                                            |
  | Must link out of hub | F1, F2 (Related tools)                                                                                                                                                                                               |

- **The page's sections**, in order: the breadcrumbs, the `h1` and answer paragraph, the gallery wall layout generator, then:
  - "How to use the gallery wall planner": five steps;
  - "Gallery wall templates": a table captioned "Gallery wall layout with sizes", with each template's frames, its size on the wall, and the furniture width it suits;
  - "Spacing and height": the gap, height and width rules;
  - "Questions about gallery wall layouts": five questions;
  - "Related tools".

  The copy is the canvas's. It ran through the humanizer there, and it runs again before commit.

- **The widget** (`apps/web/src/components/gallery-wall/`), titled "Gallery wall layout generator":
  - **Two views**, Layout and Nail marks, switched in the widget's header. The server HTML holds the Layout view.
  - **It opens** in the sample room with "One big, two on each side" 8 in above the sofa and the whole group selected. The summary reads 46 × 27 in, its top 69 in up, 49 in from each side.
  - **Templates:** five to-scale pictures. Switching after a change asks first; with nothing changed, it switches at once. The gap and the hangers carry over.
  - **Gap:** one gap for all frames, 3 in by default, ¼ in (1 cm) steps, from 0 to 12 in. Changing the gap or a size lines the frames up again and drops hand moves, with a one-line note when anything was moved.
  - **Sizes:** tap a frame, then "Change size" (F2's picker). "Also the other N frames of that size" is on by default. Frames are lettered A, B, C.
  - **Moving:** a frame drags and snaps as on F2, with its four distances and arrow keys. Selecting the whole group gives the group's four distances, and setting one moves every frame.
  - **Adding:** "Add a frame", up to 12.
  - **Warnings:** a group past a wall edge names the side and the amount, with "Centre it on the wall" when it fits, or "It is N in too wide" when it does not. The sample room also warns past the ceiling; a photo with no marked edge warns past the photo's border.
  - **Nail marks:** "Hanger for" (All frames, or one frame) and the type, One nail | Two D-rings. The drop and the inset start empty. Before a drop is typed, the map shows the frames and Start, with "Type the drop to number the nails." After that, numbered badges on the map match a table: Nail, Frame, Right, Down, Up from floor. Frames with no nail get one line each under the table.
  - **The hanger type carries over** (the user's decision, 2026-11-16, not on the canvas). Once the visitor picks One nail or Two D-rings for a frame, the next frame they open in "Hanger for" starts on that type, and so do frames added later. Only the type carries over; the drop and the inset stay empty, so the page never guesses a hole.
  - **Your wall photo:** F2's upload and three-step scale flow, reused unchanged. On a photo the group hangs 8 in above a marked sofa or bed, else centred between the marked wall edges on the 57 in line, else in the middle of the photo. The photo stays on the device.
  - **Units:** the site's in/cm toggle switches every number, typed drops included.
- **The Gallery wall hub goes live** (`G1 live: true` with its head values). G1 is the second live hub, so the header shows hub links (Frames, Gallery wall) for the first time. With G1 live:
  - G1 joins the footer and the sitemap;
  - F1's Related tools gains G1's card, and F2's gains it too, along with F2's "gallery wall layout planner" sentence at six frames. Both pages get a new `lastModified`.
- **Left out, by the user's decision on 2026-11-16:**
  - **The shop section** ("Where to buy gallery wall frames", its disclosure and two callouts) waits for T21, which picks the shops. The canvas's placeholders would read as broken. So the buy keys stay off the page until then, and the design system's `AffiliateCallout` is not ported yet. When T21 ports it, it needs `rel="sponsored nofollow noopener"`; the design system's version leaves out `nofollow`.
  - **The extension slot (T24)** is not rendered, as on F2.
- **Backlog folded in** (read 2026-11-16):
  - **BL-4.** G1 is the second live hub, so check the header at 320px with the menu button and fix any wrap.
  - **BL-42.** G1 reuses F2's photo picker, so read the photo's size without decoding the whole image.
  - **BL-43.** F2's "Start over?" dialog: centre it. G1 reuses it.
  - **BL-44.** F2's photo and scale steps: centre the column on desktop. G1 reuses them.

## Capabilities

### New Capabilities

- `gallery-wall-planner`: the G1 page and its gallery wall layout generator. It covers the outline, the answer, the template table, the widget's two views, templates, gap, sizes, moving, warnings, nail marks, the hanger carry-over, the photo, units, accessibility, phone fit and links.

### Modified Capabilities

- `seo-base`: the sitemap gains the scenario "the home page, F2 and G1 are live".
- `frame-size-chart`: links-only-to-live-pages gains the scenario "F2 and G1 are live besides the home page".
- `frames-on-wall`: links-only-to-live-pages gains the scenario "F1, F2 and G1 are live".

## Impact

- **Approved by the user on 2026-11-16: existing tests change.** G1 going live breaks three existing e2e tests, by design. Each is rewritten to a new scenario in this change's deltas; the old scenarios stay, proven by fixture unit tests (`withLive`).
  - `e2e/seo-home.spec.ts`, "sitemap.xml lists the home page and F2": becomes three entries.
  - `e2e/frame-chart-content.spec.ts`, "links to F2 and to no page that is not live": Related tools holds F2 and G1.
  - `e2e/frames-on-wall-content.spec.ts`, "links only to live pages": Related tools holds F1 and G1, and the G1 link may appear.

  The header, footer and related-tools unit tests use fixture page lists and are unaffected. No other existing test is edited.

- **Code:**
  - new: `apps/web/src/app/gallery-wall-planner/` (`page.tsx`, `opengraph-image.tsx`, `gallery.css`) and `apps/web/src/components/gallery-wall/`;
  - edits in `apps/web/src/components/frames-on-wall/`: export the photo flow, the stage and the display rules for G1 to reuse, with F2's behaviour unchanged (its tests guard it), plus BL-42;
  - edits: `lib/site-map.ts` (G1 live, F1 and F2 `lastModified`), `app/frame-sizes-on-wall/wall.css` (BL-43, BL-44), `components/site/site-header.tsx` only if BL-4 needs a fix.
- **Dependencies:** none added.
- **Specs:** the new `gallery-wall-planner` spec gets its README row at archive: `apps/web/src/app/gallery-wall-planner/**, apps/web/src/components/gallery-wall/**`.
- **SEO guide:** the G1 rows are used as they are. The pre-publish checklist runs before archive. The affiliate item does not apply until T21 adds the shop section.
- **Tracker:** T11 becomes `Done` at archive. T21 gets a note: G1's shop section and the `AffiliateCallout` port with `nofollow`.
- **Left out:** the shop section (T21), the extension slot (T24), the extension's side panel (T23), room presets (G2), the hanging-height calculator (G3), a printable nail guide, saving a wall, and analytics events (BL-15).

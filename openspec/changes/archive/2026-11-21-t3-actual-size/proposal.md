# Proposal

## Why

Tracker row T3 is the F3 page, "How big is 8x10" (`/how-big-is-8x10`, head keyword "how big is 8x10", 1,900 / KD 25). The visitor wants to _see_ the size, not read it. No page in the top 10 shows a frame at its real size on the screen, and the research names this page's widget as the real-size viewer. The user approved the F3 canvas on 2026-11-21 (https://claude.ai/artifact/274YEEAkh69NAuaRf4vk6C, version 18, recorded in CLAUDE.md "Design source"). The approval settled one open question: the sheet of paper is offered only where it fits across the box.

## What Changes

- **New page `/how-big-is-8x10`**, statically rendered and laid out as the canvas's "F3 page" boards (desktop 1280, phone 390). Its head values come from the On-page SEO guide's F3 rows:

  | Field                | Value                                                                                                                                                                       |
  | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | URL / canonical      | `/how-big-is-8x10`                                                                                                                                                          |
  | Head keyword         | how big is 8x10 (1,900 / KD 25)                                                                                                                                             |
  | Title                | How Big Is 8x10? See It at Actual Size \| Frame Sizes                                                                                                                       |
  | h1                   | How Big Is 8x10?                                                                                                                                                            |
  | Description          | An 8x10 is 8 by 10 inches (20.3 x 25.4 cm). See it at actual size on your screen, then compare it with 11x14, 16x20, A4 and A3 frames.                                      |
  | Secondary keywords   | how big is 11x14 (question) · a3 frame size (question) · a4 frame size (question) · 8x10 picture frame sizes (h2) · how big is a 16x20 frame (question)                     |
  | Affiliate keys       | 8x10 frame · 11x14 frame · 16x20 frame · 8x10 photo · 4x6 frame · 5x7 frame (callout titles; the block ships with T21)                                                      |
  | Open Graph image     | the page's own 1200 × 630 PNG: the nested comparison drawing; alt "8x10 frame compared with 11x14, 16x20, A4 and A3 frames at the same scale" (the guide's comparison rule) |
  | Structured data      | `BreadcrumbList` (Home › How big is 8x10). No `FAQPage`.                                                                                                                    |
  | Must link out of hub | PH1, Q2 (Related tools, when live); G1 on the canvas                                                                                                                        |

- **The page's sections**, in order: breadcrumbs, `h1`, answer paragraph, the actual size viewer, then:
  - "How to see a frame size at actual size": three steps.
  - "How big is 8x10 next to things you know": a Letter sheet, an A4 sheet, a credit card.
  - "8x10 picture frame sizes compared": a drawing of seven sizes from one corner, and a table with inches or cm and the area against 8x10.
  - A reserved slot for "Where to buy 8x10 frames" (T21 fills it; no affiliate code ships here).
  - "Questions about frame sizes": six questions.
  - "Related tools".
- **The actual size viewer** (`apps/web/src/components/actual-size/`):
  - Seven sizes: 4x6, 5x7, 8x10, 11x14, 16x20, A4, A3. It opens on 8x10. No Turn button.
  - **Phone, three steps, each on one screen:**
    1. The answer: the size grid, the size, "About N phone screens wide and M tall", a map of the frame with the phone's outline, and "See 8x10 at actual size".
    2. The check, the first time: a credit card's short edge between two lines. Or a ruler (0 to 2 in or 5 cm), or the screen size, or skip.
    3. The frame at 1:1 over the whole viewport. You drag to pan; a mini map follows; Close returns.
  - **Desktop, one screen:** the size row, the scale status, a 1:1 box with rulers that scrolls, the size, and a map of the part on screen. The check opens inline with four tabs: credit card, ruler (0 to 5 in or 12 cm), sheet of paper, screen size. The sheet tab shows only where a Letter sheet fits across the box at the guessed scale.
  - Before a check, the scale is a guess, and the widget says so. A check is kept on the device with the screen's size and pixel ratio, and counts as unchecked once either changes.
- **Size engine:** the seven sizes (A4 and A3 from millimetres), the edges of the things used to check a screen (one record for the card, the Letter sheet and the A4 sheet, which F2's known things now read their long edges from), a screen's scale from its diagonal, and a first guess of the scale.
- **F3 goes live** in the site map with its head values. The sitemap gains `/how-big-is-8x10`. F1's and F2's Related tools gain the F3 card. G1 lists only F1 and F2, so it is unchanged.

## Capabilities

### New Capabilities

- `actual-size`: the F3 page and its actual size viewer: the sizes, the scale check, the phone steps, the desktop box, the maps, the saved check, and the page's sections, links and head values.

### Modified Capabilities

- `size-engine`: adds the actual-size list, the check objects' edges, the scale from a diagonal and the first guess.
- `seo-base`: the sitemap requirement gains a scenario with F3 live.
- `frame-size-chart`: the live-links requirement gains a scenario with F2, F3 and G1 live.
- `frames-on-wall`: the live-links requirement gains a scenario with F1, F2, F3 and G1 live.

## Impact

- New: `apps/web/src/app/how-big-is-8x10/` (page, Open Graph image), `apps/web/src/components/actual-size/`, `packages/sizes/src/screen.ts`.
- Changed: `packages/sizes/src/wall.ts` (the long edges from the shared record), `packages/sizes/src/index.ts`, `apps/web/src/lib/site-map.ts` (F3 live).
- **Existing tests to edit (needs the owner's approval):**
  - `e2e/frame-chart-content.spec.ts`: "links to F2 and G1…" expects the F3 card too.
  - `e2e/frames-on-wall-content.spec.ts`: "links only to live pages" expects the F3 card too.
  - `e2e/seo-home.spec.ts`: the sitemap test expects nine URLs, F3 among them.

  Each is re-pointed to the new scenario.

- No new dependency. No paid API.
- Not here: the affiliate links (T21, which also owns the Privacy Policy update before they ship); `?size=` in the URL (the page targets 8x10; other sizes stay in the widget's state).
- Backlog: BL-88 (retire "The home page, F2 and G1 are live") cannot be folded in, because OpenSpec refuses to drop a scenario from a MODIFIED block; it stays open.

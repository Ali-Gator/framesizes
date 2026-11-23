# Proposal

## Why

Tracker row T5 is the F5 page, "Frame & mat calculator" (`/frame-mat-calculator`). A visitor has a print and wants the frame and mat it needs, or has a frame and wants the print that fits it with a mat. Phase 1, `t5-frame-mat-engine` (archived and merged 2026-11-23), put the mat math in the size engine (`matSizes`, `whyNoMat`, `matBorders`, `MAT_WIDTH`, `MAT_WIDTHS`). This is phase 2: the calculator, the copy, the head values and F5 going live. The owner approved the F5 canvas on 2026-11-23 (https://claude.ai/artifact/PjZ5GizsgyTKMvx6nAfdRp, recorded in CLAUDE.md "Design source"), option A on all eight questions; the archived engine change lists the answers under "Canvas answers".

## What Changes

- **New page `/frame-mat-calculator`**, statically rendered and laid out as the canvas's "F5 page" boards (desktop 1280, phone 390). It is a Tool page in the SEO guide's outline. Head values from the guide's F5 rows:

  | Field                | Value                                                                                                                                                                                                                                                            |
  | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | URL / canonical      | `/frame-mat-calculator`                                                                                                                                                                                                                                          |
  | Head keyword         | picture frame size calculator (260 / KD 15): in the intro sentence                                                                                                                                                                                               |
  | Title                | Picture Frame & Mat Calculator \| Frame Sizes (44 characters)                                                                                                                                                                                                    |
  | h1                   | Frame and Mat Size Calculator                                                                                                                                                                                                                                    |
  | Description          | Enter your print size and mat width to get the frame size and mat opening. Works in reverse too: start from a frame and find the print that fits.                                                                                                                |
  | Secondary keywords   | mat board sizes (590: the table title) · what size frame for 11x14 print (320: a question, verbatim) · what size frame for diploma (260: a question, verbatim) · frame mat sizes (210: the text under the table) · mat size calculator (110: the how-to, step 4) |
  | Affiliate keys       | none in the guide; the canvas reserves a "Where to buy" slot for T21 that renders nothing                                                                                                                                                                        |
  | Open Graph image     | the page's own 1200 × 630 PNG: the `h1` and an 8x10 print in its mat and frame; alt "8x10 print in an 11½ × 13½ in frame with a 2 in mat and a 7½ × 9½ in opening"                                                                                               |
  | Structured data      | `BreadcrumbList` (Home › Frame and mat calculator). No `FAQPage`, no `HowTo`.                                                                                                                                                                                    |
  | Must link out of hub | PH2 (Related tools, when live)                                                                                                                                                                                                                                   |

  The research's head is "mat board sizes" (590 / KD 11). The guide swaps to "picture frame size calculator" on purpose, because the `h1` names what the page does; "mat board sizes" titles the table.

- **The page's sections**, in the canvas's order: breadcrumbs, `h1`, intro sentence, the calculator, then:
  - "How to use the frame and mat calculator": four numbered steps.
  - "Frame and mat size formula": three rules (from a print, from a frame, the mat opening) with worked 8x10 and 11x14 examples, a drawing of an 8x10 print with a 2 in mat, then the "Mat board sizes" table: every catalog frame sold with a pre-cut mat (15 rows), with its mat opening, print and mat border, and a sentence on frame mat sizes naming the frames usually sold without one.
  - "Frame sizes for common prints": an 11x14 print, a 16x20 print and a diploma.
  - A reserved "Where to buy" slot (T21; nothing renders until then).
  - "Questions about frame and mat sizes": seven questions, the first open.
  - "Related tools".
- **The calculator** (`apps/web/src/components/frame-mat/`), as the canvas's Calc board draws it:
  - Two ends, "You enter" and "You get", with a round Reverse button between them. From a print: print width and height. From a frame: frame width and height.
  - A "Mat border" field filled with 2 in and chips 1½, 2, 2½ and 3 in (3.8, 5.1, 6.4 and 7.6 cm); typing another number un-presses them. Its hint says the frame's lip covers about ¼ in of it.
  - Fields take whole numbers, decimals and fractions (`8 1/2`, `8.5`, `8½`); in cm, one decimal. No eighths row.
  - "Find my frame size" (or "Find the print that fits") shows the answer; it then follows every edit. "Start over" clears the sizes and puts the border back to 2 in.
  - Answers from a print: a standard frame ("Use an 8x10 frame."), a metric frame ("Use a 40 × 50 cm frame, a metric size."), or a custom size with the cards "Order this size", "Ready-made, with a pre-cut mat", "Next size up" (only when not already pre-cut) and, for a near-square print, "Square frames". Each card gives the border its frame gives the print.
  - Answers from a frame: the largest print, the standard (or metric) print that fits with its border, and "Sold with this frame": the frame's own pre-cut mat.
  - Each answer gives the frame size or largest print, the mat opening, a "how" line, and a drawing (frame, mat, opening, the print's edge under the mat) with a legend.
  - Reverse after an answer carries the exact answer over as the new input (8x10 print → 11½ × 13½ in frame → Reverse → 8x10 print); before an answer it only flips the direction.
  - Bad input marks the field and moves focus to the first one marked; the answer area says "Check the marked fields, then try again."
  - The in/cm switch in the widget head and the one in the site header set the same unit, and switching converts the typed numbers.
  - Desktop: inputs and drawing on the left, the answer on the right. Phone: one column, the answer under the button, then the drawing. One DOM, laid out by CSS.
- **Size engine:**
  - BL-111: a mat width at or below the ¼ in overlap gets no answer (it gives a frame no bigger than the print, or a print no smaller than the frame). The reason is `"narrow"`, so `NoMat` becomes `NoAnswer`.
  - Diploma frames (new data, checked against sources in this change's `verification.md`): an 8.5 × 11 in diploma, and the 11x14 frame sold for it with a mat cut for 8.5x11 (an 8 × 10½ in opening, 1½ in at the sides and 1¾ in at the top and bottom). The calculator lists that 11x14 among the pre-cut frames for an 8.5x11 print, so its answer agrees with the diploma case on the same page; F4's pre-cut lookup does not change.
- **F5 goes live** in the site map with its head values. The sitemap gains `/frame-mat-calculator`. F1's, F2's, F3's and F4's Related tools gain the F5 card; F1's "Frame size by image size" paragraph gains its existing `IfLive page="F5"` sentence; the footer lists F5 under Frames.

Product questions settled here (recommendation, for the owner to approve with task 1.1):

- **Diploma.** The canvas answered "12x16 frame" and marked it unverified. Retail listings (`verification.md`) sell diploma frames as 11x14 with a mat for an 8.5x11 diploma and an 8 × 10½ in opening. Proposed: "An 11x14 frame. Diploma frames come with a mat cut for 8.5x11: 1½ in at the sides, 1¾ in at the top and bottom. For a wider border, a 12x16 frame comes with a pre-cut 8.5x11 mat: 2 in at the sides, 2¾ in at the top and bottom." The canvas's "Unverified" badge and FAQ prefix do not ship. With it, the calculator names the 11x14 as pre-cut for an 8.5x11 print too (8.5x11 with a 1½ in border: "Use an 11x14 frame.", sold with this mat pre-cut).

Copy that is not on the approved canvas, for the owner before commit:

- BL-111's message: "Enter a mat border above ¼ in. A narrower one leaves the frame no bigger than the print." (cm: "above 0.6 cm").
- The diploma case card and FAQ answer above.
- The social image and its alt (table above).
- The canvas's "Shop link ships with T21" tag on "Order this size" is a designer note and does not ship.

## Capabilities

### New Capabilities

- `frame-mat-calculator`: the F5 page and its calculator. Covers the two directions and Reverse, the fields and border chips, the answers and their cards, the drawing, bad input, the unit, the desktop and phone layouts, and the page's sections, table, cases, questions, links and head values.

### Modified Capabilities

- `size-engine`:
  - modifies "A mat question that gives no size says why" for a mat no wider than its overlap (BL-111);
  - adds the diploma and the frame sold for it.
- `seo-base`: the sitemap requirement gains a scenario with F5 live (39 URLs).
- `frame-size-chart`: the live-links requirement gains a scenario with F2, F3, F4, F5 and G1 live, F5's sentence included.
- `frames-on-wall`: the live-links requirement gains a scenario with F1 to F5 and G1 live.
- `actual-size`: the live-links requirement gains a scenario with F1 to F5 and G1 live.
- `measure-frame`: the live-links requirement gains a scenario with F1 to F5 and G1 live.

## Impact

- New:
  - `apps/web/src/app/frame-mat-calculator/` (page, Open Graph image, CSS);
  - `apps/web/src/components/frame-mat/`;
  - `e2e/frame-mat.spec.ts` and `e2e/frame-mat-content.spec.ts`;
  - `openspec/changes/t5-frame-mat-calculator/verification.md` (diploma sources).
- Changed:
  - `packages/sizes/src/mat.ts` (BL-111, diploma), `index.ts`;
  - `apps/web/src/lib/site-map.ts` (F5 live);
  - `docs/backlog.md` (BL-111 deleted when its fix ships).
- **Existing tests to edit (needs the owner's approval).** Each is re-pointed to its new scenario and only adds the F5 card, link or URL:
  - `e2e/frame-chart-content.spec.ts` "links to F2, F3, F4 and G1…";
  - `e2e/frames-on-wall-content.spec.ts` "links only to live pages";
  - `e2e/actual-size-content.spec.ts` "links only to live pages";
  - `e2e/measure-frame-content.spec.ts` "links only to live pages";
  - `e2e/seo-home.spec.ts`: the sitemap test expects 39 URLs, F5 among them.

  `mat.test.ts` has no width at or below ¼ in, so BL-111 edits no test. The Related tools and footer unit tests build their own site maps and stay as they are.

- No new dependency. No paid API.
- Not here: the affiliate block (T21); analytics events (BL-15); a dark theme (BL-2); bottom-weighted and double mats (canvas Q4, Q5); the canvas's options B and C.
- Backlog, read 2026-11-23:
  - BL-111 is folded in.
  - BL-17 (recheck the 20x30 and 27x40 mat pairings) touches the table and pre-cut answers but waits for the next size data check, which the diploma check is not; it stays deferred.
  - BL-110 (one eighths split) stays open: F5 has no eighths row and writes lengths with the engine's `inEighths`, so it does not touch F4's `toEighths`.
- Tracker: T5 becomes `Done` at archive.

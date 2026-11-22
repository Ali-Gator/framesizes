# Proposal

## Why

Tracker row T4 is the F4 page, "Measure a picture frame" (`/measure-picture-frame`). A visitor has a frame and wants to know which standard size it is. Phase 1, `t4-measure-engine` (archived 2026-11-22), put the measuring math in the size engine. This is phase 2: the wizard, the copy, the head values and F4 going live. The owner approved the F4 canvas on 2026-11-22 (https://claude.ai/artifact/SqK52EoyyoLLXzRPPKSUkB, recorded in CLAUDE.md "Design source"). The approval settled four questions:

- all four measurements stay;
- a custom size names the nearest sizes below and above;
- metric frames get their own answer;
- a rounded moulding is measured flat from the front.

## What Changes

- **New page `/measure-picture-frame`**, statically rendered and laid out as the canvas's "F4 page" boards (desktop 1280, phone 390). Its head values come from the On-page SEO guide's F4 rows:

  | Field                | Value                                                                                                                                                                                                                      |
  | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | URL / canonical      | `/measure-picture-frame`                                                                                                                                                                                                   |
  | Head keyword         | how to measure a picture frame (1,300 / KD 6)                                                                                                                                                                              |
  | Title                | How to Measure Picture Frame Dimensions \| Frame Sizes (53 characters)                                                                                                                                                     |
  | h1                   | How to Measure a Picture Frame                                                                                                                                                                                             |
  | Description          | Measure the inside, the outside or the mat opening, enter the numbers, and the wizard names the standard frame size you have, in inches and cm.                                                                            |
  | Secondary keywords   | picture frame dimensions (1,600: opens the answer, titles the table) · 8x10 frame measurements (720: `h2`) · how to measure picture frame size (480: `h2`) · frame dimensions (390: text under the table, the FAQ heading) |
  | Affiliate keys       | none in the guide; the canvas reserves a "Where to buy" slot for T21                                                                                                                                                       |
  | Open Graph image     | the page's own 1200 × 630 PNG: the `h1` and an 8x10 frame with its three measurements marked; alt "8x10 picture frame with its inside, front opening and outside measured"                                                 |
  | Structured data      | `BreadcrumbList` (Home › Measure a picture frame). No `FAQPage`, no `HowTo`: the guide keeps steps as a numbered list.                                                                                                     |
  | Must link out of hub | PH1 (Related tools, when live)                                                                                                                                                                                             |

  The research's head is "picture frame dimensions" (1,600 / KD 25). The guide swaps to the "how to" key on purpose, because the `h1` names what the page does. The bigger key stays in the title, the answer and the table title.

- **The page's sections**, in order: breadcrumbs, `h1`, answer paragraph, the wizard, then:
  - "How to measure picture frame size": three steps with drawings, a cross-section of one frame edge, and a line on frames that can't be opened or have a rounded edge.
  - "8x10 frame measurements and other sizes": a table titled "Picture frame dimensions by size". It has six sizes and gives the inside, front opening, outside and mat opening of each, plus the print its mat holds. A sentence on frame dimensions follows.
  - A reserved slot for "Where to buy" (T21 fills it; nothing renders until then).
  - "Questions about frame dimensions": six questions.
  - "Related tools": the live Frames pages and PH1 when live.
- **The wizard** (`apps/web/src/components/measure-frame/`), as the canvas's Wizard board draws it:
  - **Step 1, what are you measuring:** four choices with drawings. "Inside, at the back" comes first and is marked "Most exact"; then "Front opening, no mat", "Mat opening" and "Outside, edge to edge".
  - **Step 2, the sizes:** width and height, plus the moulding width for the outside. On a phone the fields use the number pad. A row of eighths (0, ⅛ … ⅞) adds a fraction to the field in use. Typed `8 1/8`, `8.125`, `8⅛` and `8,5` are read too. In centimetres the fields take one decimal and the eighths go away. A "Rounded edge?" note under the moulding field shows how to measure it flat.
  - **Step 3, the answer:** the standard, metric or custom size, or for a mat the print and the frames sold with that mat. Each answer says how it was worked out and draws the frame with its measurements in a legend. A standard size links to F3 (8x10) or to its row in the frame size chart (`/?size=<id>`). A custom size lists the closest standard sizes and offers "Check where to measure".
  - **On a phone** each step has its own screen, with "Step N of 3", Back, "Change measurement" and "Measure another frame". **On a desktop** steps 1 and 2 sit side by side with the answer and the drawing. After the first "Find my frame size", the answer follows every change.
  - Bad input marks the field and moves focus to the first one marked: empty, not a number, 0, a moulding wider than the frame leaves room for, or a moulding no wider than the lip.
  - The in/cm toggle in the widget head and the one in the site header set the same unit, and switching converts the numbers already typed.
- **Size engine:**
  - lengths written to the nearest eighth of an inch (`7½ × 9½ in`);
  - typed lengths read with fractions;
  - a standard frame's four measurements for the table;
  - the reason a measurement gets no answer;
  - BL-106: a near-square custom size also names the nearest squares.
- **F4 goes live** in the site map with its head values. The sitemap gains `/measure-picture-frame`. F1's, F2's and F3's Related tools gain the F4 card, since F4 joins the Frames hub. The footer lists it under Frames.

Copy that is not on the approved canvas, for the owner to see before commit:

- The canvas's step 3 says the wizard allows "⅜ in / 1 cm either way". ⅜ in is 0.95 cm, so the cm text reads "about 1 cm".
- The engine refuses a moulding no wider than the ¼ in lip, and the canvas has no message for it. Proposed: "A ¼ in moulding is no wider than the lip that holds the glass. Measure it again from the front, from the outer edge to the glass."
- BL-106 adds up to two square rows under "Closest standard sizes" (the canvas draws two rectangle rows). They use the canvas's wording for the rectangles.

## Capabilities

### New Capabilities

- `measure-frame`: the F4 page and its wizard. Covers the four choices, the fields and eighths, the answers and their links, the drawing, the steps on a phone and the side-by-side desktop, bad input, the unit, and the page's sections, links and head values.

### Modified Capabilities

- `size-engine`:
  - adds writing a length to the nearest eighth, reading a typed length, a standard frame's measurements, and the reason for no answer;
  - modifies the custom-size requirement for near-square sizes (BL-106).
- `seo-base`: the sitemap requirement gains a scenario with F4 live.
- `frame-size-chart`: the live-links requirement gains a scenario with F2, F3, F4 and G1 live.
- `frames-on-wall`: the live-links requirement gains a scenario with F1, F2, F3, F4 and G1 live.
- `actual-size`: the live-links requirement gains a scenario with F1, F2, F3, F4 and G1 live.

## Impact

- New:
  - `apps/web/src/app/measure-picture-frame/` (page, Open Graph image);
  - `apps/web/src/components/measure-frame/`;
  - `e2e/measure-frame.spec.ts` and `e2e/measure-frame-content.spec.ts`.
- Changed:
  - `packages/sizes/src/units.ts`, `measure.ts`, `frames.ts` and `index.ts` (additive exports; the `custom` answer gains two optional fields);
  - `apps/web/src/lib/site-map.ts` (F4 live);
  - `docs/backlog.md` (BL-106 deleted when its fix ships).
- **Existing tests to edit (needs the owner's approval).** Each is re-pointed to its new scenario and only adds the F4 card or URL:
  - `e2e/frame-chart-content.spec.ts` "links to F2, F3 and G1…";
  - `e2e/frames-on-wall-content.spec.ts` "links only to live pages";
  - `e2e/actual-size-content.spec.ts` "links only to live pages";
  - `e2e/seo-home.spec.ts`: the sitemap test expects 38 URLs, F4 among them.

  The Related tools and footer unit tests build their own site maps, so they stay as they are.

- No new dependency. No paid API.
- Not here:
  - the affiliate block (T21);
  - analytics events (BL-15);
  - a dark theme (BL-2);
  - the canvas's custom-size options B and C, which were not chosen.
- Backlog, read 2026-11-22:
  - BL-106 is folded in.
  - BL-17 (recheck the 20x30 and 27x40 mat pairings) touches the mat answer but waits for the next size data check, so it stays deferred.
  - No other item is in this area.
- Tracker: T4 becomes `Done` at archive.

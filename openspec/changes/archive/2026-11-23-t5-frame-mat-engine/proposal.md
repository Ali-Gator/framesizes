# Proposal

## Why

Tracker row T5 is the F5 page, "Frame & mat calculator" (`/frame-mat-calculator`). A visitor has a print and wants to know what frame and mat it needs, or has a frame and wants to know what print fits it with a mat. The research names the widget: "Print size + mat width → frame size and mat opening; reverse mode".

F5 has no approved design yet, so T5 ships in two phases, as CLAUDE.md's "A page with no approved design yet" sets out (T4 ran the same way):

1. This one, `t5-frame-mat-engine`: the mat math in the size engine, with no UI and no page.
2. A page change, `t5-frame-mat-calculator`, proposed once this change is applied. It covers the widget, the copy, the SEO head values and F5 going live.

The F5 canvas (https://claude.ai/artifact/PjZ5GizsgyTKMvx6nAfdRp) was approved on 2026-11-23, before this change was applied, and its answers are folded in here (option A on all eight questions): the result names the exact frame size, the pre-cut frames with the border each gives, the next size up and the square frame; the reverse result names the standard print below and the frame's own pre-cut mat; the calculator starts at a 2 in border with 1½, 2, 2½ and 3 in presets; metric frame sizes stay.

## What Changes

- New module `packages/sizes/src/mat.ts` in the size engine. Lengths are in inches, as everywhere in the engine; the page converts centimetres before calling it.
- **Mat width** is the width of mat board cut on each side, from the mat's outer edge to its opening: (frame − opening) ÷ 2. This is the meaning `frameAnatomy` already uses (an 8x10 print in an 11x14 frame has a mat 1¾ in wide at the sides and 2¼ in at the top and bottom). The frame's lip hides about ¼ in of it from the front; how the page words that is a canvas question.
- **From a print (forward).** A print size and a mat width give:
  - the mat opening: the print less the mat's overlap, ¼ in on each side (`MAT_OVERLAP`): an 8x10 print → 7½ × 9½ in;
  - the frame size: the opening plus the mat width on each side: with a 2 in mat, 11½ × 13½ in;
  - that frame size matched the way F4 matches a measured frame: a standard size within ⅜ in, else custom with the nearest standard sizes below and above (11½ × 13½ → custom; 8.5x11 below, 12x16 above);
  - the frames sold with a pre-cut mat for that print, from the catalog's mat pairings: 8x10 → 11x14; 11x14 → 16x20; 16x20 → 18x24 and 20x24.
- **From a frame (reverse).** A frame size and a mat width give the mat opening (the frame less the mat width on each side), the largest print the mat holds (the opening plus the overlap on each side), and that print matched the same way: an 11x14 frame with a 2 in mat → a 7 × 10 in opening and a print up to 7½ × 10½ in; an 8x10 frame with a 1¾ in mat → a 5x7 print.
- **Both matches, both ways.** The answer matches the print and the frame each way. From a print, the print match names the print ("for an 8x10 print"). From a frame, the frame match names the mat the frame is sold with (an 11x14 frame → a pre-cut mat for an 8x10).
- **Mat borders (canvas Q1, Q2).** A frame and a print give the border at the sides and at the top and bottom: the 11x14 with an 8x10 → 1¾ / 2¼ in; the 12x16 → 2¼ / 3¼ in; the 16x16 → 4¼ / 3¼ in; an 11x14 frame with a 5x7 → 3¼ / 3¾ in. The cards and the "Mat board sizes" table print these.
- **Mat widths (canvas Q3).** The calculator starts at 2 in and offers 1½, 2, 2½ and 3 in, held in the engine like every other size.
- **Refusing bad input.** A size, mat width or overlap that is not a positive number gives no answer, and so does a mat or an overlap that leaves no opening. The engine says which: the `NoAnswer` reasons F4 already uses (`number`, `room`).
- **Reuse.** The pre-cut lookup already lives inside `identifyFrame`'s mat branch; it moves into one helper both callers share, with no change in what F4 shows. The match is `identifyFrame` on an inside measurement, unchanged. `MAT_OVERLAP`, `CATALOG` and the mat pairings are reused, not retyped.
- No new allowance and no new size data, so no `verification.md`: the ¼ in overlap and the ⅜ in tolerance were checked in the archived t2 and t4 changes.

Backlog: read 2026-11-22. BL-17 (recheck the 20x30 and 27x40 mat pairings) touches the pairings the pre-cut lookup reads, but its trigger is the next size data check, which this change does not run; it stays deferred. No other item is in the engine's area.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `size-engine`: adds requirements for the frame and mat calculator:
  - a print and a mat width give the mat opening, the frame size and that size's match;
  - a print names the frames sold with a pre-cut mat for it;
  - a frame and a mat width give the mat opening, the largest print and that print's match;
  - a frame given in reverse is matched too, for its own pre-cut mat;
  - a frame and a print give the mat border on each side;
  - the calculator's four preset mat widths and its 2 in start;
  - a mat question that gives no size says why.

  The existing requirements do not change.

## Impact

- Code:
  - new `packages/sizes/src/mat.ts` and `packages/sizes/src/__tests__/mat.test.ts`;
  - `packages/sizes/src/measure.ts`: the pre-cut lookup moves into an exported helper; `measure.test.ts` stays unedited and green;
  - new exports in `packages/sizes/src/index.ts`.
  - No change in `apps/web`. Nothing on the site changes; F5 stays `live: false`. Its `site-map.ts` entry and the home page's `IfLive page="F5"` link already exist.
- Dependencies: none added. No paid API.
- Tests: new unit tests only. No existing test is edited.
- Specs: `size-engine` gains requirements. After archive, its Public Interface, Behavior and Edge Cases sections are updated by hand. The README row is unchanged, since `packages/sizes/src/**` already maps to `size-engine`.
- Tracker: T5 becomes `In progress` at archive (the page change completes it).
- For the canvas and the page change, noted here so it is not lost:
  - The SEO guide's F5 rows: URL `/frame-mat-calculator`; head keyword "picture frame size calculator" (260 / KD 15); title "Picture Frame & Mat Calculator" with the ` | Frame Sizes` suffix; h1 "Frame and Mat Size Calculator"; description "Enter your print size and mat width to get the frame size and mat opening. Works in reverse too: start from a frame and find the print that fits."; secondary keywords "mat board sizes" (590), "what size frame for 11x14 print" (320), "what size frame for diploma" (260), "frame mat sizes" (210), "mat size calculator" (110). The research's head is "mat board sizes" (590 / KD 11); the guide's swap is deliberate and documented there (the h1 names what the page does). The page is a Tool page in the guide's outline, and its links table says F5 must link to PH2.
  - The canvas answers are listed in `design.md` ("Canvas answers"); the page change takes its copy, keyword placement (canvas "head" note) and Related tools (Art print sizes, Measure a picture frame, Frame size chart, How big is 8x10) from the canvas.
  - "What size frame for diploma": the canvas marks it unverified. A diploma is usually 8.5x11. The catalog pairs an 8.5x11 print only with the 12x16 frame, while diploma frames are often sold as an 11x14 with an 8.5x11 opening. Check this against sources in the page change before the copy names a frame.
  - The canvas's cm formula rounds the ½ in overlap to 1.3 cm; the page writes cm from inches with `toCm`, so its examples stay exact (8x10 + 5.1 cm → 29.2 × 34.3 cm).

# Proposal

## Why

Tracker row T5 is the F5 page, "Frame & mat calculator" (`/frame-mat-calculator`). A visitor has a print and wants to know what frame and mat it needs, or has a frame and wants to know what print fits it with a mat. The research names the widget: "Print size + mat width → frame size and mat opening; reverse mode".

F5 has no approved design yet, so T5 ships in two phases, as CLAUDE.md's "A page with no approved design yet" sets out (T4 ran the same way):

1. This one, `t5-frame-mat-engine`: the mat math in the size engine, with no UI and no page.
2. A page change, `t5-frame-mat-calculator`, proposed once the canvas is approved and this change is applied. It covers the widget, the copy, the SEO head values and F5 going live.

## What Changes

- New module `packages/sizes/src/mat.ts` in the size engine. Lengths are in inches, as everywhere in the engine; the page converts centimetres before calling it.
- **Mat width** is the width of mat board cut on each side, from the mat's outer edge to its opening: (frame − opening) ÷ 2. This is the meaning `frameAnatomy` already uses (an 8x10 print in an 11x14 frame has a mat 1¾ in wide at the sides and 2¼ in at the top and bottom). The frame's lip hides about ¼ in of it from the front; how the page words that is a canvas question.
- **From a print (forward).** A print size and a mat width give:
  - the mat opening: the print less the mat's overlap, ¼ in on each side (`MAT_OVERLAP`): an 8x10 print → 7½ × 9½ in;
  - the frame size: the opening plus the mat width on each side: with a 2 in mat, 11½ × 13½ in;
  - that frame size matched the way F4 matches a measured frame: a standard size within ⅜ in, else custom with the nearest standard sizes below and above (11½ × 13½ → custom; 8.5x11 below, 12x16 above);
  - the frames sold with a pre-cut mat for that print, from the catalog's mat pairings: 8x10 → 11x14; 11x14 → 16x20; 16x20 → 18x24 and 20x24.
- **From a frame (reverse).** A frame size and a mat width give the mat opening (the frame less the mat width on each side), the largest print the mat holds (the opening plus the overlap on each side), and that print matched the same way: an 11x14 frame with a 2 in mat → a 7 × 10 in opening and a print up to 7½ × 10½ in; an 8x10 frame with a 1¾ in mat → a 5x7 print.
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
  - Open product questions for the canvas, each with a recommendation, are in `design.md` ("Open questions"). The main one: which standard frame to name when the exact frame size is custom. The F4 match names the sizes below and above, which for an 8x10 print with a 2 in mat is 8.5x11 and 12x16, while the pre-cut answer is 11x14.
  - "What size frame for diploma": a diploma is usually 8.5x11. The catalog pairs an 8.5x11 print only with the 12x16 frame, while diploma frames are often sold as an 11x14 with an 8.5x11 opening. Check this against sources in the page change before the copy names a frame.

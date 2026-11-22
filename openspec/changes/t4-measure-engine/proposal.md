# Proposal

## Why

Tracker row T4 is the F4 page, "Measure a picture frame" (`/measure-picture-frame`). A visitor measures a frame they own and wants to know which standard size it is. The research names the widget: "inside / outside / opening → names the standard size you have".

T4 ships in two changes, as T7 and T11 did, because the F4 design does not exist yet (CLAUDE.md asks for an approved design before a UI proposal). The owner chose this split on 2026-11-22:

1. This one, `t4-measure-engine`: the measuring math in the size engine, with no UI and no page.
2. A page change, proposed once the F4 canvas is approved. It covers the wizard's steps, the copy, the SEO head values and F4 going live.

## What Changes

- New module `packages/sizes/src/measure.ts` in the size engine. Lengths are in inches, as everywhere in the engine; the page converts centimetres before calling it.
- **Four measurements, one answer.** The visitor measures one of these, and the engine works out the size it points to:
  - **Inside**, at the back: the glass, the backing board or the recess they sit in. This is the frame size itself.
  - **Front opening**, the window seen from the front of a frame with no mat. The frame's lip covers ¼ in of the picture on each side, so the frame size is the opening plus ½ in.
  - **Outside**, edge to edge, together with the width of the moulding seen from the front. The frame size is the outside less two moulding widths plus two lips.
  - **Mat opening**, the window in the mat. The mat covers ¼ in of the print on each side (the engine's existing overlap), so the print is the opening plus ½ in. The answer names that print and the frames sold with a pre-cut mat for it, from the catalog's mat pairings (an 8x10 print → an 11x14 frame; a 16x20 print → 18x24 or 20x24).
- **Matching to a standard size.** A frame size matches a catalog size when each side is within ⅜ in of it. Any two catalog sizes differ by at least 1 in on some side, so a measurement matches at most one. A size that matches none is a custom size, and the engine says so rather than guessing. The measured orientation is kept: 10 by 8 is the landscape 10x8.
- **Refusing bad input.** A side, or a moulding width, that is not a positive number gives no answer. So does an outside measurement whose mouldings leave no room for a picture.
- The two new allowances (the lip of ¼ in, and the recess cut up to ⅛ in larger than the frame size, which the ⅜ in tolerance absorbs) and the mat opening ½ in under the print are checked against named sources before tests pin them, as T2 and T7 did. The evidence goes in this change's `verification.md`.
- Existing exports keep their meaning. `CATALOG`, `findFrame`, the mat pairings and `MAT_OVERLAP` are reused, not retyped.

Backlog: read 2026-11-22. BL-17 (recheck the 20x30 and 27x40 mat pairings) touches the pairings the mat path reads, but its trigger is the next size data check, which this change does not run; it stays deferred. No other item is in the engine's area.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `size-engine`: adds requirements for identifying a measured frame:
  - an inside measurement matched to a standard size, within the tolerance, in the measured orientation, or named custom;
  - a front opening and an outside measurement turned into a frame size;
  - a mat opening turned into a print size and the frames sold with that mat;
  - input that gives no answer.

  The existing requirements do not change.

## Impact

- Code:
  - new `packages/sizes/src/measure.ts` and `packages/sizes/src/__tests__/measure.test.ts`;
  - new exports in `packages/sizes/src/index.ts`.
  - No change in `apps/web`. Nothing on the site changes; F4 stays `live: false`.
- Dependencies: none added. No paid API.
- Tests: new unit tests only. No existing test is edited.
- Specs: `size-engine` gains requirements. After archive, its Public Interface, Behavior and Edge Cases sections are updated by hand; archive does not touch them. The README row is unchanged, since `packages/sizes/src/**` already maps to `size-engine`.
- Tracker: T4 becomes `In progress` (the page change completes it).
- For the F4 canvas and the page change, noted here so it is not lost:
  - The SEO guide's F4 rows: URL `/measure-picture-frame`; head keyword "how to measure a picture frame" (1,300 / KD 6); title "How to Measure Picture Frame Dimensions"; h1 "How to Measure a Picture Frame"; description "Measure the inside, the outside or the mat opening, enter the numbers, and the wizard names the standard frame size you have, in inches and cm."; secondary keywords "picture frame dimensions" (1,600, in the title), "8x10 frame measurements" (720), "how to measure picture frame size" (480), "frame dimensions" (390); internal link F4 → PH1. The research's head is "picture frame dimensions" (1,600 / KD 25); the guide's swap to the "how to" key is deliberate and documented there (h1 names what the page does).
  - The canvas decides which of the four measurements the wizard offers, and in what order. The engine supports all four; the page may show fewer.
  - Questions for the canvas: what a custom size result says (the nearest sizes, a custom frame order, or F1's next size up); whether metric frames (A4, A3, 30x40 cm), which the US catalog leaves out, get their own answer; and how the moulding width is measured on a frame with a rounded edge.

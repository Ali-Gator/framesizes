# Proposal

## Why

Tracker row T4 is the F4 page, "Measure a picture frame" (`/measure-picture-frame`). A visitor measures a frame they own and wants to know which standard size it is. The research names the widget: "inside / outside / opening → names the standard size you have".

T4 ships in two phases, as CLAUDE.md's "A page with no approved design yet" sets out. The owner chose this split on 2026-11-22:

1. This one, `t4-measure-engine`: the measuring math in the size engine, with no UI and no page.
2. A page change, proposed after this one is applied. It covers the wizard's steps, the copy, the SEO head values and F4 going live.

The F4 canvas (https://claude.ai/artifact/SqK52EoyyoLLXzRPPKSUkB) was approved on 2026-11-22, before this change was applied, and its answers are folded in here: all four measurements stay, a custom size names the nearest sizes below and above, metric frames get their own answer, and a rounded moulding is measured flat from the front (page copy only).

## What Changes

- New module `packages/sizes/src/measure.ts` in the size engine. Lengths are in inches, as everywhere in the engine; the page converts centimetres before calling it.
- **Four measurements, one answer.** The visitor measures one of these, and the engine works out the size it points to:
  - **Inside**, at the back: the glass, the backing board or the recess they sit in. This is the frame size itself.
  - **Front opening**, the window seen from the front of a frame with no mat. The frame's lip covers ¼ in of the picture on each side, so the frame size is the opening plus ½ in.
  - **Outside**, edge to edge, together with the width of the moulding seen from the front. The frame size is the outside less two moulding widths plus two lips.
  - **Mat opening**, the window in the mat. The mat covers ¼ in of the print on each side (the engine's existing overlap), so the print is the opening plus ½ in. The answer names that print and the frames sold with a pre-cut mat for it, from the catalog's mat pairings (an 8x10 print → an 11x14 frame; a 16x20 print → 18x24 or 20x24).
- **Matching to a standard size.** A frame size matches a catalog size when each side is within ⅜ in of it. Any two catalog sizes differ by at least 1 in on some side, so a measurement matches at most one. The measured orientation is kept: 10 by 8 is the landscape 10x8.
- **Metric frames (canvas Q3).** A frame size is also matched against A4, A3, 30 × 40, 40 × 50 and 50 × 70 cm. When a US size and a metric size both match, the closer one is named, the US size on a tie, and a winning metric size names the US one as close too (30 × 40 cm, close to 12x16).
- **Custom size (canvas Q2).** A size that matches nothing is a custom size, and the engine says so rather than guessing. It names the largest catalog size below it and the smallest above it, squares against squares (9 × 12 → 8.5x11 below, 11x14 above).
- **Refusing bad input.** A side, or a moulding width, that is not a positive number gives no answer. So does an outside measurement whose mouldings leave no room for a picture.
- Checked against named sources before tests pin them, as T2 and T7 did: the lip of ¼ in, the recess cut up to ⅛ in larger than the frame size, the mat opening ½ in under the print, and the three metric frame sizes (30 × 40, 40 × 50, 50 × 70 cm) as common ready-made sizes. The evidence goes in this change's `verification.md`.
- Existing exports keep their meaning. `CATALOG`, `findFrame`, the mat pairings, `MAT_OVERLAP` and the A4 and A3 entries of `ACTUAL_SIZES` are reused, not retyped.

Backlog: read 2026-11-22. BL-17 (recheck the 20x30 and 27x40 mat pairings) touches the pairings the mat path reads, but its trigger is the next size data check, which this change does not run; it stays deferred. No other item is in the engine's area.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `size-engine`: adds requirements for identifying a measured frame:
  - an inside measurement matched to a standard size, within the tolerance, in the measured orientation, or named custom;
  - a metric frame size named when it is closer than the US size;
  - the nearest standard sizes below and above a custom size;
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
- For the page change, noted here so it is not lost:
  - The SEO guide's F4 rows: URL `/measure-picture-frame`; head keyword "how to measure a picture frame" (1,300 / KD 6); title "How to Measure Picture Frame Dimensions"; h1 "How to Measure a Picture Frame"; description "Measure the inside, the outside or the mat opening, enter the numbers, and the wizard names the standard frame size you have, in inches and cm."; secondary keywords "picture frame dimensions" (1,600, in the title), "8x10 frame measurements" (720), "how to measure picture frame size" (480), "frame dimensions" (390); the guide's links table pairs F4 with PH1. The research's head is "picture frame dimensions" (1,600 / KD 25); the guide's swap to the "how to" key is deliberate and documented there (h1 names what the page does).
  - The canvas's step 3 copy says the wizard allows "⅜ in / 1 cm either way". ⅜ in is 0.95 cm, so the cm copy should read "about 1 cm".
  - A landscape metric answer keeps its upright `id` and `label` (`30x40 cm`, `30 × 40 cm`) while its `w` and `h` are turned. The page writes a landscape cm size from `w` and `h` (40 × 30 cm), not from the label (phase review).
  - The canvas's custom-size options B (next size up only) and C (order a custom frame, needs T21) were not chosen.

# Proposal

## Why

Tracker row T6 is the F6 page, "Poster & art frames picker, with/without mat" (`/poster-frame-sizes`). A visitor has a poster or an art print and wants to know which frame fits it, with or without a mat. The research names the widget: "Poster or art size picker → matching frame sizes, with / without mat", unique by its poster presets and a "with mat" toggle.

F6 has no approved design yet, so T6 ships in two phases, as CLAUDE.md's "A page with no approved design yet" sets out (T4 and T5 ran the same way):

1. This one, `t6-poster-frame-engine`: the poster sizes and the poster-to-frame lookup in the size engine, with no UI and no page.
2. A page change, `t6-poster-frame-sizes`, proposed once this change is applied. It covers the widget, the copy, the SEO head values and F6 going live.

The F6 canvas (https://claude.ai/artifact/43JSmmnTJHtj55WBpR84qT) was approved on 2026-11-23, before this change was applied, with option A on all ten questions; its engine answers are folded in here (design.md, "Canvas answers").

Most of the math already exists: a poster with no mat takes a frame of its own size, which `identifyFrame` already matches (standard, metric or custom), and `preCutFrames` and `matBorders` already give the pre-cut frames and the mat borders. What is missing is the list of poster sizes (pages never type a size by hand) and one lookup that names the standard frames a poster fits with a mat.

## What Changes

- New module `packages/sizes/src/poster.ts` in the size engine. Lengths are in inches; A-series sizes are stored from their millimetre sizes.
- **Poster sizes.** A list of ten poster sizes the picker offers, upright, each with the canvas's use line (27x40 "Movie posters"):
  - US: 11x17, 12x18, 16x20, 18x24, 20x30, 24x36, 27x40. Every one is already a catalog frame size, so the SEO guide's draft range "11x17 to 27x40" holds.
  - A-series (ISO 216): A3 (297 × 420 mm), A2 (420 × 594 mm), A1 (594 × 841 mm).
  - The list is checked against retail and ISO 216 in this change (`verification.md`), as the guide asks ("drafts, not research data").
- **Without a mat.** The frame is the poster's own size, matched as F4 matches an inside measurement: every US size is a standard frame (24x36 → 24x36); A3 is the metric A3 frame; A2 and A1 are custom, with the nearest standard sizes below and above (A2: 16x20 and 18x24; A1: 20x30 and 24x36), and the engine also names the A2 or A1 frame (canvas Q6 A), from an F6-only list: a size within ⅜ in of A2 or A1 is named that frame. What F4 and F5 match does not change.
- **With a mat.** The standard frames, smallest first and in the poster's orientation (square frames only for a square poster), that hold the poster with a mat: every frame sold with a pre-cut mat for it, plus every catalog frame whose border is between 1 and 4 inches on every side. Each comes with its borders (the ¼ in overlap included, as `matBorders` gives them) and whether its mat is pre-cut. From the engine, today:
  - 11x17 → 12x18 (pre-cut, ¾ / ¾ in), 16x20 (2¾ / 1¾), 18x24 (3¾ / 3¾)
  - 12x18 → 16x20 (2¼ / 1¼), 18x24 (3¼ / 3¼)
  - 16x20 → 18x24 (pre-cut, 1¼ / 2¼), 20x24 (pre-cut, 2¼ / 2¼)
  - 18x24 → 20x30 (1¼ / 3¼)
  - 20x30 → 24x36 (pre-cut, 2¼ / 3¼)
  - 24x36 → 27x40 (1¾ / 2¼)
  - 27x40 → none; the engine then gives the frame a 2 in mat needs, as F5 does: 30½ × 43½ in (canvas Q4 A)
  - A3 → 16x20 (2⅜ / 2), 18x24 (3⅜ / 4); A2 → 20x30 (2 / 3½); A1 → 27x40 (2 / 3¾)
  - A landscape poster gets the landscape frames: 17x11 → 18x12, 20x16, 24x18.
  - A non-square 13x14 gets the 16x20 only, not the 16x16; a square 10x10 gets the 12x12, 12x16 and 16x16, in that order.
- **Any size.** The lookup takes any positive size, so a typed size works the same way (13x19 → custom without a mat, with the 12x18 below and the 16x20 above; with a mat 18x24 at 2¾ / 2¾ and 20x24 at 3¾ / 2¾). A size that is not a positive number gets no answer.
- **The border range** (1 to 4 inches) is held in the engine like every other number. It brackets F5's presets (1½–3 in) with room on each side.
- **Reuse.** `identifyFrame`, `preCutFrames`, `matBorders`, `matSizes`, `MAT_WIDTH`, `CATALOG`, `findFrame` and `MAT_OVERLAP` are reused, not retyped. `CATALOG` and `METRIC_FRAMES` do not change: adding 24x30 or 30x40 would change F1's and F2's descriptions ("4x6 to 27x40", "all 19"), and A2 or A1 in `METRIC_FRAMES` would change what F4 and F5 answer (canvas Q5 A).

Backlog: read 2026-11-23. BL-17 (recheck the 20x30 and 27x40 mat pairings) is deferred to "the next size data check", and this change runs one (the poster sizes), so it is folded in: the same check looks at the two pairings again. A pairing that changes would edit existing tests (F1 shows "No mat" for both), so the evidence goes to the user before any test or data edit; with no change, BL-17's note is updated with the new check. No other item is in the engine's area.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `size-engine`: adds requirements for the poster frame picker:
  - the picker's ten poster sizes;
  - a poster without a mat takes a frame of its own size, matched as a measured frame;
  - a poster near A2 or A1 is named that A-series frame;
  - a poster with a mat names the standard frames that hold it, smallest first, with their borders and whether the mat is pre-cut;
  - a pre-cut frame's borders are those of the mat as sold;
  - a poster with no standard frame for a mat gets the frame for a 2 in mat;
  - the border range a mat may have, 1 to 4 inches;
  - a poster size that is not a positive number gets no answer.

  The existing requirements do not change.

## Impact

- Code:
  - new `packages/sizes/src/poster.ts` and `packages/sizes/src/__tests__/poster.test.ts`;
  - new exports in `packages/sizes/src/index.ts`.
  - No change in `apps/web`. Nothing on the site changes; F6 stays `live: false`. Its `site-map.ts` entry already exists.
- Dependencies: none added. No paid API.
- Tests: new unit tests only. No existing test is edited (BL-17 asks first).
- Data: `verification.md` records the poster sizes' sources and the BL-17 recheck, with the date.
- Specs: `size-engine` gains requirements. After archive, its Public Interface, Behavior and Edge Cases sections are updated by hand. The README row is unchanged, since `packages/sizes/src/**` already maps to `size-engine`.
- Tracker: T6 becomes `In progress` at archive (the page change completes it).
- For the canvas and the page change, noted here so it is not lost:
  - The SEO guide's F6 rows: URL `/poster-frame-sizes`; head keyword "poster frame sizes" (1,900 / KD 10); title "Poster Frame Sizes Chart: With or Without a Mat", no suffix (it already says "Frame Sizes"); h1 "Poster Frame Sizes"; description "Find the frame that fits your poster or painting: standard poster frame sizes from 11x17 to 27x40, with or without a mat, in inches and cm."; secondary keywords "standard poster frame sizes" (720), "painting frame sizes" (720), "poster frame sizes chart" (480), "standard print frame sizes" (390); the research adds "typical poster frame sizes" (320). The page is a Chart page in the guide's outline; its links table says F6 must link to P1 (Poster sizes), and the anchor "poster sizes" always means `/poster-sizes`, never this page.
  - Its table maps a poster to its frame. It does not list poster sizes for their own sake: that is P1's page.
  - The canvas answers, and which of them are the page's alone, are in `design.md` ("Canvas answers"). The page change takes its copy, table and states from the canvas.

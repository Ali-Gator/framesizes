# Proposal

## Why

Tracker row T11 is the G1 page, "Gallery wall planner" (`/gallery-wall-planner`). The research describes it as a layout generator: templates, frame sizes and spacing give measurements and nail marks. Its main keywords are "gallery wall" (14,800/mo, KD 21) and "gallery wall layout generator" (4,400/mo, KD 14). The wall engine from T7 already handles a wall photo, its scale, distances, snapping and placement. G1 adds the group geometry on top of it. The Chrome extension (T23) reuses the same code.

T11 ships in two changes, like T7. CLAUDE.md asks for an approved design before a UI proposal. The user approved the G1 canvas on 2026-11-16 (https://claude.ai/artifact/HGW1ti5mv6Mc8BqPRepXGd), and its engine decisions are folded in here:

1. This one, `t11-gallery-wall-engine`: the geometry, with no UI and no page.
2. The page change, `t11-gallery-wall-planner`, planned alongside this one.

## What Changes

- New module `packages/sizes/src/gallery.ts` in the size engine. Lengths are in inches, and rectangles use the wall engine's coordinates: `x` from the left, `y` up from the bottom.
  - **Five templates** (the user chose the core five on 2026-11-16; the canvas kept them):

    | Template                  | Frames, in the order the template names them           |
    | ------------------------- | ------------------------------------------------------ |
    | Row of three              | three 11x14                                            |
    | Grid of four              | two rows of two 11x14                                  |
    | Grid of nine              | three rows of three 8x10                               |
    | One big, two on each side | two stacked 8x10, an 18x24, two stacked 8x10           |
    | Two rows                  | 11x14, 16x20, 11x14 over three landscape 8x10 (`10x8`) |

    A template is plain data: rows and columns of catalog sizes, nested. The page can build a changed copy when the visitor swaps a size.

  - **Layout.** One gap between neighbours, 3 in by default (the same as F2's `PLACE_GAP`). A row runs left to right with centres level. A column runs top to bottom with centres aligned. Each frame takes its outside size: the catalog size plus the 1 in example moulding on each side. A gap that is negative or not a number, an unknown size, or an empty row gives no layout.
  - **Where the group hangs.** Above a piece of furniture: centred on it, with the group's bottom 8 in above it (F1's `ABOVE_SOFA`). Otherwise centred across the wall, with the group's centre 57 in above a known floor (`CENTRE_LINE`), or in the middle of the bounds when the floor is unknown.
  - **Nail marks.** One nail (wire or sawtooth) sits at the frame's centre, a drop below its top edge. Two nails (D-rings) sit an inset in from each side, a drop below the top edge. The visitor types the drop and the inset, because both depend on the frame they own. The engine holds no default, so it never guesses a hole. A frame that gets no nail comes with a reason: no drop, drop out of range, no inset, or inset out of range.
  - **Measurements.** For a group of frames (from a template, or moved by the visitor), each frame on its own hanger, the engine gives:
    - the group's width and height;
    - the height of its top edge above the floor, when the floor is known, and its gap to the ceiling, when the top edge is known;
    - its gap to each known wall edge, left and right;
    - for every nail: its frame, which ring for D-rings, its distance right of the group's left edge and down from its top edge, and its height above the floor when the floor is known;
    - every frame that gets no nail, with its reason.

    Nails are listed in rows, so the page can number them: the highest nail starts a row, nails 4 in or less below it join, and a row reads left to right. This keeps "One big, two on each side" and "Two rows" from zigzagging.

  - **The whole group as one target.** The group has its own four distances, to the furniture and the wall's edges. Setting one moves every frame, and "Centre it on the wall" moves the group across to the middle.
- **Backlog folded in** (read 2026-11-16; all three are in `wall.ts`):
  - **BL-36.** A new frame placed beside the selected one also stays inside the wall edges the visitor marked, not only inside the photo. The fallback centres it between them. The user decided this on 2026-11-16.
  - **BL-37.** Snapping can be given the wall. A snap that would take the frame past the wall's bounds is then not made on that axis. F2 keeps its own clamp, so F2 does not change.
  - **BL-38.** The snap tie order is pinned. On an exact tie, the frame's left or bottom edge wins over its centre, and its centre over its far edge. Among targets, the first one listed wins.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `size-engine`:
  - adds the gallery wall's geometry: the templates, the layout, where the group hangs, nail marks, measurements, and moving the group as one;
  - changes two existing requirements:
    - "A dragged frame snaps to the edges and centres around it" gains the bounds (BL-37) and the tie order (BL-38);
    - "A new frame is placed beside the selected one" respects the marked wall edges (BL-36).

  Their existing scenarios stay as they are.

## Impact

- Code:
  - new `packages/sizes/src/gallery.ts` and `packages/sizes/src/__tests__/gallery.test.ts`;
  - edits to `snapFrame` (an optional `wall` argument) and `placeBeside` in `packages/sizes/src/wall.ts`, with new tests added to `wall.test.ts`;
  - new exports in `packages/sizes/src/index.ts`.
- No change in `apps/web`. G1 is not on the site yet.
  - F2 sees one difference: on a photo with the wall's width marked, a new frame no longer lands past the marked edge (BL-36).
- Dependencies: none added.
- Tests: new tests only. No existing test is edited. If BL-36 breaks an existing F2 or engine test, apply stops and asks the user.
- Specs: `size-engine` gains six requirements and changes two. After archive, its Public Interface, Behavior and Edge Cases are updated by hand. The README row is unchanged, since `packages/sizes/src/**` already maps to `size-engine`.
- Backlog: BL-36, BL-37 and BL-38 are deleted in this change's PR.
- Tracker: T11 becomes `In progress`. The page change completes it.
- For the page change, noted here so it is not lost:
  - The head values come from the On-page SEO guide's G1 rows.
  - The affiliate block (buy-intent keys such as "gallery wall frames") uses `rel="sponsored nofollow"` and a visible disclosure.
  - The layout is phone-first at 360px, because the extension's side panel (T23) reuses it.
  - The visitor's wall photo stays on the device.
  - gallerywall.app, the closest tool, has no `h1` or text in its server HTML. G1's content renders on the server.
  - Room presets belong to G2 (T12). The hanging-height calculator belongs to G3 (T13), which can reuse the nail math. A PDF nail guide is the research's later Pro Pass.

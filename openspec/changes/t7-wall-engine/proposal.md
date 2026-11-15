# Proposal

## Why

Tracker row T7 is the F2 page, "Frame sizes on your wall" (`/frame-sizes-on-wall`): a visitor takes a photo of their wall (or uses a demo room), marks one thing whose size they know, and drops frames on it at true size with distances they can edit. The Tracker decision of 2026-11-15 puts the geometry in a pure-TypeScript engine under `packages/`, so G1 (T11) and the Chrome extension (T23) use the same code.

T7 ships in two changes, because the geometry was planned before the F2 design existed (CLAUDE.md asks for an approved design before a UI proposal):

1. This one, `t7-wall-engine`: the geometry, with no UI and no page.
2. A page change (`t7-frames-on-wall`), proposed on 2026-11-15 once the F2 canvas was approved. It covers the photo upload, marking, dragging and snapping, the distances the page shows, copy, SEO and the page going live.

## What Changes

- New module `packages/sizes/src/wall.ts` in the size engine. All lengths are in inches, as in `scene.ts`.
  - **Scale references.** The visitor marks one known thing: the wall's width, a door's height, a sofa's width, a bed's width, the long edge of a Letter or A4 sheet, or a credit card's long edge. The card is one option among seven, never the only one.
    - Standard objects (Letter, A4, card) have fixed lengths.
    - Furniture and doors have an editable default that follows the visitor's unit: a door 80 in or 200 cm, a bed 60 in or 160 cm, a sofa 84 in (the F1 sofa).
    - The wall has no default; the visitor types it.
  - **Scale from a mark.** Two points on the photo plus the real length of the line between them give pixels per inch. Equal points or a length that is not positive give no scale.
  - **Photo ↔ wall mapping.** The photo's size in inches comes from its pixel size and the scale. A frame rectangle in inches maps to photo pixels, top-left origin. v1 assumes a straight-on photo (Tracker decision).
  - **Demo room.** A 12 ft wide, 8 ft high wall with the F1 sofa centred on it. It opens with a 16x20 frame above the sofa by F1's rule, so it needs no marking.
  - **Distances.** For a frame on the wall, the gap on each side to the nearest frame or piece of furniture in line with it, else to the wall's edge when that edge is known. A side with nothing in line and no known edge has no distance.
  - **Editing a distance.** Setting a gap moves that frame along that axis. The frame never leaves the wall, or the photo where an edge is unknown.
  - **Snapping and placing (F2 design).** A dragged frame snaps when an edge or its centre comes within 1 in of another frame's edge or centre, or the sofa's centre. A new frame goes 3 in beside the selected one, centres level, on the other side when that one is full.
  - **A photo's edges and furniture (F2 design, 2026-11-15).** A photo's wall edges are unknown until the visitor marks them. A floor line gives the bottom edge; a marked wall width gives the left and right edges; the top stays unknown. A sofa or bed marked as the known thing, along its top, becomes a piece of furniture, so "below" runs to it.
- The new reference lengths are checked against named sources before tests pin them, as T2 did for the catalog. The evidence goes in this change's `verification.md`:
  - Letter (ANSI) and A4 (ISO 216).
  - The ID-1 card (ISO/IEC 7810).
  - The EU door height.
  - US queen and EU double bed widths.
- Existing exports keep their meaning. `DOOR` and `SOFA` are reused, not retyped.

Backlog: read 2026-11-15; no open item is in the engine's area, so none is folded in.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `size-engine`: adds requirements for the wall tool's geometry:
  - scale references and their default lengths;
  - scale from a mark;
  - mapping between photo pixels and wall inches;
  - the demo room;
  - frame distances and editing them;
  - a photo's known edges from the visitor's marks;
  - a marked sofa or bed as furniture;
  - snapping a dragged frame and placing a new one.

  The existing requirements do not change.

## Impact

- Code:
  - new `packages/sizes/src/wall.ts` and `packages/sizes/src/__tests__/wall.test.ts`;
  - new exports in `packages/sizes/src/index.ts`.
  - No change in `apps/web`. Nothing on the site changes; F2 stays `live: false`.
- Dependencies: none added.
- Tests: new unit tests only. No existing test is edited.
- Specs: `size-engine` gains requirements. After archive, its Public Interface, Behavior and Edge Cases sections are updated by hand to match; archive does not touch them. The README row is unchanged, since `packages/sizes/src/**` already maps to `size-engine`.
- Tracker: T7 becomes `In progress` (the page change completes it).
- For the page change, noted here so it is not lost:
  - The SEO guide's F2 row shows "frame sizes on wall" at KD 6, but the 2026-11-15 research has KD 16; the research wins.
  - The guide's F2 description names only a door and an A4 sheet; it should name the wider list.
  - The photo stays on the device (static site, no backend).
  - The layout is phone-first at 360px, since the extension's side panel reuses it.
  - Page-only rules from the F2 canvas (https://claude.ai/artifact/AzNYiLnMFAN8rg8eeMaXZX): distances show to ¼ in or whole cm; F2 holds at most 6 frames, then links to G1; a mark that a 2 px slip at each end could make more than 3% wrong (under 134 px) gets a warning; the floor line is an optional step after the scale; the in/cm toggle switches every number on the page.

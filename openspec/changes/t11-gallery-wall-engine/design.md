# Design

## Context

See `proposal.md` for the motivation and the two-change split. What this change builds on:

- `packages/sizes/src/wall.ts` (t7-wall-engine). It defines `Rect` coordinates in wall inches: `x` from the left, `y` up from the bottom. It also defines `Wall` (bounds plus the known edges), `DEMO_ROOM`, `snapFrame`, `placeBeside` and `PLACE_GAP` (3 in).
- `scene.ts` holds `ABOVE_SOFA` (8 in) and `CENTRE_LINE` (57 in). `frames.ts` holds `findFrame` (oriented ids, `10x8` is a landscape 8x10) and `MOULDING` (1 in). All of them are already sourced (t2 `verification.md`).
- `openspec/specs/README.md` maps `packages/sizes/src/**` to `size-engine`, so a new file there is gated by the existing spec.
- F2 (`apps/web/src/components/frames-on-wall/state.ts`) calls `placeBeside` and `snapFrame`. Its drag handler clamps to the bounds itself, so a snap undone by the bounds already shows no line.

## Goals / Non-Goals

**Goals:**

- Every number G1 will show (the group's place, its size, its margins, every nail and its measurements) comes from pure functions tested in Node.
- One coordinate system, shared with the wall engine, so a laid-out group can be dragged, snapped and measured with the F2 functions as it is.
- No new package, dependency or README row.

**Non-Goals:**

- Template thumbnails, swapping a size in the UI, the hanger form, rounding and labels. These come from the page change, after the G1 canvas.
- Room presets (G2), the hanging-height calculator (G3), and a printable or PDF nail guide.
- Keeping a group inside the wall. A group bigger than the wall is laid out anyway. Its negative margins tell the page to warn.

## Decisions

### 1. A new module `gallery.ts` next to `wall.ts`

The gallery geometry goes in `packages/sizes/src/gallery.ts`. It imports `Rect`, `Wall`, `Point`, `findFrame`, `MOULDING`, `ABOVE_SOFA`, `CENTRE_LINE` and `PLACE_GAP`.

- `wall.ts` is already 400 lines about a single frame on a photo. A group is its own concern.
- Alternative: a new package. Rejected for the reasons t7-wall-engine gave: a new capability, README row and test wiring, and no gain for G1 or the extension.

### 2. A template is a tree of rows and columns

```ts
type Stack = { dir: "row" | "column"; items: readonly (string | Stack)[] };
interface Template {
  id: string;
  name: string;
  stack: Stack;
}
```

A leaf is an oriented catalog id. All five templates are expressible:

- a grid is a column of rows;
- "One big, two on each side" is a row of column, frame, column.

The page builds a changed copy when the visitor swaps a size.

- Alternative: fixed coordinates per template. Rejected. A changed gap or size would need every template re-drawn by hand.
- Alternative: a CSS-grid-like model with spans. Rejected. It is more code, and nothing in the five templates needs a span.

### 3. Layout is measure then place, one recursive pass each

1. `measure(stack)` returns the stack's outside width and height. For a row, the width is the sum of its children's widths plus the gaps, and the height is the tallest child. A column is the same with the axes swapped.
2. `place(stack, x, top)` walks the children. In a row each child is centred on the row's middle; in a column each child is centred across the column.

Frames come out in the order of the tree (depth first), which is the order the spec pins.

`layoutTemplate(stack, gap, wall, furniture)` returns `{ frames: { id, rect }[], box }`, or `null` for:

- a negative or non-finite gap;
- an unknown id;
- an empty stack.

The group is placed as a whole:

- With furniture, it is centred on the furniture, its bottom `ABOVE_SOFA` above the furniture's top.
- Without furniture, it is centred across the wall's usable area (decision 5), its centre at `CENTRE_LINE` above a known floor, or in the middle when the floor is unknown.

The default gap is `PLACE_GAP`, exported again as `GALLERY_GAP` with the same value, so F2 and G1 never disagree.

### 4. Hangers and measurements

```ts
type Hanger = { kind: "one"; drop: number } | { kind: "two"; drop: number; inset: number };
```

- `nailMarks(rect, hanger)` returns `Point[]` in wall inches. It returns `[]` when the drop or the inset is out of range, which is the spec's "no nail".
- `measureGroup(items: { rect, hanger }[], wall)` returns:
  - the group's bounding box size;
  - the top edge's height above the floor: `top - edges.bottom`, or `null`;
  - the left and right margins against the known edges, or `null` each;
  - the nails: across from `box.x`, down from the box's top, and above the floor, or `null`. They are sorted by height, highest first, then by `x`.
- A frame whose hanger gives no nail adds none. The page shows its own message for it.
- The measurements take any rectangles, not a template, so they stay right after the visitor drags a frame.
- No default drop or inset. A guessed constant would put holes in the wrong place. The page's form asks for them, and the G1 canvas decides how.

### 5. One "usable area" for placement (BL-36)

A new internal helper in `wall.ts`, `usableArea(wall)`, returns the bounds clipped by every known edge. It is not exported from `index.ts`.

- `placeBeside` checks its right and left spots against this area.
- Its fallback centres across this area. The vertical rule (the floor plus 57, or the middle of the bounds) does not change.
- `layoutTemplate` centres a group across the same area.
- The demo room's edges equal its bounds, and every existing placement test uses either the demo room or a photo with no side edge. So the existing scenarios give the same numbers, including the close-up photo with only a floor.

### 6. Snapping gets an optional wall (BL-37), and its tie order is pinned (BL-38)

`snapFrame(frame, others, furniture, wall?)`:

- With a `wall`, `snapAxis` skips any candidate start that would put the frame outside the wall's bounds on that axis. The nearest in-bounds candidate wins.
- Without one, it behaves as today, so the existing tests and F2 are unchanged.
- F2 keeps its clamp. Passing the wall is left for when F2's drag code is next touched; G1 passes it from the start.

The tie order is what the loop already does. The dragged frame's features are checked as start edge, then centre, then far edge, with the targets inside, and only a strictly smaller distance replaces the best. The new scenario pins that behaviour. No code changes for BL-38.

### 7. Template names are visitor-facing text

The five names run through the `humanizer:humanizer` skill before commit. The G1 canvas may still reword them; the page change then edits the delta and the test together.

## Risks / Trade-offs

- **BL-36 changes F2.** On a photo with the wall's width marked, a new frame now stays inside the marked edges. An existing F2 test that adds a frame on such a photo could change its expected spot. → Task 2.1 runs the whole suite after the change. If an existing test fails, apply stops and asks the user before editing it (CLAUDE.md: the user approves any edit to an existing test).
- **Templates may change after the canvas.** → They are plain data in one array with one test. A canvas change edits the delta's template scenario and that test in the page change.
- **Floating-point values in scenarios** (117.4, 126.4). → Those tests compare with `toBeCloseTo`. Layout scenarios use halves, which are exact in binary.
- **A group wider than a photo.** → It is laid out and measured with negative margins. The page decides how to warn. The engine does not shrink or move it.

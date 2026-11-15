# Design

## Context

See `proposal.md` for the motivation and the two-change split. What this change builds on:

- `packages/sizes` (`@framesizes/sizes`) is source-only. Vitest already runs `packages/*/src/**/*.test.ts`, and `apps/web` already lists the package in `transpilePackages`. `openspec/specs/README.md` maps `packages/sizes/src/**` to `size-engine`, so a new file there is gated by the existing spec.
- `scene.ts` works in inches. A `Rect`'s `x` is measured from the scene's centre line and `y` is the bottom edge above the floor. `DOOR`, `SOFA`, `ABOVE_SOFA` and `MOULDING` are already sourced (t2 `verification.md`).
- The consumers come later: F2 (the page change), then G1 (T11), then the Chrome extension's side panel (T23). Their interaction design does not exist yet, so this change holds only geometry that the Tracker decisions already fix.

## Goals / Non-Goals

**Goals:**

- Every number the wall tool will show (scale, a photo's size in inches, a frame's place, the four distances) comes from pure functions that are tested in Node.
- One coordinate convention, shared with `scene.ts`.
- No new package, dependency or README row.

**Non-Goals:**

- Perspective correction (4 corners). v1 asks for a straight-on photo.
- Reading the photo, EXIF rotation, and any storage or sync of a saved wall.
- Drag, snapping, overlap prevention, alignment guides, and how distances are rounded or labelled. These belong to the page change, after the design.
- A minimum mark length or a warning for a mark that is too short to be precise. That is page UX; the engine stays exact.
- Several walls, or furniture other than the demo room's sofa.

## Decisions

### 1. A module in `packages/sizes`, not a new package

The new module is `packages/sizes/src/wall.ts`, exported from `index.ts` with a citation on each export, as the existing exports have.

- It reuses `Rect`, `DOOR`, `SOFA`, `MOULDING` and `wallScene` directly. The site keeps one engine.
- Alternative: a new `packages/wall`. Rejected. It would need a new capability, its own README row and test wiring. It would also need the scene constants either re-exported or copied, for no gain to G1 or the extension: both can import `@framesizes/sizes` just as well.

### 2. Inches with the floor at the bottom; pixels only at the photo's edge

Wall coordinates use `Rect` as `scene.ts` defines it, in inches, with `y` measured up from the bottom. Here `x` is measured from the wall's (or photo's) left edge rather than a centre line.

- The demo room's floor is that bottom edge. On a photo, `y = 0` is the bottom of the photo; the floor, when marked, is an edge above it (decision 7).
- Pixels appear only at the photo's edge: the scale from a mark, the mapping of a `Rect` to top-left pixel coordinates, and the mapping of a marked point back to wall inches.
- Hanging rules ("8 in above the sofa", the 57 in centre line) read the same in both places.
- Alternative: photo pixel coordinates throughout. Rejected. Every distance would then carry the scale, and G1's photo-free wall would need a fake one.

### 3. The scale is a plain number, or no scale

`scaleFromMark(a, b, inches)` returns pixels per inch, or `null` when the points coincide or the length is not a positive finite number. The visitor's unit is converted to inches before the call (`CM_PER_INCH`).

- Alternative: a scale object with an origin and a rotation. Rejected while photos are straight-on.

### 4. Known things are one record, with defaults stored in each unit

Each known thing has an id, its name, the edge to mark, and one of three length shapes:

- **A fixed length in inches.** Letter is 11 in. A4 and the card are written as millimetres divided by 25.4, so the source value stays readable.
- **Defaults per unit, `{ in, cm }`.** The door is `{ in: DOOR.height, cm: 200 }`, the sofa `{ in: SOFA.width, cm: toWholeCm(SOFA.width) }`, and the bed `{ in: 60, cm: 160 }`.
- **No length.** This is the wall.

`defaultLength(id, unit)` returns the number in that unit. A European visitor therefore sees 200 cm, not 203 cm converted from 80 in. The spec asks for exactly this.

- Alternative: one default in inches, converted for display. Rejected. US and EU doors and beds differ by more than rounding.

### 5. The demo room reuses F1's sofa rule

`DEMO_ROOM` is a 144 × 96 in wall, the sofa's box, and one frame. The frame is `wallScene({ frame: 16x20, reference: "sofa" })` with every `x` shifted by half the wall's width.

- The demo room cannot drift from F1's hanging rule.
- The 144 in width is our choice for a demo, not a fact, so it needs no source.

### 6. Distances look along each side; setting one moves only that frame

`frameDistances(frame, others, wall)` takes the other frames and the furniture `Rect`s together as obstacles. For each side it takes the nearest obstacle that:

- lies wholly beyond that edge, and
- shares more than an edge with the frame on the other axis.

If no obstacle qualifies, the distance runs to the wall's edge when that edge is known, and is `null` when it is not. An obstacle that overlaps the frame is ignored.

`setDistance(frame, side, value, others, wall)` returns the moved frame. It clamps a negative value to 0. It then clamps the frame's position so it goes no further than the wall's edge (the photo's border where the edge is unknown), or the first in-line obstacle on the side it moves toward, whichever comes first. A side whose distance is `null` returns the frame unchanged. It never moves another frame. The comparison against every obstacle is O(n²), which is fine for the handful of frames on a wall.

- Alternative: return distances for every pair. Rejected. The page shows one frame's distances at a time.

### 6a. Snapping and placing a new frame are engine rules

The F2 canvas fixes both, and G1 and the extension need the same behaviour, so they live here:

- `snapFrame(frame, others, furniture)` returns `{ frame, lines }`. Per axis it compares the moving frame's two edges and centre with every other frame's edges and centre (and, across, each piece of furniture's centre), takes the nearest pair within 1 in, and shifts by that difference. The page draws `lines` as tape and calls it while dragging only; keyboard nudges skip it.
- `placeBeside(size, selected, others, wall)` returns the new frame's `Rect`: 3 in right of `selected`, centres level; else 3 in left; else centred with its centre at `CENTRE_LINE` (57 in) when the floor is known, or in the middle of the bounds.
- O(n) per call on a handful of frames.

### 7. A wall has a border and up to four known edges

The F2 canvas (approved design pending, 2026-11-15) decided that a photo's floor and wall edges are unknown until marked. So the wall the engine takes is:

- `bounds`: the rectangle a frame may never leave. The demo room's wall, or the photo's size in inches.
- `edges`: `{ left, right, top, bottom }`, each a number in inches or `null`. The demo room knows all four. A photo starts with none.

`photoEdges(photo, scale, marks)` fills them from the visitor's marks. A floor line's pixel row gives `bottom`. When the wall is the known thing, the two ends of its mark give `left` and `right`. `top` stays `null` on a photo. A marked point converts with `photoPointToWall`, the inverse of the `Rect` mapping.

`markedFurniture(known, mark, scale, photo, edges)` returns a `Rect` for a sofa or a bed (else `null`): as wide as the mark, from `edges.bottom` (or 0) up to the height of the mark's middle. It joins the obstacles, so "below" runs to the sofa as it does in the demo room. This is why the spec names the sofa's and the bed's edge "along the top".

- Alternative: treat the photo's border as the wall. Rejected. "Below 38 in" to the bottom of a photo means nothing to a visitor, and the design shows "—" instead.
- Alternative: ask the visitor to mark the ceiling and both side edges. Rejected in the design: both corners are rarely in the shot, and the floor gives the number people hang by.

Page-only rules from the same canvas stay out of the engine: rounding to ¼ in or whole cm, the 6-frame cap, and the warning for a short mark.

### 8. New reference lengths are checked before tests pin them

As in T2, apply checks each new length against a named source and records the URL in this change's `verification.md`:

- Letter (ANSI), A4 (ISO 216) and the ID-1 card (ISO/IEC 7810);
- a common EU interior door height;
- the US queen and EU double bed widths.

If a source disagrees with the spec's number, the user decides before the delta spec and the tests change. No `CHECK`-style record is exported. The page change adds one if F2 decides to show sources.

## Risks / Trade-offs

- **The API is shaped before the F2 design.** The page change may need more functions. → Each requirement here is geometry the Tracker already fixes. Additions land as new requirements, and nothing here should need to change.
- **Small objects give coarse scales.** A card is about 3.4 in long; a 1 px slip on a 30 px mark is a 3 % error. → The engine stays exact. The page change decides whether to warn or to suggest a larger thing.
- **Floating-point values from millimetres.** → Tests compare converted lengths with `toBeCloseTo`. Scenario numbers are chosen so pixel results are whole.

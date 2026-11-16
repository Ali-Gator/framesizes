# Design

## Context

See `proposal.md` for the scope. What this change builds on:

- **`t11-gallery-wall-engine`** (merged first): `TEMPLATES`, `layoutTemplate`, `GALLERY_GAP`, `nailMarks`, `measureGroup` (nails in rows, `missing` with reasons, `toCeiling`), `groupDistances`, `setGroupDistance`, `centreGroup`, and `snapFrame` with an optional `wall`.
- **F2** (`apps/web/src/components/frames-on-wall/`):
  - `display.ts`: rounding, writing and parsing lengths;
  - `stage.tsx`: `WallStage` and `MarkStage`, each a `role="img"` drawing with a sibling control layer;
  - `state.ts`: the reducer, including the photo flow's modes (`upload`, `pick`, `place`, `short`, `confirm`) and `wallOf`;
  - `frames-on-wall.tsx`: the island. `PhotoFlow`, `Picker`, `BackBar`, `ConfirmStep` and `ResetDialog` are local functions there today.
- **Site:** `RelatedTools` (`current`, `outside`), `FAQ`, `SizeTable` (`title`, `meta`, `selectable={false}`), `Breadcrumbs`, `<U>` with the root `data-unit`, `IfLive`, `PageLink`, `breadcrumbJsonLd`, and `lib/og-font.ts`.
- **The approved canvas** (https://claude.ai/artifact/HGW1ti5mv6Mc8BqPRepXGd): boards a–i for the Layout and Nail marks views at 360, j–m for the photo and the warning, "Planner" for the widget at 1088, and "G1 page" at 390 and 1280. Its notes hold the decisions quoted below.

## Goals / Non-Goals

**Goals:**

- Every number on the page comes from the engine through F2's display rules: the table, the summary, the distances and the nails.
- F2's photo flow, stage and size picker are reused, not copied. F2 behaves exactly as before; its tests prove it.
- The server HTML holds the whole Layout view's default state and all the content.

**Non-Goals:**

- The shop section and `AffiliateCallout` (T21), the extension slot (T24) and side panel (T23).
- URL state, saving a wall, printing the nail list, analytics events.

## Decisions

### 1. A new `gallery-wall-planner` capability, two folders

- `apps/web/src/app/gallery-wall-planner/`: `page.tsx`, `opengraph-image.tsx`, `gallery.css`.
- `apps/web/src/components/gallery-wall/`: `state.ts`, `copy.ts`, `gallery-wall.tsx`, `nail-map.tsx`, and tests.
- The README row is added at archive: `apps/web/src/app/gallery-wall-planner/**, apps/web/src/components/gallery-wall/**`.
- Alternative: one capability for F2 and G1, "wall tools". Rejected. The pages have separate outlines, keywords and approvals, and F2's spec is already archived.

### 2. F2's pieces are exported, not moved

G1 imports from `components/frames-on-wall/`:

- `display.ts` and `stage.tsx`, as they are;
- `PhotoFlow`, `Picker`, `ResetDialog` and the photo modes of the reducer, moved from local functions into exported ones in the same folder (`photo-flow.tsx`, and a `photo` slice in `state.ts`).

The move changes no behaviour, and the F2 unit and e2e tests run unedited after it. Edits stay under the `frames-on-wall` spec, which already exists, so the spec hook allows them.

- Alternative: a shared `components/wall-tool/` folder. Rejected for now. It needs a new capability and README row, and the move would touch every F2 import for no visitor-facing gain. Revisit when the extension (T23) needs the same pieces outside the site.
- Alternative: copy the photo flow into G1. Rejected. Two copies of the scale flow would drift, and BL-42..44 would need fixing twice.

### 3. One client island, state in a reducer

`gallery-wall/state.ts` is a pure reducer over the engine, like F2's:

```ts
interface PlannerState {
  view: "layout" | "nails";
  template: string; // id
  sizes: Record<number, string>; // per-frame overrides of the template's ids
  gap: number; // inches
  moved: Record<number, { dx: number; dy: number }>; // hand moves since the last layout
  added: PlacedFrame[]; // frames past the template, up to 12 in all
  selected: number | "group";
  hangers: { all: Hanger; byFrame: Record<number, Hanger> };
  lastType: "one" | "two" | null; // the carry-over rule
  hangerFor: "all" | number;
  photo: PhotoSlice; // F2's slice (decision 2)
  confirmSwitch: string | null; // a template waiting on the "replace?" dialog
  revision: number;
}
```

- **Rects** are derived, never stored: `layoutTemplate` for the template frames with `sizes` and `gap`, then `moved`, then `added`. A size or gap change clears `moved` (the canvas's "lines the frames up again"), and the note shows when `moved` was not empty.
- **The hanger carry-over.** Setting a type on one frame, or on All frames, sets `lastType`. Opening a frame with no `byFrame` entry in "Hanger for" pre-fills its form with `lastType` and an empty drop and inset; frames added later start the same way. The pre-fill is form state only: no `byFrame` entry exists until the visitor types a drop, so until then the frame keeps hanging on All frames' hanger and its nails do not change.
- **Measuring:** `measureGroup` gets each frame's resolved hanger: its own, else All frames.
- **Dragging** passes the wall to `snapFrame` (BL-37's argument), so a snap never leaves the wall.

### 4. The server HTML holds the Layout view

- The page is prerendered with the default state. The room, the five frame buttons, the template pictures, the gap, the group's distances and the summary are all in the server HTML.
- The Nail marks view renders only after the visitor switches to it. Its first state has no drop, so there is nothing to index.

### 5. The nail map

- The map is the room drawing zoomed to the group plus a margin. It is a `role="img"` named after its state ("Nail marks: five nails for five frames").
- Badges are absolutely positioned in percentages, like F2's frames, and their numbers come from `measureGroup`'s order.
- "Start", the group's top-left corner, is drawn as a tape mark.
- The table is a real `<table>` with the five canvas columns. It fits 328 px with the mono figures.

### 6. Numbers and units

- F2's `roundDistance` and `writeDistance` (¼ in or whole cm) for sizes, distances and nail positions.
- The gap field steps by ¼ in or 1 cm; its range check is page-only (0 to 12 in).
- Drops and insets keep one decimal in cm. They are typed in the visitor's unit and stored in inches; switching units rewrites the field from the stored value.
- Server-rendered lengths use `<U>`, so a cm visitor sees no flash. Field values switch after hydration, as F2's do (BL-41 stays open for both).

### 7. The template table is computed

The table's sizes come from `layoutTemplate(template.stack, GALLERY_GAP, DEMO_ROOM.wall, null).box`. The "Furniture it suits" column is 1.5 × the width, rounded to a whole inch or cm. A unit test pins all five rows to the spec's numbers.

### 8. Related tools and live links

- `RelatedTools current="G1" outside={["F1", "F2"]}`. At launch it shows F1 and F2; G2, G3 and G4 join when they go live.
- Every sentence link to G3 (the rules and one question) is wrapped in `IfLive`.
- F1's and F2's existing `outside` lists already name G1, so their cards appear with no code change. Their `lastModified` moves to the archive date.

### 9. The social image

`opengraph-image.tsx` draws the default group above the sofa from the engine's layout, with `lib/og-font.ts`, as F2's does. Its alt is the SEO guide's.

### 10. Copy

Copy comes from the canvas's "G1 page" and widget boards, in a `copy.ts` like F2's. The `humanizer:humanizer` skill runs over every new visitor-facing string before commit: the copy, labels, `aria-label`s, the alt, the live-region sentences and the no-nail reasons. It keeps every size, the h1, the title, the description and the keywords.

## Risks / Trade-offs

- **Moving F2's photo flow could break F2.** → Task 2.1 moves it first, alone, and runs F2's unit and e2e tests unedited before any G1 code.
- **The header shows hub links for the first time.** At 320 px the lockup, unit toggle and menu button may wrap (BL-4). → Task 2.3 checks it with an e2e test at 320 px and fixes the header CSS if needed.
- **A second big client island.** The planner holds two views and the photo flow. → The Nail marks view and the photo flow load with `next/dynamic` on first use, so the first paint carries only the Layout view.
- **Twelve frames on a 360 px map.** The badges could overlap on Grid of nine plus three. → The map zooms to the group, and badges stay 24 px. Checked by hand at 360 with 12 frames; any overlap goes to the backlog.
- **The shop keywords wait for T21.** The SEO guide's three buy keys have no place on the page until then. → The Tracker note on T21 names them.

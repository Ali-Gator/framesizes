# Proposal

## Why

Two things visitors see on G1 came straight from the owner: the frame letters (A, B, C…) are hard to read on the drawing, and the widget's controls pile up in the right column while the left column ends at "Get nail marks", leaving a tall empty space on the first screen. On `/`, a visitor who chose centimetres still sees inches in the scale preview until the scripts load. In Windows high-contrast mode, the selected row of the size table grows by its border, so every row below jumps on each ArrowDown. In the extension, two open pages can give two prints the same id, so one page shows the other's picture and can overwrite its saved picture.

## What Changes

- **Legible frame letters (BL-71).** On G1's drawing and nail map, each frame's letter becomes a white chip centred on the frame, sized to the frame (28% of its short side, 12 to 20 px), with a 1 px border. The selected frame's chip turns ink. It reads on the oak moulding, the tape art and a print's photo. Design: G1 canvas board u, approved.
- **Balanced G1 layout (BL-72).** In the Layout view, Template, the gap row and the actions row (Use my wall photo or Change photo, Add a frame, Start over, the 12-frame note) move from the side column to the main column, under the summary. The side column keeps the Select chips and the selection block. No control is removed or renamed. On a phone the stacked order becomes: drawing, summary, templates, gap, actions, chips, selection. Design: G1 canvas boards n–t, approved.
- **Scale preview in the stored unit from first paint (BL-61).** The preview's two dimension labels, its size legend, its reference sentence and "Next size up" hold both units in the HTML, like the table since backlog-4, and the `data-unit` CSS shows the stored one. `SizeCompare` needs no change: it never renders before hydration.
- **No row jump in forced colors (BL-32).** The selected row's forced-colors border moves from the `<tr>` to the row's existing `label::after` overlay, so it takes no layout space. It looks the same as today.
- **Unique print ids in the extension (BL-64).** A print added from a try gets an id unique to the page that adds it, so two pages never share an id, a picture URL or a stored `art:<id>` key. The bullet's own fix (keying the URL cache by Blob) is wrong; see design.md.

## Members

| Id    | Title                                       | Lane                                                                                       |
| ----- | ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| BL-71 | G1 frame letters are hard to see            | C, design approved: canvas v13, board u (letter chips)                                     |
| BL-72 | Rethink and simplify the G1 widget layout   | B + C, decided: balanced two columns (Decision 4); design approved: canvas v13, boards n–t |
| BL-61 | F1 preview text says inches until hydration | B, decided: both units in the HTML; one unit-test edit approved (Decision 1)               |
| BL-32 | Selected row grows in forced colors         | B, the `label::after` overlay; edit to two e2e row tests approved (Decision 2)             |
| BL-64 | Two panels can share a print picture's URL  | B, decided: unique print ids; one e2e assertion edit approved (Decision 3)                 |

**Parked:** none. Every member investigated is planned.

**Left out (stays open, untouched):** BL-35 (citation walker walks the e2e build folders). It was investigated and is fixable (lane B, a one-line skip of `.next*` folders), but six fixes exceed the ceiling of five. It costs test time only, with no wrong results, so it ranked last. It waits for the next batch.

**Base branch:** `origin/main` at `b13cb4e` (PR #26 merged, which logged BL-68 to BL-70). The batch branch is `backlog-5`. This triage gave the owner's two direct notes ids BL-71 and BL-72 and moved `_Next id:_` to BL-73.

**Approved test edits:** four, all approved by the user on 2026-11-20.

- `apps/web/src/components/ui/__tests__/scale-preview.test.tsx:39-50`, "labels the dimensions in the visitor's unit" (Decision 1). It reads each `.dim-text`'s `textContent`, which will hold both units. It changes to read the `.u-in` / `.u-cm` tspan for the unit under test; its expected strings stay the same.
- `e2e/forced-colors.spec.ts`, the desktop row test (lines 31–50) and the phone row test (lines 53–62) (Decision 2). They read `getComputedStyle(tr)`. They change to read the selected row's `label::after` (and an unselected row's), keeping the same checks: the mark is present on the selected row, absent on others, and the focus ring's inset clears the mark.
- `e2e/extension-try.spec.ts:260` (Decision 3). It asserts the stored keys equal `["art:a1", "current"]`. It changes to match one `art:` key for the added print's id, plus `current`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `gallery-wall-planner`: frame letters read as chips on the drawing and the nail map; in the Layout view, the layout-wide settings sit in the main column and the side column holds only the selection.
- `frame-size-chart`: the scale preview shows the stored unit from first paint; the forced-colors mark on the selected row takes no layout space.
- `gallery-wall-extension`: two pages adding prints never share a print's id or picture.

## Impact

- BL-71: `apps/web/src/app/gallery-wall-planner/gallery.css` (`.g-letter`, `.g-mframe .g-letter`); `apps/web/src/components/frames-on-wall/stage.tsx` only for a comment or a hook class (the letter span is already there); `apps/web/src/components/gallery-wall/nail-marks.tsx:109` reads the same class. `wall.css` stays untouched (F2 shares it).
- BL-72: `apps/web/src/components/gallery-wall/gallery-wall.tsx` (`LayoutView` JSX, about lines 372–546) and `gallery.css` (a `.g-set` block). Class names `.g-main` / `.g-side`, labels and props stay, so `e2e/extension.spec.ts:215-219` and every label-based test pass unedited.
- Extension: `apps/extension/src/extension.css` imports `gallery.css`, and the panel and tab render `GalleryWall`, so BL-71 and BL-72 ship there too. BL-64: `apps/extension/src/use-wall.ts` (`addPrint`), `apps/web/src/components/gallery-wall/state.ts` (`addPrint` action takes an optional `id`).
- BL-61: `apps/web/src/components/ui/scale-preview.tsx` (exempt path) and possibly `apps/web/src/app/widgets.css` selectors under `.fs-scale-size`.
- BL-32: `apps/web/src/app/widgets.css` forced-colors block (about lines 855–868).
- Specs: after archive, `openspec/specs/frame-size-chart/spec.md`'s Behavior paragraph names the preview as shown from first paint too.
- Backlog: BL-32, BL-61, BL-64, BL-71 and BL-72 are deleted when this ships. BL-65 ("read only the ids it has no URL for") becomes safe only after BL-64; its bullet stays.

# Design

## Context

See `proposal.md` for the motivation. This change starts from the result of `t1-site-shell`: tokens and fonts in `globals.css`, the shell, the site map registry with `PageLink`, `pageMetadata`, the unit store (`useUnit`), `SegmentedControl`, and the jsdom / axe test set-up. The stack and its rules are in that change's `design.md`.

What shapes this one:

- The approved canvas (`docs/home-page-design.md`) fixes the page order, the widget's layout and its controls. Its numbers are hand-typed placeholders, and its open items (URL state, the orientation rule, rows as controls, the sticky preview on a phone, server-rendered default state) are decided below.
- The design system's `bundle.js` is a working reference for `ScalePreview`, `SizeCompare` and `SizeTable` (scene constants, SVG structure, label placement). It is ported, not imported: it is a browser global built on `React.createElement`, and it hard-codes the centimetre sentences.
- The page is prerendered. Next's docs state that `useSearchParams` in a prerendered route makes the client tree up to the nearest `Suspense` boundary render on the client only, which would take the widget's default state out of the static HTML.
- A wrong size on screen is the worst defect this site can have (CLAUDE.md, importance order), so the numbers and the scene geometry must be testable without a browser.

## Goals / Non-Goals

**Goals:**

- Every number on the page derived from one catalog; geometry as pure functions tested in Node.
- The full table, the default preview and all prose in the static HTML; the widget hydrates on top of the same markup.
- No new dependency.

**Non-Goals:**

- The visitor's own photo in a frame (F7) and several frames above a sofa (G1): excluded by the approved design.
- A URL per size (`/how-big-is-11x14`): the guide allows it only after Search Console shows demand.
- Poster, photo, canvas and A-series data in the engine: each arrives with its page. The A-series sizes in one answer are prose with a source.
- Widget analytics events, ad or affiliate slots, dark theme.

## Decisions

### 1. The engine is a source-only workspace package

`packages/sizes` (`@framesizes/sizes`), `"exports": { ".": "./src/index.ts" }`, its own `tsconfig.json` extending the base and a `typecheck` script (`pnpm -r typecheck` picks it up). `apps/web` depends on it with `workspace:*` and lists it in `transpilePackages`. No build step and no `dist`. Vitest already includes `packages/*/src/**/*.test.ts`.

Files: `frames.ts` (catalog, orientation, lookup, next size, mat image, anatomy, check record), `units.ts` (cm, the three written forms), `scene.ts` (wall scene and reference sentences), `index.ts`.

- Alternative: keep the data in `apps/web/src/lib`. Rejected: CLAUDE.md puts shared pure TypeScript under `packages/`, and `spec-workflow` already uses `packages/sizes/src/frames.ts` as its example path.

### 2. The catalog is a typed literal; everything else is derived

One `as const` array of `{ w, h, use, common?, major?, mat? }`. Ids, centimetres, landscape entries, the "six common" list and table cells are computed. The check date and sources sit beside it and change in the same commit as the data.

### 3. One oriented id carries size and orientation

`10x8` is the landscape form of `8x10`; `12x12` is square. Orientation is read from the id (width < height, > height, = height), so the widget's state is `{ size, view, ref }` and impossible combinations (a square size in portrait) cannot be expressed in state or in a URL.

The orientation control is a transform on that id: Portrait ↔ Landscape swaps it; entering Square selects `12x12`; leaving Square selects `16x20` turned as chosen. This is the approved canvas's behaviour, kept because it needs no hidden "last selection per shape" state and so round-trips through the URL.

### 4. The scene is computed in inches; the component only scales

`wallScene({ frame, ghost, reference })` returns rectangles in inches from the floor and from the scene's centre line (frame outside, artwork, ghost, the reference's bounding box, the 57-inch line). `ScalePreview` multiplies by 3.5 units per inch into the design system's 720 × 384 stage and draws the reference's silhouette from the ported shapes. The scale is fixed, never zoom-to-fit: small frames must look small. Reference sentences are built from the same constants, so the centimetre text cannot drift from the drawing.

### 5. Widgets are plain props-in components under `components/ui/`

`scale-preview.tsx`, `size-compare.tsx`, `size-table.tsx`, `widget-card.tsx`, `faq.tsx`, `tool-card.tsx`, `button.tsx`, ported from `bundle.js` with values from `bundle.css`. They hold no state and no hooks, so they render on the server and inside the client island alike. `SizeCompare` keeps the reference's label rule (selected first, then `major`, then small to large; a label that would overlap an earlier one is dropped).

### 6. One client island for the widget

`components/frame-chart/frame-chart.tsx` (`"use client"`) reads the state and the unit, and renders the filters, the table and the preview. `page.tsx` stays a server component and renders the island plus the static sections (`common-sizes.tsx`, `frame-anatomy.tsx`, the prose, `questions.tsx`, `related-tools.tsx`), which import the engine directly. Next prerenders the island with its default state, so the static HTML holds the table and the default drawing.

### 7. URL state through `useSyncExternalStore`, not `useSearchParams`

`apps/web/src/lib/url-state.ts`: a store whose snapshot is `location.search` on the client and `""` on the server, subscribed to `popstate` and to its own writes. Writes go through `history.replaceState`, which Next's docs name as supported and router-aware. React hydrates with the server snapshot (defaults, matching the static HTML) and then re-renders once with the real query string, so there is no hydration mismatch and no `setState` in an effect.

`parseChartState(search)` and `chartSearch(state)` are pure functions in `components/frame-chart/state.ts`: unknown values fall back to defaults, defaults are left out, parameter order is fixed (`size`, `view`, `ref`).

- Alternative: `useSearchParams` inside `Suspense` with a static fallback. Rejected: the page would render the widget twice (fallback and real), and the fallback is what crawlers get.
- Alternative: `nuqs`. Rejected: a dependency over the same hook, for three parameters.

### 8. The table chooses a size with native radios

The first cell of each row is a `th scope="row"` holding a visually hidden `input type="radio" name="frame-size"` and its `label` (the size). The label's hit area is stretched over the row, and the selected row is styled with `tr:has(input:checked)` plus the ink bar the design system requires. This gives one tab stop, arrow-key selection and correct announcements with no script and no ARIA. The canvas's `tr tabindex="0" aria-selected` is not used: `aria-selected` is not allowed on a row outside a grid, and twelve tab stops is poor keyboard use.

All 17 rows are always rendered; rows of the other shape get the `hidden` attribute. Landscape re-labels the twelve rectangular rows.

### 9. Pinning is CSS only

Two columns from a container width of 844px (as on the canvas): preview column and filter row `position: sticky`. One column: the preview is sticky inside `@media (min-height: 600px)` and its stage is capped so the pinned block stays within half of the small viewport height (`svh`); below that height it is not sticky. Table rows get a `scroll-margin-top` equal to the pinned block's height so a focused radio never lands under it. The thresholds are tuned in the browser against the spec's three viewports; if the drawing's labels fall under 12px on screen at the cap, raise the unpin threshold rather than shrink further.

### 10. Stable layout while state is restored

The stage has a fixed aspect ratio, table columns have fixed widths with mono numerals (inch and cm strings differ in length), and the "Next to" control keeps its space when hidden in the all-sizes view. Restoring a unit or URL state then repaints inside reserved boxes.

### 11. Static drawings are inline SVG from engine data

The six common sizes: one SVG, one scale, a shared baseline, labels as HTML under it. The frame anatomy: one SVG from `frameAnatomy`. Both carry `role="img"` and the names in the spec. No image files, nothing to lazy-load.

### 12. Text that depends on another page

`PageLink` (from T1) covers a mention that reads fine as plain text. A sentence that exists only to send the visitor elsewhere ("the frame and mat size calculator works out any other") is wrapped in a small `IfLive page="F5"` component added beside `PageLink`. `related-tools.tsx` builds its groups from `livePages()` filtered to the Frames hub plus P1, PH1, C1, G1, and returns nothing when the list is empty.

### 13. Questions

`faq.tsx` renders `details` / `summary` with the question as an `h3` inside the `summary` (valid HTML: a summary may hold one heading). The first is `open`. Answers are JSX in `questions.tsx` so sizes come from the engine.

### 14. Data and facts are verified before tests pin them

The catalog, mat pairings, anatomy constants, scene constants and the prose facts listed in `docs/home-page-design.md` are checked against named sources during apply (tasks, group 2), before the engine's tests are written. Sources go into the engine's check record; one visible line cites them. If a check contradicts a value the user approved on the canvas (a size in or out of the list, a pairing), the user decides; the delta spec is corrected first, then tests, then code.

### 15. Social image

`opengraph-image.tsx` adds the nested outlines of the catalog's rectangular sizes, drawn as bordered boxes (the image renderer supports flexbox and absolute positioning, not full SVG text layout), beside the `h1`. Checked by eye and by the existing size test.

### 16. Tests

- Vitest, Node: the engine (one test file per source file, scenarios cited); `parseChartState` / `chartSearch`; server markup of the table, the previews' names, the six sizes, anatomy, questions and `related-tools` (with a fixture where P1 is live) through `renderToStaticMarkup`.
- Playwright: selection by click and keyboard, orientation, views, unit, URL round trip, pinning at three viewports, focus under the pinned preview, first screen, layout shift (a `PerformanceObserver` for `layout-shift` installed with `addInitScript`), server HTML checks through `request.get`, axe in three states.

### Spec-to-source rows to add at archive

| Capability         | Source path globs                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| `size-engine`      | `packages/sizes/src/**`                                                                                |
| `frame-size-chart` | `apps/web/src/app/page.tsx`, `apps/web/src/components/frame-chart/**`, `apps/web/src/lib/url-state.ts` |

## Risks / Trade-offs

- [The pinned preview is unproven: the canvas never scrolled] → Three viewport scenarios pin the outcome; the mechanism is free to change. Checked in the iOS Simulator before archive where available; otherwise the PR says it was checked in emulation only.
- [Verification changes the approved size list] → The user decides (decision 14). The spec scenarios list the sizes literally, so a change is one visible edit.
- [A stored "cm" or URL state repaints after hydration] → Reserved boxes (decision 10) and two layout-shift scenarios.
- [`tr:has()` and `svh` on old browsers] → Both are Baseline since 2023. Without `:has()` the row loses its highlight but the radio state and the preview still work.
- [The table needs horizontal scrolling on a phone] → It scrolls inside its own box (design system rule); the first column stays readable. Review at 360px during apply and log a backlog item if a column should drop on phones.
- [Turbopack and a source-only workspace package] → `transpilePackages` is the documented path; the first task proves it with a build before anything depends on it.

## Migration Plan

Merge after `t1-site-shell`. Rollback is a revert of the merge commit. The guide's description edit is made in the same phase so the registry and the guide never disagree on `main`.

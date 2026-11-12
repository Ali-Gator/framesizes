# Proposal

## Why

The home page (F1, `/`) is the site's anchor: "standard frame sizes" and its variants are the largest keyword group in the research, and every later page reuses the same size data and the same true-scale drawing. After `t1-site-shell` the page has a shell and a head but no content. This change (Tracker row T2) builds the size engine and the approved home page on top of it. It depends on `t1-site-shell` being merged.

## What Changes

- New workspace package `packages/sizes` (the size engine): the frame size catalog, inch/cm conversion and the three ways a size is written, orientation, the next size up, mat pairings, frame anatomy, and the geometry of the true-scale wall scene (sofa, person, door). All numbers the page shows come from it; nothing is typed by hand in markup.
- The frame size chart widget: a size table that is also the size chooser, an "On a wall" true-scale preview with the next size up as a dashed outline, an "All sizes" nested-outline view, filters for orientation, preview and reference, and the header's in/cm choice applied to the table, the drawing and the reference sentence.
- Widget state (size, view, reference) lives in the URL's query string; the canonical stays clean.
- The page's static content in the approved order: answer paragraph, the six most common sizes at one scale, frame size by image size with the frame anatomy drawing, large / square / horizontal sizes, how to choose, five questions, related tools.
- Links to the 18 pages that are not live yet stay out of the HTML (the live-link rule from `seo-base`); the related tools block appears when its first page ships.
- The size list, mat pairings, scene constants and the facts in the prose are checked against named sources before they are pinned by tests; the page shows the source line and the date of that check.
- The social image gains the nested size diagram.
- The On-page SEO guide's F1 description is corrected so its range equals the catalog's ("4x6 to 27x40"; the guide's draft says 24x36 while the approved table ends at 27x40).

Copied from the On-page SEO guide, Per-page map, row F1, with where each keyword lands:

| Field                     | Value                                                                                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| URL                       | `/`                                                                                                                                                                                      |
| Head keyword              | standard frame sizes → title, `h1`, first paragraph                                                                                                                                      |
| Title                     | Standard Picture Frame Sizes Chart (Inches & cm)                                                                                                                                         |
| H1                        | Standard Frame Sizes                                                                                                                                                                     |
| Description               | Every standard picture frame size in inches and cm, from 4x6 to 27x40. Click a size to see it at true scale next to a sofa, a door or a person.                                          |
| frame size chart          | widget title, `h2` "Frame size chart"                                                                                                                                                    |
| common frame sizes        | `h2` "The six most common frame sizes"                                                                                                                                                   |
| frame image size          | `h2` "Frame size by image size"                                                                                                                                                          |
| frame sizes               | `h2` "Large, square and horizontal frame sizes"                                                                                                                                          |
| picture frame sizes       | table caption, question "What are the standard picture frame sizes?"                                                                                                                     |
| photo frame sizes         | question "What are the standard photo frame sizes?"                                                                                                                                      |
| Image alts                | preview: "<size> picture frame at true scale next to <reference>"; chart: "Standard frame sizes chart from 4x6 to 27x40 inches"; six sizes and anatomy drawings: their own, no two alike |
| Structured data           | unchanged from T1 (`WebSite`, `Organization`); no `FAQPage`                                                                                                                              |
| Must link outside its hub | P1, PH1, C1, G1, each when live                                                                                                                                                          |

## Capabilities

### New Capabilities

- `size-engine`: the shared, pure-TypeScript source of every size the site shows: the frame catalog, units and size notation, orientation and ordering, mat pairings, frame anatomy and the true-scale wall scene.
- `frame-size-chart`: the home page (F1): the chart widget and its state, the page's content sections, and how the page behaves on a phone and on a desktop screen.

### Modified Capabilities

None. (`site-shell` and `seo-base` from T1 are used as they are.)

## Impact

- Code: new `packages/sizes/`; `apps/web/src/app/page.tsx`, `apps/web/src/app/opengraph-image.tsx`, new `apps/web/src/components/frame-chart/`, new widgets under `apps/web/src/components/ui/`, `apps/web/src/lib/url-state.ts`, `apps/web/next.config.ts` (`transpilePackages`), the F1 entry in `apps/web/src/lib/site-map.ts` (description, content date).
- Dependencies: none added.
- Tests: new unit tests for the engine and markup, new e2e tests for the widget and the layout. No existing test is edited.
- Docs: the On-page SEO guide (one description, with the docs tools); closes "Open: size data", "Open: widget behaviour" and the remaining SEO items in `docs/home-page-design.md`, which is deleted when empty.
- Needs web research during apply (retail size ranges and the facts in the prose). If the checked sizes differ from the approved design's list, the user decides before the list changes.

# Tasks

Branch `t6-poster-frame-sizes`, cut from `main` after the engine PR merged. In every group, tests come first and cite their scenario as `{@link openspec/specs/<capability>/spec.md#<anchor>}`, then the code. The approved F6 canvas (CLAUDE.md "Design source") is the reference for layout and copy: its Poster component shows every state, its Draw board is the drawing, Main and Phone390 are the page, Table is the chart. Read the bundled Next.js docs named in a task before writing that code.

## 1. Set-up

- [x] 1.1 Get the owner's approval for, and record the date here (approved 2026-11-24, both items; `pnpm test` green on the branch before any edit):
  - editing the six e2e tests named in the proposal's Impact (only those six may change);
  - the off-canvas copy: the metric how-lines, the oversized drawing caption, step 1 while P1 is not live, the drawing's two-unit label, the social image and its alt.

  Before any edit, verify `pnpm test` is green on the branch.

## 2. Widget logic (`components/poster-frames/`)

- [x] 2.1 Write `state.test.ts` for the reducer and the `poster` selector:
  - the initial state (chips, 24x36, no mat, portrait, empty fields);
  - poster, mat, landscape, custom, chips, type and pick, with `pick` back to 0 on every change but `pick` and `unit`;
  - Back keeps the chip and reopening keeps the typed size;
  - unit conversion 13, 19 in ↔ 33, 48.3 cm, with other text kept;
  - empty, one empty, 0, a letter and a negative, each marking only the bad field;
  - "13 1/2", "13.5" and "13½" read the same; 19 × 13 is landscape.

  Implement `state.ts` (design decision 1) on F5's `inches`. Verify the tests pass.

- [x] 2.2 Write `answer.test.ts`, pinning every sentence in the spec's answer, box, unit and drawing scenarios: 24x36, A3, A2, 40 × 50 cm and 13 × 19 without a mat; 11x17 (with pick 1), 24x36, 13 × 19, 27x40 and landscape 17x11 with a mat; 11x17 and 24x36 in cm; the drawing labels, legends, the 40 × 50 cm pre-cut 18x24 drawn with the sold mat's borders, the 11/24 scale ratio, the dashed custom frame and 40 × 60 in. Implement `answer.ts` (design decisions 2 and 3) on `posterFrames`, F4's `article` and the engine's `inEighths` and `toCm`. Verify the tests pass.

## 3. Widget UI

- [x] 3.1 Write a markup test (`renderToStaticMarkup`) of the server render: the title "Find the frame for your poster", the ten chips with their cm or mm lines and only "24×36" pressed, "Custom size", "Without a mat" and "Portrait" chosen, the 24x36 answer and its box, and the drawing's label, legend and caption. Build `poster-frames.tsx`, the chips, the controls, the custom fields and `poster-drawing.tsx` (design decisions 4 to 6). Verify the test passes.
- [x] 3.2 Build the answer panel, its cards and the box. Verify with DOM tests:
  - the answer region is `aria-live="polite"`;
  - pressing a mat card draws it and moves "In the drawing";
  - "See frames with a mat" and "See it without a mat" switch the mat control, and A3 and a typed 40 × 60 in show no box;
  - bad input sets `aria-invalid` on the bad field only and shows no answer or drawing;
  - Back and reopen keep the chip and the typed size;
  - the header's unit converts the fields and every number.
- [x] 3.3 Add `e2e/poster-frames.spec.ts`:
  - at 1280: the answer right of the chips and the drawing under the mat control; 11x17 with a mat, then pick frame 2;
  - at 390 × 844: the answer under the mat control, the drawing under the answer, nothing wider than the screen;
  - in both: a typed 13 × 19 answer, and 0 marked.

  Verify the tests pass.

## 4. The page (`app/poster-frame-sizes/`)

- [x] 4.1 Set F6 live in `site-map.ts` with the SEO guide's title, `h1` and description, and `lastModified` set to the merge date. Verify `checkSiteMap` passes (title 47 characters, no suffix).
- [x] 4.2 Add `e2e/poster-frames-content.spec.ts`:
  - the outline and the answer paragraph;
  - the widget's server render;
  - the chart table: ten rows, the 11x17, 27x40 and A2 rows, and the 11x17 row in cm;
  - the small, large and A-series cards;
  - the painting section;
  - step 1 with no link to `/poster-sizes`, and step 2's range in both units;
  - the six questions, the first open;
  - Related tools (`/`, `/frame-sizes-on-wall`, `/how-big-is-8x10`, `/measure-picture-frame`, `/frame-mat-calculator`) and no `#` href;
  - title, canonical and `og:image:alt`;
  - the breadcrumbs with one `BreadcrumbList` and no `FAQPage` or `HowTo`;
  - the first screen at 360 × 740.

  Build `page.tsx` and `poster-frames.css` with the table, the group cards, the painting section, the how-to and the questions (design decision 7). Verify the tests pass.

- [ ] 4.3 Build `opengraph-image.tsx` (read `01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md`) with `ogFonts`. Verify `pnpm build` prerenders it at 1200 × 630, under 300 KB.
- [ ] 4.4 Run `humanizer:humanizer` over all new visitor-facing text: copy, headings, FAQ, card text, labels, messages, alts and `aria-label`s. Keep every size, fact and SEO-guide keyword; leave the title, `h1`, description and the two keyword questions verbatim. A rewording that changes what the canvas says goes to the owner, and the spec scenarios it touches are updated with it. Verify the unit, DOM and content tests still pass.

## 5. Live-page counts elsewhere (approved test edits only)

- [x] 5.1 Re-point six tests to their new scenarios, each adding only F6:
  - `e2e/frame-chart-content.spec.ts` → `frame-size-chart` "F2, F3, F4, F5, F6 and G1 are live besides the home page" (six cards);
  - `e2e/frames-on-wall-content.spec.ts` → `frames-on-wall` "F1, F2, F3, F4, F5, F6 and G1 are live";
  - `e2e/actual-size-content.spec.ts` → `actual-size` "F1, F2, F3, F4, F5, F6 and G1 are live";
  - `e2e/measure-frame-content.spec.ts` → `measure-frame` "F1, F2, F3, F4, F5, F6 and G1 are live";
  - `e2e/frame-mat-content.spec.ts` → `frame-mat-calculator` "F1, F2, F3, F4, F5, F6 and G1 are live";
  - `e2e/seo-home.spec.ts` → `seo-base` "The live tools with F3, F4, F5, F6 and the company pages" (40 URLs).

  Verify the six pass.

## 6. Gate

- [ ] 6.1 Run `pnpm fix`, `pnpm test`, `pnpm build` and `openspec validate --all --no-interactive`. Verify each is green.
- [ ] 6.2 Run the SEO guide's pre-publish checklist for F6 on the checks that can run before go-live (1–14 on the built HTML). Log the ones that need the live URL (preview card, Rich Results Test, URL Inspection) as backlog items gated on DNS, as BL-112 to BL-114 did for F5.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review`). Fix its findings, and log what stays unfixed in `docs/backlog.md`.
- `/opsx:archive`. Re-add Public Interface, Behavior and Edge Cases to `openspec/specs/poster-frame-sizes/spec.md`. Add the `poster-frame-sizes` row to `openspec/specs/README.md`: `apps/web/src/app/poster-frame-sizes/**, apps/web/src/components/poster-frames/**`.
- Update the Tracker: set T6 to Done and add a Log line.
- Push, open a PR to `main` naming any backlog ids added, and turn on auto-merge with a merge commit.

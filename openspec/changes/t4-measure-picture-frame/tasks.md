# Tasks

Branch `t4-measure-picture-frame`, cut from `main`. In every group, tests come first and cite their scenario as `{@link openspec/specs/<capability>/spec.md#<anchor>}`, then the code. The approved F4 canvas (CLAUDE.md "Design source") is the reference for layout and copy. Its Wizard board shows every state and its Dia board holds the SVG drawings. Read the bundled Next.js docs named in a task before writing that code.

## 1. Set-up

- [ ] 1.1 The owner approved both of these on 2026-11-22 ("Yes, approve all"):
  - editing the four e2e tests named in the proposal's Impact (only those four may change);
  - the three lines of copy that are not on the canvas.

  Before any edit, verify `pnpm test` is green on the branch.

## 2. Size engine (`size-engine`)

- [x] 2.1 Add tests for `inEighths`, `writeEighths` and `readLength`, covering every scenario in "An inch length is written to the nearest eighth" and "A typed length is read with fractions". Implement them in `units.ts` and export them from `index.ts` with spec links. Verify the tests pass.
- [x] 2.2 Add tests for `frameMeasurements` (the 8x10 and the 4x6) and for `whyNoAnswer` (its four scenarios). Implement both in `measure.ts` (design decisions 1 and 2), sharing one private check with `identifyFrame`. Verify the tests pass and the existing measure tests pass unedited.
- [x] 2.3 Add tests for the three new custom-size scenarios: 9 × 9½, 9½ × 9 and 10 × 12. Add `squareBelow` and `squareAbove` to `nearest` (BL-106). Verify the five existing custom-size tests pass unedited. Delete BL-106 from `docs/backlog.md`.

## 3. Wizard logic (`components/measure-frame/`)

- [x] 3.1 Write `state.test.ts` for the reducer and `outcome`:
  - the first step;
  - pick, enter, back, change, checkSpot and reset, with numbers kept or cleared;
  - eighths on the active field;
  - blur normalising "8 1/8";
  - unit conversion 8⅛ in ↔ 20.6 cm;
  - every error message in "Bad input marks the field".

  Implement `state.ts` (design decision 3). Verify the tests pass.

- [x] 3.2 Write `answer.test.ts`, pinning every sentence in the standard, metric, custom, mat and drawing scenarios in both units. Implement `answer.ts` (design decision 4) from the engine's constants. Verify the tests pass.

## 4. Wizard UI

- [x] 4.1 Write a markup test (`renderToStaticMarkup`) of the server render:
  - the title "Measure your frame";
  - four radios with only Inside checked and one "Most exact";
  - the empty-answer text;
  - the example drawing's label and caption;
  - every control named.

  Build the wizard shell, the choices and the `Diagram` component (design decisions 5 to 7). Verify the test passes.

- [x] 4.2 Build the fields, the eighths row, "Rounded edge?", the answer panel, the live drawing and the legend. Verify with DOM tests:
  - the answer region is `aria-live="polite"`;
  - errors set `aria-invalid` and focus the first marked field;
  - the header's unit converts the fields.

- [x] 4.3 Add `e2e/measure-frame.spec.ts`:
  - at 390 × 844: the three steps, Back, "Change measurement" keeping numbers, "Measure another frame", and nothing wider than the screen;
  - at 1280: the side-by-side layout, and the answer following changes after the first Find;
  - in both: the 9 × 12 custom answer and the 15½ × 19½ mat answer.

  Verify the tests pass.

## 5. The page (`app/measure-picture-frame/`)

- [x] 5.1 Set F4 live in `site-map.ts` with the SEO guide's title, `h1` and description, and `lastModified` set to the merge date. Verify `checkSiteMap` passes.
- [x] 5.2 Add `e2e/measure-frame-content.spec.ts`:
  - the outline;
  - the answer paragraph;
  - the table's 8x10 and 4x6 rows;
  - the six questions;
  - no affiliate link;
  - Related tools (`/`, `/frame-sizes-on-wall`, `/how-big-is-8x10`);
  - title, canonical and `og:image:alt`;
  - the breadcrumbs with one `BreadcrumbList` and no `FAQPage` or `HowTo`;
  - the first screen at 360 × 740.

  Build `page.tsx`, the steps section, the table from `frameMeasurements` and the questions (design decision 8). Verify the tests pass.

- [x] 5.3 Build `opengraph-image.tsx` (read `01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md`) with `ogFonts`. Verify `pnpm build` prerenders it at 1200 × 630, under 300 KB.
- [x] 5.4 Run `humanizer:humanizer` over all new visitor-facing text: copy, headings, FAQ, labels, alts and `aria-label`s. Keep every size, fact and SEO-guide keyword, and leave the title, `h1` and description verbatim. Verify the content e2e still passes.

## 6. Live-page counts elsewhere (approved test edits only)

- [x] 6.1 Re-point four tests to their new scenarios, each adding only the F4 card or URL:
  - `e2e/frame-chart-content.spec.ts` → `frame-size-chart` "F2, F3, F4 and G1 are live besides the home page";
  - `e2e/frames-on-wall-content.spec.ts` → `frames-on-wall` "F1, F2, F3, F4 and G1 are live";
  - `e2e/actual-size-content.spec.ts` → `actual-size` "F1, F2, F3, F4 and G1 are live";
  - `e2e/seo-home.spec.ts` → `seo-base` "The live tools with F3, F4 and the company pages" (38 URLs).

  Verify the four pass.

## 7. Gate

- [ ] 7.1 Run `pnpm fix`, `pnpm test`, `pnpm build` and `openspec validate --all --no-interactive`. Verify each is green.
- [x] 7.2 Run the SEO guide's pre-publish checklist for F4, on the checks that can run before go-live. Log the ones that need the live URL (preview card, Rich Results Test, URL Inspection) as backlog items gated on deploy.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review`). Fix its findings, and log what stays unfixed in `docs/backlog.md`.
- `/opsx:archive`. Re-add Public Interface, Behavior and Edge Cases to `openspec/specs/measure-frame/spec.md`, and update `size-engine`'s sections. Add the `measure-frame` row to `openspec/specs/README.md`: `apps/web/src/app/measure-picture-frame/**, apps/web/src/components/measure-frame/**`.
- Update the Tracker: set T4 to Done and add a Log line.
- Push, open a PR to `main` naming any backlog ids added and BL-106 removed, and turn on auto-merge with a merge commit.

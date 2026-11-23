# Tasks

Branch `t5-frame-mat-calculator`, cut from `main` after the engine PR merged. In every group, tests come first and cite their scenario as `{@link openspec/specs/<capability>/spec.md#<anchor>}`, then the code. The approved F5 canvas (CLAUDE.md "Design source") is the reference for layout and copy: its Calc board shows every state, its Mat board is the drawing, Main and Phone390 are the page. Read the bundled Next.js docs named in a task before writing that code.

## 1. Set-up

- [x] 1.1 Get the owner's approval for, and record the date here (approved 2026-11-23, all three):
  - editing the five e2e tests named in the proposal's Impact (only those five may change);
  - the diploma answer (11x14, with 12x16 for a wider border) in place of the canvas's 12x16;
  - the off-canvas copy: the BL-111 message, the social image and its alt.

  Before any edit, verify `pnpm test` is green on the branch.

## 2. Size engine (`size-engine`)

- [x] 2.1 Add tests for the two new scenarios of "A mat question that gives no size says why" (0.1, ¼ and 0.2 in refused as `"narrow"`; ⅜ in answered with an 8¼ × 10¼ in frame). Refuse `width <= overlap` in `mat.ts` and widen `NoMat` to `NoAnswer` (design decision 1). Verify the new tests and the existing `mat.test.ts` pass unedited. Delete BL-111 from `docs/backlog.md`.
- [x] 2.2 Open each listing in `verification.md` in a browser and record the frame size, the diploma size and the opening it shows. Fewer than three confirming an 11x14 frame with a mat for 8.5x11: stop and take the diploma back to the owner.
- [x] 2.3 Add tests for "The engine names the frame sold for a diploma" (all four scenarios). Add `DIPLOMA` to `mat.ts`, read from `CATALOG`, export it from `index.ts` with its spec link, and add its frame to `matSizes`' `preCut` for a diploma-size print (design decision 1). Verify the tests pass and `measure.test.ts` passes unedited.

## 3. Calculator logic (`components/frame-mat/`)

- [x] 3.1 Write `state.test.ts` for the reducer and `outcome`:
  - the initial state (from a print, empty sizes, border "2");
  - type, preset (in and cm), find, reset;
  - swap with and without an answer, and the 8x10 → 11½ × 13½ → 8x10 round trip;
  - unit conversion 8, 10, 2 in ↔ 20.3, 25.4, 5.1 cm, with other text kept;
  - every message in "Bad input marks the field and gets no answer", in both units where the spec gives both.

  Implement `state.ts` (design decision 2). Verify the tests pass.

- [x] 3.2 Write `answer.test.ts`, pinning every sentence in the standard, metric, custom, reverse and drawing scenarios, in both units for the 8x10 + 2 in answer. Implement `answer.ts` (design decision 3) on the engine and F4's `writeLength`, `writeIn` and `article`. Verify the tests pass.

## 4. Calculator UI

- [x] 4.1 Write a markup test (`renderToStaticMarkup`) of the server render: the title "Frame and mat calculator", the two ends, the Reverse button's name, empty "Print width" and "Print height", "Mat border" holding "2" with only "2 in" pressed, the find button, the empty text and the example drawing's legend and caption. Build `frame-mat.tsx`, the fields, chips and Reverse, and `mat-drawing.tsx` (design decisions 4 to 6). Verify the test passes.
- [x] 4.2 Build the answer panel and its cards. Verify with DOM tests:
  - the answer region is `aria-live="polite"`;
  - errors set `aria-invalid` and focus the first marked field;
  - the answer follows an edit after the first find, and "Start over" clears it;
  - the header's unit converts the fields.
- [x] 4.3 Add `e2e/frame-mat.spec.ts`:
  - at 1280: the answer right of the fields and the drawing under them; the 8x10 + 2 in custom answer; Reverse there and back;
  - at 390 × 844: the answer under the button, the drawing under the answer, nothing wider than the screen;
  - in both: the 4 × 6 in frame with a 2 in border marked.

  Verify the tests pass.

## 5. The page (`app/frame-mat-calculator/`)

- [x] 5.1 Set F5 live in `site-map.ts` with the SEO guide's title, `h1` and description, and `lastModified` set to the merge date. Verify `checkSiteMap` passes.
- [x] 5.2 Add `e2e/frame-mat-content.spec.ts`:
  - the outline and the intro;
  - the calculator's server render;
  - the formula rules in both units and the table's 11x14 and 20x20 rows, 15 rows in all, and the sentence under it;
  - the 11x14 and diploma cases, and no "Unverified";
  - the seven questions, the first open;
  - no affiliate link;
  - Related tools (`/`, `/frame-sizes-on-wall`, `/how-big-is-8x10`, `/measure-picture-frame`);
  - title, canonical and `og:image:alt`;
  - the breadcrumbs with one `BreadcrumbList` and no `FAQPage` or `HowTo`;
  - the first screen at 360 × 740.

  Build `page.tsx` with the steps, the formula section and figure, the table, the cases and the questions (design decision 7). Verify the tests pass.

- [x] 5.3 Build `opengraph-image.tsx` (read `01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md`) with `ogFonts`. Verify `pnpm build` prerenders it at 1200 × 630, under 300 KB.
- [x] 5.4 Run `humanizer:humanizer` over all new visitor-facing text: copy, headings, FAQ, card text, labels, messages, alts and `aria-label`s. Keep every size, fact and SEO-guide keyword; leave the title, `h1`, description and the two keyword questions verbatim. A rewording that changes what the canvas says goes to the owner. Verify the unit, DOM and content tests still pass.

## 6. Live-page counts elsewhere (approved test edits only)

- [x] 6.1 Re-point five tests to their new scenarios, each adding only F5:
  - `e2e/frame-chart-content.spec.ts` → `frame-size-chart` "F2, F3, F4, F5 and G1 are live besides the home page" (the five cards and the "frame and mat size calculator" link);
  - `e2e/frames-on-wall-content.spec.ts` → `frames-on-wall` "F1, F2, F3, F4, F5 and G1 are live";
  - `e2e/actual-size-content.spec.ts` → `actual-size` "F1, F2, F3, F4, F5 and G1 are live";
  - `e2e/measure-frame-content.spec.ts` → `measure-frame` "F1, F2, F3, F4, F5 and G1 are live";
  - `e2e/seo-home.spec.ts` → `seo-base` "The live tools with F3, F4, F5 and the company pages" (39 URLs).

  Verify the five pass.

## 7. Gate

- [x] 7.1 Run `pnpm fix`, `pnpm test`, `pnpm build` and `openspec validate --all --no-interactive`. Verify each is green.
- [x] 7.2 Run the SEO guide's pre-publish checklist for F5 on the checks that can run before go-live. Log the ones that need the live URL (preview card, Rich Results Test, URL Inspection) as backlog items gated on DNS.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review`). Fix its findings, and log what stays unfixed in `docs/backlog.md`.
- `/opsx:archive`. Re-add Public Interface, Behavior and Edge Cases to `openspec/specs/frame-mat-calculator/spec.md`, and update `size-engine`'s sections for `DIPLOMA` and the `"narrow"` refusal. Add the `frame-mat-calculator` row to `openspec/specs/README.md`: `apps/web/src/app/frame-mat-calculator/**, apps/web/src/components/frame-mat/**`.
- Update the Tracker: set T5 to Done and add a Log line.
- Push, open a PR to `main` naming any backlog ids added and BL-111 removed, and turn on auto-merge with a merge commit.

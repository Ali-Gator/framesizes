# Tasks

Branch `t7-frames-on-wall`, cut from `main` after `t7-wall-engine` is merged. Order inside every group: tests first, each citing its scenario as `{@link openspec/specs/<capability>/spec.md#<anchor>}`, then code. Read the bundled Next.js docs named in a task before writing that code. The approved F2 canvas (CLAUDE.md "Design source") is the reference for layout and copy. The design system is the reference for ported components.

## 1. Set-up

- [x] 1.1 Verify `t7-wall-engine` is merged: `snapFrame`, `placeBeside`, `frameDistances` and `DEMO_ROOM` are exported from `@framesizes/sizes`. Verify `pnpm test` is green.
- [x] 1.2 The user approved rewriting the three existing e2e tests named in the proposal's Impact on 2026-11-15 ("Yes, approve them"). Only those three may change.
- [x] 1.3 Add a 1200 × 900 straight-on test photo (drawn, not real) at `e2e/fixtures/wall-1200x900.png`. Verify it is under 100 KB.

## 2. One unit at a time (`site-shell`)

- [x] 2.1 Write unit tests for `<U>`: both spans, and the classes. Write tests that `setUnit` sets `document.documentElement.dataset.unit`. Then implement `<U>`, the `globals.css` rules, the pre-paint script in `layout.tsx` (read `01-app/03-api-reference/03-file-conventions/layout.md` and the `Script`/inline-script docs) and the `setUnit` change. Verify the tests pass.
- [ ] 2.2 Add e2e tests to a new `e2e/shell-unit-text.spec.ts` (existing specs unedited):
  - dual-unit text follows the choice;
  - a stored "cm" shows no inch text at first paint, checked by reading `.u-in` visibility in a `DOMContentLoaded` listener added with `page.addInitScript`.

  Verify they pass.

## 3. Breadcrumbs, JSON-LD and the social-image font (`seo-base`)

- [x] 3.1 Port `Breadcrumbs` to `components/ui/breadcrumbs.tsx` with a markup test. Write `seo.test.ts` cases for `breadcrumbJsonLd` (two items, absolute URLs) in a new describe block, leaving the existing cases untouched. Implement them. Verify the tests pass.
- [x] 3.2 Move the home image's font loading into `lib/og-font.ts` (design decision 8). Verify `pnpm build` still prerenders `/opengraph-image` unchanged.
- [x] 3.3 Add `sitemapEntries(withLive("F1"))` and `RelatedTools pages={withLive("F1")}` unit tests citing the kept scenarios "Only the home page is live" and "No other page is live" in new test cases, if no unit test cites them yet. Verify they pass.

## 4. Display rules and state (`components/frames-on-wall/`)

- [x] 4.1 Write `display.test.ts`:
  - `roundDistance` and `writeDistance` in both units: 8 → "8 in" / "20 cm", 32 → "81 cm", 63 → "160 cm", 8.25 → "8¼ in";
  - `parseLength`: "8.25", "8 1/4", "8¼", "abc" → null, cm input;
  - `SHORT_MARK_PX` and `markError(27)` ≈ 15 %.

  Implement `display.ts` (design decision 4). Verify the tests pass.

- [x] 4.2 Write `state.test.ts` for the reducer:
  - opening in the sample room with the 16x20 selected;
  - set distance (typed, more, less, invalid text);
  - add a frame by `placeBeside`, up to 6;
  - remove and nudge;
  - select;
  - the photo flow: pick, the three scale steps, wall with no length, short mark, floor line;
  - start over and its three choices.

  Implement `state.ts` on the engine (design decision 3). Verify the tests pass.

## 5. The widget

- [x] 5.1 Write a markup test (`renderToStaticMarkup`) for the sample room:
  - the drawing's name;
  - the pressed 16x20 button;
  - the four distances in both units;
  - the less/more button names;
  - no control inside the `role="img"` element.

  Build the stage, the distances panel, "On the wall" and the live region (design decisions 5 and 6), from boards a, b and e. Verify the test passes.

- [x] 5.2 Build the size picker and the dashed outline (board d), dragging with snap and tape (board c), and the keyboard moves. Verify against the reducer tests and by hand in `pnpm dev` at 360 and 1280.
- [x] 5.3 Build the photo flow (boards f–n):
  - upload, with the straight-on tips;
  - the three scale steps, with the loupe and keyboard handles;
  - the short-mark warning;
  - the floor line;
  - start over.

  Follow design decision 7 (object URL, revoke, `createImageBitmap`). Verify by hand with the fixture photo.

- [x] 5.4 Port `SizeTable`'s `title`, `meta` and `selectable={false}`. Add new markup test cases (existing ones unedited): the visible title is the caption, no radio when not selectable. Verify the tests pass.

## 6. The page

- [x] 6.1 Give F1 its card ("What standard frame sizes exist?", ratio 4:5) and today's `lastModified`. Copy the F2 row from the On-page SEO guide into `site-map.ts`: title, h1, description and `lastModified`. Set `live: true`. Write `site-map.test.ts`/`frames-on-wall` unit cases for the description against the catalog (19 sizes, 4x6, 27x40). Verify the tests pass.
- [x] 6.2 Build `app/frame-sizes-on-wall/page.tsx` in the canvas's order:
  - the breadcrumbs and JSON-LD;
  - the `h1` and answer;
  - the widget;
  - steps, rules, the wall table (outside sizes from the engine) and the questions (using the existing `FAQ`);
  - Related tools through `RelatedTools current="F2" outside={["C1", "G1"]}` (design decision 9), with new unit cases for the two props.

  Wrap every link to G1, G3 or another not-live page in `IfLive`. Verify `pnpm build` prerenders the page statically.

- [x] 6.3 Build `opengraph-image.tsx` for F2 (design decision 8). Verify `pnpm build` writes a 1200 × 630 PNG under 300 KB.
- [x] 6.4 Run the `humanizer:humanizer` skill over all new visitor-facing text: copy, labels, `aria-label`s, the alt and the live-region sentences. Keep every size, the h1, the title, the description and the keywords. Verify the diff changes wording only.

## 7. End-to-end

- [x] 7.1 Write `e2e/frames-on-wall-content.spec.ts`:
  - outline, answer, table, both units in the HTML;
  - default state in the server HTML;
  - links only to live pages;
  - breadcrumbs and `BreadcrumbList`, and none on `/`;
  - the nine social tags and the image.

  Write `e2e/frames-on-wall.spec.ts`:
  - cm sample room;
  - typed, fraction, more and invalid distance;
  - live region;
  - add an 11x14 and the 6-frame limit;
  - keyboard nudge and delete;
  - drag snap and tap;
  - the photo flow with the fixture: three steps, wall with no default, the door at 200 cm, A4 fixed, short mark, floor line, start over and Cancel;
  - no request carries image data or names the file after the photo is picked.

  Write `e2e/frames-on-wall-phone.spec.ts`:
  - 360 × 740 first screen;
  - 320 px with no sideways scroll, and 44 px controls;
  - a 4x6's hit box;
  - CLS 0;
  - axe in each state.

  Verify all pass.

- [x] 7.2 Rewrite (approved, task 1.2) three existing e2e tests: `e2e/seo-home.spec.ts` "sitemap.xml lists the home page only" to the scenario "The home page and F2 are live"; `e2e/frame-chart-content.spec.ts` "no link to a page that is not live" to "Only F2 is live besides the home page"; and its "the server HTML follows the approved outline" to "The outline with F2 live". Verify all three pass and no other existing test changed (`git diff --stat main -- e2e apps/web/src/**/__tests__`).

## 8. Gate

- [x] 8.1 Run `pnpm fix`, then `pnpm test`, then `openspec validate --all --no-interactive`. Verify all three are green.
- [x] 8.2 Run the On-page SEO guide's pre-publish checklist against `pnpm build && pnpm start` for `/frame-sizes-on-wall`, with the `seo-audit:seo-page-audit` skill loaded. Fix the guide's "Widget canvas" alt row with the sibling-layer note. Verify every item passes or is logged as a `BL-nn` gated on DNS.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review` skill). Fix its findings and log the rest in `docs/backlog.md`.
- `/opsx:archive`. Then:
  - re-add Public Interface, Behavior and Edge Cases to `openspec/specs/frames-on-wall/spec.md`;
  - add its README row: `apps/web/src/app/frame-sizes-on-wall/**, apps/web/src/components/frames-on-wall/**`;
  - add `apps/web/src/lib/og-font.ts` to the `seo-base` row.
- Tracker: set T7 to `Done`, and add the Log line "F2 Frames on your wall live: sample room, wall photo with scale from a known thing, distances, one-unit text, breadcrumbs".
- Push, open the PR to `main`, name any added `BL-nn`, and turn on auto-merge with a merge commit.

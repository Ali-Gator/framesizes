# Tasks

Before 1.1, re-read the X1 row in the On-page SEO guide (https://claude.ai/artifact/KbaLF8WnJ2jRWc55r5yfcx, Per-page map). If the user accepted or edited the six suggestions, copy what the guide says now into the proposal's table and the site map entry. The guide wins.

## 1. Site map and head tags (seo-base)

- [x] 1.1 Edit `apps/web/src/lib/__tests__/site-map.test.ts`: change only the 19 → 20 counts and the `it` title "are 19 pages with unique ids and paths" → "are 20 pages …" (approved 2026-11-20); every other case, including "does not limit pages that are not live", stays unedited. Add tests for "A page not yet live breaks a head limit" (a not-live page with a 61-character title, a 129-character description, or a duplicate of a live page's title, each named) and for `builtPage` throwing on a page with no head values. Verify they fail.
- [x] 1.2 In `site-map.ts`:
  - Let a not-live page carry `seo`.
  - Add `builtPage(id)`.
  - Make `checkSiteMap` walk every page with `seo`.
  - Add X1: id `X1`, path `/extensions/gallery-wall-layout-generator`, hub `gallery`, name "Chrome extension", card question "How do I use the gallery wall Chrome extension?", ratio [3, 2], `live: false`, and `seo` from the guide row (`lastModified` today).

  Verify that 1.1 passes and that `checkSiteMap(PAGES)` returns `[]`.

- [x] 1.3 Write tests in `apps/web/src/lib/__tests__/seo.test.ts`:
  - Scenario "Head tags of a page set live": X1's entry with `live: true` has no `robots`. The same entry not live has `robots.index === false` and its canonical is still its own URL.
  - `breadcrumbTrail` gives three items for X1 ("Home", "Gallery wall" → `/gallery-wall-planner`, "Chrome extension").
  - "A hub head keeps two crumbs": two items for G1 and two for F2.

  Verify they fail.

- [x] 1.4 In `seo.ts`, make `pageMetadata` take a built page and add `robots: { index: false }` when it is not live. Add `breadcrumbTrail(page)` and build `breadcrumbJsonLd` from it (design decisions 1 and 5). Verify 1.3 passes and every existing `seo.test.ts` case passes unedited.

## 2. Gate constant and status client (extension-site)

- [x] 2.1 Write `apps/web/src/lib/__tests__/extension.test.ts` (jsdom). Cover "The go-live gate" (X1 live ⇔ `EXTENSION_ID` set; a set id matches `^[a-p]{32}$`), then `askExtension` for:
  - "The extension replies".
  - "No extension": no `chrome`, no `sendMessage`, a throw, `lastError`, a malformed reply, no reply within 1 s (fake timers), and an empty id sending nothing.

  Verify it fails.

- [x] 2.2 Implement `apps/web/src/lib/extension.ts`: `EXTENSION_ID = ""`, `STORE_URL` and `askExtension` (design decisions 2 and 3). Verify 2.1 passes.

## 3. The extension page (extension-site)

- [x] 3.1 Write `apps/web/src/components/extension/__tests__/mode-switch.test.tsx` (jsdom, fake timers, a fake `chrome`):
  - "The visitor pins the button": not pinned, then pinned, then usage within 2 s, and no further message.
  - "The visitor asked for the pin steps": `#pin` stays pin after 4 s.
  - No asking with an empty id.
  - No asking while hidden.
  - On `hashchange` to `#pin`, focus lands on "Pin it to your toolbar".

  Also write `store-link.test.tsx`: "The store link once live" (a `pages` fixture with X1 live: text, `href` = `STORE_URL`, `target`, `rel`, no button class) and nothing rendered while X1 is not live. Verify both fail.

- [x] 3.2 Build `apps/web/src/components/extension/`:
  - `mode-switch.tsx` (client island, `extensionId` prop).
  - `store-link.tsx` (server, `pages` prop).
  - The pre-paint mode script.
  - `pin-picture.tsx` (board m's toolbar drawing, tokenised colours, `role="img"` and a label naming both clicks).
  - The step figures from the current sample room (design decisions 4 and 7).

  Verify 3.1's two files pass.

- [x] 3.3 Build `apps/web/src/app/extensions/gallery-wall-layout-generator/page.tsx` and `extension.css`:
  - `metadata = pageMetadata(builtPage("X1"))`.
  - The breadcrumb trail and its JSON-LD.
  - The h1 and the answer paragraph.
  - The pin section with "Already pinned? See how to use it".
  - "Don't see the button? Show how to pin it".
  - The four usage sections from board l, with the framesizes.app row from the extension-site spec.
  - `RelatedTools current="X1" outside={["F2"]}`.
  - `StoreLink` after the answer paragraph (renders only while X1 is live).

  Verify `pnpm --filter web build` lists the route as static.

- [x] 3.4 Add `opengraph-image.tsx` (design decision 8) with the alt "A print hanging above a sofa at true size in the Gallery Wall Layout Generator side panel". Verify the built PNG is 1200 × 630 and under 300 KB.
- [x] 3.5 Write `e2e/extension-page.spec.ts`. It cites, through `{@link …}` to their permanent paths:
  - "The extension page's heading outline" and "The answer paragraph".
  - The three mode scenarios, "From usage mode to the pin steps", "The pin picture's name" and "The framesizes.app row".
  - "No detectable violations in either mode" and "The page at 320 px".
  - "The extension page before go-live" (`noindex`, title, canonical, and no link in `/sitemap.xml`, the footer or G1's Related tools).
  - "The extension page's breadcrumbs".
  - "No store link before go-live".

  Verify it passes with `pnpm test:e2e`.

- [x] 3.6 Run the `humanizer:humanizer` skill over the page copy (answer, section text, steps, permissions rows, questions, alts and `aria-label`s). Keep every number, the h1, the title and the guide's keywords. Verify the strings in the spec scenarios still match.

## 4. The extension section on G1 and F2 (extension-site, gallery-wall-planner, frames-on-wall)

- [ ] 4.1 Write `apps/web/src/components/extension/__tests__/extension-section.test.tsx` (jsdom, a `pages` fixture with X1 live and a test id):
  - "The section while the extension page is live" (`h2`, `href` = `STORE_URL`, `target`, `rel`).
  - Nothing rendered with X1 not live.
  - "The section tells phone visitors to use a computer": both the link and the phone line in the markup, each under its CSS hook (the touch-phone view itself is checked at go-live).
  - "A visitor who has the extension": the "You have it…" line shown, the link hidden, and the CTA cell keeping the same box (`visibility`, not `display`).

  Verify it fails.

- [ ] 4.2 Build `extension-section.tsx` (server, `pages` prop like `RelatedTools`) and `extension-status.tsx` (client island). Add the card, phone-line and installed styles (design decision 6) to the existing `apps/web/src/app/widgets.css`. Verify 4.1 passes.
- [ ] 4.3 Place `<ExtensionSection />` right after the widget in `gallery-wall-planner/page.tsx` and `frame-sizes-on-wall/page.tsx`. Then check:
  - `e2e/gallery-wall-content.spec.ts` and `e2e/frames-on-wall-content.spec.ts` pass unedited.
  - A new case in `e2e/extension-page.spec.ts` cites "No section before go-live" and passes.
- [ ] 4.4 Run the `humanizer:humanizer` skill over the section copy (heading, sentence, phone line, "You have it" line, picture label). Verify the strings in the spec scenarios still match.

## 5. Gate and pre-publish checks

- [ ] 5.1 Run `pnpm fix`, then `pnpm test`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck` and `openspec validate --all --no-interactive`. Verify all pass.
- [ ] 5.2 Run the SEO guide's pre-publish items that apply before go-live on the built HTML (view source of `/extensions/gallery-wall-layout-generator`):
  - One `h1` equal to the row.
  - Title and description equal to the row, with every number in the description on the page.
  - One canonical without the query.
  - The nine social tags with the page's own image.
  - The `BreadcrumbList` equal to the visible trail.
  - Unique alts, and width and height on every image.
  - The phone first screen showing the h1 and the answer.

  Record the result in the PR. List the go-live items (200 without `noindex`, sitemap, footer, G1 card, Rich Results Test, preview card) as deferred.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review`, `/code-review high`). Fix its findings and log what stays unfixed in `docs/backlog.md` from `BL-68`.
- `/opsx:archive`. Then:
  - Write `openspec/specs/extension-site/spec.md`'s Public Interface, Behavior and Edge Cases.
  - Bring `seo-base`'s Public Interface up to date (`builtPage`, `breadcrumbTrail`, the optional `seo`).
  - Add the `extension-site` row to `openspec/specs/README.md`: `apps/web/src/app/extensions/**, apps/web/src/components/extension/**, apps/web/src/lib/extension.ts`.
- Tracker: T24 stays `In progress`. Its Notes become "Built 2026-11-xx, not live; go-live waits for the store id (t24-go-live)". Add a Log line for the archive day: "T24 part 1 (t24-extension-page): /extensions/gallery-wall-layout-generator built with pin and usage modes and a live pin check, the extension section for G1 and F2, three-level breadcrumbs; page noindex and section hidden until the store id is set."
- Push, open the PR to `main`, and turn on auto-merge with a merge commit. The PR says:
  - Which backlog ids were added.
  - That the SEO row came from the guide suggestions.
  - The result of 5.2.
- **`t24-go-live`, after the listing is approved:**
  - Set `EXTENSION_ID` and check `STORE_URL` against the real listing.
  - Set X1 `live: true` with its `lastModified`.
  - Add "Plan on any shop's page" to the two outline e2e tests (approved 2026-11-20).
  - Run the deferred pre-publish items.
  - Do the manual pin check: install from the store, open `?pinned=0`, pin it, and watch the page switch.
  - Set T24 to `Done`.

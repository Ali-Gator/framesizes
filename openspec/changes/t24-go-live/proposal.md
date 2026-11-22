# Proposal

## Why

The Chrome Web Store approved "Gallery Wall Layout Generator" (item `khapjkonaofjfljdakdcmodaclkmffgn`, listing https://chromewebstore.google.com/detail/gallery-wall-layout-gener/khapjkonaofjfljdakdcmodaclkmffgn). T24 part 1 (`t24-extension-page`, archived 2026-11-20) built the how-to page X1 and the G1/F2 extension section behind one gate, the store id. This change opens that gate. It also fixes BL-96: today a first install always opens the English page, even for a visitor whose Chrome runs in one of the 27 other languages the page now has.

## What Changes

- **Go-live (the one edit the suite allows):** `EXTENSION_ID = "khapjkonaofjfljdakdcmodaclkmffgn"` in `apps/web/src/lib/extension.ts`, and X1 `live: true` with `lastModified` set to the apply date in `apps/web/src/lib/site-map.ts`. That one edit:
  - drops `noindex` from X1 and its 27 translations;
  - puts all 28 URLs in `/sitemap.xml` (9 entries become 37);
  - lists X1 in the footer's Gallery wall group;
  - adds X1 to G1's Related tools as a new "Gallery wall" group after "Frames" (groups follow the site's hub order);
  - shows the "Get it from the Chrome Web Store" link on every X1 version;
  - shows the "Plan on any shop's page" section on G1 and F2.
- **Store URL:** `storeUrl` stays `https://chromewebstore.google.com/detail/<id>`. Checked 2026-11-22: that short form answers 301 to the listing's slug URL, which answers 200. The slug comes from the listing name and can change; the id cannot.
- **BL-96, install tab in Chrome's language:** on a first install the extension opens the X1 version that matches `chrome.i18n.getUILanguage()`. Examples: `fil` opens `/tl/…`, `zh-CN` opens `/zh-hans/…`, `pt-BR` opens `/pt-br/…`, `nb` opens `/no/…`, `de-AT` opens `/de/…`. English, and any language the site lacks (such as `zh-TW`), open the English page. The `?pinned=0|1` query is kept. This needs a new extension version, `0.1.1`, which the owner uploads to the store; the site goes live without waiting for its review.
- **Tests:**
  - The two outline e2e tests gain "h2 Plan on any shop's page" (approved 2026-11-20).
  - The owner approved five more existing-test edits on 2026-11-22:
    - `seo.test.ts` "lists no translated URL while the page is not live" and "keeps a translated version out of the index while X1 is not live" switch to a fixture where X1 is not live;
    - the Polish noindex e2e skips once X1 is live, like its siblings;
    - G1 "links only to live pages" expects the X1 card;
    - the sitemap e2e expects 37 entries.
  - New unit tests cover the install-tab language and the two uncited sitemap scenarios (BL-88).
- **Backlog:**
  - BL-96 and BL-88 are folded in and deleted when they ship.
  - The checks that need the published extension on production (pin switch, "You have it" height, phone line, a translated install, Rich Results Test, preview card) run after deploy. Each one that stays open at archive becomes a new BL item.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `extension-site`: "The extension page goes live only with a store id" gains the published listing's id and the live page's checks.
- `gallery-wall-extension`: "The first install opens the how-to page" opens the version in Chrome's UI language.
- `seo-base`: "The sitemap lists exactly the live pages":
  - the live-site scenario now counts X1 and its 27 translations;
  - the two scenarios no test cites (BL-88) and the not-live translations scenario become fixture checks.
- `gallery-wall-planner`: "The planner links only to live pages" now expects the X1 card in Related tools. Its text said Gallery wall pages come before F1 and F2, which no build ever showed (no sibling was live). It now states the order the shared Related tools block renders: Frames first, in hub order.

## Impact

- **Code:** `apps/web/src/lib/extension.ts`, `apps/web/src/lib/site-map.ts`, `apps/extension/src/background.ts` (imports `@/lib/locales`, like the panel already imports `apps/web`), `apps/extension/public/manifest.json` (version `0.1.1`).
- **Tests:**
  - `apps/web/src/lib/__tests__/seo.test.ts`
  - `apps/extension/src/__tests__/background.test.ts` (new cases only)
  - `e2e/gallery-wall-content.spec.ts`
  - `e2e/frames-on-wall-content.spec.ts`
  - `e2e/extension-page-locales.spec.ts`
  - `e2e/seo-home.spec.ts`
  - `e2e/extension-page.spec.ts` (new live checks)
- **SEO:** X1 row from the On-page SEO guide (Per-page map), unchanged from `t24-extension-page`:
  - URL `/extensions/gallery-wall-layout-generator`;
  - keyword "gallery wall layout generator chrome extension" (navigational, no Semrush data);
  - title "Gallery Wall Layout Generator Chrome Extension";
  - h1 "How to Use the Gallery Wall Layout Generator";
  - description as in `site-map.ts`.
  - The guide's pre-publish checklist runs before archive.
- **Rollback:** the gate test refuses a half edit, so a rollback is both lines: `EXTENSION_ID = ""` and X1 `live: false`.
- **Store:** the owner uploads `apps/extension/gallery-wall-layout-generator.zip` (`pnpm --filter extension zip`) as version 0.1.1 after merge.
- **Tracker:** T24 goes to `Done` at archive, with a log line naming the go-live and any BL ids left for post-deploy checks.

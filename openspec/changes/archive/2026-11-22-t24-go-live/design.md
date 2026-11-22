# Design

## Context

- `t24-extension-page` built X1, its 27 translations (T25) and the G1/F2 section behind one gate. A unit test refuses `EXTENSION_ID` without X1 `live: true`, and the reverse. Everything else follows from `live`: head robots, sitemap, footer, Related tools, `StoreLink` and `ExtensionSection`.
- A dry run of the flip, in a throwaway worktree on 2026-11-22, found every test that changes. In the unit suite, 2 of 607 fail. In e2e, 5 of 307 fail:
  - the two approved outline tests;
  - the Polish noindex test;
  - G1 "links only to live pages";
  - the sitemap count.

  Nothing else moved: footer, header, the X1 page itself and the extension e2e all pass.

- The extension (`apps/extension/src/background.ts`) opens `HOW_TO?pinned=0|1` on a first install, always in English. Its `externally_connectable` matches only `https://framesizes.app/*`. So the published build can talk only to production, never to localhost or a Vercel preview.
- The extension already imports `apps/web/src` through the `@/` alias (BL-57). `apps/web/src/lib/locales.ts` has no imports and no Next code.

## Goals / Non-Goals

**Goals:**

- Go live in one reviewed edit, with every not-live scenario still proven by a fixture or a guarded skip.
- First install lands on the visitor's language version (BL-96).
- Leave no uncited sitemap scenario behind (BL-88).

**Non-Goals:**

- Fixing other extension-page backlog items: BL-69, BL-70, BL-77, BL-78, BL-80 stay open.
- Choosing the language from the store listing the visitor used. Chrome does not expose it to the extension; the UI language is the nearest signal, and the store shows listings in that same language.
- Following later language changes. Only the first-install tab is affected.

## Decisions

1. **Store URL stays `/detail/<id>`.** Checked 2026-11-22: the short URL answers 301 to `/detail/gallery-wall-layout-gener/<id>`, which answers 200.
   - The slug is derived from the listing name and may change; the id never does.
   - The cost is one redirect hop on a click, never on page load.
   - Alternative: hard-code the slug URL. It saves the hop but breaks silently on a rename.
2. **Go-live date.** `lastModified` is the apply date. The page's content does not change, but this is the date it becomes indexable, and the sitemap `lastmod` should reflect the first crawlable version.
3. **Not-live tests stay, fixture-driven or guarded.**
   - `seo.test.ts` reads `{ ...X1, live: false }` and `sitemapEntries(withLive(...))`, not the real site map, so "Translations of a page that is not live" and "A translated version before go-live" stay proven.
   - The Polish e2e gets the same `test.skip(X1.live, …)` its siblings in `extension-page.spec.ts` already have; its unit twin still runs.
   - Alternative: delete them. That loses the guard a rollback relies on.
4. **Rewrite scenarios, never drop them.**
   - OpenSpec refuses to drop a scenario from a MODIFIED block (BL-88), so titles and anchors stay.
   - The live-site sitemap and G1 Related-tools scenarios keep their titles and gain X1 in their bodies; both titles stay true.
   - BL-88's scenario and "The live tools and the company pages" become fixture scenarios and get unit tests, so no scenario is left uncited.
5. **Install language: a pure `howToUrl(uiLanguage, pinned)` in `background.ts`.**
   - Normalise the tag: lowercase, `_` to `-`.
   - Map Chrome's tags that differ from the site's codes: `fil` → `tl`, `zh-cn` → `zh-hans`, `nb` / `nn` → `no`.
   - Then try the whole tag against `localeByCode` (this catches `pt-br`, `pt-pt`, `zh-hans`), then its primary subtag (`de-at` → `de`, `es-419` → `es`).
   - No match, `en`, or no tag gives the English path through `localizedPath`.
   - `zh-tw`, `zh-hk` and bare `pt` have no site version, so they get English on purpose. Guessing Traditional readers into Simplified, or Brazilians into Portugal, reads worse than English.
   - The site's codes come from `@/lib/locales` and are not copied, so a language added to the site needs no extension edit beyond a release.
   - `Api` gains `i18n?: { getUILanguage(): string }`. It is optional, so the existing fake keeps compiling and reads as English. That needs no edit to an existing test.
   - Alternative: read `navigator.language` in the worker. It is the same value in Chrome, but harder to fake in a unit test.
   - Alternative: let the site redirect by `Accept-Language`. The localization spec forbids redirects.
6. **Extension version `0.1.1`.** This is a behaviour change, so it gets a patch bump. The manifest test does not pin the version, and the status reply reads it from the manifest.

## Risks / Trade-offs

- **[The store build is not the version that maps languages until review passes]** → 0.1.0 keeps opening English, which is correct, just not localized. The site goes live first. BL-96's live check waits for 0.1.1 and is logged as a BL item if still pending at archive.
- **[Rollup splits `locales.ts` into a chunk shared with the panel]** → a module service worker loads static imports. The e2e extension suite installs the real build and covers the install tab and status reply.
- **[Chromium ignores `--lang` on macOS]** → probed 2026-11-22: the extension worker reported the system language (`en-GB`) with `--lang=ru` and `--lang=en-US`, and Playwright's `locale` does not reach it either. The real-browser Russian install test therefore runs on Linux only (CI), skipped on macOS; the language mapping itself is unit-tested with a fake `chrome.i18n`. If Linux Chromium ignores it too, the e2e is dropped and logged.
- **[Post-deploy checks can't run in CI]** → `externally_connectable` ties the extension to production. These run on production by the owner after the Vercel deploy:
  - the pin switch;
  - the "You have it" height;
  - the 390 px phone line;
  - a translated install;
  - the Rich Results Test;
  - the preview card.

  The checks still open at archive become BL items, like BL-13/14 for the home page.

- **[Fresh indexing of 28 URLs at once]** → all 28 share one content date and canonical/hreflang already passed review in T25. Google Search Console watch is part of the existing BL routine, not this change.

## Migration Plan

1. Merge: Vercel deploys, X1 is indexable, and the G1/F2 section and store links appear.
2. Owner runs `pnpm --filter extension zip` on `main` and uploads `gallery-wall-layout-generator.zip` as 0.1.1.
3. Owner runs the post-deploy checks from the "After deploy" list in tasks.md.
4. Rollback: one commit setting `EXTENSION_ID = ""` and X1 `live: false`. The gate test refuses either line alone. The extension needs no rollback: it opens a page that still answers 200 with `noindex`.

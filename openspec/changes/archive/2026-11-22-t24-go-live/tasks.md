# Tasks

Branch `t24-go-live` from `main` at `f11df8f`. Owner approved these existing-test edits: the G1 and F2 outline tests (2026-11-20), and on 2026-11-22 two cases in `seo.test.ts`, the Polish noindex e2e, G1 "links only to live pages", the sitemap e2e and `--lang=en-US` in the extension e2e launch args. Every other existing test passes unedited.

## 1. Spec deltas

- [x] 1.1 extension-site delta (MODIFIED "The extension page goes live only with a store id") written; `openspec validate t24-go-live --strict` passes
- [x] 1.2 gallery-wall-extension delta (MODIFIED "The first install opens the how-to page") written
- [x] 1.3 seo-base delta (MODIFIED "The sitemap lists exactly the live pages") written
- [x] 1.4 gallery-wall-planner delta (MODIFIED "The planner links only to live pages") written

## 2. Go-live: tests first

- [x] 2.1 `apps/web/src/lib/__tests__/extension.test.ts`: add a new `it` for "The published listing": `EXTENSION_ID` is `khapjkonaofjfljdakdcmodaclkmffgn`, `page("X1").live` is true, and `STORE_URL` is `https://chromewebstore.google.com/detail/khapjkonaofjfljdakdcmodaclkmffgn`. Cite {@link openspec/specs/extension-site/spec.md#scenario-the-published-listing}. Leave the existing gate cases as they are. Verify it fails.
- [x] 2.2 `apps/web/src/lib/__tests__/seo.test.ts` (approved edits):
  - "lists no translated URL while the page is not live" builds from `sitemapEntries(withLive("F1", "G1"))`.
  - "keeps a translated version out of the index while X1 is not live" uses `{ ...X1, live: false }`.
  - Both keep their titles and citations, and both pass before and after the flip.
- [x] 2.3 `seo.test.ts`, BL-88: add two new `it` cases, each built with `withLive`:
  - "The home page, F2 and G1 are live": 3 entries.
  - "The live tools and the company pages": 8 entries with the five company paths.
  - Cite each at its `seo-base` anchor (`#scenario-the-home-page-f2-and-g1-are-live`, `#scenario-the-live-tools-and-the-company-pages`). They pass now (fixtures).
- [x] 2.4 e2e edits (approved). Verify that each fails now:
  - `e2e/gallery-wall-content.spec.ts` and `e2e/frames-on-wall-content.spec.ts`: add `"h2 Plan on any shop's page"` right after `"h2 Gallery wall layout generator"` (G1) and `"h2 Frame visualizer"` (F2), the positions the 2026-11-22 dry run rendered.
  - `e2e/gallery-wall-content.spec.ts` "links only to live pages": `relatedGroups` becomes `["Frames", "Gallery wall"]` (groups follow `HUBS`) and `related` becomes `["/", "/frame-sizes-on-wall", "/extensions/gallery-wall-layout-generator"]`. Confirm the `related` order against the built HTML; the dry run stopped at the groups.
  - `e2e/seo-home.spec.ts` sitemap test: 37 `<url>`s, plus `<loc>${CANONICAL}/extensions/gallery-wall-layout-generator</loc>` and `/ru/…` with X1's `lastModified`.
  - `e2e/extension-page-locales.spec.ts:170`: add `test.skip(X1.live, "X1 is live: …")` (its unit twin in 2.2 keeps the scenario proven).
- [x] 2.5 `e2e/extension-page.spec.ts`: add a new test "the extension page once live" with `test.skip(!X1.live, …)`. Cite {@link openspec/specs/extension-site/spec.md#scenario-the-extension-page-once-live}. It checks:
  - robots metas hold no `noindex`;
  - `footerLinks` contains the path;
  - one store link with `href` `STORE_URL`, `target="_blank"` and `rel="noopener"`;
  - on G1, `relatedLinks` contains the path and the `h2` "Plan on any shop's page" is present.

  Verify it is skipped now.

## 3. Go-live: the edit

- [x] 3.1 Make the flip:
  - `apps/web/src/lib/extension.ts`: `EXTENSION_ID = "khapjkonaofjfljdakdcmodaclkmffgn"`; update the doc comment (no longer "empty until").
  - `apps/web/src/lib/site-map.ts` X1: `live: true`, `lastModified` set to the apply date; drop the "linked from nowhere" comment.
  - Verify `pnpm test:unit` and every test from section 2 pass. The pre-go-live e2e cases (`before go-live…`, `no Chrome Web Store link…`, `no extension section…`, Polish noindex) report skipped.

## 4. BL-96: install tab in Chrome's language

- [x] 4.1 `apps/extension/src/__tests__/background.test.ts`: add new cases only, with a fake that adds `i18n: { getUILanguage: () => tag }`. The existing fake and cases stay unedited. Verify they fail.
  - "A fresh install in another language": `ru`, `de-AT`, `fil`, `zh-CN`, `pt-BR`, `pt-PT`, `nb` open `/<code>/extensions/gallery-wall-layout-generator?pinned=1` with `ru`, `de`, `tl`, `zh-hans`, `pt-br`, `pt-pt`, `no`.
  - "A fresh install in a language the site lacks": `zh-TW`, `ca`, `en-GB`, `""` and no `i18n` open the English `HOW_TO`.
  - Cite both scenarios at `openspec/specs/gallery-wall-extension/spec.md`.
- [x] 4.2 `apps/extension/src/background.ts`:
  - `Api.i18n?: { getUILanguage(): string }`.
  - A pure `howToUrl(uiLanguage, pinned)`, following design decision 5 with `localeByCode` and `localizedPath` from `@/lib/locales`; `onInstalled` uses it.
  - Verify 4.1 and every existing `background.test.ts` case pass.
  - Verify `pnpm --filter extension build` succeeds.
  - `e2e/extension.spec.ts` (approved 2026-11-22): add `--lang=en-US` to the shared launch `args`, so "a first install opens one how-to tab with pinned=0" stays English on Linux and Windows whatever the machine's language. Chromium ignores `--lang` on macOS (probed 2026-11-22: it always reported the system's `en-GB`), so on a Mac the test reads the system language; `en-*` maps to English. Verify it passes.
  - Verify `grep -rn "extensions/gallery-wall-layout-generator" apps/extension/src` lists only `background.ts` and its test, so no other tab opens the English page.
- [x] 4.3 `e2e/extension.spec.ts`: add a new test, "a first install in Russian opens the Russian how-to". It cites {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-fresh-install-in-another-language}.
  - It uses its own persistent context with the same args, but `--lang=ru`.
  - It expects exactly one tab, `https://framesizes.app/ru/extensions/gallery-wall-layout-generator?pinned=0`.
  - It has `test.skip(process.platform === "darwin", "Chromium ignores --lang on macOS")`.
  - Verify it in the CI `e2e` job (ubuntu-latest), or locally in the `mcr.microsoft.com/playwright:v1.65.0-noble` image with Docker running.
  - If Linux Chromium also reports English (no `ru` locale pack), drop the test, keep the unit cases from 4.1 as the proof, and log a BL item.
- [x] 4.4 `apps/extension/public/manifest.json` `version` to `0.1.1`; verify `manifest.test.ts` passes.

## 5. Gates and pre-publish checklist

- [x] 5.1 `pnpm fix`, then `pnpm test`; `openspec validate --all --no-interactive` passes.
- [x] 5.2 The On-page SEO guide's pre-publish checklist. Build locally (`pnpm build && pnpm start`) and check view-source of `/extensions/gallery-wall-layout-generator` and `/ru/extensions/gallery-wall-layout-generator`:
  - 200;
  - no `noindex`;
  - one absolute self-canonical;
  - title, description, `h1`, main text, links and BreadcrumbList in the server HTML;
  - X1 in the footer and in `/sitemap.xml` with its `lastmod`;
  - the G1 Related tools card;
  - JSON-LD crumbs match the visible ones.

  Record the result for the PR. The `www` / trailing-slash hop, the production `X-Robots-Tag` header, the Rich Results Test and the preview card go to After deploy.

- [x] 5.3 Backlog: delete BL-88 and BL-96 from `docs/backlog.md` (BL-96 is fixed in code; its live check runs after deploy). Add a `BL-nn` item, from `_Next id:_`, for each After-deploy check still open at archive, plus every review finding left unfixed. Verify `grep -cE "BL-(88|96)\]" docs/backlog.md` prints 0.

## After deploy (owner, on production; untracked, not blocking archive)

These need the published extension, which talks only to `https://framesizes.app/*`.

- Pin switch: install from the store, leave the button unpinned, and confirm the tab opens `?pinned=0`. Pin it and watch the page switch to usage mode within 2 s, with `pinned` gone from the address.
- "You have it": with the extension installed, G1's section reads "You have it…". Its height in DevTools equals the height with the extension disabled.
- Phone: G1 on a 390 px touch phone shows "Chrome on phones doesn't run extensions…" and no "Add to Chrome".
- BL-96 live, after 0.1.1 passes review: in Chrome set to Russian (and Filipino), a first install opens `/ru/…` (`/tl/…`).
- Rich Results Test on the live X1 URL (BreadcrumbList valid), and a preview card for it in a chat app.
- `www.framesizes.app/extensions/gallery-wall-layout-generator` and the trailing-slash URL reach the canonical URL in one hop; no `X-Robots-Tag` on the response.

## Workflow follow-up

- Phase review (`phase-review`, fresh `general-purpose` subagent), fix findings, log the rest (5.3).
- `/opsx:archive`. Then, in `openspec/specs/extension-site/spec.md`:
  - set Public Interface to `EXTENSION_ID` "the published listing's id";
  - in Behavior, say go-live happened on the apply date and rollback is both lines.
- In `openspec/specs/gallery-wall-extension/spec.md` Public Interface, add `howToUrl` and `Api.i18n?`.
- Tracker: set T24 `Done`. The log line reads: today's date, `Claude Code`, "T24 go-live (t24-go-live): X1 and its 27 translations live with store id khapjkonaofjfljdakdcmodaclkmffgn, store link and the G1/F2 extension section on; extension 0.1.1 opens the install tab in Chrome's language (BL-96); post-deploy checks: <BL ids>". Change the T24 Notes from "Built 2026-11-20, not live…" to "Live <date>".
- Push, open the PR to `main` with auto-merge (merge commit). In the PR, name the BL ids added and the 5.2 result, and ask the owner to upload `pnpm --filter extension zip` as 0.1.1.

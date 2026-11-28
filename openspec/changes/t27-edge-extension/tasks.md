# Tasks

Branch `t27-edge-extension` from `main`. Decided by the owner on 2026-11-28:

- Individual Partner Center account;
- the same name, "Gallery Wall Layout Generator";
- store-aware how-to flow in phase 2, after a canvas;
- reuse the screenshots and the small tile, plus a new 300 logo and a 1400 × 560 large tile.

Every existing test passes unedited, except `e2e/company-pages.spec.ts:147` ("Chrome extension" becomes "browser extension"), which the owner approved on 2026-11-28.

The phase 2 canvas (https://claude.ai/artifact/ME5xpbNULkbax27e4vRqqp) was approved on 2026-11-28. It uses `?store=edge` after `pinned`, with nothing added for Chrome, which matches this change. Nothing here changes.

## 1. Per-store packages (tests first)

- [x] 1.1 Add `apps/extension/src/__tests__/stores.test.ts`. Cite each scenario of "Each store gets its own package" at `openspec/specs/gallery-wall-extension/spec.md#…`. Verify it fails before 1.2. It checks:
  - `packageMessages("chrome", lang, m)` returns `m` unchanged for all 28 locales;
  - `packageMessages("edge", "en", m)` has exactly `appName` "Gallery Wall Layout Generator" and the Edge `shortDesc`;
  - `packageMessages("edge", lang, m)` is `null` for every other locale;
  - the Edge `shortDesc` is ≤ 132 characters, differs from the English Chrome `shortDesc`, and has no "Chrome" or "Google".
- [x] 1.2 Write `apps/extension/src/stores.ts` (design D2) with the Edge `shortDesc` (design D3). Run `humanizer:humanizer` over the short description first; the result keeps "gallery wall planner" and "picture frame layout". Verify 1.1 passes.
- [x] 1.3 Packaging:
  - `apps/extension/vite.config.ts`: read `STORE` (default `chrome`), set `outDir` to `dist` for Chrome and `dist-<store>` otherwise, `define` `import.meta.env.STORE`, and add the `writeBundle` plugin that rewrites `<outDir>/_locales` through `packageMessages`;
  - `apps/extension/package.json`: add `zip:edge` (builds `dist-edge`, zips it to `gallery-wall-layout-generator-edge.zip`);
  - `.gitignore`: add `apps/extension/dist-*/`.

  Verify:
  - `pnpm --filter extension zip` gives a `dist/` byte-identical in `manifest.json` and `_locales` to before;
  - `pnpm --filter extension zip:edge` gives `dist-edge/_locales/en` only;
  - `unzip -l` of the Edge zip shows `manifest.json` at its root;
  - `grep -rl "Chrome" dist-edge/manifest.json dist-edge/_locales` prints nothing.

## 2. Install tab names the store (tests first)

- [x] 2.1 `apps/extension/src/__tests__/background.test.ts`: add a new case only. `howToUrl("de", false, "edge")` and `onInstalled` with an Edge store open `https://framesizes.app/de/extensions/gallery-wall-layout-generator?pinned=0&store=edge`. Cite {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-fresh-install-from-microsoft-edge-add-ons}. Existing cases stay unedited and still pass with no store argument. Verify the new case fails.
- [x] 2.2 `apps/extension/src/background.ts`: `howToUrl(uiLanguage, pinned, store = "chrome")` adds `&store=<store>` for any store but Chrome. `onInstalled` passes `import.meta.env.STORE`. Change the doc comments from "Chrome's language" to "the browser's language". Verify all `background.test.ts` cases pass and `pnpm --filter extension typecheck` is clean.
- [x] 2.3 Sideload check in Edge. Load `apps/extension/dist-edge` unpacked in Playwright's `msedge` channel (Microsoft Edge is installed on this Mac), with a throwaway script in the scratchpad, not a committed test. Confirm:
  - first install opens `…?pinned=0&store=edge`;
  - the toolbar button opens the sidebar on the planner;
  - `chrome.action.getUserSettings` answers;
  - on a page with an `<img>`, the "Try on my wall" menu item exists.

  Record the Edge version and results in the PR. Anything that fails stops the change and goes to the owner.

## 3. Privacy Policy and Terms of Use name no browser

- [x] 3.1 Edit `e2e/company-pages.spec.ts:147` to `section(page, "/privacy-policy", "browser extension")` (approved 2026-11-28). Then add a new e2e test, "the privacy policy names no browser", citing {@link openspec/specs/company-pages/spec.md#scenario-no-browser-is-named}. Verify both fail now.
- [x] 3.2 Edit `apps/web/src/app/privacy-policy/page.tsx` and `apps/web/src/app/terms-of-use/page.tsx`:
  - "The Chrome extension" becomes "The browser extension";
  - "extension for Chrome" becomes "browser extension";
  - "Chrome's side panel" becomes "your browser's side panel";
  - "asks Chrome for" becomes "asks your browser for".

  The install-visit sentence ("the page address says whether you have pinned the extension") also says the address names the store the extension came from, since the Edge package adds `store=edge`. Every other fact stays. Run `humanizer:humanizer` over the changed sentences only. If the policy has a last-updated date, it moves to the apply date. Verify the 3.1 tests and the existing company-pages unit and e2e tests pass.

## 4. Graphics

- [x] 4.1 Add `scripts/render-store-graphics.ts` (design D6). It renders `apps/extension/store/edge/logo-300.png` (300 × 300 from `icon.svg`) and `apps/extension/store/edge/promo-large-1400x560.png`. The tile takes the small tile's colours, mark and font; its headline goes through `humanizer:humanizer` and names no browser. Verify the PNG sizes from their IHDR, as `manifest.test.ts` does.
- [ ] 4.2 Show the owner both PNGs. On approval, record the large tile under CLAUDE.md "Workflow config" → "Design source" ("T27 Edge store graphics", date) and commit the PNGs. Revisions loop here until approved.

## 5. Listing kit

- [x] 5.1 Create the Claude Doc "Gallery Wall Layout Generator: Microsoft Edge Add-ons" (design D7) with:
  - the long description: written fresh, 250–10,000 characters (count stated in the doc), keywords from the Chrome Google Doc tables with a Times used column, no other browser named, "Edge sidebar" for the panel, ending with "Official website: https://framesizes.app/". Run it through `humanizer:humanizer` before it goes in;
  - the short description and name as packaged;
  - the search-term table;
  - Properties: category, website, support;
  - Privacy tab answers drawn from the privacy policy's permission rows;
  - Notes for certification;
  - the graphics list with file paths;
  - the package version.

  Verify the description's length and that it contains none of "Chrome", "Google", "Firefox", "Safari" or "Opera".

- [x] 5.2 In the same doc, add the numbered publishing guide:
  1. personal Microsoft account, then Individual registration and verification;
  2. Partner Center → Create new extension → upload `gallery-wall-layout-generator-edge.zip`;
  3. Availability: Public, all markets;
  4. Properties;
  5. Privacy;
  6. Store listings → English only (remove any other language row);
  7. the Submit notes;
  8. review (up to 7 business days) and the "In the Store" status;
  9. where to copy the extension id and listing URL for phase 2;
  10. how to ship a later version.

  It recommends submitting after phase 2 is live (design D8). Link the doc in CLAUDE.md "Workflow config" next to the Chrome listing.

## 6. Gates

- [x] 6.1 `pnpm fix`, then `pnpm test`, then `openspec validate --all --no-interactive`. All pass.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent; fix findings; log what stays in `docs/backlog.md`.
- `/opsx:archive`. Then update the Tracker: T27 stays `In progress`, and a Log line names the Edge package, the listing kit, the privacy wording and the graphics.
- Push, open the PR to `main`, turn on auto-merge with a merge commit.
- Phase 2 (`t27-store-how-to`): propose from the approved canvas (CLAUDE.md "Design source", 2026-11-28).
  - Q3 B: X1's title and description become browser-neutral, so the SEO guide's X1 row (and its 27 translations) changes first.
  - The site asks every known store id.
  - The "which browsers" FAQ changes on the live Chrome page too.
  - It folds in BL-79 and BL-80.
  - The About page and Refund Policy name the Edge store at its go-live.

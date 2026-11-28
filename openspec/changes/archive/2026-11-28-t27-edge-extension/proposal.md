# Proposal

## Why

"Gallery Wall Layout Generator" is live only in the Chrome Web Store. A Microsoft Edge Add-ons listing adds a second store page with links to framesizes.app (website, privacy policy, the "Official website" line), and that is the main reason for it. Opera follows as T28 in its own session.

Edge runs the Chrome package almost as it is. Three things stop it from passing certification or reading right on Edge:

- Edge policy 1.1.2 says a listing "must not reference other browsers", and our package carries `storeDesc` ("…the Chrome side panel…") in 28 languages.
- Partner Center requires a description and a logo for every language the package declares, and we want an English-only listing.
- Policy 1.5.2 says the privacy policy "should primarily refer to the Microsoft Edge browser", and ours says "Chrome" throughout.

The owner has never published to Edge, so the change also delivers paste-ready listing text, graphics and a step-by-step guide.

This is phase 1 of T27. The how-to page X1 and the G1/F2 extension section are drawn for Chrome (toolbar drawing, "Add to Chrome", Chrome store id). The owner decided on 2026-11-28 that they become store-aware for Chrome, Edge and Opera. That is phase 2 (`t27-store-how-to`). Its canvas was approved on 2026-11-28, with a browser-neutral X1 title and description (Q3 B). Phase 2 is proposed after this change ships.

## What Changes

- **Per-store packages.** One build per store from the same code and manifest. `pnpm --filter extension zip` keeps building the Chrome package exactly as today. `pnpm --filter extension zip:edge` builds `apps/extension/gallery-wall-layout-generator-edge.zip`:
  - only `_locales/en`;
  - `appName` "Gallery Wall Layout Generator", the same name as on Chrome (owner, 2026-11-28);
  - its own short description: at most 132 characters, different from Chrome's, naming no other browser;
  - no `storeDesc`.

  The store table is shared, so T28 adds an `opera` row.

- **The install tab says which store.** The Edge package opens the how-to page with `&store=edge` after `?pinned=0|1`. The Chrome package's URL does not change. Until phase 2 ships, the site ignores the parameter.
- **Privacy Policy and Terms of Use name no browser.** "The Chrome extension" becomes "the browser extension", "Chrome's side panel" becomes "your browser's side panel", and "asks Chrome for" becomes "asks your browser for". Every fact stays as it is. The About page and the Refund Policy name the stores, so they change in phase 2's go-live, once the Edge listing exists.
- **Graphics** (owner, 2026-11-28), in `apps/extension/store/edge/`:
  - a 300 × 300 logo, rendered from `icon.svg`;
  - a 1400 × 560 large promotional tile in the approved small tile's style, which the owner approves as a PNG;
  - the three 1280 × 800 screenshots and the 440 × 280 small tile, reused from `apps/extension/store/`. They contain no browser name.
- **The listing kit**, a Claude Doc "Gallery Wall Layout Generator: Microsoft Edge Add-ons", linked from CLAUDE.md "Workflow config":
  - the English long description: 250 to 10,000 characters, written fresh against the Chrome Google Doc's keyword tables, naming no other browser, ending with "Official website: https://framesizes.app/";
  - seven search terms, within Edge's limits (at most 7 terms, 30 characters each, 21 words in total);
  - every Partner Center field: category, website, support contact, privacy policy URL, single purpose, a justification for each permission, remote code, data usage, and notes for certification with a test path;
  - a step-by-step guide covering a personal Microsoft account, Individual registration (owner, 2026-11-28), upload, each tab, submit, review (up to 7 business days), and finding the Edge extension id for phase 2.
- **Humanizer** over every new visitor-facing text: the short and long descriptions, the privacy and terms wording, and the large tile's headline.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `gallery-wall-extension`: gains "Each store gets its own package". "The first install opens the how-to page" adds `store=edge` for the Edge package.
- `company-pages`: "The Privacy Policy states what is collected, where and for how long" covers the browser extension without naming a browser.

## Impact

- **Code:**
  - `apps/extension/src/stores.ts` (new: store table and per-store messages, pure);
  - `apps/extension/src/background.ts` (`howToUrl` takes the store);
  - `apps/extension/vite.config.ts` (reads `STORE`, writes the store's `_locales`);
  - `apps/extension/package.json` (`zip:edge`);
  - `.gitignore` (`apps/extension/dist-*/`);
  - `apps/web/src/app/privacy-policy/page.tsx`, `apps/web/src/app/terms-of-use/page.tsx`.
- **Tests:**
  - new cases in `apps/extension/src/__tests__/background.test.ts` and a new `stores.test.ts`;
  - a privacy page test for no "Chrome";
  - the existing e2e that finds the h2 by "Chrome extension" (`e2e/company-pages.spec.ts:147`) now finds "browser extension" (approved 2026-11-28).
- **Assets:** `apps/extension/store/edge/logo-300.png`, `apps/extension/store/edge/promo-large-1400x560.png`.
- **Version:** stays 0.1.1. The Edge store has never seen a version, and the Chrome package does not change in behaviour, so no Chrome upload is needed.
- **Backlog:** no open item sits in this phase's area. The pin-picture items BL-79 and BL-80 go to phase 2.
- **Tracker:** T27 "Microsoft Edge Add-ons" was added on 2026-11-28 (In progress), with T28 Opera (Not started). At archive, T27 stays In progress until phase 2 ships.
- **Owner steps outside the repo:** register in Partner Center as an Individual, with a personal Microsoft account. Upload the Edge zip and submit. Submit once phase 2 is live, so Edge reviewers do not land on the Chrome how-to page. The guide covers an earlier submission too.

# Design

## Context

- `apps/extension` is one Vite build. `public/` (manifest, icons, 28 `_locales`) is copied into `dist/` as it is, and `pnpm --filter extension zip` zips `dist/`. Each `messages.json` holds `appName`, `shortDesc` (the manifest `description`) and `storeDesc`. `storeDesc` is the Chrome long description, kept in the package only as a translated copy. Nothing reads it.
- Facts from Microsoft Learn, read 2026-11-28:
  - Edge runs Chrome MV3 code as it is. `sidePanel`, `contextMenus`, `scripting` and `i18n` are supported, and `setPanelBehavior({ openPanelOnActionClick: true })` is documented for the Edge sidebar.
  - The only porting steps are to drop `update_url` (we have none) and to rebrand any "Chrome" in the name or description.
  - Partner Center takes the listing name from the manifest `name` and the short description from the manifest `description`. A name or short description change means a new package.
  - A description and a logo are required for every language the package declares.
  - Long description: 250 to 10,000 characters. Logo: 300 × 300 recommended. Large tile: 1400 × 560. Screenshots: up to 6, at 640 × 480 or 1280 × 800. Search terms: at most 7, 30 characters each, 21 words in total, not shown to users.
  - Review takes up to 7 business days. Registration is free.
  - Policy 1.1.2: a listing "must not reference other browsers". Policy 1.5.2: the privacy policy "should primarily refer to the Microsoft Edge browser".
- Not confirmed by any page we read: the Edge listing URL format, and whether Edge assigns its own extension id. We assume it does (a package Microsoft signs) and plan for it.

## Goals / Non-Goals

**Goals:**

- One codebase, one manifest, and a package per store chosen at build time.
- An English-only Edge package that never says "Chrome".
- A guide the owner can follow with no prior Partner Center experience.

**Non-Goals:**

- Store-aware how-to page, G1/F2 section, Edge store link, Edge id on the site. That is phase 2, after a canvas.
- About page and Refund Policy store names. They change at phase 2 go-live.
- The Opera package. T28 adds an `opera` row to the same table.
- Any change to the Chrome package's behaviour or version.

## Decisions

### D1. The store is fixed at build time, not detected at run time

`STORE=edge vite build` builds into `dist-edge/`. Vite `define` replaces `import.meta.env.STORE` in the worker. Unset means `chrome`.

Rejected: user-agent sniffing (`Edg/`). Someone who installs the Chrome Web Store package in Edge keeps the Chrome id. The site has to poll that id, so the store that signed the package matters, not the browser it runs in.

`howToUrl(uiLanguage, pinned, store = "chrome")` stays pure. `onInstalled` passes the built store.

### D2. One store table, pure, under `src/`

`apps/extension/src/stores.ts` exports:

- `STORES`: for each store, the locales it keeps (`null` means all), its `shortDesc` override, whether `storeDesc` is dropped, and its `store` query value.
- `packageMessages(store, locale, messages)`: returns the `messages.json` to write, or `null` to leave the locale out.

A ~20-line Vite plugin in `vite.config.ts` applies it in `writeBundle` over `<outDir>/_locales`. Because the logic is pure TypeScript under `src/`, the spec scenarios can be unit-tested without building. CI builds only the Chrome package. A mistake in the plugin itself, as opposed to the table, would be caught only by the manual `dist-edge` checks in task 1.3. Use `closeBundle` if `writeBundle` runs before Vite 8 has copied `public/`.

Rejected: a second `public-edge/` folder. It would copy the manifest and icons and let them drift.

Rejected: a separate post-build Node script. That is one more entry point for the same 20 lines.

### D3. The name stays and only the short description differs

The owner chose the same name on 2026-11-28. The Edge `shortDesc` is new copy:

- 132 characters at most. That is Chrome's limit on the same key; Edge states none.
- Keywords from the Chrome Google Doc's tables, led by "gallery wall planner" and "picture frame layout", not "photo collage planner" as on Chrome.
- "Edge sidebar" is the Edge name for the side panel, so it may appear. No other browser.
- Working draft, finalized with humanizer during apply: "Gallery wall planner in the Edge sidebar: pick a picture frame layout with sizes, try shop prints at true size, get nail marks."

`storeDesc` is dropped from the Edge package. The Edge long description lives in the listing doc and is pasted into Partner Center.

### D4. English only by construction

The Edge package ships `_locales/en` alone, with `default_locale: "en"`, so Partner Center can only open an English listing. Dropping the other 27 locales costs nothing visible: the panel UI is English, and only the name and descriptions in Edge's extension manager were translated.

### D5. One browser-neutral privacy policy

The extension is described as "the browser extension". Every fact and the permission list stay as they are. Policy 1.5.2 says "should", and a policy that names no browser meets it without a second, Edge-only page that could drift from the code.

The Terms of Use get the same wording. "Google" stays where it names the mail provider.

The e2e at `e2e/company-pages.spec.ts:147` finds the section by "Chrome extension". Changing it to "browser extension" is an edit to an existing test, and the owner approved it on 2026-11-28.

### D6. Graphics are rendered, not drawn

`scripts/render-store-graphics.ts` uses the repo's Playwright Chromium to screenshot two HTML snippets:

- `icon.svg` at 300 × 300, on the icon's own background;
- the large tile: 1400 × 560, the small tile's yellow, mark and font, and a one-line headline.

Both go to `apps/extension/store/edge/`. The large tile is new art, so the owner approves the PNG, and its approval is recorded under CLAUDE.md "Design source". T28 reuses the script for Opera's sizes.

The three screenshots and the small tile are reused as they are. They show a neutral window with no browser name (checked 2026-11-28).

### D7. The listing kit is a Claude Doc

The Chrome texts live only in a Google Doc. The Edge kit holds texts, field values, a search-term table and a numbered guide, and the owner pastes from it field by field. It is a Claude Doc, linked from CLAUDE.md next to the Chrome listing. It is not committed, which keeps store copy out of the spec-gated tree.

Search terms, 21 words in total:

| #   | Term                        | Chars | Words |
| --- | --------------------------- | ----- | ----- |
| 1   | gallery wall planner        | 20    | 3     |
| 2   | gallery wall template       | 21    | 3     |
| 3   | picture frame layout        | 20    | 3     |
| 4   | photo wall layout generator | 27    | 4     |
| 5   | wall collage layout         | 19    | 3     |
| 6   | picture hanging ideas       | 21    | 3     |
| 7   | frame visualizer            | 16    | 2     |

Out: "gallery wall template generator" (31 characters). Also out: "gallery wall layout generator", which the name already carries.

Fields that link to framesizes.app:

- Website: `https://framesizes.app/gallery-wall-planner`, the page the Chrome listing lands on. Edge requires a page on our own site.
- Support contact: `https://framesizes.app/contact`.
- Privacy policy URL: `https://framesizes.app/privacy-policy`.
- The "Official website: https://framesizes.app/" line that ends the description.

The Privacy tab answers come from the privacy policy's permission rows, so the two never disagree:

- single purpose: plan a gallery wall at true size;
- one justification per permission;
- remote code: No;
- data usage: none collected.

Notes for certification give a test path: click the toolbar button to open the sidebar, then on `https://society6.com` right-click a print and choose "Try on my wall".

### D8. Sequence and the Edge id

1. Apply this change.
2. The owner registers (Individual) and uploads the Edge zip as a draft.
3. If Partner Center shows the extension id before publishing, phase 2 can wire it before submission. If not, phase 2 ships store-aware pages that poll no Edge id, and a go-live edit sets it, as `t24-go-live` did.

The guide recommends submitting after phase 2 is live, so reviewers do not land on the Chrome how-to page. Until then an Edge install opens X1 in Chrome's wording, with a pin poll that never resolves. Nothing breaks.

## Risks / Trade-offs

- **The sidePanel API or `action.getUserSettings` behaves differently in Edge 116+.** Mitigation: before any upload, a sideload test in Edge (load `dist-edge/` unpacked, then install, pin, panel, Try on my wall), by Playwright's `msedge` channel if Edge is installed, else by the owner.
- **Certification flags the Chrome-worded how-to page.** Mitigation: the D8 order; the guide says so.
- **The Edge id is unknown until publish.** Mitigation: phase 2 does not depend on it (D8).
- **The privacy policy names no browser, where Edge asks for Edge "primarily".** It is a "should", and no browser name is not another browser's name. If a reviewer objects, add one sentence naming the stores. That would be a copy edit, with no spec change.
- **Store copy outside the repo drifts from the extension.** Same risk as the Chrome Google Doc today. The kit names the package version it was written for.

## Migration Plan

Nothing to migrate. Rollback means deleting the Edge listing in Partner Center. The Chrome package and site do not change in behaviour.

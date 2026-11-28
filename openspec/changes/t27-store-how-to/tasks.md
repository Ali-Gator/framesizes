# Tasks

Branch `t27-store-how-to` from `main`. Decided by the owner on 2026-11-28:

- canvas Q1 A, Q2 A, Q3 B, Q4 A;
- the head values in the proposal ("Gallery Wall Layout Generator Extension", the "browser extension" description, "Browser extension");
- the Edge go-live waits for the CRX id (design D8).

New tests cite their scenario at its permanent path, `{@link openspec/specs/<capability>/spec.md#<scenario-anchor>}`.

**Existing tests that need edits, waiting for the owner's yes before any is touched:**

- `e2e/extension-page.spec.ts:195` (title), `:215` and `:222` ("Chrome extension" becomes "Browser extension"), and the server-HTML outline test at `:76–98`, if its `textContent` reads now join the Edge spans;
- `e2e/extension-page-locales.spec.ts:109` and `:123` (`toHaveCount(1)` on pin pictures becomes a count of visible ones), and `:157` and `:159` ("Extensión de Chrome" becomes the new Spanish crumb);
- `apps/web/src/lib/__tests__/seo.test.ts:190` (title) and `:200` (the crumb name);
- `apps/web/src/lib/__tests__/site-map.test.ts:150` (the full title);
- any other test that fails only because of the new name, title or hidden store lines. Each one is listed to the owner before it is edited.

## 1. SEO guide first (docs tools)

- [x] 1.1 Edit the On-page SEO guide (https://claude.ai/artifact/KbaLF8WnJ2jRWc55r5yfcx) as plain edits, since the owner approved the values:
  - Per-page map X1 title: "Gallery Wall Layout Generator Extension";
  - description table X1: the new description;
  - link map "X1 Chrome extension" becomes "X1 Browser extension";
  - the X1 paragraph: the title names no browser so one page serves every store; the BreadcrumbList is Home › Gallery wall › Browser extension; the server HTML keeps Chrome's wording and holds Edge's lines hidden; "Get it from the Chrome Web Store" for Chrome and "Get it from Microsoft Edge Add-ons" for Edge once its id is set;
  - A3 description (BL-140): same facts, no "Chrome". For example: "What Frame Sizes and its browser extension collect: cookieless visit counts and server logs. Wall photos and saved walls stay on your device, never with us." That is 151 characters; check the range against the guide's limits.

  Keep the keyword column. Add one line to the X1 paragraph: the title leaves out "chrome" by the owner's Q3 B choice, so the checklist's head-keyword item is a recorded exception. Verify by reading each changed row back.

- [x] 1.2 Before any copy or drawing, build `pnpm --filter extension zip:edge`. Ask the owner to load `apps/extension/dist-edge` unpacked in Microsoft Edge, open the Extensions flyout, and then right-click an image. Take a computer-use screenshot of each (Edge is read tier). Compare them with boards d2 and e2: the eye and its "Show in toolbar" tooltip, "Open Microsoft Edge Add-ons", "Manage extensions", "Copy image", "Inspect", and where the puzzle piece sits.
  - Done 2026-11-28 with the owner's screenshots (Edge 158): click 2 is a pin, the menu reads "Manage Extensions" and "Get extensions for Microsoft Edge". The owner approved the pin; the canvas and this change follow it (design D6).

## 2. Store table and status client (tests first)

- [x] 2.1 Extend `apps/web/src/lib/__tests__/extension.test.ts`. Cite "The Edge gate", "Edge with its id" and "The Edge package pins its button". It checks:
  - `EDGE_EXTENSION_ID` is `""` or matches `^[a-p]{32}$`;
  - the Edge page URL is `https://microsoftedge.microsoft.com/addons/detail/<id>`;
  - `knownIds()` is `[EXTENSION_ID]` while Edge's id is empty, and Chrome's id then Edge's with a fixture;
  - `askExtensions([a, b])`:
    - is installed and pinned when only `b` replies pinned;
    - is not installed when both time out;
    - sends nothing for `[]`.

  Verify it fails first.

- [x] 2.2 Implement design D3 in `apps/web/src/lib/extension.ts`. Keep `EXTENSION_ID`, `storeUrl` and `STORE_URL`, and update the file's doc comment, which names only Chrome. Verify 2.1 passes, and that the go-live tests in `site-map.test.ts` pass unedited.

## 3. Store pick (tests first)

- [x] 3.1 Add `apps/web/src/components/extension/__tests__/store.test.ts`. Cite the scenarios of "The page picks the visitor's store". It checks:
  - `pickStore` over one table: `?store=edge` in Chrome; brands with "Microsoft Edge"; `Edg/131`, `EdgA/131` and `EdgiOS/131` user agents; `OPR/`, legacy `Edge/18`, Firefox, Safari; `?store=opera`; `fromQuery: false` ignoring `?store=edge`;
  - `storeScript(true|false)`, run through `new Function` with stubbed `location`, `navigator` and `document`, gives the same answers for every row;
  - a throwing `navigator` leaves the attribute unset.

  Verify it fails first.

- [x] 3.2 Write `apps/web/src/components/extension/store.ts` (design D1). Verify 3.1 passes.

## 4. Variants and their CSS

- [x] 4.1 Add `ByStore` (design D2), with a unit test in `__tests__/by-store.test.tsx` citing "One heading, two texts". It checks:
  - two children with `st-chrome` and `st-edge` when both stores are built and the texts differ;
  - one plain child when they are equal, `edge` is `undefined`, or Edge is not in `stores`;
  - `edge: null` gives the Chrome child as `.st-chrome` and no Edge element ("Edge before its id");
  - no `id` on any variant.
- [x] 4.2 Add the two hide rules to `extension.css` and `widgets.css`, with a comment pointing to `store.ts`. This is verified by the e2e in 8.3.

## 5. Copy, head values and translations

- [x] 5.1 English (`copy/en.ts`):
  - add the `edge` block (design D4) from the canvas Main board;
  - change `faq.items[2].a` to the new browsers answer;
  - update the doc comment so it names Edge's English labels (Q2 A).

  Run `humanizer:humanizer` over the new and changed English lines: the Edge block, the browsers answer, and the section strings for 9.2. It keeps every fact, "puzzle piece (1)", "pin (2)", 116 and "Microsoft Edge Add-ons". If a rewording changes what the canvas says, show it to the owner first.

- [x] 5.2 `site-map.ts` X1: `name` "Browser extension", `card.question` "How do I use the gallery wall browser extension?", the new `seo.title` and `seo.description`, and `lastModified` set to the apply date. A3: the description from 1.1. Verify the description length checks in `site-map.test.ts` pass, and that the X1 h1 is unchanged.
- [x] 5.3 The 27 translations (design D4): in each `copy/<code>.ts`, the `edge` block, the browsers answer, and the new `seo.title`, `seo.description` and `crumbs.page`, none naming a browser. Verify:
  - `pnpm typecheck` (the `satisfies` check);
  - `copy-limits.test.ts` unedited (limits and uniqueness);
  - 5.4.
- [x] 5.4 Add a unit test citing "Every language's head". It scans the X1 site-map entry and all 28 dictionaries' `seo.title`, `seo.description` and `crumbs.page` for the whole words Chrome, Edge and Opera, and names the language that has one. Verify it fails on a dictionary changed to break the rule, then passes.

## 6. Check the pin poll in real Edge (design D6)

- [x] 6.1 With Playwright `channel: "msedge"` and `dist-edge` loaded, open X1 at `?pinned=0&store=edge`. Send the status message to the unpacked id read from `context.serviceWorkers()` (the manifest has no `key`, design D6). Check that the reply is `{ installed: true, pinned: false }` with no `lastError`. This is a one-off script in the scratchpad, not a suite test. If Edge cannot report the toolbar state, log a BL item and say so in the PR.

## 7. Drawings

- [x] 7.1 Add `EdgePinPicture`, LTR and RTL, from boards d2 and d4 (canvas version 1795872373-3de2: the pin, "Manage Extensions", "Get extensions for Microsoft Edge"), and select it through `PinPicture`'s new `store` prop. Its labels are English with `lang="en"`, and its `aria-label` comes from `copy.edge.pin.picture`. Add a unit test citing "The Edge pin picture's labels" and "The Edge pin picture in French", checking the three labels, `lang="en"` on each, and that the accessible name is the French one.
- [x] 7.2 `MenuFigure` gains `store` and `dir`:
  - the Edge style comes from e2;
  - `dir="rtl"` mirrors both stores' figures, as e4 shows (BL-80).

  Add a unit test citing "The Edge right-click figure's labels". The e2e in 8.3 covers "The Arabic right-click figure" and "A left-to-right version keeps its figure".

## 8. X1, store-aware

- [x] 8.1 `how-to.tsx`:
  - render `storeScript(true)`;
  - wrap the answer, store link, show-pin link, pin `h2`, pin text, pin picture, already-pinned line, right-click figure and FAQ button answer in `ByStore` with `stores = ["chrome", "edge"]`;
  - `StoreLink` takes the store and renders Edge's link only with Edge's id.

  `ModeSwitch` keeps `extensionId` and gains `edgeId` (design D3), asks each set id, and calls `pickStore` on mount. The store link uses `ByStore` with `edge: null` while Edge's id is empty. Update the JSDoc `{@link}`s to the new requirement anchors.

- [x] 8.2 Extend the unit tests:
  - `store-link.test.tsx`: Edge's label and URL with a fixture id; no Edge link without one ("Edge with its id", "Edge before its id");
  - `mode-switch.test.tsx`: the fixture Edge id replying pinned switches modes and keeps `?store=edge` ("The Edge package pins its button").
- [x] 8.3 Add e2e `e2e/extension-page-stores.spec.ts`. It reads visible text only and covers:
  - "The Edge install tab";
  - "A Chrome Web Store install opened in Edge" (context `userAgent` with `Edg/131`);
  - "Chrome and every other browser" (`?store=opera`, and `OPR/`);
  - "No script" (`javaScriptEnabled: false`);
  - "Edge's pin mode";
  - "Edge's usage mode";
  - "Edge's FAQ answer";
  - "Edge's pin mode in German";
  - "Edge's pin picture's name" (one exposed `role=img` in `#pin`);
  - "The Arabic Edge pin picture";
  - "The Arabic right-click figure";
  - "A left-to-right version keeps its figure";
  - "Edge before its id";
  - "The browsers answer in Chrome";
  - "The English head";
  - "No shift on pick" (a `PerformanceObserver` layout-shift sum of 0 after load at `?store=edge`);
  - axe with no violations at `?pinned=0&store=edge` and `?pinned=1&store=edge`, in English and Arabic;
  - no horizontal scroll at 320 px for `?pinned=0&store=edge`.

## 9. The G1/F2 section, store-aware

- [x] 9.1 Extend `extension-section.test.tsx`, citing "The section in Edge" and "Edge on a phone". With a fixture Edge id, the markup holds Edge's label, sentence, "Add to Edge" with Edge's URL in a new tab, "Opens Microsoft Edge Add-ons", the phone line and the "You have it" line, each in `.st-edge`. Without the id there is no `st-edge`, and the Chrome markup is unchanged.
- [x] 9.2 `ExtensionSection` renders `storeScript(false)` and builds Edge only with its id. `ExtensionSection` and `ExtensionStatus` keep `extensionId` and gain `edgeId`. `ExtensionStatus` uses `askExtensions`, calls `pickStore` on mount, and keeps the shared grid cell, so the height stays fixed. The section strings come from the store table. Verify 9.1, and that the existing section tests pass unedited.
- [x] 9.3 E2e on G1 with a `Edg/131` user agent, while Edge's id is empty: the section shows "Add to Chrome", and no `a` points to `microsoftedge.microsoft.com` ("Edge before its id").

## 10. Company pages (BL-140, BL-141)

- [x] 10.1 Add to `e2e/company-pages.spec.ts`:
  - "The head names no browser": `/privacy-policy` `title`, meta description, `og:description` and `twitter:description`;
  - "The terms name no browser": `/terms-of-use` main text, `title` and description, with no whole-word Chrome, Edge or Opera.

  The Privacy description changed in 5.2. Verify the privacy test fails on `main`'s description and passes now.

## 11. Approved edits to existing tests

- [x] 11.1 After the owner says yes, edit only the tests in the list at the top, plus any found in 12.1 and approved, to the new name, title and visible-only reads. Verify each passes and asserts the same behaviour under its new strings.

## 12. Gates and docs

- [ ] 12.1 Run `pnpm fix`, then `pnpm test`, then `openspec validate --all --no-interactive`. Any test that fails only on the new strings goes to the owner (task 11). Everything else gets fixed.
- [ ] 12.2 Run the On-page SEO guide's pre-publish checklist for X1 (English and two translations) and A3. Record the result in the PR.
- [ ] 12.3 `docs/backlog.md`: delete BL-80, BL-140 and BL-141, which ship here. Add anything new found along the way.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review`). Fix the findings, and log what stays in `docs/backlog.md`.
- `/opsx:archive`. Then edit `openspec/specs/extension-site/spec.md`:
  - Public Interface: the store table, `EDGE_EXTENSION_ID`, `knownIds`, `askExtensions`, `pickStore`, `storeScript`, `ByStore`, the `edge` copy block, and the `store`/`dir` props;
  - Behavior: drop "the right-click figure stays left to right (BL-80)"; describe `data-ext-store`;
  - Edge Cases: Opera picks Chrome until T28; Edge has no store link before its id.
- Tracker: T27 stays `In progress`. Add a Log line: store-aware X1 and section, Edge drawings, browser-neutral X1 head, browsers FAQ, BL-80, BL-140 and BL-141. Next step: the Edge go-live once the CRX id is known (design D8).
- Push, open the PR to `main`, and turn on auto-merge with a merge commit.
- Owner: submit the Edge package. Then read the CRX id in Partner Center's Extension overview and send it for the go-live edit.

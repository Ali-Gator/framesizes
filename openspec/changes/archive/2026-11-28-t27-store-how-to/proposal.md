# Proposal

## Why

Phase 1 (`t27-edge-extension`, archived 2026-11-28) built the Edge package. Its install tab opens X1 with `?pinned=0|1&store=edge`, but the site ignores `store`. So an Edge visitor sees Chrome's toolbar drawing, "Pin it to your toolbar", the Chrome Web Store link, and "Chrome Extension" in the tab title. An Edge reviewer lands on that same page. This is phase 2 of T27. It makes X1 and the G1/F2 extension section store-aware, so the Edge listing can be submitted.

The canvas was approved on 2026-11-28 (CLAUDE.md "Design source", T27, https://claude.ai/artifact/ME5xpbNULkbax27e4vRqqp, version 1795865330-7c91), with these answers:

- **Q1 A.** `?store=` decides first, then the browser's own brands, then Chrome.
- **Q2 A.** Edge's UI labels stay in English in all 28 languages.
- **Q3 B.** X1's title and description name no browser, and the SEO guide changes first.
- **Q4 A.** The Opera boards are drawn but not built; they wait for T28.

## What Changes

- **Store picking.** An inline script runs before the first paint, like `MODE_SCRIPT`, and sets `<html data-ext-store>`. On X1 it reads `?store=edge` first, then the browser. On G1 and F2 it reads the browser only.
  - The browser counts as Edge when `navigator.userAgentData.brands` holds "Microsoft Edge", or when the user agent holds `Edg/`, `EdgA/` or `EdgiOS/`.
  - Everything else is Chrome: Opera, `?store=opera`, Firefox, Safari, no JS, and the server HTML that crawlers get.
  - Every line that differs by store sits in the HTML once per store, inside the same parent, and CSS shows the picked one. The in/cm toggle works the same way. No layout shift.
- **X1 for Edge**, with the canvas's Main board as the copy source:
  - the answer ("…in Edge's toolbar…");
  - the pin text (the puzzle piece (1) at the top right of Edge, then the pin (2)). The pin `h2`, "Show how to pin it" and "Already pinned?" stay shared with Chrome: Edge 158 pins like Chrome (checked 2026-11-28, canvas version 1795872373-3de2);
  - the FAQ "no button" answer;
  - a new Edge pin picture (board d2) and a new Edge right-click figure (e2), each with its own accessible name. On `/ar/` both are mirrored (d4, e4).
  - All of this comes in all 28 languages. Edge's own labels stay in English and are marked `lang="en"`: "Extensions", "Manage Extensions", "Get extensions for Microsoft Edge", "Copy image" and "Inspect".
- **Every store, the live Chrome page included.** The FAQ "Which browsers does it run on?" becomes "Chrome 116 or newer, or Microsoft Edge 116 or newer, on a computer. It opens in the browser's side panel.", in all 28 languages.
- **Browser-neutral head (Q3 B, owner, 2026-11-28).**
  - The title becomes "Gallery Wall Layout Generator Extension" (53 characters with the suffix).
  - The description becomes "How to use the Gallery Wall Layout Generator browser extension: plan a wall in the side panel, or right-click a shop print to hang it at true size." (149 characters).
  - The page name, the crumb and the footer label become "Browser extension".
  - The card question becomes "How do I use the gallery wall browser extension?".
  - The `h1` does not change.
  - All 27 translated titles, descriptions and crumb names change the same way. The SEO guide's X1 rows change first: the Per-page map, the description, the link map row and the X1 paragraph.
- **The status asks every known id.** `ModeSwitch` and `ExtensionStatus` ask each set store id, Chrome's first. A store table in `lib/extension.ts` holds each store's id, store page URL and link labels.
- **The Edge go-live is gated.** The Edge store id is not known yet. The Partner Center URL holds the product GUID, not the 32-letter extension id.
  - While `EDGE_EXTENSION_ID` is `""`, X1's Edge body has no store link, and the section on G1/F2 in Edge stays the Chrome section.
  - A later one-line go-live sets the id. That same edit names the Edge store on the About page and in the Refund Policy, as phase 1 planned.
  - The Edge variants are built and unit-tested now, with a fixture id.
- **The section for Edge, once the Edge id is set:** "Edge extension", "…in Edge's side panel…", "Add to Edge" with "Opens Microsoft Edge Add-ons", "You have it. Click its button in Edge's toolbar…", and on a phone "This extension runs in Edge on a computer. Open this page on a computer to add it."
- **Backlog folded in.**
  - **BL-80:** Chrome's right-click figure is mirrored on `/ar/` (board e4).
  - **BL-140:** the Privacy Policy's meta description names no browser. The guide's A3 row changes first.
  - **BL-141:** a Terms of Use scenario and an e2e check that the page names no browser.
- **Humanizer** runs over every new or changed visitor-facing text. The head values are excepted, because they come from the guide.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `extension-site`:
  - store picking;
  - the Edge lines and drawings;
  - Edge's English labels;
  - the right-click figure follows the page's direction;
  - the browsers FAQ;
  - a head and page name that name no browser;
  - Edge's id gate;
  - the store link, the pin picture, the RTL pin picture, the pin poll and the three section requirements become per store.
- `seo-base`: the X1 breadcrumb scenario and the not-live title scenario take the new name and title.
- `company-pages`: the Privacy Policy's head names no browser (BL-140), and the Terms of Use name no browser (BL-141).

## Impact

- **Code:**
  - `apps/web/src/lib/extension.ts` (store table, `EDGE_EXTENSION_ID`);
  - `apps/web/src/components/extension/`: a new `store.ts` (pick rule and `STORE_SCRIPT`), `how-to.tsx`, `mode-switch.tsx`, `store-link.tsx`, `extension-section.tsx`, `extension-status.tsx`, `pin-picture.tsx` (Edge drawing, LTR and RTL), `figures.tsx` (Edge menu, RTL menu), `copy/*.ts` (all 28);
  - `apps/web/src/app/extensions/gallery-wall-layout-generator/extension.css`, `apps/web/src/app/widgets.css`;
  - `apps/web/src/lib/site-map.ts` (X1 name, card and SEO values; A3 description).
- **Tests:** new unit and e2e cases.
- **Existing tests to edit (owner approval needed):**
  - `e2e/extension-page.spec.ts:195` (title), `:215` and `:222` (breadcrumb name), and `:76–98` (it reads the server HTML's `textContent`, which now holds the hidden Edge lines);
  - `e2e/extension-page-locales.spec.ts:109` and `:123` (count visible pin pictures), and `:157` and `:159` (the Spanish crumb name);
  - `apps/web/src/lib/__tests__/seo.test.ts:190` (title) and `:200` (the crumb name);
  - `apps/web/src/lib/__tests__/site-map.test.ts:150` (the full title);
  - any other test that fails only because of the new name, title or hidden store lines. Apply lists each one before editing it.
- **Docs outside the repo:** the On-page SEO guide (the X1 rows and A3). The Tracker gets updated at archive: T27 stays In progress until the Edge go-live.
- **Not in scope:**
  - Opera (T28);
  - Edge's store id, store link, "Add to Edge" on G1/F2, and the About and Refund wording (the Edge go-live);
  - the A4 Refund meta description, which names Chrome and changes at the Edge go-live with the Refund body;
  - the extension package. Phase 1 already sends `&store=edge`, so no new version is needed.
- **Owner steps:** submit the Edge package once this is live. Then send the CRX id from Partner Center's Extension overview for the go-live edit.

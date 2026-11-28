# Design

## Context

- X1's body is `ExtensionHowTo` (`components/extension/how-to.tsx`). The English route and the 27 `[locale]` routes render it from `copy/<code>.ts`.
  - `MODE_SCRIPT` sets `<html data-ext-mode>` before paint, and `extension.css` shows one mode.
  - The same both-in-the-HTML pattern drives the units: `<U>` renders `.u-in` and `.u-cm`, and `<html data-unit>` picks one.
- `ModeSwitch` polls `askExtension(EXTENSION_ID)`. `ExtensionStatus`, in the G1/F2 section, asks once. Both take one id.
- `PinPicture` draws Chrome LTR or RTL from `ChromeLabels` (Chromium `.xtb` wording). `MenuFigure` draws Chrome's context menu, always LTR (BL-80).
- The Edge package (phase 1) opens `…?pinned=0|1&store=edge`. Its Edge store id is unknown: the Partner Center URL the owner has carries the product GUID `5b8c0119-…`, not the 32-letter CRX id.
- Approved canvas: https://claude.ai/artifact/ME5xpbNULkbax27e4vRqqp, version 1795865330-7c91.
  - The copy comes from board 0 (Main).
  - Pages: a1/b1, a2/b2 and the phone boards.
  - Drawings: d2 and d4 (Edge pin picture, LTR and RTL), e2 and e4 (Edge right-click figure, LTR and RTL; e4 also stands for Chrome's BL-80 mirror).
  - Section: f2, g2 and h2.
  - Opera boards (c*, d3, e3, f3, g3, h3) are not built (Q4 A).
- Microsoft Edge is installed on this Mac. Playwright can launch it (`channel: "msedge"`), but it cannot see or click browser UI (toolbar, flyout, context menu).

## Goals / Non-Goals

**Goals:**

- One server HTML per route, with Chrome visible to crawlers and no-JS visitors. Edge is picked before paint, with no layout shift and no hydration mismatch.
- Adding Opera in T28 means one table row, one copy block and the drawings, with no new mechanism.
- The Edge go-live becomes a one-line id edit plus the About and Refund wording.

**Non-Goals:**

- A server-side or edge-runtime store pick. The site is static, and `?store=` must not split the canonical page.
- Translating Edge's UI labels (Q2 A).
- Any change to `apps/extension`.

## Decisions

### D1. A pure pick rule, mirrored by an inline script

`components/extension/store.ts` exports:

- `type SiteStore = "chrome" | "edge"`;
- `pickStore({ search, brands, ua })`;
- `storeScript(fromQuery: boolean)`.

The rule runs in this order:

1. With `fromQuery`, `new URLSearchParams(search).get("store") === "edge"` picks Edge.
2. Otherwise Edge when `navigator.userAgentData?.brands` has `brand === "Microsoft Edge"`, or `/\bEdg(A|iOS)?\//` matches the user agent.
3. Everything else is Chrome. Opera's `OPR/` and the legacy `Edge/` token do not match.

The script writes `document.documentElement.dataset.extStore`, wrapped in `try`, the same way as `MODE_SCRIPT` and `UNIT_SCRIPT`.

- X1 renders `storeScript(true)` next to `MODE_SCRIPT`.
- `ExtensionSection` renders `storeScript(false)` as its first child.

A client-side visit runs no inline script, so `ModeSwitch` and `ExtensionStatus` call `pickStore` on mount and set the attribute too. A move from X1 `?store=edge` to G1 then lands on the browser's store.

A unit test runs the script string with stubbed `location`, `navigator` and `document` over one table of inputs, and compares it with `pickStore`. That keeps the two from drifting.

Rejected:

- **Client state after hydration.** Edge visitors would see Chrome first, then a swap: a layout shift and a flash on the install tab.
- **Swapping text with a script before hydration.** React would find text it did not render, report a hydration mismatch and re-render the root.
- **`?store=` as its own URL.** It would need its own canonical, and X1 must stay one page.

### D2. Variants sit side by side, and CSS hides the other store

`ByStore({ chrome, edge, stores })` renders `<… class="st-chrome">` followed by `<… class="st-edge">`. It tells three cases apart:

- `edge` is `undefined`, equal to `chrome`, or Edge is not in `stores`: it renders `chrome` once, with no class.
- `edge` is `null`, meaning Edge shows nothing here: it renders `chrome` as `.st-chrome` and no Edge element.
- Otherwise: both variants. `extension.css` (X1) and `widgets.css` (section) hold:

```css
html:not([data-ext-store="edge"]) .st-edge,
html[data-ext-store="edge"] .st-chrome {
  display: none !important;
}
```

`display: none` keeps the hidden store out of the accessibility tree, so one pin picture is exposed, as the RTL requirement asks. Ids and `tabIndex` stay on shared parents: the `h2` holds two spans and keeps one `tabIndex`. A variant never carries an id.

Swapping happens at the smallest element: spans inside the one `h2`, the one answer `p`, the one FAQ answer, and one SVG per store. The heading outline and the "paragraph after the h1" stay as they are.

`stores` is the list of stores the surface builds:

- X1 always builds `["chrome", "edge"]`, because Edge's how-to needs no id.
- The section builds Edge only when `EDGE_EXTENSION_ID` is set.

Until then the section in Edge has no `.st-chrome` to hide and shows Chrome, as the "Edge appears only with its store id" requirement says.

X1's store link is the `null` case. Before Edge's id exists it renders Chrome's link as `.st-chrome` and nothing for Edge, so an Edge visitor, an Edge reviewer included, sees no store link at all.

Rejected:

- **`<template>` per store.** It needs a script to clone in before paint, which runs into the hydration problem from D1.
- **One `data-ext-store` per element.** React does not render the attribute, and hydration would flag it. `<html>` is already exempt for `data-unit` and `data-ext-mode`.

### D3. The store table lives in `lib/extension.ts`

The table maps each store to its `id`, its `pageUrl(id)` (`chromewebstore.google.com/detail/<id>`, `microsoftedge.microsoft.com/addons/detail/<id>`) and its English labels for the section.

- `EXTENSION_ID`, `storeUrl` and `STORE_URL` keep their names, because they are cited and go-live tested.
- `EDGE_EXTENSION_ID = ""` is new.
- `knownIds()` returns the set ids, Chrome's first.
- `askExtensions(ids)` asks each id in parallel, each with `askExtension`'s 1 s timeout. It resolves to installed when any reply says installed, with `pinned` true when any installed reply says pinned. It never rejects.

`ModeSwitch`, `ExtensionStatus`, `ExtensionSection` and `StoreLink` keep their `extensionId` prop (Chrome's) and gain `edgeId`, which defaults to `EDGE_EXTENSION_ID`. Each builds its ids from those two, Chrome's first, so the existing tests that pass `extensionId` keep working unedited. The pin poll runs only when at least one id is set.

### D4. The copy shape and the translations

`ExtensionCopy` gains `edge`:

```ts
edge: {
  answer: string;
  store: string; // "Get it from Microsoft Edge Add-ons"
  showPin: string;
  pin: {
    title: string;
    text: string;
    picture: string;
    pinned: string;
  }
  faqButton: string;
}
```

`faq.items[2].a` becomes the new browsers answer, shared by both stores. The `satisfies ExtensionCopy` check makes `tsc` refuse a language that is missing a key.

- `rich()` adds "Show in toolbar" to the English tokens, so Edge's label stays English and is marked `lang="en"`.
- The right-click step's `figure` label is already browser-neutral and serves both stores.
- The section's strings are English only, because G1 and F2 are English, and live in the table (D3).

Claude writes the 27 translations, as T25 did:

- the Edge block;
- the browsers answer;
- the new `seo.title`, `seo.description` and `crumbs.page`.

Each translation keeps the English sense and names no browser in its head values. It passes the existing head limits: at most 60 characters with the suffix, at most 160 for the description, and unique across languages. The humanizer runs on the English. Translations follow the humanized English.

### D5. The Edge drawings

- `PinPicture` gains `store`. Edge gets its own `EdgePinPicture`, LTR and RTL, drawn from boards d2 and d4 on the same 880 × 400 viewBox. It uses English labels and a Segoe-style font stack, and its numbers and mark are never mirrored.
- `MenuFigure` gains `store` and `dir`:
  - Edge uses the e2 style: a rounded card with an icon for each row.
  - `dir="rtl"` mirrors both stores' figures, as board e4 shows: the print sits on the right, the menu opens to its left, and the rows run `row-reverse` with their text kept LTR. This is the fix for BL-80.
- The figures' text sizes follow the canvas. The grey-line shrink rule from `PinPicture` does not apply to Edge, because its labels are fixed English.

### D6. The canvas's from-memory labels are checked first

The canvas marks Edge's flyout and menu labels as drawn from memory:

- the eye's "Show in toolbar";
- "Open Microsoft Edge Add-ons";
- "Manage extensions";
- the horizontal ellipsis;
- the RTL behaviour.

Playwright cannot capture browser chrome. Before any figure code, the owner opens Edge's Extensions flyout and a context menu on an image, with `apps/extension/dist-edge` loaded unpacked. Claude takes a computer-use screenshot (Edge is a read-tier app) and compares it with the boards.

- A matching label goes in as drawn.
- A different label changes the approved copy, so it goes to the owner first, with the canvas updated to match.

The same session checks the pin poll in real Edge. Playwright `channel: "msedge"` loads `dist-edge`, then opens X1 `?pinned=0&store=edge`. `chrome.action.getUserSettings()` must answer without error, and the status reply must carry `pinned: false`.

The manifest has no `key`, so the unpacked build's id is neither Chrome's nor the future Edge one. The check sends the status message to the id read from `context.serviceWorkers()`, not to `knownIds()`.

### D7. Head values and the SEO guide

The SEO guide changes first, in its X1 rows:

- the Per-page map title;
- the description table;
- the link map's "X1 Chrome extension";
- the X1 paragraph. It says the breadcrumb is "Browser extension", the title names no browser so one page serves every store, and the server HTML keeps Chrome's wording.

The guide's A3 row changes in the same pass (BL-140). After that, `site-map.ts` takes the X1 `name`, `card.question`, `seo.title`, `seo.description` and `lastModified`, and the A3 `description`.

The keyword column keeps "gallery wall layout generator chrome extension", because research wins on keywords. "Chrome" stays in the server HTML body: the answer, the pin text and the FAQ.

The OG image draws the `h1`, which does not change. The `og:title` follows the title.

### D8. The Edge go-live is a later edit

Once the owner reads the CRX id in Partner Center (Extension overview, after the package uploads), one edit does the go-live:

> The owner submitted the Edge package on 2026-11-28, before this change shipped, and sent the CRX id `jahhnnkmhgjkcmnkkclanlhlngmjhfmn` (matches `^[a-p]{32}$`). The listing was still in review, so this change keeps `EDGE_EXTENSION_ID = ""`. The go-live sets it once the listing is published. Tests use a different fixture id.

- it sets `EDGE_EXTENSION_ID`;
- it changes the About page's extension section and the Refund Policy body and A4 description, so they name both stores;
- it bumps `lastModified`.

This is the T27 row's last step in the Tracker, not a backlog item. Nothing in this change needs the id: the Edge variants are tested with a fixture id passed as a prop, as `StoreLink` and `ExtensionSection` already take `extensionId`.

## Risks / Trade-offs

- **[Risk] Crawlers read the hidden Edge lines next to the Chrome ones.** Mitigation: the lines are short and sit in the same elements. Real Edge users see them, so it is not cloaking, and the head and the visible text stay Chrome's.
- **[Risk] Existing tests read `textContent`, which now joins the two variants.** Mitigation: the proposal lists them for the owner's approval before any edit. New assertions read visible text (`innerText`, or Playwright `toBeVisible`/`toHaveText`).
- **[Risk] Edge's user agent changes, or a Chromium fork claims the "Microsoft Edge" brand.** Mitigation: the brands check comes first. A wrong pick only swaps the drawing, and `?store=edge` from the package always wins on the install tab.
- **[Risk] `getUserSettings` behaves differently in Edge.** Mitigation: the D6 check. If Edge cannot report `isOnToolbar`, its install tab still works, because "Already in the toolbar? See how to use it" leaves pin mode. That case goes in the backlog.
- **[Trade-off] Before the Edge go-live, the section in Edge says "Add to Chrome".** A Chrome Web Store install works in Edge, so this is today's behaviour, and it ends with the id edit.
- **[Trade-off] An Edge-package user's pin poll never resolves before the go-live,** because no Edge id is asked. The link out of pin mode covers it. The owner submits after this ships, so the review starts on the Edge body.

## Migration Plan

Ship as one PR. Vercel deploys on merge. Rollback is a revert: the Chrome page then returns to today's text, and the Edge package's `&store=edge` is ignored again.

After the deploy:

1. Check X1 in real Edge with no query.
2. Check X1 in Chrome with `?store=edge`.
3. The owner submits the Edge package (listing kit, step 8) and later sends the CRX id for D8.

## Open Questions

- Do Edge's real labels match the boards? D6 settles this before the figure code. A mismatch changes only the label strings, not the approach.

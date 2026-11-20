# Design

## Context

See `proposal.md` for the scope and the SEO row. What the code gives this change today:

- **The site map** (`apps/web/src/lib/site-map.ts`) types a page as live with `seo`, or not live with no `seo`. `livePage(id)` throws for a page that is not live. The sitemap, header, footer, `RelatedTools`, `PageLink` and `IfLive` all filter on `live`. `checkSiteMap` checks head limits on live pages only.
- **Head tags** come from `pageMetadata(livePage)` in `apps/web/src/lib/seo.ts`. `breadcrumbJsonLd` always builds two items, Home and the page. Each page passes its visible `Breadcrumbs` items by hand.
- **The unit script** in `layout.tsx` is the house pattern for state that must be on `<html>` before the first paint: a tiny inline script in a `try`.
- **The extension** (T23) opens `HOW_TO?pinned=0|1` on install and answers `{ type: "status" }` with `{ installed: true, pinned, version }` for pages on `https://framesizes.app/*` (`externally_connectable`). It needs no change.
- **Chrome on a web page:** `chrome.runtime.sendMessage(extensionId, message, callback)` exists only when some installed extension lists the page's origin in `externally_connectable`. With no such extension `chrome.runtime` is missing. With the wrong id the callback runs with `chrome.runtime.lastError` set.
- **The extension id** is unknown until the listing is uploaded. An unpacked build's id is derived from its folder path, so it differs between machines and from the store's.
- **e2e** runs the site build on localhost in Chromium. `e2e/extension.spec.ts` already maps `framesizes.app` to a local route when it needs that origin.

## Goals / Non-Goals

**Goals:**

- One gate: the store id. Setting it and flipping X1 to live is the whole go-live edit.
- The page is fully built and tested now, while unreachable from any link and out of the index.
- G1 and F2 render exactly as today until go-live.
- No layout shift from the mode switch, the phone line or the installed swap.

**Non-Goals:**

- A real-extension handshake in the site's e2e. The extension side is covered by T23's `onMessageExternal` unit tests.
- Sync, analytics, an install button on the page (the store link is plain text, shown only once live), or a `SoftwareApplication` markup.
- The v2 drawn sample room (BL-51 owns it). Figures here draw the current flat room and switch with BL-51.

## Decisions

### 1. A page may carry head values before it is live

`SitePage` becomes `live: true` with `seo`, or `live: false` with an optional `seo`. A new `builtPage(id)` returns a page that has `seo`, live or not, and throws otherwise. `livePage` stays as it is for pages that must be live.

- `checkSiteMap` walks every page with `seo`, so X1's title (60) and description (146) are checked now, and also for uniqueness against the live pages.
- `pageMetadata` takes a built page. When it is not live it adds `robots: { index: false }`. Nothing else in the metadata differs, so going live removes `noindex` with no other edit.
- Everything that lists pages still filters on `live`, so X1 stays out of the sitemap, header, footer, `RelatedTools` and `PageLink` with no change to them.

**Alternatives:**

- `notFound()` until live. This makes the page untestable until go-live.
- `live` computed from an env var. The SEO guide forbids index rules driven by an env var. It would also make the e2e build differ from production.
- Keeping X1 out of `PAGES` until go-live. Its head values would then live somewhere else and go unchecked.

### 2. One gate constant

`apps/web/src/lib/extension.ts` holds `EXTENSION_ID = ""`, `STORE_URL` (built from the id), and the status client. A unit test ties the two together: X1 is live exactly when `EXTENSION_ID` is set, and a set id matches `^[a-p]{32}$`. That makes go-live a single edit (id, `live: true`, `lastModified`) that the suite refuses to half-do.

### 3. The status client

`askExtension(id, timeout = 1000)` resolves to `{ installed: false }` or `{ installed: true, pinned }`.

- It never rejects. It sends nothing for an empty id.
- It guards a missing `chrome.runtime.sendMessage`, a throw, `lastError`, a malformed reply and a timeout.
- It takes the id as a parameter, so unit tests (jsdom, a fake `chrome`) cover every branch. Before go-live the pages pass the empty id and never ask.

The islands that ask (`ModeSwitch`, `ExtensionStatus`) take the id as a prop, and the pages pass `EXTENSION_ID`. Their asking behaviour (the 2 s poll, the switch, the swap, the height) is unit-tested in jsdom with a fake `chrome` and fake timers, the way `url-state.test.tsx` renders hooks. e2e covers what needs no extension: the modes from the URL, the links, focus, axe and the 320 px fit. The site holds no test hook.

**Alternative:** load the real extension in the site's e2e. Rejected, because the unpacked id never equals the site's constant. Also rejected: a window-level test id override, because it is test code in production.

### 4. Modes are CSS on `<html>`, set before paint

- **Server HTML:** the page renders both the pin section and the usage sections. The server HTML is usage mode: the pin section carries `ext-pin` and is hidden by CSS unless `<html data-ext-mode="pin">` is set or it is the `:target`.
- **Before paint:** a five-line inline script at the top of the page, written like the unit script, reads `location.hash` (`#pin`/`#usage`), then `?pinned=0`, and sets `data-ext-mode`.
- **`ModeSwitch`**, a small client island, then:
  - On `hashchange`, sets the mode and focuses the shown section's `h2` (`tabIndex={-1}`).
  - Only when the mode came from `?pinned=0` with no hash, polls `askExtension` every 2 s while `document.visibilityState` is `visible`. It switches to usage and stops on `pinned: true`.
- **One `h1`:** the `h1`, breadcrumbs and answer paragraph sit above both modes, so every mode keeps the one `h1` from the site map. The pin section's heading is an `h2`.

**Alternative:** render the mode on the client only. Rejected: it causes a flash of the wrong mode and an empty server HTML for search.

### 5. Breadcrumb trail built once

`breadcrumbTrail(page)` in `seo.ts` returns Home, then the hub head (by `HUBS`) when the page is not that head and the head is not `/`, then the page. `breadcrumbJsonLd` maps it to `ListItem`s. The X1 page renders the same trail with `Breadcrumbs`. G1 and F2 keep passing their two items, and the scenario "A hub head keeps two crumbs" pins that they still match.

### 6. The extension section: one server component, one client island

`ExtensionSection` (in `apps/web/src/components/extension/`) renders nothing unless X1 is live. G1 and F2 place it right after their widget.

- **Phone vs computer:** the card's call to action holds both the "Add to Chrome" link and the phone line. `@media (hover: none) and (pointer: coarse)` shows one.
- **Installed:** a client island, `ExtensionStatus`, asks once after hydration. The CTA line and the "You have it…" line share one grid cell, and the hidden one is `visibility: hidden`, so the cell is always as tall as the taller line.

**Alternative:** detect the platform from the user agent on the client. Rejected: it flashes and shifts.

The page's store link is a tiny server component, `StoreLink` (with a `pages` prop like `RelatedTools`), that renders the text link only while X1 is live. The unit test renders it both ways.

### 7. Figures drawn from the engine, no images

- **Section picture and step 1** ("Plan a gallery wall"): server-rendered SVG of the current sample room (`DEMO_ROOM`, `SOFA_PARTS`), with frames from the engine.
- **Step 2:** the context menu in HTML and CSS.
- **Step 3:** frames with numbered nail dots from G1's default layout.
- **Pin picture:** one inline SVG of a generic browser toolbar with the Extensions menu open. It is ported from board m and its colours are tokenised.

All of them are `role="img"` with an `aria-label`.

### 8. Social image

`opengraph-image.tsx` follows G1's: the h1 in large type, the sample room with one print above the sofa, and the logo. The alt is "A print hanging above a sofa at true size in the Gallery Wall Layout Generator side panel". Its size and weight stay within the guide's limits.

### 9. Differences from the approved canvas

Each follows from the SEO row or from facts the canvas left open:

| Canvas                                                         | Here                                                                                     | Why                                                                             |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| h1 "Gallery Wall Layout Generator is ready" / "… is installed" | One h1 "How to Use the Gallery Wall Layout Generator" in both modes                      | SEO row; one h1 from the site map (seo-base)                                    |
| Pin mode has its own h1                                        | Pin heading is the h2 "Pin it to your toolbar"                                           | One h1 per page                                                                 |
| No JS shows pin mode                                           | No JS shows usage mode; `#pin` still works through `:target`                             | The indexed HTML must be the how-to; installing an extension needs JS anyway    |
| Breadcrumb Home › Gallery Wall Layout Generator                | Home › Gallery wall › Chrome extension                                                   | The guide's breadcrumb rule for a page under a hub head                         |
| framesizes.app row: "[open question]"                          | "Can ask whether the extension is installed and pinned. Nothing else is shared."         | What T23 shipped: no host permission, no sync                                   |
| No store link on the page (dPage: no install button)           | Once live, a plain text link "Get it from the Chrome Web Store" after the answer         | The page is indexed for an install-minded query; decided by the user 2026-11-20 |
| Installed card: "open the side panel" as a button              | A text line: "You have it. Click its button in Chrome's toolbar to open the side panel." | A web page cannot open the side panel                                           |
| Figures use the v2 drawn room                                  | Current flat room                                                                        | BL-51 owns the room swap for F2, G1 and these figures together                  |

## Risks / Trade-offs

- **[A built, not-live page is reachable by URL]** → It is `noindex` with no inbound links. Only someone who types the URL sees it, and what they see is correct.
- **[Polling every 2 s]** → Only in pin mode from the query, only while the tab is visible, and it stops on the first pinned reply. It is one `sendMessage` each time, which the worker answers from `getUserSettings`.
- **[The Chrome Web Store URL shape changes]** → `STORE_URL` is built in one place, and go-live confirms it against the real listing.
- **[The live check is only unit-tested before go-live]** → Its logic sits in the islands, tested with a fake `chrome`. Go-live adds one manual check: install the store build, open the page at `?pinned=0`, pin it, and watch it switch.
- **[The guide's suggestions are edited before acceptance]** → The values live once, in the site map entry. The implementer re-reads the guide row at apply and copies it if it changed.

## Migration Plan

- **Now:** ship with X1 not live and `EXTENSION_ID` empty. G1 and F2 HTML is unchanged, and X1 answers 200 with `noindex`.
- **Go-live (a later `t24-go-live` change, once the listing is approved):**
  - Set `EXTENSION_ID`, set X1 `live: true` and its `lastModified`.
  - Add the section's h2 to the G1 and F2 outline e2e tests (approved 2026-11-20).
  - Run the deferred pre-publish checks.
- **Rollback:** set X1 back to `live: false`. That brings back `noindex`, hides the section and removes all links in one edit.

## Open Questions

- **The Web Store detail URL:** `chromewebstore.google.com/detail/<slug>/<id>` or `/detail/<id>`. Answered at go-live from the real listing. Either way, only `STORE_URL` changes.

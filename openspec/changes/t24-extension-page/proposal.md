# Proposal

## Why

Tracker row T24 is the site's side of the Chrome extension "Gallery Wall Layout Generator" (T23, done 2026-11-20). The extension already opens `https://framesizes.app/extensions/gallery-wall-layout-generator?pinned=0|1` on install and answers `{ "type": "status" }` from framesizes.app, but that page does not exist yet, and G1 and F2 say nothing about the extension. This change builds the page and the reusable extension section from the approved canvas (https://claude.ai/artifact/WUq26q5aNBxfiKUTYcaCwv, 2026-11-17: boards i, j, l and m, notes dSec, dOutline, dPage, dPin and dSeo).

The extension's Web Store listing is not uploaded yet, so its item id is unknown. The Tracker says the page "goes live once the listing is approved". So this change builds everything behind one gate: the page is built but not live, and the section stays hidden, until a small go-live change sets the store id.

## What Changes

- **SEO-guide row (X1).** The guide had no row for this page. It now has one, laid as six suggestions on 2026-11-20 and accepted by the user the same day. The guide stays the source: a later edit there wins.

  | Field                     | Value                                                                                                                                                    |
  | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | URL                       | `/extensions/gallery-wall-layout-generator`                                                                                                              |
  | Head keyword              | gallery wall layout generator chrome extension (no Semrush data; navigational)                                                                           |
  | Title                     | Gallery Wall Layout Generator Chrome Extension (60 with " \| Frame Sizes")                                                                               |
  | H1                        | How to Use the Gallery Wall Layout Generator                                                                                                             |
  | Description               | How to use the Gallery Wall Layout Generator Chrome extension: plan a wall in the side panel, or right-click a shop print to hang it at true size. (146) |
  | Secondary keywords        | none researched; h2s by task                                                                                                                             |
  | Breadcrumb                | Home › Gallery wall › Chrome extension                                                                                                                   |
  | JSON-LD                   | `BreadcrumbList` only (no `SoftwareApplication`: no ratings)                                                                                             |
  | Must link outside its hub | F2 (G1 is its hub head)                                                                                                                                  |

  The title adds "Chrome Extension" and the h1 names the how-to, so the page does not compete with G1, which keeps "gallery wall layout generator" as a secondary key.

- **The site map** gains page X1 ("Chrome extension", hub Gallery wall) with its head values, not live. A page may now carry head values before it is live, and the head limits are checked on every page that has them.
- **A built page that is not live** renders with a robots `noindex` and is left out of the sitemap, the header, the footer, Related tools and every `PageLink`. The same edit that sets `live: true` removes the `noindex`.
- **Breadcrumbs** gain the hub head between Home and the page when the page is not its hub's head and the hub head is not the home page. Today that is only X1 (Home › Gallery wall › Chrome extension). G1 and F2 keep two items.
- **The extension page (boards l and m):**
  - The server HTML is the how-to (usage mode): breadcrumbs, the h1, a two-sentence answer, then "What you can do in the side panel" (three steps: plan a gallery wall, try a print from a shop, get the nail marks), "Use your own wall" (the five scale references), "What the extension can see" (three rows in plain words), "Questions" (three) and "Related tools".
  - Pin mode: an h2 section, "Pin it to your toolbar", with one browser picture marking the puzzle piece (1) and the pin (2), and "Already pinned? See how to use it". The page shows it first, and hides the usage sections, when the URL says `?pinned=0` or `#pin`. `?pinned=1` or `#usage` shows usage mode, and a hash beats the query. Usage mode has "Don't see the button? Show how to pin it".
  - While in pin mode from the query, the page asks the extension every 2 seconds whether it is pinned and switches to usage mode once it is.
  - Once live, one plain text link after the answer, "Get it from the Chrome Web Store" (new tab), for searchers who don't have the extension yet (decided 2026-11-20). No install button: the canvas ruled one out. Before go-live the page has no store link.
  - Canonical without the query.
  - Its own 1200 × 630 social image.
- **The extension section (boards i and j)** under the widget on G1 and F2, while X1 is live:
  - One card: the extension icon, "Chrome extension", the h2 "Plan on any shop's page", one sentence, "Add to Chrome" (the store page, new tab) and a small picture of the panel.
  - On a touch phone, the button is replaced by "Chrome on phones doesn't run extensions. Open this page on a computer to add it."
  - When the extension answers that it is installed, the line and button swap for a short "You have it" line at the same height.
- **The status client:** one small module that sends `{ "type": "status" }` to the extension id and resolves to installed and pinned, or to not installed when Chrome has no `chrome.runtime`, the call throws or sets `lastError`, or the id is empty.
- **Backlog:** no open item sits in this area. BL-51 (the richer sample room) stays open; the page and section draw the current sample room, and BL-51 updates them with F2 and G1.
- **Left out:** sync with the site, analytics events, an install button on the page, and a `SoftwareApplication` markup.

## Capabilities

### New Capabilities

- `extension-site`: what framesizes.app shows about the Chrome extension: the after-install page with its two modes and live pin check, the extension section on G1 and F2, and the status client.

### Modified Capabilities

- `seo-base`:
  - **Modified requirements:** "The site map is the single record of pages" (20 pages; head values allowed before a page is live and checked wherever they exist) and "Pages below the home page carry breadcrumbs" (the hub head in between).
  - **New requirement:** a built page that is not live stays out of the index and unlinked.
- `gallery-wall-planner`: **modified requirement** "The planner page follows the approved outline": the extension section's h2 after the widget while the extension page is live.
- `frames-on-wall`: **modified requirement** "The page follows the approved outline": the same.

## Impact

- **Code (`apps/web`):**
  - `src/lib/site-map.ts`: X1, head values on a not-live page, `checkSiteMap` over every page with head values.
  - `src/lib/seo.ts`: `pageMetadata` adds `noindex` for a not-live page; `breadcrumbJsonLd` and a shared trail builder add the hub head.
  - New `src/lib/extension.ts`: the store id (empty until go-live), the store URL and the status client.
  - New `src/app/extensions/gallery-wall-layout-generator/`: `page.tsx`, `opengraph-image.tsx`, the mode script and `extension.css`.
  - New `src/components/extension/`: the extension section, the pin picture and the mode switch.
  - `src/app/gallery-wall-planner/page.tsx` and `src/app/frame-sizes-on-wall/page.tsx`: the section under the widget.
- **`apps/extension`:** no change. It already opens the page and answers the status message.
- **Dependencies:** none new.
- **Existing tests:**
  - `apps/web/src/lib/__tests__/site-map.test.ts` changes now: 19 pages become 20 (approved by the user on 2026-11-20).
  - The G1 and F2 outline e2e tests (`e2e/gallery-wall-content.spec.ts`, `e2e/frames-on-wall-content.spec.ts`) gain the section's h2 at go-live, when the section appears (approved the same day). In this change they run unedited.
- **SEO pre-publish checklist:** split by the gate.
  - Checked before archive, on the built HTML: one h1, title and description equal to the row, the canonical, the nine social tags with the page's own image, the `BreadcrumbList` matching the visible trail, and unique alts.
  - Checked at go-live: 200 without `noindex`, the sitemap and footer entries, the card in G1's Related tools, the Rich Results Test and the preview card.
- **Copy:** the page and section text go through the `humanizer:humanizer` skill before commit, keeping every number and the guide's keywords.
- **Tracker:** T24 stays `In progress` at archive; the log line names what shipped and that go-live waits for the store id.
- **Go-live (a later `t24-go-live` change, after the listing is approved):** set the store id, set X1 `live: true` with its `lastModified`, add the section's h2 to the two outline e2e tests, run the deferred checklist items, and confirm the store URL format.

# Proposal

## Why

The site is live, so every check that waited on DNS can run now, and most of them have. The new tool pages also have small defects a visitor sees. From a frame, F5 says "A 4x6 print fits" in a 10 × 15 cm frame, though the print is bigger than the frame. While a field is in error, F5's drawing shows the 11x14 example next to fields that say 10 × 15 cm. Its "Print" label spills out of a narrow opening. Its formula figure reads inches only. On F4, F5 and F6, switching units can flip a near-standard answer to "Not a standard size". F6 says a pre-cut mat is "cut for your poster" when it is cut for a nearby standard print. The Russian X1's `BreadcrumbList` names the English page as the current one. In forced colors, nothing but bold type marks the current hub. A unit-test walker reads 3,600 e2e build files on every commit.

## What Changes

- **F5 names only a print that fits (BL-120, BL-116).** From a frame, the largest print matches a standard or metric size at most ⅟₁₆ in bigger and at most ⅜ in smaller. Anything else is custom, with the size below named as the print that fits. The tolerant match stays everywhere else (F4, F5 from a print, frame matches).
- **F5 hides the drawing while a field is in error (BL-121).** This is the pattern F6 already uses. The example still shows before the first find.
- **No label spills out of a narrow opening (BL-122).** A container query on `.mt-open` hides `.mt-art` when the opening is narrower or shorter than the label. It covers F5's "Print" and F6's "Poster".
- **F5's formula figure is labelled in both units (BL-117).** The server-rendered figure's `aria-label` reads "11 by 14 in (27.9 by 35.6 cm)". The widget's label stays in the visitor's unit.
- **A unit switch never changes the answer (BL-126).** F6, F5 and F4 keep each field's parsed inches after a switch and answer from them until the visitor edits that field. The field text is rewritten as before.
- **F6 names the print a pre-cut mat is cut for (BL-127).** When the mat's print is not the poster, the card reads "Sold with a mat cut for a 16x20 print. It overlaps your poster by ⅛ / ⅛ in.", and the help line gives the ¼ in overlap only for a mat cut to order. The new copy was humanized in triage, which left it unchanged.
- **A translated X1's last crumb is its own URL (BL-104).** `how-to.tsx` passes `localizedPath(locale, …)` for the last crumb, so the `BreadcrumbList`'s last `item` is the canonical URL. The visible links and English pages do not change.
- **The current hub is underlined in forced colors (BL-31).** `hub-nav.tsx` adds `forced-colors:underline` to the current link.
- **The citation walker skips every `.next*` folder (BL-35).** This is a test edit the user approved.
- **Checks on the live site.** 18 items passed or were done during triage and are deleted from the backlog in this change's diff (see Members).

## Members

| Id                                                  | Title                                                        | Lane                                                                                                                                        |
| --------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| BL-120                                              | F5 reverse answer calls a too-big print "fits"               | B, decided: no bigger, ⅟₁₆ in slack (Decision 1)                                                                                            |
| BL-116                                              | F5 reverse names a print a little bigger than the largest    | B, same decision; ships with BL-120                                                                                                         |
| BL-121                                              | F5 drawing shows the 11x14 example while a field is in error | B, decided: hide it, like F6 (Decision 2)                                                                                                   |
| BL-122                                              | F5 "Print" label spills out of a narrow opening              | A                                                                                                                                           |
| BL-117                                              | F5 formula figure's label in inches only                     | A                                                                                                                                           |
| BL-126                                              | F6 unit switch can flip a near-tolerance answer              | A (F5 and F4 siblings included)                                                                                                             |
| BL-127                                              | F6 pre-cut card copy for a near-standard poster              | B, decided: name the real overlap (Decision 3)                                                                                              |
| BL-104                                              | A translated X1's last breadcrumb item is the English URL    | A                                                                                                                                           |
| BL-31                                               | Current hub in forced-colors mode                            | A (gate met: the gallery hub is live)                                                                                                       |
| BL-35                                               | Citation walker walks the e2e build folders                  | B, decided: test edit approved (Decision 4)                                                                                                 |
| BL-3                                                | `www` and `http` redirect in one hop                         | retire: three of four take one hop; `http://www` takes two because Vercel's HTTPS upgrade can't be turned off, and `.app` is HSTS-preloaded |
| BL-5                                                | PostHog authorized URLs                                      | retire: set to `https://framesizes.app` in triage, with the user's yes                                                                      |
| BL-13, BL-39, BL-89, BL-107, BL-112, BL-123, BL-132 | Preview cards for home, F2, F3, F4, F5, F6, F7               | retire: every og tag is present, every image 200 PNG 1200×630, and each shows what its bullet names                                         |
| BL-14, BL-40, BL-90, BL-108, BL-113, BL-124, BL-133 | Rich Results Test for home, F2–F7                            | retire: BreadcrumbList valid on F2–F7 in Google's test; home's WebSite + Organization pass validator.schema.org with 0 errors               |
| BL-97                                               | Check PostHog stores no IP for site events                   | retire: 578 events in 7 days, 0 with `$ip`, 0 with `$geoip_*`                                                                               |
| BL-103                                              | Check X1's live head on production                           | retire: Rich Results pass, card passes, one hop from `www.`, trailing slash and `http://`, no `X-Robots-Tag`                                |

**Batch size:** nine fixes plus 18 retires. The user raised the ceiling for this batch to "7 or maybe 8-9" small fixes and asked to fold in the checks (2026-11-26). The checks do not count toward the nine.

**Parked (status corrected in `docs/backlog.md`):**

- BL-109, BL-114, BL-125, BL-134 (URL Inspection for F4–F7): Search Console is the owner's, and Google has to crawl the pages first.
- BL-100, BL-101, BL-102 (extension checks on production): 0.1.1 is live in the store. Each now needs a person with desktop Chrome, and BL-101 also needs a touch phone.
- BL-135 (F7 PNG on an iPhone): needs an iOS Safari run on an iPhone, or the iOS Simulator with a test image in Photos.

**Investigated, not taken (stay open):** BL-74 (unused `ScalePreview` prop) and BL-105 (English install e2e on a non-English Mac). Both are small existing-test edits, and they fall outside the nine. BL-105's investigator recommends skipping the test unless the extension reports an English UI language, rather than the bullet's regex.

**Base branch:** `origin/main` at `54cc35c` (PR #46 merged, T8). The batch branch is `backlog-8`. No new ids. `_Next id:_` stays at BL-136.

**Approved test edits:** one, approved by the user on 2026-11-26.

- `scripts/__tests__/spec-citations.test.ts:551`: the `walk()` skip changes from "named `node_modules` or exactly `.next`" to "named `node_modules` or starting `.next`". No assertion changes (Decision 4).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `size-engine`: from a frame, the largest print matches no size more than ⅟₁₆ in bigger.
- `frame-mat-calculator`: the reverse answer names no too-big print. No drawing shows while a field is marked. A print name shows only where it fits. The formula figure is labelled in both units. A unit switch keeps the answer.
- `poster-frame-sizes`: a unit switch keeps the answer. A near-standard pre-cut mat names its print and real overlap. The poster name shows only where it fits.
- `measure-frame`: a unit switch keeps the answer.
- `extension-site`: a translated version's last `BreadcrumbList` item is its own canonical URL.
- `site-shell`: the current hub is underlined in forced colors.

## Impact

- BL-120 and BL-116: `packages/sizes/src/mat.ts` (from-frame `printMatch` only, plus the doc comment) and `packages/sizes/src/measure.ts` (a "no bigger" match beside the private `closest`/`bounds`; `identifyFrame` unchanged). `answer.ts` already renders the custom branch. Near-square frames say "No standard print is this small" more often, because 8x8 is the smallest square; the user accepted this with Decision 1.
- BL-121: `apps/web/src/components/frame-mat/frame-mat.tsx` (`draw` and the `<MatDrawing>` render).
- BL-122: `apps/web/src/app/frame-mat-calculator/frame-mat.css` (`.mt-open`, `.mt-art`), shared by F6's `poster-drawing.tsx`.
- BL-117: `apps/web/src/components/frame-mat/answer.ts` (`drawing` label in both units for the page figure) and `apps/web/src/app/frame-mat-calculator/page.tsx`.
- BL-126: `apps/web/src/components/poster-frames/state.ts`, `apps/web/src/components/frame-mat/state.ts` and `apps/web/src/components/measure-frame/state.ts`. Each gets an optional per-field kept length that `type`, `preset`, `swap` and `reset` clear and the answer reads. The key stays out of `INITIAL`, so no whole-state `toEqual` changes.
- BL-127: `apps/web/src/components/poster-frames/answer.ts` (`forP`, `how`, the pre-cut note). The mat's print may be exposed on `MattedFrame` in `packages/sizes/src/poster.ts`.
- BL-104: `apps/web/src/components/extension/how-to.tsx` (the `crumbs` map).
- BL-31: `apps/web/src/components/site/hub-nav.tsx`.
- BL-35: `scripts/__tests__/spec-citations.test.ts`.
- Spec Edge Cases in `openspec/specs/frame-mat-calculator/spec.md` lose the BL-116 and BL-117 lines at archive. They are not requirements, so the deltas cannot reach them.
- `docs/backlog.md`: the 10 fixed bullets (nine fixes; BL-116 ships with BL-120) and 18 retired bullets are deleted.

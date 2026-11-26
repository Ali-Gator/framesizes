# Design

## Context

This is a backlog batch planned on 2026-11-26, the first triage since the domain went live. Every `gated — DNS live` item was rechecked against the live site. Ten candidate fixes and three groups of checks were investigated read-only in parallel. Approved designs in play: F5 (https://claude.ai/artifact/PjZ5GizsgyTKMvx6nAfdRp) and F6 (https://claude.ai/artifact/43JSmmnTJHtj55WBpR84qT). No fix needs a new board. BL-121 follows F6's existing error state, and BL-122 follows F1's "drop a label that has no room".

## Lanes

| Id                                | Lane   | Why                                                                                                                                                                                                                  |
| --------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BL-120                            | B      | Which print "fits" from a frame is a product rule (Decision 1).                                                                                                                                                      |
| BL-116                            | B      | Same defect as BL-120; it was gated on this very decision.                                                                                                                                                           |
| BL-121                            | B      | Three ways to draw an error state (Decision 2).                                                                                                                                                                      |
| BL-122                            | A      | Hide, as F1 does; a CSS container query, no new copy or board.                                                                                                                                                       |
| BL-117                            | A      | Both-units label in F6's "X in (Y cm)" form; only the server figure changes.                                                                                                                                         |
| BL-126                            | A      | Keep parsed inches until an edit; the bullet names the fix, and F5 and F4 share the cause.                                                                                                                           |
| BL-127                            | B      | New visitor copy (Decision 3).                                                                                                                                                                                       |
| BL-104                            | A      | Matches English pages, where the last crumb already carries its own URL. Covered by a new e2e test, so no existing test is edited.                                                                                   |
| BL-31                             | A      | Gate met (G1 is live, the nav shows). The underline shows only in forced colors, so no design question.                                                                                                              |
| BL-35                             | B      | An existing-test edit (Decision 4).                                                                                                                                                                                  |
| BL-3                              | retire | Three of four paths take one hop. `http://www` takes two because Vercel's HTTPS 308 "can't be disabled", runs before the domain redirect, and the `.app` TLD is HSTS-preloaded anyway.                               |
| BL-5                              | retire | `app_urls` set to `["https://framesizes.app"]` on project 344498 during triage, with the user's yes.                                                                                                                 |
| BL-13, 39, 89, 107, 112, 123, 132 | retire | Live og tags complete. Images are 200, image/png, 1200×630, and each shows what its bullet names (saved in the triage scratchpad).                                                                                   |
| BL-14, 40, 90, 108, 113, 124, 133 | retire | Google's Rich Results Test ran with no CAPTCHA: BreadcrumbList valid on F2–F7. On home, the test says "No items detected", as expected for WebSite/Organization; validator.schema.org shows 0 errors and 0 warnings. |
| BL-97                             | retire | 7 days, 578 events (401 from framesizes.app): 0 with `$ip`, 0 with `$geoip_*`. Project has `anonymize_ips: true` and `cookieless_server_hash_mode: 2`.                                                               |
| BL-103                            | retire | X1 Rich Results pass (en and ru), the card passes, one hop from `www.`, trailing slash and `http://`, no `X-Robots-Tag`.                                                                                             |
| BL-109, 114, 125, 134             | D      | URL Inspection needs the owner's Search Console, and Google has to crawl first (F4 went live 11-22, F7 today).                                                                                                       |
| BL-100, 101, 102                  | D      | 0.1.1 is live in the store. Each needs a person in desktop Chrome; BL-101 also needs a touch phone.                                                                                                                  |
| BL-135                            | D      | Needs iOS Safari: an iPhone, or the iOS Simulator with a test image in Photos.                                                                                                                                       |

## Changes per member

**BL-120 / BL-116.** At `packages/sizes/src/mat.ts:113`, the from-frame `printMatch` uses `matched()`, which calls F4's two-sided ±⅜ in `identifyFrame`. Replace it with a one-sided match: a standard or metric size at most ⅟₁₆ in bigger and at most ⅜ in smaller on each side, else custom with `below`/`above` from the existing `bounds()`. `closest`, `match` and `bounds` in `packages/sizes/src/measure.ts` are private. Export a small "no bigger" variant next to them, or add an option, and keep `identifyFrame` unchanged for F4. The from-print direction and every `frameMatch` stay tolerant. `apps/web/src/components/frame-mat/answer.ts` already renders the custom branch: the `below` card, "The next print up, X, is too big…" and "No standard print is this small." `below` comes from the US catalog, so a rejected metric match falls back to a US size. That is accepted. Update `mat.ts`'s doc comment at `:102-107`.

**BL-121.** `apps/web/src/components/frame-mat/frame-mat.tsx:53-57`: when `outcome` has errors after a find, `draw` is `undefined`, and `:252` renders `<MatDrawing>` only when `draw` is set. Before the first find, with no error, the example still shows, so `drawing(undefined)` and its tests stay as they are. The scenario name "The drawing before an answer" is kept, so its anchor and the `{@link}`s at `answer.test.ts:283` and `frame-mat.test.tsx:64` don't change.

**BL-122.** `apps/web/src/app/frame-mat-calculator/frame-mat.css:479-493`: `.mt-open` gets `container-type: size` and `.mt-art` hides under an `@container` rule. The rule fires when the box is narrower than the longest label ("Poster" at 13px semibold, about 46px plus a little room) or shorter than its 16px line. The repo already uses `@container` in `widgets.css`. F6's `poster-drawing.tsx` uses the same classes, so it gets the fix with no code change. jsdom can't measure layout, so the test is an e2e that reads the label's computed `display`/visibility and its box against `.mt-open`.

**BL-117.** `apps/web/src/components/frame-mat/answer.ts`: `drawing()` gains a both-units mode for its label, or the page builds the label and passes it to a `label` override on `MatDrawing`, next to the existing `caption` override. The fix lane picks whichever touches fewer tests. The form is F6's `inBoth`/`lenBoth` (`poster-frames/answer.ts:339-340`), written "11 by 14 in (27.9 by 35.6 cm)". `page.tsx:316-318` uses it. The widget's label stays in the visitor's unit (spec Behavior line 89), so `answer.test.ts:299-301` and `frame-mat.test.tsx:75-77` pass unedited.

**BL-126.** All three reducers rewrite a field's text on `unit` and answer from that text. Add an optional per-field kept length in inches: `unit` sets it from the parsed value before the rewrite, and every action that changes the field's value clears it: `type`, and also `preset`, `swap` and `reset` in F5, and `eighth`, `blur` and `reset` in F4. The answer reads the kept length when present, else the text. Files:

- `apps/web/src/components/poster-frames/state.ts` (`write :42`, `type :61-62`, `unit :65-73`, `poster() :95-117`)
- `apps/web/src/components/frame-mat/state.ts` (`write :43-44`, `outcome :72-90`, `type`, `preset`, `swap`, `reset`, `unit :157-165`)
- `apps/web/src/components/measure-frame/state.ts` (`read :78-86`, `type`, `eighth`, `blur`, `unit :183-195`, `reset :204`)

The key stays optional and out of every `INITIAL`, so the whole-state `toEqual`s (F6 `state.test.ts:11`, F5 `:27`, F4 `:20`) and the `typed()` helpers pass unedited. Side effect, accepted: the field shows "41.6" while the answer uses 41.59 cm, and retyping "41.6" can change the answer. F5's `swap` with a carried size in cm still rewrites rounded text. It is out of scope, and the review may log it.

**BL-127.** `apps/web/src/components/poster-frames/answer.ts`. `describe` works out the print the pre-cut mat is cut for, from the data the engine returns: frame − 2 × border + 2 × `MAT_OVERLAP` on each side, turned for landscape. It names that print as F5 names a print (`writeSize(…, "search")`, e.g. "16x20"). Exposing it on `MattedFrame` in `packages/sizes/src/poster.ts:72-80, 116-117` is cleaner; if the fix lane does that, it adds a size-engine Public Interface note at archive. When the print differs from the poster:

- the card note reads "Sold with a mat cut for a 16x20 print. It overlaps your poster by ⅛ / ⅛ in." (sides / top, the border's pair format, "0.3 / 0.2 cm" in cm);
- the help line `how` (`:232`) gives the ¼ in sentence as "A mat cut to order overlaps the poster by ¼ in on each side." when some card is cut to order, and drops it when every card is pre-cut.

Answers where every mat matches the poster keep today's copy, so the 11x17 and 24x36 scenarios and `answer.test.ts:156-240` pass unedited. The copy is final: `humanizer:humanizer` ran over both strings in triage and left them unchanged.

**BL-104.** `apps/web/src/components/extension/how-to.tsx:75-79`: the last crumb's path becomes `localizedPath(locale, path)`. `localizedPath` comes from `@/lib/locales`, already imported, and returns the English path for the default locale. `breadcrumbJsonLd` and `Breadcrumbs` are unchanged, because the visible last crumb is not a link. Optionally note it in the `seo.ts:202-203` docstring. New e2e test in `e2e/extension-page-locales.spec.ts`. The existing "Spanish breadcrumbs" test stays unedited.

**BL-31.** `apps/web/src/components/site/hub-nav.tsx`: the current link's class gains `forced-colors:underline` (with `underline-offset-4`). Test it with an e2e under `page.emulateMedia({ forcedColors: "active" })` that reads `text-decoration-line` on the current and on another hub link.

**BL-35.** `scripts/__tests__/spec-citations.test.ts:551`: `name === ".next"` becomes `name.startsWith(".next")`. No assertion changes.

## Decisions

### Decision 1 — BL-120 / BL-116: which print "fits" from a frame

- **Options:**
  - (a) No bigger, with ⅟₁₆ in slack: at most ⅟₁₆ in bigger, at most ⅜ in smaller.
  - (b) Exactly no bigger.
  - (c) Keep ⅜ in either way; refuse only a print bigger than the frame, or a border at or below the overlap.
- **Trade-off:**
  - (b) refuses a cm visitor whose one-decimal numbers land a hair under a standard size. For example, 20.3 × 25.4 cm with 4.5 cm refuses the 5x7.
  - (c) fixes BL-120's absurd case but keeps "A 5x7 print fits" for a 4¾ × 6¾ in opening.
  - (a) closes both items and matches the t5 engine design note ("prints no bigger than the largest print"). It makes "No standard print is this small" more common for near-square frames, because 8x8 is the smallest square.
- **Recommendation:** (a).
- **Answer:** (a) no bigger, ⅟₁₆ in slack (user, 2026-11-26).

### Decision 2 — BL-121: the drawing while a field is in error

- **Options:**
  - (a) Hide it, as F6 does.
  - (b) Keep the last good drawing.
  - (c) Draw the entered frame.
- **Trade-off:**
  - (a) is the smallest change and the only option where the legend can't disagree with the fields; the drawing's column is empty meanwhile.
  - (b) needs new state, still shows an old border next to a refused one, and has nothing to show for a first find that errors.
  - (c) is undefined for a border that leaves no opening, and needs a new board.
- **Recommendation:** (a).
- **Answer:** (a) hide it, like F6 (user, 2026-11-26).

### Decision 3 — BL-127: copy for a pre-cut mat cut for a nearby print

- **Options:**
  - (a) Name the real overlap. Card: "Sold with a mat cut for a 16x20 print. It overlaps your poster by ⅛ / ⅛ in." Help line: "A mat cut to order overlaps the poster by ¼ in on each side."
  - (b) Bigger/smaller wording. Card: "Sold with a mat cut for a 16x20 print, a little smaller than your poster." Help line: "…by ¼ in on each side, less with a mat cut for a 16x20 print."
- **Trade-off:** (a) states the number that is false today. (b) is shorter but gives no overlap.
- **Recommendation:** (a).
- **Answer:** (a) name the real overlap (user, 2026-11-26). The copy shows only on a mismatch. The humanizer ran in triage and left it unchanged.

### Decision 4 — BL-35: edit the citation walker's test file

- **What changes:** `scripts/__tests__/spec-citations.test.ts:551`, the `walk()` folder skip, from exactly `.next` to any name starting `.next`. No assertion or expectation changes. The test file holds the walker, so the fix is a test edit.
- **Options:** (a) approve the edit; (b) leave BL-35 open.
- **Recommendation:** (a). Every pre-commit walks about 3,650 e2e build files for nothing.
- **Answer:** (a) approved (user, 2026-11-26).

## Corrections to the bullets

- **BL-120** lists `answer.ts` as a site. It needs no logic change, because its custom branch already renders the fallback.
- **BL-122** reads as F5-only. F6's `poster-drawing.tsx` shares `.mt-open`/`.mt-art` and has the same latent spill for a typed poster under about 6 in. One CSS rule covers both.
- **BL-126** names F6, with "F5 rounds the same way". F4 has the same defect (16⅜ × 20 inside flips through `identifyFrame`), so all three are fixed.
- **BL-3** asks for one hop everywhere. `http://www.framesizes.app` cannot get there on Vercel. It is accepted as retired, not failed.
- **BL-103's** "the t24-go-live deploy" gate and **BL-102's** "store review of 0.1.1" have both happened: PR #34 merged 2026-11-22, and the store serves 0.1.1, updated 2026-11-22.

## Risks / Trade-offs

- With BL-120, near-square frames with small borders answer "No standard print is this small" where an 8x8 once "fit". The user accepted this.
- With BL-126, the displayed cm value can read back to a different answer if retyped. This is inherent in keeping the typed length.
- With BL-122, the container-query threshold is a fixed pixel width for the longer label. A future longer label would need the threshold raised.

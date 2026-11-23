# Backlog

Open items only. When one ships, **delete it**: its history lives in git and in the spec or
change that fixed it. The detail belongs in the linked spec or source; this file is the lean
index of what's left, grouped by area. Every item has the same shape:

```
- **[BL-nn] <Title>** — <what to do + why it matters, 1–2 sentences>.
  _Refs:_ `<spec / change / source>` · _Status:_ open | gated — <blocker> | deferred — <trigger>
```

**Ids** are `BL-nn` and **monotonic**. A new item takes the number on the `_Next id:_` line
below and bumps that line by one. Do not use the highest id still in the file, because it falls
every time a shipped item is deleted. Ids are **never reused**, so a `BL-nn` in a commit message
or an archived change always means the same item.

_Next id:_ **BL-112**

**Status** is one of: **open** (actionable now), **gated — X** (blocked on a named decision or
dependency), **deferred — X** (waiting on purpose for a named trigger). Split a multi-part item
into separate items rather than letting one grow into a paragraph.

**What goes here and what doesn't.** Work that a named later change already owns goes in the
Tracker, not here. This file holds what no change owns yet: phase-review findings left unfixed,
and defects or gaps found along the way that are worth fixing later. CLAUDE.md ("Backlog") says
when to add and when to fold items in.

## Tooling

- **[BL-110] One eighths split in the size engine** — F4's `toEighths` in `state.ts` repeats the
  nearest-eighth rounding of `inEighths`; export the whole-and-eighths split from `units.ts` and use
  it in both, so a field and its written length can never round apart.
  _Refs:_ `apps/web/src/components/measure-frame/state.ts`, `packages/sizes/src/units.ts` · _Status:_ open — t4-measure-picture-frame review, 2026-11-22

- **[BL-75] One shared IndexedDB reader for the extension e2e** — `storedKeys`, `storedPrints` and the
  copies in `extension.spec.ts` and `extension-races.spec.ts` each open `gallery-wall` v1 with no
  `onerror`, so a schema bump missed in one copy hangs that test until timeout. Move them to one
  helper in `e2e/fixtures` (edits existing tests).
  _Refs:_ `e2e/extension-try.spec.ts`, `e2e/extension.spec.ts`, `e2e/extension-races.spec.ts` · _Status:_ open — backlog-5 review, 2026-11-20
- **[BL-99] One import from `../saved` in saved.test.ts** — backlog-7 added `checkStored` on a
  second import line; merge it into the first next time the file's tests may be edited.
  _Refs:_ `apps/web/src/components/actual-size/__tests__/saved.test.ts` · _Status:_ deferred — an approved edit there (backlog-7 review, 2026-11-22)
- **[BL-1] Drop the TypeScript 6 alias** — `typescript` is aliased to `@typescript/typescript6` only because
  typescript-eslint lacks TS 7 support; once it ships, depend on plain `typescript@^7` and remove
  `@typescript/native`, so `tsc`, Next.js and eslint use one compiler.
  _Refs:_ `package.json`, https://github.com/typescript-eslint/typescript-eslint/issues/10940 · _Status:_ deferred — a
  typescript-eslint release that supports TS 7.1
- **[BL-35] Citation walker walks the e2e build folders** — `scripts/__tests__/spec-citations.test.ts`
  skips only `node_modules` and `.next`, so after a local e2e run it walks `apps/web/.next-e2e` and
  `.next-analytics` on every `pnpm test:unit` and pre-commit; skip any folder starting `.next`. Edits an
  existing test, so it needs the owner's approval.
  _Refs:_ `scripts/__tests__/spec-citations.test.ts` · _Status:_ open — backlog-3 review, 2026-11-15

## Site

- **[BL-97] Check PostHog stores no IP for site events** — no browser setting can stop PostHog
  keeping the request IP (`ip: false` is a dead option, `$ip` is set server-side); the Privacy Policy's
  "no IP address" rests on cookieless mode plus the project's "Discard client IP data". Query
  stored events for `$ip` once real traffic exists (BL-86 pinned the "no location" half in code).
  _Refs:_ PostHog project 344498, `apps/web/src/app/privacy-policy/page.tsx` · _Status:_ gated — DNS live (backlog-7 triage, 2026-11-21)
- **[BL-87] Write the company-page widget exemption into CLAUDE.md** — CLAUDE.md says every page
  carries its own widget; A1–A5 carry none by design (t26 proposal and design). Add the exemption
  to its Conventions so a later review does not flag it.
  _Refs:_ `CLAUDE.md`, `openspec/specs/company-pages/spec.md` · _Status:_ open — owner's file, t26 review, 2026-11-21
- **[BL-49] G1 re-lays out the template on every drag move** — `dragFrame` calls `framesOf` per
  pointer move; pass the frames the view already has. No visible lag at 12 frames yet.
  _Refs:_ `apps/web/src/components/gallery-wall/state.ts` (`dragFrame`) · _Status:_ deferred — lag on a slow phone
- **[BL-51] Richer sample room on F2 and G1** — swap the flat sample room for the drawn v2 room
  (lamp light, baseboard, wood floor, cushioned sofa, plant) at the same 144 × 96 in geometry, so
  F2, G1 and the extension share one room. Adds plant and lamp-light colours to the design system.
  _Refs:_ T23 canvas https://claude.ai/artifact/WUq26q5aNBxfiKUTYcaCwv (boards "Sample room v2"), `apps/web/src/components/frames-on-wall/` · _Status:_ open — canvas approved 2026-11-17

- **[BL-2] Dark theme** — the site ships light only; `tokens.css` has a dark theme, but no page
  was designed or reviewed in it. Add `[data-theme="dark"]` / `prefers-color-scheme` tokens once
  a dark design is approved.
  _Refs:_ `openspec/specs/site-shell/spec.md`, `apps/web/src/app/globals.css` · _Status:_ deferred — a
  reviewed dark design
- **[BL-3] `www` and `http` redirect in one hop** — check that `www.framesizes.app` and
  `http://` answer one 308 to `https://framesizes.app` (guide checklist 1); the app cannot see it,
  the Vercel domain settings do.
  _Refs:_ On-page SEO guide, pre-publish checklist 1 · _Status:_ gated — DNS live
- **[BL-5] PostHog authorized URLs** — the project shows "No authorized URLs configured"; add
  `https://framesizes.app` so URL-based filters and the toolbar work.
  _Refs:_ PostHog project 344498, Settings › Project · _Status:_ gated — DNS live
- **[BL-9] Social-image font path from `process.cwd()`** — works because the image is prerendered
  from `apps/web` (the Next docs' own pattern); if the route ever renders at request time from
  another directory, `readFile` fails and every `og:image` answers 500. Resolve it from the module
  instead (T1 phase review).
  _Refs:_ `apps/web/src/app/opengraph-image.tsx` · _Status:_ deferred — the image becomes dynamic
- **[BL-13] Home page preview card in a chat app** — paste `https://framesizes.app` into a chat
  app or a preview tool and check the card shows the nested-size image (guide checklist 7); the
  image itself is checked, the live card is not.
  _Refs:_ On-page SEO guide, pre-publish checklist 7 · _Status:_ gated — DNS live
- **[BL-14] Rich Results Test for the home page** — run the live URL through the Rich Results Test
  and confirm `WebSite` and `Organization` validate (guide checklist 15).
  _Refs:_ `apps/web/src/lib/seo.ts`, pre-publish checklist 15 · _Status:_ gated — DNS live
- **[BL-39] F2 preview card in a chat app** — paste `https://framesizes.app/frame-sizes-on-wall` into a
  chat app or a preview tool and check the card shows the 16x20-above-a-sofa image (guide checklist 7).
  _Refs:_ `apps/web/src/app/frame-sizes-on-wall/opengraph-image.tsx`, pre-publish checklist 7 · _Status:_ gated — DNS live
- **[BL-40] Rich Results Test for F2** — run the live F2 URL through the Rich Results Test and confirm
  its `BreadcrumbList` validates (guide checklist 15).
  _Refs:_ `apps/web/src/lib/seo.ts` (`breadcrumbJsonLd`), pre-publish checklist 15 · _Status:_ gated — DNS live
- **[BL-89] F3 preview card in a chat app** — paste `https://framesizes.app/how-big-is-8x10` into a
  chat app or a preview tool and check the card shows the nested-sizes comparison image (guide checklist 7).
  _Refs:_ `apps/web/src/app/how-big-is-8x10/opengraph-image.tsx`, pre-publish checklist 7 · _Status:_ gated — DNS live
- **[BL-90] Rich Results Test for F3** — run the live F3 URL through the Rich Results Test and confirm
  its `BreadcrumbList` validates (guide checklist 15).
  _Refs:_ `apps/web/src/app/how-big-is-8x10/page.tsx`, pre-publish checklist 15 · _Status:_ gated — DNS live
- **[BL-107] Preview card for F4** — paste the live F4 URL into a chat app or a preview tool and check
  the card shows the 8x10 frame with its three measurements (guide checklist 7).
  _Refs:_ `apps/web/src/app/measure-picture-frame/opengraph-image.tsx`, pre-publish checklist 7 · _Status:_ gated — DNS live
- **[BL-108] Rich Results Test for F4** — run the live F4 URL through the Rich Results Test and confirm
  its `BreadcrumbList` validates (guide checklist 15).
  _Refs:_ `apps/web/src/app/measure-picture-frame/page.tsx`, pre-publish checklist 15 · _Status:_ gated — DNS live
- **[BL-109] URL Inspection for F4** — after launch, check `/measure-picture-frame` in Search Console's
  URL Inspection: indexed, with its own canonical (guide, after launch).
  _Refs:_ `apps/web/src/app/measure-picture-frame/page.tsx`, pre-publish checklist · _Status:_ gated — DNS live

- **[BL-31] Current hub in forced-colors mode** — the header's current hub link is marked by an inset
  shadow and bold text; forced colors drop the shadow, leaving bold only. Add an outline or underline in a
  system colour once a second hub makes the nav visible.
  _Refs:_ `apps/web/src/components/site/hub-nav.tsx` · _Status:_ gated — a second live hub (backlog-3 triage, 2026-11-15)
- **[BL-103] Check X1's live head on production** — Rich Results Test on the live X1 URL
  (BreadcrumbList valid), a preview card in a chat app, `www.` and trailing-slash URLs reach the
  canonical in one hop, and no `X-Robots-Tag` on the response.
  _Refs:_ `openspec/specs/extension-site/spec.md` · _Status:_ gated — the t24-go-live deploy

- **[BL-104] A translated X1's last breadcrumb item is the English URL** — on `/ru/…` the
  BreadcrumbList's last `item` is `https://framesizes.app/extensions/gallery-wall-layout-generator`,
  not the page's own canonical. Google reads the last item as the current page; point it at the
  translated URL (or drop its `item`) and amend the spec's "crumb links point to the English pages".
  _Refs:_ `openspec/specs/extension-site/spec.md#requirement-a-translated-versions-breadcrumbs-are-translated`, `apps/web/src/lib/seo.ts` · _Status:_ open — t24-go-live pre-publish check, 2026-11-22

## Chrome extension

- **[BL-82] A link's try is titled after the page, not the print** — on a link, `readPage` takes the
  title from the page's `h1` and the sizes from the whole page, so on a category grid the try reads
  "Wall Art" and lists every product's sizes. Prefer the link's text, `aria-label` or the image's alt.
  _Refs:_ `apps/extension/src/read-page.ts`, `apps/extension/src/background.ts` · _Status:_ gated — spec says "the page's title"; backlog-6 review, 2026-11-21
- **[BL-100] Check the pin switch on production** — install from the store with the button
  unpinned: the tab opens `?pinned=0`; pin it and the page switches to usage mode within 2 s with
  `pinned` gone from the address. The published extension talks only to `https://framesizes.app/*`.
  _Refs:_ `openspec/changes/archive/2026-11-22-t24-go-live/tasks.md` (After deploy) · _Status:_ gated — the t24-go-live deploy
- **[BL-101] Check G1's extension section on production** — with the extension installed, G1 reads
  "You have it…" at the same height as with it disabled; on a 390 px touch phone it shows "Chrome on
  phones doesn't run extensions…" and no "Add to Chrome".
  _Refs:_ `apps/web/src/components/extension/` · _Status:_ gated — the t24-go-live deploy
- **[BL-102] Check the install tab in Chrome's language** — upload 0.1.1
  (`pnpm --filter extension zip`); once the store passes it, a first install in Chrome set to
  Russian opens `/ru/…`, and in Filipino `/tl/…`.
  _Refs:_ `apps/extension/src/background.ts` `howToUrl` · _Status:_ gated — store review of 0.1.1
- **[BL-105] The English first-install e2e fails on a Mac set to another language** — Chromium
  ignores `--lang` on macOS, so since 0.1.1 the install tab follows the system language and "a first
  install opens one how-to tab with pinned=0" expects English. CI (Linux) passes; on darwin accept
  any `/<code>/` prefix. Edits an existing test, so it needs the owner's yes.
  _Refs:_ `e2e/extension.spec.ts` · _Status:_ open — t24-go-live review, 2026-11-22
- **[BL-57] Extension imports apps/web internals** — the panel and the tab import G1, F2 and the unit
  toggle from `apps/web/src` through an alias; a moved file or a new Next-only import breaks the
  extension build, caught only by e2e. Move the shared planner code under `packages/` when a third
  consumer appears (design decision 2).
  _Refs:_ `apps/extension/vite.config.ts`, `apps/extension/tsconfig.json` · _Status:_ deferred — a third consumer of G1's planner
- **[BL-62] The crop can race the side panel's reflow** — with no host permission most shop CDNs fail
  the fetch, so the picture is cut from `captureVisibleTab`; the capture and `readPage`'s box can land
  after `sidePanel.open` narrows the page, so the crop can be off. Measure what happens on real shops
  (task 9.2 ran on Society6, whose picture came from the fetch, so the crop is still unmeasured) and, if it bites, capture before opening or crop from the box measured after the reflow.
  _Refs:_ `apps/extension/src/background.ts` (`onMenuClick`), `apps/extension/src/read-page.ts` · _Status:_ open — t23-try-on-my-wall review, 2026-11-19
- **[BL-65] Every load reads every print picture** — `readWall` reads all `art:` Blobs on each load
  (twice when a journal is replayed), though a page reuses the URLs it holds. Read only the ids it has
  no URL for.
  _Refs:_ `apps/extension/src/saved-wall.ts` (`readWall`, `replayJournal`) · _Status:_ open — t23-try-on-my-wall review, 2026-11-19
- **[BL-66] A panel reopened right after a close can stay blank** — CI run 44619165253 failed
  `extension-try` "a print added just before the panel closes keeps its picture": the reopened panel
  drew its header but `load()` never settled, so `MAIN` stayed empty for 30 s. The rerun passed and 86
  local runs on macOS did not reproduce it. Suspect an IndexedDB transaction from the closing page
  holding the store; reproduce on Linux (Playwright Docker image) before changing code.
  _Refs:_ `apps/extension/src/use-wall.ts` (`load`, `flush`), `apps/extension/src/store.ts` (`transact`), `e2e/extension-try.spec.ts` · _Status:_ open — CI flake, 2026-11-20
- **[BL-69] The pin poll wakes every 2 s in a hidden tab** — it sends nothing while hidden but keeps
  its timer running; pausing on `visibilitychange` would stop the wake-ups. Polish.
  _Refs:_ `apps/web/src/components/extension/mode-switch.tsx` · _Status:_ open — t24 phase review, 2026-11-20
- **[BL-70] The pin picture is hard to read on a phone** — the 880-wide toolbar drawing scales to
  about 360 px, so its menu text is near 5 px. Pin mode is rare on a phone (extensions need a
  computer), so a cropped phone variant of the menu is optional. Translated labels are longer:
  the menu's grey lines shrink below 11.5 px in Hungarian, Greek and Russian (t25).
  _Refs:_ `apps/web/src/components/extension/pin-picture.tsx` · _Status:_ open — t24 apply, 2026-11-20
- **[BL-80] Mirrored right-click menu figure for Arabic** — `MenuFigure` draws Chrome's context menu
  left to right on `/ar/` too, like the pin picture before BL-76. Mirror it the same way.
  _Refs:_ `apps/web/src/components/extension/figures.tsx` (`MenuFigure`) · _Status:_ open — backlog-6 triage, 2026-11-21
- **[BL-78] `<html lang>` stays English on translated pages** — only X1's content wrapper carries
  `lang`/`dir`, so assistive tech announces the translated `<title>` and the document as English.
  Fix with a per-language root layout (route groups) when the shell is translated.
  _Refs:_ `apps/web/src/app/layout.tsx`, `components/extension/how-to.tsx` · _Status:_ deferred — whole-site translation (t25 review)
- **[BL-77] Translated OG image alt** — the 27 translated X1 versions re-export the English social
  image, so `og:image:alt` stays English; the OG font lacks most of their scripts. Translate the alt
  (and, with a wider font, the image text) when the whole site is translated.
  _Refs:_ `apps/web/src/app/[locale]/extensions/gallery-wall-layout-generator/opengraph-image.tsx` · _Status:_ deferred — whole-site translation

## Widgets

- **[BL-98] F3 chips a small screen cannot use** — on a 7 in tablet in the phone layout (Fire 7,
  600 × 1024) the tablet chips from 12.4 in give under 100 px per inch, so the touch slider ignores
  them; a tap fills "Other size" with 13 while no chip is pressed and the button still says "Use
  11 in" (a small laptop does the same with 32 in). Hide such chips or say why, with BL-94's note.
  _Refs:_ `apps/web/src/components/actual-size/check.tsx` (`Diagonals`) · _Status:_ open — backlog-7 review, 2026-11-22
- **[BL-94] F3 says nothing when a typed screen size is ignored** — a size whose scale the slider
  cannot show leaves the field holding it while the check uses the picked size or the guess; only the
  button's "Use N in" changes, and that change is not announced. Add a polite note beside the field,
  in space kept for it so nothing moves (t3 phase review).
  _Refs:_ `apps/web/src/components/actual-size/check.tsx` (`Diagonals`) · _Status:_ open
- **[BL-74] `ScalePreview` keeps an unused `unit` prop** — since BL-61 the preview holds both units
  and the `data-unit` CSS picks one, so the prop is never read; drop it from the type and from
  `frame-chart.tsx` and the unit test's call sites (an existing-test edit).
  _Refs:_ `apps/web/src/components/ui/scale-preview.tsx` · _Status:_ open — backlog-5 review, 2026-11-20
- **[BL-45] F2 drag should pass the wall to `snapFrame`** — F2's drag handler still snaps without
  the wall and clamps afterwards, so a snap that would leave the bounds is dropped instead of the
  nearest in-bounds one winning. Pass the wall when the F2 drag code is next touched.
  _Refs:_ `apps/web/src/components/frames-on-wall/state.ts` (`dragFrame`), size-engine spec ·
  _Status:_ deferred — next F2 drag change (t11-gallery-wall-engine review, 2026-11-16)
- **[BL-47] Gallery engine re-measures and re-validates** — `place()` measures every subtree again
  at each level, and `measureGroup` checks each hanger twice (once itself, once in `nailMarks`).
  Harmless at 12 frames; pass the measured sizes down if the cap grows.
  _Refs:_ `packages/sizes/src/gallery.ts` · _Status:_ deferred — a frame cap above 12
  (t11-gallery-wall-engine review, 2026-11-16)
- **[BL-46] Centring with only one side edge marked** — `usableArea` centres between a lone
  marked side edge and the far photo bound; the spec only says "between the marked side edges,
  else across the bounds". `photoEdges` always sets both today, so pin the rule once a one-sided
  mark is possible.
  _Refs:_ `packages/sizes/src/wall.ts` (`usableArea`), size-engine spec · _Status:_ gated — a
  one-sided wall mark (t11-gallery-wall-engine review, 2026-11-16)

- **[BL-15] Widget analytics events** — the chart sends no events (size picked, view, reference,
  unit); add them once a metrics plan names what to measure.
  _Refs:_ `apps/web/src/components/frame-chart/frame-chart.tsx` · _Status:_ deferred — a metrics plan
- **[BL-16] Related tools on a phone** — once the 18 launch pages are live the block is about
  2,400px of stacked cards on a phone; review its layout then.
  _Refs:_ `apps/web/src/components/frame-chart/related-tools.tsx` · _Status:_ gated — most related
  pages live
- **[BL-17] Recheck the 20x30 and 27x40 mat pairings** — both show "No mat", but about one listing
  in seven pairs them with a 16x24 / 24x36 mat (t2 `verification.md`); look again at the next data
  check.
  _Refs:_ `packages/sizes/src/frames.ts` · _Status:_ deferred — the next size data check
- **[BL-20] Phone picker in the design system** — backlog-1 added a phone block (stacked size
  rows, 44px filters, compact legend) to `widgets.css`, a diffable port of the design-system
  bundle; add the same variant to the design system's `SizeTable` and `SegmentedControl` so the
  port and its source agree again. backlog-3 widened the drift: forced-colors marks on the selected
  row, the radio dot and the checked `SegmentedControl` option, which the bundle lacks.
  _Refs:_ `apps/web/src/app/widgets.css`, https://claude.ai/artifact/SFXVU5PvBaHDquyEefVDd5 · _Status:_ open — found in backlog-1, 2026-11-13
- **[BL-25] Blank band where "Next to" hides on a phone** — in "All sizes" the hidden "Next to" row
  keeps its 52px on a phone (design.md hides it with `visibility`); collapsing it removes the gap but
  makes the table jump when the view changes.
  _Refs:_ `apps/web/src/components/frame-chart/frame-chart.tsx` · _Status:_ gated — the owner's call on the trade-off

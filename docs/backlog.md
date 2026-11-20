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

_Next id:_ **BL-66**

**Status** is one of: **open** (actionable now), **gated — X** (blocked on a named decision or
dependency), **deferred — X** (waiting on purpose for a named trigger). Split a multi-part item
into separate items rather than letting one grow into a paragraph.

**What goes here and what doesn't.** Work that a named later change already owns goes in the
Tracker, not here. This file holds what no change owns yet: phase-review findings left unfixed,
and defects or gaps found along the way that are worth fixing later. CLAUDE.md ("Backlog") says
when to add and when to fold items in.

## Tooling

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

- **[BL-61] F1 preview text says inches until hydration** — with cm stored, the scale preview's
  dimension labels, legend, reference sentence and "Next size up", and the all-sizes labels, render in
  inches until React hydrates (`useUnit` is "in" on the server). The SVG labels' layout depends on the
  unit, so `<U>` alone does not fit them. Found in backlog-4 triage (BL-33 was scoped to the toggle and
  the table).
  _Refs:_ `apps/web/src/components/ui/scale-preview.tsx`, `apps/web/src/components/ui/size-compare.tsx` · _Status:_ open — backlog-4 triage, 2026-11-19

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

- **[BL-31] Current hub in forced-colors mode** — the header's current hub link is marked by an inset
  shadow and bold text; forced colors drop the shadow, leaving bold only. Add an outline or underline in a
  system colour once a second hub makes the nav visible.
  _Refs:_ `apps/web/src/components/site/hub-nav.tsx` · _Status:_ gated — a second live hub (backlog-3 triage, 2026-11-15)

## Chrome extension

- **[BL-57] Extension imports apps/web internals** — the panel and the tab import G1, F2 and the unit
  toggle from `apps/web/src` through an alias; a moved file or a new Next-only import breaks the
  extension build, caught only by e2e. Move the shared planner code under `packages/` when a third
  consumer appears (design decision 2).
  _Refs:_ `apps/extension/vite.config.ts`, `apps/extension/tsconfig.json` · _Status:_ deferred — a third consumer of G1's planner
- **[BL-62] The crop can race the side panel's reflow** — with no host permission most shop CDNs fail
  the fetch, so the picture is cut from `captureVisibleTab`; the capture and `readPage`'s box can land
  after `sidePanel.open` narrows the page, so the crop can be off. Measure what happens on real shops
  (task 9.2) and, if it bites, capture before opening or crop from the box measured after the reflow.
  _Refs:_ `apps/extension/src/background.ts` (`onMenuClick`), `apps/extension/src/read-page.ts` · _Status:_ open — t23-try-on-my-wall review, 2026-11-19
- **[BL-63] A waiting button leaves the Tab order** — "Hang it on my wall" and "Add to my layout" use
  native `disabled`, so keyboard users never land on them to hear the reason (now a `role="status"`
  line). Consider `aria-disabled` with a no-op click so the reason is read on focus.
  _Refs:_ `apps/extension/src/try/size-step.tsx`, `apps/extension/src/try/hang-view.tsx` · _Status:_ open — t23-try-on-my-wall review, 2026-11-19
- **[BL-64] Two panels can share a print picture's URL** — `artUrlFor` caches object URLs by frame id;
  two panels in two windows adding prints with the same next id keep each other's picture. Key the
  cache by the Blob, not the id.
  _Refs:_ `apps/extension/src/use-wall.ts` (`artUrls`) · _Status:_ open — t23-try-on-my-wall review, 2026-11-19
- **[BL-65] Every load reads every print picture** — `readWall` reads all `art:` Blobs on each load
  (twice when a journal is replayed), though a page reuses the URLs it holds. Read only the ids it has
  no URL for.
  _Refs:_ `apps/extension/src/saved-wall.ts` (`readWall`, `replayJournal`) · _Status:_ open — t23-try-on-my-wall review, 2026-11-19

## Widgets

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
- **[BL-32] Selected row grows in forced colors** — the forced-colors `Highlight` border sits on the
  selected row only: on desktop it beats the cells' 1px collapsed borders and the rows below jump 1–2px
  on every ArrowDown; on a phone it squeezes the 68px row and moves the radio 2px left. Needs a mark
  that takes no layout space and still clears the focus ring.
  _Refs:_ `apps/web/src/app/widgets.css` (forced-colors block) · _Status:_ open — backlog-3 review, 2026-11-15

From Oleg directly (needs proposal first):

1. https://framesizes.app/gallery-wall-planner:
   1. Letters (A,B,C etc) are not good visible on the frames itself
   2. Need to rethink widget layout - many buttons/controls on the right side, empty space under Get nail marks. We need to rethink and simplify widget.

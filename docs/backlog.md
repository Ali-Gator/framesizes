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

_Next id:_ **BL-43**

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

- **[BL-33] Units toggle and table say inches until hydration** — with cm stored, the head script
  shows the static sections in cm before paint, but the Units toggle and the chart table render the
  server's "in" until React hydrates; on a slow load the page mixes units. Drive the toggle's checked
  look from `[data-unit]` too, or accept it.
  _Refs:_ `apps/web/src/components/site/unit-toggle.tsx`, `apps/web/src/lib/unit.ts` · _Status:_ open — backlog-3 review, 2026-11-15
- **[BL-41] F2 distance fields show inch digits until hydration** — the visualizer's field values
  (8, 32, 63) come from `useUnit`, "in" on the server, so a cm visitor sees them flip to 20, 81, 160
  when React hydrates; the unit suffix already uses `<U>`. Design decision 2 accepted this; fix with
  BL-33 if the same approach covers inputs.
  _Refs:_ `apps/web/src/components/frames-on-wall/frames-on-wall.tsx` · _Status:_ open — t7-frames-on-wall review, 2026-11-15
- **[BL-42] F2 decodes the whole photo to read its size** — `createImageBitmap` decodes the full
  image (about 190 MB for 48 MP) just for its width and height, which can kill an iOS tab; read the
  size from an `<img>` and `decode()`, which also applies EXIF orientation.
  _Refs:_ `apps/web/src/components/frames-on-wall/frames-on-wall.tsx` (`pickFile`) · _Status:_ open — t7-frames-on-wall review, 2026-11-15

- **[BL-2] Dark theme** — the site ships light only; `tokens.css` has a dark theme, but no page
  was designed or reviewed in it. Add `[data-theme="dark"]` / `prefers-color-scheme` tokens once
  a dark design is approved.
  _Refs:_ `openspec/specs/site-shell/spec.md`, `apps/web/src/app/globals.css` · _Status:_ deferred — a
  reviewed dark design
- **[BL-3] `www` and `http` redirect in one hop** — check that `www.framesizes.app` and
  `http://` answer one 308 to `https://framesizes.app` (guide checklist 1); the app cannot see it,
  the Vercel domain settings do.
  _Refs:_ On-page SEO guide, pre-publish checklist 1 · _Status:_ gated — DNS live
- **[BL-4] Menu button row at 320px** — with two or more live hubs the header shows a menu button;
  at 320px the lockup, unit toggle and button may wrap to two rows. Check and fix when the second
  hub ships.
  _Refs:_ `apps/web/src/components/site/site-header.tsx` · _Status:_ gated — a second live hub
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

## Widgets

- **[BL-36] New frame beside the selected one ignores marked wall edges** — `placeBeside` checks the
  right and left spots against the photo's bounds only, so on a photo with the wall's width marked a
  new frame can land past the wall's edge. Decide whether known edges should limit it too.
  _Refs:_ `packages/sizes/src/wall.ts` (`placeBeside`), size-engine spec · _Status:_ gated — product
  decision, t7-wall-engine review, 2026-11-15
- **[BL-37] Snapping can push a frame up to 1 in out of bounds** — `snapFrame` takes no wall, so a
  frame dragged against a bound can snap past it; clamp in the engine or in the F2 drag handler.
  _Refs:_ `packages/sizes/src/wall.ts` (`snapFrame`), `t7-frames-on-wall` · _Status:_ open —
  t7-wall-engine review, 2026-11-15
- **[BL-38] Snap tie order is not specified** — an exact tie between two snap targets goes to the
  first pair checked (bottom or left edge, then centre, then far edge); pin the order in the spec and a
  test if a visitor can see the difference.
  _Refs:_ `packages/sizes/src/wall.ts` (`snapAxis`) · _Status:_ open — t7-wall-engine review, 2026-11-15

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
- **[BL-34] Phone `scroll-margin-top` rebuilds the stage height** — the radio's margin repeats the
  184px floor, the 720:384 ratio, the `50svh - 73px` cap and the 16px preview sides by hand; a change to
  any of them lets focused rows slide under the pinned preview again. Define the height once as a
  custom property both rules use.
  _Refs:_ `apps/web/src/app/widgets.css` (phone block) · _Status:_ open — backlog-3 review, 2026-11-15

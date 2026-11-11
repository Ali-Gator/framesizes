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

_Next id:_ **BL-18**

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
- **[BL-6] Local e2e fails while a dev server runs** — `next dev` holds a lock on `apps/web/.next`,
  so `pnpm test:e2e` cannot start its own dev server on port 3100 while `pnpm dev` is up. Give the
  e2e servers their own `NEXT_DIST_DIR`, or say so in the README.
  _Refs:_ `playwright.config.ts` · _Status:_ open

## Site

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

## Widgets

- **[BL-10] Check the chart in iOS Safari** — the pinned preview, a tap anywhere on a table row
  (the label is stretched over the row; WebKit's positioning inside a `tr` is the risk) and the
  table's sideways scroll were checked only in Chromium emulation: this Mac has no full Xcode.
  _Refs:_ `apps/web/src/app/widgets.css`, `apps/web/src/components/ui/size-table.tsx` · _Status:_ open
- **[BL-11] The size table on a 360px phone** — the table keeps a 600px minimum and scrolls
  sideways inside its box on phones; consider dropping the second unit column under ~480px.
  _Refs:_ `apps/web/src/app/widgets.css` (`.fs-table`) · _Status:_ deferred — phone usage data
- **[BL-12] Six common sizes scroll sideways on phones** — the one-SVG drawing keeps a 720px
  minimum so its labels line up; on phones it scrolls in its own box. A phone layout (two rows)
  would need two drawings at one scale.
  _Refs:_ `apps/web/src/components/frame-chart/common-sizes.tsx` · _Status:_ open
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

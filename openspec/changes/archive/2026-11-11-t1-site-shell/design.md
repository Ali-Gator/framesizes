# Design

## Context

See `proposal.md` for the motivation. What shapes the approach:

- The stack is fixed by T0: pnpm workspace, Next.js 16.4 App Router (static rendering), React 19, TypeScript strict, Tailwind v4, Vitest (Node environment), Playwright, Vercel. `apps/web/AGENTS.md` requires reading the bundled docs under `node_modules/next/dist/docs/` before writing Next code; the decisions below were checked against them.
- The approved design (`docs/home-page-design.md`) and the design system (tokens, component guidelines, `bundle.css` as the value reference) fix the look. The On-page SEO guide fixes every head value.
- Only one of the 19 launch pages is live after this change and after T2. The shell must still behave correctly when the second hub ships, without being reworked.
- Every requirement needs a citing test (constitution). Playwright specs count, and several requirements here are provable only in the browser or on the built HTML.

The home page is delivered in two changes. This one (T1) builds what all pages share. `t2-frame-size-chart` adds `packages/sizes` (the size engine), the chart widget and the page's content, and depends on this change being merged.

## Goals / Non-Goals

**Goals:**

- One place for page facts (the site map registry) that the header, footer, sitemap, head tags and links all read.
- All content and head tags in the server HTML; client JavaScript only where a visitor interacts (unit toggle, menu button).
- No new runtime dependency beyond `posthog-js`.

**Non-Goals:**

- Dark theme (see Decisions), breadcrumbs and `BreadcrumbList` (first non-home page), `Article` markup (G4), ad and affiliate slots (T21).
- Design-system components the shell does not use (`NumberField`, `Select`, `UploadDrop`, `QualityBadge`, …); each arrives with the first page that needs it.
- Host redirects (`www`, `http`) and Search Console set-up: Vercel domain settings and Tracker row T22. Trailing-slash redirects are in scope (decision 12 turns off the framework's own).
- Head values for the 18 pages that are not live: each page's own change copies its row from the guide.

## Decisions

### 1. Tokens in `globals.css`, components in Tailwind utilities

Copy the light-theme colour, radius, shadow, size and type tokens from the design system's `tokens.css` into `globals.css` under `:root`, and map them with `@theme inline` (`--color-wall: var(--wall)` …) so markup reads `bg-wall text-ink`. Spacing uses Tailwind's default 4px scale, which already equals the design system's steps (`space-4` = `p-4` = 16px), so no spacing tokens are added. Components are written as TSX with utility classes under `apps/web/src/components/ui/`, taking exact values from `bundle.css`.

- Alternative: copy `bundle.css` (`.fs-*` classes) into the app. Rejected: a second styling mechanism beside Tailwind, and 19 KB of CSS for 18 components when the shell needs two.

### 2. Light theme only

`:root` gets the light values and `color-scheme: light`; the dark token block is not copied. The page was designed and reviewed in light only, and an unreviewed dark page is worse than none. Logged in the backlog as a deferred item.

### 3. Fonts through `next/font/google`

`Schibsted_Grotesk` (variable, 400–800) and `IBM_Plex_Mono` (400, 500), `display: "swap"`, exposed as CSS variables that `@theme` maps to `font-sans` and `font-mono`. `next/font` downloads the files at build time and serves them from the app's origin with metric-matched fallbacks, which covers the self-hosting requirement and keeps layout shift low.

### 4. One site map registry, typed so a live page cannot miss its head values

`apps/web/src/lib/site-map.ts` exports the 19 pages as a typed constant: `id`, `path`, `hub`, `name`, and for cards `question` and `ratio`. `live` is a discriminant: `live: true` requires `seo: { title, h1, description, lastModified }`, so TypeScript refuses a live page without them. Helpers: `page(id)`, `livePages()`, `liveHubHeads()`. Values come from the guide's Per-page map and the approved canvas (names, questions, ratios).

- Alternative: add each page's links by hand in the change that ships it. Rejected: the approved design already places 18 links in the header, footer, related block and running text; with a flag, shipping a page is one edit instead of five.

### 5. Links through one component

`PageLink` takes a page id. Live: `next/link` to the page's path. Not live: its children as plain text. Lists (header, footer, cards) filter with `livePages()` instead. No other code builds an internal `href`.

### 6. Head tags from one helper

`pageMetadata(id)` in `apps/web/src/lib/seo.ts` returns a Next `Metadata` object: `title` (`{ absolute }` when it contains "Frame Sizes", else the plain string for the layout's `"%s | Frame Sizes"` template), `description`, `alternates.canonical` (resolved against the existing `metadataBase`), `openGraph` (title, description, url, type, siteName, locale) and `twitter.card`. Next merges metadata shallowly, so a page that sets `openGraph` itself would drop `siteName`; one helper prevents that. Pages export `metadata = pageMetadata("F1")`.

Next also emits `twitter:title`, `twitter:description` and `twitter:image` derived from the same values. The guide's "no separate twitter tags" rule is about not maintaining a second copy, so the derived tags are accepted.

### 7. Social image with `opengraph-image.tsx`

`app/opengraph-image.tsx` uses `ImageResponse` from `next/og` and exports `size`, `contentType` and `alt`; Next prerenders it at build time and adds the `og:image*` tags. Layout: wall background, the `h1` in Schibsted Grotesk ExtraBold, the nested-frames mark. `ImageResponse` cannot read `next/font` or woff2, so one TTF (OFL licence) is committed at `apps/web/src/assets/fonts/` and read with `readFile`. The layout stays inside this one file; it is extracted into a shared function when a second page needs an image, and T2 adds the size diagram to it.

### 8. JSON-LD as a script in the page

`siteJsonLd()` builds the `@graph` from the same constants the page shows; `page.tsx` renders it in a `<script type="application/ld+json">` with `<` escaped as `<`, as the Next docs prescribe. No library.

### 9. `robots.ts`, `sitemap.ts`, `not-found.tsx`

File conventions, statically generated. `sitemap.ts` maps `livePages()` to `{ url, lastModified }`; `lastModified` is a hand-edited ISO date in the registry, changed in the PR that changes the page's content (never the build time). `not-found.tsx` renders inside the root layout, so it gets the shell; Next answers 404 and marks the page `noindex` on its own.

### 10. The unit preference: `localStorage` behind `useSyncExternalStore`

`apps/web/src/lib/unit.ts` exports `useUnit()` and `setUnit()`. The store reads and writes `localStorage` (key `unit`), notifies its own subscribers and listens to the `storage` event; the server snapshot is `"in"`. React hydrates with the server snapshot and then re-renders with the stored value, so there is no hydration mismatch and no `setState` in an effect. Storage access is wrapped in `try/catch`; on failure the value lives in a module variable for the page view.

The unit is not a URL parameter. It is a visitor's preference, like a theme: a metric visitor who opens a shared `?size=11x14` link wants centimetres whatever the sender used. T2's widget state (size, view, reference) goes in the URL; the unit does not.

- Alternative: a React context provider in the layout. Rejected: it adds a client boundary around every page for one value that an external store serves with less code.

### 11. Header: server component with two small client parts

`SiteHeader` is a server component that renders the lockup, the hub links from `liveHubHeads()` and the unit toggle. Two client components: `UnitToggle` (the design system's `SegmentedControl`, a `radiogroup` with roving focus) and `HubNav` (the link list plus the menu button with `useState`). The links are always rendered; below 600px a class hides the list until the button is pressed. With fewer than two live hubs `HubNav` is not rendered.

- Alternative: `<details>` for a no-JavaScript menu. Rejected: the same link list must be always visible from 600px up, which needs `::details-content` (too new for older Safari) or a duplicated list. Without JavaScript the footer still links every live page.
- Icons: two inline SVGs (`menu`, `x`) in `components/ui/icons.tsx`. `lucide-react` is added when a page needs more than a handful.

### 12. Analytics: PostHog in cookieless mode, behind a first-party proxy

The user chose PostHog (2026-11-11). Set-up, per PostHog's Next.js guide (read it and the bundled `instrumentation-client.md` doc at apply):

- `posthog-js`, initialised in `apps/web/src/instrumentation-client.ts` with `defaults` set to the current dated preset, `api_host: "/ingest"` and `cookieless_mode: "always"`: nothing is stored in the browser, PostHog derives a daily-rotating anonymous id on its server, and no consent banner is needed. Session replay off. Web Vitals capture on (project setting), so the 75th-percentile field numbers the guide's speed targets use are in PostHog's Web Analytics. No custom events in T1.
- Init is skipped when `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` is empty, which is the case in CI. The Playwright `webServer` env sets it empty so local test runs never send events to the real project. The no-cookie and first-party scenarios run against a build with a dummy token and the ingest route stubbed with `page.route`.
- Proxy: `rewrites()` in `next.config.ts` send `/ingest/static/*` and `/ingest/array/*` to the region's assets host and `/ingest/*` to its ingest host. Requests stay on the site's origin, so ad blockers and a later Content-Security-Policy treat them as first-party.
- The proxy needs `skipTrailingSlashRedirect: true`, because posthog-js calls paths that end in a slash. That flag turns off Next's automatic 308 for the whole site, so `redirects()` adds it back for every path except `/ingest` (read the bundled `skipTrailingSlashRedirect` and `redirects` docs at apply). The `seo-base` trailing-slash requirement pins the outcome.
- Region (US or EU Cloud) and token: read from the PostHog project through the PostHog MCP project lookup, or asked; never assumed. Both go in `.env.local` (git-ignored) and the Vercel project's environment variables.
- PostHog drops cookieless events unless **Cookieless tracking** is on in the project (Settings, Web analytics). Live events still shows them, so a working-looking set-up can store nothing. The task that enables it checks the project's ingestion warnings afterwards.

Alternatives:

- Vercel Web Analytics and Speed Insights: cookieless with no set-up, but no funnels or event analysis later. Not chosen by the user.
- PostHog's managed reverse proxy on a subdomain: leaves app routing untouched, but needs DNS, which is still pending. Revisit at T22 if the rewrite causes trouble.
- PostHog with cookies: needs a consent banner before launch. Revisit with T21, where ads bring their own consent requirement.

### 13. Tests

- Vitest, Node: registry invariants, `pageMetadata`, `siteJsonLd`, sitemap entries, and server markup of `SiteHeader` / `SiteFooter` / `PageLink` through `renderToStaticMarkup` with fixture link lists (the only way to prove the two-hub cases while one hub is live).
- Vitest, jsdom: one test for the menu button's toggle, using `react-dom/client` and `act` (no testing library). Needs the `jsdom` dev dependency and JSX transform set to `automatic` in `vitest.config.ts` (the app's `tsconfig` says `preserve`).
- Playwright: everything on the built HTML and in the browser (head tags via `request.get`, 404 status, fonts, theme, unit persistence, 320px, cookies, `@axe-core/playwright`).

### Spec-to-source rows to add at archive

| Capability   | Source path globs                                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `site-shell` | `apps/web/src/app/layout.tsx`, `apps/web/src/app/not-found.tsx`, `apps/web/src/components/site/**`, `apps/web/src/lib/unit.ts`, `apps/web/src/instrumentation-client.ts` |
| `seo-base`   | `apps/web/src/lib/site-map.ts`, `apps/web/src/lib/seo.ts`, `apps/web/src/app/robots.ts`, `apps/web/src/app/sitemap.ts`, `apps/web/src/app/opengraph-image.tsx`           |

`apps/web/src/app/page.tsx` stays unmapped until T2 gives it to `frame-size-chart`.

## Risks / Trade-offs

- [Between T1 and T2 the home page's title and description describe a chart that is not on the page] → The domain's DNS is still pending and launch is T22; T2 follows directly. If DNS goes live before T2 merges, tell the user before merging T1.
- [Cookieless tracking off in the PostHog project drops every event silently] → Enabling it is a task, followed by a check of the project's ingestion warnings.
- [`posthog-js` adds script weight before hydration] → Measure LCP and INP in a production build before and after the init lands; if either worsens visibly, load it after the page is idle.
- [`skipTrailingSlashRedirect` removes the site-wide 308] → Re-added in `redirects()` and pinned by a `seo-base` scenario.
- [Stored "cm" re-renders after hydration] → Only the toggle changes in T1. T2 must keep the table's column widths stable so the switch causes no layout shift.
- [`ImageResponse` font or size surprises] → The e2e test fetches the image and checks type and size; the card is checked by eye in a preview tool before archive.
- [Guide drafts change after launch] → Titles and descriptions live in one registry entry per page; a test pins only the limits, not the wording (the home title is the one literal, taken from the guide).

## Migration Plan

Merge to `main` deploys to Vercel. Before the first deploy that carries analytics: the PostHog token and host are set as Vercel environment variables, and Cookieless tracking and Web Vitals are on in the PostHog project (the user's steps, or done with their yes). After it: the preview URL is checked for the host's `X-Robots-Tag: noindex`, and a visit to the preview shows up in PostHog with no ingestion warning. Rollback is a revert of the merge commit; nothing is stored server-side.

## Open Questions

- PostHog's free-tier event allowance against expected traffic: read it in the PostHog billing page when the token is set. Does not change the code.

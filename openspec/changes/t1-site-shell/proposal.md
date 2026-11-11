# Proposal

## Why

The app is a scaffold: one placeholder page, a site-wide title, no header, footer, canonical, sitemap or robots file. Every one of the 19 launch pages needs the same shell and the same head tags, so they are built once, before the first real page. This is Tracker row T1 and the first half of the home page (F1, `/`); `t2-frame-size-chart` adds the size engine, the widget and the page content on top of it.

## What Changes

- Design tokens (light theme) and the two font families from the design system land in the app; fonts are self-hosted.
- A shared shell wraps every page: header (logo, hub links, in/cm toggle, menu button on phones), `main`, footer (live pages by hub, the nominal-size note).
- The in/cm choice becomes one site-wide preference that survives a reload and a page change.
- A site map registry declares the 19 launch pages once (id, path, hub, names, live flag; head values for live pages). The header, the footer, the sitemap and every internal link read it, and a link appears only when its target page is live.
- Head tags come from one helper: title (with or without the brand suffix), description, self-referencing canonical, the nine Open Graph and social tags with a generated 1200 × 630 image.
- The home page gets its real head and `h1` from the On-page SEO guide's F1 row, and `WebSite` + `Organization` JSON-LD. Its body stays a placeholder until T2.
- `robots.txt`, `sitemap.xml` and a real 404 page that links to the live hub heads.
- Cookieless page-view and Core Web Vitals reporting with PostHog, sent through the site's own origin.
- Paths with a trailing slash redirect permanently to the path without it (the analytics proxy turns off the framework's own redirect).
- An existing test changes: `e2e/home.spec.ts` asserts the scaffold's `h1` "Frame Sizes"; the `h1` becomes "Standard Frame Sizes". The edit needs the user's approval before it is made.

Copied from the On-page SEO guide, Per-page map, row F1:

| Field                     | Value                                                                                                                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| URL                       | `/`                                                                                                                                                                                                                                  |
| Head keyword              | standard frame sizes (18,100 / KD 16)                                                                                                                                                                                                |
| Title                     | Standard Picture Frame Sizes Chart (Inches & cm) (absolute, no suffix)                                                                                                                                                               |
| H1                        | Standard Frame Sizes                                                                                                                                                                                                                 |
| Description               | Every standard picture frame size in inches and cm, from 4x6 to 24x36. Click a size to see it at true scale next to a sofa, a door or a person.                                                                                      |
| Secondary keywords        | frame image size · frame sizes · picture frame sizes · common frame sizes · photo frame sizes · frame size chart (placed by T2)                                                                                                      |
| Open Graph                | og:title = the title, og:description = the description, og:url = canonical, og:type `website`, og:site_name `Frame Sizes`, og:locale `en_US`, og:image 1200 × 630 PNG with width, height and alt, twitter:card `summary_large_image` |
| JSON-LD                   | `WebSite` (name, url) and `Organization` (name, url, logo `/brand/logo-mark-512.png`) in one `@graph`; no `FAQPage`                                                                                                                  |
| Must link outside its hub | P1, PH1, C1, G1 (none live yet; placed by T2 behind the live-link rule)                                                                                                                                                              |

The description's range ("4x6 to 24x36") is a guide draft that T2 reconciles with the size engine.

## Capabilities

### New Capabilities

- `site-shell`: the frame every page renders in (header, hub navigation, footer, 404 page), the site-wide in/cm preference, the light theme and self-hosted fonts, and cookieless visit measurement.
- `seo-base`: the site map registry and the live-link rule, per-page head tags (title, description, canonical, Open Graph), the page `h1`, structured data, `robots.txt` and `sitemap.xml`.

### Modified Capabilities

None.

## Impact

- Code: `apps/web/src/app/` (`layout.tsx`, `page.tsx`, `globals.css`, new `not-found.tsx`, `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`), new `apps/web/src/components/site/`, `apps/web/src/components/ui/`, `apps/web/src/lib/`.
- Dependencies: `posthog-js`; dev: `jsdom` (one component test), `@axe-core/playwright` (accessibility check). One font file (Schibsted Grotesk ExtraBold, OFL) is committed for the social image.
- Accounts: two environment variables (PostHog project token and host) on the Vercel project, and Cookieless tracking plus Web Vitals switched on in the PostHog project. Each is the user's step, or done with their yes.
- Tests: one existing e2e assertion changes (approval above); new unit and e2e tests cite the two new capabilities.
- Docs: closes the "Open: shell (T1)" items and the T1 part of "Open: SEO" in `docs/home-page-design.md`.

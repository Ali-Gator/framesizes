# Design

## Context

See proposal.md for why. Today every page in `PAGES` (`apps/web/src/lib/site-map.ts`) has a hub, and the header, footer groups, Related tools and breadcrumbs are all derived from hubs. Text pages already exist in one shape: `page flex flex-col gap-12`, `Breadcrumbs`, an `h1` with `display md:display-xl`, `h2`/`h3` classes and `max-w-prose` paragraphs (X1's `ExtensionHowTo`). The social image is a per-route `opengraph-image.tsx` with `ImageResponse` and `ogFonts`. The footer is one component fed `footerGroups()` from `app/layout.tsx`.

## Goals / Non-Goals

**Goals:**

- One record for the five pages (the site map) and one for the operator's details, so a change of address is one edit.
- Policies whose every claim maps to something in the code today.
- No client JavaScript on the five pages.

**Non-Goals:**

- A shared Markdown or MDX pipeline: five static pages do not pay for it.
- Translations, a contact form, a cookie banner.

## Decisions

1. **Company pages live in `PAGES` with no hub.** `hub` becomes optional on `PageBase`. Every hub-derived list (`navHubs`, `footerGroups`, `liveHubHeads`, Related tools) already filters by `p.hub === hub.id`, so the five fall out of them with no extra code; `livePages` and `sitemapEntries` include them, so the sitemap needs no change; `breadcrumbTrail` already guards `hub &&` and gives Home › page; `checkSiteMap` checks their head values with the rest. Ids A1–A5. Alternative: a separate `COMPANY_PAGES` list. Rejected: it breaks "the site map is the single record of pages" and needs its own sitemap, limit check and metadata path. Cost: two approved test edits (page count, sitemap count).
2. **`companyLinks(pages = PAGES)`** in `site-map.ts`: live pages with no hub, as `{ href, name }`, in site map order. The footer row renders them. `withLive` in test fixtures already marks unnamed pages not live, so existing footer and sitemap unit tests keep their results.
3. **`apps/web/src/lib/company.ts`** holds `COMPANY = { brand, legalName, email, address: { street, locality, region, country, countryCode } }` and `addressLine()` (one comma-joined line). The footer, all five pages and the JSON-LD import it. It belongs to `company-pages`; `site-shell`'s footer imports it as a dependency.
4. **Page bodies are plain TSX, one file per route**, using a small `CompanyPage` wrapper in `apps/web/src/components/company/` (breadcrumbs, `h1`, optional "Last updated" `time`, children, the JSON-LD script). Policy text is written inline as JSX; no copy module, since it is not translated. Terms sections are `h2`s with their number in the text ("1. Who provides the service") so a visitor and a crawler see the same numbering.
5. **JSON-LD:** one script per page with an `@graph`. `organizationJsonLd()` returns the home page's `Organization` (`@id` `https://framesizes.app#organization`, name, url, logo) plus `legalName`, `email` and a `PostalAddress` (`addressCountry` "HK"). The home page's `siteJsonLd` stays unchanged to keep its scenario; About adds `AboutPage`, Contact `ContactPage`, each with `about`/`mainEntity` pointing at the organization `@id`. Policies carry `breadcrumbJsonLd` only.
6. **Social image:** `components/company/og-image.tsx` exports `companyOgImage(h1)` (cream background, h1 at 96 px, logo mark), and each route's `opengraph-image.tsx` is three lines: `alt` = the h1, `size`, `contentType`, default export calling the helper. Meets the guide's one-layout rule; no diagram, since these pages have no size subject.
7. **Footer row:** under the existing flex row, a `div` with `border-t border-line` and `small text-ink-muted`: "© {build year} Soft Divisions Limited · {addressLine}" and `<nav aria-label="Company">` with the five links inline, wrapping on a phone. The build year comes from `new Date().getFullYear()` at render; the pages are static, so it updates on each deploy. Approved as "reuse, no canvas" on 2026-11-21.
8. **Privacy facts and their sources in code:** PostHog (`instrumentation-client.ts`: cookieless, `/ingest`, EU host, no autocapture, no recording); unit choice (`lib/unit.ts`, `localStorage` key `unit`); wall photos (`photo-flow.tsx`, object URLs only); extension storage (`store.ts` IndexedDB `gallery-wall`, `saved-wall.ts` `localStorage` journal); right-click read (`read-page.ts`, `fetch(url, { credentials: "omit" })`); status messages (`externally_connectable` framesizes.app only); email (Porkbun forwarding, from the domain's MX). Retention values, read 2026-11-21 (task 1.3):
   - **PostHog events: up to 2 years.** Project "Framesizes" (id 344498, EU host, `anonymize_ips: true`, session recording off), created 2026-11-11. The plan itself could not be read (the PostHog MCP key lacks `billing:read`). Per https://posthog.com/docs/data/events-retention, organizations on a plan started on or after 2026-11-05 keep events 1 year on Free and 2 years by default on pay-as-you-go, so "up to 2 years" is true on either plan. Source: PostHog MCP `project-get` and the PostHog docs page above.
   - **Vercel runtime logs: 1 hour.** Team `aligators-projects` is on the Hobby plan (`vercel api /v2/teams/<id>`: `billing.plan: "hobby"`); https://vercel.com/docs/logs/runtime ("Limits") gives Hobby 1 hour of logs (Pro 1 day). Source: Vercel CLI and the Vercel docs page above.
9. **Store description:** append `\n\nOfficial website: https://framesizes.app/` to each locale's `storeDesc.message`, label translated per language (en: "Official website"). Done with a short one-off script in the scratchpad, not a repo script; the files are spec-exempt. The extension zip is untracked, so nothing is rebuilt.

## Risks / Trade-offs

- [Policy text drifts from code when T21 adds ads or a feature adds a tracker] → Tracker note on T21; the privacy page's data table is the checklist a future change edits.
- [Legal text written without a lawyer] → stated to the user at hand-off; the text stays factual and avoids promises beyond what the user decided.
- [Hong Kong address reading "B, G/F" is ours] → confirmed with the user before apply; one edit in `company.ts` if wrong.
- [`hub` optional widens a type used across components] → `tsc` finds every site that assumed it; only `breadcrumbTrail`, Related tools and the extension copy read it, and all compare it to a hub id.

## Migration Plan

Additive. Deploy with the next merge to `main`. Rollback: revert the PR; nothing stores data.

## Open Questions

- PostHog and Vercel retention periods: read during apply; they change only the "How long" cells.

# Proposal

## Why

Tracker row T26 (added with this change). framesizes.app has no About, Contact, Privacy Policy, Terms of Use or Refund Policy page. Search engines and visitors read these pages as trust signals (who runs the site, how to reach them), the Chrome Web Store listing needs a privacy policy URL, and the site will carry ads and affiliate links (T21), which need a privacy policy and terms first. The user asked for the five pages on 2026-11-21, with https://blockchannel.one as a structural reference only (its footer groups, a "Last updated" line, a data table in the privacy policy, a refund page that explains why a free product has nothing to refund). No text is copied from it.

## What Changes

- **Company details, decided 2026-11-21.** Operator: Soft Divisions Limited, B, G/F, 322 Shanghai Street, Yau Ma Tei, Kowloon, Hong Kong (the user gave "Hong Kong, Kowloon, Yau Ma Tei, Shanghai St, 322G/F B"; "B, G/F" is our reading, confirmed before apply). Contact: care@framesizes.app. Governing law: Hong Kong. No company number shown. All of it lives in one module, so every page, the footer and the JSON-LD read the same values.
- **SEO-guide rows.** The guide has no rows for these pages. Apply adds them to its Per-page map first; the guide stays the source and a later edit there wins. Head keywords are navigational (no Semrush data).

  | Id  | URL               | Title (full)                  | H1                | Description (chars)                                                                                                                                               | Footer name    |
  | --- | ----------------- | ----------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
  | A1  | `/about`          | About Frame Sizes             | About Frame Sizes | Frame Sizes is a free set of true-scale tools for frames, posters and gallery walls, run by Soft Divisions Limited. Who we are and how we check sizes. (150)      | About          |
  | A2  | `/contact`        | Contact Us \| Frame Sizes     | Contact Us        | Email Frame Sizes at care@framesizes.app about a wrong size, a bug, the Gallery Wall Layout Generator extension or your data, and find our postal address. (154)  | Contact        |
  | A3  | `/privacy-policy` | Privacy Policy \| Frame Sizes | Privacy Policy    | What Frame Sizes and its Chrome extension collect: cookieless visit counts and server logs. Wall photos and saved walls stay on your device, never with us. (155) | Privacy policy |
  | A4  | `/terms-of-use`   | Terms of Use \| Frame Sizes   | Terms of Use      | The rules for using Frame Sizes and the Gallery Wall Layout Generator extension: free use, nominal sizes you should measure, liability and Hong Kong law. (153)   | Terms of use   |
  | A5  | `/refund-policy`  | Refund Policy \| Frame Sizes  | Refund Policy     | Frame Sizes and its Chrome extension are free, so there is nothing to refund. If we add a paid feature, you get a full refund within 14 days, no reason. (152)    | Refund policy  |

  Breadcrumb: Home › page. JSON-LD: `BreadcrumbList` on all five; A1 adds `AboutPage` and A2 `ContactPage`, each with the `Organization` (brand name, legal name, postal address, email). Social image: one layout for the five, the h1 in large type and the logo mark.

- **The site map** gains the five pages, live, with no hub. They are not hub pages, so the header, hub nav, Related tools and the hub groups of the footer leave them out; the sitemap lists them like any live page. The site map then holds 25 pages.
- **The five pages** use the existing text layout (breadcrumbs, one h1, sections under h2), no widget: a stated exception to "every page carries its own widget". The three policies show "Last updated" with the page's content date.
  - **About:** what Frame Sizes is, how sizes are checked, the Chrome extension, that it is free, who runs it (company and address, link to Contact), what it is not (not a shop, not tied to any retailer).
  - **Contact:** the email as a `mailto:` link, what to include for a wrong size, a bug or a privacy request, and the postal address.
  - **Privacy Policy:** describes only what the code does: cookieless PostHog (EU) page views and Web Vitals through the site's own `/ingest`, no autocapture or recording; Vercel hosting logs; the unit choice in `localStorage`; wall photos read in the browser and never uploaded; email forwarded by Porkbun. The extension: wall and prints saved on the device (IndexedDB, `localStorage`), the page title, size text and picture read only from the tab the visitor right-clicks, the picture fetched without cookies, nothing sent to us, framesizes.app may ask only whether it is installed and pinned; each permission in plain words. Then cookies (none), sharing, international processing, security, children, rights (GDPR and UK GDPR for EU and UK visitors, Hong Kong PDPO), complaints, changes, contact. A data table: data, where it is kept, who sees it, how long.
  - **Terms of Use:** numbered sections: who provides the service, what it is (free tools, nominal sizes to measure), licence, acceptable use, shop pages and trade names, price, your photos, feedback, no warranty, limitation of liability, links, availability and changes, ending use, Hong Kong law (mandatory consumer rights of the visitor's country kept), changes to the terms, contact.
  - **Refund Policy:** nothing to pay, so nothing to refund; anyone charging for Frame Sizes or the extension is not us (official sources: framesizes.app and its Chrome Web Store listing); for a future paid feature, a full refund within 14 days of purchase for any reason, asked by email (decided 2026-11-21).
- **Footer (user request, 2026-11-21):** a bottom row under the hub groups with "© <year> Soft Divisions Limited", the postal address, and links About, Contact, Privacy policy, Terms of use, Refund policy. No canvas: the row reuses the footer's small muted text (decided 2026-11-21).
- **Extension store description (user request, 2026-11-21):** each of the 28 `apps/extension/public/_locales/*/messages.json` `storeDesc` messages ends with "Official website: https://framesizes.app/", the label translated, the URL as is. The English listing text in the store-listing Google Doc gets the same line. Pasting into the Chrome Web Store dashboard, and setting its privacy policy URL to `https://framesizes.app/privacy-policy`, is the user's step after deploy.
- **Tests:** two existing tests change, approved by the user on 2026-11-21: `apps/web/src/lib/__tests__/site-map.test.ts` (20 pages to 25) and `e2e/seo-home.spec.ts` (sitemap URLs 3 to 8).
- **Backlog:** no open item sits in this area. T21 (ads and affiliate links) must update the Privacy Policy when it ships; its Tracker note gets that line.
- **Left out:** a contact form (no backend), a copy-address button, a company number, cookie banner (no cookies), translated versions.

## Capabilities

### New Capabilities

- `company-pages`: the About, Contact, Privacy Policy, Terms of Use and Refund Policy pages, the company details module they share, and their structured data and social image.

### Modified Capabilities

- `seo-base`: **modified requirements** "The site map is the single record of pages" (25 pages; pages with no hub) and "The sitemap lists exactly the live pages" (scenario with the five company pages).
- `site-shell`: **modified requirement** "The footer lists the live pages by hub" (the company row: owner, address and the company links).

## Impact

- `apps/web/src/lib/site-map.ts` (optional hub, five entries, company links helper), `apps/web/src/lib/company.ts` (new), `apps/web/src/app/{about,contact,privacy-policy,terms-of-use,refund-policy}/` (new), `apps/web/src/components/company/` (new: shared layout pieces and social image), `apps/web/src/components/site/site-footer.tsx`, `apps/web/src/app/layout.tsx`.
- `apps/extension/public/_locales/*/messages.json` (28 files, spec-exempt).
- Docs: the On-page SEO guide (five Per-page map rows), the Tracker (row T26, T21 note), the store-listing Google Doc.
- No new dependency. Static pages; no client JavaScript added.

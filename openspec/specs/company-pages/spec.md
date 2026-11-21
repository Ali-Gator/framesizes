# company-pages Specification

## Purpose

The pages that say who runs framesizes.app and on what terms: About, Contact, Privacy Policy, Terms of Use and Refund Policy, with the company details they share, their structured data and their social image.

## Public Interface

```typescript
// apps/web/src/lib/company.ts
const COMPANY: {
  brand: "Frame Sizes";
  legalName: "Soft Divisions Limited";
  email: "care@framesizes.app";
  address: { street; locality; region; country: "Hong Kong"; countryCode: "HK" };
};
function addressLine(): string; // "B, G/F, 322 Shanghai Street, Yau Ma Tei, Kowloon, Hong Kong"

// apps/web/src/lib/seo.ts
function organizationJsonLd(): Organization; // the home page's node + legalName, email, PostalAddress
function companyPageJsonLd(target: LivePage, type: "AboutPage" | "ContactPage"); // one @graph

// apps/web/src/lib/site-map.ts
function companyLinks(pages = PAGES): { href: string; name: string }[]; // live pages with no hub

// apps/web/src/components/company/
function CompanyPage(props: {
  id: PageId;
  schema?: "AboutPage" | "ContactPage";
  updated?: boolean;
  lead?;
  children;
}): JSX.Element;
function Section(props: { title: string; children }): JSX.Element; // an h2 section, prose width
function companyOgImage(id: PageId): ImageResponse; // logo + the page's h1, 1200 × 630
```

Routes: `apps/web/src/app/{about,contact,privacy-policy,terms-of-use,refund-policy}/` (`page.tsx`, `opengraph-image.tsx` whose `alt` is the page's h1 from the site map). Site map ids A1–A5.

## Behavior

The five pages are site map entries with no `hub`, so every hub-derived list (header, hub nav, Related tools, the footer's hub groups) leaves them out, while `livePages`, `sitemapEntries` and `checkSiteMap` include them. `breadcrumbTrail` gives Home › page. The footer's company row renders `companyLinks()`.

`CompanyPage` renders breadcrumbs, the `h1`, "Last updated" with the site map content date (policies only, `updated`), the lead, the sections and one JSON-LD script: `companyPageJsonLd` for About and Contact, `breadcrumbJsonLd` otherwise. No client JavaScript. Links between company pages and to tools use `PageLink`, so a page that is not live is never linked.

The Privacy Policy's data table and extension section describe only what the code does (archived change `2026-11-21-t26-company-pages`, design decision 8). Analytics settings the policy depends on are pinned in `instrumentation-client.ts` (no autocapture, recording, heatmaps, dead clicks, exceptions, surveys or scroll depth), so the PostHog dashboard cannot widen collection. The data table scrolls sideways in a focusable region on a phone.

## Edge Cases

- A change that adds a tracker, ads or affiliate links edits the Privacy Policy's table in the same change (Tracker T21 note).
- "No IP address and no location" rests on the PostHog project setting "Discard client IP data" (BL-86).
- The mailbox provider behind Porkbun's forwarding is not named yet (BL-85).
- The footer year is the build year: the pages are static and update on each deploy.

## Requirements

### Requirement: The company details are declared once

The site SHALL declare the operator once: brand "Frame Sizes", legal name "Soft Divisions Limited", the postal address "B, G/F, 322 Shanghai Street, Yau Ma Tei, Kowloon, Hong Kong" and the email `care@framesizes.app`. Every page, the footer and the structured data SHALL show these values from that one record, never a copy.

#### Scenario: The About and Contact pages show the same details

- **WHEN** `/about` and `/contact` are requested
- **THEN** each response HTML holds the legal name "Soft Divisions Limited", the postal address and a `mailto:care@framesizes.app` link, identical on both pages

### Requirement: The five company pages exist at their own URLs

The site SHALL serve About at `/about`, Contact at `/contact`, Privacy Policy at `/privacy-policy`, Terms of Use at `/terms-of-use` and Refund Policy at `/refund-policy`, each live, statically rendered, with the title, `h1` and description from its site map entry, its breadcrumbs (Home › page) and no widget.

#### Scenario: Each company page answers with its h1

- **WHEN** each of the five paths is requested
- **THEN** it answers 200, and its HTML holds exactly one `h1`: "About Frame Sizes", "Contact Us", "Privacy Policy", "Terms of Use" and "Refund Policy" in path order
- **AND** a `nav` named "Breadcrumb" reading "Home" then the page's short name

#### Scenario: A company page's title

- **WHEN** `/privacy-policy` is requested
- **THEN** the response HTML's title is "Privacy Policy | Frame Sizes" and its canonical is `https://framesizes.app/privacy-policy`

### Requirement: The policies show when they last changed

The Privacy Policy, Terms of Use and Refund Policy SHALL show "Last updated" followed by the content date from the page's site map entry, below the `h1`, in a `time` element whose `datetime` is that date.

#### Scenario: The Privacy Policy's date

- **WHEN** `/privacy-policy` is requested
- **THEN** the HTML holds a `time` element whose `datetime` equals the page's site map content date, after the text "Last updated"

### Requirement: The Contact page gives the email and the postal address

The Contact page SHALL give `care@framesizes.app` as a `mailto:` link, say what to include when reporting a wrong size, a bug or a privacy request, and show the postal address. It SHALL hold no form.

#### Scenario: The Contact page's content

- **WHEN** `/contact` is requested
- **THEN** the HTML holds an `a` element with `href="mailto:care@framesizes.app"`, the `h2` headings for a wrong size or bug, for privacy requests and for the postal address, and no `form` element

### Requirement: The Privacy Policy states what is collected, where and for how long

The Privacy Policy SHALL name the operator and its address, and hold a table with one row per kind of data the site or the extension handles, each giving where it is kept, who can see it and how long it is kept. It SHALL state that the site sets no cookies, that wall photos are read in the browser and never uploaded, and that the extension sends nothing to the operator.

#### Scenario: The data table

- **WHEN** `/privacy-policy` is requested
- **THEN** the HTML holds a `table` whose header cells read "Data", "Where it is kept", "Who can see it" and "How long", with rows for visit counts, server logs, the unit choice, wall photos, the extension's saved wall and prints, and email

#### Scenario: The privacy promises

- **WHEN** `/privacy-policy` is requested
- **THEN** its main text says the site sets no cookies, that a wall photo is never uploaded, and that the extension itself sends nothing to the operator

#### Scenario: The extension section

- **WHEN** `/privacy-policy` is requested
- **THEN** the HTML holds an `h2` about the Chrome extension that names each of its permissions (`sidePanel`, `contextMenus`, `activeTab`, `scripting`) with what it is used for

### Requirement: The Terms of Use name the provider and the governing law

The Terms of Use SHALL be numbered sections that name Soft Divisions Limited as the provider, say that sizes are nominal and should be measured, and state that Hong Kong law governs the terms while keeping the mandatory consumer rights of the visitor's country.

#### Scenario: The governing law section

- **WHEN** `/terms-of-use` is requested
- **THEN** the HTML holds `h2` headings numbered from "1." in order, one of them "Governing law", and the text under it names Hong Kong

### Requirement: The Refund Policy covers a free product and a future paid feature

The Refund Policy SHALL say the site and the extension are free and nothing is charged, that anyone charging for them is not the operator, and that a future paid feature carries a full refund within 14 days of purchase for any reason, asked by email to `care@framesizes.app`.

#### Scenario: The refund promise

- **WHEN** `/refund-policy` is requested
- **THEN** the HTML says the site and the extension are free and holds the 14-day full refund for any future paid feature, with a `mailto:care@framesizes.app` link

### Requirement: About and Contact describe the organization in structured data

The About page's JSON-LD SHALL hold, in one `@graph`, an `AboutPage`, the `BreadcrumbList` and the `Organization` with name "Frame Sizes", `legalName` "Soft Divisions Limited", a `PostalAddress` with country "HK" and the email; the Contact page SHALL hold the same with a `ContactPage`. The other three pages SHALL hold the `BreadcrumbList` only. The `Organization` SHALL use the home page's `@id`.

#### Scenario: The About page's JSON-LD

- **WHEN** `/about` is requested
- **THEN** the HTML holds one `application/ld+json` script whose `@graph` types are `AboutPage`, `BreadcrumbList` and `Organization`, the organization's `@id` is `https://framesizes.app#organization` and its `address.addressCountry` is "HK"

#### Scenario: A policy page's JSON-LD

- **WHEN** `/refund-policy` is requested
- **THEN** the HTML holds one `application/ld+json` script whose only type is `BreadcrumbList`

### Requirement: Each company page has its own social image

Each company page SHALL send a 1200 × 630 PNG social image under 300 KB showing its `h1` in large type and the logo mark, with the `h1` as its alt text.

#### Scenario: The Terms of Use social image

- **WHEN** the URL in `/terms-of-use`'s `og:image` tag is requested
- **THEN** it answers 200 with content type `image/png` and a body under 300 KB, and the page's `og:image:alt` is "Terms of Use"

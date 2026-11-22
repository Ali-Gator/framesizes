# seo-base Specification

## Purpose

What a search engine and a link preview read on every page: the record of which pages exist and are live, the head tags, the `h1`, structured data, `robots.txt` and `sitemap.xml`. The values come from the On-page SEO guide; this capability makes them hold on the built HTML.

## Public Interface

```typescript
// apps/web/src/lib/site-map.ts
type HubId = "frames" | "posters" | "photo" | "canvas" | "quality" | "gallery";
type SitePage = { id; path; hub: HubId; name; card?: { question; ratio } } & (
  { live: true; seo: { title; h1; description; lastModified } } | { live: false; seo?: { … } }
);
type BuiltPage = SitePage & { live: boolean; seo: { … } }; // has head values, live or not
const PAGES: readonly SitePage[]; // the 19 launch pages and X1, the extension page
const HUBS: readonly { id: HubId; name: string; head: PageId }[]; // header order
function page(id: PageId): SitePage;
function livePage(id: PageId): LivePage; // throws when not live
function builtPage(id: PageId): BuiltPage; // throws when the page has no head values
function livePages(pages?): LivePage[];
function liveHubHeads(pages?): (Hub & { path: string })[];
function navHubs(pages?): HubLink[];
function footerGroups(pages?): FooterGroup[];
function fullTitle(title: string): string; // with " | Frame Sizes" unless it names the brand
function checkSiteMap(pages): string[]; // head-limit problems on every page with head values, each naming it

// apps/web/src/lib/seo.ts
const SITE_URL = "https://framesizes.app";
function absoluteUrl(path: string): string; // "/" is the bare origin
function pageMetadata(page: BuiltPage): Metadata; // adds robots { index: false } while not live
function siteJsonLd(): { "@context"; "@graph": [WebSite, Organization] };
function sitemapEntries(pages?): MetadataRoute.Sitemap;
function breadcrumbTrail(page: SitePage): { name; path }[]; // Home › live hub head (when not the page or "/") › the page
function breadcrumbJsonLd(page: SitePage): BreadcrumbList; // the trail, absolute URLs
function jsonLdScript(data: unknown): string; // JSON with `<` escaped, for a ld+json script

// apps/web/src/lib/og-font.ts
const ogFonts: ImageResponseOptions["fonts"]; // Schibsted Grotesk ExtraBold, read at prerender

// apps/web/src/components/ui/breadcrumbs.tsx
function Breadcrumbs(props: { items: readonly { href?: string; label: string }[] }): JSX.Element;

// apps/web/src/components/site/page-link.tsx
function PageLink(props: { id: PageId; children: ReactNode }): JSX.Element;
```

File conventions: `app/robots.ts`, `app/sitemap.ts`, `app/opengraph-image.tsx`.

## Behavior

A page goes live by setting `live: true` and its `seo` values in `PAGES`; the header, footer, sitemap and every `PageLink` follow from that one edit. Pages export `metadata = pageMetadata(livePage(id))` and render `seo.h1` as their only `h1`. A page built ahead of go-live (X1) carries its `seo` while `live: false`, exports `pageMetadata(builtPage(id))`, and so renders with `noindex` and stays out of every list until the same `live: true` edit.

Breadcrumbs come from `breadcrumbTrail`: the visible `Breadcrumbs` and the `BreadcrumbList` share it. Pages whose hub head is the home page, and hub heads themselves, get two crumbs.

`absoluteUrl` builds every absolute URL (canonical, `og:url`, sitemap `loc`, JSON-LD), so they always agree. Next renders the canonical of `/` without a trailing slash, and so does `absoluteUrl("/")`.

The social image is prerendered at build time with `ImageResponse` and a committed static TTF (`apps/web/src/assets/fonts/`, OFL). The JSON-LD script escapes `<` as `\u003c`.

`skipTrailingSlashRedirect` is on for the analytics proxy; a `redirects()` rule restores the permanent redirect for every path but `/`, `/ingest/*` and paths that start with a doubled slash.

## Edge Cases

- A live page whose title already contains "Frame Sizes": used as the absolute title, no suffix.
- `?size=11x14` on the home page: the canonical drops the query.
- `//evil.example/`: not redirected, so no protocol-relative `Location`.
- A page whose hub head is not live: the trail skips the hub, so no crumb links to a missing page.
- `next dev`: file-based `og:image` URLs point at localhost; the production build uses `metadataBase`.

## Requirements

### Requirement: The site map is the single record of pages

The site SHALL declare each page once, with its id, path, hub (none for a company page), short name and whether it is live. A live page SHALL also declare its title, `h1`, description and the date its content last changed; a page that is not live MAY declare them ahead of go-live. No two pages SHALL share an id or a path, and no two pages that declare head values SHALL share a title or a description. Every declared title SHALL be 60 characters or fewer including any suffix, and every declared description 130 to 155 characters.

#### Scenario: The launch pages are declared

- **WHEN** the site map is read
- **THEN** it holds 25 pages, the 19 launch pages, the extension page X1 and the five company pages A1 to A5, with unique ids and unique paths, every path is lowercase with no trailing slash (the home page is `/`), and the home page, id F1, is live
- **AND** the five company pages are live and belong to no hub

#### Scenario: A live page breaks a head limit

- **WHEN** a live page's full title is longer than 60 characters, or its description is outside 130 to 155 characters, or it repeats another live page's title or description
- **THEN** the unit suite fails, naming the page

#### Scenario: A page not yet live breaks a head limit

- **WHEN** a page that is not live declares a full title longer than 60 characters, or a description outside 130 to 155 characters, or a title or description another page declares
- **THEN** the unit suite fails, naming the page

### Requirement: A link appears only when its target page is live

An internal link to a launch page SHALL be rendered as an `a` element with the page's path only when that page is live. For a page that is not live, a link inside a sentence SHALL render its text without a link, and navigation, footer and card links SHALL be left out.

#### Scenario: An in-text link to a live page

- **WHEN** a sentence links to a live page
- **THEN** the HTML holds an `a` element whose `href` is that page's path

#### Scenario: An in-text link to a page that is not live

- **WHEN** a sentence links to a page that is not live
- **THEN** the HTML holds the link's text and no `a` element for it

#### Scenario: Every link on a page resolves

- **WHEN** every internal `href` in the home page's HTML is requested
- **THEN** each one answers with status 200

### Requirement: Each live page declares its own title and description

The HTML the server returns for a live page SHALL carry a `title` and a meta description taken from the page's site map entry. A page whose title already contains "Frame Sizes" SHALL use it as written; every other title SHALL end with " | Frame Sizes".

#### Scenario: The home page's title

- **WHEN** `/` is requested
- **THEN** the response HTML's title is exactly "Standard Picture Frame Sizes Chart (Inches & cm)" and its meta description equals the home page's site map entry

#### Scenario: A page whose title lacks the brand

- **WHEN** head tags are built for a page titled "Poster Sizes: Standard Dimensions Chart"
- **THEN** the title is "Poster Sizes: Standard Dimensions Chart | Frame Sizes"

### Requirement: Each page has one self-referencing canonical

The HTML the server returns for a live page SHALL carry exactly one canonical link: the page's absolute URL on `https://framesizes.app`, with no query string and no trailing slash after a path.

#### Scenario: The home page is opened with widget state in the URL

- **WHEN** `/?size=11x14` is requested
- **THEN** the response HTML holds one canonical link and it points to the home page on `https://framesizes.app`, without the query string

#### Scenario: A canonical for an inner page

- **WHEN** head tags are built for the page at `/poster-sizes`
- **THEN** the canonical is `https://framesizes.app/poster-sizes`

### Requirement: A trailing slash redirects to the clean path in one hop

A request for any path other than `/` that ends in a slash SHALL answer with one permanent redirect (308) to the same path without the slash, keeping the query string. The analytics proxy path is exempt.

#### Scenario: A path with a trailing slash

- **WHEN** `/no-such-page/?a=1` is requested without following redirects
- **THEN** the response status is 308 and its `Location` is `/no-such-page?a=1`, which itself answers without a redirect

### Requirement: No live page asks to be kept out of the index

A live page SHALL NOT emit a robots meta tag, and no code path SHALL add `noindex` or a `Disallow` rule from an environment variable or a hostname. (The 404 page is not a live page; the framework marks it `noindex` itself.)

#### Scenario: The home page's robots directives

- **WHEN** `/` is requested
- **THEN** the response HTML holds no robots meta tag and the response has no `X-Robots-Tag` header set by the app

### Requirement: Each page sends the nine social tags with its own image

The HTML the server returns for a live page SHALL carry `og:title` (the title without the brand suffix), `og:description` (the meta description), `og:url` (the canonical), `og:type`, `og:site_name` "Frame Sizes", `og:locale` "en_US", `og:image` with its width, height and alt, and `twitter:card` "summary_large_image". The image SHALL be a 1200 × 630 PNG under 300 KB at an absolute URL.

#### Scenario: The home page's social tags

- **WHEN** `/` is requested
- **THEN** the response HTML holds all nine tags, `og:type` is "website", `og:url` equals the canonical, and `og:image:width` and `og:image:height` are 1200 and 630

#### Scenario: The home page's social image

- **WHEN** the URL in the home page's `og:image` tag is requested
- **THEN** it answers 200 with content type `image/png` and a body under 300 KB

### Requirement: A page has one h1 taken from its site map entry

A live page SHALL render exactly one `h1`, and its text SHALL be the `h1` of the page's site map entry. The logo and widget titles SHALL NOT be `h1` elements.

#### Scenario: The home page's h1

- **WHEN** `/` is requested
- **THEN** the response HTML holds exactly one `h1` and its text is "Standard Frame Sizes"

### Requirement: The home page describes the site in structured data

The HTML the server returns for the home page SHALL hold one JSON-LD script whose `@graph` has a `WebSite` (name "Frame Sizes", url) and an `Organization` (name, url, logo), all URLs absolute on `https://framesizes.app`. The site SHALL NOT emit `FAQPage` or `HowTo` markup.

#### Scenario: The home page's JSON-LD

- **WHEN** `/` is requested
- **THEN** the response HTML holds one `application/ld+json` script that parses as JSON, its `@graph` types are `WebSite` and `Organization`, and the logo is `https://framesizes.app/brand/logo-mark-512.png`

### Requirement: robots.txt allows everything and names the sitemap

`/robots.txt` SHALL allow every crawler to fetch every path and SHALL hold one `Sitemap:` line with the absolute URL of the sitemap.

#### Scenario: robots.txt is requested

- **WHEN** `/robots.txt` is requested
- **THEN** it answers 200, holds no `Disallow` rule with a path, and holds the line `Sitemap: https://framesizes.app/sitemap.xml`

### Requirement: The sitemap lists exactly the live pages

`/sitemap.xml` SHALL list the canonical URL of every live page and of every translated version of a live page, and nothing else, each with a `lastmod` equal to the content date in the page's site map entry. It SHALL NOT hold `priority` or `changefreq`.

#### Scenario: Only the home page is live

- **WHEN** `/sitemap.xml` is requested while only the home page is live
- **THEN** it holds one `url` entry, the home page's canonical URL, whose `lastmod` is the home page's content date, and no `priority` or `changefreq` element

#### Scenario: The home page and F2 are live

- **WHEN** `/sitemap.xml` is requested while only the home page and F2 are live
- **THEN** it holds two `url` entries, the home page's canonical URL and `https://framesizes.app/frame-sizes-on-wall`, each with its own content date as `lastmod`, and no `priority` or `changefreq` element

#### Scenario: A page that is not live

- **WHEN** the sitemap entries are built from a site map with one live and one not-live page
- **THEN** only the live page's URL is in the result

#### Scenario: The home page, F2 and G1 are live

- **WHEN** the sitemap entries are built from a site map in which only the home page, F2 and G1 are live
- **THEN** they hold three entries, the home page's canonical URL, `https://framesizes.app/frame-sizes-on-wall` and `https://framesizes.app/gallery-wall-planner`, each with its own content date as `lastmod`

#### Scenario: The live tools and the company pages

- **WHEN** the sitemap entries are built from a site map in which only the home page, F2, G1 and the five company pages are live
- **THEN** they hold eight entries: the home page's canonical URL, `https://framesizes.app/frame-sizes-on-wall`, `https://framesizes.app/gallery-wall-planner`, and `/about`, `/contact`, `/privacy-policy`, `/terms-of-use` and `/refund-policy` on `https://framesizes.app`, each with its own content date as `lastmod`

#### Scenario: A live page with translations

- **WHEN** the sitemap entries are built from a site map in which the extension page X1 is live
- **THEN** they hold X1's English URL and its 27 translated URLs, all with X1's content date as `lastmod`

#### Scenario: Translations of a page that is not live

- **WHEN** the sitemap entries are built from a site map in which X1 is not live
- **THEN** they hold no URL containing `/extensions/gallery-wall-layout-generator`

#### Scenario: The live tools with F3 and the company pages

- **WHEN** `/sitemap.xml` is requested while the home page, F2, F3, G1, the extension page X1 and the five company pages are live
- **THEN** it holds 37 `url` entries: the home page's canonical URL, `https://framesizes.app/frame-sizes-on-wall`, `https://framesizes.app/how-big-is-8x10`, `https://framesizes.app/gallery-wall-planner`, `/about`, `/contact`, `/privacy-policy`, `/terms-of-use` and `/refund-policy` on `https://framesizes.app`, and X1's English URL with its 27 translated URLs, each with its own content date as `lastmod`, and no `priority` or `changefreq` element

### Requirement: Pages below the home page carry breadcrumbs

A live page other than the home page, and a built page that is not live, SHALL show a breadcrumb trail above its `h1`, as a `nav` named "Breadcrumb". The trail SHALL start with "Home" linking to `/`, then, when the page is not its hub's head and that head is live and not the home page, the hub's name linking to the hub head, and end with the page's short name, marked as the current page and not linked. The page's server HTML SHALL hold one JSON-LD script with a `BreadcrumbList` that lists the same items, with absolute URLs on `https://framesizes.app`. The home page SHALL carry neither.

#### Scenario: F2's breadcrumbs

- **WHEN** `/frame-sizes-on-wall` is requested
- **THEN** the response HTML holds a `nav` named "Breadcrumb" reading "Home" then "Frame sizes on your wall", the second marked `aria-current="page"`, and one `application/ld+json` script whose `BreadcrumbList` has two items, the first `https://framesizes.app` and the second `https://framesizes.app/frame-sizes-on-wall`

#### Scenario: No breadcrumbs on the home page

- **WHEN** `/` is requested
- **THEN** the response HTML holds no breadcrumb `nav` and no `BreadcrumbList`

#### Scenario: A hub head keeps two crumbs

- **WHEN** `/gallery-wall-planner` is requested
- **THEN** its breadcrumb `nav` reads "Home" then "Gallery wall layout planner", and its `BreadcrumbList` has two items

#### Scenario: The extension page's breadcrumbs

- **WHEN** `/extensions/gallery-wall-layout-generator` is requested
- **THEN** its breadcrumb `nav` reads "Home", "Gallery wall" linking to `/gallery-wall-planner`, then "Chrome extension" marked `aria-current="page"`, and its `BreadcrumbList` has three items ending `https://framesizes.app/gallery-wall-planner` and `https://framesizes.app/extensions/gallery-wall-layout-generator`

### Requirement: A built page that is not live stays out of the index

A page whose route is built while its site map entry is not live SHALL render with its declared head values plus a robots meta tag holding `noindex`, and SHALL be left out of the sitemap, the header, the footer, Related tools and every in-text link. Setting the entry live SHALL remove the `noindex` with no other edit.

#### Scenario: The extension page before go-live

- **GIVEN** the extension page X1 is not live
- **WHEN** `/extensions/gallery-wall-layout-generator` is requested
- **THEN** it answers 200 with the title "Gallery Wall Layout Generator Chrome Extension | Frame Sizes", one canonical to its own URL, and a robots meta tag holding `noindex`
- **AND** `/sitemap.xml`, the footer and the Related tools on `/gallery-wall-planner` hold no link to it

#### Scenario: Head tags of a page set live

- **WHEN** head tags are built for the extension page's entry with `live: true`
- **THEN** they hold no robots directive

### Requirement: A translated version takes its head values from its translation

The requirements that take a page's title, description, `h1` and `og:locale` from its site map entry cover its English version. A translated version SHALL take those four from its translation instead: the title gets the same " | Frame Sizes" suffix rule, and `og:locale` is the language's own locale. Its canonical, `og:url` and the other social tags SHALL follow the same rules as for the English version, at its own URL.

#### Scenario: The Russian extension page's head

- **WHEN** `/ru/extensions/gallery-wall-layout-generator` is requested
- **THEN** its title and meta description are the Russian ones and its title ends with " | Frame Sizes"
- **AND** it holds one canonical, `https://framesizes.app/ru/extensions/gallery-wall-layout-generator`, `og:url` equals it, and `og:locale` is "ru_RU"

### Requirement: Every language version names all the others

A page that has translated versions SHALL carry, in each version's server HTML, one `link rel="alternate"` with an `hreflang` for every one of its language versions, itself included. Each link's `href` SHALL be that version's canonical URL. One more link, with `hreflang="x-default"`, SHALL point to the English version. A page without translations SHALL carry no `hreflang` links.

#### Scenario: The extension page's language links

- **WHEN** `/extensions/gallery-wall-layout-generator` or `/ja/extensions/gallery-wall-layout-generator` is requested
- **THEN** the response HTML holds 29 `hreflang` links: 28 languages and `x-default`
- **AND** `x-default` and `en` both point to `https://framesizes.app/extensions/gallery-wall-layout-generator`, and the `ja` one to `https://framesizes.app/ja/extensions/gallery-wall-layout-generator`

#### Scenario: A page without translations

- **WHEN** `/` is requested
- **THEN** the response HTML holds no `hreflang` link

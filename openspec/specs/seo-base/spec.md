# seo-base Specification

## Purpose

What a search engine and a link preview read on every page: the record of which pages exist and are live, the head tags, the `h1`, structured data, `robots.txt` and `sitemap.xml`. The values come from the On-page SEO guide; this capability makes them hold on the built HTML.

## Public Interface

```typescript
// apps/web/src/lib/site-map.ts
type HubId = "frames" | "posters" | "photo" | "canvas" | "quality" | "gallery";
type SitePage = { id; path; hub: HubId; name; card?: { question; ratio } } & (
  { live: true; seo: { title; h1; description; lastModified } } | { live: false }
);
const PAGES: readonly SitePage[]; // the 19 launch pages
const HUBS: readonly { id: HubId; name: string; head: PageId }[]; // header order
function page(id: PageId): SitePage;
function livePage(id: PageId): LivePage; // throws when not live
function livePages(pages?): LivePage[];
function liveHubHeads(pages?): (Hub & { path: string })[];
function navHubs(pages?): HubLink[];
function footerGroups(pages?): FooterGroup[];
function fullTitle(title: string): string; // with " | Frame Sizes" unless it names the brand
function checkSiteMap(pages): string[]; // head-limit problems, each naming the page

// apps/web/src/lib/seo.ts
const SITE_URL = "https://framesizes.app";
function absoluteUrl(path: string): string; // "/" is the bare origin
function pageMetadata(page: LivePage): Metadata;
function siteJsonLd(): { "@context"; "@graph": [WebSite, Organization] };
function sitemapEntries(pages?): MetadataRoute.Sitemap;

// apps/web/src/components/site/page-link.tsx
function PageLink(props: { id: PageId; children: ReactNode }): JSX.Element;
```

File conventions: `app/robots.ts`, `app/sitemap.ts`, `app/opengraph-image.tsx`.

## Behavior

A page goes live by setting `live: true` and its `seo` values in `PAGES`; the header, footer, sitemap and every `PageLink` follow from that one edit. Pages export `metadata = pageMetadata(livePage(id))` and render `seo.h1` as their only `h1`.

`absoluteUrl` builds every absolute URL (canonical, `og:url`, sitemap `loc`, JSON-LD), so they always agree. Next renders the canonical of `/` without a trailing slash, and so does `absoluteUrl("/")`.

The social image is prerendered at build time with `ImageResponse` and a committed static TTF (`apps/web/src/assets/fonts/`, OFL). The JSON-LD script escapes `<` as `\u003c`.

`skipTrailingSlashRedirect` is on for the analytics proxy; a `redirects()` rule restores the permanent redirect for every path but `/`, `/ingest/*` and paths that start with a doubled slash.

## Edge Cases

- A live page whose title already contains "Frame Sizes": used as the absolute title, no suffix.
- `?size=11x14` on the home page: the canonical drops the query.
- `//evil.example/`: not redirected, so no protocol-relative `Location`.
- `next dev`: file-based `og:image` URLs point at localhost; the production build uses `metadataBase`.

## Requirements

### Requirement: The site map is the single record of pages

The site SHALL declare each launch page once, with its id, path, hub, short name and whether it is live. A live page SHALL also declare its title, `h1`, description and the date its content last changed. No two pages SHALL share an id or a path, and no two live pages SHALL share a title or a description. A live page's title SHALL be 60 characters or fewer including any suffix, and its description 130 to 155 characters.

#### Scenario: The launch pages are declared

- **WHEN** the site map is read
- **THEN** it holds 19 pages with unique ids and unique paths, every path is lowercase with no trailing slash (the home page is `/`), and the home page, id F1, is live

#### Scenario: A live page breaks a head limit

- **WHEN** a live page's full title is longer than 60 characters, or its description is outside 130 to 155 characters, or it repeats another live page's title or description
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

`/sitemap.xml` SHALL list the canonical URL of every live page and nothing else, each with a `lastmod` equal to the content date in its site map entry. It SHALL NOT hold `priority` or `changefreq`.

#### Scenario: Only the home page is live

- **WHEN** `/sitemap.xml` is requested while only the home page is live
- **THEN** it holds one `url` entry, the home page's canonical URL, whose `lastmod` is the home page's content date, and no `priority` or `changefreq` element

#### Scenario: A page that is not live

- **WHEN** the sitemap entries are built from a site map with one live and one not-live page
- **THEN** only the live page's URL is in the result

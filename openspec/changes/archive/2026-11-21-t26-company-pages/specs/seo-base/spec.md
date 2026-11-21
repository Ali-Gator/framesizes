# Spec Delta

## MODIFIED Requirements

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

- **WHEN** `/sitemap.xml` is requested while only the home page, F2 and G1 are live
- **THEN** it holds three `url` entries, the home page's canonical URL, `https://framesizes.app/frame-sizes-on-wall` and `https://framesizes.app/gallery-wall-planner`, each with its own content date as `lastmod`, and no `priority` or `changefreq` element

#### Scenario: The live tools and the company pages

- **WHEN** `/sitemap.xml` is requested while the home page, F2, G1 and the five company pages are live
- **THEN** it holds eight `url` entries: the home page's canonical URL, `https://framesizes.app/frame-sizes-on-wall`, `https://framesizes.app/gallery-wall-planner`, and `/about`, `/contact`, `/privacy-policy`, `/terms-of-use` and `/refund-policy` on `https://framesizes.app`, each with its own content date as `lastmod`, and no `priority` or `changefreq` element

#### Scenario: A live page with translations

- **WHEN** the sitemap entries are built from a site map in which the extension page X1 is live
- **THEN** they hold X1's English URL and its 27 translated URLs, all with X1's content date as `lastmod`

#### Scenario: Translations of a page that is not live

- **WHEN** `/sitemap.xml` is requested while X1 is not live
- **THEN** it holds no URL containing `/extensions/gallery-wall-layout-generator`

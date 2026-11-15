# Spec Delta

## ADDED Requirements

### Requirement: Pages below the home page carry breadcrumbs

A live page other than the home page SHALL show a breadcrumb trail above its `h1`, as a `nav` named "Breadcrumb". The trail SHALL start with "Home" linking to `/` and end with the page's short name, marked as the current page and not linked. The page's server HTML SHALL hold one JSON-LD script with a `BreadcrumbList` that lists the same items, with absolute URLs on `https://framesizes.app`. The home page SHALL carry neither.

#### Scenario: F2's breadcrumbs

- **WHEN** `/frame-sizes-on-wall` is requested
- **THEN** the response HTML holds a `nav` named "Breadcrumb" reading "Home" then "Frame sizes on your wall", the second marked `aria-current="page"`, and one `application/ld+json` script whose `BreadcrumbList` has two items, the first `https://framesizes.app` and the second `https://framesizes.app/frame-sizes-on-wall`

#### Scenario: No breadcrumbs on the home page

- **WHEN** `/` is requested
- **THEN** the response HTML holds no breadcrumb `nav` and no `BreadcrumbList`

## MODIFIED Requirements

### Requirement: The sitemap lists exactly the live pages

`/sitemap.xml` SHALL list the canonical URL of every live page and nothing else, each with a `lastmod` equal to the content date in its site map entry. It SHALL NOT hold `priority` or `changefreq`.

#### Scenario: Only the home page is live

- **WHEN** `/sitemap.xml` is requested while only the home page is live
- **THEN** it holds one `url` entry, the home page's canonical URL, whose `lastmod` is the home page's content date, and no `priority` or `changefreq` element

#### Scenario: The home page and F2 are live

- **WHEN** `/sitemap.xml` is requested while only the home page and F2 are live
- **THEN** it holds two `url` entries, the home page's canonical URL and `https://framesizes.app/frame-sizes-on-wall`, each with its own content date as `lastmod`, and no `priority` or `changefreq` element

#### Scenario: A page that is not live

- **WHEN** the sitemap entries are built from a site map with one live and one not-live page
- **THEN** only the live page's URL is in the result

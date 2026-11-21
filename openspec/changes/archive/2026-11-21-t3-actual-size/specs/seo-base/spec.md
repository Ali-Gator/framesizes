# Spec Delta

## MODIFIED Requirements

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

#### Scenario: The live tools with F3 and the company pages

- **WHEN** `/sitemap.xml` is requested while the home page, F2, F3, G1 and the five company pages are live
- **THEN** it holds nine `url` entries: the home page's canonical URL, `https://framesizes.app/frame-sizes-on-wall`, `https://framesizes.app/how-big-is-8x10`, `https://framesizes.app/gallery-wall-planner`, and `/about`, `/contact`, `/privacy-policy`, `/terms-of-use` and `/refund-policy` on `https://framesizes.app`, each with its own content date as `lastmod`, and no `priority` or `changefreq` element

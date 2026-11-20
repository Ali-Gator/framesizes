# Spec Delta

## ADDED Requirements

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

#### Scenario: A live page with translations

- **WHEN** the sitemap entries are built from a site map in which the extension page X1 is live
- **THEN** they hold X1's English URL and its 27 translated URLs, all with X1's content date as `lastmod`

#### Scenario: Translations of a page that is not live

- **WHEN** `/sitemap.xml` is requested while X1 is not live
- **THEN** it holds no URL containing `/extensions/gallery-wall-layout-generator`

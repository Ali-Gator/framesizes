## MODIFIED Requirements

### Requirement: The site map is the single record of pages

The site SHALL declare each page once, with its id, path, hub, short name and whether it is live. A live page SHALL also declare its title, `h1`, description and the date its content last changed; a page that is not live MAY declare them ahead of go-live. No two pages SHALL share an id or a path, and no two pages that declare head values SHALL share a title or a description. Every declared title SHALL be 60 characters or fewer including any suffix, and every declared description 130 to 155 characters.

#### Scenario: The launch pages are declared

- **WHEN** the site map is read
- **THEN** it holds 20 pages, the 19 launch pages and the extension page X1, with unique ids and unique paths, every path is lowercase with no trailing slash (the home page is `/`), and the home page, id F1, is live

#### Scenario: A live page breaks a head limit

- **WHEN** a live page's full title is longer than 60 characters, or its description is outside 130 to 155 characters, or it repeats another live page's title or description
- **THEN** the unit suite fails, naming the page

#### Scenario: A page not yet live breaks a head limit

- **WHEN** a page that is not live declares a full title longer than 60 characters, or a description outside 130 to 155 characters, or a title or description another page declares
- **THEN** the unit suite fails, naming the page

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

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: A translated version's breadcrumbs are translated

A translated version SHALL show the same breadcrumb trail as the English page, with every crumb name in its language. The links in its breadcrumb `nav` SHALL point to the English pages. Its `BreadcrumbList` SHALL carry the same translated names, and its last `item` SHALL be the version's own canonical URL.

#### Scenario: The Spanish breadcrumbs

- **WHEN** `/es/extensions/gallery-wall-layout-generator` is requested
- **THEN** its breadcrumb `nav` has three crumbs in Spanish, the first linking to `/` and the second to `/gallery-wall-planner`, and the last is marked `aria-current="page"`

#### Scenario: The last crumb in the Spanish BreadcrumbList

- **WHEN** `/es/extensions/gallery-wall-layout-generator` is requested
- **THEN** its `BreadcrumbList`'s third `item` is `https://framesizes.app/es/extensions/gallery-wall-layout-generator`, the page's canonical URL

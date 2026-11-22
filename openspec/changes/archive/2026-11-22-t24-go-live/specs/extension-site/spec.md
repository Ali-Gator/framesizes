## MODIFIED Requirements

### Requirement: The extension page goes live only with a store id

The extension page SHALL be live only when the extension's Chrome Web Store id is set, and the store id SHALL be 32 letters from a to p. The published listing's id is `khapjkonaofjfljdakdcmodaclkmffgn`. Its store page SHALL be addressed as `https://chromewebstore.google.com/detail/<id>`, which the store redirects to the listing.

#### Scenario: The go-live gate

- **WHEN** the unit suite reads the site map and the store id
- **THEN** the extension page is live exactly when the store id is set, and a set store id matches `^[a-p]{32}$`

#### Scenario: The published listing

- **WHEN** the unit suite reads the store id and the site map
- **THEN** the store id is `khapjkonaofjfljdakdcmodaclkmffgn`, the extension page is live, and the store page is `https://chromewebstore.google.com/detail/khapjkonaofjfljdakdcmodaclkmffgn`

#### Scenario: The extension page once live

- **GIVEN** the extension page is live
- **WHEN** `/extensions/gallery-wall-layout-generator` is requested
- **THEN** it answers 200 with no robots meta tag holding `noindex`, the footer links to it, and one "Get it from the Chrome Web Store" link points to the store page
- **AND** `/gallery-wall-planner` links to it from Related tools and holds the `h2` "Plan on any shop's page"

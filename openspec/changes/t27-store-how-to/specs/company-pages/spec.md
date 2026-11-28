# Spec Delta

## MODIFIED Requirements

### Requirement: The Privacy Policy states what is collected, where and for how long

The Privacy Policy SHALL name the operator and its address, and hold a table with one row per kind of data the site or the extension handles, each giving where it is kept, who can see it and how long it is kept. It SHALL state that the site sets no cookies, that wall photos are read in the browser and never uploaded, and that the extension sends nothing to the operator. It SHALL describe the extension as a browser extension and name no browser, in its main text and in its title and meta description, so that one policy serves every store that lists it.

#### Scenario: The data table

- **WHEN** `/privacy-policy` is requested
- **THEN** the HTML holds a `table` whose header cells read "Data", "Where it is kept", "Who can see it" and "How long", with rows for visit counts, server logs, the unit choice, wall photos, the extension's saved wall and prints, and email

#### Scenario: The privacy promises

- **WHEN** `/privacy-policy` is requested
- **THEN** its main text says the site sets no cookies, that a wall photo is never uploaded, and that the extension itself sends nothing to the operator

#### Scenario: The extension section

- **WHEN** `/privacy-policy` is requested
- **THEN** the HTML holds an `h2` about the browser extension that names each of its permissions (`sidePanel`, `contextMenus`, `activeTab`, `scripting`) with what it is used for

#### Scenario: No browser is named

- **WHEN** `/privacy-policy` is requested
- **THEN** its main text holds none of the whole words "Chrome", "Edge" or "Opera" (case-sensitive), and "Google" appears only as the mail provider

#### Scenario: The head names no browser

- **WHEN** `/privacy-policy` is requested
- **THEN** its `title`, meta description, `og:description` and `twitter:description` hold none of the whole words "Chrome", "Edge" or "Opera" (case-sensitive)

### Requirement: The Terms of Use name the provider and the governing law

The Terms of Use SHALL be numbered sections that name Soft Divisions Limited as the provider, say that sizes are nominal and should be measured, and state that Hong Kong law governs the terms while keeping the mandatory consumer rights of the visitor's country. They SHALL describe the extension as a browser extension and name no browser, so that one set of terms serves every store that lists it.

#### Scenario: The governing law section

- **WHEN** `/terms-of-use` is requested
- **THEN** the HTML holds `h2` headings numbered from "1." in order, one of them "Governing law", and the text under it names Hong Kong

#### Scenario: The terms name no browser

- **WHEN** `/terms-of-use` is requested
- **THEN** its main text, `title` and meta description hold none of the whole words "Chrome", "Edge" or "Opera" (case-sensitive)

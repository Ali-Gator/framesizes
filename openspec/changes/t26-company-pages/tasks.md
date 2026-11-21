# Tasks

Before 1.1, confirm with the user that the address reads "B, G/F, 322 Shanghai Street, Yau Ma Tei, Kowloon, Hong Kong" (they wrote "Hong Kong, Kowloon, Yau Ma Tei, Shanghai St, 322G/F B"). If they correct it, update the proposal, the `company-pages` and `site-shell` deltas, then build with their wording.

## 1. Docs and facts

- [x] 1.1 Add rows A1–A5 to the On-page SEO guide's Per-page map (https://claude.ai/artifact/KbaLF8WnJ2jRWc55r5yfcx) and its meta description and structured data tables, with the values in the proposal's table; note in the guide that the five pages carry no widget and sit in the footer's company row, not a hub. Verify by re-reading the guide; if it now differs from the proposal, the guide wins and the proposal and site map follow it.
- [x] 1.2 In the Tracker, set T26's Status to In progress with change `t26-company-pages`, and add to T21's Notes: "Update the Privacy Policy (/privacy-policy) before ads or affiliate links ship." Verify by reading both rows back.
- [x] 1.3 Read the PostHog project's data retention and Vercel's log retention for the framesizes project (PostHog and Vercel tools, read only) and record both values in design.md decision 8. Verify each value names its source.

## 2. Company details and site map (seo-base, company-pages)

- [x] 2.1 Edit `apps/web/src/lib/__tests__/site-map.test.ts` (approved 2026-11-21): only the 20 → 25 counts and the `it` title "are 20 pages …" → "are 25 pages …". Add tests: A1–A5 are live with no hub and the proposal's paths, titles and h1s; `companyLinks()` returns About, Contact, Privacy policy, Terms of use, Refund policy in that order; `navHubs()` and `footerGroups()` contain none of the five paths. Verify they fail.
- [x] 2.2 Write `apps/web/src/lib/__tests__/company.test.ts`: `COMPANY` holds the legal name, email and address from the `company-pages` spec, and `addressLine()` reads "B, G/F, 322 Shanghai Street, Yau Ma Tei, Kowloon, Hong Kong". Verify it fails.
- [x] 2.3 Add `apps/web/src/lib/company.ts` (design decision 3); make `hub` optional on `PageBase`, add A1–A5 (`live: true`, no hub, `lastModified` the build day) and `companyLinks()` to `site-map.ts` (decisions 1 and 2). Verify 2.1 and 2.2 pass, `checkSiteMap(PAGES)` is `[]`, `pnpm typecheck` is clean, and every other existing unit test passes unedited.

## 3. Footer company row (site-shell)

- [x] 3.1 Add a case to `apps/web/src/components/site/__tests__/site-footer.test.tsx` citing `#scenario-the-company-row`: with `withLive("F1", "A1", "A2", "A3", "A4", "A5")`, the hub groups hold only "Frames", the footer text holds "Soft Divisions Limited" and the address, and `nav[aria-label="Company"]` links the five pages in order. Existing cases stay unedited. Verify it fails.
- [x] 3.2 Give `SiteFooter` a `company` prop (the links) and render the row (design decision 7); pass `companyLinks()` from `app/layout.tsx`. Verify 3.1 passes and the footer still fits 320 px (`e2e/shell.spec.ts` passes).

## 4. The five pages (company-pages)

- [x] 4.1 Write unit tests for `organizationJsonLd()` and the About and Contact graphs in `apps/web/src/lib/__tests__/seo.test.ts` (new cases only): `@id` `https://framesizes.app#organization`, `legalName`, `email`, `address.addressCountry` "HK", and the `AboutPage` / `ContactPage` node. Verify they fail.
- [x] 4.2 Write `e2e/company-pages.spec.ts` against the server HTML, one test per `company-pages` scenario: each page's status, single h1 and breadcrumbs; the Privacy Policy title and canonical; the "Last updated" `time` on the three policies; the Contact `mailto` link, h2s and no `form`; the privacy data table headers and rows and the permissions section; the Terms' numbered h2s and "Governing law" naming Hong Kong; the refund promise; the About and refund-policy JSON-LD; the Terms social image (200, `image/png`, under 300 KB, `og:image:alt` "Terms of Use"); and an axe check with no violations on all five. Verify it fails.
- [x] 4.3 Add `organizationJsonLd()` to `seo.ts`, and `CompanyPage` and `companyOgImage` under `apps/web/src/components/company/` (design decisions 4–6). Verify 4.1 passes.
- [x] 4.4 Build `/about` and `/contact` with their `opengraph-image.tsx`, content as in the proposal, linking live tool pages with `PageLink`. Verify their 4.2 tests pass.
- [x] 4.5 Build `/privacy-policy` from the facts in design decision 8 and the retention values from 1.3, with the data table and the extension permissions section. Verify its 4.2 tests pass and every claim maps to a file named in decision 8.
- [x] 4.6 Build `/terms-of-use` and `/refund-policy` with their social images. Verify their 4.2 tests pass.
- [x] 4.7 Run the `humanizer:humanizer` skill over all new visitor-facing text (five pages, footer row, alt text), keeping every fact, name, address, email, period and SEO-guide keyword. Verify 4.2 still passes.

## 5. Sitemap (seo-base)

- [x] 5.1 Edit `e2e/seo-home.spec.ts` (approved 2026-11-21): the sitemap test cites `#scenario-the-live-tools-and-the-company-pages`, expects eight `url` entries and checks the five company URLs with their `lastmod`. Verify it passes, and `pnpm test:unit` shows the citation gate green.

## 6. Extension store description

- [x] 6.1 Append "\n\nOfficial website: https://framesizes.app/" to `storeDesc.message` in all 28 `apps/extension/public/_locales/*/messages.json`, the label translated per language (design decision 9). Verify every file parses as JSON, every `storeDesc` ends with `https://framesizes.app/`, and no other key changed (`git diff --stat` shows 28 files, one line each).
- [x] 6.2 Add the same line to the end of the long description in the store-listing Google Doc (https://docs.google.com/document/d/1TMWz0VdN7widrUj8JASdWACttfJeCHBb8QQ2QbOwbL0/edit?tab=t.0). Verify by reading the doc back.

## 7. Gates

- [ ] 7.1 Run `pnpm fix`, then `pnpm test`, then the e2e suite; all green.
- [ ] 7.2 Walk the On-page SEO guide's pre-publish checklist for A1–A5 on a local production build and record the result in the PR description.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent; fix findings; log what stays unfixed in `docs/backlog.md`.
- `/opsx:archive`; add the `company-pages` row to `openspec/specs/README.md` (`apps/web/src/lib/company.ts, apps/web/src/app/about/**, apps/web/src/app/contact/**, apps/web/src/app/privacy-policy/**, apps/web/src/app/terms-of-use/**, apps/web/src/app/refund-policy/**, apps/web/src/components/company/**`) and re-add Public Interface, Behavior and Edge Cases to the new main spec.
- Tracker: T26 Done and a Log line.
- Push, open the PR to `main`, auto-merge with a merge commit.
- Tell the user to paste the new store descriptions into the Chrome Web Store dashboard and set its privacy policy URL to `https://framesizes.app/privacy-policy`, and that the legal texts are not a lawyer's review.

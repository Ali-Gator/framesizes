# Tasks

Order inside every group: spec delta is already written, so tests first (each citing its scenario as `{@link openspec/specs/<capability>/spec.md#<anchor>}`), then code. Before writing Next.js code, read the bundled docs named in the task (`apps/web/node_modules/next/dist/docs/01-app/…`), as `apps/web/AGENTS.md` requires.

## 1. Set-up

- [x] 1.1 Create branch `t1-site-shell` from `main`; verify `git status` is clean and `pnpm test:unit` passes before any edit.
- [x] 1.2 Ask the user to approve the edit to `e2e/home.spec.ts` (the `h1` assertion changes from "Frame Sizes" to "Standard Frame Sizes"). Do not start 4.4 without the yes; verify the answer is recorded in the PR description.
- [x] 1.3 Add dev dependencies `jsdom` and `@axe-core/playwright` at the workspace root, and set the JSX transform to `automatic` in `vitest.config.ts`; verify with a throwaway `.test.tsx` that renders `<p>ok</p>` through `renderToStaticMarkup` (delete it after).

## 2. Tokens and fonts

- [ ] 2.1 Write `e2e/shell-theme.spec.ts`: light background under `colorScheme: "dark"`, body font is Schibsted Grotesk, no request to `fonts.googleapis.com` / `fonts.gstatic.com`; verify the three tests fail for the right reason.
- [ ] 2.2 Copy the light tokens from the design system's `tokens.css` into `apps/web/src/app/globals.css` (`:root`, `color-scheme: light`), map them in `@theme inline`, add the type styles (`display-xl`, `display`, `h2`, `h3`, `body-lg`, `body`, `small`, `label`, `measure`, `measure-xl`) and the 2px `focus` ring; verify `bg-wall`, `text-ink`, `font-mono` and `rounded-lg` resolve to the token values in the browser.
- [ ] 2.3 Read `01-getting-started/` font docs, then load `Schibsted_Grotesk` and `IBM_Plex_Mono` with `next/font/google` in `layout.tsx` and wire their variables to `--font-sans` / `--font-mono`; verify 2.1 passes.

## 3. Site map and the live-link rule

- [x] 3.1 Write `apps/web/src/lib/__tests__/site-map.test.ts` for both scenarios of "The site map is the single record of pages" (19 pages, unique ids and paths, path shape, F1 live, limits on live pages checked against a fixture that breaks each one); verify it fails.
- [x] 3.2 Implement `apps/web/src/lib/site-map.ts`: the 19 pages from the guide's Per-page map (id, path, hub, name, card question and ratio from the approved canvas), `live` as a discriminant that requires `seo`, F1 live with the proposal's row and today's date as `lastModified`; helpers `page`, `livePages`, `liveHubHeads` and a `checkSiteMap` function the test calls; verify 3.1 passes.
- [x] 3.3 Write the `PageLink` tests (live → `a[href]`, not live → text only) with `renderToStaticMarkup`, then implement `apps/web/src/components/site/page-link.tsx`; verify the tests pass.

## 4. Head tags, structured data, robots, sitemap, social image

- [x] 4.1 Read `03-api-reference/04-functions/generate-metadata.md` and `03-file-conventions/01-metadata/*.md`. Write `apps/web/src/lib/__tests__/seo.test.ts`: suffix rule (fixture page "Poster Sizes: Standard Dimensions Chart"), absolute title for F1, canonical for `/poster-sizes`, Open Graph fields, `siteJsonLd` graph, sitemap entries from a live + not-live fixture; verify it fails.
- [x] 4.2 Implement `apps/web/src/lib/seo.ts` (`pageMetadata`, `siteJsonLd`, `sitemapEntries`) and set the layout's `title: { default, template: "%s | Frame Sizes" }`; verify 4.1 passes.
- [x] 4.3 Write `e2e/seo-home.spec.ts` against the raw response of `request.get("/")` and `/?size=11x14`: title, description, one canonical without the query, no robots meta, nine social tags, one `h1` "Standard Frame Sizes", JSON-LD graph, `/robots.txt`, `/sitemap.xml`, the `og:image` URL (200, `image/png`, under 300 KB), every internal `href` answers 200; verify it fails.
- [x] 4.4 With the approval from 1.2, change the one assertion in `e2e/home.spec.ts` to the new `h1`. Update `apps/web/src/app/page.tsx`: `export const metadata = pageMetadata("F1")`, the `h1` from the registry, the JSON-LD script (escape `<`), and keep one placeholder line under the `h1`; verify the head and `h1` tests of 4.3 pass.
- [x] 4.5 Add `apps/web/src/app/robots.ts` and `sitemap.ts`; verify their 4.3 tests pass and `pnpm build` lists both as static.
- [x] 4.6 Commit `SchibstedGrotesk-ExtraBold.ttf` (from the Google Fonts repository, with its OFL licence file) under `apps/web/src/assets/fonts/` and add `apps/web/src/app/opengraph-image.tsx` (1200 × 630, `h1` text of at least 48px inside the centre 1080 × 566, logo mark, `alt` by the guide's formula); verify the image test of 4.3 passes and open the PNG to check it by eye.

## 5. The shell

- [ ] 5.1 Write the header and footer markup tests (`renderToStaticMarkup`, fixture link lists): two live hubs in order with `aria-current`, one live hub → no links and no button, menu button attributes, footer groups and note; and the jsdom test for the menu toggle (`act` + click twice); verify they fail.
- [ ] 5.2 Implement `components/ui/segmented-control.tsx` (radiogroup, arrow keys, roving focus, `md` and `sm`) and `components/ui/icons.tsx` (`menu`, `x`) from the design system's guidelines and `bundle.css` values; verify with a markup test that the group has its label and exactly one checked radio.
- [ ] 5.3 Implement `apps/web/src/lib/unit.ts` (design decision 10) and `components/site/unit-toggle.tsx`; write `e2e/shell-unit.spec.ts` (first visit "in", "cm" survives a reload with no unit in the URL, storage that throws keeps working); verify it passes.
- [ ] 5.4 Implement `components/site/site-header.tsx`, `hub-nav.tsx` and `site-footer.tsx`, and render them around `main` in `layout.tsx`; verify 5.1 passes and write + pass the e2e test for "Every page renders inside one shell".
- [ ] 5.5 Read `03-file-conventions/not-found.md`, add `apps/web/src/app/not-found.tsx` (heading "Page not found", links to live hub heads) and its e2e test (status 404, heading, link to `/`); verify it passes against the production build (`CI=1 pnpm test:e2e`).
- [ ] 5.6 Write the e2e tests for "Visits are measured without cookies" (no cookie; first-party with a dummy token and `/ingest` stubbed by `page.route`; no token, no request, no console error) and for the trailing-slash redirect; verify they fail.
- [ ] 5.7 Read PostHog's Next.js guide and the bundled `instrumentation-client.md`, `rewrites.md`, `redirects.md` and `skipTrailingSlashRedirect.md` docs. Get the PostHog region and project token (PostHog MCP project lookup, else ask the user; never assume US) and write them to `.env.local`. Add `posthog-js`, `apps/web/src/instrumentation-client.ts` (design decision 12), the `/ingest` rewrites, `skipTrailingSlashRedirect` with the replacement redirect, and an empty token in the Playwright `webServer` env; verify 5.6 passes and a production build's LCP and INP in Lighthouse are no worse than before the change.
- [ ] 5.8 With the user's yes (or by the user): set the token and host as Vercel environment variables, and switch on Cookieless tracking and Web Vitals in the PostHog project; verify a local visit with the real token appears in PostHog and the project shows no `cookieless_*` ingestion warning.

## 6. Whole-page checks and hand-over

- [ ] 6.1 Write `e2e/shell-a11y.spec.ts`: axe (WCAG 2.2 A + AA tags) on `/` and a 404 page at 390 × 844 and 1280 × 800, and no horizontal overflow at 320 × 568; verify it passes, fixing the shell (not the test) on any violation.
- [ ] 6.2 Run `pnpm fix`, then `pnpm test`; verify both are green and that `pnpm build` reports `/`, `/robots.txt`, `/sitemap.xml` and the social image as static.
- [ ] 6.3 Walk the guide's pre-publish checklist on the built HTML of `/` for the checks this change owns (2–7, 14–15 where they apply to the shell); record the result per check in the PR description and log anything open as a `BL-nn` item.
- [ ] 6.4 Update `docs/home-page-design.md`: delete the "Open: shell (T1)" items and the SEO items this change closed (title/description/canonical/social tags, JSON-LD, `robots.ts`/`sitemap.ts`/404); verify only T2 items remain.
- [ ] 6.5 Add backlog items for what is deliberately left out: dark theme (deferred — a reviewed dark design), `www`/`http` one-hop redirect check (gated — DNS live; or route to T22 if the Tracker row already covers it); verify `_Next id:_` is bumped.
- [ ] 6.6 After the PR's preview deploy, check with `curl -I` that the preview URL carries `X-Robots-Tag: noindex` from the host, and that a visit to the preview appears in PostHog's Web Analytics; record both in the PR.

## Workflow follow-up

- Phase review in a fresh `general-purpose` subagent (`phase-review` skill), fix findings, log the rest in `docs/backlog.md`.
- `/opsx:archive`; then re-add Public Interface, Behavior and Edge Cases to `openspec/specs/site-shell/spec.md` and `openspec/specs/seo-base/spec.md`, and add the two rows from `design.md` to `openspec/specs/README.md`.
- Tracker: set T1 to Done and add the Log line.
- Push, open the PR to `main`, name the added `BL-nn` ids, turn on auto-merge with a merge commit.

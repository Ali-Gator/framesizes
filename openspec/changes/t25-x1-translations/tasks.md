# Tasks

Branch `t25-x1-translations` off `main` before the first commit.

No existing test is edited without the user's yes. All tests below are new files or new cases. If an existing case breaks, ask the user before changing it.

## 1. Gate: the picker design

- [x] 1.1 Wait for the user's approved picker canvas: trigger, dialog, search, grid, current and hover states, no-match state, and phone layout. Record its link under Design source in `CLAUDE.md` (T25 line, approval date). Verify that the link is in `CLAUDE.md`. Approved 2026-11-20 (https://claude.ai/artifact/DkYgEZL6NprbwHUPYdoL5G, phone option A), and recorded.

## 2. Language list (localization)

- [x] 2.1 Check the hreflang values for Norwegian, Filipino and Chinese Simplified against Google's "Tell Google about localized versions of your page" documentation, and note the chosen values with their source in `lib/locales.ts`. Verify that the note exists.
- [x] 2.2 Write `apps/web/src/lib/__tests__/locales.test.ts`, citing `localization/spec.md`:
  - "The language list": 28 entries, unique lowercase codes, unique hreflang values, English first, and the 27 named codes.
  - "Arabic reads right to left".
  - `matchLanguage` for "Searching in English and in Russian", "Diacritics are ignored", "Both Portuguese entries match" and "No match", plus an empty or whitespace-only query matching every language.

  Verify it fails.

- [x] 2.3 Implement `apps/web/src/lib/locales.ts` (`LOCALES`, `matchLanguage`) per design ("Language list"), with each entry's `ogLocale`, `flag` and `font`. Verify that 2.2 passes.
- [x] 2.4 Copy the 28 4×3 flag SVGs from `flag-icons` (MIT) into `apps/web/public/flags/<country>.svg`, with a `LICENSE` note in the folder. Verify that every `LOCALES[].flag` resolves to a file: one case in 2.2.

## 3. Shared page body and English dictionary (extension-site)

- [x] 3.1 Move X1's JSX into `components/extension/how-to.tsx` as `ExtensionHowTo({ copy, locale })`, with every visitor-facing string in `components/extension/copy/en.ts`, from which `ExtensionCopy` is derived. Turn the strings in `PinPicture`, `MenuFigure` and the figure labels, and the `StoreLink` label, into props with English defaults. Verify:
  - `pnpm test:unit` passes, so `ExtensionSection` on G1 and F2 is unchanged.
  - The existing `e2e/extension-page.spec.ts` passes unedited.
  - The English page's server HTML diff before and after is empty. Capture it with `curl` from `next start`.
- [x] 3.2 Wrap the body in `<div lang dir>`, wrap the English-only words in `<span lang="en">`, and switch `extension.css` from physical to logical properties. Verify that the English HTML diff now shows only the wrapper and the spans.

## 4. Translated route and head tags (seo-base, extension-site)

- [x] 4.1 Write unit tests in `apps/web/src/lib/__tests__/seo.test.ts`, as new cases:
  - "The Russian extension page's head": `localizedMetadata` gives a Russian title with the suffix, a self canonical, the same `og:url` and `og:locale` "ru_RU".
  - "The extension page's language links": 29 `alternates.languages`, with `x-default` and `en` pointing to English.
  - "A page without translations": the home page's metadata has no `languages`.
  - "A live page with translations" and "Translations of a page that is not live": `sitemapEntries` with an X1-live fixture holds 28 X1 URLs with X1's `lastmod`, and the real site map holds none.
  - "A translated version before go-live": `noindex` while X1 is not live.

  Verify they fail.

- [x] 4.2 Add a new test file, `apps/web/src/components/extension/__tests__/copy-limits.test.ts`, for "A translation breaks a head limit": every dictionary's title ≤ 60 characters with " | Frame Sizes", description 1–160 characters, and titles and descriptions unique across languages, failing with the language named. Verify it passes for `en`, and that a fixture with a 61-character title fails.
- [x] 4.3 Implement `localizedMetadata` and the hreflang alternates for the English X1 too, `sitemapEntries` translated URLs, and `breadcrumbJsonLd`'s optional crumbs, in `lib/seo.ts`. Implement `app/[locale]/extensions/gallery-wall-layout-generator/page.tsx` (`generateStaticParams`, `dynamicParams = false`), along with the `opengraph-image.tsx` re-export and the CSS import. Translated versions leave out `RelatedTools`. Verify that 4.1 passes and every existing `seo.test.ts` and `sitemap` case passes unedited.
- [x] 4.4 Add `apps/web/src/app/[locale]/**` to the `extension-site` row of `openspec/specs/README.md`. Verify that the mapping test in `scripts/__tests__/` passes: rows never overlap, and every row matches a file.

## 5. Language picker (localization, site-shell)

- [x] 5.1 Write `apps/web/src/components/i18n/__tests__/language-picker.test.tsx` (jsdom), mocking `usePathname`:
  - "Opening the picker on the Russian version": 28 links, `aria-current="page"` on Русский, and Deutsch's `href`.
  - "Closing the picker": focus returns to the button.
  - "Switching from the pin steps": the click target keeps `?pinned=0#pin`.
  - The four search scenarios, including the no-match line.
  - "The extension page's header": the button's accessible name contains "English", and the dialog adds no heading element.
  - "A page without translations": on `/`, and with a null pathname, the island renders nothing.

  Verify it fails.

- [x] 5.2 Build `components/i18n/language-picker.tsx` and `components/i18n/picker-copy.ts` to the approved canvas and design "Picker": the trigger (globe-only below 600px), the native `<dialog>`, server-rendered links, the search and the no-match hint. `picker-copy.ts` holds the picker's strings for all 28 languages. Add `TRANSLATED_PATHS` to `lib/locales.ts`, and mount the island in `SiteHeader`'s right-hand group, before the Units toggle. Run `humanizer:humanizer` over the new English picker strings. Verify that 5.1 passes, and that the existing `site-header.test.tsx`, `shell-a11y.spec.ts` and `gallery-wall-phone.spec.ts` pass unedited.

## 6. Translations (extension-site)

- [x] 6.1 Collect Chrome's own labels per language from Chromium's `generated_resources_<lang>.xtb`: the Extensions menu title, "No access needed", its sub-line, "Manage extensions", "Copy image" and "Inspect". Note the message ids in `copy/en.ts`. Verify that German gives "Erweiterungen".
- [x] 6.2 Write the 27 dictionaries `copy/<code>.ts` (`satisfies ExtensionCopy`): plain translations of X1's SEO row and body, with "Gallery Wall Layout Generator" and "Try on my wall" kept in English, local quotation marks, and the Arabic pin text saying "top left". Do one review pass per language against the English. Verify that `pnpm typecheck` and 4.2 pass for all 28.

## 7. End-to-end and fonts

- [x] 7.1 Write `e2e/extension-page-locales.spec.ts`, citing the spec scenarios:
  - Russian heading outline and `lang="ru"`.
  - Arabic `dir="rtl"`.
  - Japanese pin mode at `?pinned=0`.
  - German pin picture "Erweiterungen".
  - French "Try on my wall".
  - Spanish breadcrumbs.
  - No Related tools in Italian.
  - Polish `noindex`.
  - `/en/…` and `/xx/…` give 404.
  - `Accept-Language: ru` gets English with no redirect.
  - Picker: open, search "russian" and "русский", and switch from `?pinned=0#pin` to Deutsch.
  - "The language button on a phone": on `/ru/…` at 375 px, a globe with no visible text, an accessible name containing "Русский", and no horizontal scroll.
  - The header on `/ru/…` and `/de/…` at 320 px: no horizontal scroll.
  - No language button in the header on `/`.
  - axe on ru, ar and ja in both modes.
  - de and fi at 320 px with no horizontal scroll.
  - Hungarian "ő" and Polish "ł" render in Schibsted Grotesk: computed `font-family` on the wrapper, plus `document.fonts.check`.

  Verify that `pnpm test` passes.

- [x] 7.2 Run `pnpm fix` then `pnpm test` (the phase gate). Verify both pass.

## 8. Docs and backlog

- [x] 8.1 Add backlog items:
  - "Mirrored pin picture for Arabic Chrome".
  - "Translated OG image alt".
  - A note on BL-70 that translated labels are longer.

  Verify that `_Next id:_` advanced.

- [x] 8.2 In the On-page SEO guide (docs tools), change the hreflang row from "None" to "X1: 28 languages at `/<code>/…`, `x-default` English", and add one line to X1's note. Verify by reading the row back.

## Workflow follow-up

- Phase review (`phase-review` skill, `/code-review high` in a fresh subagent), fix the findings, and log the rest in `docs/backlog.md`.
- `/opsx:archive`. Then:
  - Add the `localization` row to `openspec/specs/README.md`: `apps/web/src/lib/locales.ts, apps/web/src/components/i18n/**`.
  - Re-add Public Interface, Behavior and Edge Cases to the new `openspec/specs/localization/spec.md`.
  - Update `extension-site`'s Public Interface (`ExtensionHowTo`, the copy dictionaries, the string props).
- Tracker: T25 set to Done, plus a Log line.
- Push, open a PR to `main`, and turn on auto-merge (merge commit).

# Proposal: X1 in 28 languages

## Why

The Chrome extension "Gallery Wall Layout Generator" is about to be offered to people outside the US. The page it opens after install, X1 (`/extensions/gallery-wall-layout-generator`), is English only. This change translates that one page into 27 more languages and adds a language picker to it. It also sets up the URL, head-tag and picker pattern that the whole-site translation will reuse later.

Scope is X1 only, as the user asked ("now we are translating only after install page, no more"). The extension itself, its UI, its store listing, the site shell and every other page stay English.

## What Changes

- **28 language versions of X1.** English stays at `/extensions/gallery-wall-layout-generator`. Every other language is served at `/<locale>/extensions/gallery-wall-layout-generator` with a lowercase locale segment. The languages are those in the user's reference picker: English, العربية, Deutsch, Ελληνικά, Español, Eesti, Suomi, Français, हिन्दी, Hrvatski, Magyar, Indonesia, Italiano, 日本語, 한국어, Nederlands, Norsk, Polski, Português (Portugal), Русский, Svenska, ไทย, Português (Brasil), Filipino, 中文 (简体), Türkçe, Українська and Tiếng Việt.
  - Each version holds the same sections, both modes (pin and usage), the pin poll and the store link, all in its own language.
  - Two names stay in English in every version because the extension is not translated: "Gallery Wall Layout Generator" and the "Try on my wall" label.
  - Chrome's own labels drawn in the pin picture and the right-click figure ("Extensions", "Manage extensions", "Copy image", "Inspect") use Chrome's real translations for each language.
- **Language picker in the site header, on translated pages only.** The header shows a language button, next to the in | cm toggle, on every version of a page that has translations (only X1 for now). Every other page's header stays as it is. The button opens a modal list of the 28 languages. Each entry links to that language's version and shows its native name and a flag. A search field filters the list by native name, English name or language code, ignoring case and diacritics, so both "Russian" and "русский" find Русский. Switching keeps `?pinned=0` and the `#pin`/`#usage` hash.
  - The look follows the approved canvas (https://claude.ai/artifact/DkYgEZL6NprbwHUPYdoL5G, approved 2026-11-20). From 600px wide the button shows a globe and the native name. Below 600px it is a globe-only button whose accessible name holds the language.
- **Head tags per version:**
  - a self-referencing canonical
  - title, description and `h1` as a plain translation of X1's SEO row (the user chose translation over native keyword research)
  - `og:locale` per language
  - hreflang links to all 28 versions plus `x-default` pointing to English
  - `noindex` tied to X1's existing `live` flag, so go-live stays one edit
  - the sitemap lists the translated versions once X1 is live
- **Breadcrumbs** are translated, in both the visible trail and the `BreadcrumbList`. Their links still point to the English pages.
- **Unknown locales answer 404.** `/en/...` and `/xx/...` are not served. Nothing redirects visitors by browser language.

## Capabilities

### New Capabilities

- `localization`: the list of site languages (code, hreflang, native and English names, text direction), the `/<locale>/` URL scheme, and the language picker with its search. The whole-site translation grows this capability later.

### Modified Capabilities

- `extension-site`: X1 exists in 28 languages with the same content and modes, translated breadcrumbs, Chrome's own labels in the drawings, and head limits for translated titles and descriptions.
- `site-shell`: the header shows the language button on pages that have translations, and nothing new on any other page.
- `seo-base`: a translated version takes its head values from its translation and not from its site map entry, every version names all the others through hreflang, and the sitemap lists the translated versions of a live page.

## Not in this change

- **Extension UI, `_locales`, store listing translations, the footer, and other pages.** Out of scope, per the user. The header gains only the language button; its other parts stay English.
- **Opening X1 in the browser's language after install.** That needs an `apps/extension` change, which the user ruled out. Visitors switch with the picker.
- **Backlog items in X1's area:**
  - BL-68 (a reload after the self-switch shows the pin steps) and BL-69 (the poll wakes in a hidden tab): mode-switch polish, unrelated to translation. They stay parked to respect the "no more" scope.
  - BL-70 (the pin picture is hard to read on a phone): longer translated labels make it slightly worse. It stays parked for the same reason, and its entry gets a note about the translations.

## Impact

- **New route.** `apps/web/src/app/[locale]/extensions/gallery-wall-layout-generator/` holds the page, a re-exported `opengraph-image` and the CSS import.
- **New code.**
  - `apps/web/src/lib/locales.ts` (the language list and search match)
  - `apps/web/src/components/i18n/**` (the picker and its own strings per language)
  - `apps/web/src/components/extension/copy/*.ts` (one typed dictionary per language)
  - `apps/web/src/components/extension/how-to.tsx` (the page body, shared by the English and translated routes)
- **Edited code.**
  - The English X1 `page.tsx` renders the shared body with the English dictionary, and its rendered HTML stays the same apart from the header's picker button.
  - `components/site/site-header.tsx` mounts the picker, which renders nothing on pages without translations.
  - `PinPicture`, the figures and `StoreLink` take their strings as props.
  - `seo.ts` gets hreflang alternates and the translated head values.
  - `sitemap.ts` lists the translated versions.
- **Assets.** 28 flag SVGs copied into `apps/web/public/flags/` from `flag-icons` (MIT). This adds no runtime dependency.
- **Docs.**
  - `openspec/specs/README.md`: the X1 row covers `[locale]`, and a `localization` row is added at archive.
  - The SEO guide's hreflang row changes from "None" to the X1 pattern.
  - The Tracker gets row T25.
  - `CLAUDE.md`'s Design source records the approved picker design (done, 2026-11-20).
- **Build.** 27 more statically rendered pages. No new environment variables and no paid calls: the translations are written in-session.

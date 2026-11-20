# Design

## Context

X1 (`apps/web/src/app/extensions/gallery-wall-layout-generator/page.tsx`) is one server component with its English copy inline. It gets its head tags from `pageMetadata(builtPage("X1"))` in `lib/seo.ts`. The page renders two client islands: `ModeSwitch` and, once live, `StoreLink`. The drawings, `PinPicture` and the figures, hold English text in their SVG and HTML.

The root layout hardcodes `<html lang="en">`, and the header and footer are English. Next.js 16 serves the site statically on Vercel. Schibsted Grotesk ships only the `latin` and `latin-ext` subsets.

See proposal.md for scope. The requirements are in the three spec deltas.

## Goals / Non-Goals

**Goals:**

- One page body, rendered from one typed dictionary per language. The English page renders through the same body.
- A URL, head-tag and picker pattern the whole-site translation can reuse without moving the existing routes.
- The English page's HTML stays as it is, except for the new picker button and the hreflang links.

**Non-Goals:**

- No i18n library, no locale middleware, and no redirect by language.
- No translated site shell. The `<html lang="en">` stays, and the header gains only the language button; everything else in it stays English.
- No machine-translation pipeline. The translations are written in-session and committed as code.

## Decisions

### URL: a top-level `[locale]` segment with lowercase codes

The translated page lives at `app/[locale]/extensions/gallery-wall-layout-generator/page.tsx`. It sets `generateStaticParams()` from the 27 non-English locales and `dynamicParams = false`, so `/en/…` and `/xx/…` give Next's real 404.

The codes in the path are lowercase, to keep seo-base's lowercase-path rule (`pt-br`, `zh-cn`). The hreflang values keep their standard casing (`pt-BR`).

_Alternative:_ route groups with one root layout per language (`(en)` and `[locale]`). That would let `<html lang>` change per language, but it moves every existing route and breaks every README glob. We don't need it while the header and footer are English, so we don't take it.

_Alternative:_ a suffix (`/extensions/…/ru`). That breaks the later whole-site pattern, where the prefix is the norm.

The README row for `extension-site` gains `apps/web/src/app/[locale]/**`. The spec hook escapes `[` and `]` before it builds its regex (`scripts/hooks/check-spec-exists.sh`), so the literal glob matches the real directory. When the whole site is translated, that glob moves to whichever capability owns the shared `[locale]` tree.

### `lang` and `dir` on the content wrapper, not on `<html>`

The page body renders inside `<div lang={hreflang} dir={dir}>`. The header and footer are English, so `<html lang="en">` with a translated content block is the true markup and needs no layout change. Arabic gets `dir="rtl"`. The English words inside a translation (the extension name and "Try on my wall") are wrapped in `<span lang="en">`.

The `extension.css` rules get audited for physical properties (`left`, `margin-right`, `text-align: left`) and switched to logical ones. The drawings stay `dir="ltr"`: they picture Chrome, whose layout we draw once.

### Copy: one typed dictionary per language

`components/extension/copy/en.ts` exports the English strings and the `ExtensionCopy` type derived from them. Each other language is `copy/<code>.ts` with `satisfies ExtensionCopy`, so a missing or extra key fails `tsc`. No test duplicates that check.

The dictionary holds:

- the head values (title, `h1`, description) and the breadcrumb names
- every sentence, split around inline elements (the `#pin` link, the door's `<U>`, the English label)
- the FAQ, the three steps and the permission rows
- the Chrome UI labels for the drawings

The picker's own strings are not in `ExtensionCopy`, because the picker lives in the header, outside the page body. They sit in `components/i18n/picker-copy.ts`, one entry per locale: the button's name prefix ("Язык"), the dialog title, the search label, the search placeholder, the close label, the no-match line and the no-match hint.

`components/extension/how-to.tsx` takes over the page's JSX from `page.tsx` as `ExtensionHowTo({ copy, locale })`. Both routes render it. `PinPicture`, `MenuFigure`, `StoreLink` and the figure labels take their strings as props, with the English text as default. That keeps G1's and F2's `ExtensionSection` untouched.

_Alternative:_ `next-intl` or ICU message files. They solve plurals and runtime switching, which one static page doesn't need, and they would add a dependency.

### Head values live in the dictionaries, not in `PAGES`

The site map keeps one X1 entry. Adding 27 entries would break seo-base's page count, its 130–155 description floor and its "one record per page" meaning. It would also force edits to existing tests, which the user must approve.

A new `localizedMetadata(page, locale, seo)` in `lib/seo.ts` builds on `pageMetadata`. It sets the title, description, canonical, `og:url` and `og:locale` from the translation, and `alternates.languages` for all 28 plus `x-default`. The English X1 page gets the same `alternates.languages` through the same helper.

`noindex` comes from `pageMetadata`'s existing `live` check, so go-live stays one edit. A unit test enforces the head limits for translations: title ≤ 60 with the suffix, description 1–160 characters, and unique.

`sitemapEntries` adds the translated URLs of any live page that has translations. For now that is X1, read from the locale list.

### Social image: re-export the English one

`[locale]/…/opengraph-image.tsx` re-exports the English route's image module. The OG font (`og-font.ts`) has no glyphs for most of these scripts, and the image's text is the English product name anyway. The alt stays English, an accepted gap that the whole-site pass can revisit.

### Breadcrumbs

`breadcrumbTrail(X1)` stays as it is. The page maps each crumb's name through the dictionary, keyed by crumb path, before it passes the crumbs to `Breadcrumbs` and `breadcrumbJsonLd`. `breadcrumbJsonLd` gets an optional `crumbs` argument so the JSON-LD carries the translated names. The links keep their English targets.

### Language list: hand-written, not `Intl.DisplayNames`

`lib/locales.ts` exports `LOCALES` (28 entries, each with `code`, `hreflang`, `ogLocale`, `native`, `english`, `region?`, `dir`, `flag` and `font`) and `matchLanguage(query, locale)`.

The names are hand-written. The native names must match the reference exactly ("Indonesia", "中文 (简体)"), and `Intl.DisplayNames` output differs between engines.

The match folds case with `toLocaleLowerCase("und")`, removes diacritics with NFD and a strip of `\p{M}`, and trims the query. It then tests `includes` against the native name, the English name and the code. "РУССКИЙ" folds to "русский", and "espanol" matches "Español".

The hreflang values for Norwegian (`no` or `nb`), Filipino (`fil` or `tl`) and Chinese Simplified (`zh-CN` or `zh-Hans`) are checked against Google's hreflang documentation at apply. The spec names these languages, not their codes.

### Picker: in the site header, native `<dialog>`, links in the server HTML

The look follows the approved canvas: https://claude.ai/artifact/DkYgEZL6NprbwHUPYdoL5G, approved 2026-11-20 and recorded in `CLAUDE.md` under Design source.

`components/i18n/language-picker.tsx` is a client island that `SiteHeader` mounts in its right-hand group, before the Units toggle.

- **Where it shows.** The island reads the path with `usePathname()`. It strips a leading locale segment and looks the rest up in `TRANSLATED_PATHS` (in `lib/locales.ts`, only X1 for now). When the path has no translations, or `usePathname()` returns null (as in jsdom), it renders nothing. The pages are prerendered, so the button and the links are in the server HTML of every X1 version and absent everywhere else, with no layout shift.
- **Trigger.** A `<button aria-haspopup="dialog" aria-expanded>` with a globe icon. From 600px wide it shows the native name (with `lang`) and a chevron, behind a visually hidden prefix ("Язык: "). Below 600px it is a 44px globe-only button with `aria-label` "<prefix>: <native name>". At 375px the header row has no room for the name next to the lockup, the Units toggle and the menu button.
- **Open and close.** The button opens a `<dialog>` with `showModal()`. Escape, the close button and a backdrop click all close it, and focus returns to the button. Opening puts focus in the search field.
- **Layout.** On desktop the dialog is 760 × 720 (capped at the viewport height less 64px), with 3 columns filled row by row in `LOCALES` order. Below 600px it is a full-height sheet with 2 columns. The dialog keeps its height while the visitor types, so it doesn't jump; the list scrolls inside it, and the title and search field stay put.
- **Links.** The 28 entries are `<a href hreflang>` links rendered on the server inside the dialog, so the links exist with no JS. Each shows a flag, then the native name with `lang` and `dir="auto"`. The two Portuguese entries show a second line: "Portugal" and "Brasil".
- **Current language.** Marked with `aria-current="page"`, a `tape-soft` fill, an ink border, bold text and a check icon, so it doesn't rely on colour alone.
- **Keeping state.** On click, the handler adds `location.search` and `location.hash` to the target, so `?pinned=0#pin` survives the switch.
- **Search.** The field has a visually hidden label, 16px text and a 48px height. It filters the entries with `matchLanguage` by toggling `hidden`. A polite live region announces the no-match line and its hint, which points to the English or native name. Names of languages written in the page's own language ("португальский") are not searched: that would take 27 × 28 more strings.
- **Headings.** The dialog's title is a styled `<p>` named through `aria-labelledby`, so the page's heading outline doesn't change.
- **Direction.** The dialog takes the current language's `lang` and `dir`, and its styles use logical properties, so on the Arabic page the title and close button swap sides, the search icon moves right, and the grid fills right to left. The header around the button stays the English LTR shell.
- **Flags.** They are decorative (`alt=""`): SVGs copied from `flag-icons` (MIT, 4×3) into `public/flags/`, with the licence noted in the folder. The picks are English = US, Arabic = Saudi Arabia, Spanish = Spain, Portuguese = Portugal and Brazil, Chinese = China, and each other language its own country. The trigger shows a globe, not a flag, so no flag stands for the current language.

_Alternative:_ the Popover API with `popovertarget`. It needs no JS, but it isn't modal, so focus can leave the dialog. Its open/close isn't the part that matters: search needs JS anyway.

_Alternative:_ the button in the page's top block, next to the breadcrumbs, as first planned. The user chose the header, where the whole-site picker will live anyway.

_Alternative:_ on phones, the button with its name on its own header row. That costs 52px on every translated page, so the user chose the globe-only button.

### Fonts

Each locale's `font` is either `brand` or `system`. Languages whose script Schibsted lacks get the `system` stack (`system-ui, sans-serif`) on the content wrapper: Arabic, Greek, Hindi, Japanese, Korean, Russian, Thai, Ukrainian, Chinese and Vietnamese. This keeps one face per sentence, without mixing Schibsted Latin with system Cyrillic.

Latin-script languages keep Schibsted. Its `latin-ext` faces are self-hosted by `next/font`, whose `subsets` setting only controls preloading. An e2e check confirms that Hungarian ő and Polish ł render in Schibsted. No font is fetched from a third-party host, so site-shell's font rule holds.

### Translations

Claude writes the translations in-session. That is no paid call, so this isn't a paid script.

The Chrome labels are copied from Chromium's own strings (`generated_resources_<lang>.xtb` in `chromium/src`), not invented, and their source is noted in the dictionary.

The `humanizer` skill runs over the new English strings (the picker's). It only handles English, so the translations instead get one review pass for tone and accuracy against the English page.

## Risks / Trade-offs

- **[Translation quality without a native reviewer]** → The page is short and factual. Each dictionary keeps the English sentence structure, and the user can send any language to a native speaker before go-live. Nothing is indexed until X1 is live.
- **[Chrome label drift]** → Chrome may reword "No access needed" in a later version. The drawing is illustrative, and the source string ids are recorded so they can be refreshed.
- **[Arabic Chrome is mirrored]** → In RTL Chrome, the puzzle piece sits at the top left. The Arabic copy says top left, but the drawing stays LTR. This is logged as a backlog item (a mirrored pin picture), not fixed here.
- **[The OG image alt and Related tools stay English or absent]** → Accepted for a how-to page reached from the extension. The whole-site pass revisits both.
- **[The header row at 320px]** → Below 360px the lockup, the Units toggle and the menu button already share one tight row, and the globe adds 44px on X1. The shell requirement only forbids horizontal scroll, and the header wraps, so the right-hand group may drop to a second row on X1 at 320px. An e2e case checks for no horizontal scroll on `/ru/` and `/de/` at 320px. G1's one-row header test is unaffected, because G1 has no translations.
- **[27 more static pages slow the build]** → Each is small and has no widget. The build-time cost is seconds.
- **[A shared `[locale]` segment catches every `/<word>/extensions/...` path]** → `dynamicParams = false` returns 404 for anything that isn't a declared code. The static routes still win over the dynamic segment.

## Migration Plan

Nothing to migrate. The English URL is unchanged. All translated versions ship `noindex` until the X1 go-live edit (store id plus `live: true`), which also adds them to the sitemap. Rollback is a revert: no data, no environment variables.

## Open Questions

- **Exact hreflang codes for Norwegian, Filipino and Chinese Simplified.** These are checked against Google's documentation at apply (see the language list decision). The answer changes only a string in `LOCALES`.

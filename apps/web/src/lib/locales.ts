/**
 * The site's languages, in the approved picker's order (English first), and where a translated page
 * lives. Hand-written, not `Intl.DisplayNames`: the native names must match the reference exactly,
 * and engines disagree on them.
 *
 * hreflang values follow Google's "Tell Google about localized versions of your page"
 * (developers.google.com/search/docs/specialty/international/localized-versions, read 2026-11-20):
 * only ISO 639-1 language codes, an optional ISO 15924 script or ISO 3166-1 region. So:
 * - Norwegian is `no`, the ISO 639-1 code (`nb` is also valid; `no` keeps the reference's code).
 * - Filipino is `tl`: `fil` is ISO 639-2 and not supported. Google's own interfaces use `tl` for it.
 * - Chinese (Simplified) is `zh-Hans`, the page's own example for Simplified Chinese; `zh-CN` would
 *   target mainland China only.
 * The URL code is the hreflang value in lowercase. `ogLocale` follows Facebook's locale list.
 *
 * {@link openspec/specs/localization/spec.md#requirement-the-site-knows-28-languages}
 */
export interface Locale {
  /** Lowercase URL segment; English has none. */
  code: string;
  hreflang: string;
  ogLocale: string;
  /** The name in the language itself. */
  native: string;
  english: string;
  /** Second line under the native name (the two Portuguese entries). */
  region?: string;
  dir: "ltr" | "rtl";
  /** flag-icons file in public/flags, by country. */
  flag: string;
  /** `system` where Schibsted Grotesk has no glyphs for the script. */
  font: "brand" | "system";
}

const L = (
  code: string,
  hreflang: string,
  ogLocale: string,
  native: string,
  english: string,
  flag: string,
  font: Locale["font"] = "brand",
  extra: Partial<Locale> = {},
): Locale => ({ code, hreflang, ogLocale, native, english, flag, font, dir: "ltr", ...extra });

export const LOCALES: readonly Locale[] = [
  L("en", "en", "en_US", "English", "English", "us"),
  L("ar", "ar", "ar_AR", "العربية", "Arabic", "sa", "system", { dir: "rtl" }),
  L("de", "de", "de_DE", "Deutsch", "German", "de"),
  L("el", "el", "el_GR", "Ελληνικά", "Greek", "gr", "system"),
  L("es", "es", "es_ES", "Español", "Spanish", "es"),
  L("et", "et", "et_EE", "Eesti", "Estonian", "ee"),
  L("fi", "fi", "fi_FI", "Suomi", "Finnish", "fi"),
  L("fr", "fr", "fr_FR", "Français", "French", "fr"),
  L("hi", "hi", "hi_IN", "हिन्दी", "Hindi", "in", "system"),
  L("hr", "hr", "hr_HR", "Hrvatski", "Croatian", "hr"),
  L("hu", "hu", "hu_HU", "Magyar", "Hungarian", "hu"),
  L("id", "id", "id_ID", "Indonesia", "Indonesian", "id"),
  L("it", "it", "it_IT", "Italiano", "Italian", "it"),
  L("ja", "ja", "ja_JP", "日本語", "Japanese", "jp", "system"),
  L("ko", "ko", "ko_KR", "한국어", "Korean", "kr", "system"),
  L("nl", "nl", "nl_NL", "Nederlands", "Dutch", "nl"),
  L("no", "no", "nb_NO", "Norsk", "Norwegian", "no"),
  L("pl", "pl", "pl_PL", "Polski", "Polish", "pl"),
  L("pt-pt", "pt-PT", "pt_PT", "Português", "Portuguese (Portugal)", "pt", "brand", {
    region: "Portugal",
  }),
  L("ru", "ru", "ru_RU", "Русский", "Russian", "ru", "system"),
  L("sv", "sv", "sv_SE", "Svenska", "Swedish", "se"),
  L("th", "th", "th_TH", "ไทย", "Thai", "th", "system"),
  L("pt-br", "pt-BR", "pt_BR", "Português", "Portuguese (Brazil)", "br", "brand", {
    region: "Brasil",
  }),
  L("tl", "tl", "tl_PH", "Filipino", "Filipino", "ph"),
  L("zh-hans", "zh-Hans", "zh_CN", "中文 (简体)", "Chinese (Simplified)", "cn", "system"),
  L("tr", "tr", "tr_TR", "Türkçe", "Turkish", "tr"),
  L("uk", "uk", "uk_UA", "Українська", "Ukrainian", "ua", "system"),
  L("vi", "vi", "vi_VN", "Tiếng Việt", "Vietnamese", "vn", "system"),
];

export const DEFAULT_LOCALE = "en";

/** Every language but English: the `[locale]` route's params. */
export const TRANSLATED_LOCALES = LOCALES.filter((l) => l.code !== DEFAULT_LOCALE);

export const localeByCode = (code: string) => LOCALES.find((l) => l.code === code);

/** The native name with its region, as the trigger shows it: "Português (Brasil)". */
export const fullNative = (l: Locale) => (l.region ? `${l.native} (${l.region})` : l.native);

/**
 * English paths that have translations. Only X1 for now; the whole-site pass grows it.
 * {@link openspec/specs/site-shell/spec.md#requirement-the-header-offers-the-language-picker-on-translated-pages}
 */
export const TRANSLATED_PATHS: readonly string[] = ["/extensions/gallery-wall-layout-generator"];

export const translatedPage = (path: string) => TRANSLATED_PATHS.includes(path);

/** {@link openspec/specs/localization/spec.md#requirement-a-translated-page-lives-under-its-language-code} */
export const localizedPath = (code: string, path: string) =>
  code === DEFAULT_LOCALE ? path : `/${code}${path}`;

/** Splits a leading translated-language segment off a path; anything else is English. */
export function localeOf(pathname: string): { locale: string; path: string } {
  const [, first = "", ...rest] = pathname.split("/");
  return TRANSLATED_LOCALES.some((l) => l.code === first)
    ? { locale: first, path: `/${rest.join("/")}` }
    : { locale: DEFAULT_LOCALE, path: pathname };
}

/** Case, diacritics and surrounding spaces folded away. */
const fold = (s: string) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("und").trim();

/**
 * Whether a picker search keeps a language: its native name (with region), English name, URL code
 * or hreflang contains the query. An empty query keeps every language.
 * {@link openspec/specs/localization/spec.md#requirement-the-pickers-search-matches-english-and-native-names}
 */
export function matchLanguage(query: string, locale: Locale): boolean {
  const q = fold(query);
  return [fullNative(locale), locale.english, locale.code, locale.hreflang].some((s) =>
    fold(s).includes(q),
  );
}

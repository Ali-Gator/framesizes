import type { Metadata, MetadataRoute } from "next";

import {
  localeByCode,
  LOCALES,
  localizedPath,
  TRANSLATED_LOCALES,
  translatedPage,
} from "./locales";
import {
  BRAND,
  type BuiltPage,
  fullTitle,
  HUBS,
  livePages,
  page,
  PAGES,
  type SitePage,
} from "./site-map";

export const SITE_URL = "https://framesizes.app";

/**
 * The one URL builder for canonical, og:url, sitemap and JSON-LD, so they always agree.
 * The home page is the bare origin, as Next renders a canonical of "/".
 */
export function absoluteUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/**
 * Head tags for a built page, from its site map entry. Pages export `metadata = pageMetadata(livePage(id))`,
 * or `builtPage(id)` for a page built ahead of go-live, which also gets `noindex` until its entry is live.
 * One helper because Next merges metadata shallowly and a page-level `openGraph` would drop the rest.
 *
 * {@link openspec/specs/seo-base/spec.md#requirement-each-live-page-declares-its-own-title-and-description}
 * {@link openspec/specs/seo-base/spec.md#requirement-each-page-has-one-self-referencing-canonical}
 * {@link openspec/specs/seo-base/spec.md#requirement-each-page-sends-the-nine-social-tags-with-its-own-image}
 * {@link openspec/specs/seo-base/spec.md#requirement-a-built-page-that-is-not-live-stays-out-of-the-index}
 */
export function pageMetadata(target: BuiltPage): Metadata {
  return headTags(target, target.path, target.seo, LOCALES[0]?.ogLocale ?? "en_US");
}

/**
 * Head tags for one translated version of a page with translations: its own title and description
 * from the translation, its own canonical and `og:url` under `/<code>`, its language's `og:locale`.
 * `noindex` follows the page's `live` flag, as for the English version.
 * {@link openspec/specs/seo-base/spec.md#requirement-a-translated-version-takes-its-head-values-from-its-translation}
 * {@link openspec/specs/extension-site/spec.md#requirement-translated-versions-go-live-with-the-english-page}
 */
export function localizedMetadata(
  target: BuiltPage,
  code: string,
  seo: { title: string; description: string },
): Metadata {
  const locale = localeByCode(code);
  if (!locale) throw new Error(`Unknown locale ${code}`);
  return headTags(target, localizedPath(code, target.path), seo, locale.ogLocale);
}

/**
 * The 28 language versions of a page with translations, plus `x-default` (English), each at its
 * canonical URL; nothing for a page without translations.
 * {@link openspec/specs/seo-base/spec.md#requirement-every-language-version-names-all-the-others}
 */
export function languageAlternates(path: string): Record<string, string> | undefined {
  if (!translatedPage(path)) return undefined;
  return {
    ...Object.fromEntries(
      LOCALES.map((l) => [l.hreflang, absoluteUrl(localizedPath(l.code, path))]),
    ),
    "x-default": absoluteUrl(path),
  };
}

function headTags(
  target: BuiltPage,
  path: string,
  { title, description }: { title: string; description: string },
  locale: string,
): Metadata {
  const url = absoluteUrl(path);
  const languages = languageAlternates(target.path);
  return {
    ...(target.live ? {} : { robots: { index: false } }),
    // A title without the brand gets the layout's "%s | Frame Sizes" template.
    title: fullTitle(title) === title ? { absolute: title } : title,
    description,
    alternates: languages ? { canonical: url, languages } : { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: BRAND, locale },
    twitter: { card: "summary_large_image" },
  };
}

/** {@link openspec/specs/seo-base/spec.md#requirement-the-home-page-describes-the-site-in-structured-data} */
export function siteJsonLd() {
  const url = absoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${url}#website`, name: BRAND, url },
      {
        "@type": "Organization",
        "@id": `${url}#organization`,
        name: BRAND,
        url,
        logo: absoluteUrl("/brand/logo-mark-512.png"),
      },
    ],
  };
}

/**
 * Every live page, then every translated version of a live page, with the page's content date.
 * {@link openspec/specs/seo-base/spec.md#requirement-the-sitemap-lists-exactly-the-live-pages}
 */
export function sitemapEntries(pages: readonly SitePage[] = PAGES): MetadataRoute.Sitemap {
  return livePages(pages).flatMap((p) =>
    [
      p.path,
      ...(translatedPage(p.path) ? TRANSLATED_LOCALES : []).map((l) =>
        localizedPath(l.code, p.path),
      ),
    ].map((path) => ({ url: absoluteUrl(path), lastModified: p.seo.lastModified })),
  );
}

export interface Crumb {
  name: string;
  path: string;
}

/**
 * Home, then the hub head when the page is not that head and the head is live and not the home page, then
 * the page. The visible `Breadcrumbs` and the `BreadcrumbList` both come from it.
 * {@link openspec/specs/seo-base/spec.md#requirement-pages-below-the-home-page-carry-breadcrumbs}
 */
export function breadcrumbTrail(target: SitePage): Crumb[] {
  const home = { name: "Home", path: "/" };
  const hub = HUBS.find((h) => h.id === target.hub);
  const head = hub && page(hub.head);
  const middle =
    hub && head?.live && head.id !== target.id && head.path !== "/"
      ? [{ name: hub.name, path: head.path }]
      : [];
  return [home, ...middle, { name: target.name, path: target.path }];
}

/**
 * The breadcrumb trail as a `BreadcrumbList`, with absolute URLs. A translated version passes its
 * trail with translated names.
 * {@link openspec/specs/seo-base/spec.md#requirement-pages-below-the-home-page-carry-breadcrumbs}
 * {@link openspec/specs/extension-site/spec.md#requirement-a-translated-versions-breadcrumbs-are-translated}
 */
export function breadcrumbJsonLd(
  target: SitePage,
  crumbs: readonly Crumb[] = breadcrumbTrail(target),
) {
  const items = crumbs.map((c) => ({ name: c.name, url: absoluteUrl(c.path) }));
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** JSON for a `<script type="application/ld+json">`, `<` escaped so it can never close the element. */
export const jsonLdScript = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

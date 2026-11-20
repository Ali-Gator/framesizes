import type { Metadata, MetadataRoute } from "next";

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
  const { title, description } = target.seo;
  const url = absoluteUrl(target.path);
  return {
    ...(target.live ? {} : { robots: { index: false } }),
    // A title without the brand gets the layout's "%s | Frame Sizes" template.
    title: fullTitle(title) === title ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: BRAND, locale: "en_US" },
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

/** {@link openspec/specs/seo-base/spec.md#requirement-the-sitemap-lists-exactly-the-live-pages} */
export function sitemapEntries(pages: readonly SitePage[] = PAGES): MetadataRoute.Sitemap {
  return livePages(pages).map((p) => ({
    url: absoluteUrl(p.path),
    lastModified: p.seo.lastModified,
  }));
}

export interface Crumb {
  name: string;
  path: string;
}

/**
 * Home, then the hub head when the page is not that head and the head is not the home page, then
 * the page. The visible `Breadcrumbs` and the `BreadcrumbList` both come from it.
 * {@link openspec/specs/seo-base/spec.md#requirement-pages-below-the-home-page-carry-breadcrumbs}
 */
export function breadcrumbTrail(target: SitePage): Crumb[] {
  const home = { name: "Home", path: "/" };
  const hub = HUBS.find((h) => h.id === target.hub);
  const head = hub && page(hub.head);
  const middle =
    hub && head && head.id !== target.id && head.path !== "/"
      ? [{ name: hub.name, path: head.path }]
      : [];
  return [home, ...middle, { name: target.name, path: target.path }];
}

/**
 * The breadcrumb trail as a `BreadcrumbList`, with absolute URLs.
 * {@link openspec/specs/seo-base/spec.md#requirement-pages-below-the-home-page-carry-breadcrumbs}
 */
export function breadcrumbJsonLd(target: SitePage) {
  const items = breadcrumbTrail(target).map((c) => ({ name: c.name, url: absoluteUrl(c.path) }));
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

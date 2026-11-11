import type { Metadata, MetadataRoute } from "next";

import { BRAND, fullTitle, type LivePage, livePages, PAGES, type SitePage } from "./site-map";

export const SITE_URL = "https://framesizes.app";

/**
 * The one URL builder for canonical, og:url, sitemap and JSON-LD, so they always agree.
 * The home page is the bare origin, as Next renders a canonical of "/".
 */
export function absoluteUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/**
 * Head tags for a live page, from its site map entry. Pages export `metadata = pageMetadata(livePage(id))`;
 * one helper because Next merges metadata shallowly and a page-level `openGraph` would drop the rest.
 *
 * {@link openspec/specs/seo-base/spec.md#requirement-each-live-page-declares-its-own-title-and-description}
 * {@link openspec/specs/seo-base/spec.md#requirement-each-page-has-one-self-referencing-canonical}
 * {@link openspec/specs/seo-base/spec.md#requirement-each-page-sends-the-nine-social-tags-with-its-own-image}
 */
export function pageMetadata(target: LivePage): Metadata {
  const { title, description } = target.seo;
  const url = absoluteUrl(target.path);
  return {
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

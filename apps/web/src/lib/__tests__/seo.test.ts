import { describe, expect, it } from "vitest";

import { withLive } from "@/components/site/__tests__/fixtures";

import {
  absoluteUrl,
  breadcrumbJsonLd,
  breadcrumbTrail,
  jsonLdScript,
  pageMetadata,
  siteJsonLd,
  sitemapEntries,
} from "../seo";
import { builtPage, type LivePage, livePage, page, type SitePage } from "../site-map";

const POSTERS: LivePage = {
  id: "P1",
  path: "/poster-sizes",
  hub: "posters",
  name: "Poster sizes",
  live: true,
  seo: {
    title: "Poster Sizes: Standard Dimensions Chart",
    h1: "Standard Poster Sizes and Dimensions",
    description: "p".repeat(140),
    lastModified: "2026-12-01",
  },
};

describe("pageMetadata", () => {
  /** {@link openspec/specs/seo-base/spec.md#scenario-a-page-whose-title-lacks-the-brand} */
  it("leaves a title without the brand to the layout's suffix template", () => {
    expect(pageMetadata(POSTERS).title).toBe("Poster Sizes: Standard Dimensions Chart");
  });

  /** {@link openspec/specs/seo-base/spec.md#scenario-the-home-pages-title} */
  it("uses a title that names the brand as written", () => {
    const home = pageMetadata(livePage("F1"));
    expect(home.title).toEqual({ absolute: "Standard Picture Frame Sizes Chart (Inches & cm)" });
    expect(home.description).toMatch(/^Every standard picture frame size in inches and cm/);
  });

  /** {@link openspec/specs/seo-base/spec.md#scenario-a-canonical-for-an-inner-page} */
  it("points the canonical at the page's absolute URL", () => {
    expect(pageMetadata(POSTERS).alternates?.canonical).toBe("https://framesizes.app/poster-sizes");
    expect(pageMetadata(livePage("F1")).alternates?.canonical).toBe(absoluteUrl("/"));
  });

  /** {@link openspec/specs/seo-base/spec.md#requirement-each-page-sends-the-nine-social-tags-with-its-own-image} */
  it("fills Open Graph from the same values", () => {
    const meta = pageMetadata(POSTERS);
    expect(meta.openGraph).toEqual({
      title: "Poster Sizes: Standard Dimensions Chart",
      description: "p".repeat(140),
      url: "https://framesizes.app/poster-sizes",
      type: "website",
      siteName: "Frame Sizes",
      locale: "en_US",
    });
    expect(meta.twitter).toEqual({ card: "summary_large_image" });
  });
});

/** {@link openspec/specs/seo-base/spec.md#requirement-the-home-page-describes-the-site-in-structured-data} */
describe("siteJsonLd", () => {
  it("describes the site and its publisher in one graph", () => {
    const graph = siteJsonLd()["@graph"];
    expect(graph.map((node) => node["@type"])).toEqual(["WebSite", "Organization"]);
    expect(graph[0]).toMatchObject({ name: "Frame Sizes", url: "https://framesizes.app" });
    expect(graph[1]).toMatchObject({
      name: "Frame Sizes",
      url: "https://framesizes.app",
      logo: "https://framesizes.app/brand/logo-mark-512.png",
    });
  });
});

/** {@link openspec/specs/seo-base/spec.md#scenario-a-page-that-is-not-live} */
describe("sitemapEntries", () => {
  it("lists only the live pages, each with its content date", () => {
    const draft: SitePage = {
      id: "P2",
      path: "/poster-board-sizes",
      hub: "posters",
      name: "P2",
      live: false,
    };
    expect(sitemapEntries([POSTERS, draft])).toEqual([
      { url: "https://framesizes.app/poster-sizes", lastModified: "2026-12-01" },
    ]);
  });
});

describe("sitemapEntries over the launch pages", () => {
  /** {@link openspec/specs/seo-base/spec.md#scenario-only-the-home-page-is-live} */
  it("holds the home page alone while only it is live", () => {
    expect(sitemapEntries(withLive("F1"))).toEqual([
      { url: "https://framesizes.app", lastModified: "2026-11-11" },
    ]);
  });

  /** {@link openspec/specs/seo-base/spec.md#scenario-the-home-page-and-f2-are-live} */
  it("holds the home page and F2, each with its own date", () => {
    expect(sitemapEntries(withLive("F1", "F2")).map((e) => e.url)).toEqual([
      "https://framesizes.app",
      "https://framesizes.app/frame-sizes-on-wall",
    ]);
  });
});

describe("breadcrumbJsonLd", () => {
  /** {@link openspec/specs/seo-base/spec.md#scenario-f2s-breadcrumbs} */
  it("lists Home and the page with absolute URLs", () => {
    expect(breadcrumbJsonLd(livePage("F2"))).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://framesizes.app" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Frame sizes on your wall",
          item: "https://framesizes.app/frame-sizes-on-wall",
        },
      ],
    });
  });

  /** {@link openspec/specs/seo-base/spec.md#scenario-the-extension-pages-breadcrumbs} */
  it("lists the hub head between Home and a page below it", () => {
    expect(breadcrumbJsonLd(builtPage("X1")).itemListElement.map((i) => i.item)).toEqual([
      "https://framesizes.app",
      "https://framesizes.app/gallery-wall-planner",
      "https://framesizes.app/extensions/gallery-wall-layout-generator",
    ]);
  });

  it("escapes < so the JSON cannot close its script", () => {
    expect(jsonLdScript({ name: "</script>" })).toBe('{"name":"\\u003c/script>"}');
  });
});

describe("pageMetadata for a built page", () => {
  /** {@link openspec/specs/seo-base/spec.md#scenario-head-tags-of-a-page-set-live} */
  it("holds no robots directive once the page is live", () => {
    const meta = pageMetadata({ ...builtPage("X1"), live: true });
    expect(meta).not.toHaveProperty("robots");
  });

  /** {@link openspec/specs/seo-base/spec.md#scenario-the-extension-page-before-go-live} */
  it("adds noindex while the page is not live, keeping its own canonical", () => {
    const meta = pageMetadata({ ...builtPage("X1"), live: false });
    expect(meta.robots).toEqual({ index: false });
    expect(meta.alternates?.canonical).toBe(
      "https://framesizes.app/extensions/gallery-wall-layout-generator",
    );
    expect(meta.title).toBe("Gallery Wall Layout Generator Chrome Extension");
  });
});

describe("breadcrumbTrail", () => {
  /** {@link openspec/specs/seo-base/spec.md#scenario-the-extension-pages-breadcrumbs} */
  it("puts the hub head between Home and the extension page", () => {
    expect(breadcrumbTrail(builtPage("X1"))).toEqual([
      { name: "Home", path: "/" },
      { name: "Gallery wall", path: "/gallery-wall-planner" },
      { name: "Chrome extension", path: "/extensions/gallery-wall-layout-generator" },
    ]);
  });

  /** {@link openspec/specs/seo-base/spec.md#scenario-a-hub-head-keeps-two-crumbs} */
  it("keeps two crumbs on a hub head and on a page whose hub head is the home page", () => {
    expect(breadcrumbTrail(livePage("G1")).map((c) => c.name)).toEqual([
      "Home",
      "Gallery wall layout planner",
    ]);
    expect(breadcrumbTrail(livePage("F2")).map((c) => c.name)).toEqual([
      "Home",
      "Frame sizes on your wall",
    ]);
  });

  /** {@link openspec/specs/seo-base/spec.md#requirement-pages-below-the-home-page-carry-breadcrumbs} */
  it("leaves out a hub head that is not live, so no crumb links to a missing page", () => {
    expect(breadcrumbTrail(page("P2"))).toEqual([
      { name: "Home", path: "/" },
      { name: "Poster board sizes", path: "/poster-board-sizes" },
    ]);
  });
});

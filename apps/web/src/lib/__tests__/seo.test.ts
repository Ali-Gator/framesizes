import { describe, expect, it } from "vitest";

import { absoluteUrl, pageMetadata, siteJsonLd, sitemapEntries } from "../seo";
import { type LivePage, livePage, type SitePage } from "../site-map";

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

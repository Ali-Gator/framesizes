import { describe, expect, it } from "vitest";

import { withLive } from "@/components/site/__tests__/fixtures";

import {
  absoluteUrl,
  breadcrumbJsonLd,
  breadcrumbTrail,
  companyPageJsonLd,
  jsonLdScript,
  localizedMetadata,
  organizationJsonLd,
  pageMetadata,
  siteJsonLd,
  sitemapEntries,
} from "../seo";
import { builtPage, fullTitle, type LivePage, livePage, page, type SitePage } from "../site-map";

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

  /** `withLive` with G1's content date moved, so a test can tell the entries' dates apart. */
  const withG1On = (date: string, ...ids: string[]) =>
    withLive(...ids).map((p) =>
      p.id === "G1" && p.live ? { ...p, seo: { ...p.seo, lastModified: date } } : p,
    );

  /** {@link openspec/specs/seo-base/spec.md#scenario-the-home-page-f2-and-g1-are-live} */
  it("holds the home page, F2 and G1, each with its own date", () => {
    expect(sitemapEntries(withG1On("2026-11-12", "F1", "F2", "G1"))).toEqual([
      { url: "https://framesizes.app", lastModified: "2026-11-11" },
      { url: "https://framesizes.app/frame-sizes-on-wall", lastModified: "2026-11-11" },
      { url: "https://framesizes.app/gallery-wall-planner", lastModified: "2026-11-12" },
    ]);
  });

  /** {@link openspec/specs/seo-base/spec.md#scenario-the-live-tools-and-the-company-pages} */
  it("holds the live tools and the five company pages", () => {
    const pages = withG1On("2026-11-12", "F1", "F2", "G1", "A1", "A2", "A3", "A4", "A5");
    expect(sitemapEntries(pages).map((e) => [e.url, e.lastModified])).toEqual([
      ["https://framesizes.app", "2026-11-11"],
      ["https://framesizes.app/frame-sizes-on-wall", "2026-11-11"],
      ["https://framesizes.app/gallery-wall-planner", "2026-11-12"],
      ["https://framesizes.app/about", "2026-11-11"],
      ["https://framesizes.app/contact", "2026-11-11"],
      ["https://framesizes.app/privacy-policy", "2026-11-11"],
      ["https://framesizes.app/terms-of-use", "2026-11-11"],
      ["https://framesizes.app/refund-policy", "2026-11-11"],
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

describe("translated versions", () => {
  const X1 = builtPage("X1");
  const RU = { title: "Gallery Wall Layout Generator для Chrome", description: "Описание." };
  const X1_URL = "https://framesizes.app/extensions/gallery-wall-layout-generator";

  /** {@link openspec/specs/seo-base/spec.md#scenario-the-russian-extension-pages-head} */
  it("gives the Russian version its own title, description, canonical, og:url and og:locale", () => {
    const meta = localizedMetadata(X1, "ru", RU);
    expect(meta.title).toBe(RU.title);
    expect(fullTitle(RU.title)).toBe(`${RU.title} | Frame Sizes`);
    expect(meta.description).toBe(RU.description);
    expect(meta.alternates?.canonical).toBe(
      "https://framesizes.app/ru/extensions/gallery-wall-layout-generator",
    );
    expect(meta.openGraph).toMatchObject({
      title: RU.title,
      url: "https://framesizes.app/ru/extensions/gallery-wall-layout-generator",
      locale: "ru_RU",
    });
  });

  /** {@link openspec/specs/seo-base/spec.md#scenario-the-extension-pages-language-links} */
  it("names all 28 versions and x-default from the English and the translated versions", () => {
    for (const meta of [pageMetadata(X1), localizedMetadata(X1, "ja", RU)]) {
      const languages = meta.alternates?.languages as Record<string, string>;
      expect(Object.keys(languages)).toHaveLength(29);
      expect(languages["x-default"]).toBe(X1_URL);
      expect(languages.en).toBe(X1_URL);
      expect(languages.ja).toBe(
        "https://framesizes.app/ja/extensions/gallery-wall-layout-generator",
      );
    }
  });

  /** {@link openspec/specs/seo-base/spec.md#scenario-a-page-without-translations} */
  it("gives a page without translations no language links", () => {
    expect(pageMetadata(livePage("F1")).alternates).toEqual({
      canonical: "https://framesizes.app",
    });
  });

  /** {@link openspec/specs/seo-base/spec.md#scenario-a-live-page-with-translations} */
  it("lists the 27 translated URLs of a live page with translations, with its date", () => {
    const x1 = sitemapEntries(withLive("X1"));
    expect(x1).toHaveLength(28);
    expect(x1[0]).toEqual({ url: X1_URL, lastModified: "2026-11-11" });
    expect(x1).toContainEqual({
      url: "https://framesizes.app/pt-br/extensions/gallery-wall-layout-generator",
      lastModified: "2026-11-11",
    });
  });

  /** {@link openspec/specs/seo-base/spec.md#scenario-translations-of-a-page-that-is-not-live} */
  it("lists no translated URL while the page is not live", () => {
    expect(
      sitemapEntries(withLive("F1", "G1")).some((e) =>
        e.url.includes("/extensions/gallery-wall-layout-generator"),
      ),
    ).toBe(false);
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-a-translated-version-before-go-live} */
  it("keeps a translated version out of the index while X1 is not live", () => {
    expect(localizedMetadata({ ...X1, live: false }, "pl", RU).robots).toEqual({ index: false });
    expect(localizedMetadata({ ...X1, live: true }, "pl", RU).robots).toBeUndefined();
  });

  /** {@link openspec/specs/extension-site/spec.md#requirement-a-translated-versions-breadcrumbs-are-translated} */
  it("puts translated crumb names in the BreadcrumbList", () => {
    const crumbs = [
      { name: "Inicio", path: "/" },
      { name: "Extensión", path: X1.path },
    ];
    expect(breadcrumbJsonLd(X1, crumbs).itemListElement.map((i) => [i.name, i.item])).toEqual([
      ["Inicio", "https://framesizes.app"],
      ["Extensión", X1_URL],
    ]);
  });
});

/** {@link openspec/specs/company-pages/spec.md#requirement-about-and-contact-describe-the-organization-in-structured-data} */
describe("organizationJsonLd", () => {
  it("is the home page's organization with the operator's legal details", () => {
    const org = organizationJsonLd();
    expect(org["@type"]).toBe("Organization");
    expect(org["@id"]).toBe("https://framesizes.app#organization");
    expect(org.name).toBe("Frame Sizes");
    expect(org.legalName).toBe("Soft Divisions Limited");
    expect(org.email).toBe("care@framesizes.app");
    expect(org.address["@type"]).toBe("PostalAddress");
    expect(org.address.addressCountry).toBe("HK");
    expect(org["@id"]).toBe(siteJsonLd()["@graph"][1]?.["@id"]);
  });
});

/** {@link openspec/specs/company-pages/spec.md#scenario-the-about-pages-json-ld} */
describe("companyPageJsonLd", () => {
  it("puts the About page, its breadcrumbs and the organization in one graph", () => {
    const data = companyPageJsonLd(livePage("A1"), "AboutPage");
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@graph"].map((node) => node["@type"])).toEqual([
      "AboutPage",
      "BreadcrumbList",
      "Organization",
    ]);
    expect(data["@graph"][0]).toMatchObject({
      url: "https://framesizes.app/about",
      about: { "@id": "https://framesizes.app#organization" },
    });
  });

  it("gives the Contact page a ContactPage whose main entity is the organization", () => {
    const data = companyPageJsonLd(livePage("A2"), "ContactPage");
    expect(data["@graph"].map((node) => node["@type"])).toEqual([
      "ContactPage",
      "BreadcrumbList",
      "Organization",
    ]);
    expect(data["@graph"][0]).toMatchObject({
      url: "https://framesizes.app/contact",
      mainEntity: { "@id": "https://framesizes.app#organization" },
    });
  });
});

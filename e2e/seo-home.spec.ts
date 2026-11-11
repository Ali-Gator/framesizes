import { expect, type Page, test } from "@playwright/test";

import { livePage } from "../apps/web/src/lib/site-map";

const HOME = livePage("F1");
const CANONICAL = "https://framesizes.app";

/** Reads the head and links out of raw server HTML (no JavaScript runs). */
async function readHtml(page: Page, html: string) {
  return page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, "text/html");
    const meta = (key: string) =>
      [...doc.querySelectorAll(`meta[property="${key}"], meta[name="${key}"]`)].map(
        (m) => m.getAttribute("content") ?? "",
      );
    return {
      title: doc.title,
      description: meta("description"),
      canonicals: [...doc.querySelectorAll('link[rel="canonical"]')].map((l) =>
        l.getAttribute("href"),
      ),
      robots: doc.querySelectorAll('meta[name="robots"], meta[name="googlebot"]').length,
      meta,
      tags: Object.fromEntries(
        [
          "og:title",
          "og:description",
          "og:url",
          "og:type",
          "og:site_name",
          "og:locale",
          "og:image",
          "og:image:width",
          "og:image:height",
          "og:image:alt",
          "twitter:card",
        ].map((key) => [key, meta(key)]),
      ),
      h1s: [...doc.querySelectorAll("h1")].map((h) => h.textContent?.trim()),
      jsonLd: [...doc.querySelectorAll('script[type="application/ld+json"]')].map(
        (s) => s.textContent ?? "",
      ),
      hrefs: [...doc.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") ?? ""),
    };
  }, html);
}

async function home(page: Page, path = "/") {
  const response = await page.request.get(path);
  expect(response.status()).toBe(200);
  return { response, html: await readHtml(page, await response.text()) };
}

/** {@link openspec/specs/seo-base/spec.md#scenario-the-home-pages-title} */
test("title and description come from the site map", async ({ page }) => {
  const { html } = await home(page);
  expect(html.title).toBe("Standard Picture Frame Sizes Chart (Inches & cm)");
  expect(html.description).toEqual([HOME.seo.description]);
});

/** {@link openspec/specs/seo-base/spec.md#scenario-the-home-page-is-opened-with-widget-state-in-the-url} */
test("one canonical, without the query string", async ({ page }) => {
  const { html } = await home(page, "/?size=11x14");
  expect(html.canonicals).toEqual([CANONICAL]);
});

/** {@link openspec/specs/seo-base/spec.md#scenario-the-home-pages-robots-directives} */
test("no robots meta tag and no X-Robots-Tag header", async ({ page }) => {
  const { response, html } = await home(page);
  expect(html.robots).toBe(0);
  expect(response.headers()["x-robots-tag"]).toBeUndefined();
});

/** {@link openspec/specs/seo-base/spec.md#scenario-the-home-pages-social-tags} */
test("the nine social tags", async ({ page }) => {
  const { html } = await home(page);
  const one = (key: string) => {
    expect(html.tags[key], key).toHaveLength(1);
    return html.tags[key]?.[0];
  };
  expect(one("og:title")).toBe(HOME.seo.title);
  expect(one("og:description")).toBe(HOME.seo.description);
  expect(one("og:url")).toBe(CANONICAL);
  expect(one("og:type")).toBe("website");
  expect(one("og:site_name")).toBe("Frame Sizes");
  expect(one("og:locale")).toBe("en_US");
  // `next dev` points file-based images at localhost; the production build uses metadataBase.
  expect(one("og:image")).toMatch(process.env.CI ? /^https:\/\/framesizes\.app\// : /^https?:\/\//);
  expect(one("og:image:width")).toBe("1200");
  expect(one("og:image:height")).toBe("630");
  expect(one("og:image:alt")).not.toBe("");
  expect(one("twitter:card")).toBe("summary_large_image");
});

/** {@link openspec/specs/seo-base/spec.md#scenario-the-home-pages-social-image} */
test("the social image is a small PNG", async ({ page }) => {
  const { html } = await home(page);
  const image = new URL(html.tags["og:image"]?.[0] ?? "");
  const response = await page.request.get(image.pathname + image.search);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
  expect((await response.body()).length).toBeLessThan(300 * 1024);
});

/** {@link openspec/specs/seo-base/spec.md#scenario-the-home-pages-h1} */
test("one h1 from the site map", async ({ page }) => {
  const { html } = await home(page);
  expect(html.h1s).toEqual(["Standard Frame Sizes"]);
});

/** {@link openspec/specs/seo-base/spec.md#scenario-the-home-pages-json-ld} */
test("JSON-LD describes the site", async ({ page }) => {
  const { html } = await home(page);
  expect(html.jsonLd).toHaveLength(1);
  const data = JSON.parse(html.jsonLd[0] ?? "") as { "@graph": Record<string, string>[] };
  expect(data["@graph"].map((node) => node["@type"])).toEqual(["WebSite", "Organization"]);
  expect(data["@graph"][1]?.logo).toBe("https://framesizes.app/brand/logo-mark-512.png");
  expect(JSON.stringify(data)).not.toMatch(/FAQPage|HowTo/);
});

/** {@link openspec/specs/seo-base/spec.md#scenario-every-link-on-a-page-resolves} */
test("every internal link answers 200", async ({ page }) => {
  const { html } = await home(page);
  const internal = html.hrefs.filter((href) => href.startsWith("/") && !href.startsWith("//"));
  expect(internal.length).toBeGreaterThan(0);
  for (const href of new Set(internal)) {
    expect((await page.request.get(href, { maxRedirects: 0 })).status(), href).toBe(200);
  }
});

/** {@link openspec/specs/seo-base/spec.md#scenario-robotstxt-is-requested} */
test("robots.txt allows everything and names the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).not.toMatch(/^Disallow:\s*\S/im);
  expect(body).toContain("Sitemap: https://framesizes.app/sitemap.xml");
});

/** {@link openspec/specs/seo-base/spec.md#scenario-only-the-home-page-is-live} */
test("sitemap.xml lists the home page only", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body.match(/<url>/g)).toHaveLength(1);
  expect(body).toContain(`<loc>${CANONICAL}</loc>`);
  expect(body).toContain(`<lastmod>${HOME.seo.lastModified}</lastmod>`);
  expect(body).not.toMatch(/<priority>|<changefreq>/);
});

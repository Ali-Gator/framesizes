import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { livePage } from "../apps/web/src/lib/site-map";

const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];
const ADDRESS = "B, G/F, 322 Shanghai Street, Yau Ma Tei, Kowloon, Hong Kong";
const MAILTO = "mailto:care@framesizes.app";

const PAGES = [
  { path: "/about", h1: "About Frame Sizes", crumb: "About" },
  { path: "/contact", h1: "Contact Us", crumb: "Contact" },
  { path: "/privacy-policy", h1: "Privacy Policy", crumb: "Privacy policy" },
  { path: "/terms-of-use", h1: "Terms of Use", crumb: "Terms of use" },
  { path: "/refund-policy", h1: "Refund Policy", crumb: "Refund policy" },
] as const;

/** Reads raw server HTML (no JavaScript runs). */
async function serverHtml(page: Page, path: string) {
  const response = await page.request.get(path);
  expect(response.status(), path).toBe(200);
  return page.evaluate(
    (source) => {
      const doc = new DOMParser().parseFromString(source, "text/html");
      const main = doc.querySelector("main");
      const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();
      const meta = (key: string) =>
        doc.querySelector(`meta[property="${key}"], meta[name="${key}"]`)?.getAttribute("content");
      return {
        title: doc.title,
        canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute("href"),
        ogImage: meta("og:image"),
        ogImageAlt: meta("og:image:alt"),
        h1s: [...doc.querySelectorAll("h1")].map(text),
        h2s: [...(main?.querySelectorAll("h2") ?? [])].map(text),
        crumbs: [...doc.querySelectorAll('nav[aria-label="Breadcrumb"] li')].map(text),
        mainText: text(main) ?? "",
        mailtos: [...(main?.querySelectorAll('a[href^="mailto:"]') ?? [])].map((a) =>
          a.getAttribute("href"),
        ),
        forms: doc.querySelectorAll("form").length,
        times: [...(main?.querySelectorAll("time") ?? [])].map((t) => ({
          datetime: t.getAttribute("datetime"),
          before: text(t.parentElement),
        })),
        tableHead: [...(main?.querySelectorAll("table th[scope=col]") ?? [])].map(text),
        tableRows: [...(main?.querySelectorAll("table tbody tr") ?? [])].map((r) =>
          text(r.querySelector("th, td")),
        ),
        jsonLd: [...doc.querySelectorAll('script[type="application/ld+json"]')].map(
          (s) => s.textContent ?? "",
        ),
      };
    },
    await response.text(),
  );
}

/** The text of the section whose h2 holds `heading`. */
async function section(page: Page, path: string, heading: string) {
  await page.goto(path);
  return (
    (await page
      .locator("main section", { has: page.locator("h2", { hasText: heading }) })
      .first()
      .textContent()) ?? ""
  ).replace(/\s+/g, " ");
}

/** {@link openspec/specs/company-pages/spec.md#scenario-each-company-page-answers-with-its-h1} */
test("each company page answers with one h1 and Home › page breadcrumbs", async ({ page }) => {
  for (const p of PAGES) {
    const html = await serverHtml(page, p.path);
    expect(html.h1s, p.path).toEqual([p.h1]);
    expect(html.crumbs, p.path).toEqual(["Home", p.crumb]);
  }
});

/** {@link openspec/specs/company-pages/spec.md#scenario-a-company-pages-title} */
test("the Privacy Policy's title and canonical", async ({ page }) => {
  const html = await serverHtml(page, "/privacy-policy");
  expect(html.title).toBe("Privacy Policy | Frame Sizes");
  expect(html.canonical).toBe("https://framesizes.app/privacy-policy");
});

/** {@link openspec/specs/company-pages/spec.md#scenario-the-privacy-policys-date} */
test("the three policies show when they were last updated", async ({ page }) => {
  for (const [path, id] of [
    ["/privacy-policy", "A3"],
    ["/terms-of-use", "A4"],
    ["/refund-policy", "A5"],
  ] as const) {
    const html = await serverHtml(page, path);
    expect(html.times, path).toHaveLength(1);
    expect(html.times[0]?.datetime, path).toBe(livePage(id).seo.lastModified);
    expect(html.times[0]?.before, path).toMatch(/^Last updated /);
  }
});

/** {@link openspec/specs/company-pages/spec.md#scenario-the-about-and-contact-pages-show-the-same-details} */
test("About and Contact show the same company details", async ({ page }) => {
  for (const path of ["/about", "/contact"]) {
    const html = await serverHtml(page, path);
    expect(html.mainText, path).toContain("Soft Divisions Limited");
    expect(html.mainText, path).toContain(ADDRESS);
    expect(html.mailtos, path).toContain(MAILTO);
  }
});

/** {@link openspec/specs/company-pages/spec.md#scenario-the-contact-pages-content} */
test("the Contact page gives the email, what to include and the address, with no form", async ({
  page,
}) => {
  const html = await serverHtml(page, "/contact");
  expect(html.mailtos).toContain(MAILTO);
  expect(html.h2s).toEqual(
    expect.arrayContaining([
      expect.stringMatching(/wrong size or a bug/i),
      expect.stringMatching(/privacy/i),
      expect.stringMatching(/postal address/i),
    ]),
  );
  expect(html.forms).toBe(0);
});

/** {@link openspec/specs/company-pages/spec.md#scenario-the-data-table} */
test("the privacy data table", async ({ page }) => {
  const html = await serverHtml(page, "/privacy-policy");
  expect(html.tableHead).toEqual(["Data", "Where it is kept", "Who can see it", "How long"]);
  const rows = html.tableRows.join(" | ");
  for (const row of [
    /visit counts/i,
    /server logs/i,
    /unit choice/i,
    /wall photos/i,
    /saved wall and prints/i,
    /email/i,
  ]) {
    expect(rows).toMatch(row);
  }
  expect(html.mainText).toContain("Soft Divisions Limited");
  expect(html.mainText).toContain(ADDRESS);
});

/** {@link openspec/specs/company-pages/spec.md#scenario-the-extension-section} */
test("the privacy policy names each extension permission", async ({ page }) => {
  const text = await section(page, "/privacy-policy", "Chrome extension");
  for (const permission of ["sidePanel", "contextMenus", "activeTab", "scripting"]) {
    expect(text).toContain(permission);
  }
});

/** {@link openspec/specs/company-pages/spec.md#scenario-the-governing-law-section} */
test("the Terms of Use are numbered and governed by Hong Kong law", async ({ page }) => {
  const html = await serverHtml(page, "/terms-of-use");
  html.h2s.forEach((h2, i) => expect(h2).toMatch(new RegExp(`^${i + 1}\\. `)));
  expect(html.h2s.some((h2) => h2?.includes("Governing law"))).toBe(true);
  expect(await section(page, "/terms-of-use", "Governing law")).toContain("Hong Kong");
});

/** {@link openspec/specs/company-pages/spec.md#scenario-the-refund-promise} */
test("the Refund Policy covers a free product and a future paid feature", async ({ page }) => {
  const html = await serverHtml(page, "/refund-policy");
  expect(html.mainText).toMatch(/free/i);
  expect(html.mainText).toMatch(/full refund within 14 days/i);
  expect(html.mailtos).toContain(MAILTO);
});

/** {@link openspec/specs/company-pages/spec.md#scenario-the-about-pages-json-ld} */
test("the About page's JSON-LD describes the organization", async ({ page }) => {
  const html = await serverHtml(page, "/about");
  expect(html.jsonLd).toHaveLength(1);
  const data = JSON.parse(html.jsonLd[0] ?? "") as {
    "@graph": { "@type": string; "@id"?: string; address?: { addressCountry: string } }[];
  };
  expect(data["@graph"].map((node) => node["@type"])).toEqual([
    "AboutPage",
    "BreadcrumbList",
    "Organization",
  ]);
  const org = data["@graph"][2];
  expect(org?.["@id"]).toBe("https://framesizes.app#organization");
  expect(org?.address?.addressCountry).toBe("HK");
});

/** {@link openspec/specs/company-pages/spec.md#scenario-a-policy-pages-json-ld} */
test("a policy page's JSON-LD is its breadcrumbs only", async ({ page }) => {
  const html = await serverHtml(page, "/refund-policy");
  expect(html.jsonLd).toHaveLength(1);
  const data = JSON.parse(html.jsonLd[0] ?? "") as { "@type"?: string; "@graph"?: unknown };
  expect(data["@type"]).toBe("BreadcrumbList");
  expect(data["@graph"]).toBeUndefined();
});

/** {@link openspec/specs/company-pages/spec.md#scenario-the-terms-of-use-social-image} */
test("the Terms of Use social image is a small PNG", async ({ page }) => {
  const html = await serverHtml(page, "/terms-of-use");
  expect(html.ogImageAlt).toBe("Terms of Use");
  const image = new URL(html.ogImage ?? "");
  const response = await page.request.get(image.pathname + image.search);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
  expect((await response.body()).length).toBeLessThan(300 * 1024);
});

/** {@link openspec/specs/company-pages/spec.md#requirement-the-five-company-pages-exist-at-their-own-urls} */
for (const p of PAGES) {
  test(`no WCAG 2.2 AA violations on ${p.path}`, async ({ page }) => {
    await page.goto(p.path);
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual(
      [],
    );
  });
}

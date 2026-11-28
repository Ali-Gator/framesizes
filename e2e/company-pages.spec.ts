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
  const text = await section(page, "/privacy-policy", "browser extension");
  for (const permission of ["sidePanel", "contextMenus", "activeTab", "scripting"]) {
    expect(text).toContain(permission);
  }
});

/** {@link openspec/specs/company-pages/spec.md#scenario-no-browser-is-named} */
test("the privacy policy names no browser", async ({ page }) => {
  const { mainText } = await serverHtml(page, "/privacy-policy");
  expect(mainText).not.toMatch(/\b(Chrome|Edge|Opera)\b/);
  // Google appears only as the mail provider.
  const mail = ["Google as our mail provider", "Google (our Gmail mailbox)", "which Google runs"];
  for (const phrase of mail) expect(mainText).toContain(phrase);
  expect(mail.reduce((text, phrase) => text.replaceAll(phrase, ""), mainText)).not.toMatch(
    /\bGoogle\b/,
  );
});

/** {@link openspec/specs/company-pages/spec.md#scenario-the-governing-law-section} */
test("the Terms of Use are numbered and governed by Hong Kong law", async ({ page }) => {
  const html = await serverHtml(page, "/terms-of-use");
  expect(html.h2s.length).toBeGreaterThanOrEqual(10);
  html.h2s.forEach((h2, i) => expect(h2).toMatch(new RegExp(`^${i + 1}\\. `)));
  expect(html.h2s.some((h2) => h2?.includes("Governing law"))).toBe(true);
  expect(await section(page, "/terms-of-use", "Governing law")).toContain("Hong Kong");
  expect(await section(page, "/terms-of-use", "1. Who provides")).toContain(
    "Soft Divisions Limited",
  );
  expect(await section(page, "/terms-of-use", "What the service is")).toMatch(
    /sizes are nominal.*measure/i,
  );
});

/** {@link openspec/specs/company-pages/spec.md#scenario-the-refund-promise} */
test("the Refund Policy covers a free product and a future paid feature", async ({ page }) => {
  const html = await serverHtml(page, "/refund-policy");
  expect(html.mainText).toMatch(/extension are free\. We charge nothing/);
  expect(html.mainText).toMatch(/full refund within 14 days/i);
  expect(html.mainText).toMatch(/is not us/);
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
test("each company page's social image is a small 1200 × 630 PNG with its h1 as alt", async ({
  page,
}) => {
  for (const p of PAGES) {
    const html = await serverHtml(page, p.path);
    expect(html.ogImageAlt, p.path).toBe(p.h1);
    const image = new URL(html.ogImage ?? "");
    const response = await page.request.get(image.pathname + image.search);
    expect(response.status(), p.path).toBe(200);
    expect(response.headers()["content-type"], p.path).toBe("image/png");
    const body = await response.body();
    expect(body.length, p.path).toBeLessThan(300 * 1024);
    // PNG IHDR: width and height are the big-endian words at bytes 16 and 20.
    expect([body.readUInt32BE(16), body.readUInt32BE(20)], p.path).toEqual([1200, 630]);
  }
});

/** {@link openspec/specs/company-pages/spec.md#scenario-the-privacy-promises} */
test("the Privacy Policy states no cookies, no uploaded photos and nothing sent by the extension", async ({
  page,
}) => {
  const html = await serverHtml(page, "/privacy-policy");
  expect(html.mainText).toContain("The site sets no cookies");
  expect(html.mainText).toContain("The photo is never uploaded");
  expect(html.mainText).toContain("The extension itself sends nothing to us");
});

/** {@link openspec/specs/company-pages/spec.md#requirement-the-five-company-pages-exist-at-their-own-urls} */
for (const p of PAGES) {
  test(`no WCAG 2.2 AA violations on ${p.path}, phone and desktop`, async ({ page }) => {
    for (const viewport of [
      { width: 375, height: 812 },
      { width: 1280, height: 800 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(p.path);
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
      expect(
        violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`),
        `${p.path} at ${viewport.width}px`,
      ).toEqual([]);
    }
  });
}

const BROWSER = /\b(Chrome|Edge|Opera)\b/;

/** The title, head descriptions and main text of a page's server HTML. */
async function headAndMain(page: Page, path: string) {
  const response = await page.request.get(path);
  expect(response.status(), path).toBe(200);
  return page.evaluate(
    (source) => {
      const doc = new DOMParser().parseFromString(source, "text/html");
      const meta = (key: string) =>
        doc
          .querySelector(`meta[property="${key}"], meta[name="${key}"]`)
          ?.getAttribute("content") ?? "";
      return {
        title: doc.title,
        description: meta("description"),
        og: meta("og:description"),
        twitter: meta("twitter:description"),
        main: doc.querySelector("main")?.textContent?.replace(/\s+/g, " ") ?? "",
      };
    },
    await response.text(),
  );
}

/** {@link openspec/specs/company-pages/spec.md#scenario-the-head-names-no-browser} */
test("the Privacy Policy's head names no browser", async ({ page }) => {
  const head = await headAndMain(page, "/privacy-policy");
  for (const [key, value] of Object.entries({ ...head, main: "" })) {
    expect(value, key).not.toMatch(BROWSER);
  }
  expect(head.description).toMatch(/extension collect/);
});

/** {@link openspec/specs/company-pages/spec.md#scenario-the-terms-name-no-browser} */
test("the Terms of Use name no browser", async ({ page }) => {
  const head = await headAndMain(page, "/terms-of-use");
  for (const key of ["title", "description", "main"] as const) {
    expect(head[key], key).not.toMatch(BROWSER);
  }
  expect(head.main.length).toBeGreaterThan(500);
});

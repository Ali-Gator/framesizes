import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { builtPage } from "../apps/web/src/lib/site-map";

const X1 = builtPage("X1");
const PATH = "/extensions/gallery-wall-layout-generator";
const URL = "https://framesizes.app/extensions/gallery-wall-layout-generator";
const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

/** What a crawler gets: the raw server HTML, no JavaScript run. */
async function serverHtml(page: Page, path = PATH) {
  const response = await page.request.get(path);
  expect(response.status()).toBe(200);
  const source = await response.text();
  return page.evaluate((html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const main = doc.querySelector("main");
    const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();
    const h1 = main?.querySelector("h1");
    let answer = h1?.nextElementSibling;
    while (answer && answer.tagName !== "P") answer = answer.nextElementSibling;
    const crumbs = doc.querySelector('nav[aria-label="Breadcrumb"]');
    const sectionOf = (title: string) =>
      [...(main?.querySelectorAll("h2") ?? [])].find((h) => text(h) === title)?.closest("section");
    const perm = sectionOf("What the extension can see")?.querySelector("dl");
    return {
      title: doc.title,
      robots: [...doc.querySelectorAll('meta[name="robots"]')].map((m) =>
        m.getAttribute("content"),
      ),
      canonicals: [...doc.querySelectorAll('link[rel="canonical"]')].map((l) =>
        l.getAttribute("href"),
      ),
      headings: [...(main?.querySelectorAll("h1, h2, h3") ?? [])].map(
        (h) => `${h.tagName.toLowerCase()} ${text(h)}`,
      ),
      steps: [
        ...(sectionOf("What you can do in the side panel")?.querySelectorAll("h3") ?? []),
      ].map(text),
      answer: text(answer),
      permissions: perm
        ? [...perm.querySelectorAll("dt")].map((dt) => [text(dt), text(dt.nextElementSibling)])
        : [],
      crumbs: [...(crumbs?.querySelectorAll("li") ?? [])].map((li) => ({
        text: text(li),
        href: li.querySelector("a")?.getAttribute("href") ?? null,
        current: li.querySelector('[aria-current="page"]') !== null,
      })),
      breadcrumbLists: [...doc.querySelectorAll('script[type="application/ld+json"]')]
        .map((s) => JSON.parse(s.textContent ?? "null") as { "@type"?: string })
        .filter((d) => d?.["@type"] === "BreadcrumbList"),
      photoNote: text(perm?.nextElementSibling),
      storeLinks: doc.querySelectorAll('a[href^="https://chromewebstore.google.com"]').length,
      shopHeadings: [...doc.querySelectorAll("h2")].filter(
        (h) => text(h) === "Plan on any shop's page",
      ).length,
      links: [...doc.querySelectorAll("a")].map((a) => a.getAttribute("href")),
      footerLinks: [...doc.querySelectorAll("footer a")].map((a) => a.getAttribute("href")),
      relatedLinks: [...(sectionOf("Related tools")?.querySelectorAll("a") ?? [])].map((a) =>
        a.getAttribute("href"),
      ),
    };
  }, source);
}

const pinHeading = (page: Page) => page.getByRole("heading", { name: "Pin it to your toolbar" });
const usageHeading = (page: Page) =>
  page.getByRole("heading", { name: "What you can do in the side panel" });

/**
 * {@link openspec/specs/extension-site/spec.md#scenario-the-extension-pages-heading-outline}
 * {@link openspec/specs/extension-site/spec.md#scenario-the-answer-paragraph}
 */
test("the server HTML is the how-to, in the approved order", async ({ page }) => {
  const html = await serverHtml(page);
  expect(html.headings.filter((h) => !h.startsWith("h3"))).toEqual([
    `h1 ${X1.seo.h1}`,
    "h2 Pin it to your toolbar",
    "h2 What you can do in the side panel",
    "h2 Use your own wall",
    "h2 What the extension can see",
    "h2 Questions",
    "h2 Related tools",
  ]);
  expect(html.steps).toEqual([
    "Plan a gallery wall",
    "Try a print from a shop",
    "Get the nail marks",
  ]);
  const questions = html.headings.slice(
    html.headings.indexOf("h2 Questions") + 1,
    html.headings.indexOf("h2 Related tools"),
  );
  expect(questions).toHaveLength(3);
  expect(questions.every((h) => h.startsWith("h3"))).toBe(true);
  expect(html.answer).toMatch(/button in Chrome's toolbar to open the side panel/);
  expect(html.answer).toMatch(/plan a gallery wall/);
  expect(html.answer).toMatch(/right-click a print and pick “Try on my wall”/);
  expect(html.answer).toMatch(/at true size/);
});

/** {@link openspec/specs/extension-site/spec.md#scenario-opened-after-install-with-the-button-not-pinned} */
test("?pinned=0 opens the pin steps", async ({ page }) => {
  await page.goto(`${PATH}?pinned=0`);
  await expect(pinHeading(page)).toBeVisible();
  await expect(usageHeading(page)).toBeHidden();
  await expect(page.getByRole("heading", { level: 1, name: X1.seo.h1 })).toBeVisible();
});

/** {@link openspec/specs/extension-site/spec.md#scenario-opened-after-install-with-the-button-pinned} */
test("?pinned=1 opens the how-to", async ({ page }) => {
  await page.goto(`${PATH}?pinned=1`);
  await expect(usageHeading(page)).toBeVisible();
  await expect(pinHeading(page)).toBeHidden();
});

/** {@link openspec/specs/extension-site/spec.md#scenario-a-hash-beats-the-query} */
test("#usage beats ?pinned=0", async ({ page }) => {
  await page.goto(`${PATH}?pinned=0#usage`);
  await expect(usageHeading(page)).toBeVisible();
  await expect(pinHeading(page)).toBeHidden();
});

/** {@link openspec/specs/extension-site/spec.md#scenario-from-usage-mode-to-the-pin-steps} */
test("Show how to pin it switches to the pin steps and focuses them", async ({ page }) => {
  await page.goto(PATH);
  await expect(usageHeading(page)).toBeVisible();
  await page.getByRole("link", { name: "Show how to pin it" }).click();
  await expect(page).toHaveURL(/#pin$/);
  await expect(pinHeading(page)).toBeFocused();
  await expect(usageHeading(page)).toBeHidden();
  await page.getByRole("link", { name: "See how to use it" }).click();
  await expect(page).toHaveURL(/#usage$/);
  await expect(usageHeading(page)).toBeFocused();
});

/** {@link openspec/specs/extension-site/spec.md#scenario-the-pin-pictures-name} */
test("the pin picture names both clicks", async ({ page }) => {
  await page.goto(`${PATH}?pinned=0`);
  const picture = page.locator("#pin [role='img']");
  await expect(picture).toHaveCount(1);
  const name = (await picture.getAttribute("aria-label")) ?? "";
  expect(name).toMatch(/puzzle-piece button, marked 1/);
  expect(name).toMatch(/pin next to Gallery Wall Layout Generator is marked 2/);
  await expect(page.locator("#pin p").first()).toContainText("puzzle piece (1)");
  await expect(page.locator("#pin p").first()).toContainText("the pin (2)");
});

/** {@link openspec/specs/extension-site/spec.md#scenario-the-framesizesapp-row} */
test("the permissions list has a framesizes.app row", async ({ page }) => {
  const html = await serverHtml(page);
  expect(html.permissions.map(([dt]) => dt)).toEqual([
    "Right-click menu",
    "The tab you click in",
    "framesizes.app",
  ]);
  const row = html.permissions.find(([dt]) => dt === "framesizes.app")?.[1] ?? "";
  expect(row).toMatch(/whether the extension is installed and pinned/);
  expect(row).toMatch(/Nothing else is shared/);
  expect(html.permissions[0]?.[1]).toMatch(/Adds “Try on my wall” when you right-click an image/);
  expect(html.permissions[1]?.[1]).toMatch(/reads that page once.*the image and any sizes/);
  expect(html.photoNote).toBe("Your wall photo stays on this computer.");
});

/** {@link openspec/specs/extension-site/spec.md#scenario-no-detectable-violations-in-either-mode} */
for (const query of ["?pinned=0", "?pinned=1"]) {
  test(`no WCAG 2.2 AA violations at ${query}`, async ({ page }) => {
    await page.goto(`${PATH}${query}`);
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual(
      [],
    );
  });
}

/** {@link openspec/specs/extension-site/spec.md#scenario-the-page-at-320-px} */
for (const query of ["?pinned=0", "?pinned=1"]) {
  test(`no horizontal overflow at 320px with ${query}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(`${PATH}${query}`);
    const widths = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(widths.document).toBeLessThanOrEqual(widths.viewport);
  });
}

/** {@link openspec/specs/seo-base/spec.md#scenario-the-extension-page-before-go-live} */
test("before go-live the page is noindex and linked from nowhere", async ({ page }) => {
  test.skip(X1.live, "X1 is live: the go-live scenarios replace this one");
  const html = await serverHtml(page);
  expect(html.title).toBe("Gallery Wall Layout Generator Chrome Extension | Frame Sizes");
  expect(html.canonicals).toEqual([URL]);
  expect(html.robots).toHaveLength(1);
  expect(html.robots[0]).toMatch(/noindex/);
  expect(html.footerLinks).not.toContain(PATH);

  const sitemap = await (await page.request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain(PATH);
  const g1 = await serverHtml(page, "/gallery-wall-planner");
  expect(g1.links).not.toContain(PATH);
  expect(g1.relatedLinks.length).toBeGreaterThan(0);
  expect(g1.relatedLinks).not.toContain(PATH);
});

/** {@link openspec/specs/seo-base/spec.md#scenario-the-extension-pages-breadcrumbs} */
test("the breadcrumbs name the hub between Home and the page", async ({ page }) => {
  const html = await serverHtml(page);
  expect(html.crumbs).toEqual([
    { text: "Home", href: "/", current: false },
    { text: "Gallery wall", href: "/gallery-wall-planner", current: false },
    { text: "Chrome extension", href: null, current: true },
  ]);
  expect(html.breadcrumbLists).toHaveLength(1);
  expect(html.breadcrumbLists[0]).toMatchObject({
    itemListElement: [
      { position: 1, name: "Home", item: "https://framesizes.app" },
      { position: 2, name: "Gallery wall", item: "https://framesizes.app/gallery-wall-planner" },
      { position: 3, name: "Chrome extension", item: URL },
    ],
  });
});

/** {@link openspec/specs/extension-site/spec.md#scenario-no-store-link-before-go-live} */
test("no Chrome Web Store link before go-live", async ({ page }) => {
  test.skip(X1.live, "X1 is live: the go-live scenarios replace this one");
  expect((await serverHtml(page)).storeLinks).toBe(0);
});

/** {@link openspec/specs/extension-site/spec.md#scenario-no-section-before-go-live} */
for (const path of ["/gallery-wall-planner", "/frame-sizes-on-wall"]) {
  test(`no extension section on ${path} before go-live`, async ({ page }) => {
    test.skip(X1.live, "X1 is live: the go-live scenarios replace this one");
    const html = await serverHtml(page, path);
    expect(html.shopHeadings).toBe(0);
    expect(html.storeLinks).toBe(0);
  });
}

import { expect, type Page, test } from "@playwright/test";

import { fullTitle, livePage } from "../apps/web/src/lib/site-map";

const F3 = livePage("F3");
const PATH = "/how-big-is-8x10";
const CANONICAL = "https://framesizes.app/how-big-is-8x10";

/** What a crawler gets: the raw server HTML, no JavaScript run. */
async function serverHtml(page: Page) {
  const response = await page.request.get(PATH);
  expect(response.status()).toBe(200);
  const source = await response.text();
  return page.evaluate((html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const main = doc.querySelector("main");
    const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();
    const meta = (key: string) =>
      [...doc.querySelectorAll(`meta[property="${key}"], meta[name="${key}"]`)].map(
        (m) => m.getAttribute("content") ?? "",
      );
    const section = (title: string) =>
      [...(main?.querySelectorAll("h2") ?? [])].find((h) => text(h) === title)?.closest("section");
    const h1 = main?.querySelector("h1");
    let answer = h1?.nextElementSibling;
    while (answer && answer.tagName !== "P") answer = answer.nextElementSibling;
    const table = main?.querySelector("table");
    const crumbs = doc.querySelector('nav[aria-label="Breadcrumb"]');
    return {
      title: doc.title,
      canonicals: [...doc.querySelectorAll('link[rel="canonical"]')].map((l) =>
        l.getAttribute("href"),
      ),
      headings: [...(main?.querySelectorAll("h1, h2, h3") ?? [])].map(
        (h) => `${h.tagName.toLowerCase()} ${text(h)}`,
      ),
      steps: section("How to see a frame size at actual size")?.querySelector("ol")?.children
        .length,
      answer: text(answer),
      rows: [...(table?.querySelectorAll("tbody tr") ?? [])].map((tr) => [
        text(tr.children[0]),
        ...[...(tr.children[1]?.querySelectorAll(".u-in, .u-cm") ?? [])].map(text),
        text(tr.children[2]),
      ]),
      sponsored: [...doc.querySelectorAll("a[rel]")].filter((a) =>
        (a.getAttribute("rel") ?? "").includes("sponsored"),
      ).length,
      related: [...(section("Related tools")?.querySelectorAll("a[href]") ?? [])].map((a) =>
        a.getAttribute("href"),
      ),
      hrefs: [...doc.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") ?? ""),
      crumbs: {
        items: [...(crumbs?.querySelectorAll("li") ?? [])].map(text),
        current: text(crumbs?.querySelector('[aria-current="page"]')),
      },
      jsonLd: [...doc.querySelectorAll('script[type="application/ld+json"]')].map(
        (s) => s.textContent ?? "",
      ),
      imageAlt: meta("og:image:alt"),
      image: meta("og:image"),
    };
  }, source);
}

/** {@link openspec/specs/actual-size/spec.md#scenario-the-heading-outline-of-the-server-html} */
test("the server HTML follows the approved outline", async ({ page }) => {
  const { headings, steps } = await serverHtml(page);
  expect(headings.filter((h) => !h.startsWith("h3"))).toEqual([
    "h1 How Big Is 8x10?",
    "h2 8x10 at actual size",
    "h2 How to see a frame size at actual size",
    "h2 How big is 8x10 next to things you know",
    "h2 8x10 picture frame sizes compared",
    "h2 Questions about frame sizes",
    "h2 Related tools",
  ]);
  expect(steps).toBe(3);
  const questions = headings.slice(
    headings.indexOf("h2 Questions about frame sizes") + 1,
    headings.indexOf("h2 Related tools"),
  );
  expect(questions).toHaveLength(6);
  for (const q of questions) expect(q).toMatch(/^h3 .+\?$/);
});

/** {@link openspec/specs/actual-size/spec.md#scenario-the-answer-in-the-server-html} */
test("the first paragraph answers in inches and centimetres", async ({ page }) => {
  const { answer } = await serverHtml(page);
  for (const part of ["8 by 10 inches", "20.3 × 25.4 cm", "Letter"]) {
    expect(answer).toContain(part);
  }
});

/** {@link openspec/specs/actual-size/spec.md#scenario-the-table-in-the-server-html} */
test("the comparison table lists the seven sizes by area", async ({ page }) => {
  const { rows } = await serverHtml(page);
  expect(rows).toEqual([
    ["4x6", "4 × 6 in", "10.2 × 15.2 cm", "0.3×"],
    ["5x7", "5 × 7 in", "12.7 × 17.8 cm", "0.4×"],
    ["8x10", "8 × 10 in", "20.3 × 25.4 cm", "1×"],
    ["A4", "8.3 × 11.7 in", "21.0 × 29.7 cm", "1.2×"],
    ["11x14", "11 × 14 in", "27.9 × 35.6 cm", "1.9×"],
    ["A3", "11.7 × 16.5 in", "29.7 × 42.0 cm", "2.4×"],
    ["16x20", "16 × 20 in", "40.6 × 50.8 cm", "4×"],
  ]);
});

/** {@link openspec/specs/actual-size/spec.md#scenario-no-affiliate-links} */
test("no affiliate links", async ({ page }) => {
  const { sponsored, headings } = await serverHtml(page);
  expect(sponsored).toBe(0);
  expect(headings.join()).not.toContain("Where to buy");
});

/** {@link openspec/specs/actual-size/spec.md#scenario-f1-f2-f3-f4-f5-f6-f7-and-g1-are-live} */
test("links only to live pages", async ({ page }) => {
  const { related, hrefs } = await serverHtml(page);
  expect(related).toEqual([
    "/",
    "/frame-sizes-on-wall",
    "/measure-picture-frame",
    "/frame-mat-calculator",
    "/poster-frame-sizes",
    "/frame-mockup",
    "/gallery-wall-planner",
  ]);
  expect(hrefs).not.toContain("/photo-print-sizes");
  expect(hrefs).not.toContain("/dpi-checker");
  expect(hrefs.filter((h) => h.startsWith("#"))).toEqual([]);
});

/** {@link openspec/specs/actual-size/spec.md#scenario-the-head-of-the-page} */
test("title, canonical and the social image's alt", async ({ page }) => {
  const { title, canonicals, imageAlt, image } = await serverHtml(page);
  expect(title).toBe(fullTitle(F3.seo.title));
  expect(title).toBe("How Big Is 8x10? See It at Actual Size | Frame Sizes");
  expect(canonicals).toEqual([CANONICAL]);
  expect(imageAlt).toEqual([
    "8x10 frame compared with 11x14, 16x20, A4 and A3 frames at the same scale",
  ]);
  const url = new URL(image[0] ?? "");
  expect(url.pathname).toMatch(/\/how-big-is-8x10\/opengraph-image/);
  const response = await page.request.get(url.pathname + url.search);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
});

/** {@link openspec/specs/actual-size/spec.md#scenario-f3s-breadcrumbs} */
test("breadcrumbs and one BreadcrumbList", async ({ page }) => {
  const { crumbs, jsonLd } = await serverHtml(page);
  expect(crumbs.items).toEqual(["Home", "How big is 8x10"]);
  expect(crumbs.current).toBe("How big is 8x10");
  expect(jsonLd).toHaveLength(1);
  const data = JSON.parse(jsonLd[0] ?? "") as {
    "@type": string;
    itemListElement: { item: string }[];
  };
  expect(data["@type"]).toBe("BreadcrumbList");
  expect(data.itemListElement.map((i) => i.item)).toEqual(["https://framesizes.app", CANONICAL]);
});

test.describe("on a small phone", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  /** {@link openspec/specs/actual-size/spec.md#scenario-the-first-screen-on-a-small-phone} */
  test("the h1, the answer and the viewer's title fit the first screen", async ({ page }) => {
    await page.goto(PATH);
    const main = page.getByRole("main");
    for (const el of [
      main.getByRole("heading", { level: 1 }),
      main.locator("h1 ~ p").first(),
      main.getByRole("heading", { name: "8x10 at actual size" }),
    ]) {
      const box = await el.boundingBox();
      expect(box).not.toBeNull();
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(740);
    }
  });
});

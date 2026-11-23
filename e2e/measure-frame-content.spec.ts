import { expect, type Page, test } from "@playwright/test";

import { fullTitle, livePage } from "../apps/web/src/lib/site-map";

const F4 = livePage("F4");
const PATH = "/measure-picture-frame";
const CANONICAL = "https://framesizes.app/measure-picture-frame";

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
    const faq = section("Questions about frame dimensions");
    const crumbs = doc.querySelector('nav[aria-label="Breadcrumb"]');
    /** A cell's inch form, and its centimetre form when it has one. */
    const cell = (td: Element | undefined) => {
      const inch = td?.querySelector(".u-in");
      return inch ? [text(inch), text(td?.querySelector(".u-cm"))] : [text(td)];
    };
    return {
      title: doc.title,
      canonicals: [...doc.querySelectorAll('link[rel="canonical"]')].map((l) =>
        l.getAttribute("href"),
      ),
      outline: [...(main?.querySelectorAll("h1, h2") ?? [])].map(
        (h) => `${h.tagName.toLowerCase()} ${text(h)}`,
      ),
      steps: section("How to measure picture frame size")?.querySelector("ol")?.children.length,
      answer: text(answer),
      tableTitle: text(main?.querySelector("caption .fs-table-title")),
      rows: Object.fromEntries(
        [...(main?.querySelectorAll("tbody tr") ?? [])].map((tr) => [
          text(tr.children[0]),
          [...tr.children].slice(1).map(cell),
        ]),
      ),
      questions: [...(faq?.querySelectorAll("details") ?? [])].map((d) => ({
        q: text(d.querySelector("summary h3")),
        a: text(d.querySelector(".fs-faq-a")),
        open: d.hasAttribute("open"),
      })),
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
        home: crumbs?.querySelector("a")?.getAttribute("href"),
      },
      jsonLd: [...doc.querySelectorAll('script[type="application/ld+json"]')].map(
        (s) => s.textContent ?? "",
      ),
      imageAlt: meta("og:image:alt"),
      image: meta("og:image"),
    };
  }, source);
}

/** {@link openspec/specs/measure-frame/spec.md#scenario-the-heading-outline-of-the-server-html} */
test("the server HTML follows the approved outline", async ({ page }) => {
  const { outline, steps, questions } = await serverHtml(page);
  expect(outline).toEqual([
    "h1 How to Measure a Picture Frame",
    "h2 Measure your frame",
    "h2 How to measure picture frame size",
    "h2 8x10 frame measurements and other sizes",
    "h2 Questions about frame dimensions",
    "h2 Related tools",
  ]);
  expect(steps).toBe(3);
  expect(questions).toHaveLength(6);
});

/** {@link openspec/specs/measure-frame/spec.md#scenario-the-answer-in-the-server-html} */
test("the first paragraph answers with an 8x10's dimensions in both units", async ({ page }) => {
  const { answer } = await serverHtml(page);
  expect(answer).toMatch(/^Picture frame dimensions/);
  for (const part of [
    "8 × 10 in",
    "20.3 × 25.4 cm",
    "7½ × 9½ in",
    "19.1 × 24.1 cm",
    "10 × 12 in",
    "25.4 × 30.5 cm",
  ])
    expect(answer).toContain(part);
});

/** {@link openspec/specs/measure-frame/spec.md#scenario-the-8x10-row} */
test("the table gives the 8x10's four measurements and its mat print", async ({ page }) => {
  const { tableTitle, rows } = await serverHtml(page);
  expect(tableTitle).toBe("Picture frame dimensions by size");
  expect(Object.keys(rows)).toEqual(["4x6", "5x7", "8x10", "11x14", "16x20", "24x36"]);
  expect(rows["8x10"]).toEqual([
    ["8 × 10 in", "20.3 × 25.4 cm"],
    ["7½ × 9½ in", "19.1 × 24.1 cm"],
    ["10 × 12 in", "25.4 × 30.5 cm"],
    ["4½ × 6½ in", "11.4 × 16.5 cm"],
    ["5x7 print"],
  ]);
});

/** {@link openspec/specs/measure-frame/spec.md#scenario-a-frame-with-no-pre-cut-mat} */
test("the 4x6 has no pre-cut mat", async ({ page }) => {
  const { rows } = await serverHtml(page);
  expect(rows["4x6"]?.slice(3)).toEqual([["—"], ["—"]]);
});

/** {@link openspec/specs/measure-frame/spec.md#scenario-the-six-questions} */
test("six questions, each answered in the HTML, the first open", async ({ page }) => {
  const { questions } = await serverHtml(page);
  expect(questions.map((q) => q.q)).toEqual([
    "Is frame size measured inside or outside?",
    "Why is the opening smaller than my photo?",
    "Do I measure with the mat or without?",
    "What size frame do I need for an 8x10 photo?",
    "My frame matches no standard size. What now?",
    "How do I measure a frame with a rounded edge?",
  ]);
  for (const q of questions) expect(q.a?.length ?? 0).toBeGreaterThan(40);
  expect(questions.map((q) => q.open)).toEqual([true, false, false, false, false, false]);
});

/** {@link openspec/specs/measure-frame/spec.md#scenario-no-affiliate-links} */
test("no affiliate links", async ({ page }) => {
  const { sponsored, outline } = await serverHtml(page);
  expect(sponsored).toBe(0);
  expect(outline.join()).not.toContain("Where to buy");
});

/** {@link openspec/specs/measure-frame/spec.md#scenario-f1-f2-f3-f4-f5-and-g1-are-live} */
test("links only to live pages", async ({ page }) => {
  const { related, hrefs } = await serverHtml(page);
  expect(related).toEqual([
    "/",
    "/frame-sizes-on-wall",
    "/how-big-is-8x10",
    "/frame-mat-calculator",
  ]);
  expect(hrefs).not.toContain("/photo-print-sizes");
  expect(hrefs.filter((h) => h.startsWith("#"))).toEqual([]);
});

/** {@link openspec/specs/measure-frame/spec.md#scenario-the-head-of-the-page} */
test("title, canonical and the social image's alt", async ({ page }) => {
  const { title, canonicals, imageAlt, image } = await serverHtml(page);
  expect(title).toBe(fullTitle(F4.seo.title));
  expect(title).toBe("How to Measure Picture Frame Dimensions | Frame Sizes");
  expect(canonicals).toEqual([CANONICAL]);
  expect(imageAlt).toEqual([
    "8x10 picture frame with its inside, front opening and outside measured",
  ]);
  const url = new URL(image[0] ?? "");
  expect(url.pathname).toMatch(/\/measure-picture-frame\/opengraph-image/);
  const response = await page.request.get(url.pathname + url.search);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
});

/** {@link openspec/specs/measure-frame/spec.md#scenario-f4s-breadcrumbs} */
test("breadcrumbs and one BreadcrumbList, no FAQPage or HowTo", async ({ page }) => {
  const { crumbs, jsonLd } = await serverHtml(page);
  expect(crumbs.items).toEqual(["Home", "Measure a picture frame"]);
  expect(crumbs.current).toBe("Measure a picture frame");
  expect(crumbs.home).toBe("/");
  expect(jsonLd).toHaveLength(1);
  expect(jsonLd.join()).not.toMatch(/FAQPage|HowTo/);
  const data = JSON.parse(jsonLd[0] ?? "") as {
    "@type": string;
    itemListElement: { item: string }[];
  };
  expect(data["@type"]).toBe("BreadcrumbList");
  expect(data.itemListElement.map((i) => i.item)).toEqual(["https://framesizes.app", CANONICAL]);
});

test.describe("on a small phone", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-the-first-screen-on-a-small-phone} */
  test("the h1, the answer and the first step's question fit the first screen", async ({
    page,
  }) => {
    await page.goto(PATH);
    const main = page.getByRole("main");
    for (const el of [
      main.getByRole("heading", { level: 1 }),
      main.locator("h1 ~ p").first(),
      main.getByText("What are you measuring?"),
    ]) {
      const box = await el.boundingBox();
      expect(box).not.toBeNull();
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(740);
    }
  });
});

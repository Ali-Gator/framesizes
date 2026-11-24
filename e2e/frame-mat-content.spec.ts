import { expect, type Page, test } from "@playwright/test";

import { fullTitle, livePage } from "../apps/web/src/lib/site-map";

const F5 = livePage("F5");
const PATH = "/frame-mat-calculator";
const CANONICAL = "https://framesizes.app/frame-mat-calculator";
const ALT = "8x10 print in an 11½ × 13½ in frame with a 2 in mat and a 7½ × 9½ in opening";

/** What a crawler gets: the raw server HTML, no JavaScript run. */
async function serverHtml(page: Page) {
  const response = await page.request.get(PATH);
  expect(response.status()).toBe(200);
  const source = await response.text();
  return page.evaluate((html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const main = doc.querySelector("main");
    const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();
    /** The inch half of each two-unit span, as an inch visitor reads it. */
    const inches = (el: Element | null | undefined) => {
      const copy = el?.cloneNode(true) as Element | undefined;
      copy?.querySelectorAll(".u-cm").forEach((n) => n.remove());
      return text(copy);
    };
    const cms = (el: Element | null | undefined) => {
      const copy = el?.cloneNode(true) as Element | undefined;
      copy?.querySelectorAll(".u-in").forEach((n) => n.remove());
      return text(copy);
    };
    const meta = (key: string) =>
      [...doc.querySelectorAll(`meta[property="${key}"], meta[name="${key}"]`)].map(
        (m) => m.getAttribute("content") ?? "",
      );
    const section = (title: string) =>
      [...(main?.querySelectorAll("h2") ?? [])].find((h) => text(h) === title)?.closest("section");
    const h1 = main?.querySelector("h1");
    let intro = h1?.nextElementSibling;
    while (intro && intro.tagName !== "P") intro = intro.nextElementSibling;
    const formula = section("Frame and mat size formula");
    const cases = section("Frame sizes for common prints");
    const faq = section("Questions about frame and mat sizes");
    const calc = section("Frame and mat calculator");
    const crumbs = doc.querySelector('nav[aria-label="Breadcrumb"]');
    return {
      title: doc.title,
      canonicals: [...doc.querySelectorAll('link[rel="canonical"]')].map((l) =>
        l.getAttribute("href"),
      ),
      outline: [...(main?.querySelectorAll("h1, h2") ?? [])].map(
        (h) => `${h.tagName.toLowerCase()} ${text(h)}`,
      ),
      steps: [
        ...(section("How to use the frame and mat calculator")?.querySelectorAll("ol > li h3") ??
          []),
      ].map(text),
      intro: text(intro),
      calc: {
        inputs: [...(calc?.querySelectorAll("input") ?? [])].map((i) => [
          text(calc?.querySelector(`label[for="${i.id}"]`)),
          i.getAttribute("value") ?? "",
        ]),
        pressed: [...(calc?.querySelectorAll('[aria-pressed="true"]') ?? [])].map(inches),
        button: text(calc?.querySelector(".mc-bar button")),
        empty: text(calc?.querySelector('[aria-live="polite"]')),
        caption: text(calc?.querySelector("figcaption")),
      },
      formulaIn: inches(formula),
      formulaCm: cms(formula),
      tableTitle: text(main?.querySelector("caption .fs-table-title")),
      rows: Object.fromEntries(
        [...(main?.querySelectorAll("tbody tr") ?? [])].map((tr) => [
          text(tr.children[0]),
          [...tr.children].slice(1).map(inches),
        ]),
      ),
      underTable: text(formula?.querySelector(".fs-table-wrap ~ p")),
      cases: [...(cases?.querySelectorAll("article") ?? [])].map(inches),
      page: text(main),
      questions: [...(faq?.querySelectorAll("details") ?? [])].map((d) => ({
        q: text(d.querySelector("summary h3")),
        a: inches(d.querySelector(".fs-faq-a")),
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

/** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-heading-outline-of-the-server-html} */
test("the server HTML follows the approved outline", async ({ page }) => {
  const { outline, steps } = await serverHtml(page);
  expect(outline).toEqual([
    "h1 Frame and Mat Size Calculator",
    "h2 Frame and mat calculator",
    "h2 How to use the frame and mat calculator",
    "h2 Frame and mat size formula",
    "h2 Frame sizes for common prints",
    "h2 Questions about frame and mat sizes",
    "h2 Related tools",
  ]);
  expect(steps).toEqual([
    "Pick a direction",
    "Enter the width and height",
    "Pick a mat border",
    "Read the answer",
  ]);
});

/** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-intro-in-the-server-html} */
test("the intro names the picture frame size calculator", async ({ page }) => {
  const { intro } = await serverHtml(page);
  expect(intro).toBe(
    "A picture frame size calculator for framing a print with a mat: enter the print and the mat border to get the frame size and the mat opening, or start from a frame to find the print that fits.",
  );
});

/** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-calculator-in-the-server-html} */
test("the calculator starts from a print with a 2 in border", async ({ page }) => {
  const { calc } = await serverHtml(page);
  expect(calc.inputs).toEqual([
    ["Print width", ""],
    ["Print height", ""],
    ["Mat border", "2"],
  ]);
  expect(calc.pressed).toEqual(["2 in"]);
  expect(calc.button).toBe("Find my frame size");
  expect(calc.empty).toBe(
    "Enter your print size and a mat border. The frame size and mat opening show here.",
  );
  expect(calc.caption).toBe("Example: an 8x10 print in an 11x14 frame with a pre-cut mat.");
});

/** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-rules-in-inches} */
test("the formula in inches", async ({ page }) => {
  const { formulaIn } = await serverHtml(page);
  for (const part of [
    "frame = print − ½ in + 2 × mat border",
    "An 8x10 print with a 2 in mat: 8 − ½ + 4 = 11½ and 10 − ½ + 4 = 13½. The frame is 11½ × 13½ in.",
    "print = frame − 2 × mat border + ½ in",
    "opening = print − ½ in",
  ])
    expect(formulaIn).toContain(part);
});

/** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-rules-in-centimetres} */
test("the formula in centimetres", async ({ page }) => {
  const { formulaCm } = await serverHtml(page);
  expect(formulaCm).toContain("frame = print − 1.3 cm + 2 × mat border");
  expect(formulaCm).toContain(
    "An 8x10 print (20.3 × 25.4 cm) with a 5.1 cm mat needs a 29.2 × 34.3 cm frame.",
  );
});

/** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-table} */
test("the mat board sizes table", async ({ page }) => {
  const { tableTitle, rows, underTable } = await serverHtml(page);
  expect(tableTitle).toBe("Mat board sizes");
  expect(Object.keys(rows)).toHaveLength(15);
  expect(rows["11x14"]).toEqual(["7½ × 9½ in", "8x10", "1¾ / 2¼ in"]);
  expect(rows["20x20"]).toEqual(["15½ × 15½ in", "16x16", "2¼ in"]);
  expect(underTable).toMatch(/frame mat sizes/i);
  expect(underTable).toContain("Usually sold without a mat: 4x6, 8.5x11, 20x30 and 27x40 frames.");
});

/** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-an-11x14-print} */
test("the 11x14 case", async ({ page }) => {
  const { cases } = await serverHtml(page);
  expect(cases[0]).toContain("16x20 frame");
  expect(cases[0]).toContain("2¾ in at the sides, 3¼ in at the top and bottom");
  expect(cases[0]).toContain("14½ × 17½ in, between 12x16 and 16x20");
});

/** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-diploma} */
test("the diploma case, and nothing unverified", async ({ page }) => {
  const { cases, page: text } = await serverHtml(page);
  const diploma = cases.at(-1) ?? "";
  expect(diploma).toContain("11x14 frame");
  expect(diploma).toContain(
    "a mat cut for an 8.5x11 diploma: 1½ in at the sides, 1¾ in at the top and bottom",
  );
  expect(diploma).toContain(
    "a 12x16 frame comes with a pre-cut 8.5x11 mat: 2 in at the sides, 2¾ in at the top and bottom",
  );
  expect(text).not.toContain("Unverified");
});

/** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-seven-questions} */
test("seven questions, each answered in the HTML, the first open", async ({ page }) => {
  const { questions } = await serverHtml(page);
  expect(questions.map((q) => q.q)).toEqual([
    "What size frame for 11x14 print do I need?",
    "What size frame for diploma certificates?",
    "How much bigger than the print is the frame?",
    "Why is the mat opening smaller than the print?",
    "How wide is a pre-cut mat?",
    "Does the frame cover part of the mat?",
    "Can I use centimetres?",
  ]);
  for (const q of questions) expect(q.a?.length ?? 0).toBeGreaterThan(40);
  expect(questions.map((q) => q.open)).toEqual([true, false, false, false, false, false, false]);
});

/** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-no-affiliate-links} */
test("no affiliate links", async ({ page }) => {
  const { sponsored, page: text } = await serverHtml(page);
  expect(sponsored).toBe(0);
  expect(text).not.toContain("Where to buy");
});

/** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-f1-f2-f3-f4-f5-f6-and-g1-are-live} */
test("links only to live pages", async ({ page }) => {
  const { related, hrefs } = await serverHtml(page);
  expect(related).toEqual([
    "/",
    "/frame-sizes-on-wall",
    "/how-big-is-8x10",
    "/measure-picture-frame",
    "/poster-frame-sizes",
  ]);
  expect(hrefs).not.toContain("/art-print-sizes");
  expect(hrefs.filter((h) => h.startsWith("#"))).toEqual([]);
});

/** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-head-of-the-page} */
test("title, canonical and the social image's alt", async ({ page }) => {
  const { title, canonicals, imageAlt, image } = await serverHtml(page);
  expect(title).toBe(fullTitle(F5.seo.title));
  expect(title).toBe("Picture Frame & Mat Calculator | Frame Sizes");
  expect(canonicals).toEqual([CANONICAL]);
  expect(imageAlt).toEqual([ALT]);
  const url = new URL(image[0] ?? "");
  expect(url.pathname).toMatch(/\/frame-mat-calculator\/opengraph-image/);
  const response = await page.request.get(url.pathname + url.search);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
});

/** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-f5s-breadcrumbs} */
test("breadcrumbs and one BreadcrumbList, no FAQPage or HowTo", async ({ page }) => {
  const { crumbs, jsonLd } = await serverHtml(page);
  expect(crumbs.items).toEqual(["Home", "Frame and mat calculator"]);
  expect(crumbs.current).toBe("Frame and mat calculator");
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

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-first-screen-on-a-small-phone} */
  test("the h1, the intro and the calculator's title fit the first screen", async ({ page }) => {
    await page.goto(PATH);
    const main = page.getByRole("main");
    for (const el of [
      main.getByRole("heading", { level: 1 }),
      main.locator("h1 ~ p").first(),
      main.getByRole("heading", { name: "Frame and mat calculator", exact: true, level: 2 }),
    ]) {
      const box = await el.boundingBox();
      expect(box).not.toBeNull();
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(740);
    }
  });
});

import { expect, type Page, test } from "@playwright/test";

import { fullTitle, livePage } from "../apps/web/src/lib/site-map";

const F6 = livePage("F6");
const PATH = "/poster-frame-sizes";
const CANONICAL = "https://framesizes.app/poster-frame-sizes";
const ALT = "A 24x36 poster in a 24x36 frame, and in a 27x40 frame with a mat";

/** What a crawler gets: the raw server HTML, no JavaScript run. */
async function serverHtml(page: Page) {
  const response = await page.request.get(PATH);
  expect(response.status()).toBe(200);
  const source = await response.text();
  return page.evaluate((html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const main = doc.querySelector("main");
    const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();
    /** One half of each two-unit span, as a visitor in that unit reads it. */
    const only = (el: Element | null | undefined, hide: string) => {
      const copy = el?.cloneNode(true) as Element | undefined;
      copy?.querySelectorAll(hide).forEach((n) => n.remove());
      return text(copy);
    };
    const inches = (el: Element | null | undefined) => only(el, ".u-cm");
    const cms = (el: Element | null | undefined) => only(el, ".u-in");
    /** Each `.pt-l` / `.pt-use` / `.pt-none` line of a cell, in one unit. */
    const lines = (cell: Element | undefined, read: typeof inches) =>
      [...(cell?.querySelectorAll(".pt-l, .pt-use, .pt-none") ?? [])]
        .filter((l) => !l.parentElement?.closest(".pt-l"))
        .map(read);
    const meta = (key: string) =>
      [...doc.querySelectorAll(`meta[property="${key}"], meta[name="${key}"]`)].map(
        (m) => m.getAttribute("content") ?? "",
      );
    const section = (title: string) =>
      [...(main?.querySelectorAll("h2") ?? [])].find((h) => text(h) === title)?.closest("section");
    const cards = (title: string) =>
      Object.fromEntries(
        [...(section(title)?.querySelectorAll("article") ?? [])].map((a) => [
          text(a.querySelector("h3")),
          [...a.querySelectorAll("span, p")]
            .filter((e) => !e.parentElement?.closest("span, p"))
            .map(inches),
        ]),
      );
    const h1 = main?.querySelector("h1");
    let intro = h1?.nextElementSibling;
    while (intro && intro.tagName !== "P") intro = intro.nextElementSibling;
    const widget = section("Find the frame for your poster");
    const howTo = section("How to choose a poster frame");
    const faq = section("Questions about poster frames");
    const painting = section("Painting frame sizes");
    const crumbs = doc.querySelector('nav[aria-label="Breadcrumb"]');
    const rows = [...(main?.querySelectorAll("tbody tr") ?? [])];
    return {
      title: doc.title,
      canonicals: [...doc.querySelectorAll('link[rel="canonical"]')].map((l) =>
        l.getAttribute("href"),
      ),
      outline: [...(main?.querySelectorAll("h1, h2") ?? [])].map(
        (h) => `${h.tagName.toLowerCase()} ${text(h)}`,
      ),
      steps: [...(howTo?.querySelectorAll("ol > li") ?? [])].map((li) => ({
        t: text(li.querySelector("h3")),
        in: inches(li.querySelector("p")),
        cm: cms(li.querySelector("p")),
      })),
      intro: text(intro),
      widget: {
        chips: [...(widget?.querySelectorAll('[aria-label="Poster size"] button') ?? [])].map(
          (b) => [text(b), b.getAttribute("aria-pressed")],
        ),
        checked: [...(widget?.querySelectorAll('[role="radio"][aria-checked="true"]') ?? [])].map(
          text,
        ),
        head: inches(widget?.querySelector(".mc-res-h")),
        box: inches(widget?.querySelector(".pf-more p")),
        label: widget?.querySelector('[role="img"]')?.getAttribute("aria-label"),
        legend: [...(widget?.querySelectorAll(".mc-legend li") ?? [])].map(inches),
        caption: text(widget?.querySelector("figcaption")),
      },
      tableTitle: text(main?.querySelector("caption .fs-table-title")),
      columns: [...(main?.querySelectorAll("thead th") ?? [])].map(text),
      rows: Object.fromEntries(
        rows.map((tr) => [
          inches(tr.children[0]?.querySelector(".pt-l")),
          [...tr.children].map((c) => lines(c, inches)),
        ]),
      ),
      rowsCm: Object.fromEntries(
        rows.map((tr) => [
          cms(tr.children[0]?.querySelector(".pt-l")),
          [...tr.children].map((c) => lines(c, cms)),
        ]),
      ),
      small: cards("Frames for small posters: 11x17, 12x18 and 16x20"),
      large: cards("Frames for large posters: 18x24 to 27x40"),
      aSeries: cards("Frames for A-series posters: A3, A2 and A1"),
      painting: {
        items: [...(painting?.querySelectorAll("li") ?? [])].map((li) => [
          inches(li.querySelector(".k")),
          text(li.querySelector(".v")),
        ]),
        last: text(painting?.querySelector("ul ~ p")),
      },
      questions: [...(faq?.querySelectorAll("details") ?? [])].map((d) => ({
        q: text(d.querySelector("summary h3")),
        a: inches(d.querySelector(".fs-faq-a")),
        open: d.hasAttribute("open"),
      })),
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

/** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-the-heading-outline-of-the-server-html} */
test("the server HTML follows the chart outline", async ({ page }) => {
  const { outline, steps } = await serverHtml(page);
  expect(outline).toEqual([
    "h1 Poster Frame Sizes",
    "h2 Find the frame for your poster",
    "h2 Poster frame sizes chart",
    "h2 Frames for small posters: 11x17, 12x18 and 16x20",
    "h2 Frames for large posters: 18x24 to 27x40",
    "h2 Frames for A-series posters: A3, A2 and A1",
    "h2 Painting frame sizes",
    "h2 How to choose a poster frame",
    "h2 Questions about poster frames",
    "h2 Related tools",
  ]);
  expect(steps.map((s) => s.t)).toEqual([
    "Measure the poster",
    "Decide on a mat",
    "Pick the frame",
  ]);
});

/** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-the-answer-in-the-server-html} */
test("the answer paragraph names poster frame sizes with numbers", async ({ page }) => {
  const { intro } = await serverHtml(page);
  expect(intro).toBe(
    "Poster frame sizes match the poster when there is no mat: an 18x24 poster takes an 18x24 frame. With a mat it takes a bigger frame: an 11x17 poster takes a 12x18, 16x20 or 18x24 frame.",
  );
});

/** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-the-widget-in-the-server-html} */
test("the widget opens on 24x36 without a mat", async ({ page }) => {
  const { widget } = await serverHtml(page);
  expect(widget.chips.filter(([, p]) => p === "true").map(([t]) => t)).toEqual(["24×36 61×91 cm"]);
  expect(widget.chips.map(([t]) => t?.split(" ")[0])).toEqual([
    "11×17",
    "12×18",
    "16×20",
    "18×24",
    "20×30",
    "24×36",
    "27×40",
    "A3",
    "A2",
    "A1",
    "Custom",
  ]);
  expect(widget.checked).toEqual(["Without a mat", "Portrait"]);
  expect(widget.head).toBe("Use a 24x36 frame.");
  expect(widget.box).toBe("With a mat it takes a bigger frame: 27x40.");
  expect(widget.label).toBe(
    "Drawn to scale: a 24 × 36 in (61 × 91.4 cm) poster in a 24 × 36 in (61 × 91.4 cm) frame, no mat.",
  );
  expect(widget.legend).toEqual(["Frame24 × 36 in", "Poster24 × 36 in"]);
  expect(widget.caption).toBe("Drawn to scale. Every size on this page uses the same scale.");
});

/** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-the-table} */
test("the chart table", async ({ page }) => {
  const { tableTitle, columns, rows } = await serverHtml(page);
  expect(tableTitle).toBe("Standard poster frame sizes");
  expect(columns).toEqual(["Poster", "Without a mat", "With a mat"]);
  expect(Object.keys(rows)).toHaveLength(10);
  expect(rows["11 × 17 in"]).toEqual([
    ["11 × 17 in", "Small posters and flyers"],
    ["11 × 17 in"],
    ["12 × 18 in, pre-cut · ¾ / ¾ in", "16 × 20 in · 2¾ / 1¾ in", "18 × 24 in · 3¾ / 3¾ in"],
  ]);
  expect(rows["27 × 40 in"]?.[2]).toEqual([
    "No standard frame",
    "Custom 30½ × 43½ in for a 2 in mat",
  ]);
  expect(rows["A2 (420 × 594 mm)"]).toEqual([
    ["A2 (420 × 594 mm)", "16.5 × 23.4 in", "Medium metric posters"],
    ["A2 frame (420 × 594 mm)", "No US size"],
    ["20 × 30 in · 2 / 3½ in"],
  ]);
});

/** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-the-table-in-centimetres} */
test("the chart table in centimetres", async ({ page }) => {
  const { rowsCm } = await serverHtml(page);
  expect(rowsCm["27.9 × 43.2 cm"]?.[2]?.[0]).toBe("30.5 × 45.7 cm, pre-cut · 1.9 / 1.9 cm");
});

/** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-small-posters} */
test("the small poster cards", async ({ page }) => {
  const { small } = await serverHtml(page);
  expect(small["11x17 poster"]).toContain("11x17 frame");
  expect(small["11x17 poster"]).toContain(
    "With a mat: 12x18 (sold with a pre-cut mat, ¾ in border), 16x20 or 18x24.",
  );
  expect(small["12x18 poster"]).toContain(
    "With a mat: 16x20 or 18x24. No frame is sold with a pre-cut mat for 12x18.",
  );
  expect(small["16x20 poster"]).toContain(
    "With a mat: 18x24 or 20x24. Both are sold with a pre-cut mat for 16x20.",
  );
});

/** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-large-posters} */
test("the large poster cards", async ({ page }) => {
  const { large } = await serverHtml(page);
  expect(large["18x24 poster"]).toContain(
    "With a mat: 20x30. The border is 1¼ in at the sides and 3¼ in at the top and bottom.",
  );
  expect(large["27x40 poster"]).toContain(
    "No standard frame takes it with a mat. A 2 in mat needs a custom frame, 30½ × 43½ in.",
  );
});

/** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-series-posters} */
test("the A-series cards", async ({ page }) => {
  const { aSeries } = await serverHtml(page);
  expect(aSeries["A3 poster"]).toEqual(
    expect.arrayContaining(["297 × 420 mm", "A3 frame", "With a mat: 16x20 or 18x24."]),
  );
  expect(aSeries["A2 poster"]).toEqual(
    expect.arrayContaining([
      "A2 frame",
      "No US frame size matches A2: 16x20 is smaller, 18x24 is bigger. With a mat: 20x30.",
    ]),
  );
});

/** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-four-canvas-sizes} */
test("the painting section", async ({ page }) => {
  const { painting } = await serverHtml(page);
  expect(painting.items).toEqual([
    ["11 × 14 in", "11x14 frame"],
    ["16 × 20 in", "16x20 frame"],
    ["18 × 24 in", "18x24 frame"],
    ["24 × 36 in", "24x36 frame"],
  ]);
  expect(painting.last).toBe(
    "A painting on paper is framed like a poster, with or without a mat. Use the tool above.",
  );
});

/** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-p1-not-live} */
test("step 1 has no link to poster sizes, step 2 the border range in both units", async ({
  page,
}) => {
  const { steps, hrefs } = await serverHtml(page);
  expect(steps[0]?.in).toBe("Width first, edge to edge. Most posters come in a standard size.");
  expect(steps[1]?.in).toContain("usually 1 to 4 in,");
  expect(steps[1]?.cm).toContain("usually 2.5 to 10.2 cm,");
  expect(hrefs).not.toContain("/poster-sizes");
});

/** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-the-six-questions} */
test("six questions, each answered in the HTML, the first open", async ({ page }) => {
  const { questions } = await serverHtml(page);
  expect(questions.map((q) => q.q)).toEqual([
    "What are typical poster frame sizes?",
    "What are the standard print frame sizes?",
    "Does a poster need a mat?",
    "What size frame for an A2 poster?",
    "Is there a frame with a mat for a 27x40 poster?",
    "Can I use centimetres?",
  ]);
  for (const q of questions) expect(q.a?.length ?? 0).toBeGreaterThan(40);
  expect(questions.map((q) => q.open)).toEqual([true, false, false, false, false, false]);
});

/** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-f1-f2-f3-f4-f5-f6-and-g1-are-live} */
test("links only to live pages", async ({ page }) => {
  const { related, hrefs } = await serverHtml(page);
  expect(related).toEqual([
    "/",
    "/frame-sizes-on-wall",
    "/how-big-is-8x10",
    "/measure-picture-frame",
    "/frame-mat-calculator",
  ]);
  expect(hrefs).not.toContain("/poster-sizes");
  expect(hrefs.filter((h) => h.startsWith("#"))).toEqual([]);
});

/** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-the-head-of-the-page} */
test("title, canonical and the social image's alt", async ({ page }) => {
  const { title, canonicals, imageAlt, image } = await serverHtml(page);
  expect(title).toBe(fullTitle(F6.seo.title));
  expect(title).toBe("Poster Frame Sizes Chart: With or Without a Mat");
  expect(canonicals).toEqual([CANONICAL]);
  expect(imageAlt).toEqual([ALT]);
  const url = new URL(image[0] ?? "");
  expect(url.pathname).toMatch(/\/poster-frame-sizes\/opengraph-image/);
  const response = await page.request.get(url.pathname + url.search);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
});

/** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-f6s-breadcrumbs} */
test("breadcrumbs and one BreadcrumbList, no FAQPage or HowTo", async ({ page }) => {
  const { crumbs, jsonLd } = await serverHtml(page);
  expect(crumbs.items).toEqual(["Home", "Poster frame sizes"]);
  expect(crumbs.current).toBe("Poster frame sizes");
  expect(crumbs.home).toBe("/");
  expect(jsonLd).toHaveLength(1);
  expect(jsonLd.join()).toContain("BreadcrumbList");
  expect(jsonLd.join()).not.toMatch(/FAQPage|HowTo/);
});

test.describe("on a small phone", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-the-first-screen-on-a-small-phone} */
  test("the h1, the answer and the widget's title are in the first screen", async ({ page }) => {
    await page.goto(PATH);
    for (const el of [
      page.locator("h1"),
      page.locator("h1 ~ p").first(),
      page.getByRole("heading", { name: "Find the frame for your poster" }),
    ]) {
      const b = await el.boundingBox();
      expect(b).not.toBeNull();
      expect((b?.y ?? 0) + (b?.height ?? 0)).toBeLessThanOrEqual(740);
    }
  });
});

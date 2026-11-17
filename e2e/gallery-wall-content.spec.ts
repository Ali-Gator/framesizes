import { expect, type Page, test } from "@playwright/test";

import { livePage } from "../apps/web/src/lib/site-map";

const G1 = livePage("G1");
const PATH = "/gallery-wall-planner";
const CANONICAL = "https://framesizes.app/gallery-wall-planner";

/** What a crawler gets: the raw server HTML, no JavaScript run. */
async function serverHtml(page: Page, path = PATH) {
  const response = await page.request.get(path);
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
    const h1 = main?.querySelector("h1");
    let answer = h1?.nextElementSibling;
    while (answer && answer.tagName !== "P") answer = answer.nextElementSibling;
    const table = main?.querySelector("table");
    const crumbs = doc.querySelector('nav[aria-label="Breadcrumb"]');
    const related = [...(main?.querySelectorAll("h2") ?? [])]
      .find((h) => text(h) === "Related tools")
      ?.closest("section");
    const steps = [...(main?.querySelectorAll("h2") ?? [])]
      .find((h) => text(h) === "How to use the gallery wall planner")
      ?.closest("section")
      ?.querySelector("ol");
    const drawing = main?.querySelector('[role="img"]');
    return {
      title: doc.title,
      description: meta("description"),
      canonicals: [...doc.querySelectorAll('link[rel="canonical"]')].map((l) =>
        l.getAttribute("href"),
      ),
      headings: [...(main?.querySelectorAll("h1, h2, h3") ?? [])].map(
        (h) => `${h.tagName.toLowerCase()} ${text(h)}`,
      ),
      steps: steps?.children.length ?? 0,
      answer: text(answer),
      html: main?.innerHTML ?? "",
      caption: text(table?.querySelector("caption .fs-table-title")),
      widgetTitle: text(doc.querySelector(".fs-widget-title")),
      summary: [...doc.querySelectorAll(".g-sum-i dd")].map((dd) =>
        [...dd.querySelectorAll(".u-in, .u-cm")].map(text),
      ),
      answerUnits: [...(answer?.querySelectorAll(".u-in, .u-cm") ?? [])].map(text),
      templates: [...doc.querySelectorAll('.g-tpl input[type="radio"]')].map(
        (r) => `${r.getAttribute("aria-label")}${r.hasAttribute("checked") ? " *" : ""}`,
      ),
      gapInputs: doc.querySelectorAll(".g-gap input").length,
      frameButtons: [...doc.querySelectorAll(".wf-hit")].map((b) => b.getAttribute("aria-label")),
      rows: [...(table?.querySelectorAll("tbody tr") ?? [])].map((tr) =>
        [...tr.children].map((cell) => [...cell.querySelectorAll(".u-in, .u-cm")].map(text)),
      ),
      whereColumn: [...(table?.querySelectorAll("tbody tr") ?? [])].map((tr) =>
        text(tr.lastElementChild),
      ),
      tableInputs: table?.querySelectorAll("input").length ?? -1,
      drawing: drawing?.getAttribute("aria-label") ?? "",
      pressed: [...doc.querySelectorAll('button[aria-pressed="true"]')].map(
        (b) => b.getAttribute("aria-label") ?? text(b),
      ),
      distances: [...doc.querySelectorAll(".wf-row input")].map((i) => i.getAttribute("value")),
      crumbs: {
        items: [...(crumbs?.querySelectorAll("li") ?? [])].map(text),
        current: text(crumbs?.querySelector('[aria-current="page"]')),
        homeHref: crumbs?.querySelector("a")?.getAttribute("href"),
      },
      jsonLd: [...doc.querySelectorAll('script[type="application/ld+json"]')].map(
        (s) => s.textContent ?? "",
      ),
      related: [...(related?.querySelectorAll("a[href]") ?? [])].map((a) => a.getAttribute("href")),
      relatedGroups: [...(related?.querySelectorAll("h3") ?? [])].map(text),
      hrefs: [...doc.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") ?? ""),
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
    };
  }, source);
}

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-planners-heading-outline} */
test("the server HTML follows the approved outline", async ({ page }) => {
  const { headings, steps, widgetTitle } = await serverHtml(page);
  expect(widgetTitle).toBe("Gallery wall layout generator");
  expect(headings.filter((h) => !h.startsWith("h3"))).toEqual([
    "h1 Gallery Wall Layout Planner",
    "h2 Gallery wall layout generator",
    "h2 How to use the gallery wall planner",
    "h2 Gallery wall templates",
    "h2 Spacing and height",
    "h2 Questions about gallery wall layouts",
    "h2 Related tools",
  ]);
  expect(headings).not.toContain("h2 Where to buy gallery wall frames");
  expect(steps).toBe(5);
  const questions = headings.slice(
    headings.indexOf("h2 Questions about gallery wall layouts") + 1,
    headings.indexOf("h2 Related tools"),
  );
  expect(questions).toHaveLength(5);
  for (const q of questions) expect(q).toMatch(/^h3 .+\?$/);
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-planners-answer-in-the-server-html} */
test("the first paragraph gives the gap and the heights in both units", async ({ page }) => {
  const { answerUnits } = await serverHtml(page);
  for (const part of ["2 to 3 in", "8 in", "57 in", "5 to 8 cm", "20 cm", "145 cm"]) {
    expect(answerUnits).toContain(part);
  }
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-template-table-in-the-server-html} */
test("the template table lists the five templates' sizes", async ({ page }) => {
  const { caption, rows, tableInputs } = await serverHtml(page);
  expect(caption).toBe("Gallery wall layout with sizes");
  expect(rows.map((r) => r[2]?.[0])).toEqual([
    "45 × 16 in",
    "29 × 35 in",
    "36 × 42 in",
    "46 × 27 in",
    "50 × 35 in",
  ]);
  expect(rows.map((r) => r[3]?.[0])).toEqual([
    "about 68 in wide",
    "about 44 in wide",
    "about 54 in wide",
    "about 69 in wide",
    "about 75 in wide",
  ]);
  expect(rows[3]?.[2]).toEqual(["46 × 27 in", "117 × 69 cm"]);
  expect(tableInputs).toBe(0);
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-planners-default-state-in-the-server-html} */
test("the default layout is in the server HTML", async ({ page }) => {
  const { drawing, templates, frameButtons, summary, distances } = await serverHtml(page);
  expect(drawing).toBe("Gallery wall layout: five frames above a sofa");
  expect(templates).toContain("One big, two on each side *");
  expect(frameButtons.map((b) => b?.slice(0, 7))).toEqual([
    "Frame A",
    "Frame B",
    "Frame C",
    "Frame D",
    "Frame E",
  ]);
  expect(summary).toEqual([
    ["46 × 27 in", "117 × 69 cm"],
    ["69 in", "175 cm"],
    ["49 · 49 in", "124 · 124 cm"],
  ]);
  expect(distances).toEqual(["27", "8", "49", "49"]);
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-planner-with-f1-f2-and-g1-live} */
test("links only to live pages", async ({ page }) => {
  const { related, relatedGroups, hrefs } = await serverHtml(page);
  expect(relatedGroups).toEqual(["Frames"]);
  expect(related).toEqual(["/", "/frame-sizes-on-wall"]);
  for (const path of [
    "/how-high-to-hang-pictures",
    "/gallery-wall-ideas",
    "/guides/how-to-make-a-gallery-wall",
  ]) {
    expect(hrefs).not.toContain(path);
  }
  expect(hrefs.filter((h) => h.startsWith("#"))).toEqual([]);
});

/** {@link openspec/specs/seo-base/spec.md#requirement-pages-below-the-home-page-carry-breadcrumbs} */
test("breadcrumbs and one BreadcrumbList", async ({ page }) => {
  const { crumbs, jsonLd } = await serverHtml(page);
  expect(crumbs.items).toEqual(["Home", "Gallery wall layout planner"]);
  expect(crumbs.current).toBe("Gallery wall layout planner");
  expect(crumbs.homeHref).toBe("/");
  expect(jsonLd).toHaveLength(1);
  const data = JSON.parse(jsonLd[0] ?? "") as {
    "@type": string;
    itemListElement: { item: string }[];
  };
  expect(data["@type"]).toBe("BreadcrumbList");
  expect(data.itemListElement.map((i) => i.item)).toEqual(["https://framesizes.app", CANONICAL]);
});

/** {@link openspec/specs/seo-base/spec.md#requirement-each-page-sends-the-nine-social-tags-with-its-own-image} */
test("title, description, canonical and the nine social tags", async ({ page }) => {
  const { title, description, canonicals, tags } = await serverHtml(page);
  expect(title).toBe("Gallery Wall Layout Planner & Generator | Frame Sizes");
  expect(description).toEqual([G1.seo.description]);
  expect(canonicals).toEqual([CANONICAL]);
  const one = (key: string) => {
    expect(tags[key], key).toHaveLength(1);
    return tags[key]?.[0];
  };
  expect(one("og:title")).toBe(G1.seo.title);
  expect(one("og:description")).toBe(G1.seo.description);
  expect(one("og:url")).toBe(CANONICAL);
  expect(one("og:type")).toBe("website");
  expect(one("og:site_name")).toBe("Frame Sizes");
  expect(one("og:locale")).toBe("en_US");
  expect(one("og:image")).toMatch(/\/gallery-wall-planner\/opengraph-image/);
  expect(one("og:image:width")).toBe("1200");
  expect(one("og:image:height")).toBe("630");
  expect(one("og:image:alt")).toBe(
    "Gallery wall layout with an 18x24 frame and four 8x10 frames above a sofa",
  );
  expect(one("twitter:card")).toBe("summary_large_image");

  const image = new URL(tags["og:image"]?.[0] ?? "");
  const response = await page.request.get(image.pathname + image.search);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
  expect((await response.body()).length).toBeLessThan(300 * 1024);
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-description-against-the-widget} */
test("the description names only what the widget has", async ({ page }) => {
  const { description, templates, gapInputs } = await serverHtml(page);
  expect(description[0]).toMatch(/pick a template, set the spacing,.*nail positions/);
  expect(templates).toHaveLength(5);
  expect(gapInputs).toBe(1);
  await page.goto(PATH);
  await page.waitForFunction(() => document.documentElement.dataset.galleryReady === "true");
  const widget = page.getByRole("region", { name: "Gallery wall layout generator" });
  await widget.getByRole("radio", { name: "Nail marks" }).click();
  await widget.getByLabel("Drop", { exact: true }).fill("2");
  await expect(widget.getByRole("table")).toContainText("Up from floor");
});

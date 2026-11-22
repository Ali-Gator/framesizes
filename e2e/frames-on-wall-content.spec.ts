import { expect, type Page, test } from "@playwright/test";

import { livePage } from "../apps/web/src/lib/site-map";

const F2 = livePage("F2");
const PATH = "/frame-sizes-on-wall";
const CANONICAL = "https://framesizes.app/frame-sizes-on-wall";

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
      .find((h) => text(h) === "How to see frame sizes on your wall")
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

/** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-heading-outline-of-the-server-html} */
test("the server HTML follows the approved outline", async ({ page }) => {
  const { headings, steps } = await serverHtml(page);
  expect(headings.filter((h) => !h.startsWith("h3"))).toEqual([
    "h1 Frame Sizes on Your Wall",
    "h2 Frame visualizer",
    "h2 Plan on any shop's page",
    "h2 How to see frame sizes on your wall",
    "h2 Picture frame sizes on a wall: how big to go",
    "h2 Wall photo frame sizes",
    "h2 Questions about frames on a wall",
    "h2 Related tools",
  ]);
  expect(steps).toBe(4);
  const questions = headings.slice(
    headings.indexOf("h2 Questions about frames on a wall") + 1,
    headings.indexOf("h2 Related tools"),
  );
  expect(questions).toHaveLength(5);
  for (const q of questions) expect(q).toMatch(/^h3 .+\?$/);
});

/** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-answer-in-the-server-html} */
test("the first paragraph gives the hanging rule and names the frame visualizer", async ({
  page,
}) => {
  const { answer } = await serverHtml(page);
  for (const part of ["two-thirds", "8 to 10 in", "20 to 25 cm", "frame visualizer"]) {
    expect(answer).toContain(part);
  }
});

/** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-table-in-the-server-html} */
test("the wall table lists six sizes and the space they take", async ({ page }) => {
  const { caption, rows, whereColumn, tableInputs } = await serverHtml(page);
  expect(caption).toBe("Wall art frame sizes and the space they take");
  expect(rows).toHaveLength(6);
  const row16x20 = rows[3];
  expect(row16x20?.[0]).toEqual(["16 × 20 in", "40.6 × 50.8 cm"]);
  expect(row16x20?.[1]).toEqual(["18 × 22 in", "45.7 × 55.9 cm"]);
  expect(whereColumn[3]).toBe("Above a small table, or in a pair");
  expect(tableInputs).toBe(0);
});

/** {@link openspec/specs/frames-on-wall/spec.md#scenario-both-units-in-the-html} */
test("every length is in the HTML in both units", async ({ page }) => {
  const { html } = await serverHtml(page);
  for (const part of ["8 to 10 in", "20 to 25 cm", "18 × 22 in", "45.7 × 55.9 cm"]) {
    expect(html).toContain(part);
  }
});

/** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-default-state-in-the-server-html} */
test("the sample room is in the server HTML with the 16x20 selected", async ({ page }) => {
  const { drawing, pressed, distances } = await serverHtml(page);
  expect(drawing).toMatch(/^Sample room: a wall 144 by 96 in with a sofa/);
  expect(pressed).toContain("16x20 frame");
  expect(distances).toEqual(["32", "8", "63", "63"]);
});

/** {@link openspec/specs/frames-on-wall/spec.md#scenario-f1-f2-f3-and-g1-are-live} */
test("links only to live pages", async ({ page }) => {
  const { related, relatedGroups, hrefs } = await serverHtml(page);
  expect(relatedGroups).toEqual(["Frames", "Gallery wall"]);
  expect(related).toEqual(["/", "/how-big-is-8x10", "/gallery-wall-planner"]);
  expect(hrefs).not.toContain("/how-high-to-hang-pictures");
  expect(hrefs.filter((h) => h.startsWith("#"))).toEqual([]);
});

/** {@link openspec/specs/seo-base/spec.md#scenario-f2s-breadcrumbs} */
test("breadcrumbs and one BreadcrumbList", async ({ page }) => {
  const { crumbs, jsonLd } = await serverHtml(page);
  expect(crumbs.items).toEqual(["Home", "Frame sizes on your wall"]);
  expect(crumbs.current).toBe("Frame sizes on your wall");
  expect(crumbs.homeHref).toBe("/");
  expect(jsonLd).toHaveLength(1);
  const data = JSON.parse(jsonLd[0] ?? "") as {
    "@type": string;
    itemListElement: { item: string }[];
  };
  expect(data["@type"]).toBe("BreadcrumbList");
  expect(data.itemListElement.map((i) => i.item)).toEqual(["https://framesizes.app", CANONICAL]);
});

/** {@link openspec/specs/seo-base/spec.md#scenario-no-breadcrumbs-on-the-home-page} */
test("the home page has no breadcrumbs", async ({ page }) => {
  const { crumbs, jsonLd } = await serverHtml(page, "/");
  expect(crumbs.items).toEqual([]);
  expect(jsonLd.join("")).not.toContain("BreadcrumbList");
});

/** {@link openspec/specs/seo-base/spec.md#requirement-each-page-sends-the-nine-social-tags-with-its-own-image} */
test("title, description, canonical and the nine social tags", async ({ page }) => {
  const { title, description, canonicals, tags } = await serverHtml(page);
  expect(title).toBe(F2.seo.title);
  expect(description).toEqual([F2.seo.description]);
  expect(canonicals).toEqual([CANONICAL]);
  const one = (key: string) => {
    expect(tags[key], key).toHaveLength(1);
    return tags[key]?.[0];
  };
  expect(one("og:title")).toBe(F2.seo.title);
  expect(one("og:description")).toBe(F2.seo.description);
  expect(one("og:url")).toBe(CANONICAL);
  expect(one("og:type")).toBe("website");
  expect(one("og:site_name")).toBe("Frame Sizes");
  expect(one("og:locale")).toBe("en_US");
  expect(one("og:image")).toMatch(/\/frame-sizes-on-wall\/opengraph-image/);
  expect(one("og:image:width")).toBe("1200");
  expect(one("og:image:height")).toBe("630");
  expect(one("og:image:alt")).toBe("16x20 picture frame at true scale next to a three-seat sofa");
  expect(one("twitter:card")).toBe("summary_large_image");

  const image = new URL(tags["og:image"]?.[0] ?? "");
  const response = await page.request.get(image.pathname + image.search);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
  expect((await response.body()).length).toBeLessThan(300 * 1024);
});

import { CHECK } from "../packages/sizes/src/frames";
import { expect, type Page, test } from "@playwright/test";

/** Reads what a crawler gets: the raw server HTML of `/`, no JavaScript run. */
async function serverHtml(page: Page) {
  const response = await page.request.get("/");
  expect(response.status()).toBe(200);
  const source = await response.text();
  return page.evaluate((html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const main = doc.querySelector("main");
    const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();
    const h1 = main?.querySelector("h1");
    let answer = h1?.nextElementSibling;
    while (answer && answer.tagName !== "P") answer = answer.nextElementSibling;
    const rows = [...(main?.querySelectorAll("table tbody tr") ?? [])];
    const row = (value: string) => {
      const r = rows.find((tr) => tr.querySelector<HTMLInputElement>("input")?.value === value);
      return [...(r?.querySelectorAll("th, td") ?? [])].map(text);
    };
    const common = doc.querySelector('[aria-label^="Six common picture frame sizes"]');
    const details = [...(main?.querySelectorAll("details") ?? [])];
    return {
      headings: [...(main?.querySelectorAll("h1, h2, h3") ?? [])].map(
        (h) => `${h.tagName.toLowerCase()} ${text(h)}`,
      ),
      answer: text(answer),
      rowCount: rows.length,
      hiddenRows: rows
        .filter((r) => r.hasAttribute("hidden"))
        .map((r) => r.querySelector("input")?.value),
      row8x10: row("8x10"),
      row4x6: row("4x6"),
      commonLabels: [...(common?.closest("figure")?.querySelectorAll("li") ?? [])].map((li) =>
        [...li.children].map(text),
      ),
      anatomy: [...(main?.querySelectorAll("[data-measure]") ?? [])].map((m) => [
        m.getAttribute("data-measure"),
        text(m.querySelector("[data-value]")),
      ]),
      details: details.map((d) => ({
        open: d.hasAttribute("open"),
        question: text(d.querySelector("summary > h3")),
        answer: text(d.querySelector("summary + *")),
      })),
      widgetFooter: text(doc.querySelector(".fs-widget-foot")),
      hrefs: [...doc.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") ?? ""),
      links: [...doc.querySelectorAll("a")].map(text),
    };
  }, source);
}

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-heading-outline-of-the-server-html} */
test("the server HTML follows the approved outline", async ({ page }) => {
  const { headings, details } = await serverHtml(page);
  expect(headings.filter((h) => h.startsWith("h1") || h.startsWith("h2"))).toEqual([
    "h1 Standard Frame Sizes",
    "h2 Frame size chart",
    "h2 The six most common frame sizes",
    "h2 Frame size by image size",
    "h2 Large, square and horizontal frame sizes",
    "h2 How to choose a frame size",
    "h2 Frame size questions",
  ]);
  const h3s = headings.filter((h) => h.startsWith("h3")).map((h) => h.slice(3));
  expect(h3s.slice(0, 3)).toEqual([
    "Large frame sizes",
    "Square frame sizes",
    "Horizontal frame sizes",
  ]);
  expect(h3s).toHaveLength(3 + 3 + details.length);
  expect(h3s.slice(6)).toEqual(details.map((d) => d.question));
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-answer-in-the-server-html} */
test("the first paragraph names the six common sizes", async ({ page }) => {
  const { answer } = await serverHtml(page);
  for (const size of ["4x6", "5x7", "8x10", "11x14", "16x20", "24x36"]) {
    expect(answer).toContain(size);
  }
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-table-in-the-server-html} */
test("the whole table is in the server HTML", async ({ page }) => {
  const html = await serverHtml(page);
  expect(html.rowCount).toBe(19);
  expect(html.row8x10).toEqual([
    "8 × 10 in",
    "20.3 × 25.4 cm",
    "5 × 7 in",
    "Portraits and certificates",
  ]);
  expect(html.row4x6[2]).toBe("No mat");
  expect(html.hiddenRows).toEqual(["8x8", "10x10", "12x12", "16x16", "20x20"]);
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-labels-come-from-the-engine} */
test("the six common sizes are labelled from the engine", async ({ page }) => {
  const { commonLabels } = await serverHtml(page);
  expect(commonLabels).toHaveLength(6);
  expect(commonLabels[3]?.slice(0, 2)).toEqual(["11×14", "27.9 × 35.6 cm"]);
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-four-measurements} */
test("the anatomy example lists four computed measurements", async ({ page }) => {
  const { anatomy } = await serverHtml(page);
  expect(anatomy).toEqual([
    ["Outside size", "13 × 16 in"],
    ["Frame size", "11 × 14 in"],
    ["Mat opening", "7.5 × 9.5 in"],
    ["Image size", "8 × 10 in"],
  ]);
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-questions-in-the-server-html} */
test("five questions, the first open, answers in the HTML", async ({ page }) => {
  const { details } = await serverHtml(page);
  expect(details).toHaveLength(5);
  expect(details.map((d) => d.open)).toEqual([true, false, false, false, false]);
  for (const d of details) expect(d.question).toBeTruthy();
  const cm = details.find((d) => d.question === "What are the standard frame sizes in cm?");
  expect(cm?.answer).toContain("20.3 × 25.4");
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-proof-line} */
test("the widget footer says where the sizes come from", async ({ page }) => {
  const { widgetFooter } = await serverHtml(page);
  const checked = new Date(`${CHECK.date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  expect(widgetFooter).toContain("8 ft (244 cm)");
  expect(widgetFooter).toContain(`last checked ${checked}`);
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-no-other-page-is-live} */
test("no link to a page that is not live", async ({ page }) => {
  const { headings, hrefs, links } = await serverHtml(page);
  expect(headings).not.toContain("h2 Related tools");
  expect(links).not.toContain("See it on my wall");
  expect(hrefs.filter((h) => h.startsWith("#"))).toEqual([]);
});

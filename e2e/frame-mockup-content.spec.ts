import { expect, type Page, test } from "@playwright/test";

import { fullTitle, livePage } from "../apps/web/src/lib/site-map";

const F7 = livePage("F7");
const PATH = "/frame-mockup";
const CANONICAL = "https://framesizes.app/frame-mockup";
const ALT = "The sample artwork in a 24x36 black frame above a sofa";

/** What a crawler gets: the raw server HTML, no JavaScript run. */
async function serverHtml(page: Page) {
  const response = await page.request.get(PATH);
  expect(response.status()).toBe(200);
  const source = await response.text();
  return page.evaluate((html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const main = doc.querySelector("main");
    const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();
    const only = (el: Element | null | undefined, hide: string) => {
      const copy = el?.cloneNode(true) as Element | undefined;
      copy?.querySelectorAll(hide).forEach((n) => n.remove());
      return text(copy);
    };
    const inches = (el: Element | null | undefined) => only(el, ".u-cm");
    const cms = (el: Element | null | undefined) => only(el, ".u-in");
    const meta = (key: string) =>
      [...doc.querySelectorAll(`meta[property="${key}"], meta[name="${key}"]`)].map(
        (m) => m.getAttribute("content") ?? "",
      );
    const section = (title: string) =>
      [...(main?.querySelectorAll("h2") ?? [])].find((h) => text(h) === title)?.closest("section");
    const h1 = main?.querySelector("h1");
    let intro = h1?.nextElementSibling;
    while (intro && intro.tagName !== "P") intro = intro.nextElementSibling;
    const widget = main?.querySelector('section[aria-label="Poster mockup generator"]');
    const howTo = section("How to use the mockup generator");
    const shapes = section("Frame sizes by artwork shape");
    const card = (title: string) => {
      const s = section(title);
      return {
        in: inches(s?.querySelector("p")),
        cm: cms(s?.querySelector("p")),
        img: s?.querySelector('[role="img"]')?.getAttribute("aria-label"),
        links: [...(s?.querySelectorAll("a[href]") ?? [])].map((a) => a.getAttribute("href")),
      };
    };
    const crumbs = doc.querySelector('nav[aria-label="Breadcrumb"]');
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
      })),
      intro: text(intro),
      widget: {
        label: widget?.querySelector('[role="img"]')?.getAttribute("aria-label"),
        chips: [...(widget?.querySelectorAll(".mk-chips button") ?? [])].map((b) => [
          text(b.querySelector(".mk-chip-n")),
          b.getAttribute("aria-pressed"),
        ]),
        value: inches(widget?.querySelector(".mc-result-value")),
        sample: text(widget?.querySelector(".mk-line")),
      },
      rows: [...(shapes?.querySelectorAll("tbody tr") ?? [])].map((tr) =>
        [...tr.children].map(text),
      ),
      shapesText: text(shapes),
      closeUp: card("Frame mockup: a close-up of the frame"),
      photo: card("Picture frame mockup for a photo"),
      wallArt: card("Wall art mockup in a room"),
      questions: [...(section("Questions")?.querySelectorAll("details") ?? [])].map((d) => ({
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
    };
  }, source);
}

/** {@link openspec/specs/frame-mockup/spec.md#scenario-the-heading-outline-of-the-server-html} */
test("the server HTML follows the tool outline", async ({ page }) => {
  const { outline, steps } = await serverHtml(page);
  expect(outline).toEqual([
    "h1 Poster and Frame Mockup Generator",
    "h2 How to use the mockup generator",
    "h2 Frame sizes by artwork shape",
    "h2 Frame mockup: a close-up of the frame",
    "h2 Picture frame mockup for a photo",
    "h2 Wall art mockup in a room",
    "h2 Questions",
    "h2 Related tools",
  ]);
  expect(steps.map((s) => s.t)).toEqual([
    "Upload your artwork",
    "Pick a frame size",
    "Pick a style and a mat",
    "Pick a wall",
    "Download the PNG",
  ]);
  expect(steps[2]?.in).toContain("any other frame gets a 2 in mat");
  expect(steps[4]?.in).toContain("2,400 px on its longer side");
});

/** {@link openspec/specs/frame-mockup/spec.md#scenario-the-answer-in-the-server-html} */
test("the answer paragraph says poster mockup", async ({ page }) => {
  const { intro } = await serverHtml(page);
  expect(intro).toBe(
    "Make a poster mockup: upload a JPEG or PNG, see it framed on a wall at true size, and download a PNG. For designers, print sellers and anyone with a print to hang. Your file stays on your device.",
  );
});

/** {@link openspec/specs/frame-mockup/spec.md#scenario-the-widget-in-the-server-html} */
test("the widget is in the server HTML on the sample", async ({ page }) => {
  const { widget } = await serverHtml(page);
  expect(widget.label).toBe(
    "Poster mockup: the sample in a 24x36 black frame, no mat, above a sofa, the whole 12 by 8 ft wall, drawn to true scale.",
  );
  expect(widget.chips).toHaveLength(17);
  expect(widget.chips.filter(([, p]) => p === "true")).toEqual([["24×36", "true"]]);
  expect(widget.value).toBe("24 × 36 in");
  expect(widget.sample).toBe("Sample artwork2:3, drawn for this site");
});

/** {@link openspec/specs/frame-mockup/spec.md#scenario-the-table} */
test("the shape table groups the frame sizes", async ({ page }) => {
  const { rows } = await serverHtml(page);
  expect(rows).toEqual([
    ["2:3", "4x6, 12x18, 20x30, 24x36"],
    ["3:4", "12x16, 18x24"],
    ["4:5", "8x10, 16x20"],
    ["A-series, 1:1.41", "A3, A2, A1"],
    ["Square, 1:1", "8x8, 10x10, 12x12, 16x16, 20x20"],
  ]);
});

/** {@link openspec/specs/frame-mockup/spec.md#scenario-no-cell-spills} */
for (const width of [1280, 390])
  test(`no cell of the shape table spills at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(PATH);
    const spills = await page
      .locator(".f7-shapes")
      .evaluate((el) =>
        [...el.querySelectorAll("th, td")]
          .filter((c) => c.scrollWidth > c.clientWidth)
          .map((c) => c.textContent),
      );
    expect(spills).toEqual([]);
  });

/** {@link openspec/specs/frame-mockup/spec.md#scenario-ph2-and-q2-not-live} */
test("links to no print page that is not live", async ({ page }) => {
  const { hrefs, shapesText } = await serverHtml(page);
  expect(hrefs.filter((h) => /art-print-sizes|dpi-checker/.test(h))).toEqual([]);
  expect(shapesText).not.toContain("DPI checker");
});

/** {@link openspec/specs/frame-mockup/spec.md#scenario-the-three-sections} */
test("the keyword sections give their numbers and links", async ({ page }) => {
  const { closeUp, photo, wallArt } = await serverHtml(page);
  expect(closeUp.in).toContain("A 24x36 close-up covers 45 × 57 in of wall.");
  expect(closeUp.cm).toContain("A 24x36 close-up covers 114.3 × 144.8 cm of wall.");
  expect(photo.in).toContain(
    "A 5x7 frame is sold with a mat cut for a 4x6 photo, and an 8x10 with one for a 5x7.",
  );
  expect(wallArt.in).toContain(
    "on a 12 × 8 ft wall: 8 in over a sofa, or centred 57 in above the floor on a plain wall.",
  );
  expect(wallArt.cm).toContain(
    "on a 366 × 244 cm wall: 20 cm over a sofa, or centred 145 cm above the floor on a plain wall.",
  );
  expect(wallArt.links).toEqual(["/frame-sizes-on-wall", "/gallery-wall-planner"]);
  for (const c of [closeUp, photo, wallArt]) expect(c.img).toBeTruthy();
});

/** {@link openspec/specs/frame-mockup/spec.md#scenario-the-six-questions} */
test("answers six questions, the first open", async ({ page }) => {
  const { questions } = await serverHtml(page);
  expect(questions.map((q) => q.q)).toEqual([
    "Is my artwork uploaded?",
    "Why is part of my artwork cut off?",
    "What size is the PNG?",
    "Can I use the mockup in my shop listing?",
    "Which frame sizes can I try?",
    "Can I see it on my own wall?",
  ]);
  expect(questions.map((q) => q.open)).toEqual([true, false, false, false, false, false]);
  expect(questions[2]?.a).toContain("The whole wall saves as 2,400 × 1,600 px");
  expect(questions[2]?.a).toContain("a 24x36 close-up saves as 1,895 × 2,400 px");
  expect(questions[4]?.a).toContain("from 4x6 to 27x40, plus A3, A2 and A1");
  expect(questions[4]?.a).toContain("the 5 square sizes, 8x8 to 20x20");
});

/** {@link openspec/specs/frame-mockup/spec.md#scenario-f1-f2-f3-f4-f5-f6-f7-and-g1-are-live} */
test("Related tools lists the live tools in order, no poster sizes, no # links", async ({
  page,
}) => {
  const { related, hrefs } = await serverHtml(page);
  expect(related).toEqual([
    "/",
    "/frame-sizes-on-wall",
    "/how-big-is-8x10",
    "/measure-picture-frame",
    "/frame-mat-calculator",
    "/poster-frame-sizes",
    "/gallery-wall-planner",
  ]);
  expect(hrefs).not.toContain("/poster-sizes");
  expect(hrefs.filter((h) => h.startsWith("#"))).toEqual([]);
});

/** {@link openspec/specs/frame-mockup/spec.md#scenario-the-head-of-the-page} */
test("carries its title, canonical and social image alt", async ({ page }) => {
  const { title, canonicals, imageAlt } = await serverHtml(page);
  expect(title).toBe(fullTitle(F7.seo.title));
  expect(title).toBe("Poster & Frame Mockup Generator | Frame Sizes");
  expect(canonicals).toEqual([CANONICAL]);
  expect(imageAlt).toEqual([ALT]);
});

/** {@link openspec/specs/frame-mockup/spec.md#scenario-f7s-breadcrumbs} */
test("breadcrumbs and one BreadcrumbList, no FAQPage, HowTo or WebApplication", async ({
  page,
}) => {
  const { crumbs, jsonLd } = await serverHtml(page);
  expect(crumbs.items).toEqual(["Home", "Poster and frame mockup"]);
  expect(crumbs.current).toBe("Poster and frame mockup");
  expect(crumbs.home).toBe("/");
  const types = jsonLd.map((s) => (JSON.parse(s) as { "@type": string })["@type"]);
  expect(types).toEqual(["BreadcrumbList"]);
  const list = JSON.parse(jsonLd[0] ?? "{}") as {
    itemListElement: { name: string }[];
  };
  expect(list.itemListElement.map((i) => i.name)).toEqual(["Home", "Poster and frame mockup"]);
  expect(jsonLd.join()).not.toMatch(/FAQPage|HowTo|WebApplication/);
});

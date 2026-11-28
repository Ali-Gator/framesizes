import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";

const PATH = "/extensions/gallery-wall-layout-generator";
const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];
const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const EDGE_UA = `${CHROME_UA} Edg/131.0.0.0`;

const EDGE_ANSWER =
  "Click the extension's button in Edge's toolbar to open the side panel and plan a gallery wall. On any shop, right-click a print and pick “Try on my wall” to hang it on your wall at true size.";
const CHROME_ANSWER = EDGE_ANSWER.replace("Edge's", "Chrome's");
const EDGE_PIN_TEXT =
  "Edge keeps new extensions behind the puzzle-piece button. Click the puzzle piece (1) at the top right of Edge, then the pin (2) next to Gallery Wall Layout Generator. Its button then stays in the toolbar.";

/** The visible text of an element, as a reader sees it. */
const seen = (locator: Locator) => locator.evaluate((el) => (el as HTMLElement).innerText.trim());
const answer = (page: Page) => page.locator("h1 ~ p").first();
const pinText = (page: Page) => page.locator("#pin h2 + p");
const visiblePictures = (page: Page) => page.locator("svg.ext-pin-picture:visible");

/** Which half of its drawing the element's centre sits in. */
async function half(scope: Locator, selector: string) {
  return scope.evaluate((root, sel) => {
    const el = root.querySelector(sel);
    if (!el) return "missing";
    const box = root.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return r.left + r.width / 2 < box.left + box.width / 2 ? "left" : "right";
  }, selector);
}

/** {@link openspec/specs/extension-site/spec.md#requirement-the-page-picks-the-visitors-store} */
test.describe("the page picks the visitor's store", () => {
  /** {@link openspec/specs/extension-site/spec.md#scenario-the-edge-install-tab} */
  test("?store=edge in Chrome shows Edge's lines and drawing", async ({ page }) => {
    await page.goto(`${PATH}?pinned=0&store=edge`);
    await expect.poll(() => seen(answer(page))).toBe(EDGE_ANSWER);
    expect(await seen(pinText(page))).toBe(EDGE_PIN_TEXT);
    await expect(visiblePictures(page)).toHaveCount(1);
    await expect(visiblePictures(page)).toHaveAttribute("aria-label", /^Edge's toolbar/);
    expect(await seen(page.locator("main"))).not.toMatch(/Chrome's toolbar|top right of Chrome/);
  });

  test.describe("in Edge", () => {
    test.use({ userAgent: EDGE_UA });

    /** {@link openspec/specs/extension-site/spec.md#scenario-a-chrome-web-store-install-opened-in-edge} */
    test("a Chrome Web Store install opened in Edge gets Edge's lines", async ({ page }) => {
      await page.goto(`${PATH}?pinned=0`);
      await expect.poll(() => seen(answer(page))).toBe(EDGE_ANSWER);
    });
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-chrome-and-every-other-browser} */
  test("Chrome with no store or ?store=opera gets Chrome's lines", async ({ page }) => {
    for (const query of ["", "?store=opera"]) {
      await page.goto(`${PATH}${query}`);
      await expect.poll(() => seen(answer(page))).toBe(CHROME_ANSWER);
    }
  });

  test.describe("in Opera", () => {
    test.use({ userAgent: `${CHROME_UA} OPR/115.0.0.0` });

    test("Opera gets Chrome's lines", async ({ page }) => {
      await page.goto(PATH);
      await expect.poll(() => seen(answer(page))).toBe(CHROME_ANSWER);
    });
  });

  test.describe("with no script", () => {
    test.use({ javaScriptEnabled: false });

    /** {@link openspec/specs/extension-site/spec.md#scenario-no-script} */
    test("?store=edge shows Chrome's lines", async ({ page }) => {
      await page.goto(`${PATH}?store=edge`);
      await expect.poll(() => seen(answer(page))).toBe(CHROME_ANSWER);
    });
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-no-shift-on-pick} */
  test("picking Edge moves nothing after the first paint", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as { __cls?: number };
      w.__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
        })[])
          if (!entry.hadRecentInput) w.__cls = (w.__cls ?? 0) + entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(`${PATH}?store=edge`);
    await page.waitForLoadState("networkidle");
    expect(await page.evaluate(() => (window as { __cls?: number }).__cls)).toBe(0);
  });
});

/** {@link openspec/specs/extension-site/spec.md#requirement-edge-visitors-get-edges-how-to} */
test.describe("Edge's how-to", () => {
  /** {@link openspec/specs/extension-site/spec.md#scenario-edges-pin-mode} */
  test("pin mode names the puzzle piece and the pin in Edge", async ({ page }) => {
    await page.goto(`${PATH}?pinned=0&store=edge`);
    await expect(page.locator("#pin h2")).toBeVisible();
    expect(await seen(page.locator("#pin h2"))).toBe("Pin it to your toolbar");
    expect(await seen(pinText(page))).toBe(EDGE_PIN_TEXT);
    const back = page.locator("#pin > p").last();
    expect(await seen(back)).toBe("Already pinned? See how to use it");
    await expect(back.locator("a")).toHaveAttribute("href", "#usage");
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-edges-usage-mode} */
  test("usage mode names Edge's toolbar and links to the pin steps", async ({ page }) => {
    await page.goto(`${PATH}?pinned=1&store=edge`);
    await expect.poll(() => seen(answer(page))).toBe(EDGE_ANSWER);
    const link = page.getByRole("link", { name: "Show how to pin it" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "#pin");
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-edges-faq-answer} */
  test("the FAQ's toolbar answer names Edge", async ({ page }) => {
    await page.goto(`${PATH}?store=edge`);
    await page.getByText("Why isn't the button in my toolbar?").click();
    const item = page.locator("details", { hasText: "Why isn't the button in my toolbar?" });
    expect(await seen(item.locator("p"))).toBe(
      "Edge puts new extensions behind the puzzle-piece button. Pin it once and it stays in the toolbar.",
    );
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-edges-pin-mode-in-german} */
  test("the German pin steps name Edge", async ({ page }) => {
    await page.goto(`/de${PATH}?pinned=0&store=edge`);
    expect(await seen(page.locator("#pin h2"))).toBe("An die Symbolleiste anpinnen");
    const text = await seen(pinText(page));
    expect(text).toMatch(/oben rechts in Edge/);
    expect(text).not.toMatch(/Chrome/);
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-edges-pin-pictures-name} */
  test("one pin picture is exposed, Edge's, naming both clicks", async ({ page }) => {
    await page.goto(`${PATH}?pinned=0&store=edge`);
    const pictures = page.getByRole("img", { name: /toolbar: the puzzle-piece button/ });
    await expect(pictures).toHaveCount(1);
    await expect(pictures).toHaveAttribute(
      "aria-label",
      "Edge's toolbar: the puzzle-piece button, marked 1, opens the Extensions menu, and the pin next to Gallery Wall Layout Generator is marked 2",
    );
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-the-edge-pin-pictures-labels} */
  test("the Edge pin picture draws Edge's English menu", async ({ page }) => {
    await page.goto(`${PATH}?pinned=0&store=edge`);
    const picture = visiblePictures(page);
    for (const label of ["Extensions", "Manage Extensions", "Get extensions for Microsoft Edge"])
      await expect(picture.locator("text", { hasText: new RegExp(`^${label}$`) })).toHaveCount(1);
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-the-edge-right-click-figures-labels} */
  test("the Edge right-click figure reads Edge's items", async ({ page }) => {
    await page.goto(`${PATH}?pinned=1&store=edge`);
    const menu = page.locator(".ext-menu:visible");
    await expect(menu).toHaveCount(1);
    expect(await seen(menu)).toBe("Copy image\nTry on my wall\nInspect");
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-the-arabic-edge-pin-picture} */
  test("the Arabic Edge pin picture puts the puzzle piece and menu on the left", async ({
    page,
  }) => {
    await page.goto(`/ar${PATH}?pinned=0&store=edge`);
    const picture = visiblePictures(page);
    await expect(picture).toHaveCount(1);
    expect(await half(picture, "circle.pp-tape-stroke")).toBe("left");
    expect(await half(picture, 'rect[filter="url(#pe-shadow)"]')).toBe("left");
    await expect(picture.locator('text[lang="en"]', { hasText: /^Extensions$/ })).toHaveCount(1);
    await expect(picture).toHaveAttribute("aria-label", /^شريط أدوات Edge/);
  });
});

/** {@link openspec/specs/extension-site/spec.md#requirement-the-right-click-figure-follows-the-pages-direction} */
test.describe("the right-click figure's direction", () => {
  /** {@link openspec/specs/extension-site/spec.md#scenario-the-arabic-right-click-figure} */
  test("the Arabic figure is mirrored, its text left to right", async ({ page }) => {
    for (const query of ["?pinned=1", "?pinned=1&store=edge"]) {
      await page.goto(`/ar${PATH}${query}`);
      const fig = page.locator(".ext-fig-shop:visible");
      const box = await fig.evaluate((el) => {
        const f = el.getBoundingClientRect();
        const p = el.querySelector(".ext-fig-shop-print")?.getBoundingClientRect();
        const m = el.querySelector(".ext-menu")?.getBoundingClientRect();
        return { mid: f.left + f.width / 2, left: p?.left, right: p?.right, menuRight: m?.right };
      });
      expect(box.left).toBeGreaterThanOrEqual(box.mid);
      expect(box.menuRight).toBeLessThan(box.right ?? 0);
      await expect(fig.locator(".ext-menu")).toHaveAttribute("dir", "ltr");
    }
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-a-left-to-right-version-keeps-its-figure} */
  test("the German figure keeps its print on the left", async ({ page }) => {
    await page.goto(`/de${PATH}?pinned=1`);
    const fig = page.locator(".ext-fig-shop:visible");
    const left = await fig.evaluate((el) => {
      const f = el.getBoundingClientRect();
      const p = el.querySelector(".ext-fig-shop-print")?.getBoundingClientRect();
      return !!p && p.right <= f.left + f.width / 2;
    });
    expect(left).toBe(true);
  });
});

/** {@link openspec/specs/extension-site/spec.md#scenario-edge-before-its-id} */
test("before Edge's id, an Edge visitor sees no store link", async ({ page }) => {
  await page.goto(`${PATH}?store=edge`);
  await expect(page.locator('a[href^="https://microsoftedge.microsoft.com"]')).toHaveCount(0);
  await expect(page.locator('a[href^="https://chromewebstore.google.com"]:visible')).toHaveCount(0);
  await expect.poll(() => seen(answer(page))).toBe(EDGE_ANSWER);
});

/** {@link openspec/specs/extension-site/spec.md#scenario-the-browsers-answer-in-chrome} */
test("the browsers answer names Chrome 116 and Microsoft Edge 116", async ({ page }) => {
  await page.goto(PATH);
  await page.getByText("Which browsers does it run on?").click();
  const item = page.locator("details", { hasText: "Which browsers does it run on?" });
  expect(await seen(item.locator("p"))).toBe(
    "Chrome 116 or newer, or Microsoft Edge 116 or newer, on a computer. It opens in the browser's side panel.",
  );
});

/** {@link openspec/specs/extension-site/spec.md#scenario-the-english-head} */
test("the English head names no browser", async ({ page }) => {
  await page.goto(PATH);
  await expect(page).toHaveTitle("Gallery Wall Layout Generator Extension | Frame Sizes");
  await expect(page.locator("h1")).toHaveText("How to Use the Gallery Wall Layout Generator");
  await expect(page.locator('nav[aria-label="Breadcrumb"] li').last()).toHaveText(
    "Browser extension",
  );
});

/** {@link openspec/specs/extension-site/spec.md#scenario-no-detectable-violations-in-either-mode} */
for (const locale of ["", "/ar"]) {
  for (const query of ["?pinned=0&store=edge", "?pinned=1&store=edge"]) {
    test(`no WCAG 2.2 AA violations at ${locale || "/"} ${query}`, async ({ page }) => {
      await page.goto(`${locale}${PATH}${query}`);
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual(
        [],
      );
    });
  }
}

/** {@link openspec/specs/extension-site/spec.md#scenario-the-page-at-320-px} */
test("no horizontal overflow at 320px in Edge's pin mode", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto(`${PATH}?pinned=0&store=edge`);
  const widths = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
});

/** {@link openspec/specs/extension-site/spec.md#scenario-edge-before-its-id} */
test.describe("the G1 section in Edge before Edge's id", () => {
  test.use({ userAgent: EDGE_UA });

  test("shows Add to Chrome and links nowhere on Microsoft Edge Add-ons", async ({ page }) => {
    await page.goto("/gallery-wall-planner");
    await expect(
      page.locator(".ext-sec").getByRole("link", { name: "Add to Chrome" }),
    ).toBeVisible();
    await expect(page.locator('a[href^="https://microsoftedge.microsoft.com"]')).toHaveCount(0);
  });
});

import { expect, type Page, test } from "@playwright/test";

const sizeRadio = (page: Page, name: string) =>
  page.locator("tbody").getByRole("radio", { name, exact: true });

/** Waits until the widget has hydrated (a click would otherwise land on static HTML). */
async function open(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForFunction(() => document.documentElement.dataset.chartReady === "true");
}

test.use({ viewport: { width: 390, height: 664 } });

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-click-near-a-small-outlines-corner} */
test("a click near the 8.5x11 corner selects it", async ({ page }) => {
  await open(page, "/?view=all");
  const rect = page.locator('rect[data-size="8.5x11"]');
  await rect.scrollIntoViewIfNeeded();
  // 0.2 in at the drawing's scale, up and right of the outline's top-right corner, in client px.
  const point = await rect.evaluate((el: SVGRectElement) => {
    const ctm = el.ownerSVGElement?.getScreenCTM();
    if (!ctm) throw new Error("the drawing has no screen matrix");
    const scale = el.width.baseVal.value / 8.5;
    const d = 0.2 * scale;
    const corner = new DOMPoint(
      el.x.baseVal.value + el.width.baseVal.value + d,
      el.y.baseVal.value - d,
    );
    const { x, y } = corner.matrixTransform(ctm);
    return { x, y };
  });
  await page.mouse.click(point.x, point.y);
  await expect(sizeRadio(page, "8.5 × 11 in")).toBeChecked();
});

const visibleRows = (page: Page) => page.locator("tbody tr:not([hidden])");

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-rows-on-a-phone} */
test("the rows on a phone are full-width blocks of one height in both units", async ({ page }) => {
  await open(page);
  await expect(visibleRows(page)).toHaveCount(14);
  const measure = () =>
    page.evaluate(() => {
      const wrap = document.querySelector(".fs-table-wrap") as HTMLElement;
      const rows = [...document.querySelectorAll("tbody tr:not([hidden])")].map((tr) => {
        const r = tr.getBoundingClientRect();
        return { id: tr.querySelector("input")?.value, width: r.width, height: r.height };
      });
      return {
        wrap: wrap.getBoundingClientRect().width,
        scrolls: wrap.scrollWidth > wrap.clientWidth,
        rows,
      };
    });
  const check = async () => {
    const found = await measure();
    expect(found.scrolls).toBe(false);
    for (const row of found.rows) {
      expect(row.height, row.id).toBeGreaterThanOrEqual(44);
      expect(Math.abs(row.width - found.wrap), row.id).toBeLessThanOrEqual(1);
    }
    return found;
  };
  const inches = await check();
  await page
    .getByRole("radiogroup", { name: "Orientation" })
    .getByRole("radio", { name: "Square" })
    .click();
  await expect(visibleRows(page)).toHaveCount(5);
  await check();

  await page.addInitScript(() => localStorage.setItem("unit", "cm"));
  await open(page);
  await expect(sizeRadio(page, "68.6 × 101.6 cm")).toBeAttached();
  const cm = await check();
  const height = (found: typeof cm) => found.rows.find((r) => r.id === "27x40")?.height;
  expect(height(cm)).toBe(height(inches));
});

test.describe("on a touch screen", () => {
  test.use({ hasTouch: true });

  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-row-is-tapped-on-a-phone} */
  test("a tap on the 11x14 mat line selects it", async ({ page }) => {
    await open(page);
    const mat = page
      .locator('tbody tr:has(input[value="11x14"])')
      .getByRole("cell", { name: "8 × 10 in" });
    await mat.scrollIntoViewIfNeeded();
    // The row's label is stretched over the row on purpose: tap the cell's centre regardless.
    await mat.tap({ force: true });
    await expect(sizeRadio(page, "11 × 14 in")).toBeChecked();
  });
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-filters-on-a-phone} */
test("the filters on a phone are thumb-sized and full-width", async ({ page }) => {
  await open(page);
  const found = await page.evaluate(() => {
    const filters = document.querySelector(".fc-filters") as HTMLElement;
    const style = getComputedStyle(filters);
    const content =
      filters.getBoundingClientRect().width -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);
    const group = (name: string) =>
      document.querySelector(`[role="radiogroup"][aria-label="${name}"]`) as HTMLElement;
    const box = (el: Element) => el.getBoundingClientRect();
    const nextTo = group("Next to");
    return {
      content,
      orientation: box(group("Orientation")),
      preview: box(group("Preview")),
      nextTo: box(nextTo),
      nextToRow: box(nextTo.closest(".fs-field") as Element),
    };
  });
  for (const name of ["orientation", "preview", "nextTo"] as const) {
    expect(found[name].height, name).toBeGreaterThanOrEqual(44);
  }
  for (const name of ["orientation", "preview", "nextToRow"] as const) {
    expect(Math.abs(found[name].width - found.content), name).toBeLessThanOrEqual(1);
  }
});

test.describe("at 360 × 640", () => {
  test.use({ viewport: { width: 360, height: 640 } });

  for (const unit of ["in", "cm"]) {
    /** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-narrowest-phone} */
    test(`nothing scrolls sideways, ${unit}`, async ({ page }) => {
      await page.addInitScript((stored) => localStorage.setItem("unit", stored), unit);
      await open(page);
      const found = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
        scrolling: [...document.querySelectorAll(".fc *")]
          .filter((el) => {
            const overflow = getComputedStyle(el).overflowX;
            return (
              (overflow === "auto" || overflow === "scroll") && el.scrollWidth > el.clientWidth
            );
          })
          .map((el) => el.getAttribute("class")),
      }));
      expect(found.document).toBeLessThanOrEqual(found.viewport);
      expect(found.scrolling).toEqual([]);
    });
  }
});

/** {@link openspec/specs/frame-size-chart/spec.md#requirement-the-preview-stays-in-view-while-the-table-scrolls} */
test("moving up the list keeps each focused row below the pinned preview", async ({ page }) => {
  await open(page, "/?size=27x40");
  await sizeRadio(page, "27 × 40 in").focus();
  for (let i = 0; i < 13; i++) {
    await page.keyboard.press("ArrowUp");
    const { rowTop, previewBottom } = await page.evaluate(() => ({
      rowTop: (document.activeElement?.closest("tr") as Element).getBoundingClientRect().top,
      previewBottom: (document.querySelector(".fc-preview") as Element).getBoundingClientRect()
        .bottom,
    }));
    expect(rowTop).toBeGreaterThanOrEqual(previewBottom - 1);
  }
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-six-sizes-on-a-phone} */
test("the six sizes stand in two rows of three on a phone", async ({ page }) => {
  await open(page);
  const found = await page.evaluate(() => {
    const box = (id: string) =>
      (document.querySelector(`[data-frame="${id}"]`) as Element).getBoundingClientRect();
    const figure = document.querySelector("[data-frame]")?.closest("figure") as HTMLElement;
    return {
      top: ["4x6", "5x7", "8x10"].map((id) => box(id).bottom),
      bottom: ["11x14", "16x20", "24x36"].map((id) => box(id).bottom),
      small: box("4x6").width,
      large: box("24x36").width,
      scrolls: figure.scrollWidth > figure.clientWidth,
    };
  });
  const spread = (values: number[]) => Math.max(...values) - Math.min(...values);
  expect(spread(found.top)).toBeLessThanOrEqual(1);
  expect(spread(found.bottom)).toBeLessThanOrEqual(1);
  expect(Math.min(...found.bottom)).toBeGreaterThan(Math.max(...found.top) + 1);
  expect(Math.abs(found.large - 6 * found.small)).toBeLessThanOrEqual(1);
  expect(found.scrolls).toBe(false);
});

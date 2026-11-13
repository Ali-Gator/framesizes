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

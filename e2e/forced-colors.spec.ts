import { expect, type Locator, type Page, test } from "@playwright/test";

test.use({ forcedColors: "active" });

/** Waits until the widget has hydrated, and proves the emulation took. */
async function open(page: Page) {
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.chartReady === "true");
  expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);
}

/** The outline and border sides an element draws, e.g. ["outline", "border-left"]. */
const marks = (el: Locator) =>
  el.evaluate((node) => {
    const s = getComputedStyle(node);
    const drawn = (style: string, width: string) => style !== "none" && parseFloat(width) > 0;
    const out = drawn(s.outlineStyle, s.outlineWidth) ? ["outline"] : [];
    for (const side of ["top", "right", "bottom", "left"]) {
      const style = s.getPropertyValue(`border-${side}-style`);
      if (drawn(style, s.getPropertyValue(`border-${side}-width`))) out.push(`border-${side}`);
    }
    return out;
  });

const selectedRow = (page: Page) => page.locator("tbody tr:has(input:checked)");
const otherRow = (page: Page) =>
  page.locator("tbody tr:not([hidden]):not(:has(input:checked))").first();

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-table-in-forced-colors} */
test("the selected row keeps a border beside its focus ring in forced colors", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page);
  expect(await marks(selectedRow(page))).not.toEqual([]);
  expect(await marks(otherRow(page))).toEqual([]);

  // The selected row is usually the focused one: the focus ring must sit clear of the border.
  await page.locator("tbody input:checked").focus();
  const ring = await selectedRow(page).evaluate((row) => {
    const s = getComputedStyle(row);
    return {
      outline: s.outlineStyle,
      inset: -parseFloat(s.outlineOffset) - parseFloat(s.outlineWidth),
      border: parseFloat(s.borderLeftWidth),
    };
  });
  expect(ring.outline).not.toBe("none");
  expect(ring.border).toBeGreaterThan(0);
  expect(ring.inset).toBeGreaterThanOrEqual(ring.border);
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-phone-rows-in-forced-colors} */
test("the phone rows mark the selected radio and row in forced colors", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await open(page);
  const fill = (row: Locator) =>
    row.locator("input").evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(await fill(selectedRow(page))).not.toBe(await fill(otherRow(page)));

  const other = await marks(otherRow(page));
  const own = (await marks(selectedRow(page))).filter((mark) => !other.includes(mark));
  expect(own).not.toEqual([]);
});

/** {@link openspec/specs/site-shell/spec.md#scenario-the-units-toggle-in-forced-colors} */
test("the checked unit carries a border or outline in forced colors", async ({ page }) => {
  await open(page);
  const units = page.getByRole("radiogroup", { name: "Units" });
  expect(await marks(units.getByRole("radio", { checked: true }))).not.toEqual([]);
  expect(await marks(units.getByRole("radio", { checked: false }))).toEqual([]);
});

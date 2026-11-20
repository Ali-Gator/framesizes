import { expect, type Locator, type Page, test } from "@playwright/test";

test.use({ forcedColors: "active" });

/** Waits until the widget has hydrated, and proves the emulation took. */
async function open(page: Page) {
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.chartReady === "true");
  expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);
}

/** The outline and border sides an element (or its `pseudo`) draws, e.g. ["outline", "border-left"]. */
const marks = (el: Locator, pseudo?: string) =>
  el.evaluate((node, pseudo) => {
    const s = getComputedStyle(node, pseudo);
    const drawn = (style: string, width: string) => style !== "none" && parseFloat(width) > 0;
    const out = drawn(s.outlineStyle, s.outlineWidth) ? ["outline"] : [];
    for (const side of ["top", "right", "bottom", "left"]) {
      const style = s.getPropertyValue(`border-${side}-style`);
      if (drawn(style, s.getPropertyValue(`border-${side}-width`))) out.push(`border-${side}`);
    }
    return out;
  }, pseudo);

const selectedRow = (page: Page) => page.locator("tbody tr:has(input:checked)");
const otherRow = (page: Page) =>
  page.locator("tbody tr:not([hidden]):not(:has(input:checked))").first();
/** The mark sits on the label's row-sized overlay, so it takes no layout space. */
const overlayMarks = (row: Locator) => marks(row.locator("label"), "::after");

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-table-in-forced-colors} */
test("the selected row keeps a border beside its focus ring in forced colors", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page);
  expect(await overlayMarks(selectedRow(page))).not.toEqual([]);
  expect(await overlayMarks(otherRow(page))).toEqual([]);

  // The selected row is usually the focused one: the focus ring must sit clear of the border.
  await page.locator("tbody input:checked").focus();
  const ring = await selectedRow(page).evaluate((row) => {
    const s = getComputedStyle(row);
    return {
      outline: s.outlineStyle,
      inset: -parseFloat(s.outlineOffset) - parseFloat(s.outlineWidth),
      border: parseFloat(
        getComputedStyle(row.querySelector("label") as Element, "::after").borderLeftWidth,
      ),
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

  const other = await overlayMarks(otherRow(page));
  const own = (await overlayMarks(selectedRow(page))).filter((mark) => !other.includes(mark));
  expect(own).not.toEqual([]);
});

/** {@link openspec/specs/site-shell/spec.md#scenario-the-units-toggle-in-forced-colors} */
test("the checked unit carries a border or outline in forced colors", async ({ page }) => {
  await open(page);
  const units = page.getByRole("radiogroup", { name: "Units" });
  const checked = units.getByRole("radio", { checked: true });
  const unchecked = units.getByRole("radio", { checked: false });
  expect(await marks(checked)).not.toEqual([]);
  // Every option keeps the same border width, so toggling never shifts the labels; only its colour marks the choice.
  const color = (el: Locator) => el.evaluate((node) => getComputedStyle(node).borderTopColor);
  expect(await color(checked)).not.toBe(await color(unchecked));
});

/** Every visible row's top (from the table's top) and height, and each radio's left edge. */
const layout = (page: Page) =>
  page.locator("table:has(tbody input)").evaluate((table) => {
    const origin = table.getBoundingClientRect().top;
    return [...table.querySelectorAll("tbody tr:not([hidden])")].map((tr) => {
      const r = tr.getBoundingClientRect();
      const input = tr.querySelector("input") as HTMLInputElement;
      return {
        id: input.value,
        checked: input.checked,
        top: r.top - origin,
        height: r.height,
        radioLeft: input.getBoundingClientRect().left,
      };
    });
  });

/** Moves the selection one row down and returns the layout before and after. */
async function moveDown(page: Page) {
  await page.locator("tbody input:checked").focus();
  const before = await layout(page);
  const next = before[before.findIndex((row) => row.checked) + 1] as Row;
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(`tbody input[value="${next.id}"]`)).toBeChecked();
  return { before, after: await layout(page) };
}

function expectSamePlaces(before: Row[], after: Row[]) {
  expect(after.map((row) => row.id)).toEqual(before.map((row) => row.id));
  before.forEach((row, i) => {
    const now = after[i] as Row;
    expect(Math.abs(now.top - row.top), `${row.id} top`).toBeLessThanOrEqual(0.5);
    expect(Math.abs(now.height - row.height), `${row.id} height`).toBeLessThanOrEqual(0.5);
  });
}
type Row = Awaited<ReturnType<typeof layout>>[number];

/**
 * {@link openspec/specs/frame-size-chart/spec.md#scenario-rows-keep-their-places-on-the-desktop}
 */
test("moving the selection in forced colors moves no row on the desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page);
  const { before, after } = await moveDown(page);
  expectSamePlaces(before, after);
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-rows-keep-their-places-on-a-phone} */
test("moving the selection in forced colors moves no row or radio on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await open(page);
  const { before, after } = await moveDown(page);
  expectSamePlaces(before, after);
  for (const rows of [before, after]) {
    const checked = rows.find((row) => row.checked) as Row;
    const unchecked = rows.find((row) => !row.checked) as Row;
    expect(Math.abs(checked.radioLeft - unchecked.radioLeft)).toBeLessThanOrEqual(0.5);
  }
});

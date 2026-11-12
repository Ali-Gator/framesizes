import { expect, type Locator, type Page, test } from "@playwright/test";

const preview = (page: Page, name: string) => page.getByRole("img", { name, exact: true });
const group = (page: Page, name: string) => page.getByRole("radiogroup", { name, exact: true });
const choose = (page: Page, groupName: string, option: string) =>
  group(page, groupName).getByRole("radio", { name: option, exact: true }).click();
const sizeRadio = (page: Page, name: string) =>
  page.locator("tbody").getByRole("radio", { name, exact: true });
const rowOf = (page: Page, name: string) =>
  page.locator("tbody tr").filter({ has: page.getByRole("radio", { name, exact: true }) });
/**
 * A real pointer click at the centre of `target`. The row's label is stretched over the row on
 * purpose, so Playwright's own click would refuse a cell it sees as covered.
 */
async function clickAt(page: Page, target: Locator) {
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) throw new Error("not drawn");
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}
/** Selects a size the way a visitor does: a click on its row. */
const pick = (page: Page, name: string) => rowOf(page, name).locator("label").click();
const visibleRows = (page: Page) => page.locator("tbody tr:not([hidden])");
const legend = (page: Page) => page.locator(".fs-scale-legend");

/** Waits until the widget has hydrated (a click would otherwise land on static HTML). */
async function open(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForFunction(() => document.documentElement.dataset.chartReady === "true");
}

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-default-state-in-the-server-html} */
test("the default state is in the server HTML", async ({ page }) => {
  const html = await (await page.request.get("/")).text();
  const found = await page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, "text/html");
    return {
      checked: [...doc.querySelectorAll<HTMLInputElement>("tbody input[checked]")].map(
        (i) => i.value,
      ),
      names: [...doc.querySelectorAll('[role="img"]')].map((s) => s.getAttribute("aria-label")),
    };
  }, html);
  expect(found.checked).toEqual(["16x20"]);
  expect(found.names).toContain("16x20 picture frame at true scale next to a three-seat sofa");
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-row-is-clicked} */
test("clicking a row's common-use cell selects it", async ({ page }) => {
  await open(page);
  await clickAt(
    page,
    rowOf(page, "11 × 14 in").getByRole("cell", { name: "Wall portraits and small art prints" }),
  );
  await expect(sizeRadio(page, "11 × 14 in")).toBeChecked();
  await expect(
    preview(page, "11x14 picture frame at true scale next to a three-seat sofa"),
  ).toBeVisible();
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-selection-is-moved-with-the-keyboard} */
test("the down arrow moves the selection", async ({ page }) => {
  await open(page);
  await sizeRadio(page, "16 × 20 in").focus();
  await page.keyboard.press("ArrowDown");
  await expect(sizeRadio(page, "18 × 24 in")).toBeChecked();
  await expect(sizeRadio(page, "18 × 24 in")).toBeFocused();
  await expect(
    preview(page, "18x24 picture frame at true scale next to a three-seat sofa"),
  ).toBeVisible();
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-portrait-to-landscape} */
test("landscape turns the selected size", async ({ page }) => {
  await open(page);
  await choose(page, "Orientation", "Landscape");
  await expect(sizeRadio(page, "20 × 16 in")).toBeChecked();
  await expect(
    preview(page, "20x16 picture frame at true scale next to a three-seat sofa"),
  ).toBeVisible();
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-into-and-out-of-square} */
test("square swaps the list and leaving it selects 16x20 turned", async ({ page }) => {
  await open(page);
  await choose(page, "Orientation", "Square");
  await expect(sizeRadio(page, "12 × 12 in")).toBeChecked();
  await expect(visibleRows(page)).toHaveCount(5);
  await choose(page, "Orientation", "Landscape");
  await expect(sizeRadio(page, "20 × 16 in")).toBeChecked();
  await expect(visibleRows(page)).toHaveCount(14);
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-reference-is-changed} */
test("the reference can be a door", async ({ page }) => {
  await open(page);
  await choose(page, "Next to", "Door");
  await expect(preview(page, "16x20 picture frame at true scale next to a door")).toBeVisible();
  await expect(legend(page)).toContainText("Centred 57 in from the floor, next to a door");
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-next-size-up-is-named} */
test("the next size up is named", async ({ page }) => {
  await open(page);
  await expect(legend(page)).toContainText("Next size up: 18 × 24 in");
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-largest-size-is-selected} */
test("the largest size has no next size", async ({ page }) => {
  await open(page);
  await pick(page, "27 × 40 in");
  await expect(
    preview(page, "27x40 picture frame at true scale next to a three-seat sofa"),
  ).toBeVisible();
  await expect(legend(page)).not.toContainText("Next size up");
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-view-is-switched} */
test("the all-sizes view names the chart and hides the reference choice", async ({ page }) => {
  await open(page);
  await choose(page, "Preview", "All sizes");
  await expect(
    preview(page, "Standard frame sizes chart from 4x6 to 27x40 inches, 16x20 highlighted"),
  ).toBeVisible();
  await expect(group(page, "Next to")).toBeHidden();
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-an-outline-is-clicked} */
test("clicking an outline selects its size", async ({ page }) => {
  await open(page);
  await choose(page, "Preview", "All sizes");
  const outline = page.locator('rect[data-size="24x36"]');
  const box = await outline.boundingBox();
  if (!box) throw new Error("the 24x36 outline is not drawn");
  // Its top-right corner: outside every smaller outline drawn on top of it.
  await page.mouse.click(box.x + box.width - 3, box.y + 3);
  await expect(sizeRadio(page, "24 × 36 in")).toBeChecked();
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-visitor-switches-to-centimetres} */
test("centimetres reach the table and the sentence", async ({ page }) => {
  await open(page);
  await choose(page, "Units", "cm");
  await expect(sizeRadio(page, "40.6 × 50.8 cm")).toBeChecked();
  await expect(page.locator("thead th").nth(1)).toHaveText("Inches");
  await expect(legend(page)).toContainText("Hung 20 cm above a sofa 213 cm wide");
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-choice-is-written-to-the-url} */
test("choices go to the query string without a history entry", async ({ page }) => {
  await open(page);
  const before = await page.evaluate(() => history.length);
  await clickAt(
    page,
    rowOf(page, "11 × 14 in").getByRole("cell", { name: "Wall portraits and small art prints" }),
  );
  await choose(page, "Next to", "Door");
  await expect(page).toHaveURL(/\?size=11x14&ref=door$/);
  expect(await page.evaluate(() => history.length)).toBe(before);
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-shared-url-is-opened} */
test("a shared URL restores the state", async ({ page }) => {
  await open(page, "/?size=10x8&view=all");
  await expect(group(page, "Orientation").getByRole("radio", { name: "Landscape" })).toBeChecked();
  await expect(sizeRadio(page, "10 × 8 in")).toBeChecked();
  await expect(
    preview(page, "Standard frame sizes chart from 6x4 to 40x27 inches, 10x8 highlighted"),
  ).toBeVisible();
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-unknown-values} */
test("unknown values give the default state", async ({ page }) => {
  await open(page, "/?size=banana&ref=moon&view=3d");
  await expect(sizeRadio(page, "16 × 20 in")).toBeChecked();
  await expect(
    preview(page, "16x20 picture frame at true scale next to a three-seat sofa"),
  ).toBeVisible();
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-back-to-the-defaults} */
test("returning every choice to its default clears the query string", async ({ page }) => {
  await open(page, "/?size=11x14&view=all&ref=door");
  await choose(page, "Preview", "On a wall");
  await choose(page, "Next to", "Sofa");
  await pick(page, "16 × 20 in");
  await expect(page).toHaveURL(/\/$/);
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-choice-is-written-to-the-url} */
test("one selection writes the URL once, by click and by arrow key", async ({ page }) => {
  await open(page);
  await page.evaluate(() => {
    const w = window as unknown as { __writes: number };
    w.__writes = 0;
    const replace = history.replaceState;
    history.replaceState = function (this: History, ...args: Parameters<History["replaceState"]>) {
      if (args[0] === null) w.__writes++; // the widget's own writes carry no state
      return replace.apply(this, args);
    };
  });
  const writes = () => page.evaluate(() => (window as unknown as { __writes: number }).__writes);
  await pick(page, "11 × 14 in");
  await expect(page).toHaveURL(/size=11x14/);
  expect(await writes()).toBe(1);
  await page.keyboard.press("ArrowDown");
  await expect(page).toHaveURL(/size=11x17/);
  expect(await writes()).toBe(2);
});

/** {@link openspec/specs/frame-size-chart/spec.md#requirement-the-widgets-state-lives-in-the-url} */
test("following the logo link back to the home page restores the defaults", async ({ page }) => {
  await open(page, "/?size=11x14&ref=door");
  await expect(sizeRadio(page, "11 × 14 in")).toBeChecked();
  await page.getByRole("link", { name: "framesizes.app home" }).first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(sizeRadio(page, "16 × 20 in")).toBeChecked();
  await expect(
    preview(page, "16x20 picture frame at true scale next to a three-seat sofa"),
  ).toBeVisible();
  await pick(page, "8 × 10 in");
  await expect(page).toHaveURL(/\/\?size=8x10$/);
});

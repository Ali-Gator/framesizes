import { expect, type Page, test } from "@playwright/test";

const PATH = "/frame-mat-calculator";

const calc = (page: Page) => page.getByRole("region", { name: "Frame and mat calculator" });
const field = (page: Page, name: string) => calc(page).getByLabel(name, { exact: true });
const press = (page: Page, name: string) =>
  calc(page).getByRole("button", { name, exact: true }).click();
const answer = (page: Page) => calc(page).locator('[aria-live="polite"]');

async function open(page: Page) {
  await page.goto(PATH);
  // Hydrated once a chip reacts.
  await calc(page).getByRole("button", { name: "3 in", exact: true }).click();
  await expect(field(page, "Mat border")).toHaveValue("3");
  await calc(page).getByRole("button", { name: "2 in", exact: true }).click();
}

async function find(page: Page, w: string, h: string) {
  await field(page, "Print width").fill(w);
  await field(page, "Print height").fill(h);
  await press(page, "Find my frame size");
}

/** Nothing on the page is wider than the screen. */
async function fitsWidth(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()?.width ?? 0,
  );
}

const box = async (page: Page, selector: string) => {
  const b = await calc(page).locator(selector).first().boundingBox();
  if (!b) throw new Error(`${selector} is not shown`);
  return b;
};

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  test.describe(`at ${viewport.width}`, () => {
    test.use({ viewport });

    /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-border-too-wide-for-the-frame} */
    test("marks a 2 in border on a 4 × 6 in frame", async ({ page }) => {
      await open(page);
      await press(page, "Reverse: start from a frame");
      await field(page, "Frame width").fill("4");
      await field(page, "Frame height").fill("6");
      await press(page, "Find the print that fits");
      await expect(field(page, "Mat border")).toHaveAttribute("aria-invalid", "true");
      await expect(field(page, "Mat border")).toBeFocused();
      await expect(calc(page)).toContainText(
        "A 2 in border on each side leaves no opening in a frame 4 in wide. Pick a narrower border.",
      );
      await expect(answer(page)).toHaveText("Check the marked fields, then try again.");
    });
  });
}

test.describe("on a desktop", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-desktop} */
  test("shows the answer right of the fields and the drawing under them", async ({ page }) => {
    await open(page);
    await find(page, "8", "10");
    await expect(answer(page)).toContainText("Your frame: 11½ × 13½ in. Not a standard size.");
    const fields = await box(page, ".mc-main");
    const side = await box(page, ".mc-side");
    const fig = await box(page, ".mc-fig");
    expect(side.x).toBeGreaterThan(fields.x + fields.width);
    expect(fig.y).toBeGreaterThanOrEqual(fields.y + fields.height);
    await fitsWidth(page);
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-an-8x10-print-with-a-2-inch-border} */
  test("answers an 8x10 print with a 2 in border", async ({ page }) => {
    await open(page);
    await find(page, "8", "10");
    const side = calc(page).locator(".mc-side");
    await expect(side).toContainText("7½ × 9½ in");
    for (const title of [
      "Order this size",
      "Ready-made, with a pre-cut mat",
      "Next size up",
      "Square frames",
    ])
      await expect(side.locator(".mc-opt > .mc-label", { hasText: title })).toHaveCount(1);
    await expect(side).toContainText("10x10 is too small for this mat.");
    await expect(calc(page).locator("figcaption")).toHaveText("Drawn at the exact frame size.");
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-there-and-back} */
  test("Reverse goes there and back", async ({ page }) => {
    await open(page);
    await find(page, "8", "10");
    await press(page, "Reverse: start from a frame");
    await expect(field(page, "Frame width")).toHaveValue("11½");
    await expect(field(page, "Frame height")).toHaveValue("13½");
    await expect(answer(page)).toContainText("An 8x10 print fits.");
    await press(page, "Reverse: start from a print");
    await expect(field(page, "Print width")).toHaveValue("8");
    await expect(field(page, "Print height")).toHaveValue("10");
    await expect(answer(page)).toContainText("Your frame: 11½ × 13½ in.");
  });
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-phone} */
  test("stacks the button, the answer and the drawing", async ({ page }) => {
    await open(page);
    await find(page, "8", "10");
    await expect(answer(page)).toContainText("Your frame: 11½ × 13½ in.");
    const button = await box(page, ".mc-bar");
    const live = await box(page, ".mc-live");
    const side = await box(page, ".mc-side");
    const fig = await box(page, ".mc-fig");
    expect(live.y).toBeGreaterThanOrEqual(button.y + button.height);
    expect(fig.y).toBeGreaterThanOrEqual(side.y + side.height);
    const widest = await calc(page).evaluate((el) =>
      Math.max(...[el, ...el.querySelectorAll("*")].map((e) => e.getBoundingClientRect().right)),
    );
    expect(widest).toBeLessThanOrEqual(390);
    await fitsWidth(page);
  });
});

import { expect, type Page, test } from "@playwright/test";

const PATH = "/poster-frame-sizes";

const widget = (page: Page) => page.getByRole("region", { name: "Find the frame for your poster" });
const chip = (page: Page, name: string) =>
  widget(page)
    .getByRole("group", { name: "Poster size" })
    .getByRole("button", { name: new RegExp(`^${name}\\b`) });
const radio = (page: Page, name: string) => widget(page).getByRole("radio", { name, exact: true });
const answer = (page: Page) => widget(page).locator('[aria-live="polite"]');
const field = (page: Page, name: string) => widget(page).getByLabel(name, { exact: true });

async function open(page: Page) {
  await page.goto(PATH);
  // Hydrated once a chip reacts.
  await chip(page, "18×24").click();
  await expect(answer(page)).toContainText("Use an 18x24 frame.");
  await chip(page, "24×36").click();
  await expect(answer(page)).toContainText("Use a 24x36 frame.");
}

/** Nothing on the page is wider than the screen. */
async function fitsWidth(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()?.width ?? 0,
  );
}

const box = async (page: Page, selector: string) => {
  const b = await widget(page).locator(selector).first().boundingBox();
  if (!b) throw new Error(`${selector} is not shown`);
  return b;
};

test.describe("at 1280", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-desktop} */
  test("the answer is right of the chips, the drawing under the mat control", async ({ page }) => {
    await open(page);
    const chips = await box(page, '[aria-label="Poster size"]');
    const side = await box(page, ".mc-side");
    expect(side.x).toBeGreaterThanOrEqual(chips.x + chips.width);
    const mat = await box(page, '[aria-label="Mat"]');
    const fig = await box(page, "figure");
    expect(fig.y).toBeGreaterThanOrEqual(mat.y + mat.height);
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-drawing-another-frame} */
  test("11x17 with a mat, then frame 2 drawn", async ({ page }) => {
    await open(page);
    await chip(page, "11×17").click();
    await radio(page, "With a mat").click();
    await expect(answer(page).locator(".mc-res-h .u-in")).toHaveText(
      "3 standard frames fit an 11x17 poster with a mat.",
    );
    const cards = answer(page).locator(".pf-pick");
    await expect(cards).toHaveCount(3);
    await cards.nth(1).click();
    await expect(cards.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(cards.nth(1)).toContainText("In the drawing");
    await expect(cards.nth(0)).toHaveAttribute("aria-pressed", "false");
    await expect(answer(page).locator(".mc-result-value .u-in")).toHaveText("16 × 20 in");
    await expect(widget(page).locator(".mc-legend li").first()).toContainText("16 × 20 in");
  });
});

test.describe("at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-phone} */
  test("one column: the answer under the mat control, the drawing under the answer", async ({
    page,
  }) => {
    await open(page);
    const mat = await box(page, '[aria-label="Mat"]');
    const side = await box(page, ".mc-side");
    const fig = await box(page, "figure");
    expect(side.y).toBeGreaterThanOrEqual(mat.y + mat.height);
    expect(fig.y).toBeGreaterThanOrEqual(side.y + side.height);
    await fitsWidth(page);
  });
});

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  test.describe(`at ${viewport.width}`, () => {
    test.use({ viewport });

    /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-13--19-inch-poster} */
    test("a typed 13 × 19 in gets its answer", async ({ page }) => {
      await open(page);
      await widget(page).getByRole("button", { name: "Custom size", exact: true }).click();
      await field(page, "Width").fill("13");
      await field(page, "Height").fill("19");
      await expect(answer(page).locator(".mc-res-h .u-in")).toHaveText(
        "Not a standard size: 13 × 19 in.",
      );
      await fitsWidth(page);
    });

    /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-zero-a-letter-a-negative} */
    test("a width of 0 is marked", async ({ page }) => {
      await open(page);
      await widget(page).getByRole("button", { name: "Custom size", exact: true }).click();
      await field(page, "Width").fill("0");
      await field(page, "Height").fill("19");
      await expect(field(page, "Width")).toHaveAttribute("aria-invalid", "true");
      await expect(field(page, "Height")).not.toHaveAttribute("aria-invalid", "true");
      await expect(widget(page)).toContainText("Enter a width and a height above 0.");
      await expect(answer(page)).toHaveText("Fix the size above to see a frame.");
      await expect(widget(page).locator('[role="img"]')).toHaveCount(0);
    });
  });
}

/** The opening's "Poster" label is hidden, or its box lies inside the opening. */
async function labelInside(page: Page) {
  const label = widget(page).locator(".mt-open .mt-art");
  if (!(await label.isVisible())) return false;
  const o = await box(page, ".mt-open");
  const l = await box(page, ".mt-open .mt-art");
  expect(l.x).toBeGreaterThanOrEqual(o.x);
  expect(l.y).toBeGreaterThanOrEqual(o.y);
  expect(l.x + l.width).toBeLessThanOrEqual(o.x + o.width);
  expect(l.y + l.height).toBeLessThanOrEqual(o.y + o.height);
  return true;
}

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
]) {
  test.describe(`the poster label at ${viewport.width}`, () => {
    test.use({ viewport });

    /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-poster-name-that-does-not-fit} */
    test("no Poster label spills out of a 3 × 5 in poster", async ({ page }) => {
      await open(page);
      await widget(page).getByRole("button", { name: "Custom size", exact: true }).click();
      await field(page, "Width").fill("3");
      await field(page, "Height").fill("5");
      await expect(answer(page).locator(".mc-res-h .u-in")).toContainText("3 × 5 in");
      // The poster is narrower than the label's one line of text.
      expect((await box(page, ".mt-open")).width).toBeLessThan(52);
      await labelInside(page);
    });

    /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-poster-name-that-does-not-fit} */
    test("the Poster label still shows for a 24x36 poster", async ({ page }) => {
      await open(page);
      expect(await labelInside(page)).toBe(true);
    });
  });
}

import { expect, type Locator, type Page, test } from "@playwright/test";

const PATH = "/measure-picture-frame";

const wizard = (page: Page) => page.getByRole("region", { name: "Measure your frame" });
const field = (page: Page, name: string) => wizard(page).getByLabel(name, { exact: true });
const press = (page: Page, name: string) =>
  wizard(page).getByRole("button", { name, exact: true }).click();
const answer = (page: Page) => wizard(page).locator('[aria-live="polite"]');

async function open(page: Page) {
  await page.goto(PATH);
  // Hydrated once a choice reacts.
  await expect(wizard(page).getByRole("radio", { name: /Inside, at the back/ })).toBeChecked();
}

/** Nothing on the page is wider than the screen. */
async function fitsWidth(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()?.width ?? 0,
  );
}

async function enter(page: Page, sizes: Record<string, string>) {
  for (const [name, value] of Object.entries(sizes)) await field(page, name).fill(value);
}

const visible = (l: Locator) => expect(l).toBeVisible();

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-through-the-steps} */
  test("goes through the three steps", async ({ page }) => {
    await open(page);
    await visible(wizard(page).getByText("Step 1 of 3"));
    await expect(field(page, "Width")).toBeHidden();
    await press(page, "Enter the sizes");
    await visible(wizard(page).getByText("Step 2 of 3"));
    await expect(wizard(page).getByRole("radio", { name: /Inside, at the back/ })).toBeHidden();
    await field(page, "Width").fill("8");
    await wizard(page).getByRole("button", { name: "⅛ in" }).click();
    await field(page, "Height").fill("10");
    await field(page, "Height").focus();
    await wizard(page).getByRole("button", { name: "⅛ in" }).click();
    await press(page, "Find my frame size");
    await visible(wizard(page).getByText("Step 3 of 3"));
    await expect(answer(page)).toContainText("Your frame is an 8x10.");
    await visible(wizard(page).getByRole("button", { name: "Change measurement" }));
    await visible(wizard(page).getByRole("button", { name: "Measure another frame" }));
    await expect(field(page, "Width")).toBeHidden();
    await fitsWidth(page);
  });

  /** {@link openspec/specs/measure-frame/spec.md#requirement-a-phone-shows-one-step-per-screen} */
  test("Back returns to the choice", async ({ page }) => {
    await open(page);
    await press(page, "Enter the sizes");
    await press(page, "Back to step 1");
    await visible(wizard(page).getByText("Step 1 of 3"));
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-back-keeps-the-numbers} */
  test("Change measurement keeps the numbers", async ({ page }) => {
    await open(page);
    await press(page, "Enter the sizes");
    await enter(page, { Width: "8 1/8", Height: "10" });
    await press(page, "Find my frame size");
    await press(page, "Change measurement");
    await visible(wizard(page).getByText("Your numbers are kept. Change what you need."));
    await expect(field(page, "Width")).toHaveValue("8");
    await field(page, "Width").focus();
    await expect(wizard(page).getByRole("button", { name: "⅛ in" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(field(page, "Height")).toHaveValue("10");
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-measure-another-frame} */
  test("Measure another frame starts again", async ({ page }) => {
    await open(page);
    await wizard(page)
      .getByRole("radio", { name: /^Mat opening/ })
      .check();
    await press(page, "Enter the sizes");
    await enter(page, { Width: "7 1/2", Height: "9 1/2" });
    await press(page, "Find my print size");
    await press(page, "Measure another frame");
    await visible(wizard(page).getByText("Step 1 of 3"));
    await expect(wizard(page).getByRole("radio", { name: /Inside, at the back/ })).toBeChecked();
    await press(page, "Enter the sizes");
    await expect(field(page, "Width")).toHaveValue("");
    await expect(field(page, "Height")).toHaveValue("");
  });
});

test.describe("on a desktop", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-the-answer-follows-the-fields} */
  test("shows the steps beside the answer, which follows every change", async ({ page }) => {
    await open(page);
    const choice = await wizard(page).getByText("1. What are you measuring?").boundingBox();
    const side = await wizard(page).getByText("3. Your answer").boundingBox();
    expect(side?.x ?? 0).toBeGreaterThan((choice?.x ?? 0) + (choice?.width ?? 0));
    await visible(field(page, "Width"));
    await expect(answer(page)).toHaveText("Enter both sides and press Find my frame size.");
    await enter(page, { Width: "8", Height: "10" });
    await press(page, "Find my frame size");
    await expect(answer(page)).toContainText("Your frame is an 8x10.");
    await enter(page, { Width: "11", Height: "14" });
    await expect(answer(page)).toContainText("Your frame is an 11x14.");
    await fitsWidth(page);
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-empty-fields} */
  test("marks empty fields and focuses the first", async ({ page }) => {
    await open(page);
    await press(page, "Find my frame size");
    await expect(field(page, "Width")).toHaveAttribute("aria-invalid", "true");
    await expect(field(page, "Height")).toHaveAttribute("aria-invalid", "true");
    await expect(field(page, "Width")).toBeFocused();
    await visible(wizard(page).getByText("Enter the width."));
  });
});

for (const [name, viewport] of [
  ["phone", { width: 390, height: 844 }],
  ["desktop", { width: 1280, height: 900 }],
] as const) {
  test.describe(`on a ${name}`, () => {
    test.use({ viewport });

    async function find(page: Page, kind: string, sizes: Record<string, string>, label: string) {
      await open(page);
      await wizard(page)
        .getByRole("radio", { name: new RegExp(`^${kind}`) })
        .check();
      if (name === "phone") await press(page, "Enter the sizes");
      await enter(page, sizes);
      await press(page, label);
    }

    /** {@link openspec/specs/measure-frame/spec.md#scenario-a-9--12-frame} */
    test("names the closest sizes to a 9 × 12 frame", async ({ page }) => {
      await find(page, "Inside, at the back", { Width: "9", Height: "12" }, "Find my frame size");
      await expect(answer(page)).toContainText("No standard frame matches 9 × 12 in.");
      await expect(answer(page)).toContainText("Custom size");
      const near = wizard(page).locator(".mf-near");
      await expect(near).toContainText("½ in narrower and 1 in shorter.");
      await expect(near).toContainText("Next size up: 2 in wider and 2 in taller.");
      await press(page, "Check where to measure");
      await expect(wizard(page).getByRole("radio", { name: /Inside, at the back/ })).toBeVisible();
      await fitsWidth(page);
    });

    /** {@link openspec/specs/measure-frame/spec.md#scenario-two-frames} */
    test("names the 16x20 print and two frames for a 15½ × 19½ mat", async ({ page }) => {
      await find(page, "Mat opening", { Width: "15 1/2", Height: "19 1/2" }, "Find my print size");
      await expect(answer(page)).toContainText("This mat holds a 16x20 print.");
      await visible(wizard(page).getByText("18x24 frame", { exact: true }));
      await visible(wizard(page).getByText("20x24 frame", { exact: true }));
      await visible(
        wizard(page).getByText("To tell which one you have, measure the inside at the back."),
      );
      await fitsWidth(page);
    });
  });
}

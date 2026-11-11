import { expect, type Page, test } from "@playwright/test";

const selected = (page: Page) =>
  page.getByRole("radiogroup", { name: "Units" }).getByRole("radio", { checked: true });

/** {@link openspec/specs/site-shell/spec.md#scenario-a-first-visit} */
test("a first visit selects inches", async ({ page }) => {
  await page.goto("/");
  await expect(selected(page)).toHaveText("in");
});

/** {@link openspec/specs/site-shell/spec.md#scenario-the-visitor-switches-to-centimetres-and-reloads} */
test("centimetres survive a reload and stay out of the URL", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "cm" }).click();
  await expect(selected(page)).toHaveText("cm");
  await page.reload();
  await expect(selected(page)).toHaveText("cm");
  expect(new URL(page.url()).search).toBe("");
  expect(page.url()).not.toMatch(/cm|unit/);
});

/** {@link openspec/specs/site-shell/spec.md#scenario-storage-is-unavailable} */
test("blocked storage keeps the choice for the page view", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    });
  });
  await page.goto("/");
  await page.getByRole("radio", { name: "cm" }).click();
  await expect(selected(page)).toHaveText("cm");
  expect(errors).toEqual([]);
});

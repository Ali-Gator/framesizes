import { expect, type Page, test } from "@playwright/test";

const PATH = "/frame-sizes-on-wall";

/** The answer paragraph's gap, written in both units. */
const gap = (page: Page) => page.locator("main p").filter({ hasText: "two-thirds" }).first();

/** {@link openspec/specs/site-shell/spec.md#scenario-dual-unit-text-follows-the-choice} */
test("dual-unit text shows the chosen unit only, and both stay in the HTML", async ({ page }) => {
  await page.goto(PATH);
  await page.waitForFunction(() => document.documentElement.dataset.wallReady === "true");
  const inches = gap(page).locator(".u-in", { hasText: "8 to 10 in" });
  const cm = gap(page).locator(".u-cm", { hasText: "20 to 25 cm" });
  await expect(inches).toBeVisible();
  await expect(cm).toBeHidden();
  await page.getByRole("radio", { name: "cm" }).click();
  await expect(cm).toBeVisible();
  await expect(inches).toBeHidden();
  await expect(inches).toHaveCount(1);
});

/**
 * Checked in the frame that follows DOMContentLoaded: stylesheets block rendering, so that frame
 * is styled, and it comes before the page is first painted with its content.
 * {@link openspec/specs/site-shell/spec.md#scenario-a-stored-centimetre-choice-is-applied-before-paint}
 */
test("a stored cm hides every inch length from the first paint", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("unit", "cm");
    document.addEventListener("DOMContentLoaded", () => {
      requestAnimationFrame(() => {
        const shown = (selector: string) =>
          [...document.querySelectorAll(selector)].filter(
            (el) => getComputedStyle(el).display !== "none",
          ).length;
        (window as unknown as { __first: object }).__first = {
          unit: document.documentElement.dataset.unit,
          inches: shown(".u-in"),
          cm: shown(".u-cm"),
        };
      });
    });
  });
  await page.goto(PATH);
  const first = await page.waitForFunction(
    () => (window as unknown as { __first?: object }).__first,
  );
  const found = (await first.jsonValue()) as { unit: string; inches: number; cm: number };
  expect(found.unit).toBe("cm");
  expect(found.inches).toBe(0);
  expect(found.cm).toBeGreaterThan(0);
});

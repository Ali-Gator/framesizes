import { expect, type Locator, type Page, test } from "@playwright/test";

const anatomy = (page: Page) => page.locator("ul:has([data-measure])");
const footer = (page: Page) => page.locator(".fs-widget-foot");
/** What the visitor sees: `innerText` leaves out elements that are not displayed. */
const shown = (locator: Locator) => locator.evaluate((el) => (el as HTMLElement).innerText);
/** An inch measurement, such as "13 × 16 in" or "¼ in". */
const INCH = /[\d¼½¾] in\b/;

/** Opens `/` with every script bundle held back: only the server HTML and inline scripts run. */
async function openBeforeBundles(page: Page, unit?: "cm") {
  let blocked = 0;
  await page.route("**/_next/static/**/*.js", (route) => {
    blocked++;
    return route.abort();
  });
  if (unit) await page.addInitScript((stored) => localStorage.setItem("unit", stored), unit);
  await page.goto("/");
  expect(blocked).toBeGreaterThan(0);
}

async function open(page: Page) {
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.dataset.chartReady === "true");
}

const selectCm = (page: Page) => page.getByRole("radio", { name: "cm" }).click();

/** {@link openspec/specs/site-shell/spec.md#scenario-a-stored-choice-at-load} */
test("a stored cm marks the root before any bundle runs", async ({ page }) => {
  await openBeforeBundles(page, "cm");
  await expect(page.locator("html")).toHaveAttribute("data-unit", "cm");
});

/** {@link openspec/specs/site-shell/spec.md#scenario-nothing-is-stored} */
test("with nothing stored the root says inches", async ({ page }) => {
  await openBeforeBundles(page);
  await expect(page.locator("html")).toHaveAttribute("data-unit", "in");
  await page.unrouteAll();
  await open(page);
  await expect(page.locator("html")).toHaveAttribute("data-unit", "in");
});

/** {@link openspec/specs/site-shell/spec.md#scenario-the-toggle-with-storage-blocked} */
test("with storage blocked the toggle still flips the root's unit", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    });
  });
  await open(page);
  await selectCm(page);
  await expect(page.locator("html")).toHaveAttribute("data-unit", "cm");
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-cm-line-follows-the-unit} */
test("the common sizes show their cm line only in cm", async ({ page }) => {
  await open(page);
  const fourth = page
    .getByRole("figure", { name: "The six most common frame sizes" })
    .locator("li")
    .nth(3);
  await expect(fourth).toContainText("11×14", { useInnerText: true });
  await expect(fourth).not.toContainText("27.9 × 35.6 cm", { useInnerText: true });
  await selectCm(page);
  await expect(fourth).toContainText("27.9 × 35.6 cm", { useInnerText: true });
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-four-measurements-in-centimetres} */
test("the anatomy example switches to centimetres", async ({ page }) => {
  await open(page);
  await selectCm(page);
  const measures = {
    "Outside size": "33 × 40.6 cm",
    "Frame size": "27.9 × 35.6 cm",
    "Mat opening": "19.1 × 24.1 cm",
    "Image size": "20.3 × 25.4 cm",
  };
  for (const [name, value] of Object.entries(measures)) {
    await expect(page.locator(`[data-measure="${name}"]`)).toContainText(value, {
      useInnerText: true,
    });
  }
  await expect(page.locator('[data-measure="Mat opening"]')).toContainText("0.6 cm smaller", {
    useInnerText: true,
  });
  expect(await shown(anatomy(page))).not.toMatch(INCH);
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-wall-height-follows-the-unit} */
test("the footer's wall height follows the unit", async ({ page }) => {
  await open(page);
  await expect(footer(page)).toContainText("8 ft", { useInnerText: true });
  await expect(footer(page)).not.toContainText("244 cm", { useInnerText: true });
  await selectCm(page);
  await expect(footer(page)).toContainText("244 cm", { useInnerText: true });
  await expect(footer(page)).not.toContainText("8 ft", { useInnerText: true });
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-stored-unit-at-load} */
test("a stored cm shows the static numbers in cm before any bundle runs", async ({ page }) => {
  await openBeforeBundles(page, "cm");
  expect(await shown(anatomy(page))).toContain("33 × 40.6 cm");
  expect(await shown(anatomy(page))).not.toMatch(INCH);
  expect(await shown(footer(page))).toContain("244 cm");
});

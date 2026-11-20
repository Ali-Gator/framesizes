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

/** The colours that draw a segmented option's checked look. */
const look = (option: Locator) =>
  option.evaluate((el) => {
    const style = getComputedStyle(el);
    return [style.backgroundColor, style.color, style.boxShadow].join(" | ");
  });

/** The checked and unchecked looks, read off the Orientation control: the same component, drawn by React. */
async function referenceLooks(page: Page) {
  const orientation = page.getByRole("radiogroup", { name: "Orientation" });
  return {
    checked: await look(orientation.getByRole("radio", { name: "Portrait" })),
    unchecked: await look(orientation.getByRole("radio", { name: "Landscape" })),
  };
}

/** {@link openspec/specs/site-shell/spec.md#scenario-a-stored-centimetre-choice-before-the-scripts-run} */
test("a stored cm gives the Units toggle its checked look before any bundle runs", async ({
  page,
}) => {
  await openBeforeBundles(page, "cm");
  const { checked, unchecked } = await referenceLooks(page);
  expect(checked).not.toBe(unchecked);
  const units = page.getByRole("radiogroup", { name: "Units" });
  expect(await look(units.getByRole("radio", { name: "cm" }))).toBe(checked);
  expect(await look(units.getByRole("radio", { name: "in" }))).toBe(unchecked);
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-table-with-centimetres-stored-before-the-scripts-run} */
test("a stored cm shows the table in cm before any bundle runs", async ({ page }) => {
  await openBeforeBundles(page, "cm");
  const row = page.locator('tbody tr:has(input[value="8x10"])');
  expect(await shown(row.locator("th"))).toBe("20.3 × 25.4 cm");
  expect(await shown(row.locator("td").first())).toBe("8 × 10 in");
  // The header's text, not `innerText`: the table's CSS sets headers in capitals.
  await expect(page.locator("thead th").nth(1).locator("span:visible")).toHaveText("Inches");
  // `innerText` of a row that is not rendered falls back to its text content, so skip hidden rows.
  const firstColumn = page.locator("tbody tr:not([hidden]) th");
  expect(await firstColumn.count()).toBeGreaterThan(0);
  for (const cell of await firstColumn.all()) expect(await shown(cell)).not.toMatch(INCH);
});

/** {@link openspec/specs/site-shell/spec.md#scenario-the-toggle-after-the-scripts-run} */
test("after the bundles run, the Units toggle's look and aria-checked agree", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("unit", "cm"));
  await open(page);
  const { checked, unchecked } = await referenceLooks(page);
  const units = page.getByRole("radiogroup", { name: "Units" });
  const cm = units.getByRole("radio", { name: "cm" });
  const inches = units.getByRole("radio", { name: "in" });
  await expect(cm).toHaveAttribute("aria-checked", "true");
  await expect(inches).toHaveAttribute("aria-checked", "false");
  expect(await look(cm)).toBe(checked);
  expect(await look(inches)).toBe(unchecked);
});

/** What each wall-view dimension label shows: SVG has no `innerText`, so skip undisplayed tspans. */
const dimLabels = (page: Page) =>
  page.locator(".fc-preview .dim-text").evaluateAll((els) =>
    els.map((el) =>
      [...el.childNodes]
        .filter((n) => !(n instanceof Element) || getComputedStyle(n).display !== "none")
        .map((n) => n.textContent)
        .join(""),
    ),
  );

/** The legend's main size, then its secondary size in the other unit. */
async function legendSizes(page: Page) {
  const size = page.locator(".fc-preview .fs-scale-size:visible");
  await expect(size).toHaveCount(1);
  return size.evaluate((el) => [
    [...el.childNodes]
      .filter((n) => n.nodeName !== "SPAN")
      .map((n) => n.textContent)
      .join(" "),
    el.querySelector("span")?.textContent,
  ]);
}

/** The reference sentence and the "Next size up" line, as the visitor sees them. */
async function previewLines(page: Page) {
  await expect(page.locator(".fc-preview .fs-scale-ghost")).toHaveCount(1);
  return shown(page.locator(".fc-preview .fs-scale-ref"));
}

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-preview-with-centimetres-stored-before-the-scripts-run} */
test("a stored cm shows the wall view in cm before any bundle runs", async ({ page }) => {
  await openBeforeBundles(page, "cm");
  expect(await dimLabels(page)).toEqual(["40.6 cm", "50.8 cm"]);
  expect(await legendSizes(page)).toEqual(["40.6 × 50.8 cm", "16 × 20 in"]);
  const lines = await previewLines(page);
  expect(lines).toContain("Next size up");
  expect(lines).toMatch(/\d cm\b/);
  expect(lines).not.toMatch(INCH);
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-preview-with-inches-stored-before-the-scripts-run} */
test("with nothing stored the wall view shows inches before any bundle runs", async ({ page }) => {
  await openBeforeBundles(page);
  expect(await dimLabels(page)).toEqual(["16 in", "20 in"]);
  const lines = await previewLines(page);
  expect(lines).toContain("Next size up");
  expect(lines).not.toMatch(/\bcm\b/);
});

import { expect, type Locator, type Page, test } from "@playwright/test";

const F2 = "/frame-sizes-on-wall";
const G1 = "/gallery-wall-planner";
const SIDES = ["Above", "Below", "Left", "Right"];
const MARKER = "data-unit-pending";

const f2Field = (page: Page, side: string) =>
  page.getByRole("region", { name: "Frame visualizer" }).getByLabel(side, { exact: true });
const g1 = (page: Page) => page.getByRole("region", { name: "Gallery wall layout generator" });

/** Opens `path` with every script bundle held back: only the server HTML and inline scripts run. */
async function openBeforeBundles(page: Page, path: string, unit?: "cm") {
  let blocked = 0;
  await page.route("**/_next/static/**/*.js", (route) => {
    blocked++;
    return route.abort();
  });
  if (unit) await page.addInitScript((stored) => localStorage.setItem("unit", stored), unit);
  await page.goto(path);
  expect(blocked).toBeGreaterThan(0);
}

/** A field holds digits in its server HTML, yet the visitor sees none: its text is fully transparent. */
async function expectNoDigitShown(input: Locator) {
  await expect(input).toHaveValue(/\d/);
  expect(await input.evaluate((el) => getComputedStyle(el).color)).toBe("rgba(0, 0, 0, 0)");
}

/** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-fields-before-the-scripts-run} */
test("F2's distance fields show no digit before any bundle runs, and keep their boxes", async ({
  page,
}) => {
  await openBeforeBundles(page, F2, "cm");
  const before = [];
  for (const side of SIDES) {
    await expectNoDigitShown(f2Field(page, side));
    before.push(await f2Field(page, side).boundingBox());
  }
  await page.unrouteAll();
  await page.goto(F2);
  await page.waitForFunction(() => document.documentElement.dataset.wallReady === "true");
  const after = [];
  for (const side of SIDES) after.push(await f2Field(page, side).boundingBox());
  expect(after).toEqual(before);
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-planners-fields-before-the-scripts-run} */
test("G1's gap and distance fields show no digit before any bundle runs", async ({ page }) => {
  await openBeforeBundles(page, G1, "cm");
  await expectNoDigitShown(g1(page).getByLabel("Gap between frames", { exact: true }));
  const fields = g1(page).locator(".wf-num input");
  expect(await fields.count()).toBeGreaterThan(0);
  for (const input of await fields.all()) {
    expect(await input.evaluate((el) => getComputedStyle(el).color)).toBe("rgba(0, 0, 0, 0)");
  }
});

/** {@link openspec/specs/site-shell/spec.md#scenario-the-marker-with-centimetres-stored} */
test("a stored cm marks the root as pending until the widget shows cm", async ({ page }) => {
  await openBeforeBundles(page, F2, "cm");
  await expect(page.locator("html")).toHaveAttribute(MARKER, "");
  await page.unrouteAll();
  await page.goto(F2);
  await page.waitForFunction(() => document.documentElement.dataset.wallReady === "true");
  await expect(page.locator("html")).not.toHaveAttribute(MARKER);
});

/** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-fields-after-hydration} */
test("after hydration F2's fields read the cm distances", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("unit", "cm"));
  await page.goto(F2);
  await page.waitForFunction(() => document.documentElement.dataset.wallReady === "true");
  await expect(page.locator("html")).not.toHaveAttribute(MARKER);
  const values = { Above: "81", Below: "20", Left: "160", Right: "160" };
  for (const [side, value] of Object.entries(values)) {
    await expect(f2Field(page, side)).toHaveValue(value);
    expect(await f2Field(page, side).evaluate((el) => getComputedStyle(el).color)).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
  }
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-planners-fields-after-hydration} */
test("after hydration G1's gap field reads 8", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("unit", "cm"));
  await page.goto(G1);
  await page.waitForFunction(() => document.documentElement.dataset.galleryReady === "true");
  await expect(page.locator("html")).not.toHaveAttribute(MARKER);
  const gap = g1(page).getByLabel("Gap between frames", { exact: true });
  await expect(gap).toHaveValue("8");
  expect(await gap.evaluate((el) => getComputedStyle(el).color)).not.toBe("rgba(0, 0, 0, 0)");
});

/** {@link openspec/specs/site-shell/spec.md#scenario-no-marker-with-inches} */
test("with nothing stored the root never carries the marker", async ({ page }) => {
  await openBeforeBundles(page, F2);
  await expect(page.locator("html")).not.toHaveAttribute(MARKER);
  await page.unrouteAll();
  await page.goto(F2);
  await page.waitForFunction(() => document.documentElement.dataset.wallReady === "true");
  await expect(page.locator("html")).not.toHaveAttribute(MARKER);
});

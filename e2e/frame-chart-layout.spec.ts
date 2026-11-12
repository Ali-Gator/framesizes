import { expect, type Page, test } from "@playwright/test";

const PHONE = { width: 390, height: 664 };
const SHORT_PHONE = { width: 375, height: 548 };
const DESKTOP = { width: 1280, height: 800 };

async function open(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForFunction(() => document.documentElement.dataset.chartReady === "true");
}

const rect = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
    });

async function scrollToLastRow(page: Page) {
  await page
    .locator("tbody tr:not([hidden])")
    .last()
    .evaluate((row) => row.scrollIntoView({ block: "end" }));
  await page.waitForTimeout(100);
}

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-first-screen-on-a-phone} */
test("a phone's first screen shows the h1, the answer and the widget title", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await open(page);
  for (const selector of ["main h1", "main h1 + p", ".fs-widget-title"]) {
    const box = await rect(page, selector);
    expect(box.top, selector).toBeGreaterThanOrEqual(0);
    expect(box.bottom, selector).toBeLessThanOrEqual(PHONE.height);
  }
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-desktop-screen} */
test("on a desktop screen the preview and the filters stay pinned", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await open(page);
  await scrollToLastRow(page);
  for (const selector of [".fc-preview figure", ".fc-filters"]) {
    const box = await rect(page, selector);
    expect(box.top, selector).toBeGreaterThanOrEqual(0);
    expect(box.bottom, selector).toBeLessThanOrEqual(DESKTOP.height);
  }
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-phone} */
test("on a phone the preview stays pinned in the upper half", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await open(page);
  await scrollToLastRow(page);
  const box = await rect(page, ".fc-preview figure");
  expect(box.top).toBeGreaterThanOrEqual(0);
  expect(box.bottom).toBeLessThanOrEqual(PHONE.height / 2);
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-short-phone} */
test("on a short phone the preview scrolls away", async ({ page }) => {
  await page.setViewportSize(SHORT_PHONE);
  await open(page);
  await scrollToLastRow(page);
  const box = await rect(page, ".fc-preview figure");
  expect(box.bottom).toBeLessThanOrEqual(0);
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-keyboard-focus-under-a-pinned-preview} */
test("a row focused by keyboard is never under the pinned preview", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await open(page);
  await page.locator("tbody input:checked").focus();
  const rows = await page.locator("tbody tr:not([hidden])").count();
  const start = await page
    .locator("tbody tr:not([hidden])")
    .evaluateAll((trs) => trs.findIndex((tr) => tr.querySelector("input:checked")));
  for (let i = start + 1; i < rows; i++) {
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(150);
    const [row, preview] = await Promise.all([
      page.locator("tbody tr:has(input:focus)").evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom };
      }),
      rect(page, ".fc-preview"),
    ]);
    expect(row.top, `row ${i}`).toBeGreaterThanOrEqual(preview.bottom - 1);
    expect(row.bottom, `row ${i}`).toBeLessThanOrEqual(PHONE.height + 1);
  }
});

/** Phone and desktop, the longest legend (cm, person) included, moving up and down. */
for (const { viewport, path, unit } of [
  { viewport: PHONE, path: "/?ref=person&size=24x36", unit: "cm" },
  { viewport: { width: 360, height: 640 }, path: "/?ref=door&size=24x36", unit: "cm" },
  { viewport: DESKTOP, path: "/", unit: "in" },
  { viewport: { width: 960, height: 800 }, path: "/", unit: "in" },
] as const) {
  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-keyboard-focus-under-a-pinned-preview} */
  test(`focused rows stay clear of the pinned block at ${viewport.width}×${viewport.height}, ${path}, ${unit}`, async ({
    page,
  }) => {
    await page.addInitScript((stored) => localStorage.setItem("unit", stored), unit);
    await page.setViewportSize(viewport);
    await open(page, path);
    const pinned = viewport.width >= 844 ? ".fc-filters" : ".fc-preview";
    if (viewport.width < 844) {
      await scrollToLastRow(page);
      expect((await rect(page, ".fc-preview figure")).bottom).toBeLessThanOrEqual(
        viewport.height / 2,
      );
    }
    await page.locator("tbody input:checked").focus();
    for (const key of ["ArrowUp", "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"]) {
      await page.keyboard.press(key);
      await page.waitForTimeout(150);
      const row = await page.locator("tbody tr:has(input:focus)").evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom };
      });
      const cover = await rect(page, pinned);
      expect(row.top, key).toBeGreaterThanOrEqual(Math.max(cover.bottom, 0) - 1);
      expect(row.bottom, key).toBeLessThanOrEqual(viewport.height + 1);
    }
  });
}

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-desktop-screen} */
test("the two columns and their pinning start together", async ({ page }) => {
  // Container 844px = viewport 948px (page and card padding): one column at 900, two at 960.
  await page.setViewportSize({ width: 900, height: 800 });
  await open(page);
  expect((await rect(page, ".fc-preview")).bottom).toBeLessThanOrEqual(
    (await rect(page, ".fc-controls")).top,
  );
  await page.setViewportSize({ width: 960, height: 800 });
  await scrollToLastRow(page);
  const [filters, preview] = await Promise.all([
    rect(page, ".fc-filters"),
    rect(page, ".fc-preview"),
  ]);
  expect(preview.right).toBeLessThanOrEqual(filters.left);
  expect(filters.top).toBeGreaterThanOrEqual(0);
  expect(preview.top).toBeGreaterThanOrEqual(0);
});

/** Cumulative layout shift from navigation, without input, once the widget is interactive. */
async function layoutShift(page: Page, path: string, unit?: "cm") {
  await page.addInitScript((stored) => {
    if (stored) localStorage.setItem("unit", stored);
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & {
        value: number;
        hadRecentInput: boolean;
      })[]) {
        if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  }, unit);
  await open(page, path);
  await page.waitForTimeout(500);
  return page.evaluate(() => (window as unknown as { __cls: number }).__cls);
}

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-plain-load} */
for (const viewport of [PHONE, DESKTOP]) {
  test(`a plain load shifts nothing at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    expect(await layoutShift(page, "/")).toBeLessThanOrEqual(0.1);
  });
}

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-load-that-restores-state} */
for (const viewport of [PHONE, DESKTOP]) {
  test(`restoring the URL state and the unit shifts nothing at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    expect(await layoutShift(page, "/?size=24x36&view=all", "cm")).toBeLessThanOrEqual(0.1);
  });
}

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-frames-are-in-proportion} */
test("the six frames are drawn at one scale", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await open(page);
  const size = (id: string) =>
    page.locator(`[data-frame="${id}"]`).evaluate((el) => {
      const shape = el as SVGGraphicsElement;
      const box = shape.getBBox();
      const scale = shape.getScreenCTM()?.a ?? 1;
      return { w: box.width * scale, h: box.height * scale };
    });
  const [small, large] = await Promise.all([size("4x6"), size("24x36")]);
  expect(Math.abs(large.w - 6 * small.w)).toBeLessThanOrEqual(1);
  expect(Math.abs(large.h - 6 * small.h)).toBeLessThanOrEqual(1);
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-drawings-in-the-default-state} */
test("three drawings, each with its own name, in every view", async ({ page }) => {
  await open(page);
  for (const path of ["/", "/?view=all"]) {
    await open(page, path);
    const names = await page
      .locator("main [role='img']")
      .evaluateAll((els) => els.map((el) => el.getAttribute("aria-label") ?? ""));
    expect(names, path).toHaveLength(3);
    expect(new Set(names).size, path).toBe(3);
    for (const name of names) expect(name, path).not.toBe("");
  }
});

import { expect, type Page, test } from "@playwright/test";

/** Waits until the widget has hydrated. */
async function open(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForFunction(() => document.documentElement.dataset.chartReady === "true");
}

type Box = { top: number; bottom: number; left: number; right: number };

const box = (page: Page, selector: string): Promise<Box> =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
    });

const stage = (page: Page) => box(page, ".fc-preview .fs-scale-stage");

async function scrollToLastRow(page: Page) {
  await page
    .locator("tbody tr:not([hidden])")
    .last()
    .evaluate((row) => row.scrollIntoView({ block: "end" }));
  await page.waitForTimeout(100);
}

/** Half a pixel of rounding either way. */
function expectInside(inner: Box, outer: Box, name: string) {
  const at = `${name} ${JSON.stringify(inner)} in ${JSON.stringify(outer)}`;
  expect(inner.top, at).toBeGreaterThanOrEqual(outer.top - 0.5);
  expect(inner.bottom, at).toBeLessThanOrEqual(outer.bottom + 0.5);
  expect(inner.left, at).toBeGreaterThanOrEqual(outer.left - 0.5);
  expect(inner.right, at).toBeLessThanOrEqual(outer.right + 0.5);
}

for (const viewport of [
  { width: 430, height: 932 },
  { width: 620, height: 800 },
]) {
  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-tall-frame-on-a-wide-phone} */
  test(`the 27x40 frame and its labels lie inside the stage at ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await open(page, "/?size=27x40");
    const outer = await stage(page);
    expectInside(await box(page, ".fc-preview .frame"), outer, "frame");
    const labels = await page.locator(".fc-preview .dim-text").evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { text: el.textContent, top: r.top, bottom: r.bottom, left: r.left, right: r.right };
      }),
    );
    expect(labels).toHaveLength(2);
    for (const { text, ...label } of labels) expectInside(label, outer, `label ${text}`);
  });
}

test.describe("at 620 × 800", () => {
  const viewport = { width: 620, height: 800 };
  test.use({ viewport });

  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-smallest-outline-on-a-wide-phone} */
  test("the 4x6 outline lies inside the stage", async ({ page }) => {
    await open(page, "/?view=all");
    expectInside(
      await box(page, '.fc-preview rect[data-size="4x6"]'),
      await stage(page),
      "4x6 outline",
    );
  });

  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-wide-phone-keeps-the-preview-in-the-upper-half} */
  test("the pinned preview stays in the upper half", async ({ page }) => {
    await open(page);
    await scrollToLastRow(page);
    const preview = await box(page, ".fc-preview");
    expect(preview.top).toBeGreaterThanOrEqual(0);
    expect(preview.bottom).toBeLessThanOrEqual(viewport.height / 2);
  });
});

// 620 × 600 caps the stage, so the clamp's cap term sets `scroll-margin-top` there.
for (const viewport of [
  { width: 620, height: 800 },
  { width: 620, height: 600 },
]) {
  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-keyboard-focus-on-a-wide-phone} */
  test(`each row the arrow keys reach is fully visible below the preview at ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await open(page);
    // Start with the selected row hidden under the pinned preview, so focusing it must scroll.
    await page
      .locator("tbody tr:has(input:checked)")
      .evaluate((row) => row.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(100);
    await page.locator("tbody input:checked").focus();
    const rows = page.locator("tbody tr:not([hidden])");
    const count = await rows.count();
    const start = await rows.evaluateAll((trs) =>
      trs.findIndex((tr) => tr.querySelector("input:checked")),
    );
    expect(start).toBeLessThan(count - 1);
    for (let i = start; i < count; i++) {
      if (i > start) await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(150);
      const [row, preview] = await Promise.all([
        box(page, "tbody tr:has(input:focus)"),
        box(page, ".fc-preview"),
      ]);
      expect(row.top, `row ${i}`).toBeGreaterThanOrEqual(preview.bottom - 1);
      expect(row.bottom, `row ${i}`).toBeLessThanOrEqual(viewport.height + 1);
    }
  });
}

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-narrow-phone-is-unchanged} */
test("the stage stays 184px tall at 390 × 664", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await open(page);
  const { top, bottom } = await stage(page);
  expect(Math.abs(bottom - top - 184)).toBeLessThanOrEqual(0.5);
});

/** {@link openspec/specs/frame-size-chart/spec.md#requirement-the-phone-preview-shows-the-whole-drawing} */
test("at 620 × 600 the capped stage keeps the ratio, centred, in the upper half", async ({
  page,
}) => {
  await page.setViewportSize({ width: 620, height: 600 });
  await open(page);
  await scrollToLastRow(page);
  const [outer, figure, preview] = await Promise.all([
    stage(page),
    box(page, ".fc-preview figure"),
    box(page, ".fc-preview"),
  ]);
  const width = outer.right - outer.left;
  expect(width).toBeLessThan(figure.right - figure.left - 1);
  expect(Math.abs((outer.bottom - outer.top) * (720 / 384) - width)).toBeLessThanOrEqual(1);
  expect(Math.abs(outer.left - figure.left - (figure.right - outer.right))).toBeLessThanOrEqual(1);
  expect(preview.top).toBeGreaterThanOrEqual(0);
  expect(preview.bottom).toBeLessThanOrEqual(300);
});

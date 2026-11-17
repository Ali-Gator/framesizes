import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const PATH = "/gallery-wall-planner";
const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

async function open(page: Page) {
  await page.goto(PATH);
  await page.waitForFunction(() => document.documentElement.dataset.galleryReady === "true");
}
const widget = (page: Page) => page.getByRole("region", { name: "Gallery wall layout generator" });

/** Widget controls smaller than 44 px either way; a segmented track's options count as the track. */
const smallControls = (page: Page) =>
  widget(page)
    .locator(
      "button, select, input:not([type=file]):not([type=radio]):not([type=checkbox]), .g-tpl",
    )
    .evaluateAll((els) =>
      els
        .filter((el) => el.getAttribute("role") !== "radio" && el.getClientRects().length > 0)
        .map((el) => {
          const box = el.getBoundingClientRect();
          return {
            name: el.getAttribute("aria-label") ?? el.textContent,
            w: box.width,
            h: box.height,
          };
        })
        .filter((c) => c.w < 44 || c.h < 44),
    );

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-first-screen-at-360} */
test("at 360 × 740 the h1, the answer and the top of the widget fit the first screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await open(page);
  const bottoms = await page.evaluate(() =>
    [
      document.querySelector("main h1"),
      [...document.querySelectorAll("main p")].find((p) => p.textContent?.includes("neighbours")),
      document.querySelector(".fs-widget-title"),
    ].map((el) => el?.getBoundingClientRect().bottom ?? Infinity),
  );
  for (const bottom of bottoms) expect(bottom).toBeLessThanOrEqual(740);
  const drawingTop = await widget(page)
    .locator(".wf-drawing")
    .evaluate((el) => el.getBoundingClientRect().top);
  expect(drawingTop).toBeLessThan(740);
});

test.describe("at 320 px", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#requirement-the-planner-fits-a-phone} */
  test("nothing scrolls sideways and every control is 44 px", async ({ page }) => {
    await open(page);
    for (const view of ["Layout", "Nail marks"]) {
      await widget(page).getByRole("radio", { name: view }).click();
      const width = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      }));
      expect(width.document, view).toBeLessThanOrEqual(width.viewport);
      expect(await smallControls(page), view).toEqual([]);
    }
  });

  /** {@link openspec/specs/site-shell/spec.md#scenario-a-narrow-phone} */
  test("the header keeps the lockup, the unit toggle and the menu button on one row", async ({
    page,
  }) => {
    await open(page);
    const tops = await page.evaluate(() => {
      const header = document.querySelector("header");
      const parts = [
        header?.querySelector('a[href="/"]'),
        header?.querySelector('[role="radiogroup"]'),
        header?.querySelector('button[aria-label="Menu"]'),
      ];
      return parts.map((el) => {
        const box = el?.getBoundingClientRect();
        return box ? Math.round(box.top + box.height / 2) : null;
      });
    });
    expect(tops).not.toContain(null);
    expect(Math.max(...(tops as number[])) - Math.min(...(tops as number[]))).toBeLessThanOrEqual(
      2,
    );
  });
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#requirement-the-planner-fits-a-phone} */
for (const viewport of [
  { width: 390, height: 844 },
  { width: 1280, height: 800 },
]) {
  test(`loading shifts nothing at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
        })[]) {
          if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await open(page);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBe(0);
  });
}

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-no-detectable-violations} */
test("axe finds no violations in the default, nails and warning states", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  const states: { name: string; reach: () => Promise<void> }[] = [
    { name: "default", reach: async () => {} },
    {
      name: "nails",
      reach: async () => {
        await widget(page).getByRole("radio", { name: "Nail marks" }).click();
        await widget(page).getByLabel("Drop", { exact: true }).fill("2");
        await expect(widget(page).getByRole("table")).toBeVisible();
      },
    },
    {
      name: "warning",
      reach: async () => {
        await widget(page).getByRole("radio", { name: "Layout" }).click();
        await widget(page).locator(".wf-hit").first().focus();
        for (let i = 0; i < 52; i++) await page.keyboard.press("Shift+ArrowRight");
        await expect(widget(page).getByRole("alert")).toBeVisible();
      },
    },
  ];
  for (const state of states) {
    await state.reach();
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
    expect(
      violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`),
      state.name,
    ).toEqual([]);
  }
});

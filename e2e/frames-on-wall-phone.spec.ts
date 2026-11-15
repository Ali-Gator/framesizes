import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const PATH = "/frame-sizes-on-wall";
const PHOTO = path.join(import.meta.dirname, "fixtures/wall-1200x900.png");
const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

async function open(page: Page) {
  await page.goto(PATH);
  await page.waitForFunction(() => document.documentElement.dataset.wallReady === "true");
}
const widget = (page: Page) => page.getByRole("region", { name: "Frame visualizer" });

/** Widget controls smaller than 44 px either way; a segmented track's options count as the track. */
const smallControls = (page: Page) =>
  widget(page)
    .locator("button, input:not([type=file]):not([type=radio]), .wf-opt")
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

/** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-first-screen-on-a-small-phone} */
test("at 360 × 740 the h1, the answer and the widget's title fit the first screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await open(page);
  const bottoms = await page.evaluate(() =>
    [
      document.querySelector("main h1"),
      [...document.querySelectorAll("main p")].find((p) => p.textContent?.includes("two-thirds")),
      document.querySelector(".fs-widget-title"),
    ].map((el) => el?.getBoundingClientRect().bottom ?? Infinity),
  );
  for (const bottom of bottoms) expect(bottom).toBeLessThanOrEqual(740);
});

test.describe("at 320 px", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-320-px-wide} */
  test("nothing scrolls sideways and every control is 44 px", async ({ page }) => {
    await open(page);
    const width = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(width.document).toBeLessThanOrEqual(width.viewport);
    expect(await smallControls(page)).toEqual([]);

    await widget(page).getByRole("button", { name: "Add a frame" }).click();
    expect(await smallControls(page)).toEqual([]);
    const track = await widget(page).getByRole("radiogroup", { name: "Orientation" }).boundingBox();
    expect(track?.height).toBeGreaterThanOrEqual(44);

    await widget(page).getByRole("button", { name: "Cancel" }).click();
    await widget(page).getByRole("button", { name: "Use my wall photo" }).click();
    await widget(page).locator('input[type="file"]').setInputFiles(PHOTO);
    expect(await smallControls(page)).toEqual([]);
    await widget(page).getByRole("button", { name: "Next", exact: true }).click();
    expect(await smallControls(page)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320,
    );
  });
});

/** {@link openspec/specs/frames-on-wall/spec.md#scenario-a-4x6-on-the-sample-room-at-360-px} */
test("a 4x6 at 360 px has a 44 px hit box and is picked from On the wall", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await open(page);
  await widget(page).getByRole("button", { name: "Add a frame" }).click();
  await widget(page).locator(".wf-picker").getByRole("button", { name: /^4x6 / }).click();
  await widget(page).getByRole("button", { name: "Add 4x6 to the wall" }).click();
  const hit = await widget(page)
    .getByRole("button", { name: "4x6 frame", exact: true })
    .boundingBox();
  expect(hit?.width).toBeGreaterThanOrEqual(44);
  expect(hit?.height).toBeGreaterThanOrEqual(44);
  await widget(page).getByRole("button", { name: "16x20", exact: true }).click();
  await widget(page).getByRole("button", { name: "4x6", exact: true }).click();
  await expect(
    widget(page).getByRole("button", { name: "4x6 frame", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

/** {@link openspec/specs/frames-on-wall/spec.md#scenario-no-layout-shift} */
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

/** Reaches each state of the widget, in order, from the sample room. */
const STATES: { name: string; reach: (page: Page) => Promise<void> }[] = [
  { name: "sample room", reach: async () => {} },
  {
    name: "size picker",
    reach: (page) => widget(page).getByRole("button", { name: "Add a frame" }).click(),
  },
  {
    name: "upload",
    reach: async (page) => {
      await widget(page).getByRole("button", { name: "Cancel" }).click();
      await widget(page).getByRole("button", { name: "Use my wall photo" }).click();
    },
  },
  {
    name: "scale step 1",
    reach: (page) => widget(page).locator('input[type="file"]').setInputFiles(PHOTO),
  },
  {
    name: "scale step 2",
    reach: (page) => widget(page).getByRole("button", { name: "Next", exact: true }).click(),
  },
  {
    name: "scale step 3",
    reach: (page) => widget(page).getByRole("button", { name: "Next", exact: true }).click(),
  },
  {
    name: "photo with a frame",
    reach: (page) => widget(page).getByRole("button", { name: "Set the scale" }).click(),
  },
  {
    name: "start over",
    reach: (page) => widget(page).getByRole("button", { name: "Start over" }).click(),
  },
  {
    name: "short mark",
    reach: async (page) => {
      await page.getByRole("button", { name: "Start over with this photo" }).click();
      await widget(page)
        .getByRole("radio", { name: /^A credit card/ })
        .check();
      await widget(page).getByRole("button", { name: "Next", exact: true }).click();
      await widget(page).getByRole("button", { name: "Next", exact: true }).click();
    },
  },
];

/** {@link openspec/specs/frames-on-wall/spec.md#scenario-no-violations-in-the-sample-room-and-the-photo-flow} */
test("axe finds no violations in any state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  for (const state of STATES) {
    await state.reach(page);
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
    expect(
      violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`),
      state.name,
    ).toEqual([]);
  }
});

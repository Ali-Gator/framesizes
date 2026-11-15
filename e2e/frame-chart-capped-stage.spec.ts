import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 800, height: 600 } });

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-labels-at-800--600} */
test("the drawings' labels render at 12px or more on a capped one-column stage", async ({
  page,
}) => {
  for (const path of ["/", "/?view=all"]) {
    await page.goto(path);
    await page.waitForFunction(() => document.documentElement.dataset.chartReady === "true");
    const sizes = await page.evaluate(() =>
      [...document.querySelectorAll("main .dim-text, main .cmp-label")].map((el) => ({
        text: el.textContent,
        px:
          parseFloat(getComputedStyle(el).fontSize) *
          ((el as SVGGraphicsElement).ownerSVGElement?.getScreenCTM()?.a ?? 0),
      })),
    );
    expect(sizes.length, path).toBeGreaterThan(0);
    for (const { text, px } of sizes) expect(px, `${path} ${text}`).toBeGreaterThanOrEqual(12);
  }
});

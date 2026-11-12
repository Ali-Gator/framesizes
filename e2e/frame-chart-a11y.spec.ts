import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

const STATES = [
  { name: "default", path: "/" },
  { name: "all sizes", path: "/?view=all" },
  { name: "centimetres", path: "/", unit: "cm" },
];

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-widget-states-are-checked} */
for (const viewport of [
  { width: 390, height: 664 },
  { width: 1280, height: 800 },
]) {
  for (const state of STATES) {
    test(`no WCAG 2.2 AA violations, ${state.name}, at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      if (state.unit) {
        await page.addInitScript((unit) => localStorage.setItem("unit", unit), state.unit);
      }
      await page.goto(state.path);
      await page.waitForFunction(() => document.documentElement.dataset.chartReady === "true");
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual(
        [],
      );
    });
  }
}

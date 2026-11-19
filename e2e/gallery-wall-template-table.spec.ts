import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 800 } });

for (const unit of ["in", "cm"] as const) {
  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-template-table-on-a-desktop-screen} */
  test(`the template table fits its column in ${unit}`, async ({ page }) => {
    await page.addInitScript((stored) => localStorage.setItem("unit", stored), unit);
    await page.goto("/gallery-wall-planner");
    await expect(page.locator("html")).toHaveAttribute("data-unit", unit);
    await page.evaluate(() => document.fonts.ready);
    const wrap = page.getByRole("region", { name: "Gallery wall layout with sizes" });
    const found = await wrap.evaluate((el) => {
      // What `var(--font-mono)` resolves to, read off a probe so the stack isn't copied here.
      const probe = document.createElement("span");
      probe.style.fontFamily = "var(--font-mono)";
      document.body.append(probe);
      const mono = getComputedStyle(probe).fontFamily;
      probe.remove();
      const fits = el.querySelector("tbody tr > td:last-child") as HTMLElement;
      return {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        mono,
        fits: getComputedStyle(fits).fontFamily,
        text: fits.innerText,
      };
    });
    expect(found.text).toMatch(new RegExp(`^about \\d+ ${unit} wide$`));
    expect(found.scrollWidth).toBeLessThanOrEqual(found.clientWidth);
    expect(found.mono).toMatch(/monospace/);
    expect(found.fits).toBe(found.mono);
  });
}

import { expect, test } from "@playwright/test";

/** {@link openspec/specs/site-shell/spec.md#scenario-the-home-page-is-opened} */
test("the home page renders inside the shell", async ({ page }) => {
  await page.goto("/");
  const banner = page.getByRole("banner");
  await expect(banner).toHaveCount(1);
  await expect(banner.getByRole("link", { name: "framesizes.app home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
});

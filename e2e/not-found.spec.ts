import { expect, test } from "@playwright/test";

/** {@link openspec/specs/site-shell/spec.md#scenario-a-visitor-opens-a-path-that-does-not-exist} */
test("an unknown path answers 404 inside the shell", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Frames" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Frame Sizes home" }),
  ).toBeVisible();
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
});

import { expect, test } from "@playwright/test";

/** {@link openspec/specs/site-shell/spec.md#scenario-the-system-prefers-dark} */
test.describe("dark system colour scheme", () => {
  test.use({ colorScheme: "dark" });

  test("the page keeps the light wall background", async ({ page }) => {
    await page.goto("/");
    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(background).toBe("rgb(243, 244, 239)");
  });
});

/** {@link openspec/specs/site-shell/spec.md#scenario-a-page-loads} */
test("body text is Schibsted Grotesk", async ({ page }) => {
  await page.goto("/");
  const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  // next/font renames the family (e.g. "Schibsted Grotesk", "Schibsted Grotesk Fallback").
  expect(family).toContain("Schibsted Grotesk");
  expect(await page.evaluate(() => document.fonts.check('16px "Schibsted Grotesk"'))).toBe(true);
});

/** {@link openspec/specs/site-shell/spec.md#scenario-a-page-loads} */
test("no request goes to a third-party font host", async ({ page }) => {
  const fontHosts: string[] = [];
  page.on("request", (request) => {
    const host = new URL(request.url()).hostname;
    if (host === "fonts.googleapis.com" || host === "fonts.gstatic.com") fontHosts.push(host);
  });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(fontHosts).toEqual([]);
});

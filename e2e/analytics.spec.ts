import { expect, type Page, test } from "@playwright/test";

/** The second Playwright web server: the same app built with a dummy analytics token. */
const ANALYTICS_URL = "http://localhost:3101";

const isIngest = (url: string) => new URL(url).pathname.startsWith("/ingest/");

/** Answers every analytics call locally, so nothing reaches PostHog. */
async function stubIngest(page: Page) {
  await page.route(
    (url) => isIngest(url.href),
    (route) => route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
}

/** Opens the page and waits for the first analytics event to be sent. */
async function visitWithAnalytics(page: Page) {
  const sent = page.waitForRequest((r) => isIngest(r.url()) && r.method() === "POST", {
    timeout: 15_000,
  });
  await page.goto(`${ANALYTICS_URL}/`);
  await sent;
}

test.describe("with analytics configured", () => {
  test.beforeEach(({ page }) => stubIngest(page));

  /** {@link openspec/specs/site-shell/spec.md#scenario-a-visit-sets-no-cookie} */
  test("a visit sets no cookie", async ({ page, context }) => {
    await visitWithAnalytics(page);
    expect(await context.cookies()).toEqual([]);
    expect(await page.evaluate(() => document.cookie)).toBe("");
  });

  /** {@link openspec/specs/site-shell/spec.md#scenario-analytics-stays-first-party} */
  test("every request stays on the site's own origin", async ({ page }) => {
    const hosts = new Set<string>();
    page.on("request", (r) => hosts.add(new URL(r.url()).host));
    await visitWithAnalytics(page);
    expect([...hosts]).toEqual([new URL(ANALYTICS_URL).host]);
    const stored = await page.evaluate(() => [
      ...Object.keys(localStorage),
      ...Object.keys(sessionStorage),
    ]);
    expect(stored.filter((key) => /ph_|posthog/i.test(key))).toEqual([]);
  });
});

/** {@link openspec/specs/site-shell/spec.md#scenario-analytics-is-not-configured} */
test("without a token no analytics request is sent and nothing is logged", async ({ page }) => {
  const ingest: string[] = [];
  const errors: string[] = [];
  page.on("request", (r) => {
    if (isIngest(r.url())) ingest.push(r.url());
  });
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(ingest).toEqual([]);
  expect(errors).toEqual([]);
});

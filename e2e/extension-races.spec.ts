import path from "node:path";

import { type BrowserContext, chromium, expect, type Page, test as base } from "@playwright/test";

/*
 * The saved wall's write races (BL-59) and the Wall select in the upload step (BL-56): a panel
 * closed before its 300 ms write, two pages edited at once, and back to the saved photo from
 * "Change photo".
 */
const DIST = path.resolve(import.meta.dirname, "../apps/extension/dist");
const PHOTO = path.resolve(import.meta.dirname, "fixtures/wall-1200x900.png");

const test = base.extend<{ context: BrowserContext; extensionId: string }>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext("", {
      channel: "chromium",
      args: [
        `--disable-extensions-except=${DIST}`,
        `--load-extension=${DIST}`,
        "--host-resolver-rules=MAP framesizes.app 127.0.0.1:9",
      ],
    });
    await context.route("https://framesizes.app/**", (route) =>
      route.fulfill({ contentType: "text/html", body: "<title>How to use it</title>" }),
    );
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker"));
    await use(new URL(worker.url()).host);
  },
});

async function open(context: BrowserContext, id: string, file: "sidepanel" | "tab") {
  const page = await context.newPage();
  await page.setViewportSize(
    file === "sidepanel" ? { width: 360, height: 800 } : { width: 1280, height: 800 },
  );
  await page.goto(`chrome-extension://${id}/${file}.html`);
  await page.waitForFunction(() => document.documentElement.dataset.galleryReady === "true");
  return page;
}
const planner = (page: Page) => page.locator("main .g");
const field = (page: Page, name: string) => planner(page).getByLabel(name, { exact: true });
const gap = (page: Page) => field(page, "Gap between frames");
const wallSelect = (page: Page) => page.getByRole("combobox", { name: "Wall" });

/** The stored gap, read in the page. */
const storedGap = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number | null>((resolve) => {
        const request = indexedDB.open("gallery-wall", 1);
        request.onsuccess = () => {
          const get = request.result.transaction("wall").objectStore("wall").get("current");
          get.onsuccess = () => {
            request.result.close();
            resolve(get.result?.planner?.gap ?? null);
          };
        };
      }),
  );

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-changed-layout-survives-a-reload} */
test("a panel closed inside 300 ms keeps its change", async ({ context, extensionId }) => {
  const panel = await open(context, extensionId, "sidepanel");
  await gap(panel).fill("2");
  await gap(panel).press("Enter");
  // Two frames for the change to render and queue its write, still well inside 300 ms.
  const waited = await panel.evaluate(() => {
    const start = performance.now();
    return new Promise<number>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now() - start))),
    );
  });
  expect(waited).toBeLessThan(300);
  // Closed before the 300 ms write, running unload events as a closing side panel does: the
  // flush on pagehide writes it.
  await panel.close({ runBeforeUnload: true });
  await expect.poll(() => panel.isClosed()).toBe(true);
  const again = await open(context, extensionId, "sidepanel");
  await expect(gap(again)).toHaveValue("2");
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-panel-and-the-tab-show-one-wall} */
test("the panel and the tab edited at once end on the same last write", async ({
  context,
  extensionId,
}) => {
  const panel = await open(context, extensionId, "sidepanel");
  const tab = await open(context, extensionId, "tab");
  await Promise.all([
    gap(panel)
      .fill("1")
      .then(() => gap(panel).press("Enter")),
    gap(tab)
      .fill("3")
      .then(() => gap(tab).press("Enter")),
  ]);
  // Both settle on what is stored, whichever write came last.
  await expect
    .poll(async () => {
      const [p, t, stored] = await Promise.all([
        gap(panel).inputValue(),
        gap(tab).inputValue(),
        storedGap(panel),
      ]);
      return p === t && String(stored) === p ? p : `${p}/${t}/${stored}`;
    })
    .toMatch(/^[13]$/);
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-back-to-the-saved-photo-from-the-upload-step} */
test("the Wall select reads New wall photo in the upload step and goes back", async ({
  context,
  extensionId,
}) => {
  const page = await open(context, extensionId, "sidepanel");
  await planner(page).getByRole("button", { name: "Use my wall photo" }).click();
  await expect(wallSelect(page)).toHaveValue("new");
  await expect(wallSelect(page).locator("option:checked")).toHaveText("New wall photo");
  await expect(wallSelect(page).locator('option[value="new"]')).toBeDisabled();
  await planner(page).locator('input[type="file"]').setInputFiles(PHOTO);
  await planner(page)
    .getByRole("radio", { name: /^A sofa/ })
    .check();
  await planner(page).getByRole("button", { name: "Next", exact: true }).click();
  await planner(page).getByRole("button", { name: "Next", exact: true }).click();
  await planner(page).getByRole("button", { name: "Set the scale" }).click();
  await expect(wallSelect(page)).toHaveValue("photo");
  await expect(page.getByText("Your wall is saved on this device")).toBeVisible();

  await planner(page).getByRole("button", { name: "Change photo" }).click();
  await expect(wallSelect(page)).toHaveValue("new");
  await wallSelect(page).selectOption("photo");
  await expect(planner(page).locator(".wf-drawing")).toHaveAccessibleName(
    "Gallery wall layout: five frames above a sofa on your wall photo",
  );
  await expect(field(page, "Below")).toHaveValue("8");
});

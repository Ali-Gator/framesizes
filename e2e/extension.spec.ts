import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { type BrowserContext, chromium, expect, type Page, test as base } from "@playwright/test";

/*
 * The Chrome extension, loaded unpacked from apps/extension/dist (the root `test:e2e` builds it
 * first) into a fresh persistent Chromium profile per test: a first install every time.
 */
const DIST = path.resolve(import.meta.dirname, "../apps/extension/dist");
const PHOTO = path.resolve(import.meta.dirname, "fixtures/wall-1200x900.png");
const HOW_TO = "https://framesizes.app/extensions/gallery-wall-layout-generator";
const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

/** A fresh profile with the extension, Chrome's interface in `lang` (ignored on macOS). */
async function launch(lang: string) {
  const context = await chromium.launchPersistentContext("", {
    // Full Chromium in new headless mode: the headless shell loads no extensions.
    channel: "chromium",
    // Linux Chromium may take its UI language from LANGUAGE as well as --lang.
    env: { ...process.env, LANGUAGE: lang },
    args: [
      `--disable-extensions-except=${DIST}`,
      `--load-extension=${DIST}`,
      // The install tab never reaches the live site, even before the route below is set.
      "--host-resolver-rules=MAP framesizes.app 127.0.0.1:9",
      `--lang=${lang}`,
    ],
  });
  await context.route("https://framesizes.app/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<title>How to use it</title>" }),
  );
  return context;
}

const test = base.extend<{ context: BrowserContext; extensionId: string }>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await launch("en-US");
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker"));
    await use(new URL(worker.url()).host);
  },
});

/** An extension page, once the planner has read the saved wall. */
async function open(context: BrowserContext, id: string, file: "sidepanel" | "tab", page?: Page) {
  const p = page ?? (await context.newPage());
  if (file === "sidepanel") await p.setViewportSize({ width: 360, height: 800 });
  else await p.setViewportSize({ width: 1280, height: 800 });
  await p.goto(`chrome-extension://${id}/${file}.html`);
  await p.waitForFunction(() => document.documentElement.dataset.galleryReady === "true");
  return p;
}
const planner = (page: Page) => page.locator("main .g");
const frames = (page: Page) => planner(page).locator(".wf-hit");
const field = (page: Page, name: string) => planner(page).getByLabel(name, { exact: true });
const wallSelect = (page: Page) => page.getByRole("combobox", { name: "Wall" });
const units = (page: Page) => page.getByRole("radiogroup", { name: "Units" });
/** The summary's size as shown in the visitor's unit. */
const summarySize = (page: Page) => planner(page).locator(".g-sum-i dd").first();

async function setField(page: Page, name: string, value: string) {
  await field(page, name).fill(value);
  await field(page, name).press("Enter");
}

/** The record IndexedDB holds, read in the page. */
const savedRecord = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<{ planner?: { gap?: number; template?: string }; photo?: unknown } | null>(
        (resolve) => {
          const request = indexedDB.open("gallery-wall", 1);
          request.onupgradeneeded = () => request.result.createObjectStore("wall");
          request.onsuccess = () => {
            const get = request.result.transaction("wall").objectStore("wall").get("current");
            get.onsuccess = () => resolve(get.result ?? null);
            get.onerror = () => resolve(null);
          };
          request.onerror = () => resolve(null);
        },
      ),
  );

/** Picks the fixture photo and sets the scale from the marked sofa. */
async function scaleFromSofa(page: Page) {
  await planner(page).getByRole("button", { name: "Use my wall photo" }).click();
  await planner(page).locator('input[type="file"]').setInputFiles(PHOTO);
  await planner(page)
    .getByRole("radio", { name: /^A sofa/ })
    .check();
  await planner(page).getByRole("button", { name: "Next", exact: true }).click();
  await planner(page).getByRole("button", { name: "Next", exact: true }).click();
  await planner(page).getByRole("button", { name: "Set the scale" }).click();
  await expect(planner(page).locator(".wf-drawing")).toHaveAccessibleName(
    "Gallery wall layout: five frames above a sofa on your wall photo",
  );
}

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-fresh-install-with-the-button-not-pinned} */
test("a first install opens one how-to tab with pinned=0", async ({ context, extensionId }) => {
  expect(extensionId).toMatch(/^[a-p]{32}$/);
  await expect
    .poll(() =>
      context
        .pages()
        .filter((p) => p.url().startsWith(HOW_TO))
        .map((p) => p.url()),
    )
    .toEqual([`${HOW_TO}?pinned=0`]);
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-fresh-install-in-another-language} */
base("a first install in Russian opens the Russian how-to", async () => {
  base.skip(process.platform === "darwin", "Chromium ignores --lang on macOS");
  const context = await launch("ru");
  try {
    const ru = "https://framesizes.app/ru/extensions/gallery-wall-layout-generator";
    await expect
      .poll(() =>
        context
          .pages()
          .map((p) => p.url())
          .filter((u) => u.startsWith("https://framesizes.app/")),
      )
      .toEqual([`${ru}?pinned=0`]);
  } finally {
    await context.close();
  }
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-the-panels-first-state} */
test("the panel opens on the default template in the sample room", async ({
  context,
  extensionId,
}) => {
  const page = await open(context, extensionId, "sidepanel");
  await expect(planner(page).locator(".g-tpl-cur")).toHaveText("One big, two on each side");
  await expect(summarySize(page)).toHaveText(/46 × 27 in/, { useInnerText: true });
  await expect(planner(page).locator(".g-sum-i dd").nth(1)).toHaveText(/69 in/, {
    useInnerText: true,
  });
  await expect(page.getByRole("heading", { name: "Gallery wall layout generator" })).toHaveCount(0);
  const width = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(width.document).toBeLessThanOrEqual(width.viewport);
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-the-toolbar-on-a-first-open} */
test("the toolbar opens on the sample room, inches and no saved line", async ({
  context,
  extensionId,
}) => {
  const page = await open(context, extensionId, "sidepanel");
  await expect(wallSelect(page)).toHaveValue("sample");
  await expect(wallSelect(page).locator("option:checked")).toHaveText("Sample room");
  await expect(units(page).getByRole("radio", { name: "in" })).toBeChecked();
  const full = page.getByRole("button", { name: "Open full size" });
  await expect(full).toBeVisible();
  for (const control of [wallSelect(page), units(page), full]) {
    expect((await control.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }
  await expect(page.getByText("Your wall is saved on this device")).toHaveCount(0);
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-changed-layout-survives-a-reload} */
test("a changed gap and a moved frame survive a reload", async ({ context, extensionId }) => {
  const page = await open(context, extensionId, "sidepanel");
  await setField(page, "Gap between frames", "2");
  await planner(page).getByRole("button", { name: "A · 8×10" }).click();
  const left = Number(await field(page, "Left").inputValue());
  await frames(page).first().focus();
  for (let i = 0; i < 4; i++) await page.keyboard.press("Shift+ArrowLeft");
  await expect(field(page, "Left")).toHaveValue(String(left - 4));
  await expect.poll(async () => (await savedRecord(page))?.planner?.gap).toBe(2);
  await page.waitForTimeout(500);
  await open(context, extensionId, "sidepanel", page);
  await expect(field(page, "Gap between frames")).toHaveValue("2");
  await planner(page).getByRole("button", { name: "A · 8×10" }).click();
  await expect(field(page, "Left")).toHaveValue(String(left - 4));
});

/**
 * {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-wall-photo-survives-a-reload}
 * {@link openspec/specs/gallery-wall-extension/spec.md#scenario-no-request-leaves-the-extension}
 */
test("a scaled wall photo survives a reload and no request leaves the extension", async ({
  context,
  extensionId,
}) => {
  const urls: string[] = [];
  const page = await context.newPage();
  page.on("request", (request) => urls.push(request.url()));
  await open(context, extensionId, "sidepanel", page);
  await scaleFromSofa(page);
  await expect(page.getByText("Your wall is saved on this device")).toBeVisible();
  await open(context, extensionId, "sidepanel", page);
  await expect(planner(page).locator(".wf-drawing")).toHaveAccessibleName(
    "Gallery wall layout: five frames above a sofa on your wall photo",
  );
  await expect(field(page, "Below")).toHaveValue("8");
  await expect(wallSelect(page)).toHaveValue("photo");
  await expect(page.getByText("Your wall is saved on this device")).toBeVisible();

  const tab = await context.newPage();
  tab.on("request", (request) => urls.push(request.url()));
  await open(context, extensionId, "tab", tab);
  await expect(planner(tab).locator(".wf-drawing")).toHaveAccessibleName(
    "Gallery wall layout: five frames above a sofa on your wall photo",
  );
  expect(urls.length).toBeGreaterThan(0);
  expect(urls.filter((url) => !/^(chrome-extension|blob):/.test(url))).toEqual([]);
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-opening-the-full-size-tab} */
test("Open full size opens the tab on the same wall, desktop layout", async ({
  context,
  extensionId,
}) => {
  const page = await open(context, extensionId, "sidepanel");
  await planner(page).getByRole("radio", { name: "Grid of nine", exact: true }).check();
  await expect.poll(async () => (await savedRecord(page))?.planner?.template).toBe("grid-of-nine");
  const [tab] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("button", { name: "Open full size" }).click(),
  ]);
  await tab.setViewportSize({ width: 1280, height: 800 });
  await tab.waitForLoadState();
  expect(tab.url()).toBe(`chrome-extension://${extensionId}/tab.html`);
  await expect(tab.getByRole("heading", { level: 1 })).toHaveText("Gallery Wall Layout Generator");
  await expect(frames(tab)).toHaveCount(9);
  expect(
    await frames(tab).evaluateAll((els) =>
      els.map((el) => el.getAttribute("aria-label")?.slice(6, 7)).join(""),
    ),
  ).toBe("ABCDEFGHI");
  const [main, side] = await Promise.all([
    planner(tab).locator(".g-main").boundingBox(),
    planner(tab).locator(".g-side").boundingBox(),
  ]);
  expect(side?.x ?? 0).toBeGreaterThan((main?.x ?? 0) + (main?.width ?? 0) - 1);
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-gap-set-in-the-tab-reaches-the-panel} */
test("a gap set in the tab reaches the open panel", async ({ context, extensionId }) => {
  const panel = await open(context, extensionId, "sidepanel");
  const tab = await open(context, extensionId, "tab");
  const before = await frames(panel).evaluateAll((els) =>
    els.map((el) => el.getAttribute("style")),
  );
  await setField(tab, "Gap between frames", "1");
  await expect(field(panel, "Gap between frames")).toHaveValue("1");
  expect(
    await frames(panel).evaluateAll((els) => els.map((el) => el.getAttribute("style"))),
  ).not.toEqual(before);
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-to-the-sample-room-and-back} */
test("the wall select goes to the sample room and back to the saved photo", async ({
  context,
  extensionId,
}) => {
  const page = await open(context, extensionId, "sidepanel");
  await scaleFromSofa(page);
  await expect.poll(async () => !!(await savedRecord(page))?.photo).toBe(true);
  await wallSelect(page).selectOption("sample");
  await expect(planner(page).locator(".wf-drawing")).toHaveAccessibleName(
    "Gallery wall layout: five frames above a sofa",
  );
  await wallSelect(page).selectOption("photo");
  await expect(planner(page).locator(".wf-drawing")).toHaveAccessibleName(
    "Gallery wall layout: five frames above a sofa on your wall photo",
  );
  await expect(field(page, "Below")).toHaveValue("8");
  await expect(planner(page).locator(".wf-caption")).toHaveText(/scaled from/);
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-no-photo-saved-yet} */
test("My wall photo with nothing saved opens the upload step", async ({ context, extensionId }) => {
  const page = await open(context, extensionId, "sidepanel");
  await wallSelect(page).selectOption("photo");
  await expect(planner(page).locator('input[type="file"]')).toHaveCount(1);
  await expect(
    planner(page).getByRole("button", { name: "Back to the sample room" }),
  ).toBeVisible();
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-centimetres-in-both-pages} */
test("cm picked in the panel shows in the tab and is kept", async ({ context, extensionId }) => {
  const panel = await open(context, extensionId, "sidepanel");
  const tab = await open(context, extensionId, "tab");
  await units(panel).getByRole("radio", { name: "cm" }).click();
  for (const page of [panel, tab]) {
    await expect(summarySize(page)).toHaveText(/117 × 69 cm/, { useInnerText: true });
  }
  await open(context, extensionId, "sidepanel", panel);
  await expect(units(panel).getByRole("radio", { name: "cm" })).toBeChecked();
  await expect(summarySize(panel)).toHaveText(/117 × 69 cm/, { useInnerText: true });
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-no-detectable-violations} */
test("axe finds nothing on the panel, its Nail marks and the tab", async ({
  context,
  extensionId,
}) => {
  const panel = await open(context, extensionId, "sidepanel");
  const tab = await open(context, extensionId, "tab");
  const check = async (page: Page, name: string) => {
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
    expect(
      violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`),
      name,
    ).toEqual([]);
  };
  await check(panel, "panel");
  await planner(panel).getByRole("radio", { name: "Nail marks" }).click();
  await expect(planner(panel).getByLabel("Hanger for")).toBeVisible();
  await check(panel, "panel nail marks");
  await check(tab, "tab");
});

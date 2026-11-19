import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { type BrowserContext, chromium, expect, type Page, test as base } from "@playwright/test";

/*
 * "Try on my wall" in the side panel. Playwright cannot click Chrome's context menu or get an
 * activeTab grant, so each test writes the try record the worker would write, then pings the
 * panel as the worker does, and drives the panel from there.
 */
const DIST = path.resolve(import.meta.dirname, "../apps/extension/dist");
const PHOTO = path.resolve(import.meta.dirname, "fixtures/wall-1200x900.png");
const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

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

type Found = { w: number; h: number; unit: "in" | "cm" | "mm"; label: string };
const inches = (w: number, h: number): Found => ({ w, h, unit: "in", label: `${w} × ${h} in` });
const THREE = [inches(12, 16), inches(18, 24), inches(24, 36)];

/** The side panel, once the planner has read the saved wall. */
async function openPanel(context: BrowserContext, id: string, page?: Page) {
  const p = page ?? (await context.newPage());
  await p.setViewportSize({ width: 360, height: 800 });
  await p.goto(`chrome-extension://${id}/sidepanel.html`);
  await p.waitForFunction(() => document.documentElement.dataset.galleryReady === "true");
  return p;
}

/** Writes the try record as the worker does, with a plain picture, and pings the panel. */
async function seedTry(page: Page, sizes: Found[], shape = { w: 300, h: 450 }) {
  await page.evaluate(
    async ({ sizes, shape }) => {
      const canvas = new OffscreenCanvas(shape.w, shape.h);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#2F4B5A";
        ctx.fillRect(0, 0, shape.w, shape.h);
      }
      const image = await canvas.convertToBlob({ type: "image/png" });
      await new Promise<void>((resolve, reject) => {
        const open = indexedDB.open("gallery-wall", 1);
        open.onupgradeneeded = () => open.result.createObjectStore("wall");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const tx = open.result.transaction("wall", "readwrite");
          const record = {
            v: 1,
            id: crypto.randomUUID(),
            image,
            title: "Abstract Sunset",
            host: "shop.example",
            sizes,
          };
          tx.objectStore("wall").put(record, "try");
          tx.oncomplete = () => {
            open.result.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      });
      const bus = new BroadcastChannel("gallery-wall");
      bus.postMessage({ from: "worker", try: true });
      bus.close();
    },
    { sizes, shape },
  );
  await expect(page.getByRole("heading", { name: "What size is it?" })).toBeVisible();
}

/** The keys IndexedDB holds, read in the page. */
const storedKeys = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<string[]>((resolve) => {
        const open = indexedDB.open("gallery-wall", 1);
        open.onsuccess = () => {
          const keys = open.result.transaction("wall").objectStore("wall").getAllKeys();
          keys.onsuccess = () => {
            open.result.close();
            resolve(keys.result.map(String).sort());
          };
        };
      }),
  );

const chips = (page: Page) => page.getByRole("group", { name: "Print size" });
const hangButton = (page: Page) => page.getByRole("button", { name: "Hang it on my wall" });
const distance = (page: Page, name: string) => page.getByLabel(name, { exact: true });
const planner = (page: Page) => page.locator("main .g");

async function hang(page: Page, sizes: Found[] = [inches(24, 36)]) {
  await seedTry(page, sizes);
  if (sizes.length > 1) await chips(page).getByRole("button", { name: "24 × 36 in" }).click();
  await hangButton(page).click();
  await expect(distance(page, "To the ceiling")).toBeVisible();
}

async function axe(page: Page, name: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
  expect(
    violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`),
    name,
  ).toEqual([]);
}

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-several-sizes-found} */
test("several sizes: nothing picked, the button waits and says why", async ({
  context,
  extensionId,
}) => {
  const page = await openPanel(context, extensionId);
  await seedTry(page, THREE);
  await expect(page.getByText("From shop.example")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Abstract Sunset" })).toBeVisible();
  for (const chip of await chips(page).getByRole("button").all()) {
    await expect(chip).toHaveAttribute("aria-pressed", "false");
    expect((await chip.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }
  await expect(hangButton(page)).toBeDisabled();
  await expect(hangButton(page)).toHaveAccessibleDescription(
    "Pick a size first: this page lists three.",
  );
  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-no-detectable-violations-in-the-try} */
  await axe(page, "size step");
  await chips(page).getByRole("button", { name: "24 × 36 in" }).click();
  await expect(chips(page).getByRole("button", { name: "24 × 36 in" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(hangButton(page)).toBeEnabled();
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-one-size-found} */
test("one size is picked and the button is ready", async ({ context, extensionId }) => {
  const page = await openPanel(context, extensionId);
  await seedTry(page, [inches(24, 36)]);
  await expect(chips(page).getByRole("button", { name: "24 × 36 in" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(hangButton(page)).toBeEnabled();
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-no-size-found} */
test("no size found opens the width and height fields", async ({ context, extensionId }) => {
  const page = await openPanel(context, extensionId);
  await seedTry(page, []);
  await expect(page.getByLabel("Width")).toBeVisible();
  await expect(hangButton(page)).toBeDisabled();
  await page.getByLabel("Width").fill("24");
  await expect(hangButton(page)).toBeDisabled();
  await page.getByLabel("Height").fill("36");
  await expect(hangButton(page)).toBeEnabled();
  await hangButton(page).click();
  await expect(distance(page, "To the ceiling")).toHaveValue("18");
});

/**
 * {@link openspec/specs/gallery-wall-extension/spec.md#scenario-unframed-in-the-sample-room}
 * {@link openspec/specs/gallery-wall-extension/spec.md#scenario-with-a-1-in-frame}
 * {@link openspec/specs/gallery-wall-extension/spec.md#scenario-the-tip-over-the-sample-sofa}
 * {@link openspec/specs/gallery-wall-extension/spec.md#scenario-setting-a-distance}
 * {@link openspec/specs/gallery-wall-extension/spec.md#scenario-no-request-leaves-the-extension}
 */
test("the print hangs at true size in the sample room, framed or not", async ({
  context,
  extensionId,
}) => {
  const urls: string[] = [];
  const page = await context.newPage();
  page.on("request", (request) => urls.push(request.url()));
  await openPanel(context, extensionId, page);
  await hang(page, THREE);
  const values = async () =>
    Promise.all(
      ["To the ceiling", "To the sofa", "From the left", "From the right"].map((name) =>
        distance(page, name).inputValue(),
      ),
    );
  expect(await values()).toEqual(["18", "8", "60", "60"]);
  await expect(page.locator(".wf-hit")).toHaveCount(1);
  await expect(page.locator(".wf-art-img")).toHaveCount(1);
  await expect(
    page.getByText(
      "Art about two-thirds of the sofa's width fills this wall: 56 in over the 84 in sofa.",
    ),
  ).toBeVisible();
  await axe(page, "hang view");

  await page.getByRole("radio", { name: "1 in frame" }).click();
  await expect(page.getByText("24 × 36 in · 26 × 38 framed")).toBeVisible();
  expect(await values()).toEqual(["16", "8", "59", "59"]);

  await page.getByRole("radio", { name: "Unframed" }).click();
  await distance(page, "To the sofa").fill("10");
  await distance(page, "To the sofa").press("Enter");
  await expect(distance(page, "To the ceiling")).toHaveValue("16");
  expect(urls.length).toBeGreaterThan(0);
  expect(urls.filter((url) => !/^(chrome-extension|blob):/.test(url))).toEqual([]);
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-landscape-picture} */
test("a landscape picture hangs its longer side across", async ({ context, extensionId }) => {
  const page = await openPanel(context, extensionId);
  await seedTry(page, [inches(24, 36)], { w: 450, h: 300 });
  await hangButton(page).click();
  // 36 wide on the 144 in wall: 54 in each side.
  await expect(distance(page, "From the left")).toHaveValue("54");
  await expect(distance(page, "To the ceiling")).toHaveValue("30");
  await expect(page.getByText("36 × 24 in · unframed")).toBeVisible();
});

/**
 * {@link openspec/specs/gallery-wall-extension/spec.md#scenario-adding-the-print}
 * {@link openspec/specs/gallery-wall-extension/spec.md#scenario-an-added-print-survives-a-reload}
 */
test("Add to my layout makes the print frame F, kept with its picture", async ({
  context,
  extensionId,
}) => {
  const page = await openPanel(context, extensionId);
  const before = await planner(page)
    .locator(".wf-hit")
    .evaluateAll((els) => els.map((el) => (el as HTMLElement).style.cssText));
  await hang(page);
  await page.getByRole("button", { name: "Add to my layout" }).click();
  await expect(planner(page).locator(".wf-hit")).toHaveCount(6);
  await expect(planner(page).getByRole("button", { name: "F · 24 × 36 in print" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const after = await planner(page)
    .locator(".wf-hit")
    .evaluateAll((els) => els.map((el) => (el as HTMLElement).style.cssText));
  expect(after.slice(0, 5)).toEqual(before);
  await expect(planner(page).locator(".wf-art-img")).toHaveCount(1);
  await expect.poll(() => storedKeys(page)).toEqual(["art:a1", "current"]);

  await openPanel(context, extensionId, page);
  await expect(planner(page).locator(".wf-hit")).toHaveCount(6);
  await expect(planner(page).getByRole("button", { name: "F · 24 × 36 in print" })).toBeVisible();
  await expect(planner(page).locator(".wf-art-img")).toHaveAttribute("src", /^blob:/);
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-an-added-print-survives-a-reload} */
test("a print added just before the panel closes keeps its picture", async ({
  context,
  extensionId,
}) => {
  const page = await openPanel(context, extensionId);
  await hang(page);
  await page.getByRole("button", { name: "Add to my layout" }).click();
  await expect(planner(page).locator(".wf-hit")).toHaveCount(6);
  // Closed inside the 300 ms write, as a side panel closes.
  await page.close({ runBeforeUnload: true });
  const again = await openPanel(context, extensionId);
  await expect(planner(again).getByRole("button", { name: "F · 24 × 36 in print" })).toBeVisible();
  await expect(planner(again).locator(".wf-art-img")).toHaveAttribute("src", /^blob:/);
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-going-back} */
test("Back to my layout leaves the print out", async ({ context, extensionId }) => {
  const page = await openPanel(context, extensionId);
  await hang(page);
  await page.getByRole("button", { name: "Back to my layout" }).click();
  await expect(planner(page).locator(".wf-hit")).toHaveCount(5);
  await expect.poll(() => storedKeys(page)).not.toContain("try");
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-full-layout} */
test("a full layout cannot take the print", async ({ context, extensionId }) => {
  const page = await openPanel(context, extensionId);
  for (let n = 5; n < 12; n++) {
    await planner(page).getByRole("button", { name: "Add a frame" }).click();
    await planner(page)
      .getByRole("button", { name: /^Add \d/ })
      .click();
  }
  await expect(planner(page).locator(".wf-hit")).toHaveCount(12);
  await hang(page);
  const add = page.getByRole("button", { name: "Add to my layout" });
  await expect(add).toBeDisabled();
  await expect(add).toHaveAccessibleDescription("That's 12 frames, the most the planner holds.");
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-trying-on-a-new-wall-photo} */
test("Use my wall photo runs G1's flow and hangs the print on the new photo", async ({
  context,
  extensionId,
}) => {
  const page = await openPanel(context, extensionId);
  await hang(page);
  await page.getByRole("button", { name: "Use my wall photo" }).click();
  await planner(page).locator('input[type="file"]').setInputFiles(PHOTO);
  await planner(page)
    .getByRole("radio", { name: /^A sofa/ })
    .check();
  await planner(page).getByRole("button", { name: "Next", exact: true }).click();
  await planner(page).getByRole("button", { name: "Next", exact: true }).click();
  await planner(page).getByRole("button", { name: "Set the scale" }).click();
  await expect(distance(page, "To the sofa")).toHaveValue("8");
  await expect(page.getByRole("combobox", { name: "Wall" })).toHaveValue("photo");
  await expect(page.getByRole("button", { name: "Use my wall photo" })).toHaveCount(0);
});

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-the-panel-closed-during-a-try} */
test("a reload during a try returns to its size step", async ({ context, extensionId }) => {
  const page = await openPanel(context, extensionId);
  await seedTry(page, THREE);
  await chips(page).getByRole("button", { name: "24 × 36 in" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "What size is it?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Abstract Sunset" })).toBeVisible();
  await expect(chips(page).getByRole("button")).toHaveCount(4);
});

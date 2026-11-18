import { expect, type Page, test } from "@playwright/test";

/*
 * G1's backlog fixes that came with the Chrome extension: the widget at 360 (BL-53, BL-54),
 * backing out of the upload (BL-48) and the whole group's size list (BL-52).
 */
const PATH = "/gallery-wall-planner";

async function open(page: Page) {
  await page.goto(PATH);
  await page.waitForFunction(() => document.documentElement.dataset.galleryReady === "true");
}
const widget = (page: Page) => page.getByRole("region", { name: "Gallery wall layout generator" });
const frames = (page: Page) => widget(page).locator(".wf-hit");

/** The Nail marks view with All frames on one nail, 2 in down. */
async function nailsWithDrop(page: Page) {
  await widget(page).getByRole("radio", { name: "Nail marks" }).click();
  await widget(page).getByLabel("Drop", { exact: true }).fill("2");
  await expect(widget(page).getByRole("table")).toBeVisible();
}

/** How far the nail table runs past its container, in px (0 or less: it fits). */
const tableOverflow = (page: Page) =>
  widget(page)
    .getByRole("table")
    .evaluate((table) => {
      const box = table.parentElement?.getBoundingClientRect();
      return table.getBoundingClientRect().width - (box?.width ?? 0);
    });

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-template-pictures-and-the-nail-table-at-360} */
test("at 360 the template pictures sit inside their buttons and the nail table fits", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await open(page);
  const outside = await widget(page)
    .locator(".g-tpl")
    .evaluateAll((buttons) =>
      buttons.flatMap((button) => {
        const style = getComputedStyle(button);
        const b = button.getBoundingClientRect();
        const pad = {
          left: b.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft),
          right: b.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight),
          top: b.top + parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop),
          bottom: b.bottom - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingBottom),
        };
        const t = button.querySelector(".g-thumb")?.getBoundingClientRect();
        const tiny = 0.5;
        const inside =
          t &&
          t.left >= pad.left - tiny &&
          t.right <= pad.right + tiny &&
          t.top >= pad.top - tiny &&
          t.bottom <= pad.bottom + tiny;
        return inside ? [] : [button.getAttribute("title")];
      }),
    );
  expect(outside).toEqual([]);
  await nailsWithDrop(page);
  expect(await tableOverflow(page)).toBeLessThanOrEqual(0.5);
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-nail-table-on-the-desktop} */
test("on the desktop the nail table fits its side column", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page);
  await nailsWithDrop(page);
  expect(await tableOverflow(page)).toBeLessThanOrEqual(0.5);
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-back-to-the-sample-room-before-picking-a-photo} */
test("backing out of the upload keeps a moved frame and an added one", async ({ page }) => {
  await open(page);
  await frames(page).first().focus();
  await frames(page).first().click();
  await page.keyboard.press("ArrowLeft");
  await widget(page).getByRole("button", { name: "Add a frame" }).click();
  await widget(page).locator(".wf-picker").getByRole("button", { name: /^Add / }).click();
  await expect(frames(page)).toHaveCount(6);
  const boxes = () =>
    frames(page).evaluateAll((els) =>
      els.map((el) => {
        // Relative to the stage: the page may scroll between the two reads.
        const o = el.closest(".wf-stage")?.getBoundingClientRect() ?? { x: 0, y: 0 };
        const b = el.getBoundingClientRect();
        return [b.x - o.x, b.y - o.y, b.width, b.height].map(Math.round);
      }),
    );
  const before = await boxes();
  await widget(page).getByRole("button", { name: "Use my wall photo" }).click();
  await widget(page).getByRole("button", { name: "Back to the sample room" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(frames(page)).toHaveCount(6);
  expect(await boxes()).toEqual(before);
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-changing-a-size-with-all-frames-selected} */
test("with the whole group selected, each size changes every frame of it", async ({ page }) => {
  await open(page);
  const list = widget(page).getByRole("list", { name: "Sizes in this layout" });
  await expect(list.getByRole("listitem")).toHaveText(
    [/18 × 24 in\s*Frame C\s*Change/, /8 × 10 in\s*Frames A, B, D and E\s*Change/],
    { useInnerText: true },
  );
  await list.getByRole("button", { name: "Change all four 8 × 10 in frames" }).click();
  await widget(page)
    .locator(".wf-picker")
    .getByRole("button", { name: /^11x14 / })
    .click();
  await widget(page).getByRole("button", { name: "Use 11x14" }).click();
  const names = await frames(page).evaluateAll((els) =>
    els.map((el) => el.getAttribute("aria-label")),
  );
  expect(names).toEqual([
    "Frame A, 11x14 picture frame",
    "Frame B, 11x14 picture frame",
    "Frame C, 18x24 picture frame",
    "Frame D, 11x14 picture frame",
    "Frame E, 11x14 picture frame",
  ]);
});

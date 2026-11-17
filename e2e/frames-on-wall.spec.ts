import path from "node:path";

import { expect, type Locator, type Page, type Request, test } from "@playwright/test";

const PATH = "/frame-sizes-on-wall";
const PHOTO = path.join(import.meta.dirname, "fixtures/wall-1200x900.png");
/** An inch length as the visitor reads it, such as "8 in" or "8¼ in". */
const INCH = /[\d¼½¾] in\b/;

async function open(page: Page, unit?: "cm") {
  if (unit) await page.addInitScript((stored) => localStorage.setItem("unit", stored), unit);
  await page.goto(PATH);
  await page.waitForFunction(() => document.documentElement.dataset.wallReady === "true");
}

const widget = (page: Page) => page.getByRole("region", { name: "Frame visualizer" });
const field = (page: Page, side: string) => widget(page).getByLabel(side, { exact: true });
const frameButton = (page: Page, size: string) =>
  widget(page).getByRole("button", { name: `${size} frame`, exact: true });
const live = (page: Page) => widget(page).locator('[aria-live="polite"]');

async function addFrame(page: Page, size: string) {
  await widget(page).getByRole("button", { name: "Add a frame" }).click();
  await widget(page)
    .locator(".wf-picker")
    .getByRole("button", { name: new RegExp(`^${size} `) })
    .click();
  await widget(page)
    .getByRole("button", { name: `Add ${size} to the wall` })
    .click();
}

/** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-sample-room-in-centimetres} */
test("the sample room in centimetres", async ({ page }) => {
  await open(page, "cm");
  await expect(field(page, "Below")).toHaveValue("20");
  await expect(field(page, "Above")).toHaveValue("81");
  await expect(field(page, "Left")).toHaveValue("160");
  await expect(field(page, "Right")).toHaveValue("160");
  expect(await page.locator("main").evaluate((el) => (el as HTMLElement).innerText)).not.toMatch(
    INCH,
  );
});

test.describe("setting a distance", () => {
  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-raising-the-sample-frame} */
  test("a typed distance moves the frame", async ({ page }) => {
    await open(page);
    await field(page, "Below").fill("10");
    await field(page, "Below").press("Enter");
    await expect(field(page, "Below")).toHaveValue("10");
    await expect(field(page, "Above")).toHaveValue("30");
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-a-fraction-is-typed} */
  test("a fraction is typed and the field is left", async ({ page }) => {
    await open(page);
    await field(page, "Below").fill("8 1/4");
    await field(page, "Below").blur();
    await expect(field(page, "Below")).toHaveValue("8¼");
    await field(page, "Below").fill("8½");
    await field(page, "Below").press("Enter");
    await expect(field(page, "Below")).toHaveValue("8½");
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-more-button} */
  test("the more button", async ({ page }) => {
    await open(page);
    await widget(page).getByRole("button", { name: "Below: ¼ in more" }).click();
    await expect(field(page, "Below")).toHaveValue("8¼");
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-text-that-is-not-a-length} */
  test("text that is not a length", async ({ page }) => {
    await open(page);
    await field(page, "Below").fill("abc");
    await field(page, "Below").press("Enter");
    await expect(field(page, "Below")).toHaveValue("8");
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-live-region-after-setting-a-distance} */
  test("the live region reads the change", async ({ page }) => {
    await open(page);
    await field(page, "Below").fill("10");
    await field(page, "Below").press("Enter");
    await expect(live(page)).toContainText("16x20");
    await expect(live(page)).toContainText("10 in below");
    await expect(live(page)).toContainText("30 in above");
  });
});

test.describe("adding and removing frames", () => {
  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-adding-an-11x14-in-the-sample-room} */
  test("an 11x14 goes 3 in right of the 16x20 and is selected", async ({ page }) => {
    await open(page);
    await widget(page).getByRole("button", { name: "Add a frame" }).click();
    await expect(widget(page).locator(".wf-ghost")).toBeVisible();
    await widget(page).getByRole("button", { name: "Add 11x14 to the wall" }).click();
    await expect(frameButton(page, "11x14")).toHaveAttribute("aria-pressed", "true");
    await expect(field(page, "Left")).toHaveValue("3");
    await expect(widget(page).locator('.wf-row[data-side="left"]')).toContainText(
      "to the 16x20 frame",
    );
    const centres = await widget(page)
      .locator(".wf-hit")
      .evaluateAll((els) =>
        els.map((el) => {
          const box = el.getBoundingClientRect();
          return box.top + box.height / 2;
        }),
      );
    expect(Math.abs((centres[0] ?? 0) - (centres[1] ?? 0))).toBeLessThan(1);
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-seventh-frame} */
  test("six frames at most", async ({ page }) => {
    await open(page);
    for (let i = 0; i < 5; i++) await addFrame(page, "4x6");
    await expect(widget(page).locator(".wf-hit")).toHaveCount(6);
    await expect(widget(page).getByRole("button", { name: "Add a frame" })).toHaveCount(0);
    await expect(widget(page)).toContainText("6 frames, the most this page holds");
    expect(
      await widget(page)
        .locator("a[href]")
        .evaluateAll((as) => as.map((a) => a.getAttribute("href"))),
    ).toEqual(["/gallery-wall-planner"]);
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-nudging-with-the-keyboard} */
  test("arrow keys nudge the focused frame", async ({ page }) => {
    await open(page);
    await frameButton(page, "16x20").focus();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(field(page, "Below")).toHaveValue("8½");
    await expect(frameButton(page, "16x20")).toHaveAttribute("aria-pressed", "true");
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-removing-a-frame} */
  test("Delete removes the focused frame", async ({ page }) => {
    await open(page);
    await addFrame(page, "11x14");
    await frameButton(page, "11x14").focus();
    await page.keyboard.press("Delete");
    await expect(widget(page).locator(".wf-hit")).toHaveCount(1);
    await expect(frameButton(page, "11x14")).toHaveCount(0);
  });
});

test.describe("dragging", () => {
  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-a-drag-snaps-to-the-sofas-centre} */
  test("a drag near the sofa's centre snaps to it and shows the line", async ({ page }) => {
    await open(page);
    const frame = frameButton(page, "16x20");
    const box = await frame.boundingBox();
    const stage = await widget(page).locator(".wf-stage").boundingBox();
    if (!box || !stage) throw new Error("no layout");
    const perInch = stage.width / 144;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 30, y);
    // 0.4 in off the sofa's centre, 6 in higher.
    await page.mouse.move(x + 0.4 * perInch, y - 6 * perInch, { steps: 4 });
    await expect(widget(page).locator(".wf-guide-v")).toBeVisible();
    await page.mouse.up();
    await expect(widget(page).locator(".wf-guide-v")).toHaveCount(0);
    await expect(field(page, "Left")).toHaveValue("63");
    await expect(field(page, "Right")).toHaveValue("63");
    await expect(field(page, "Below")).not.toHaveValue("8");
    await expect(live(page)).toContainText("16x20");
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-a-tap-selects} */
  test("a tap selects a frame", async ({ page }) => {
    await open(page);
    await addFrame(page, "11x14");
    await frameButton(page, "16x20").click();
    await expect(frameButton(page, "16x20")).toHaveAttribute("aria-pressed", "true");
    await expect(field(page, "Below")).toHaveValue("8");
  });
});

/** Goes from the sample room to step 1 with the fixture photo. */
async function pickPhoto(page: Page) {
  await widget(page).getByRole("button", { name: "Use my wall photo" }).click();
  await widget(page).locator('input[type="file"]').setInputFiles(PHOTO);
  await expect(widget(page).getByText("Set the scale · 1 of 3")).toBeVisible();
}
const next = (page: Page) => widget(page).getByRole("button", { name: "Next", exact: true });
const known = (page: Page, name: string): Locator =>
  widget(page).getByRole("radio", { name: new RegExp(`^${name}`) });

test.describe("the wall photo", () => {
  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-door-by-default} */
  test("step 1 lists the seven known things with the door picked", async ({ page }) => {
    await open(page);
    await pickPhoto(page);
    const names = await widget(page)
      .locator(".wf-opt-name")
      .evaluateAll((els) => els.map((el) => el.textContent));
    expect(names).toEqual([
      "The wall",
      "A door",
      "A sofa",
      "A bed",
      "A Letter sheet",
      "An A4 sheet",
      "A credit card",
    ]);
    await expect(known(page, "A door")).toBeChecked();
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-moving-a-handle-by-keyboard} */
  test("a handle moves 10 px with Shift and an arrow", async ({ page }) => {
    await open(page);
    await pickPhoto(page);
    await next(page).click();
    await expect(widget(page).getByText("Your mark: 640 px")).toBeVisible();
    await widget(page).getByRole("button", { name: "Top end of the mark" }).focus();
    await expect(widget(page).locator(".wf-loupe")).toBeVisible();
    await page.keyboard.press("Shift+ArrowDown");
    await expect(widget(page).getByText("Your mark: 630 px")).toBeVisible();
    await widget(page).getByRole("button", { name: "Back", exact: true }).first().click();
    await expect(widget(page).getByText("Set the scale · 1 of 3")).toBeVisible();
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-doors-default-in-centimetres} */
  test("the door starts at 200 cm", async ({ page }) => {
    await open(page, "cm");
    await pickPhoto(page);
    await next(page).click();
    await next(page).click();
    await expect(widget(page).getByText("Set the scale · 3 of 3")).toBeVisible();
    await expect(widget(page).getByLabel("Door height")).toHaveValue("200");
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-wall-has-no-default} */
  test("the wall has no default", async ({ page }) => {
    await open(page);
    await pickPhoto(page);
    await known(page, "The wall").check();
    await next(page).click();
    await next(page).click();
    await expect(widget(page).getByLabel("Wall width")).toHaveValue("");
    await widget(page).getByRole("button", { name: "Set the scale" }).click();
    await expect(widget(page).getByText("Enter the wall's width to set the scale.")).toBeVisible();
    await expect(widget(page).getByText("Set the scale · 3 of 3")).toBeVisible();
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-a-credit-card-on-a-wide-photo} */
  test("a credit card mark is too short to trust", async ({ page }) => {
    await open(page);
    await pickPhoto(page);
    await known(page, "A credit card").check();
    await next(page).click();
    await next(page).click();
    const warning = widget(page).getByRole("alert");
    await expect(warning).toContainText("This mark is too short to trust");
    await expect(warning).toContainText("27 px");
    await expect(warning).toContainText("up to 15%");
    await expect(widget(page).getByRole("button", { name: "Mark something longer" })).toBeVisible();
    await expect(widget(page).getByRole("button", { name: "Use it anyway" })).toBeVisible();
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-a-fixed-length} */
  test("an A4 sheet shows its fixed length and no field", async ({ page }) => {
    await open(page);
    await pickPhoto(page);
    await known(page, "An A4 sheet").check();
    await next(page).click();
    await next(page).click();
    await widget(page).getByRole("button", { name: "Use it anyway" }).click();
    await expect(widget(page).getByText("An A4 sheet is 297 mm on its long edge.")).toBeVisible();
    await expect(widget(page).getByRole("textbox")).toHaveCount(0);
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-distances-before-and-after-the-floor} */
  test("Below runs to the floor once it is marked", async ({ page }) => {
    await open(page);
    await pickPhoto(page);
    await next(page).click();
    await next(page).click();
    await widget(page).getByRole("button", { name: "Set the scale" }).click();
    await expect(
      widget(page).getByRole("img", { name: /^Your wall photo with a 16x20/ }),
    ).toBeVisible();
    await expect(field(page, "Below")).toHaveCount(0);
    await expect(widget(page).locator('.wf-row[data-side="below"]')).toContainText("—");
    await widget(page).getByRole("button", { name: "Mark the floor" }).click();
    await expect(field(page, "Below")).toHaveValue(/\d/);
    await expect(widget(page).getByText(/^Centre:/)).toBeVisible();
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-cancel-keeps-everything} */
  test("Start over: Cancel keeps everything, then start over with the photo", async ({ page }) => {
    await open(page);
    await pickPhoto(page);
    await next(page).click();
    await next(page).click();
    await widget(page).getByRole("button", { name: "Set the scale" }).click();
    await widget(page).getByRole("button", { name: "Mark the floor" }).click();
    const below = await field(page, "Below").inputValue();
    await widget(page).getByRole("button", { name: "Start over" }).click();
    const dialog = page.getByRole("dialog", { name: "Start over?" });
    await expect(dialog).toContainText("takes the frames off the wall and clears the scale");
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(frameButton(page, "16x20")).toBeVisible();
    await expect(field(page, "Below")).toHaveValue(below);
    await widget(page).getByRole("button", { name: "Start over" }).click();
    await dialog.getByRole("button", { name: "Start over with this photo" }).click();
    await expect(widget(page).getByText("Set the scale · 1 of 3")).toBeVisible();
    await widget(page).getByRole("button", { name: "Back", exact: true }).click();
    await widget(page).getByRole("button", { name: "Back to the sample room" }).click();
    await expect(widget(page).getByRole("img", { name: /^Sample room/ })).toBeVisible();
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-no-request-carries-the-photo} */
  test("no request carries the photo", async ({ page }) => {
    await open(page);
    const sent: Request[] = [];
    page.on("request", (request) => {
      if (/^https?:/.test(request.url())) sent.push(request);
    });
    await pickPhoto(page);
    await known(page, "A sofa").check();
    await next(page).click();
    await next(page).click();
    await widget(page).getByRole("button", { name: "Set the scale" }).click();
    await widget(page).getByRole("button", { name: "Mark the floor" }).click();
    await addFrame(page, "11x14");
    for (const request of sent) {
      const body = request.postDataBuffer();
      const type = (await request.allHeaders())["content-type"] ?? "";
      expect(type, request.url()).not.toMatch(/^image\/|multipart\//);
      expect(body?.length ?? 0, request.url()).toBeLessThanOrEqual(10 * 1024);
      expect(request.url()).not.toMatch(/blob:|data:|wall-1200x900/);
      expect(body?.toString("latin1") ?? "").not.toContain("wall-1200x900");
    }
  });
});

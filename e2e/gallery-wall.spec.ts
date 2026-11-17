import path from "node:path";

import { expect, type Page, type Request, test } from "@playwright/test";

const PATH = "/gallery-wall-planner";
const PHOTO = path.join(import.meta.dirname, "fixtures/wall-1200x900.png");

async function open(page: Page, unit?: "cm") {
  if (unit) await page.addInitScript((stored) => localStorage.setItem("unit", stored), unit);
  await page.goto(PATH);
  await page.waitForFunction(() => document.documentElement.dataset.galleryReady === "true");
}

const widget = (page: Page) => page.getByRole("region", { name: "Gallery wall layout generator" });
const field = (page: Page, name: string) => widget(page).getByLabel(name, { exact: true });
const template = (page: Page, name: string) =>
  widget(page).getByRole("radio", { name, exact: true });
const chip = (page: Page, name: string) =>
  widget(page).locator(".wf-chips").getByRole("button", { name, exact: true });
const frames = (page: Page) => widget(page).locator(".wf-hit");
const summary = (page: Page, label: string) =>
  widget(page).locator(".g-sum-i").filter({ hasText: label }).locator("dd");
const nailRows = (page: Page) =>
  widget(page)
    .locator("tbody tr")
    .evaluateAll((rows) =>
      rows.map((r) => [...r.children].map((c) => c.textContent?.trim()).join(" ")),
    );

async function setField(page: Page, name: string, value: string) {
  await field(page, name).fill(value);
  await field(page, name).press("Enter");
}

test.describe("templates", () => {
  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-switching-with-nothing-changed} */
  test("a template switches at once when nothing changed", async ({ page }) => {
    await open(page);
    await template(page, "Grid of nine").click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(frames(page)).toHaveCount(9);
    await expect(widget(page).locator(".wf-drawing")).toHaveAccessibleName(
      "Gallery wall layout: nine frames above a sofa",
    );
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-switching-after-a-change-asks-first} */
  test("after a move, switching asks first and Cancel keeps the frames", async ({ page }) => {
    await open(page);
    await chip(page, "A · 8×10").click();
    await frames(page).first().press("ArrowLeft");
    await template(page, "Row of three").click();
    const dialog = page.getByRole("dialog", { name: "Switch to Row of three?" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(frames(page)).toHaveCount(5);
    await expect(template(page, "One big, two on each side")).toBeChecked();
    await template(page, "Row of three").click();
    await dialog.getByRole("button", { name: "Switch template" }).click();
    await expect(frames(page)).toHaveCount(3);
  });
});

test.describe("the gap", () => {
  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-a-2-inch-gap-in-the-planner} */
  test("a 2 in gap spaces Row of three", async ({ page }) => {
    await open(page);
    await template(page, "Row of three").click();
    await setField(page, "Gap between frames", "2");
    await chip(page, "A · 11×14").click();
    await expect(field(page, "Left")).toHaveValue("50½");
    await chip(page, "B · 11×14").click();
    await expect(field(page, "Left")).toHaveValue("2");
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-a-gap-out-of-range} */
  test("a gap out of range keeps the gap and says the range", async ({ page }) => {
    await open(page);
    for (const text of ["13", "-1", "wide"]) {
      await setField(page, "Gap between frames", text);
      await expect(widget(page).getByRole("alert")).toHaveText("Type a gap from 0 to 12 in.");
      await expect(field(page, "Gap between frames")).toHaveValue("3");
    }
    await expect(summary(page, "Size")).toContainText("46 × 27 in");
  });
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-changing-every-8x10-at-once} */
test("changing frame A to 5x7 changes every 8x10", async ({ page }) => {
  await open(page);
  await chip(page, "A · 8×10").click();
  await widget(page).getByRole("button", { name: "Change size" }).click();
  await widget(page).getByRole("radio", { name: "Portrait" }).click();
  await widget(page).locator(".wf-picker").getByRole("button", { name: /^5x7 / }).click();
  await expect(widget(page).getByLabel("Also the other 3 8×10 frames")).toBeChecked();
  await widget(page).getByRole("button", { name: "Use 5x7" }).click();
  await expect(widget(page).locator(".wf-chips .wf-chip")).toHaveText([
    "All 5",
    "A · 5×7",
    "B · 5×7",
    "C · 18×24",
    "D · 5×7",
    "E · 5×7",
  ]);
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-hanging-the-group-higher} */
test("the group hangs 10 in above the sofa", async ({ page }) => {
  await open(page);
  await setField(page, "Below", "10");
  await expect(summary(page, "Top edge")).toContainText("71 in");
  await expect(field(page, "Above")).toHaveValue("25");
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-twelfth-frame} */
test("frames are added up to twelve", async ({ page }) => {
  await open(page);
  await template(page, "Grid of nine").click();
  for (let i = 0; i < 3; i++) {
    await widget(page).getByRole("button", { name: "Add a frame" }).click();
    await widget(page).getByRole("button", { name: "Add 11x14" }).click();
  }
  await expect(frames(page)).toHaveCount(12);
  await expect(widget(page).getByRole("button", { name: "Add a frame" })).toHaveCount(0);
  await expect(widget(page)).toContainText("That's 12 frames, the most the planner holds.");
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-past-the-right-edge} */
test("a group past the right edge is flagged and centred", async ({ page }) => {
  await open(page);
  await frames(page).first().focus();
  await frames(page).first().press("Shift+ArrowRight", { delay: 0 });
  for (let i = 1; i < 52; i++) await page.keyboard.press("Shift+ArrowRight");
  const alert = widget(page).getByRole("alert");
  await expect(alert).toContainText("The group runs past the wall's right edge");
  await expect(alert).toContainText("By 3 in.");
  await expect(summary(page, "Left · right")).toContainText("101 · −3 in");
  await alert.getByRole("button", { name: "Centre it on the wall" }).click();
  await expect(summary(page, "Left · right")).toContainText("49 · 49 in");
  await expect(widget(page).getByRole("alert")).toHaveCount(0);
});

test.describe("nail marks", () => {
  /**
   * {@link openspec/specs/gallery-wall-planner/spec.md#scenario-no-drop-yet}
   * {@link openspec/specs/gallery-wall-planner/spec.md#scenario-one-nail-with-a-2-inch-drop}
   * {@link openspec/specs/gallery-wall-planner/spec.md#scenario-a-drop-longer-than-the-frame}
   */
  test("no drop, then a 2 in drop, then frame B's own 13 in drop", async ({ page }) => {
    await open(page);
    await widget(page).getByRole("radio", { name: "Nail marks" }).click();
    await expect(widget(page)).toContainText("Type the drop to number the nails.");
    await expect(widget(page).getByRole("table")).toHaveCount(0);
    await field(page, "Drop").fill("2");
    await expect
      .poll(() => nailRows(page))
      .toEqual([
        "1 A 5 in 2 in 67 in",
        "2 C 23 in 2½ in 66½ in",
        "3 D 41 in 2 in 67 in",
        "4 B 5 in 17 in 52 in",
        "5 E 41 in 17 in 52 in",
      ]);
    await widget(page).getByLabel("Hanger for").selectOption({ label: "Frame B · 8×10" });
    await field(page, "Drop").fill("13");
    await expect(widget(page)).toContainText(
      "B: the drop has to be under 12 in, the frame's height on the wall.",
    );
    await expect(field(page, "Drop")).toHaveAttribute("aria-invalid", "true");
    await expect
      .poll(async () => (await nailRows(page)).map((r) => r.split(" ")[1]))
      .toEqual(["A", "C", "D", "E"]);
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-next-frame-starts-on-d-rings} */
  test("the hanger type carries over to the next frame", async ({ page }) => {
    await open(page);
    await widget(page).getByRole("radio", { name: "Nail marks" }).click();
    await field(page, "Drop").fill("2");
    const before = await nailRows(page);
    await widget(page).getByLabel("Hanger for").selectOption({ label: "Frame C · 18×24" });
    await widget(page).getByRole("radio", { name: "Two D-rings" }).click();
    await field(page, "Drop").fill("3");
    await field(page, "Inset").fill("4");
    await widget(page).getByLabel("Hanger for").selectOption({ label: "Frame D · 8×10" });
    await expect(widget(page).getByRole("radio", { name: "Two D-rings" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(field(page, "Drop")).toHaveValue("");
    await expect(field(page, "Inset")).toHaveValue("");
    const after = await nailRows(page);
    expect(
      after
        .find((r) => r.split(" ")[1] === "D")
        ?.split(" ")
        .slice(1),
    ).toEqual(
      before
        .find((r) => r.split(" ")[1] === "D")
        ?.split(" ")
        .slice(1),
    );
  });
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-default-group-in-centimetres} */
test("the default group in centimetres", async ({ page }) => {
  await open(page, "cm");
  await expect(summary(page, "Size")).toHaveText("117 × 69 cm", { useInnerText: true });
  await expect(field(page, "Gap between frames")).toHaveValue("8");
  await widget(page).getByRole("radio", { name: "Nail marks" }).click();
  await field(page, "Drop").fill("5.1");
  await expect.poll(async () => (await nailRows(page))[0]).toBe("1 A 13 cm 5 cm 170 cm");
});

/** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-a-photo-scaled-from-the-sofa} */
test("on a photo scaled from the sofa the group hangs 8 in above it, and the photo stays", async ({
  page,
}) => {
  await open(page);
  const sent: Request[] = [];
  page.on("request", (request) => {
    if (/^https?:/.test(request.url())) sent.push(request);
  });
  await widget(page).getByRole("button", { name: "Use my wall photo" }).click();
  await widget(page).locator('input[type="file"]').setInputFiles(PHOTO);
  await expect(widget(page).getByText("Set the scale · 1 of 3")).toBeVisible();
  await widget(page)
    .getByRole("radio", { name: /^A sofa/ })
    .check();
  await widget(page).getByRole("button", { name: "Next", exact: true }).click();
  await widget(page).getByRole("button", { name: "Next", exact: true }).click();
  await widget(page).getByRole("button", { name: "Set the scale" }).click();
  await expect(widget(page).locator(".wf-drawing")).toHaveAccessibleName(
    "Gallery wall layout: five frames above a sofa on your wall photo",
  );
  await expect(field(page, "Below")).toHaveValue("8");
  await expect(widget(page).locator(".wf-row[data-side=below] .wf-row-to")).toHaveText(
    "to the sofa",
  );
  for (const request of sent) {
    const body = request.postDataBuffer();
    const type = (await request.allHeaders())["content-type"] ?? "";
    expect(type, request.url()).not.toMatch(/^image\/|multipart\//);
    expect(body?.length ?? 0, request.url()).toBeLessThanOrEqual(10 * 1024);
    expect(request.url()).not.toMatch(/blob:|data:|wall-1200x900/);
    expect(body?.toString("latin1") ?? "").not.toContain("wall-1200x900");
  }
});

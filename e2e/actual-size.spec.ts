import { expect, type Page, test } from "@playwright/test";

const PATH = "/how-big-is-8x10";

/** A check saved in an earlier visit, made on a screen of `w` × `h` at `dpr`. */
async function savedCheck(page: Page, check: { scale: number; w: number; h: number; dpr: number }) {
  await page.addInitScript((value) => {
    window.localStorage.setItem("screen-scale", JSON.stringify({ ...value, method: "card" }));
  }, check);
}

const px = (value: string) => Number.parseFloat(value);

test.describe("on a 360 × 740 phone", () => {
  test.use({ viewport: { width: 360, height: 740 }, screen: { width: 360, height: 740 } });

  /** {@link openspec/specs/actual-size/spec.md#scenario-no-sideways-scroll-on-a-phone} */
  test("every size button sits inside the viewer", async ({ page }) => {
    await page.goto(PATH);
    const viewer = page.locator("section.as");
    const outer = await viewer.boundingBox();
    const buttons = viewer.getByRole("group", { name: "Size" }).getByRole("button");
    await expect(buttons).toHaveCount(7);
    for (const b of await buttons.all()) {
      const box = await b.boundingBox();
      expect(box?.x ?? -1).toBeGreaterThanOrEqual(outer?.x ?? 0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
        (outer?.x ?? 0) + (outer?.width ?? 0),
      );
    }
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(360);
  });

  /**
   * {@link openspec/specs/actual-size/spec.md#scenario-unchecked}
   * {@link openspec/specs/actual-size/spec.md#scenario-the-step-on-a-small-phone}
   * {@link openspec/specs/actual-size/spec.md#scenario-the-same-phone-tomorrow}
   */
  test("the first See asks for the card on one screen, then opens the view; a reload keeps it", async ({
    page,
  }) => {
    await page.goto(PATH);
    await page.getByRole("button", { name: "See 8x10 at actual size" }).click();
    await expect(page.getByRole("heading", { name: "Check your screen" })).toBeVisible();
    // The step scrolls its title to the top; everything it needs is on that one screen.
    await page.waitForFunction(
      () => Math.abs(document.querySelector("section.as")?.getBoundingClientRect().top ?? 99) < 2,
    );
    const done = page.getByRole("button", { name: "Done, it matches" });
    for (const el of [
      page.locator(".as-how svg"),
      page.getByTestId("line-start"),
      page.getByTestId("line-end"),
      page.getByRole("slider", { name: "Distance between the lines" }),
      done,
    ]) {
      const box = await el.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.y ?? -1).toBeGreaterThanOrEqual(0);
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(740);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(360);
    }
    await done.click();
    const view = page.getByRole("dialog", { name: "8x10 at actual size" });
    await expect(view).toBeVisible();
    await expect(view.getByText("Actual size", { exact: true }).first()).toBeVisible();
    await view.getByRole("button", { name: "Close" }).click();
    await expect(view).toBeHidden();

    await page.reload();
    await expect(page.locator(".as-phone .fs-badge")).toHaveText("Checked with a card");
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-keyboard-only} */
  test("keyboard: Enter on 8×10 and See opens the dialog on Close; Escape returns", async ({
    page,
  }) => {
    await savedCheck(page, { scale: 150, w: 360, h: 740, dpr: 1 });
    await page.goto(PATH);
    await expect(page.locator(".as-phone .fs-badge")).toHaveText("Checked with a card");
    await page.getByRole("button", { name: "8×10" }).focus();
    await page.keyboard.press("Enter");
    const see = page.getByRole("button", { name: "See 8x10 at actual size" });
    await see.focus();
    await page.keyboard.press("Enter");
    const view = page.getByRole("dialog", { name: "8x10 at actual size" });
    await expect(view).toBeVisible();
    await expect(view.getByRole("button", { name: "Close" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(view).toBeHidden();
    await expect(see).toBeFocused();
  });

  /**
   * {@link openspec/specs/actual-size/spec.md#scenario-16x20-on-a-phone}
   * {@link openspec/specs/actual-size/spec.md#scenario-panning}
   */
  test("16x20 fills the screen from its corner; panning 2 in moves the mini map", async ({
    page,
  }) => {
    await savedCheck(page, { scale: 150, w: 360, h: 740, dpr: 1 });
    await page.goto(PATH);
    await page.getByRole("button", { name: "16×20" }).click();
    await page.getByRole("button", { name: "See 16x20 at actual size" }).click();
    const view = page.getByRole("dialog", { name: "16x20 at actual size" });
    await expect(view.getByText("Drag to see the rest")).toBeVisible();
    const frame = await view.getByTestId("frame").boundingBox();
    expect(frame?.width).toBeCloseTo(16 * 150, 0);
    expect(frame?.x).toBeCloseTo(24, 0);
    const outline = view.getByTestId("map-outline");
    const before = px(await outline.evaluate((el) => (el as HTMLElement).style.left));
    await view.getByRole("region").evaluate((el) => el.scrollTo({ left: 2 * 150 }));
    await expect
      .poll(async () => px(await outline.evaluate((el) => (el as HTMLElement).style.left)))
      .toBeGreaterThan(before);
    const after = px(await outline.evaluate((el) => (el as HTMLElement).style.left));
    // The mini map: 96 × 110 with 6 px of padding, 16 × 20 in at min(84 / 16, 98 / 20) px per inch.
    expect(after - before).toBeCloseTo(2 * Math.min(84 / 16, 98 / 20), 1);
  });
});

test.describe("on a desktop", () => {
  test.use({ viewport: { width: 1280, height: 900 }, screen: { width: 1920, height: 1080 } });

  /** {@link openspec/specs/actual-size/spec.md#requirement-the-desktop-box-shows-the-size-at-11} */
  test("the box draws 8x10 at the saved scale", async ({ page }) => {
    await savedCheck(page, { scale: 100, w: 1920, h: 1080, dpr: 1 });
    await page.goto(PATH);
    await expect(page.locator(".as-desk .fs-badge")).toHaveText("Checked with a card");
    const frame = await page.getByTestId("frame").boundingBox();
    expect(frame?.width).toBeCloseTo(800, 0);
    expect(frame?.height).toBeCloseTo(1000, 0);
    await expect(page.locator(".as-under")).toContainText("Scroll the box to see the rest");
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-a-monitor} */
  test("a monitor's guess offers the sheet of paper", async ({ page }) => {
    await page.goto(PATH);
    await expect(page.locator(".as-desk .fs-badge")).toHaveText("Scale is a guess");
    await expect(
      page.locator(".as-desk").getByText("Approximate: scale not checked"),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Sheet of paper" })).toBeVisible();
    await page.getByRole("button", { name: "Check with a card" }).click();
    const tabs = page.getByRole("group", { name: "Check with" }).getByRole("button");
    await expect(tabs).toHaveText(["Credit card", "Ruler", "Sheet of paper", "Screen size"]);
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-a-new-pixel-ratio} */
  test("a check from another pixel ratio is ignored", async ({ page }) => {
    await savedCheck(page, { scale: 100, w: 1920, h: 1080, dpr: 2 });
    await page.goto(PATH);
    await expect(page.locator(".as-desk .fs-badge")).toHaveText("Scale is a guess");
  });
});

test.describe("on a 13 in laptop", () => {
  test.use({ viewport: { width: 1280, height: 900 }, screen: { width: 1470, height: 956 } });

  /** {@link openspec/specs/actual-size/spec.md#scenario-a-13-in-laptop} */
  test("no sheet of paper, but the card and the ruler", async ({ page }) => {
    await page.goto(PATH);
    await expect(page.locator(".as-desk .fs-badge")).toHaveText("Scale is a guess");
    await expect(page.getByRole("button", { name: "Sheet of paper" })).toHaveCount(0);
    await page.getByRole("button", { name: "Check with a card" }).click();
    const tabs = page.getByRole("group", { name: "Check with" }).getByRole("button");
    await expect(tabs).toHaveText(["Credit card", "Ruler", "Screen size"]);
  });
});

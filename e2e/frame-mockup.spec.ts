import { readFileSync } from "node:fs";
import { join } from "node:path";

import { exportSize, hangMockup, mockupView } from "../packages/sizes/src/mockup";
import { expect, type Locator, type Page, type Request, test } from "@playwright/test";

const PATH = "/frame-mockup";
const FIXTURES = join(import.meta.dirname, "fixtures");
const fixture = (name: string) => join(FIXTURES, name);

const widget = (page: Page) => page.getByRole("region", { name: "Poster mockup generator" });
const chip = (page: Page, label: string) =>
  widget(page)
    .locator(".mk-chips button")
    .filter({ has: page.locator(".mk-chip-n", { hasText: new RegExp(`^${label}$`) }) });
const radio = (page: Page, group: string, name: string) =>
  widget(page).getByRole("radiogroup", { name: group }).getByRole("radio", { name, exact: true });
const status = (page: Page) => widget(page).locator(".mk-status");
const artTop = (page: Page) =>
  widget(page)
    .locator("img.mk-art")
    .evaluate((img) => parseFloat((img as HTMLImageElement).style.top));
const upload = (page: Page, name: string) =>
  widget(page).locator('input[type="file"]').setInputFiles(fixture(name));
const box = async (l: Locator) => {
  const b = await l.boundingBox();
  if (!b) throw new Error("not laid out");
  return b;
};

/** A PNG's width and height from its IHDR. */
const ihdr = (png: Buffer) => ({ w: png.readUInt32BE(16), h: png.readUInt32BE(20) });

async function download(page: Page) {
  const [file] = await Promise.all([
    page.waitForEvent("download"),
    widget(page).getByRole("button", { name: "Download PNG" }).click(),
  ]);
  const path = await file.path();
  return { name: file.suggestedFilename(), png: readFileSync(path) };
}

test.describe("at 1280", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-desktop} */
  test("the chips sit right of the picture, Mat below it, no phone buttons", async ({ page }) => {
    await page.goto(PATH);
    const picture = await box(widget(page).getByRole("img", { name: /^Poster mockup:/ }));
    const chips = await box(widget(page).locator(".mk-chips"));
    const mat = await box(widget(page).getByRole("radiogroup", { name: "Mat" }));
    expect(chips.x).toBeGreaterThan(picture.x + picture.width);
    expect(mat.y).toBeGreaterThan(picture.y + picture.height);
    await expect(widget(page).locator(".mk-tab")).toHaveCount(4);
    for (const tab of await widget(page).locator(".mk-tab").all()) await expect(tab).toBeHidden();
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-dragging-over} */
  test("a file dragged over the drop area is used when dropped", async ({ page }) => {
    await page.goto(PATH);
    const drop = widget(page).locator(".mk-drop");
    await expect(drop).toContainText("Drop your artwork here");
    const bytes = [...readFileSync(fixture("art-3000x2000.png"))];
    const data = await page.evaluateHandle((b) => {
      const dt = new DataTransfer();
      dt.items.add(new File([new Uint8Array(b)], "art.png", { type: "image/png" }));
      return dt;
    }, bytes);
    await drop.dispatchEvent("dragenter", { dataTransfer: data });
    await expect(drop).toContainText("Drop to use this file");
    await drop.dispatchEvent("drop", { dataTransfer: data });
    await expect(chip(page, "36×24")).toHaveAttribute("aria-pressed", "true");
    await expect(drop).toContainText("Drop your artwork here");
  });

  /** {@link openspec/specs/frame-mockup/spec.md#requirement-the-artwork-fills-the-opening-and-can-be-moved} */
  test("dragging the artwork in 16x20 moves it, and the frame fades meanwhile", async ({
    page,
  }) => {
    await page.goto(PATH);
    await chip(page, "16×20").click();
    const move = widget(page).getByRole("button", { name: /^Move the artwork/ });
    await expect(move).toBeEnabled();
    const before = await artTop(page);
    const b = await box(move);
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2 - 20, { steps: 4 });
    await expect(widget(page).locator(".mk-stage")).toHaveClass(/is-drag/);
    await page.mouse.up();
    await expect(widget(page).locator(".mk-stage")).not.toHaveClass(/is-drag/);
    expect(await artTop(page)).toBeLessThan(before);
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-the-whole-wall} */
  test("downloads the whole wall at 2400 × 1600 with black at the moulding", async ({ page }) => {
    await page.goto(PATH);
    const { name, png } = await download(page);
    expect(name).toBe("frame-mockup-24x36.png");
    expect(ihdr(png)).toEqual({ w: 2400, h: 1600 });
    await expect(widget(page).getByRole("status")).toHaveText("Saved frame-mockup-24x36.png");
    await expect(widget(page)).toContainText(
      "2,400 × 1,600 px PNG of the view above. No watermark.",
    );
    // The left moulding's middle, from the engine: x 59–60 in, y 16–54 in from the top.
    const outside = hangMockup({ w: 24, h: 36 }, "sofa");
    const k = 2400 / 144;
    const at = { x: Math.round((outside.x + 0.5) * k), y: Math.round((96 - outside.y - 19) * k) };
    const pixel = await page.evaluate(
      async ({ b64, at }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        return [...(ctx?.getImageData(at.x, at.y, 1, 1).data ?? [])];
      },
      { b64: png.toString("base64"), at },
    );
    const [r, g, bl] = pixel;
    // The black style, #1f2124.
    expect(Math.abs((r ?? 0) - 0x1f)).toBeLessThanOrEqual(3);
    expect(Math.abs((g ?? 0) - 0x21)).toBeLessThanOrEqual(3);
    expect(Math.abs((bl ?? 0) - 0x24)).toBeLessThanOrEqual(3);
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-a-close-up-of-an-a-series-size} */
  test("downloads an A2 close-up at the engine's export size", async ({ page }) => {
    await page.goto(PATH);
    await chip(page, "A2").click();
    await radio(page, "View", "Close-up").click();
    const { name, png } = await download(page);
    expect(name).toBe("frame-mockup-a2.png");
    const a2 = { w: 420 / 25.4, h: 594 / 25.4 };
    expect(ihdr(png)).toEqual(exportSize(mockupView(hangMockup(a2, "sofa"), "close")));
  });
});

test.describe("at 390", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-phone} */
  test("Style shows the styles, hides the chips, and nothing is wider than the screen", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PATH);
    const style = widget(page).getByRole("button", { name: /^Style/ });
    await expect(style).toHaveAttribute("aria-expanded", "false");
    await style.click();
    await expect(style).toHaveAttribute("aria-expanded", "true");
    await expect(style).toContainText("Black");
    await expect(widget(page).getByRole("button", { name: "Walnut" })).toBeVisible();
    await expect(widget(page).locator(".mk-chips")).toBeHidden();
    const tabs = await box(widget(page).locator(".mk-tabs"));
    const answer = await box(widget(page).locator(".mk-answer"));
    expect(answer.y).toBeGreaterThan(tabs.y + tabs.height);
    const wide = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        // The drawings' wall boxes are wider in a close-up, clipped by their stage.
        .filter((e) => !e.closest(".mk-world") && e.getBoundingClientRect().width > 390)
        .map((e) => e.className),
    );
    expect(wide).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-the-first-screen-on-a-phone} */
  test("the h1, the answer, the picture and the upload button fit the first screen", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 664 });
    await page.goto(PATH);
    for (const l of [
      page.locator("h1"),
      page.locator("h1 + p"),
      widget(page).getByRole("img", { name: /^Poster mockup:/ }),
      widget(page).getByRole("button", { name: "Choose a JPEG or PNG" }),
    ]) {
      const b = await box(l);
      expect(b.y + b.height).toBeLessThanOrEqual(664);
    }
  });
});

test.describe("uploads", () => {
  /**
   * {@link openspec/specs/frame-mockup/spec.md#scenario-a-first-upload}
   * {@link openspec/specs/frame-mockup/spec.md#scenario-a-second-upload-replaces-the-first}
   */
  test("opens a 2:3 file on 24x36, then a 3:4 file on 18x24 keeping the style", async ({
    page,
  }) => {
    await page.goto(PATH);
    await upload(page, "art-2000x3000.png");
    await expect(status(page)).toHaveText(
      "24x36 cuts your artwork least, so the mockup opened on 24x36.",
    );
    await expect(widget(page).locator(".mk-line")).toContainText("Your artwork2000 × 3000 px");
    await widget(page).getByRole("button", { name: "Light oak" }).click();
    await upload(page, "art-3000x4000.png");
    await expect(chip(page, "18×24")).toHaveAttribute("aria-pressed", "true");
    await expect(widget(page).getByRole("button", { name: "Light oak" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(status(page)).toHaveText(
      "New artwork. 18x24 cuts it least, so the frame changed to 18x24.",
    );
    await expect(page.getByText("art-3000x4000")).toHaveCount(0);
  });

  /**
   * {@link openspec/specs/frame-mockup/spec.md#scenario-not-an-image}
   * {@link openspec/specs/frame-mockup/spec.md#scenario-an-image-the-browser-cannot-open}
   */
  test("a PDF and a broken image leave the artwork as it was", async ({ page }) => {
    await page.goto(PATH);
    await upload(page, "art-3000x4000.png");
    await expect(chip(page, "18×24")).toHaveAttribute("aria-pressed", "true");
    const label = await widget(page).getByRole("img").first().getAttribute("aria-label");
    await upload(page, "not-an-image.pdf");
    await expect(status(page)).toHaveText(
      "This file is not an image. Choose a JPEG or a PNG.The last artwork stays in the frame.",
    );
    await upload(page, "art-broken.png");
    await expect(status(page)).toHaveText(
      "Your browser cannot open this file. Try a JPEG or a PNG.The last artwork stays in the frame.",
    );
    await expect(widget(page).getByRole("img").first()).toHaveAttribute("aria-label", label ?? "");
    await expect(chip(page, "18×24")).toHaveAttribute("aria-pressed", "true");
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-no-request-carries-the-artwork} */
  test("no request carries the artwork", async ({ page }) => {
    await page.goto(PATH);
    const sent: Request[] = [];
    page.on("request", (request) => {
      if (/^https?:/.test(request.url())) sent.push(request);
    });
    await upload(page, "art-3000x4000.png");
    await expect(chip(page, "18×24")).toHaveAttribute("aria-pressed", "true");
    await chip(page, "12×16").click();
    await widget(page).getByRole("button", { name: "Walnut" }).click();
    await radio(page, "Mat", "Mat").click();
    await radio(page, "Wall", "Plain wall").click();
    await radio(page, "View", "Close-up").click();
    const { png } = await download(page);
    expect(png.length).toBeGreaterThan(0);
    for (const request of sent) {
      const body = request.postDataBuffer();
      const type = (await request.allHeaders())["content-type"] ?? "";
      expect(type, request.url()).not.toMatch(/^image\/|multipart\//);
      expect(body?.length ?? 0, request.url()).toBeLessThanOrEqual(10 * 1024);
      expect(request.url()).not.toMatch(/blob:|data:|art-3000x4000/);
      expect(body?.toString("latin1") ?? "").not.toContain("art-3000x4000");
    }
  });
});

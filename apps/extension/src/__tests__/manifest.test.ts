import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { describe, expect, it } from "vitest";

/*
 * The manifest Vite copies into the build as it is, and the PNG icons it names.
 */
const PUBLIC = path.resolve(import.meta.dirname, "../../public");
const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC, "manifest.json"), "utf8"));
const NAME = "Gallery Wall Layout Generator";
/** Chrome reads the name and description from `_locales/<lang>/messages.json` (default `en`). */
const LOCALES = path.join(PUBLIC, "_locales");
const messages = (lang: string) =>
  JSON.parse(fs.readFileSync(path.join(LOCALES, lang, "messages.json"), "utf8"));
const SIZES = ["16", "32", "48", "128"];

/** A PNG's width and height, from its IHDR chunk. */
function pngSize(file: string): [number, number] {
  const bytes = fs.readFileSync(path.join(PUBLIC, file));
  expect(bytes.subarray(1, 4).toString("ascii")).toBe("PNG");
  expect(bytes.subarray(12, 16).toString("ascii")).toBe("IHDR");
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

describe("the manifest", () => {
  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-the-built-manifest} */
  it("asks only for the side panel and lets only framesizes.app message it", () => {
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.minimum_chrome_version).toBe("116");
    expect(manifest.permissions).toEqual(["sidePanel", "contextMenus", "activeTab", "scripting"]);
    for (const key of ["host_permissions", "optional_permissions", "content_scripts"]) {
      expect(manifest).not.toHaveProperty(key);
    }
    expect(manifest.externally_connectable).toEqual({ matches: ["https://framesizes.app/*"] });
    expect(manifest.side_panel).toEqual({ default_path: "sidepanel.html" });
    expect(manifest.background).toEqual({ service_worker: "background.js", type: "module" });
    // The store's limit for the short description.
    expect(manifest.description).toBe("__MSG_shortDesc__");
    expect(messages("en").shortDesc.message.length).toBeLessThanOrEqual(132);
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-install-and-browser-start-set-the-panel-behaviour} */
  it("opens no popup from the toolbar button", () => {
    expect(manifest.action).not.toHaveProperty("default_popup");
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-name-and-icons-in-the-build} */
  it("carries the name and the icons at 16, 32, 48 and 128 px", () => {
    expect(manifest.name).toBe("__MSG_appName__");
    expect(manifest.default_locale).toBe("en");
    expect(messages("en").appName.message).toBe(NAME);
    expect(manifest.action.default_title).toBe("__MSG_appName__");
    for (const set of [manifest.icons, manifest.action.default_icon]) {
      expect(Object.keys(set).sort()).toEqual([...SIZES].sort());
      for (const px of SIZES) {
        expect(set[px]).toMatch(/\.png$/);
        expect(pngSize(set[px])).toEqual([Number(px), Number(px)]);
      }
    }
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-every-language-names-the-extension} */
  it("names the extension in every language it ships", () => {
    const langs = fs.readdirSync(LOCALES);
    expect(langs).toHaveLength(28);
    for (const lang of langs) {
      expect(messages(lang).appName?.message?.trim(), lang).toBeTruthy();
    }
  });

  // {@link openspec/specs/gallery-wall-extension/spec.md#scenario-the-128-px-icon-in-the-build}
  it("pads the 128 px icon with a clear 16 px border around 96 px art", async () => {
    // sharp is Next's dependency, loaded as scripts/extension-icons.mjs loads it.
    const fromWeb = createRequire(path.resolve(PUBLIC, "../../web/package.json"));
    const sharp = createRequire(fromWeb.resolve("next/package.json"))("sharp");
    const { data, info } = await sharp(path.join(PUBLIC, manifest.icons["128"]))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    expect([info.width, info.height, info.channels]).toEqual([128, 128, 4]);
    const alpha = (x: number, y: number) => data[(y * 128 + x) * 4 + 3];
    const inRing = (v: number) => v < 16 || v >= 112;
    let ringOpaque = 0;
    let edgeOpaque = 0;
    for (let y = 0; y < 128; y++) {
      for (let x = 0; x < 128; x++) {
        if (inRing(x) || inRing(y)) {
          if (alpha(x, y) !== 0) ringOpaque++;
        } else if ((x === 16 || x === 111 || y === 16 || y === 111) && alpha(x, y) === 255) {
          edgeOpaque++;
        }
      }
    }
    expect(ringOpaque, "pixels with alpha > 0 in the outer 16 px ring").toBe(0);
    expect(edgeOpaque, "opaque pixels on the 16 px inset edge").toBeGreaterThan(0);
  });
});

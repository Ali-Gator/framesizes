import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/*
 * The manifest Vite copies into the build as it is, and the PNG icons it names.
 */
const PUBLIC = path.resolve(import.meta.dirname, "../../public");
const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC, "manifest.json"), "utf8"));
const NAME = "Gallery Wall Layout Generator";
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
    expect(manifest.permissions).toEqual(["sidePanel"]);
    for (const key of ["host_permissions", "optional_permissions", "content_scripts"]) {
      expect(manifest).not.toHaveProperty(key);
    }
    expect(manifest.externally_connectable).toEqual({ matches: ["https://framesizes.app/*"] });
    expect(manifest.side_panel).toEqual({ default_path: "sidepanel.html" });
    expect(manifest.background).toEqual({ service_worker: "background.js", type: "module" });
    // The store's limit for the short description.
    expect(manifest.description.length).toBeLessThanOrEqual(132);
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-install-and-browser-start-set-the-panel-behaviour} */
  it("opens no popup from the toolbar button", () => {
    expect(manifest.action).not.toHaveProperty("default_popup");
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-name-and-icons-in-the-build} */
  it("carries the name and the icons at 16, 32, 48 and 128 px", () => {
    expect(manifest.name).toBe(NAME);
    expect(manifest.action.default_title).toBe(NAME);
    for (const set of [manifest.icons, manifest.action.default_icon]) {
      expect(Object.keys(set).sort()).toEqual([...SIZES].sort());
      for (const px of SIZES) {
        expect(set[px]).toMatch(/\.png$/);
        expect(pngSize(set[px])).toEqual([Number(px), Number(px)]);
      }
    }
  });
});

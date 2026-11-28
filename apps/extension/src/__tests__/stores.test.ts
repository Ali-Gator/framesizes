import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { packageMessages } from "../stores";

/*
 * What each store's package writes into `_locales`, from the messages in `public/`.
 */
const LOCALES = path.resolve(import.meta.dirname, "../../public/_locales");
const LANGS = fs.readdirSync(LOCALES).sort();
const messages = (lang: string) =>
  JSON.parse(fs.readFileSync(path.join(LOCALES, lang, "messages.json"), "utf8"));

describe("the per-store packages", () => {
  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-the-chrome-package-is-unchanged} */
  it("keeps every Chrome locale as it is", () => {
    expect(LANGS).toHaveLength(28);
    for (const lang of LANGS) {
      const m = messages(lang);
      expect(packageMessages("chrome", lang, m)).toBe(m);
      expect(Object.keys(m).sort()).toEqual(["appName", "shortDesc", "storeDesc"]);
    }
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-the-edge-package-is-english-only} */
  it("keeps only English in the Edge package, with the name and its own short description", () => {
    const en = packageMessages("edge", "en", messages("en"));
    expect(Object.keys(en ?? {}).sort()).toEqual(["appName", "shortDesc"]);
    expect(en?.appName?.message).toBe("Gallery Wall Layout Generator");
    for (const lang of LANGS.filter((l) => l !== "en")) {
      expect(packageMessages("edge", lang, messages(lang))).toBeNull();
    }
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-the-edge-short-description} */
  it("gives Edge a short description of its own that names no other browser", () => {
    const short = packageMessages("edge", "en", messages("en"))?.shortDesc?.message ?? "";
    expect(short.length).toBeGreaterThan(0);
    expect(short.length).toBeLessThanOrEqual(132);
    expect(short).not.toBe(messages("en").shortDesc.message);
    expect(short).not.toMatch(/Chrome|Google/);
  });
});

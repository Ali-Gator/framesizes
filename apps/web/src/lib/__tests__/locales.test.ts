import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { LOCALES, localeOf, localizedPath, matchLanguage, translatedPage } from "../locales";

const visible = (query: string) =>
  LOCALES.filter((l) => matchLanguage(query, l)).map((l) => l.code);

describe("LOCALES", () => {
  /** {@link openspec/specs/localization/spec.md#scenario-the-language-list} */
  it("holds 28 languages, English first, with unique lowercase codes and unique hreflang values", () => {
    expect(LOCALES).toHaveLength(28);
    expect(LOCALES[0]?.code).toBe("en");
    const codes = LOCALES.map((l) => l.code);
    expect(new Set(codes).size).toBe(28);
    expect(new Set(LOCALES.map((l) => l.hreflang.toLowerCase())).size).toBe(28);
    for (const code of codes) expect(code).toBe(code.toLowerCase());
    for (const code of ["ar", "de", "el", "es", "et", "fi", "fr", "hi", "hr", "hu", "id", "it"])
      expect(codes).toContain(code);
    for (const code of ["ja", "ko", "nl", "pl", "pt-pt", "ru", "sv", "th", "pt-br", "tr", "uk"])
      expect(codes).toContain(code);
    expect(codes).toContain("vi");
    const english = LOCALES.map((l) => l.english);
    for (const name of ["Norwegian", "Filipino", "Chinese (Simplified)"])
      expect(english).toContain(name);
  });

  /** {@link openspec/specs/localization/spec.md#scenario-the-language-list} */
  it("carries the region of both Portuguese entries", () => {
    expect(LOCALES.filter((l) => l.region).map((l) => [l.code, l.region])).toEqual([
      ["pt-pt", "Portugal"],
      ["pt-br", "Brasil"],
    ]);
  });

  /** {@link openspec/specs/localization/spec.md#scenario-arabic-reads-right-to-left} */
  it("makes Arabic, and only Arabic, right to left", () => {
    expect(LOCALES.filter((l) => l.dir === "rtl").map((l) => l.code)).toEqual(["ar"]);
  });

  it("has a flag file for every language", () => {
    const flags = path.resolve(import.meta.dirname, "../../../public/flags");
    for (const l of LOCALES) expect(fs.existsSync(path.join(flags, `${l.flag}.svg`))).toBe(true);
  });
});

describe("matchLanguage", () => {
  /** {@link openspec/specs/localization/spec.md#scenario-searching-in-english-and-in-russian} */
  it("finds Русский from its English name and from its native name in capitals", () => {
    expect(visible("russian")).toEqual(["ru"]);
    expect(visible("РУССКИЙ")).toEqual(["ru"]);
  });

  /** {@link openspec/specs/localization/spec.md#scenario-diacritics-are-ignored} */
  it("ignores diacritics", () => {
    expect(visible("espanol")).toContain("es");
  });

  /** {@link openspec/specs/localization/spec.md#scenario-both-portuguese-entries-match} */
  it("finds exactly both Portuguese entries", () => {
    expect(visible("port")).toEqual(["pt-pt", "pt-br"]);
  });

  /** {@link openspec/specs/localization/spec.md#scenario-no-match} */
  it("finds nothing for an unknown language", () => {
    expect(visible("klingon")).toEqual([]);
  });

  /** {@link openspec/specs/localization/spec.md#requirement-the-pickers-search-matches-english-and-native-names} */
  it("shows every language for an empty or blank query, and trims the query", () => {
    expect(visible("")).toHaveLength(28);
    expect(visible("   ")).toHaveLength(28);
    expect(visible("  deutsch ")).toEqual(["de"]);
  });
});

describe("localizedPath and localeOf", () => {
  /** {@link openspec/specs/localization/spec.md#requirement-a-translated-page-lives-under-its-language-code} */
  it("prefixes every language but English, and reads the language back", () => {
    const x1 = "/extensions/gallery-wall-layout-generator";
    expect(localizedPath("en", x1)).toBe(x1);
    expect(localizedPath("pt-br", x1)).toBe(`/pt-br${x1}`);
    expect(localeOf(`/pt-br${x1}`)).toEqual({ locale: "pt-br", path: x1 });
    expect(localeOf(x1)).toEqual({ locale: "en", path: x1 });
    expect(localeOf(`/en${x1}`)).toEqual({ locale: "en", path: `/en${x1}` });
    expect(translatedPage(x1)).toBe(true);
    expect(translatedPage("/")).toBe(false);
  });
});

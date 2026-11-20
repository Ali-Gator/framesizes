import { describe, expect, it } from "vitest";

import { LOCALES } from "@/lib/locales";
import { fullTitle } from "@/lib/site-map";

import { COPY } from "../copy";
import { en } from "../copy/en";

type Head = { title: string; description: string };

/** Every head-limit breach across the dictionaries, each naming its language. */
function headProblems(heads: Record<string, Head>): string[] {
  const problems: string[] = [];
  const seen = { title: new Map<string, string>(), description: new Map<string, string>() };
  for (const [code, { title, description }] of Object.entries(heads)) {
    const full = fullTitle(title);
    if (full.length > 60) problems.push(`${code}: title is ${full.length} characters`);
    if (!description.trim()) problems.push(`${code}: description is empty`);
    if (description.length > 160)
      problems.push(`${code}: description is ${description.length} characters`);
    for (const [key, value] of [
      ["title", title],
      ["description", description],
    ] as const) {
      const other = seen[key].get(value);
      if (other) problems.push(`${code}: ${key} equals ${other}'s`);
      seen[key].set(value, code);
    }
  }
  return problems;
}

describe("the translated head values", () => {
  /** {@link openspec/specs/extension-site/spec.md#scenario-a-translation-breaks-a-head-limit} */
  it("stay within the limits and differ in every language", () => {
    const heads = Object.fromEntries(Object.entries(COPY).map(([code, c]) => [code, c.seo]));
    expect(headProblems(heads)).toEqual([]);
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-a-translation-breaks-a-head-limit} */
  it("fail with the language named", () => {
    const long = "x".repeat(47);
    expect(fullTitle(long)).toHaveLength(61);
    expect(
      headProblems({
        en: en.seo,
        de: { title: long, description: "d".repeat(161) },
        fr: { title: "Titre", description: " " },
        it: { title: "Titolo", description: en.seo.description },
      }),
    ).toEqual([
      "de: title is 61 characters",
      "de: description is 161 characters",
      "fr: description is empty",
      "it: description equals en's",
    ]);
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-a-translation-breaks-a-head-limit} */
  it("exist for all 28 languages", () => {
    expect(Object.keys(COPY).sort()).toEqual(LOCALES.map((l) => l.code).sort());
  });
});

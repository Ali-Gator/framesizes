import { describe, expect, it } from "vitest";

import { builtPage } from "@/lib/site-map";

import { COPY } from "../copy";

const BROWSER = /\b(Chrome|Edge|Opera)\b/;

/** {@link openspec/specs/extension-site/spec.md#scenario-every-languages-head} */
describe("the extension page's head names no browser", () => {
  it("holds no browser name in the site map entry", () => {
    const x1 = builtPage("X1");
    const fields = { name: x1.name, question: x1.card?.question, ...x1.seo };
    const named = Object.entries(fields).filter(
      ([, v]) => typeof v === "string" && BROWSER.test(v),
    );
    expect(named.map(([k]) => k)).toEqual([]);
  });

  it("holds no browser name in any language's title, description or last crumb", () => {
    const named = Object.entries(COPY).flatMap(([code, c]) =>
      [c.seo.title, c.seo.description, c.crumbs.page]
        .filter((v) => BROWSER.test(v))
        .map((v) => `${code}: ${v}`),
    );
    expect(named).toEqual([]);
  });
});

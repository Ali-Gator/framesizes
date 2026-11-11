// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PAGES, type SitePage } from "@/lib/site-map";

import { RelatedTools } from "../related-tools";

/** The registry with the given pages live, each keeping its card. */
const withLive = (...ids: string[]): SitePage[] =>
  PAGES.map((p): SitePage =>
    ids.includes(p.id)
      ? {
          ...p,
          live: true,
          seo: { title: p.id, h1: p.id, description: p.id, lastModified: "2026-11-11" },
        }
      : p,
  );

const parse = (html: string) => new DOMParser().parseFromString(html, "text/html");

describe("RelatedTools", () => {
  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-no-other-page-is-live} */
  it("renders nothing while only the home page is live", () => {
    expect(renderToStaticMarkup(<RelatedTools pages={withLive("F1")} />)).toBe("");
  });

  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-related-page-goes-live} */
  it("lists the poster sizes page under Posters once it is live", () => {
    const doc = parse(renderToStaticMarkup(<RelatedTools pages={withLive("F1", "P1")} />));
    expect(doc.querySelector("h2")?.textContent).toBe("Related tools");
    expect([...doc.querySelectorAll("h3")].map((h) => h.textContent)).toEqual(["Posters"]);
    expect([...doc.querySelectorAll("a")].map((a) => a.getAttribute("href"))).toEqual([
      "/poster-sizes",
    ]);
  });

  it("leaves out live pages of other hubs that are not required", () => {
    expect(renderToStaticMarkup(<RelatedTools pages={withLive("F1", "Q1")} />)).toBe("");
  });
});

// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PAGES, type SitePage } from "@/lib/site-map";

import { RelatedTools } from "../related-tools";

/** The registry with exactly the given pages live, each keeping its card. */
const withLive = (...ids: string[]): SitePage[] =>
  PAGES.map((p): SitePage => {
    const base = { id: p.id, path: p.path, hub: p.hub, name: p.name, card: p.card };
    return ids.includes(p.id)
      ? {
          ...base,
          live: true,
          seo: { title: p.id, h1: p.id, description: p.id, lastModified: "2026-11-11" },
        }
      : { ...base, live: false };
  });

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

describe("RelatedTools on F2", () => {
  const on = (pages: SitePage[]) =>
    parse(renderToStaticMarkup(<RelatedTools pages={pages} current="F2" outside={["C1", "G1"]} />));

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-only-the-home-page-and-f2-are-live} */
  it("lists the frame size chart and leaves F2 out", () => {
    const doc = on(withLive("F1", "F2"));
    expect([...doc.querySelectorAll("h3")].map((h) => h.textContent)).toEqual(["Frames"]);
    expect([...doc.querySelectorAll("a")].map((a) => a.getAttribute("href"))).toEqual(["/"]);
  });

  it("adds C1 and G1 when live, but not the home page's other cross-hub pages", () => {
    const doc = on(withLive("F1", "F2", "C1", "G1", "P1"));
    expect([...doc.querySelectorAll("a")].map((a) => a.getAttribute("href"))).toEqual([
      "/",
      "/canvas-sizes",
      "/gallery-wall-planner",
    ]);
  });

  it("renders nothing while no related page is live", () => {
    expect(renderToStaticMarkup(<RelatedTools pages={withLive("F2")} current="F2" />)).toBe("");
  });
});

describe("RelatedTools on the home page", () => {
  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-only-f2-is-live-besides-the-home-page} */
  it("lists F2 under Frames once it is live", () => {
    const doc = parse(renderToStaticMarkup(<RelatedTools pages={withLive("F1", "F2")} />));
    expect([...doc.querySelectorAll("h3")].map((h) => h.textContent)).toEqual(["Frames"]);
    expect([...doc.querySelectorAll("a")].map((a) => a.getAttribute("href"))).toEqual([
      "/frame-sizes-on-wall",
    ]);
  });

  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-outline-with-f2-live} */
  it("holds one group, Frames, while only F1 and F2 are live", () => {
    const doc = parse(renderToStaticMarkup(<RelatedTools pages={withLive("F1", "F2")} />));
    expect(doc.querySelector("h2")?.textContent).toBe("Related tools");
    expect([...doc.querySelectorAll("h3")].map((h) => h.textContent)).toEqual(["Frames"]);
  });

  /**
   * {@link openspec/specs/frame-size-chart/spec.md#scenario-f2-and-g1-are-live-besides-the-home-page}
   * {@link openspec/specs/frame-size-chart/spec.md#scenario-the-outline-with-f2-and-g1-live}
   */
  it("lists F2 under Frames, then G1 under Gallery wall", () => {
    const doc = parse(renderToStaticMarkup(<RelatedTools pages={withLive("F1", "F2", "G1")} />));
    expect([...doc.querySelectorAll("h3")].map((h) => h.textContent)).toEqual([
      "Frames",
      "Gallery wall",
    ]);
    expect([...doc.querySelectorAll("a")].map((a) => a.getAttribute("href"))).toEqual([
      "/frame-sizes-on-wall",
      "/gallery-wall-planner",
    ]);
  });
});

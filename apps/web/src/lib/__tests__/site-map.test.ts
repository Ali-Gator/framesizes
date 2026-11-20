import { describe, expect, it } from "vitest";

import {
  builtPage,
  checkSiteMap,
  fullTitle,
  HUBS,
  liveHubHeads,
  livePage,
  livePages,
  page,
  PAGES,
  type SitePage,
} from "../site-map";

const live = (id: string, path: string, title: string, description: string): SitePage => ({
  id,
  path,
  hub: "frames",
  name: id,
  live: true,
  seo: { title, h1: id, description, lastModified: "2026-11-11" },
});
const DESC = "d".repeat(140);

/** {@link openspec/specs/seo-base/spec.md#scenario-the-launch-pages-are-declared} */
describe("the launch pages", () => {
  it("are 20 pages with unique ids and paths", () => {
    expect(PAGES).toHaveLength(20);
    expect(new Set(PAGES.map((p) => p.id)).size).toBe(20);
    expect(new Set(PAGES.map((p) => p.path)).size).toBe(20);
  });

  it("have lowercase paths with no trailing slash", () => {
    for (const p of PAGES) expect(p.path, p.id).toMatch(/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/);
    expect(page("F1").path).toBe("/");
  });

  it("have the home page live", () => {
    expect(page("F1").live).toBe(true);
    expect(() => livePage("P1")).toThrow(/P1/);
    expect(livePages().map((p) => p.id)).toContain("F1");
  });

  it("name a head page for every hub, inside that hub", () => {
    for (const hub of HUBS) expect(page(hub.head).hub, hub.id).toBe(hub.id);
    expect(liveHubHeads().map((h) => h.id)).toEqual(
      HUBS.filter((h) => page(h.head).live).map((h) => h.id),
    );
  });

  it("pass every limit", () => {
    expect(checkSiteMap(PAGES)).toEqual([]);
  });
});

/** {@link openspec/specs/seo-base/spec.md#scenario-the-launch-pages-are-declared} */
describe("the gallery wall planner", () => {
  it("is live with the On-page SEO guide's head values", () => {
    const g1 = livePage("G1");
    expect(g1.path).toBe("/gallery-wall-planner");
    expect(g1.seo.title).toBe("Gallery Wall Layout Planner & Generator");
    expect(g1.seo.h1).toBe("Gallery Wall Layout Planner");
    expect(g1.seo.description).toBe(
      "Plan a gallery wall layout with real frame sizes: pick a template, set the spacing, and get exact measurements and nail positions for your wall.",
    );
    expect(fullTitle(g1.seo.title)).toHaveLength(53);
    expect(liveHubHeads().map((h) => h.id)).toEqual(["frames", "gallery"]);
  });
});

/** {@link openspec/specs/seo-base/spec.md#scenario-a-live-page-breaks-a-head-limit} */
describe("a live page that breaks a head limit", () => {
  const ok = live("A1", "/a", "Short title", DESC);

  it("fails on a title over 60 characters with the suffix", () => {
    // 49 characters + " | Frame Sizes" (14) = 63.
    const long = live("B1", "/b", "t".repeat(49), "e".repeat(140));
    expect(checkSiteMap([ok, long])).toEqual([expect.stringContaining("B1")]);
  });

  it("fails on a description outside 130 to 155 characters", () => {
    expect(checkSiteMap([ok, live("B1", "/b", "Other", "d".repeat(129))])).toEqual([
      expect.stringContaining("B1"),
    ]);
    expect(checkSiteMap([ok, live("B1", "/b", "Other", "d".repeat(156))])).toEqual([
      expect.stringContaining("B1"),
    ]);
  });

  it("fails on a repeated title or description", () => {
    expect(checkSiteMap([ok, live("B1", "/b", "Short title", "e".repeat(140))])).toEqual([
      expect.stringContaining("B1"),
    ]);
    expect(checkSiteMap([ok, live("B1", "/b", "Other", DESC)])).toEqual([
      expect.stringContaining("B1"),
    ]);
  });

  it("does not limit pages that are not live", () => {
    const draft: SitePage = { id: "B1", path: "/b", hub: "frames", name: "B", live: false };
    expect(checkSiteMap([ok, draft])).toEqual([]);
  });
});

/** {@link openspec/specs/seo-base/spec.md#scenario-a-page-not-yet-live-breaks-a-head-limit} */
describe("a page not yet live that breaks a head limit", () => {
  const ok = live("A1", "/a", "Short title", DESC);
  const draft = (title: string, description: string): SitePage => ({
    id: "B1",
    path: "/b",
    hub: "frames",
    name: "B",
    live: false,
    seo: { title, h1: "B", description, lastModified: "2026-11-20" },
  });

  it("fails on a title over 60 characters with the suffix", () => {
    expect(checkSiteMap([ok, draft("t".repeat(49), "e".repeat(140))])).toEqual([
      expect.stringContaining("B1"),
    ]);
  });

  it("fails on a description outside 130 to 155 characters", () => {
    expect(checkSiteMap([ok, draft("Other", "d".repeat(129))])).toEqual([
      expect.stringContaining("B1"),
    ]);
  });

  it("fails on a title a live page declares", () => {
    expect(checkSiteMap([ok, draft("Short title", "e".repeat(140))])).toEqual([
      expect.stringContaining("B1"),
    ]);
  });

  it("passes when it keeps every limit", () => {
    expect(checkSiteMap([ok, draft("Other", "e".repeat(140))])).toEqual([]);
  });
});

/** {@link openspec/specs/seo-base/spec.md#requirement-a-built-page-that-is-not-live-stays-out-of-the-index} */
describe("builtPage", () => {
  it("returns the extension page with the guide's head values", () => {
    const x1 = builtPage("X1");
    expect(x1.path).toBe("/extensions/gallery-wall-layout-generator");
    expect(fullTitle(x1.seo.title)).toBe(
      "Gallery Wall Layout Generator Chrome Extension | Frame Sizes",
    );
    expect(x1.seo.h1).toBe("How to Use the Gallery Wall Layout Generator");
  });

  it("throws on a page with no head values, naming it", () => {
    expect(() => builtPage("P1")).toThrow(/P1/);
  });
});

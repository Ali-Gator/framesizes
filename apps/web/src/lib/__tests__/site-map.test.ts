import { describe, expect, it } from "vitest";

import {
  checkSiteMap,
  HUBS,
  liveHubHeads,
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
  it("are 19 pages with unique ids and paths", () => {
    expect(PAGES).toHaveLength(19);
    expect(new Set(PAGES.map((p) => p.id)).size).toBe(19);
    expect(new Set(PAGES.map((p) => p.path)).size).toBe(19);
  });

  it("have lowercase paths with no trailing slash", () => {
    for (const p of PAGES) expect(p.path, p.id).toMatch(/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/);
    expect(page("F1").path).toBe("/");
  });

  it("have the home page live", () => {
    expect(page("F1").live).toBe(true);
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
